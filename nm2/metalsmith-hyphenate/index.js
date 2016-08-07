'use strict';

var _ = require('lodash');
var debug = require('debug')('metalsmith-hyphenate');
var p5 = require('parse5');
var Hypher = require('hypher');
var multimatch = require('multimatch');

module.exports = function(options) {
  options = options || {};

  options.attributes = options.attributes || [];
  options.attributesMapped = options.attributesMapped || {};

  options.elements = options.elements || ['p', 'a', 'li', 'ol'];
  options.langModule = options.langModule || 'hyphenation.en-us';
  options.pattern = options.pattern || '**/*.+(htm|html)'

  function createHypher(langModule) {
    try {
      return new Hypher(require(langModule));
    } catch (err) {
      console.log("Language module %s is not installed. Try 'npm install %s'",
        langModule, langModule);
    }
  }

  function getHypherByLang(lang) {
    if (!lang) {
      return null;
    }

    var hypher = hyphersByLang[lang];

    if (!hypher) {
      hypher = createHypher('hyphenation.' + lang);
      hyphersByLang[lang] = hypher;
    }

    return hypher;
  }

  var hyphersByLang = {
    default: createHypher(options.langModule)
  };

  var hyphers = (function() {
    var current = hyphersByLang.default;
    return {
      current: () => current,
      enter: (value, fn) => {

        if (!value) {
          fn();
          return;
        }

        var prev = current;
        current = value;

        try {
          fn();
        } finally {
          current = prev;
        }
      }
    };
  })();

  function getLangAttribute(node) {
    if (node.attrs) {
      var attr = _.find(node.attrs, { name: 'lang' });

      if (attr) {
        return attr.value;
      }
    }

    return null;
  }

  function hyphenateText(node) {

    if (!node.childNodes) {
      return;
    }

    var hypher;
    var lang = getLangAttribute(node);

    if (lang) {
      hypher = getHypherByLang(lang);
    }

    hyphers.enter(hypher, () => {
      if (node.attrs && node.attrs.length) {
        _(options.attributes)
          .map(a => _.find(node.attrs, { name: a }))
          .filter()
          .forEach(attr => {
            attr.value = hyphers.current().hyphenateText(attr.value);
          });

        _.toPairs(options.attributesMapped)
          .map(x => ({
            attr: _.find(node.attrs, { name: x[0] }),
            dest: typeof x[1] == 'string' ? x[1] : x[1].dest,
            element: typeof x[1] == 'string' ? null : x[1].element
          }))
          .filter(x => x.attr && x.dest)
          .filter(x => x.element == null || x.element == node.tagName)
          .forEach(x => {
            _.remove(node.attrs, { name: x.dest });
            node.attrs.push({
              name: x.dest,
              value: hyphers.current().hyphenateText(x.attr.value)
            });
          });
      }

      if (_.includes(options.elements, node.tagName)) {
        node.childNodes
          .filter(child => child.nodeName === '#text')
          .forEach(function(child) {
            child.value = hyphers.current().hyphenateText(child.value);
          });
      }

      node.childNodes.forEach(hyphenateText);
    });
  }

  return function(files, metalsmith, done) {
    setImmediate(done);

    multimatch(Object.keys(files), options.pattern).forEach(function(name) {
      debug('hyphenating "%s"', name);
      var file = files[name]
      var dom = p5.parse(file.contents.toString());
      hyphenateText(dom);

      file.contents = new Buffer(p5.serialize(dom));
    });
  };
};
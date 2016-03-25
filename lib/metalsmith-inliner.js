/// <reference path="../typings/main.d.ts" />

'use strict';

const _ = require('lodash');
const cheerio = require('cheerio');
const multimatch = require('multimatch');
const url = require('url');

module.exports = function metalsmithInliner(options) {
  options = options || {};
  options.css = options.css || [];
  options.js = options.js || [];

  if (!options.html) throw new Error("options.html not specified");
  if (!(options.css instanceof Array)) options.css = [options.css];
  if (!(options.js instanceof Array)) options.js = [options.js];

  return function metalsmithInline(files, metalsmith, done) {

    var css = _.fromPairs(options.css.map(n => [n, files[n]]));
    var js = _.fromPairs(options.js.map(n => [n, files[n]]));

    multimatch(Object.keys(files), options.html).forEach(name => {
      
      var $ = cheerio.load(
        files[name].contents.toString(),
        { decodeEntities: false }
      );

      function processTag(dictionary, attr, tagName) {
        return (i, el) => {
          var $el = $(el);
          var path = url.resolve(name, $el.attr(attr));
          
          if (path[0] === '/') {
            path = path.slice(1);
          }
          
          var file = dictionary[path];
          if (file) {
            $el.replaceWith(
              `<${tagName}>${file.contents.toString()}</${tagName}>`
            );
          }        
        };
      }

      $('link[rel=stylesheet]').each(
        processTag(css, 'href', 'style')
      );

      $('script[src]').each(
        processTag(js, 'src', 'script')
      );

      files[name].contents = new Buffer($.html());
    });

    if (options.delete) {    
      options.css.concat(options.js).forEach(n => delete files[n]);
    }
    
    done();
  };
};
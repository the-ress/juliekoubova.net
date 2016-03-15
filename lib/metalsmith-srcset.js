/// <reference path="../typings/main.d.ts" />

'use strict';

const _ = require('lodash');
const multimatch = require('multimatch');
const parse5 = require('parse5');
const path = require('path');

function metalsmithSrcSet(options) {
  options = options || {};
  options.images = options.images || '**/*.+(jpg|jpeg|gif|png)';
  options.html = options.html || '**/*.+(htm|html)';

  function loadSrcSets(files) {
    var images = {};

    multimatch(Object.keys(files), options.images).forEach(function(image) {
      var p = path.parse(image);
      var baseName = `${p.dir}/${p.name}`.replace(/^\/|@\d+x$/g, '');
      var originalName = baseName + p.ext;

      if (originalName in images) {
        return;
      }

      var alternativesRegExp = new RegExp('^' +
        _.escapeRegExp(baseName) +
        '(?:@(\\d+)x)?' +
        _.escapeRegExp(p.ext) +
        '$'
      );

      var result = _(Object.keys(files))
        .map(n => alternativesRegExp.exec(n))
        .filter()
        .map(match => {
          var file = files[match[0]];

          if (!file) {
            return [];
          }
          
          return [match[0], { density: match[1] }];
        })
        .fromPairs()
        .value();

      Object.keys(result).forEach(
        k => images[k] = result
      );
    });
    
    return images;    
  }

  function processHtml(files, images) {
    
    function normalizeSrc(file, src) {
      if (/^https?:\/\//.test(src)) {
        return null;
      }
      
      if (src[0] == '/') {
        return {
          name: src.slice(1),
          urlPrefix: '/'
        } 
      }
      
      var srcChunks = src.split('/');
      var fileChunks = file.split('/');
      
      var resultPrefix = '';
      
      while (srcChunks[0] == '..') {
        srcChunks.splice(0, 1);
        resultPrefix += '../'
      }
      
      return {
        name: srcChunks.join('/'),
        urlPrefix: resultPrefix
      }
    }
    
    function getSrcSet(file, src) {
      var abs = normalizeSrc(file, src);
      if (!abs) {
        return null;
      }
      
      var image = images[abs.name];
      if (!image) {
        return null;
      }
      
      return {
        name: 'srcset',
        value: Object.keys(image)
          .filter(k => image[k].density)
          .map(k => `${abs.urlPrefix}${k} ${image[k].density}x`)
          .join(', ')
      };
    }
    
    function processNode(file, node) {
      if (node.tagName == 'img') {
        var srcset = _.find(node.attrs, {name: 'srcset'}); 
        var src = _.find(node.attrs, {name: 'src'}); 
        
        if (src && !srcset) {
          srcset = getSrcSet(file, src.value)
          if (srcset) {
            node.attrs.push(srcset);
          }
        }
      } else if (node.childNodes) {
        node.childNodes.forEach(processNode.bind(this, file));
      }
    }
    
    multimatch(Object.keys(files), options.html).forEach(function(name) {
      var file = files[name];
      var dom = parse5.parse(file.contents.toString());
      processNode(name, dom);
      file.contents = new Buffer(parse5.serialize(dom));
    });
  }
  
  return function(files, metalsmith, done) {
    var images = loadSrcSets(files);
    processHtml(files, images);
    done();
  };
}

module.exports = metalsmithSrcSet;
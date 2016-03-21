/// <reference path="../typings/main.d.ts" />

'use strict';

const _ = require('lodash');
const multimatch = require('multimatch');
const parse5 = require('parse5');
const path = require('path');

function metalsmithSrcSet(options) {
  options = options || {};
  options.html = options.html || '**/*.+(htm|html)';
  options.imageDirectory = 'img';

  function processHtml(files, map) {
    
    function normalizeSrc(file, src) {
      if (/^https?:\/\//.test(src)) {
        return null;
      }
      
      if (src[0] == '/') {
        return src.slice(1);
      }
      
      var srcChunks = src.split('/');
      var fileChunks = file.split('/').slice(0, -1);
      
      while (srcChunks[0] == '..') {
        fileChunks = fileChunks.slice(0, -1);
        srcChunks = srcChunks.slice(1);
      }
      
      return fileChunks.concat(srcChunks).join('/');
    }
    
    function getSrcSet(file, src, size) {
      var abs = normalizeSrc(file, src);
      if (!abs) {
        return null;
      }

      var p = path.parse(abs);
      var m = /\-(\d+)px$/.exec(p.name);
      
      if (m) {
        // size from url overrides size from width/height attributes
        size = m[1];
        abs = abs.replace(/-\d+px/, '');
      }
      
      var image = map[abs];
      if (!image) {
        return null;
      }
      
      var mapping = image[size];
      if (!mapping) {
        return null;
      }
      
      function mapPath(path) {
        return `/${options.imageDirectory}/${path}`;
      }
      
      return [
        {
          name: 'width',
          value: String(mapping[1].width)
        }, {
          name: 'height',
          value: String(mapping[1].height)
        }, {
          name: 'src',
          value: mapPath(mapping[1].path)
        }, {
          name: 'srcset',
          value: Object.keys(mapping)
            .filter(density => density != 1)
            .map(density => `${mapPath(mapping[density].path)} ${density}x`)
            .join(', ')
        }
      ];
    }
    
    function processNode(file, node) {
      if (node.tagName == 'img') {
        var src    = _.find(node.attrs, {name: 'src'}); 
        var srcset = _.find(node.attrs, {name: 'srcset'}); 
        
        var width  = _.find(node.attrs, {name: 'width'}); 
        var height = _.find(node.attrs, {name: 'height'}); 
        var size = width || height || {};
        
        if (src) {
          var newAttrs = getSrcSet(file, src.value, size.value);
          if (newAttrs) {
            node.attrs = _
              .without(node.attrs, src, srcset, width, height)
              .concat(newAttrs);
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
    processHtml(files, metalsmith.metadata().imageMap);
    done();
  };
}

module.exports = metalsmithSrcSet;
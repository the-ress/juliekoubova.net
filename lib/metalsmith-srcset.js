/// <reference path="../typings/main.d.ts" />

'use strict';

const _ = require('lodash');
const cheerio = require('cheerio');
const multimatch = require('multimatch');
const parse5 = require('parse5');
const path = require('path');

const utils = require('./metalsmith-utils');

function metalsmithSrcSet(options) {
  options = options || {};
  options.html = options.html || '**/*.+(htm|html)';
  options.imageDirectory = 'img';

  function processHtml(files, map) {
    
    function mapImage(file, src, size) {
      var abs = utils.absolutePath(src, file);
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
      
      var mapping = image[size || 'original'];
      return mapping;
    }
    
    function mapPath(path) {
      return `/${options.imageDirectory}/${path}`;
    }
    
    multimatch(Object.keys(files), options.html).forEach(function(name) {
      var file = files[name];
      var $ = cheerio.load(file.contents.toString());
      
      $('img').each((i, el) => {
        var $el = $(el);
        var src = $el.attr('src');
        if (!src) return;
          
        var width = $el.attr('width');
        var mapping = mapImage(name, src, width);
        if (!mapping) return;         
        
        $el.attr('src', mapPath(mapping[1]));
        $el.attr('srcset', 
           Object.keys(mapping)
            .filter(density => density != 1)
            .map(density => `${mapPath(mapping[density])} ${density}x`)
            .join(', ')
        );
      });
      
      $('meta[property="og:image"]').each((i, el) => {
        var $el = $(el);
        var content = $el.attr('content');
        if (!content) return;
        
        var mapping = mapImage(name, content);
        if (!mapping) return;
        
        $el.attr('content', mapPath(mapping[1]));
      });
 
      file.contents = new Buffer($.html());
    });
  }
  
  return function(files, metalsmith, done) {
    processHtml(files, metalsmith.metadata().imageMap);
    done();
  };
}

module.exports = metalsmithSrcSet;
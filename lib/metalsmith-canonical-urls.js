/// <reference path="../typings/main.d.ts" />

'use strict';

const cheerio = require('cheerio');
const multimatch = require('multimatch');

module.exports = options => {
  options = options || {};
  options.html = options.html || '**/*.+(htm|html)';
  options.selectors = options.selectors || {
    'meta[name="twitter:image"]': 'content',
    'meta[property="og:image"]': 'content',
    'meta[property="og:url"]': 'content'
  };

  if (!options.baseUrl) {
    throw new Error("options.baseUrl not defined.");
  }  

  if (options.baseUrl.slice(-1) !== '/') {
    options.baseUrl += '/';
  }

  return (files, metalsmith, done) => {
    multimatch(Object.keys(files), options.html).forEach(name => {
      var $ = cheerio.load(
        files[name].contents.toString(),
        { decodeEntities: false }
      );
      
      Object.keys(options.selectors).forEach(selector => {
        $(selector).each((i, el) => {
          var $el = $(el);
          var attr = options.selectors[selector];
          var value = $el.attr(attr);
          
          if (value.slice(0, options.baseUrl.length) == options.baseUrl) {
            return;
          }
          
          if (value[0] == '/') {
            value = value.slice(1);
          }
          
          $el.attr(attr, options.baseUrl + value);
        });
      });
      
      files[name].contents = new Buffer($.html());
    });
    
    done();   
  };
};


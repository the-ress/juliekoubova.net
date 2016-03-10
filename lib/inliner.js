'use strict';

var _ = require('lodash');
var fs = require('fs');

module.exports = function metalsmithCssInliner(options) {
  
  if (!options) throw new Error('options required');
  if (!options.css) throw new Error('options.css required');
  if (!options.html) throw new Error('options.html required');
  
  options = _.extend({ removeOriginal: true }, options);
  
  return function metalsmithCssInliner(files, metalsmith, done) {
    var cssFile = files[options.css];
    var htmlFile = files[options.html];
    
    if (!cssFile) throw new Error(`${options.css} not found`);
    if (!htmlFile) throw new Error(`${options.html} not found`);
    
    var cssContents = cssFile.contents.toString();
    var htmlContents = htmlFile.contents.toString();
    
    var cssRegExp = _.escapeRegExp(options.css);
    var regExp = new RegExp(
      `<link[^>]+href=['"]?${cssRegExp}['"]?[^>]*>`
    );
    
    cssContents = `<style>${cssContents}</style>`;
    htmlContents = htmlContents.replace(regExp, cssContents);
    
    htmlFile.contents = new Buffer(htmlContents);
    
    if (options.removeOriginal) {
      delete files[options.css];
    }
    
    done();
  };
};
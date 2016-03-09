'use strict';

var escapeRegexp = require('escape-regexp');
var fs = require('fs');

function inlineCss(htmlFile, cssFile, cssContents) {
  var html = fs.readFileSync(htmlFile).toString();

  var cssFileRegexp = escapeRegexp(cssFile);
  var regexp = new RegExp(
    `<link[^>]+href=['"]?${cssFileRegexp}['"]?[^>]*>`
  );

  html = html.replace(
    regexp,
    '<style>' + cssContents + '</style>'
  );

  fs.writeFileSync(htmlFile, html);
}

module.exports = {
  inlineCss: inlineCss
};
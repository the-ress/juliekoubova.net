'use strict';

var _ = require('lodash');
var fs = require('fs');

function inline(root, htmlFile, regExp, contents) {
  var htmlPath = root + '/' + htmlFile;
  var html = fs.readFileSync(htmlPath).toString();
  
  html = html.replace(regExp, contents);

  fs.writeFileSync(htmlPath, html);
}

function inlineCss(root, htmlFile, cssFile, cssContents) {
  var cssFileRegExp = _.escapeRegExp(cssFile);
  var regExp = new RegExp(
    `<link[^>]+href=['"]?${cssFileRegExp}['"]?[^>]*>`
  );

  inline(root, htmlFile, regExp, '<style>'+cssContents+'</style>');
  fs.unlink(root + '/' + cssFile);
}

module.exports = {
  inlineCss: inlineCss
};
/// <reference path="../typings/main.d.ts" />

'use strict';

const _ = require('lodash');
const cheerio = require('cheerio');
const crypto = require('crypto');
const multimatch = require('multimatch');
const path = require('path');
const url = require('url');
const urlBase64 = require('./url-base64')

function metalsmithSrcSet(options) {
  options = options || {};
  options.html = options.html || '**/*.+(htm|html)';
  options.pattern = options.pattern || '**/*.+(css|js)';
  options.attrs = options.attrs || {
    'script': 'src',
    'link[rel=stylesheet]': 'href'
  };

  function digestFiles(files) {
    var matching = multimatch(Object.keys(files), options.pattern);

    return _.fromPairs(matching.map(name => {
      var hash = crypto.createHash('sha1');
      hash.update(files[name].contents);
      var digest = urlBase64.encode(hash.digest('base64'));

      var p = path.parse(name);
      var newName = `${p.dir}/${digest}${p.ext}`;
      
      if (newName[0] == '/') 
        newName = newName.slice(1);
      
      files[newName] = files[name];
      delete files[name];
      
      return [name, newName];
    }));
  }
  
  function processHtml(files, map) {

    function mapFile(file, src) {
      var abs = url.resolve(file, src);
      if (!abs) return null;
      
      if (abs[0] == '/') {
        abs = abs.slice(1);
      }
      
      return '/' + map[abs];
    }

    multimatch(Object.keys(files), options.html).forEach(function(name) {
      var file = files[name];
      var $ = cheerio.load(
        file.contents.toString(),
        { decodeEntities: false }
      );

      Object.keys(options.attrs).forEach(selector => {
        var attr = options.attrs[selector];
        $(selector).each((i, el) => {
          var $el = $(el);
          var oldValue = $el.attr(attr);
          if (!oldValue) return;

          var newValue = mapFile(name, oldValue);
          $el.attr(attr, newValue);
        });
      });

      file.contents = new Buffer($.html());
    });
  }

  return function(files, metalsmith, done) {
    var map = digestFiles(files);
    processHtml(files, map);
    done();
  };
}

module.exports = metalsmithSrcSet;
/// <reference path="../typings/main.d.ts" />

'use strict';

const _ = require('lodash');
const cheerio = require('cheerio');
const multimatch = require('multimatch');

const utils = require('./metalsmith-utils');

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
      var file = files[name];
      var $ = cheerio.load(
        file.contents.toString(),
        { decodeEntities: false }
      );

      $('link[rel=stylesheet]').each((i, el) => {
        var $el = $(el);
        var href = utils.absolutePath($el.attr('href'), name)
        var cssFile = css[href];
        
        if (cssFile) {
          $el.replaceWith(`<style>${cssFile.contents.toString()}</style>`);
        }
      });

      $('script[src]').each((i, el) => {
        var $el = $(el);
        var src = utils.absolutePath($el.attr('src'), name)
        var jsFile = js[src];
        
        if (jsFile) {
          $el.replaceWith(`<script>${jsFile.contents.toString()}</script>`);
        }
      });

      file.contents = new Buffer($.html());
    });
    
    done();
  };
};
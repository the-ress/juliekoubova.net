/// <reference path="../typings/main.d.ts" />

'use strict';

const _ = require('lodash');
const cheerio = require('cheerio');
const multimatch = require('multimatch');
const path = require('path');
const url = require('url');

function metalsmithSrcSet(options) {
  options = options || {};
  options.html = options.html || '**/*.+(htm|html)';
  options.imageDirectory = 'img';
  options.ogSize = options.ogSize || 660;
  options.ogDensity = options.ogDensity || 2;
  options.twitterSize = options.twitterSize || 660;
  options.twitterDensity = options.twitterDensity || 1;

  function processHtml(files, map) {

    function mapImage(file, src, size) {
      var abs = url.resolve(file, src);
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

      if (abs[0] == '/') {
        abs = abs.slice(1);
      }

      var image = map[abs];
      if (!image) {
        throw new Error(
          `Image ${src} used in ${file} cannot be found in the image map.`
        );
      }

      if (!size) {
        throw new Error(
          `Cannot determine which size of ${src} to use in the file ${file}.`
        );
      }

      var mapping = image[size];
      return mapping;
    }

    function mapPath(path) {
      return `/${options.imageDirectory}/${path}`;
    }

    multimatch(Object.keys(files), options.html).forEach(function(name) {
      var file = files[name];
      var $ = cheerio.load(
        file.contents.toString(),
        { decodeEntities: false }
      );

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

        var mapping = mapImage(name, content, options.ogSize);
        if (!mapping) return;

        $el.attr('content', mapPath(mapping[options.ogDensity]));
      });

      $('meta[name="twitter:image"]').each((i, el) => {
        var $el = $(el);
        var content = $el.attr('content');
        if (!content) return;

        var mapping = mapImage(name, content, options.twitterSize);
        if (!mapping) return;

        $el.attr('content', mapPath(mapping[options.twitterDensity]));
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
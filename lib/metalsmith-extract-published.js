/// <reference path="../typings/main.d.ts" />

'use strict';

const moment = require('moment');
const multimatch = require('multimatch');
const path = require('path');

module.exports = options => {

  options = options || {};

  if (typeof options === 'string' || options instanceof Array) {
    options = { patterns: options }
  }

  options.dateProperty = options.dateProperty || 'published';

  options.patterns = options.patterns || [
    'posts/*/index.html', 'posts/*.html'
  ];

  if (!(options.patterns instanceof Array))
    options.patterns = [options.patterns];

  function moveSiblings(files, oldDir, newDir) {
    multimatch(Object.keys(files), oldDir + '**').forEach(sib => {
      var sibNewName = newDir + sib.slice(oldDir.length);
      files[sibNewName] = files[sib];
      delete files[sib];
    });
  }

  function extractPublished(files, name) {
    var date;
    var baseName;
    var newDir;
    var oldDir;
    var parentDir;

    var p = path.parse(name);

    if (p.base === 'index.html') {
      baseName = path.basename(p.dir);
      parentDir = path.dirname(p.dir);
      oldDir = p.dir + '/';
    } else {
      baseName = p.name;
      parentDir = p.dir;
    }

    var match = /^(\d{4})-(\d{2})-(\d{2})-(.*)$/.exec(baseName);

    if (match) {
      var year = Number(match[1]);
      var month = Number(match[2]) - 1;
      var day = Number(match[3]);

      date = moment.utc([year, month, day]).toDate();
      newDir = parentDir + '/' + match[4] + '/';
    }

    if (date) {
      files[name][options.dateProperty] = date;
    }

    if (newDir) {
      var newName = newDir + 'index.html'
      files[newName] = files[name];
      delete files[name];

      if (oldDir) {
        moveSiblings(files, oldDir, newDir);
      }
    }
  }

  return (files, metalsmith, done) => {
    multimatch(Object.keys(files), options.patterns).forEach(name => {
      extractPublished(files, name);
    });

    var imageMap = metalsmith.metadata().imageMap;
    if (!imageMap) return;
    
    Object.keys(imageMap).forEach(name => {
      var match = /^[^/]+\/\d{4}-\d{2}-\d{2}-(.*)$/.exec(name);
      if (match) {
        var newName = match[1];
        imageMap[newName] = imageMap[name];
        delete imageMap[name];
      }
    });

    done();
  };
};
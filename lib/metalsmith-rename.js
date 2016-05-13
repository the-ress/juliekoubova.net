/// <reference path="../typings/main.d.ts" />
'use strict';
const multimatch = require('multimatch');
const path = require('path');

module.exports = function metalsmithRename(options) {
  options = options || {};

  if (!options.pattern) throw new Error("options.pattern not specified");
  if (!options.rename) throw new Error("options.rename not specified");

  return function metalsmithRename(files, metalsmith, done) {

    multimatch(Object.keys(files), options.pattern).forEach(name => {
      var newName = options.rename(name);
      
      if (newName == name) {
        return;
      }
      
      var p = path.parse(newName);
      p.href = '/';
      
      if (p.dir) {
        p.href += p.dir + '/';
      }
      
      if (p.base != options.directoryIndex) {
        p.href += p.base;
      }
      
      files[newName] = files[name];
      files[newName].path = p;
      
      delete files[name];
    });
    
    done();
  };
};
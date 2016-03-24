/// <reference path="../typings/main.d.ts" />
'use strict';
const multimatch = require('multimatch');

module.exports = function metalsmithRename(options) {
  options = options || {};

  if (!options.pattern) throw new Error("options.pattern not specified");
  if (!options.rename) throw new Error("options.rename not specified");

  return function metalsmithRename(files, metalsmith, done) {

    multimatch(Object.keys(files), options.pattern).forEach(name => {
      var newName = options.rename(name);
      files[newName] = files[name];
      delete files[name];
    });
    
    done();
  };
};
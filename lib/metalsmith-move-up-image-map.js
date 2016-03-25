/// <reference path="../typings/main.d.ts" />
'use strict';

const multimatch = require('multimatch');

module.exports = options => {
  options = options || {};
  
  if (typeof options === 'string') {
    options = { pattern: options };
  }
  
  if (!options.pattern) {
    throw new Error("options.pattern not specified");
  }
  
  return (files, metalsmith, done) => {
    var imageMap = metalsmith.metadata().imageMap;

    if (!imageMap) {
      throw new Error("imageMap metadata does not exist.");
    }

    multimatch(Object.keys(imageMap), options.pattern).forEach(name => {
      var chunks = name.split('/');
      var newName = chunks.slice(1);
      
      if (newName.length > 0){
        imageMap[newName.join('/')] = imageMap[name];
        delete imageMap[name];
      }
    });

    done();
  }
};

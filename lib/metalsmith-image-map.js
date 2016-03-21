'use strict';

module.exports = function (options) {
  options = options || {};
  options.output = options.output || 'map.json';
  
  return function (files, metalsmith, done) {
    files[options.output] = {
      contents: new Buffer(JSON.stringify(metalsmith.metadata().imageMap))
    };
    done();
  };
}
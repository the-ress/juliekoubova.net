'use strict';

var gm = require('gm');
var path = require('path');
var Q = require('q');

module.exports = function metalsmithImageResize(options) {
  return function metalsmithImageResize(files, metalsmith, done) {
    
    var promise = Q();
    
    Object.keys(files).forEach(function(name) {
      var file = files[name];
      var p = path.parse(name);

      if (!file.resize) {
        return;
      }

      if (!(file.resize instanceof Array)) {
        file.resize = [file.resize];
      }

      file.resize.forEach(function(size) {
        var newName = `${p.dir}/${p.name}@${size.name}${p.ext}`.replace(/^\//, '');
        var resized = gm(file.contents).resize(size.width, size.height || size.width)

        promise = promise.then(
          () => Q.nfcall(resized.toBuffer.bind(resized))
        ).then(
          buffer => { files[newName] = { contents: buffer }; }
        );
      });
    })
    
    promise.then(done).done();
  };
}
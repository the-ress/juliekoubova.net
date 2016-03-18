'use strict';

const gm = require('gm');
const multimatchh = require('multimatch');
const path = require('path');
const Q = require('q');

module.exports = function metalsmithImageResize(options) {
  options = options || {};
  options.patterns = [ '**/*.+(jpg|jpeg|gif|png)' ];
  
  return function metalsmithImageResize(files, metalsmith, done) {
    
    var promise = Q();
    var densities = metalsmith.metadata().screenDensity || [ 1 ];

    multimatchh(Object.keys(files), options.patterns).forEach(name => {
      var file = files[name];
      var p = path.parse(name);

      if (!file.sizes) {
        file.sizes = metalsmith.metadata().imageSizes || [];
      }

      if (!(file.sizes instanceof Array)) {
        file.sizes = [file.sizes];
      }

      file.sizes.forEach(x => {
        
        if (typeof x === 'number') {
          x = { size: x };
        }
        
        if (!x.size) {
          throw new Error(
            `File ${name} invalid size ${JSON.stringify(x)}`
          );
        }
        
        if (!x.density) {
          x.density = densities;
        }
        
        if (!(x.density instanceof Array)) {
          x.density = [ x.density ];
        }
        
        x.density.forEach(d => {
          var suffix  = `-${x.size}px`;
          var density = `@${d}x`;
          
          if (x.density.length === 1) {
            density = '';
          }
          
          var newName = `${p.name}${suffix}${density}${p.ext}`
          var newPath = `${p.dir}/${newName}`.replace(/^\//, '');
          
          if (newPath in files) {
            throw new Error(
              `File ${newPath} already exists`
            );
          }
          
          var size = x.size * d;        
          var resized = gm(file.contents).resize(size, size, '>');

          promise = promise.then(
            () => Q.nfcall(resized.toBuffer.bind(resized))
          ).then(
            buffer => { files[newPath] = { contents: buffer }; }
          );
        });
        
      });
    })
    
    promise.then(done).done();
  };
}
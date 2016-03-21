'use strict';

const crypto = require('crypto');
const gm = require('gm');
const multimatch = require('multimatch');
const path = require('path');
const Q = require('q');

module.exports = function metalsmithImageResize(options) {
  options = options || {};
  options.pattern = options.pattern || [ '**/*.+(jpg|jpeg|gif|png)' ];
  
  return function metalsmithImageResize(files, metalsmith, done) {
    
    var promise = Q();
    var densities = metalsmith.metadata().screenDensity || [ 1 ];

    var map = metalsmith.metadata().imageMap = {};

    multimatch(Object.keys(files), options.pattern).forEach(name => {
      var file = files[name];
      delete files[name];
      
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
          
          var size = x.size * d;
          
          var hash = crypto.createHash('sha1');
          hash.update(file.contents);
          
          var digest = hash.digest('hex');
          var newName = `${digest}${suffix}${density}${p.ext}`
          
          if (newName in files) {
            throw new Error(
              `File ${newName} already exists (created from ${name})`
            );
          }

          var resized = gm(file.contents).resize(size, size, '>');

          promise = promise.then(
            () => Q.nfcall(resized.toBuffer.bind(resized))
          ).then(buffer => { 
            files[newName] = { contents: buffer };
            
            var reloaded = gm(buffer);
            return Q.nfcall(reloaded.size.bind(reloaded));
          }).then(newSize => {
              map[name] = map[name] || {};
              map[name][x.size] = map[name][x.size] || {}; 
              map[name][x.size][d] = {
                path: newName,
                width: newSize.width / d,
                height: newSize.height / d
              }; 
            }
          );
        });
        
      });
    })
    
    promise.then(done).done();
  };
}
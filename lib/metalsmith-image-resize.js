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
      
      file.sizes.push({ original: true });
      
      file.sizes.forEach(x => {
        
        if (typeof x === 'number') {
          x = { size: x };
        }
        
        if (!x.size && !x.original) {
          throw new Error(
            `File ${name} invalid size ${JSON.stringify(x)}`
          );
        }
        
        if (!x.density) {
          if (x.original) {
            x.density = [ 1 ];
          } else {
            x.density = densities;
          }
        }
        
        if (!(x.density instanceof Array)) {
          x.density = [ x.density ];
        }
        
        x.density.forEach(d => {
          var suffix  = `-${x.size}px`;
          var density = `@${d}x`;
          
          if (x.original) {
            suffix = '';
          }
          
          if (x.density.length === 1) {
            density = '';
          }
          
          var hash = crypto.createHash('sha1');
          hash.update(file.contents);
          
          var digest = hash.digest('hex');
          var newName = `${digest}${suffix}${density}${p.ext}`
          
          if (newName in files) {
            throw new Error(
              `File ${newName} already exists (created from ${name})`
            );
          }
          
          if (x.size) {
            var resized = gm(file.contents).resize(x.size * d, x.size * d, '>');
            
            promise = promise.then(
              () => Q.nfcall(resized.toBuffer.bind(resized))
            );
          } else {
            promise = promise.then(() => file.contents);
          }

          promise = promise.then(buffer => { 
            files[newName] = { contents: buffer };
          });
          
          promise = promise.then(() => {
            var sz = x.size || 'original';
            map[name] = map[name] || {};
            map[name][sz] = map[name][sz] || {}; 
            map[name][sz][d] = newName; 
          });
        });
        
      });
    })
    
    promise.then(done).done();
  };
}
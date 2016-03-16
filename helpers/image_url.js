'use strict';

const path = require('path');

module.exports = (image, size, density, ctx) => {
  if (typeof density !== 'number') {
    ctx = density;
    density = 1;
  }
  
  var p = path.parse(image);
  return path.format({
    dir: p.dir,
    ext: p.ext,
    name: `${p.name}-${size}px@${density}x`
  });
}


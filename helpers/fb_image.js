'use strict';

module.exports = function(url, ctx) {
  return url.replace(
    /@\d+x(\.[^.]+)$/, 
    '@' + ctx.data.root.fbImageSize + '$1'
  );
};
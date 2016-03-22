'use strict';

module.exports = {
  absolutePath: function(relative, base, root) {
    
    if (root) {
      if (relative.slice(0, root.length) == root) {
        relative = relative.slice(root.length);
        if (relative[0] !== '/') {
          relative = '/' + relative;
        }
      }
    }
    
    if (/^https?:\/\//.test(relative)) {
      return null;
    }

    if (relative[0] == '/') {
      return relative.slice(1);
    }

    var baseChunks = base.split('/').slice(0, -1);
    var relativeChunks = relative.split('/');

    while (relativeChunks[0] == '..') {
      baseChunks = baseChunks.slice(0, -1);
      relativeChunks = relativeChunks.slice(1);
    }

    return baseChunks.concat(relativeChunks).join('/');
  }
};
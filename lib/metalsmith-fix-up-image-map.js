'use strict';

module.exports = () => (files, metalsmith, done) => {
  var imageMap = metalsmith.metadata().imageMap;
  
  Object.keys(imageMap).forEach(name => {    
    var match = /^[^/]+\/\d{4}-\d{2}-\d{2}-(.*)$/.exec(name);
    if (match) {
      var newName = match[1];
      imageMap[newName] = imageMap[name];
      delete imageMap[name];
    }
    
  });
  
  done();
};
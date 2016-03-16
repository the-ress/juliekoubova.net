'use strict';

const multimatch = require('multimatch');
const path = require('path');

module.exports = options => {
  options = options || {};
  options.patterns = options.patterns || [ 
    'posts/*/index.html', 'posts/*.html'
  ];
  
  if (!(options.patterns instanceof Array)) 
    options.patterns = [ options.patterns ];
    
  return (files, metalsmith, done) => {
    multimatch(Object.keys(files), options.patterns).forEach(name => {

      var date;
      var newName;
      var baseName;
      
      var p = path.parse(name); 
      
      if (p.base === 'index.html') {
        baseName = path.basename(p.dir);
      } else {
        baseName = p.name;
      }
      
      var match = /^(\d{4})-(\d{2})-(\d{2})-(.*)$/.exec(baseName);
      
      if (match) {
        var year = Number(match[1]);
        var month = Number(match[2]) - 1;
        var day = Number(match[3]);
        
        date = new Date(year, month, day);
        newName = match[4];
      }
      
      if (newName) {
        newName = newName + '/index.html';
        files[newName] = files[name];
        delete files[name];
        name = newName;
      }
      
      files[name].post = {};
      files[name].fbType = 'article';
      
      if (date) {
        files[name].post.published = date;
      }
    });
    done();
  };
};
'use strict';

const multimatch = require('multimatch');
const path = require('path');

module.exports = options => {
  options = options || {};
  
  options.assign = options.assign || {
    fbType: 'article'
  };
  
  options.dateProperty = options.dateProperty || 'published';
  
  options.patterns = options.patterns || [ 
    'posts/*/index.html', 'posts/*.html'
  ];
  
  if (!(options.patterns instanceof Array)) 
    options.patterns = [ options.patterns ];
    
  return (files, metalsmith, done) => {
    multimatch(Object.keys(files), options.patterns).forEach(name => {

      var date;
      var baseName;
      var newDir;
      var oldDir;
      var parentDir;
      
      var p = path.parse(name); 
      
      if (p.base === 'index.html') {
        baseName = path.basename(p.dir);
        parentDir = path.dirname(p.dir);
        oldDir = p.dir + '/';
      } else {
        baseName = p.name;
        parentDir = p.dir;
      }
  
      var match = /^(\d{4})-(\d{2})-(\d{2})-(.*)$/.exec(baseName);
      
      if (match) {
        var year = Number(match[1]);
        var month = Number(match[2]) - 1;
        var day = Number(match[3]);
        
        date = new Date(year, month, day);
        newDir = parentDir + '/' + match[4] + '/';
      }
      
      Object.assign(files[name], options.assign);
      
      if (date) {
        files[name][options.dateProperty] = date;
      }
      
      if (newDir) {
        var newName = newDir + 'index.html'
        files[newName] = files[name];
        delete files[name];
        
        if (oldDir) {
          multimatch(Object.keys(files), oldDir + '**').forEach(sib => {
            var sibNewName = newDir + sib.substr(oldDir.length);
            files[sibNewName] = files[sib];
            delete files[sib];
          });
        }
      }
    });
    done();
  };
};
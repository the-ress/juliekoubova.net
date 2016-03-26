/// <reference path="../typings/main.d.ts" />
'use strict';

const _ = require('lodash');

module.exports = options => {
  options = options || {};
  options.count = options.count || 3;

  if (!options.collection) {
    throw new Error("options.collection not specified");
  }
  
  return (files, metalsmith, done) => {
    const collection = metalsmith.metadata()[options.collection]; 
    collection.forEach(post => {
      var prev = post.previous;
      var next = post.next;
      
      var take = options.count - _.compact([prev,next]).length;
      
      var banners = [];
      
      function pushBanner(b, key) {
        if (!b) return;
        
        var bb = _.clone(b);
        bb[key] = true;
        banners.push(bb);
      }

      pushBanner(next, 'isNextBanner');      
      
      if (take > 0) {
        banners = banners.concat(
          _(collection)
            .without(post, prev, next)
            .take(take)
            .value()
        );
      }
      
      pushBanner(prev, 'isPrevBanner');
      
      post.banners = banners;
    });
    
    done();
  };
};
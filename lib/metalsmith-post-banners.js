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
      var prev = post.prev;
      var next = post.next;
      
      var take = options.count - _.compact([prev,next]).length;
      
      var banners = [ prev ];
      
      if (take > 0) {
        banners = banners.concat(
          _(collection)
            .filter(p => !p.noBanner && !p.draft)
            .without(post, prev, next)
            .take(take)
            .value()
        );
      }
      
      banners.push(next);
      
      post.banners = _.compact(banners);
    });
    
    done();
  };
};
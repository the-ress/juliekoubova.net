'use strict';

module.exports = (title, ctx) => {
  
  var siteTitle = ctx.data.root.siteTitle;
  title = (title || '').trim();
  
  if (title && siteTitle && siteTitle != title) {
    return siteTitle + ': ' + title;
  }
  
  if (title) {
    return title;
  }
  
  return siteTitle;
} 
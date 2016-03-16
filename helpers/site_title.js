'use strict';

module.exports = (title, ctx) => {
  
  var siteTitle = ctx.data.root.siteTitle;
  title = title.trim();
  
  if (title && siteTitle) {
    return siteTitle + ': ' + title;
  }
  
  if (title) {
    return title;
  }
  
  return siteTite;
} 
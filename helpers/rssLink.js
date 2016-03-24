"use strict";

module.exports = (ctx) => {
  var rel = (ctx.data.root.path.href == '/') ? 'alternate' : 'home'; 
  return `<link rel="${rel}" ` + 
         ` href="${ctx.data.root.baseUrl}/rss.xml" ` + 
         ` type="application/rss+xml">`;
}
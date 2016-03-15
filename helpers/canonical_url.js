'use strict';

module.exports = (url, ctx) => 
  ctx.data.root.baseUrl + '/' + url.replace(/^\/|index\.html$/g, '');

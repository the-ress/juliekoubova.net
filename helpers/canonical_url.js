'use strict';

module.exports = (url, context) =>
  context.data.root.baseUrl + url.replace(/^\/|index\.html$/g, '');

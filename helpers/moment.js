'use strict';

const moment = require('moment');

module.exports = (date, format, ctx) => {
  
  var m = moment(date);
  
  if (ctx.data.root.lang) {
    m = m.locale(ctx.data.root.lang);
  }
    
  return m.format(format);
};
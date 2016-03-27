'use strict';

module.exports = {
  encode: base64 => 
    base64.replace(/\+/g, '~').replace(/\//g, '-').replace(/=/g, '')
};
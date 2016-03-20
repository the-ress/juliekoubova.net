'use strict';

const Metalsmith = require('metalsmith');
const Q = require('q');

const define = require('metalsmith-define');
const imagemin = require('metalsmith-imagemin');
const imageResize = require('./lib/metalsmith-image-resize');
const metafiles = require('metalsmith-metafiles');

function buildImages() {
  let m = new Metalsmith(__dirname);

  m.source('img');
  m.destination('src/img');
  
  m.use(define({
    screenDensity: [ 1, 2 ],
    imageSizes: [ 660 ]
  }));
  m.use(metafiles());
  m.use(imageResize());  
  m.use(imagemin());
  
  return Q.nfcall(m.build.bind(m));  
}

buildImages().done();
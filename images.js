'use strict';

const Metalsmith = require('metalsmith');
const Q = require('q');

const define = require('metalsmith-define');
const ignore = require('metalsmith-ignore');
const imagemin = require('metalsmith-imagemin');
const metafiles = require('metalsmith-metafiles');

const imageMap = require('./lib/metalsmith-image-map');
const imageResize = require('./lib/metalsmith-image-resize');

function buildImages() {
  let m = new Metalsmith(__dirname);

  m.source('src');
  m.destination('src/img');
  
  m.use(ignore([
    '**/*',
    '!**/*.+(jpg|jpeg|gif|png)',
    '!**/*.+(jpg|jpeg|gif|png).meta.json'
  ]));
  
  m.use(define({
    screenDensity: [ 1, 2 ],
    imageSizes: [ 660, 200 ]
  }));
  
  m.use(metafiles());
  m.use(imageResize());  
  m.use(imagemin());
  m.use(imageMap());
  
  return Q.nfcall(m.build.bind(m));  
}

buildImages().done();
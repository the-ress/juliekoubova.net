'use strict';

const fs = require('fs');
const Metalsmith = require('metalsmith');
const mv = require('mv');
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
  m.destination('img');
  
  m.use(ignore([
    'img-map.json',
    '**/*',
    '**/.*',
    '!**/*.+(jpg|jpeg|gif|png)',
    '!**/*.+(jpg|jpeg|gif|png).meta.json'
  ]));
  
  m.use(define({
    screenDensity: [ 1, 2 ],
    imageSizes: [ 660 ]
  }));
  
  m.use(metafiles());
  
  // create 200px wide images for banners
  m.use((files, m, done) => {
    Object.keys(files).filter(n => /\/index\.[^.]+$/.test(n)).forEach(n => {
      files[n].sizes = [660, 200];
    });
    done();    
  });
  
  m.use(imageResize());  
  m.use(imagemin());
  m.use(imageMap());
  
  return Q.nfcall(m.build.bind(m));  
}

buildImages().then(() => 
  Q.nfcall(mv.bind(
    this,
    __dirname + '/img/map.json', 
    __dirname + '/src/img-map.json'
  ))
)
.done();
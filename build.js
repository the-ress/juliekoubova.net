var _ = require('lodash');
var Q = require('q');

var Metalsmith = require('metalsmith');
var analytics = require('./lib/metalsmith-analytics');
var cssInliner = require('./lib/metalsmith-css-inliner');
var express = require('metalsmith-express');
var handlebarsPartials = require('./lib/metalsmith-handlebars-partials');
var gzip = require('metalsmith-gzip');
var htmlMinifier = require("metalsmith-html-minifier");
var inPlace = require('metalsmith-in-place');
var myth = require('metalsmith-myth');
var uncss = require('metalsmith-uncss');
var watch = require('metalsmith-watch');

function build(options) {
  var m = new Metalsmith(__dirname);

  m.source('src');
  m.destination('build');

  m.use(handlebarsPartials({
    root: 'partials'
  }));

  m.use(inPlace({
    engine: 'handlebars'
  }));

  // first, process all the @import rules
  m.use(myth({
    compress: !options.live
  }));

  m.use(analytics(
    'UA-58690305-1',
    { exclude: /^pinterest-.*\.html$/ }
  ));

  m.use(uncss({
    css: ['main.css'],
    html: ['index.html'],
    output: 'index.css',
    uncss: {
      ignoreSheets: [/\/\/fonts.googleapis.com\/.*/]
    }
  }));

  // reprocess uncss output
  m.use(myth({
    compress: !options.live
  }));

  m.use(cssInliner({
    css: 'index.css',
    html: 'index.html'
  }));

  if (options.live) {
    m.use(express());
    m.use(watch({
      paths: { '${source}/**/*': true },
      livereload: true
    }));
  } else {
    m.use(htmlMinifier());
    
    if (options.gzip) {
      m.use(gzip({ gzip: { level: 9 } }));
    }
  }

  return Q.nfcall(_.bind(m.build, m));
}

function hasSwitch(arg) {
  return _.includes(process.argv, `--${arg}`);
}

build({
  live: hasSwitch('live'),
  gzip: hasSwitch('production')
})
.done();
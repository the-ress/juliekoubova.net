var _ = require('lodash');
var Metalsmith = require('metalsmith');
var metalsmithAnalytics = require('./lib/metalsmith-analytics');
var metalsmithCssInliner = require('./lib/inliner');
var metalsmithExpress = require('metalsmith-express');
var metalsmithHandlebarsPartials = require('./lib/metalsmith-handlebars-partials');
var metalsmithGzip = require('metalsmith-gzip');
var metalsmithHtmlMinifier = require("metalsmith-html-minifier");
var metalsmithInPlace = require('metalsmith-in-place');
var metalsmithMyth = require('metalsmith-myth');
var metalsmithUncss = require('metalsmith-uncss');
var metalsmithWatch = require('metalsmith-watch');
var Q = require('q');

function build(options) {
  var m = Metalsmith(__dirname);

  m.source('src');
  m.destination('build');

  m.use(metalsmithHandlebarsPartials({
    root: 'partials'
  }));

  m.use(metalsmithInPlace({
    engine: 'handlebars'
  }));

  // first, process all the @import rules
  m.use(metalsmithMyth({
    compress: !options.live
  }));

  m.use(metalsmithAnalytics(
    'UA-58690305-1',
    { exclude: /^pinterest-.*\.html$/ }
  ));

  m.use(metalsmithUncss({
    css: ['main.css'],
    html: ['index.html'],
    output: 'index.css',
    uncss: {
      ignoreSheets: [/\/\/fonts.googleapis.com\/.*/]
    }
  }));

  // reprocess uncss output
  m.use(metalsmithMyth({
    compress: !options.live
  }));

  m.use(metalsmithCssInliner({
    css: 'index.css',
    html: 'index.html'
  }));

  if (options.gzip) {
    m.use(metalsmithGzip({
      gzip: { level: 9 }
    }));
  }

  if (options.live) {
    m.use(metalsmithExpress());
    m.use(metalsmithWatch({
      paths: { '${source}/**/*': true },
      livereload: true
    }));
  } else {
    m.use(metalsmithHtmlMinifier());
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
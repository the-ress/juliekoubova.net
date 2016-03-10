var _ = require('lodash');
var fs = require('fs');
var Handlebars = require('handlebars');
var Metalsmith = require('metalsmith');
var metalsmithAnalytics = require('./lib/metalsmith-analytics');
var metalsmithCssInliner = require('./lib/inliner');
var metalsmithExpress = require('metalsmith-express');
var metalsmithGzip = require('metalsmith-gzip');
var metalsmithHtmlMinifier = require("metalsmith-html-minifier");
var metalsmithInPlace = require('metalsmith-in-place');
var metalsmithMyth = require('metalsmith-myth');
var metalsmithUncss = require('metalsmith-uncss');
var metalsmithWatch = require('metalsmith-watch');
var myth = require('myth');
var Q = require('q');

const PartialsDir = 'partials';

function metalsmithPromise(fn) {
  var metalsmith = Metalsmith(__dirname);
  fn(metalsmith);

  return Q.nfcall(
    _.bind(metalsmith.build, metalsmith)
  );
}

function loadPartials() {
  fs.readdirSync(PartialsDir).forEach(function(file) {
    var source = `${__dirname}/${PartialsDir}/${file}`;
    var contents = fs.readFileSync(source).toString();

    Handlebars.registerPartial(file, contents);
  });
}

function build(options) {
  return metalsmithPromise(function(m) {
    m.source('src');
    m.destination('build');

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
  });
}

function hasSwitch(arg) {
  return _.includes(process.argv, `--${arg}`);
}

loadPartials();

var options = {
  live: hasSwitch('live'),
  gzip: hasSwitch('production')
};

build(options).catch(function(error) {
  throw error;
});
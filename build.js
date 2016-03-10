var _ = require('lodash');
var compress = require('metalsmith-gzip');
var fs = require('fs');
var Handlebars = require('handlebars');
var Metalsmith = require('metalsmith');
var metalsmithAnalytics = require('./lib/metalsmith-analytics');
var metalsmithExpress = require('metalsmith-express');
var metalsmithHtmlMinifier = require("metalsmith-html-minifier");
var metalsmithInPlace = require('metalsmith-in-place');
var metalsmithMyth = require('metalsmith-myth');
var metalsmithWatch = require('metalsmith-watch');
var myth = require('myth');
var Q = require('q');
var uglifyjs = require('uglifyjs');
var uncss = require('uncss');

var inliner = require('./lib/inliner');

const PartialsDir = 'partials';
const TempDir = 'build-stage1';
const TempIndex = `${TempDir}/index.html`;
const DestinationDir = 'build';

const UncssOptions = {
  htmlroot: `${__dirname}/${TempDir}`,
  ignoreSheets: [/\/\/fonts.googleapis.com\/.*/]
};

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

function buildTemp(options) {
  return metalsmithPromise(function(m) {
    m.source('src');
    m.destination(TempDir);

    m.use(metalsmithInPlace({ 
      engine: 'handlebars' 
    }));

    m.use(metalsmithMyth({ 
      compress: !options.live 
    }));
    
    m.use(metalsmithAnalytics(
      'UA-58690305-1', 
      { exclude:/^pinterest-.*\.html$/ }
    ));

    if (options.live) {
      m.use(metalsmithExpress());
      m.use(metalsmithWatch({
        paths: { '${source}/**/*': true },
        livereload: true
      }));
    }
    else {
      m.use(metalsmithHtmlMinifier());
    }
  });
}

function uncssPromise(files, options) {
  return Q.nfcall(uncss, files, options);
}

function uncssIndexCss() {
  return uncssPromise(
    [TempIndex],
    _.defaults(UncssOptions, {
      stylesheets: ['index.css']
    })
  );
}

function inlineIndexCss() {
  return uncssIndexCss().then(function(output) {
    var cssCompressed = myth(output[0], { compress: true });
    inliner.inlineCss(TempDir, 'index.html', 'index.css', cssCompressed);
  });
};


function buildGzipped() {
  return metalsmithPromise(m => m
    .source(TempDir)
    .destination(DestinationDir)
    .use(compress({
      gzip: {level:9}
    }))
  );
}

function hasSwitch(arg) {
  return _.includes(process.argv, `--${arg}`);
}

loadPartials();

var live = hasSwitch('live');
var promise = buildTemp({ live: live });

if (!live && hasSwitch('production')) {
  promise.then(inlineIndexCss).then(buildGzipped)
}

promise.catch(function(error) {
  throw error;
});
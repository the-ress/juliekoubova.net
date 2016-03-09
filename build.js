var _ = require('lodash');
var compress = require('metalsmith-gzip');
var fs = require('fs');
var Handlebars = require('handlebars');
var Metalsmith = require('metalsmith');
var metalsmithHtmlMinifier = require("metalsmith-html-minifier");
var metalsmithInPlace = require('metalsmith-in-place');
var metalsmithMyth = require('metalsmith-myth');
var myth = require('myth');
var Q = require('q');
var uncss = require('uncss');

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

function buildTemp() {
  return metalsmithPromise(m => m
    .source('src')
    .destination(TempDir)
    .use(metalsmithInPlace({ engine: 'handlebars' }))
    .use(metalsmithMyth({ compress: true }))
    .use(metalsmithHtmlMinifier())
  );
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

function inlineIndexCss(indexCss) {
  return uncssIndexCss().then(function(output) {
    var indexCss = myth(output, { compress: true });
    var indexHtml = fs.readFileSync(TempIndex).toString();

    indexHtml = indexHtml.replace(
      /<link[^>]+href=['"]?index.css['"]?[^>]*>/,
      '<style>' + output + '</style>'
    );

    fs.writeFileSync(TempIndex, indexHtml);
  });
};

function buildGzipped() {
  return metalsmithPromise(m => m
    .source(TempDir)
    .destination(DestinationDir)
    .use(compress())
  );
}

loadPartials();

var promise = buildTemp();

if (_.includes(process.argv, '--production')) {
  promise.then(inlineIndexCss).then(buildGzipped)
}

promise.catch(function(error){ throw error;})
var _ = require('lodash');
var compress = require('metalsmith-gzip');
var fs = require('fs');
var Handlebars = require('handlebars');
var htmlMinifier = require("metalsmith-html-minifier");
var inPlace = require('metalsmith-in-place');
var Metalsmith = require('metalsmith');
var metalsmithMyth = require('metalsmith-myth');
var myth = require('myth');
var uncss = require('uncss');

const PartialsDir = 'partials';
const TempDir = 'build-stage1';
const TempIndex = `${TempDir}/index.html`;
const DestinationDir = 'build';

const UncssOptions = {
  htmlroot: `${__dirname}/${TempDir}`,
  ignoreSheets: [/\/\/fonts.googleapis.com\/.*/]
};


function loadPartials() {
  fs.readdirSync(PartialsDir).forEach(function (file) {
    var source = `${__dirname}/${PartialsDir}/${file}`;
    var contents = fs.readFileSync(source).toString();

    Handlebars.registerPartial(file, contents);
  });
}

function buildStage1() {
  Metalsmith(__dirname)
  .source('src')
  .destination(TempDir)
  .use(inPlace({
    engine: 'handlebars'
  }))
  .use(metalsmithMyth({ compress: true }))
  .use(htmlMinifier())
  .build(function (err) {
    if (err) throw err;
    inlineIndexCss();
  });
}

function inlineIndexCss() {
  uncss(
    [TempIndex],
    _.defaults(UncssOptions, {
      stylesheets: ['index.css']
    }),
    function (error, output) {
      if (error) throw error;
      
      output = myth(output, {compress: true});
      
      var indexHtml = fs.readFileSync(TempIndex).toString();
      
      indexHtml  = indexHtml.replace(
        /<link[^>]+href=['"]?index.css['"]?[^>]*>/, 
        '<style>' + output + '</style>'
      );
      
      fs.writeFileSync(TempIndex, indexHtml);
      buildStage2();
    }
);
}

function buildStage2() {
  Metalsmith(__dirname)
    .source(TempDir)
    .destination(DestinationDir)
    .use(compress())
    .build(function (err) {
      if (err) throw err;    
    });
}

loadPartials();
buildStage1();  
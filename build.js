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
const DestinationDir = 'build';
const DestinationIndex = `${DestinationDir}/index.html`;

const UncssOptions = {
  htmlroot: `${__dirname}/${DestinationDir}`,
  ignoreSheets: [/\/\/fonts.googleapis.com\/.*/]
};

fs.readdirSync(PartialsDir).forEach(function (file) {
  var source = `${__dirname}/${PartialsDir}/${file}`;
  var contents = fs.readFileSync(source).toString();

  Handlebars.registerPartial(file, contents);
});

Metalsmith(__dirname)
  .source('src')
  .destination(DestinationDir)
  .use(inPlace({
    engine: 'handlebars'
  }))
  .use(metalsmithMyth())
  .use(htmlMinifier())
  .use(compress())
  .build(function (err) {
    if (err) throw err;
  });

uncss(
  [DestinationIndex],
  _.defaults(UncssOptions, {
    stylesheets: ['index.css']
  }),
  function (error, output) {
    if (error) throw error;
    
    output = myth(output, {compress: true});
    
    var indexHtml = fs.readFileSync(DestinationIndex).toString();
    
    indexHtml  = indexHtml.replace(
      /<link[^>]+href=['"]?index.css['"]?[^>]*>/, 
      '<style>' + output + '</style>'
    );
    
    fs.writeFileSync(DestinationIndex, indexHtml);
  }
);
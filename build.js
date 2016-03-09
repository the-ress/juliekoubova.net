var Metalsmith   = require('metalsmith');
var compress     = require('metalsmith-gzip');
var fs           = require('fs');
var Handlebars   = require('handlebars');
var htmlMinifier = require("metalsmith-html-minifier");
var inPlace      = require('metalsmith-in-place');
var myth         = require('myth');

const PartialsDir = 'partials';

fs.readdirSync(PartialsDir).forEach(function (file) {
  var source = `${__dirname}/${PartialsDir}/${file}`;
  var contents = fs.readFileSync(source).toString();
  
  if (/\.css$/.test(file)) {
    contents = myth(contents, {
      compress: true,
      source: source
    });
  }
  
  Handlebars.registerPartial(file, contents);  
});

Metalsmith(__dirname)
  .source('src')
  .destination('build')
  .use(myth({
    compress: true,
    files: '**/*.css'
  }))
  .use(inPlace({
    engine: 'handlebars'
  }))
  .use(htmlMinifier())
  .use(compress())
  .build(function(err) {
    if (err) throw err;
  });
var postcss = require('postcss');
var multimatch = require('multimatch');
var Promise = require('promise');
var path = require('path');

module.exports = main;

function main(plugins, options) {
  var plugins = plugins || [];
  var options = options || {};
  var map = normalizeMapOptions(options.map);

  var processor = postcss(plugins);

  options.pattern = options.pattern || '**/*.css';

  return function (files, metalsmith, done) {
    var styles = multimatch(Object.keys(files), options.pattern);

    if(styles.length == 0) {
      done();
      return;
    }

    var promises = [];

    styles.forEach(function (file) {
      var contents = files[file].contents.toString();
      var absolutePath = path.resolve(metalsmith.source(), file);
       
      var promise = processor
        .process(contents, {
          from: absolutePath,
          to: absolutePath,
          map: map
        })
        .then(function (result) {
          files[file].contents = new Buffer(result.css);

           if (result.map) {
             files[file + '.map'] = {
               contents: new Buffer(JSON.stringify(result.map)),
               mode: files[file].mode,
               stats: files[file].stats
             };
           }
        });

        promises.push(promise);
    });

    Promise.all(promises)
      .then(function(results) {
        done();
      })
      .catch(function(error) {
        done(new Error("Error during postcss processing: " + JSON.stringify(error)));
      });

  }
}

function normalizeMapOptions(map) {
  if (!map) return undefined;

  return {
    inline: map === true ? true : map.inline,
    prev: false, // Not implemented yet
    sourcesContent: undefined,  // Not implemented yet
    annotation: undefined // Not implemented yet
  };
}

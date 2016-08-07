const browserify = require('browserify');
const exorcist = require('exorcist');
const fs = require('fs');
const multimatch = require('multimatch');
const tmp = require('tmp');

module.exports = function (opts) {
  opts = opts || {};

  if (!opts.include) {
    throw new Error('You must specify a file for browserify to bundle.');
  }

  return function (files, metalsmith, done) {

    var included = multimatch(Object.keys(files), opts.include);
    var remaining = included.length;

    if (remaining === 0) {
      throw new Error('The pattern specified does not match any files');
    }

    var src = metalsmith.source();

    included.forEach(function (file) {
      var sourceMapPath = tmp.tmpNameSync();
      
      var stream = browserify(`${src}/${file}`, { debug: opts.debug })
        .bundle();
        
      if (opts.debug) {
        stream = stream.pipe(exorcist(sourceMapPath)); 
      }

      var chunks = [];
      stream.on('data', chunks.push.bind(chunks));
      stream.on('end', () => {
        
        files[file] = {
          contents: chunks.join('')
        };
        
        if (opts.debug) {
          files[file + '.map'] = {
            contents: fs.readFileSync(sourceMapPath)
          }          
        }

        if (--remaining === 0) {
          done();
        }
      });
    });
  };
}


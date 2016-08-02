'use strict';

const _ = require('lodash');
const crypto = require('crypto');
const fs = require('fs');
const globby = require('globby');
const multimatch = require('multimatch');
const mv = require('mv');
const path = require('path');
const Q = require('q');
const urlBase64 = require('./lib/url-base64')

const options = {
  source: path.join(__dirname, 'src'),
  destination: path.join(__dirname, 'img'),
  pattern: ['**/*.+(jpg|jpeg|gif|png)'],
  densities: [1, 2],
  sizes: [660]
};

function tryLoadJson(p) {
  return new Promise((resolve, reject) => {
    fs.readFile(p, 'utf8', (err, str) => {
      if (err) {
        resolve({});
      } else {
        resolve(JSON.parse(str));
      }
    });
  });
}

function loadImageMap() {
  return tryLoadJson(
    path.join(options.source, 'img-map.json')
  );
}

function digest(p) {
  return new Promise((resolve, reject) => {
    var hash = crypto.createHash('md5');
    var fd = fs.createReadStream(p);

    fd.on('end', () => {
      hash.setEncoding('base64');
      hash.end();

      var digest = hash.read();
      digest = urlBase64.encode(digest);      
      resolve(digest);
    });
    fd.pipe(hash);
  });
}

function loadImageMeta(p) {
  return Promise.all([
    tryLoadJson(p + '.meta.json'),
    digest(p)
  ]).then(values => _.assign(
    {
      sizes: options.sizes,
      densities: options.densities
    },
    values[0],
    {
      digest: values[1],
      pathInfo: path.parse(p),
      path: p
    }
  ));
}

function generateSizeIf(rx, sizes) {
  return i => {
    if (!rx.test(i.path)) {
      return i;
    }

    return _.assign({}, i, {
      sizes: _.uniq(_.concat(i.sizes, sizes))
    });
  }
}

function resizeImage(i, size, density) {

  var suffix = `-${size}px`;

  if (i.densities.length > 1) {
    suffix += `@${density}x`;
  }

  var newName = `${i.digest}${suffix}${i.pathInfo.ext}`
  var newSize = size * density;
  // var resized = gm(i.path).resize(newSize, newSize, '>');

  console.log(`resize ${i.path} to ${newSize} => ${newName}`);
}

var imageMap;

loadImageMap()
  .then(map => {
    imageMap = map;
    return globby(options.pattern, { cwd: options.source });
  })
  .then(paths => paths.map(p => path.join(options.source, p)))
  .then(paths => Promise.all(paths.map(loadImageMeta)))
  .then(images => images.map(generateSizeIf(/\/index\.[^.]+$/, [200])))
  .then(images => Promise.all(
    _.flatMapDeep(images, i => {
      return i.sizes.map(size => {
        return i.densities.map(density => {
          return resizeImage(i, size, density);
        });
      })
    })
  ))
  .done();


// buildImages().then(() =>
//   Q.nfcall(mv.bind(
//     this,
//     __dirname + '/img/map.json',
//     __dirname + '/src/img-map.json'
//   ))
// )
//   .done();
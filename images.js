'use strict';

const _ = require('lodash');
const crypto = require('crypto');
const fs = require('fs');
const globby = require('globby');
const gm = require('gm');
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
  sizes: [660],
  defaultSize: 660
};

function tryLoadJson(p) {
  return new Promise((resolve, reject) => {
    fs.readFile(
      p, 'utf8', 
      (err, str) => resolve(err ? {} : JSON.parse(str))
    );
  });
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
  const absPath = path.join(options.source, p);  
  return Promise.all([
    tryLoadJson(absPath + '.meta.json'),
    digest(absPath)
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

  var suffix = '';
  
  if (size != options.defaultSize) {
    suffix += `-${size}px`;
  }

  if (i.densities.length > 1 && density != 1) {
    suffix += `@${density}x`;
  }

  const newName = `${i.digest}${suffix}${i.pathInfo.ext}`
  const newSize = size * density;
  const newPath = path.join(options.destination, newName); 

  const result = {
    image: i,
    size: size,
    density: density,
    name: newName
  };

  var promise = new Promise((resolve, reject) => {
    fs.access(newPath, err => resolve(err ? false : true));
  })

  return promise.then(exists => {
    if (exists) {
      console.log(`already exists: ${i.path} to ${newSize} => ${newName}`)      
      return result;
    }

    return new Promise((resolve, reject) => {
      console.log(`resize ${i.path} to ${newSize} => ${newName}`);
      
      const absPath = path.join(options.source, i.path);
      gm(absPath).resize(newSize, newSize, '>').write(newPath, err => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });
}

function resizeAllImages(images) {
  return Promise.all(
    _.flatMapDeep(images, i => {
      return i.sizes.map(size => {
        return i.densities.map(density => {
          return resizeImage(i, size, density);
        });
      })
    })
  );
}

function createImageMap(results) {
  const imageMap = _.mapValues(
    _.groupBy(results, r => r.image.path),      
    byName => _.mapValues(
      _.groupBy(byName, 'size'),
      bySize => _.mapValues(
        _.groupBy(bySize, 'density'),
        byDensity => byDensity[0].name
      )
    )
  );
  
  return new Promise((resolve, reject) => 
    fs.writeFile(
      path.join(options.source, 'img-map.json'),
      JSON.stringify(imageMap),
      err => err ? reject(err) : resolve()
    )
  );
}

function getObsoleteImages(results) {
  return new Promise((resolve, reject) => 
    fs.readdir(options.destination,(err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(_.difference(files, _.map(results, 'name')));
      }
    })
  );
}

function removeObsoleteImages(obsolete) {
  return Promise.all(
    obsolete.map(p => new Promise((resolve, reject) => {
      const absPath = path.join(options.destination, p);
      console.log(`remove: ${absPath}`)      
      fs.unlink(absPath, err => err ? reject(err) : resolve());
    }))
  );
}

globby(options.pattern, { cwd: options.source })
  .then(paths => Promise.all(paths.map(loadImageMeta)))
  .then(images => images.map(generateSizeIf(/\/index\.[^.]+$/, [200])))
  .then(resizeAllImages)
  .then(results => Promise.all([
    createImageMap(results),
    getObsoleteImages(results).then(removeObsoleteImages)
  ]))
  .catch(console.error);
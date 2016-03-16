'use strict';

const _ = require('lodash');
const Q = require('q');

const Metalsmith = require('metalsmith');
const cssInliner = require('./lib/metalsmith-css-inliner');
const define = require('metalsmith-define');
const express = require('metalsmith-express');
const handlebarsHelpers = require('metalsmith-discover-helpers');
const handlebarsPartials = require('./lib/metalsmith-handlebars-partials');
const htmlMinifier = require('metalsmith-html-minifier');
const hyphenate = require('metalsmith-hyphenate')
const gzip = require('metalsmith-gzip');
const imagemin = require('metalsmith-imagemin')
const imageResize = require('./lib/metalsmith-image-resize');
const inPlace = require('metalsmith-in-place');
const layouts = require('metalsmith-layouts');
const metafiles = require('metalsmith-metafiles');
const myth = require('metalsmith-myth');
const paths = require('metalsmith-paths');
const srcset = require('./lib/metalsmith-srcset');
const uglify = require('metalsmith-uglify');
const uncss = require('metalsmith-uncss');
const watch = require('metalsmith-watch');

const DynamicSelectors = [
  '.js',
  '.falling-eurocrat'
];

const SiteTitle = 'Julie Koubová';
const SiteDescription = 
  'Market anarchist. Sex-positive feminist. Software gardeness. ' +
  'Enjoys photography, singing, theatre, and shooting guns.';

function mythImports() {
  var mm = require('myth');
  return myth({
    features: _.fromPairs(mm.features.map(f => [f, f == 'import']))
  });
}

function buildImages() {
  let m = new Metalsmith(__dirname);

  m.source('img');
  m.destination('src/img');
  
  m.use(define({
    screenDensity: [ 1, 2 ]
  }));
  m.use(metafiles());
  m.use(imageResize());  
  m.use(imagemin());
  
  return Q.nfcall(_.bind(m.build, m));  
}

function build(options) {
  let m = new Metalsmith(__dirname);

  m.source('src');
  m.destination('build');

  m.use(define({
    baseUrl: 'https://juliekoubova.net',
    css: '/main.css',
    date: new Date(),
    description: SiteDescription,
    fbAuthor: 'https://facebook.com/julie.e.harshaw',
    fbType: 'website',
    googleAnalyticsProperty: 'UA-58690305-1',
    lang: 'cs',
    live: options.live,
    portrait: {
     index: '/img/2015-04-192px@1x.jpeg',
     default: '/img/2015-04-32px@1x.jpeg' 
    },
    image: '/img/2015-04.jpeg',
    siteTitle: SiteTitle,
    typekitId: 'qai6bjn',
    typekitTimeout: 1250
  }));

  m.use(paths());
  
  m.use(uglify({
    output: {
      beautify: options.live,
      inline_script: true
    },
    removeOriginal: true
  }));

  m.use(handlebarsHelpers({
    directory: 'helpers'
  }));
  
  m.use(handlebarsPartials({
    root: 'partials'
  }));

  m.use(inPlace({
    engine: 'handlebars'
  }));

  m.use(layouts({
    default: 'post.html',
    engine: 'handlebars',
    pattern: 'posts/**/*.html'
  }));

  m.use(layouts({
    default: 'default.html',
    engine: 'handlebars',
    pattern: '**/*.html'
  }));
  
  m.use(hyphenate({
    useLangAttribute: true,
    ignore: [
      'google*.html',
      'pinterest-*.html'
    ]
  }));
  
  m.use(srcset());
  
  m.use(mythImports());

  // uncss main.css based on index.html into index.css
  // which will be later inlined into index.html
  m.use(uncss({
    css: ['main.css'],
    html: ['index.html'],
    output: 'index.css',
    removeOriginal: false,
    uncss: { ignore: DynamicSelectors }
  }));

  // uncss main.css based on all html files
  m.use(uncss({
    css: ['main.css'],
    output: 'main.css',
    uncss: { ignore: DynamicSelectors }
  }));

  // compress uncss output
  m.use(myth({
    compress: !options.live
  }));

  m.use(cssInliner({
    css: 'index.css',
    html: 'index.html'
  }));

  if (options.live) {
    m.use(express());
    m.use(watch({
      paths: {
        '${source}/**/*': '**/*',
        'layouts/**/*': '**/*'
      },
      livereload: true
    }));
  } else {
    m.use(htmlMinifier());

    if (options.gzip) {
      m.use(gzip({ gzip: { level: 9 } }));
    }
  }

  return Q.nfcall(_.bind(m.build, m));
}

function hasSwitch(arg) {
  return _.includes(process.argv, `--${arg}`);
}

var promise;

if (hasSwitch('images')) {
  promise = buildImages();
}
else {  
  promise = build({
    live: hasSwitch('live'),
    gzip: hasSwitch('production')
  });
}

promise.done();
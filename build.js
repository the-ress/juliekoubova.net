'use strict';

const _ = require('lodash');
const Q = require('q');

const Metalsmith = require('metalsmith');
const collections = require('metalsmith-collections');
const define = require('metalsmith-define');
const drafts = require('metalsmith-drafts');
const express = require('metalsmith-express');
const fileMetadata = require('metalsmith-filemetadata');
const gzip = require('metalsmith-gzip');
const handlebarsHelpers = require('metalsmith-discover-helpers');
const htmlMinifier = require('metalsmith-html-minifier');
const ignore = require('metalsmith-ignore');
const inPlace = require('metalsmith-in-place');
const layouts = require('metalsmith-layouts');
const markdownit = require('metalsmith-markdownit');
const markdownAbbr = require('markdown-it-abbr');
const markdownFigures = require('markdown-it-implicit-figures');
const metadata = require('metalsmith-metadata');
const moveUp = require('metalsmith-move-up');
const myth = require('metalsmith-myth');
const paths = require('metalsmith-paths');
const uglify = require('metalsmith-uglify');
const uncss = require('metalsmith-uncss');
const watch = require('metalsmith-watch');

const canonicalUrls = require('./lib/metalsmith-canonical-urls');
const extractPublished = require('./lib/metalsmith-extract-published');
const fixUpImageMap = require('./lib/metalsmith-fix-up-image-map');
const handlebarsPartials = require('./lib/metalsmith-handlebars-partials');
const inliner = require('./lib/metalsmith-inliner');
const postBanners = require('./lib/metalsmith-post-banners');
const rename = require('./lib/metalsmith-rename'); 
const srcset = require('./lib/metalsmith-srcset');

const BaseUrl = 'https://juliekoubova.net';
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

function markdown() {
   let md = markdownit({
    typographer: true,
    html: true
  });
  
  md.use(markdownAbbr);
  
  md.use(markdownFigures, {
    figcaption: true
  });
  
  return md; 
}

function build(options) {
  let m = new Metalsmith(__dirname);

  m.source('src');
  m.destination('build');

  m.use(define({
    bannerCount: 300,
    baseUrl: BaseUrl,
    css: '/main.css',
    date: new Date(),
    description: SiteDescription,
    fbAppId: '1714468662102619',
    fbAuthor: 'https://facebook.com/julie.e.harshaw',
    fbType: 'website',
    googleAnalyticsProperty: 'UA-58690305-1',
    lang: 'cs',
    live: options.live,
    portrait: {
     index: '/2015-04-192px.jpeg',
     default: '/2015-04-32px.jpeg' 
    },
    defaultImage: '/2015-04.jpeg',
    siteTitle: SiteTitle,
    title: SiteTitle,
    typekitId: 'qai6bjn',
    typekitTimeout: 1250
  }));
  
  m.use(metadata({
    imageMap: 'img/map.json'
  }));
  
  if (!options.live) {
    m.use(drafts());
  }
  
  // publish only the processed images from /img
  m.use(ignore([
    '**/*.+(jpg|jpeg|png|gif)',
    '!img/**'
  ]));
    
  m.use(markdown());

  // apply dates and turn posts into directories with an index.html
  m.use(extractPublished());
  
  // apply additional post metadata
  m.use(fileMetadata([ { 
    pattern: 'posts/**/*.html', 
    metadata: {
      fbType: 'article',
      layout: 'post.html',
      collection: 'posts'      
    } 
  } ]))
  
  m.use(moveUp('posts/**'));
  m.use(fixUpImageMap()); 
  
  m.use(paths());
  
  m.use(collections({
    posts: {
      sortBy: 'published',
      reverse: true
    }
  }));
  
  m.use(postBanners({
    collection: 'posts'
  }));
  
  // ===========================================================================
  // NO METADATA CHANGES, ONLY TEMPLATING BEYOND THIS POINT
  // ===========================================================================

  // initialize Handlebars
  m.use(handlebarsHelpers({ directory: 'helpers' }));  
  m.use(handlebarsPartials({ root: 'partials' }));
  
  m.use(inPlace({
    engine: 'handlebars',
    pattern: '**/*.hbs'
  }));
  
  m.use(rename({
    pattern: '**/*.hbs',
    rename: n => n.replace(/\.hbs$/, '')
  }));

  // apply per-page layouts
  m.use(layouts({
    engine: 'handlebars',
    pattern: '**/*.html',
  }));
  
  // change all pages to use default layout 
  m.use(fileMetadata([ {
    pattern: '**/*.html',
    metadata: {
      layout: 'default.html'
    }
  } ]));

  // apply default layout set in previous step
  m.use(layouts({
    engine: 'handlebars',
    pattern: [
      '**/*.html',
      '!google*.html',
      '!pinterest-*.html'
    ]
  }));
  
  m.use(srcset());
  
  m.use(canonicalUrls({
    baseUrl: BaseUrl
  }));
  
  m.use(mythImports());

  // uncss main.css based on index.html into index.css
  // which will be later inlined into index.html
  m.use(uncss({
    css: ['main.css'],
    html: ['index.html'],
    output: 'index.css',
    removeOriginal: false
  }));

  // uncss main.css based on all html files
  m.use(uncss({
    css: ['main.css'],
    output: 'main.css'
  }));

  // compress uncss output
  m.use(myth({
    compress: !options.live
  }));

  // uglify javascripts -> .min.js
  m.use(uglify({
    output: {
      beautify: options.live,
      inline_script: true
    },
    removeOriginal: !options.live
  }));

  // ===========================================================================
  // INLINE CSS AND JS
  // ===========================================================================
  
  m.use(inliner({
    css: 'index.css',
    html: 'index.html'
  }));
  
  m.use(inliner({
    js: [ 
      'js/inline.min.js',
      'js/hero.min.js'
    ],
    html: '**/*.html'
  }));
  
  if (!options.live) {
    m.use(htmlMinifier());
  }

  if (options.live || options.server) {
    m.use(express());
  }
  
  if (options.live) {
    m.use(watch({
      paths: {
        '${source}/**/*': '**/*',
        'layouts/**/*': '**/*'
      },
      livereload: true
    }));
  } else if (options.gzip) {
    m.use(gzip({ 
      gzip: { level: 9 } 
    }));
  }

  return Q.nfcall(_.bind(m.build, m));
}

function hasSwitch(arg) {
  return _.includes(process.argv, `--${arg}`);
}

var options = {
  gzip: hasSwitch('production'),
  live: hasSwitch('live'),
  server: hasSwitch('server')
};

build(options).done();
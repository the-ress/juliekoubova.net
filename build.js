'use strict';

const _ = require('lodash');
const Q = require('q');

const Metalsmith = require('metalsmith');
const cssInliner = require('./lib/metalsmith-css-inliner');
const define = require('metalsmith-define');
const drafts = require('metalsmith-drafts');
const express = require('metalsmith-express');
const gzip = require('metalsmith-gzip');
const handlebarsHelpers = require('metalsmith-discover-helpers');
const handlebarsPartials = require('./lib/metalsmith-handlebars-partials');
const htmlMinifier = require('metalsmith-html-minifier');
const inPlace = require('metalsmith-in-place');
const layouts = require('metalsmith-layouts');
const markdownit = require('metalsmith-markdownit');
const markdownAbbr = require('markdown-it-abbr');
const markdownFigures = require('markdown-it-implicit-figures');
const moveUp = require('metalsmith-move-up');
const myth = require('metalsmith-myth');
const paths = require('metalsmith-paths');
const postMetadata = require('./lib/metalsmith-post-metadata');
const srcset = require('./lib/metalsmith-srcset');
const uglify = require('metalsmith-uglify');
const uncss = require('metalsmith-uncss');
const watch = require('metalsmith-watch');

const DynamicSelectors = [
  '.js',
  '.falling-eurocrat',
  '.bg-hero'
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
    defaultImage: '/img/2015-04.jpeg',
    siteTitle: SiteTitle,
    typekitId: 'qai6bjn',
    typekitTimeout: 1250
  }));
  
  if (!options.live) {
    m.use(drafts());
  }
  
  m.use(uglify({
    output: {
      beautify: options.live,
      inline_script: true
    },
    removeOriginal: !options.live
  }));

  m.use(markdown());

  //
  // initialize Handlebars
  //
   
  m.use(handlebarsHelpers({
    directory: 'helpers'
  }));
  
  m.use(handlebarsPartials({
    root: 'partials'
  }));

  m.use(postMetadata());
  
  m.use(layouts({
    engine: 'handlebars',
    pattern: 'posts/**/*.html',
    default: 'post.html'
  }));
  
  m.use(moveUp('posts/**'));
  
  m.use(paths());

  m.use(inPlace({
    engine: 'handlebars'
  }));

  m.use(layouts({
    default: 'default.html',
    engine: 'handlebars',
    pattern: [
      '**/*.html',
      '!google*.html',
      '!pinterest-*.html'
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

var options = {
  live: hasSwitch('live'),
  gzip: hasSwitch('production')
};

build(options).done();
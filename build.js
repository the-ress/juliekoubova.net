'use strict';

const _ = require('lodash');
const Q = require('q');

const Metalsmith = require('metalsmith');
const cleanCss = require('metalsmith-clean-css');
const collections = require('metalsmith-collections');
const concat = require('metalsmith-concat');
const define = require('metalsmith-define');
const express = require('metalsmith-express');
const fileMetadata = require('metalsmith-filemetadata');
const gzip = require('metalsmith-gzip');
const handlebarsHelpers = require('metalsmith-discover-helpers');
const htmlMinifier = require('metalsmith-html-minifier');
const hyphenate = require('metalsmith-hyphenate');
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
const publish = require('metalsmith-publish');
const staticAssets = require('metalsmith-static');
const uglify = require('metalsmith-uglify');
const uncss = require('metalsmith-uncss');
const watch = require('metalsmith-watch');

const cacheBust = require('./lib/metalsmith-cachebust');
const canonicalUrls = require('./lib/metalsmith-canonical-urls');
const extractPublished = require('./lib/metalsmith-extract-published');
const feed = require('./lib/metalsmith-feed');
const handlebarsPartials = require('./lib/metalsmith-handlebars-partials');
const inliner = require('./lib/metalsmith-inliner');
const moveUpImageMap = require('./lib/metalsmith-move-up-image-map');
const postBanners = require('./lib/metalsmith-post-banners');
const rename = require('./lib/metalsmith-rename');
const srcset = require('./lib/metalsmith-srcset');

const BaseUrl = 'https://juliekoubova.net';
const SiteTitle = 'Julie Koubová';
const SiteDescription =
  'Market anarchist. Sex-positive feminist. Software gardeness. ' +
  'Enjoys photography, singing, theatre, and shooting guns.';

const ConcatConfig = {
  'js/post-combined.js': [
    'js/headroom.js',
    'js/post.js'
  ]
};

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
    siteTitlePrintSuffix: '.net',
    twitterSite: '@julieeharshaw',
    title: SiteTitle,
    typekitId: 'qai6bjn',
    typekitTimeout: 1250
  }));

  m.use(metadata({
    imageMap: 'img-map.json'
  }));
  
  m.use(ignore([
    // ignore hidden files
    '**/.*',
    
    // ignore image etc. metadata
    '**/*.meta.json',
    
    // publish only the processed images
    '**/*.+(jpg|jpeg|png|gif)'
  ]));

  m.use(markdown());

  // apply post metadata
  m.use(fileMetadata([{
    pattern: 'posts/**/*.html',
    metadata: {
      fbType: 'article',
      layout: 'post.html',
      collection: 'posts'
    }
  }]));

  // extract dates, turn posts into directories with an index.html, 
  m.use(extractPublished());

  // and move them to root
  m.use(moveUp('posts/**'));
  m.use(moveUpImageMap('posts/**'));

  // no moving files beyond this point
  m.use(paths());

  // exclude drafts and scheduled posts unless live
  // needs to run before collections()
  m.use(publish({
    future: true,
    futureMeta: 'published'
  }));

  m.use(collections({
    posts: {
      sortBy: 'published',
      reverse: true
    }
  }));

  // generate per-post banners
  m.use(postBanners({
    collection: 'posts'
  }));

  // ===========================================================================
  // NO METADATA CHANGES, ONLY TEMPLATING BEYOND THIS POINT
  // ===========================================================================

  // RSS 
  m.use(feed({
    collection: 'posts',
    limit: false,
    siteUrl: BaseUrl,
    siteTitle: SiteTitle,
    siteDescription: SiteDescription,
    generator: BaseUrl 
  }));

  // initialize Handlebars
  m.use(handlebarsHelpers({ directory: 'helpers' }));
  m.use(handlebarsPartials({ directory: 'partials' }));

  m.use(inPlace({
    engine: 'handlebars',
    pattern: '**/*.hbs'
  }));

  // strip the .hbs extension. inPlace({rename:true}) always renames to .html
  // but we use Handlebars to template javascripts, too
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
  m.use(fileMetadata([{
    pattern: '**/*.html',
    metadata: {
      layout: 'default.html'
    }
  }]));

  // apply default layout set in previous step
  m.use(layouts({
    engine: 'handlebars',
    pattern: [
      '**/*.html',
      '!google*.html',
      '!pinterest-*.html'
    ]
  }));
  
  m.use(hyphenate({
    useLangAttribute: true
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
    removeOriginal: false,
    uncss: {
      ignore: [
        '.falling-eurocrat'
      ]
    }
  }));

  // uncss main.css based on remaining html files
  m.use(uncss({
    css: ['main.css'],
    html: [ '**/*.html', '!index.html' ],
    output: 'main.css',
    uncss: {
      ignore: [
        '.headroom',
        '.headroom h1',
        '.headroom header',
        '.headroom--pinned',
        '.headroom--pinned.headroom--not-top',
        '.headroom--unpinned',
        '.headroom--top'
      ]
    }
  }));

  // compress uncss output
  m.use(myth({
    compress: !options.live
  }));

  m.use(cleanCss());

  // ===========================================================================
  // INLINE AND COMBINE CSS AND JS
  // ===========================================================================

  Object.keys(ConcatConfig).forEach(output => {
    m.use(concat({
      output: output,
      files: ConcatConfig[output],
      keepConcatenated: false
    }));
  });

  // uglify javascripts -> .min.js
  m.use(uglify({
    compress: options.live ? false : undefined,
    output: {
      beautify: options.live
    },
    removeOriginal: true
  }));

  m.use(inliner({
    delete: true,
    css: 'index.css',
    html: 'index.html'
  }));

  m.use(inliner({
    js: 'js/inline.min.js',
    html: '**/*.html',
    delete: true
  }));
  
  m.use(cacheBust({
    pattern: [
      '**/*.+(css|js)',
      '!js/html5shiv-printshiv.min.js'
    ]
  }));

  if (!options.live) {
    m.use(htmlMinifier("*.html", {
      minifyJS: {
        compress: options.live ? false : undefined,
        output: {
          beautify: options.live
        }
      }
    }));
  }

  m.use(staticAssets({
    src: 'img',
    dest: 'img'
  }));

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
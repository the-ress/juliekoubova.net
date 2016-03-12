'use strict';

const _ = require('lodash');
const Q = require('q');

const Metalsmith = require('metalsmith');
const analytics = require('./lib/metalsmith-analytics');
const cssInliner = require('./lib/metalsmith-css-inliner');
const define = require('metalsmith-define');
const express = require('metalsmith-express');
const handlebarsPartials = require('./lib/metalsmith-handlebars-partials');
const gzip = require('metalsmith-gzip');
const htmlMinifier = require("metalsmith-html-minifier");
const inPlace = require('metalsmith-in-place');
const layouts = require('metalsmith-layouts');
const myth = require('metalsmith-myth');
const uncss = require('metalsmith-uncss');
const watch = require('metalsmith-watch');

const UncssOptions = {
  ignoreSheets: [/\/\/fonts\.googleapis\.com\//]
};

function build(options) {
  let m = new Metalsmith(__dirname);

  m.source('src');
  m.destination('build');

  m.use(define({
    css: '/main.css',
    description:
      'Market anarchist. Sex-positive feminist. Software gardeness.' +
      'Enjoys photography, singing, theatre, and shooting guns.',
    title: 'Julie Koubová'
  }));

  m.use(handlebarsPartials({
    root: 'partials'
  }));

  m.use(inPlace({
    engine: 'handlebars'
  }));

  m.use(layouts({
    default: 'default.html',
    engine: 'handlebars',
    pattern: '**/*.html'
  }));

  // first, process all the @import rules
  m.use(myth());

  m.use(analytics(
    'UA-58690305-1',
    { exclude: /^pinterest-.*\.html$/ }
  ));

  // uncss main.css based on index.html into index.css
  // which will be later inlined into index.html
  m.use(uncss({
    css: ['main.css'],
    html: ['index.html'],
    output: 'index.css',
    removeOriginal: false,
    uncss: UncssOptions
  }));

  // uncss main.css based on all html files
  m.use(uncss({
    css: ['main.css'],
    output: 'main.css',
    uncss: UncssOptions
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
      paths: { '${source}/**/*': true },
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

build({
  live: hasSwitch('live'),
  gzip: hasSwitch('production')
})
  .done();
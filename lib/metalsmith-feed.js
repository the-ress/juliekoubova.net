'use strict';

const RSS = require('rss');
const extend = require('lodash').extend;
const url = require('url');

module.exports = function(options) {
  options = options || {};

  if (!options.collection) {
    throw new Error('collection is required');
  }

  if (!options.siteUrl) {
    throw new Error('siteUrl is required');
  }

  if (options.limit === undefined) {
    options.limit = 20;
  }

  options.destination = options.destination || 'rss.xml';

  options.postDate = options.postDate || (file => {
    return file.published || file.date;
  });

  options.postDescription = options.postDescription || (file => {
    return file.description || file.less || file.excerpt || file.contents;
  });

  options.postCustomElements = options.postCustomElements;

  return (files, metalsmith, done) => {
    var metadata = metalsmith.metadata();

    if (!metadata.collections) {
      throw new Error('no collections configured - see metalsmith-collections');
    }

    var collection = metadata.collections[options.collection];
    if (options.limit) {
      collection = collection.slice(0, options.limit);
    }

    var feedOptions = {
      title: options.siteTitle,
      description: options.siteDescription,
      site_url: options.siteUrl,
      image_url: options.siteImage,
      generator: options.generator || 'metalsmith',
      feed_url: url.resolve(options.siteUrl, options.destination)
    };

    var feed = new RSS(feedOptions);

    collection.forEach(file => {

      var itemData = extend({}, file, {
        date: options.postDate(file),
        description: options.postDescription(file)
      });

      if (options.postCustomElements) {
        itemData.custom_elements = options.postCustomElements(file);
      }

      if (!itemData.url && itemData.path) {
        if (itemData.path.href) {
          itemData.url = url.resolve(options.siteUrl, file.path.href);
        } else {
          itemData.url = url.resolve(options.siteUrl, file.path);
        }
      }

      feed.item(itemData);
    });

    files[options.destination] = {
      contents: new Buffer(feed.xml(), 'utf8')
    };

    done();
  };
};

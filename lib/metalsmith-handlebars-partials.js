'use strict';

var _ = require('lodash');
var Handlebars = require('handlebars');

module.exports = function metalsmithHandlebarsPartials(options) {

  if (!options) throw new Error('options required');
  if (!options.directory) throw new Error('options.directory required');

  if (options.delete === undefined) options.delete = true;

  var nameRegExp = 
    new RegExp(`^${_.escapeRegExp(options.directory)}/(.*)$`, 'i');

  return function metalsmithHandlebarsPartials(files, metalsmith, done) {
    _(Object.keys(files))
      .map(name => nameRegExp.exec(name))
      .filter()
      .forEach(function(match) {
        var name = match[0];
        
        Handlebars.registerPartial(match[1], files[name].contents.toString());
        
        if (options.delete) {
          delete files[name];
        }
      });
    done();
  };
};

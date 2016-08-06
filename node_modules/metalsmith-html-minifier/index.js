"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var defaults = require("lodash.defaultsdeep");
var minify = require("html-minifier").minify;
var minimatch = require("minimatch");

module.exports = function htmlMinifier(pattern) {
	var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	/* allow the first argument to be options */
	var options = opts;
	var patternDefault = "*.html";
	if (_typeof(arguments[0]) === "object") {
		options = arguments[0];
		options.pattern = options.pattern || patternDefault;
	} else {
		options.pattern = pattern || patternDefault;
	}

	defaults(options, {
		// See the README explainations of each of these options
		"collapseBooleanAttributes": true,
		"collapseWhitespace": true,
		"removeAttributeQuotes": true,
		"removeComments": true,
		"removeEmptyAttributes": true,
		"removeRedundantAttributes": true
	});
	return function plugin(files, metalsmith, done) {
		try {
			Object.keys(files).filter(minimatch.filter(options.pattern, {
				"matchBase": true
			})).forEach(function (file) {
				var data = files[file];
				var contents = data.contents.toString();
				var minified = minify(contents, options);
				data.contents = new Buffer(minified, "utf8");
			});
			done();
		} catch (e) {
			done(e);
		}
	};
};


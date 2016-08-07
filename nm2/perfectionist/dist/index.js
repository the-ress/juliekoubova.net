'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _commentRegex = require('comment-regex');

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _defined = require('defined');

var _defined2 = _interopRequireDefault(_defined);

var _deeplyNested = require('./deeplyNested');

var _deeplyNested2 = _interopRequireDefault(_deeplyNested);

var _getIndent = require('./getIndent');

var _getIndent2 = _interopRequireDefault(_getIndent);

var _longest = require('./longest');

var _longest2 = _interopRequireDefault(_longest);

var _maxSelectorLength = require('./maxSelectorLength');

var _prefixedDecls = require('./prefixedDecls');

var _prefixedDecls2 = _interopRequireDefault(_prefixedDecls);

var _space = require('./space');

var _space2 = _interopRequireDefault(_space);

var _sameLine = require('./sameLine');

var _sameLine2 = _interopRequireDefault(_sameLine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var unprefix = _postcss2.default.vendor.unprefixed;

function isSassVariable(decl) {
    return decl.parent.type === 'root' && decl.prop.match(/^\$/);
}

function blank(value) {
    return (0, _defined2.default)(value, '');
}

function applyCompressed(css) {
    css.walk(function (rule) {
        rule.raws.semicolon = false;
        if (rule.type === 'comment' && rule.raws.inline) {
            rule.raws.inline = null;
        }
        if (rule.type === 'rule' || rule.type === 'atrule') {
            rule.raws.between = rule.raws.after = '';
        }
        if (rule.type === 'decl' && !(0, _commentRegex.block)().test(rule.raws.between)) {
            rule.raws.between = ':';
        }
        if (rule.type === 'decl') {
            if (rule.raws.value) {
                rule.value = rule.raws.value.raw.trim();
            }
            // Format sass variable `$size: 30em;`
            if (isSassVariable(rule)) {
                rule.raws.before = '';
                rule.raws.between = ':';
                rule.value = rule.value.trim().replace(/\s+/g, ' ');
            }

            // Remove spaces before commas and keep only one space after.
            rule.value = rule.value.replace(/(\s+)?,(\s)*/g, ',');
            rule.value = rule.value.replace(/\(\s*/g, '(');
            rule.value = rule.value.replace(/\s*\)/g, ')');

            // Format `!important`
            if (rule.important) {
                rule.raws.important = '!important';
            }

            // Format `!default`, `!global` and more similar values.
            if (rule.value.match(/\s*!\s*(\w+)\s*$/i) !== null) {
                rule.value = rule.value.replace(/\s*!\s*(\w+)\s*$/i, '!$1');
            }

            if (rule.raws.value) {
                rule.raws.value.raw = rule.value;
            }
        }
    });
    // Remove final newline
    css.raws.after = '';
}

function applyCompact(css, opts) {
    css.walk(function (rule) {
        if (rule.type === 'decl') {
            if (rule.raws.value) {
                rule.value = rule.raws.value.raw.trim();
            }
            // Format sass variable `$size: 30em;`
            if (isSassVariable(rule)) {
                rule.raws.before = '';
                rule.raws.between = ': ';
                rule.value = rule.value.trim().replace(/\s+/g, ' ');
            }

            // Remove spaces before commas and keep only one space after.
            rule.value = rule.value.replace(/(\s*,\s*)(?=(?:[^"']|['"][^"']*["'])*$)/g, ', ');
            rule.value = rule.value.replace(/\(\s*/g, '( ');
            rule.value = rule.value.replace(/\s*\)/g, ' )');
            // Remove space after comma in data-uri
            rule.value = rule.value.replace(/(data:([a-z]+\/[a-z0-9\-\+]+(;[a-z\-]+\=[a-z0-9\-]+)?)?(;base64)?,)\s+/g, '$1');

            // Format `!important`
            if (rule.important) {
                rule.raws.important = " !important";
            }

            // Format `!default`, `!global` and more similar values.
            if (rule.value.match(/\s*!\s*(\w+)\s*$/i) !== null) {
                rule.value = rule.value.replace(/\s*!\s*(\w+)\s*$/i, ' !$1');
            }

            if (rule.raws.value) {
                rule.raws.value.raw = rule.value;
            }
        }
        opts.indentSize = 1;
        if (rule.type === 'comment') {
            if (rule.raws.inline) {
                rule.raws.inline = null;
            }
            var prev = rule.prev();
            if (prev && prev.type === 'decl') {
                rule.raws.before = ' ' + blank(rule.raws.before);
            }
            if (rule.parent && rule.parent.type === 'root') {
                var next = rule.next();
                if (next) {
                    next.raws.before = '\n';
                }
                if (rule !== css.first) {
                    rule.raws.before = '\n';
                }
            }
            return;
        }
        var indent = (0, _getIndent2.default)(rule, opts.indentSize);
        var deep = (0, _deeplyNested2.default)(rule);
        if (rule.type === 'rule' || rule.type === 'atrule') {
            if (!rule.nodes) {
                rule.raws.between = '';
            } else {
                rule.raws.between = ' ';
            }
            rule.raws.after = ' ';
            rule.raws.before = indent + blank(rule.raws.before);
            rule.raws.semicolon = true;
        }
        if (rule.raws.selector && rule.raws.selector.raw) {
            rule.selector = rule.raws.selector.raw;
        }
        (0, _maxSelectorLength.maxSelectorLength)(rule, opts);
        if (rule.type === 'decl') {
            if ((0, _deeplyNested2.default)(rule.parent)) {
                var newline = rule === css.first ? '' : '\n';
                rule.raws.before = newline + indent + blank(rule.raws.before);
            } else {
                rule.raws.before = ' ' + blank(rule.raws.before);
            }
            if (!(0, _commentRegex.block)().test(rule.raws.between)) {
                rule.raws.between = ': ';
            }
        }
        if ((deep || rule.nodes) && rule !== css.first) {
            rule.raws.before = '\n ';
        }
        if (deep) {
            rule.raws.after = '\n' + indent;
        }
        if (rule.parent && rule !== rule.parent.first && (rule.type === 'rule' || rule.type === 'atrule')) {
            rule.raws.before = '\n' + indent;
        }
    });
    css.raws.after = '\n';
}

function applyExpanded(css, opts) {
    css.walk(function (rule) {
        if (rule.type === 'decl') {
            if (rule.raws.value) {
                rule.value = rule.raws.value.raw.trim();
            }
            // Format sass variable `$size: 30em;`
            if (isSassVariable(rule)) {
                if (rule !== css.first) {
                    rule.raws.before = '\n';
                }
                rule.raws.between = ': ';
            }

            rule.value = rule.value.trim().replace(/\s+/g, ' ');
            // Remove spaces before commas and keep only one space after.
            rule.value = rule.value.replace(/(\s*,\s*)(?=(?:[^"']|['"][^"']*["'])*$)/g, ', ');
            rule.value = rule.value.replace(/\(\s*/g, '(');
            rule.value = rule.value.replace(/\s*\)/g, ')');
            // Remove space after comma in data-uri
            rule.value = rule.value.replace(/(data:([a-z]+\/[a-z0-9\-\+]+(;[a-z\-]+\=[a-z0-9\-]+)?)?(;base64)?,)\s+/g, '$1');

            // Format `!important`
            if (rule.important) {
                rule.raws.important = " !important";
            }

            // Format `!default`, `!global` and more similar values.
            if (rule.value.match(/\s*!\s*(\w+)\s*$/i) !== null) {
                rule.value = rule.value.replace(/\s*!\s*(\w+)\s*$/i, ' !$1');
            }

            if (rule.raws.value) {
                rule.raws.value.raw = rule.value;
            }
        }
        var indent = (0, _getIndent2.default)(rule, opts.indentSize);
        if (rule.type === 'comment') {
            var prev = rule.prev();
            if (prev && prev.type === 'decl') {
                if ((0, _sameLine2.default)(prev, rule)) {
                    rule.raws.before = ' ' + blank(rule.raws.before);
                } else {
                    rule.raws.before = '\n' + indent + blank(rule.raws.before);
                }
            }
            if (!prev && rule !== css.first) {
                rule.raws.before = '\n' + indent + blank(rule.raws.before);
            }
            if (rule.parent && rule.parent.type === 'root') {
                var next = rule.next();
                if (next) {
                    next.raws.before = '\n\n';
                }
                if (rule !== css.first) {
                    rule.raws.before = '\n\n';
                }
            }
            return;
        }
        rule.raws.before = indent + blank(rule.raws.before);
        if (rule.type === 'rule' || rule.type === 'atrule') {
            if (!rule.nodes) {
                rule.raws.between = '';
            } else {
                rule.raws.between = ' ';
            }
            rule.raws.semicolon = true;
            if (rule.nodes) {
                rule.raws.after = '\n';
            }
        }
        // visual cascade of vendor prefixed properties
        if (opts.cascade && rule.type === 'rule' && rule.nodes.length > 1) {
            (function () {
                var props = [];
                var prefixed = (0, _prefixedDecls2.default)(rule).sort(_longest2.default).filter(function (_ref) {
                    var prop = _ref.prop;

                    var base = unprefix(prop);
                    if (!~props.indexOf(base)) {
                        return props.push(base);
                    }
                    return false;
                });
                prefixed.forEach(function (prefix) {
                    var base = unprefix(prefix.prop);
                    var vendor = prefix.prop.replace(base, '').length;
                    rule.nodes.filter(function (_ref2) {
                        var prop = _ref2.prop;
                        return prop && ~prop.indexOf(base);
                    }).forEach(function (decl) {
                        var thisVendor = decl.prop.replace(base, '').length;
                        var extraSpace = vendor - thisVendor;
                        if (extraSpace > 0) {
                            decl.raws.before = (0, _space2.default)(extraSpace) + blank(decl.raws.before);
                        }
                    });
                });
            })();
        }
        if (rule.raws.selector && rule.raws.selector.raw) {
            rule.selector = rule.raws.selector.raw;
        }
        (0, _maxSelectorLength.maxSelectorLength)(rule, opts);
        if (rule.type === 'atrule') {
            if (rule.params) {
                rule.raws.afterName = ' ';
            }
            (0, _maxSelectorLength.maxAtRuleLength)(rule, opts);
        }
        if (rule.type === 'decl') {
            if (!(0, _commentRegex.block)().test(rule.raws.between)) {
                rule.raws.between = ': ';
            }
            (0, _maxSelectorLength.maxValueLength)(rule, opts);
        }
        if (rule.parent && rule.parent.type !== 'root') {
            rule.raws.before = '\n' + blank(rule.raws.before);
            rule.raws.after = '\n' + indent;
        }
        if (rule.parent && rule !== rule.parent.first && (rule.type === 'rule' || rule.type === 'atrule')) {
            if (rule.type === 'atrule' && !rule.nodes) {
                rule.raws.before = '\n' + indent;
                return;
            }
            rule.raws.before = '\n\n' + indent;
        }
    });
    css.raws.after = '\n';
}

var perfectionist = _postcss2.default.plugin('perfectionist', function (opts) {
    opts = _extends({
        format: 'expanded',
        indentSize: 4,
        maxAtRuleLength: 80,
        maxSelectorLength: 80,
        maxValueLength: 80,
        cascade: true
    }, opts);
    return function (css) {
        css.walk(function (node) {
            if (node.raws.before) {
                node.raws.before = node.raws.before.replace(/[;\s]/g, '');
            }
        });
        switch (opts.format) {
            case 'compact':
                applyCompact(css, opts);
                break;
            case 'compressed':
                applyCompressed(css);
                break;
            case 'expanded':
            default:
                applyExpanded(css, opts);
                break;
        }
    };
});

perfectionist.process = function (css) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    opts.map = opts.map || (opts.sourcemap ? true : null);
    if (opts.syntax === 'scss') {
        opts.syntax = require('postcss-scss');
    }
    var processor = (0, _postcss2.default)([perfectionist(opts)]);
    return processor.process(css, opts);
};

exports.default = perfectionist;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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SSxpQkFBUztBQU5iLE9BT08sSUFQUDtBQVNBLFdBQU8sZUFBTztBQUNWLFlBQUksSUFBSixDQUFTLGdCQUFRO0FBQ2IsZ0JBQUksS0FBSyxJQUFMLENBQVUsTUFBZCxFQUFzQjtBQUNsQixxQkFBSyxJQUFMLENBQVUsTUFBVixHQUFtQixLQUFLLElBQUwsQ0FBVSxNQUFWLENBQWlCLE9BQWpCLENBQXlCLFFBQXpCLEVBQW1DLEVBQW5DLENBQW5CO0FBQ0g7QUFDSixTQUpEO0FBS0EsZ0JBQVEsS0FBSyxNQUFiO0FBQ0EsaUJBQUssU0FBTDtBQUNJLDZCQUFhLEdBQWIsRUFBa0IsSUFBbEI7QUFDQTtBQUNKLGlCQUFLLFlBQUw7QUFDSSxnQ0FBZ0IsR0FBaEI7QUFDQTtBQUNKLGlCQUFLLFVBQUw7QUFDQTtBQUNJLDhCQUFjLEdBQWQsRUFBbUIsSUFBbkI7QUFDQTtBQVZKO0FBWUgsS0FsQkQ7QUFtQkgsQ0E3QnFCLENBQXRCOztBQStCQSxjQUFjLE9BQWQsR0FBd0IsVUFBQyxHQUFELEVBQW9CO0FBQUEsUUFBZCxJQUFjLHlEQUFQLEVBQU87O0FBQ3hDLFNBQUssR0FBTCxHQUFXLEtBQUssR0FBTCxLQUFhLEtBQUssU0FBTCxHQUFpQixJQUFqQixHQUF3QixJQUFyQyxDQUFYO0FBQ0EsUUFBSSxLQUFLLE1BQUwsS0FBZ0IsTUFBcEIsRUFBNEI7QUFDeEIsYUFBSyxNQUFMLEdBQWMsUUFBUSxjQUFSLENBQWQ7QUFDSDtBQUNELFFBQUksWUFBWSx1QkFBUSxDQUFFLGNBQWMsSUFBZCxDQUFGLENBQVIsQ0FBaEI7QUFDQSxXQUFPLFVBQVUsT0FBVixDQUFrQixHQUFsQixFQUF1QixJQUF2QixDQUFQO0FBQ0gsQ0FQRDs7a0JBU2UsYSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7YmxvY2sgYXMgY29tbWVudFJlZ2V4fSBmcm9tICdjb21tZW50LXJlZ2V4JztcbmltcG9ydCBwb3N0Y3NzIGZyb20gJ3Bvc3Rjc3MnO1xuaW1wb3J0IGRlZmluZWQgZnJvbSAnZGVmaW5lZCc7XG5pbXBvcnQgZGVlcGx5TmVzdGVkIGZyb20gJy4vZGVlcGx5TmVzdGVkJztcbmltcG9ydCBnZXRJbmRlbnQgZnJvbSAnLi9nZXRJbmRlbnQnO1xuaW1wb3J0IGxvbmdlc3QgZnJvbSAnLi9sb25nZXN0JztcbmltcG9ydCB7bWF4QXRSdWxlTGVuZ3RoLCBtYXhTZWxlY3Rvckxlbmd0aCwgbWF4VmFsdWVMZW5ndGh9IGZyb20gJy4vbWF4U2VsZWN0b3JMZW5ndGgnO1xuaW1wb3J0IHByZWZpeGVkRGVjbHMgZnJvbSAnLi9wcmVmaXhlZERlY2xzJztcbmltcG9ydCBzcGFjZSBmcm9tICcuL3NwYWNlJztcbmltcG9ydCBzYW1lTGluZSBmcm9tICcuL3NhbWVMaW5lJztcblxubGV0IHVucHJlZml4ID0gcG9zdGNzcy52ZW5kb3IudW5wcmVmaXhlZDtcblxuZnVuY3Rpb24gaXNTYXNzVmFyaWFibGUgKGRlY2wpIHtcbiAgICByZXR1cm4gZGVjbC5wYXJlbnQudHlwZSA9PT0gJ3Jvb3QnICYmIGRlY2wucHJvcC5tYXRjaCgvXlxcJC8pO1xufVxuXG5mdW5jdGlvbiBibGFuayAodmFsdWUpIHtcbiAgICByZXR1cm4gZGVmaW5lZCh2YWx1ZSwgJycpO1xufVxuXG5mdW5jdGlvbiBhcHBseUNvbXByZXNzZWQgKGNzcykge1xuICAgIGNzcy53YWxrKHJ1bGUgPT4ge1xuICAgICAgICBydWxlLnJhd3Muc2VtaWNvbG9uID0gZmFsc2U7XG4gICAgICAgIGlmIChydWxlLnR5cGUgPT09ICdjb21tZW50JyAmJiBydWxlLnJhd3MuaW5saW5lKSB7XG4gICAgICAgICAgICBydWxlLnJhd3MuaW5saW5lID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocnVsZS50eXBlID09PSAncnVsZScgfHwgcnVsZS50eXBlID09PSAnYXRydWxlJykge1xuICAgICAgICAgICAgcnVsZS5yYXdzLmJldHdlZW4gPSBydWxlLnJhd3MuYWZ0ZXIgPSAnJztcbiAgICAgICAgfVxuICAgICAgICBpZiAocnVsZS50eXBlID09PSAnZGVjbCcgJiYgIWNvbW1lbnRSZWdleCgpLnRlc3QocnVsZS5yYXdzLmJldHdlZW4pKSB7XG4gICAgICAgICAgICBydWxlLnJhd3MuYmV0d2VlbiA9ICc6JztcbiAgICAgICAgfVxuICAgICAgICBpZiAocnVsZS50eXBlID09PSAnZGVjbCcpIHtcbiAgICAgICAgICAgIGlmIChydWxlLnJhd3MudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBydWxlLnZhbHVlID0gcnVsZS5yYXdzLnZhbHVlLnJhdy50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBGb3JtYXQgc2FzcyB2YXJpYWJsZSBgJHNpemU6IDMwZW07YFxuICAgICAgICAgICAgaWYgKGlzU2Fzc1ZhcmlhYmxlKHJ1bGUpKSB7XG4gICAgICAgICAgICAgICAgcnVsZS5yYXdzLmJlZm9yZSA9ICcnO1xuICAgICAgICAgICAgICAgIHJ1bGUucmF3cy5iZXR3ZWVuID0gJzonO1xuICAgICAgICAgICAgICAgIHJ1bGUudmFsdWUgPSBydWxlLnZhbHVlLnRyaW0oKS5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSBzcGFjZXMgYmVmb3JlIGNvbW1hcyBhbmQga2VlcCBvbmx5IG9uZSBzcGFjZSBhZnRlci5cbiAgICAgICAgICAgIHJ1bGUudmFsdWUgPSBydWxlLnZhbHVlLnJlcGxhY2UoLyhcXHMrKT8sKFxccykqL2csICcsJyk7XG4gICAgICAgICAgICBydWxlLnZhbHVlID0gcnVsZS52YWx1ZS5yZXBsYWNlKC9cXChcXHMqL2csICcoJyk7XG4gICAgICAgICAgICBydWxlLnZhbHVlID0gcnVsZS52YWx1ZS5yZXBsYWNlKC9cXHMqXFwpL2csICcpJyk7XG5cblxuICAgICAgICAgICAgLy8gRm9ybWF0IGAhaW1wb3J0YW50YFxuICAgICAgICAgICAgaWYgKHJ1bGUuaW1wb3J0YW50KSB7XG4gICAgICAgICAgICAgICAgcnVsZS5yYXdzLmltcG9ydGFudCA9ICchaW1wb3J0YW50JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRm9ybWF0IGAhZGVmYXVsdGAsIGAhZ2xvYmFsYCBhbmQgbW9yZSBzaW1pbGFyIHZhbHVlcy5cbiAgICAgICAgICAgIGlmIChydWxlLnZhbHVlLm1hdGNoKC9cXHMqIVxccyooXFx3KylcXHMqJC9pKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJ1bGUudmFsdWUgPSBydWxlLnZhbHVlLnJlcGxhY2UoL1xccyohXFxzKihcXHcrKVxccyokL2ksICchJDEnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJ1bGUucmF3cy52YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJ1bGUucmF3cy52YWx1ZS5yYXcgPSBydWxlLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgLy8gUmVtb3ZlIGZpbmFsIG5ld2xpbmVcbiAgICBjc3MucmF3cy5hZnRlciA9ICcnO1xufVxuXG5mdW5jdGlvbiBhcHBseUNvbXBhY3QgKGNzcywgb3B0cykge1xuICAgIGNzcy53YWxrKHJ1bGUgPT4ge1xuICAgICAgICBpZiAocnVsZS50eXBlID09PSAnZGVjbCcpIHtcbiAgICAgICAgICAgIGlmIChydWxlLnJhd3MudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBydWxlLnZhbHVlID0gcnVsZS5yYXdzLnZhbHVlLnJhdy50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBGb3JtYXQgc2FzcyB2YXJpYWJsZSBgJHNpemU6IDMwZW07YFxuICAgICAgICAgICAgaWYgKGlzU2Fzc1ZhcmlhYmxlKHJ1bGUpKSB7XG4gICAgICAgICAgICAgICAgcnVsZS5yYXdzLmJlZm9yZSA9ICcnO1xuICAgICAgICAgICAgICAgIHJ1bGUucmF3cy5iZXR3ZWVuID0gJzogJztcbiAgICAgICAgICAgICAgICBydWxlLnZhbHVlID0gcnVsZS52YWx1ZS50cmltKCkucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSZW1vdmUgc3BhY2VzIGJlZm9yZSBjb21tYXMgYW5kIGtlZXAgb25seSBvbmUgc3BhY2UgYWZ0ZXIuXG4gICAgICAgICAgICBydWxlLnZhbHVlID0gcnVsZS52YWx1ZS5yZXBsYWNlKC8oXFxzKixcXHMqKSg/PSg/OlteXCInXXxbJ1wiXVteXCInXSpbXCInXSkqJCkvZywgJywgJyk7XG4gICAgICAgICAgICBydWxlLnZhbHVlID0gcnVsZS52YWx1ZS5yZXBsYWNlKC9cXChcXHMqL2csICcoICcpO1xuICAgICAgICAgICAgcnVsZS52YWx1ZSA9IHJ1bGUudmFsdWUucmVwbGFjZSgvXFxzKlxcKS9nLCAnICknKTtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBzcGFjZSBhZnRlciBjb21tYSBpbiBkYXRhLXVyaVxuICAgICAgICAgICAgcnVsZS52YWx1ZSA9IHJ1bGUudmFsdWUucmVwbGFjZSgvKGRhdGE6KFthLXpdK1xcL1thLXowLTlcXC1cXCtdKyg7W2EtelxcLV0rXFw9W2EtejAtOVxcLV0rKT8pPyg7YmFzZTY0KT8sKVxccysvZywgJyQxJyk7XG5cbiAgICAgICAgICAgIC8vIEZvcm1hdCBgIWltcG9ydGFudGBcbiAgICAgICAgICAgIGlmIChydWxlLmltcG9ydGFudCkge1xuICAgICAgICAgICAgICAgIHJ1bGUucmF3cy5pbXBvcnRhbnQgPSBcIiAhaW1wb3J0YW50XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZvcm1hdCBgIWRlZmF1bHRgLCBgIWdsb2JhbGAgYW5kIG1vcmUgc2ltaWxhciB2YWx1ZXMuXG4gICAgICAgICAgICBpZiAocnVsZS52YWx1ZS5tYXRjaCgvXFxzKiFcXHMqKFxcdyspXFxzKiQvaSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBydWxlLnZhbHVlID0gcnVsZS52YWx1ZS5yZXBsYWNlKC9cXHMqIVxccyooXFx3KylcXHMqJC9pLCAnICEkMScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocnVsZS5yYXdzLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcnVsZS5yYXdzLnZhbHVlLnJhdyA9IHJ1bGUudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgb3B0cy5pbmRlbnRTaXplID0gMTtcbiAgICAgICAgaWYgKHJ1bGUudHlwZSA9PT0gJ2NvbW1lbnQnKSB7XG4gICAgICAgICAgICBpZiAocnVsZS5yYXdzLmlubGluZSkge1xuICAgICAgICAgICAgICAgIHJ1bGUucmF3cy5pbmxpbmUgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHByZXYgPSBydWxlLnByZXYoKTtcbiAgICAgICAgICAgIGlmIChwcmV2ICYmIHByZXYudHlwZSA9PT0gJ2RlY2wnKSB7XG4gICAgICAgICAgICAgICAgcnVsZS5yYXdzLmJlZm9yZSA9ICcgJyArIGJsYW5rKHJ1bGUucmF3cy5iZWZvcmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJ1bGUucGFyZW50ICYmIHJ1bGUucGFyZW50LnR5cGUgPT09ICdyb290Jykge1xuICAgICAgICAgICAgICAgIGxldCBuZXh0ID0gcnVsZS5uZXh0KCk7XG4gICAgICAgICAgICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dC5yYXdzLmJlZm9yZSA9ICdcXG4nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocnVsZSAhPT0gY3NzLmZpcnN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmF3cy5iZWZvcmUgPSAnXFxuJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGluZGVudCA9IGdldEluZGVudChydWxlLCBvcHRzLmluZGVudFNpemUpO1xuICAgICAgICBsZXQgZGVlcCA9IGRlZXBseU5lc3RlZChydWxlKTtcbiAgICAgICAgaWYgKHJ1bGUudHlwZSA9PT0gJ3J1bGUnIHx8IHJ1bGUudHlwZSA9PT0gJ2F0cnVsZScpIHtcbiAgICAgICAgICAgIGlmICghcnVsZS5ub2Rlcykge1xuICAgICAgICAgICAgICAgIHJ1bGUucmF3cy5iZXR3ZWVuID0gJyc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJ1bGUucmF3cy5iZXR3ZWVuID0gJyAnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcnVsZS5yYXdzLmFmdGVyID0gJyAnO1xuICAgICAgICAgICAgcnVsZS5yYXdzLmJlZm9yZSA9IGluZGVudCArIGJsYW5rKHJ1bGUucmF3cy5iZWZvcmUpO1xuICAgICAgICAgICAgcnVsZS5yYXdzLnNlbWljb2xvbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJ1bGUucmF3cy5zZWxlY3RvciAmJiBydWxlLnJhd3Muc2VsZWN0b3IucmF3KSB7XG4gICAgICAgICAgICBydWxlLnNlbGVjdG9yID0gcnVsZS5yYXdzLnNlbGVjdG9yLnJhdztcbiAgICAgICAgfVxuICAgICAgICBtYXhTZWxlY3Rvckxlbmd0aChydWxlLCBvcHRzKTtcbiAgICAgICAgaWYgKHJ1bGUudHlwZSA9PT0gJ2RlY2wnKSB7XG4gICAgICAgICAgICBpZiAoZGVlcGx5TmVzdGVkKHJ1bGUucGFyZW50KSkge1xuICAgICAgICAgICAgICAgIGxldCBuZXdsaW5lID0gcnVsZSA9PT0gY3NzLmZpcnN0ID8gJycgOiAnXFxuJztcbiAgICAgICAgICAgICAgICBydWxlLnJhd3MuYmVmb3JlID0gbmV3bGluZSArIGluZGVudCArIGJsYW5rKHJ1bGUucmF3cy5iZWZvcmUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBydWxlLnJhd3MuYmVmb3JlID0gJyAnICsgYmxhbmsocnVsZS5yYXdzLmJlZm9yZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWNvbW1lbnRSZWdleCgpLnRlc3QocnVsZS5yYXdzLmJldHdlZW4pKSB7XG4gICAgICAgICAgICAgICAgcnVsZS5yYXdzLmJldHdlZW4gPSAnOiAnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICgoZGVlcCB8fCBydWxlLm5vZGVzKSAmJiBydWxlICE9PSBjc3MuZmlyc3QpIHtcbiAgICAgICAgICAgIHJ1bGUucmF3cy5iZWZvcmUgPSAnXFxuICc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZXApIHtcbiAgICAgICAgICAgIHJ1bGUucmF3cy5hZnRlciA9ICdcXG4nICsgaW5kZW50O1xuICAgICAgICB9XG4gICAgICAgIGlmIChydWxlLnBhcmVudCAmJiBydWxlICE9PSBydWxlLnBhcmVudC5maXJzdCAmJiAocnVsZS50eXBlID09PSAncnVsZScgfHwgcnVsZS50eXBlID09PSAnYXRydWxlJykpIHtcbiAgICAgICAgICAgIHJ1bGUucmF3cy5iZWZvcmUgPSAnXFxuJyArIGluZGVudDtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGNzcy5yYXdzLmFmdGVyID0gJ1xcbic7XG59XG5cbmZ1bmN0aW9uIGFwcGx5RXhwYW5kZWQgKGNzcywgb3B0cykge1xuICAgIGNzcy53YWxrKHJ1bGUgPT4ge1xuICAgICAgICBpZiAocnVsZS50eXBlID09PSAnZGVjbCcpIHtcbiAgICAgICAgICAgIGlmIChydWxlLnJhd3MudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBydWxlLnZhbHVlID0gcnVsZS5yYXdzLnZhbHVlLnJhdy50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBGb3JtYXQgc2FzcyB2YXJpYWJsZSBgJHNpemU6IDMwZW07YFxuICAgICAgICAgICAgaWYgKGlzU2Fzc1ZhcmlhYmxlKHJ1bGUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJ1bGUgIT09IGNzcy5maXJzdCkge1xuICAgICAgICAgICAgICAgICAgICBydWxlLnJhd3MuYmVmb3JlID0gJ1xcbic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJ1bGUucmF3cy5iZXR3ZWVuID0gJzogJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcnVsZS52YWx1ZSA9IHJ1bGUudmFsdWUudHJpbSgpLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBzcGFjZXMgYmVmb3JlIGNvbW1hcyBhbmQga2VlcCBvbmx5IG9uZSBzcGFjZSBhZnRlci5cbiAgICAgICAgICAgIHJ1bGUudmFsdWUgPSBydWxlLnZhbHVlLnJlcGxhY2UoLyhcXHMqLFxccyopKD89KD86W15cIiddfFsnXCJdW15cIiddKltcIiddKSokKS9nLCAnLCAnKTtcbiAgICAgICAgICAgIHJ1bGUudmFsdWUgPSBydWxlLnZhbHVlLnJlcGxhY2UoL1xcKFxccyovZywgJygnKTtcbiAgICAgICAgICAgIHJ1bGUudmFsdWUgPSBydWxlLnZhbHVlLnJlcGxhY2UoL1xccypcXCkvZywgJyknKTtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBzcGFjZSBhZnRlciBjb21tYSBpbiBkYXRhLXVyaVxuICAgICAgICAgICAgcnVsZS52YWx1ZSA9IHJ1bGUudmFsdWUucmVwbGFjZSgvKGRhdGE6KFthLXpdK1xcL1thLXowLTlcXC1cXCtdKyg7W2EtelxcLV0rXFw9W2EtejAtOVxcLV0rKT8pPyg7YmFzZTY0KT8sKVxccysvZywgJyQxJyk7XG5cbiAgICAgICAgICAgIC8vIEZvcm1hdCBgIWltcG9ydGFudGBcbiAgICAgICAgICAgIGlmIChydWxlLmltcG9ydGFudCkge1xuICAgICAgICAgICAgICAgIHJ1bGUucmF3cy5pbXBvcnRhbnQgPSBcIiAhaW1wb3J0YW50XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZvcm1hdCBgIWRlZmF1bHRgLCBgIWdsb2JhbGAgYW5kIG1vcmUgc2ltaWxhciB2YWx1ZXMuXG4gICAgICAgICAgICBpZiAocnVsZS52YWx1ZS5tYXRjaCgvXFxzKiFcXHMqKFxcdyspXFxzKiQvaSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBydWxlLnZhbHVlID0gcnVsZS52YWx1ZS5yZXBsYWNlKC9cXHMqIVxccyooXFx3KylcXHMqJC9pLCAnICEkMScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocnVsZS5yYXdzLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcnVsZS5yYXdzLnZhbHVlLnJhdyA9IHJ1bGUudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGluZGVudCA9IGdldEluZGVudChydWxlLCBvcHRzLmluZGVudFNpemUpO1xuICAgICAgICBpZiAocnVsZS50eXBlID09PSAnY29tbWVudCcpIHtcbiAgICAgICAgICAgIGxldCBwcmV2ID0gcnVsZS5wcmV2KCk7XG4gICAgICAgICAgICBpZiAocHJldiAmJiBwcmV2LnR5cGUgPT09ICdkZWNsJykge1xuICAgICAgICAgICAgICAgIGlmIChzYW1lTGluZShwcmV2LCBydWxlKSkge1xuICAgICAgICAgICAgICAgICAgICBydWxlLnJhd3MuYmVmb3JlID0gJyAnICsgYmxhbmsocnVsZS5yYXdzLmJlZm9yZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yYXdzLmJlZm9yZSA9ICdcXG4nICsgaW5kZW50ICsgYmxhbmsocnVsZS5yYXdzLmJlZm9yZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFwcmV2ICYmIHJ1bGUgIT09IGNzcy5maXJzdCkge1xuICAgICAgICAgICAgICAgIHJ1bGUucmF3cy5iZWZvcmUgPSAnXFxuJyArIGluZGVudCArIGJsYW5rKHJ1bGUucmF3cy5iZWZvcmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJ1bGUucGFyZW50ICYmIHJ1bGUucGFyZW50LnR5cGUgPT09ICdyb290Jykge1xuICAgICAgICAgICAgICAgIGxldCBuZXh0ID0gcnVsZS5uZXh0KCk7XG4gICAgICAgICAgICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dC5yYXdzLmJlZm9yZSA9ICdcXG5cXG4nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocnVsZSAhPT0gY3NzLmZpcnN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmF3cy5iZWZvcmUgPSAnXFxuXFxuJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcnVsZS5yYXdzLmJlZm9yZSA9IGluZGVudCArIGJsYW5rKHJ1bGUucmF3cy5iZWZvcmUpO1xuICAgICAgICBpZiAocnVsZS50eXBlID09PSAncnVsZScgfHwgcnVsZS50eXBlID09PSAnYXRydWxlJykge1xuICAgICAgICAgICAgaWYgKCFydWxlLm5vZGVzKSB7XG4gICAgICAgICAgICAgICAgcnVsZS5yYXdzLmJldHdlZW4gPSAnJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcnVsZS5yYXdzLmJldHdlZW4gPSAnICc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBydWxlLnJhd3Muc2VtaWNvbG9uID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChydWxlLm5vZGVzKSB7XG4gICAgICAgICAgICAgICAgcnVsZS5yYXdzLmFmdGVyID0gJ1xcbic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gdmlzdWFsIGNhc2NhZGUgb2YgdmVuZG9yIHByZWZpeGVkIHByb3BlcnRpZXNcbiAgICAgICAgaWYgKG9wdHMuY2FzY2FkZSAmJiBydWxlLnR5cGUgPT09ICdydWxlJyAmJiBydWxlLm5vZGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGxldCBwcm9wcyA9IFtdO1xuICAgICAgICAgICAgbGV0IHByZWZpeGVkID0gcHJlZml4ZWREZWNscyhydWxlKS5zb3J0KGxvbmdlc3QpLmZpbHRlcigoe3Byb3B9KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2UgPSB1bnByZWZpeChwcm9wKTtcbiAgICAgICAgICAgICAgICBpZiAoIX5wcm9wcy5pbmRleE9mKGJhc2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9wcy5wdXNoKGJhc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByZWZpeGVkLmZvckVhY2gocHJlZml4ID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgYmFzZSA9IHVucHJlZml4KHByZWZpeC5wcm9wKTtcbiAgICAgICAgICAgICAgICBsZXQgdmVuZG9yID0gcHJlZml4LnByb3AucmVwbGFjZShiYXNlLCAnJykubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHJ1bGUubm9kZXMuZmlsdGVyKCh7cHJvcH0pID0+IHByb3AgJiYgfnByb3AuaW5kZXhPZihiYXNlKSkuZm9yRWFjaChkZWNsID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRoaXNWZW5kb3IgPSBkZWNsLnByb3AucmVwbGFjZShiYXNlLCAnJykubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZXh0cmFTcGFjZSA9IHZlbmRvciAtIHRoaXNWZW5kb3I7XG4gICAgICAgICAgICAgICAgICAgIGlmIChleHRyYVNwYWNlID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVjbC5yYXdzLmJlZm9yZSA9IHNwYWNlKGV4dHJhU3BhY2UpICsgYmxhbmsoZGVjbC5yYXdzLmJlZm9yZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChydWxlLnJhd3Muc2VsZWN0b3IgJiYgcnVsZS5yYXdzLnNlbGVjdG9yLnJhdykge1xuICAgICAgICAgICAgcnVsZS5zZWxlY3RvciA9IHJ1bGUucmF3cy5zZWxlY3Rvci5yYXc7XG4gICAgICAgIH1cbiAgICAgICAgbWF4U2VsZWN0b3JMZW5ndGgocnVsZSwgb3B0cyk7XG4gICAgICAgIGlmIChydWxlLnR5cGUgPT09ICdhdHJ1bGUnKSB7XG4gICAgICAgICAgICBpZiAocnVsZS5wYXJhbXMpIHtcbiAgICAgICAgICAgICAgICBydWxlLnJhd3MuYWZ0ZXJOYW1lID0gJyAnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWF4QXRSdWxlTGVuZ3RoKHJ1bGUsIG9wdHMpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChydWxlLnR5cGUgPT09ICdkZWNsJykge1xuICAgICAgICAgICAgaWYgKCFjb21tZW50UmVnZXgoKS50ZXN0KHJ1bGUucmF3cy5iZXR3ZWVuKSkge1xuICAgICAgICAgICAgICAgIHJ1bGUucmF3cy5iZXR3ZWVuID0gJzogJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1heFZhbHVlTGVuZ3RoKHJ1bGUsIG9wdHMpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChydWxlLnBhcmVudCAmJiBydWxlLnBhcmVudC50eXBlICE9PSAncm9vdCcpIHtcbiAgICAgICAgICAgIHJ1bGUucmF3cy5iZWZvcmUgPSAnXFxuJyArIGJsYW5rKHJ1bGUucmF3cy5iZWZvcmUpO1xuICAgICAgICAgICAgcnVsZS5yYXdzLmFmdGVyID0gJ1xcbicgKyBpbmRlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJ1bGUucGFyZW50ICYmIHJ1bGUgIT09IHJ1bGUucGFyZW50LmZpcnN0ICYmIChydWxlLnR5cGUgPT09ICdydWxlJyB8fCBydWxlLnR5cGUgPT09ICdhdHJ1bGUnKSkge1xuICAgICAgICAgICAgaWYgKHJ1bGUudHlwZSA9PT0gJ2F0cnVsZScgJiYgIXJ1bGUubm9kZXMpIHtcbiAgICAgICAgICAgICAgICBydWxlLnJhd3MuYmVmb3JlID0gJ1xcbicgKyBpbmRlbnQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcnVsZS5yYXdzLmJlZm9yZSA9ICdcXG5cXG4nICsgaW5kZW50O1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgY3NzLnJhd3MuYWZ0ZXIgPSAnXFxuJztcbn1cblxuY29uc3QgcGVyZmVjdGlvbmlzdCA9IHBvc3Rjc3MucGx1Z2luKCdwZXJmZWN0aW9uaXN0Jywgb3B0cyA9PiB7XG4gICAgb3B0cyA9IHtcbiAgICAgICAgZm9ybWF0OiAnZXhwYW5kZWQnLFxuICAgICAgICBpbmRlbnRTaXplOiA0LFxuICAgICAgICBtYXhBdFJ1bGVMZW5ndGg6IDgwLFxuICAgICAgICBtYXhTZWxlY3Rvckxlbmd0aDogODAsXG4gICAgICAgIG1heFZhbHVlTGVuZ3RoOiA4MCxcbiAgICAgICAgY2FzY2FkZTogdHJ1ZSxcbiAgICAgICAgLi4ub3B0cyxcbiAgICB9O1xuICAgIHJldHVybiBjc3MgPT4ge1xuICAgICAgICBjc3Mud2Fsayhub2RlID0+IHtcbiAgICAgICAgICAgIGlmIChub2RlLnJhd3MuYmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5yYXdzLmJlZm9yZSA9IG5vZGUucmF3cy5iZWZvcmUucmVwbGFjZSgvWztcXHNdL2csICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHN3aXRjaCAob3B0cy5mb3JtYXQpIHtcbiAgICAgICAgY2FzZSAnY29tcGFjdCc6XG4gICAgICAgICAgICBhcHBseUNvbXBhY3QoY3NzLCBvcHRzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjb21wcmVzc2VkJzpcbiAgICAgICAgICAgIGFwcGx5Q29tcHJlc3NlZChjc3MpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2V4cGFuZGVkJzpcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGFwcGx5RXhwYW5kZWQoY3NzLCBvcHRzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuXG5wZXJmZWN0aW9uaXN0LnByb2Nlc3MgPSAoY3NzLCBvcHRzID0ge30pID0+IHtcbiAgICBvcHRzLm1hcCA9IG9wdHMubWFwIHx8IChvcHRzLnNvdXJjZW1hcCA/IHRydWUgOiBudWxsKTtcbiAgICBpZiAob3B0cy5zeW50YXggPT09ICdzY3NzJykge1xuICAgICAgICBvcHRzLnN5bnRheCA9IHJlcXVpcmUoJ3Bvc3Rjc3Mtc2NzcycpO1xuICAgIH1cbiAgICBsZXQgcHJvY2Vzc29yID0gcG9zdGNzcyhbIHBlcmZlY3Rpb25pc3Qob3B0cykgXSk7XG4gICAgcmV0dXJuIHByb2Nlc3Nvci5wcm9jZXNzKGNzcywgb3B0cyk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBwZXJmZWN0aW9uaXN0O1xuIl19
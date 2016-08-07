'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.maxAtRuleLength = maxAtRuleLength;
exports.maxSelectorLength = maxSelectorLength;
exports.maxValueLength = maxValueLength;

var _postcss = require('postcss');

var _space = require('./space');

var _space2 = _interopRequireDefault(_space);

var _getIndent = require('./getIndent');

var _getIndent2 = _interopRequireDefault(_getIndent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function splitProperty(rule, prop, opts) {
    var _reindent$opts = _extends({
        reindent: false
    }, opts);

    var breakEvery = _reindent$opts.breakEvery;
    var reindent = _reindent$opts.reindent;
    var reduce = _reindent$opts.reduce;
    var max = _reindent$opts.max;

    var property = rule[prop];
    if (!max || !property) {
        return;
    }
    var exploded = _postcss.list.comma(property);
    if (property.length > max || reduce) {
        (function () {
            var indent = 0;
            if (typeof reindent === 'function') {
                indent = reindent(rule);
            }
            rule[prop] = exploded.reduce(function (lines, chunk) {
                if (breakEvery) {
                    lines.push(chunk);
                    return lines;
                }
                if (lines[lines.length - 1].length + indent <= max) {
                    var merged = lines[lines.length - 1] + ', ' + chunk;
                    if (indent + merged.length <= max) {
                        lines[lines.length - 1] = merged;
                        return lines;
                    }
                }
                lines.push(chunk);
                return lines;
            }, [exploded.shift()]).join(',\n' + (0, _space2.default)(indent));
        })();
    }
}

function maxAtRuleLength(rule, _ref) {
    var max = _ref.maxAtRuleLength;

    return splitProperty(rule, 'params', {
        max: max,
        breakEvery: true,
        reindent: function reindent(r) {
            return r.name.length + 2;
        }
    });
}

function maxSelectorLength(rule, opts) {
    return splitProperty(rule, 'selector', {
        max: opts.maxSelectorLength,
        reduce: true, // where possible reduce to one line
        reindent: function reindent(r) {
            return (0, _getIndent2.default)(r, opts.indentSize).length;
        }
    });
}

function maxValueLength(rule, _ref2) {
    var max = _ref2.maxValueLength;

    if (rule.raws.value && rule.raws.value.raw) {
        rule.value = rule.raws.value.raw;
    }
    return splitProperty(rule, 'value', {
        max: max,
        breakEvery: true,
        reindent: function reindent(r) {
            return (0, _getIndent2.default)(r).length + r.prop.length + 2;
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tYXhTZWxlY3Rvckxlbmd0aC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7UUFxQ2dCLGUsR0FBQSxlO1FBVUEsaUIsR0FBQSxpQjtRQVVBLGMsR0FBQSxjOztBQXpEaEI7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsU0FBUyxhQUFULENBQXdCLElBQXhCLEVBQThCLElBQTlCLEVBQW9DLElBQXBDLEVBQTBDO0FBQUE7QUFFbEMsa0JBQVU7QUFGd0IsT0FHL0IsSUFIK0I7O0FBQUEsUUFDL0IsVUFEK0Isa0JBQy9CLFVBRCtCO0FBQUEsUUFDbkIsUUFEbUIsa0JBQ25CLFFBRG1CO0FBQUEsUUFDVCxNQURTLGtCQUNULE1BRFM7QUFBQSxRQUNELEdBREMsa0JBQ0QsR0FEQzs7QUFLdEMsUUFBTSxXQUFXLEtBQUssSUFBTCxDQUFqQjtBQUNBLFFBQUksQ0FBQyxHQUFELElBQVEsQ0FBQyxRQUFiLEVBQXVCO0FBQ25CO0FBQ0g7QUFDRCxRQUFNLFdBQVcsY0FBSyxLQUFMLENBQVcsUUFBWCxDQUFqQjtBQUNBLFFBQUksU0FBUyxNQUFULEdBQWtCLEdBQWxCLElBQXlCLE1BQTdCLEVBQXFDO0FBQUE7QUFDakMsZ0JBQUksU0FBUyxDQUFiO0FBQ0EsZ0JBQUksT0FBTyxRQUFQLEtBQW9CLFVBQXhCLEVBQW9DO0FBQ2hDLHlCQUFTLFNBQVMsSUFBVCxDQUFUO0FBQ0g7QUFDRCxpQkFBSyxJQUFMLElBQWEsU0FBUyxNQUFULENBQWdCLFVBQUMsS0FBRCxFQUFRLEtBQVIsRUFBa0I7QUFDM0Msb0JBQUksVUFBSixFQUFnQjtBQUNaLDBCQUFNLElBQU4sQ0FBVyxLQUFYO0FBQ0EsMkJBQU8sS0FBUDtBQUNIO0FBQ0Qsb0JBQUksTUFBTSxNQUFNLE1BQU4sR0FBZSxDQUFyQixFQUF3QixNQUF4QixHQUFpQyxNQUFqQyxJQUEyQyxHQUEvQyxFQUFvRDtBQUNoRCx3QkFBTSxTQUFZLE1BQU0sTUFBTSxNQUFOLEdBQWUsQ0FBckIsQ0FBWixVQUF3QyxLQUE5QztBQUNBLHdCQUFJLFNBQVMsT0FBTyxNQUFoQixJQUEwQixHQUE5QixFQUFtQztBQUMvQiw4QkFBTSxNQUFNLE1BQU4sR0FBZSxDQUFyQixJQUEwQixNQUExQjtBQUNBLCtCQUFPLEtBQVA7QUFDSDtBQUNKO0FBQ0Qsc0JBQU0sSUFBTixDQUFXLEtBQVg7QUFDQSx1QkFBTyxLQUFQO0FBQ0gsYUFkWSxFQWNWLENBQUMsU0FBUyxLQUFULEVBQUQsQ0FkVSxFQWNVLElBZFYsQ0FjZSxRQUFRLHFCQUFNLE1BQU4sQ0FkdkIsQ0FBYjtBQUxpQztBQW9CcEM7QUFDSjs7QUFFTSxTQUFTLGVBQVQsQ0FBMEIsSUFBMUIsUUFBd0Q7QUFBQSxRQUFOLEdBQU0sUUFBdkIsZUFBdUI7O0FBQzNELFdBQU8sY0FBYyxJQUFkLEVBQW9CLFFBQXBCLEVBQThCO0FBQ2pDLGdCQURpQztBQUVqQyxvQkFBWSxJQUZxQjtBQUdqQyxrQkFBVSxrQkFBVSxDQUFWLEVBQWE7QUFDbkIsbUJBQU8sRUFBRSxJQUFGLENBQU8sTUFBUCxHQUFnQixDQUF2QjtBQUNIO0FBTGdDLEtBQTlCLENBQVA7QUFPSDs7QUFFTSxTQUFTLGlCQUFULENBQTRCLElBQTVCLEVBQWtDLElBQWxDLEVBQXdDO0FBQzNDLFdBQU8sY0FBYyxJQUFkLEVBQW9CLFVBQXBCLEVBQWdDO0FBQ25DLGFBQUssS0FBSyxpQkFEeUI7QUFFbkMsZ0JBQVEsSUFGMkIsRTtBQUduQyxrQkFBVSxrQkFBVSxDQUFWLEVBQWE7QUFDbkIsbUJBQU8seUJBQVUsQ0FBVixFQUFhLEtBQUssVUFBbEIsRUFBOEIsTUFBckM7QUFDSDtBQUxrQyxLQUFoQyxDQUFQO0FBT0g7O0FBRU0sU0FBUyxjQUFULENBQXlCLElBQXpCLFNBQXNEO0FBQUEsUUFBTixHQUFNLFNBQXRCLGNBQXNCOztBQUN6RCxRQUFJLEtBQUssSUFBTCxDQUFVLEtBQVYsSUFBbUIsS0FBSyxJQUFMLENBQVUsS0FBVixDQUFnQixHQUF2QyxFQUE0QztBQUN4QyxhQUFLLEtBQUwsR0FBYSxLQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLEdBQTdCO0FBQ0g7QUFDRCxXQUFPLGNBQWMsSUFBZCxFQUFvQixPQUFwQixFQUE2QjtBQUNoQyxnQkFEZ0M7QUFFaEMsb0JBQVksSUFGb0I7QUFHaEMsa0JBQVUsa0JBQVUsQ0FBVixFQUFhO0FBQ25CLG1CQUFPLHlCQUFVLENBQVYsRUFBYSxNQUFiLEdBQXNCLEVBQUUsSUFBRixDQUFPLE1BQTdCLEdBQXNDLENBQTdDO0FBQ0g7QUFMK0IsS0FBN0IsQ0FBUDtBQU9IIiwiZmlsZSI6Im1heFNlbGVjdG9yTGVuZ3RoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtsaXN0fSBmcm9tICdwb3N0Y3NzJztcbmltcG9ydCBzcGFjZSBmcm9tICcuL3NwYWNlJztcbmltcG9ydCBnZXRJbmRlbnQgZnJvbSAnLi9nZXRJbmRlbnQnO1xuXG5mdW5jdGlvbiBzcGxpdFByb3BlcnR5IChydWxlLCBwcm9wLCBvcHRzKSB7XG4gICAgY29uc3Qge2JyZWFrRXZlcnksIHJlaW5kZW50LCByZWR1Y2UsIG1heH0gPSB7XG4gICAgICAgIHJlaW5kZW50OiBmYWxzZSxcbiAgICAgICAgLi4ub3B0cyxcbiAgICB9O1xuICAgIGNvbnN0IHByb3BlcnR5ID0gcnVsZVtwcm9wXTtcbiAgICBpZiAoIW1heCB8fCAhcHJvcGVydHkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBleHBsb2RlZCA9IGxpc3QuY29tbWEocHJvcGVydHkpO1xuICAgIGlmIChwcm9wZXJ0eS5sZW5ndGggPiBtYXggfHwgcmVkdWNlKSB7XG4gICAgICAgIGxldCBpbmRlbnQgPSAwO1xuICAgICAgICBpZiAodHlwZW9mIHJlaW5kZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBpbmRlbnQgPSByZWluZGVudChydWxlKTtcbiAgICAgICAgfVxuICAgICAgICBydWxlW3Byb3BdID0gZXhwbG9kZWQucmVkdWNlKChsaW5lcywgY2h1bmspID0+IHtcbiAgICAgICAgICAgIGlmIChicmVha0V2ZXJ5KSB7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChjaHVuayk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpbmVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLmxlbmd0aCArIGluZGVudCA8PSBtYXgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXJnZWQgPSBgJHtsaW5lc1tsaW5lcy5sZW5ndGggLSAxXX0sICR7Y2h1bmt9YDtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZW50ICsgbWVyZ2VkLmxlbmd0aCA8PSBtYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPSBtZXJnZWQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsaW5lcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGNodW5rKTtcbiAgICAgICAgICAgIHJldHVybiBsaW5lcztcbiAgICAgICAgfSwgW2V4cGxvZGVkLnNoaWZ0KCldKS5qb2luKCcsXFxuJyArIHNwYWNlKGluZGVudCkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1heEF0UnVsZUxlbmd0aCAocnVsZSwge21heEF0UnVsZUxlbmd0aDogbWF4fSkge1xuICAgIHJldHVybiBzcGxpdFByb3BlcnR5KHJ1bGUsICdwYXJhbXMnLCB7XG4gICAgICAgIG1heCxcbiAgICAgICAgYnJlYWtFdmVyeTogdHJ1ZSxcbiAgICAgICAgcmVpbmRlbnQ6IGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICByZXR1cm4gci5uYW1lLmxlbmd0aCArIDI7XG4gICAgICAgIH0sXG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXhTZWxlY3Rvckxlbmd0aCAocnVsZSwgb3B0cykge1xuICAgIHJldHVybiBzcGxpdFByb3BlcnR5KHJ1bGUsICdzZWxlY3RvcicsIHtcbiAgICAgICAgbWF4OiBvcHRzLm1heFNlbGVjdG9yTGVuZ3RoLFxuICAgICAgICByZWR1Y2U6IHRydWUsIC8vIHdoZXJlIHBvc3NpYmxlIHJlZHVjZSB0byBvbmUgbGluZVxuICAgICAgICByZWluZGVudDogZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRJbmRlbnQociwgb3B0cy5pbmRlbnRTaXplKS5sZW5ndGg7XG4gICAgICAgIH0sXG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXhWYWx1ZUxlbmd0aCAocnVsZSwge21heFZhbHVlTGVuZ3RoOiBtYXh9KSB7XG4gICAgaWYgKHJ1bGUucmF3cy52YWx1ZSAmJiBydWxlLnJhd3MudmFsdWUucmF3KSB7XG4gICAgICAgIHJ1bGUudmFsdWUgPSBydWxlLnJhd3MudmFsdWUucmF3O1xuICAgIH1cbiAgICByZXR1cm4gc3BsaXRQcm9wZXJ0eShydWxlLCAndmFsdWUnLCB7XG4gICAgICAgIG1heCxcbiAgICAgICAgYnJlYWtFdmVyeTogdHJ1ZSxcbiAgICAgICAgcmVpbmRlbnQ6IGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0SW5kZW50KHIpLmxlbmd0aCArIHIucHJvcC5sZW5ndGggKyAyO1xuICAgICAgICB9LFxuICAgIH0pO1xufVxuIl19
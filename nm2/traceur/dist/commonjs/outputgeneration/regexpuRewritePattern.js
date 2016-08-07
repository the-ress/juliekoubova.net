module.exports = function() {
  "use strict";
  var modules = {};
  var module = {};
  var exports = module.exports = {};
  var require = function(id) {
    return modules[id];
  };
  ;
  (function(root) {
    var freeExports = (typeof exports === 'undefined' ? 'undefined' : $traceurRuntime.typeof(exports)) == 'object' && exports;
    var freeModule = (typeof module === 'undefined' ? 'undefined' : $traceurRuntime.typeof(module)) == 'object' && module && module.exports == freeExports && module;
    var freeGlobal = (typeof global === 'undefined' ? 'undefined' : $traceurRuntime.typeof(global)) == 'object' && global;
    if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
      root = freeGlobal;
    }
    var ERRORS = {
      'rangeOrder': 'A range\u2019s `stop` value must be greater than or equal ' + 'to the `start` value.',
      'codePointRange': 'Invalid code point value. Code points range from ' + 'U+000000 to U+10FFFF.'
    };
    var HIGH_SURROGATE_MIN = 0xD800;
    var HIGH_SURROGATE_MAX = 0xDBFF;
    var LOW_SURROGATE_MIN = 0xDC00;
    var LOW_SURROGATE_MAX = 0xDFFF;
    var regexNull = /\\x00([^0123456789]|$)/g;
    var object = {};
    var hasOwnProperty = object.hasOwnProperty;
    var extend = function(destination, source) {
      var key;
      for (key in source) {
        if (hasOwnProperty.call(source, key)) {
          destination[key] = source[key];
        }
      }
      return destination;
    };
    var forEach = function(array, callback) {
      var index = -1;
      var length = array.length;
      while (++index < length) {
        callback(array[index], index);
      }
    };
    var toString = object.toString;
    var isArray = function(value) {
      return toString.call(value) == '[object Array]';
    };
    var isNumber = function(value) {
      return typeof value == 'number' || toString.call(value) == '[object Number]';
    };
    var zeroes = '0000';
    var pad = function(number, totalCharacters) {
      var string = String(number);
      return string.length < totalCharacters ? (zeroes + string).slice(-totalCharacters) : string;
    };
    var hex = function(number) {
      return Number(number).toString(16).toUpperCase();
    };
    var slice = [].slice;
    var dataFromCodePoints = function(codePoints) {
      var index = -1;
      var length = codePoints.length;
      var max = length - 1;
      var result = [];
      var isStart = true;
      var tmp;
      var previous = 0;
      while (++index < length) {
        tmp = codePoints[index];
        if (isStart) {
          result.push(tmp);
          previous = tmp;
          isStart = false;
        } else {
          if (tmp == previous + 1) {
            if (index != max) {
              previous = tmp;
              continue;
            } else {
              isStart = true;
              result.push(tmp + 1);
            }
          } else {
            result.push(previous + 1, tmp);
            previous = tmp;
          }
        }
      }
      if (!isStart) {
        result.push(tmp + 1);
      }
      return result;
    };
    var dataRemove = function(data, codePoint) {
      var index = 0;
      var start;
      var end;
      var length = data.length;
      while (index < length) {
        start = data[index];
        end = data[index + 1];
        if (codePoint >= start && codePoint < end) {
          if (codePoint == start) {
            if (end == start + 1) {
              data.splice(index, 2);
              return data;
            } else {
              data[index] = codePoint + 1;
              return data;
            }
          } else if (codePoint == end - 1) {
            data[index + 1] = codePoint;
            return data;
          } else {
            data.splice(index, 2, start, codePoint, codePoint + 1, end);
            return data;
          }
        }
        index += 2;
      }
      return data;
    };
    var dataRemoveRange = function(data, rangeStart, rangeEnd) {
      if (rangeEnd < rangeStart) {
        throw Error(ERRORS.rangeOrder);
      }
      var index = 0;
      var start;
      var end;
      while (index < data.length) {
        start = data[index];
        end = data[index + 1] - 1;
        if (start > rangeEnd) {
          return data;
        }
        if (rangeStart <= start && rangeEnd >= end) {
          data.splice(index, 2);
          continue;
        }
        if (rangeStart >= start && rangeEnd < end) {
          if (rangeStart == start) {
            data[index] = rangeEnd + 1;
            data[index + 1] = end + 1;
            return data;
          }
          data.splice(index, 2, start, rangeStart, rangeEnd + 1, end + 1);
          return data;
        }
        if (rangeStart >= start && rangeStart <= end) {
          data[index + 1] = rangeStart;
        } else if (rangeEnd >= start && rangeEnd <= end) {
          data[index] = rangeEnd + 1;
          return data;
        }
        index += 2;
      }
      return data;
    };
    var dataAdd = function(data, codePoint) {
      var index = 0;
      var start;
      var end;
      var lastIndex = null;
      var length = data.length;
      if (codePoint < 0x0 || codePoint > 0x10FFFF) {
        throw RangeError(ERRORS.codePointRange);
      }
      while (index < length) {
        start = data[index];
        end = data[index + 1];
        if (codePoint >= start && codePoint < end) {
          return data;
        }
        if (codePoint == start - 1) {
          data[index] = codePoint;
          return data;
        }
        if (start > codePoint) {
          data.splice(lastIndex != null ? lastIndex + 2 : 0, 0, codePoint, codePoint + 1);
          return data;
        }
        if (codePoint == end) {
          if (codePoint + 1 == data[index + 2]) {
            data.splice(index, 4, start, data[index + 3]);
            return data;
          }
          data[index + 1] = codePoint + 1;
          return data;
        }
        lastIndex = index;
        index += 2;
      }
      data.push(codePoint, codePoint + 1);
      return data;
    };
    var dataAddData = function(dataA, dataB) {
      var index = 0;
      var start;
      var end;
      var data = dataA.slice();
      var length = dataB.length;
      while (index < length) {
        start = dataB[index];
        end = dataB[index + 1] - 1;
        if (start == end) {
          data = dataAdd(data, start);
        } else {
          data = dataAddRange(data, start, end);
        }
        index += 2;
      }
      return data;
    };
    var dataRemoveData = function(dataA, dataB) {
      var index = 0;
      var start;
      var end;
      var data = dataA.slice();
      var length = dataB.length;
      while (index < length) {
        start = dataB[index];
        end = dataB[index + 1] - 1;
        if (start == end) {
          data = dataRemove(data, start);
        } else {
          data = dataRemoveRange(data, start, end);
        }
        index += 2;
      }
      return data;
    };
    var dataAddRange = function(data, rangeStart, rangeEnd) {
      if (rangeEnd < rangeStart) {
        throw Error(ERRORS.rangeOrder);
      }
      if (rangeStart < 0x0 || rangeStart > 0x10FFFF || rangeEnd < 0x0 || rangeEnd > 0x10FFFF) {
        throw RangeError(ERRORS.codePointRange);
      }
      var index = 0;
      var start;
      var end;
      var added = false;
      var length = data.length;
      while (index < length) {
        start = data[index];
        end = data[index + 1];
        if (added) {
          if (start == rangeEnd + 1) {
            data.splice(index - 1, 2);
            return data;
          }
          if (start > rangeEnd) {
            return data;
          }
          if (start >= rangeStart && start <= rangeEnd) {
            if (end > rangeStart && end - 1 <= rangeEnd) {
              data.splice(index, 2);
              index -= 2;
            } else {
              data.splice(index - 1, 2);
              index -= 2;
            }
          }
        } else if (start == rangeEnd + 1) {
          data[index] = rangeStart;
          return data;
        } else if (start > rangeEnd) {
          data.splice(index, 0, rangeStart, rangeEnd + 1);
          return data;
        } else if (rangeStart >= start && rangeStart < end && rangeEnd + 1 <= end) {
          return data;
        } else if ((rangeStart >= start && rangeStart < end) || end == rangeStart) {
          data[index + 1] = rangeEnd + 1;
          added = true;
        } else if (rangeStart <= start && rangeEnd + 1 >= end) {
          data[index] = rangeStart;
          data[index + 1] = rangeEnd + 1;
          added = true;
        }
        index += 2;
      }
      if (!added) {
        data.push(rangeStart, rangeEnd + 1);
      }
      return data;
    };
    var dataContains = function(data, codePoint) {
      var index = 0;
      var length = data.length;
      var start = data[index];
      var end = data[length - 1];
      if (length >= 2) {
        if (codePoint < start || codePoint > end) {
          return false;
        }
      }
      while (index < length) {
        start = data[index];
        end = data[index + 1];
        if (codePoint >= start && codePoint < end) {
          return true;
        }
        index += 2;
      }
      return false;
    };
    var dataIntersection = function(data, codePoints) {
      var index = 0;
      var length = codePoints.length;
      var codePoint;
      var result = [];
      while (index < length) {
        codePoint = codePoints[index];
        if (dataContains(data, codePoint)) {
          result.push(codePoint);
        }
        ++index;
      }
      return dataFromCodePoints(result);
    };
    var dataIsEmpty = function(data) {
      return !data.length;
    };
    var dataIsSingleton = function(data) {
      return data.length == 2 && data[0] + 1 == data[1];
    };
    var dataToArray = function(data) {
      var index = 0;
      var start;
      var end;
      var result = [];
      var length = data.length;
      while (index < length) {
        start = data[index];
        end = data[index + 1];
        while (start < end) {
          result.push(start);
          ++start;
        }
        index += 2;
      }
      return result;
    };
    var floor = Math.floor;
    var highSurrogate = function(codePoint) {
      return parseInt(floor((codePoint - 0x10000) / 0x400) + HIGH_SURROGATE_MIN, 10);
    };
    var lowSurrogate = function(codePoint) {
      return parseInt((codePoint - 0x10000) % 0x400 + LOW_SURROGATE_MIN, 10);
    };
    var stringFromCharCode = String.fromCharCode;
    var codePointToString = function(codePoint) {
      var string;
      if (codePoint == 0x09) {
        string = '\\t';
      } else if (codePoint == 0x0A) {
        string = '\\n';
      } else if (codePoint == 0x0C) {
        string = '\\f';
      } else if (codePoint == 0x0D) {
        string = '\\r';
      } else if (codePoint == 0x5C) {
        string = '\\\\';
      } else if (codePoint == 0x24 || (codePoint >= 0x28 && codePoint <= 0x2B) || codePoint == 0x2D || codePoint == 0x2E || codePoint == 0x3F || (codePoint >= 0x5B && codePoint <= 0x5E) || (codePoint >= 0x7B && codePoint <= 0x7D)) {
        string = '\\' + stringFromCharCode(codePoint);
      } else if (codePoint >= 0x20 && codePoint <= 0x7E) {
        string = stringFromCharCode(codePoint);
      } else if (codePoint <= 0xFF) {
        string = '\\x' + pad(hex(codePoint), 2);
      } else {
        string = '\\u' + pad(hex(codePoint), 4);
      }
      return string;
    };
    var symbolToCodePoint = function(symbol) {
      var length = symbol.length;
      var first = symbol.charCodeAt(0);
      var second;
      if (first >= HIGH_SURROGATE_MIN && first <= HIGH_SURROGATE_MAX && length > 1) {
        second = symbol.charCodeAt(1);
        return (first - HIGH_SURROGATE_MIN) * 0x400 + second - LOW_SURROGATE_MIN + 0x10000;
      }
      return first;
    };
    var createBMPCharacterClasses = function(data) {
      var result = '';
      var index = 0;
      var start;
      var end;
      var length = data.length;
      if (dataIsSingleton(data)) {
        return codePointToString(data[0]);
      }
      while (index < length) {
        start = data[index];
        end = data[index + 1] - 1;
        if (start == end) {
          result += codePointToString(start);
        } else if (start + 1 == end) {
          result += codePointToString(start) + codePointToString(end);
        } else {
          result += codePointToString(start) + '-' + codePointToString(end);
        }
        index += 2;
      }
      return '[' + result + ']';
    };
    var splitAtBMP = function(data) {
      var loneHighSurrogates = [];
      var loneLowSurrogates = [];
      var bmp = [];
      var astral = [];
      var index = 0;
      var start;
      var end;
      var length = data.length;
      while (index < length) {
        start = data[index];
        end = data[index + 1] - 1;
        if (start < HIGH_SURROGATE_MIN) {
          if (end < HIGH_SURROGATE_MIN) {
            bmp.push(start, end + 1);
          }
          if (end >= HIGH_SURROGATE_MIN && end <= HIGH_SURROGATE_MAX) {
            bmp.push(start, HIGH_SURROGATE_MIN);
            loneHighSurrogates.push(HIGH_SURROGATE_MIN, end + 1);
          }
          if (end >= LOW_SURROGATE_MIN && end <= LOW_SURROGATE_MAX) {
            bmp.push(start, HIGH_SURROGATE_MIN);
            loneHighSurrogates.push(HIGH_SURROGATE_MIN, HIGH_SURROGATE_MAX + 1);
            loneLowSurrogates.push(LOW_SURROGATE_MIN, end + 1);
          }
          if (end > LOW_SURROGATE_MAX) {
            bmp.push(start, HIGH_SURROGATE_MIN);
            loneHighSurrogates.push(HIGH_SURROGATE_MIN, HIGH_SURROGATE_MAX + 1);
            loneLowSurrogates.push(LOW_SURROGATE_MIN, LOW_SURROGATE_MAX + 1);
            if (end <= 0xFFFF) {
              bmp.push(LOW_SURROGATE_MAX + 1, end + 1);
            } else {
              bmp.push(LOW_SURROGATE_MAX + 1, 0xFFFF + 1);
              astral.push(0xFFFF + 1, end + 1);
            }
          }
        } else if (start >= HIGH_SURROGATE_MIN && start <= HIGH_SURROGATE_MAX) {
          if (end >= HIGH_SURROGATE_MIN && end <= HIGH_SURROGATE_MAX) {
            loneHighSurrogates.push(start, end + 1);
          }
          if (end >= LOW_SURROGATE_MIN && end <= LOW_SURROGATE_MAX) {
            loneHighSurrogates.push(start, HIGH_SURROGATE_MAX + 1);
            loneLowSurrogates.push(LOW_SURROGATE_MIN, end + 1);
          }
          if (end > LOW_SURROGATE_MAX) {
            loneHighSurrogates.push(start, HIGH_SURROGATE_MAX + 1);
            loneLowSurrogates.push(LOW_SURROGATE_MIN, LOW_SURROGATE_MAX + 1);
            if (end <= 0xFFFF) {
              bmp.push(LOW_SURROGATE_MAX + 1, end + 1);
            } else {
              bmp.push(LOW_SURROGATE_MAX + 1, 0xFFFF + 1);
              astral.push(0xFFFF + 1, end + 1);
            }
          }
        } else if (start >= LOW_SURROGATE_MIN && start <= LOW_SURROGATE_MAX) {
          if (end >= LOW_SURROGATE_MIN && end <= LOW_SURROGATE_MAX) {
            loneLowSurrogates.push(start, end + 1);
          }
          if (end > LOW_SURROGATE_MAX) {
            loneLowSurrogates.push(start, LOW_SURROGATE_MAX + 1);
            if (end <= 0xFFFF) {
              bmp.push(LOW_SURROGATE_MAX + 1, end + 1);
            } else {
              bmp.push(LOW_SURROGATE_MAX + 1, 0xFFFF + 1);
              astral.push(0xFFFF + 1, end + 1);
            }
          }
        } else if (start > LOW_SURROGATE_MAX && start <= 0xFFFF) {
          if (end <= 0xFFFF) {
            bmp.push(start, end + 1);
          } else {
            bmp.push(start, 0xFFFF + 1);
            astral.push(0xFFFF + 1, end + 1);
          }
        } else {
          astral.push(start, end + 1);
        }
        index += 2;
      }
      return {
        'loneHighSurrogates': loneHighSurrogates,
        'loneLowSurrogates': loneLowSurrogates,
        'bmp': bmp,
        'astral': astral
      };
    };
    var optimizeSurrogateMappings = function(surrogateMappings) {
      var result = [];
      var tmpLow = [];
      var addLow = false;
      var mapping;
      var nextMapping;
      var highSurrogates;
      var lowSurrogates;
      var nextHighSurrogates;
      var nextLowSurrogates;
      var index = -1;
      var length = surrogateMappings.length;
      while (++index < length) {
        mapping = surrogateMappings[index];
        nextMapping = surrogateMappings[index + 1];
        if (!nextMapping) {
          result.push(mapping);
          continue;
        }
        highSurrogates = mapping[0];
        lowSurrogates = mapping[1];
        nextHighSurrogates = nextMapping[0];
        nextLowSurrogates = nextMapping[1];
        tmpLow = lowSurrogates;
        while (nextHighSurrogates && highSurrogates[0] == nextHighSurrogates[0] && highSurrogates[1] == nextHighSurrogates[1]) {
          if (dataIsSingleton(nextLowSurrogates)) {
            tmpLow = dataAdd(tmpLow, nextLowSurrogates[0]);
          } else {
            tmpLow = dataAddRange(tmpLow, nextLowSurrogates[0], nextLowSurrogates[1] - 1);
          }
          ++index;
          mapping = surrogateMappings[index];
          highSurrogates = mapping[0];
          lowSurrogates = mapping[1];
          nextMapping = surrogateMappings[index + 1];
          nextHighSurrogates = nextMapping && nextMapping[0];
          nextLowSurrogates = nextMapping && nextMapping[1];
          addLow = true;
        }
        result.push([highSurrogates, addLow ? tmpLow : lowSurrogates]);
        addLow = false;
      }
      return optimizeByLowSurrogates(result);
    };
    var optimizeByLowSurrogates = function(surrogateMappings) {
      if (surrogateMappings.length == 1) {
        return surrogateMappings;
      }
      var index = -1;
      var innerIndex = -1;
      while (++index < surrogateMappings.length) {
        var mapping = surrogateMappings[index];
        var lowSurrogates = mapping[1];
        var lowSurrogateStart = lowSurrogates[0];
        var lowSurrogateEnd = lowSurrogates[1];
        innerIndex = index;
        while (++innerIndex < surrogateMappings.length) {
          var otherMapping = surrogateMappings[innerIndex];
          var otherLowSurrogates = otherMapping[1];
          var otherLowSurrogateStart = otherLowSurrogates[0];
          var otherLowSurrogateEnd = otherLowSurrogates[1];
          if (lowSurrogateStart == otherLowSurrogateStart && lowSurrogateEnd == otherLowSurrogateEnd) {
            if (dataIsSingleton(otherMapping[0])) {
              mapping[0] = dataAdd(mapping[0], otherMapping[0][0]);
            } else {
              mapping[0] = dataAddRange(mapping[0], otherMapping[0][0], otherMapping[0][1] - 1);
            }
            surrogateMappings.splice(innerIndex, 1);
            --innerIndex;
          }
        }
      }
      return surrogateMappings;
    };
    var surrogateSet = function(data) {
      if (!data.length) {
        return [];
      }
      var index = 0;
      var start;
      var end;
      var startHigh;
      var startLow;
      var prevStartHigh = 0;
      var prevEndHigh = 0;
      var tmpLow = [];
      var endHigh;
      var endLow;
      var surrogateMappings = [];
      var length = data.length;
      var dataHigh = [];
      while (index < length) {
        start = data[index];
        end = data[index + 1] - 1;
        startHigh = highSurrogate(start);
        startLow = lowSurrogate(start);
        endHigh = highSurrogate(end);
        endLow = lowSurrogate(end);
        var startsWithLowestLowSurrogate = startLow == LOW_SURROGATE_MIN;
        var endsWithHighestLowSurrogate = endLow == LOW_SURROGATE_MAX;
        var complete = false;
        if (startHigh == endHigh || startsWithLowestLowSurrogate && endsWithHighestLowSurrogate) {
          surrogateMappings.push([[startHigh, endHigh + 1], [startLow, endLow + 1]]);
          complete = true;
        } else {
          surrogateMappings.push([[startHigh, startHigh + 1], [startLow, LOW_SURROGATE_MAX + 1]]);
        }
        if (!complete && startHigh + 1 < endHigh) {
          if (endsWithHighestLowSurrogate) {
            surrogateMappings.push([[startHigh + 1, endHigh + 1], [LOW_SURROGATE_MIN, endLow + 1]]);
            complete = true;
          } else {
            surrogateMappings.push([[startHigh + 1, endHigh], [LOW_SURROGATE_MIN, LOW_SURROGATE_MAX + 1]]);
          }
        }
        if (!complete) {
          surrogateMappings.push([[endHigh, endHigh + 1], [LOW_SURROGATE_MIN, endLow + 1]]);
        }
        prevStartHigh = startHigh;
        prevEndHigh = endHigh;
        index += 2;
      }
      return optimizeSurrogateMappings(surrogateMappings);
    };
    var createSurrogateCharacterClasses = function(surrogateMappings) {
      var result = [];
      forEach(surrogateMappings, function(surrogateMapping) {
        var highSurrogates = surrogateMapping[0];
        var lowSurrogates = surrogateMapping[1];
        result.push(createBMPCharacterClasses(highSurrogates) + createBMPCharacterClasses(lowSurrogates));
      });
      return result.join('|');
    };
    var createCharacterClassesFromData = function(data, bmpOnly) {
      var result = [];
      var parts = splitAtBMP(data);
      var loneHighSurrogates = parts.loneHighSurrogates;
      var loneLowSurrogates = parts.loneLowSurrogates;
      var bmp = parts.bmp;
      var astral = parts.astral;
      var hasAstral = !dataIsEmpty(parts.astral);
      var hasLoneHighSurrogates = !dataIsEmpty(loneHighSurrogates);
      var hasLoneLowSurrogates = !dataIsEmpty(loneLowSurrogates);
      var surrogateMappings = surrogateSet(astral);
      if (bmpOnly) {
        bmp = dataAddData(bmp, loneHighSurrogates);
        hasLoneHighSurrogates = false;
        bmp = dataAddData(bmp, loneLowSurrogates);
        hasLoneLowSurrogates = false;
      }
      if (!dataIsEmpty(bmp)) {
        result.push(createBMPCharacterClasses(bmp));
      }
      if (surrogateMappings.length) {
        result.push(createSurrogateCharacterClasses(surrogateMappings));
      }
      if (hasLoneHighSurrogates) {
        result.push(createBMPCharacterClasses(loneHighSurrogates) + '(?![\\uDC00-\\uDFFF])');
      }
      if (hasLoneLowSurrogates) {
        result.push('(?:[^\\uD800-\\uDBFF]|^)' + createBMPCharacterClasses(loneLowSurrogates));
      }
      return result.join('|');
    };
    var regenerate = function(value) {
      if (arguments.length > 1) {
        value = slice.call(arguments);
      }
      if (this instanceof regenerate) {
        this.data = [];
        return value ? this.add(value) : this;
      }
      return (new regenerate).add(value);
    };
    regenerate.version = '1.2.0';
    var proto = regenerate.prototype;
    extend(proto, {
      'add': function(value) {
        var $this = this;
        if (value == null) {
          return $this;
        }
        if (value instanceof regenerate) {
          $this.data = dataAddData($this.data, value.data);
          return $this;
        }
        if (arguments.length > 1) {
          value = slice.call(arguments);
        }
        if (isArray(value)) {
          forEach(value, function(item) {
            $this.add(item);
          });
          return $this;
        }
        $this.data = dataAdd($this.data, isNumber(value) ? value : symbolToCodePoint(value));
        return $this;
      },
      'remove': function(value) {
        var $this = this;
        if (value == null) {
          return $this;
        }
        if (value instanceof regenerate) {
          $this.data = dataRemoveData($this.data, value.data);
          return $this;
        }
        if (arguments.length > 1) {
          value = slice.call(arguments);
        }
        if (isArray(value)) {
          forEach(value, function(item) {
            $this.remove(item);
          });
          return $this;
        }
        $this.data = dataRemove($this.data, isNumber(value) ? value : symbolToCodePoint(value));
        return $this;
      },
      'addRange': function(start, end) {
        var $this = this;
        $this.data = dataAddRange($this.data, isNumber(start) ? start : symbolToCodePoint(start), isNumber(end) ? end : symbolToCodePoint(end));
        return $this;
      },
      'removeRange': function(start, end) {
        var $this = this;
        var startCodePoint = isNumber(start) ? start : symbolToCodePoint(start);
        var endCodePoint = isNumber(end) ? end : symbolToCodePoint(end);
        $this.data = dataRemoveRange($this.data, startCodePoint, endCodePoint);
        return $this;
      },
      'intersection': function(argument) {
        var $this = this;
        var array = argument instanceof regenerate ? dataToArray(argument.data) : argument;
        $this.data = dataIntersection($this.data, array);
        return $this;
      },
      'contains': function(codePoint) {
        return dataContains(this.data, isNumber(codePoint) ? codePoint : symbolToCodePoint(codePoint));
      },
      'clone': function() {
        var set = new regenerate;
        set.data = this.data.slice(0);
        return set;
      },
      'toString': function(options) {
        var result = createCharacterClassesFromData(this.data, options ? options.bmpOnly : false);
        return result.replace(regexNull, '\\0$1');
      },
      'toRegExp': function(flags) {
        return RegExp(this.toString(), flags || '');
      },
      'valueOf': function() {
        return dataToArray(this.data);
      }
    });
    proto.toArray = proto.valueOf;
    if (typeof define == 'function' && $traceurRuntime.typeof(define.amd) == 'object' && define.amd) {
      define(function() {
        return regenerate;
      });
    } else if (freeExports && !freeExports.nodeType) {
      if (freeModule) {
        freeModule.exports = regenerate;
      } else {
        freeExports.regenerate = regenerate;
      }
    } else {
      root.regenerate = regenerate;
    }
  }(this));
  modules['regenerate'] = module.exports || window.regenerate;
  ;
  (function() {
    'use strict';
    var objectTypes = {
      'function': true,
      'object': true
    };
    var root = (objectTypes[(typeof window === 'undefined' ? 'undefined' : $traceurRuntime.typeof(window))] && window) || this;
    var oldRoot = root;
    var freeExports = objectTypes[(typeof exports === 'undefined' ? 'undefined' : $traceurRuntime.typeof(exports))] && exports;
    var freeModule = objectTypes[(typeof module === 'undefined' ? 'undefined' : $traceurRuntime.typeof(module))] && module && !module.nodeType && module;
    var freeGlobal = freeExports && freeModule && (typeof global === 'undefined' ? 'undefined' : $traceurRuntime.typeof(global)) == 'object' && global;
    if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
      root = freeGlobal;
    }
    var stringFromCharCode = String.fromCharCode;
    var floor = Math.floor;
    function fromCodePoint() {
      var MAX_SIZE = 0x4000;
      var codeUnits = [];
      var highSurrogate;
      var lowSurrogate;
      var index = -1;
      var length = arguments.length;
      if (!length) {
        return '';
      }
      var result = '';
      while (++index < length) {
        var codePoint = Number(arguments[index]);
        if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint) {
          throw RangeError('Invalid code point: ' + codePoint);
        }
        if (codePoint <= 0xFFFF) {
          codeUnits.push(codePoint);
        } else {
          codePoint -= 0x10000;
          highSurrogate = (codePoint >> 10) + 0xD800;
          lowSurrogate = (codePoint % 0x400) + 0xDC00;
          codeUnits.push(highSurrogate, lowSurrogate);
        }
        if (index + 1 == length || codeUnits.length > MAX_SIZE) {
          result += stringFromCharCode.apply(null, codeUnits);
          codeUnits.length = 0;
        }
      }
      return result;
    }
    function assertType(type, expected) {
      if (expected.indexOf('|') == -1) {
        if (type == expected) {
          return;
        }
        throw Error('Invalid node type: ' + type);
      }
      expected = assertType.hasOwnProperty(expected) ? assertType[expected] : (assertType[expected] = RegExp('^(?:' + expected + ')$'));
      if (expected.test(type)) {
        return;
      }
      throw Error('Invalid node type: ' + type);
    }
    function generate(node) {
      var type = node.type;
      if (generate.hasOwnProperty(type) && typeof generate[type] == 'function') {
        return generate[type](node);
      }
      throw Error('Invalid node type: ' + type);
    }
    function generateAlternative(node) {
      assertType(node.type, 'alternative');
      var terms = node.body,
          length = terms ? terms.length : 0;
      if (length == 1) {
        return generateTerm(terms[0]);
      } else {
        var i = -1,
            result = '';
        while (++i < length) {
          result += generateTerm(terms[i]);
        }
        return result;
      }
    }
    function generateAnchor(node) {
      assertType(node.type, 'anchor');
      switch (node.kind) {
        case 'start':
          return '^';
        case 'end':
          return '$';
        case 'boundary':
          return '\\b';
        case 'not-boundary':
          return '\\B';
        default:
          throw Error('Invalid assertion');
      }
    }
    function generateAtom(node) {
      assertType(node.type, 'anchor|characterClass|characterClassEscape|dot|group|reference|value');
      return generate(node);
    }
    function generateCharacterClass(node) {
      assertType(node.type, 'characterClass');
      var classRanges = node.body,
          length = classRanges ? classRanges.length : 0;
      var i = -1,
          result = '[';
      if (node.negative) {
        result += '^';
      }
      while (++i < length) {
        result += generateClassAtom(classRanges[i]);
      }
      result += ']';
      return result;
    }
    function generateCharacterClassEscape(node) {
      assertType(node.type, 'characterClassEscape');
      return '\\' + node.value;
    }
    function generateCharacterClassRange(node) {
      assertType(node.type, 'characterClassRange');
      var min = node.min,
          max = node.max;
      if (min.type == 'characterClassRange' || max.type == 'characterClassRange') {
        throw Error('Invalid character class range');
      }
      return generateClassAtom(min) + '-' + generateClassAtom(max);
    }
    function generateClassAtom(node) {
      assertType(node.type, 'anchor|characterClassEscape|characterClassRange|dot|value');
      return generate(node);
    }
    function generateDisjunction(node) {
      assertType(node.type, 'disjunction');
      var body = node.body,
          length = body ? body.length : 0;
      if (length == 0) {
        throw Error('No body');
      } else if (length == 1) {
        return generate(body[0]);
      } else {
        var i = -1,
            result = '';
        while (++i < length) {
          if (i != 0) {
            result += '|';
          }
          result += generate(body[i]);
        }
        return result;
      }
    }
    function generateDot(node) {
      assertType(node.type, 'dot');
      return '.';
    }
    function generateGroup(node) {
      assertType(node.type, 'group');
      var result = '(';
      switch (node.behavior) {
        case 'normal':
          break;
        case 'ignore':
          result += '?:';
          break;
        case 'lookahead':
          result += '?=';
          break;
        case 'negativeLookahead':
          result += '?!';
          break;
        default:
          throw Error('Invalid behaviour: ' + node.behaviour);
      }
      var body = node.body,
          length = body ? body.length : 0;
      if (length == 1) {
        result += generate(body[0]);
      } else {
        var i = -1;
        while (++i < length) {
          result += generate(body[i]);
        }
      }
      result += ')';
      return result;
    }
    function generateQuantifier(node) {
      assertType(node.type, 'quantifier');
      var quantifier = '',
          min = node.min,
          max = node.max;
      switch (max) {
        case undefined:
        case null:
          switch (min) {
            case 0:
              quantifier = '*';
              break;
            case 1:
              quantifier = '+';
              break;
            default:
              quantifier = '{' + min + ',}';
              break;
          }
          break;
        default:
          if (min == max) {
            quantifier = '{' + min + '}';
          } else if (min == 0 && max == 1) {
            quantifier = '?';
          } else {
            quantifier = '{' + min + ',' + max + '}';
          }
          break;
      }
      if (!node.greedy) {
        quantifier += '?';
      }
      return generateAtom(node.body[0]) + quantifier;
    }
    function generateReference(node) {
      assertType(node.type, 'reference');
      return '\\' + node.matchIndex;
    }
    function generateTerm(node) {
      assertType(node.type, 'anchor|characterClass|characterClassEscape|empty|group|quantifier|reference|value');
      return generate(node);
    }
    function generateValue(node) {
      assertType(node.type, 'value');
      var kind = node.kind,
          codePoint = node.codePoint;
      switch (kind) {
        case 'controlLetter':
          return '\\c' + fromCodePoint(codePoint + 64);
        case 'hexadecimalEscape':
          return '\\x' + ('00' + codePoint.toString(16).toUpperCase()).slice(-2);
        case 'identifier':
          return '\\' + fromCodePoint(codePoint);
        case 'null':
          return '\\' + codePoint;
        case 'octal':
          return '\\' + codePoint.toString(8);
        case 'singleEscape':
          switch (codePoint) {
            case 0x0008:
              return '\\b';
            case 0x009:
              return '\\t';
            case 0x00A:
              return '\\n';
            case 0x00B:
              return '\\v';
            case 0x00C:
              return '\\f';
            case 0x00D:
              return '\\r';
            default:
              throw Error('Invalid codepoint: ' + codePoint);
          }
        case 'symbol':
          return fromCodePoint(codePoint);
        case 'unicodeEscape':
          return '\\u' + ('0000' + codePoint.toString(16).toUpperCase()).slice(-4);
        case 'unicodeCodePointEscape':
          return '\\u{' + codePoint.toString(16).toUpperCase() + '}';
        default:
          throw Error('Unsupported node kind: ' + kind);
      }
    }
    generate.alternative = generateAlternative;
    generate.anchor = generateAnchor;
    generate.characterClass = generateCharacterClass;
    generate.characterClassEscape = generateCharacterClassEscape;
    generate.characterClassRange = generateCharacterClassRange;
    generate.disjunction = generateDisjunction;
    generate.dot = generateDot;
    generate.group = generateGroup;
    generate.quantifier = generateQuantifier;
    generate.reference = generateReference;
    generate.value = generateValue;
    if (typeof define == 'function' && $traceurRuntime.typeof(define.amd) == 'object' && define.amd) {
      define(function() {
        return {'generate': generate};
      });
    } else if (freeExports && freeModule) {
      freeExports.generate = generate;
    } else {
      root.regjsgen = {'generate': generate};
    }
  }.call(this));
  modules['regjsgen'] = {generate: exports.generate || window.regjsgen};
  (function() {
    function parse(str, flags) {
      function addRaw(node) {
        node.raw = str.substring(node.range[0], node.range[1]);
        return node;
      }
      function updateRawStart(node, start) {
        node.range[0] = start;
        return addRaw(node);
      }
      function createAnchor(kind, rawLength) {
        return addRaw({
          type: 'anchor',
          kind: kind,
          range: [pos - rawLength, pos]
        });
      }
      function createValue(kind, codePoint, from, to) {
        return addRaw({
          type: 'value',
          kind: kind,
          codePoint: codePoint,
          range: [from, to]
        });
      }
      function createEscaped(kind, codePoint, value, fromOffset) {
        fromOffset = fromOffset || 0;
        return createValue(kind, codePoint, pos - (value.length + fromOffset), pos);
      }
      function createCharacter(matches) {
        var _char = matches[0];
        var first = _char.charCodeAt(0);
        if (hasUnicodeFlag) {
          var second;
          if (_char.length === 1 && first >= 0xD800 && first <= 0xDBFF) {
            second = lookahead().charCodeAt(0);
            if (second >= 0xDC00 && second <= 0xDFFF) {
              pos++;
              return createValue('symbol', (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000, pos - 2, pos);
            }
          }
        }
        return createValue('symbol', first, pos - 1, pos);
      }
      function createDisjunction(alternatives, from, to) {
        return addRaw({
          type: 'disjunction',
          body: alternatives,
          range: [from, to]
        });
      }
      function createDot() {
        return addRaw({
          type: 'dot',
          range: [pos - 1, pos]
        });
      }
      function createCharacterClassEscape(value) {
        return addRaw({
          type: 'characterClassEscape',
          value: value,
          range: [pos - 2, pos]
        });
      }
      function createReference(matchIndex) {
        return addRaw({
          type: 'reference',
          matchIndex: parseInt(matchIndex, 10),
          range: [pos - 1 - matchIndex.length, pos]
        });
      }
      function createGroup(behavior, disjunction, from, to) {
        return addRaw({
          type: 'group',
          behavior: behavior,
          body: disjunction,
          range: [from, to]
        });
      }
      function createQuantifier(min, max, from, to) {
        if (to == null) {
          from = pos - 1;
          to = pos;
        }
        return addRaw({
          type: 'quantifier',
          min: min,
          max: max,
          greedy: true,
          body: null,
          range: [from, to]
        });
      }
      function createAlternative(terms, from, to) {
        return addRaw({
          type: 'alternative',
          body: terms,
          range: [from, to]
        });
      }
      function createCharacterClass(classRanges, negative, from, to) {
        return addRaw({
          type: 'characterClass',
          body: classRanges,
          negative: negative,
          range: [from, to]
        });
      }
      function createClassRange(min, max, from, to) {
        if (min.codePoint > max.codePoint) {
          bail('invalid range in character class', min.raw + '-' + max.raw, from, to);
        }
        return addRaw({
          type: 'characterClassRange',
          min: min,
          max: max,
          range: [from, to]
        });
      }
      function flattenBody(body) {
        if (body.type === 'alternative') {
          return body.body;
        } else {
          return [body];
        }
      }
      function isEmpty(obj) {
        return obj.type === 'empty';
      }
      function incr(amount) {
        amount = (amount || 1);
        var res = str.substring(pos, pos + amount);
        pos += (amount || 1);
        return res;
      }
      function skip(value) {
        if (!match(value)) {
          bail('character', value);
        }
      }
      function match(value) {
        if (str.indexOf(value, pos) === pos) {
          return incr(value.length);
        }
      }
      function lookahead() {
        return str[pos];
      }
      function current(value) {
        return str.indexOf(value, pos) === pos;
      }
      function next(value) {
        return str[pos + 1] === value;
      }
      function matchReg(regExp) {
        var subStr = str.substring(pos);
        var res = subStr.match(regExp);
        if (res) {
          res.range = [];
          res.range[0] = pos;
          incr(res[0].length);
          res.range[1] = pos;
        }
        return res;
      }
      function parseDisjunction() {
        var res = [],
            from = pos;
        res.push(parseAlternative());
        while (match('|')) {
          res.push(parseAlternative());
        }
        if (res.length === 1) {
          return res[0];
        }
        return createDisjunction(res, from, pos);
      }
      function parseAlternative() {
        var res = [],
            from = pos;
        var term;
        while (term = parseTerm()) {
          res.push(term);
        }
        if (res.length === 1) {
          return res[0];
        }
        return createAlternative(res, from, pos);
      }
      function parseTerm() {
        if (pos >= str.length || current('|') || current(')')) {
          return null;
        }
        var anchor = parseAnchor();
        if (anchor) {
          return anchor;
        }
        var atom = parseAtom();
        if (!atom) {
          bail('Expected atom');
        }
        var quantifier = parseQuantifier() || false;
        if (quantifier) {
          quantifier.body = flattenBody(atom);
          updateRawStart(quantifier, atom.range[0]);
          return quantifier;
        }
        return atom;
      }
      function parseGroup(matchA, typeA, matchB, typeB) {
        var type = null,
            from = pos;
        if (match(matchA)) {
          type = typeA;
        } else if (match(matchB)) {
          type = typeB;
        } else {
          return false;
        }
        var body = parseDisjunction();
        if (!body) {
          bail('Expected disjunction');
        }
        skip(')');
        var group = createGroup(type, flattenBody(body), from, pos);
        if (type == 'normal') {
          if (firstIteration) {
            closedCaptureCounter++;
          }
        }
        return group;
      }
      function parseAnchor() {
        var res,
            from = pos;
        if (match('^')) {
          return createAnchor('start', 1);
        } else if (match('$')) {
          return createAnchor('end', 1);
        } else if (match('\\b')) {
          return createAnchor('boundary', 2);
        } else if (match('\\B')) {
          return createAnchor('not-boundary', 2);
        } else {
          return parseGroup('(?=', 'lookahead', '(?!', 'negativeLookahead');
        }
      }
      function parseQuantifier() {
        var res,
            from = pos;
        var quantifier;
        var min,
            max;
        if (match('*')) {
          quantifier = createQuantifier(0);
        } else if (match('+')) {
          quantifier = createQuantifier(1);
        } else if (match('?')) {
          quantifier = createQuantifier(0, 1);
        } else if (res = matchReg(/^\{([0-9]+)\}/)) {
          min = parseInt(res[1], 10);
          quantifier = createQuantifier(min, min, res.range[0], res.range[1]);
        } else if (res = matchReg(/^\{([0-9]+),\}/)) {
          min = parseInt(res[1], 10);
          quantifier = createQuantifier(min, undefined, res.range[0], res.range[1]);
        } else if (res = matchReg(/^\{([0-9]+),([0-9]+)\}/)) {
          min = parseInt(res[1], 10);
          max = parseInt(res[2], 10);
          if (min > max) {
            bail('numbers out of order in {} quantifier', '', from, pos);
          }
          quantifier = createQuantifier(min, max, res.range[0], res.range[1]);
        }
        if (quantifier) {
          if (match('?')) {
            quantifier.greedy = false;
            quantifier.range[1] += 1;
          }
        }
        return quantifier;
      }
      function parseAtom() {
        var res;
        if (res = matchReg(/^[^^$\\.*+?(){[|]/)) {
          return createCharacter(res);
        } else if (match('.')) {
          return createDot();
        } else if (match('\\')) {
          res = parseAtomEscape();
          if (!res) {
            bail('atomEscape');
          }
          return res;
        } else if (res = parseCharacterClass()) {
          return res;
        } else {
          return parseGroup('(?:', 'ignore', '(', 'normal');
        }
      }
      function parseUnicodeSurrogatePairEscape(firstEscape) {
        if (hasUnicodeFlag) {
          var first,
              second;
          if (firstEscape.kind == 'unicodeEscape' && (first = firstEscape.codePoint) >= 0xD800 && first <= 0xDBFF && current('\\') && next('u')) {
            var prevPos = pos;
            pos++;
            var secondEscape = parseClassEscape();
            if (secondEscape.kind == 'unicodeEscape' && (second = secondEscape.codePoint) >= 0xDC00 && second <= 0xDFFF) {
              firstEscape.range[1] = secondEscape.range[1];
              firstEscape.codePoint = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
              firstEscape.type = 'value';
              firstEscape.kind = 'unicodeCodePointEscape';
              addRaw(firstEscape);
            } else {
              pos = prevPos;
            }
          }
        }
        return firstEscape;
      }
      function parseClassEscape() {
        return parseAtomEscape(true);
      }
      function parseAtomEscape(insideCharacterClass) {
        var res,
            from = pos;
        res = parseDecimalEscape();
        if (res) {
          return res;
        }
        if (insideCharacterClass) {
          if (match('b')) {
            return createEscaped('singleEscape', 0x0008, '\\b');
          } else if (match('B')) {
            bail('\\B not possible inside of CharacterClass', '', from);
          }
        }
        res = parseCharacterEscape();
        return res;
      }
      function parseDecimalEscape() {
        var res,
            match;
        if (res = matchReg(/^(?!0)\d+/)) {
          match = res[0];
          var refIdx = parseInt(res[0], 10);
          if (refIdx <= closedCaptureCounter) {
            return createReference(res[0]);
          } else {
            backrefDenied.push(refIdx);
            incr(-res[0].length);
            if (res = matchReg(/^[0-7]{1,3}/)) {
              return createEscaped('octal', parseInt(res[0], 8), res[0], 1);
            } else {
              res = createCharacter(matchReg(/^[89]/));
              return updateRawStart(res, res.range[0] - 1);
            }
          }
        } else if (res = matchReg(/^[0-7]{1,3}/)) {
          match = res[0];
          if (/^0{1,3}$/.test(match)) {
            return createEscaped('null', 0x0000, '0', match.length + 1);
          } else {
            return createEscaped('octal', parseInt(match, 8), match, 1);
          }
        } else if (res = matchReg(/^[dDsSwW]/)) {
          return createCharacterClassEscape(res[0]);
        }
        return false;
      }
      function parseCharacterEscape() {
        var res;
        if (res = matchReg(/^[fnrtv]/)) {
          var codePoint = 0;
          switch (res[0]) {
            case 't':
              codePoint = 0x009;
              break;
            case 'n':
              codePoint = 0x00A;
              break;
            case 'v':
              codePoint = 0x00B;
              break;
            case 'f':
              codePoint = 0x00C;
              break;
            case 'r':
              codePoint = 0x00D;
              break;
          }
          return createEscaped('singleEscape', codePoint, '\\' + res[0]);
        } else if (res = matchReg(/^c([a-zA-Z])/)) {
          return createEscaped('controlLetter', res[1].charCodeAt(0) % 32, res[1], 2);
        } else if (res = matchReg(/^x([0-9a-fA-F]{2})/)) {
          return createEscaped('hexadecimalEscape', parseInt(res[1], 16), res[1], 2);
        } else if (res = matchReg(/^u([0-9a-fA-F]{4})/)) {
          return parseUnicodeSurrogatePairEscape(createEscaped('unicodeEscape', parseInt(res[1], 16), res[1], 2));
        } else if (hasUnicodeFlag && (res = matchReg(/^u\{([0-9a-fA-F]+)\}/))) {
          return createEscaped('unicodeCodePointEscape', parseInt(res[1], 16), res[1], 4);
        } else {
          return parseIdentityEscape();
        }
      }
      function isIdentifierPart(ch) {
        var NonAsciiIdentifierPart = new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]');
        return (ch === 36) || (ch === 95) || (ch >= 65 && ch <= 90) || (ch >= 97 && ch <= 122) || (ch >= 48 && ch <= 57) || (ch === 92) || ((ch >= 0x80) && NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
      }
      function parseIdentityEscape() {
        var ZWJ = '\u200C';
        var ZWNJ = '\u200D';
        var tmp;
        if (!isIdentifierPart(lookahead())) {
          tmp = incr();
          return createEscaped('identifier', tmp.charCodeAt(0), tmp, 1);
        }
        if (match(ZWJ)) {
          return createEscaped('identifier', 0x200C, ZWJ);
        } else if (match(ZWNJ)) {
          return createEscaped('identifier', 0x200D, ZWNJ);
        }
        return null;
      }
      function parseCharacterClass() {
        var res,
            from = pos;
        if (res = matchReg(/^\[\^/)) {
          res = parseClassRanges();
          skip(']');
          return createCharacterClass(res, true, from, pos);
        } else if (match('[')) {
          res = parseClassRanges();
          skip(']');
          return createCharacterClass(res, false, from, pos);
        }
        return null;
      }
      function parseClassRanges() {
        var res;
        if (current(']')) {
          return [];
        } else {
          res = parseNonemptyClassRanges();
          if (!res) {
            bail('nonEmptyClassRanges');
          }
          return res;
        }
      }
      function parseHelperClassRanges(atom) {
        var from,
            to,
            res;
        if (current('-') && !next(']')) {
          skip('-');
          res = parseClassAtom();
          if (!res) {
            bail('classAtom');
          }
          to = pos;
          var classRanges = parseClassRanges();
          if (!classRanges) {
            bail('classRanges');
          }
          from = atom.range[0];
          if (classRanges.type === 'empty') {
            return [createClassRange(atom, res, from, to)];
          }
          return [createClassRange(atom, res, from, to)].concat(classRanges);
        }
        res = parseNonemptyClassRangesNoDash();
        if (!res) {
          bail('nonEmptyClassRangesNoDash');
        }
        return [atom].concat(res);
      }
      function parseNonemptyClassRanges() {
        var atom = parseClassAtom();
        if (!atom) {
          bail('classAtom');
        }
        if (current(']')) {
          return [atom];
        }
        return parseHelperClassRanges(atom);
      }
      function parseNonemptyClassRangesNoDash() {
        var res = parseClassAtom();
        if (!res) {
          bail('classAtom');
        }
        if (current(']')) {
          return res;
        }
        return parseHelperClassRanges(res);
      }
      function parseClassAtom() {
        if (match('-')) {
          return createCharacter('-');
        } else {
          return parseClassAtomNoDash();
        }
      }
      function parseClassAtomNoDash() {
        var res;
        if (res = matchReg(/^[^\\\]-]/)) {
          return createCharacter(res[0]);
        } else if (match('\\')) {
          res = parseClassEscape();
          if (!res) {
            bail('classEscape');
          }
          return parseUnicodeSurrogatePairEscape(res);
        }
      }
      function bail(message, details, from, to) {
        from = from == null ? pos : from;
        to = to == null ? from : to;
        var contextStart = Math.max(0, from - 10);
        var contextEnd = Math.min(to + 10, str.length);
        var context = '    ' + str.substring(contextStart, contextEnd);
        var pointer = '    ' + new Array(from - contextStart + 1).join(' ') + '^';
        throw SyntaxError(message + ' at position ' + from + (details ? ': ' + details : '') + '\n' + context + '\n' + pointer);
      }
      var backrefDenied = [];
      var closedCaptureCounter = 0;
      var firstIteration = true;
      var hasUnicodeFlag = (flags || "").indexOf("u") !== -1;
      var pos = 0;
      str = String(str);
      if (str === '') {
        str = '(?:)';
      }
      var result = parseDisjunction();
      if (result.range[1] !== str.length) {
        bail('Could not parse entire input - got stuck', '', result.range[1]);
      }
      for (var i = 0; i < backrefDenied.length; i++) {
        if (backrefDenied[i] <= closedCaptureCounter) {
          pos = 0;
          firstIteration = false;
          return parseDisjunction();
        }
      }
      return result;
    }
    var regjsparser = {parse: parse};
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = regjsparser;
    } else {
      window.regjsparser = regjsparser;
    }
  }());
  modules['regjsparser'] = module.exports || window.regjsparser;
  modules['./data/iu-mappings.json'] = ({
    "75": 8490,
    "83": 383,
    "107": 8490,
    "115": 383,
    "181": 924,
    "197": 8491,
    "383": 83,
    "452": 453,
    "453": 452,
    "455": 456,
    "456": 455,
    "458": 459,
    "459": 458,
    "497": 498,
    "498": 497,
    "837": 8126,
    "914": 976,
    "917": 1013,
    "920": 1012,
    "921": 8126,
    "922": 1008,
    "924": 181,
    "928": 982,
    "929": 1009,
    "931": 962,
    "934": 981,
    "937": 8486,
    "962": 931,
    "976": 914,
    "977": 1012,
    "981": 934,
    "982": 928,
    "1008": 922,
    "1009": 929,
    "1012": [920, 977],
    "1013": 917,
    "7776": 7835,
    "7835": 7776,
    "8126": [837, 921],
    "8486": 937,
    "8490": 75,
    "8491": 197,
    "66560": 66600,
    "66561": 66601,
    "66562": 66602,
    "66563": 66603,
    "66564": 66604,
    "66565": 66605,
    "66566": 66606,
    "66567": 66607,
    "66568": 66608,
    "66569": 66609,
    "66570": 66610,
    "66571": 66611,
    "66572": 66612,
    "66573": 66613,
    "66574": 66614,
    "66575": 66615,
    "66576": 66616,
    "66577": 66617,
    "66578": 66618,
    "66579": 66619,
    "66580": 66620,
    "66581": 66621,
    "66582": 66622,
    "66583": 66623,
    "66584": 66624,
    "66585": 66625,
    "66586": 66626,
    "66587": 66627,
    "66588": 66628,
    "66589": 66629,
    "66590": 66630,
    "66591": 66631,
    "66592": 66632,
    "66593": 66633,
    "66594": 66634,
    "66595": 66635,
    "66596": 66636,
    "66597": 66637,
    "66598": 66638,
    "66599": 66639,
    "66600": 66560,
    "66601": 66561,
    "66602": 66562,
    "66603": 66563,
    "66604": 66564,
    "66605": 66565,
    "66606": 66566,
    "66607": 66567,
    "66608": 66568,
    "66609": 66569,
    "66610": 66570,
    "66611": 66571,
    "66612": 66572,
    "66613": 66573,
    "66614": 66574,
    "66615": 66575,
    "66616": 66576,
    "66617": 66577,
    "66618": 66578,
    "66619": 66579,
    "66620": 66580,
    "66621": 66581,
    "66622": 66582,
    "66623": 66583,
    "66624": 66584,
    "66625": 66585,
    "66626": 66586,
    "66627": 66587,
    "66628": 66588,
    "66629": 66589,
    "66630": 66590,
    "66631": 66591,
    "66632": 66592,
    "66633": 66593,
    "66634": 66594,
    "66635": 66595,
    "66636": 66596,
    "66637": 66597,
    "66638": 66598,
    "66639": 66599,
    "71840": 71872,
    "71841": 71873,
    "71842": 71874,
    "71843": 71875,
    "71844": 71876,
    "71845": 71877,
    "71846": 71878,
    "71847": 71879,
    "71848": 71880,
    "71849": 71881,
    "71850": 71882,
    "71851": 71883,
    "71852": 71884,
    "71853": 71885,
    "71854": 71886,
    "71855": 71887,
    "71856": 71888,
    "71857": 71889,
    "71858": 71890,
    "71859": 71891,
    "71860": 71892,
    "71861": 71893,
    "71862": 71894,
    "71863": 71895,
    "71864": 71896,
    "71865": 71897,
    "71866": 71898,
    "71867": 71899,
    "71868": 71900,
    "71869": 71901,
    "71870": 71902,
    "71871": 71903,
    "71872": 71840,
    "71873": 71841,
    "71874": 71842,
    "71875": 71843,
    "71876": 71844,
    "71877": 71845,
    "71878": 71846,
    "71879": 71847,
    "71880": 71848,
    "71881": 71849,
    "71882": 71850,
    "71883": 71851,
    "71884": 71852,
    "71885": 71853,
    "71886": 71854,
    "71887": 71855,
    "71888": 71856,
    "71889": 71857,
    "71890": 71858,
    "71891": 71859,
    "71892": 71860,
    "71893": 71861,
    "71894": 71862,
    "71895": 71863,
    "71896": 71864,
    "71897": 71865,
    "71898": 71866,
    "71899": 71867,
    "71900": 71868,
    "71901": 71869,
    "71902": 71870,
    "71903": 71871
  });
  var regenerate = require('regenerate');
  exports.REGULAR = {
    'd': regenerate().addRange(0x30, 0x39),
    'D': regenerate().addRange(0x0, 0x2F).addRange(0x3A, 0xFFFF),
    's': regenerate(0x20, 0xA0, 0x1680, 0x180E, 0x202F, 0x205F, 0x3000, 0xFEFF).addRange(0x9, 0xD).addRange(0x2000, 0x200A).addRange(0x2028, 0x2029),
    'S': regenerate().addRange(0x0, 0x8).addRange(0xE, 0x1F).addRange(0x21, 0x9F).addRange(0xA1, 0x167F).addRange(0x1681, 0x180D).addRange(0x180F, 0x1FFF).addRange(0x200B, 0x2027).addRange(0x202A, 0x202E).addRange(0x2030, 0x205E).addRange(0x2060, 0x2FFF).addRange(0x3001, 0xFEFE).addRange(0xFF00, 0xFFFF),
    'w': regenerate(0x5F).addRange(0x30, 0x39).addRange(0x41, 0x5A).addRange(0x61, 0x7A),
    'W': regenerate(0x60).addRange(0x0, 0x2F).addRange(0x3A, 0x40).addRange(0x5B, 0x5E).addRange(0x7B, 0xFFFF)
  };
  exports.UNICODE = {
    'd': regenerate().addRange(0x30, 0x39),
    'D': regenerate().addRange(0x0, 0x2F).addRange(0x3A, 0x10FFFF),
    's': regenerate(0x20, 0xA0, 0x1680, 0x180E, 0x202F, 0x205F, 0x3000, 0xFEFF).addRange(0x9, 0xD).addRange(0x2000, 0x200A).addRange(0x2028, 0x2029),
    'S': regenerate().addRange(0x0, 0x8).addRange(0xE, 0x1F).addRange(0x21, 0x9F).addRange(0xA1, 0x167F).addRange(0x1681, 0x180D).addRange(0x180F, 0x1FFF).addRange(0x200B, 0x2027).addRange(0x202A, 0x202E).addRange(0x2030, 0x205E).addRange(0x2060, 0x2FFF).addRange(0x3001, 0xFEFE).addRange(0xFF00, 0x10FFFF),
    'w': regenerate(0x5F).addRange(0x30, 0x39).addRange(0x41, 0x5A).addRange(0x61, 0x7A),
    'W': regenerate(0x60).addRange(0x0, 0x2F).addRange(0x3A, 0x40).addRange(0x5B, 0x5E).addRange(0x7B, 0x10FFFF)
  };
  exports.UNICODE_IGNORE_CASE = {
    'd': regenerate().addRange(0x30, 0x39),
    'D': regenerate().addRange(0x0, 0x2F).addRange(0x3A, 0x10FFFF),
    's': regenerate(0x20, 0xA0, 0x1680, 0x180E, 0x202F, 0x205F, 0x3000, 0xFEFF).addRange(0x9, 0xD).addRange(0x2000, 0x200A).addRange(0x2028, 0x2029),
    'S': regenerate().addRange(0x0, 0x8).addRange(0xE, 0x1F).addRange(0x21, 0x9F).addRange(0xA1, 0x167F).addRange(0x1681, 0x180D).addRange(0x180F, 0x1FFF).addRange(0x200B, 0x2027).addRange(0x202A, 0x202E).addRange(0x2030, 0x205E).addRange(0x2060, 0x2FFF).addRange(0x3001, 0xFEFE).addRange(0xFF00, 0x10FFFF),
    'w': regenerate(0x5F, 0x17F, 0x212A).addRange(0x30, 0x39).addRange(0x41, 0x5A).addRange(0x61, 0x7A),
    'W': regenerate(0x4B, 0x53, 0x60).addRange(0x0, 0x2F).addRange(0x3A, 0x40).addRange(0x5B, 0x5E).addRange(0x7B, 0x10FFFF)
  };
  modules['./data/character-class-escape-sets.js'] = {
    REGULAR: exports.REGULAR,
    UNICODE: exports.UNICODE,
    UNICODE_IGNORE_CASE: exports.UNICODE_IGNORE_CASE
  };
  var generate = require('regjsgen').generate;
  var parse = require('regjsparser').parse;
  var regenerate = require('regenerate');
  var iuMappings = require('./data/iu-mappings.json');
  var ESCAPE_SETS = require('./data/character-class-escape-sets.js');
  function getCharacterClassEscapeSet(character) {
    if (unicode) {
      if (ignoreCase) {
        return ESCAPE_SETS.UNICODE_IGNORE_CASE[character];
      }
      return ESCAPE_SETS.UNICODE[character];
    }
    return ESCAPE_SETS.REGULAR[character];
  }
  var object = {};
  var hasOwnProperty = object.hasOwnProperty;
  function has(object, property) {
    return hasOwnProperty.call(object, property);
  }
  var UNICODE_SET = regenerate().addRange(0x0, 0x10FFFF);
  var BMP_SET = regenerate().addRange(0x0, 0xFFFF);
  var DOT_SET_UNICODE = UNICODE_SET.clone().remove(0x000A, 0x000D, 0x2028, 0x2029);
  var DOT_SET = DOT_SET_UNICODE.clone().intersection(BMP_SET);
  regenerate.prototype.iuAddRange = function(min, max) {
    var $this = this;
    do {
      var folded = caseFold(min);
      if (folded) {
        $this.add(folded);
      }
    } while (++min <= max);
    return $this;
  };
  function assign(target, source) {
    for (var key in source) {
      target[key] = source[key];
    }
  }
  function update(item, pattern) {
    var tree = parse(pattern, '');
    switch (tree.type) {
      case 'characterClass':
      case 'group':
      case 'value':
        break;
      default:
        tree = wrap(tree, pattern);
    }
    assign(item, tree);
  }
  function wrap(tree, pattern) {
    return {
      'type': 'group',
      'behavior': 'ignore',
      'body': [tree],
      'raw': '(?:' + pattern + ')'
    };
  }
  function caseFold(codePoint) {
    return has(iuMappings, codePoint) ? iuMappings[codePoint] : false;
  }
  var ignoreCase = false;
  var unicode = false;
  function processCharacterClass(characterClassItem) {
    var set = regenerate();
    var body = characterClassItem.body.forEach(function(item) {
      switch (item.type) {
        case 'value':
          set.add(item.codePoint);
          if (ignoreCase && unicode) {
            var folded = caseFold(item.codePoint);
            if (folded) {
              set.add(folded);
            }
          }
          break;
        case 'characterClassRange':
          var min = item.min.codePoint;
          var max = item.max.codePoint;
          set.addRange(min, max);
          if (ignoreCase && unicode) {
            set.iuAddRange(min, max);
          }
          break;
        case 'characterClassEscape':
          set.add(getCharacterClassEscapeSet(item.value));
          break;
        default:
          throw Error('Unknown term type: ' + item.type);
      }
    });
    if (characterClassItem.negative) {
      set = (unicode ? UNICODE_SET : BMP_SET).clone().remove(set);
    }
    update(characterClassItem, set.toString());
    return characterClassItem;
  }
  function processTerm(item) {
    switch (item.type) {
      case 'dot':
        update(item, (unicode ? DOT_SET_UNICODE : DOT_SET).toString());
        break;
      case 'characterClass':
        item = processCharacterClass(item);
        break;
      case 'characterClassEscape':
        update(item, getCharacterClassEscapeSet(item.value).toString());
        break;
      case 'alternative':
      case 'disjunction':
      case 'group':
      case 'quantifier':
        item.body = item.body.map(processTerm);
        break;
      case 'value':
        var codePoint = item.codePoint;
        var set = regenerate(codePoint);
        if (ignoreCase && unicode) {
          var folded = caseFold(codePoint);
          if (folded) {
            set.add(folded);
          }
        }
        update(item, set.toString());
        break;
      case 'anchor':
      case 'empty':
      case 'group':
      case 'reference':
        break;
      default:
        throw Error('Unknown term type: ' + item.type);
    }
    return item;
  }
  ;
  module.exports = function(pattern, flags) {
    var tree = parse(pattern, flags);
    ignoreCase = flags ? flags.indexOf('i') > -1 : false;
    unicode = flags ? flags.indexOf('u') > -1 : false;
    assign(tree, processTerm(tree));
    return generate(tree);
  };
  var regexpuRewritePattern = module.exports;
  return {
    get regexpuRewritePattern() {
      return regexpuRewritePattern;
    },
    __esModule: true
  };
}.call(Reflect.global);

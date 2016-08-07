"use strict";
var $___46__46__47_private_46_js__,
    $___46__46__47_frozen_45_data_46_js__,
    $__utils_46_js__,
    $___46__46__47_has_45_native_45_symbols_46_js__;
var $__0 = ($___46__46__47_private_46_js__ = require("../private.js"), $___46__46__47_private_46_js__ && $___46__46__47_private_46_js__.__esModule && $___46__46__47_private_46_js__ || {default: $___46__46__47_private_46_js__}),
    createPrivateSymbol = $__0.createPrivateSymbol,
    deletePrivate = $__0.deletePrivate,
    getPrivate = $__0.getPrivate,
    hasPrivate = $__0.hasPrivate,
    setPrivate = $__0.setPrivate;
var $__1 = ($___46__46__47_frozen_45_data_46_js__ = require("../frozen-data.js"), $___46__46__47_frozen_45_data_46_js__ && $___46__46__47_frozen_45_data_46_js__.__esModule && $___46__46__47_frozen_45_data_46_js__ || {default: $___46__46__47_frozen_45_data_46_js__}),
    deleteFrozen = $__1.deleteFrozen,
    getFrozen = $__1.getFrozen,
    setFrozen = $__1.setFrozen;
var $__2 = ($__utils_46_js__ = require("./utils.js"), $__utils_46_js__ && $__utils_46_js__.__esModule && $__utils_46_js__ || {default: $__utils_46_js__}),
    isObject = $__2.isObject,
    registerPolyfill = $__2.registerPolyfill;
var hasNativeSymbol = ($___46__46__47_has_45_native_45_symbols_46_js__ = require("../has-native-symbols.js"), $___46__46__47_has_45_native_45_symbols_46_js__ && $___46__46__47_has_45_native_45_symbols_46_js__.__esModule && $___46__46__47_has_45_native_45_symbols_46_js__ || {default: $___46__46__47_has_45_native_45_symbols_46_js__}).default;
var $__6 = Object,
    defineProperty = $__6.defineProperty,
    isExtensible = $__6.isExtensible;
var $TypeError = TypeError;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var WeakSet = function() {
  function WeakSet() {
    this.name_ = createPrivateSymbol();
    this.frozenData_ = [];
  }
  return ($traceurRuntime.createClass)(WeakSet, {
    add: function(value) {
      if (!isObject(value))
        throw new $TypeError('value must be an object');
      if (!isExtensible(value)) {
        setFrozen(this.frozenData_, value, value);
      } else {
        setPrivate(value, this.name_, true);
      }
      return this;
    },
    delete: function(value) {
      if (!isObject(value))
        return false;
      if (!isExtensible(value)) {
        return deleteFrozen(this.frozenData_, value);
      }
      return deletePrivate(value, this.name_);
    },
    has: function(value) {
      if (!isObject(value))
        return false;
      if (!isExtensible(value)) {
        return getFrozen(this.frozenData_, value) === value;
      }
      return hasPrivate(value, this.name_);
    }
  }, {});
}();
function needsPolyfill(global) {
  var $__8 = global,
      WeakSet = $__8.WeakSet,
      Symbol = $__8.Symbol;
  if (!WeakSet || !hasNativeSymbol()) {
    return true;
  }
  try {
    var o = {};
    var wm = new WeakSet([[o]]);
    return !wm.has(o);
  } catch (e) {
    return false;
  }
}
function polyfillWeakSet(global) {
  if (needsPolyfill(global)) {
    global.WeakSet = WeakSet;
  }
}
registerPolyfill(polyfillWeakSet);
Object.defineProperties(module.exports, {
  WeakSet: {get: function() {
      return WeakSet;
    }},
  polyfillWeakSet: {get: function() {
      return polyfillWeakSet;
    }},
  __esModule: {value: true}
});

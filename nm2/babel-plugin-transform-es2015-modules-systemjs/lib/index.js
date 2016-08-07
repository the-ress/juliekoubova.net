/*istanbul ignore next*/"use strict";

exports.__esModule = true;

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

exports.default = function ( /*istanbul ignore next*/_ref) {
  /*istanbul ignore next*/var t = _ref.types;

  var IGNORE_REASSIGNMENT_SYMBOL = /*istanbul ignore next*/(0, _symbol2.default)();

  var reassignmentVisitor = { /*istanbul ignore next*/
    "AssignmentExpression|UpdateExpression": function AssignmentExpressionUpdateExpression(path) {
      if (path.node[IGNORE_REASSIGNMENT_SYMBOL]) return;
      path.node[IGNORE_REASSIGNMENT_SYMBOL] = true;

      var arg = path.get(path.isAssignmentExpression() ? "left" : "argument");
      if (!arg.isIdentifier()) return;

      var name = arg.node.name;

      // redeclared in this scope
      if (this.scope.getBinding(name) !== path.scope.getBinding(name)) return;

      var exportedNames = this.exports[name];
      if (!exportedNames) return;

      var node = path.node;

      for ( /*istanbul ignore next*/var _iterator = exportedNames, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
        /*istanbul ignore next*/
        var _ref2;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref2 = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref2 = _i.value;
        }

        var exportedName = _ref2;

        node = this.buildCall(exportedName, node).expression;
      }

      path.replaceWith(node);
    }
  };

  return {
    inherits: require("babel-plugin-transform-strict-mode"),

    visitor: { /*istanbul ignore next*/
      ReferencedIdentifier: function ReferencedIdentifier(path, state) {
        if (path.node.name == "__moduleName" && !path.scope.hasBinding("__moduleName")) {
          path.replaceWith(t.memberExpression(state.contextIdent, t.identifier("id")));
        }
      },


      Program: { /*istanbul ignore next*/
        enter: function enter(path, state) {
          state.contextIdent = path.scope.generateUidIdentifier("context");
        },
        /*istanbul ignore next*/exit: function exit(path, state) {
          var exportIdent = path.scope.generateUidIdentifier("export");
          var contextIdent = state.contextIdent;

          var exportNames = /*istanbul ignore next*/(0, _create2.default)(null);
          var modules = /*istanbul ignore next*/(0, _create2.default)(null);

          var beforeBody = [];
          var setters = [];
          var sources = [];
          var variableIds = [];

          function addExportName(key, val) {
            exportNames[key] = exportNames[key] || [];
            exportNames[key].push(val);
          }

          function pushModule(source, key, specifiers) {
            var _modules = modules[source] = modules[source] || { imports: [], exports: [] };
            _modules[key] = _modules[key].concat(specifiers);
          }

          function buildExportCall(name, val) {
            return t.expressionStatement(t.callExpression(exportIdent, [t.stringLiteral(name), val]));
          }

          var body = path.get("body");

          var canHoist = true;
          for ( /*istanbul ignore next*/var _iterator2 = body, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
            /*istanbul ignore next*/
            var _ref3;

            if (_isArray2) {
              if (_i2 >= _iterator2.length) break;
              _ref3 = _iterator2[_i2++];
            } else {
              _i2 = _iterator2.next();
              if (_i2.done) break;
              _ref3 = _i2.value;
            }

            var _path = _ref3;

            if (_path.isExportDeclaration()) _path = _path.get("declaration");
            if (_path.isVariableDeclaration() && _path.node.kind !== "var") {
              canHoist = false;
              break;
            }
          }

          for ( /*istanbul ignore next*/var _iterator3 = body, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);;) {
            /*istanbul ignore next*/
            var _ref4;

            if (_isArray3) {
              if (_i3 >= _iterator3.length) break;
              _ref4 = _iterator3[_i3++];
            } else {
              _i3 = _iterator3.next();
              if (_i3.done) break;
              _ref4 = _i3.value;
            }

            var _path2 = _ref4;

            if (canHoist && _path2.isFunctionDeclaration()) {
              beforeBody.push(_path2.node);
              _path2.remove();
            } else if (_path2.isImportDeclaration()) {
              var _source = _path2.node.source.value;
              pushModule(_source, "imports", _path2.node.specifiers);
              for (var name in _path2.getBindingIdentifiers()) {
                _path2.scope.removeBinding(name);
                variableIds.push(t.identifier(name));
              }
              _path2.remove();
            } else if (_path2.isExportAllDeclaration()) {
              pushModule(_path2.node.source.value, "exports", _path2.node);
              _path2.remove();
            } else if (_path2.isExportDefaultDeclaration()) {
              var declar = _path2.get("declaration");
              if (declar.isClassDeclaration() || declar.isFunctionDeclaration()) {
                var id = declar.node.id;
                var nodes = [];

                if (id) {
                  nodes.push(declar.node);
                  nodes.push(buildExportCall("default", id));
                  addExportName(id.name, "default");
                } else {
                  nodes.push(buildExportCall("default", t.toExpression(declar.node)));
                }

                if (!canHoist || declar.isClassDeclaration()) {
                  _path2.replaceWithMultiple(nodes);
                } else {
                  beforeBody = beforeBody.concat(nodes);
                  _path2.remove();
                }
              } else {
                _path2.replaceWith(buildExportCall("default", declar.node));
              }
            } else if (_path2.isExportNamedDeclaration()) {
              var _declar = _path2.get("declaration");

              if (_declar.node) {
                _path2.replaceWith(_declar);

                var _nodes = [];
                var bindingIdentifiers = /*istanbul ignore next*/void 0;
                if (_path2.isFunction()) {
                  /*istanbul ignore next*/
                  var _bindingIdentifiers;

                  bindingIdentifiers = /*istanbul ignore next*/(_bindingIdentifiers = {}, _bindingIdentifiers[_declar.node.id.name] = _declar.node.id, _bindingIdentifiers);
                } else {
                  bindingIdentifiers = _declar.getBindingIdentifiers();
                }
                for (var _name in bindingIdentifiers) {
                  addExportName(_name, _name);
                  _nodes.push(buildExportCall(_name, t.identifier(_name)));
                }
                _path2.insertAfter(_nodes);
              }

              var _specifiers = _path2.node.specifiers;
              if (_specifiers && _specifiers.length) {
                if (_path2.node.source) {
                  pushModule(_path2.node.source.value, "exports", _specifiers);
                  _path2.remove();
                } else {
                  var _nodes2 = [];

                  for ( /*istanbul ignore next*/var _iterator6 = _specifiers, _isArray6 = Array.isArray(_iterator6), _i6 = 0, _iterator6 = _isArray6 ? _iterator6 : (0, _getIterator3.default)(_iterator6);;) {
                    /*istanbul ignore next*/
                    var _ref7;

                    if (_isArray6) {
                      if (_i6 >= _iterator6.length) break;
                      _ref7 = _iterator6[_i6++];
                    } else {
                      _i6 = _iterator6.next();
                      if (_i6.done) break;
                      _ref7 = _i6.value;
                    }

                    var _specifier = _ref7;

                    _nodes2.push(buildExportCall(_specifier.exported.name, _specifier.local));
                    addExportName(_specifier.local.name, _specifier.exported.name);
                  }

                  _path2.replaceWithMultiple(_nodes2);
                }
              }
            }
          }

          for (var source in modules) {
            var specifiers = modules[source];

            var setterBody = [];
            var target = path.scope.generateUidIdentifier(source);

            for ( /*istanbul ignore next*/var _iterator4 = specifiers.imports, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : (0, _getIterator3.default)(_iterator4);;) {
              /*istanbul ignore next*/
              var _ref5;

              if (_isArray4) {
                if (_i4 >= _iterator4.length) break;
                _ref5 = _iterator4[_i4++];
              } else {
                _i4 = _iterator4.next();
                if (_i4.done) break;
                _ref5 = _i4.value;
              }

              var specifier = _ref5;

              if (t.isImportNamespaceSpecifier(specifier)) {
                setterBody.push(t.expressionStatement(t.assignmentExpression("=", specifier.local, target)));
              } else if (t.isImportDefaultSpecifier(specifier)) {
                specifier = t.importSpecifier(specifier.local, t.identifier("default"));
              }

              if (t.isImportSpecifier(specifier)) {
                setterBody.push(t.expressionStatement(t.assignmentExpression("=", specifier.local, t.memberExpression(target, specifier.imported))));
              }
            }

            if (specifiers.exports.length) {
              var exportObjRef = path.scope.generateUidIdentifier("exportObj");

              setterBody.push(t.variableDeclaration("var", [t.variableDeclarator(exportObjRef, t.objectExpression([]))]));

              for ( /*istanbul ignore next*/var _iterator5 = specifiers.exports, _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : (0, _getIterator3.default)(_iterator5);;) {
                /*istanbul ignore next*/
                var _ref6;

                if (_isArray5) {
                  if (_i5 >= _iterator5.length) break;
                  _ref6 = _iterator5[_i5++];
                } else {
                  _i5 = _iterator5.next();
                  if (_i5.done) break;
                  _ref6 = _i5.value;
                }

                var node = _ref6;

                if (t.isExportAllDeclaration(node)) {
                  setterBody.push(buildExportAll({
                    KEY: path.scope.generateUidIdentifier("key"),
                    EXPORT_OBJ: exportObjRef,
                    TARGET: target
                  }));
                } else if (t.isExportSpecifier(node)) {
                  setterBody.push(t.expressionStatement(t.assignmentExpression("=", t.memberExpression(exportObjRef, node.exported), t.memberExpression(target, node.local))));
                } else {
                  // todo
                }
              }

              setterBody.push(t.expressionStatement(t.callExpression(exportIdent, [exportObjRef])));
            }

            sources.push(t.stringLiteral(source));
            setters.push(t.functionExpression(null, [target], t.blockStatement(setterBody)));
          }

          var moduleName = this.getModuleName();
          if (moduleName) moduleName = t.stringLiteral(moduleName);

          if (canHoist) {
            /*istanbul ignore next*/(0, _babelHelperHoistVariables2.default)(path, function (id) /*istanbul ignore next*/{
              return variableIds.push(id);
            });
          }

          if (variableIds.length) {
            beforeBody.unshift(t.variableDeclaration("var", variableIds.map(function (id) /*istanbul ignore next*/{
              return t.variableDeclarator(id);
            })));
          }

          path.traverse(reassignmentVisitor, {
            exports: exportNames,
            buildCall: buildExportCall,
            scope: path.scope
          });

          path.node.body = [buildTemplate({
            BEFORE_BODY: beforeBody,
            MODULE_NAME: moduleName,
            SETTERS: setters,
            SOURCES: sources,
            BODY: path.node.body,
            EXPORT_IDENTIFIER: exportIdent,
            CONTEXT_IDENTIFIER: contextIdent
          })];
        }
      }
    }
  };
};

var /*istanbul ignore next*/_babelHelperHoistVariables = require("babel-helper-hoist-variables");

/*istanbul ignore next*/
var _babelHelperHoistVariables2 = _interopRequireDefault(_babelHelperHoistVariables);

var /*istanbul ignore next*/_babelTemplate = require("babel-template");

/*istanbul ignore next*/
var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint max-len: 0 */

var buildTemplate = /*istanbul ignore next*/(0, _babelTemplate2.default)( /*istanbul ignore next*/"\n  System.register(MODULE_NAME, [SOURCES], function (EXPORT_IDENTIFIER, CONTEXT_IDENTIFIER) {\n    BEFORE_BODY;\n    return {\n      setters: [SETTERS],\n      execute: function () {\n        BODY;\n      }\n    };\n  });\n");

var buildExportAll = /*istanbul ignore next*/(0, _babelTemplate2.default)( /*istanbul ignore next*/"\n  for (var KEY in TARGET) {\n    if (KEY !== \"default\") EXPORT_OBJ[KEY] = TARGET[KEY];\n  }\n");

/*istanbul ignore next*/module.exports = exports["default"];
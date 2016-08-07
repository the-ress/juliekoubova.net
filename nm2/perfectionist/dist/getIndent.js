'use strict';

exports.__esModule = true;
exports.default = getIndent;

var _space = require('./space');

var _space2 = _interopRequireDefault(_space);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getIndent(node) {
    var base = arguments.length <= 1 || arguments[1] === undefined ? 4 : arguments[1];

    var level = 0;
    var parent = node.parent;

    while (parent && parent.type !== 'root') {
        level++;
        parent = parent.parent;
    }
    return (0, _space2.default)(level * base);
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nZXRJbmRlbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O2tCQUV3QixTOztBQUZ4Qjs7Ozs7O0FBRWUsU0FBUyxTQUFULENBQW9CLElBQXBCLEVBQW9DO0FBQUEsUUFBVixJQUFVLHlEQUFILENBQUc7O0FBQy9DLFFBQUksUUFBUSxDQUFaO0FBRCtDLFFBRTFDLE1BRjBDLEdBRWhDLElBRmdDLENBRTFDLE1BRjBDOztBQUcvQyxXQUFPLFVBQVUsT0FBTyxJQUFQLEtBQWdCLE1BQWpDLEVBQXlDO0FBQ3JDO0FBQ0EsaUJBQVMsT0FBTyxNQUFoQjtBQUNIO0FBQ0QsV0FBTyxxQkFBTSxRQUFRLElBQWQsQ0FBUDtBQUNIIiwiZmlsZSI6ImdldEluZGVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzcGFjZSBmcm9tICcuL3NwYWNlJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0SW5kZW50IChub2RlLCBiYXNlID0gNCkge1xuICAgIGxldCBsZXZlbCA9IDA7XG4gICAgbGV0IHtwYXJlbnR9ID0gbm9kZTtcbiAgICB3aGlsZSAocGFyZW50ICYmIHBhcmVudC50eXBlICE9PSAncm9vdCcpIHtcbiAgICAgICAgbGV2ZWwrKztcbiAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcbiAgICB9XG4gICAgcmV0dXJuIHNwYWNlKGxldmVsICogYmFzZSk7XG59XG4iXX0=
'use strict';

exports.__esModule = true;
exports.default = prefixedDeclarations;

var _vendors = require('vendors');

var _vendors2 = _interopRequireDefault(_vendors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var prefixes = _vendors2.default.map(function (vendor) {
    return '-' + vendor + '-';
});

function prefixedDeclarations(rule) {
    var prefix = function prefix(node) {
        return prefixes.some(function (p) {
            return node.prop && !node.prop.indexOf(p);
        });
    };
    return rule.nodes.filter(prefix);
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wcmVmaXhlZERlY2xzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztrQkFJd0Isb0I7O0FBSnhCOzs7Ozs7QUFFQSxJQUFNLFdBQVcsa0JBQVEsR0FBUixDQUFZO0FBQUEsaUJBQWMsTUFBZDtBQUFBLENBQVosQ0FBakI7O0FBRWUsU0FBUyxvQkFBVCxDQUErQixJQUEvQixFQUFxQztBQUNoRCxRQUFNLFNBQVMsU0FBVCxNQUFTO0FBQUEsZUFBUSxTQUFTLElBQVQsQ0FBYztBQUFBLG1CQUFLLEtBQUssSUFBTCxJQUFhLENBQUMsS0FBSyxJQUFMLENBQVUsT0FBVixDQUFrQixDQUFsQixDQUFuQjtBQUFBLFNBQWQsQ0FBUjtBQUFBLEtBQWY7QUFDQSxXQUFPLEtBQUssS0FBTCxDQUFXLE1BQVgsQ0FBa0IsTUFBbEIsQ0FBUDtBQUNIIiwiZmlsZSI6InByZWZpeGVkRGVjbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdmVuZG9ycyBmcm9tICd2ZW5kb3JzJztcblxuY29uc3QgcHJlZml4ZXMgPSB2ZW5kb3JzLm1hcCh2ZW5kb3IgPT4gYC0ke3ZlbmRvcn0tYCk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHByZWZpeGVkRGVjbGFyYXRpb25zIChydWxlKSB7XG4gICAgY29uc3QgcHJlZml4ID0gbm9kZSA9PiBwcmVmaXhlcy5zb21lKHAgPT4gbm9kZS5wcm9wICYmICFub2RlLnByb3AuaW5kZXhPZihwKSk7XG4gICAgcmV0dXJuIHJ1bGUubm9kZXMuZmlsdGVyKHByZWZpeCk7XG59XG4iXX0=
/* Keep Node APIs private to the updater; original browser modules keep their original environment. */
(function (root) {
  var nativeRequire = typeof cep_node !== 'undefined' && typeof cep_node.require === 'function' ? cep_node.require : typeof require === 'function' ? require : null;
  root.QayemNativeRequire = nativeRequire;
  try {
    if (typeof require !== 'undefined') require = undefined;
  } catch (ignored) {}
  try {
    if (typeof module !== 'undefined') module = undefined;
  } catch (ignored) {}
  try {
    if (typeof exports !== 'undefined') exports = undefined;
  } catch (ignored) {}
})(window);

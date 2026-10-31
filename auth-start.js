(function () {
  if (typeof QayemAuth !== 'undefined' && QayemAuth && typeof QayemAuth.ensure === 'function') {
    QayemAuth.ensure();
  }
})();

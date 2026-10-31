(function (root) {
  'use strict';
  function noop() {}
  root.QayemTrial = {
    applySession: noop,
    reset: noop,
    setLocked: noop,
    canSelect: function () { return true; },
    canEnter: function () { return true; },
    allows: function () { return true; },
    showUpgrade: noop,
    openSubscription: noop,
    forButton: function () { return null; },
    refresh: noop
  };
})(typeof window !== 'undefined' ? window : this);

// Keep the HTML instance alive when a Photoshop panel is hidden. No document changes.
var QayemLifecycle = (function (root) {
  'use strict';
  var host = root.__adobe_cep__, id = '', resolved = false, callbacks = [];
  function persist() {
    try {
      if (!host || typeof host.dispatchEvent !== 'function') return false;
      var env = JSON.parse(host.getHostEnvironment());
      host.dispatchEvent({ type: 'com.adobe.PhotoshopPersistent', scope: 'APPLICATION', appId: env.appId,
        extensionId: 'com.qayem.style-studio.legacy.panel', data: '' });
      return true;
    } catch (e) { return false; }
  }
  function finish(value) {
    if (resolved) return;
    resolved = true; id = /^qayem-session-[a-z0-9-]+$/i.test(String(value)) ? String(value) : '';
    callbacks.splice(0).forEach(function (cb) { cb(id); });
  }
  persist();
  if (host && typeof host.evalScript === 'function') {
    var timer = setTimeout(function () { finish(''); }, 8000);
    // $.global belongs to the Photoshop scripting engine, so a new Photoshop process gets a new ID.
    try { host.evalScript('(function(){if(!$.global.__qayemStudioSessionV1){$.global.__qayemStudioSessionV1="qayem-session-"+(new Date().getTime()).toString(36)+"-"+Math.floor(Math.random()*2147483647).toString(36);}return $.global.__qayemStudioSessionV1;})()', function (result) { clearTimeout(timer); finish(result); }); }
    catch (e) { clearTimeout(timer); finish(''); }
  } else finish('');
  return { persist: persist, sessionId: function () { return id; }, ready: function (cb) { if (resolved) cb(id); else callbacks.push(cb); } };
})(window);

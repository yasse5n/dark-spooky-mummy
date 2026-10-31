// CEP 7–12 host bridge. No Node.js context, UXP imports, or external dependencies.
var QAYEM_CEP_HOST = true;
var QayemCEPBridge = (function () {
  function host() { return window.__adobe_cep__; }
  function version() {
    try { return JSON.parse(host().getHostEnvironment()).appVersion; } catch (error) { return ''; }
  }
  function literal(value) { return JSON.stringify(value).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'); }
  function extensionPath() {
    var path = decodeURI(host().getSystemPath('extension'));
    path = path.replace(/^file:\/\//, '');
    if (/^\/[A-Za-z]:\//.test(path)) path = path.slice(1);
    return path.replace(/\\/g, '/').replace(/\/$/, '');
  }
  function run(name, duplicate) {
    return new Promise(function (resolve, reject) {
      if (!host() || typeof host().evalScript !== 'function') { reject(new Error('افتح البلاجين من داخل Photoshop.')); return; }
      var root;
      try { root = extensionPath(); } catch (error) { reject(error); return; }
      var script = '$.evalFile(new File(' + literal(root + '/jsx/retouch.jsx') + '));QayemCEPRetouch.run(' + literal(root) + ',' + literal(name) + ',' + (duplicate ? 'true' : 'false') + ');';
      // Do not timeout or re-enable Run while a Photoshop action may still be running.
      try { host().evalScript(script, function (result) {
        if (typeof result !== 'string' || result.indexOf('OK|') !== 0) {
          var message = typeof result === 'string' && result.indexOf('ERR|') === 0 ? decodeURIComponent(result.slice(4)) : 'تعذّر تشغيل الأكشن. راجع رسالة Photoshop ولوحة Actions.';
          reject(new Error(message)); return;
        }
        var parts = result.split('|'); resolve({name:decodeURIComponent(parts.slice(2).join('|')), copied:parts[1] === '1'});
      }); } catch (error) { reject(error); }
    });
  }
  function copy(text) {
    var active = document.activeElement, box = document.createElement('textarea'), success = false;
    var start = active && active.selectionStart, end = active && active.selectionEnd;
    box.setAttribute('data-qayem-clipboard', 'true'); box.value = text;
    box.style.position = 'fixed'; box.style.left = '-10000px'; box.style.top = '0';
    document.body.appendChild(box);
    try { box.focus(); box.select(); success = document.execCommand('copy') === true; }
    catch (error) { success = false; }
    finally {
      document.body.removeChild(box);
      try { if (active) { active.focus(); if (typeof active.setSelectionRange === 'function' && typeof start === 'number') active.setSelectionRange(start, end); } } catch (ignored) {}
    }
    return success;
  }
  function openExternal(url) {
    if (!/^https:\/\//.test(url)) throw new Error('Unsupported external URL');
    if (!window.cep || !window.cep.util || typeof window.cep.util.openURLInDefaultBrowser !== 'function') throw new Error('CEP browser integration unavailable');
    var result = window.cep.util.openURLInDefaultBrowser(url);
    if (result && typeof result.err === 'number' && result.err !== 0) throw new Error('External link was not opened');
  }
  return {version:version, run:run, copy:copy, openExternal:openExternal};
})();
function createCepRetouchEngine(catalog) {
  if (!window.__adobe_cep__ || typeof window.__adobe_cep__.evalScript !== 'function') throw new Error('التشغيل متاح من داخل Photoshop.');
  var busy = false;
  return {run:async function (name, options) {
    if (busy) throw new Error('فيه عملية ريتتش شغالة؛ استنى نهايتها.');
    if (!catalog.actions.some(function (action) { return action.name === name; })) throw new Error('اختار أكشن ريتتش من القائمة.');
    busy = true;
    try { return await QayemCEPBridge.run(name, !!(options && options.duplicate)); } finally { busy = false; }
  }};
}

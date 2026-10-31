function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// CEP 7–12 host bridge. No Node.js context, UXP imports, or external dependencies.
var QAYEM_CEP_HOST = true;
var QayemCEPBridge = function () {
  function host() {
    return window.__adobe_cep__;
  }
  function version() {
    try {
      return JSON.parse(host().getHostEnvironment()).appVersion;
    } catch (error) {
      return '';
    }
  }
  function literal(value) {
    return JSON.stringify(value).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  function extensionPath() {
    var path = decodeURI(host().getSystemPath('extension'));
    path = path.replace(/^file:\/\//, '');
    if (/^\/[A-Za-z]:\//.test(path)) path = path.slice(1);
    return path.replace(/\\/g, '/').replace(/\/$/, '');
  }
  function run(name, duplicate) {
    return new Promise(function (resolve, reject) {
      if (!host() || typeof host().evalScript !== 'function') {
        reject(new Error('افتح البلاجين من داخل Photoshop.'));
        return;
      }
      var root;
      try {
        root = extensionPath();
      } catch (error) {
        reject(error);
        return;
      }
      var script = '$.evalFile(new File(' + literal(root + '/jsx/retouch.jsx') + '));QayemCEPRetouch.run(' + literal(root) + ',' + literal(name) + ',' + (duplicate ? 'true' : 'false') + ');';
      // Do not timeout or re-enable Run while a Photoshop action may still be running.
      try {
        host().evalScript(script, function (result) {
          if (typeof result !== 'string' || result.indexOf('OK|') !== 0) {
            var message = typeof result === 'string' && result.indexOf('ERR|') === 0 ? decodeURIComponent(result.slice(4)) : 'تعذّر تشغيل الأكشن. راجع رسالة Photoshop ولوحة Actions.';
            reject(new Error(message));
            return;
          }
          var parts = result.split('|');
          resolve({
            name: decodeURIComponent(parts.slice(2).join('|')),
            copied: parts[1] === '1'
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  function copy(text) {
    var active = document.activeElement,
      box = document.createElement('textarea'),
      success = false;
    var start = active && active.selectionStart,
      end = active && active.selectionEnd;
    box.setAttribute('data-qayem-clipboard', 'true');
    box.value = text;
    box.style.position = 'fixed';
    box.style.left = '-10000px';
    box.style.top = '0';
    document.body.appendChild(box);
    try {
      box.focus();
      box.select();
      success = document.execCommand('copy') === true;
    } catch (error) {
      success = false;
    } finally {
      document.body.removeChild(box);
      try {
        if (active) {
          active.focus();
          if (typeof active.setSelectionRange === 'function' && typeof start === 'number') active.setSelectionRange(start, end);
        }
      } catch (ignored) {}
    }
    return success;
  }
  function openExternal(url) {
    if (!/^https:\/\//.test(url)) throw new Error('Unsupported external URL');
    if (!window.cep || !window.cep.util || typeof window.cep.util.openURLInDefaultBrowser !== 'function') throw new Error('CEP browser integration unavailable');
    var result = window.cep.util.openURLInDefaultBrowser(url);
    if (result && typeof result.err === 'number' && result.err !== 0) throw new Error('External link was not opened');
  }
  return {
    version: version,
    run: run,
    copy: copy,
    openExternal: openExternal
  };
}();
function createCepRetouchEngine(catalog) {
  if (!window.__adobe_cep__ || typeof window.__adobe_cep__.evalScript !== 'function') throw new Error('التشغيل متاح من داخل Photoshop.');
  var busy = false;
  return {
    run: function () {
      var _run = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(name, options) {
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              if (!busy) {
                _context.n = 1;
                break;
              }
              throw new Error('فيه عملية ريتتش شغالة؛ استنى نهايتها.');
            case 1:
              if (catalog.actions.some(function (action) {
                return action.name === name;
              })) {
                _context.n = 2;
                break;
              }
              throw new Error('اختار أكشن ريتتش من القائمة.');
            case 2:
              busy = true;
              _context.p = 3;
              _context.n = 4;
              return QayemCEPBridge.run(name, !!(options && options.duplicate));
            case 4:
              return _context.a(2, _context.v);
            case 5:
              _context.p = 5;
              busy = false;
              return _context.f(5);
            case 6:
              return _context.a(2);
          }
        }, _callee, null, [[3,, 5, 6]]);
      }));
      function run(_x, _x2) {
        return _run.apply(this, arguments);
      }
      return run;
    }()
  };
}

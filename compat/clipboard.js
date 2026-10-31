function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// Manifest v4 hosts cannot use UXP's system clipboard API. Do not fake success.
function writeQayemClipboard(_x) {
  return _writeQayemClipboard.apply(this, arguments);
}
function _writeQayemClipboard() {
  _writeQayemClipboard = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(text) {
    var inHost, clipboard, data, attempts, i, _t2, _t3;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          if (!(typeof QAYEM_CEP_HOST !== "undefined" && QAYEM_CEP_HOST)) {
            _context2.n = 1;
            break;
          }
          return _context2.a(2, QayemCEPBridge.copy(text));
        case 1:
          inHost = typeof require === "function";
          if (!(inHost && QAYEM_LEGACY_HOST)) {
            _context2.n = 2;
            break;
          }
          return _context2.a(2, false);
        case 2:
          _context2.p = 2;
          clipboard = typeof navigator !== "undefined" ? navigator.clipboard : null;
          _context2.n = 4;
          break;
        case 3:
          _context2.p = 3;
          _t2 = _context2.v;
          return _context2.a(2, false);
        case 4:
          if (clipboard) {
            _context2.n = 5;
            break;
          }
          return _context2.a(2, false);
        case 5:
          data = {
            "text/plain": text
          };
          attempts = [];
          if (typeof clipboard.setContent === "function") attempts.push(function () {
            return clipboard.setContent(data);
          });
          if (inHost && typeof clipboard.write === "function") attempts.push(function () {
            return clipboard.write(data);
          });
          if (typeof clipboard.writeText === "function") attempts.push(function () {
            return clipboard.writeText(inHost ? data : text);
          });
          i = 0;
        case 6:
          if (!(i < attempts.length)) {
            _context2.n = 11;
            break;
          }
          _context2.p = 7;
          _context2.n = 8;
          return attempts[i]();
        case 8:
          return _context2.a(2, true);
        case 9:
          _context2.p = 9;
          _t3 = _context2.v;
        case 10:
          i++;
          _context2.n = 6;
          break;
        case 11:
          return _context2.a(2, false);
      }
    }, _callee2, null, [[7, 9], [2, 3]]);
  }));
  return _writeQayemClipboard.apply(this, arguments);
}
function createPromptCopyController(options) {
  var button = document.getElementById(options.button);
  var preview = document.getElementById(options.preview);
  var status = document.getElementById(options.status);
  var originalLabel = button.textContent;
  var revision = 0,
    busy = false,
    manualText = null;
  function message(text, error) {
    status.textContent = text;
    status.style.color = error ? "#ff9a9d" : "#dde8ee";
  }
  function state(name, label) {
    button.setAttribute("data-copy-state", name);
    button.textContent = label;
  }
  function invalidate() {
    revision++;
    manualText = null;
    preview.value = "";
    state("ready", originalLabel);
    message("", false);
  }
  function copied() {
    manualText = null;
    state("copied", "تم النسخ");
    message(options.successText, false);
  }
  function selectForNativeCopy(text) {
    manualText = text;
    var selected = false;
    try {
      preview.focus();
      if (typeof preview.select === "function") preview.select();
      preview.selectionStart = 0;
      preview.selectionEnd = text.length;
      selected = preview.selectionStart === 0 && preview.selectionEnd === text.length;
    } catch (error) {/* Preserve the generated text even if an older host cannot select it. */}
    try {
      if (typeof preview.scrollIntoView === "function") preview.scrollIntoView(false);
    } catch (ignored) {}
    state("manual", "اضغط Ctrl+C / ⌘C");
    var reason = QAYEM_LEGACY_HOST && typeof require === "function" ? getQayemCopySupport().manualReason : " تعذّر الوصول للحافظة تلقائيًا؛ تقدر تنسخه بالاختصار.";
    var instruction = selected ? "البرومبت جاهز ومتحدد بالكامل. اضغط Ctrl+C على Windows أو ⌘C على Mac لنسخه." : "البرومبت جاهز. اضغط داخل المعاينة، ثم Ctrl+A لتحديد الكل وCtrl+C للنسخ، أو ⌘A ثم ⌘C على Mac.";
    message(instruction + reason, false);
  }
  button.addEventListener("click", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var currentRevision, access, text, success, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          if (!busy) {
            _context.n = 1;
            break;
          }
          return _context.a(2);
        case 1:
          currentRevision = ++revision;
          manualText = null;
          busy = true;
          button.disabled = true;
          state("busy", QAYEM_LEGACY_HOST ? "جاري تجهيز البروبت…" : "جاري التجهيز والنسخ…");
          _context.p = 2;
          if (!(typeof QayemLicenseGate === "undefined")) {
            _context.n = 3;
            break;
          }
          throw new Error("نظام التفعيل غير جاهز. أعد فتح البلاجن.");
        case 3:
          access = typeof QayemTrial !== 'undefined' ? QayemTrial.forButton(options.button) : null;
          _context.n = 4;
          return QayemLicenseGate.ensureEntitled(Object.assign({
            force: true
          }, access || {}));
        case 4:
          if (!(currentRevision !== revision)) {
            _context.n = 5;
            break;
          }
          return _context.a(2);
        case 5:
          text = options.build();
          preview.value = text;
          _context.n = 6;
          return writeQayemClipboard(text);
        case 6:
          success = _context.v;
          if (!(currentRevision !== revision)) {
            _context.n = 7;
            break;
          }
          return _context.a(2);
        case 7:
          if (success) copied();else selectForNativeCopy(text);
          _context.n = 9;
          break;
        case 8:
          _context.p = 8;
          _t = _context.v;
          if (currentRevision === revision) {
            preview.value = "";
            state("ready", originalLabel);
            message(_t.message || String(_t), true);
          }
        case 9:
          _context.p = 9;
          busy = false;
          button.disabled = false;
          return _context.f(9);
        case 10:
          return _context.a(2);
      }
    }, _callee, null, [[2, 8, 9, 10]]);
  })));
  // When a host emits the native copy event, acknowledge a full-preview copy.
  // A keyboard press alone is never treated as proof that copying succeeded.
  preview.addEventListener("copy", function (event) {
    if (event.isTrusted === false) return;
    if (manualText === null || preview.value !== manualText || preview.selectionStart !== 0 || preview.selectionEnd !== manualText.length) return;
    var currentRevision = revision;
    setTimeout(function () {
      if (!event.defaultPrevented && currentRevision === revision && manualText !== null) copied();
    }, 0);
  });
  return {
    invalidate: invalidate
  };
}

// Explain the selected compatibility build before the user opens a design mode.
var qayemCopyNotice = document.getElementById("clipboardCompatibilityNotice");
if (qayemCopyNotice) {
  qayemCopyNotice.textContent = getQayemCopySupport().notice;
  setUiHidden(qayemCopyNotice, !QAYEM_LEGACY_HOST);
}

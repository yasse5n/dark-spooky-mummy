function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* global RETOUCH_CATALOG, createRetouchEngine */
runUiInitializer("retouchView", function () {
  var node = function node(id) {
    return document.getElementById(id);
  };
  var engine = null;
  var hostError = "";
  var busy = false;
  try {
    if (typeof QAYEM_CEP_HOST !== "undefined" && QAYEM_CEP_HOST) {
      engine = createCepRetouchEngine(RETOUCH_CATALOG);
    } else if (typeof require === "function") {
      if (QAYEM_LEGACY_HOST) throw new Error("نسخة التوافق تستخدم واجهة Photoshop القديمة لتجهيز البرومبتات. لتشغيل الريتتش حمّل ملف الأكشن المرفق يدويًا من Window > Actions > Load Actions وشغّله من لوحة Actions. للتشغيل من البلاجين استخدم النسخة الحديثة على Photoshop 23.3 فأحدث.");
      engine = createRetouchEngine(require("photoshop"), require("uxp").storage.localFileSystem, RETOUCH_CATALOG);
    }
  } catch (error) {
    hostError = error.message || String(error);
  }
  RETOUCH_CATALOG.categories.forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      value = _ref2[0],
      label = _ref2[1];
    var option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    node("retouchCategory").appendChild(option);
  });
  function selected() {
    return RETOUCH_CATALOG.actions.find(function (action) {
      return action.name === node("retouchAction").value;
    });
  }
  function status(text, error) {
    node("retouchStatus").textContent = String(text).split(RETOUCH_CATALOG.setName).join("أكشنات الريتتش").replace(/ME\s+Retouch/gi, "أكشنات الريتتش").replace(/(?:actions\/)?me-retouch\.atn/gi, "ملف الأكشن");
    node("retouchStatus").style.color = error ? "#ff9a9d" : "#dde8ee";
  }
  function controls() {
    ["retouchCategory", "retouchSearch", "retouchAction", "retouchDuplicate", "backRetouch"].forEach(function (id) {
      node(id).disabled = busy;
    });
    node("retouchRun").disabled = busy || !engine || !selected();
    node("retouchRun").textContent = busy ? "جاري التشغيل…" : "تشغيل الأكشن المختار";
  }
  function describe() {
    var option = selected();
    node("retouchActionName").textContent = option ? option.name : "لا توجد نتائج";
    node("retouchActionDescription").textContent = option ? option.label + " · " + option.steps + " خطوة مسجّلة." : "غيّر البحث أو التصنيف لعرض الخيارات.";
    node("retouchActionNotes").textContent = option ? option.notes.concat(option.category === "skin" ? ["قبل التشغيل: اختار لاير الصورة العادي في ملف RGB و8 Bits/Channel. التحقق يمنع التشغيل على إعدادات غير مناسبة."] : []).join("\n") : "";
    status(engine ? "" : hostError || "التشغيل متاح من داخل Photoshop.", !engine);
    controls();
  }
  function filter() {
    var old = node("retouchAction").value;
    var category = node("retouchCategory").value;
    var query = node("retouchSearch").value.trim().toLowerCase();
    var actions = RETOUCH_CATALOG.actions.filter(function (action) {
      return (category === "all" || action.category === category) && (action.name + " " + action.label + " " + (typeof qayemUiText === "function" ? qayemUiText(action.label) : "")).toLowerCase().includes(query);
    });
    while (node("retouchAction").firstChild) node("retouchAction").removeChild(node("retouchAction").firstChild);
    actions.forEach(function (action) {
      var option = document.createElement("option");
      option.value = action.name;
      option.textContent = action.label;
      node("retouchAction").appendChild(option);
    });
    if (actions.some(function (action) {
      return action.name === old;
    })) node("retouchAction").value = old;
    node("retouchResultCount").textContent = actions.length + " من " + RETOUCH_CATALOG.actions.length + " أكشن ريتتش";
    describe();
  }
  function perform(_x) {
    return _perform.apply(this, arguments);
  }
  function _perform() {
    _perform = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(task) {
      var _t;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            if (!(!engine || busy)) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2);
          case 1:
            busy = true;
            controls();
            status("جاري تنفيذ الاختيار…");
            _context2.p = 2;
            if (!(typeof QayemLicenseGate === "undefined")) {
              _context2.n = 3;
              break;
            }
            throw new Error("نظام التفعيل غير جاهز. أعد فتح البلاجن.");
          case 3:
            _context2.n = 4;
            return QayemLicenseGate.ensureEntitled({
              force: true,
              action: 'retouch',
              params: {
                id: node('retouchAction').value
              }
            });
          case 4:
            _context2.n = 5;
            return task();
          case 5:
            _context2.n = 7;
            break;
          case 6:
            _context2.p = 6;
            _t = _context2.v;
            status(_t.message || String(_t), true);
          case 7:
            _context2.p = 7;
            busy = false;
            controls();
            return _context2.f(7);
          case 8:
            return _context2.a(2);
        }
      }, _callee2, null, [[2, 6, 7, 8]]);
    }));
    return _perform.apply(this, arguments);
  }
  node("retouchRun").addEventListener("click", function () {
    var option = selected();
    if (!option) return;
    var duplicate = node("retouchDuplicate").checked;
    perform(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var result;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            _context.n = 1;
            return engine.run(option.name, {
              duplicate: duplicate
            });
          case 1:
            result = _context.v;
            status("انتهى تشغيل «" + result.name + "»" + (result.copied ? " على نسخة جديدة." : " على نفس الملف المفتوح.") + " راجع اللايرات وتعليمات الأكشن؛ بعض الخيارات بتجهّز ماسك تكمله بالفرشاة.");
          case 2:
            return _context.a(2);
        }
      }, _callee);
    })));
  });
  node("retouchCategory").addEventListener("change", filter);
  node("retouchSearch").addEventListener("input", filter);
  node("retouchAction").addEventListener("change", describe);
  filter();
});

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// Native Photoshop action playback; never runs an entire ActionSet.
function createRetouchEngine(ps, fs, catalog) {
  if (!ps || !ps.app || !ps.core || typeof ps.core.executeAsModal !== "function" || !ps.app.actionTree) {
    throw new Error("إصدار Photoshop ده لا يوفر واجهة تشغيل الريتتش المطلوبة. حمّل ملف الأكشن المرفق يدويًا من Window > Actions > Load Actions وشغّله من لوحة Actions.");
  }
  var busy = false;
  var boundSetId = null;
  function findSet() {
    var matches = Array.from(ps.app.actionTree || []).filter(function (set) {
      return set.name === catalog.setName;
    });
    var bound = matches.find(function (set) {
      return set.id === boundSetId;
    });
    if (bound) return bound;
    if (matches.length > 1) throw new Error("فيه أكثر من نسخة من مجموعة الأكشنات في Actions. اترك نسخة واحدة ثم حاول التشغيل مرة ثانية.");
    return matches[0] || null;
  }
  function findAction(set, name) {
    var actions = Array.from(set.actions || []);
    var exact = actions.filter(function (action) {
      return action.name === name;
    });
    if (exact.length === 1) return exact[0];
    if (exact.length > 1) throw new Error("اسم الأكشن مكرر داخل المجموعة. اترك نسخة واحدة من الاختيار.");
    // Photoshop can trim trailing whitespace from recorded names.
    var normalized = actions.filter(function (action) {
      return action.name.trim() === name.trim();
    });
    if (normalized.length === 1) return normalized[0];
    throw new Error("الأكشن المختار غير موجود في مجموعة الأكشنات المحمّلة. حمّل ملف الأكشن المرفق أو راجع اختيارات Actions.");
  }
  function state() {
    var set = findSet();
    return {
      installed: !!set,
      count: set ? Array.from(set.actions || []).length : 0
    };
  }
  function loadInModal() {
    return _loadInModal.apply(this, arguments);
  }
  function _loadInModal() {
    _loadInModal = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var current, folder, entry, loadError, loaded, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            current = findSet();
            if (!current) {
              _context.n = 1;
              break;
            }
            return _context.a(2, current);
          case 1:
            _context.n = 2;
            return fs.getPluginFolder();
          case 2:
            folder = _context.v;
            _context.n = 3;
            return folder.getEntry(catalog.file);
          case 3:
            entry = _context.v;
            _context.p = 4;
            _context.n = 5;
            return ps.app.open(entry);
          case 5:
            _context.n = 7;
            break;
          case 6:
            _context.p = 6;
            _t = _context.v;
            loadError = _t;
          case 7:
            // Some hosts return no Document for ATN imports; the action tree is authoritative.
            loaded = findSet();
            if (loaded) {
              _context.n = 8;
              break;
            }
            throw new Error("تعذّر تحميل ملف الأكشن. من Window > Actions اختار Load Actions وحمّل ملف الأكشن المرفق من مجلد البلاجين، ثم حاول التشغيل مرة ثانية." + (loadError ? "\n" + String(loadError.message || loadError) : ""));
          case 8:
            boundSetId = loaded.id;
            return _context.a(2, loaded);
        }
      }, _callee, null, [[4, 6]]);
    }));
    return _loadInModal.apply(this, arguments);
  }
  function exclusive(_x) {
    return _exclusive.apply(this, arguments);
  }
  function _exclusive() {
    _exclusive = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(task) {
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            if (!busy) {
              _context2.n = 1;
              break;
            }
            throw new Error("فيه عملية ريتتش شغالة؛ استنى نهايتها.");
          case 1:
            busy = true;
            _context2.p = 2;
            _context2.n = 3;
            return task();
          case 3:
            return _context2.a(2, _context2.v);
          case 4:
            _context2.p = 4;
            busy = false;
            return _context2.f(4);
          case 5:
            return _context2.a(2);
        }
      }, _callee2, null, [[2,, 4, 5]]);
    }));
    return _exclusive.apply(this, arguments);
  }
  function install() {
    return _install.apply(this, arguments);
  }
  function _install() {
    _install = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.n) {
          case 0:
            return _context4.a(2, exclusive(function () {
              return ps.core.executeAsModal(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
                var set;
                return _regenerator().w(function (_context3) {
                  while (1) switch (_context3.n) {
                    case 0:
                      _context3.n = 1;
                      return loadInModal();
                    case 1:
                      set = _context3.v;
                      return _context3.a(2, {
                        installed: true,
                        count: Array.from(set.actions || []).length
                      });
                  }
                }, _callee3);
              })), {
                commandName: "QAYEM — Load Retouch Actions",
                interactive: true
              });
            }));
        }
      }, _callee4);
    }));
    return _install.apply(this, arguments);
  }
  function preflight(option, doc) {
    if (option.category === "skin") {
      var constants = ps.constants || {};
      if (!constants.DocumentMode || !constants.BitsPerChannelType || doc.mode !== constants.DocumentMode.RGB || doc.bitsPerChannel !== constants.BitsPerChannelType.EIGHT) {
        throw new Error("اختيارات البشرة الحالية تحتاج RGB و8 Bits/Channel. جهّز نسخة بهذه الإعدادات من Image > Mode ثم حاول مجددًا؛ لم يبدأ الأكشن.");
      }
      var layers = Array.from(doc.activeLayers || []);
      if (!constants.LayerKind || layers.length !== 1 || layers[0].kind !== constants.LayerKind.NORMAL) {
        throw new Error("اختار لاير الصورة العادي قبل ريتتش البشرة، بدل النص أو الجروب أو Smart Object؛ لم يبدأ الأكشن.");
      }
    }
    var _iterator = _createForOfIteratorHelper(option.requiresActions || []),
      _step;
    try {
      var _loop = function _loop() {
        var required = _step.value;
        var sets = Array.from(ps.app.actionTree || []).filter(function (set) {
          return set.name === required.set;
        });
        if (sets.length !== 1 || !Array.from(sets[0].actions || []).some(function (action) {
          return action.name === required.name;
        })) {
          throw new Error("Skin Pro يحتاج أكشنَي Skin: EraserSkin وSkin: Foundation من مجموعة action_retouchskin؛ المجموعة الإضافية غير مرفقة. لم يبدأ الأكشن.");
        }
      };
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        _loop();
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }
  function run(_x2) {
    return _run.apply(this, arguments);
  }
  function _run() {
    _run = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(name) {
      var _ref2,
        _ref2$duplicate,
        duplicate,
        option,
        _args6 = arguments;
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.n) {
          case 0:
            _ref2 = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : {}, _ref2$duplicate = _ref2.duplicate, duplicate = _ref2$duplicate === void 0 ? false : _ref2$duplicate;
            option = catalog.actions.find(function (action) {
              return action.name === name;
            });
            if (option) {
              _context6.n = 1;
              break;
            }
            throw new Error("اختار أكشن ريتتش من القائمة.");
          case 1:
            if (!(!ps.app.documents.length || !ps.app.activeDocument)) {
              _context6.n = 2;
              break;
            }
            throw new Error("افتح صورة في Photoshop الأول.");
          case 2:
            return _context6.a(2, exclusive(function () {
              return ps.core.executeAsModal(/*#__PURE__*/function () {
                var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(context) {
                  var original, set, selected, copied, copy, _t2;
                  return _regenerator().w(function (_context5) {
                    while (1) switch (_context5.p = _context5.n) {
                      case 0:
                        original = ps.app.activeDocument;
                        if (original) {
                          _context5.n = 1;
                          break;
                        }
                        throw new Error("افتح صورة في Photoshop الأول.");
                      case 1:
                        preflight(option, original);
                        _context5.n = 2;
                        return loadInModal();
                      case 2:
                        set = _context5.v;
                        selected = findAction(set, option.name);
                        if (!context.isCancelled) {
                          _context5.n = 3;
                          break;
                        }
                        throw new Error("تم إلغاء التشغيل.");
                      case 3:
                        if (Array.from(ps.app.documents).some(function (doc) {
                          return doc.id === original.id;
                        })) {
                          _context5.n = 4;
                          break;
                        }
                        throw new Error("الملف الأصلي اتقفل قبل التشغيل؛ لم يبدأ الأكشن.");
                      case 4:
                        ps.app.activeDocument = original;
                        copied = false;
                        if (!duplicate) {
                          _context5.n = 7;
                          break;
                        }
                        _context5.n = 5;
                        return original.duplicate(original.name + " — QAYEM Retouch", false);
                      case 5:
                        copy = _context5.v;
                        if (copy) {
                          _context5.n = 6;
                          break;
                        }
                        throw new Error("تعذّر إنشاء نسخة من الصورة؛ لم يبدأ الأكشن.");
                      case 6:
                        ps.app.activeDocument = copy;
                        copied = true;
                      case 7:
                        if (!context.isCancelled) {
                          _context5.n = 8;
                          break;
                        }
                        throw new Error("تم إلغاء التشغيل قبل بدء الأكشن.");
                      case 8:
                        _context5.p = 8;
                        _context5.n = 9;
                        return selected.play();
                      case 9:
                        _context5.n = 11;
                        break;
                      case 10:
                        _context5.p = 10;
                        _t2 = _context5.v;
                        throw new Error("الأكشن توقف أو اتلغى. " + (copied ? "راجع النسخة الجديدة؛ ممكن يكون أضاف لايرات قبل التوقف." : "راجع اللايرات؛ ممكن يكون نفّذ بعض الخطوات قبل التوقف.") + "\nتفاصيل Photoshop: " + String(_t2.message || _t2));
                      case 11:
                        return _context5.a(2, {
                          name: option.name,
                          copied: copied
                        });
                    }
                  }, _callee5, null, [[8, 10]]);
                }));
                return function (_x3) {
                  return _ref3.apply(this, arguments);
                };
              }(), {
                commandName: "QAYEM — " + option.name,
                interactive: true
              });
            }));
        }
      }, _callee6);
    }));
    return _run.apply(this, arguments);
  }
  return {
    state: state,
    install: install,
    run: run
  };
}
if (typeof module !== "undefined") module.exports = {
  createRetouchEngine: createRetouchEngine
};

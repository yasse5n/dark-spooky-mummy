function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function createTextTemplateEngine(ps, storage, catalog, layout, legacyApi) {
  if (!ps || !ps.action || typeof ps.action.batchPlay !== 'function') throw new Error('إضافة الكتابة متاحة من داخل Photoshop.');
  var busy = false,
    fontCache = null,
    sequence = 0;
  var px = function px(value) {
    return {
      _unit: 'pixelsUnit',
      _value: value
    };
  };
  function play(_x) {
    return _play.apply(this, arguments);
  }
  function _play() {
    _play = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(command) {
      var result;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            // dontDisplay still opens Photoshop error dialogs during shutdown; return errors to our UI instead.
            command._options = {
              dialogOptions: 'silent'
            };
            _context.n = 1;
            return ps.action.batchPlay([command], {
              synchronousExecution: false
            });
          case 1:
            result = _context.v[0];
            if (!(!result || result._obj === 'error')) {
              _context.n = 2;
              break;
            }
            throw new Error(result && result.message || 'تعذّر تنفيذ أمر الكتابة في Photoshop.');
          case 2:
            return _context.a(2, result);
        }
      }, _callee);
    }));
    return _play.apply(this, arguments);
  }
  var getDoc = function getDoc() {
    return play({
      _obj: 'get',
      _target: [{
        _ref: 'document',
        _enum: 'ordinal',
        _value: 'targetEnum'
      }]
    });
  };
  var selectDoc = function selectDoc(id) {
    return play({
      _obj: 'select',
      _target: [{
        _ref: 'document',
        _id: id
      }]
    });
  };
  var getLayer = function getLayer(id, doc) {
    return play({
      _obj: 'get',
      _target: [{
        _ref: 'layer',
        _id: id
      }, {
        _ref: 'document',
        _id: doc
      }]
    });
  };
  var namedLayer = function namedLayer(name, doc) {
    return play({
      _obj: 'get',
      _target: [{
        _ref: 'layer',
        _name: name
      }, {
        _ref: 'document',
        _id: doc
      }]
    });
  };
  function scalar(value) {
    return typeof value === 'number' ? value : Number(value && value._value);
  }
  function info(desc) {
    var mode = desc.mode && desc.mode._value || desc.mode;
    if (/bitmap|indexed|multichannel|duotone/i.test(String(mode))) throw new Error('نوع ألوان المشروع لا يدعم هذا القالب. استخدم مشروعًا يدعم لايرات النص والأشكال.');
    var result = {
      id: desc.documentID,
      name: desc.title || desc.name || '',
      width: scalar(desc.width),
      height: scalar(desc.height),
      resolution: scalar(desc.resolution) || 72
    };
    if (!result.id || !Number.isFinite(result.width) || !Number.isFinite(result.height)) throw new Error('افتح مشروعًا في Photoshop ثم اضغط إضافة الكتابة.');
    return result;
  }
  function bounds(desc) {
    var b = desc.boundsNoEffects || desc.bounds;
    if (!b) throw new Error('تعذّر قياس حدود لاير الكتابة.');
    return [scalar(b.left), scalar(b.top), scalar(b.right), scalar(b.bottom)];
  }
  function installedFonts(_x2) {
    return _installedFonts.apply(this, arguments);
  }
  function _installedFonts() {
    _installedFonts = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(force) {
      var namesFrom, _names, data, names, _t;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            namesFrom = function _namesFrom(list) {
              var names = [];
              if (!list || !Number.isFinite(Number(list.length)) || list.length < 1) return names;
              for (var i = 0; i < list.length; i++) {
                try {
                  var item = list[i],
                    name = typeof item === 'string' ? item : item && item.postScriptName;
                  if (typeof name === 'string' && name.trim() && names.indexOf(name) < 0) names.push(name);
                } catch (ignored) {}
              }
              return names;
            };
            if (!(fontCache && !force)) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2, fontCache);
          case 1:
            _context2.p = 1;
            _names = namesFrom(ps.app && ps.app.fonts);
            if (!_names.length) {
              _context2.n = 2;
              break;
            }
            fontCache = _names;
            return _context2.a(2, fontCache);
          case 2:
            _context2.n = 4;
            break;
          case 3:
            _context2.p = 3;
            _t = _context2.v;
          case 4:
            _context2.n = 5;
            return play({
              _obj: 'get',
              _target: [{
                _property: 'fontList'
              }, {
                _ref: 'application',
                _enum: 'ordinal',
                _value: 'targetEnum'
              }]
            });
          case 5:
            data = _context2.v;
            names = namesFrom((data.fontList || data).fontPostScriptName);
            if (names.length) {
              _context2.n = 6;
              break;
            }
            throw new Error('تعذّر قراءة الخطوط المتاحة داخل Photoshop.');
          case 6:
            fontCache = names;
            return _context2.a(2, fontCache);
        }
      }, _callee2, null, [[1, 3]]);
    }));
    return _installedFonts.apply(this, arguments);
  }
  function documentInfo(_x3) {
    return _documentInfo.apply(this, arguments);
  }
  function _documentInfo() {
    _documentInfo = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(force) {
      var result, _t2, _t3;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.p = _context3.n) {
          case 0:
            if (!busy) {
              _context3.n = 1;
              break;
            }
            throw new Error('استنى انتهاء إضافة الكتابة.');
          case 1:
            _context3.p = 1;
            if (!(ps.app && ps.app.documents && ps.app.documents.length === 0)) {
              _context3.n = 2;
              break;
            }
            throw new Error('افتح مشروعًا في Photoshop ثم اضغط إضافة الكتابة.');
          case 2:
            _context3.n = 4;
            break;
          case 3:
            _context3.p = 3;
            _t2 = _context3.v;
            throw new Error(_t2.message || 'تعذّر قراءة المشروع أثناء إغلاق Photoshop.');
          case 4:
            _t3 = info;
            _context3.n = 5;
            return getDoc();
          case 5:
            result = _t3(_context3.v);
            _context3.n = 6;
            return installedFonts(force);
          case 6:
            result.fonts = _context3.v;
            return _context3.a(2, result);
        }
      }, _callee3, null, [[1, 3]]);
    }));
    return _documentInfo.apply(this, arguments);
  }
  function selectLayer(_x4, _x5) {
    return _selectLayer.apply(this, arguments);
  }
  function _selectLayer() {
    _selectLayer = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(id, additional) {
      var d;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.n) {
          case 0:
            d = {
              _obj: 'select',
              _target: [{
                _ref: 'layer',
                _id: id
              }],
              makeVisible: false
            };
            if (additional) d.selectionModifier = {
              _enum: 'selectionModifierType',
              _value: 'addToSelection'
            };
            _context4.n = 1;
            return play(d);
          case 1:
            return _context4.a(2);
        }
      }, _callee4);
    }));
    return _selectLayer.apply(this, arguments);
  }
  function scaleLayer(_x6, _x7) {
    return _scaleLayer.apply(this, arguments);
  }
  function _scaleLayer() {
    _scaleLayer = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(id, scale) {
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.n) {
          case 0:
            if (!(Math.abs(scale - 1) < 0.000001)) {
              _context5.n = 1;
              break;
            }
            return _context5.a(2);
          case 1:
            _context5.n = 2;
            return play({
              _obj: 'transform',
              _target: [{
                _ref: 'layer',
                _id: id
              }],
              freeTransformCenterState: {
                _enum: 'quadCenterState',
                _value: 'QCSAverage'
              },
              width: {
                _unit: 'percentUnit',
                _value: scale * 100
              },
              height: {
                _unit: 'percentUnit',
                _value: scale * 100
              },
              interfaceIconFrameDimmed: {
                _enum: 'interpolationType',
                _value: 'bicubic'
              }
            });
          case 2:
            return _context5.a(2);
        }
      }, _callee5);
    }));
    return _scaleLayer.apply(this, arguments);
  }
  function moveLayer(_x8, _x9, _x0) {
    return _moveLayer.apply(this, arguments);
  }
  function _moveLayer() {
    _moveLayer = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(id, x, y) {
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.n) {
          case 0:
            _context6.n = 1;
            return play({
              _obj: 'move',
              _target: [{
                _ref: 'layer',
                _id: id
              }],
              to: {
                _obj: 'offset',
                horizontal: px(x),
                vertical: px(y)
              }
            });
          case 1:
            return _context6.a(2);
        }
      }, _callee6);
    }));
    return _moveLayer.apply(this, arguments);
  }
  function replaceText(_x1, _x10, _x11, _x12, _x13) {
    return _replaceText.apply(this, arguments);
  }
  function _replaceText() {
    _replaceText = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(field, text, font, docId, layerId) {
      var layer, key, to, current, fit, after, _t4, _t5;
      return _regenerator().w(function (_context7) {
        while (1) switch (_context7.n) {
          case 0:
            _context7.n = 1;
            return getLayer(layerId, docId);
          case 1:
            layer = _context7.v;
            key = layer.textKey;
            if (!(!key || _typeof(key) !== 'object')) {
              _context7.n = 2;
              break;
            }
            throw new Error('لاير النص الأصلي غير موجود في القالب.');
          case 2:
            to = {
              _obj: 'textLayer',
              textKey: text
            };
            ['textStyleRange', 'paragraphStyleRange', 'textShape', 'transform', 'warp', 'antiAlias', 'orientation', 'textClickPoint', 'gridding'].forEach(function (k) {
              if (key[k] !== undefined) to[k] = JSON.parse(JSON.stringify(key[k]));
            });
            ['textStyleRange', 'paragraphStyleRange'].forEach(function (k) {
              if (!to[k] || !to[k].length) return;
              // The supplied templates use one visual style per line. Extend that style to the complete new line.
              var range = to[k][0];
              range.from = 0;
              range.to = text.length + 1;
              to[k] = [range];
              if (k === 'textStyleRange') {
                range.textStyle = range.textStyle || {
                  _obj: 'textStyle'
                };
                range.textStyle.fontPostScriptName = font;
                delete range.textStyle.fontName;
                delete range.textStyle.fontStyleName;
                delete range.textStyle.fontAvailable;
              }
            });
            _context7.n = 3;
            return play({
              _obj: 'set',
              _target: [{
                _ref: 'textLayer',
                _id: layer.layerID
              }],
              to: to
            });
          case 3:
            _t4 = bounds;
            _context7.n = 4;
            return getLayer(layer.layerID, docId);
          case 4:
            current = _t4(_context7.v);
            fit = layout.fit(current, field.bounds);
            _context7.n = 5;
            return scaleLayer(layer.layerID, fit.scale);
          case 5:
            _t5 = bounds;
            _context7.n = 6;
            return getLayer(layer.layerID, docId);
          case 6:
            after = _t5(_context7.v);
            _context7.n = 7;
            return moveLayer(layer.layerID, fit.centerX - (after[0] + after[2]) / 2, fit.centerY - (after[1] + after[3]) / 2);
          case 7:
            return _context7.a(2);
        }
      }, _callee7);
    }));
    return _replaceText.apply(this, arguments);
  }
  function makeMaskedGroup(_x14, _x15, _x16, _x17) {
    return _makeMaskedGroup.apply(this, arguments);
  }
  function _makeMaskedGroup() {
    _makeMaskedGroup = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(template, sourceId, name, ids) {
      var i, group, b;
      return _regenerator().w(function (_context8) {
        while (1) switch (_context8.n) {
          case 0:
            i = 0;
          case 1:
            if (!(i < ids.length)) {
              _context8.n = 3;
              break;
            }
            _context8.n = 2;
            return selectLayer(ids[i], i > 0);
          case 2:
            i++;
            _context8.n = 1;
            break;
          case 3:
            _context8.n = 4;
            return play({
              _obj: 'make',
              _target: [{
                _ref: 'layerSection'
              }],
              from: {
                _ref: 'layer',
                _enum: 'ordinal',
                _value: 'targetEnum'
              },
              using: {
                _obj: 'layerSection',
                name: name
              }
            });
          case 4:
            _context8.n = 5;
            return namedLayer(name, sourceId);
          case 5:
            group = _context8.v;
            b = template.bounds;
            _context8.n = 6;
            return play({
              _obj: 'set',
              _target: [{
                _ref: 'channel',
                _property: 'selection'
              }],
              to: {
                _obj: 'rectangle',
                left: px(b[0]),
                top: px(b[1]),
                right: px(b[2]),
                bottom: px(b[3])
              }
            });
          case 6:
            _context8.n = 7;
            return selectLayer(group.layerID, false);
          case 7:
            _context8.n = 8;
            return play({
              _obj: 'make',
              "new": {
                _class: 'channel'
              },
              at: {
                _ref: 'channel',
                _enum: 'channel',
                _value: 'mask'
              },
              using: {
                _enum: 'userMaskEnabled',
                _value: 'revealSelection'
              }
            });
          case 8:
            _context8.n = 9;
            return play({
              _obj: 'set',
              _target: [{
                _ref: 'channel',
                _property: 'selection'
              }],
              to: {
                _enum: 'ordinal',
                _value: 'none'
              }
            });
          case 9:
            return _context8.a(2, group.layerID);
        }
      }, _callee8);
    }));
    return _makeMaskedGroup.apply(this, arguments);
  }
  function docIds() {
    return _docIds.apply(this, arguments);
  }
  function _docIds() {
    _docIds = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
      var count, ids, i, d;
      return _regenerator().w(function (_context9) {
        while (1) switch (_context9.n) {
          case 0:
            _context9.n = 1;
            return play({
              _obj: 'get',
              _target: [{
                _property: 'numberOfDocuments'
              }, {
                _ref: 'application',
                _enum: 'ordinal',
                _value: 'targetEnum'
              }]
            });
          case 1:
            count = _context9.v;
            ids = [];
            i = 1;
          case 2:
            if (!(i <= count.numberOfDocuments)) {
              _context9.n = 5;
              break;
            }
            _context9.n = 3;
            return play({
              _obj: 'get',
              _target: [{
                _ref: 'document',
                _index: i
              }]
            });
          case 3:
            d = _context9.v;
            ids.push(d.documentID);
          case 4:
            i++;
            _context9.n = 2;
            break;
          case 5:
            return _context9.a(2, ids);
        }
      }, _callee9);
    }));
    return _docIds.apply(this, arguments);
  }
  function run(_x18, _x19) {
    return _run.apply(this, arguments);
  }
  function _run() {
    _run = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(request, mode) {
      var follow, valid, task, _t15;
      return _regenerator().w(function (_context1) {
        while (1) switch (_context1.p = _context1.n) {
          case 0:
            if (!busy) {
              _context1.n = 1;
              break;
            }
            throw new Error('فيه كتابة بتتضاف حاليًا؛ استنى نهايتها.');
          case 1:
            follow = mode === 'active-document' || request.followActiveDocument === true;
            valid = layout.validate(request, catalog);
            busy = true;
            task = /*#__PURE__*/function () {
              var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(context) {
                var target, sourceId, sourceOwned, importedId, history, complete, stage, name, cancelled, resolved, plan, fonts, folder, entry, existing, token, originalLayers, _iterator, _step, label, layer, fieldIds, i, sourceGroup, before, after, left, top, detail, cleanupError, _t6, _t7, _t8, _t9, _t0, _t1, _t10, _t11, _t12, _t13, _t14;
                return _regenerator().w(function (_context0) {
                  while (1) switch (_context0.p = _context0.n) {
                    case 0:
                      cancelled = function _cancelled() {
                        if (context && context.isCancelled) throw new Error('اتلغت إضافة الكتابة.');
                      };
                      target = null, sourceId = null, sourceOwned = false, importedId = null, history = null, complete = false, stage = 'فتح قالب الكتابة';
                      name = 'QAYEM · كتابة · ' + valid.template.label + ' · ' + Date.now() + '-' + ++sequence;
                      _context0.p = 1;
                      _context0.p = 2;
                      if (!(ps.app && ps.app.documents && ps.app.documents.length === 0)) {
                        _context0.n = 3;
                        break;
                      }
                      throw new Error('افتح مشروعًا في Photoshop ثم اضغط إضافة الكتابة.');
                    case 3:
                      _context0.n = 5;
                      break;
                    case 4:
                      _context0.p = 4;
                      _t6 = _context0.v;
                      throw new Error(_t6.message || 'تعذّر قراءة المشروع.');
                    case 5:
                      _t7 = info;
                      _context0.n = 6;
                      return getDoc();
                    case 6:
                      target = _t7(_context0.v);
                      if (!(!follow && (Number(request.documentId) !== target.id || Number(request.documentWidth) !== target.width || Number(request.documentHeight) !== target.height))) {
                        _context0.n = 7;
                        break;
                      }
                      throw new Error('المشروع المفتوح أو مقاسه اتغير. اضغط إضافة الكتابة مرة تانية.');
                    case 7:
                      resolved = Object.assign({}, request);
                      if (follow) Object.assign(resolved, {
                        documentId: target.id,
                        documentWidth: target.width,
                        documentHeight: target.height,
                        manualPlacement: true,
                        position: 'center',
                        widthPercent: target.height / target.width > 1.05 ? 85 : 65,
                        marginPercent: 4,
                        offsetX: 0,
                        offsetY: 0
                      });
                      _context0.n = 8;
                      return installedFonts(true);
                    case 8:
                      target.fonts = _context0.v;
                      plan = layout.plan(target.width, target.height, valid.template.bounds, resolved), fonts = layout.fonts(valid.template, request.fontMode, target.fonts);
                      _context0.n = 9;
                      return storage.getPluginFolder();
                    case 9:
                      folder = _context0.v;
                      _context0.n = 10;
                      return folder.getEntry(valid.template.file);
                    case 10:
                      entry = _context0.v;
                      _context0.n = 11;
                      return docIds();
                    case 11:
                      existing = _context0.v;
                      cancelled();
                      token = storage.createSessionToken(entry);
                      _context0.n = 12;
                      return play({
                        _obj: 'open',
                        "null": {
                          _path: token,
                          _kind: 'local'
                        },
                        forceNotify: true
                      });
                    case 12:
                      _context0.n = 13;
                      return getDoc();
                    case 13:
                      sourceId = _context0.v.documentID;
                      if (!(!sourceId || sourceId === target.id || existing.includes(sourceId))) {
                        _context0.n = 14;
                        break;
                      }
                      throw new Error('تعذّر فتح نسخة مستقلة من القالب، أو القالب مفتوح بالفعل. اقفله الأول ثم جرّب الإضافة.');
                    case 14:
                      sourceOwned = true;
                      stage = 'قراءة لايرات القالب';
                      // Resolve every original name before text changes can rename layers or create name collisions.
                      originalLayers = [];
                      _iterator = _createForOfIteratorHelper(valid.template.visibleNames);
                      _context0.p = 15;
                      _iterator.s();
                    case 16:
                      if ((_step = _iterator.n()).done) {
                        _context0.n = 20;
                        break;
                      }
                      label = _step.value;
                      _context0.n = 17;
                      return namedLayer(label, sourceId);
                    case 17:
                      layer = _context0.v;
                      if (layer.visible) {
                        _context0.n = 18;
                        break;
                      }
                      throw new Error('تعذّر العثور على لاير القالب الظاهر: ' + label);
                    case 18:
                      originalLayers.push({
                        name: label,
                        id: layer.layerID
                      });
                    case 19:
                      _context0.n = 16;
                      break;
                    case 20:
                      _context0.n = 22;
                      break;
                    case 21:
                      _context0.p = 21;
                      _t8 = _context0.v;
                      _iterator.e(_t8);
                    case 22:
                      _context0.p = 22;
                      _iterator.f();
                      return _context0.f(22);
                    case 23:
                      fieldIds = valid.template.fields.map(function (field) {
                        var layer = originalLayers.find(function (item) {
                          return item.name === field.layerName;
                        });
                        if (!layer) throw new Error('لاير النص الأصلي غير موجود في القالب: ' + field.layerName);
                        return layer.id;
                      });
                      stage = 'تحديث النصوص';
                      _context0.n = 24;
                      return play({
                        _obj: 'imageSize',
                        resolution: {
                          _unit: 'densityUnit',
                          _value: target.resolution
                        },
                        resample: false
                      });
                    case 24:
                      i = 0;
                    case 25:
                      if (!(i < valid.template.fields.length)) {
                        _context0.n = 27;
                        break;
                      }
                      cancelled();
                      _context0.n = 26;
                      return replaceText(valid.template.fields[i], valid.texts[i], fonts.selected[i], sourceId, fieldIds[i]);
                    case 26:
                      i++;
                      _context0.n = 25;
                      break;
                    case 27:
                      stage = 'تجميع لايرات الكتابة';
                      _context0.n = 28;
                      return makeMaskedGroup(valid.template, sourceId, name, originalLayers.map(function (layer) {
                        return layer.id;
                      }));
                    case 28:
                      sourceGroup = _context0.v;
                      cancelled();
                      // Position in the temporary source, preserving the user's target selection.
                      // Track the mask rectangle through the group's affine transform, including off-canvas artwork.
                      stage = 'ضبط حجم الكتابة ومكانها';
                      _context0.n = 29;
                      return play({
                        _obj: 'select',
                        _target: [{
                          _ref: 'channel',
                          _enum: 'channel',
                          _value: 'RGB'
                        }]
                      });
                    case 29:
                      _t9 = bounds;
                      _context0.n = 30;
                      return getLayer(sourceGroup, sourceId);
                    case 30:
                      before = _t9(_context0.v);
                      _context0.n = 31;
                      return scaleLayer(sourceGroup, plan.scale);
                    case 31:
                      _t0 = bounds;
                      _context0.n = 32;
                      return getLayer(sourceGroup, sourceId);
                    case 32:
                      after = _t0(_context0.v);
                      left = after[0] + (valid.template.bounds[0] - before[0]) * plan.scale;
                      top = after[1] + (valid.template.bounds[1] - before[1]) * plan.scale;
                      _context0.n = 33;
                      return moveLayer(sourceGroup, plan.x - left, plan.y - top);
                    case 33:
                      stage = 'نقل الكتابة إلى مشروعك';
                      if (!(context && context.hostControl && context.hostControl.suspendHistory)) {
                        _context0.n = 35;
                        break;
                      }
                      _context0.n = 34;
                      return context.hostControl.suspendHistory({
                        documentID: target.id,
                        name: 'QAYEM · إضافة كتابة'
                      });
                    case 34:
                      history = _context0.v;
                    case 35:
                      _context0.n = 36;
                      return play({
                        _obj: 'duplicate',
                        _target: [{
                          _ref: 'layer',
                          _id: sourceGroup
                        }],
                        to: {
                          _ref: 'document',
                          _id: target.id
                        },
                        version: 5
                      });
                    case 36:
                      _context0.n = 37;
                      return selectDoc(target.id);
                    case 37:
                      _context0.n = 38;
                      return namedLayer(name, target.id);
                    case 38:
                      importedId = _context0.v.layerID;
                      _context0.n = 39;
                      return selectLayer(importedId, false);
                    case 39:
                      cancelled();
                      complete = true;
                      return _context0.a(2, {
                        name: valid.template.label,
                        fonts: fonts.selected,
                        missingFonts: fonts.missing,
                        document: target
                      });
                    case 40:
                      _context0.p = 40;
                      _t1 = _context0.v;
                      detail = 'QAYEM 1.24.31 · ' + stage + ': ' + String(_t1.message || _t1);
                      if (!target) {
                        _context0.n = 49;
                        break;
                      }
                      _context0.p = 41;
                      _context0.n = 42;
                      return selectDoc(target.id);
                    case 42:
                      if (importedId) {
                        _context0.n = 46;
                        break;
                      }
                      _context0.p = 43;
                      _context0.n = 44;
                      return namedLayer(name, target.id);
                    case 44:
                      importedId = _context0.v.layerID;
                      _context0.n = 46;
                      break;
                    case 45:
                      _context0.p = 45;
                      _t10 = _context0.v;
                    case 46:
                      if (!importedId) {
                        _context0.n = 47;
                        break;
                      }
                      _context0.n = 47;
                      return play({
                        _obj: 'delete',
                        _target: [{
                          _ref: 'layer',
                          _id: importedId
                        }]
                      });
                    case 47:
                      _context0.n = 49;
                      break;
                    case 48:
                      _context0.p = 48;
                      _t11 = _context0.v;
                      throw new Error(detail + '\nتعذّر إزالة المجموعة غير المكتملة؛ راجع لايرات QAYEM أو استخدم Undo.');
                    case 49:
                      throw new Error(detail);
                    case 50:
                      _context0.p = 50;
                      cleanupError = null;
                      if (!(history !== null)) {
                        _context0.n = 54;
                        break;
                      }
                      _context0.p = 51;
                      _context0.n = 52;
                      return context.hostControl.resumeHistory(history, complete);
                    case 52:
                      _context0.n = 54;
                      break;
                    case 53:
                      _context0.p = 53;
                      _t12 = _context0.v;
                      cleanupError = new Error('تعذّر إنهاء سجل التراجع. راجع مجموعة QAYEM في المشروع.');
                    case 54:
                      if (!sourceOwned) {
                        _context0.n = 58;
                        break;
                      }
                      _context0.p = 55;
                      _context0.n = 56;
                      return play({
                        _obj: 'close',
                        _target: [{
                          _ref: 'document',
                          _id: sourceId
                        }],
                        saving: {
                          _enum: 'yesNo',
                          _value: 'no'
                        }
                      });
                    case 56:
                      _context0.n = 58;
                      break;
                    case 57:
                      _context0.p = 57;
                      _t13 = _context0.v;
                      cleanupError = new Error('تعذّر قفل نسخة القالب المؤقتة. اقفلها بدون حفظ؛ راجع مجموعة QAYEM في مشروعك.');
                    case 58:
                      if (!target) {
                        _context0.n = 62;
                        break;
                      }
                      _context0.p = 59;
                      _context0.n = 60;
                      return selectDoc(target.id);
                    case 60:
                      _context0.n = 62;
                      break;
                    case 61:
                      _context0.p = 61;
                      _t14 = _context0.v;
                    case 62:
                      if (!cleanupError) {
                        _context0.n = 63;
                        break;
                      }
                      throw cleanupError;
                    case 63:
                      return _context0.f(50);
                    case 64:
                      return _context0.a(2);
                  }
                }, _callee0, null, [[59, 61], [55, 57], [51, 53], [43, 45], [41, 48], [15, 21, 22, 23], [2, 4], [1, 40, 50, 64]]);
              }));
              return function task(_x20) {
                return _ref.apply(this, arguments);
              };
            }();
            _context1.p = 2;
            if (!(!legacyApi && ps.core && typeof ps.core.executeAsModal === 'function')) {
              _context1.n = 4;
              break;
            }
            _context1.n = 3;
            return ps.core.executeAsModal(task, {
              commandName: 'QAYEM · إضافة كتابة'
            });
          case 3:
            _t15 = _context1.v;
            _context1.n = 6;
            break;
          case 4:
            _context1.n = 5;
            return task(null);
          case 5:
            _t15 = _context1.v;
          case 6:
            return _context1.a(2, _t15);
          case 7:
            _context1.p = 7;
            busy = false;
            return _context1.f(7);
          case 8:
            return _context1.a(2);
        }
      }, _callee1, null, [[2,, 7, 8]]);
    }));
    return _run.apply(this, arguments);
  }
  return {
    documentInfo: documentInfo,
    run: run,
    runActive: function runActive(request) {
      return run(request, 'active-document');
    }
  };
}
if (typeof module !== 'undefined') module.exports = {
  createTextTemplateEngine: createTextTemplateEngine
};

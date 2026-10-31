function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var QayemTrends = function () {
  'use strict';

  var items = [],
    category = 'egypt',
    request = 0,
    session = '';
  var tabs = {
    egypt: 'qTrendEgypt',
    social: 'qTrendSocial',
    design: 'qTrendDesign',
    pinterest: 'qTrendPinterest'
  };
  function $(id) {
    return document.getElementById(id);
  }
  function node(tag, text) {
    var n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function date(iso) {
    if (!iso) return 'لم تصدر نشرة بعد';
    var d = new Date(iso);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Africa/Cairo'
    });
  }
  function safe(v) {
    return typeof v === 'string' && /^https:\/\/[^\s]+$/i.test(v) && v.indexOf('@') < 0;
  }
  function use(item) {
    var target = $('teacherIdea'),
      mode = $('teacherDesignType');
    if (!target || !mode) return;
    if (!mode.value) {
      mode.value = 'normal';
      mode.dispatchEvent(new Event('change', {
        bubbles: true
      }));
    }
    if (target.value.indexOf(item.idea) < 0) target.value = (target.value.trim() ? target.value.trim() + '\n\n' : '') + item.idea;
    target.dispatchEvent(new Event('input', {
      bubbles: true
    }));
    QayemNavigation.show('teacherView');
    target.focus();
  }
  function source(item) {
    if (!safe(item.sourceUrl)) return;
    try {
      if (typeof QAYEM_CEP_HOST !== 'undefined' && QAYEM_CEP_HOST) QayemCEPBridge.openExternal(item.sourceUrl);else window.open(item.sourceUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      $('qTrendStatus').textContent = 'افتح المصدر يدويًا: ' + item.sourceUrl;
    }
  }
  function execution(item, card) {
    var plan = node('div');
    plan.className = 'qTrendExecution';
    plan.appendChild(node('h3', 'خطة تنفيذ مقترحة'));
    if (item.useCases) {
      plan.appendChild(node('strong', 'مناسب لـ'));
      plan.appendChild(node('p', item.useCases));
    }
    if (item.visualNotes) {
      plan.appendChild(node('strong', 'التكوين والألوان والإضاءة'));
      plan.appendChild(node('p', item.visualNotes));
    }
    var steps = Array.isArray(item.executionSteps) ? item.executionSteps.slice(0, 8).filter(function (x) {
      return typeof x === 'string' && x.trim();
    }) : [];
    if (steps.length) {
      var list = node('ol');
      steps.forEach(function (step) {
        list.appendChild(node('li', step));
      });
      plan.appendChild(list);
    } else plan.appendChild(node('p', 'راجع مثال المصدر، وحدد العناصر المناسبة لهوية مشروعك قبل التنفيذ.'));
    card.appendChild(plan);
  }
  function paint() {
    Object.keys(tabs).forEach(function (key) {
      $(tabs[key]).setAttribute('aria-pressed', String(category === key));
    });
    var intro = $('qTrendSocialIntro');
    intro.hidden = category !== 'social';
    intro.style.display = category === 'social' ? 'block' : 'none';
    var grid = $('qTrendItems');
    grid.textContent = '';
    var visible = items.filter(function (x) {
      return x.category === category;
    });
    if (!visible.length) {
      grid.appendChild(node('p', category === 'pinterest' ? 'مختارات Pinterest هتظهر هنا بعد نشرها. تقدر تستكشف أفكار وتصاميم مناسبة لمصر من الزر ده.' : category === 'social' ? 'لسه مفيش أمثلة منشورة للسوشيال حاليًا. جرّب تحديث النشرة لاحقًا.' : 'لا توجد كروت منشورة في القسم ده حاليًا.'));
      if (category === 'pinterest') {
        var explore = node('button', 'استكشف Pinterest');
        explore.type = 'button';
        explore.onclick = function () {
          source({
            sourceUrl: 'https://www.pinterest.com/search/pins/?q=' + encodeURIComponent('تصاميم سوشيال ميديا مصر')
          });
        };
        grid.appendChild(explore);
      }
      return;
    }
    visible.forEach(function (item) {
      var social = item.category === 'social',
        card = node('article');
      card.className = 'qTrendCard';
      var art = node('div');
      art.className = 'qTrendArt ' + (item.category === 'egypt' ? 'qTrendEgypt' : social ? 'qTrendSocial' : 'qTrendDesign');
      if (safe(item.imageUrl)) {
        var img = node('img');
        img.src = item.imageUrl;
        img.alt = social ? 'مثال بصري من مصدر التصميم' : 'معاينة من مصدر الترند';
        img.loading = 'lazy';
        img.referrerPolicy = 'no-referrer';
        img.onerror = function () {
          img.hidden = true;
          if (social) art.appendChild(node('p', 'تعذّر تحميل المعاينة. افتح المصدر لمشاهدة التصميم.'));
        };
        art.appendChild(img);
      }
      var badge = node('span', item.category === 'egypt' ? 'مصر · ترندات البحث' : social ? 'سوشيال · فكرة وتنفيذ' : item.category === 'pinterest' ? item.provenance === 'pinterest_search_eg' ? 'Pinterest · بحث لمصر' : 'Pinterest · مختارات قيم' : 'اتجاهات وإلهام');
      art.appendChild(badge);
      card.appendChild(art);
      card.appendChild(node('h2', item.title));
      card.appendChild(node('p', item.description));
      var idea = node('div');
      idea.className = 'qTrendIdea';
      idea.appendChild(node('strong', 'فكرة لشغلك'));
      idea.appendChild(node('p', item.idea));
      card.appendChild(idea);
      if (social) execution(item, card);
      var label = item.sourceName + ' · ' + date(item.sourcePublishedAt || item.collectedAt) + (item.stale ? ' · محتوى سابق؛ تعذّر تحديث المصدر' : '');
      if (social) label = item.sourceName + ' · ' + (item.sourcePublishedAt ? 'تاريخ المصدر: ' + date(item.sourcePublishedAt) : 'تاريخ الجمع: ' + date(item.collectedAt)) + (item.stale ? ' · محتوى سابق؛ تعذّر تحديث المصدر' : '');
      card.appendChild(node('small', label));
      if (social && item.sourcePublishedAt && item.collectedAt) card.appendChild(node('small', 'أضيف للنشرة: ' + date(item.collectedAt)));
      if (item.category === 'pinterest' && item.query) card.appendChild(node('small', 'كلمة البحث: ' + item.query));
      var row = node('div');
      row.className = 'qToolRow qTrendActions';
      var apply = node('button', 'استخدم الفكرة');
      apply.type = 'button';
      apply.className = 'primary';
      apply.addEventListener('click', function () {
        use(item);
      });
      row.appendChild(apply);
      var link = node('button', 'فتح المصدر');
      link.type = 'button';
      link.addEventListener('click', function () {
        source(item);
      });
      row.appendChild(link);
      card.appendChild(row);
      grid.appendChild(card);
    });
  }
  function load() {
    return _load.apply(this, arguments);
  }
  function _load() {
    _load = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var auth, token, seq, data, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            auth = typeof QayemAuth !== 'undefined' ? QayemAuth : null;
            if (!(!auth || !auth.getToken())) {
              _context.n = 1;
              break;
            }
            return _context.a(2);
          case 1:
            token = auth.getToken();
            if (token !== session) {
              items = [];
              session = token;
              paint();
            }
            seq = ++request;
            $('qTrendStatus').textContent = 'جاري تحميل نشرة الأسبوع…';
            $('qTrendReload').disabled = true;
            _context.p = 2;
            _context.n = 3;
            return auth.api('GET', '/api/trends');
          case 3:
            data = _context.v;
            if (!(seq !== request || session !== auth.getToken())) {
              _context.n = 4;
              break;
            }
            return _context.a(2);
          case 4:
            items = Array.isArray(data.items) ? data.items : [];
            $('qTrendUpdated').textContent = 'آخر تحديث: ' + date(data.lastPublishedAt) + ' · توقيت مصر';
            $('qTrendStatus').textContent = '';
            paint();
            _context.n = 6;
            break;
          case 5:
            _context.p = 5;
            _t = _context.v;
            if (seq === request) $('qTrendStatus').textContent = _t.status === 404 ? 'حدّث سيرفر الداش بورد لإتاحة قسم الترندات.' : _t.message || 'تعذّر تحميل النشرة. جرّب إعادة التحميل.';
          case 6:
            _context.p = 6;
            if (seq === request) $('qTrendReload').disabled = false;
            return _context.f(6);
          case 7:
            return _context.a(2);
        }
      }, _callee, null, [[2, 5, 6, 7]]);
    }));
    return _load.apply(this, arguments);
  }
  Object.keys(tabs).forEach(function (key) {
    $(tabs[key]).addEventListener('click', function () {
      category = key;
      paint();
    });
  });
  $('qTrendReload').addEventListener('click', load);
  return {
    enter: function enter(id) {
      if (id === 'trendsView') load();
    },
    onSession: function onSession() {
      var tok = typeof QayemAuth !== 'undefined' ? QayemAuth.getToken() : '';
      if (tok !== session) {
        request++;
        items = [];
        session = tok;
        paint();
        $('qTrendStatus').textContent = '';
        $('qTrendUpdated').textContent = '';
      }
    }
  };
}();

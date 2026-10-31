function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// Localization is a display layer: form values and generated prompt text are never translated.
var QAYEM_UI_LANGUAGE = 'ar';
function qayemUiText(source) {
  if (QAYEM_UI_LANGUAGE !== 'en') return source;
  var raw = String(source);
  if (!/[\u0600-\u06ff]/.test(raw)) return raw;
  var trim = raw.trim(),
    digits = function digits(s) {
      return s.replace(/[٠-٩]/g, function (c) {
        return '٠١٢٣٤٥٦٧٨٩'.indexOf(c);
      });
    };
  if (QAYEM_UI_EN[trim]) return raw.replace(trim, QAYEM_UI_EN[trim]);
  var numbered = /^([\d٠-٩]+)\s*([·—])\s*(.+)$/.exec(trim);
  if (numbered) {
    var translated = qayemUiText(numbered[3]);
    if (translated !== numbered[3]) return digits(numbered[1]) + ' ' + numbered[2] + ' ' + translated;
  }
  var t = trim;
  if (/^النسخة [\d٠-٩]+/.test(t)) t = t.replace(/^النسخة ([\d٠-٩]+)/, function (_, n) {
    return 'Instance ' + digits(n);
  });
  if (/^[\d٠-٩]+ شخصيات$/.test(t)) return digits(t).replace('شخصيات', 'characters');
  if (/^[\d٠-٩]+ نسخ$/.test(t)) return digits(t).replace('نسخ', 'instances');
  if (/^الشخصية [\d٠-٩]+/.test(t)) t = t.replace(/^الشخصية ([\d٠-٩]+)/, function (_, n) {
    return 'Character ' + digits(n);
  });
  if (/^[\d٠-٩]+ من [\d٠-٩]+ أكشن ريتتش$/.test(t)) return digits(t).replace(' من ', ' of ').replace(' أكشن ريتتش', ' retouch actions');
  if (t.startsWith('أرفق ') && t.includes(' صورة مع البروبت')) return t.replace(/^أرفق ([\d٠-٩]+) صورة مع البروبت في أداة التوليد، بنفس الترتيب. رفع الصور مش داخل البلاجين\.$/, function (_, n) {
    return 'Attach ' + digits(n) + ' image(s) with the prompt in your generator, in this order. Images are not uploaded in the plugin.';
  });
  if (t.startsWith('الحجم الحالي ')) return digits(t).replace('الحجم الحالي ', 'Current size ').replace(' بالمئة. اضغط للرجوع إلى 100 بالمئة', ' percent. Click to reset to 100 percent');
  t = t.replace(/([\d]+) مم — /g, '$1 mm — ').replace(/واسعة جدًا/g, 'ultra-wide').replace(/واسعة معتدلة/g, 'moderately wide').replace(/واسعة/g, 'wide').replace(/طبيعية/g, 'natural').replace(/بورتريه/g, 'portrait');
  var replacements = QAYEM_UI_REPLACEMENTS;
  replacements.forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      ar = _ref2[0],
      en = _ref2[1];
    if (t.includes(ar)) t = t.split(ar).join(en);
  });
  return t === trim ? raw : raw.replace(trim, digits(t));
}
var QAYEM_UI_REPLACEMENTS = Object.keys(QAYEM_UI_EN).filter(function (k) {
  return k.length > 1;
}).sort(function (a, b) {
  return b.length - a.length;
}).map(function (k) {
  return [k, QAYEM_UI_EN[k]];
});
(function () {
  var key = 'qayem.ui.language.v1',
    select = document.getElementById('uiLanguage'),
    root = document.documentElement;
  var texts = new WeakMap(),
    attrs = new WeakMap();
  var pending = false,
    observer = null,
    poll = null;
  try {
    var saved = localStorage.getItem(key);
    if (saved === 'en' || saved === 'ar') QAYEM_UI_LANGUAGE = saved;
  } catch (ignored) {}
  function updateText(node) {
    var now = node.nodeValue;
    if (!now || !now.trim()) return;
    var prior = texts.get(node),
      source = prior && now === prior.output ? prior.source : now;
    var output = QAYEM_UI_LANGUAGE === 'en' ? qayemUiText(source) : source;
    texts.set(node, {
      source: source,
      output: output
    });
    if (now !== output) node.nodeValue = output;
  }
  function walk(element) {
    if (!element) return;
    if (element.nodeType === 3) {
      updateText(element);
      return;
    }
    if (element.nodeType !== 1) return;
    var tag = String(element.tagName).toLowerCase();
    if (['script', 'style', 'textarea'].includes(tag) || element.getAttribute('data-qayem-no-translate') !== null) return;
    var prior = attrs.get(element) || {};
    ['placeholder', 'title', 'aria-label'].forEach(function (name) {
      var now = element.getAttribute(name);
      if (!now) return;
      var old = prior[name],
        source = old && now === old.output ? old.source : now,
        output = QAYEM_UI_LANGUAGE === 'en' ? qayemUiText(source) : source;
      prior[name] = {
        source: source,
        output: output
      };
      if (now !== output) element.setAttribute(name, output);
    });
    attrs.set(element, prior);
    // Textarea values are protected, but their placeholder/accessibility labels are localized.
    Array.from(element.childNodes).forEach(function (child) {
      if (child.nodeType === 1 && String(child.tagName).toLowerCase() === 'textarea') {
        var priorArea = attrs.get(child) || {};
        ['placeholder', 'title', 'aria-label'].forEach(function (name) {
          var now = child.getAttribute(name);
          if (!now) return;
          var old = priorArea[name],
            source = old && now === old.output ? old.source : now,
            output = QAYEM_UI_LANGUAGE === 'en' ? qayemUiText(source) : source;
          priorArea[name] = {
            source: source,
            output: output
          };
          if (now !== output) child.setAttribute(name, output);
        });
        attrs.set(child, priorArea);
      } else walk(child);
    });
  }
  function apply() {
    pending = false;
    walk(document.body);
  }
  function schedule() {
    if (pending) return;
    pending = true;
    setTimeout(apply, 0);
  }
  function language(value, persist) {
    QAYEM_UI_LANGUAGE = value === 'en' ? 'en' : 'ar';
    select.value = QAYEM_UI_LANGUAGE;
    root.setAttribute('lang', QAYEM_UI_LANGUAGE);
    root.setAttribute('dir', QAYEM_UI_LANGUAGE === 'en' ? 'ltr' : 'rtl');
    if (persist) {
      try {
        localStorage.setItem(key, QAYEM_UI_LANGUAGE);
      } catch (ignored) {
        document.getElementById('uiLanguageStatus').textContent = QAYEM_UI_LANGUAGE === 'en' ? 'Language changed for this session; it could not be saved.' : 'تم تغيير اللغة للجلسة الحالية؛ تعذّر حفظ الاختيار.';
      }
    }
    apply();
    if (!observer && typeof setInterval === 'function') {
      if (poll) {
        clearInterval(poll);
        poll = null;
      }
      if (QAYEM_UI_LANGUAGE === 'en') poll = setInterval(schedule, 1500);
    }
  }
  select.addEventListener('change', function () {
    return language(select.value, true);
  });
  // Older UXP hosts can omit MutationObserver. DOM events and a feature-detected timer cover updates.
  if (typeof MutationObserver === 'function') {
    observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label']
    });
  }
  ['click', 'change', 'input', 'copy', 'keydown'].forEach(function (event) {
    return document.addEventListener(event, function () {
      schedule();
      setTimeout(schedule, 100);
    }, false);
  });
  language(QAYEM_UI_LANGUAGE, false);
})();

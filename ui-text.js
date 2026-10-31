// Native UXP controls need an explicit box; never replace their value or caret.
(function () {
  var fields = [], pending = false, mirror = null;
  function scale() {
    var match = /(?:^|\s)uiScale(\d+)(?:\s|$)/.exec(document.body.className);
    return match ? Number(match[1]) / 100 : 1;
  }
  function setStyle(node, key, value) { if (node.style[key] !== value) node.style[key] = value; }
  function lineCount(text, columns) {
    return String(text || '').split(/\r\n|\r|\n/).reduce(function (sum, line) {
      return sum + Math.max(1, Math.ceil(line.length / columns));
    }, 0);
  }
  function measure(node, text, width, font, line, s) {
    if (!mirror) {
      mirror = document.createElement('div');
      mirror.setAttribute('data-qayem-no-translate', 'true');
      mirror.setAttribute('aria-hidden', 'true');
      mirror.style.position = 'absolute'; mirror.style.left = '0'; mirror.style.top = '0';
      mirror.style.visibility = 'hidden'; mirror.style.whiteSpace = 'pre-wrap';
      mirror.style.wordWrap = 'break-word'; mirror.style.overflowWrap = 'break-word';
      mirror.style.padding = '0'; mirror.style.margin = '0';
      document.body.appendChild(mirror);
    }
    mirror.style.width = Math.max(30, width - Math.round(22 * s) - 2) + 'px';
    mirror.style.fontFamily = typeof window.getComputedStyle === 'function' ? window.getComputedStyle(node).fontFamily : 'DIN Next LT W23'; mirror.style.fontSize = font + 'px';
    mirror.style.fontWeight = 'normal'; mirror.style.lineHeight = line + 'px';
    mirror.setAttribute('dir', node.getAttribute('dir') || 'auto');
    // A final marker preserves the height of a trailing empty line.
    mirror.textContent = String(text || '') + '\u200b';
    return Number(mirror.clientHeight) || 0;
  }
  function fit(node, reveal) {
    if (!node || !node.parentNode) return;
    var s = scale(), font = Math.round(13 * s), line = Math.ceil(font * 1.65);
    setStyle(node, 'fontSize', font + 'px');
    setStyle(node, 'lineHeight', line + 'px');
    setStyle(node, 'padding', Math.round(8 * s) + 'px ' + Math.round(11 * s) + 'px');
    if (String(node.tagName).toLowerCase() === 'input') {
      setStyle(node, 'height', Math.ceil(46 * s) + 'px');
      setStyle(node, 'minHeight', Math.ceil(46 * s) + 'px');
      return;
    }
    var preview = /Preview$|^preview$/.test(node.id);
    var idea = /idea/i.test(node.id);
    var base = preview ? 6 : idea ? 4 : 3;
    // Count wraps even when older native UXP reports no useful scrollHeight.
    var width = Number(node.clientWidth) || Number(node.parentNode.clientWidth) || 280;
    var columns = Math.max(8, Math.floor((width - Math.ceil(38 * s)) / (font * .78)));
    var growing = !preview || node.getAttribute('data-qayem-editing') === 'true';
    var measured = growing ? measure(node, node.value, width, font, line, s) : 0;
    var lines = growing ? Math.max(base, measured ? Math.ceil(measured / line) + 1 : lineCount(node.value, columns) + 1) : base;
    var padding = Math.ceil(24 * s), height = lines * line + padding;
    var rows = String(lines);
    if (node.getAttribute('rows') !== rows) node.setAttribute('rows', rows);
    setStyle(node, 'height', height + 'px');
    setStyle(node, 'minHeight', (base * line + padding) + 'px');
    setStyle(node, 'maxHeight', 'none');
    if (reveal && growing && measured && document.activeElement === node) {
      var main = document.querySelector('main');
      if (!main || typeof node.getBoundingClientRect !== 'function') return;
      var end = typeof node.selectionEnd === 'number' ? node.selectionEnd : node.value.length;
      var caretHeight = measure(node, node.value.slice(0, end), width, font, line, s);
      var rect = node.getBoundingClientRect(), viewport = main.getBoundingClientRect();
      var caret = rect.top + Math.round(8 * s) + caretHeight;
      if (caret > viewport.bottom - line) main.scrollTop += caret - viewport.bottom + line * 2;
      else if (caret < viewport.top + line) main.scrollTop -= viewport.top + line - caret;
    }
  }
  function register(node) {
    if (node.getAttribute('data-qayem-text') || node.getAttribute('data-qayem-clipboard')) return;
    var tag = String(node.tagName).toLowerCase();
    if (tag !== 'textarea' && (tag !== 'input' || !['text', 'search', ''].includes(node.type))) return;
    node.setAttribute('data-qayem-text', 'true');
    if (tag === 'textarea') {
      node.classList.add('qayemLongText');
      node.setAttribute('wrap', 'soft');
      node.addEventListener('input', function () {
        node.setAttribute('data-qayem-editing', 'true');
        fit(node, true);
        setTimeout(function () { fit(node, true); }, 0);
      });
    }
    node.addEventListener('focus', function () { fit(node, false); });
    fields.push(node); fit(node, false);
  }
  function refresh() {
    pending = false;
    Array.from(document.querySelectorAll('main input, main textarea')).forEach(register);
    fields.forEach(function (node) { fit(node, false); });
  }
  function schedule() { if (!pending) { pending = true; setTimeout(refresh, 0); } }
  document.addEventListener('click', schedule);
  document.addEventListener('change', schedule);
  if (typeof window.addEventListener === 'function') window.addEventListener('resize', schedule);
  if (typeof MutationObserver === 'function') {
    new MutationObserver(schedule).observe(document.querySelector('main'), {childList:true, subtree:true});
    new MutationObserver(schedule).observe(document.body, {attributes:true, attributeFilter:['class']});
  }
  refresh();
})();

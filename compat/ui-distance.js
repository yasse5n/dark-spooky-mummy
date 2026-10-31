// Local preview only; the original select remains the saved/prompt value.
function createQayemDistanceControl(id, legacy) {
  var source = document.getElementById(id);
  if (!source || !source.options.length) return;
  var entries = [],
    order = legacy ? ['far', 'close', 'veryClose'] : ['farther', 'normal', 'close', 'veryClose'];
  order.forEach(function (value) {
    for (var i = 0; i < source.options.length; i++) if (source.options[i].value === value) entries.push({
      option: source.options[i],
      value: value,
      index: i
    });
  });
  if (entries.length !== source.options.length) return; // Keep an unfamiliar source as a native control.
  function node(tag, cls, parent) {
    var n = document.createElement(tag);
    n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }
  function words(ar, en) {
    return document.documentElement.getAttribute('lang') === 'en' ? en : ar;
  }
  function setText(n, value) {
    if (n.textContent !== value) n.textContent = value;
  }
  var panel = node('div', 'qayemDistance');
  panel.id = id + 'Distance';
  panel.setAttribute('data-qayem-no-translate', 'true');
  var stage = node('div', 'qayemDistanceStage', panel),
    image = node('img', 'qayemDistanceImage', stage);
  image.alt = '';
  ['tl', 'tr', 'bl', 'br'].forEach(function (p) {
    var c = node('span', 'qayemFinderCorner qayemCorner' + p, stage);
    c.setAttribute('aria-hidden', 'true');
  });
  var badge = node('span', 'qayemDistanceBadge', stage),
    controls = node('div', 'qayemDistanceControls', panel);
  controls.setAttribute('dir', 'ltr');
  var minus = node('button', 'qayemDistanceStep', controls);
  minus.type = 'button';
  minus.textContent = '−';
  var middle = node('div', 'qayemDistanceMiddle', controls),
    range = node('input', 'qayemDistanceRange', middle);
  range.type = 'range';
  range.min = '0';
  range.max = String(entries.length - 1);
  range.step = '1';
  range.id = id + 'DistanceRange';
  var ticks = node('div', 'qayemDistanceTicks', middle),
    buttons = [];
  var plus = node('button', 'qayemDistanceStep', controls);
  plus.type = 'button';
  plus.textContent = '+';
  var note = node('div', 'qayemDistanceNote', panel);
  note.setAttribute('aria-live', 'polite');
  function at() {
    for (var i = 0; i < entries.length; i++) if (entries[i].value === source.value) return i;
    return 0;
  }
  function choose(index) {
    index = Math.max(0, Math.min(entries.length - 1, index));
    if (source.disabled || entries[index].option.disabled) return;
    var changed = source.value !== entries[index].value;
    for (var i = 0; i < source.options.length; i++) {
      var match = i === entries[index].index;
      source.options[i].selected = match;
      if (match) source.options[i].setAttribute('selected', '');else source.options[i].removeAttribute('selected');
    }
    source.value = entries[index].value;
    source.setAttribute('value', source.value);
    if (changed) source.dispatchEvent(new Event('change', {
      bubbles: true
    }));
    refresh();
  }
  entries.forEach(function (entry, index) {
    var button = node('button', 'qayemDistanceTick', ticks);
    button.type = 'button';
    button.setAttribute('data-distance-value', entry.value);
    var img = node('img', 'qayemDistanceMini', button);
    img.alt = '';
    img.src = 'icons/studio/zoom-' + entry.value + '.png';
    var dot = node('span', 'qayemDistanceDot', button);
    dot.setAttribute('aria-hidden', 'true');
    node('span', 'qayemDistanceLabel', button);
    button.addEventListener('click', function () {
      choose(index);
    });
    buttons.push(button);
  });
  function _short(entry) {
    var names = {
      far: ['بعيد', 'Far'],
      farther: ['أبعد قليلًا', 'Farther'],
      normal: ['طبيعي', 'Natural'],
      close: [legacy ? 'قريب' : 'قريب', 'Close'],
      veryClose: ['قريب جدًا', 'Very close']
    };
    return words(names[entry.value][0], names[entry.value][1]);
  }
  function align() {
    var a = buttons[0].getBoundingClientRect(),
      b = buttons[buttons.length - 1].getBoundingClientRect(),
      m = ticks.getBoundingClientRect();
    if (!m.width || !a.width || !b.width) return;
    var first = a.left + a.width / 2,
      last = b.left + b.width / 2,
      thumb = 18;
    var width = Math.max(thumb, last - first + thumb) + 'px',
      margin = first - m.left - thumb / 2 + 'px';
    if (range.style.width !== width) range.style.width = width;
    if (range.style.marginLeft !== margin) range.style.marginLeft = margin;
    range.style.marginRight = '0px';
  }
  function refresh() {
    var index = at(),
      value = source.value,
      path = 'icons/studio/zoom-' + value + '.png';
    if (image.getAttribute('src') !== path) image.src = path;
    image.alt = entries[index].option.textContent;
    setText(badge, _short(entries[index]));
    range.value = String(index);
    range.disabled = source.disabled;
    range.setAttribute('aria-label', words('بعد الشخص عن الكاميرا', 'Subject distance from camera'));
    range.setAttribute('aria-valuetext', entries[index].option.textContent);
    minus.disabled = source.disabled || index === 0;
    plus.disabled = source.disabled || index === entries.length - 1;
    minus.setAttribute('aria-label', words('إبعاد الكاميرا', 'Move camera farther'));
    plus.setAttribute('aria-label', words('تقريب الكاميرا', 'Move camera closer'));
    buttons.forEach(function (button, i) {
      var active = i === index;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
      button.disabled = source.disabled || entries[i].option.disabled;
      setText(button.querySelector('.qayemDistanceLabel'), _short(entries[i]));
      button.setAttribute('title', entries[i].option.textContent);
    });
    var messages = {
      far: words('مساحة خلفية أكبر، مع الحفاظ على الكادر المحدد.', 'More background within the selected crop.'),
      farther: words('مساحة خلفية أكبر بدون ظهور البنطلون.', 'More background; no trousers in the crop.'),
      normal: words('كادر طبيعي ومتزن للشخص.', 'A natural, balanced subject crop.'),
      close: words(legacy ? 'من الرأس حتى الخصر.' : 'تركيز أقرب على الوجه والصدر.', legacy ? 'Head to waist.' : 'A closer focus on the face and chest.'),
      veryClose: words('اقتراب شديد بالعدسة من الوجه، مع ظهور الجزء المتاح من الكتفين.', 'Move the lens very close to the face; shoulders may extend beyond the frame.')
    };
    setText(note, messages[value] || '');
    var scale = /(?:^|\s)uiScale(\d+)(?:\s|$)/.exec(document.body.className);
    scale = scale ? Number(scale[1]) / 100 : 1;
    panel.style.fontSize = Math.round(12 * scale) + 'px';
    image.style.height = Math.round(134 * scale) + 'px';
    align();
    setTimeout(align, 0);
  }
  minus.addEventListener('click', function () {
    choose(at() - 1);
  });
  plus.addEventListener('click', function () {
    choose(at() + 1);
  });
  ['input', 'change'].forEach(function (type) {
    range.addEventListener(type, function () {
      choose(Number(range.value));
    });
  });
  range.addEventListener('keydown', function (event) {
    var next = at();
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next++;else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next--;else if (event.key === 'Home') next = 0;else if (event.key === 'End') next = entries.length - 1;else return;
    event.preventDefault();
    choose(next);
  });
  source.addEventListener('change', refresh);
  window.addEventListener('resize', align);
  ['click', 'change'].forEach(function (type) {
    document.addEventListener(type, function () {
      setTimeout(align, 0);
    });
  });
  ['uiLanguage', 'uiScaleSmaller', 'uiScaleLarger', 'uiScaleReset'].forEach(function (key) {
    var control = document.getElementById(key);
    if (control) control.addEventListener(key === 'uiLanguage' ? 'change' : 'click', function () {
      refresh();
      setTimeout(refresh, 100);
    });
  });
  if (typeof MutationObserver === 'function') new MutationObserver(refresh).observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
  source.parentNode.insertBefore(panel, source.nextSibling);
  refresh();
  source.classList.add('qayemChoiceSource');
  source.style.display = 'none';
  source.setAttribute('aria-hidden', 'true');
  source.setAttribute('tabindex', '-1');
  var label = document.getElementById(source.getAttribute('aria-labelledby'));
  if (label) label.addEventListener('click', function () {
    range.focus();
  });
}
['cameraDistance', 'multiCameraDistance', 'teacherNormal_cameraDistance', 'doctorNormal_cameraDistance'].forEach(function (id) {
  try {
    createQayemDistanceControl(id, false);
  } catch (ignored) {/* Native source remains available if enhancement cannot initialize. */}
});
['teacherCameraDistance', 'doctorCameraDistance'].forEach(function (id) {
  try {
    createQayemDistanceControl(id, true);
  } catch (ignored) {/* Core prompt generation never depends on this preview. */}
});

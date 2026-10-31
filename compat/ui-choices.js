// Visual choices keep the original select as the single source of prompt values.
// Plain elements and local PNGs work in CEP and older UXP; no Spectrum dependency.
(function () {
  var groups = [],
    pending = false;
  var targets = {
    doctorCinematic_framing: 'framing',
    doctorCinematic_position: 'position',
    doctorPosition: 'position',
    doctorNormal_perspectivePreset: 'camera',
    cos_framing: 'framing',
    cos_position: 'position',
    cos_perspective: 'camera',
    teacherCinematic_framing: 'framing',
    teacherCinematic_position: 'position',
    teacherPosition: 'position',
    surrealPosition: 'position',
    perspectivePreset: 'camera',
    multiPerspectivePreset: 'camera'
  };
  function icon(kind, option) {
    var value = option.value;
    if (!value || value === 'idea') return 'idea';
    if (kind === 'position') return 'position-' + value;
    if (kind === 'framing') return 'frame-' + value;
    if (kind === 'teacherDistance') return 'frame-' + ({
      close: 'close',
      far: 'farther',
      veryClose: 'veryClose'
    }[value] || 'close');
    if (kind === 'distance') return 'frame-' + ({
      normal: 'close',
      close: 'chest',
      veryClose: 'veryClose',
      farther: 'farther'
    }[value] || 'close');
    var camera = {
      eye: 'eye',
      low: 'low',
      dramaticLow: 'dramatic-low',
      high: 'high',
      elevated: 'elevated',
      rightOrbit: 'right',
      leftOrbit: 'left',
      tilted: 'tilted'
    };
    if (camera[value]) return 'camera-' + camera[value];
    // Preset values are full prompt paragraphs; match stable English identifiers.
    var keys = ['EYE-LEVEL', 'VISIBLE LOW-ANGLE', 'STRONG LOW-ANGLE', 'VISIBLE HIGH-ANGLE', 'STRONG ELEVATED', "CAMERA ORBIT TO VIEWER'S RIGHT", "CAMERA ORBIT TO VIEWER'S LEFT", 'CLOSE CAMERA', 'LOW OFF-AXIS', 'VISIBLE DUTCH'];
    var names = ['eye', 'low', 'dramatic-low', 'high', 'elevated', 'right', 'left', 'near', 'off-axis', 'tilted'];
    for (var i = 0; i < keys.length; i++) if (value.indexOf(keys[i]) === 0) return 'camera-' + names[i];
    return 'idea';
  }
  var cameraCategories = [['basic', 'أساسي', 'Basic'], ['low', 'سفلي', 'Low'], ['high', 'علوي', 'High'], ['side', 'جانبي', 'Side'], ['special', 'خاص', 'Special']];
  var cameraGroups = {
    idea: 'basic',
    eye: 'basic',
    near: 'basic',
    low: 'low',
    'dramatic-low': 'low',
    'off-axis': 'low',
    high: 'high',
    elevated: 'high',
    right: 'side',
    left: 'side',
    tilted: 'special'
  };
  var cameraNames = {
    idea: ['اختار المنظور', 'Choose view'],
    eye: ['مستوى العين', 'Eye level'],
    near: ['قريب من العدسة', 'Close camera'],
    low: ['أسفل قليلًا', 'Slightly low'],
    'dramatic-low': ['أسفل درامي', 'Dramatic low'],
    'off-axis': ['أسفل جانبي', 'Low off-axis'],
    high: ['أعلى قليلًا', 'Slightly high'],
    elevated: ['أعلى تحريري', 'Elevated view'],
    right: ['يمين الكادر', 'Camera right'],
    left: ['شمال الكادر', 'Camera left'],
    tilted: ['زاوية مائلة', 'Tilted view']
  };
  function words(ar, en) {
    return document.documentElement.getAttribute('lang') === 'en' ? en : ar;
  }
  function node(tag, cls, parent) {
    var n = document.createElement(tag);
    n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }
  function corners(parent) {
    ['tl', 'tr', 'bl', 'br'].forEach(function (pos) {
      var c = node('span', 'qayemFinderCorner qayemCorner' + pos, parent);
      c.setAttribute('aria-hidden', 'true');
    });
  }
  function enabled(record, index) {
    var o = record.select.options[index];
    return o && !o.disabled && !record.select.disabled;
  }
  function visibleIndices(record) {
    var indices = [];
    for (var i = 0; i < record.cards.length; i++) if (enabled(record, i) && (record.kind !== 'camera' || record.keys[i] === record.tab)) indices.push(i);
    return indices;
  }
  function showTab(record, key, focus) {
    record.tab = key;
    refresh();
    if (focus) record.tabs[key].focus();
  }
  function setupCamera(record) {
    var shell = node('div', 'qayemViewfinder');
    shell.id = record.select.id + 'Viewfinder';
    shell.setAttribute('data-qayem-no-translate', 'true');
    record.group.parentNode.insertBefore(shell, record.group);
    record.tabBar = node('div', 'qayemCameraTabs', shell);
    record.tabBar.setAttribute('role', 'tablist');
    var panel = node('div', 'qayemFinderPanel', shell);
    panel.id = record.select.id + 'FinderPanel';
    panel.setAttribute('role', 'tabpanel');
    record.panel = panel;
    panel.appendChild(record.group);
    record.group.classList.add('qayemFinderGrid');
    record.summary = node('div', 'qayemFinderSummary', shell);
    record.summaryText = node('span', 'qayemFinderSelection', record.summary);
    record.summaryText.setAttribute('aria-live', 'polite');
    record.previewButton = node('button', 'qayemFinderPreviewButton', record.summary);
    record.previewButton.type = 'button';
    record.previewButton.setAttribute('aria-expanded', 'false');
    record.preview = node('div', 'qayemFinderPreview', shell);
    record.preview.id = record.select.id + 'FinderPreview';
    record.preview.hidden = true;
    record.preview.style.display = 'none';
    record.previewButton.setAttribute('aria-controls', record.preview.id);
    record.previewImage = node('img', 'qayemFinderPreviewImage', record.preview);
    record.previewImage.alt = '';
    corners(record.preview);
    record.previewButton.addEventListener('click', function () {
      var open = record.previewButton.getAttribute('aria-expanded') !== 'true';
      record.previewButton.setAttribute('aria-expanded', String(open));
      record.preview.hidden = !open;
      if (open) record.preview.removeAttribute('hidden');else record.preview.setAttribute('hidden', '');
      record.preview.style.display = open ? 'flex' : 'none';
      refresh();
    });
    record.cards.forEach(function (card, index) {
      var code = icon('camera', record.select.options[index]),
        key = code.replace(/^camera-/, '');
      record.keys[index] = cameraGroups[key] || 'special';
      card.classList.add('qayemFinderChoice');
      card.setAttribute('data-camera-code', key);
      var img = card.querySelector('img'),
        stage = node('div', 'qayemFinderStage');
      card.insertBefore(stage, img);
      stage.appendChild(img);
      img.src = 'icons/studio/' + code + '.png';
      corners(stage);
      var check = node('span', 'qayemFinderCheck', stage);
      check.textContent = '✓';
      check.setAttribute('aria-hidden', 'true');
    });
    cameraCategories.forEach(function (category) {
      if (record.keys.indexOf(category[0]) < 0) return;
      var tab = node('button', 'qayemCameraTab', record.tabBar);
      tab.type = 'button';
      tab.id = record.select.id + 'Tab_' + category[0];
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      record.tabs[category[0]] = tab;
      tab.addEventListener('click', function () {
        showTab(record, category[0], false);
      });
      tab.addEventListener('keydown', function (event) {
        var list = cameraCategories.filter(function (c) {
            return !!record.tabs[c[0]];
          }),
          at = list.indexOf(category),
          next = at,
          key = event.key;
        if (key === 'Home') next = 0;else if (key === 'End') next = list.length - 1;else if (key === 'ArrowRight' || key === 'ArrowLeft') {
          var rtl = document.documentElement.getAttribute('dir') === 'rtl';
          next = (at + ((rtl ? key === 'ArrowRight' : key === 'ArrowLeft') ? -1 : 1) + list.length) % list.length;
        } else return;
        event.preventDefault();
        showTab(record, list[next][0], true);
      });
    });
  }
  function choose(record, index, focus) {
    var option = record.select.options[index];
    if (!option || record.select.disabled || option.disabled) return;
    var changed = record.select.value !== option.value;
    // Older UXP needs the selected option attribute, in addition to .value.
    for (var i = 0; i < record.select.options.length; i++) {
      var selected = i === index;
      record.select.options[i].selected = selected;
      if (selected) record.select.options[i].setAttribute('selected', '');else record.select.options[i].removeAttribute('selected');
    }
    record.select.value = option.value;
    record.select.setAttribute('value', option.value);
    if (changed) record.select.dispatchEvent(new Event('change', {
      bubbles: true
    }));
    if (record.kind === 'camera') record.tab = record.keys[index];
    refresh();
    if (focus) record.cards[index].focus();
  }
  function build(select, kind) {
    if (!select || !select.options.length) return;
    var group = document.createElement('div');
    group.className = 'qayemChoiceGrid';
    group.id = select.id + 'Choices';
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('data-qayem-no-translate', 'true');
    var labelledBy = select.getAttribute('aria-labelledby');
    if (labelledBy) group.setAttribute('aria-labelledby', labelledBy);else group.setAttribute('aria-label', select.getAttribute('aria-label') || select.id);
    select.parentNode.insertBefore(group, select.nextSibling);
    var record = {
      select: select,
      group: group,
      cards: [],
      kind: kind,
      keys: [],
      tabs: {},
      tab: 'basic',
      lastValue: null
    };
    for (var i = 0; i < select.options.length; i++) (function (index) {
      var option = select.options[index],
        card = document.createElement('div');
      card.className = 'qayemChoice';
      card.setAttribute('role', 'radio');
      card.setAttribute('data-choice-index', String(index));
      var img = document.createElement('img');
      img.className = 'qayemChoiceIcon';
      img.src = 'icons/studio/' + icon(kind, option) + '.png';
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      var text = document.createElement('span');
      text.className = 'qayemChoiceText';
      text.textContent = option.textContent;
      card.appendChild(img);
      card.appendChild(text);
      group.appendChild(card);
      record.cards.push(card);
      card.addEventListener('click', function () {
        choose(record, index, true);
      });
      card.addEventListener('keydown', function (event) {
        var list = visibleIndices(record),
          at = list.indexOf(index),
          next = at,
          key = event.key;
        if (key === 'Enter' || key === ' ') {
          event.preventDefault();
          choose(record, index, false);
          return;
        }
        if (key === 'Home') next = 0;else if (key === 'End') next = list.length - 1;else if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'ArrowRight' || key === 'ArrowLeft') {
          var rtl = document.documentElement.getAttribute('dir') === 'rtl';
          var backward = key === 'ArrowUp' || (rtl ? key === 'ArrowRight' : key === 'ArrowLeft');
          next = (at + (backward ? -1 : 1) + list.length) % list.length;
        } else return;
        event.preventDefault();
        if (list.length) choose(record, list[next], true);
      });
    })(i);
    if (kind === 'camera') setupCamera(record);
    // Only hide a dropdown after its full visual replacement has been built.
    select.classList.add('qayemChoiceSource');
    select.style.display = 'none';
    select.setAttribute('aria-hidden', 'true');
    select.setAttribute('tabindex', '-1');
    select.addEventListener('change', schedule);
    if (labelledBy) {
      var title = document.getElementById(labelledBy);
      if (title) title.addEventListener('click', function () {
        var index = select.selectedIndex;
        if (record.kind === 'camera') {
          record.tab = record.keys[index];
          refresh();
        }
        if (enabled(record, index)) record.cards[index].focus();
      });
    }
    groups.push(record);
  }
  function style(node, name, value) {
    if (node.style[name] !== value) node.style[name] = value;
  }
  function refresh() {
    pending = false;
    var match = /(?:^|\s)uiScale(\d+)(?:\s|$)/.exec(document.body.className);
    var scale = match ? Number(match[1]) / 100 : 1;
    groups.forEach(function (record) {
      var camera = record.kind === 'camera',
        selected = record.select.selectedIndex;
      if (camera) {
        if (record.lastValue !== record.select.value) {
          record.tab = record.keys[selected] || record.keys[0];
          record.lastValue = record.select.value;
        }
        cameraCategories.forEach(function (c) {
          var t = record.tabs[c[0]];
          if (!t) return;
          var active = record.tab === c[0];
          var text = words(c[1], c[2]);
          if (t.textContent !== text) t.textContent = text;
          t.setAttribute('aria-selected', String(active));
          t.setAttribute('tabindex', active ? '0' : '-1');
          style(t, 'fontSize', Math.round(12 * scale) + 'px');
          style(t, 'minHeight', Math.round(32 * scale) + 'px');
        });
        record.tabBar.setAttribute('aria-label', words('فئات منظور الكاميرا', 'Camera view categories'));
        record.panel.setAttribute('aria-labelledby', record.select.id + 'Tab_' + record.tab);
        var option = record.select.options[selected],
          caption = words('المحدد: ', 'Selected: ') + (option ? option.textContent : '');
        if (record.summaryText.textContent !== caption) record.summaryText.textContent = caption;
        var previewLabel = record.previewButton.getAttribute('aria-expanded') === 'true' ? words('إغلاق المعاينة', 'Close preview') : words('معاينة', 'Preview');
        if (record.previewButton.textContent !== previewLabel) record.previewButton.textContent = previewLabel;
        if (option) {
          var path = 'icons/studio/' + icon('camera', option) + '.png';
          if (record.previewImage.getAttribute('src') !== path) record.previewImage.src = path;
          record.previewImage.alt = option.textContent;
        }
      }
      var list = visibleIndices(record),
        first = list.length ? list[0] : -1;
      record.cards.forEach(function (card, index) {
        var option = record.select.options[index],
          active = record.select.value === option.value;
        card.classList.toggle('selected', active);
        card.setAttribute('aria-checked', String(active));
        var show = !camera || record.keys[index] === record.tab;
        card.hidden = !show;
        if (show) card.removeAttribute('hidden');else card.setAttribute('hidden', '');
        style(card, 'display', show ? 'flex' : 'none');
        card.setAttribute('tabindex', show && enabled(record, index) && (active || list.indexOf(selected) < 0 && index === first) ? '0' : '-1');
        card.setAttribute('aria-disabled', String(record.select.disabled || !!option.disabled));
        var text = card.querySelector('.qayemChoiceText');
        var names = cameraNames[card.getAttribute('data-camera-code')],
          caption = camera && names ? words(names[0], names[1]) : option.textContent;
        if (text.textContent !== caption) text.textContent = caption;
        card.setAttribute('aria-label', option.textContent);
        card.setAttribute('title', option.textContent);
        style(card, 'fontSize', Math.round(12 * scale) + 'px');
        style(card, 'lineHeight', Math.ceil(18 * scale) + 'px');
        style(card, 'minHeight', Math.ceil((camera ? 108 : 76) * scale) + 'px');
        style(card, 'padding', Math.round((camera ? 3 : 6) * scale) + 'px');
        var img = card.querySelector('img');
        style(img, 'width', Math.round((camera ? 82 : 44) * scale) + 'px');
        style(img, 'height', Math.round((camera ? 68 : 34) * scale) + 'px');
      });
    });
  }
  function schedule() {
    if (!pending) {
      pending = true;
      setTimeout(refresh, 0);
    }
  }
  Object.keys(targets).forEach(function (id) {
    build(document.getElementById(id), targets[id]);
  });
  // Translation runs before this script, and card text follows the original options.
  ['click', 'change'].forEach(function (name) {
    document.addEventListener(name, function () {
      schedule();
      setTimeout(schedule, 100);
    });
  });
  // Native controls can swallow bubbling events in older UXP.
  ['uiLanguage', 'uiScaleSmaller', 'uiScaleLarger', 'uiScaleReset'].forEach(function (id) {
    var control = document.getElementById(id);
    if (control) control.addEventListener(id === 'uiLanguage' ? 'change' : 'click', function () {
      schedule();
      setTimeout(schedule, 100);
    });
  });
  if (typeof MutationObserver === 'function') {
    new MutationObserver(schedule).observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
  refresh();
})();

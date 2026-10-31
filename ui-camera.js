// Perspective PNG scene, not a WebGL dependency. Original select owns prompt values.
function createQayemCameraControl(prefix) {
  var source = document.getElementById(prefix + '_angle');
  if (!source || !source.options.length) return;
  var height = 0, tilt = 0, dragging = false, pending = false;
  var levels = ['low', 'eye', 'high'];
  var panel = document.createElement('div');
  panel.id = prefix + '_angleCamera'; panel.className = 'qayemCamera';
  panel.setAttribute('data-qayem-no-translate', 'true');
  var labelledBy = source.getAttribute('aria-labelledby');
  panel.setAttribute('role', 'group');
  if (labelledBy) panel.setAttribute('aria-labelledby', labelledBy);
  function node(tag, cls, parent) {
    var e = document.createElement(tag); e.className = cls; parent.appendChild(e); return e;
  }
  var top = node('div', 'qayemCameraTop', panel);
  var status = node('span', 'qayemCameraStatus', top); status.setAttribute('aria-live', 'polite');
  var automatic = node('button', 'qayemCameraAuto', top); automatic.type = 'button';
  var stage = node('div', 'qayemCameraStage', panel);
  stage.setAttribute('role', 'slider'); stage.setAttribute('tabindex', '0');
  stage.setAttribute('aria-valuemin', '-1'); stage.setAttribute('aria-valuemax', '1');
  stage.setAttribute('aria-orientation', 'vertical');
  var image = node('img', 'qayemCameraScene', stage);
  image.alt = ''; image.setAttribute('aria-hidden', 'true'); image.setAttribute('draggable', 'false');
  var help = node('div', 'qayemCameraHelp', panel);
  var move = node('div', 'qayemCameraMove', panel);
  var down = node('button', 'qayemCameraStep', move); down.type = 'button'; down.textContent = '↓';
  var eye = node('button', 'qayemCameraEye', move); eye.type = 'button';
  var up = node('button', 'qayemCameraStep', move); up.type = 'button'; up.textContent = '↑';
  function rangeRow(id) {
    var row = node('div', 'qayemCameraRow', panel), label = node('label', 'qayemCameraLabel', row);
    var input = node('input', 'qayemCameraRange', row);
    input.id = id; input.type = 'range'; input.min = '-1'; input.max = '1'; input.step = '1'; input.value = '0';
    input.setAttribute('dir', 'ltr'); label.setAttribute('for', id);
    return {label:label, input:input};
  }
  var elevation = rangeRow(prefix + '_cameraHeight');
  var roll = rangeRow(prefix + '_cameraTilt');
  function words(ar, en) { return document.documentElement.getAttribute('lang') === 'en' ? en : ar; }
  function option(value) {
    for (var i = 0; i < source.options.length; i++) if (source.options[i].value === value) return source.options[i];
    return null;
  }
  function allowed(value) { var o = option(value); return o && !source.disabled && !o.disabled; }
  function choose(value) {
    if (!allowed(value)) return;
    var changed = source.value !== value;
    for (var i = 0; i < source.options.length; i++) {
      var selected = source.options[i].value === value;
      source.options[i].selected = selected;
      if (selected) source.options[i].setAttribute('selected', '');
      else source.options[i].removeAttribute('selected');
    }
    source.value = value; source.setAttribute('value', value);
    if (changed) source.dispatchEvent(new Event('change', {bubbles:true}));
    refresh();
  }
  function setHeight(value) {
    var next = Math.max(-1, Math.min(1, value));
    if (!allowed(levels[next + 1])) return;
    height = next; tilt = 0; choose(levels[height + 1]);
  }
  function setTilt(value) {
    var next = Math.max(-1, Math.min(1, value));
    if (!allowed(next ? 'tilted' : levels[height + 1])) return;
    if (next) height = 0;
    tilt = next; choose(tilt ? 'tilted' : levels[height + 1]);
  }
  function refresh() {
    pending = false;
    var value = source.value, selected = option(value);
    if (value === 'eye' || value === 'high' || value === 'low') { height = levels.indexOf(value) - 1; tilt = 0; }
    else if (value === 'tilted') { height = 0; if (!tilt) tilt = 1; }
    else if (value === 'idea') { height = 0; tilt = 0; }
    var path = 'icons/camera-scene/' + (value === 'tilted' && tilt < 0 ? 'tilted-left' : value) + '.png';
    if (image.getAttribute('src') !== path) image.src = path;
    panel.setAttribute('data-camera-angle', value);
    status.textContent = selected ? selected.textContent : '';
    automatic.textContent = option('idea').textContent;
    automatic.setAttribute('aria-pressed', String(value === 'idea')); automatic.disabled = !allowed('idea');
    eye.textContent = option('eye').textContent; eye.setAttribute('aria-pressed', String(value === 'eye')); eye.disabled = !allowed('eye');
    up.disabled = !allowed('high') || (value === 'high'); down.disabled = !allowed('low') || (value === 'low');
    up.setAttribute('aria-label', words('رفع الكاميرا', 'Raise camera'));
    down.setAttribute('aria-label', words('خفض الكاميرا', 'Lower camera'));
    elevation.label.textContent = words('ارتفاع الكاميرا', 'Camera height');
    roll.label.textContent = words('ميل الكادر', 'Frame tilt');
    help.textContent = words('اسحب الكاميرا لفوق أو لتحت، أو استخدم الأسهم.', 'Drag the camera up or down, or use the arrows.');
    stage.setAttribute('aria-label', words('ارتفاع الكاميرا — استخدم الأسهم لأعلى ولأسفل', 'Camera height — use the up and down arrows'));
    stage.setAttribute('aria-valuenow', String(height)); stage.setAttribute('aria-valuetext', status.textContent);
    stage.setAttribute('aria-disabled', String(source.disabled)); stage.setAttribute('tabindex', source.disabled ? '-1' : '0');
    elevation.input.value = String(height); roll.input.value = String(tilt);
    elevation.input.disabled = source.disabled; roll.input.disabled = !allowed('tilted');
    var match = /(?:^|\s)uiScale(\d+)(?:\s|$)/.exec(document.body.className), scale = match ? Number(match[1])/100 : 1;
    panel.style.fontSize = Math.round(13 * scale) + 'px';
    panel.style.lineHeight = Math.ceil(21 * scale) + 'px';
    stage.style.height = Math.round(190 * scale) + 'px';
    [automatic, down, eye, up].forEach(function (e) { e.style.fontSize = Math.round(12 * scale) + 'px'; e.style.minHeight = Math.ceil(31 * scale) + 'px'; });
  }
  function schedule() { if (!pending) { pending = true; setTimeout(refresh, 0); } }
  function dragAt(event) {
    var r = stage.getBoundingClientRect(); if (!r.height) return;
    var y = (event.clientY - r.top) / r.height;
    setHeight(y < .2475 ? 1 : y > .47875 ? -1 : 0);
  }
  function start(event) {
    if (source.disabled || (event.button !== undefined && event.button !== 0)) return;
    var r = stage.getBoundingClientRect();
    if (r.width && event.clientX > r.left + r.width * .56) return;
    dragging = true; event.preventDefault(); stage.focus(); dragAt(event);
    if (event.pointerId !== undefined && typeof stage.setPointerCapture === 'function') {
      try { stage.setPointerCapture(event.pointerId); } catch (_) {}
    }
  }
  function moveDrag(event) { if (dragging) { event.preventDefault(); dragAt(event); } }
  function end() { dragging = false; }
  stage.addEventListener('pointerdown', start); stage.addEventListener('mousedown', start);
  document.addEventListener('pointermove', moveDrag); document.addEventListener('mousemove', moveDrag);
  document.addEventListener('pointerup', end); document.addEventListener('mouseup', end);
  document.addEventListener('pointercancel', end); stage.addEventListener('lostpointercapture', end);
  window.addEventListener('blur', end);
  stage.addEventListener('keydown', function (event) {
    if (source.disabled) return;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); setHeight(height + (event.key === 'ArrowUp' ? 1 : -1)); }
    else if (event.key === 'Home') { event.preventDefault(); setHeight(0); }
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); setTilt(event.key === 'ArrowLeft' ? -1 : 1); }
    else if (event.key === 'Escape') { event.preventDefault(); choose('idea'); }
  });
  automatic.addEventListener('click', function () { choose('idea'); });
  up.addEventListener('click', function () { setHeight(height + 1); });
  down.addEventListener('click', function () { setHeight(height - 1); });
  eye.addEventListener('click', function () { setHeight(0); });
  ['input', 'change'].forEach(function (name) {
    elevation.input.addEventListener(name, function () { setHeight(Number(elevation.input.value)); });
    roll.input.addEventListener(name, function () { setTilt(Number(roll.input.value)); });
  });
  source.addEventListener('change', refresh);
  source.parentNode.insertBefore(panel, source.nextSibling);
  source.classList.add('qayemChoiceSource'); source.style.display = 'none';
  source.setAttribute('aria-hidden', 'true'); source.setAttribute('tabindex', '-1');
  if (labelledBy) {
    var title = document.getElementById(labelledBy);
    if (title) title.addEventListener('click', function () { stage.focus(); });
  }
  ['uiLanguage', 'uiScaleSmaller', 'uiScaleLarger', 'uiScaleReset'].forEach(function (id) {
    var control = document.getElementById(id);
    if (control) control.addEventListener(id === 'uiLanguage' ? 'change' : 'click', function () { schedule(); setTimeout(schedule, 100); });
  });
  if (typeof MutationObserver === 'function') {
    new MutationObserver(schedule).observe(document.body, {attributes:true, attributeFilter:['class']});
    new MutationObserver(schedule).observe(source, {attributes:true, childList:true, subtree:true, characterData:true});
  }
  refresh();
}
createQayemCameraControl("teacherCinematic");
createQayemCameraControl("doctorCinematic");

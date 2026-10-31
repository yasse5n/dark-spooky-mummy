// Small ES5 startup animation. No Photoshop calls, storage or font operations.
var QayemStartup = function () {
  var panel = document.getElementById('qayemStartup'),
    logo = document.getElementById('qayemStartupLogo'),
    bar = document.getElementById('qayemStartupSweep');
  var dots = [],
    timer = null,
    watchdog = null,
    frame = 0,
    closing = false,
    disposed = false,
    fade = 0,
    reduced = false;
  for (var i = 0; i < 3; i++) dots.push(document.getElementById('qayemStartupDot' + i));
  try {
    reduced = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (ignored) {}
  function clear() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
    if (watchdog !== null) {
      clearTimeout(watchdog);
      watchdog = null;
    }
  }
  function hide() {
    if (disposed) return;
    disposed = true;
    clear();
    if (panel) {
      panel.style.display = 'none';
      panel.setAttribute('hidden', '');
      panel.setAttribute('aria-hidden', 'true');
    }
  }
  function tick() {
    if (disposed || !panel) return;
    if (closing) {
      fade += 0.5;
      panel.style.opacity = String(Math.max(0, 1 - fade));
      if (fade >= 1) hide();
      return;
    }
    if (reduced || document.hidden === true) return;
    frame++;
    if (logo) logo.style.opacity = String(0.84 + 0.16 * (1 + Math.sin(frame / 3)) / 2);
    if (bar) bar.style.left = String(36 + 36 * Math.sin(frame / 4)) + '%';
    for (var j = 0; j < dots.length; j++) if (dots[j]) dots[j].style.opacity = j === Math.floor(frame / 2) % 3 ? '1' : '0.28';
  }
  function finish() {
    if (disposed || closing) return;
    closing = true;
    if (watchdog !== null) {
      clearTimeout(watchdog);
      watchdog = null;
    }
    if (reduced || timer === null) hide();
  }
  if (!panel) return {
    finish: function finish() {},
    dispose: function dispose() {}
  };
  // A static branded screen remains useful even if animation timers are unavailable.
  if (typeof setInterval === 'function') timer = setInterval(tick, 80);
  // Never leave the interface covered after a failed or missing startup module.
  if (typeof setTimeout === 'function') watchdog = setTimeout(hide, 8000);
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('beforeunload', hide);
    window.addEventListener('unload', hide);
  }
  return {
    finish: finish,
    dispose: hide
  };
}();

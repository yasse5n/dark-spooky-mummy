// Class-based pixel presets work without browser zoom or CSS transforms.
(function () {
  var levels = [80, 90, 100, 110, 120, 130, 140, 150];
  var key = "qayem.uiScalePercent";
  var smaller = document.getElementById("uiScaleSmaller");
  var larger = document.getElementById("uiScaleLarger");
  var reset = document.getElementById("uiScaleReset");
  var notice = document.getElementById("uiScaleNotice");
  var percent = 100;
  try {
    var stored = Number(window.localStorage.getItem(key));
    if (levels.includes(stored)) percent = stored;
  } catch (ignored) {/* Use the default if preferences are unavailable. */}
  function apply(save) {
    levels.forEach(function (level) {
      return document.body.classList.remove("uiScale" + level);
    });
    if (percent !== 100) document.body.classList.add("uiScale" + percent);
    reset.textContent = percent + "%";
    reset.setAttribute("aria-label", "الحجم الحالي " + percent + " بالمئة. اضغط للرجوع إلى 100 بالمئة");
    smaller.disabled = percent === levels[0];
    larger.disabled = percent === levels[levels.length - 1];
    if (save) {
      try {
        window.localStorage.setItem(key, String(percent));
        setUiHidden(notice, true);
      } catch (ignored) {
        notice.textContent = "الحجم الحالي متاح في هذه الجلسة؛ تعذّر حفظه للجلسة القادمة.";
        setUiHidden(notice, false);
      }
    }
  }
  smaller.addEventListener("click", function () {
    var i = levels.indexOf(percent);
    if (i > 0) {
      percent = levels[i - 1];
      apply(true);
    }
  });
  larger.addEventListener("click", function () {
    var i = levels.indexOf(percent);
    if (i < levels.length - 1) {
      percent = levels[i + 1];
      apply(true);
    }
  });
  reset.addEventListener("click", function () {
    percent = 100;
    apply(true);
  });
  apply(false);
})();

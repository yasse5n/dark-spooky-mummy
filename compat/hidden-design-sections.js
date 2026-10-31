// Experimental modes retained for reuse in later owner-requested sections.
// Owner's phrase: "ضيف العناصر المخفية". See HIDDEN_ELEMENTS_AR.md.
var QAYEM_HIDDEN_DESIGN_SECTIONS = [{
  button: "openSingle",
  screen: "singleView",
  enabled: false,
  label: "تصميم لشخص واحد"
}, {
  button: "openMulti",
  screen: "multiView",
  enabled: false,
  label: "تصميم لأشخاص متعددة"
}, {
  button: "openSurreal",
  screen: "surrealView",
  enabled: false,
  label: "تصميم صور مصغرة سريالية"
}];
function isQayemHiddenDesignScreen(screenId) {
  return QAYEM_HIDDEN_DESIGN_SECTIONS.some(function (section) {
    return section.screen === screenId && !section.enabled;
  });
}
QAYEM_HIDDEN_DESIGN_SECTIONS.forEach(function (section) {
  var button = document.getElementById(section.button);
  if (!button) return;
  setUiHidden(button, !section.enabled);
  button.classList.toggle("qayemArchivedEntry", !section.enabled);
  if (section.enabled) {
    button.removeAttribute("aria-hidden");
    button.removeAttribute("tabindex");
  } else {
    button.setAttribute("aria-hidden", "true");
    button.setAttribute("tabindex", "-1");
  }
});

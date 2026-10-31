// Navigation is bound before mode initialization and is independent of Photoshop APIs.
var QayemNavigation;
(function () {
  var screens = ["modeHome", "designMenuView", "singleView", "multiView", "surrealView", "teacherMenuView", "teacherView", "doctorView", "cosmeticsView", "retouchView", "textMenuView", "textTemplatesView", "typographyPromptsView", "textEffectsView", "gridView", "imagePromptView", "creditsView", "overlaysView", "trendsView", "pricingView"];
  var routes = {
    openPricing: "pricingView",
    openTrends: "trendsView",
    studioHomeBack: "modeHome",
    openGrid: "gridView",
    openCredits: "creditsView",
    openOverlays: "overlaysView",
    openImagePrompt: "imagePromptView",
    openTextTemplates: "textMenuView",
    backTextMenu: "modeHome",
    openTextShapes: "textTemplatesView",
    backTextTemplates: "textMenuView",
    openTypographyPrompts: "typographyPromptsView",
    backTypographyPrompts: "textMenuView",
    openTextEffects: "textEffectsView",
    backTextEffects: "textMenuView",
    openDesign: "designMenuView",
    backDesign: "modeHome",
    openSingle: "singleView",
    openMulti: "multiView",
    openSurreal: "surrealView",
    openTeacher: "teacherMenuView",
    openTeacherSocial: "teacherView",
    backTeacherMenu: "designMenuView",
    openDoctor: "doctorView",
    backDoctor: "designMenuView",
    openCosmetics: "cosmeticsView",
    openRetouch: "retouchView",
    backSingle: "designMenuView",
    backMulti: "designMenuView",
    backSurreal: "designMenuView",
    backTeacher: "teacherMenuView",
    backCosmetics: "designMenuView",
    backRetouch: "modeHome"
  };
  var currentScreen = "modeHome";
  function show(id) {
    if (isQayemHiddenDesignScreen(id)) return;
    if (!document.getElementById(id)) return;
    if (typeof QayemTrial !== 'undefined' && QayemTrial.canEnter && !QayemTrial.canEnter(id, true)) return;
    screens.forEach(function (screen) {
      return setUiHidden(document.getElementById(screen), screen !== id);
    });
    currentScreen = id;
    setUiHidden(document.getElementById("studioHomeBack"), id === "modeHome");
    if (typeof QayemDropdowns !== 'undefined') QayemDropdowns.close(false);
    if (typeof QayemTrends !== 'undefined') QayemTrends.enter(id);
    if (typeof QayemCredits !== "undefined") QayemCredits.enter(id);
    if (typeof QayemOverlays !== "undefined") QayemOverlays.enter(id);
    if (typeof QayemStudioTools !== "undefined") QayemStudioTools.enter(id);
    var main = document.querySelector("main");
    if (main) main.scrollTop = 0;
    if (typeof QayemStudioUI !== "undefined" && QayemStudioUI) QayemStudioUI.enter(id);
    if (typeof QayemUiState !== "undefined" && QayemUiState) QayemUiState.capture();
  }
  QayemNavigation = {
    show: show,
    current: function current() {
      return currentScreen;
    }
  };
  Object.keys(routes).forEach(function (id) {
    var element = document.getElementById(id);
    if (element) element.addEventListener("click", function () {
      return show(routes[id]);
    });
  });
  show("modeHome");
})();

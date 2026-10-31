function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* global SURREAL_PALETTES, SURREAL_REACTIONS, SURREAL_HANDS, buildSurrealThumbnailPrompt */
runUiInitializer("surrealView", function () {
  var node = function node(id) {
    return document.getElementById(id);
  };
  var promptCopy = createPromptCopyController({
    "button": "copySurrealPrompt",
    "preview": "surrealPreview",
    "status": "surrealStatus",
    "successText": "البرومبت اتنسخ. أرفق صورة الشخص أولًا، ثم صورة الملابس في أداة الصور.",
    build: makeSurrealPrompt
  });
  function populate(id, choices) {
    choices.forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        value = _ref2[0],
        label = _ref2[1];
      var option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      node(id).appendChild(option);
    });
  }
  populate("surrealPalette", SURREAL_PALETTES.map(function (item) {
    return [item.key, item.label];
  }).concat([["auto", "اقترح لي ألوان تلقائيًا"]]));
  populate("surrealReaction", SURREAL_REACTIONS);
  populate("surrealHand", SURREAL_HANDS);
  node("surrealHand").value = "relaxed";
  function invalidate() {
    promptCopy.invalidate();
  }
  function sync() {
    setUiHidden(node("surrealReactionFields"), node("surrealReaction").value !== "custom");
    setUiHidden(node("surrealHeldFields"), node("surrealHand").value !== "holding");
    setUiHidden(node("surrealHandFields"), node("surrealHand").value !== "custom");
    setUiHidden(node("surrealSceneFields"), node("surrealSceneMode").value !== "yes");
    setUiHidden(node("surrealForegroundFields"), node("surrealForegroundMode").value === "none");
    var swatches = node("surrealSwatches");
    while (swatches.firstChild) swatches.removeChild(swatches.firstChild);
    var palette = SURREAL_PALETTES.find(function (item) {
      return item.key === node("surrealPalette").value;
    });
    setUiHidden(swatches, !palette);
    if (palette) palette.colors.forEach(function (color) {
      var swatch = document.createElement("span");
      swatch.style.backgroundColor = color;
      swatches.appendChild(swatch);
    });
    invalidate();
  }
  ["surrealPosition", "surrealPalette", "surrealReaction", "surrealHand", "surrealSceneMode", "surrealForegroundMode", "surrealRecolor"].forEach(function (id) {
    return node(id).addEventListener("change", sync);
  });
  ["surrealReactionCustom", "surrealHeldObject", "surrealHandCustom", "surrealHandNote", "surrealSceneDescription", "surrealForegroundDescription"].forEach(function (id) {
    return node(id).addEventListener("input", invalidate);
  });
  function makeSurrealPrompt() {
    return buildSurrealThumbnailPrompt({
      position: node("surrealPosition").value,
      palette: node("surrealPalette").value,
      reaction: node("surrealReaction").value,
      reactionCustom: node("surrealReactionCustom").value,
      hand: node("surrealHand").value,
      heldObject: node("surrealHeldObject").value,
      handCustom: node("surrealHandCustom").value,
      handNote: node("surrealHandNote").value,
      sceneMode: node("surrealSceneMode").value,
      sceneDescription: node("surrealSceneDescription").value,
      foregroundMode: node("surrealForegroundMode").value,
      foregroundDescription: node("surrealForegroundDescription").value,
      recolor: node("surrealRecolor").value
    });
  }
  sync();
});

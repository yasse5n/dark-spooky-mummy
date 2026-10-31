function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
runUiInitializer("singleView", function () {
  var promptCopy = createPromptCopyController({
    "button": "copyPrompt",
    "preview": "preview",
    "status": "status",
    "successText": "البرومبت اتنسخ. أرفق صورة الشخص أولًا، وبعدها صورة الملابس في أداة الصور.",
    build: makePrompt
  });
  /* global buildPersonPrompt, CAMERA_PERSPECTIVES, BODY_ANGLES, FACE_GAZES, EXPRESSIONS, HAND_POSES, BACKGROUNDS */
  function el(id) {
    return document.getElementById(id);
  }
  function populate(id, presets, placeholder, defaultFirst) {
    var select = el(id);
    var empty = document.createElement("option");
    empty.value = "";
    empty.textContent = placeholder;
    select.appendChild(empty);
    presets.forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        label = _ref2[0],
        description = _ref2[1];
      var option = document.createElement("option");
      option.value = description;
      option.textContent = label;
      select.appendChild(option);
    });
    if (defaultFirst) select.value = presets[0][1];
  }
  function selectedValue(customId, presetId) {
    return el(customId).value.trim() || el(presetId).value;
  }
  function setStatus(message, isError) {
    var field = el("status");
    field.textContent = message;
    field.style.color = isError ? "#ff9a9d" : "#dde8ee";
  }
  function makePrompt() {
    var perspective = selectedValue("perspective", "perspectivePreset");
    var angle = selectedValue("angle", "anglePreset");
    var gaze = selectedValue("gaze", "gazePreset");
    var expression = selectedValue("expression", "expressionPreset");
    var hand = selectedValue("hand", "handPreset");
    var background = selectedValue("background", "backgroundPreset");
    if (!angle || !gaze || !hand) throw new Error("اختار زاوية الجسم واتجاه الوجه وحركة اليد، أو اكتب وصفك فيها.");
    return buildPersonPrompt({
      cameraPerspective: perspective,
      bodyAngle: angle,
      faceGaze: gaze,
      expression: expression,
      handAction: hand,
      background: background,
      backgroundType: el("backgroundType").value,
      roomColor: el("roomColor").value,
      roomIdea: el("roomIdea").value,
      skyTone: el("skyTone").value,
      cameraDistance: el("cameraDistance").value
    });
  }
  function invalidatePreview() {
    promptCopy.invalidate();
  }
  populate("perspectivePreset", CAMERA_PERSPECTIVES, "اختار منظور الكاميرا", true);
  populate("anglePreset", BODY_ANGLES, "اختار زاوية الجسم أو اكتبها تحت");
  populate("gazePreset", FACE_GAZES, "اختار اتجاه الوجه والنظرة أو اكتبه تحت");
  populate("expressionPreset", EXPRESSIONS, "اختار تعبير الوجه", true);
  populate("handPreset", HAND_POSES, "اختار حركة اليد أو اكتبها تحت");
  populate("backgroundPreset", BACKGROUNDS, "اختار الخلفية وألوانها", true);
  ["perspectivePreset", "anglePreset", "gazePreset", "expressionPreset", "handPreset", "backgroundPreset", "perspective", "angle", "gaze", "expression", "hand", "background", "roomColor", "roomIdea"].forEach(function (id) {
    el(id).addEventListener(id.endsWith("Preset") ? "change" : "input", invalidatePreview);
  });
  function syncBackgroundFields() {
    var type = el("backgroundType").value;
    setUiHidden(el("studioBackgroundFields"), type !== "studio");
    setUiHidden(el("roomBackgroundFields"), type !== "room");
    setUiHidden(el("skyBackgroundFields"), type !== "sky");
    invalidatePreview();
  }
  el("cameraDistance").addEventListener("change", invalidatePreview);
  el("skyTone").addEventListener("change", invalidatePreview);
  el("backgroundType").addEventListener("change", syncBackgroundFields);
  syncBackgroundFields();
});

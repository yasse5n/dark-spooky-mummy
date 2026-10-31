runUiInitializer("singleView", function () {
  const promptCopy = createPromptCopyController({"button": "copyPrompt", "preview": "preview", "status": "status", "successText": "البرومبت اتنسخ. أرفق صورة الشخص أولًا، وبعدها صورة الملابس في أداة الصور.", build: makePrompt});
/* global buildPersonPrompt, CAMERA_PERSPECTIVES, BODY_ANGLES, FACE_GAZES, EXPRESSIONS, HAND_POSES, BACKGROUNDS */
function el(id) { return document.getElementById(id); }

function populate(id, presets, placeholder, defaultFirst) {
  const select = el(id);
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = placeholder;
  select.appendChild(empty);
  presets.forEach(([label, description]) => {
    const option = document.createElement("option");
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
  const field = el("status");
  field.textContent = message;
  field.style.color = isError ? "#ff9a9d" : "#dde8ee";
}

function makePrompt() {
  const perspective = selectedValue("perspective", "perspectivePreset");
  const angle = selectedValue("angle", "anglePreset");
  const gaze = selectedValue("gaze", "gazePreset");
  const expression = selectedValue("expression", "expressionPreset");
  const hand = selectedValue("hand", "handPreset");
  const background = selectedValue("background", "backgroundPreset");
  if (!angle || !gaze || !hand) throw new Error("اختار زاوية الجسم واتجاه الوجه وحركة اليد، أو اكتب وصفك فيها.");
  return buildPersonPrompt({ cameraPerspective: perspective, bodyAngle: angle, faceGaze: gaze, expression, handAction: hand, background, backgroundType: el("backgroundType").value, roomColor: el("roomColor").value, roomIdea: el("roomIdea").value, skyTone: el("skyTone").value, cameraDistance: el("cameraDistance").value });
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
["perspectivePreset", "anglePreset", "gazePreset", "expressionPreset", "handPreset", "backgroundPreset",
 "perspective", "angle", "gaze", "expression", "hand", "background", "roomColor", "roomIdea"].forEach(id => {
  el(id).addEventListener(id.endsWith("Preset") ? "change" : "input", invalidatePreview);
});
function syncBackgroundFields() {
  const type = el("backgroundType").value;
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

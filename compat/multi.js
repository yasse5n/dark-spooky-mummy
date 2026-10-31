function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* global CAMERA_PERSPECTIVES, BODY_ANGLES, FACE_GAZES, EXPRESSIONS, HAND_POSES, BACKGROUNDS, OUTFIT_VARIATIONS, buildMultiPersonPrompt */
runUiInitializer("multiView", function () {
  function node(id) {
    return document.getElementById(id);
  }
  var promptCopy = createPromptCopyController({
    "button": "copyMultiPrompt",
    "preview": "multiPreview",
    "status": "multiStatus",
    "successText": "البرومبت اتنسخ. أرفق صورة الشخص ثم صورة اللبس في أداة الصور.",
    build: collect
  });
  var bodyOptions = [0, 3, 4, 7, 8, 9, 10, 17].map(function (index) {
    return BODY_ANGLES[index];
  });
  var gazeOptions = [0, 1, 2, 5, 6, 7, 10, 11].map(function (index) {
    return FACE_GAZES[index];
  });
  var expressionOptions = [0, 1, 2, 4, 5, 6].map(function (index) {
    return EXPRESSIONS[index];
  });
  var handOptions = [0, 1, 2, 3, 5, 6, 7, 11, 12, 13, 20, 21, 23].map(function (index) {
    return HAND_POSES[index];
  });
  var configuration = [["body", "زاوية الجسم", bodyOptions], ["gaze", "اتجاه الوجه والنظرة", gazeOptions], ["expression", "تعبير الوجه", expressionOptions], ["hand", "حركة اليد", handOptions]];
  function addOptions(select, choices) {
    choices.forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        label = _ref2[0],
        value = _ref2[1];
      var option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });
  }
  function field(section, index, key, title, options) {
    var id = "clone".concat(index).concat(key);
    var label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = title;
    var select = document.createElement("select");
    select.id = id;
    addOptions(select, options);
    select.addEventListener("change", function () {
      select.dataset.manual = "true";
      invalidate();
    });
    section.appendChild(label);
    section.appendChild(select);
  }
  function customField(section, index, key, labelText, placeholder) {
    var id = "clone".concat(index).concat(key, "Custom");
    var label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = labelText;
    var input = document.createElement("input");
    input.id = id;
    input.type = "text";
    input.dir = "auto";
    input.placeholder = placeholder;
    input.addEventListener("input", invalidate);
    section.appendChild(label);
    section.appendChild(input);
  }
  function makeClone(index) {
    var section = document.createElement("section");
    section.className = "cloneCard";
    section.id = "cloneCard".concat(index);
    var title = document.createElement("h2");
    title.textContent = "\u0627\u0644\u0646\u0633\u062E\u0629 ".concat(index + 1).concat(index === 0 ? " · اللبس الأصلي" : " · لوك مختلف");
    section.appendChild(title);
    if (index === 0) {
      var fixed = document.createElement("p");
      fixed.className = "fixedOutfit";
      fixed.textContent = "اللبس: نفس القطعة المرفقة في الصورة الثانية، بتفاصيلها وألوانها. الاختيار ده ثابت.";
      section.appendChild(fixed);
    } else {
      field(section, index, "outfit", "اقتراح اللبس", OUTFIT_VARIATIONS);
      customField(section, index, "outfit", "لبس من وصفك (اختياري)", "مثال: هودي بيج غامق");
    }
    configuration.forEach(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 3),
        key = _ref4[0],
        label = _ref4[1],
        options = _ref4[2];
      return field(section, index, key, label, options);
    });
    customField(section, index, "hand", "حركة يد من وصفك (اختياري)", "مثال: يمسك طرف الجاكيت بيده اليمنى");
    var reset = document.createElement("button");
    reset.type = "button";
    reset.className = "secondary resetButton";
    reset.textContent = "رجّع النسخة للاقتراحات التلقائية";
    reset.addEventListener("click", function () {
      ["outfit", "body", "gaze", "expression", "hand"].forEach(function (key) {
        var select = node("clone".concat(index).concat(key));
        if (select) select.dataset.manual = "false";
      });
      ["outfit", "hand"].forEach(function (key) {
        var input = node("clone".concat(index).concat(key, "Custom"));
        if (input) input.value = "";
      });
      shuffle();
    });
    section.appendChild(reset);
    return section;
  }
  function invalidate() {
    promptCopy.invalidate();
  }
  function count() {
    return Number(node("multiCount").value);
  }
  function shuffle() {
    var fields = [["outfit", OUTFIT_VARIATIONS, 1], ["body", bodyOptions, 0], ["hand", handOptions, 0], ["gaze", gazeOptions, 0], ["expression", expressionOptions, 0]];
    fields.forEach(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 3),
        key = _ref6[0],
        choices = _ref6[1],
        start = _ref6[2];
      var active = [];
      for (var index = start; index < count(); index += 1) active.push(node("clone".concat(index).concat(key)));
      var used = new Set(active.filter(function (select) {
        return select.dataset.manual === "true";
      }).map(function (select) {
        return select.value;
      }));
      active.filter(function (select) {
        return select.dataset.manual !== "true";
      }).forEach(function (select) {
        var available = choices.map(function (choice) {
          return choice[1];
        }).filter(function (value) {
          return !used.has(value) && value !== select.value;
        });
        var fallback = choices.map(function (choice) {
          return choice[1];
        }).filter(function (value) {
          return !used.has(value);
        });
        var pool = available.length ? available : fallback;
        if (!pool.length) return;
        select.value = pool[Math.floor(Math.random() * pool.length)];
        used.add(select.value);
      });
    });
    invalidate();
  }
  function selected(index, key) {
    var override = node("clone".concat(index).concat(key, "Custom"));
    return override && override.value.trim() || node("clone".concat(index).concat(key)).value;
  }
  function collect() {
    var clones = [];
    for (var index = 0; index < count(); index += 1) {
      clones.push({
        garment: index === 0 ? "" : selected(index, "outfit"),
        bodyAngle: selected(index, "body"),
        faceGaze: selected(index, "gaze"),
        expression: selected(index, "expression"),
        handAction: selected(index, "hand")
      });
    }
    var outfits = clones.slice(1).map(function (clone) {
      return clone.garment.trim().toLowerCase();
    });
    if (new Set(outfits).size !== outfits.length) throw new Error("اختار لبس مختلف لكل نسخة إضافية.");
    var handActions = clones.map(function (clone) {
      return clone.handAction.trim().toLowerCase();
    });
    if (new Set(handActions).size !== handActions.length) throw new Error("اختار حركة يد مختلفة لكل نسخة.");
    return buildMultiPersonPrompt({
      count: count(),
      layout: node("multiLayout").value,
      cameraPerspective: node("multiPerspective").value.trim() || node("multiPerspectivePreset").value,
      background: node("multiBackground").value.trim() || node("multiBackgroundPreset").value,
      backgroundType: node("multiBackgroundType").value,
      roomColor: node("multiRoomColor").value,
      roomIdea: node("multiRoomIdea").value,
      skyTone: node("multiSkyTone").value,
      cameraDistance: node("multiCameraDistance").value,
      palette: node("multiPalette").value.trim(),
      clones: clones
    });
  }
  addOptions(node("multiPerspectivePreset"), CAMERA_PERSPECTIVES);
  addOptions(node("multiBackgroundPreset"), BACKGROUNDS);
  var container = node("multiClones");
  for (var index = 0; index < 4; index += 1) container.appendChild(makeClone(index));
  function updateCount() {
    for (var _index = 0; _index < 4; _index += 1) setUiHidden(node("cloneCard".concat(_index)), _index >= count());
    invalidate();
  }
  updateCount();
  shuffle();
  node("multiCount").addEventListener("change", function () {
    updateCount();
    shuffle();
  });
  node("multiShuffle").addEventListener("click", shuffle);
  ["multiCameraDistance", "multiLayout", "multiPerspectivePreset", "multiBackgroundPreset", "multiSkyTone"].forEach(function (id) {
    return node(id).addEventListener("change", invalidate);
  });
  ["multiPalette", "multiPerspective", "multiBackground", "multiRoomColor", "multiRoomIdea"].forEach(function (id) {
    return node(id).addEventListener("input", invalidate);
  });
  function syncBackgroundFields() {
    var type = node("multiBackgroundType").value;
    setUiHidden(node("multiStudioBackgroundFields"), type !== "studio");
    setUiHidden(node("multiRoomBackgroundFields"), type !== "room");
    setUiHidden(node("multiSkyBackgroundFields"), type !== "sky");
    invalidate();
  }
  node("multiBackgroundType").addEventListener("change", syncBackgroundFields);
  syncBackgroundFields();
});

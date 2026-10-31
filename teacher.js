/* global TEACHER_SUBJECTS, TEACHER_EXPRESSIONS, TEACHER_CHARACTERS, TEACHER_CHARACTER_LOCATIONS, TEACHER_CAST_GARMENTS, TEACHER_CAMERA_DISTANCES, createTeacherCinematicControls, buildTeacherPrompt */
var QayemTeacherModes;
runUiInitializer("teacherView", function () {
  const node = id => document.getElementById(id);
  const promptCopy = createPromptCopyController({"button": "copyTeacherPrompt", "preview": "teacherPreview", "status": "teacherStatus", "successText": "البرومبت اتنسخ. أرفق الصور بنفس ترتيب المرفقات الظاهر، واختار نفس نسبة الأبعاد في أداة الصور.", build: makeTeacherPrompt});
  function populate(id, choices) {
    choices.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      node(id).appendChild(option);
    });
  }
  populate("teacherSubject", TEACHER_SUBJECTS);
  node("teacherSubject").value = "arabic";
  node("teacherDesignType").value = "";
  // Explicit value and selected attribute are both needed in older UXP.
  const countSelect = node("teacherCharacterCount");
  Array.from(countSelect.options).forEach(option => {
    const selected = option.value === "0";
    option.selected = selected;
    if (selected) option.setAttribute("selected", "");
    else option.removeAttribute("selected");
  });
  countSelect.value = "0";
  countSelect.setAttribute("value", "0");
  populate("teacherExpression", TEACHER_EXPRESSIONS);
  populate("teacherCastGarment", TEACHER_CAST_GARMENTS);
  populate("teacherCameraDistance", TEACHER_CAMERA_DISTANCES);
  const cinematicUI = createTeacherCinematicControls(syncCast);
  const normalUI = createTeacherNormalControls(syncCast);
  const cards = [];
  function element(tag, parent, text) {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    parent.appendChild(el);
    return el;
  }
  function control(tag, parent, id, label) {
    const l = element("label", parent, label); l.setAttribute("for", id);
    const el = element(tag, parent); el.id = id;
    return el;
  }
  for (let i = 0; i < 3; i++) {
    const card = element("div", node("teacherCharacterCards")); card.className = "teacherCharacterCard";
    element("h2", card, "الشخصية " + (i+1));
    const choice = control("select", card, "teacherCharacter"+i, "اختار الشخصية");
    const customFields = element("div", card);
    const custom = control("textarea", customFields, "teacherCharacterCustom"+i, "اسم أو وصف الشخصية المخصصة");
    custom.className = "roomIdea"; custom.setAttribute("dir", "auto"); custom.placeholder = "اسم شخصية أخرى، أو وصف شخصية افتراضية";
    const location = control("select", card, "teacherCharacterLocation"+i, "مكانها بالنسبة للمشاهد");
    populate(location.id, TEACHER_CHARACTER_LOCATIONS); location.value = i%2 ? "behindRight" : "behindLeft";
    const note = control("textarea", card, "teacherCharacterNote"+i, "ملاحظة للشخصية — اختياري");
    note.className = "roomIdea"; note.setAttribute("dir", "auto"); note.placeholder = "القبعة، حركة اليد، أو ملابس خاصة بهذه الشخصية";
    const outfitColor = control("input", card, "teacherCharacterColor"+i, "لون ملابس الشخصية — اختياري");
    outfitColor.type = "text"; outfitColor.setAttribute("dir", "auto"); outfitColor.placeholder = "مثال: بيج فاتح، أو تركواز داكن";
    cards.push({card, choice, customFields, custom, location, note, outfitColor});
    [choice, location].forEach(el => el.addEventListener("change", syncCast));
    [custom, note, outfitColor].forEach(el => el.addEventListener("input", syncCast));
  }
  function populateCharacters() {
    const choices = [["", "اختار شخصية..."], ...(TEACHER_CHARACTERS[node("teacherSubject").value] || []), ["custom", "شخصية أخرى / افتراضية — وصف مخصص"]];
    cards.forEach(c => {
      const old = c.choice.value;
      while (c.choice.firstChild) c.choice.removeChild(c.choice.firstChild);
      populate(c.choice.id, choices);
      c.choice.value = choices.some(item => item[0] === old) ? old : "";
    });
    syncCast();
  }
  function castValues() {
    return cards.slice(0, Number(node("teacherCharacterCount").value)).map(c => ({id:c.choice.value, custom:c.custom.value, location:c.location.value, note:c.note.value, outfitColor:c.outfitColor.value}));
  }
  function effectiveSources() {
    const hasCast = Number(node("teacherCharacterCount").value) > 0;
    return {
      referenceMode: hasCast ? node("teacherReferenceMode").value : "personOnly",
      clothingMode: node("teacherClothingMode").value,
      clothingDescription: node("teacherClothingMode").value === "description" ? node("teacherClothingDescription").value : ""
    };
  }
  function showReferenceOrder() {
    const box = node("teacherReferenceOrder");
    while (box.firstChild) box.removeChild(box.firstChild);
    const labels = ["المدرّس — الهوية فقط"];
    const sources = effectiveSources();
    if (sources.referenceMode === "withCharacters") castValues().forEach((c,i) => {
      const known = (TEACHER_CHARACTERS[node("teacherSubject").value] || []).find(item => item[0] === c.id);
      labels.push(known ? known[1] : c.id === "custom" && c.custom.trim() ? c.custom.trim() : "الشخصية " + (i+1) + " — كمّل اختيارها");
    });
    if (sources.clothingMode === "image") labels.push("ملابس المدرّس — آخر صورة، للملابس فقط");
    labels.forEach((label,i) => {element("p", box, (i+1) + " · " + label).className = "referenceRow";});
  }
  function syncCast() {
    const requestedCount = Number(node("teacherCharacterCount").value);
    const count = [1, 2, 3].includes(requestedCount) ? requestedCount : 0;
    const hasDesignType = ["normal", "surreal", "cinematic"].includes(node("teacherDesignType").value);
    node("teacherResetCurrent").disabled = !hasDesignType;
    const cinematicMode = node("teacherDesignType").value === "cinematic";
    const normalMode = node("teacherDesignType").value === "normal";
    setUiHidden(node("teacherDesignOptions"), !hasDesignType);
    normalUI.sync(normalMode);
    cinematicUI.sync(cinematicMode, count, node("teacherClothingMode").value === "image");
    setUiHidden(node("teacherLegacyPositionSection"), !hasDesignType || cinematicMode);
    setUiHidden(node("teacherLegacyExpressionSection"), !hasDesignType || cinematicMode || normalMode);
    node("teacherPreview").setAttribute("dir", cinematicMode ? "rtl" : "ltr");
    cards.forEach((c,i) => {setUiHidden(c.card, i >= count); setUiHidden(c.customFields, c.choice.value !== "custom");});
    setUiHidden(node("teacherCharacterCards"), !count);
    setUiHidden(node("teacherOutfitFields"), !count);
    setUiHidden(node("teacherModelNotice"), !count);
    setUiHidden(node("teacherReferenceSection"), !count);
    setUiHidden(node("teacherDistanceSection"), !hasDesignType || !!count || cinematicMode || normalMode);
    setUiHidden(node("teacherClothingSection"), !hasDesignType);
    setUiHidden(node("teacherFisheyeFields"), !node("teacherFisheyeEnabled").checked);
    node("teacherCastHint").textContent = normalMode
      ? (count ? "الشخصيات تفضل قريبة خلف المدرّس وبملامح مستقلة؛ مسافة الكاميرا تضبط حجم المجموعة، واختيارات الجسم والنظرة واليد تخص المدرّس فقط." : "الطبيعي حتى الخصر بدون بنطلون؛ قريب للوجه والصدر، وقريب جدًا: العدسة تقترب من الوجه مع السماح بقص الكتفين. ملابس المدرّس من مصدر الملابس المستقل؛ وصف مكتوب أو آخر صورة مرفقة.")
      : cinematicMode
      ? "في السينمائي: وضعيات وحدود ظهور الأشخاص من الإعدادات السينمائية فوق. اختيار الشخصيات هنا يحدد العدد والهويات والأماكن؛ صورة المدرّس أولًا."
      : !count
      ? (node("teacherCameraDistance").value === "veryClose" ? "قريب جدًا: اقتراب العدسة من الوجه، مع السماح بقص جزء من الكتفين وبدون خصر أو بنطلون. " : "المدرّس لوحده: من الرأس كاملة حتى الخصر، بدون ظهور البنطلون. ") + "مصدر ملابس المدرّس مستقل، وترتيب المرفقات موضح تحت."
      : (node("teacherSubject").value === "none" ? "بدون مادة: أضف كل شخصية من اختيار شخصية أخرى / افتراضية واكتب وصفها. " : "المادة تقترح أسماء، وإنت تختار اللي يظهر. ") + "الكل واقف وقريب في تكوين مجموعة، من الرأس للبطن كحد أقصى، والشخصيات قريبة خلف كتفي المدرّس مع فراغ بسيط بين الرؤوس.";
    setUiHidden(node("teacherClothingFields"), node("teacherClothingMode").value !== "description");
    showReferenceOrder(); invalidate();
  }
  node("teacherSubject").addEventListener("change", populateCharacters);
  node("teacherCameraDistance").addEventListener("change", syncCast);
  ["teacherCharacterCount", "teacherReferenceMode", "teacherClothingMode", "teacherOutfitStrategy", "teacherCastGarment", "teacherFisheyeEnabled", "teacherFisheyeScope"].forEach(id => node(id).addEventListener("change", syncCast));
  ["teacherClothingDescription", "teacherOutfitNotes"].forEach(id => node(id).addEventListener("input", syncCast));
  let ratio = "3:4";
  const ratioChoices = Array.from(node("teacherRatios").querySelectorAll(".ratioChoice"));
  const ratioLabels = { "9:16": "رأسي طويل · 9:16", "3:4": "رأسي · 3:4", "1:1": "مربع · 1:1", "4:3": "أفقي · 4:3", "16:9": "أفقي عريض · 16:9" };
  function invalidate() {
    promptCopy.invalidate();
  }
  function selectRatio(value) {
    ratio = value;
    ratioChoices.forEach(choice => {
      const selected = choice.getAttribute("data-ratio") === value;
      choice.classList.toggle("selected", selected);
      choice.setAttribute("aria-checked", String(selected));
      choice.setAttribute("tabindex", selected ? "0" : "-1");
    });
    node("teacherRatioHint").textContent = ratioLabels[value];
    invalidate();
  }
  ratioChoices.forEach((choice, index) => {
    choice.addEventListener("click", () => selectRatio(choice.getAttribute("data-ratio")));
    choice.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectRatio(choice.getAttribute("data-ratio"));
      } else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? ratioChoices.length - 1 : (index + (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1) + ratioChoices.length) % ratioChoices.length;
        selectRatio(ratioChoices[next].getAttribute("data-ratio"));
        ratioChoices[next].focus();
      }
    });
  });
  const examples = {
    none: "اوصف فكرتك بحرية: المشهد، الملابس، حركة الشخص والعناصر اللي حواليه",
    arabic: "مثال: مدرس عربي يستعرض كتابًا مفتوحًا في مكتبة بإضاءة سينمائية",
    english: "مثال: مدرس إنجليزي ماسك كتابًا وخلفه عالم خيالي مستوحى من قصة",
    math: "مثال: مدرس رياضيات يتفاعل مع مجسمات هندسية مرتبطة بالدرس",
    biology: "مثال: مدرس أحياء يستعرض مجسم خلية بتفاصيل واضحة",
    geography: "مثال: مدرس جغرافيا يقدم كرة أرضية وخلفه تضاريس بأعماق مختلفة",
    history: "مثال: مدرس تاريخ أمام قلعة من العصر المحدد في الدرس",
    social: "مثال: مدرس دراسات يستعرض خريطة وتظهر حوله معالم مرتبطة بالدرس",
    science: "مثال: مدرس علوم يجري تجربة مرتبطة بموضوع الدرس",
    chemistry: "مثال: مدرس كيمياء ماسك مجسم جزيء وبيقدمه للكاميرا، وخلفه معمل",
    physics: "مثال: مدرس فيزياء يتفاعل مع تجربة بصرية لانكسار الضوء",
    geology: "مثال: مدرس جيولوجيا أمام قطاع صخري يظهر طبقات الأرض",
    programming: "مثال: مدرس برمجة أمام شبكة مجسمة تمثل خطوات خوارزمية"
  };
  function sync() {
    setUiHidden(node("teacherExpressionFields"), node("teacherExpression").value !== "custom");
    const normalMode = node("teacherDesignType").value === "normal";
    node("teacherIdea").placeholder = normalMode ? "اختياري: تفاصيل المشهد والعناصر والتفاعل؛ الملابس من خانتها المستقلة" : examples[node("teacherSubject").value];
    node("teacherIdeaLabel").textContent = normalMode ? "تفاصيل إضافية للتصميم — اختياري" : "٦ · فكرة التصميم";
    node("teacherIdeaHint").textContent = normalMode ? "اكتب تفاصيل التصميم الإضافية هنا، وحدد ملابس المدرّس من مصدرها المستقل. الخلفية والكاميرا والجسم والنظرة والتعبير واليد من اختياراتها. الخانة دي لا تحدد الملابس؛ الملابس تعتمد على مصدرها المستقل فقط." : "اوصف المكان والألوان والعناصر وتفاعل المدرّس. الملابس من مصدر ملابس المدرّس فقط؛ المادة والنوع والمقاس والمنظور والتعبير من اختياراتك.";
    syncCast();
    invalidate();
  }
  ["teacherSubject", "teacherPosition", "teacherExpression"].forEach(id => node(id).addEventListener("change", sync));
  ["teacherExpressionCustom", "teacherIdea"].forEach(id => node(id).addEventListener("input", invalidate));
  function makeTeacherPrompt() {
      if (!["normal", "surreal", "cinematic"].includes(node("teacherDesignType").value)) throw new Error("اختار نوع التصميم الأول علشان تظهر باقي الخيارات.");
      const sources = effectiveSources();
      return buildTeacherPrompt({ fisheyeEnabled: node("teacherFisheyeEnabled").checked, fisheyeScope: node("teacherFisheyeScope").value, normal: node("teacherDesignType").value === "normal" ? normalUI.values() : {}, cinematic: Object.assign({}, cinematicUI.values(), {ratio}), subject: node("teacherSubject").value, designType: node("teacherDesignType").value, ratio, cameraDistance: Number(node("teacherCharacterCount").value) ? "close" : node("teacherCameraDistance").value, position: node("teacherPosition").value, expression: node("teacherExpression").value, expressionCustom: node("teacherExpressionCustom").value, idea: node("teacherIdea").value, characterCount: Number(node("teacherCharacterCount").value), characters: castValues(), referenceMode: sources.referenceMode, clothingMode: sources.clothingMode, clothingDescription: sources.clothingDescription, outfitStrategy: node("teacherOutfitStrategy").value, outfitNotes: node("teacherOutfitNotes").value, castGarment: node("teacherCastGarment").value });
  }
  populateCharacters();
  sync();
  // One DOM editor, three independent drafts. Never seed a new mode from the
  // previously visible mode; only the pristine initialized defaults are shared.
  const modeNames = ["normal", "surreal", "cinematic"];
  let activeMode = "", switchingMode = false, modeDrafts = {};
  function modeFields() {
    return Array.from(node("teacherView").querySelectorAll("input,select,textarea")).filter(el =>
      el.id.indexOf("teacher") === 0 && el.id !== "teacherDesignType" &&
      !/preview$/i.test(el.id) && !el.readOnly &&
      !["file", "password", "hidden", "button", "submit"].includes(el.type));
  }
  function copyDraft(value) { return JSON.parse(JSON.stringify(value)); }
  function readMode() {
    const fields = {};
    modeFields().forEach(el => {
      fields[el.id] = {value: String(el.value || "")};
      if (el.type === "checkbox" || el.type === "radio") fields[el.id].checked = !!el.checked;
    });
    return {fields, ratio};
  }
  const modeDefaults = readMode();
  function restoreMode(saved) {
    switchingMode = true;
    try {
      const fields = saved.fields || {}, controls = modeFields();
      function restoreField(el) {
        const value = fields[el.id];
        if (!value || typeof value.value !== "string" || value.value.length > 100000) return;
        if (el.tagName === "SELECT") {
          if (!Array.from(el.options).some(option => option.value === value.value)) return;
          Array.from(el.options).forEach(option => {
            const selected = option.value === value.value;
            option.selected = selected;
            if (selected) option.setAttribute("selected", ""); else option.removeAttribute("selected");
          });
        }
        el.value = value.value;
        if (typeof value.checked === "boolean") el.checked = value.checked;
        el.dispatchEvent(new Event("input", {bubbles:true}));
        el.dispatchEvent(new Event("change", {bubbles:true}));
      }
      const priority = ["teacherSubject", "teacherCharacterCount", "teacherClothingMode"];
      priority.forEach(id => {const el = node(id); if (el) restoreField(el);});
      controls.forEach(el => {if (!priority.includes(el.id)) restoreField(el);});
      const selectedRatio = ratioChoices.some(choice => choice.getAttribute("data-ratio") === saved.ratio) ? saved.ratio : modeDefaults.ratio;
      selectRatio(selectedRatio);
      sync();
    } finally { switchingMode = false; }
  }
  function cleanDraft(saved) {
    const result = copyDraft(modeDefaults);
    if (!saved || typeof saved !== "object") return result;
    Object.keys(result.fields).forEach(id => {
      const field = saved.fields && saved.fields[id];
      if (field && typeof field.value === "string" && field.value.length <= 100000) {
        result.fields[id] = {value:field.value};
        if (typeof field.checked === "boolean") result.fields[id].checked = field.checked;
      }
    });
    if (ratioChoices.some(choice => choice.getAttribute("data-ratio") === saved.ratio)) result.ratio = saved.ratio;
    return result;
  }
  node("teacherDesignType").addEventListener("change", function () {
    if (switchingMode) return;
    node("teacherResetStatus").textContent = "ابدأ من جديد بإعدادات النوع المفتوح فقط.";
    const next = node("teacherDesignType").value;
    if (next === activeMode) {sync(); return;}
    if (modeNames.includes(activeMode)) modeDrafts[activeMode] = readMode();
    activeMode = modeNames.includes(next) ? next : "";
    if (activeMode) {
      restoreMode(modeDrafts[activeMode] || modeDefaults);
      modeDrafts[activeMode] = readMode();
    } else sync();
  });
  function resetCurrentMode() {
    if (switchingMode || !modeNames.includes(activeMode)) return false;
    restoreMode(copyDraft(modeDefaults));
    modeDrafts[activeMode] = readMode();
    invalidate();
    node("teacherResetStatus").textContent = "تم مسح القيم الحالية ورجوع اختيارات النوع المفتوح للافتراضي.";
    if (typeof QayemUiState !== "undefined" && QayemUiState) QayemUiState.capture();
    return true;
  }
  node("teacherResetCurrent").addEventListener("click", resetCurrentMode);
  QayemTeacherModes = {
    resetCurrent: resetCurrentMode,
    isSwitching: () => switchingMode,
    getState: () => {
      if (!switchingMode && modeNames.includes(activeMode)) modeDrafts[activeMode] = readMode();
      return {version:1, active:activeMode, states:copyDraft(modeDrafts)};
    },
    adoptRestored: saved => {
      // Legacy drafts/presets already restored the visible fields. Assign them
      // only to their selected type, keeping the other drafts separate.
      modeDrafts = {};
      if (saved && saved.version === 1 && saved.states) modeNames.forEach(name => {
        if (Object.prototype.hasOwnProperty.call(saved.states, name)) modeDrafts[name] = cleanDraft(saved.states[name]);
      });
      activeMode = modeNames.includes(node("teacherDesignType").value) ? node("teacherDesignType").value : "";
      if (activeMode) modeDrafts[activeMode] = readMode();
    }
  };
});

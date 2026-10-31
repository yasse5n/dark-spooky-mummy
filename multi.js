/* global CAMERA_PERSPECTIVES, BODY_ANGLES, FACE_GAZES, EXPRESSIONS, HAND_POSES, BACKGROUNDS, OUTFIT_VARIATIONS, buildMultiPersonPrompt */
runUiInitializer("multiView", function () {
  function node(id) { return document.getElementById(id); }
  const promptCopy = createPromptCopyController({"button": "copyMultiPrompt", "preview": "multiPreview", "status": "multiStatus", "successText": "البرومبت اتنسخ. أرفق صورة الشخص ثم صورة اللبس في أداة الصور.", build: collect});
  const bodyOptions = [0, 3, 4, 7, 8, 9, 10, 17].map(index => BODY_ANGLES[index]);
  const gazeOptions = [0, 1, 2, 5, 6, 7, 10, 11].map(index => FACE_GAZES[index]);
  const expressionOptions = [0, 1, 2, 4, 5, 6].map(index => EXPRESSIONS[index]);
  const handOptions = [0, 1, 2, 3, 5, 6, 7, 11, 12, 13, 20, 21, 23].map(index => HAND_POSES[index]);
  const configuration = [
    ["body", "زاوية الجسم", bodyOptions],
    ["gaze", "اتجاه الوجه والنظرة", gazeOptions],
    ["expression", "تعبير الوجه", expressionOptions],
    ["hand", "حركة اليد", handOptions]
  ];

  function addOptions(select, choices) {
    choices.forEach(([label, value]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });
  }

  function field(section, index, key, title, options) {
    const id = `clone${index}${key}`;
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = title;
    const select = document.createElement("select");
    select.id = id;
    addOptions(select, options);
    select.addEventListener("change", () => {
      select.dataset.manual = "true";
      invalidate();
    });
    section.appendChild(label);
    section.appendChild(select);
  }

  function customField(section, index, key, labelText, placeholder) {
    const id = `clone${index}${key}Custom`;
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = labelText;
    const input = document.createElement("input");
    input.id = id;
    input.type = "text";
    input.dir = "auto";
    input.placeholder = placeholder;
    input.addEventListener("input", invalidate);
    section.appendChild(label);
    section.appendChild(input);
  }

  function makeClone(index) {
    const section = document.createElement("section");
    section.className = "cloneCard";
    section.id = `cloneCard${index}`;
    const title = document.createElement("h2");
    title.textContent = `النسخة ${index + 1}${index === 0 ? " · اللبس الأصلي" : " · لوك مختلف"}`;
    section.appendChild(title);

    if (index === 0) {
      const fixed = document.createElement("p");
      fixed.className = "fixedOutfit";
      fixed.textContent = "اللبس: نفس القطعة المرفقة في الصورة الثانية، بتفاصيلها وألوانها. الاختيار ده ثابت.";
      section.appendChild(fixed);
    } else {
      field(section, index, "outfit", "اقتراح اللبس", OUTFIT_VARIATIONS);
      customField(section, index, "outfit", "لبس من وصفك (اختياري)", "مثال: هودي بيج غامق");
    }
    configuration.forEach(([key, label, options]) => field(section, index, key, label, options));
    customField(section, index, "hand", "حركة يد من وصفك (اختياري)", "مثال: يمسك طرف الجاكيت بيده اليمنى");
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "secondary resetButton";
    reset.textContent = "رجّع النسخة للاقتراحات التلقائية";
    reset.addEventListener("click", () => {
      ["outfit", "body", "gaze", "expression", "hand"].forEach(key => {
        const select = node(`clone${index}${key}`);
        if (select) select.dataset.manual = "false";
      });
      ["outfit", "hand"].forEach(key => {
        const input = node(`clone${index}${key}Custom`);
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

  function count() { return Number(node("multiCount").value); }

  function shuffle() {
    const fields = [
      ["outfit", OUTFIT_VARIATIONS, 1],
      ["body", bodyOptions, 0],
      ["hand", handOptions, 0],
      ["gaze", gazeOptions, 0],
      ["expression", expressionOptions, 0]
    ];
    fields.forEach(([key, choices, start]) => {
      const active = [];
      for (let index = start; index < count(); index += 1) active.push(node(`clone${index}${key}`));
      const used = new Set(active.filter(select => select.dataset.manual === "true").map(select => select.value));
      active.filter(select => select.dataset.manual !== "true").forEach(select => {
        const available = choices.map(choice => choice[1]).filter(value => !used.has(value) && value !== select.value);
        const fallback = choices.map(choice => choice[1]).filter(value => !used.has(value));
        const pool = available.length ? available : fallback;
        if (!pool.length) return;
        select.value = pool[Math.floor(Math.random() * pool.length)];
        used.add(select.value);
      });
    });
    invalidate();
  }

  function selected(index, key) {
    const override = node(`clone${index}${key}Custom`);
    return (override && override.value.trim()) || node(`clone${index}${key}`).value;
  }

  function collect() {
    const clones = [];
    for (let index = 0; index < count(); index += 1) {
      clones.push({
        garment: index === 0 ? "" : selected(index, "outfit"),
        bodyAngle: selected(index, "body"),
        faceGaze: selected(index, "gaze"),
        expression: selected(index, "expression"),
        handAction: selected(index, "hand")
      });
    }
    const outfits = clones.slice(1).map(clone => clone.garment.trim().toLowerCase());
    if (new Set(outfits).size !== outfits.length) throw new Error("اختار لبس مختلف لكل نسخة إضافية.");
    const handActions = clones.map(clone => clone.handAction.trim().toLowerCase());
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
      clones
    });
  }


  addOptions(node("multiPerspectivePreset"), CAMERA_PERSPECTIVES);
  addOptions(node("multiBackgroundPreset"), BACKGROUNDS);
  const container = node("multiClones");
  for (let index = 0; index < 4; index += 1) container.appendChild(makeClone(index));
  function updateCount() {
    for (let index = 0; index < 4; index += 1) setUiHidden(node(`cloneCard${index}`), index >= count());
    invalidate();
  }
  updateCount();
  shuffle();
  node("multiCount").addEventListener("change", () => { updateCount(); shuffle(); });
  node("multiShuffle").addEventListener("click", shuffle);
  ["multiCameraDistance", "multiLayout", "multiPerspectivePreset", "multiBackgroundPreset", "multiSkyTone"].forEach(id => node(id).addEventListener("change", invalidate));
  ["multiPalette", "multiPerspective", "multiBackground", "multiRoomColor", "multiRoomIdea"].forEach(id => node(id).addEventListener("input", invalidate));
  function syncBackgroundFields() {
    const type = node("multiBackgroundType").value;
    setUiHidden(node("multiStudioBackgroundFields"), type !== "studio");
    setUiHidden(node("multiRoomBackgroundFields"), type !== "room");
    setUiHidden(node("multiSkyBackgroundFields"), type !== "sky");
    invalidate();
  }
  node("multiBackgroundType").addEventListener("change", syncBackgroundFields);
  syncBackgroundFields();
});

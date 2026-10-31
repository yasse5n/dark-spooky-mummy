/* global DOCTOR_SUBJECTS, DOCTOR_EXPRESSIONS, DOCTOR_CHARACTERS, DOCTOR_CHARACTER_LOCATIONS, DOCTOR_CAST_GARMENTS, DOCTOR_CAMERA_DISTANCES, createDoctorCinematicControls, buildDoctorPrompt */
runUiInitializer("doctorView", function () {
  const node = id => document.getElementById(id);
  const promptCopy = createPromptCopyController({"button": "copyDoctorPrompt", "preview": "doctorPreview", "status": "doctorStatus", "successText": "البرومبت اتنسخ. أرفق الصور بنفس ترتيب المرفقات الظاهر، واختار نفس نسبة الأبعاد في أداة الصور.", build: makeDoctorPrompt});
  function populate(id, choices) {
    choices.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      node(id).appendChild(option);
    });
  }
  populate("doctorSubject", DOCTOR_SUBJECTS);
  node("doctorSubject").value = "general";
  node("doctorDesignType").value = "";
  // Explicit value and selected attribute are both needed in older UXP.
  const countSelect = node("doctorCharacterCount");
  Array.from(countSelect.options).forEach(option => {
    const selected = option.value === "0";
    option.selected = selected;
    if (selected) option.setAttribute("selected", "");
    else option.removeAttribute("selected");
  });
  countSelect.value = "0";
  countSelect.setAttribute("value", "0");
  populate("doctorExpression", DOCTOR_EXPRESSIONS);
  populate("doctorCastGarment", DOCTOR_CAST_GARMENTS);
  populate("doctorCameraDistance", DOCTOR_CAMERA_DISTANCES);
  const cinematicUI = createDoctorCinematicControls(syncCast);
  const normalUI = createDoctorNormalControls(syncCast);
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
  for (let i = 0; i < 4; i++) {
    const card = element("div", node("doctorCharacterCards")); card.className = "teacherCharacterCard";
    element("h2", card, "الشخصية " + (i+1));
    const choice = control("select", card, "doctorCharacter"+i, "اختار الشخصية");
    const customFields = element("div", card);
    const custom = control("textarea", customFields, "doctorCharacterCustom"+i, "اسم أو وصف الشخصية المخصصة");
    custom.className = "roomIdea"; custom.setAttribute("dir", "auto"); custom.placeholder = "اسم شخصية أخرى، أو وصف شخصية افتراضية";
    const location = control("select", card, "doctorCharacterLocation"+i, "مكانها بالنسبة للمشاهد");
    populate(location.id, DOCTOR_CHARACTER_LOCATIONS); location.value = i%2 ? "behindRight" : "behindLeft";
    const note = control("textarea", card, "doctorCharacterNote"+i, "ملاحظة للشخصية — اختياري");
    note.className = "roomIdea"; note.setAttribute("dir", "auto"); note.placeholder = "القبعة، حركة اليد، أو ملابس خاصة بهذه الشخصية";
    const outfitColor = control("input", card, "doctorCharacterColor"+i, "لون ملابس الشخصية — اختياري");
    outfitColor.type = "text"; outfitColor.setAttribute("dir", "auto"); outfitColor.placeholder = "مثال: بيج فاتح، أو تركواز داكن";
    cards.push({card, choice, customFields, custom, location, note, outfitColor});
    [choice, location].forEach(el => el.addEventListener("change", syncCast));
    [custom, note, outfitColor].forEach(el => el.addEventListener("input", syncCast));
  }
  function populateCharacters() {
    const choices = [["", "اختار شخصية..."], ...(DOCTOR_CHARACTERS[node("doctorSubject").value] || []), ["custom", "شخصية أخرى / افتراضية — وصف مخصص"]];
    cards.forEach(c => {
      const old = c.choice.value;
      while (c.choice.firstChild) c.choice.removeChild(c.choice.firstChild);
      populate(c.choice.id, choices);
      c.choice.value = choices.some(item => item[0] === old) ? old : "";
    });
    syncCast();
  }
  function castValues() {
    return cards.slice(0, Number(node("doctorCharacterCount").value)).map(c => ({id:c.choice.value, custom:c.custom.value, location:c.location.value, note:c.note.value, outfitColor:c.outfitColor.value}));
  }
  function effectiveSources() {
    const hasCast = Number(node("doctorCharacterCount").value) > 0;
    return {
      referenceMode: hasCast ? node("doctorReferenceMode").value : "personOnly",
      clothingMode: hasCast ? node("doctorClothingMode").value : "description",
      clothingDescription: hasCast ? node("doctorClothingDescription").value : ""
    };
  }
  function showReferenceOrder() {
    const box = node("doctorReferenceOrder");
    while (box.firstChild) box.removeChild(box.firstChild);
    const labels = ["الدكتور — الهوية فقط"];
    const sources = effectiveSources();
    if (sources.referenceMode === "withCharacters") castValues().forEach((c,i) => {
      const known = (DOCTOR_CHARACTERS[node("doctorSubject").value] || []).find(item => item[0] === c.id);
      labels.push(known ? known[1] : c.id === "custom" && c.custom.trim() ? c.custom.trim() : "الشخصية " + (i+1) + " — كمّل اختيارها");
    });
    if (sources.clothingMode === "image") labels.push("ملابس الدكتور — آخر صورة، للملابس فقط");
    labels.forEach((label,i) => {element("p", box, (i+1) + " · " + label).className = "referenceRow";});
  }
  function syncCast() {
    const requestedCount = Number(node("doctorCharacterCount").value);
    const count = [2, 3, 4].includes(requestedCount) ? requestedCount : 0;
    const hasDesignType = ["normal", "surreal", "cinematic"].includes(node("doctorDesignType").value);
    const cinematicMode = node("doctorDesignType").value === "cinematic";
    const normalMode = node("doctorDesignType").value === "normal";
    setUiHidden(node("doctorDesignOptions"), !hasDesignType);
    normalUI.sync(normalMode);
    cinematicUI.sync(cinematicMode, count, count > 0 && node("doctorClothingMode").value === "image");
    setUiHidden(node("doctorLegacyPositionSection"), !hasDesignType || cinematicMode);
    setUiHidden(node("doctorLegacyExpressionSection"), !hasDesignType || cinematicMode || normalMode);
    node("doctorPreview").setAttribute("dir", cinematicMode ? "rtl" : "ltr");
    cards.forEach((c,i) => {setUiHidden(c.card, i >= count); setUiHidden(c.customFields, c.choice.value !== "custom");});
    setUiHidden(node("doctorCharacterCards"), !count);
    setUiHidden(node("doctorOutfitFields"), !count);
    setUiHidden(node("doctorModelNotice"), !count);
    setUiHidden(node("doctorReferenceSection"), !count);
    setUiHidden(node("doctorDistanceSection"), !hasDesignType || !!count || cinematicMode || normalMode);
    setUiHidden(node("doctorClothingSection"), !count);
    node("doctorCastHint").textContent = normalMode
      ? (count ? "الشخصيات تفضل قريبة خلف الدكتور وبملامح مستقلة؛ مسافة الكاميرا تضبط حجم المجموعة، واختيارات الجسم والنظرة واليد تخص الدكتور فقط." : "الطبيعي حتى الخصر بدون بنطلون؛ قريب للوجه والصدر، وقريب جدًا للرأس والكتفين. الملابس من الوصف الإضافي، وإلا نفس لبس مرجع الدكتور.")
      : cinematicMode
      ? "في السينمائي: وضعيات وحدود ظهور الأشخاص من الإعدادات السينمائية فوق. اختيار الشخصيات هنا يحدد العدد والهويات والأماكن؛ صورة الدكتور أولًا."
      : !count
      ? (node("doctorCameraDistance").value === "veryClose" ? "قريب جدًا: الوجه والصدر فقط، بدون ظهور الخصر أو البنطلون. " : "الدكتور لوحده: من الرأس كاملة حتى الخصر، بدون ظهور البنطلون. ") + "وصف الملابس في فكرة التصميم، والمرفق صورة الدكتور فقط."
      : (node("doctorSubject").value === "none" ? "الفريق الطبي اختياري: اختار الدور أو اكتب اسم ووصف الشخص. " : "اختار أفراد الفريق الطبي، أو اكتب اسم ووصف كل شخص. ") + "الكل واقف وقريب في تكوين مجموعة، من الرأس للبطن كحد أقصى، والشخصيات قريبة خلف كتفي الدكتور مع فراغ بسيط بين الرؤوس.";
    setUiHidden(node("doctorClothingFields"), node("doctorClothingMode").value !== "description");
    showReferenceOrder(); invalidate();
  }
  node("doctorSubject").addEventListener("change", populateCharacters);
  node("doctorCameraDistance").addEventListener("change", syncCast);
  ["doctorCharacterCount", "doctorReferenceMode", "doctorClothingMode", "doctorOutfitStrategy", "doctorCastGarment"].forEach(id => node(id).addEventListener("change", syncCast));
  ["doctorClothingDescription", "doctorOutfitNotes"].forEach(id => node(id).addEventListener("input", syncCast));
  let ratio = "3:4";
  const ratioChoices = Array.from(node("doctorRatios").querySelectorAll(".ratioChoice"));
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
    node("doctorRatioHint").textContent = ratioLabels[value];
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
  const examples = {"none": "اوصف الدكتور والعيادة والملابس والعناصر اللي عاوزها", "general": "مثال: دكتور داخل عيادة طب عام، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة", "dental": "مثال: دكتور داخل عيادة أسنان، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة", "dermatology": "مثال: دكتور داخل عيادة جلدية وتجميل، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة", "pediatrics": "مثال: دكتور داخل عيادة أطفال، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة", "cardiology": "مثال: دكتور داخل عيادة قلب وأوعية دموية، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة", "orthopedics": "مثال: دكتور داخل عيادة عظام، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة", "ophthalmology": "مثال: دكتور داخل عيادة عيون، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة", "ent": "مثال: دكتور داخل عيادة أنف وأذن وحنجرة، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة", "gynecology": "مثال: دكتور داخل عيادة نساء وتوليد، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة", "internal": "مثال: دكتور داخل عيادة باطنة، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة", "neurology": "مثال: دكتور داخل عيادة مخ وأعصاب، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة", "surgery": "مثال: دكتور داخل عيادة جراحة، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة", "urology": "مثال: دكتور داخل عيادة مسالك بولية، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة", "physiotherapy": "مثال: دكتور داخل عيادة علاج طبيعي، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة", "nutrition": "مثال: دكتور داخل عيادة تغذية، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة", "psychiatry": "مثال: دكتور داخل عيادة طب نفسي، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة", "radiology": "مثال: دكتور داخل عيادة أشعة وتحاليل، اوصف تفاعله والإضاءة والألوان والأجهزة المناسبة"};
  function sync() {
    setUiHidden(node("doctorExpressionFields"), node("doctorExpression").value !== "custom");
    const normalMode = node("doctorDesignType").value === "normal";
    node("doctorIdea").placeholder = normalMode ? "اختياري: وصف ملابس الدكتور أو تفاصيل إضافية للتصميم" : examples[node("doctorSubject").value];
    node("doctorIdeaLabel").textContent = normalMode ? "ملابس أو تفاصيل إضافية — اختياري" : "٦ · فكرة التصميم";
    node("doctorIdeaHint").textContent = normalMode ? "اكتب الملابس أو التفاصيل الإضافية هنا. الخلفية من نوعها ووصفها فوق؛ إعدادات الكاميرا والجسم والنظرة والتعبير واليد لها الأولوية. لو سيبت الوصف فاضي، هنحتفظ بملابس مرجع الدكتور." : "اكتب فكرتك بحرية: المكان، الألوان، العناصر، حركة الدكتور وتفاعله معاها. التخصص والنوع والمقاس والمكان والتعبير اللي اخترتهم هيتطبقوا على الفكرة.";
    syncCast();
    invalidate();
  }
  ["doctorSubject", "doctorDesignType", "doctorPosition", "doctorExpression"].forEach(id => node(id).addEventListener("change", sync));
  ["doctorExpressionCustom", "doctorIdea"].forEach(id => node(id).addEventListener("input", invalidate));
  function makeDoctorPrompt() {
      if (!["normal", "surreal", "cinematic"].includes(node("doctorDesignType").value)) throw new Error("اختار نوع التصميم الأول علشان تظهر باقي الخيارات.");
      const sources = effectiveSources();
      return buildDoctorPrompt({ normal: node("doctorDesignType").value === "normal" ? normalUI.values() : {}, cinematic: Object.assign({}, cinematicUI.values(), {ratio}), subject: node("doctorSubject").value, designType: node("doctorDesignType").value, ratio, cameraDistance: Number(node("doctorCharacterCount").value) ? "close" : node("doctorCameraDistance").value, position: node("doctorPosition").value, expression: node("doctorExpression").value, expressionCustom: node("doctorExpressionCustom").value, idea: node("doctorIdea").value, characterCount: Number(node("doctorCharacterCount").value), characters: castValues(), referenceMode: sources.referenceMode, clothingMode: sources.clothingMode, clothingDescription: sources.clothingDescription, outfitStrategy: node("doctorOutfitStrategy").value, outfitNotes: node("doctorOutfitNotes").value, castGarment: node("doctorCastGarment").value });
  }
  populateCharacters();
  sync();
});

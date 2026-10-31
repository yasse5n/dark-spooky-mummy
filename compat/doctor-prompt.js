// Prompts for external references; no image analysis or generation in this plugin.
if (typeof module !== "undefined") {
  var _require = require("./doctor-normal-prompt.js"),
    buildDoctorNormalDirections = _require.buildDoctorNormalDirections;
  var _require2 = require("./doctor-cinematic-prompt.js"),
    buildDoctorCinematicPrompt = _require2.buildDoctorCinematicPrompt;
  var _require3 = require("./doctor-characters.js"),
    resolveDoctorCharacters = _require3.resolveDoctorCharacters,
    doctorReferencePlan = _require3.doctorReferencePlan;
}
var DOCTOR_SUBJECTS = [["none", "بدون تخصص محدد", "General doctor / clinic branding; derive equipment and decor from the user brief."], ["general", "طب عام", "General medicine clinic: examination space and restrained clinical equipment."], ["dental", "أسنان", "Dental clinic: dental chair, dental lamp, clean instrument storage and a tooth model where relevant."], ["dermatology", "جلدية وتجميل", "Dermatology and aesthetic clinic: skin diagrams and appropriate clean consultation equipment."], ["pediatrics", "أطفال", "Pediatric clinic: gentle colors, child-friendly decor and consultation equipment."], ["cardiology", "قلب وأوعية دموية", "Cardiology clinic: heart model and cardiac monitoring equipment where relevant."], ["orthopedics", "عظام", "Orthopedic clinic: skeletal or joint models and consultation equipment where relevant."], ["ophthalmology", "عيون", "Ophthalmology clinic: eye model and optical examination equipment where relevant."], ["ent", "أنف وأذن وحنجرة", "ENT clinic: appropriate ear, nose and throat anatomical models and examination equipment."], ["gynecology", "نساء وتوليد", "Obstetrics and gynecology clinic: welcoming consultation space and ultrasound equipment where relevant."], ["internal", "باطنة", "Internal medicine clinic: consultation space and appropriate examination equipment."], ["neurology", "مخ وأعصاب", "Neurology clinic: brain and nervous-system models where relevant."], ["surgery", "جراحة", "Surgical clinic: a clean consultation or preparation space, with equipment appropriate to the requested scene."], ["urology", "مسالك بولية", "Urology clinic: restrained anatomical models and consultation equipment where relevant."], ["physiotherapy", "علاج طبيعي", "Physiotherapy clinic: treatment bed and rehabilitation equipment where relevant."], ["nutrition", "تغذية", "Nutrition clinic: consultation desk and appropriate nutrition or body-composition equipment."], ["psychiatry", "طب نفسي", "Psychiatry clinic: a calm, welcoming private consultation room with comfortable seating."], ["radiology", "أشعة وتحاليل", "Medical imaging or laboratory setting: choose equipment matching the requested imaging or laboratory scene."]];
var DOCTOR_EXPRESSIONS = [["original", "نفس تعبير الصورة الأصلية", "Preserve the exact facial expression from reference image 1."], ["smile", "ابتسامة خفيفة", "A subtle natural smile."], ["excited", "مبتسم ومتحمس", "A warm enthusiastic smile with lively eyes."], ["confident", "جاد وواثق", "A serious, confident expression with steady eyes."], ["thinking", "بيفكر", "A focused thoughtful expression; do not impose a hand gesture unless the idea requests one."], ["amazed", "مندهش", "Visible natural amazement with raised brows and widened eyes."], ["shocked", "مصدوم", "A clearly shocked expression with widened eyes and a naturally parted mouth, without facial deformation."], ["custom", "وصف مخصص", ""]];
var DOCTOR_RATIOS = {
  "9:16": "Vertical portrait frame, aspect ratio 9:16.",
  "3:4": "Vertical portrait frame, aspect ratio 3:4.",
  "1:1": "Square frame, aspect ratio 1:1.",
  "4:3": "Horizontal landscape frame, aspect ratio 4:3.",
  "16:9": "Wide horizontal landscape frame, aspect ratio 16:9."
};
var DOCTOR_CAST_GARMENTS = [["auto", "تلقائي حسب ملابس الدكتور", ""], ["coat", "بالطو طبي", "medical white coats"], ["scrubs", "سكراب طبي", "medical scrub tops"], ["suit", "بدلة", "tailored suit jackets"], ["shirt", "قميص", "modern shirts"]];
var DOCTOR_CAMERA_DISTANCES = [["close", "قريب"], ["far", "بعيد"], ["veryClose", "قريب جدًا"]];

// Frame coverage and crop distinguish subject distance; prop foreshortening is separate.
function doctorSoloFraming(cameraDistance) {
  var shared = "Maintain the exact reference facial identity and natural anatomy. NO VISIBLE TROUSERS, hips, legs or feet. Keep the whole head/headwear inside the image. Do not stretch the head or change facial proportions to meet framing targets.";
  if (cameraDistance === "far") return "CAMERA DISTANCE \u2014 FAR / ENVIRONMENTAL WAIST-UP VIEW: Make the PERSON visibly smaller in the image, not just the held object. Target complete head-to-waist figure height about 55\u201365% of the canvas height; complete head height about 15\u201320% of canvas height. Frame the doctor lower in the image, with the waist cut at the bottom edge and substantially more environment above and beside the figure. Keep the face recognizable and detailed. ".concat(shared, " This farther view remains waist-up; do not reveal a full body. Preserve the selected horizontal position. Do not automatically enlarge the person to fill the canvas.");
  if (cameraDistance === "veryClose") return "CAMERA DISTANCE \u2014 VERY CLOSE / TIGHT FACE-AND-CHEST VIEW: Make the PERSON's face visibly larger, not merely a hand or prop. Target complete head height about 40\u201350% of the canvas height, with minimal headroom. Crop the lower torso at the upper chest or mid-chest: the WAIST IS OUTSIDE THIS TIGHT CROP. Shoulders can extend beyond the left/right edges. ".concat(shared, " Show active hands and important prop parts near chest/face height when the story requires them, using a credible pose; allow long objects to continue outside the frame instead of pulling the camera back to show the waist. Keep a natural portrait facial perspective, not ultra-wide facial distortion. This selection requires a tight upper-body crop and overrides a generic waist-up framing request.");
  return "CAMERA DISTANCE \u2014 CLOSE / STANDARD WAIST-UP VIEW: Use a close portrait showing the complete head and torso DOWN TO THE WAIST, cutting just above the trouser waistband. Target head-to-waist figure height about 85\u201395% of canvas height; complete head height about 24\u201330% of canvas height. The doctor fills most of the frame vertically, with modest headroom and less environment than the far setting. ".concat(shared, " Keep active hands and important prop parts readable. Crop long props beyond the image rather than zooming out. This is the standard close view, not the tight face-and-chest crop.");
}
function buildDoctorPrompt() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    _ref$subject = _ref.subject,
    subject = _ref$subject === void 0 ? "general" : _ref$subject,
    _ref$designType = _ref.designType,
    designType = _ref$designType === void 0 ? "normal" : _ref$designType,
    _ref$ratio = _ref.ratio,
    ratio = _ref$ratio === void 0 ? "3:4" : _ref$ratio,
    _ref$position = _ref.position,
    position = _ref$position === void 0 ? "right" : _ref$position,
    _ref$expression = _ref.expression,
    expression = _ref$expression === void 0 ? "original" : _ref$expression,
    _ref$expressionCustom = _ref.expressionCustom,
    expressionCustom = _ref$expressionCustom === void 0 ? "" : _ref$expressionCustom,
    _ref$idea = _ref.idea,
    idea = _ref$idea === void 0 ? "" : _ref$idea,
    _ref$characterCount = _ref.characterCount,
    characterCount = _ref$characterCount === void 0 ? 0 : _ref$characterCount,
    _ref$characters = _ref.characters,
    characters = _ref$characters === void 0 ? [] : _ref$characters,
    _ref$referenceMode = _ref.referenceMode,
    referenceMode = _ref$referenceMode === void 0 ? "personOnly" : _ref$referenceMode,
    _ref$clothingMode = _ref.clothingMode,
    clothingMode = _ref$clothingMode === void 0 ? "description" : _ref$clothingMode,
    _ref$clothingDescript = _ref.clothingDescription,
    clothingDescription = _ref$clothingDescript === void 0 ? "" : _ref$clothingDescript,
    _ref$outfitStrategy = _ref.outfitStrategy,
    outfitStrategy = _ref$outfitStrategy === void 0 ? "coordinated" : _ref$outfitStrategy,
    _ref$outfitNotes = _ref.outfitNotes,
    outfitNotes = _ref$outfitNotes === void 0 ? "" : _ref$outfitNotes,
    _ref$castGarment = _ref.castGarment,
    castGarment = _ref$castGarment === void 0 ? "auto" : _ref$castGarment,
    _ref$cameraDistance = _ref.cameraDistance,
    cameraDistance = _ref$cameraDistance === void 0 ? "close" : _ref$cameraDistance,
    _ref$cinematic = _ref.cinematic,
    cinematic = _ref$cinematic === void 0 ? {} : _ref$cinematic,
    _ref$normal = _ref.normal,
    normal = _ref$normal === void 0 ? {} : _ref$normal;
  var normalPlan = designType === "normal" && normal.enabled ? buildDoctorNormalDirections(Object.assign({}, normal, {
    specialty: subject
  }), characterCount) : null;
  if (normalPlan) {
    expression = "custom";
    expressionCustom = normalPlan.expression;
    if (!String(idea || "").trim()) idea = "Create a realistic doctor portrait using the selected person controls and background. Retain the doctor's clothing from their identity image unless a separate wardrobe source is selected. Do not automatically add subject motifs or props.";
  }
  var chosenSubject = DOCTOR_SUBJECTS.find(function (x) {
    return x[0] === subject;
  });
  var chosenExpression = DOCTOR_EXPRESSIONS.find(function (x) {
    return x[0] === expression;
  });
  var positions = {
    right: "Doctor on the VIEWER'S RIGHT, face near the right third; keep the supporting group close to that doctor position.",
    left: "Doctor on the VIEWER'S LEFT, face near the left third; keep the supporting group close to that doctor position.",
    center: "Doctor in the CENTER, with supporting characters balanced around the shoulders."
  };
  if (!chosenSubject) throw new Error("اختار تخصص الدكتور.");
  if (designType === "cinematic") {
    var _cast = resolveDoctorCharacters({
      subject: subject,
      characterCount: characterCount,
      characters: characters
    });
    var _refs = doctorReferencePlan({
      referenceMode: referenceMode,
      clothingMode: clothingMode
    }, _cast);
    return buildDoctorCinematicPrompt({
      subject: subject,
      chosenSubject: chosenSubject,
      idea: idea,
      cinematic: cinematic,
      referenceMode: referenceMode,
      clothingMode: clothingMode,
      clothingDescription: clothingDescription,
      outfitStrategy: outfitStrategy,
      outfitNotes: outfitNotes,
      castGarment: castGarment
    }, _cast, _refs);
  }
  if (!["normal", "surreal"].includes(designType)) throw new Error("اختار نوع التصميم.");
  if (!Object.prototype.hasOwnProperty.call(DOCTOR_RATIOS, ratio)) throw new Error("اختار مقاس التصميم.");
  if (!positions[position]) throw new Error("اختار مكان الشخص في الصورة.");
  if (!chosenExpression) throw new Error("اختار تعبير الوجه.");
  var story = String(idea || "").trim();
  var reaction = String(expressionCustom || "").trim();
  if (!story) throw new Error("اكتب فكرة التصميم علشان نجهّز البرومبت.");
  if (expression === "custom" && !reaction) throw new Error("اكتب وصف تعبير الوجه المخصص.");
  var cast = resolveDoctorCharacters({
    subject: subject,
    characterCount: characterCount,
    characters: characters
  });
  var refs = doctorReferencePlan({
    referenceMode: referenceMode,
    clothingMode: clothingMode
  }, cast);
  if (!cast.length) return buildSoloDoctorPrompt({
    subject: subject,
    designType: designType,
    ratio: ratio,
    position: position,
    expression: expression,
    expressionCustom: expressionCustom,
    idea: story,
    clothingMode: clothingMode,
    clothingDescription: clothingDescription,
    cameraDistance: cameraDistance,
    normalPlan: normalPlan
  });
  var garment = DOCTOR_CAST_GARMENTS.find(function (x) {
    return x[0] === castGarment;
  });
  if (cast.length && !["coordinated", "contrast"].includes(outfitStrategy)) throw new Error("اختار تنسيق ملابس الشخصيات.");
  if (cast.length && !garment) throw new Error("اختار نوع ملابس الشخصيات.");
  var doctorClothes = String(clothingDescription || "").trim();
  var groupNotes = String(outfitNotes || "").trim();
  var mapping = refs.map(function (ref, i) {
    return ref.kind === "doctor" ? "IMAGE 1 -> MAIN DOCTOR: sole source of this doctor's face and identity." : ref.kind === "clothing" ? "IMAGE ".concat(i + 1, " -> DOCTOR CLOTHING ONLY (LAST IMAGE): copy garment cut, material, colors and visible details; ignore the model's face, glasses, hair, age, body identity, pose and background.") : "IMAGE ".concat(i + 1, " -> CHARACTER ").concat(cast.indexOf(ref.character) + 1, " (").concat(ref.character.name, "): sole face/identity source for that character, plus characteristic headwear. Original body clothing, pose and background are excluded.");
  }).join("\n");
  var identity = "Highest priority: preserve the recognizable identity of EACH referenced person, individually. Match facial proportions and asymmetries, eyes and spacing, brows, nose, lips, jaw, ears, age, natural skin tone, wrinkles, hairline, hairstyle and beard/moustache to that person's mapped image. A character's name is a label; the actual supplied face takes precedence over a remembered or invented likeness. No beautification, de-aging, generic replacement, face averaging, mixing or swapping. Retain each supplied person\u2019s facial geometry and identifying details in the same photographic style as the main doctor.\nGLASSES / ACCESSORIES: Preserve glasses only when visible on THAT person's own identity reference, or explicitly requested for that person. If that identity image has no glasses and none are requested, keep that person WITHOUT GLASSES. Never borrow glasses, hats or facial features from another person's image or from the clothing model. Keep specified characteristic headwear assigned to its owner.";
  var soloIdentity = cast.length ? "" : "SOLO DOCTOR — STRICT FACIAL IDENTITY: IMAGE 1 is the only source of the doctor's face. Preserve the exact individual facial structure, feature sizes/spacing, distinctive asymmetries, skin tone, age, hair and facial hair. Do not redesign eyes, nose, lips, cheekbones or jaw, slim the face, smooth away identifying details, beautify or replace the person with a lookalike. Apply only the selected expression through natural expression movement, without changing the underlying facial structure or identity. Apply facial effects only when explicitly requested in the STORY; they may alter surface appearance or lighting, never facial geometry. Keep defining features recognizable and facial details sharp even in a dramatic or surreal scene. No unrequested facial effects or eyewear.";
  var outfit = clothingMode === "image" ? "DOCTOR: wear the outfit from IMAGE ".concat(refs.length, " exactly, retaining its cut, fabric and colors. Remove loose retail hangtags, price tags and packaging attached for product display; retain integral garment branding, printed design, seams and intended details. The clothing image supplies no identity or eyewear.") : "DOCTOR: ".concat(doctorClothes || "wear the outfit explicitly described in the STORY; otherwise retain the outfit in IMAGE 1", ". This text wardrobe source has priority over incidental conflicting outfit wording in the story. No separate clothing image is supplied.");
  var colorRoles = ["a lighter coordinated neutral or complementary shade", "a deeper complementary hue", "a distinct harmonious midtone", "a distinct harmonious accent shade"];
  var category = garment && garment[0] !== "auto" ? garment[2] : outfitStrategy === "coordinated" ? "the SAME garment category as the doctor's selected outfit" : "a coherent modern garment category contrasting with the doctor's outfit";
  var wardrobe = cast.length ? "CAST CATEGORY: ".concat(category, ". ").concat(outfitStrategy === "coordinated" && castGarment === "auto" ? "Coordinate selected garment categories with appropriate clinical roles. Do not force a receptionist into scrubs unless selected." : "", " These are NEW body outfits; keep each character's face and characteristic headwear from its identity source. Identity references do not automatically select the supporting wardrobe; use the selected clothing source and each role\u2019s explicit notes.\n").concat(cast.map(function (c, i) {
    return "CHARACTER ".concat(i + 1, " OUTFIT: ").concat(category, ". Base color: ").concat(c.outfitColor || colorRoles[i] + " chosen relative to the doctor outfit and scene", ". ").concat(c.note ? "Apply any explicit character clothing details in this character's notes." : "");
  }).join("\n"), "\n").concat(outfitStrategy === "coordinated" ? "Use a unified clothing style with clearly distinct coordinated base colors." : "Use deliberate contrasting colors and outfit details, while keeping a coherent group palette.", " Choose colors that separate each body from the adjacent garments AND the local background; avoid making both supporting outfits identical dark blocks or assigning arbitrary rainbow/neon colors unless requested. Re-light fabric with the same scene light, preserving garment base colors. ").concat(groupNotes ? "GROUP WARDROBE NOTES: " + groupNotes + "." : "", " Specific character notes override group wardrobe suggestions; a specified base-color field controls that character's garment color.") : "";
  var castText = cast.length ? "Exactly ".concat(cast.length, " supporting characters, one of each:\n").concat(cast.map(function (c, i) {
    return "CHARACTER ".concat(i + 1, ": ").concat(c.name, ". ").concat(c.location, ". TORSO: a subtle outward turn/lean toward the VIEWER'S ").concat(c.screenSide, " (screen ").concat(c.screenSide.toLowerCase(), ", not anatomical side), about 5\u201310 degrees at most; balanced upright standing, not falling or leaning across the doctor. Head/gaze can face the camera or follow explicit action notes without distorting the face. ").concat(c.note ? "CHARACTER NOTES / ACTION: " + c.note : "");
  }).join("\n"), "\n").concat(referenceMode === "withCharacters" ? "Every supporting identity is bound to its mapped reference above." : "No character identity images are supplied: use the generator's available knowledge for specified medical roles, and original distinct faces for fictional characters. Do not claim exact likeness without reliable visual evidence; browsing is possible only if that external generator supports it.") : "No selected supporting characters. Do not automatically insert medical staff from the specialty catalog. Distant crowds are allowed only when explicitly requested in the story.";
  var framing = cast.length ? "CLOSE STANDING GROUP: all ".concat(cast.length + 1, " principal people appear from the complete head to the ABDOMEN AT MOST. The bottom image edge cuts through the abdomen, ABOVE the waistband/hips. Keep trousers, thighs, legs and feet OUTSIDE THE IMAGE. Everyone stands. Keep the camera close even when the references show whole bodies.\n").concat(positions[position], " The doctor is the largest foreground hero. ").concat(["16:9", "4:3"].includes(ratio) ? "Doctor head, hair/headwear top to chin, occupies about 38–44% of image height." : "Doctor head occupies about 28–36% of image height.", " Use a close crop and natural anatomy. Supporting faces are about 70\u201385% of the doctor's apparent face height (forehead to chin), with the entire head/headwear visible.\nPlace the cast immediately behind or beside the doctor's shoulders in one shallow group. Leave a small breathing gap between HEAD SILHOUETTES, roughly 5\u201310% of the doctor's head width; no touching temples, hats or cheeks. Keep natural shoulder/torso overlap BELOW the faces. This small visual separation is achieved by a slight sideways/backwards shift, not by moving people meters away or zooming out. The doctor occludes only portions of their inner shoulders, not their faces. With 3 or 4 supporting people, stagger sideways and slightly in height while retaining large separate faces and the abdomen crop.\nKeep active hands, eating gestures and relevant parts of held objects within the upper-body framing. Crop long poles or oversized props as needed rather than showing the lower body. Scene depth belongs in the backdrop; supporting characters remain near the doctor.") : "".concat({
    right: "Doctor on the VIEWER'S RIGHT, face near the right third.",
    left: "Doctor on the VIEWER'S LEFT, face near the left third.",
    center: "Doctor in the CENTER of the image."
  }[position], " SOLO WAIST-UP COMPOSITION: show the complete head, hair/headwear, shoulders, chest and torso DOWN TO THE WAIST. The bottom frame edge stops at the waist, just ABOVE the trouser waistband: NO VISIBLE TROUSERS, hips, thighs, legs or feet. This is a full waist-up crop, not a chest-only portrait or a distant full-body figure. Keep the doctor large and close, with natural head-to-body proportions and realistic facial perspective. Adapt the surrounding space to the selected aspect ratio while preserving this waist boundary. Include both active hands and the important parts of held objects within the waist-up framing; crop a long prop beyond the frame rather than zooming out or revealing trousers. Do not shrink the doctor to display the environment.");
  if (normalPlan && normalPlan.key !== "normal") {
    var staging = framing.slice(framing.indexOf("Place the cast immediately"));
    framing = normalPlan.framing + "\n" + positions[position] + "\n" + staging;
  }
  var subjectContext = subject === "none" ? "NO SUBJECT SELECTED: Build the scene solely from the USER DESIGN IDEA. Do not infer a medical specialty or automatically add healthcare symbols, medical staff, equipment or specialty-specific props. Include any such elements only when explicitly requested in the idea." : "DOCTOR SUBJECT: ".concat(chosenSubject[1], ". ").concat(chosenSubject[2], " Use only subject elements relevant to the actual story.");
  var style = designType === "surreal" ? "SURREAL: a bold photorealistic healthcare advertising visual. Use the requested story for dramatic perspective, purposeful overlap and imaginative scene scale/spatial treatment. Keep faces, bodies and interactions physically convincing. Avoid a flat lineup/travel snapshot, painterly faces or toy-diorama crowds. Do not invent unrelated spectacle." : "NORMAL / REALISTIC: believable healthcare advertising photography with natural scale, materials, perspective and connected interactions. Express fantastical cues through a realistic visual equivalent.";
  var sceneStyle = subject === "none" ? style.replace("healthcare advertising", "advertising") : style;
  var backdrop = cast.length && !normalPlan ? "GROUP / BACKDROP SEPARATION: Keep the principal group close and sharp; set story events, requested crowds and landmarks in a genuinely distant background. Use coherent diminishing scale, subdued detail/contrast and restrained atmospheric haze, with clear space between the group and distant activity. Do not move the cast away or reduce their faces to create depth. Keep one consistent camera viewpoint and perspective across people and environment.\nOUTDOOR SCENES ONLY: If the story includes a visible sky/ground horizon, place that sky-ground boundary BELOW the principal shoulders, around upper-chest level in the frame, leaving an expansive sky. This is the horizon line, not the tops of monuments: anchor landmarks to the distant ground plane at plausible scale; tall structures can extend above the horizon, without looming immediately behind heads. When sky is visible, render believable cloud volume, layered atmospheric depth, nuanced color gradients and motivated light, with rich cinematic color suited to the story and wardrobe. In surreal mode, make that sky striking while retaining credible light and cloud structure. Follow requested weather/colors; do not force clouds into an explicitly clear sky. These outdoor instructions do not add a sky, ground horizon or outdoor landmarks to indoor rooms/labs." : "";
  return "Create ONE high-detail photorealistic ".concat(subject === "none" ? "advertising" : "healthcare advertising", " image in ").concat(ratio, ", using exactly ").concat(refs.length, " reference image").concat(refs.length === 1 ? "" : "s", " in the order below. Main cast: ONE doctor").concat(cast.length ? " + " + cast.length + " supporting characters" : "", ".\n\n1. IDENTITY AND REFERENCE MAP \u2014 TOP PRIORITY\n").concat(mapping, "\n").concat(identity).concat(soloIdentity ? "\n" + soloIdentity : "", "\n\n2. CANVAS AND CAMERA\n").concat(DOCTOR_RATIOS[ratio], " Compose directly for this ratio without stretching or letterboxing.\n").concat(normalPlan ? normalPlan.viewpoint + "\n" : "").concat(framing, "\n\n3. CAST AND EXPRESSION\n").concat(castText, "\nDOCTOR EXPRESSION: ").concat(expression === "custom" ? reaction : chosenExpression[2], " Apply only this expression change while preserving identity; no stereotyped replacement face or reaction.\n\n4. WARDROBE \u2014 BODY CLOTHING ONLY\n").concat(outfit, "\n").concat(wardrobe, "\n\n5. STORY AND DESIGN\n").concat(subjectContext, "\nDESIGN TYPE \u2014 ").concat(sceneStyle).concat(normalPlan ? "\n\n" + normalPlan.directions + "\n" : "", "\nUSER DESIGN IDEA \u2014 FOLLOW THE SPECIFIED STORY:\n").concat(story, "\n\n6. CINEMATIC LIGHT AND MATERIALS\nUse ONE coherent directional key light motivated by the scene, about 45 degrees to the group, creating gentle bright/shadow planes on every face and visible fabric folds. Add soft neutral fill that keeps the eyes readable while retaining cheek/jaw shadows; avoid uniform flat front lighting. A restrained rear/side rim separates hair, shoulders and garments from the background. Carry consistent shadow direction and color reflections across ALL people. Preserve natural skin tone and protect bright highlights.\nBuild depth through foreground overlap, sculpted light and material contrast, a calmer slightly softer backdrop and atmospheric separation. Keep EVERY principal face sharp, with real skin pores, hair/beard strands and clear irises. Match all people in photographic realism; reference paintings are not an instruction for painted rendering. Honor specified colors; otherwise derive a coherent complementary palette from the doctor outfit and scene. Sharply resolved, anatomically connected hands and props; independent bodies and natural fingers.\n").concat(backdrop, "\n\n7. PRIORITIES AND OUTPUT\nFacial identity comes first; selected ratio, close-group crop/standing pose when a cast is selected, placement, expression, reference mapping and wardrobe controls govern conflicting incidental story/character wording. Keep the specified story, actions, props and environment within those controls. No additional principal people, fused faces/limbs, unrequested glasses, typography, logos, watermarks or collage seams. If text is explicitly requested, render only that text in a readable area clear of faces. Output one cohesive high-resolution design in the selected ").concat(ratio, " aspect ratio.");
}
function buildSoloDoctorPrompt() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    _ref2$subject = _ref2.subject,
    subject = _ref2$subject === void 0 ? "general" : _ref2$subject,
    _ref2$designType = _ref2.designType,
    designType = _ref2$designType === void 0 ? "normal" : _ref2$designType,
    _ref2$ratio = _ref2.ratio,
    ratio = _ref2$ratio === void 0 ? "3:4" : _ref2$ratio,
    _ref2$position = _ref2.position,
    position = _ref2$position === void 0 ? "right" : _ref2$position,
    _ref2$expression = _ref2.expression,
    expression = _ref2$expression === void 0 ? "original" : _ref2$expression,
    _ref2$expressionCusto = _ref2.expressionCustom,
    expressionCustom = _ref2$expressionCusto === void 0 ? "" : _ref2$expressionCusto,
    _ref2$idea = _ref2.idea,
    idea = _ref2$idea === void 0 ? "" : _ref2$idea,
    _ref2$clothingMode = _ref2.clothingMode,
    clothingMode = _ref2$clothingMode === void 0 ? "description" : _ref2$clothingMode,
    _ref2$clothingDescrip = _ref2.clothingDescription,
    clothingDescription = _ref2$clothingDescrip === void 0 ? "" : _ref2$clothingDescrip,
    _ref2$cameraDistance = _ref2.cameraDistance,
    cameraDistance = _ref2$cameraDistance === void 0 ? "close" : _ref2$cameraDistance,
    _ref2$normalPlan = _ref2.normalPlan,
    normalPlan = _ref2$normalPlan === void 0 ? null : _ref2$normalPlan;
  if (normalPlan) cameraDistance = normalPlan.key === "farther" ? "far" : normalPlan.key === "veryClose" ? "veryClose" : "close";
  var selectedSubject = DOCTOR_SUBJECTS.find(function (item) {
    return item[0] === subject;
  });
  var selectedExpression = DOCTOR_EXPRESSIONS.find(function (item) {
    return item[0] === expression;
  });
  var positions = {
    right: "Place the doctor on the VIEWER'S RIGHT, with the face centered roughly in the right third of the frame. Use the left side for the main story elements and environment.",
    left: "Place the doctor on the VIEWER'S LEFT, with the face centered roughly in the left third of the frame. Use the right side for the main story elements and environment.",
    center: "Place the doctor prominently in the CENTER, with a balanced supporting environment and story elements around them."
  };
  if (!selectedSubject) throw new Error("اختار تخصص الدكتور.");
  if (!["normal", "surreal"].includes(designType)) throw new Error("اختار نوع التصميم.");
  if (!Object.prototype.hasOwnProperty.call(DOCTOR_RATIOS, ratio)) throw new Error("اختار مقاس التصميم.");
  if (!Object.prototype.hasOwnProperty.call(positions, position)) throw new Error("اختار مكان الشخص في الصورة.");
  if (!selectedExpression) throw new Error("اختار تعبير الوجه.");
  var distance = DOCTOR_CAMERA_DISTANCES.find(function (item) {
    return item[0] === cameraDistance;
  });
  if (!distance) throw new Error("اختار بُعد الدكتور عن عدسة الكاميرا.");
  var userIdea = String(idea || "").trim();
  var userExpression = String(expressionCustom || "").trim();
  if (!userIdea) throw new Error("اكتب فكرة التصميم علشان نجهّز البرومبت.");
  if (expression === "custom" && !userExpression) throw new Error("اكتب وصف تعبير الوجه المخصص.");
  return "Create ONE professional high-detail ".concat(designType === "surreal" ? "photorealistic surreal" : "realistic", " ").concat(subject === "none" ? "advertising" : "healthcare advertising", " visual featuring one main doctor, using exactly ").concat(clothingMode === "image" ? "2 reference images" : "1 reference image", " supplied in order.\n\nCANVAS / ASPECT RATIO: ").concat(DOCTOR_RATIOS[ratio], " Compose directly for this selected ratio; do not reuse a fixed 3:4 or 16:9 crop, stretch the doctor, or add letterboxing.\n\nREFERENCE IMAGE 1 \u2014 DOCTOR IDENTITY \u2014 STRICT FACIAL IDENTITY: This is the sole identity source, with the highest priority over scene styling and every other reference. Preserve the doctor's exact recognizable facial structure, feature sizes and spacing, individual asymmetries, natural skin tone, eyes, eyebrows, nose, mouth, jaw, ears, hairstyle, hairline, facial hair and age. No beautification, face reshaping, de-aging, identity blending or generic substitute model. Reconstruct the requested pose and scene without changing the underlying facial structure or identity. Apply only the selected expression; explicitly requested facial effects may change surface appearance or light, never facial geometry. Keep glasses only if present on this person's own identity reference or explicitly requested. No unrequested eyewear, facial marks or injuries; no identity or accessories from a clothing model.\n\n").concat(normalPlan ? normalPlan.viewpoint + "\n\n" : "").concat(clothingMode === "image" ? "REFERENCE IMAGE 2 — CLOTHING ONLY: Recreate the garment's actual cut, colors, fabric, collar, sleeves, seams and visible details, fitting it naturally to the doctor in image 1. Do not transfer a face, body identity, eyewear, pose or background from image 2. This selected clothing reference controls the outfit, including when incidental story wording conflicts. Remove loose retail hangtags and price tags; retain intended garment details and printed design." : "DOCTOR WARDROBE: " + (String(clothingDescription || "").trim() ? String(clothingDescription).trim() + ". This selected wardrobe description controls the outfit." : "Follow the clothing explicitly requested in the USER DESIGN IDEA; otherwise retain the outfit in image 1.") + " No separate clothing image is supplied.", "\n\n").concat(subject === "none" ? "NO SUBJECT SELECTED: Build the scene solely from the USER DESIGN IDEA. Do not infer a medical specialty or automatically add healthcare symbols, medical staff, equipment or specialty-specific props. Include these only when explicitly requested in the idea." : "DOCTOR SUBJECT: " + selectedSubject[1] + ". Medical specialty context: " + selectedSubject[2] + " The subject gives context, not an instruction to insert every listed motif. Follow the user's actual story and chosen elements; avoid unrelated stock props.", "\n\nDESIGN TYPE \u2014 ").concat(designType === "surreal" ? "SURREAL" : "NORMAL / REALISTIC", ": ").concat(designType === "surreal" ? "Use a striking imaginative scene with unusual but intentional scale, forced perspective or impossible spatial relationships when relevant to the idea. Render the doctor, materials and lighting photorealistically. Make every interaction, grip and overlap credible even when the concept is fantastical. Avoid arbitrary spectacle unrelated to the subject." : "Use a believable scene with balanced composition, realistic scale, materials, perspective and physically plausible interaction. If the idea contains fantastical cues, express its core meaning through a realistic visual equivalent; do not introduce floating objects or impossible giant objects. An ordinary design may still have strong cinematic depth and visual impact.", "\n\nDOCTOR PLACEMENT: ").concat(positions[position], " Placement refers to the viewer's frame, independently of body orientation and gaze. Follow the SELECTED CAMERA FRAMING below for the person's apparent size and the visible portion of their torso. Adapt the pose and props to this crop; do not use the same waist-up size for every distance. Keep detailed eyes, clear facial expression and natural facial perspective.\n\nSELECTED CAMERA FRAMING \u2014 SUBJECT SIZE AND CROP:\n").concat(normalPlan ? normalPlan.framing : doctorSoloFraming(cameraDistance), "\n\nFACIAL EXPRESSION: ").concat(expression === "custom" ? userExpression : selectedExpression[2], " ").concat(expression === "original" ? "Keep this expression unchanged." : "Apply only the selected expression through natural facial movement.", " Preserve facial identity while applying this selected expression. Expression is independent of ordinary/surreal style and screen position. Do not replace the selected expression with a stereotyped reaction.\n\nSCENE DEPTH: stage requested foreground elements, ").concat(cameraDistance === "far" ? "the smaller waist-up doctor at the selected farther camera distance" : "the close doctor", " and the distant environment as distinct depth layers. Keep background events and landmarks behind the doctor with diminishing scale, gentler detail/contrast and atmospheric separation; ").concat(cameraDistance === "far" ? "do not bring them onto the doctor’s plane; keep the background farther away than the doctor, rather than putting the doctor among background events." : "do not bring them onto the doctor’s plane or reduce the doctor to show them.", " If the idea directs an object or action toward the camera, make that direction visible through forward reach, near-lens overlap and foreshortening of that object or action, while keeping the face recognizable. A large foreground hand or prop is not a substitute for the selected size of the PERSON; preserve the selected person framing. Use only story-related foreground elements; do not add particles or objects to every scene.\n\n").concat(normalPlan ? normalPlan.directions + "\n\n" : "", "USER DESIGN IDEA \u2014 FOLLOW THE SPECIFIED STORY:\n").concat(userIdea, "\n\nINSTRUCTION COORDINATION: The selected aspect ratio, doctor placement, selected camera distance and its specific crop, facial identity, facial expression, selected clothing source and design type have priority if an incidental phrase in the idea conflicts with them. Within these controls, honor all explicit story, color, environment, camera, gesture, prop, landmark and interaction details. Use the idea to guide scene construction; do not reduce it to a generic studio portrait. When the idea does not specify colors, choose a coherent contrasting palette appropriate to the subject and scene. Do not invent major additional landmarks, people, props, captions or logos. If background people are explicitly requested in the idea, keep them secondary and do not clone the doctor.\n\nCINEMATIC INTEGRATION: Use coherent directional light, soft neutral facial fill, restrained scene-color rim and environmental reflections. Preserve natural skin color, a well-exposed recognizable face, realistic fabric folds, controlled highlights and sculpted shadows. Build clear foreground, middle ground and background through perspective, overlap, selective focus and atmospheric depth. No dark muddy face or excessive glow. Maintain sharp iris and pupil details, eyebrow and hair strands, skin pores and facial hair; hands and the main held object must remain sharp and anatomically connected. Natural wrists, arms and fingers, no extra hands or fused limbs.\n\nOUTPUT: One cohesive high-resolution ").concat(subject === "none" ? "advertising" : "healthcare", " design in the selected ").concat(ratio, " aspect ratio, with the doctor as the main focal point and the user's idea clearly represented. No unrequested typography, watermark, logo, duplicate doctor, panel borders or collage seams. If text is explicitly requested in the idea, reproduce only the specified text and reserve a readable area without covering the doctor's face.");
}
if (typeof module !== "undefined") module.exports = {
  DOCTOR_SUBJECTS: DOCTOR_SUBJECTS,
  DOCTOR_EXPRESSIONS: DOCTOR_EXPRESSIONS,
  DOCTOR_RATIOS: DOCTOR_RATIOS,
  DOCTOR_CAST_GARMENTS: DOCTOR_CAST_GARMENTS,
  DOCTOR_CAMERA_DISTANCES: DOCTOR_CAMERA_DISTANCES,
  buildDoctorPrompt: buildDoctorPrompt
};

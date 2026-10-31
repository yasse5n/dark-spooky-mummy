// Prompts for external references; no image analysis or generation in this plugin.
if (typeof module !== "undefined") {
 var {buildTeacherNormalDirections} = require("./teacher-normal-prompt.js");
 var {buildTeacherCinematicPrompt} = require("./teacher-cinematic-prompt.js");
 var {resolveTeacherCharacters, teacherReferencePlan} = require("./teacher-characters.js");
}
const TEACHER_SUBJECTS = [
  ["none", "بدون مادة", ""],
  ["arabic", "اللغة العربية", "Arabic language, literature, grammar, poetry and calligraphy; use motifs appropriate to the stated lesson rather than random unreadable writing."],
  ["english", "اللغة الإنجليزية", "English language, literature, conversation and grammar; use story-relevant books, communication or literary motifs without defaulting to a British landmark."],
  ["math", "الرياضيات", "Mathematics: geometry, algebra, calculus and spatial reasoning; use coherent mathematical structures relevant to the stated lesson."],
  ["biology", "الأحياء", "Biology: cells, DNA, anatomy, plants, ecology and living systems; choose motifs matching the idea, not an obligatory skeleton."],
  ["geography", "الجغرافيا", "Geography: terrain, maps, climate, globes, landscapes and human geography; respect geographic relationships when a location is specified."],
  ["history", "التاريخ", "History: specified civilizations, eras, historical artifacts and architecture; match the user's era and avoid mixing unrelated historical costumes or monuments."],
  ["social", "الدراسات الاجتماعية", "Social studies: history, geography, society and civilization; choose the branch and period appropriate to the described lesson."],
  ["science", "العلوم", "General science: physical, chemical and biological phenomena; use only the branches related to the user's idea."],
  ["chemistry", "الكيمياء", "Chemistry: molecular models, reactions, materials and laboratory equipment; make connected molecular structures and coherent material interactions."],
  ["physics", "الفيزياء", "Physics: forces, motion, optics, electricity, magnetism and waves; use visual mechanisms relevant to the specified concept."],
  ["geology", "الجيولوجيا", "Geology: minerals, rock strata, earth structure, fossils, tectonics and volcanoes; choose elements consistent with the stated geological idea."],
  ["programming", "البرمجة", "Programming: logic, algorithms, computing, networks and interfaces; avoid random pseudo-code or unrequested screen text." ]
];

const TEACHER_EXPRESSIONS = [
  ["original", "نفس تعبير الصورة الأصلية", "Preserve the exact facial expression from reference image 1."],
  ["smile", "ابتسامة خفيفة", "A subtle natural smile."],
  ["excited", "مبتسم ومتحمس", "A warm enthusiastic smile with lively eyes."],
  ["confident", "جاد وواثق", "A serious, confident expression with steady eyes."],
  ["thinking", "بيفكر", "A focused thoughtful expression; do not impose a hand gesture unless the idea requests one."],
  ["amazed", "مندهش", "Visible natural amazement with raised brows and widened eyes."],
  ["shocked", "مصدوم", "A clearly shocked expression with widened eyes and a naturally parted mouth, without facial deformation."],
  ["custom", "وصف مخصص", ""]
];

const TEACHER_RATIOS = {
  "9:16": "Vertical portrait frame, aspect ratio 9:16.",
  "3:4": "Vertical portrait frame, aspect ratio 3:4.",
  "1:1": "Square frame, aspect ratio 1:1.",
  "4:3": "Horizontal landscape frame, aspect ratio 4:3.",
  "16:9": "Wide horizontal landscape frame, aspect ratio 16:9."
};

const TEACHER_CAST_GARMENTS = [
  ["auto", "تلقائي حسب ملابس المدرّس", ""],
  ["tracksuit", "تريننج / جاكيت رياضي", "modern tracksuit tops / zip-up sports jackets"],
  ["hoodie", "هودي", "modern hoodies"],
  ["suit", "بدلة", "tailored suit jackets"],
  ["shirt", "قميص", "modern shirts"],
  ["workwear", "ملابس ورشة", "workshop jackets / workwear tops"]
];

const TEACHER_CAMERA_DISTANCES = [
  ["close", "قريب"],
  ["far", "بعيد"],
  ["veryClose", "قريب جدًا"]
];

// Frame coverage and crop distinguish subject distance; prop foreshortening is separate.
function teacherSoloFraming(cameraDistance) {
  const shared = "Maintain the exact reference facial identity and natural anatomy. NO VISIBLE TROUSERS, hips, legs or feet. Keep the whole head/headwear inside the image. Do not stretch the head or change facial proportions to meet framing targets.";
  if (cameraDistance === "far") return `CAMERA DISTANCE — FAR / ENVIRONMENTAL WAIST-UP VIEW: move the camera farther along the selected sightline and allow more environment beside the person than in the tight settings. Retain small top headroom, the complete head and a waist-up lower boundary above the trouser waistband. Do not move the person down to create a large empty area above the head. ${shared} Keep the face recognizable, preserve the selected posture and horizontal position, and do not reveal a full body.`;
  if (cameraDistance === "veryClose") return (typeof module!=="undefined"?require("./teacher-camera-presets.js").qayemTeacherCrop("veryClose",0):qayemTeacherCrop("veryClose",0));
  return `CAMERA DISTANCE — CLOSE / STANDARD WAIST-UP VIEW: Use a close portrait showing the complete head and torso DOWN TO THE WAIST, cutting just above the trouser waistband. Target head-to-waist figure height about 85–95% of canvas height; complete head height about 24–30% of canvas height. The teacher fills most of the frame vertically, with modest headroom and less environment than the far setting. ${shared} Keep active hands and important prop parts readable. Crop long props beyond the image rather than zooming out. This is the standard close view, not the tight face-and-chest crop.`;
}

function buildTeacherPrompt({ subject = "arabic", designType = "normal", ratio = "3:4", position = "right", expression = "original", expressionCustom = "", idea = "", characterCount = 0, characters = [], referenceMode = "personOnly", clothingMode = "description", clothingDescription = "", outfitStrategy = "coordinated", outfitNotes = "", castGarment = "auto", cameraDistance = "close", cinematic = {}, normal = {}, fisheyeEnabled = false, fisheyeScope = "all" } = {}) {
  if (typeof fisheyeEnabled !== 'boolean') throw new Error('راجع تفعيل عين السمكة.');
  const shotApi=typeof module!=='undefined'?require('./teacher-camera-presets.js'):{qayemTeacherHeadroom,qayemTeacherLens,qayemTeacherCrop};
  const lensEffect=shotApi.qayemTeacherLens(fisheyeEnabled,fisheyeScope);
  function finish(text){
    const distanceKey=designType==='normal'&&normal.enabled?normal.cameraDistance:designType==='cinematic'?cinematic.framing:cameraDistance;
    const contract=shotApi.qayemTeacherHeadroom(Number(characterCount),distanceKey);
    return text.replace('\n\n','\n\nWARDROBE SOURCE BOUNDARY: the teacher outfit comes ONLY from the selected clothing image, dedicated wardrobe description/controls, or the teacher identity image when no wardrobe was selected. Additional design/story details do not supply or override clothing.\n\n'+contract+(lensEffect?'\n\n'+lensEffect:'')+'\n\n');
  }
  const normalPlan = designType === "normal" && normal.enabled ? buildTeacherNormalDirections(normal, characterCount) : null;
  if (normalPlan) {
    expression = "custom"; expressionCustom = normalPlan.expression;
    if (!String(idea || "").trim()) idea = "Create a realistic teacher portrait using the selected person controls and background. Retain the teacher's clothing from their identity image unless a separate wardrobe source is selected. Do not automatically add subject motifs or props.";
  }
  const chosenSubject = TEACHER_SUBJECTS.find(x => x[0] === subject);
  const chosenExpression = TEACHER_EXPRESSIONS.find(x => x[0] === expression);
  const positions = {
    right: "Teacher on the VIEWER'S RIGHT, face near the right third; keep the supporting group close to that teacher position.",
    left: "Teacher on the VIEWER'S LEFT, face near the left third; keep the supporting group close to that teacher position.",
    center: "Teacher in the CENTER, with supporting characters balanced around the shoulders."
  };
  if (!chosenSubject) throw new Error("اختار مادة المدرّس.");
  if (designType === "cinematic") {
    const cast = resolveTeacherCharacters({subject, characterCount, characters});
    const refs = teacherReferencePlan({referenceMode, clothingMode}, cast);
    return finish(buildTeacherCinematicPrompt({subject, chosenSubject, idea, cinematic, referenceMode, clothingMode, clothingDescription, outfitStrategy, outfitNotes, castGarment, fisheyeEnabled, fisheyeScope}, cast, refs));
  }
  if (!["normal", "surreal"].includes(designType)) throw new Error("اختار نوع التصميم.");
  if (!Object.prototype.hasOwnProperty.call(TEACHER_RATIOS, ratio)) throw new Error("اختار مقاس التصميم.");
  if (!positions[position]) throw new Error("اختار مكان الشخص في الصورة.");
  if (!chosenExpression) throw new Error("اختار تعبير الوجه.");
  const story = String(idea || "").trim();
  const reaction = String(expressionCustom || "").trim();
  if (!story) throw new Error("اكتب فكرة التصميم علشان نجهّز البرومبت.");
  if (expression === "custom" && !reaction) throw new Error("اكتب وصف تعبير الوجه المخصص.");
  const cast = resolveTeacherCharacters({subject, characterCount, characters});
  const refs = teacherReferencePlan({referenceMode, clothingMode}, cast);
  if (!cast.length) return finish(buildSoloTeacherPrompt({subject, designType, ratio, position, expression, expressionCustom, idea:story, clothingMode, clothingDescription, cameraDistance, normalPlan}));
  const garment = TEACHER_CAST_GARMENTS.find(x => x[0] === castGarment);
  if (cast.length && !["coordinated", "contrast"].includes(outfitStrategy)) throw new Error("اختار تنسيق ملابس الشخصيات.");
  if (cast.length && !garment) throw new Error("اختار نوع ملابس الشخصيات.");
  const teacherClothes = String(clothingDescription || "").trim();
  const groupNotes = String(outfitNotes || "").trim();
  const mapping = refs.map((ref,i) => ref.kind === "teacher"
    ? "IMAGE 1 -> MAIN TEACHER: sole source of this teacher's face and identity."
    : ref.kind === "clothing"
    ? `IMAGE ${i+1} -> TEACHER CLOTHING ONLY (LAST IMAGE): copy garment cut, material, colors and visible details; ignore the model's face, glasses, hair, age, body identity, pose and background.`
    : `IMAGE ${i+1} -> CHARACTER ${cast.indexOf(ref.character)+1} (${ref.character.name}): sole face/identity source for that character, plus characteristic headwear. Original body clothing, pose and background are excluded.`).join("\n");
  const identity = `Highest priority: preserve the recognizable identity of EACH referenced person, individually. Match facial proportions and asymmetries, eyes and spacing, brows, nose, lips, jaw, ears, age, natural skin tone, wrinkles, hairline, hairstyle and beard/moustache to that person's mapped image. A character's name is a label; the actual supplied face takes precedence over a remembered or invented likeness. No beautification, de-aging, generic replacement, face averaging, mixing or swapping. For painted/archival references, retain the facial geometry and identifying details while rendering real skin and hair in the same photographic style as the teacher.
GLASSES / ACCESSORIES: Preserve glasses only when visible on THAT person's own identity reference, or explicitly requested for that person. If that identity image has no glasses and none are requested, keep that person WITHOUT GLASSES. Never borrow glasses, hats or facial features from another person's image or from the clothing model. Keep specified characteristic headwear assigned to its owner.`;
  const soloIdentity = cast.length ? "" : "SOLO TEACHER — STRICT FACIAL IDENTITY: IMAGE 1 is the only source of the teacher's face. Preserve the exact individual facial structure, feature sizes/spacing, distinctive asymmetries, skin tone, age, hair and facial hair. Do not redesign eyes, nose, lips, cheekbones or jaw, slim the face, smooth away identifying details, beautify or replace the person with a lookalike. Apply only the selected expression through natural expression movement, without changing the underlying facial structure or identity. Apply facial effects only when explicitly requested in the STORY; they may alter surface appearance or lighting, never facial geometry. Keep defining features recognizable and facial details sharp even in a dramatic or surreal scene. No unrequested facial effects or eyewear.";
  const outfit = clothingMode === "image"
    ? `TEACHER: wear the outfit from IMAGE ${refs.length} exactly, retaining its cut, fabric and colors. Remove loose retail hangtags, price tags and packaging attached for product display; retain integral garment branding, printed design, seams and intended details. The clothing image supplies no identity or eyewear.`
    : `TEACHER: ${teacherClothes || "retain the outfit in IMAGE 1; no dedicated wardrobe description was supplied"}. This text wardrobe source has priority over incidental conflicting outfit wording in the story. No separate clothing image is supplied.`;
  const colorRoles = ["a lighter coordinated neutral or complementary shade", "a deeper complementary hue", "a distinct harmonious midtone", "a distinct harmonious accent shade"];
  const category = garment && garment[0] !== "auto" ? garment[2]
    : outfitStrategy === "coordinated" ? "the SAME garment category as the teacher's selected outfit" : "a coherent modern garment category contrasting with the teacher's outfit";
  const wardrobe = cast.length ? `CAST CATEGORY: ${category}. ${outfitStrategy === "coordinated" && castGarment === "auto" ? "If the teacher wears a tracksuit, every supporting character wears a tracksuit/sports jacket; a hoodie means hoodies, a suit means suit jackets, and a shirt means shirts." : ""} These are NEW body outfits; keep each character's face and characteristic headwear from its identity source. Historical face references do not authorize copying their old suits, robes, uniforms or medals.
${cast.map((c,i) => `CHARACTER ${i+1} OUTFIT: ${category}. Base color: ${c.outfitColor || colorRoles[i] + " chosen relative to the teacher outfit and scene"}. ${c.note ? "Apply any explicit character clothing details in this character's notes." : ""}`).join("\n")}
${outfitStrategy === "coordinated" ? "Use a unified clothing style with clearly distinct coordinated base colors." : "Use deliberate contrasting colors and outfit details, while keeping a coherent group palette."} Choose colors that separate each body from the adjacent garments AND the local background; avoid making both supporting outfits identical dark blocks or assigning arbitrary rainbow/neon colors unless requested. Re-light fabric with the same scene light, preserving garment base colors. ${groupNotes ? "GROUP WARDROBE NOTES: " + groupNotes + "." : ""} Specific character notes override group wardrobe suggestions; a specified base-color field controls that character's garment color.` : "";
  const castText = cast.length ? `Exactly ${cast.length} supporting characters, one of each:
${cast.map((c,i) => `CHARACTER ${i+1}: ${c.name}. ${c.location}. TORSO: a subtle outward turn/lean toward the VIEWER'S ${c.screenSide} (screen ${c.screenSide.toLowerCase()}, not anatomical side), about 5–10 degrees at most; balanced upright standing, not falling or leaning across the teacher. Head/gaze can face the camera or follow explicit action notes without distorting the face. ${c.note ? "CHARACTER NOTES / ACTION: " + c.note : ""}`).join("\n")}
${referenceMode === "withCharacters" ? "Every supporting identity is bound to its mapped reference above." : "No character identity images are supplied: use the generator's available knowledge for named figures, and original distinct faces for fictional characters. Do not claim exact likeness without reliable visual evidence; browsing is possible only if that external generator supports it."}` : "No selected supporting characters. Do not automatically insert people from the subject catalog. Distant crowds are allowed only when explicitly requested in the story.";
  let framing = cast.length ? `CLOSE STANDING GROUP: all ${cast.length+1} principal people appear from the complete head to the ABDOMEN AT MOST. The bottom image edge cuts through the abdomen, ABOVE the waistband/hips. Keep trousers, thighs, legs and feet OUTSIDE THE IMAGE. Everyone stands. Keep the camera close even when the references show whole bodies.
${positions[position]} The teacher is the largest foreground hero. ${["16:9","4:3"].includes(ratio) ? "Teacher head, hair/headwear top to chin, occupies about 38–44% of image height." : "Teacher head occupies about 28–36% of image height."} Use a close crop and natural anatomy. Supporting faces are about 70–85% of the teacher's apparent face height (forehead to chin), with the entire head/headwear visible.
Place the cast immediately behind or beside the teacher's shoulders in one shallow group. Leave a small breathing gap between HEAD SILHOUETTES, roughly 5–10% of the teacher's head width; no touching temples, hats or cheeks. Keep natural shoulder/torso overlap BELOW the faces. This small visual separation is achieved by a slight sideways/backwards shift, not by moving people meters away or zooming out. The teacher occludes only portions of their inner shoulders, not their faces. With 3 or 4 supporting people, stagger sideways and slightly in height while retaining large separate faces and the abdomen crop.
Keep active hands, eating gestures and relevant parts of held objects within the upper-body framing. Crop long poles or oversized props as needed rather than showing the lower body. Scene depth belongs in the backdrop; supporting characters remain near the teacher.`
    : `${{right:"Teacher on the VIEWER'S RIGHT, face near the right third.",left:"Teacher on the VIEWER'S LEFT, face near the left third.",center:"Teacher in the CENTER of the image."}[position]} SOLO WAIST-UP COMPOSITION: show the complete head, hair/headwear, shoulders, chest and torso DOWN TO THE WAIST. The bottom frame edge stops at the waist, just ABOVE the trouser waistband: NO VISIBLE TROUSERS, hips, thighs, legs or feet. This is a full waist-up crop, not a chest-only portrait or a distant full-body figure. Keep the teacher large and close, with natural head-to-body proportions and realistic facial perspective. Adapt the surrounding space to the selected aspect ratio while preserving this waist boundary. Include both active hands and the important parts of held objects within the waist-up framing; crop a long prop beyond the frame rather than zooming out or revealing trousers. Do not shrink the teacher to display the environment.`;
  if (normalPlan && normalPlan.key !== "normal") {
    const staging = framing.slice(framing.indexOf("Place the cast immediately"));
    framing = normalPlan.framing + "\n" + positions[position] + "\n" + staging;
  }
  const subjectContext = subject === "none"
    ? "NO SUBJECT SELECTED: Build the scene solely from the USER DESIGN IDEA. Do not infer a school subject or automatically add educational symbols, scientists, books, formulas or subject-specific props. Include any such elements only when explicitly requested in the idea."
    : `TEACHER SUBJECT: ${chosenSubject[1]}. ${chosenSubject[2]} Use only subject elements relevant to the actual story.`;
  const style = designType === "surreal"
    ? "SURREAL: a bold photorealistic educational advertising visual. Use the requested story for dramatic perspective, purposeful overlap and imaginative scene scale/spatial treatment. Keep faces, bodies and interactions physically convincing. Avoid a flat lineup/travel snapshot, painterly faces or toy-diorama crowds. Do not invent unrelated spectacle."
    : "NORMAL / REALISTIC: believable educational advertising photography with natural scale, materials, perspective and connected interactions. Express fantastical cues through a realistic visual equivalent.";
  const sceneStyle = subject === "none" ? style.replace("educational advertising", "advertising") : style;
  const backdrop = cast.length && !normalPlan ? `GROUP / BACKDROP SEPARATION: Keep the principal group close and sharp; set story events, requested crowds and landmarks in a genuinely distant background. Use coherent diminishing scale, subdued detail/contrast and restrained atmospheric haze, with clear space between the group and distant activity. Do not move the cast away or reduce their faces to create depth. Keep one consistent camera viewpoint and perspective across people and environment.
OUTDOOR SCENES ONLY: If the story includes a visible sky/ground horizon, place that sky-ground boundary BELOW the principal shoulders, around upper-chest level in the frame, leaving an expansive sky. This is the horizon line, not the tops of monuments: anchor landmarks to the distant ground plane at plausible scale; tall structures can extend above the horizon, without looming immediately behind heads. When sky is visible, render believable cloud volume, layered atmospheric depth, nuanced color gradients and motivated light, with rich cinematic color suited to the story and wardrobe. In surreal mode, make that sky striking while retaining credible light and cloud structure. Follow requested weather/colors; do not force clouds into an explicitly clear sky. These outdoor instructions do not add a sky, ground horizon or outdoor landmarks to indoor rooms/labs.` : "";
  return finish(`Create ONE high-detail photorealistic ${subject === "none" ? "advertising" : "educational advertising"} image in ${ratio}, using exactly ${refs.length} reference image${refs.length === 1 ? "" : "s"} in the order below. Main cast: ONE teacher${cast.length ? " + " + cast.length + " supporting characters" : ""}.

1. IDENTITY AND REFERENCE MAP — TOP PRIORITY
${mapping}
${identity}${soloIdentity ? "\n" + soloIdentity : ""}

2. CANVAS AND CAMERA
${TEACHER_RATIOS[ratio]} Compose directly for this ratio without stretching or letterboxing.
${normalPlan ? normalPlan.viewpoint + "\n" : ""}${framing}

3. CAST AND EXPRESSION
${castText}
TEACHER EXPRESSION: ${expression === "custom" ? reaction : chosenExpression[2]} Apply only this expression change while preserving identity; no stereotyped replacement face or reaction.

4. WARDROBE — BODY CLOTHING ONLY
${outfit}
${wardrobe}

5. STORY AND DESIGN
${subjectContext}
DESIGN TYPE — ${sceneStyle}${normalPlan ? "\n\n" + normalPlan.directions + "\n" : ""}
USER DESIGN IDEA — FOLLOW THE SPECIFIED STORY:
${story}

6. CINEMATIC LIGHT AND MATERIALS
Use ONE coherent directional key light motivated by the scene, about 45 degrees to the group, creating gentle bright/shadow planes on every face and visible fabric folds. Add soft neutral fill that keeps the eyes readable while retaining cheek/jaw shadows; avoid uniform flat front lighting. A restrained rear/side rim separates hair, shoulders and garments from the background. Carry consistent shadow direction and color reflections across ALL people. Preserve natural skin tone and protect bright highlights.
Build depth through foreground overlap, sculpted light and material contrast, a calmer slightly softer backdrop and atmospheric separation. Keep EVERY principal face sharp, with real skin pores, hair/beard strands and clear irises. Match all people in photographic realism; reference paintings are not an instruction for painted rendering. Honor specified colors; otherwise derive a coherent complementary palette from the teacher outfit and scene. Sharply resolved, anatomically connected hands and props; independent bodies and natural fingers.
${backdrop}

7. PRIORITIES AND OUTPUT
Facial identity comes first; selected camera viewpoint and independent lens scope, small top headroom, selected ratio, close-group crop/standing pose when a cast is selected, placement, expression, reference mapping and wardrobe controls govern conflicting incidental story/character wording. Keep the specified story, actions, props and environment within those controls. No additional principal people, fused faces/limbs, unrequested glasses, typography, logos, watermarks or collage seams. If text is explicitly requested, render only that text in a readable area clear of faces. Output one cohesive high-resolution design in the selected ${ratio} aspect ratio.`);
}

function buildSoloTeacherPrompt({ subject = "arabic", designType = "normal", ratio = "3:4", position = "right", expression = "original", expressionCustom = "", idea = "", clothingMode = "description", clothingDescription = "", cameraDistance = "close", normalPlan = null } = {}) {
  if (normalPlan) cameraDistance = normalPlan.key === "farther" ? "far" : normalPlan.key === "veryClose" ? "veryClose" : "close";
  const selectedSubject = TEACHER_SUBJECTS.find(item => item[0] === subject);
  const selectedExpression = TEACHER_EXPRESSIONS.find(item => item[0] === expression);
  const positions = {
    right: "Place the teacher on the VIEWER'S RIGHT, with the face centered roughly in the right third of the frame. Use the left side for the main story elements and environment.",
    left: "Place the teacher on the VIEWER'S LEFT, with the face centered roughly in the left third of the frame. Use the right side for the main story elements and environment.",
    center: "Place the teacher prominently in the CENTER, with a balanced supporting environment and story elements around them."
  };
  if (!selectedSubject) throw new Error("اختار مادة المدرّس.");
  if (!["normal", "surreal"].includes(designType)) throw new Error("اختار نوع التصميم.");
  if (!Object.prototype.hasOwnProperty.call(TEACHER_RATIOS, ratio)) throw new Error("اختار مقاس التصميم.");
  if (!Object.prototype.hasOwnProperty.call(positions, position)) throw new Error("اختار مكان الشخص في الصورة.");
  if (!selectedExpression) throw new Error("اختار تعبير الوجه.");
  const distance = TEACHER_CAMERA_DISTANCES.find(item => item[0] === cameraDistance);
  if (!distance) throw new Error("اختار بُعد المدرّس عن عدسة الكاميرا.");
  const userIdea = String(idea || "").trim();
  const userExpression = String(expressionCustom || "").trim();
  if (!userIdea) throw new Error("اكتب فكرة التصميم علشان نجهّز البرومبت.");
  if (expression === "custom" && !userExpression) throw new Error("اكتب وصف تعبير الوجه المخصص.");
  return `Create ONE professional high-detail ${designType === "surreal" ? "photorealistic surreal" : "realistic"} ${subject === "none" ? "advertising" : "educational advertising"} visual featuring one main teacher, using exactly ${clothingMode === "image" ? "2 reference images" : "1 reference image"} supplied in order.

CANVAS / ASPECT RATIO: ${TEACHER_RATIOS[ratio]} Compose directly for this selected ratio; do not reuse a fixed 3:4 or 16:9 crop, stretch the teacher, or add letterboxing.

REFERENCE IMAGE 1 — TEACHER IDENTITY — STRICT FACIAL IDENTITY: This is the sole identity source, with the highest priority over scene styling and every other reference. Preserve the teacher's exact recognizable facial structure, feature sizes and spacing, individual asymmetries, natural skin tone, eyes, eyebrows, nose, mouth, jaw, ears, hairstyle, hairline, facial hair and age. No beautification, face reshaping, de-aging, identity blending or generic substitute model. Reconstruct the requested pose and scene without changing the underlying facial structure or identity. Apply only the selected expression; explicitly requested facial effects may change surface appearance or light, never facial geometry. Keep glasses only if present on this person's own identity reference or explicitly requested. No unrequested eyewear, facial marks or injuries; no identity or accessories from a clothing model.

${normalPlan ? normalPlan.viewpoint + "\n\n" : ""}${clothingMode === "image" ? "REFERENCE IMAGE 2 — CLOTHING ONLY: Recreate the garment's actual cut, colors, fabric, collar, sleeves, seams and visible details, fitting it naturally to the teacher in image 1. Do not transfer a face, body identity, eyewear, pose or background from image 2. This selected clothing reference controls the outfit, including when incidental story wording conflicts. Remove loose retail hangtags and price tags; retain intended garment details and printed design." : "TEACHER WARDROBE: " + (String(clothingDescription || "").trim() ? String(clothingDescription).trim() + ". This selected wardrobe description controls the outfit." : "Retain the outfit in image 1 because no dedicated wardrobe description was supplied.") + " No separate clothing image is supplied."}

${subject === "none" ? "NO SUBJECT SELECTED: Build the scene solely from the USER DESIGN IDEA. Do not infer a school subject or automatically add educational symbols, scientists, books, formulas or subject-specific props. Include these only when explicitly requested in the idea." : "TEACHER SUBJECT: " + selectedSubject[1] + ". Subject context: " + selectedSubject[2] + " The subject gives context, not an instruction to insert every listed motif. Follow the user's actual story and chosen elements; avoid unrelated stock props."}

DESIGN TYPE — ${designType === "surreal" ? "SURREAL" : "NORMAL / REALISTIC"}: ${designType === "surreal" ? "Use a striking imaginative scene with unusual but intentional scale, forced perspective or impossible spatial relationships when relevant to the idea. Render the teacher, materials and lighting photorealistically. Make every interaction, grip and overlap credible even when the concept is fantastical. Avoid arbitrary spectacle unrelated to the subject." : "Use a believable scene with balanced composition, realistic scale, materials, perspective and physically plausible interaction. If the idea contains fantastical cues, express its core meaning through a realistic visual equivalent; do not introduce floating objects or impossible giant objects. An ordinary design may still have strong cinematic depth and visual impact."}

TEACHER PLACEMENT: ${positions[position]} Placement refers to the viewer's frame, independently of body orientation and gaze. Follow the SELECTED CAMERA FRAMING below for the person's apparent size and the visible portion of their torso. Preserve the selected torso pose and adapt prop visibility to this crop; do not use the same waist-up size for every distance. Keep detailed eyes, clear facial expression and natural facial perspective.

SELECTED CAMERA FRAMING — SUBJECT SIZE AND CROP:
${normalPlan ? normalPlan.framing : teacherSoloFraming(cameraDistance)}

FACIAL EXPRESSION: ${expression === "custom" ? userExpression : selectedExpression[2]} ${expression === "original" ? "Keep this expression unchanged." : "Apply only the selected expression through natural facial movement."} Preserve facial identity while applying this selected expression. Expression is independent of ordinary/surreal style and screen position. Do not replace the selected expression with a stereotyped reaction.

SCENE DEPTH: stage requested foreground elements, ${cameraDistance === "far" ? "the smaller waist-up teacher at the selected farther camera distance" : "the close teacher"} and the distant environment as distinct depth layers. Keep background events and landmarks behind the teacher with diminishing scale, gentler detail/contrast and atmospheric separation; ${cameraDistance === "far" ? "do not bring them onto the teacher’s plane; keep the background farther away than the teacher, rather than putting the teacher among background events." : "do not bring them onto the teacher’s plane or reduce the teacher to show them."} If the idea directs an object or action toward the camera, make that direction visible through forward reach, near-lens overlap and foreshortening of that object or action, while keeping the face recognizable. A large foreground hand or prop is not a substitute for the selected size of the PERSON; preserve the selected person framing. Use only story-related foreground elements; do not add particles or objects to every scene.

${normalPlan ? normalPlan.directions + "\n\n" : ""}USER DESIGN IDEA — FOLLOW THE SPECIFIED STORY:
${userIdea}

INSTRUCTION COORDINATION: The selected aspect ratio, selected camera viewpoint and independent lens scope, small top headroom, teacher placement, selected camera distance and its specific crop, facial identity, facial expression, selected clothing source and design type have priority if an incidental phrase in the idea conflicts with them. Within these controls, honor all explicit story, color, environment, camera, gesture, prop, landmark and interaction details. Use the idea to guide scene construction; do not reduce it to a generic studio portrait. When the idea does not specify colors, choose a coherent contrasting palette appropriate to the subject and scene. Do not invent major additional landmarks, people, props, captions or logos. If background people are explicitly requested in the idea, keep them secondary and do not clone the teacher.

CINEMATIC INTEGRATION: Use coherent directional light, soft neutral facial fill, restrained scene-color rim and environmental reflections. Preserve natural skin color, a well-exposed recognizable face, realistic fabric folds, controlled highlights and sculpted shadows. Build clear foreground, middle ground and background through perspective, overlap, selective focus and atmospheric depth. No dark muddy face or excessive glow. Maintain sharp iris and pupil details, eyebrow and hair strands, skin pores and facial hair; hands and the main held object must remain sharp and anatomically connected. Natural wrists, arms and fingers, no extra hands or fused limbs.

OUTPUT: One cohesive high-resolution ${subject === "none" ? "advertising" : "educational"} design in the selected ${ratio} aspect ratio, with the teacher as the main focal point and the user's idea clearly represented. No unrequested typography, watermark, logo, duplicate teacher, panel borders or collage seams. If text is explicitly requested in the idea, reproduce only the specified text and reserve a readable area without covering the teacher's face.`;
}


if (typeof module !== "undefined") module.exports = {TEACHER_SUBJECTS, TEACHER_EXPRESSIONS, TEACHER_RATIOS, TEACHER_CAST_GARMENTS, TEACHER_CAMERA_DISTANCES, buildTeacherPrompt};

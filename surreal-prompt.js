// Standalone thumbnail mode: two external references, no image upload or API.
const SURREAL_PALETTES = [
  { key: "tealOrange", label: "تركواز × برتقالي ناري", colors: ["#087e8b", "#ff641c", "#ffd275"], description: "A deep teal environment contrasts with fiery orange accents and warm golden light. Use teal in distant scenery, orange on the principal story element or coordinated garment, and golden highlights." },
  { key: "purpleLemon", label: "بنفسجي × أصفر ليموني", colors: ["#6436b8", "#edff38", "#c5a9ff"], description: "A rich violet environment contrasts with vivid lemon-yellow focal accents, with restrained lavender rim light. Keep yellow concentrated on the main prop or coordinated clothing." },
  { key: "blueGold", label: "أزرق كهربائي × ذهبي", colors: ["#194fff", "#eab936", "#c5e7ff"], description: "Electric royal-blue and violet foreground tones contrast with a luminous golden sky or distant environment. Warm gold light meets a cool-blue edge light." },
  { key: "cyanLime", label: "سماوي × أخضر فسفوري", colors: ["#65dce7", "#48f51d", "#fff0a4"], description: "An airy cyan environment contrasts with vivid phosphor-lime green story elements or coordinated clothing, with subtle pale-yellow sunlight. Preserve a bright, energetic, dimensional scene." },
  { key: "crimsonIce", label: "أحمر قرمزي × سماوي ثلجي", colors: ["#b71935", "#a5efff", "#fff6ef"], description: "A deep crimson environment contrasts with icy-cyan accents and pale clothing when recoloring is enabled. Use a restrained cyan edge light and neutral face illumination." },
  { key: "navyFuchsia", label: "كحلي × وردي فوشيا", colors: ["#172648", "#f52cad", "#50def6"], description: "A cinematic navy environment contrasts with an intense fuchsia main accent and small cyan highlights. Keep the face well exposed despite the darker scenery." },
  { key: "purpleOrange", label: "بنفسجي × برتقالي مشع", colors: ["#6231a2", "#ff861d", "#ffd893"], description: "A deep purple environment contrasts with radiant orange clothing or a main story element and warm amber highlights. Make the orange focal element clearly separate from the violet depth." },
  { key: "emeraldPink", label: "أخضر زمردي × وردي فاقع", colors: ["#087f64", "#ff539d", "#effff9"], description: "An emerald-green environment contrasts with vivid pink focal accents and clean white light. Use pink on the principal prop or coordinated garment, with a subtle emerald environmental reflection." }
];

const SURREAL_REACTIONS = [
  ["amazed", "مندهش جدًا", "Clearly amazed: widened eyes, lifted eyebrows and a naturally open mouth; strong readable surprise without changing facial identity."],
  ["shocked", "مصدوم ومش مصدّق", "Disbelieving shock: raised brows, widened eyes and a slightly dropped jaw, as if confronting something impossible."],
  ["excited", "مبسوط ومتحمس", "Delighted and excited: a broad authentic smile and energetic eyes, preserving the person's real facial structure."],
  ["laughing", "بيضحك", "A spontaneous believable laugh with naturally lifted cheeks and expressive eyes; no exaggerated face deformation."],
  ["thinking", "بيفكر باستغراب", "Curious puzzled thought: one eyebrow subtly raised, focused eyes and a thoughtful mouth; do not impose a hand pose."],
  ["afraid", "خايف ومتوتر", "Visible fear and tension: alert eyes, tense brows and a slightly parted mouth, without horror wounds or facial distortion."],
  ["confident", "واثق وبيتحدى", "Confident and challenging: steady eyes, a subtle self-assured smile and purposeful expression."],
  ["angry", "غاضب", "Clearly angry: naturally knitted brows, intense eyes and a tense mouth, retaining authentic recognizable features."],
  ["custom", "وصف مخصص", ""]
];

const SURREAL_HANDS = [
  ["point", "بيشاور على عنصر", "Point toward the described main story element with one naturally connected arm and readable index-finger gesture; if no element is specified, point toward the open composition area without inventing a prop."],
  ["reach", "بيمد إيده ناحية الكاميرا", "Extend one connected arm toward the camera with clear near/far depth and a natural hand; preserve correct anatomy and keep it away from the face."],
  ["chin", "إيد على الذقن للتفكير", "Rest one hand naturally against the chin in a thinking gesture, without hiding the eyes, mouth or identifying facial features."],
  ["face", "إيدين جنب الوجه من الصدمة", "Raise both hands beside the face in a surprised gesture; keep the entire face unobscured and each wrist connected naturally."],
  ["crossed", "ذراعين متقاطعين", "Cross the arms naturally across the upper torso, with realistic elbows and readable hands."],
  ["relaxed", "إيديه بجانبه", "Keep both arms naturally relaxed beside the body; do not introduce a held object."],
  ["holding", "ماسك حاجة", ""],
  ["custom", "حركة مخصصة", ""]
];

function buildSurrealThumbnailPrompt(options = {}) {
  const { position = "right", palette = "tealOrange", reaction = "amazed", hand = "relaxed", sceneMode = "none", foregroundMode = "none", recolor = "no" } = options;
  const clean = key => String(options[key] || "").trim();
  const positions = {
    right: "Place the person on the VIEWER'S RIGHT, with the face centered around x = 72% of image width; keep the opposite left area available for the story environment.",
    left: "Place the person on the VIEWER'S LEFT, with the face centered around x = 28% of image width; keep the opposite right area available for the story environment.",
    center: "Place the person's face on the horizontal centerline, x = 50% of image width, with balanced scenery around them."
  };
  if (!Object.prototype.hasOwnProperty.call(positions, position)) throw new Error("اختار مكان الشخص في الصورة.");
  const color = SURREAL_PALETTES.find(item => item.key === palette);
  if (!color && palette !== "auto") throw new Error("اختار ألوان التصميم.");
  const mood = SURREAL_REACTIONS.find(item => item[0] === reaction);
  const gesture = SURREAL_HANDS.find(item => item[0] === hand);
  if (!mood || !gesture) throw new Error("اختار ريأكشن الشخص وحركة اليد.");
  if (reaction === "custom" && !clean("reactionCustom")) throw new Error("اكتب وصف الريأكشن المخصص.");
  if (hand === "custom" && !clean("handCustom")) throw new Error("اكتب حركة اليد المخصصة.");
  if (hand === "holding" && !clean("heldObject")) throw new Error("اكتب إيه اللي الشخص ماسكه.");
  if (!["none", "yes"].includes(sceneMode) || !["none", "flying", "near", "both"].includes(foregroundMode) || !["yes", "no"].includes(recolor)) throw new Error("راجع اختيارات العناصر وألوان الملابس.");
  if (sceneMode === "yes" && !clean("sceneDescription")) throw new Error("اوصف العناصر أو المعالم اللي عاوزها.");
  if (foregroundMode !== "none" && !clean("foregroundDescription")) throw new Error("حدد العنصر أو العناصر الأمامية.");
  const paletteText = color ? color.description : "Choose ONE coherent bold contrasting palette appropriate to the described story from these combinations: teal/orange/gold, violet/lemon yellow, electric blue/gold, cyan/phosphor lime, crimson/icy cyan, navy/fuchsia, purple/orange, emerald/vivid pink. Use one dominant environmental color, one contrasting focal accent and one restrained lighting accent; do not combine every palette.";
  const handText = hand === "holding" ? `Hold the following specified object naturally: ${clean("heldObject")}. Show a credible grip, fingers wrapping or supporting its actual shape, with a visibly connected wrist, forearm and shoulder. Follow any specified scale and orientation; never make the object float beside the hand.` : hand === "custom" ? clean("handCustom") : gesture[2];
  const foregroundText = foregroundMode === "none" ? "Do not add flying objects, particles or lens-near decorative elements." : `MODE: ${ { flying: "FLYING ELEMENTS", near: "ELEMENT CLOSE TO THE LENS", both: "FLYING AND LENS-NEAR ELEMENTS" }[foregroundMode] }. Use ONLY the user-described elements: ${clean("foregroundDescription")}. Respect each specified position, size and camera distance. Arrange them around the edges as visual leading lines toward the person. Lens-near decorative elements may be softly out of focus, while the face, eyes, hands and principal held object remain sharp. Flying elements at the subject plane may remain sharp. Do not obscure the face, compete with it, or create visual clutter. If an element is the same held object already described, use that single connected object rather than adding an unintended duplicate.`;
  return `Create ONE photorealistic, cinematic, strange surreal thumbnail in a horizontal 16:9 frame, target 1920 x 1080, using exactly TWO reference images supplied in order. Build a coherent three-dimensional scene with a striking readable idea, convincing materials and impossible-but-intentional scale or spatial relationships. The person is the principal focal point. No cartoon rendering, flat cutout montage or generic small distant portrait.

REFERENCE IMAGE 1 — PERSON / IDENTITY ONLY: Preserve this real person's EXACT recognizable facial structure, eyes, brows, nose, mouth, jaw, ears, hairstyle, hairline, facial hair, natural skin tone and identifying eyeglasses. Preserve natural head-to-body proportions. Do not beautify, reshape, blend identities or transfer the face from image 2. The selected reaction and gesture may change naturally while retaining this person's identity.

REFERENCE IMAGE 2 — CLOTHING ONLY: Recreate the garment's actual cut, construction, fabric, collar, sleeves, seams, layers and visible design details. Fit it naturally on the person in image 1. ${recolor === "yes" ? "AUTOMATIC CLOTHING COLOR COORDINATION — YES: Recolor the garment into coordinated shades of the selected palette, choosing a strong contrast against the environment. Keep its cut, material, pattern structure and design details; change color, not clothing category. Do not recolor the face or skin." : "AUTOMATIC CLOTHING COLOR COORDINATION — NO: Preserve the reference garment's exact original colors as well as its details. Adapt the environment, accent elements and restrained edge lighting to complement and separate this original outfit. Environmental reflections must not replace the garment's base colors."} Never transfer identity, pose or background from the clothing reference.

FIXED CLOSE THUMBNAIL SCALE: Keep the person large and near the camera at all three horizontal positions. The full head including hair occupies approximately 38–46% of frame height; shoulders and upper torso form a dominant foreground presence roughly 55–65% of frame width. Use a small top margin and show enough upper torso for the selected hand action and held object. Preserve the full head and active hands inside the frame. Fit necessary gestures and props with the minimum additional space; do not zoom out to show waist, legs or a full body. Moving the person left, right or center must NOT change their apparent size or camera distance. Use convincing portrait perspective and mild foreground foreshortening without fisheye distortion, an oversized nose or a head enlarged independently of the body.

PERSON POSITION: ${positions[position]} Position means screen placement, not turning the face. Keep both eyes and the expression clearly readable; direct gaze toward the camera unless the user's gesture note explicitly requests a story interaction or other gaze. Do not crop the head against a side edge.

COLOR DIRECTION: ${paletteText} Organize dominant color, contrasting accent and highlights across scenery, clothing where allowed, and story elements. Use rich controlled color, realistic reflections and layered shadows rather than uniform tinting. Preserve natural skin and balanced facial exposure.

PERSON REACTION: ${reaction === "custom" ? clean("reactionCustom") : mood[2]} Make the reaction easy to read at thumbnail size without deforming the person.

HAND ACTION / INTERACTION: ${handText}${clean("handNote") ? "\nUSER GESTURE NOTE: " + clean("handNote") + ". This explicit note overrides conflicting generic gesture or default gaze instructions." : ""} Maintain natural fingers and one continuous shoulder-arm-wrist-hand connection, with no extra hands or fused limbs. Keep the face unobscured.

STORY ELEMENTS / LANDMARKS: ${sceneMode === "yes" ? `Use the user's described elements and landmarks: ${clean("sceneDescription")}. Respect their specified location, size, depth and interaction. Integrate them into the same palette, perspective and lighting; keep the hero's face dominant. Do not invent additional major landmarks, characters or props.` : "No additional landmarks or story props. Build a dimensional atmospheric environment from the selected palette, with receding shapes and clear foreground/midground/background separation. A separately requested held object or foreground element is still allowed."}

FOREGROUND DEPTH ELEMENTS: ${foregroundText}

CINEMATIC LIGHT AND FINISH: Use a soft neutral key and gentle fill to keep the face bright, detailed and naturally colored, with directional colored rim light motivated by the scene. Add restrained selected-color bounce on garment folds and hair edges. Sculpt cheeks, jaw, fabric folds and material texture with believable highlights and shadows. Separate close subject, midground story objects and distant environment through perspective, occlusion, selective focus and atmospheric depth. Preserve sharp iris and pupil details, individual eyebrow and hair strands, facial-hair detail and natural skin pores; no plastic skin, muddy shadows, blown-out face, blur on face or hands, or excessive glowing outlines.

OUTPUT: One coherent 16:9 surreal thumbnail with exactly one recognizable main person, clear focal hierarchy and strong color contrast. No typography, captions, logos, watermark or unrequested duplicate people. Leave open areas naturally integrated into the scenery rather than blank rectangles.`;
}

if (typeof module !== "undefined") module.exports = { SURREAL_PALETTES, SURREAL_REACTIONS, SURREAL_HANDS, buildSurrealThumbnailPrompt };

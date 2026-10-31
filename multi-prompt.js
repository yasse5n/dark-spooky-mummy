// Each look is a clothing-category suggestion. The image model reads the actual
// palette from reference image 2; this prompt-only plugin does not inspect it.
const OUTFIT_VARIATIONS = [
  ["قميص أبيض أو أوف وايت", "A crisp white or warm off-white shirt, chosen as a clean neutral companion to the source garment's palette. Distinct from the exact reference outfit."],
  ["هودي بدرجة أغمق", "A plain premium hoodie in a visibly darker shade of the source garment's dominant color, with matching warm or cool undertones."],
  ["تيشيرت بدرجة أفتح", "A clean T-shirt in a visibly lighter shade of the source garment's dominant color; keep the overall palette coordinated."],
  ["قميص كاجوال بنفس العائلة", "A casual button-up shirt in a related hue from the source garment's color family, clearly different in cut from the source outfit."],
  ["جاكيت بدرجة مكملة", "A simple jacket in a restrained complementary neutral or deeper related color derived from the source garment, with a plain inner layer."],
  ["سويت شيرت بلون متوسط", "A plain sweatshirt in a medium shade between the lightest and darkest tones of the source garment's palette."],
  ["كارديجان وطبقة داخلية فاتحة", "A textured cardigan in a related shade of the source garment's main color, over a light neutral shirt."],
  ["أوفرشيرت بلون أغمق", "A structured overshirt in a deeper shade of the source garment's palette, over a simple white or off-white base layer."]
];

const MULTI_LAYOUTS = {
  lineup: "Arrange the copies side by side in one continuous studio space, with clear separation and roughly equal size. Keep every head and upper body visible.",
  hero: "Make copy 1 the largest foreground hero, with the other copies slightly smaller around and behind them. Keep every secondary face, hand action and distinct garment readable; do not hide a head or merge bodies.",
  staggered: "Arrange the copies at slightly staggered depths and heights within one continuous studio photograph. Give each copy clear room for their pose; use natural overlap only between separate intact silhouettes."
};

function buildMultiPersonPrompt({ count, layout, cameraPerspective, background, palette, clones, backgroundType = "studio", roomColor = "", roomIdea = "", skyTone = "auto", cameraDistance = "normal" }) {
  const number = Number(count);
  if (!Number.isInteger(number) || number < 2 || number > 4 || !Array.isArray(clones) || clones.length !== number) {
    throw new Error("حدد من نسختين إلى أربع نسخ، واضبط اختيارات كل نسخة.");
  }
  if (!Object.prototype.hasOwnProperty.call(MULTI_LAYOUTS, layout)) throw new Error("اختار توزيع النسخ.");
  const rawCamera = String(cameraPerspective || "").trim();
  const distanceApi = typeof module !== "undefined" ? require("./distance.js") : { buildCameraDistance, perspectiveForDistance, skyForDistance, roomForDistance };
  const distance = distanceApi.buildCameraDistance(cameraDistance, number);
  const sky = distanceApi.skyForDistance(backgroundType === "sky"
    ? (typeof module !== "undefined" ? require("./background.js").buildSkyBackground : buildSkyBackground)(skyTone, number)
    : null, distance);
  const camera = distanceApi.perspectiveForDistance(rawCamera, distance);
  const room = distanceApi.roomForDistance(backgroundType === "room"
    ? (typeof module !== "undefined" ? require("./background.js").buildRoomBackground : buildRoomBackground)(roomColor, number, roomIdea)
    : "", distance);
  const backdrop = String((sky ? "cinematic blue sky" : room ? roomColor : background) || "").trim();
  const placement = sky ? MULTI_LAYOUTS[layout].replace("studio space", "sky scene").replace("studio photograph", "sky composite") : room ? MULTI_LAYOUTS[layout].replace("studio space", "room").replace("studio photograph", "room photograph") : MULTI_LAYOUTS[layout];
  if (!camera || !backdrop) throw new Error("حدد منظور الكاميرا والخلفية.");
  const normalized = clones.map((copy, index) => {
    const result = {
      bodyAngle: String(copy.bodyAngle || "").trim(),
      faceGaze: String(copy.faceGaze || "").trim(),
      expression: String(copy.expression || "").trim(),
      handAction: String(copy.handAction || "").trim(),
      garment: index === 0 ? "EXACT outfit from reference image 2" : String(copy.garment || "").trim()
    };
    if (Object.values(result).some(value => !value)) throw new Error(`كمّل اللبس والحركة والوقفة والنظرة للنسخة ${index + 1}.`);
    return result;
  });
  const clothesPalette = String(palette || "").trim();
  const paletteInstruction = clothesPalette
    ? `The user specifies the main clothing color family as: ${clothesPalette}. Match it to reference image 2, and use coordinated lighter, darker and neutral companion shades for the other outfits.`
    : "Infer the main garment's color family and undertones from reference image 2. Coordinate lighter, darker and neutral companion shades. White or off-white may act as a clean neutral companion.";
  const directions = normalized.map((copy, index) => `COPY ${index + 1}${index === 0 ? " — ORIGINAL LOOK" : " — DISTINCT VARIATION"}:
Clothing: ${copy.garment}${index === 0 ? ". Reproduce its exact cut, fabric, color and visible details; do not reinterpret it as another garment." : ". Make this a different garment type from copy 1 and from the other variations. Use the specified palette."}
Torso and shoulders: ${copy.bodyAngle}
Head and eyes: ${copy.faceGaze}
Expression: ${copy.expression}
Hand action: ${copy.handAction}`).join("\n\n");

  return `Create ONE photorealistic vertical 3:4 ${sky ? "cinematic city poster composite" : room ? "room photograph" : "studio photograph"} containing EXACTLY ${number} visible copies of the SAME person, using exactly TWO reference images supplied in order. This is one coherent scene, not separate panels or a collage.${distance ? "\n\n" + distance.instruction : ""}${sky ? "\n\n" + sky.priority : ""}

REFERENCE IMAGE 1 — IDENTITY ONLY: Every copy is the identical real person in image 1, with the same recognizable facial structure, hairline, hair, facial hair, age, skin texture and skin tone; retain eyeglasses and distinctive features when present. Their actions and expressions differ, but they must never look like relatives or different models. Reconstruct each face at its requested viewpoint instead of cloning the reference photo's pose, framing or background. Do not beautify, replace, mirror or blend their identity with image 2.

REFERENCE IMAGE 2 — ORIGINAL CLOTHING AND COLOR PALETTE ONLY: Copy 1 wears the EXACT outfit from reference image 2, including its cut, fabric, seams, collar, sleeves, color and visible design details. The other ${number - 1} ${number === 2 ? "copy wears" : "copies wear"} different clothing categories in coordinated colors; do not repeat copy 1's exact outfit on them. If a suggested variation happens to be the same garment category as the actual reference outfit, adapt the variation into a clearly different cut or clothing category while preserving its proposed color relationship. ${paletteInstruction} The reference clothing image supplies no face or body identity.

GLOBAL CAMERA VIEWPOINT: ${camera} Make this viewpoint visually evident in the shared scene; do not reuse image 1's original camera angle as a default.

COMPOSITION / PLACEMENT: ${placement} Keep the full head of EVERY copy in frame and ${distance ? distance.framing : sky ? "keep each upper body framed to approximately the waist. " + sky.framing : "show each upper body down to approximately the waist, with at most a tiny strip of trousers at the bottom."} Scale the people as necessary to fit all ${number} within one vertical 3:4 frame, without slicing faces or hands. Each copy must have one anatomically complete torso, two connected arms and natural fingers; avoid fused limbs, extra hands and duplicate faces. Show their different actions clearly. For the hero layout, copy 1 stays most prominent while the others remain distinctly visible. Leave natural breathing room between copies.

PER-COPY INSTRUCTIONS — do not swap outfits or poses between copies:
${directions}

Keep the torso pose, head direction, gaze and hand action for each copy distinct and internally consistent. A camera orbit must change the view of the posed people, not merely rotate their heads. In head/gaze instructions, RIGHT and LEFT mean that person's anatomical sides; VIEWER and FRAME refer to the final image.

${(sky && sky.background) || room || `BACKGROUND: ${backdrop} Use one continuous clean studio backdrop with the selected solid or smooth gradient; no walls, scenery, props, dividing lines, typography or watermark. Do not replace a colored background with white unless white was selected.`}

${sky ? sky.lighting : `LIGHTING: Light all copies coherently with a professional neutral-to-cool white studio side light from the VIEWER'S LEFT, slightly behind and above them, with soft white frontal fill to keep every face visible. Reflect the selected background colors subtly on nearby garment edges and shoulders while preserving natural skin tones. Keep fine face, hair and fabric detail and believable depth. No dark or hidden faces.`}${sky ? "\n\n" + sky.output : ""}

OUTPUT: Exactly ${number} distinct figures of the same person, copy 1 in the exact reference outfit, all later copies in different coordinated garments, with visibly different poses. One sharp photograph; no additional people, text, collage borders, fisheye distortion or duplicated limbs.`;
}

if (typeof module !== "undefined") module.exports = { OUTFIT_VARIATIONS, MULTI_LAYOUTS, buildMultiPersonPrompt };

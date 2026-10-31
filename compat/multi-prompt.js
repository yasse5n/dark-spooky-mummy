// Each look is a clothing-category suggestion. The image model reads the actual
// palette from reference image 2; this prompt-only plugin does not inspect it.
var OUTFIT_VARIATIONS = [["قميص أبيض أو أوف وايت", "A crisp white or warm off-white shirt, chosen as a clean neutral companion to the source garment's palette. Distinct from the exact reference outfit."], ["هودي بدرجة أغمق", "A plain premium hoodie in a visibly darker shade of the source garment's dominant color, with matching warm or cool undertones."], ["تيشيرت بدرجة أفتح", "A clean T-shirt in a visibly lighter shade of the source garment's dominant color; keep the overall palette coordinated."], ["قميص كاجوال بنفس العائلة", "A casual button-up shirt in a related hue from the source garment's color family, clearly different in cut from the source outfit."], ["جاكيت بدرجة مكملة", "A simple jacket in a restrained complementary neutral or deeper related color derived from the source garment, with a plain inner layer."], ["سويت شيرت بلون متوسط", "A plain sweatshirt in a medium shade between the lightest and darkest tones of the source garment's palette."], ["كارديجان وطبقة داخلية فاتحة", "A textured cardigan in a related shade of the source garment's main color, over a light neutral shirt."], ["أوفرشيرت بلون أغمق", "A structured overshirt in a deeper shade of the source garment's palette, over a simple white or off-white base layer."]];
var MULTI_LAYOUTS = {
  lineup: "Arrange the copies side by side in one continuous studio space, with clear separation and roughly equal size. Keep every head and upper body visible.",
  hero: "Make copy 1 the largest foreground hero, with the other copies slightly smaller around and behind them. Keep every secondary face, hand action and distinct garment readable; do not hide a head or merge bodies.",
  staggered: "Arrange the copies at slightly staggered depths and heights within one continuous studio photograph. Give each copy clear room for their pose; use natural overlap only between separate intact silhouettes."
};
function buildMultiPersonPrompt(_ref) {
  var count = _ref.count,
    layout = _ref.layout,
    cameraPerspective = _ref.cameraPerspective,
    background = _ref.background,
    palette = _ref.palette,
    clones = _ref.clones,
    _ref$backgroundType = _ref.backgroundType,
    backgroundType = _ref$backgroundType === void 0 ? "studio" : _ref$backgroundType,
    _ref$roomColor = _ref.roomColor,
    roomColor = _ref$roomColor === void 0 ? "" : _ref$roomColor,
    _ref$roomIdea = _ref.roomIdea,
    roomIdea = _ref$roomIdea === void 0 ? "" : _ref$roomIdea,
    _ref$skyTone = _ref.skyTone,
    skyTone = _ref$skyTone === void 0 ? "auto" : _ref$skyTone,
    _ref$cameraDistance = _ref.cameraDistance,
    cameraDistance = _ref$cameraDistance === void 0 ? "normal" : _ref$cameraDistance;
  var number = Number(count);
  if (!Number.isInteger(number) || number < 2 || number > 4 || !Array.isArray(clones) || clones.length !== number) {
    throw new Error("حدد من نسختين إلى أربع نسخ، واضبط اختيارات كل نسخة.");
  }
  if (!Object.prototype.hasOwnProperty.call(MULTI_LAYOUTS, layout)) throw new Error("اختار توزيع النسخ.");
  var rawCamera = String(cameraPerspective || "").trim();
  var distanceApi = typeof module !== "undefined" ? require("./distance.js") : {
    buildCameraDistance: buildCameraDistance,
    perspectiveForDistance: perspectiveForDistance,
    skyForDistance: skyForDistance,
    roomForDistance: roomForDistance
  };
  var distance = distanceApi.buildCameraDistance(cameraDistance, number);
  var sky = distanceApi.skyForDistance(backgroundType === "sky" ? (typeof module !== "undefined" ? require("./background.js").buildSkyBackground : buildSkyBackground)(skyTone, number) : null, distance);
  var camera = distanceApi.perspectiveForDistance(rawCamera, distance);
  var room = distanceApi.roomForDistance(backgroundType === "room" ? (typeof module !== "undefined" ? require("./background.js").buildRoomBackground : buildRoomBackground)(roomColor, number, roomIdea) : "", distance);
  var backdrop = String((sky ? "cinematic blue sky" : room ? roomColor : background) || "").trim();
  var placement = sky ? MULTI_LAYOUTS[layout].replace("studio space", "sky scene").replace("studio photograph", "sky composite") : room ? MULTI_LAYOUTS[layout].replace("studio space", "room").replace("studio photograph", "room photograph") : MULTI_LAYOUTS[layout];
  if (!camera || !backdrop) throw new Error("حدد منظور الكاميرا والخلفية.");
  var normalized = clones.map(function (copy, index) {
    var result = {
      bodyAngle: String(copy.bodyAngle || "").trim(),
      faceGaze: String(copy.faceGaze || "").trim(),
      expression: String(copy.expression || "").trim(),
      handAction: String(copy.handAction || "").trim(),
      garment: index === 0 ? "EXACT outfit from reference image 2" : String(copy.garment || "").trim()
    };
    if (Object.values(result).some(function (value) {
      return !value;
    })) throw new Error("\u0643\u0645\u0651\u0644 \u0627\u0644\u0644\u0628\u0633 \u0648\u0627\u0644\u062D\u0631\u0643\u0629 \u0648\u0627\u0644\u0648\u0642\u0641\u0629 \u0648\u0627\u0644\u0646\u0638\u0631\u0629 \u0644\u0644\u0646\u0633\u062E\u0629 ".concat(index + 1, "."));
    return result;
  });
  var clothesPalette = String(palette || "").trim();
  var paletteInstruction = clothesPalette ? "The user specifies the main clothing color family as: ".concat(clothesPalette, ". Match it to reference image 2, and use coordinated lighter, darker and neutral companion shades for the other outfits.") : "Infer the main garment's color family and undertones from reference image 2. Coordinate lighter, darker and neutral companion shades. White or off-white may act as a clean neutral companion.";
  var directions = normalized.map(function (copy, index) {
    return "COPY ".concat(index + 1).concat(index === 0 ? " — ORIGINAL LOOK" : " — DISTINCT VARIATION", ":\nClothing: ").concat(copy.garment).concat(index === 0 ? ". Reproduce its exact cut, fabric, color and visible details; do not reinterpret it as another garment." : ". Make this a different garment type from copy 1 and from the other variations. Use the specified palette.", "\nTorso and shoulders: ").concat(copy.bodyAngle, "\nHead and eyes: ").concat(copy.faceGaze, "\nExpression: ").concat(copy.expression, "\nHand action: ").concat(copy.handAction);
  }).join("\n\n");
  return "Create ONE photorealistic vertical 3:4 ".concat(sky ? "cinematic city poster composite" : room ? "room photograph" : "studio photograph", " containing EXACTLY ").concat(number, " visible copies of the SAME person, using exactly TWO reference images supplied in order. This is one coherent scene, not separate panels or a collage.").concat(distance ? "\n\n" + distance.instruction : "").concat(sky ? "\n\n" + sky.priority : "", "\n\nREFERENCE IMAGE 1 \u2014 IDENTITY ONLY: Every copy is the identical real person in image 1, with the same recognizable facial structure, hairline, hair, facial hair, age, skin texture and skin tone; retain eyeglasses and distinctive features when present. Their actions and expressions differ, but they must never look like relatives or different models. Reconstruct each face at its requested viewpoint instead of cloning the reference photo's pose, framing or background. Do not beautify, replace, mirror or blend their identity with image 2.\n\nREFERENCE IMAGE 2 \u2014 ORIGINAL CLOTHING AND COLOR PALETTE ONLY: Copy 1 wears the EXACT outfit from reference image 2, including its cut, fabric, seams, collar, sleeves, color and visible design details. The other ").concat(number - 1, " ").concat(number === 2 ? "copy wears" : "copies wear", " different clothing categories in coordinated colors; do not repeat copy 1's exact outfit on them. If a suggested variation happens to be the same garment category as the actual reference outfit, adapt the variation into a clearly different cut or clothing category while preserving its proposed color relationship. ").concat(paletteInstruction, " The reference clothing image supplies no face or body identity.\n\nGLOBAL CAMERA VIEWPOINT: ").concat(camera, " Make this viewpoint visually evident in the shared scene; do not reuse image 1's original camera angle as a default.\n\nCOMPOSITION / PLACEMENT: ").concat(placement, " Keep the full head of EVERY copy in frame and ").concat(distance ? distance.framing : sky ? "keep each upper body framed to approximately the waist. " + sky.framing : "show each upper body down to approximately the waist, with at most a tiny strip of trousers at the bottom.", " Scale the people as necessary to fit all ").concat(number, " within one vertical 3:4 frame, without slicing faces or hands. Each copy must have one anatomically complete torso, two connected arms and natural fingers; avoid fused limbs, extra hands and duplicate faces. Show their different actions clearly. For the hero layout, copy 1 stays most prominent while the others remain distinctly visible. Leave natural breathing room between copies.\n\nPER-COPY INSTRUCTIONS \u2014 do not swap outfits or poses between copies:\n").concat(directions, "\n\nKeep the torso pose, head direction, gaze and hand action for each copy distinct and internally consistent. A camera orbit must change the view of the posed people, not merely rotate their heads. In head/gaze instructions, RIGHT and LEFT mean that person's anatomical sides; VIEWER and FRAME refer to the final image.\n\n").concat(sky && sky.background || room || "BACKGROUND: ".concat(backdrop, " Use one continuous clean studio backdrop with the selected solid or smooth gradient; no walls, scenery, props, dividing lines, typography or watermark. Do not replace a colored background with white unless white was selected."), "\n\n").concat(sky ? sky.lighting : "LIGHTING: Light all copies coherently with a professional neutral-to-cool white studio side light from the VIEWER'S LEFT, slightly behind and above them, with soft white frontal fill to keep every face visible. Reflect the selected background colors subtly on nearby garment edges and shoulders while preserving natural skin tones. Keep fine face, hair and fabric detail and believable depth. No dark or hidden faces.").concat(sky ? "\n\n" + sky.output : "", "\n\nOUTPUT: Exactly ").concat(number, " distinct figures of the same person, copy 1 in the exact reference outfit, all later copies in different coordinated garments, with visibly different poses. One sharp photograph; no additional people, text, collage borders, fisheye distortion or duplicated limbs.");
}
if (typeof module !== "undefined") module.exports = {
  OUTFIT_VARIATIONS: OUTFIT_VARIATIONS,
  MULTI_LAYOUTS: MULTI_LAYOUTS,
  buildMultiPersonPrompt: buildMultiPersonPrompt
};

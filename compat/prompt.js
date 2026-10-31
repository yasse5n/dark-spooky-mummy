function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// Each visible control owns one independent part of the final portrait prompt.
function buildPersonPrompt(_ref) {
  var cameraPerspective = _ref.cameraPerspective,
    bodyAngle = _ref.bodyAngle,
    faceGaze = _ref.faceGaze,
    expression = _ref.expression,
    handAction = _ref.handAction,
    background = _ref.background,
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
  var distanceApi = typeof module !== "undefined" ? require("./distance.js") : {
    buildCameraDistance: buildCameraDistance,
    perspectiveForDistance: perspectiveForDistance,
    skyForDistance: skyForDistance,
    roomForDistance: roomForDistance
  };
  var distance = distanceApi.buildCameraDistance(cameraDistance, 1);
  var sky = distanceApi.skyForDistance(backgroundType === "sky" ? (typeof module !== "undefined" ? require("./background.js").buildSkyBackground : buildSkyBackground)(skyTone, 1) : null, distance);
  var room = distanceApi.roomForDistance(backgroundType === "room" ? (typeof module !== "undefined" ? require("./background.js").buildRoomBackground : buildRoomBackground)(roomColor, 1, roomIdea) : "", distance);
  var fields = [cameraPerspective, bodyAngle, faceGaze, expression, handAction, sky ? "cinematic blue sky" : room ? roomColor : background].map(function (value) {
    return String(value || "").trim();
  });
  if (fields.some(function (value) {
    return !value;
  })) {
    throw new Error("حدد منظور الكاميرا وزاوية الجسم واتجاه الوجه والتعبير وحركة اليد والخلفية أولًا.");
  }
  var _fields = _slicedToArray(fields, 6),
    rawCamera = _fields[0],
    angle = _fields[1],
    gaze = _fields[2],
    mood = _fields[3],
    hand = _fields[4],
    backdrop = _fields[5];
  var camera = distanceApi.perspectiveForDistance(rawCamera, distance);
  return "Create ONE photorealistic ".concat(sky ? "cinematic city poster portrait" : room ? "portrait in a modern room" : "studio portrait", " using exactly TWO reference images supplied in order. Build a NEW PHOTOGRAPH from the specified camera viewpoint. The viewpoint is a priority, not an optional style suggestion.").concat(distance ? "\n\n" + distance.instruction : "").concat(sky ? "\n\n" + sky.priority : "", "\n\nMANDATORY CAMERA VIEWPOINT: ").concat(camera, " The final portrait must visibly exhibit the selected viewpoint's camera position, projection and depth cues. Do not fall back to a generic front-facing eye-level studio shot unless that exact viewpoint was selected.\n\nREFERENCE IMAGE 1 \u2014 PERSON / IDENTITY: This is the sole source for the real person's identity, NOT a template for the final camera position, pose, crop, lighting or background. Reconstruct the same person from the newly specified camera viewpoint even if reference image 1 was photographed straight-on. Preserve their instantly recognizable facial structure: eyes, eyebrows, nose, lips, jaw, chin, ears, hairline, hair and facial hair; preserve age, natural asymmetry, authentic skin texture and skin tone. Keep any identifying facial features and eyeglasses from image 1. Do not beautify, reshape, replace, or blend the person's face with anyone from image 2. The requested expression and gaze may change naturally without changing who this person is.\n\nREFERENCE IMAGE 2 \u2014 CLOTHING ONLY: Recreate the actual garment shown, including its cut, colors, fabric, seams, collar, sleeves, print and visible details. Fit it naturally on the person in image 1. Never transfer a face, body identity, background or lighting from this clothing reference.\n\nBODY ANGLE \u2014 TORSO AND SHOULDERS ONLY: ").concat(angle, "\nHEAD AND EYE DIRECTION: ").concat(gaze, "\nFACIAL EXPRESSION: ").concat(mood, "\nHAND POSITION / ACTION: ").concat(hand, "\n\nCAMERA AND POSE COORDINATION: Keep these five controls independent. CAMERA PERSPECTIVE determines the physical camera placement and projection; it does not replace the person's selected body pose, head direction, facial expression or hand action. For a camera orbit, move the CAMERA around the posed subject; do not rotate the subject to face the relocated camera and erase the off-axis view. If a frontal body preset competes with a lateral camera orbit, retain the camera's visibly oblique projection while approximating the torso gesture. The BODY ANGLE does not dictate the head or eye direction. The HEAD AND EYE DIRECTION controls where the person looks; do not force eye contact unless specifically requested there. FACIAL EXPRESSION controls emotion, not gaze direction. In head/gaze instructions, RIGHT and LEFT refer to the SUBJECT'S OWN anatomical right and left; references to the viewer or frame refer to the image as seen by the viewer. Keep head turns moderate enough that the person's defining facial features remain recognizable, with a believable neck and shoulder connection. Respect natural anatomy, continuous arms, wrists and fingers. Do not add extra hands or fingers or cover the face unnecessarily.\n\nCOMPOSITION: Vertical 3:4 portrait. The entire head remains in frame. ").concat(distance ? distance.framing : sky ? sky.framing : "Frame closely from the top of the head down to just below the waist; show only a very small strip of upper trousers at the bottom edge.", " No thighs, large trouser area or wide full-body framing. Achieve this crop by framing the NEW camera angle, never by flattening it to the source image's eye-level viewpoint. Preserve the specified viewpoint's visible depth and angle cues while keeping the facial identity and anatomy realistic, with no fisheye distortion or oversized nose, head or hands.\n\n").concat(sky && sky.background || room || "BACKGROUND \u2014 FOLLOW THE SELECTED COLOR AND TYPE: ".concat(backdrop, "\nKeep it as a clean seamless studio background, with the selected solid color or smoothly blended gradient. Avoid scenery, props, typography, harsh gradient bands and distracting shadows. Do not replace the selected background with white unless white is selected."), "\n\n").concat(sky ? sky.lighting : "LIGHTING: Use a professional neutral-to-cool WHITE studio side light from the VIEWER'S LEFT, slightly behind and above the person's face, around 100\u2013120 degrees from the camera axis. It gently defines the lit contours of the head, jaw, shoulder and garment. Add soft frontal white fill so the face remains detailed, properly exposed and recognizable even when the gaze turns to the side. In addition, adapt a subtle secondary environmental bounce to the SELECTED BACKGROUND COLORS: let those hues reflect naturally on the nearby outer shoulder, clothing edges and fabric folds. This colored reflection must be restrained and should support the selected ".concat(room ? "wall color" : "gradient or solid color", ", never overpower the white key light or recolor the person's face. For pure white, keep this bounce neutral. Maintain realistic skin tone, detailed fabric, controlled highlights and no dark facial shadows.")).concat(sky ? "\n\n" + sky.output : "", "\n\nOUTPUT: One coherent, sharp, high-detail photograph. The face in reference 1 has absolute identity priority; reference 2 controls clothing only. Preserve fine hair, eyebrow, eye, skin and facial-hair details. Do not add a watermark, text, collage, second person, or duplicate limbs.");
}
if (typeof module !== "undefined") module.exports = {
  buildPersonPrompt: buildPersonPrompt
};

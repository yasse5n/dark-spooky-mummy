// Each visible control owns one independent part of the final portrait prompt.
function buildPersonPrompt({ cameraPerspective, bodyAngle, faceGaze, expression, handAction, background, backgroundType = "studio", roomColor = "", roomIdea = "", skyTone = "auto", cameraDistance = "normal" }) {
  const distanceApi = typeof module !== "undefined" ? require("./distance.js") : { buildCameraDistance, perspectiveForDistance, skyForDistance, roomForDistance };
  const distance = distanceApi.buildCameraDistance(cameraDistance, 1);
  const sky = distanceApi.skyForDistance(backgroundType === "sky"
    ? (typeof module !== "undefined" ? require("./background.js").buildSkyBackground : buildSkyBackground)(skyTone, 1)
    : null, distance);
  const room = distanceApi.roomForDistance(backgroundType === "room"
    ? (typeof module !== "undefined" ? require("./background.js").buildRoomBackground : buildRoomBackground)(roomColor, 1, roomIdea)
    : "", distance);
  const fields = [cameraPerspective, bodyAngle, faceGaze, expression, handAction, sky ? "cinematic blue sky" : room ? roomColor : background].map(value => String(value || "").trim());
  if (fields.some(value => !value)) {
    throw new Error("حدد منظور الكاميرا وزاوية الجسم واتجاه الوجه والتعبير وحركة اليد والخلفية أولًا.");
  }
  const [rawCamera, angle, gaze, mood, hand, backdrop] = fields;
  const camera = distanceApi.perspectiveForDistance(rawCamera, distance);
  return `Create ONE photorealistic ${sky ? "cinematic city poster portrait" : room ? "portrait in a modern room" : "studio portrait"} using exactly TWO reference images supplied in order. Build a NEW PHOTOGRAPH from the specified camera viewpoint. The viewpoint is a priority, not an optional style suggestion.${distance ? "\n\n" + distance.instruction : ""}${sky ? "\n\n" + sky.priority : ""}

MANDATORY CAMERA VIEWPOINT: ${camera} The final portrait must visibly exhibit the selected viewpoint's camera position, projection and depth cues. Do not fall back to a generic front-facing eye-level studio shot unless that exact viewpoint was selected.

REFERENCE IMAGE 1 — PERSON / IDENTITY: This is the sole source for the real person's identity, NOT a template for the final camera position, pose, crop, lighting or background. Reconstruct the same person from the newly specified camera viewpoint even if reference image 1 was photographed straight-on. Preserve their instantly recognizable facial structure: eyes, eyebrows, nose, lips, jaw, chin, ears, hairline, hair and facial hair; preserve age, natural asymmetry, authentic skin texture and skin tone. Keep any identifying facial features and eyeglasses from image 1. Do not beautify, reshape, replace, or blend the person's face with anyone from image 2. The requested expression and gaze may change naturally without changing who this person is.

REFERENCE IMAGE 2 — CLOTHING ONLY: Recreate the actual garment shown, including its cut, colors, fabric, seams, collar, sleeves, print and visible details. Fit it naturally on the person in image 1. Never transfer a face, body identity, background or lighting from this clothing reference.

BODY ANGLE — TORSO AND SHOULDERS ONLY: ${angle}
HEAD AND EYE DIRECTION: ${gaze}
FACIAL EXPRESSION: ${mood}
HAND POSITION / ACTION: ${hand}

CAMERA AND POSE COORDINATION: Keep these five controls independent. CAMERA PERSPECTIVE determines the physical camera placement and projection; it does not replace the person's selected body pose, head direction, facial expression or hand action. For a camera orbit, move the CAMERA around the posed subject; do not rotate the subject to face the relocated camera and erase the off-axis view. If a frontal body preset competes with a lateral camera orbit, retain the camera's visibly oblique projection while approximating the torso gesture. The BODY ANGLE does not dictate the head or eye direction. The HEAD AND EYE DIRECTION controls where the person looks; do not force eye contact unless specifically requested there. FACIAL EXPRESSION controls emotion, not gaze direction. In head/gaze instructions, RIGHT and LEFT refer to the SUBJECT'S OWN anatomical right and left; references to the viewer or frame refer to the image as seen by the viewer. Keep head turns moderate enough that the person's defining facial features remain recognizable, with a believable neck and shoulder connection. Respect natural anatomy, continuous arms, wrists and fingers. Do not add extra hands or fingers or cover the face unnecessarily.

COMPOSITION: Vertical 3:4 portrait. The entire head remains in frame. ${distance ? distance.framing : sky ? sky.framing : "Frame closely from the top of the head down to just below the waist; show only a very small strip of upper trousers at the bottom edge."} No thighs, large trouser area or wide full-body framing. Achieve this crop by framing the NEW camera angle, never by flattening it to the source image's eye-level viewpoint. Preserve the specified viewpoint's visible depth and angle cues while keeping the facial identity and anatomy realistic, with no fisheye distortion or oversized nose, head or hands.

${(sky && sky.background) || room || `BACKGROUND — FOLLOW THE SELECTED COLOR AND TYPE: ${backdrop}
Keep it as a clean seamless studio background, with the selected solid color or smoothly blended gradient. Avoid scenery, props, typography, harsh gradient bands and distracting shadows. Do not replace the selected background with white unless white is selected.`}

${sky ? sky.lighting : `LIGHTING: Use a professional neutral-to-cool WHITE studio side light from the VIEWER'S LEFT, slightly behind and above the person's face, around 100–120 degrees from the camera axis. It gently defines the lit contours of the head, jaw, shoulder and garment. Add soft frontal white fill so the face remains detailed, properly exposed and recognizable even when the gaze turns to the side. In addition, adapt a subtle secondary environmental bounce to the SELECTED BACKGROUND COLORS: let those hues reflect naturally on the nearby outer shoulder, clothing edges and fabric folds. This colored reflection must be restrained and should support the selected ${room ? "wall color" : "gradient or solid color"}, never overpower the white key light or recolor the person's face. For pure white, keep this bounce neutral. Maintain realistic skin tone, detailed fabric, controlled highlights and no dark facial shadows.`}${sky ? "\n\n" + sky.output : ""}

OUTPUT: One coherent, sharp, high-detail photograph. The face in reference 1 has absolute identity priority; reference 2 controls clothing only. Preserve fine hair, eyebrow, eye, skin and facial-hair details. Do not add a watermark, text, collage, second person, or duplicate limbs.`;
}
if (typeof module !== "undefined") module.exports = { buildPersonPrompt };

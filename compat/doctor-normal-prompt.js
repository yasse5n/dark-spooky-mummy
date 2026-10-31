// Normal doctor mode shares the single-person presets and background builders.
// Adapt only recognized doctor presets; free-text descriptions remain authoritative.
function resolveDoctorNormalView(perspective, angle, gaze, hand) {
  var presets = typeof module !== 'undefined' ? require('./presets.js') : {
    CAMERA_PERSPECTIVES: CAMERA_PERSPECTIVES,
    BODY_ANGLES: BODY_ANGLES,
    FACE_GAZES: FACE_GAZES,
    HAND_POSES: HAND_POSES
  };
  var index = function index(list, text) {
    return list.findIndex(function (item) {
      return item[1] === text;
    });
  };
  var view = index(presets.CAMERA_PERSPECTIVES, perspective);
  var body = index(presets.BODY_ANGLES, angle);
  var head = index(presets.FACE_GAZES, gaze);
  var gesture = index(presets.HAND_POSES, hand);
  var camera = perspective,
    coordination = '';
  if (view === 1) camera = "VISIBLE LOW-ANGLE SHOT: Photograph from BELOW the subject's eye line, with the lens at mid-chest height and an upward optical axis about 15–20 degrees. The final image must visibly show the underside of the jaw and a mildly upward view of the chest and shoulders; the nearer upper torso has slightly greater presence than the head. Keep the person standing naturally upright. Establish this with the actual camera position, without using a raised chin as a substitute. Follow the selected distance crop and keep the whole head visible.";
  if (view === 2) camera = "STRONG LOW-ANGLE SHOT: Photograph from a distinctly LOW camera near the standing subject's waist / upper abdomen, aiming upward about 30–35 degrees. This must be visibly stronger than the slight low-angle option: clear underside of the jaw and chin, upward convergence of the torso, and a nearer chest/shoulder area receding toward the head. Keep the full head in the selected-distance crop. The camera moves; the person stays naturally upright, with no backward lean or exaggerated chin lift. Preserve recognizable facial anatomy and natural lens perspective, without fisheye distortion.";
  if (view === 4) camera = "STRONG ELEVATED SHOT: Photograph from a camera clearly ABOVE the crown of the standing subject's head, aiming DOWNWARD about 35–40 degrees. Make the elevated viewpoint visibly stronger than the slight high-angle option: a substantial view of the top of the hair, top surfaces of both shoulders and collar, with the chest and torso receding downward away from the lens. Keep the person upright, the face readable and the whole head inside the selected-distance crop. Do not substitute a lowered chin or a forward body lean for camera elevation. This remains an oblique portrait, not a vertical overhead flat-lay.";
  var orbit = view === 5 || view === 6 || view === 8;
  if (orbit) {
    var side = view === 5 ? 'RIGHT' : 'LEFT',
      opposite = side === 'RIGHT' ? 'LEFT' : 'RIGHT';
    var anatomy = side === 'RIGHT' ? 'LEFT' : 'RIGHT';
    camera = "".concat(view === 8 ? 'LOW OFF-AXIS CAMERA' : "CAMERA ORBIT TO VIEWER'S " + side, ": Start with an imaginary front camera facing the neutral subject. Move the camera physically toward the VIEWER'S ").concat(side, " of that original front view, about ").concat(view === 8 ? '30' : '35–40', " degrees around the subject. ").concat(view === 8 ? "Set the lens at mid-to-lower chest height and aim upward about 20–25 degrees; show both a low viewpoint and side depth together." : "Keep the lens at approximately eye height.", " Keep the subject's selected torso orientation fixed in the scene during this orbit. Do not mirror the finished image or reverse anatomical sides.");
    if (body === 0) camera += " With this selected neutral torso, the shoulder on the VIEWER'S ".concat(side, " of the final image (the person's anatomical ").concat(anatomy, " shoulder) is NEARER and more prominent; the shoulder on the VIEWER'S ").concat(opposite, " is farther and narrower. Show that asymmetric chest/shoulder projection clearly. The nose can face the lens according to the separate gaze setting while the torso keeps its oblique projection.");else camera += ' Combine the camera orbit with the selected body rotation, then render the resulting near/far shoulder projection. Do not force the shoulders into a symmetric frontal photograph.';
    if (body >= 0) {
      if (body === 0) angle = 'Keep the torso facing its original neutral FRONT direction in the scene, shoulders naturally level and posture upright. Keep this orientation fixed while the camera orbits; do not turn the chest to face the relocated lens.';else if (body === 7 || body === 8) angle += ' Apply this explicit shoulder pose at the original front-camera position, then hold it fixed while the camera moves. Judge final shoulder depth from the combined pose and orbit.';else angle = angle.replace(/the viewer's right/g, 'the RIGHT of the original front view').replace(/the viewer's left/g, 'the LEFT of the original front view').replace(/the camera/g, 'the original front-camera position') + ' Establish this body pose in the original front view, then keep it fixed during the camera orbit.';
    }
    coordination = 'ORBIT COORDINATES: body-pose directions use the original front view; camera right/left use that same starting view. Head turns remain anatomical. The relocated lens determines the final projection. A face directed toward the lens does not authorize rotating the torso toward it.';
  } else if (view >= 0 && body === 0) {
    angle = 'Keep a neutral upright torso without yaw rotation or forward/backward lean. Shoulders are naturally level in the scene. Let the selected camera height and tilt determine their visible projection; do not cancel the camera angle by changing the body pose.';
  }
  if (view >= 0 && head === 0) gaze = 'Direct the face and eyes naturally toward the ACTUAL selected lens position, allowing only a comfortable natural head adjustment. Keep the selected torso fixed. Eye contact does not move the camera back to eye level or erase the visible low/high/side viewpoint.';
  if (gesture === 6 || gesture === 7) {
    var _side = gesture === 6 ? 'right' : 'left',
      other = _side === 'right' ? 'left' : 'right';
    hand = "Rest the person's anatomical ".concat(_side, " hand lightly FLAT against the upper chest, palm in contact with the fabric, fingers gently extended and relaxed; the ").concat(other, " arm rests naturally. This is an open-hand chest gesture: do not grip, pinch or pull the lapel, collar or jacket edge. Keep the wrist and each finger anatomically connected. Adapt hand height to the selected crop without zooming out.");
  }
  return {
    camera: camera,
    angle: angle,
    gaze: gaze,
    hand: hand,
    coordination: coordination
  };
}
function buildDoctorClinicBackground(color, count, idea, specialty) {
  if (!String(color || '').trim()) throw new Error('اكتب لون العيادة أولًا.');
  var contexts = typeof module !== 'undefined' ? require('./doctor-prompt.js').DOCTOR_SUBJECTS : DOCTOR_SUBJECTS;
  var selected = contexts.find(function (x) {
    return x[0] === specialty;
  });
  return 'BACKGROUND — PROFESSIONAL CLINIC: Paint the main wall in exactly the selected color: ' + color + '. Build one coherent, uncluttered clinic with believable clinical furnishings and clean surfaces. ' + (idea ? 'USER CLINIC BRIEF — highest background priority: ' + idea + '. Follow its specified equipment, colors and exclusions instead of adding stock furnishings.' : (selected ? selected[2] : 'General clinic consultation space.') + ' Choose one or two relevant background cues; not every listed object.') + ' Keep equipment behind the people at credible scale, softly subordinate and away from faces and active hands. Preserve camera viewpoint, exact person count, selected crop, identity, clothing, pose and gesture. Do not add patients, staff, generic living-room decor or unrelated equipment automatically. Use coherent clinical lighting with neutral facial fill and restrained wall-color reflections. No unrequested signs, labels, logos or text. These are visual branding cues; do not invent treatment results or patient claims.';
}
function buildDoctorNormalDirections() {
  var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var distanceApi = typeof module !== 'undefined' ? require('./distance.js') : {
    buildCameraDistance: buildCameraDistance,
    perspectiveForDistance: perspectiveForDistance,
    skyForDistance: skyForDistance,
    roomForDistance: roomForDistance
  };
  var backgroundApi = typeof module !== 'undefined' ? require('./background.js') : {
    buildRoomBackground: buildRoomBackground,
    buildSkyBackground: buildSkyBackground
  };
  var value = function value(key) {
    return String(settings[key] || '').trim();
  };
  var selected = function selected(key) {
    return value(key) || value(key + 'Preset');
  };
  var perspective = selected('perspective'),
    angle = selected('angle'),
    gaze = selected('gaze'),
    expression = selected('expression'),
    hand = selected('hand');
  if (!perspective || !angle || !gaze || !expression || !hand) throw new Error('حدد منظور الكاميرا وزاوية الجسم والنظرة والتعبير وحركة اليد، أو اكتب وصفك في الخانات.');
  var people = Number(count) + 1,
    key = value('cameraDistance') || 'normal';
  var distance = distanceApi.buildCameraDistance(key, people);
  var crop = 'Keep every complete head in frame and preserve facial identity and natural proportions. No visible trousers, hips, thighs, legs or feet. Adapt active hands and key prop parts to this crop rather than zooming out.';
  var framing = distance ? distance.framing.replace('with a small amount of upper trousers at most', 'with the bottom frame edge stopping just above the trouser waistband') : count ? 'Use the approved close standing group crop, complete heads down to the abdomen at most, above all waistbands.' : 'NORMAL CAMERA DISTANCE: a natural close waist-up portrait, complete head and torso down to the waist, cut just above the trouser waistband. Keep the doctor large and readable with modest headroom.';
  framing += ' ' + crop;
  if (count) framing += ' Apply the selected distance to the whole group, keeping every supporting face large, independent and recognizable. Keep the doctor largest; supporting faces about 70–85% of the doctor face size, with small breathing gaps between heads. No distant tiny supporting people.';
  var view = resolveDoctorNormalView(perspective, angle, gaze, hand);
  var camera = distanceApi.perspectiveForDistance(view.camera, distance).replace('just below the waist', 'the selected crop above the trouser waistband');
  var type = value('backgroundType') || 'studio';
  var background = '';
  if (type === 'studio') {
    var b = selected('background');
    if (!b) throw new Error('اختار لون الخلفية أو اكتب وصفه.');
    background = 'BACKGROUND — SELECTED SOLID / GRADIENT: ' + b + '\nUse a clean seamless studio background; no automatic scenery or decor. Do not replace the selected color with white unless white was selected.';
  } else if (type === 'room') {
    background = distanceApi.roomForDistance(buildDoctorClinicBackground(value('roomColor'), people, value('roomIdea'), value('specialty')), distance);
  } else if (type === 'sky') {
    var sky = distanceApi.skyForDistance(backgroundApi.buildSkyBackground(value('skyTone') || 'auto', people), distance);
    background = sky.priority + '\n' + sky.background + '\n' + sky.lighting;
    background = background.replace(/reference image 2/g, "the doctor's selected clothing source").replace(/all copies of the person/g, 'all principal people').replace(/each copy/g, 'each principal person').replace(/copy 1/g, 'the main doctor');
  } else if (type === 'custom') {
    var _b = value('backgroundIdea');
    if (!_b) throw new Error('اكتب وصف فكرة الخلفية.');
    background = 'BACKGROUND IDEA — USER DESCRIPTION:\n' + _b + '\nInterpret this as the background only: place the requested setting, colors, landmarks and decor behind the doctor at believable scale and distance. Keep the background subordinate, with coherent perspective, atmosphere and lighting. Do not transfer background descriptions into the doctor’s face, clothing, pose, gaze or hand gesture. Do not automatically add room furniture, buildings, sunset, particles or extra people unless explicitly requested.';
  } else throw new Error('اختار نوع الخلفية.');
  background = background.replace(/all copies of the person/g, 'all principal people').replace(/all copies/gi, 'all principal people').replace(/each copy/gi, 'each principal person').replace(/every copy/gi, 'every principal person').replace(/copy 1/g, 'the main doctor').replace(/main central copy/g, 'main doctor');
  var viewpoint = "MANDATORY CAMERA VIEWPOINT \u2014 ESTABLISH BEFORE COMPOSING THE PORTRAIT:\n".concat(camera, "\nReconstruct this photographic viewpoint from the identity reference; its original camera angle does not lock the new camera. Preserve the person's identifying facial anatomy, age, asymmetries, skin tone and accessories while allowing the normal perspective projection of the selected viewpoint. Do not reshape the face or enlarge the head to fake perspective. Preserve the selected camera distance, complete head and torso crop.");
  return {
    key: key,
    framing: framing,
    expression: expression,
    viewpoint: viewpoint,
    directions: "NORMAL MODE \u2014 SELECTED PERSON CONTROLS:\nBODY ANGLE \u2014 TORSO AND SHOULDERS ONLY: ".concat(view.angle, "\nHEAD AND EYE DIRECTION: ").concat(view.gaze, "\nFACIAL EXPRESSION: ").concat(expression, "\nHAND POSITION / ACTION: ").concat(view.hand, "\n").concat(view.coordination, "\nKeep camera placement, subject distance, torso pose, gaze, expression and hand action independent. Camera orbit changes the viewpoint; do not turn the body to erase its oblique projection. Head/gaze right and left refer to the person's own anatomical sides; viewer/frame directions refer to the image. The camera viewpoint governs the entire scene. Body, gaze, expression and hand controls govern the main doctor only; supporting characters retain their own locations and notes. Apply natural expression movement without changing facial structure. Preserve exact identity, age, skin tone, facial details and eyewear only from that person's own identity reference or an explicit request. No beautification or identity transfer.\n").concat(background, "\nSELECTED-CONTROL PRIORITY: the selected background and person controls override incidental scene, pose or background wording in the additional idea. The background description controls the environment only. Keep the selected aspect ratio, reference mapping and wardrobe source. No lower fade outside sky mode unless explicitly requested in the custom background. Maintain sharp faces and active hands, soft neutral facial fill, restrained background-color bounce on clothing and believable depth.")
  };
}
if (typeof module !== 'undefined') module.exports = {
  buildDoctorNormalDirections: buildDoctorNormalDirections,
  buildDoctorClinicBackground: buildDoctorClinicBackground
};

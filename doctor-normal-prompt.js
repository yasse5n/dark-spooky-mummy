// Normal doctor mode shares the single-person presets and background builders.
// Adapt only recognized doctor presets; free-text descriptions remain authoritative.
function resolveDoctorNormalView(perspective, angle, gaze, hand) {
  const presets=typeof module!=='undefined'?require('./presets.js'):{CAMERA_PERSPECTIVES,BODY_ANGLES,FACE_GAZES,HAND_POSES};
  const index=(list,text)=>list.findIndex(item=>item[1]===text);
  const view=index(presets.CAMERA_PERSPECTIVES,perspective);
  const body=index(presets.BODY_ANGLES,angle);
  const head=index(presets.FACE_GAZES,gaze);
  const gesture=index(presets.HAND_POSES,hand);
  let camera=perspective,coordination='';
  if(view===1)camera="VISIBLE LOW-ANGLE SHOT: Photograph from BELOW the subject's eye line, with the lens at mid-chest height and an upward optical axis about 15–20 degrees. The final image must visibly show the underside of the jaw and a mildly upward view of the chest and shoulders; the nearer upper torso has slightly greater presence than the head. Keep the person standing naturally upright. Establish this with the actual camera position, without using a raised chin as a substitute. Follow the selected distance crop and keep the whole head visible.";
  if(view===2)camera="STRONG LOW-ANGLE SHOT: Photograph from a distinctly LOW camera near the standing subject's waist / upper abdomen, aiming upward about 30–35 degrees. This must be visibly stronger than the slight low-angle option: clear underside of the jaw and chin, upward convergence of the torso, and a nearer chest/shoulder area receding toward the head. Keep the full head in the selected-distance crop. The camera moves; the person stays naturally upright, with no backward lean or exaggerated chin lift. Preserve recognizable facial anatomy and natural lens perspective, without fisheye distortion.";
  if(view===4)camera="STRONG ELEVATED SHOT: Photograph from a camera clearly ABOVE the crown of the standing subject's head, aiming DOWNWARD about 35–40 degrees. Make the elevated viewpoint visibly stronger than the slight high-angle option: a substantial view of the top of the hair, top surfaces of both shoulders and collar, with the chest and torso receding downward away from the lens. Keep the person upright, the face readable and the whole head inside the selected-distance crop. Do not substitute a lowered chin or a forward body lean for camera elevation. This remains an oblique portrait, not a vertical overhead flat-lay.";
  const orbit=view===5||view===6||view===8;
  if(orbit){
    const side=view===5?'RIGHT':'LEFT',opposite=side==='RIGHT'?'LEFT':'RIGHT';
    const anatomy=side==='RIGHT'?'LEFT':'RIGHT';
    camera=`${view===8?'LOW OFF-AXIS CAMERA':"CAMERA ORBIT TO VIEWER'S "+side}: Start with an imaginary front camera facing the neutral subject. Move the camera physically toward the VIEWER'S ${side} of that original front view, about ${view===8?'30':'35–40'} degrees around the subject. ${view===8?"Set the lens at mid-to-lower chest height and aim upward about 20–25 degrees; show both a low viewpoint and side depth together.":"Keep the lens at approximately eye height."} Keep the subject's selected torso orientation fixed in the scene during this orbit. Do not mirror the finished image or reverse anatomical sides.`;
    if(body===0)camera+=` With this selected neutral torso, the shoulder on the VIEWER'S ${side} of the final image (the person's anatomical ${anatomy} shoulder) is NEARER and more prominent; the shoulder on the VIEWER'S ${opposite} is farther and narrower. Show that asymmetric chest/shoulder projection clearly. The nose can face the lens according to the separate gaze setting while the torso keeps its oblique projection.`;
    else camera+=' Combine the camera orbit with the selected body rotation, then render the resulting near/far shoulder projection. Do not force the shoulders into a symmetric frontal photograph.';
    if(body>=0){
      if(body===0)angle='Keep the torso facing its original neutral FRONT direction in the scene, shoulders naturally level and posture upright. Keep this orientation fixed while the camera orbits; do not turn the chest to face the relocated lens.';
      else if(body===7||body===8)angle+=' Apply this explicit shoulder pose at the original front-camera position, then hold it fixed while the camera moves. Judge final shoulder depth from the combined pose and orbit.';
      else angle=angle.replace(/the viewer's right/g,'the RIGHT of the original front view').replace(/the viewer's left/g,'the LEFT of the original front view').replace(/the camera/g,'the original front-camera position')+' Establish this body pose in the original front view, then keep it fixed during the camera orbit.';
    }
    coordination='ORBIT COORDINATES: body-pose directions use the original front view; camera right/left use that same starting view. Head turns remain anatomical. The relocated lens determines the final projection. A face directed toward the lens does not authorize rotating the torso toward it.';
  }else if(view>=0&&body===0){
    angle='Keep a neutral upright torso without yaw rotation or forward/backward lean. Shoulders are naturally level in the scene. Let the selected camera height and tilt determine their visible projection; do not cancel the camera angle by changing the body pose.';
  }
  if(view>=0&&head===0)gaze='Direct the face and eyes naturally toward the ACTUAL selected lens position, allowing only a comfortable natural head adjustment. Keep the selected torso fixed. Eye contact does not move the camera back to eye level or erase the visible low/high/side viewpoint.';
  if(gesture===6||gesture===7){
    const side=gesture===6?'right':'left',other=side==='right'?'left':'right';
    hand=`Rest the person's anatomical ${side} hand lightly FLAT against the upper chest, palm in contact with the fabric, fingers gently extended and relaxed; the ${other} arm rests naturally. This is an open-hand chest gesture: do not grip, pinch or pull the lapel, collar or jacket edge. Keep the wrist and each finger anatomically connected. Adapt hand height to the selected crop without zooming out.`;
  }
  return {camera,angle,gaze,hand,coordination};
}

function buildDoctorClinicBackground(color,count,idea,specialty) {
  if(!String(color||'').trim())throw new Error('اكتب لون العيادة أولًا.');
  const contexts=typeof module!=='undefined'?require('./doctor-prompt.js').DOCTOR_SUBJECTS:DOCTOR_SUBJECTS;
  const selected=contexts.find(x=>x[0]===specialty);
  return 'BACKGROUND — PROFESSIONAL CLINIC: Paint the main wall in exactly the selected color: '+color+'. Build one coherent, uncluttered clinic with believable clinical furnishings and clean surfaces. '+
    (idea?'USER CLINIC BRIEF — highest background priority: '+idea+'. Follow its specified equipment, colors and exclusions instead of adding stock furnishings.':(selected?selected[2]:'General clinic consultation space.')+' Choose one or two relevant background cues; not every listed object.')+
    ' Keep equipment behind the people at credible scale, softly subordinate and away from faces and active hands. Preserve camera viewpoint, exact person count, selected crop, identity, clothing, pose and gesture. Do not add patients, staff, generic living-room decor or unrelated equipment automatically. Use coherent clinical lighting with neutral facial fill and restrained wall-color reflections. No unrequested signs, labels, logos or text. These are visual branding cues; do not invent treatment results or patient claims.';
}

function buildDoctorNormalDirections(settings={},count=0) {
  const distanceApi=typeof module!=='undefined'?require('./distance.js'):{buildCameraDistance,perspectiveForDistance,skyForDistance,roomForDistance};
  const backgroundApi=typeof module!=='undefined'?require('./background.js'):{buildRoomBackground,buildSkyBackground};
  const value=key=>String(settings[key]||'').trim();
  const selected=key=>value(key)||value(key+'Preset');
  const perspective=selected('perspective'),angle=selected('angle'),gaze=selected('gaze'),expression=selected('expression'),hand=selected('hand');
  if(!perspective||!angle||!gaze||!expression||!hand)throw new Error('حدد منظور الكاميرا وزاوية الجسم والنظرة والتعبير وحركة اليد، أو اكتب وصفك في الخانات.');
  const people=Number(count)+1,key=value('cameraDistance')||'normal';
  const distance=distanceApi.buildCameraDistance(key,people);
  const crop='Keep every complete head in frame and preserve facial identity and natural proportions. No visible trousers, hips, thighs, legs or feet. Adapt active hands and key prop parts to this crop rather than zooming out.';
  let framing=distance?distance.framing.replace('with a small amount of upper trousers at most','with the bottom frame edge stopping just above the trouser waistband'):count
    ? 'Use the approved close standing group crop, complete heads down to the abdomen at most, above all waistbands.'
    : 'NORMAL CAMERA DISTANCE: a natural close waist-up portrait, complete head and torso down to the waist, cut just above the trouser waistband. Keep the doctor large and readable with modest headroom.';
  framing+=' '+crop;
  if(count)framing+=' Apply the selected distance to the whole group, keeping every supporting face large, independent and recognizable. Keep the doctor largest; supporting faces about 70–85% of the doctor face size, with small breathing gaps between heads. No distant tiny supporting people.';
  const view=resolveDoctorNormalView(perspective,angle,gaze,hand);
  const camera=distanceApi.perspectiveForDistance(view.camera,distance).replace('just below the waist','the selected crop above the trouser waistband');
  const type=value('backgroundType')||'studio';let background='';
  if(type==='studio'){
    const b=selected('background');if(!b)throw new Error('اختار لون الخلفية أو اكتب وصفه.');
    background='BACKGROUND — SELECTED SOLID / GRADIENT: '+b+'\nUse a clean seamless studio background; no automatic scenery or decor. Do not replace the selected color with white unless white was selected.';
  }else if(type==='room'){
    background=distanceApi.roomForDistance(buildDoctorClinicBackground(value('roomColor'),people,value('roomIdea'),value('specialty')),distance);
  }else if(type==='sky'){
    const sky=distanceApi.skyForDistance(backgroundApi.buildSkyBackground(value('skyTone')||'auto',people),distance);
    background=sky.priority+'\n'+sky.background+'\n'+sky.lighting;
    background=background.replace(/reference image 2/g,"the doctor's selected clothing source").replace(/all copies of the person/g,'all principal people').replace(/each copy/g,'each principal person').replace(/copy 1/g,'the main doctor');
  }else if(type==='custom'){
    const b=value('backgroundIdea');if(!b)throw new Error('اكتب وصف فكرة الخلفية.');
    background='BACKGROUND IDEA — USER DESCRIPTION:\n'+b+'\nInterpret this as the background only: place the requested setting, colors, landmarks and decor behind the doctor at believable scale and distance. Keep the background subordinate, with coherent perspective, atmosphere and lighting. Do not transfer background descriptions into the doctor’s face, clothing, pose, gaze or hand gesture. Do not automatically add room furniture, buildings, sunset, particles or extra people unless explicitly requested.';
  }else throw new Error('اختار نوع الخلفية.');
  background=background.replace(/all copies of the person/g,'all principal people').replace(/all copies/gi,'all principal people').replace(/each copy/gi,'each principal person').replace(/every copy/gi,'every principal person').replace(/copy 1/g,'the main doctor').replace(/main central copy/g,'main doctor');
  const viewpoint=`MANDATORY CAMERA VIEWPOINT — ESTABLISH BEFORE COMPOSING THE PORTRAIT:
${camera}
Reconstruct this photographic viewpoint from the identity reference; its original camera angle does not lock the new camera. Preserve the person's identifying facial anatomy, age, asymmetries, skin tone and accessories while allowing the normal perspective projection of the selected viewpoint. Do not reshape the face or enlarge the head to fake perspective. Preserve the selected camera distance, complete head and torso crop.`;
  return {key,framing,expression,viewpoint,directions:`NORMAL MODE — SELECTED PERSON CONTROLS:
BODY ANGLE — TORSO AND SHOULDERS ONLY: ${view.angle}
HEAD AND EYE DIRECTION: ${view.gaze}
FACIAL EXPRESSION: ${expression}
HAND POSITION / ACTION: ${view.hand}
${view.coordination}
Keep camera placement, subject distance, torso pose, gaze, expression and hand action independent. Camera orbit changes the viewpoint; do not turn the body to erase its oblique projection. Head/gaze right and left refer to the person's own anatomical sides; viewer/frame directions refer to the image. The camera viewpoint governs the entire scene. Body, gaze, expression and hand controls govern the main doctor only; supporting characters retain their own locations and notes. Apply natural expression movement without changing facial structure. Preserve exact identity, age, skin tone, facial details and eyewear only from that person's own identity reference or an explicit request. No beautification or identity transfer.
${background}
SELECTED-CONTROL PRIORITY: the selected background and person controls override incidental scene, pose or background wording in the additional idea. The background description controls the environment only. Keep the selected aspect ratio, reference mapping and wardrobe source. No lower fade outside sky mode unless explicitly requested in the custom background. Maintain sharp faces and active hands, soft neutral facial fill, restrained background-color bounce on clothing and believable depth.`};
}
if(typeof module!=='undefined')module.exports={buildDoctorNormalDirections,buildDoctorClinicBackground};

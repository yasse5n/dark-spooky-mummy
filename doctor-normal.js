/* global CAMERA_PERSPECTIVES, BODY_ANGLES, FACE_GAZES, EXPRESSIONS, HAND_POSES, BACKGROUNDS */
function createDoctorNormalControls(onChange) {
  const root=document.getElementById('doctorNormalFields'),controls={};
  function add(tag,parent,text){const e=document.createElement(tag);if(text)e.textContent=text;parent.appendChild(e);return e;}
  function select(parent,key,title,choices,placeholder,defaultFirst){
    const id='doctorNormal_'+key,l=add('label',parent,title);l.setAttribute('for',id);
    const e=add('select',parent);e.id=id;controls[key]=e;
    if(placeholder){const o=add('option',e,placeholder);o.value='';}
    choices.forEach(([label,value])=>{const o=add('option',e,label);o.value=value;});
    if(defaultFirst){e.value=choices[0][1];e.options[placeholder?1:0].selected=true;}
    e.addEventListener('change',onChange);return e;
  }
  function text(parent,key,title,placeholder,multiline){
    const id='doctorNormal_'+key;if(title){const l=add('label',parent,title);l.setAttribute('for',id);}
    const e=add(multiline?'textarea':'input',parent);e.id=id;controls[key]=e;e.setAttribute('dir','auto');
    if(!multiline)e.type='text';else e.className='roomIdea';e.placeholder=placeholder;e.setAttribute('aria-label',title||placeholder);
    e.addEventListener('input',onChange);return e;
  }
  function section(step){const s=add('section',root);s.setAttribute('data-doctor-step',String(step));if(step%2===0)s.classList.add('teacherNormalEven');return s;}
  function preset(step,key,title,choices,placeholder,defaultFirst){const s=section(step);select(s,key+'Preset',title,choices,placeholder,defaultFirst);text(s,key,'','اكتب وصفك هنا — اختياري',false);return s;}
  preset(4,'perspective','٤ · منظور التصميم (الكاميرا)',CAMERA_PERSPECTIVES,'اختار منظور الكاميرا',true);
  let s=section(5);select(s,'cameraDistance','٥ · بُعد الدكتور عن الكاميرا',[
    ['البعد الطبيعي — الافتراضي','normal'],['قريب','close'],['قريب جدًا','veryClose'],['أبعد قليلًا','farther']],null,true);
  add('p',s,'الطبيعي حتى الخصر؛ قريب للوجه والصدر؛ قريب جدًا للرأس والكتفين؛ أبعد قليلًا لمساحة خلفية أكبر. بدون ظهور البنطلون.').className='hint';
  preset(7,'angle','٧ · زاوية الجسم',BODY_ANGLES,'اختار زاوية الجسم أو اكتبها تحت',false);
  s=preset(8,'gaze','٨ · اتجاه الوجه والنظرة',FACE_GAZES,'اختار اتجاه الوجه والنظرة أو اكتبه تحت',false);
  add('p',s,'يمين وشمال في النظرة يقصد بيهم يمين الشخص وشماله، مش الكادر.').className='hint';
  preset(9,'expression','٩ · تعبير الوجه',EXPRESSIONS,'اختار تعبير الوجه',true);
  const medicalHands=HAND_POSES.concat([
    ['يمسك سماعة طبية','Hold a medical stethoscope naturally near the chest; keep the face unobstructed and the hand anatomically connected.'],
    ['يمسك مجسمًا للتخصص','Hold a small anatomical model appropriate to the selected specialty near chest height; preserve the selected crop and natural hand anatomy.'],
    ['يمسك ملفًا طبيًا','Hold a medical clipboard naturally at chest level; no invented readable patient details or unrequested text.']
  ]);
  preset(10,'hand','١٠ · حركة اليد',medicalHands,'اختار حركة اليد أو اكتبها تحت',false);
  s=section(11);const background=select(s,'backgroundType','١١ · نوع الخلفية',[
    ['لون سادة / جردينت','studio'],['عيادة حسب التخصص','room'],['سماء سينمائية · مبانٍ وغروب','sky'],['اكتب فكرتك للخلفية','custom']],null,true);
  const studio=add('div',s);studio.id='doctorNormalStudioFields';select(studio,'backgroundPreset','الخلفية وألوانها',BACKGROUNDS,'اختار الخلفية وألوانها',true);text(studio,'background','','اكتب لون أو وصف الجردينت — اختياري',false);
  const room=add('div',s);room.id='doctorNormalRoomFields';text(room,'roomColor','لون العيادة','مثال: كحلي، بيج دافئ، أخضر زيتوني',false);text(room,'roomIdea','فكرة العيادة وأجهزتها — اختياري','مثال: عيادة أسنان — كرسي أسنان وإضاءة طبية خلف الدكتور',true);
  const sky=add('div',s);sky.id='doctorNormalSkyFields';select(sky,'skyTone','لون السماء',[
    ['تلقائي · متباين مع الملابس','auto'],['كحلي راقٍ','navy'],['أزرق فاتح','lightBlue']],null,true);
  add('p',sky,'السماء ثلثين والأرض ثلث؛ مبانٍ على الجانبين وضوء الشمس خلف الرقبة. تلاشي أسفل الملابس للخلفية دي فقط، والوجه واليدين واضحين.').className='hint';
  const custom=add('div',s);custom.id='doctorNormalCustomFields';text(custom,'backgroundIdea','وصف فكرة الخلفية','اوصف المكان والألوان والعناصر والإضاءة اللي عاوزها في الخلفية',true);
  add('p',custom,'الوصف يخص الخلفية؛ زاوية الشخص ونظرته وتعبيره وحركة يده من الاختيارات فوق.').className='hint';
  function syncBackground(){setUiHidden(studio,background.value!=='studio');setUiHidden(room,background.value!=='room');setUiHidden(sky,background.value!=='sky');setUiHidden(custom,background.value!=='custom');}
  background.addEventListener('change',syncBackground);syncBackground();
  const position=document.getElementById('doctorLegacyPositionSection');
  const positionAnchor=document.createElement('div');
  positionAnchor.id='doctorPositionHome';
  position.parentNode.insertBefore(positionAnchor,position);
  const angleSection=root.querySelector('[data-doctor-step="7"]');
  const subjectSection=document.getElementById('doctorSubjectSection');
  function syncLayout(active){
    subjectSection.classList.toggle('teacherNormalEven',active);
    position.classList.toggle('teacherNormalEven',active);
    if(active){
      if(position.parentNode!==root)root.insertBefore(position,angleSection);
      position.setAttribute('data-doctor-step','6');
    }else{
      if(position.parentNode===root)positionAnchor.parentNode.insertBefore(position,positionAnchor);
      position.removeAttribute('data-doctor-step');
    }
    document.getElementById('doctorPositionLabel').textContent=active?'٦ · مكان الدكتور في الصورة':'٤ · مكان الشخص في الصورة';
    document.getElementById('doctorCastLabel').textContent=active?'الفريق الطبي خلف الدكتور أو بجانبه — اختياري':'٧ · الفريق الطبي خلف الدكتور أو بجانبه';
    document.getElementById('doctorReferenceLabel').textContent=active?'مصادر الصور المرجعية':'٨ · مصادر الصور المرجعية';
    document.getElementById('doctorClothingLabel').textContent=active?'مصدر ملابس الدكتور':'٩ · مصدر ملابس الدكتور';
  }
  return {
    values(){const values={enabled:true};Object.keys(controls).forEach(key=>values[key]=controls[key].value);return values;},
    sync(active){syncLayout(active);setUiHidden(root,!active);}
  };
}

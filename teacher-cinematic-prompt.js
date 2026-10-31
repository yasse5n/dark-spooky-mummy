// The cinematic mode owns its settings; legacy portrait/group crops do not apply.
const TEACHER_CINEMATIC_FIELDS = [
  {key:"ratio",label:"المقاس واتجاهه",group:"composition",value:"3:4",options:[["9:16","9:16 — رأسي طويل"],["3:4","3:4 — رأسي"],["1:1","1:1 — مربع"],["4:3","4:3 — أفقي"],["16:9","16:9 — أفقي عريض"]]},
  {key:"framing",label:"الكادر وبعد الشخص عن الكاميرا",group:"camera",value:"close",options:[["veryClose","قريب جدًا — اقتراب العدسة من الوجه"],["close","قريب — حتى الخصر"],["medium","متوسط — حتى أعلى الساقين"],["far","بعيد — الجسم كاملًا"]]},
  {key:"lens",label:"العدسة",group:"camera",value:"auto",options:[["auto","تلقائي حسب الفكرة"],["20","20 مم — واسعة جدًا"],["28","28 مم — واسعة"],["35","35 مم — واسعة معتدلة"],["50","50 مم — طبيعية"],["85","85 مم — بورتريه"]]},
  {key:"angle",label:"زاوية الكاميرا",group:"camera",value:"idea",options:[["eye","مستوى العين"],["low","سفلي"],["high","علوي"],["tilted","مائل"],["idea","حسب الفكرة"]]},
  {key:"foreground",label:"عنصر مموّه قرب العدسة — اختياري",group:"camera",value:"none",options:[["none","بدون"],["add","إضافة عنصر"]]},
  {key:"foregroundDescription",label:"وصف العنصر المموّه",group:"camera",type:"textarea",value:"",placeholder:"مثال: تفاحة قرب حافة العدسة، ورقة متطايرة، أو جزء من شخص مموّه",showWhen:{key:"foreground",value:"add"}},
  {key:"pose",label:"وضعية الجسم",group:"composition",value:"idea",options:[["standing","واقف"],["sitting","جالس"],["idea","حسب الفكرة"],["custom","وصف مخصص"]]},
  {key:"position",label:"مكان المدرّس في الكادر",group:"composition",value:"center",options:[["right","يمين الصورة"],["center","منتصف الصورة"],["left","يسار الصورة"],["idea","حسب الفكرة"]]},
  {key:"lean",label:"ميل الجسم",group:"composition",value:"idea",options:[["straight","مستقيم"],["forward","للأمام"],["back","للخلف"],["side","جانبي"],["idea","حسب الفكرة"]]},
  {key:"gaze",label:"اتجاه النظرة",group:"composition",value:"idea",options:[["camera","الكاميرا"],["right","يمين الصورة"],["left","يسار الصورة"],["up","أعلى"],["down","أسفل"],["idea","حسب الفكرة"]]},
  {key:"expression",label:"تعبير الوجه",group:"composition",value:"original",options:[["original","نفس تعبير الصورة الأصلية"],["smile","ابتسامة خفيفة"],["teeth","ابتسامة تظهر الأسنان"],["neutral","حيادي"],["serious","جاد"],["amazed","مندهش"],["idea","حسب الفكرة"],["custom","وصف مخصص"]]},
  {key:"upper",label:"نوع الملابس العلوية وتفاصيلها",group:"wardrobe",type:"textarea",value:"",placeholder:"الأكمام، الياقة، الأزرار… أو اتركها من مصدر الملابس المختار"},
  {key:"pattern",label:"نقشة الملابس",group:"wardrobe",value:"idea",options:[["idea","حسب الفكرة"],["plain","سادة"],["striped","مخططة"],["checks","كاروهات"],["custom","وصف مخصص"]]},
  {key:"clothesColors",label:"ألوان الملابس وتوزيعها",group:"wardrobe",type:"text",value:"",placeholder:"مثال: قميص عاجي بنقشة نبيتي"},
  {key:"lower",label:"الملابس السفلية",group:"wardrobe",type:"text",value:"",placeholder:"نوع القطعة ولونها — لو هتظهر في الكادر"},
  {key:"accessories",label:"الإكسسوارات وألوانها وأماكنها",group:"wardrobe",type:"textarea",value:"بدون",placeholder:"بدون، أو اوصف النوع واللون ومكانه في الصورة"},
  {key:"lighting",label:"وصف الإضاءة",group:"lighting",type:"textarea",value:"",placeholder:"الضوء الرئيسي والتعبئة، مصادر الضوء بالمكان، الألوان والاتجاه والقوة"},
  {key:"palette",label:"لوحة الألوان",group:"lighting",type:"text",value:"",placeholder:"مثال: نبيتي، عاجي، بني عسلي وكهرماني"},
  {key:"contrast",label:"درجة التباين",group:"lighting",value:"idea",options:[["calm","هادئ"],["medium","متوسط"],["strong","قوي"],["idea","حسب الفكرة"]]},
  {key:"grain",label:"حبيبات التصوير",group:"lighting",value:"none",options:[["none","بدون"],["light","خفيفة"]]},
  {key:"vignette",label:"تعتيم الأطراف",group:"lighting",value:"none",options:[["none","بدون"],["light","خفيف"]]}
];

const TEACHER_CINEMATIC_LENSES = {
  auto:"اختر العدسة المناسبة للفكرة والتكوين.",
  "20":"مساحة واسعة من المكان وإبراز قوي للعناصر القريبة من الكاميرا؛ اضبط موقع الكاميرا لتجنب تمدد ملامح الوجه.",
  "28":"إظهار الشخص والمكان مع منظور قوي للعناصر الموجودة في المقدمة.",
  "35":"توازن بين الشخص والبيئة بعمق واضح ومبالغة أقل في العناصر القريبة.",
  "50":"نسب متوازنة ومنظور طبيعي وتكوين يركز أكثر على الشخص.",
  "85":"تكوين أقرب للبورتريه، بمساحة أقل من البيئة المحيطة وضغط منظور متسق مع مسافة الكاميرا."
};

function buildTeacherCinematicPrompt(config, cast, refs) {
  const settings=config.cinematic||{}, story=String(config.idea||"").trim();
  if(!story)throw new Error("اكتب فكرة التصميم علشان نجهّز البرومبت.");
  const selected={}, values={};
  TEACHER_CINEMATIC_FIELDS.forEach(field=>{
    const raw=String(settings[field.key]===undefined?field.value:settings[field.key]).trim();
    selected[field.key]=raw;
    if(field.options){
      const option=field.options.find(o=>o[0]===raw);
      if(!option)throw new Error("اختار "+field.label+" في إعدادات السينمائي.");
      if(raw==="custom"){
        const custom=String(settings[field.key+"Custom"]||"").trim();
        if(!custom)throw new Error("اكتب الوصف المخصص: "+field.label+".");
        values[field.key]=custom;
      }else values[field.key]=option[1];
    }else values[field.key]=raw||(field.group==="wardrobe"?"retain the selected wardrobe source":"according to the story");
  });
  const foregroundDescription=String(settings.foregroundDescription||"").trim();
  if(selected.foreground==="add"&&!foregroundDescription)throw new Error("اكتب وصف العنصر المموّه قرب العدسة.");
  const garmentNames={auto:"derive the garment category from the teacher",tracksuit:"tracksuit / sports jacket",hoodie:"hoodie",suit:"suit",shirt:"shirt",workwear:"workwear"};
  if(cast.length&&(!garmentNames[config.castGarment]||!["coordinated","contrast"].includes(config.outfitStrategy)))throw new Error("راجع نوع وتنسيق ملابس الشخصيات.");
  const choices={
    pose:{standing:"standing",sitting:"sitting",idea:"according to the story"},
    position:{right:"VIEWER'S RIGHT",center:"CENTER",left:"VIEWER'S LEFT",idea:"according to the story"},
    lean:{straight:"upright",forward:"leaning forward",back:"leaning backward",side:"leaning sideways",idea:"according to the story"},
    gaze:{camera:"look into the actual camera lens",right:"toward the VIEWER'S RIGHT",left:"toward the VIEWER'S LEFT",up:"upward",down:"downward",idea:"according to the story"},
    expression:{original:"retain the exact expression in the teacher's identity reference",smile:"a natural gentle smile",teeth:"a natural smile showing teeth",neutral:"neutral",serious:"serious",amazed:"amazed",idea:"according to the story"},
    pattern:{idea:"retain the selected wardrobe source pattern",plain:"plain",striped:"striped",checks:"checked"},
    contrast:{calm:"gentle",medium:"moderate",strong:"strong",idea:"according to the story"}
  };
  const choice=key=>choices[key][selected[key]]||values[key];
  const people=cast.length+1,ratio=selected.ratio;
  const mapping=refs.map((ref,i)=>{
    if(ref.kind==="teacher")return "IMAGE "+(i+1)+": MAIN TEACHER IDENTITY ONLY; highest priority.";
    if(ref.kind==="clothing")return "IMAGE "+(i+1)+": TEACHER CLOTHING ONLY (last image). Transfer cut, fabric, colors and details; never the model's face, accessories, pose or background. This outfit overrides conflicting clothing text.";
    return "IMAGE "+(i+1)+": SUPPORTING CHARACTER "+(cast.indexOf(ref.character)+1)+" — "+ref.character.label+" ("+ref.character.name+"). Identity and characteristic headwear only; body wardrobe is controlled separately.";
  }).join("\n");
  const identity="IDENTITY — HIGHEST PRIORITY: Preserve each referenced person's own exact facial geometry, proportions, asymmetries, eyes, brows, nose, lips, jaw, ears, age, skin tone, hair and facial hair. No beautification, de-aging, substitute faces, blending or identity swaps. A mapped reference face takes precedence over a character's name. Preserve glasses only from that person's own identity reference or an explicit request. Expression and natural camera projection may change without redesigning the face. Render archival faces photographically while keeping their identifying geometry.";
  const framingPriority="FRAMING PRIORITY — MANDATORY:\nThe framing selected in the plugin is the ONLY authority for the visible body boundary and shot size. It overrides ALL conflicting framing, crop, zoom or camera-distance requests in the design idea, even when explicitly stated.\n\nExecute the remaining story within the selected framing. Adapt poses, hands, props and background placement to it; never widen or replace the selected shot to accommodate them. Conflicting story instructions do not authorize showing body parts outside the selected boundary.\n\nPreserve exact facial identity and natural anatomy throughout.";
  const cameraApi=typeof module!=="undefined"?require("./teacher-camera-presets.js"):{qayemTeacherViewpoint,qayemTeacherCrop};
  const frames={
    "veryClose": cameraApi.qayemTeacherCrop("veryClose",cast.length),
    "close": "MANDATORY FINAL FRAMING — CLOSE, WAIST-UP ONLY.\n\nCompose the final image directly as a close upper-body portrait: complete head, shoulders, chest and torso ending at the natural waist. Keep the person large and readable, with modest headroom.\n\nThe BOTTOM BORDER OF THE IMAGE MUST intersect the person's torso at the waist, ABOVE the trouser waistband. This is the photograph's actual boundary, not an internal crop or an area concealed by another object.\n\nShow NO waistband, trousers, hips or thighs, including partially behind props or foreground elements. If a jacket extends below the waist, crop through the jacket at waist level; do not follow its hem downward.\n\nKeep active hands and essential prop parts within the visible torso through a natural pose. Long objects may continue beyond the image border. Never pull back to display them completely.\n\nMaintain this exact boundary while standing, sitting or leaning. Fit the selected lens, angle and environment to the waist-up shot. Preserve exact facial identity and natural anatomy.",
    "medium": "MANDATORY FINAL FRAMING — MEDIUM, HEAD TO UPPER THIGHS.\n\nCompose the final image directly to include the complete head, shoulders, torso, waist, hips and ONLY the upper portion of the thighs. Show more surrounding environment than in a waist-up portrait while keeping the person prominent and recognizable.\n\nThe BOTTOM BORDER OF THE IMAGE MUST cross the upper thighs, well above the knees. The knees, lower legs and feet are outside the photograph.\n\nLower clothing is permitted only within this selected boundary. Do not extend the frame to the knees or feet to accommodate a pose, long garment or held object. Conversely, do not reduce this selection to a chest-only or waist-up portrait.\n\nFit the selected lens, camera angle, hands and essential prop parts to this medium shot. Preserve exact facial identity, natural body proportions and coherent scene perspective. Foreground objects and background events must not change the body boundary.",
    "far": "MANDATORY FINAL FRAMING — FAR, COMPLETE FULL BODY.\n\nCompose the final image as a wider environmental shot showing the entire person from the top of the head to BOTH FEET. Leave visible breathing room above the head, below the feet and around the body.\n\nThe person must appear smaller within the frame than in the closer presets, while remaining the main focal point with a recognizable reference identity. Include the complete selected outfit and a coherent relationship between the person and the surrounding setting.\n\nDo not cut the head, knees, ankles or feet at any image border. Do not substitute a waist-up or upper-thigh portrait. Keep hands, actions and props at natural scale rather than enlarging them to imitate camera proximity.\n\nFit the selected lens and angle to this complete-body composition. For a seated pose, keep the entire body and both feet inside the photograph. Foreground elements must not conceal the feet to simulate a complete-body shot."
};
  const lenses={
    auto:"choose a lens appropriate to the story and selected crop",
    "20":"20mm very wide; strong near/far separation and foreground scale, without stretching the face",
    "28":"28mm wide; visible environmental perspective and near/far depth",
    "35":"35mm moderately wide; balance the person and environment with controlled foreground perspective",
    "50":"50mm natural; balanced proportions and an emphasis on the person",
    "85":"85mm portrait; a narrower environmental view and perspective compression consistent with camera distance"
  };
  const angles={
    eye:cameraApi.qayemTeacherViewpoint("eye"),
    low:cameraApi.qayemTeacherViewpoint("low"),
    high:cameraApi.qayemTeacherViewpoint("high"),
    tilted:"TILTED FRAME: a deliberate camera roll with one coherent scene perspective",
    idea:"choose the camera angle from the story"
  };
  const camera="SHOT — ONE COMBINED FRAMING PRESET:\n"+framingPriority+"\n\n"+frames[selected.framing]+"\nLens: "+(config.fisheyeEnabled&&config.fisheyeScope==='all'?'the independently enabled fisheye projection across the entire design':config.fisheyeEnabled&&config.fisheyeScope==='person'?'the selected ordinary background projection with the independent localized fisheye treatment on the teacher':lenses[selected.lens])+". Camera angle: "+angles[selected.angle]+".\nThis single preset controls both the visible body boundary and apparent closeness. Establish the selected camera angle and body pose first, then approach or retreat along that sightline to obtain this framing. Never crouch, bend or reposition the person just to fit the crop; do not generate a competing distance instruction. Adapt the surrounding space to the selected aspect ratio without stretching anatomy. A foreground element or large hand must not alter this framing.";
  const person="PERSON: Pose: "+choice("pose")+". Frame placement: "+choice("position")+". Body lean: "+choice("lean")+". Gaze: "+choice("gaze")+". Expression: "+choice("expression")+". Apply these independently; preserve facial identity.";
  let wardrobeSource="";
  if(config.clothingMode==="image")wardrobeSource="The last clothing reference controls the teacher outfit; use the following text only for compatible details absent from that image.";
  else if(String(config.clothingDescription||"").trim())wardrobeSource="Selected teacher clothing source — highest clothing priority: "+String(config.clothingDescription).trim()+". Other wardrobe text supplies compatible details only.";
  else wardrobeSource="Retain the teacher's reference outfit unless the dedicated wardrobe fields below explicitly select a change. Story/additional design details do not control clothing.";
  const cropped=["veryClose","close"].includes(selected.framing);
  const accessories=values.accessories==="بدون"?"no additional accessories; retain identifying glasses only when present in the owner's identity reference":values.accessories;
  const wardrobe="WARDROBE: "+wardrobeSource+"\nUpper garment details: "+values.upper+". Pattern: "+choice("pattern")+". Clothing colors: "+values.clothesColors+". "+(cropped?"Lower clothing stays outside the selected crop.":"Lower clothing: "+values.lower+".")+" Accessories: "+accessories+".";
  const castText=cast.length
    ? "SUPPORTING CAST — exactly "+cast.length+", one instance each:\n"+cast.map((c,i)=>
      (i+1)+". "+c.label+" ("+c.name+"): "+(c.location.startsWith("Immediately")?"directly behind the teacher's shoulder":"beside the teacher")+", on the VIEWER'S "+c.screenSide+". Body clothing: "+garmentNames[config.castGarment]+"; "+(c.outfitColor?"selected color: "+c.outfitColor:"a distinct color coherent with the teacher and scene")+". "+(c.note?"Character notes (override group wardrobe for this character): "+c.note:"")
    ).join("\n")+"\n"+(config.referenceMode==="withCharacters"?"Each supporting identity comes only from its mapped image; do not swap or borrow faces.":"No supporting identity images supplied: use the named character's known appearance if available, never the teacher's face.")+" Group wardrobe: "+(config.outfitStrategy==="contrast"?"contrasting but harmonious colors":"coordinated materials with distinct colors")+(config.outfitNotes?". Group notes: "+config.outfitNotes:"")+". Keep faces separate and unobstructed. Apply the single selected cinematic framing preset and chosen poses; do not import a hidden group crop or independent distance. The teacher remains the main focal point."
    : "The teacher is the only primary character. Do not add other primary people.";
  const foreground=selected.foreground==="add"
    ? "OPTIONAL DEFOCUSED FOREGROUND — enabled:\n"+foregroundDescription+"\nPlace it close to the lens and out of focus. Unless its description specifies otherwise, use a narrow edge fragment, about 10–15% of frame width. Keep the teacher's face and active hands unobstructed; do not pull the camera back or alter the body crop. If human, show only a partial back/shoulder or silhouette without a visible face, new identity or reference requirement. It is a secondary composition element, excluded from the primary cast count."
    : "OPTIONAL DEFOCUSED FOREGROUND — disabled: omit an independent framing object or blurred foreground person even if incidentally mentioned in the story. Still render the requested held objects, actions and their natural effects.";
  const subject=config.subject==="none"?"No school subject selected; derive the scene only from the story, without automatic educational symbols.":"Subject context only: "+config.chosenSubject[1]+"; do not automatically add educational props.";
  const finish="LIGHT AND FINISH: Lighting description: "+values.lighting+". Palette: "+values.palette+". Contrast: "+choice("contrast")+". Film grain: "+(selected.grain==="light"?"subtle":"none")+". Vignette: "+(selected.vignette==="light"?"subtle":"none")+". When automatic, infer a coherent treatment from the story. Use motivated directional light, readable eyes, natural skin, sculpted shadows, realistic fabric and contact shadows. Keep principal faces, active hands and essential props sharp, with anatomically connected arms and fingers.";
  const depth="ENVIRONMENT AND DEPTH: Build the requested setting as one coherent space. Separate foreground, main subject and distant background through perspective, light and atmospheric depth. Keep background events behind the person; stage them in the space available around the selected crop. Execute the requested interactions convincingly without inventing unrelated spectacle.";
  const output="The mandatory selected framing overrides conflicting story framing even when explicitly requested. Other selected controls and reference sources govern incidental conflicts. Infer automatic choices from the story. Preserve explicitly requested actions, objects, colors and text within the crop. Output one cohesive high-detail cinematic advertising photograph in "+ratio+". No unrequested text, logos, watermarks or duplicate people.";
  return "Create ONE photorealistic cinematic advertising image in "+ratio+", using exactly "+refs.length+" reference image(s) in this order. Primary characters: "+people+".\n\n"+mapping+"\n"+identity+"\n\n"+camera+"\n"+person+"\n\nSTORY — execute this idea:\n"+story+"\n"+subject+"\n\n"+wardrobe+"\n\n"+castText+"\n"+foreground+"\n\n"+depth+"\n"+finish+"\n\n"+output+"\n";
}

if(typeof module!=="undefined")module.exports={TEACHER_CINEMATIC_FIELDS,TEACHER_CINEMATIC_LENSES,buildTeacherCinematicPrompt};

runUiInitializer('typographyPromptsView',function(){
 const node=id=>document.getElementById(id),list=QayemTextPromptCatalog;
 list.forEach(style=>{const option=document.createElement('option');option.value=style.id;option.textContent=style.label;node('textPromptStyle').appendChild(option);});
 const copy=createPromptCopyController({button:'textPromptCopy',preview:'textPromptPreview',status:'textPromptStatus',successText:'تم نسخ البرومبت. الصقه في أداة الصور لتوليد الكتابة.',build:()=>QayemTextPromptBuilder.typography(list,node('textPromptStyle').value,node('textPromptText').value)});
 function update(){const style=list.find(s=>s.id===node('textPromptStyle').value);node('textPromptStyleDescription').textContent=style?style.description:'';node('textPromptText').placeholder=style&&style.layout==='tagline'?'اكتب الاسم هنا في السطر الأول\nواكتب الجملة التعريفية في السطر الثاني':'اكتب نصك هنا؛ استخدم سطرًا جديدًا لو عاوز توزيعًا محددًا';copy.invalidate();}
 node('textPromptStyle').addEventListener('change',update);node('textPromptText').addEventListener('input',()=>copy.invalidate());update();
});
runUiInitializer('textEffectsView',function(){
 const node=id=>document.getElementById(id);
 QayemTextPromptBuilder.effects.forEach(effect=>{const option=document.createElement('option');option.value=effect.id;option.textContent=effect.label;node('textEffectKind').appendChild(option);});
 node('textEffectKind').value='fire';
 const copy=createPromptCopyController({button:'textEffectCopy',preview:'textEffectPreview',status:'textEffectStatus',successText:'تم نسخ البرومبت. أرفقه مع صورة التصميم المصدّرة في أداة تعديل الصور.',build:()=>QayemTextPromptBuilder.edit({effect:node('textEffectKind').value,interaction:node('textEffectInteraction').value,scope:node('textEffectScope').value,intensity:node('textEffectIntensity').value,target:node('textEffectTarget').value})});
 ['textEffectKind','textEffectInteraction','textEffectScope','textEffectIntensity','textEffectTarget'].forEach(id=>node(id).addEventListener(id==='textEffectTarget'?'input':'change',()=>copy.invalidate()));
});

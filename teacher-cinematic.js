/* global TEACHER_CINEMATIC_FIELDS */
function createTeacherCinematicControls(onChange) {
  const controls={},extras={},conditional=[];
  function add(tag,parent,text){const e=document.createElement(tag);if(text)e.textContent=text;parent.appendChild(e);return e;}
  function input(parent,key,label,type,value,placeholder){
    const id="teacherCinematic_"+key;
    const l=add("label",parent,label);l.setAttribute("for",id);
    const e=add(type==="textarea"?"textarea":"input",parent);e.id=id;
    if(type!=="textarea")e.type=type||"text";
    e.value=value||"";e.setAttribute("dir","auto");if(placeholder)e.placeholder=placeholder;
    if(type==="textarea")e.className="roomIdea";
    if(type==="number"){e.min="1";e.step="1";}
    return e;
  }
  TEACHER_CINEMATIC_FIELDS.forEach(field=>{
    let group=document.getElementById("teacherCinematicGroup_"+field.group);
    if(field.key==="ratio")return;
    if(field.showWhen){
      group=add("div",group);group.id="teacherCinematic_"+field.key+"Fields";
      conditional.push({node:group,rule:field.showWhen});
      setUiHidden(group,true);
    }
    if(field.options){
      const l=add("label",group,field.label);l.setAttribute("for","teacherCinematic_"+field.key);
      const e=add("select",group);e.id="teacherCinematic_"+field.key;
      field.options.forEach(([value,label])=>{const option=add("option",e,label);option.value=value;});e.value=field.value;controls[field.key]=e;
      if(field.options.some(x=>x[0]==="custom")){
        const extra=add("div",group);setUiHidden(extra, true);extras[field.key]=extra;
        controls[field.key+"Custom"]=input(extra,field.key+"Custom","الوصف المخصص","textarea","");
        controls[field.key+"Custom"].addEventListener("input",onChange);
      }
      e.addEventListener("change",()=>{if(extras[field.key])setUiHidden(extras[field.key], e.value!=="custom");syncConditional();onChange();});
    }else{
      controls[field.key]=input(group,field.key,field.label,field.type,field.value,field.placeholder);
      controls[field.key].addEventListener("input",onChange);
    }
  });
  function syncConditional(){conditional.forEach(({node,rule})=>setUiHidden(node,controls[rule.key].value!==rule.value));}
  syncConditional();
  return {
    values(){const settings={};Object.keys(controls).forEach(key=>settings[key]=controls[key].value);return settings;},
    sync(active,count,imageClothes){
      setUiHidden(document.getElementById("teacherCinematicFields"), !active);
      syncConditional();
      document.getElementById("teacherCinematicWardrobeHint").textContent=imageClothes?"صورة الملابس المحددة هي الأساس؛ الحقول هنا لتفاصيل غير موجودة فيها فقط.":"الملابس من الاختيارات دي والفكرة؛ سيب الوصف فاضي لو عاوز استنتاجه من الفكرة.";
    }
  };
}

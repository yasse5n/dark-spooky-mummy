function createTextTemplateEngine(ps,storage,catalog,layout,legacyApi){
 if(!ps||!ps.action||typeof ps.action.batchPlay!=='function')throw new Error('إضافة الكتابة متاحة من داخل Photoshop.');
 let busy=false,fontCache=null,sequence=0;
 const px=value=>({_unit:'pixelsUnit',_value:value});
 async function play(command){
  // dontDisplay still opens Photoshop error dialogs during shutdown; return errors to our UI instead.
  command._options={dialogOptions:'silent'};
  const result=(await ps.action.batchPlay([command],{synchronousExecution:false}))[0];
  if(!result||result._obj==='error')throw new Error(result&&result.message||'تعذّر تنفيذ أمر الكتابة في Photoshop.');
  return result;
 }
 const getDoc=()=>play({_obj:'get',_target:[{_ref:'document',_enum:'ordinal',_value:'targetEnum'}]});
 const selectDoc=id=>play({_obj:'select',_target:[{_ref:'document',_id:id}]});
 const getLayer=(id,doc)=>play({_obj:'get',_target:[{_ref:'layer',_id:id},{_ref:'document',_id:doc}]});
 const namedLayer=(name,doc)=>play({_obj:'get',_target:[{_ref:'layer',_name:name},{_ref:'document',_id:doc}]});
 function scalar(value){return typeof value==='number'?value:Number(value&&value._value);}
 function info(desc){
  const mode=desc.mode&&desc.mode._value||desc.mode;
  if(/bitmap|indexed|multichannel|duotone/i.test(String(mode)))throw new Error('نوع ألوان المشروع لا يدعم هذا القالب. استخدم مشروعًا يدعم لايرات النص والأشكال.');
  const result={id:desc.documentID,name:desc.title||desc.name||'',width:scalar(desc.width),height:scalar(desc.height),resolution:scalar(desc.resolution)||72};
  if(!result.id||!Number.isFinite(result.width)||!Number.isFinite(result.height))throw new Error('افتح مشروعًا في Photoshop ثم اضغط إضافة الكتابة.');
  return result;
 }
 function bounds(desc){
  const b=desc.boundsNoEffects||desc.bounds;
  if(!b)throw new Error('تعذّر قياس حدود لاير الكتابة.');
  return [scalar(b.left),scalar(b.top),scalar(b.right),scalar(b.bottom)];
 }
 async function installedFonts(force){
  if(fontCache&&!force)return fontCache;
  function namesFrom(list){
   const names=[];
   if(!list||!Number.isFinite(Number(list.length))||list.length<1)return names;
   for(let i=0;i<list.length;i++){
    try{const item=list[i],name=typeof item==='string'?item:item&&item.postScriptName;
     if(typeof name==='string'&&name.trim()&&names.indexOf(name)<0)names.push(name);
    }catch(ignored){}
   }
   return names;
  }
  try{const names=namesFrom(ps.app&&ps.app.fonts);if(names.length){fontCache=names;return fontCache;}}catch(ignored){}
  const data=await play({_obj:'get',_target:[{_property:'fontList'},{_ref:'application',_enum:'ordinal',_value:'targetEnum'}]});
  const names=namesFrom((data.fontList||data).fontPostScriptName);
  if(!names.length)throw new Error('تعذّر قراءة الخطوط المتاحة داخل Photoshop.');
  fontCache=names;return fontCache;
 }
 async function documentInfo(force){
  if(busy)throw new Error('استنى انتهاء إضافة الكتابة.');
  // Avoid requesting a target document after the last project has closed.
  // Older hosts may not expose the documents collection, so retain the silent batchPlay fallback.
  try{if(ps.app&&ps.app.documents&&ps.app.documents.length===0)throw new Error('افتح مشروعًا في Photoshop ثم اضغط إضافة الكتابة.');}
  catch(error){throw new Error(error.message||'تعذّر قراءة المشروع أثناء إغلاق Photoshop.');}
  const result=info(await getDoc());result.fonts=await installedFonts(force);return result;
 }
 async function selectLayer(id,additional){
  const d={_obj:'select',_target:[{_ref:'layer',_id:id}],makeVisible:false};
  if(additional)d.selectionModifier={_enum:'selectionModifierType',_value:'addToSelection'};
  await play(d);
 }
 async function scaleLayer(id,scale){
  if(Math.abs(scale-1)<0.000001)return;
  await play({_obj:'transform',_target:[{_ref:'layer',_id:id}],freeTransformCenterState:{_enum:'quadCenterState',_value:'QCSAverage'},width:{_unit:'percentUnit',_value:scale*100},height:{_unit:'percentUnit',_value:scale*100},interfaceIconFrameDimmed:{_enum:'interpolationType',_value:'bicubic'}});
 }
 async function moveLayer(id,x,y){
  await play({_obj:'move',_target:[{_ref:'layer',_id:id}],to:{_obj:'offset',horizontal:px(x),vertical:px(y)}});
 }
 async function replaceText(field,text,font,docId,layerId){
  const layer=await getLayer(layerId,docId),key=layer.textKey;
  if(!key||typeof key!=='object')throw new Error('لاير النص الأصلي غير موجود في القالب.');
  const to={_obj:'textLayer',textKey:text};
  ['textStyleRange','paragraphStyleRange','textShape','transform','warp','antiAlias','orientation','textClickPoint','gridding'].forEach(k=>{if(key[k]!==undefined)to[k]=JSON.parse(JSON.stringify(key[k]));});
  ['textStyleRange','paragraphStyleRange'].forEach(k=>{
   if(!to[k]||!to[k].length)return;
   // The supplied templates use one visual style per line. Extend that style to the complete new line.
   const range=to[k][0];range.from=0;range.to=text.length+1;to[k]=[range];
   if(k==='textStyleRange'){
    range.textStyle=range.textStyle||{_obj:'textStyle'};range.textStyle.fontPostScriptName=font;
    delete range.textStyle.fontName;delete range.textStyle.fontStyleName;delete range.textStyle.fontAvailable;
   }
  });
  await play({_obj:'set',_target:[{_ref:'textLayer',_id:layer.layerID}],to});
  const current=bounds(await getLayer(layer.layerID,docId)),fit=layout.fit(current,field.bounds);
  await scaleLayer(layer.layerID,fit.scale);
  const after=bounds(await getLayer(layer.layerID,docId));
  await moveLayer(layer.layerID,fit.centerX-(after[0]+after[2])/2,fit.centerY-(after[1]+after[3])/2);
 }
 async function makeMaskedGroup(template,sourceId,name,ids){
  for(let i=0;i<ids.length;i++)await selectLayer(ids[i],i>0);
  await play({_obj:'make',_target:[{_ref:'layerSection'}],from:{_ref:'layer',_enum:'ordinal',_value:'targetEnum'},using:{_obj:'layerSection',name}});
  const group=await namedLayer(name,sourceId),b=template.bounds;
  // Crop the group's editable mask to its original visible artwork, excluding off-canvas clipped gradients.
  await play({_obj:'set',_target:[{_ref:'channel',_property:'selection'}],to:{_obj:'rectangle',left:px(b[0]),top:px(b[1]),right:px(b[2]),bottom:px(b[3])}});
  await selectLayer(group.layerID,false);
  await play({_obj:'make',new:{_class:'channel'},at:{_ref:'channel',_enum:'channel',_value:'mask'},using:{_enum:'userMaskEnabled',_value:'revealSelection'}});
  await play({_obj:'set',_target:[{_ref:'channel',_property:'selection'}],to:{_enum:'ordinal',_value:'none'}});
  return group.layerID;
 }
 async function docIds(){
  const count=await play({_obj:'get',_target:[{_property:'numberOfDocuments'},{_ref:'application',_enum:'ordinal',_value:'targetEnum'}]});
  const ids=[];for(let i=1;i<=count.numberOfDocuments;i++){const d=await play({_obj:'get',_target:[{_ref:'document',_index:i}]});ids.push(d.documentID);}return ids;
 }
 async function run(request,mode){
  if(busy)throw new Error('فيه كتابة بتتضاف حاليًا؛ استنى نهايتها.');
  const follow=mode==='active-document'||request.followActiveDocument===true;
  const valid=layout.validate(request,catalog);busy=true;
  const task=async context=>{
   let target=null,sourceId=null,sourceOwned=false,importedId=null,history=null,complete=false,stage='فتح قالب الكتابة';
   const name='QAYEM · كتابة · '+valid.template.label+' · '+Date.now()+'-'+(++sequence);
   function cancelled(){if(context&&context.isCancelled)throw new Error('اتلغت إضافة الكتابة.');}
   try{
    try{if(ps.app&&ps.app.documents&&ps.app.documents.length===0)throw new Error('افتح مشروعًا في Photoshop ثم اضغط إضافة الكتابة.');}catch(error){throw new Error(error.message||'تعذّر قراءة المشروع.');}
    target=info(await getDoc());
    if(!follow&&(Number(request.documentId)!==target.id||Number(request.documentWidth)!==target.width||Number(request.documentHeight)!==target.height))throw new Error('المشروع المفتوح أو مقاسه اتغير. اضغط إضافة الكتابة مرة تانية.');
    const resolved=Object.assign({},request);
    if(follow)Object.assign(resolved,{documentId:target.id,documentWidth:target.width,documentHeight:target.height,manualPlacement:true,position:'center',widthPercent:target.height/target.width>1.05?85:65,marginPercent:4,offsetX:0,offsetY:0});
    target.fonts=await installedFonts(true);
    const plan=layout.plan(target.width,target.height,valid.template.bounds,resolved),fonts=layout.fonts(valid.template,request.fontMode,target.fonts);
    const folder=await storage.getPluginFolder(),entry=await folder.getEntry(valid.template.file),existing=await docIds();cancelled();
    const token=storage.createSessionToken(entry);
    await play({_obj:'open',null:{_path:token,_kind:'local'},forceNotify:true});
    sourceId=(await getDoc()).documentID;
    if(!sourceId||sourceId===target.id||existing.includes(sourceId))throw new Error('تعذّر فتح نسخة مستقلة من القالب، أو القالب مفتوح بالفعل. اقفله الأول ثم جرّب الإضافة.');
    sourceOwned=true;
    stage='قراءة لايرات القالب';
    // Resolve every original name before text changes can rename layers or create name collisions.
    const originalLayers=[];
    for(const label of valid.template.visibleNames){const layer=await namedLayer(label,sourceId);if(!layer.visible)throw new Error('تعذّر العثور على لاير القالب الظاهر: '+label);originalLayers.push({name:label,id:layer.layerID});}
    const fieldIds=valid.template.fields.map(field=>{const layer=originalLayers.find(item=>item.name===field.layerName);if(!layer)throw new Error('لاير النص الأصلي غير موجود في القالب: '+field.layerName);return layer.id;});
    stage='تحديث النصوص';
    await play({_obj:'imageSize',resolution:{_unit:'densityUnit',_value:target.resolution},resample:false});
    for(let i=0;i<valid.template.fields.length;i++){cancelled();await replaceText(valid.template.fields[i],valid.texts[i],fonts.selected[i],sourceId,fieldIds[i]);}
    stage='تجميع لايرات الكتابة';
    const sourceGroup=await makeMaskedGroup(valid.template,sourceId,name,originalLayers.map(layer=>layer.id));cancelled();
    // Position in the temporary source, preserving the user's target selection.
    // Track the mask rectangle through the group's affine transform, including off-canvas artwork.
    stage='ضبط حجم الكتابة ومكانها';
    await play({_obj:'select',_target:[{_ref:'channel',_enum:'channel',_value:'RGB'}]});
    const before=bounds(await getLayer(sourceGroup,sourceId));
    await scaleLayer(sourceGroup,plan.scale);
    const after=bounds(await getLayer(sourceGroup,sourceId));
    const left=after[0]+(valid.template.bounds[0]-before[0])*plan.scale;
    const top=after[1]+(valid.template.bounds[1]-before[1])*plan.scale;
    await moveLayer(sourceGroup,plan.x-left,plan.y-top);
    stage='نقل الكتابة إلى مشروعك';
    if(context&&context.hostControl&&context.hostControl.suspendHistory)history=await context.hostControl.suspendHistory({documentID:target.id,name:'QAYEM · إضافة كتابة'});
    await play({_obj:'duplicate',_target:[{_ref:'layer',_id:sourceGroup}],to:{_ref:'document',_id:target.id},version:5});
    await selectDoc(target.id);importedId=(await namedLayer(name,target.id)).layerID;
    await selectLayer(importedId,false);cancelled();
    complete=true;return {name:valid.template.label,fonts:fonts.selected,missingFonts:fonts.missing,document:target};
   }catch(error){
    const detail='QAYEM 1.24.31 · '+stage+': '+String(error.message||error);
    if(target){try{await selectDoc(target.id);if(!importedId){try{importedId=(await namedLayer(name,target.id)).layerID;}catch(ignored){}}if(importedId)await play({_obj:'delete',_target:[{_ref:'layer',_id:importedId}]});}catch(cleanup){throw new Error(detail+'\nتعذّر إزالة المجموعة غير المكتملة؛ راجع لايرات QAYEM أو استخدم Undo.');}}
    throw new Error(detail);
   }finally{
    let cleanupError=null;
    if(history!==null){try{await context.hostControl.resumeHistory(history,complete);}catch(e){cleanupError=new Error('تعذّر إنهاء سجل التراجع. راجع مجموعة QAYEM في المشروع.');}}
    if(sourceOwned){try{await play({_obj:'close',_target:[{_ref:'document',_id:sourceId}],saving:{_enum:'yesNo',_value:'no'}});}catch(e){cleanupError=new Error('تعذّر قفل نسخة القالب المؤقتة. اقفلها بدون حفظ؛ راجع مجموعة QAYEM في مشروعك.');}}
    if(target){try{await selectDoc(target.id);}catch(ignored){}}
    if(cleanupError)throw cleanupError;
   }
  };
  try{return !legacyApi&&ps.core&&typeof ps.core.executeAsModal==='function'?await ps.core.executeAsModal(task,{commandName:'QAYEM · إضافة كتابة'}):await task(null);}finally{busy=false;}
 }
 return {documentInfo,run,runActive:request=>run(request,'active-document')};
}
if(typeof module!=='undefined')module.exports={createTextTemplateEngine};

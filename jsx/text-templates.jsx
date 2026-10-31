var QayemCEPText=typeof QayemCEPText!=="undefined"&&QayemCEPText._version==="1.24.52"?QayemCEPText:(function(){
 var loadedRoot=null,fontNames=null,job=null,lastResult=null,layout=null,catalog=null;
 function load(root){
  if(loadedRoot!==root||!layout||!catalog){
   var nextLayout=$.evalFile(new File(root+'/text-layout.js')),nextCatalog=$.evalFile(new File(root+'/text-template-catalog.js'));
   if(!nextLayout||typeof nextLayout.stringify!=="function"||typeof nextLayout.plan!=="function"||!nextCatalog||!nextCatalog.length)throw new Error('تعذّر تحميل ملفات قوالب الكتابة. ثبّت الحزمة كاملة.');
   layout=nextLayout;catalog=nextCatalog;loadedRoot=root;
  }
 }
 function installedFonts(force){
  if(fontNames&&!force)return fontNames;var names=[];
  for(var i=0;i<app.fonts.length;i++){
   try{var name=app.fonts[i].postScriptName;if(typeof name==='string'&&/\S/.test(name))names.push(name);}catch(ignored){}
  }
  if(!names.length)throw new Error('تعذّر قراءة الخطوط المتاحة داخل Photoshop.');
  fontNames=names;return fontNames;
 }
 function documentId(doc){
  var id;try{id=doc.id;if(typeof id==='number'&&isFinite(id)&&id>0)return id;}catch(ignored){}
  var previous=app.activeDocument;
  try{
   app.activeDocument=doc;
   var ref=new ActionReference();ref.putProperty(stringIDToTypeID('property'),stringIDToTypeID('documentID'));
   ref.putEnumerated(stringIDToTypeID('document'),stringIDToTypeID('ordinal'),stringIDToTypeID('targetEnum'));
   id=executeActionGet(ref).getInteger(stringIDToTypeID('documentID'));
   if(typeof id==='number'&&isFinite(id)&&id>0)return id;
  }finally{app.activeDocument=previous;}
  throw new Error('تعذّر قراءة رقم المشروع من Photoshop.');
 }
 function info(doc){
  if(doc.mode===DocumentMode.BITMAP||doc.mode===DocumentMode.INDEXEDCOLOR||doc.mode===DocumentMode.MULTICHANNEL||doc.mode===DocumentMode.DUOTONE)throw new Error('نوع ألوان المشروع لا يدعم هذا القالب.');
  return {id:documentId(doc),name:doc.name,width:doc.width.as('px'),height:doc.height.as('px'),resolution:doc.resolution};
 }
 function response(data){return 'OK|'+encodeURIComponent(layout.stringify(data));}
 function error(e){var message=String(e.message||e);if(message.indexOf('QAYEM ')!==0)message='QAYEM 1.24.52 · Photoshop '+String(app.version||'?')+': '+message;return 'ERR|'+encodeURIComponent(message);}
 function documentInfo(root,force){
  try{load(root);if(!app.documents.length)throw new Error('افتح مشروعًا في Photoshop ثم اضغط إضافة الكتابة.');var result=info(app.activeDocument);result.fonts=installedFonts(force);return response(result);}catch(e){return error(e);}
 }
 function bounds(layer){var b=layer.bounds;return [b[0].as('px'),b[1].as('px'),b[2].as('px'),b[3].as('px')];}
 function frameBounds(group){
  var properties=['boundsNoEffects','bounds'];
  for(var i=0;i<properties.length;i++){
   try{
    var ref=new ActionReference();ref.putProperty(stringIDToTypeID('property'),stringIDToTypeID(properties[i]));ref.putName(stringIDToTypeID('layer'),group.name);
    var b=executeActionGet(ref).getObjectValue(stringIDToTypeID(properties[i]));
    var box=[b.getUnitDoubleValue(stringIDToTypeID('left')),b.getUnitDoubleValue(stringIDToTypeID('top')),b.getUnitDoubleValue(stringIDToTypeID('right')),b.getUnitDoubleValue(stringIDToTypeID('bottom'))];
    if(isFinite(box[0])&&isFinite(box[1])&&isFinite(box[2])&&isFinite(box[3])&&box[2]>box[0]&&box[3]>box[1])return box;
   }catch(ignored){}
  }
  var nativeBox=bounds(group);
  if(!isFinite(nativeBox[0])||!isFinite(nativeBox[1])||!isFinite(nativeBox[2])||!isFinite(nativeBox[3])||nativeBox[2]<=nativeBox[0]||nativeBox[3]<=nativeBox[1])throw new Error('تعذّر قياس مجموعة الكتابة.');
  return nativeBox;
 }
 function byName(layers,name){for(var i=0;i<layers.length;i++){if(layers[i].name===name)return layers[i];if(layers[i].typename==='LayerSet'){var result=byName(layers[i].layers,name);if(result)return result;}}return null;}
 function replace(field,text,font,layer){
  if(!layer||layer.kind!==LayerKind.TEXT)throw new Error('لاير النص الأصلي غير موجود في القالب: '+field.layerName);
  layer.textItem.font=font;layer.textItem.contents=text;
  var fit=layout.fit(bounds(layer),field.bounds);
  if(fit.scale<0.999999)layer.resize(fit.scale*100,fit.scale*100,AnchorPosition.MIDDLECENTER);
  var b=bounds(layer);layer.translate(new UnitValue(fit.centerX-(b[0]+b[2])/2,'px'),new UnitValue(fit.centerY-(b[1]+b[3])/2,'px'));
 }
 function mask(group,box,source){
  source.activeLayer=group;
  source.selection.select([[box[0],box[1]],[box[2],box[1]],[box[2],box[3]],[box[0],box[3]]]);
  var d=new ActionDescriptor(),at=new ActionReference();d.putClass(charIDToTypeID('Nw  '),charIDToTypeID('Chnl'));
  at.putEnumerated(charIDToTypeID('Chnl'),charIDToTypeID('Chnl'),charIDToTypeID('Msk '));d.putReference(charIDToTypeID('At  '),at);
  d.putEnumerated(charIDToTypeID('Usng'),charIDToTypeID('UsrM'),charIDToTypeID('RvlS'));executeAction(charIDToTypeID('Mk  '),d,DialogModes.NO);
  source.selection.deselect();
 }
 function perform(){
  var target=job.target,request=job.request,valid=job.valid,template=valid.template,source=null,owned=false,copy=null;
  var previousDialogs=app.displayDialogs,previousUnits=app.preferences.rulerUnits,stage='فتح قالب الكتابة';
  var name='QAYEM · كتابة · '+template.label+' · '+(new Date().getTime()),existing=[];
  for(var i=0;i<app.documents.length;i++)existing.push(documentId(app.documents[i]));
  try{
   app.displayDialogs=DialogModes.NO;app.preferences.rulerUnits=Units.PIXELS;
   var data=info(target);data.fonts=installedFonts(false);var plan=layout.plan(data.width,data.height,template.bounds,request),fonts=layout.fonts(template,request.fontMode,installedFonts(false));
   var file=new File(template.localPath||job.root+'/'+template.file);if(!file.exists)throw new Error('ملف قالب الكتابة غير متاح. حدّث القوالب وأعد المحاولة.');
   source=app.open(file);if(!source||source===target)throw new Error('تعذّر فتح نسخة مستقلة من القالب.');
   var sourceId=documentId(source);if(sourceId===data.id)throw new Error('تعذّر فتح نسخة مستقلة من القالب.');for(i=0;i<existing.length;i++)if(existing[i]===sourceId)throw new Error('قالب الكتابة مفتوح بالفعل. اقفله الأول ثم جرّب الإضافة.');owned=true;
   stage='قراءة لايرات القالب';
   // Capture original layers before changing text: Photoshop may auto-rename type layers.
   // Keep references for both fields before editing either, even if their new names collide.
   var records=[],textLayers=[];
   for(i=0;i<template.visibleNames.length;i++){var layer=byName(source.layers,template.visibleNames[i]);if(!layer||!layer.visible)throw new Error('تعذّر العثور على لاير القالب الظاهر: '+template.visibleNames[i]);records.push({layer:layer,clipped:layer.typename==='LayerSet'?null:layer.grouped});}
   for(i=0;i<template.fields.length;i++){var textLayer=byName(source.layers,template.fields[i].layerName);if(!textLayer||textLayer.kind!==LayerKind.TEXT)throw new Error('لاير النص الأصلي غير موجود في القالب: '+template.fields[i].layerName);textLayers.push(textLayer);}
   stage='تحديث النصوص';
   source.resizeImage(undefined,undefined,target.resolution,ResampleMethod.NONE);
   for(i=0;i<template.fields.length;i++)replace(template.fields[i],valid.texts[i],fonts.selected[i],textLayers[i]);
   stage='تجميع لايرات الكتابة';
   // Bottom-to-top insertion preserves stacking; restore only changed clipping relationships.
   var group=source.layerSets.add();group.name=name;
   for(i=records.length-1;i>=0;i--)records[i].layer.move(group,ElementPlacement.INSIDE);
   for(i=records.length-1;i>=0;i--){
    var record=records[i];
    if(record.clipped===null)continue;
    // Photoshop treats assigning false as Release Clipping Mask, even if already false.
    // Do not issue a no-op release, and explicitly activate the layer being changed.
    if(record.layer.grouped!==record.clipped){source.activeLayer=record.layer;record.layer.grouped=record.clipped;}
    if(record.layer.grouped!==record.clipped)throw new Error('تعذّر استعادة ربط لايرات القالب. لم تُضف كتابة إلى مشروعك.');
   }
   stage='ضبط حجم الكتابة ومكانها';
   mask(group,template.bounds,source);
   var composite=new ActionReference();composite.putEnumerated(charIDToTypeID('Chnl'),charIDToTypeID('Chnl'),charIDToTypeID('RGB '));var selectComposite=new ActionDescriptor();selectComposite.putReference(charIDToTypeID('null'),composite);executeAction(charIDToTypeID('slct'),selectComposite,DialogModes.NO);
   var before=frameBounds(group);group.resize(plan.scale*100,plan.scale*100,AnchorPosition.MIDDLECENTER);var after=frameBounds(group);
   // Track the editable mask by the group's affine transform; selections clip at source-canvas edges.
   var left=after[0]+(template.bounds[0]-before[0])*plan.scale,top=after[1]+(template.bounds[1]-before[1])*plan.scale;
   group.translate(new UnitValue(plan.x-left,'px'),new UnitValue(plan.y-top,'px'));
   stage='نقل الكتابة إلى مشروعك';
   // Use a unique target name so a legacy duplicate() with no return value can be resolved safely.
   var originalName=group.name,suffix=0;while(byName(target.layers,group.name)){suffix++;group.name=originalName+' · '+suffix;}
   copy=group.duplicate(target,ElementPlacement.PLACEATBEGINNING);app.activeDocument=target;
   if(!copy)copy=byName(target.layers,group.name);
   if(!copy||!copy.layers||!copy.layers.length)throw new Error('تعذّر تأكيد وجود مجموعة الكتابة في لايرات المشروع.');
   target.activeLayer=copy;lastResult={name:template.label,fonts:fonts.selected,missingFonts:fonts.missing,document:data};
  }catch(e){var detail='QAYEM 1.24.52 · '+stage+': '+String(e.message||e);if(copy){try{app.activeDocument=target;copy.remove();}catch(cleanup){throw new Error(detail+'\nتعذّر إزالة المجموعة غير المكتملة؛ راجع لايرات QAYEM أو استخدم Undo.');}}throw new Error(detail);}
  finally{
   var cleanupError=null;
   if(owned&&source){try{source.close(SaveOptions.DONOTSAVECHANGES);}catch(e){cleanupError=new Error('تعذّر قفل نسخة القالب المؤقتة. اقفلها بدون حفظ؛ راجع مجموعة QAYEM في مشروعك.');}}
   try{app.activeDocument=target;}catch(ignored){}
   app.displayDialogs=previousDialogs;app.preferences.rulerUnits=previousUnits;
   if(cleanupError)throw cleanupError;
  }
 }
 function remoteTemplate(t){
  if(!t||!/^tx[a-f0-9]{32}$/.test(t.id)||!/^[a-f0-9]{64}$/.test(t.sha256)||typeof t.label!=='string'||t.label.length>120)throw new Error('بيانات القالب غير صالحة.');
  var expected=new File(Folder.userData.fsName+'/QAYEM/AssetCache/text/'+t.sha256+'.psd'),received=new File(t.localPath||'');
  if(expected.fsName!==received.fsName||!received.exists)throw new Error('مسار قالب الكتابة غير صالح.');
  function box(b){if(!b||b.length!==4)return false;for(var n=0;n<4;n++)if(typeof b[n]!=='number'||!isFinite(b[n])||Math.abs(b[n])>50000)return false;return b[2]>b[0]&&b[3]>b[1];}
  if(!box(t.bounds)||!t.fields||t.fields.length<1||t.fields.length>2||!t.visibleNames||t.visibleNames.length<1||t.visibleNames.length>300)throw new Error('بيانات لايرات القالب غير صالحة.');
  for(var i=0;i<t.visibleNames.length;i++)if(typeof t.visibleNames[i]!=='string'||!t.visibleNames[i]||t.visibleNames[i].length>200)throw new Error('اسم لاير القالب غير صالح.');
  for(i=0;i<t.fields.length;i++){var f=t.fields[i];if(!f||typeof f.layerName!=='string'||!f.layerName||f.layerName.length>200||typeof f.font!=='string'||f.font.length>200||!box(f.bounds))throw new Error('لاير الكتابة غير صالح.');}
  return {id:t.id,label:t.label,localPath:received.fsName,bounds:t.bounds,visibleNames:t.visibleNames,fields:t.fields};
 }
 function inspectPSD(root,encoded){
  try{
   load(root);
   var path=decodeURIComponent(encoded);
   var file=new File(path);
   if(!file.exists)throw new Error('ملف الـ PSD غير موجود على الجهاز: '+path);
   var prevDialogs=app.displayDialogs;
   app.displayDialogs=DialogModes.NO;
   var doc=app.open(file);
   if(!doc)throw new Error('تعذّر فتح ملف الـ PSD.');
   var visibleNames=[],fields=[];
   function scan(layers){
    for(var i=0;i<layers.length;i++){
     var layer=layers[i];
     if(layer.visible){
      visibleNames.push(layer.name);
      if(layer.typename==='ArtLayer'&&layer.kind===LayerKind.TEXT){
       try{
        var b=bounds(layer);
        fields.push({layerName:layer.name,defaultText:String(layer.textItem.contents||layer.name),font:String(layer.textItem.font||'ArialMT'),bounds:b});
       }catch(ignored){}
      }
     }
     if(layer.typename==='LayerSet')scan(layer.layers);
    }
   }
   scan(doc.layers);
   var docW=doc.width.as('px'),docH=doc.height.as('px');
   var templateBounds=[0,0,docW,docH];
   doc.close(SaveOptions.DONOTSAVECHANGES);
   app.displayDialogs=prevDialogs;
   if(!fields.length)throw new Error('الملف لا يحتوي على طبقات نصية (Text Layers) قابلة للتعديل.');
   var templateData={id:'custom_'+(new Date().getTime()),label:file.name.replace(/\.psd$/i,''),file:file.fsName,localPath:file.fsName,bounds:templateBounds,visibleNames:visibleNames,fields:fields,custom:true};
   return response(templateData);
  }catch(e){return error(e);}
 }
 function run(root,encoded,mode){
  try{
   load(root);if(job)throw new Error('فيه كتابة بتتضاف حاليًا؛ استنى نهايتها.');if(!app.documents.length)throw new Error('افتح مشروعًا في Photoshop.');
   var request=layout.parse(decodeURIComponent(encoded)),activeCatalog=catalog;
   if(request.customTemplate){
    activeCatalog=[request.customTemplate];
   }else if(request.remoteTemplate){
    var remote=remoteTemplate(request.remoteTemplate);if(request.templateId!==remote.id)throw new Error('القالب لا يطابق الاختيار.');activeCatalog=[remote];
   }
   var valid=layout.validate(request,activeCatalog),target=app.activeDocument,data=info(target);
   if(mode!=='active-document'&&request.followActiveDocument!==true&&(Number(request.documentId)!==data.id||Number(request.documentWidth)!==data.width||Number(request.documentHeight)!==data.height))throw new Error('المشروع المفتوح أو مقاسه اتغير. اضغط إضافة الكتابة مرة تانية.');
   if(mode==='active-document'||request.followActiveDocument===true){
    request.documentId=data.id;request.documentWidth=data.width;request.documentHeight=data.height;
    request.manualPlacement=true;request.position=request.alignment||'center';
    var wp=data.height/data.width>1.05?85:65;
    if(request.socialRatio==='1:1')wp=78;
    else if(request.socialRatio==='4:5')wp=84;
    else if(request.socialRatio==='9:16')wp=90;
    else if(request.socialRatio==='16:9')wp=65;
    request.widthPercent=wp;request.marginPercent=4;request.offsetX=0;request.offsetY=0;
   }
   data.fonts=installedFonts(true);
   layout.plan(data.width,data.height,valid.template.bounds,request);layout.fonts(valid.template,request.fontMode,data.fonts);
   job={root:root,request:request,valid:valid,target:target};lastResult=null;
   perform();
   if(!lastResult)throw new Error('تعذّر تأكيد اكتمال إضافة الكتابة.');return response(lastResult);
  }catch(e){return error(e);}finally{job=null;}
 }
 function runActive(root,encoded){return run(root,encoded,'active-document');}
 return {documentInfo:documentInfo,run:run,runActive:runActive,inspectPSD:inspectPSD,_perform:perform,_version:"1.24.52"};
})();

// Explicit result for caller-local $.evalFile scopes; no global callback is required.
QayemCEPText;

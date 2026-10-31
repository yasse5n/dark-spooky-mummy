var QayemCEPOverlays=(function(){
 var json,job,result;
 function info(){if(!app.documents.length)throw new Error('افتح مشروعًا في Photoshop الأول.');var d=app.activeDocument;return {id:d.id,name:d.name,width:d.width.as('px'),height:d.height.as('px')};}
 function sameLayer(a,b){return a===b||typeof a.id==='number'&&a.id===b.id;}
 function perform(){var d=job.doc,r=job.request,oldUnits=app.preferences.rulerUnits,oldDialogs=app.displayDialogs,oldLayer=d.activeLayer,oldChannels=d.activeChannels,saved=null,hadSelection=false,layer=null;
  try{
   app.preferences.rulerUnits=Units.PIXELS;app.displayDialogs=DialogModes.NO;
   try{d.selection.bounds;hadSelection=true;}catch(ignored){}
   if(hadSelection){saved=d.channels.add();saved.name='QAYEM Overlay selection '+new Date().getTime();d.selection.store(saved);d.selection.deselect();}d.activeChannels=d.componentChannels;
   var desc=new ActionDescriptor();desc.putPath(charIDToTypeID('null'),new File(r.path));desc.putEnumerated(charIDToTypeID('FTcs'),charIDToTypeID('QCSt'),charIDToTypeID('Qcsa'));executeAction(charIDToTypeID('Plc '),desc,DialogModes.NO);
   if(sameLayer(d.activeLayer,oldLayer))throw new Error('تعذّر تأكيد إضافة الخامة.');layer=d.activeLayer;layer.name='QAYEM · '+(r.name||'خامة');
   var b=layer.bounds,w=b[2].as('px')-b[0].as('px'),h=b[3].as('px')-b[1].as('px');if(w<=0||h<=0)throw new Error('الخامة لا تحتوي على مساحة مرئية.');var scale=(r.fit==='contain'?Math.min(job.width/w,job.height/h):Math.max(job.width/w,job.height/h))*100;
   layer.resize(scale,scale,AnchorPosition.MIDDLECENTER);b=layer.bounds;layer.translate(new UnitValue(job.width/2-(b[0].as('px')+b[2].as('px'))/2,'px'),new UnitValue(job.height/2-(b[1].as('px')+b[3].as('px'))/2,'px'));
   var blends={normal:BlendMode.NORMAL,screen:BlendMode.SCREEN,overlay:BlendMode.OVERLAY,softlight:BlendMode.SOFTLIGHT,multiply:BlendMode.MULTIPLY,color:BlendMode.COLORBLEND};if(blends[r.blend])layer.blendMode=blends[r.blend];layer.opacity=r.opacity||100;result={name:layer.name,documentId:d.id};
  }catch(e){if(!layer&&!sameLayer(d.activeLayer,oldLayer))layer=d.activeLayer;if(layer)try{layer.remove();layer=null;}catch(ignored){}throw e;}
  finally{if(saved)try{d.selection.load(saved,SelectionType.REPLACE);}catch(ignored){}else if(!hadSelection)try{d.selection.deselect();}catch(ignored){}if(saved)try{saved.remove();}catch(ignored){}try{d.activeChannels=oldChannels;}catch(ignored){}if(!layer)try{d.activeLayer=oldLayer;}catch(ignored){}app.preferences.rulerUnits=oldUnits;app.displayDialogs=oldDialogs;}
 }
 function performLUT(){
  var d=job.doc,r=job.request,oldDialogs=app.displayDialogs;
  try{
   app.displayDialogs=DialogModes.NO;
   var desc=new ActionDescriptor(),ref=new ActionReference();
   ref.putClass(charIDToTypeID('AdjL'));desc.putReference(charIDToTypeID('null'),ref);
   var layerDesc=new ActionDescriptor(),gradMapDesc=new ActionDescriptor(),gradDesc=new ActionDescriptor();
   layerDesc.putString(charIDToTypeID('Nm  '),'QAYEM LUT · '+(r.name||'سينمائي'));
   gradDesc.putString(charIDToTypeID('Nm  '),r.name||'QayemLUT');
   gradDesc.putEnumerated(charIDToTypeID('GrdF'),charIDToTypeID('GrdF'),charIDToTypeID('CstS'));
   gradDesc.putDouble(charIDToTypeID('Intr'),4096.0);
   var colorList=new ActionList();
   var stops=r.stops||[{pos:0,r:0,g:0,b:0},{pos:100,r:255,g:255,b:255}];
   for(var i=0;i<stops.length;i++){
    var s=stops[i],stopDesc=new ActionDescriptor(),colorDesc=new ActionDescriptor();
    colorDesc.putDouble(charIDToTypeID('Rd  '),s.r);
    colorDesc.putDouble(charIDToTypeID('Grn '),s.g);
    colorDesc.putDouble(charIDToTypeID('Bl  '),s.b);
    stopDesc.putObject(charIDToTypeID('Clr '),charIDToTypeID('RGBC'),colorDesc);
    stopDesc.putEnumerated(charIDToTypeID('Type'),charIDToTypeID('Clry'),charIDToTypeID('UsrS'));
    stopDesc.putInteger(charIDToTypeID('Lctn'),Math.round(s.pos*40.96));
    stopDesc.putInteger(charIDToTypeID('Mdpn'),50);
    colorList.putObject(charIDToTypeID('Clrt'),stopDesc);
   }
   gradDesc.putList(charIDToTypeID('Clrs'),colorList);
   var transList=new ActionList(),trans0=new ActionDescriptor(),trans1=new ActionDescriptor();
   trans0.putUnitDouble(charIDToTypeID('Opct'),charIDToTypeID('#Prc'),100);trans0.putInteger(charIDToTypeID('Lctn'),0);trans0.putInteger(charIDToTypeID('Mdpn'),50);transList.putObject(charIDToTypeID('TrnS'),trans0);
   trans1.putUnitDouble(charIDToTypeID('Opct'),charIDToTypeID('#Prc'),100);trans1.putInteger(charIDToTypeID('Lctn'),4096);trans1.putInteger(charIDToTypeID('Mdpn'),50);transList.putObject(charIDToTypeID('TrnS'),trans1);
   gradDesc.putList(charIDToTypeID('Trns'),transList);
   gradMapDesc.putObject(charIDToTypeID('Grad'),charIDToTypeID('Grdn'),gradDesc);
   layerDesc.putObject(charIDToTypeID('Type'),charIDToTypeID('GdMp'),gradMapDesc);
   desc.putObject(charIDToTypeID('Usng'),charIDToTypeID('AdjL'),layerDesc);
   executeAction(charIDToTypeID('Mk  '),desc,DialogModes.NO);
   var layer=d.activeLayer,blends={normal:BlendMode.NORMAL,screen:BlendMode.SCREEN,overlay:BlendMode.OVERLAY,softlight:BlendMode.SOFTLIGHT,multiply:BlendMode.MULTIPLY,color:BlendMode.COLORBLEND};
   if(r.blend&&blends[r.blend])layer.blendMode=blends[r.blend];
   if(typeof r.opacity==='number'&&isFinite(r.opacity))layer.opacity=r.opacity;
   result={name:layer.name,documentId:d.id};
  }finally{app.displayDialogs=oldDialogs;}
 }
 function call(root,method,encoded){
  try{
   json=$.evalFile(new File(root+'/text-layout.js'));
   var r=json.parse(decodeURIComponent(encoded||'%7B%7D')),dinfo=info();
   if(method==='info')return 'OK|'+encodeURIComponent(json.stringify(dinfo));
   var d=app.activeDocument;
   if(d.mode===DocumentMode.BITMAP||d.mode===DocumentMode.INDEXEDCOLOR||d.mode===DocumentMode.MULTICHANNEL||d.mode===DocumentMode.DUOTONE)throw new Error('حوّل المشروع إلى RGB أو CMYK أو Grayscale الأول.');
   if(method==='lut'){
    job={doc:d,request:r,width:dinfo.width,height:dinfo.height};result=null;
    d.suspendHistory('QAYEM · تلوين سينمائي (LUT)','$.global.QayemCEPOverlays.performLUT()');
    if(!result)throw new Error('تعذّر تطبيق الفلتر السينمائي.');
    return 'OK|'+encodeURIComponent(json.stringify(result));
   }
   if(method!=='apply')throw new Error('أمر غير معروف.');
   var fileName=String(r.path||'').replace(/\\/g,'/').split('/').pop();
   var ext=(fileName.split('.').pop()||'').toLowerCase();
   if(!/^(png|jpg|jpeg|webp)$/.test(ext)||!new File(r.path).exists)throw new Error('ملف الخامة ناقص أو غير صالح.');
   if(!/^(normal|screen|softlight|overlay|multiply|color)$/.test(r.blend)||!isFinite(r.opacity)||r.opacity<1||r.opacity>100||!/^(contain|cover)$/.test(r.fit))throw new Error('إعدادات الخامة غير صالحة.');
   job={doc:d,request:r,width:dinfo.width,height:dinfo.height};result=null;
   d.suspendHistory('QAYEM · إضافة خامة أو صورة','$.global.QayemCEPOverlays.perform()');
   if(!result)throw new Error('تعذّر تأكيد إضافة الخامة.');
   return 'OK|'+encodeURIComponent(json.stringify(result));
  }catch(e){return 'ERR|'+encodeURIComponent(String(e.message||e));}
  finally{job=null;}
 }
 return {call:call,perform:perform,performLUT:performLUT};
})();
QayemCEPOverlays;

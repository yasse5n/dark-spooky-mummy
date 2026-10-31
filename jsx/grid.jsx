var QayemCEPGrid=(function(){
 var geometry,json,job,result;
 function load(root){geometry=$.evalFile(new File(root+'/grid-layout.js'));json=$.evalFile(new File(root+'/text-layout.js'));if(!geometry||!json)throw new Error('ملفات أداة Grid ناقصة. حدّث البلاجن.');}
 function response(v){return 'OK|'+encodeURIComponent(json.stringify(v));}
 function error(e){return 'ERR|'+encodeURIComponent(String(e.message||e));}
 function documentInfo(){
  if(!app.documents.length)throw new Error('افتح مشروعًا في Photoshop ثم اضغط تحديث المشروع.');
  var d=app.activeDocument,selection=null;
  try{var b=d.selection.bounds;selection=[b[0].as('px'),b[1].as('px'),b[2].as('px'),b[3].as('px')];}catch(ignored){}
  return {id:d.id,name:d.name,width:d.width.as('px'),height:d.height.as('px'),selection:selection};
 }
 function matching(request){var info=documentInfo();if(info.id!==request.documentId||info.width!==request.documentWidth||info.height!==request.documentHeight)throw new Error('المشروع المفتوح أو مقاسه اتغيّر. اضغط تحديث المشروع الأول.');return info;}
 function perform(){
  var d=job.doc,p=job.plan,request=job.request,oldUnits=app.preferences.rulerUnits,oldDialogs=app.displayDialogs,oldLayer=d.activeLayer,oldChannels=d.activeChannels;
  var saved=null,path=null,layer=null,createdGuides=[],hadSelection=false;
  try{
   app.preferences.rulerUnits=Units.PIXELS;app.displayDialogs=DialogModes.NO;
   // Keep the customer's selection and channels, including for diagonal grids.
   if(p.output==='layer'){
    try{d.selection.bounds;hadSelection=true;}catch(ignored){}
    // PathPointInfo uses document points. A pixel is 72/resolution points;
    // passing raw pixel values enlarged/clipped grids on non-72-PPI documents.
    // Set the path unit explicitly; never change the document's resolution.
    var pixelToPoint=72/Number(d.resolution);
    if(!isFinite(pixelToPoint)||pixelToPoint<=0)throw new Error('تعذّر قراءة دقة المشروع. افتح المشروع واضغط تحديث المشروع.');
    app.preferences.rulerUnits=Units.POINTS;
    if(hadSelection){saved=d.channels.add();saved.name='QAYEM Grid selection '+new Date().getTime();d.selection.store(saved);d.activeChannels=oldChannels;}
    layer=d.artLayers.add();layer.name='QAYEM Grid · '+p.type+' · '+new Date().getTime();layer.opacity=p.opacity;
    d.activeChannels=d.componentChannels;
    var paths=[];
    for(var i=0;i<p.lines.length;i++){
     var l=p.lines[i],dx=l[2]-l[0],dy=l[3]-l[1],len=Math.sqrt(dx*dx+dy*dy),nx=-dy/len*p.thickness/2,ny=dx/len*p.thickness/2;
     var points=[[l[0]+nx,l[1]+ny],[l[2]+nx,l[3]+ny],[l[2]-nx,l[3]-ny],[l[0]-nx,l[1]-ny]],pp=[];
     for(var j=0;j<4;j++){var point=new PathPointInfo(),at=[points[j][0]*pixelToPoint,points[j][1]*pixelToPoint];point.kind=PointKind.CORNERPOINT;point.anchor=at;point.leftDirection=at;point.rightDirection=at;pp.push(point);}
     var sp=new SubPathInfo();sp.closed=true;sp.operation=ShapeOperation.SHAPEADD;sp.entireSubPath=pp;paths.push(sp);
    }
    path=d.pathItems.add('QAYEM Grid temporary '+new Date().getTime(),paths);path.makeSelection(0,false,SelectionType.REPLACE);
    var color=new SolidColor();color.rgb.hexValue=p.color.slice(1);d.selection.fill(color,ColorBlendMode.NORMAL,100,false);
   }else{
    for(var k=0;k<p.lines.length;k++){var line=p.lines[k];createdGuides.push(d.guides.add(line[0]===line[2]?Direction.VERTICAL:Direction.HORIZONTAL,new UnitValue(line[0]===line[2]?line[0]:line[1],'px')));}
   }
   // Remove old guides only after creation succeeds; never clears existing artwork.
   if(request.clearGuides===true)for(var q=job.oldGuides.length-1;q>=0;q--)job.oldGuides[q].remove();
   result={count:p.lines.length,output:p.output,name:layer?layer.name:'Guides'};
  }catch(e){if(layer)try{layer.remove();layer=null;}catch(ignored){}for(var z=createdGuides.length-1;z>=0;z--)try{createdGuides[z].remove();}catch(ignored){}throw e;}
  finally{
   if(path)try{path.remove();}catch(ignored){}
   if(p.output==='layer'){if(saved)try{d.selection.load(saved,SelectionType.REPLACE);}catch(ignored){}else if(!hadSelection)try{d.selection.deselect();}catch(ignored){}if(saved)try{saved.remove();}catch(ignored){}}
   try{d.activeChannels=oldChannels;}catch(ignored){}
   if(!layer)try{d.activeLayer=oldLayer;}catch(ignored){}
   app.preferences.rulerUnits=oldUnits;app.displayDialogs=oldDialogs;
  }
 }
 function removeGridLayers(layers){var count=0;for(var i=layers.length-1;i>=0;i--){if(layers[i].typename==='LayerSet')count+=removeGridLayers(layers[i].layers);else if(/^QAYEM Grid · /.test(layers[i].name)){layers[i].remove();count++;}}return count;}
 function call(root,method,encoded){
  try{
   load(root);var request=json.parse(decodeURIComponent(encoded||'%7B%7D'));
   if(method==='info')return response(documentInfo());
   if(method==='create'){
    var width=Number(request.width),height=Number(request.height);
    if(width%1||height%1||width<64||height<64||width>16000||height>16000)throw new Error('أبعاد المشروع تكون أعدادًا صحيحة من 64 إلى 16000 بكسل.');
    app.documents.add(new UnitValue(width,'px'),new UnitValue(height,'px'),72,'QAYEM '+width+' × '+height,NewDocumentMode.RGB,DocumentFill.WHITE);
    return response(documentInfo());
   }
   var info=matching(request),d=app.activeDocument;
   if(method==='apply'){
    if(d.mode===DocumentMode.BITMAP||d.mode===DocumentMode.INDEXEDCOLOR||d.mode===DocumentMode.MULTICHANNEL||d.mode===DocumentMode.DUOTONE)throw new Error('حوّل المشروع إلى RGB أو CMYK أو Grayscale الأول.');
    var area=request.fit==='selection'?info.selection:null;if(area&&json.stringify(area)!==json.stringify(request.selectionBounds))throw new Error('التحديد اتغيّر. اضغط تحديث المشروع الأول.');if(request.fit==='selection'&&!area)throw new Error('مفيش تحديد نشط؛ اعمل تحديد أو اختار مساحة المشروع بالكامل.');
    var plan=geometry.plan(info.width,info.height,request,area),oldGuides=[];for(var g=0;g<d.guides.length;g++)oldGuides.push(d.guides[g]);
    job={doc:d,plan:plan,request:request,oldGuides:oldGuides};result=null;
    d.suspendHistory('QAYEM · إنشاء Grid','$.global.QayemCEPGrid.perform()');if(!result)throw new Error('تعذّر تأكيد إضافة الشبكة.');return response(result);
   }
   if(method==='clearGuides'){for(var i=d.guides.length-1;i>=0;i--)d.guides[i].remove();return response({cleared:true});}
   if(method==='clearLayers')return response({count:removeGridLayers(d.layers)});
   throw new Error('أمر Grid غير معروف');
  }catch(e){return error(e);}finally{job=null;}
 }
 return {call:call,perform:perform};
})();
QayemCEPGrid;

var QayemStudioTools=(function(root){
 'use strict';
 var doc=null,gridBusy=false,imageBusy=false,imageData='',imageSeq=0,imageOwner='',gridSeq=0,gridPalette=null,pendingImage=null,lastImageSignature='',lastImagePrompt='';
 var NS='http://www.w3.org/2000/svg';
 function $(id){return document.getElementById(id);}
 function hidden(el,value){if(el){el.hidden=!!value;el.style.display=value?'none':'';}}
 function status(id,text,error){var n=$(id);if(n){n.textContent=text||'';n.classList.toggle('is-error',!!error);}}
 function controls(view,busy){var nodes=$(view).querySelectorAll('button,input,select,textarea');for(var i=0;i<nodes.length;i++){if(busy){nodes[i].setAttribute('data-q-disabled',nodes[i].disabled?'1':'0');nodes[i].disabled=true;}else{nodes[i].disabled=nodes[i].getAttribute('data-q-disabled')==='1';nodes[i].removeAttribute('data-q-disabled');}}}
 function entitled(action){return Promise.resolve(true);}
 function host(method,request){return new Promise(function(resolve,reject){
  if(!root.__adobe_cep__||typeof root.__adobe_cep__.evalScript!=='function'){reject(new Error('أداة Grid بتشتغل من داخل Photoshop.'));return;}
  function literal(v){return JSON.stringify(v).replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');}
  var base;
  try{base=decodeURI(root.__adobe_cep__.getSystemPath('extension')).replace(/^file:\/\//,'').replace(/^\/([A-Za-z]:\/)/,'$1').replace(/\\/g,'/').replace(/\/$/,'');}catch(e){reject(e);return;}
  var script='(function(){try{var api=$.evalFile(new File('+literal(base+'/jsx/grid.jsx')+'));$.global.QayemCEPGrid=api;return api.call('+literal(base)+','+literal(method)+','+literal(encodeURIComponent(JSON.stringify(request||{})))+');}catch(e){return "ERR|"+encodeURIComponent(String(e.message||e));}})();';
  try{root.__adobe_cep__.evalScript(script,function(value){try{if(typeof value!=='string'||value.indexOf('OK|')!==0)throw new Error(value&&value.indexOf('ERR|')===0?decodeURIComponent(value.slice(4)):'تعذّر تنفيذ الأمر في Photoshop.');resolve(JSON.parse(decodeURIComponent(value.slice(3))));}catch(e){reject(e);}});}catch(e){reject(e);}
 });}
 function options(){return {type:$('qGridType').value,fit:$('qGridFit').value,output:$('qGridOutput').value,margin:Number($('qGridMargin').value),gutter:Number($('qGridGutter').value),columns:Number($('qGridColumns').value),rows:Number($('qGridRows').value),ratios:$('qGridRatios').value,color:$('qGridColor').value,opacity:Number($('qGridOpacity').value),thickness:Number($('qGridThickness').value),border:$('qGridBorder').checked,clearGuides:$('qGridClearFirst').checked};}
 function lineNode(svg,coords,color,width,opacity){var line=document.createElementNS(NS,'line');['x1','y1','x2','y2'].forEach(function(key,i){line.setAttribute(key,coords[i]);});line.setAttribute('stroke',color);line.setAttribute('stroke-width',width);line.setAttribute('opacity',opacity);svg.appendChild(line);}
 function draw(svg,plan,thumb){while(svg.firstChild)svg.removeChild(svg.firstChild);svg.setAttribute('viewBox','0 0 '+plan.width+' '+plan.height);plan.lines.forEach(function(line){lineNode(svg,line,plan.color,thumb?18:Math.max(plan.thickness,plan.width/450),plan.opacity/100);});}
 function preview(){
  var o=options(),c=o.type==='columns'||o.type==='modular',hier=o.type==='hierarchy';
  hidden($('qGridColumnsWrap'),!c);hidden($('qGridRowsWrap'),o.type!=='modular');hidden($('qGridRatiosWrap'),!hier);hidden($('qGridGutterWrap'),!c&&!hier);hidden($('qGridGuideNote'),o.output!=='guides');
  var buttons=$('qGridTypes').querySelectorAll('button');for(var i=0;i<buttons.length;i++)buttons[i].setAttribute('aria-pressed',String(buttons[i].getAttribute('data-grid-type')===o.type));
  try{
   var w=doc?doc.width:1080,h=doc?doc.height:1350,area=o.fit==='selection'&&doc?doc.selection:null;
   if(o.fit==='selection'&&!area)throw new Error('اعمل تحديد داخل Photoshop واضغط تحديث المشروع.');
   var p=QayemGridLayout.plan(w,h,o,area);draw($('qGridPreview'),p,false);
   var ratio=w/h,sw=ratio>1?225:Math.min(180,180*ratio),sh=sw/ratio;
   $('qGridPreview').style.width=sw+'px';$('qGridPreview').style.height=sh+'px';
   if(!gridBusy)status('qGridStatus',doc?'المعاينة جاهزة. اضغط إضافة الشبكة للتصميم.':'معاينة توضيحية؛ افتح مشروعًا ثم اضغط تحديث المشروع.');
   $('qGridGenerate').disabled=!doc||gridBusy;
  }catch(e){$('qGridGenerate').disabled=true;status('qGridStatus',e.message,true);}
 }
 function setDoc(info){doc=info;$('qGridDocument').textContent=info.name+' · '+info.width+' × '+info.height+' px';preview();}
 function refresh(){if(gridBusy)return;var seq=++gridSeq;status('qGridStatus','جاري قراءة المشروع…');host('info').then(function(info){if(seq===gridSeq)setDoc(info);}).catch(function(e){if(seq!==gridSeq)return;doc=null;$('qGridDocument').textContent='مفيش مشروع متاح للمعاينة';preview();status('qGridStatus',e.message,true);});}
 function gridAction(method){
  if(gridBusy)return;
  var request=method==='create'?{width:Number($('qGridWidth').value),height:Number($('qGridHeight').value)}:options();
  if(method!=='create'){
   if(!doc){status('qGridStatus','اضغط تحديث المشروع الأول.',true);return;}
   request.documentId=doc.id;request.documentWidth=doc.width;request.documentHeight=doc.height;request.selectionBounds=doc.selection;
   if(method==='apply')try{QayemGridLayout.plan(doc.width,doc.height,request,request.fit==='selection'?doc.selection:null);}catch(e){status('qGridStatus',e.message,true);return;}
  }
  if(gridPalette)gridPalette.close();gridBusy=true;controls('gridView',true);status('qGridStatus','جاري التنفيذ…');
  entitled('grid').then(function(){return host(method,request);}).then(function(result){
   if(method==='create')setDoc(result);
   status('qGridStatus',method==='create'?'تم إنشاء المشروع الجديد.':method==='apply'?'تمت إضافة الشبكة '+(result.output==='guides'?'كأدلة Guides.':'على لاير مستقل. احذف أو اخفِ اللاير قبل تصدير التصميم.'):method==='clearLayers'?'تمت إزالة '+result.count+' من لايرات QAYEM Grid.':'تم مسح أدلة المشروع.');
  }).catch(function(e){status('qGridStatus',e.message,true);}).then(function(){gridBusy=false;controls('gridView',false);$('qGridGenerate').disabled=!doc;});
 }
 function setupGrid(){
  var select=$('qGridType');for(var i=0;i<select.options.length;i++){
   var opt=select.options[i],button=document.createElement('button'),svg=document.createElementNS(NS,'svg'),text=document.createElement('span');button.type='button';button.setAttribute('data-grid-type',opt.value);button.setAttribute('aria-pressed',String(i===0));svg.setAttribute('aria-hidden','true');
   draw(svg,QayemGridLayout.plan(1080,1350,{type:opt.value,margin:80,gutter:45,columns:5,rows:4,ratios:'1:2:1',color:'#ec3154',opacity:100,thickness:2,output:'layer'}),true);
   text.textContent=opt.textContent;button.appendChild(svg);button.appendChild(text);button.onclick=function(){select.value=this.getAttribute('data-grid-type');select.dispatchEvent(new Event('change',{bubbles:true}));};$('qGridTypes').appendChild(button);
  }
  var inputs=$('gridView').querySelectorAll('input,select');for(var j=0;j<inputs.length;j++)inputs[j].addEventListener('change',preview);
  $('qGridRefresh').onclick=refresh;$('qGridGenerate').onclick=function(){gridAction('apply');};$('qGridNewDocument').onclick=function(){gridAction('create');};
  $('qGridClearGuides').onclick=function(){gridAction('clearGuides');};$('qGridClearLayers').onclick=function(){gridAction('clearLayers');};
  $('qGridPreset').addEventListener('change',function(){if(this.value==='custom')return;var size=this.value.split('x');$('qGridWidth').value=size[0];$('qGridHeight').value=size[1];});
  ['qGridWidth','qGridHeight'].forEach(function(id){$(id).addEventListener('change',function(){$('qGridPreset').value='custom';});});if(root.QayemGridColorPicker)gridPalette=QayemGridColorPicker.bind(preview);preview();
 }
 function owner(){var user=root.QayemAuth&&QayemAuth.getUser();return user&&user.id||'';}
 function clearImage(){if(imageBusy)controls('imagePromptView',false);imageSeq++;imageData='';pendingImage=null;lastImageSignature='';lastImagePrompt='';imageBusy=false;imageOwner=owner();$('qImagePreview').removeAttribute('src');hidden($('qImagePreview'),true);$('qImageName').textContent='';$('qImageResult').value='';$('qImageNotes').value='';$('qImageFile').value='';$('qImageAnalyze').disabled=true;$('qImageCopy').disabled=true;hidden($('qImageRecover'),true);status('qImageStatus','');}
 function setImage(data){
  if(!/^data:image\/(png|jpeg|webp);base64,/.test(data.dataUrl))throw new Error('اختار صورة PNG أو JPEG أو WEBP.');
  clearImage();imageData=data.dataUrl;imageOwner=owner();$('qImagePreview').src=imageData;hidden($('qImagePreview'),false);$('qImageName').textContent=data.name;$('qImageAnalyze').disabled=!$('qImageAnalyze').getAttribute('data-cost');
 }
 function pickImage(){
  if(imageBusy)return;if(pendingImage){recoverImage();return;}
  try{
   var fs=root.cep&&root.cep.fs;
   if(fs&&(fs.showOpenDialogEx||fs.showOpenDialog)){
    if(root.QayemLifecycle)QayemLifecycle.persist();
    var result=(fs.showOpenDialogEx||fs.showOpenDialog).call(fs,false,false,'اختيار صورة لتحويلها إلى برومبت','',['png','jpg','jpeg','webp']);
    if(!result||result.err)throw new Error('تعذّر اختيار الصورة. حاول مرة أخرى.');if(!result.data||!result.data.length)return;
    setImage(QayemReceiptPicker.read(result.data[0]));
   }else $('qImageFile').click();
  }catch(e){status('qImageStatus',e.message,true);}
 }
 function imageOptions(){var nodes=document.querySelectorAll('[data-image-aspect]'),aspects=[];for(var i=0;i<nodes.length;i++)if(nodes[i].checked&&!nodes[i].disabled)aspects.push(nodes[i].getAttribute('data-image-aspect'));return {image:imageData,mode:$('qImageMode').value,language:$('qImageLanguage').value,notes:$('qImageNotes').value,aspects:aspects,fidelity:$('qImageFidelity').value,ignoreText:$('qImageIgnoreText').checked,noText:$('qImageNoText').checked};}
 function syncAspects(){var text=$('qImageAspect_typography'),blocked=$('qImageIgnoreText').checked||$('qImageNoText').checked;text.disabled=blocked;if(blocked)text.checked=false;var n=document.querySelectorAll('[data-image-aspect]:checked').length;$('qImageAspectCount').textContent=n+' / 15';$('qImageModeHint').textContent=$('qImageMode').value==='continue'?'اكتب فكرتك الجديدة. الناتج برومبت تعديل لنفس التصميم، والتغييرات المكتوبة لها الأولوية على المرجع.':'هيستخدم العناصر اللي حددتها فقط. التعديلات المكتوبة لها الأولوية عند التعارض.';}
 function imageResult(data){if(root.QayemCredits)QayemCredits.updateWallet(data.wallet);if(data.state==='pending'){hidden($('qImageRecover'),false);status('qImageStatus','التحليل لسه شغّال. استعد النتيجة بنفس الطلب بدون خصم جديد.');return;}
  if(data.state==='failed'){pendingImage=null;hidden($('qImageRecover'),true);status('qImageStatus',data.message||'التحليل لم يكتمل؛ لم يُخصم رصيد.',true);return;}
  if(!data.prompt){pendingImage=null;hidden($('qImageRecover'),true);status('qImageStatus',data.resultExpired?'انتهت مدة حفظ النتيجة (24 ساعة). لم يُخصم رصيد جديد.':'الخدمة لم ترجع برومبت صالحًا.',true);return;}
  lastImageSignature=pendingImage&&pendingImage.signature||'';lastImagePrompt=data.prompt;pendingImage=null;hidden($('qImageRecover'),true);$('qImageResult').value=data.prompt;$('qImageCopy').disabled=false;$('qImageCopy').setAttribute('data-q-disabled','0');status('qImageStatus','البرومبت جاهز. تم خصم '+(data.charged||0)+' كريدتس لهذا الطلب مرة واحدة.');
 }
 function recoverImage(){if(imageBusy||!pendingImage)return;var seq=imageSeq,who=owner();imageBusy=true;controls('imagePromptView',true);status('qImageStatus','جاري التحقق من نتيجة الطلب السابق…');QayemAuth.api('GET','/api/image-prompts/requests/'+encodeURIComponent(pendingImage.id)).then(function(data){if(seq===imageSeq&&owner()===who)imageResult(data);}).catch(function(e){if(seq!==imageSeq||owner()!==who)return;if(e.status===404){pendingImage=null;hidden($('qImageRecover'),true);status('qImageStatus','الطلب لم يصل للسيرفر؛ تقدر تحاول التحليل من جديد.',true);}else status('qImageStatus',e.message+' — استعد النتيجة قبل بدء طلب جديد.',true);}).then(function(){if(seq!==imageSeq||owner()!==who)return;imageBusy=false;controls('imagePromptView',false);syncAspects();$('qImageAnalyze').disabled=!imageData;$('qImageCopy').disabled=!$('qImageResult').value;});}
 function analyze(){
  if(imageBusy||!imageData)return;if(!$('qImageAnalyze').getAttribute('data-cost')){status('qImageStatus','انتظر تحميل الرصيد وتكلفة التحليل قبل التنفيذ.',true);return;}if(pendingImage){recoverImage();return;}
  var seq=++imageSeq,who=owner(),body=imageOptions(),signature=JSON.stringify(body);
  if(body.mode==='continue'&&!body.notes.trim()){status('qImageStatus','اكتب فكرتك الجديدة لاستكمال التصميم.',true);return;}
  if(!body.aspects.length&&!body.notes.trim()){status('qImageStatus','حدد عنصرًا واحدًا على الأقل أو اكتب فكرتك.',true);return;}
  if(signature===lastImageSignature&&lastImagePrompt){$('qImageResult').value=lastImagePrompt;status('qImageStatus','دي نتيجة نفس الاختيارات السابقة؛ لم يُخصم رصيد جديد.');return;}
  var cost=$('qImageAnalyze').getAttribute('data-cost');body.expectedCost=Number(cost);body.requestId=root.QayemCredits?QayemCredits.requestId():'img_'+Date.now()+'_'+Math.random().toString(36).slice(2);pendingImage={id:body.requestId,signature:signature};
  imageBusy=true;controls('imagePromptView',true);$('qImageResult').value='';status('qImageStatus','جاري تحليل العناصر المختارة ودمجها مع فكرتك… التكلفة '+cost+' كريدتس بعد النجاح فقط.');
  QayemAuth.api('POST','/api/image-prompts/analyze',body,70000).then(function(data){if(seq===imageSeq&&owner()===who)imageResult(data);}).catch(function(e){if(seq!==imageSeq||owner()!==who)return;
    if(e.status&&e.status!==409||e.data&&e.data.reason==='cost_changed'){if(e.data&&e.data.wallet&&root.QayemCredits)QayemCredits.updateWallet(e.data.wallet);pendingImage=null;hidden($('qImageRecover'),true);status('qImageStatus',e.message,true);}else{hidden($('qImageRecover'),false);status('qImageStatus',e.message+' — اضغط استعادة النتيجة للتحقق من نفس الطلب بدون خصم جديد.',true);}
  }).then(function(){if(seq!==imageSeq||owner()!==who)return;imageBusy=false;controls('imagePromptView',false);syncAspects();$('qImageAnalyze').disabled=!imageData;$('qImageCopy').disabled=!$('qImageResult').value;});
 }
 function setupImage(){
  $('qImagePick').onclick=pickImage;$('qImageClear').onclick=function(){if(imageBusy)return;if(pendingImage){recoverImage();return;}clearImage();};$('qImageAnalyze').onclick=analyze;$('qImageRecover').onclick=recoverImage;
  $('qImageSelectAll').onclick=function(){var nodes=document.querySelectorAll('[data-image-aspect]');for(var i=0;i<nodes.length;i++)nodes[i].checked=!nodes[i].disabled;syncAspects();};$('qImageSelectNone').onclick=function(){var nodes=document.querySelectorAll('[data-image-aspect]');for(var i=0;i<nodes.length;i++)nodes[i].checked=false;syncAspects();};
  var checks=document.querySelectorAll('[data-image-aspect],#qImageIgnoreText,#qImageNoText,#qImageMode');for(var k=0;k<checks.length;k++)checks[k].addEventListener('change',syncAspects);syncAspects();
  $('qImageFile').onchange=function(){var file=this.files&&this.files[0];if(!file)return;if(file.size>5*1024*1024){status('qImageStatus','حجم الصورة لازم مايزيدش عن 5 MB.',true);return;}var seq=++imageSeq,reader=new FileReader();reader.onload=function(){if(seq!==imageSeq)return;try{setImage({name:file.name,dataUrl:reader.result});}catch(e){status('qImageStatus',e.message,true);}};reader.onerror=function(){status('qImageStatus','تعذّر قراءة الصورة.',true);};reader.readAsDataURL(file);};
  $('qImageResult').addEventListener('input',function(){$('qImageCopy').disabled=!this.value;});
  $('qImageCopy').onclick=function(){var text=$('qImageResult').value;if(!text)return;writeQayemClipboard(text).then(function(ok){if(ok)status('qImageStatus','تم نسخ البرومبت.');else{$('qImageResult').focus();$('qImageResult').select();status('qImageStatus','البرومبت متحدد. اضغط Ctrl+C أو ⌘C لنسخه.');}}).catch(function(e){status('qImageStatus',e.message,true);});};
  if(typeof MutationObserver==='function')new MutationObserver(function(){if(root.QayemAuth&&!QayemAuth.getToken()||imageOwner&&owner()!==imageOwner)clearImage();}).observe(document.body,{attributes:true,attributeFilter:['class']});
 }
 function setupAiGenerator(){
  var genBtn=$('qAiGenerateDirect');
  if(!genBtn)return;
  if($('qAiKeyFal')&&root.localStorage)$('qAiKeyFal').value=localStorage.getItem('qayem_fal_key')||'';
  if($('qAiKeyOpenai')&&root.localStorage)$('qAiKeyOpenai').value=localStorage.getItem('qayem_openai_key')||'';
  if($('qAiKeyStability')&&root.localStorage)$('qAiKeyStability').value=localStorage.getItem('qayem_stability_key')||'';
  if($('qAiLocalUrl')&&root.localStorage)$('qAiLocalUrl').value=localStorage.getItem('qayem_local_url')||'http://127.0.0.1:8188';

  function saveKeys(){
   if(!root.localStorage)return;
   if($('qAiKeyFal'))localStorage.setItem('qayem_fal_key',$('qAiKeyFal').value.trim());
   if($('qAiKeyOpenai'))localStorage.setItem('qayem_openai_key',$('qAiKeyOpenai').value.trim());
   if($('qAiKeyStability'))localStorage.setItem('qayem_stability_key',$('qAiKeyStability').value.trim());
   if($('qAiLocalUrl'))localStorage.setItem('qayem_local_url',$('qAiLocalUrl').value.trim());
  }
  ['qAiKeyFal','qAiKeyOpenai','qAiKeyStability','qAiLocalUrl'].forEach(function(id){
   if($(id))$(id).addEventListener('change',saveKeys);
  });

  function downloadBuffer(url){
   return new Promise(function(resolve,reject){
    try{
     var reqObj=root.QayemNativeRequire||(typeof require==='function'?require:null);
     if(reqObj){
      var mod=url.indexOf('https:')===0?reqObj('https'):reqObj('http');
      var chunks=[];
      mod.get(url,function(res){
       if(res.statusCode>=300&&res.statusCode<400&&res.headers.location){
        downloadBuffer(res.headers.location).then(resolve).catch(reject);
        return;
       }
       if(res.statusCode!==200){reject(new Error('تعذّر تنزيل الصورة: HTTP '+res.statusCode));return;}
       res.on('data',function(c){chunks.push(c);});
       res.on('end',function(){resolve(reqObj('buffer').Buffer.concat(chunks));});
      }).on('error',reject);
      return;
     }
     fetch(url).then(function(r){return r.arrayBuffer();}).then(function(ab){resolve(new Uint8Array(ab));}).catch(reject);
    }catch(e){reject(e);}
   });
  }

  function postJson(url,headers,bodyObj){
   return new Promise(function(resolve,reject){
    try{
     var bodyStr=JSON.stringify(bodyObj);
     var reqObj=root.QayemNativeRequire||(typeof require==='function'?require:null);
     if(reqObj){
      var urlParts=new URL(url),mod=urlParts.protocol==='https:'?reqObj('https'):reqObj('http');
      var opt={
       hostname:urlParts.hostname,
       port:urlParts.port||(urlParts.protocol==='https:'?443:80),
       path:urlParts.pathname+urlParts.search,
       method:'POST',
       headers:Object.assign({},headers,{
        'Content-Type':'application/json',
        'Content-Length':reqObj('buffer').Buffer.byteLength(bodyStr)
       })
      };
      var req=mod.request(opt,function(res){
       var chunks=[];
       res.on('data',function(c){chunks.push(c);});
       res.on('end',function(){
        var raw=reqObj('buffer').Buffer.concat(chunks).toString('utf8');
        try{
         var parsed=JSON.parse(raw);
         if(res.statusCode>=400)reject(new Error(parsed.detail||parsed.message||('خطأ '+res.statusCode)));
         else resolve(parsed);
        }catch(e){
         if(res.statusCode>=400)reject(new Error('خطأ الخادم: HTTP '+res.statusCode));
         else resolve(raw);
        }
       });
      });
      req.on('error',reject);
      req.write(bodyStr);
      req.end();
      return;
     }
     fetch(url,{method:'POST',headers:Object.assign({'Content-Type':'application/json'},headers),body:bodyStr}).then(function(r){
      return r.json().then(function(j){if(!r.ok)throw new Error(j.detail||j.message||('خطأ '+r.status));return j;});
     }).then(resolve).catch(reject);
    }catch(e){reject(e);}
   });
  }

  async function generateDirect(){
   saveKeys();
   var prompt=($('qImageResult')&&$('qImageResult').value||'').trim();
   if(!prompt){status('qAiGenerateStatus','أدخل برومبت أولاً في حقل البرومبت أعلاه لتوليد الصورة.',true);return;}
   var engine=$('qAiEngine')?$('qAiEngine').value:'fal-schnell';
   var ratio=$('qAiRatio')?$('qAiRatio').value:'1:1';
   var falKey=($('qAiKeyFal')&&$('qAiKeyFal').value.trim())||'';
   var openaiKey=($('qAiKeyOpenai')&&$('qAiKeyOpenai').value.trim())||'';
   var stabilityKey=($('qAiKeyStability')&&$('qAiKeyStability').value.trim())||'';
   var localUrl=($('qAiLocalUrl')&&$('qAiLocalUrl').value.trim())||'http://127.0.0.1:8188';

   status('qAiGenerateStatus','جاري إرسال البرومبت لمولد الصور...');
   genBtn.disabled=true;

   try{
    var imageBuf=null;
    if(engine==='fal-schnell'||engine==='fal-dev'){
     if(!falKey)throw new Error('أدخل مفتاح Fal.ai API Key في إعدادات المفاتيح بالأسفل.');
     var modelEndpoint=engine==='fal-dev'?'fal-ai/flux/dev':'fal-ai/flux/schnell';
     var falSize=ratio==='1:1'?'square_hd':ratio==='4:5'?'portrait_4_3':ratio==='9:16'?'portrait_16_9':'landscape_16_9';
     status('qAiGenerateStatus','⚡ جاري توليد الصورة عبر محرك Flux...');
     var falRes=await postJson('https://queue.fal.run/'+modelEndpoint,{'Authorization':'Key '+falKey},{prompt:prompt,image_size:falSize,num_inference_steps:engine==='fal-dev'?28:4});
     var imgUrl=falRes.images&&falRes.images[0]&&falRes.images[0].url;
     if(!imgUrl&&falRes.status_url){
      var attempts=0;
      while(!imgUrl&&attempts<40){
       await new Promise(function(r){setTimeout(r,1000);});
       var pollRes=await postJson(falRes.response_url||falRes.status_url,{'Authorization':'Key '+falKey},{});
       if(pollRes.images&&pollRes.images[0])imgUrl=pollRes.images[0].url;
       attempts++;
      }
     }
     if(!imgUrl)throw new Error('لم يرجع المحرك رابط صورة صالحاً.');
     status('qAiGenerateStatus','جاري تنزيل الصورة المولدة...');
     imageBuf=await downloadBuffer(imgUrl);
    }else if(engine==='openai-dalle3'){
     if(!openaiKey)throw new Error('أدخل مفتاح OpenAI API Key في إعدادات المفاتيح بالأسفل.');
     status('qAiGenerateStatus','جاري التوليد عبر DALL-E 3...');
     var dSize=ratio==='16:9'?'1792x1024':ratio==='9:16'?'1024x1792':'1024x1024';
     var openRes=await postJson('https://api.openai.com/v1/images/generations',{'Authorization':'Bearer '+openaiKey},{model:'dall-e-3',prompt:prompt,n:1,size:dSize});
     var dUrl=openRes.data&&openRes.data[0]&&openRes.data[0].url;
     if(!dUrl)throw new Error('لم يرجع DALL-E 3 رابط صورة صالحاً.');
     status('qAiGenerateStatus','جاري تنزيل صورة DALL-E 3...');
     imageBuf=await downloadBuffer(dUrl);
    }else if(engine==='local-comfy'){
     status('qAiGenerateStatus','جاري الاتصال بالمحرك المحلي...');
     var w=ratio==='16:9'?1024:ratio==='9:16'?576:ratio==='4:5'?768:832;
     var h=ratio==='16:9'?576:ratio==='9:16'?1024:ratio==='4:5'?960:832;
     var localRes=await postJson(localUrl.replace(/\/$/,'')+'/sdapi/v1/txt2img',{},{prompt:prompt,width:w,height:h,steps:20});
     if(!localRes.images||!localRes.images[0])throw new Error('تعذّر الحصول على صورة من المحرك المحلي.');
     var reqObj=root.QayemNativeRequire||(typeof require==='function'?require:null);
     var b64Str=localRes.images[0].replace(/^data:image\/[a-z]+;base64,/,'');
     imageBuf=reqObj?reqObj('buffer').Buffer.from(b64Str,'base64'):b64Str;
    }else{
     if(!stabilityKey)throw new Error('أدخل مفتاح Stability API Key في إعدادات المفاتيح بالأسفل.');
     status('qAiGenerateStatus','جاري التوليد عبر Stability AI...');
     var stabRes=await postJson('https://api.stability.ai/v2beta/stable-image/generate/core',{'Authorization':'Bearer '+stabilityKey,'Accept':'application/json'},{prompt:prompt,output_format:'png',aspect_ratio:ratio==='4:5'?'4:5':ratio==='9:16'?'9:16':ratio==='16:9'?'16:9':'1:1'});
     if(!stabRes.image)throw new Error('تعذّر استلام صورة من Stability AI.');
     var reqObj2=root.QayemNativeRequire||(typeof require==='function'?require:null);
     imageBuf=reqObj2?reqObj2('buffer').Buffer.from(stabRes.image,'base64'):stabRes.image;
    }

    var reqObj3=root.QayemNativeRequire||(typeof require==='function'?require:null);
    var savedFilePath='';
    if(reqObj3){
     var fs=reqObj3('fs'),path=reqObj3('path'),os=reqObj3('os');
     var baseDir=typeof os.homedir==='function'?os.homedir():(process.env.USERPROFILE||process.env.HOME||'');
     var cacheDir=path.join(baseDir,'.qayem','cache','generated');
     if(!fs.existsSync(cacheDir))fs.mkdirSync(cacheDir,{recursive:true});
     savedFilePath=path.join(cacheDir,'gen_'+Date.now()+'.png');
     fs.writeFileSync(savedFilePath,imageBuf);
    }

    if($('qAiGeneratePreview')){
     var b64=(typeof imageBuf==='string')?imageBuf:(imageBuf.toString?imageBuf.toString('base64'):'');
     if(b64){
      $('qAiGeneratePreview').src='data:image/png;base64,'+b64;
      hidden($('qAiGeneratePreview'),false);
     }
    }

    if(savedFilePath&&root.QayemOverlays&&typeof QayemOverlays.host==='function'){
     status('qAiGenerateStatus','جاري إدراج الصورة كـ Smart Object داخل Photoshop...');
     var info=await QayemOverlays.host('info');
     await QayemOverlays.host('apply',{
      path:savedFilePath,
      name:'AI · '+(prompt.slice(0,25)),
      blend:'normal',
      opacity:100,
      fit:'cover',
      documentId:info.id,
      documentWidth:info.width,
      documentHeight:info.height
     });
     status('qAiGenerateStatus','✨ تم توليد الصورة وإدراجها بنجاح كـ Smart Object داخل مشروعك!');
    }else{
     status('qAiGenerateStatus','تم توليد الصورة بنجاح'+(savedFilePath?': '+savedFilePath:'.'));
    }
   }catch(err){
    status('qAiGenerateStatus',err.message||String(err),true);
   }finally{
    genBtn.disabled=false;
   }
  }
  genBtn.onclick=generateDirect;
 }
 setupGrid();setupImage();setupAiGenerator();
 return {clearPrivate:clearImage,restoreResult:function(data){clearImage();imageResult(data);},enter:function(id){if(gridPalette){gridPalette.close();if(id==='gridView')gridPalette.sync();}if(id==='gridView')refresh();if(id==='imagePromptView'){if(imageOwner!==owner())clearImage();if(root.QayemAuth&&QayemAuth.getToken())QayemAuth.api('GET','/api/image-prompts/status').then(function(data){if(root.QayemCredits)QayemCredits.updateWallet(data.wallet);if(!imageBusy)status('qImageStatus',data.message,!data.available);}).catch(function(e){status('qImageStatus',e.status===404?'حدّث الداش بورد لتفعيل أداة صورة إلى برومبت.':e.message,true);});}}};
})(window);

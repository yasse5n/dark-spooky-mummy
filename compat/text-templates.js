var QayemTextTemplates=null;
runUiInitializer('textTemplatesView',function(){
 const node=id=>document.getElementById(id),catalog=TEXT_TEMPLATE_CATALOG.slice(),layout=QayemTextLayout;
 let engine=null,hostError='',current=catalog[0],documentData=null,busy=false,refreshing=false;
 let disposed=false,pollTimer=null,documentGeneration=0;
 const saved={},cards=[];let librarySequence=0,librarySession='',pendingRestore=null;
 const directionLabels={landscape:'عرضي',portrait:'طولي',square:'مربع'};
 try{
  if(typeof QAYEM_CEP_HOST!=='undefined'&&QAYEM_CEP_HOST)engine=createCepTextTemplateEngine();
  else if(typeof require==='function')engine=createTextTemplateEngine(require('photoshop'),require('uxp').storage.localFileSystem,catalog,layout,typeof QAYEM_LEGACY_HOST!=='undefined'&&QAYEM_LEGACY_HOST);
  else throw new Error('افتح البلاجين من داخل Photoshop علشان تضيف الكتابة.');
 }catch(e){hostError=e.message||String(e);}
 function add(tag,parent,text){const el=document.createElement(tag);if(text)el.textContent=text;parent.appendChild(el);return el;}
 function status(text,error){node('textTemplateStatus').textContent=text;node('textTemplateStatus').className=error?'error':'hint';}
 function controlState(){
  ['textTemplateLine1','textTemplateLine2','textTemplateFont'].forEach(id=>node(id).disabled=busy);
  // Run resolves its own active document; background reads never gate insertion.
  node('textTemplateApply').disabled=busy||!engine||!current||current.locked===true;
  cards.forEach(card=>card.setAttribute('aria-disabled',String(busy)));
  node('textTemplateApply').textContent=busy?'جاري إضافة الكتابة…':'إضافة الكتابة للتصميم';
 }
 function loadSavedCustomTemplates(){
  try{
   if(window.localStorage){
    const savedCustom=JSON.parse(localStorage.getItem('qayem_custom_templates')||'[]');
    if(Array.isArray(savedCustom)){
     savedCustom.forEach(ct=>{if(!catalog.find(c=>c.id===ct.id))catalog.unshift(ct);});
    }
   }
  }catch(ignored){}
 }
 loadSavedCustomTemplates();
 function remember(){if(!current)return;saved[current.id]=[node('textTemplateLine1').value,node('textTemplateLine2').value];}
 function settings(){
  return {
   manualPlacement:true,
   fontMode:node('textTemplateFont').value,
   socialRatio:node('textTemplateSocialRatio')?node('textTemplateSocialRatio').value:'auto',
   alignment:node('textTemplateAlignment')?node('textTemplateAlignment').value:'center'
  };
 }
 function fontDescription(){
  if(!documentData||!current){node('textTemplateFontStatus').textContent='';return;}
  try{const fonts=layout.fonts(current,node('textTemplateFont').value,documentData.fonts);node('textTemplateFontStatus').textContent='الخط المستخدم: '+fonts.selected.join(' · ')+(fonts.missing.length?' — هيُستخدم بديل متاح داخل Photoshop.':'');}
  catch(e){node('textTemplateFontStatus').textContent=e.message||String(e);}
 }
 function selectTemplate(template){
  if(busy)return;if(current)remember();current=template;
  const values=saved[current.id]||current.fields.map(f=>f.defaultText);
  node('textTemplateLine1').value=values[0]||'';
  node('textTemplateLine2').value=values[1]||'';
  const hasLine2=current.fields.length>1;
  node('textTemplateLine2').hidden=!hasLine2;
  const lbl2=document.querySelector('label[for="textTemplateLine2"]');if(lbl2)lbl2.hidden=!hasLine2;
  const lbl1=document.querySelector('label[for="textTemplateLine1"]');
  if(lbl1)lbl1.textContent='٢ · '+(current.fields[0]?current.fields[0].layerName:'السطر الأول');
  if(lbl2&&current.fields[1])lbl2.textContent='٣ · '+current.fields[1].layerName;
  cards.forEach((card,i)=>{const selected=catalog[i].id===current.id;card.classList.toggle('selected',selected);card.setAttribute('aria-checked',String(selected));});
  node('textTemplateSourceFonts').textContent='خطوط القالب الأصلية: '+current.fields.map(f=>f.font).join(' · ');
  fontDescription();controlState();
 }
 function renderCards(){cards.length=0;node('textTemplatePicker').textContent='';catalog.forEach(template=>{
  const card=add('div',node('textTemplatePicker'));card.className='textTemplateCard';card.setAttribute('data-template-id',template.id);card.setAttribute('role','radio');card.setAttribute('tabindex','0');card.setAttribute('aria-label',template.label);
  const img=add('img',card);img.src=template.thumbnail||template.preview||'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="14" fill="%232b263b"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="%233b82f6" text-anchor="middle">PSD</text></svg>';img.alt='';img.setAttribute('aria-hidden','true');
  add('span',card,template.label+(template.custom?' · مخصص':'')+(template.locked?' · مغلق في التجربة':''));cards.push(card);
  card.addEventListener('click',()=>selectTemplate(template));
  card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectTemplate(template);}});
 });}
 renderCards();
 async function loadRemote(){
  if(disposed||busy||!window.QayemAuth||!QayemAuth.getToken())return;const seq=++librarySequence,tok=QayemAuth.getToken();node('textTemplateLibraryStatus').textContent='جاري تحديث القوالب…';
  try{const d=await QayemAuth.api('GET','/api/text-templates/catalog',null,25000);if(disposed||busy||seq!==librarySequence||tok!==QayemAuth.getToken())return;if(!Array.isArray(d.items)||d.items.length>1000)throw Error('قائمة القوالب غير صالحة.');const id=current&&current.id;remember();catalog.splice(0,catalog.length,...d.items);loadSavedCustomTemplates();current=null;renderCards();if(catalog.length)selectTemplate(catalog.find(t=>t.id===id)||catalog[0]);else{node('textTemplateLine1').value='';node('textTemplateLine2').value='';node('textTemplateSourceFonts').textContent='';controlState();}librarySession=tok;node('textTemplateLibraryStatus').textContent=catalog.length+' قالب جاهز ومستورد · يعمل بالكامل محلياً.';if(pendingRestore){const v=pendingRestore;pendingRestore=null;if(!catalog.find(t=>t.id===v.templateId))v.templateId=catalog[0]&&catalog[0].id;QayemTextTemplates.restoreState(v);}}catch(e){if(seq===librarySequence)node('textTemplateLibraryStatus').textContent=catalog.length+' قالب محلي متاح.';}
 }
 function documentChanged(info){
  documentData=info;
  node('textTemplateDocument').textContent=(info.name?info.name+' · ':'')+Math.round(info.width)+' × '+Math.round(info.height)+' px · '+directionLabels[layout.orientation(info.width,info.height)];
  controlState();fontDescription();
 }
 async function refresh(force){
  if(disposed||busy||refreshing)return;if(!engine){status(hostError,true);return;}
  refreshing=true;
  const generation=documentGeneration;
  try{const info=await engine.documentInfo(force);if(disposed||busy||generation!==documentGeneration)return;documentChanged(info);}
  catch(e){if(disposed||busy||generation!==documentGeneration)return;documentData=null;node('textTemplateDocument').textContent=e.message||'افتح مشروعًا في Photoshop.';controlState();fontDescription();}
  finally{refreshing=false;}
 }
 async function importPSD(psdPath){
  if(busy||!engine)return;
  busy=true;controlState();status('جاري فحص ملف الـ PSD وقراءة الطبقات النصية والأبعاد…');
  try{
   const inspected=await engine.inspectPSD(psdPath);
   if(!inspected||!inspected.fields||!inspected.fields.length)throw new Error('الملف لا يحتوي على طبقات نصية (Text Layers).');
   inspected.preview='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="14" fill="%23232030"/><text x="50" y="58" font-size="26" font-family="sans-serif" font-weight="bold" fill="%234f46e5" text-anchor="middle">PSD</text></svg>';
   inspected.custom=true;
   catalog.unshift(inspected);
   try{
    if(window.localStorage){
     const list=JSON.parse(localStorage.getItem('qayem_custom_templates')||'[]');
     list.unshift(inspected);
     localStorage.setItem('qayem_custom_templates',JSON.stringify(list.slice(0,30)));
    }
   }catch(ignored){}
   renderCards();
   selectTemplate(inspected);
   status('تم استيراد قالب «'+inspected.label+'» بنجاح مع '+inspected.fields.length+' طبقات نصية قابلة للتعديل والمحاذاة!');
  }catch(err){
   status(err.message||String(err),true);
  }finally{
   busy=false;controlState();
  }
 }
 if(node('textTemplateImport')){
  node('textTemplateImport').onclick=()=>{
   try{
    const fs=window.cep&&window.cep.fs;
    if(fs&&(fs.showOpenDialogEx||fs.showOpenDialog)){
     const res=(fs.showOpenDialogEx||fs.showOpenDialog).call(fs,false,false,'اختيار ملف قالب PSD','',['psd']);
     if(!res||res.err||!res.data||!res.data.length)return;
     importPSD(res.data[0]);
    }else if(node('textTemplateFileInput'))node('textTemplateFileInput').click();
   }catch(e){status(e.message||String(e),true);}
  };
 }
 if(node('textTemplateFileInput')){
  node('textTemplateFileInput').onchange=function(){
   const file=this.files&&this.files[0];
   if(!file)return;
   importPSD(file.path||file.name);
  };
 }
 node('textTemplateApply').addEventListener('click',async()=>{
  if(disposed||busy||!engine||!current)return;
  try{
   const request=Object.assign({},settings(),{templateId:current.id,texts:[node('textTemplateLine1').value,node('textTemplateLine2').value].slice(0,current.fields.length)});
   if(current.custom)request.customTemplate=current;
   layout.validate(request,catalog);remember();
   busy=true;documentGeneration++;controlState();status('جاري قراءة المشروع وإضافة الكتابة…');
   if(typeof QayemLicenseGate!=='undefined')await QayemLicenseGate.ensureEntitled({force:true,action:'text.template',params:{id:request.templateId}});
   if(disposed)return;
   if(current.remote){const tok=QayemAuth.getToken(),latest=await QayemAuth.api('GET','/api/text-templates/catalog',null,25000),item=latest.items.find(t=>t.id===request.templateId);if(!item||item.locked||item.sha256!==current.sha256)throw Error('القالب اتغيّر أو غير متاح. حدّث قائمة القوالب أولًا.');status('جاري تنزيل القالب وفحص سلامته…');const file=await QayemAssetCache.ensure(item,tok);if(disposed||tok!==QayemAuth.getToken())return;request.remoteTemplate={id:item.id,label:item.label,sha256:item.sha256,localPath:file,bounds:item.bounds,visibleNames:item.visibleNames,fields:item.fields};}
   const result=await engine.runActive(request);if(disposed)return;
   if(result.document)documentChanged(result.document);
   status('اتضافت «'+result.name+'» بمحاذاة وأبعاد ذكية داخل مجموعة لايرات قابلة للتعديل في Photoshop.');
  }catch(e){if(!disposed)status(e.message||String(e),true);}
  finally{busy=false;if(!disposed)controlState();}
 });
 node('openTextShapes').addEventListener('click',()=>{refresh(false);loadRemote();});node('textTemplateReload').addEventListener('click',loadRemote);
 node('textTemplateFont').addEventListener('change',fontDescription);
 if(node('textTemplateSocialRatio'))node('textTemplateSocialRatio').addEventListener('change',fontDescription);
 if(node('textTemplateAlignment'))node('textTemplateAlignment').addEventListener('change',fontDescription);
 ['textTemplateLine1','textTemplateLine2'].forEach(id=>node(id).addEventListener('input',remember));
 current=null;selectTemplate(catalog[0]);controlState();if(hostError)status(hostError,true);
 QayemTextTemplates={refresh,getState:()=>{remember();return {templateId:current&&current.id,drafts:saved,settings:settings()};},restoreState:value=>{
  if(!value||typeof value!=='object'||busy)return;if(value.templateId&&!catalog.find(t=>t.id===value.templateId)){pendingRestore=value;loadRemote();return;}
  if(value.drafts&&typeof value.drafts==='object')catalog.forEach(t=>{const pair=value.drafts[t.id];if(Array.isArray(pair)&&pair.length>=1&&pair.length<=2&&pair.every(s=>typeof s==='string'&&s.length<=120))saved[t.id]=pair.slice();});
  const t=catalog.find(t=>t.id===value.templateId)||catalog[0];current=null;if(t)selectTemplate(t);
  const s=value.settings||{};
  if(['auto','dinMedium','dinBold'].includes(s.fontMode))node('textTemplateFont').value=s.fontMode;
  // Keep text drafts and font preference; obsolete placement controls are intentionally ignored.
  fontDescription();
 }};
 function visible(){return document.hidden!==true&&node('textTemplatesView').getAttribute('hidden')===null&&node('textTemplatesView').style.display!=='none';}
 function refreshVisible(){if(!disposed&&visible()){if(window.QayemAuth&&librarySession!==QayemAuth.getToken()){catalog.splice(0,catalog.length,...TEXT_TEMPLATE_CATALOG);current=null;renderCards();selectTemplate(catalog[0]);librarySession=QayemAuth.getToken();loadRemote();}refresh(false);}}
 function stopPolling(){
  disposed=true;documentGeneration++;librarySequence++;
  if(pollTimer!==null&&typeof clearInterval==='function'){clearInterval(pollTimer);pollTimer=null;}
  if(typeof window!=='undefined'&&typeof window.removeEventListener==='function')window.removeEventListener('focus',refreshVisible);
  if(typeof document.removeEventListener==='function')document.removeEventListener('visibilitychange',refreshVisible);
 }
 if(typeof window!=='undefined'&&typeof window.addEventListener==='function'){
  window.addEventListener('focus',refreshVisible);
  window.addEventListener('beforeunload',stopPolling);window.addEventListener('unload',stopPolling);
 }
 if(typeof document.addEventListener==='function')document.addEventListener('visibilitychange',refreshVisible);
 // Polling also covers older CEP/UXP hosts without document notification support.
 if(typeof setInterval==='function')pollTimer=setInterval(refreshVisible,650);
});

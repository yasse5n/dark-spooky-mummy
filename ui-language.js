// Localization is a display layer: form values and generated prompt text are never translated.
let QAYEM_UI_LANGUAGE='ar';
function qayemUiText(source){
 if(QAYEM_UI_LANGUAGE!=='en')return source;
 const raw=String(source);if(!/[\u0600-\u06ff]/.test(raw))return raw;const trim=raw.trim(),digits=s=>s.replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c));
 if(QAYEM_UI_EN[trim])return raw.replace(trim,QAYEM_UI_EN[trim]);
 const numbered=/^([\d٠-٩]+)\s*([·—])\s*(.+)$/.exec(trim);
 if(numbered){const translated=qayemUiText(numbered[3]);if(translated!==numbered[3])return digits(numbered[1])+' '+numbered[2]+' '+translated;}
 let t=trim;
 if(/^النسخة [\d٠-٩]+/.test(t))t=t.replace(/^النسخة ([\d٠-٩]+)/,(_,n)=>'Instance '+digits(n));
 if(/^[\d٠-٩]+ شخصيات$/.test(t))return digits(t).replace('شخصيات','characters');
 if(/^[\d٠-٩]+ نسخ$/.test(t))return digits(t).replace('نسخ','instances');
 if(/^الشخصية [\d٠-٩]+/.test(t))t=t.replace(/^الشخصية ([\d٠-٩]+)/,(_,n)=>'Character '+digits(n));
 if(/^[\d٠-٩]+ من [\d٠-٩]+ أكشن ريتتش$/.test(t))return digits(t).replace(' من ',' of ').replace(' أكشن ريتتش',' retouch actions');
 if(t.startsWith('أرفق ')&&t.includes(' صورة مع البروبت'))return t.replace(/^أرفق ([\d٠-٩]+) صورة مع البروبت في أداة التوليد، بنفس الترتيب. رفع الصور مش داخل البلاجين\.$/,(_,n)=>'Attach '+digits(n)+' image(s) with the prompt in your generator, in this order. Images are not uploaded in the plugin.');
 if(t.startsWith('الحجم الحالي '))return digits(t).replace('الحجم الحالي ','Current size ').replace(' بالمئة. اضغط للرجوع إلى 100 بالمئة',' percent. Click to reset to 100 percent');
 t=t.replace(/([\d]+) مم — /g,'$1 mm — ').replace(/واسعة جدًا/g,'ultra-wide').replace(/واسعة معتدلة/g,'moderately wide').replace(/واسعة/g,'wide').replace(/طبيعية/g,'natural').replace(/بورتريه/g,'portrait');
 const replacements=QAYEM_UI_REPLACEMENTS;
 replacements.forEach(([ar,en])=>{if(t.includes(ar))t=t.split(ar).join(en);});
 return t===trim?raw:raw.replace(trim,digits(t));
}
const QAYEM_UI_REPLACEMENTS=Object.keys(QAYEM_UI_EN).filter(k=>k.length>1).sort((a,b)=>b.length-a.length).map(k=>[k,QAYEM_UI_EN[k]]);
(function(){
 const key='qayem.ui.language.v1',select=document.getElementById('uiLanguage'),root=document.documentElement;
 const texts=new WeakMap(),attrs=new WeakMap();let pending=false,observer=null,poll=null;
 try{const saved=localStorage.getItem(key);if(saved==='en'||saved==='ar')QAYEM_UI_LANGUAGE=saved;}catch(ignored){}
 function updateText(node){
  const now=node.nodeValue;if(!now||!now.trim())return;
  const prior=texts.get(node),source=prior&&now===prior.output?prior.source:now;
  const output=QAYEM_UI_LANGUAGE==='en'?qayemUiText(source):source;
  texts.set(node,{source,output});if(now!==output)node.nodeValue=output;
 }
 function walk(element){
  if(!element)return;
  if(element.nodeType===3){updateText(element);return;}
  if(element.nodeType!==1)return;
  const tag=String(element.tagName).toLowerCase();
  if(['script','style','textarea'].includes(tag)||element.getAttribute('data-qayem-no-translate')!==null)return;
  const prior=attrs.get(element)||{};
  ['placeholder','title','aria-label'].forEach(name=>{
   const now=element.getAttribute(name);if(!now)return;
   const old=prior[name],source=old&&now===old.output?old.source:now,output=QAYEM_UI_LANGUAGE==='en'?qayemUiText(source):source;
   prior[name]={source,output};if(now!==output)element.setAttribute(name,output);
  });
  attrs.set(element,prior);
  // Textarea values are protected, but their placeholder/accessibility labels are localized.
  Array.from(element.childNodes).forEach(child=>{
   if(child.nodeType===1&&String(child.tagName).toLowerCase()==='textarea'){
    const priorArea=attrs.get(child)||{};
    ['placeholder','title','aria-label'].forEach(name=>{const now=child.getAttribute(name);if(!now)return;const old=priorArea[name],source=old&&now===old.output?old.source:now,output=QAYEM_UI_LANGUAGE==='en'?qayemUiText(source):source;priorArea[name]={source,output};if(now!==output)child.setAttribute(name,output);});attrs.set(child,priorArea);
   }else walk(child);
  });
 }
 function apply(){pending=false;walk(document.body);}
 function schedule(){if(pending)return;pending=true;setTimeout(apply,0);}
 function language(value,persist){
  QAYEM_UI_LANGUAGE=value==='en'?'en':'ar';select.value=QAYEM_UI_LANGUAGE;
  root.setAttribute('lang',QAYEM_UI_LANGUAGE);root.setAttribute('dir',QAYEM_UI_LANGUAGE==='en'?'ltr':'rtl');
  if(persist){try{localStorage.setItem(key,QAYEM_UI_LANGUAGE);}catch(ignored){document.getElementById('uiLanguageStatus').textContent=QAYEM_UI_LANGUAGE==='en'?'Language changed for this session; it could not be saved.':'تم تغيير اللغة للجلسة الحالية؛ تعذّر حفظ الاختيار.';}}
  apply();
  if(!observer&&typeof setInterval==='function'){
   if(poll){clearInterval(poll);poll=null;}
   if(QAYEM_UI_LANGUAGE==='en')poll=setInterval(schedule,1500);
  }
 }
 select.addEventListener('change',()=>language(select.value,true));
 // Older UXP hosts can omit MutationObserver. DOM events and a feature-detected timer cover updates.
 if(typeof MutationObserver==='function'){
  observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});
 }
 ['click','change','input','copy','keydown'].forEach(event=>document.addEventListener(event,()=>{schedule();setTimeout(schedule,100);},false));
 language(QAYEM_UI_LANGUAGE,false);
})();

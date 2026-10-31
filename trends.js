var QayemTrends=(function(){
 'use strict';var items=[],category='egypt',request=0,session='';
 var tabs={egypt:'qTrendEgypt',social:'qTrendSocial',design:'qTrendDesign',pinterest:'qTrendPinterest'};
 function $(id){return document.getElementById(id);}
 function node(tag,text){var n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
 function date(iso){if(!iso)return 'لم تصدر نشرة بعد';var d=new Date(iso);return isNaN(d.getTime())?'—':d.toLocaleString('ar-EG',{year:'numeric',month:'short',day:'numeric',timeZone:'Africa/Cairo'});}
 function safe(v){return typeof v==='string'&&/^https:\/\/[^\s]+$/i.test(v)&&v.indexOf('@')<0;}
 function use(item){
  var target=$('teacherIdea'),mode=$('teacherDesignType');if(!target||!mode)return;
  if(!mode.value){mode.value='normal';mode.dispatchEvent(new Event('change',{bubbles:true}));}
  if(target.value.indexOf(item.idea)<0)target.value=(target.value.trim()?target.value.trim()+'\n\n':'')+item.idea;
  target.dispatchEvent(new Event('input',{bubbles:true}));QayemNavigation.show('teacherView');target.focus();
 }
 function source(item){if(!safe(item.sourceUrl))return;try{if(typeof QAYEM_CEP_HOST!=='undefined'&&QAYEM_CEP_HOST)QayemCEPBridge.openExternal(item.sourceUrl);else window.open(item.sourceUrl,'_blank','noopener,noreferrer');}catch(e){$('qTrendStatus').textContent='افتح المصدر يدويًا: '+item.sourceUrl;}}
 function execution(item,card){
  var plan=node('div');plan.className='qTrendExecution';plan.appendChild(node('h3','خطة تنفيذ مقترحة'));
  if(item.useCases){plan.appendChild(node('strong','مناسب لـ'));plan.appendChild(node('p',item.useCases));}
  if(item.visualNotes){plan.appendChild(node('strong','التكوين والألوان والإضاءة'));plan.appendChild(node('p',item.visualNotes));}
  var steps=Array.isArray(item.executionSteps)?item.executionSteps.slice(0,8).filter(function(x){return typeof x==='string'&&x.trim();}):[];
  if(steps.length){var list=node('ol');steps.forEach(function(step){list.appendChild(node('li',step));});plan.appendChild(list);}
  else plan.appendChild(node('p','راجع مثال المصدر، وحدد العناصر المناسبة لهوية مشروعك قبل التنفيذ.'));
  card.appendChild(plan);
 }
 function paint(){
  Object.keys(tabs).forEach(function(key){$(tabs[key]).setAttribute('aria-pressed',String(category===key));});
  var intro=$('qTrendSocialIntro');intro.hidden=category!=='social';intro.style.display=category==='social'?'block':'none';
  var grid=$('qTrendItems');grid.textContent='';
  var visible=items.filter(function(x){return x.category===category;});
  if(!visible.length){
   grid.appendChild(node('p',category==='pinterest'?'مختارات Pinterest هتظهر هنا بعد نشرها. تقدر تستكشف أفكار وتصاميم مناسبة لمصر من الزر ده.':category==='social'?'لسه مفيش أمثلة منشورة للسوشيال حاليًا. جرّب تحديث النشرة لاحقًا.':'لا توجد كروت منشورة في القسم ده حاليًا.'));
   if(category==='pinterest'){var explore=node('button','استكشف Pinterest');explore.type='button';explore.onclick=function(){source({sourceUrl:'https://www.pinterest.com/search/pins/?q='+encodeURIComponent('تصاميم سوشيال ميديا مصر')});};grid.appendChild(explore);}return;
  }
  visible.forEach(function(item){
   var social=item.category==='social',card=node('article');card.className='qTrendCard';
   var art=node('div');art.className='qTrendArt '+(item.category==='egypt'?'qTrendEgypt':social?'qTrendSocial':'qTrendDesign');
   if(safe(item.imageUrl)){
    var img=node('img');img.src=item.imageUrl;img.alt=social?'مثال بصري من مصدر التصميم':'معاينة من مصدر الترند';img.loading='lazy';img.referrerPolicy='no-referrer';
    img.onerror=function(){img.hidden=true;if(social)art.appendChild(node('p','تعذّر تحميل المعاينة. افتح المصدر لمشاهدة التصميم.'));};art.appendChild(img);
   }
   var badge=node('span',item.category==='egypt'?'مصر · ترندات البحث':social?'سوشيال · فكرة وتنفيذ':item.category==='pinterest'?(item.provenance==='pinterest_search_eg'?'Pinterest · بحث لمصر':'Pinterest · مختارات قيم'):'اتجاهات وإلهام');
   art.appendChild(badge);card.appendChild(art);card.appendChild(node('h2',item.title));card.appendChild(node('p',item.description));
   var idea=node('div');idea.className='qTrendIdea';idea.appendChild(node('strong','فكرة لشغلك'));idea.appendChild(node('p',item.idea));card.appendChild(idea);
   if(social)execution(item,card);
   var label=item.sourceName+' · '+date(item.sourcePublishedAt||item.collectedAt)+(item.stale?' · محتوى سابق؛ تعذّر تحديث المصدر':'');
   if(social)label=item.sourceName+' · '+(item.sourcePublishedAt?'تاريخ المصدر: '+date(item.sourcePublishedAt):'تاريخ الجمع: '+date(item.collectedAt))+(item.stale?' · محتوى سابق؛ تعذّر تحديث المصدر':'');
   card.appendChild(node('small',label));if(social&&item.sourcePublishedAt&&item.collectedAt)card.appendChild(node('small','أضيف للنشرة: '+date(item.collectedAt)));
   if(item.category==='pinterest'&&item.query)card.appendChild(node('small','كلمة البحث: '+item.query));
   var row=node('div');row.className='qToolRow qTrendActions';var apply=node('button','استخدم الفكرة');apply.type='button';apply.className='primary';apply.addEventListener('click',function(){use(item);});row.appendChild(apply);
   var link=node('button','فتح المصدر');link.type='button';link.addEventListener('click',function(){source(item);});row.appendChild(link);card.appendChild(row);grid.appendChild(card);
  });
 }
 async function load(){
  var auth=typeof QayemAuth!=='undefined'?QayemAuth:null;if(!auth||!auth.getToken())return;var token=auth.getToken();if(token!==session){items=[];session=token;paint();}
  var seq=++request;$('qTrendStatus').textContent='جاري تحميل نشرة الأسبوع…';$('qTrendReload').disabled=true;
  try{var data=await auth.api('GET','/api/trends');if(seq!==request||session!==auth.getToken())return;items=Array.isArray(data.items)?data.items:[];$('qTrendUpdated').textContent='آخر تحديث: '+date(data.lastPublishedAt)+' · توقيت مصر';$('qTrendStatus').textContent='';paint();}catch(e){if(seq===request)$('qTrendStatus').textContent=(e.status===404?'حدّث سيرفر الداش بورد لإتاحة قسم الترندات.':e.message||'تعذّر تحميل النشرة. جرّب إعادة التحميل.');}finally{if(seq===request)$('qTrendReload').disabled=false;}
 }
 Object.keys(tabs).forEach(function(key){$(tabs[key]).addEventListener('click',function(){category=key;paint();});});$('qTrendReload').addEventListener('click',load);
 return {enter:function(id){if(id==='trendsView')load();},onSession:function(){var tok=typeof QayemAuth!=='undefined'?QayemAuth.getToken():'';if(tok!==session){request++;items=[];session=tok;paint();$('qTrendStatus').textContent='';$('qTrendUpdated').textContent='';}}};
})();

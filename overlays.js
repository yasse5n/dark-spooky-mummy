var QayemOverlays=(function(root){'use strict';
 var page=1,pages=1,sequence=0,previewSequence=0,session='',chosen=null,busy=false;

 var LOCAL_OVERLAYS_CATALOG=[
  {id:'ov_light_golden',name:'توهج ذهبي وأشعة شمس',category:'light',file:'light_golden.png',thumbnail:'assets/overlays/light_golden_thumb.png',preview:'assets/overlays/light_golden.png',blend:'screen',width:1920,height:1920,bytes:1288175},
  {id:'ov_light_sunset',name:'تسريب ضوء سنمائي أنامورفيك',category:'light',file:'light_sunset.png',thumbnail:'assets/overlays/light_sunset_thumb.png',preview:'assets/overlays/light_sunset.png',blend:'screen',width:1920,height:1920,bytes:377143},
  {id:'ov_dust_vintage',name:'غبار وخدوش كلاسيكية',category:'dust',file:'dust_vintage.png',thumbnail:'assets/overlays/dust_vintage_thumb.png',preview:'assets/overlays/dust_vintage.png',blend:'screen',width:1920,height:1920,bytes:181876},
  {id:'ov_dust_particles',name:'جزيئات غبار وبوكيه عائمة',category:'dust',file:'dust_particles.png',thumbnail:'assets/overlays/dust_particles_thumb.png',preview:'assets/overlays/dust_particles.png',blend:'screen',width:1920,height:1920,bytes:2175317},
  {id:'ov_smoke_fog',name:'دخان وضباب جوي سينمائي',category:'smoke',file:'smoke_fog.png',thumbnail:'assets/overlays/smoke_fog_thumb.png',preview:'assets/overlays/smoke_fog.png',blend:'screen',width:1920,height:1920,bytes:514842},
  {id:'ov_prism_rainbow',name:'تشتت لوني وبريزم كروي',category:'glass',file:'prism_rainbow.png',thumbnail:'assets/overlays/prism_rainbow_thumb.png',preview:'assets/overlays/prism_rainbow.png',blend:'screen',width:1920,height:1920,bytes:257266},
  {id:'ov_glass_bokeh',name:'بوكيه زجاجي بصري',category:'glass',file:'glass_bokeh.png',thumbnail:'assets/overlays/glass_bokeh_thumb.png',preview:'assets/overlays/glass_bokeh.png',blend:'screen',width:1920,height:1920,bytes:2328643},
  {id:'ov_film_grain',name:'حبيبات فيلم 35mm سينمائي',category:'dust',file:'film_grain.png',thumbnail:'assets/overlays/film_grain_thumb.png',preview:'assets/overlays/film_grain.png',blend:'overlay',width:1920,height:1920,bytes:4789241},

  // Cinematic LUTs & Color Grading (Applied natively as Gradient Map adjustment layers)
  {id:'lut_teal_orange',name:'هوليوود · Teal & Orange',category:'luts',isLut:true,blend:'softlight',opacity:75,thumbnail:'assets/overlays/light_sunset_thumb.png',preview:'assets/overlays/light_sunset.png',width:1920,height:1920,bytes:0,stops:[{pos:0,r:12,g:38,b:52},{pos:45,r:35,g:85,b:100},{pos:80,r:235,g:155,b:90},{pos:100,r:255,g:220,b:180}]},
  {id:'lut_cyberpunk',name:'سايبر بانك · Cyberpunk Neon',category:'luts',isLut:true,blend:'softlight',opacity:70,thumbnail:'assets/overlays/prism_rainbow_thumb.png',preview:'assets/overlays/prism_rainbow.png',width:1920,height:1920,bytes:0,stops:[{pos:0,r:20,g:5,b:45},{pos:50,r:160,g:25,b:120},{pos:85,r:30,g:190,b:230},{pos:100,r:240,g:240,b:255}]},
  {id:'lut_golden_hour',name:'الساعة الذهبية · Golden Hour',category:'luts',isLut:true,blend:'softlight',opacity:80,thumbnail:'assets/overlays/light_golden_thumb.png',preview:'assets/overlays/light_golden.png',width:1920,height:1920,bytes:0,stops:[{pos:0,r:35,g:20,b:10},{pos:50,r:180,g:110,b:40},{pos:85,r:250,g:200,b:120},{pos:100,r:255,g:245,b:210}]},
  {id:'lut_emerald',name:'زمردي سينمائي · Emerald Moody',category:'luts',isLut:true,blend:'softlight',opacity:65,thumbnail:'assets/overlays/smoke_fog_thumb.png',preview:'assets/overlays/smoke_fog.png',width:1920,height:1920,bytes:0,stops:[{pos:0,r:10,g:28,b:22},{pos:50,r:25,g:85,b:70},{pos:80,r:140,g:175,b:130},{pos:100,r:230,g:245,b:225}]},
  {id:'lut_noir',name:'أبيض وأسود درامي · Noir Classic',category:'luts',isLut:true,blend:'normal',opacity:90,thumbnail:'assets/overlays/film_grain_thumb.png',preview:'assets/overlays/film_grain.png',width:1920,height:1920,bytes:0,stops:[{pos:0,r:0,g:0,b:0},{pos:35,r:40,g:40,b:40},{pos:70,r:175,g:175,b:175},{pos:100,r:255,g:255,b:255}]},
  {id:'lut_sepia_vintage',name:'فيلم كلاسيكي · Vintage Sepia',category:'luts',isLut:true,blend:'softlight',opacity:70,thumbnail:'assets/overlays/dust_vintage_thumb.png',preview:'assets/overlays/dust_vintage.png',width:1920,height:1920,bytes:0,stops:[{pos:0,r:30,g:20,b:15},{pos:50,r:120,g:90,b:65},{pos:80,r:215,g:185,b:145},{pos:100,r:250,g:240,b:220}]}
 ];

 function $(id){return document.getElementById(id);}
 function hide(n,v){if(!n)return;n.hidden=!!v;n.style.display=v?'none':'';}
 function status(id,v,error){var el=$(id);if(!el)return;el.textContent=v||'';el.classList.toggle('is-error',!!error);}

 function getBasePath(){
  if(!root.__adobe_cep__)return '';
  return decodeURI(root.__adobe_cep__.getSystemPath('extension')).replace(/^file:\/\//,'').replace(/^\/([A-Za-z]:\/)/,'$1').replace(/\\/g,'/').replace(/\/$/,'');
 }

 function host(method,body){
  return new Promise(function(resolve,reject){
   if(!root.__adobe_cep__){reject(new Error('إضافة الخامة متاحة داخل Photoshop فقط.'));return;}
   function lit(v){return JSON.stringify(v).replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');}
   var base=getBasePath();
   var script='(function(){try{var api=$.evalFile(new File('+lit(base+'/jsx/overlays.jsx')+'));$.global.QayemCEPOverlays=api;return api.call('+lit(base)+','+lit(method)+','+lit(encodeURIComponent(JSON.stringify(body||{})))+');}catch(e){return "ERR|"+encodeURIComponent(String(e.message||e));}})();';
   root.__adobe_cep__.evalScript(script,function(v){
    try{
     if(typeof v!=='string'||v.indexOf('OK|')!==0)throw new Error(v&&v.indexOf('ERR|')===0?decodeURIComponent(v.slice(4)):'تعذّر تطبيق الخامة.');
     resolve(JSON.parse(decodeURIComponent(v.slice(3))));
    }catch(e){reject(e);}
   });
  });
 }

 function select(item){
  if(busy)return;
  chosen=item;
  $('qOverlayApply').disabled=false;
  hide($('qOverlayDetail'),false);
  $('qOverlayName').textContent=item.name;
  $('qOverlayPreview').src=item.preview||item.thumbnail;
  if(item.isLut){
   $('qOverlaySize').textContent='فلتر سينمائي احترافي (LUT) · طبقة تعديل تدرج ألوان مخصصة';
   $('qOverlayBlend').value=item.blend||'softlight';
   $('qOverlayOpacity').value=item.opacity||75;
   hide($('qOverlayFit').parentElement,true);
   status('qOverlayApplyStatus','جاهز للتطبيق كـ Adjustment Layer بضغطة زر.');
  }else{
   hide($('qOverlayFit').parentElement,false);
   $('qOverlaySize').textContent=(item.width||1920)+' × '+(item.height||1920)+' px · '+(item.bytes?(item.bytes/1048576).toFixed(1)+' MB':'خامة محلية عالية الدقة');
   $('qOverlayBlend').value='auto';
   $('qOverlayOpacity').value=100;
   status('qOverlayApplyStatus','الخامة جاهزة محليًا. الدمج التلقائي: '+(item.blend==='screen'?'Screen':item.blend==='overlay'?'Overlay':'Normal')+'.');
  }
  var nodes=$('qOverlayItems').querySelectorAll('button');
  for(var i=0;i<nodes.length;i++)nodes[i].setAttribute('aria-pressed',String(nodes[i].getAttribute('data-overlay')===chosen.id));
  if($('qOverlayDetail').scrollIntoView)$('qOverlayDetail').scrollIntoView(false);
 }

 function load(){
  var cat=$('qOverlayCategory')?$('qOverlayCategory').value:'all';
  status('qOverlayStatus','تحميل الحزمة المحلية…');
  var filtered=LOCAL_OVERLAYS_CATALOG.filter(function(item){
   if(cat==='all')return true;
   return item.category===cat;
  });
  pages=Math.max(1,Math.ceil(filtered.length/12));
  var box=$('qOverlayItems');
  box.textContent='';
  filtered.forEach(function(item){
   var b=document.createElement('button'),img=document.createElement('img'),label=document.createElement('span');
   b.type='button';
   b.setAttribute('data-overlay',item.id);
   b.setAttribute('aria-pressed',String(!!chosen&&chosen.id===item.id));
   b.setAttribute('aria-label',item.name);
   img.src=item.thumbnail;
   img.alt=item.name;
   label.textContent=(item.isLut?'🎨 ':'✨ ')+item.name;
   b.appendChild(img);
   b.appendChild(label);
   b.onclick=function(){select(item);};
   box.appendChild(b);
  });
  if($('qOverlayPage'))$('qOverlayPage').textContent=page+' / '+pages;
  if($('qOverlayPrev'))$('qOverlayPrev').disabled=true;
  if($('qOverlayNext'))$('qOverlayNext').disabled=true;
  status('qOverlayStatus',filtered.length+' خامة وفلتر مدمج محليًا · تعمل 100% بدون إنترنت.');
  if(!chosen&&filtered.length)select(filtered[0]);
 }

 function apply(){
  if(busy||!chosen)return;
  var item=chosen,info,blend=$('qOverlayBlend').value,opacity=Number($('qOverlayOpacity').value),fit=$('qOverlayFit').value;
  if(!Number.isInteger(opacity)||opacity<1||opacity>100){status('qOverlayApplyStatus','الشفافية من 1 إلى 100.',true);return;}
  busy=true;
  $('qOverlayApply').disabled=true;
  status('qOverlayApplyStatus','جاري قراءة المشروع وتطبيق العنصر…');

  host('info').then(function(d){
   info=d;
   if(item.isLut){
    return host('lut',{
     name:item.name,
     stops:item.stops,
     blend:blend==='auto'?item.blend:blend,
     opacity:opacity
    });
   }else{
    var base=getBasePath();
    var localPath=base+'/assets/overlays/'+item.file;
    return host('apply',{
     path:localPath,
     name:item.name,
     documentId:info.id,
     documentWidth:info.width,
     documentHeight:info.height,
     blend:blend==='auto'?item.blend:blend,
     opacity:opacity,
     fit:fit
    });
   }
  }).then(function(res){
   if(item.isLut){
    status('qOverlayApplyStatus','تم تطبيق الفلتر السينمائي «'+item.name+'» كـ Adjustment Layer.');
   }else{
    status('qOverlayApplyStatus','تمت إضافة «'+item.name+'» كـ Smart Object على لاير مستقل.');
   }
  }).catch(function(e){
   status('qOverlayApplyStatus',e.message||String(e),true);
  }).then(function(){
   busy=false;
   $('qOverlayApply').disabled=!chosen;
  });
 }

 function onSession(){
  chosen=null;busy=false;page=1;
  var box=$('qOverlayItems');if(box)box.textContent='';
  var prev=$('qOverlayPreview');if(prev)prev.removeAttribute('src');
  hide($('qOverlayDetail'),true);
 }

 if($('qOverlayReload'))$('qOverlayReload').onclick=function(){if(!busy)load();};
 if($('qOverlayCategory'))$('qOverlayCategory').onchange=function(){page=1;load();};
 if($('qOverlayApply'))$('qOverlayApply').onclick=apply;

 return {
  enter:function(id){if(id==='overlaysView'){onSession();load();}},
  onSession:onSession,
  host:host,
  LOCAL_OVERLAYS_CATALOG:LOCAL_OVERLAYS_CATALOG
 };
})(typeof window!=='undefined'?window:this);
if(typeof module!=='undefined')module.exports=QayemOverlays;

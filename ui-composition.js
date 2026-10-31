(function(){
 var source=document.getElementById('teacherNormal_perspectivePreset');
 function words(ar,en){return document.documentElement.getAttribute('lang')==='en'?en:ar;}
 function camera(value){return value.indexOf('FISHEYE')===0?'fisheye':value.indexOf('VISIBLE LOW')===0?'low':value.indexOf('VISIBLE HIGH')===0?'high':'eye';}
 var names={eye:['مستوى عين الإنسان','Eye level'],low:['سفلي','Low angle'],high:['علوي','High angle'],fisheye:['عين السمكة','Fisheye']};
 var shell=document.createElement('div');shell.className='teacherCameraFour';shell.setAttribute('data-qayem-no-translate','true');var buttons=[];
 if(source){if(!source.value){source.value=QAYEM_TEACHER_CAMERA_PRESETS[2][1];source.dispatchEvent(new Event('change',{bubbles:true}));}for(var i=0;i<source.options.length;i++)(function(index){var option=source.options[index];if(!option.value)return;var key=camera(option.value),b=document.createElement('button');b.type='button';var image=document.createElement('img');image.src='icons/studio/teacher-camera-'+key+'.png';image.alt='';b.appendChild(image);var label=document.createElement('span');b.appendChild(label);b.addEventListener('click',function(){if(source.disabled)return;for(var j=0;j<source.options.length;j++){source.options[j].selected=j===index;if(j===index)source.options[j].setAttribute('selected','');else source.options[j].removeAttribute('selected');}source.value=option.value;source.dispatchEvent(new Event('change',{bubbles:true}));refresh();});buttons.push({button:b,label:label,key:key,value:option.value});shell.appendChild(b);})(i);source.parentNode.insertBefore(shell,source.nextSibling);source.style.display='none';source.classList.add('qayemChoiceSource');}
 function value(id,fallback){var n=document.getElementById(id);return n&&n.value?n.value:fallback;}
 function refresh(){
  var type=value('teacherDesignType','normal'),normal=type==='normal';
  var panel=document.getElementById('teacherComposition');if(!panel)return;
  // This diagram describes the normal teacher controls; cinematic keeps its independently selected crop.
  panel.hidden=!normal;panel.style.display=normal?'':'none';
  buttons.forEach(function(r){r.button.classList.toggle('selected',source.value===r.value);r.button.setAttribute('aria-pressed',String(source.value===r.value));r.button.disabled=source.disabled;r.label.textContent=words(names[r.key][0],names[r.key][1]);});
  if(!normal)return;
  var ratios=document.querySelectorAll('#teacherRatios [data-ratio]'),ratio='9:16';for(var i=0;i<ratios.length;i++)if(ratios[i].getAttribute('aria-checked')==='true')ratio=ratios[i].getAttribute('data-ratio');
  var parts=ratio.split(':'),aspect=Number(parts[0])/Number(parts[1]);if(!isFinite(aspect)||aspect<=0){ratio='9:16';aspect=9/16;}
  var view=camera(source.value),crop=value('teacherNormal_cameraDistance','normal'),position=value('teacherPosition','center');
  var count=Math.max(0,Math.min(3,Number(value('teacherCharacterCount','0'))||0)),fish=document.getElementById('teacherFisheyeEnabled'),scope=fish&&fish.checked?value('teacherFisheyeScope','all'):'off';
  var image=document.getElementById('teacherCompositionImage'),path=QayemCompositionPreview.render(aspect,view,crop,position,count,scope);if(image.getAttribute('src')!==path)image.src=path;
  var stage=document.getElementById('teacherCompositionStage'),available=panel.clientWidth?panel.clientWidth-32:280,width=Math.min(available,310*aspect);stage.style.width=Math.round(width)+'px';stage.style.height=Math.round(width/aspect)+'px';
  var crops={normal:['طبيعي · حتى الخصر','Natural · waist up'],farther:['أبعد قليلًا · حتى الخصر','Farther · waist up'],close:['قريب · الصدر وأعلى البطن','Close · chest and upper abdomen'],veryClose:['قريب جدًا · اقتراب العدسة من الوجه','Very close · lens close to the face']},places={right:['يمين','Right'],left:['يسار','Left'],center:['منتصف','Center']};
  var caption=ratio+' · '+words(names[view][0],names[view][1])+' · '+words(places[position][0],places[position][1])+' · '+words(crops[crop][0],crops[crop][1]);if(count)caption+=' · +'+count;if(scope!=='off')caption+=' · '+words('عين السمكة: ','Fisheye: ')+({all:words('التصميم كله','Entire design'),person:words('المدرّس فقط','Teacher only'),background:words('الخلفية فقط','Background only')})[scope];document.getElementById('teacherCompositionCaption').textContent=caption;image.alt=caption;
 }
 ['teacherNormal_perspectivePreset','teacherNormal_cameraDistance','teacherPosition','teacherDesignType','teacherCharacterCount','teacherFisheyeEnabled','teacherFisheyeScope','uiLanguage'].forEach(function(id){var n=document.getElementById(id);if(n)n.addEventListener('change',refresh);});
 var ratios=document.getElementById('teacherRatios');if(ratios)ratios.addEventListener('click',function(){refresh();setTimeout(refresh,50);});
 ['click','keydown'].forEach(function(type){document.addEventListener(type,function(){setTimeout(refresh,20);});});
 if(typeof MutationObserver==='function'&&ratios)new MutationObserver(refresh).observe(ratios,{attributes:true,subtree:true,attributeFilter:['aria-checked']});if(typeof window!=='undefined')window.addEventListener('resize',refresh);
 refresh();
})();

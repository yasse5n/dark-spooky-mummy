// A reversible visual layer. Never generates a prompt, calls Photoshop or changes source values on load.
var QayemStudioUI = (function () {
  var sections=[], segments=[], queued=false, motion=true, timers=[], saved={}, settingsAction='';
  var sectionKey='qayem.studio.sections.v1',motionKey='qayem.studio.motion.v1';
  function words(ar,en){return document.documentElement.getAttribute('lang')==='en'?en:ar;}
  function node(tag,cls,parent){var n=document.createElement(tag);n.className=cls;if(parent)parent.appendChild(n);return n;}
  function setText(n,value){if(n&&n.textContent!==value)n.textContent=value;}
  function list(selector){return Array.prototype.slice.call(document.querySelectorAll(selector));}
  function persist(){try{window.localStorage.setItem(sectionKey,JSON.stringify(saved));}catch(ignored){}}
  try{var raw=window.localStorage.getItem(sectionKey);if(raw){var parsed=JSON.parse(raw);if(parsed&&typeof parsed==='object')saved=parsed;}}catch(ignored){}
  try{motion=window.localStorage.getItem(motionKey)!=='off';}catch(ignored){}
  try{if(typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)motion=false;}catch(ignored){}
  function animate(element){
    timers.forEach(function(t){clearTimeout(t.id);t.element.classList.remove('studioEntering');});timers=[];
    if(!element||!motion)return;
    element.classList.remove('studioEntering');
    // A class only: unsupported animation CSS leaves the panel fully visible.
    var id=setTimeout(function(){element.classList.add('studioEntering');var end=setTimeout(function(){element.classList.remove('studioEntering');},190);timers.push({id:end,element:element});},0);
    timers.push({id:id,element:element});
  }
  function toggle(record,open,save){
    record.open=open;record.button.setAttribute('aria-expanded',String(open));
    record.body.hidden=!open;if(open)record.body.removeAttribute('hidden');else record.body.setAttribute('hidden','');
    record.body.style.display=open?'block':'none';record.section.classList.toggle('studioCollapsed',!open);var arrow=record.button.querySelector('img');if(arrow)arrow.src='icons/studio/chevron'+(open?'-up':'')+'.png';
    if(save){saved[record.key]=open;persist();}
    if(open&&motion&&save)animate(record.body);
  }
  function wrap(section,index){
    if(section.getAttribute('data-studio-section') || section.getAttribute('data-studio-static'))return;
    var title=section.querySelector('h2')||section.querySelector('.qayemFieldLabel')||section.querySelector('strong');
    if(!title)return;
    var key=section.id||title.id||'card-'+index;
    section.setAttribute('data-studio-section','true');section.classList.add('studioSection');
    var body=node('div','studioSectionBody');body.id=key+'StudioBody';
    while(section.firstChild)body.appendChild(section.firstChild);
    var button=node('button','studioSectionToggle',section);button.type='button';button.setAttribute('aria-controls',body.id);
    button.setAttribute('data-qayem-no-translate','true');
    var marker=node('span','studioSectionMarker',button);marker.setAttribute('aria-hidden','true');
    var caption=node('span','studioSectionCaption',button),chevron=node('img','studioSectionChevron',button);chevron.src='icons/studio/chevron.png';chevron.alt='';
    title.classList.add('studioOriginalTitle');section.appendChild(body);
    var record={section:section,body:body,button:button,title:title,caption:caption,key:key,open:true};sections.push(record);
    var open=typeof saved[key]==='boolean'?saved[key]:!section.classList.contains('instructions');
    toggle(record,open,false);
    button.addEventListener('click',function(){toggle(record,!record.open,true);button.focus();refresh();});
  }
  function segmentSelect(id,kind){
    var source=document.getElementById(id);if(!source||source.classList.contains('qayemChoiceSource'))return;
    var group=node('div','studioSegments');group.id=id+'StudioSegments';group.setAttribute('role','radiogroup');group.setAttribute('data-qayem-no-translate','true');
    if(source.getAttribute('aria-labelledby'))group.setAttribute('aria-labelledby',source.getAttribute('aria-labelledby'));
    var choices=[];
    for(var i=0;i<source.options.length;i++)if(source.options[i].value!=='')choices.push(source.options[i]);
    if(choices.length<2||choices.length>4)return;
    var record={source:source,choices:choices,group:group,buttons:[],kind:kind};
    function choose(at,focus){var option=choices[at];if(!option||source.disabled||option.disabled)return;if(typeof QayemTrial!=='undefined'&&!QayemTrial.canSelect(source.id,option.value,true))return;var changed=source.value!==option.value;
      for(var j=0;j<source.options.length;j++){var match=source.options[j]===option;source.options[j].selected=match;if(match)source.options[j].setAttribute('selected','');else source.options[j].removeAttribute('selected');}
      source.value=option.value;source.setAttribute('value',source.value);if(changed)source.dispatchEvent(new Event('change',{bubbles:true}));refresh();if(focus)record.buttons[at].focus();
    }
    choices.forEach(function(option,index){
      var b=node('button','studioSegment',group);b.type='button';b.setAttribute('role','radio');b.setAttribute('data-source-value',option.value);
      if(kind==='design'){var img=node('img','studioSegmentIcon',b);img.src='icons/studio/'+({normal:'scene',surreal:'spark',cinematic:'film'}[option.value]||'scene')+'.png';img.alt='';}
      node('span','studioSegmentText',b);record.buttons.push(b);
      b.addEventListener('click',function(){choose(index,false);});
      b.addEventListener('keydown',function(event){
        var key=event.key,next=index;if(key==='Home')next=0;else if(key==='End')next=choices.length-1;
        else if(key==='ArrowRight'||key==='ArrowLeft'){var rtl=document.documentElement.getAttribute('dir')==='rtl';next=(index+((rtl?key==='ArrowRight':key==='ArrowLeft')?-1:1)+choices.length)%choices.length;}else return;
        event.preventDefault();var attempts=0;while(choices[next].disabled&&attempts++<choices.length)next=(next+1)%choices.length;choose(next,true);
      });
    });
    source.parentNode.insertBefore(group,source.nextSibling);segments.push(record);source.classList.add('qayemChoiceSource');source.style.display='none';source.setAttribute('aria-hidden','true');source.setAttribute('tabindex','-1');source.addEventListener('change',schedule);
    var title=document.getElementById(source.getAttribute('aria-labelledby'));if(title)title.addEventListener('click',function(){var i=choices.map(function(o){return o.value;}).indexOf(source.value);if(record.buttons[i<0?0:i])record.buttons[i<0?0:i].focus();});
  }
  function refresh(){
    queued=false;
    list('[data-studio-ar]').forEach(function(n){setText(n,words(n.getAttribute('data-studio-ar'),n.getAttribute('data-studio-en')||n.getAttribute('data-studio-ar')));});
    sections.forEach(function(record){setText(record.caption,record.title.textContent);record.button.setAttribute('aria-label',(record.open?words('طي: ','Collapse: '):words('فتح: ','Expand: '))+record.title.textContent);});
    segments.forEach(function(record){record.buttons.forEach(function(b,index){
      var o=record.choices[index],active=record.source.value===o.value;
      b.classList.toggle('selected',active);b.setAttribute('aria-checked',String(active));b.setAttribute('tabindex',active||(!record.source.value&&index===0)?'0':'-1');b.disabled=record.source.disabled||o.disabled;b.setAttribute('title',o.textContent);
      var names={normal:['عادي','Normal'],surreal:['سريالي','Surreal'],cinematic:['سينمائي','Cinematic'],studio:['لون / جردينت','Solid / gradient'],room:['غرفة','Room'],sky:['سماء','Sky'],custom:['وصف مخصص','Custom']};
      var value=record.kind==='cast'?(o.value==='0'?words('لوحده','Solo'):'+'+o.value):(names[o.value]?words(names[o.value][0],names[o.value][1]):o.textContent.split('—')[0].trim());setText(b.querySelector('.studioSegmentText'),value);
    });});
    var toggleAll=document.getElementById('studioToggleAll');if(toggleAll)setText(toggleAll,words('فتح / طي الخانات','Expand / collapse fields'));
    var settings=document.getElementById('studioSettingsToggle');if(settings)settings.setAttribute('aria-label',words('إعدادات الواجهة','Interface settings'));
    var motionLabel=document.getElementById('studioMotionLabel');setText(motionLabel,words('حركة خفيفة في التنقلات','Subtle navigation motion'));
    var checkbox=document.getElementById('studioMotion');if(checkbox)checkbox.checked=motion;
    var activeScreen=typeof QayemNavigation!=='undefined'?QayemNavigation.current():'';if(toggleAll)toggleAll.disabled=!sections.some(function(r){var n=r.section;while(n){if(n.id===activeScreen)return true;n=n.parentNode;}return false;});
    document.body.classList.toggle('studioMotionOff',!motion);
  }
  function schedule(){if(!queued){queued=true;setTimeout(refresh,0);}}
  function toggleSettings(action){
    var settings=document.getElementById('studioSettingsToggle'),panel=document.getElementById('studioSettingsPanel');
    if(!settings||!panel)return false;
    var active=action==='studioSettingsToggle'?'homeSettings':action;
    var open=settings.getAttribute('aria-expanded')!=='true'||(action!=='studioSettingsToggle'&&settingsAction!==active);
    settingsAction=open?active:'';
    ['studioSettingsToggle','homeLanguage','homeFont','homeSettings','homeUpdate'].forEach(function(id){
      var button=document.getElementById(id);if(button){button.setAttribute('aria-controls','studioSettingsPanel');button.setAttribute('aria-expanded',String(open));}
    });
    setUiHidden(panel,!open);
    if(open){
      var main=document.querySelector('main');if(main)main.scrollTop=0;animate(panel);
      var control=document.getElementById(active==='homeLanguage'?'uiLanguage':active==='homeFont'?'uiScaleReset':active==='homeUpdate'?'qayemUpdateCheck':'studioMotion');
      if(control&&!control.disabled)control.focus();
    }
    return open;
  }
  function closeSettings(){
    var panel=document.getElementById('studioSettingsPanel');if(panel)setUiHidden(panel,true);settingsAction='';
    ['studioSettingsToggle','homeLanguage','homeFont','homeSettings','homeUpdate'].forEach(function(id){var b=document.getElementById(id);if(b)b.setAttribute('aria-expanded','false');});
  }
  function initialize(){
    ['teacherDesignType','doctorDesignType'].forEach(function(id){segmentSelect(id,'design');});
    ['teacherNormal_backgroundType','doctorNormal_backgroundType','surrealForegroundMode'].forEach(function(id){segmentSelect(id,'background');});
    ['teacherCharacterCount','doctorCharacterCount'].forEach(function(id){segmentSelect(id,'cast');});
    list('.screen section, .teacherCharacterCard').forEach(wrap);
    var newDesign=document.getElementById('studioNewDesign');if(newDesign)newDesign.addEventListener('click',function(){document.getElementById('openDesign').click();});
    var settings=document.getElementById('studioSettingsToggle'),settingsPanel=document.getElementById('studioSettingsPanel');
    if(settings&&settingsPanel)settings.addEventListener('click',function(){toggleSettings('studioSettingsToggle');});
    ['homeLanguage','homeFont','homeSettings'].forEach(function(id){var b=document.getElementById(id);if(b){b.setAttribute('aria-controls','studioSettingsPanel');b.setAttribute('aria-expanded','false');b.addEventListener('click',function(){toggleSettings(id);});}});
    var checkbox=document.getElementById('studioMotion');if(checkbox)checkbox.addEventListener('change',function(){motion=!!checkbox.checked;try{window.localStorage.setItem(motionKey,motion?'on':'off');}catch(ignored){}if(!motion)animate(null);refresh();});
    var toggleAll=document.getElementById('studioToggleAll');if(toggleAll)toggleAll.addEventListener('click',function(){
      var screen=typeof QayemNavigation!=='undefined'?document.getElementById(QayemNavigation.current()):null;
      var active=sections.filter(function(r){var n=r.section;while(n){if(n===screen)return true;if(n.getAttribute('hidden')!==null&&!n.classList.contains('studioSectionBody'))return false;n=n.parentNode;}return false;});
      var open=active.some(function(r){return !r.open;});active.forEach(function(r){toggle(r,open,true);});refresh();
    });
    ['studioContactToggle','studioPolicyToggle'].forEach(function(id){var button=document.getElementById(id);if(!button)return;button.addEventListener('click',function(){var open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));var target=document.getElementById(button.getAttribute('aria-controls'));setUiHidden(target,!open);var arrow=button.querySelector('img');if(arrow)arrow.src='icons/studio/chevron'+(open?'-up':'')+'.png';if(open)animate(target);});});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'||e.keyCode===27){var open=settingsPanel&&!settingsPanel.hidden;closeSettings();if(open){var b=document.getElementById('homeSettings');if(b)b.focus();}}});
    document.addEventListener('click',function(e){if(settingsPanel&&!settingsPanel.hidden&&!settingsPanel.contains(e.target)&&!e.target.closest('.studioHomeHeader')&&!e.target.closest('#uiScaleBar'))closeSettings();});
    // Update generated titles after mode dependencies and language have settled.
    ['click','change','input'].forEach(function(type){document.addEventListener(type,function(){schedule();setTimeout(schedule,100);});});
    list('main select').forEach(function(s){s.addEventListener('change',function(){schedule();setTimeout(schedule,100);});});
    var lang=document.getElementById('uiLanguage');if(lang)lang.addEventListener('change',function(){schedule();setTimeout(schedule,100);});
    if(typeof MutationObserver==='function')new MutationObserver(schedule).observe(document.querySelector('main'),{childList:true,subtree:true,characterData:true});
    document.body.classList.toggle('homeStudio',typeof QayemNavigation!=='undefined'&&QayemNavigation.current()==='modeHome');
    refresh();
  }
  try{initialize();}catch(error){if(typeof console!=='undefined'&&console.warn)console.warn('QAYEM visual enhancement fallback: '+String(error.message||error));}
  return {enter:function(id){closeSettings();document.body.classList.toggle('homeStudio',id==='modeHome');animate(document.getElementById(id));schedule();},refresh:refresh,toggleSettings:toggleSettings};
})();

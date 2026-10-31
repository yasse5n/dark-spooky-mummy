// CEP-native option popups can render at a different scale from their control.
// Keep the real select authoritative; draw one accessible, unscaled HTML listbox.
var QayemDropdowns=(function(){
 'use strict';
 var records=[],opened=null,popup=null,queued=false,serial=0;
 function all(q,n){return Array.prototype.slice.call((n||document).querySelectorAll(q));}
 function text(n,v){if(n.textContent!==v)n.textContent=v;}
 function attr(n,k,v){v=String(v);if(n.getAttribute(k)!==v)n.setAttribute(k,v);}
 function blocked(o){return o.disabled||o.hidden||(o.parentNode&&o.parentNode.tagName==='OPTGROUP'&&o.parentNode.disabled);}
 function close(focus){var old=opened;if(old)attr(old.button,'aria-expanded','false');opened=null;if(popup&&popup.parentNode)popup.parentNode.removeChild(popup);popup=null;if(focus&&old)old.button.focus();}
 function choose(r,index){
  var o=r.source.options[index];if(!o||r.source.disabled||blocked(o))return;
  if(typeof QayemTrial!=='undefined'&&!QayemTrial.canSelect(r.source.id,o.value,true))return;
  var changed=r.source.value!==o.value;
  for(var i=0;i<r.source.options.length;i++){var yes=i===index;r.source.options[i].selected=yes;if(yes)r.source.options[i].setAttribute('selected','');else r.source.options[i].removeAttribute('selected');}
  r.source.value=o.value;r.source.setAttribute('value',o.value);close(true);
  if(changed)r.source.dispatchEvent(new Event('change',{bubbles:true}));refresh(r);
 }
 function focusAt(r,index,delta){
  var options=all('[role="option"]',popup),count=options.length;
  for(var n=0;n<count;n++){index=(index+count)%count;if(options[index].getAttribute('aria-disabled')!=='true'){options[index].focus();return;}index+=delta||1;}
 }
 function position(){
  if(!opened||!popup)return;var b=opened.button.getBoundingClientRect(),w=document.documentElement.clientWidth||window.innerWidth,h=window.innerHeight||document.documentElement.clientHeight;
  if(b.width<1||b.height<1||b.bottom<0||b.top>h){close(false);return;}
  var below=h-b.bottom-12,above=b.top-12,up=below<110&&above>below,space=Math.max(60,up?above:below),width=Math.min(b.width,Math.max(120,w-16));
  popup.style.width=width+'px';popup.style.left=Math.max(8,Math.min(b.left,w-width-8))+'px';popup.style.maxHeight=Math.min(310,space)+'px';
  popup.style.top=up?'auto':(b.bottom+5)+'px';popup.style.bottom=up?(h-b.top+5)+'px':'auto';
 }
 function open(r){
  if(r.source.disabled)return;if(opened===r){close(false);return;}close(false);opened=r;
  popup=document.createElement('div');popup.id=r.popupId;popup.className='qDropdownPopup';popup.setAttribute('role','listbox');popup.setAttribute('dir',document.documentElement.getAttribute('dir')||'rtl');
  var label=r.source.getAttribute('aria-labelledby');if(label)popup.setAttribute('aria-labelledby',label);else popup.setAttribute('aria-label',r.source.getAttribute('aria-label')||r.label.textContent);
  var css=window.getComputedStyle(r.button);popup.style.fontSize=css.fontSize;popup.style.fontFamily=css.fontFamily;popup.style.lineHeight=css.lineHeight;
  for(var i=0;i<r.source.options.length;i++)(function(index){
   var o=r.source.options[index];if(o.hidden)return;var item=document.createElement('button');item.type='button';item.className='qDropdownOption';item.id=r.popupId+'_'+index;item.setAttribute('role','option');item.setAttribute('tabindex','-1');item.setAttribute('data-option-index',String(index));item.setAttribute('aria-selected',String(index===r.source.selectedIndex));item.setAttribute('aria-disabled',String(blocked(o)));item.textContent=o.textContent;
   if(blocked(o))item.disabled=true;
   item.addEventListener('click',function(){choose(r,index);});popup.appendChild(item);
  })(i);
  popup.addEventListener('keydown',function(e){
   var options=all('[role="option"]',popup),at=options.indexOf(document.activeElement),key=e.key;
   if(key==='Escape'){e.preventDefault();e.stopPropagation();close(true);return;}
   if(key==='Tab'){close(false);return;}
   if(key==='ArrowDown'||key==='ArrowUp'||key==='Home'||key==='End'){e.preventDefault();focusAt(r,key==='Home'?0:key==='End'?options.length-1:at+(key==='ArrowUp'?-1:1),key==='ArrowUp'||key==='End'?-1:1);}
  });
  document.body.appendChild(popup);attr(r.button,'aria-expanded','true');position();
  if(popup){var options=all('[role="option"]',popup),at=0;for(var j=0;j<options.length;j++)if(options[j].getAttribute('aria-selected')==='true')at=j;focusAt(r,at,1);}
 }
 function refresh(r){
  var source=r.source,selected=source.options[source.selectedIndex],hidden=source.hidden||source.classList.contains('qayemChoiceSource');
  if(r.wrap.hidden!==hidden)r.wrap.hidden=hidden;
  r.button.disabled=source.disabled;text(r.label,selected?selected.textContent:'—');
  var labelled=source.getAttribute('aria-labelledby');if(labelled)attr(r.button,'aria-labelledby',labelled+' '+r.label.id);
  if(opened===r){if(hidden||source.disabled)close(false);else close(true);}
 }
 function build(source){
  if(source.getAttribute('data-q-dropdown')||source.multiple||Number(source.size)>1||source.classList.contains('qayemChoiceSource')||!source.id)return;
  var wrap=document.createElement('div');wrap.className='qDropdown';var button=document.createElement('button');button.type='button';button.id=source.id+'Dropdown';button.className='qDropdownTrigger';button.setAttribute('role','combobox');button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');
  var label=document.createElement('span');label.className='qDropdownValue';label.id=button.id+'Value';button.appendChild(label);var arrow=document.createElement('span');arrow.className='qDropdownArrow';arrow.textContent='⌄';arrow.setAttribute('aria-hidden','true');button.appendChild(arrow);wrap.appendChild(button);
  var r={source:source,wrap:wrap,button:button,label:label,popupId:'qDropdownList'+(++serial)};button.setAttribute('aria-controls',r.popupId);source.parentNode.insertBefore(wrap,source.nextSibling);source.setAttribute('data-q-dropdown','true');source.classList.add('qDropdownSource');source.setAttribute('aria-hidden','true');source.setAttribute('tabindex','-1');records.push(r);
  button.addEventListener('click',function(){open(r);});button.addEventListener('keydown',function(e){if(['ArrowDown','ArrowUp','Home','End'].indexOf(e.key)>=0){e.preventDefault();open(r);}});
  all('label[for]').filter(function(n){return n.getAttribute('for')===source.id;}).forEach(function(n){n.addEventListener('click',function(e){e.preventDefault();button.focus();});});
  source.addEventListener('change',function(){refresh(r);});
  if(typeof MutationObserver==='function')new MutationObserver(function(){refresh(r);}).observe(source,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['disabled','hidden','selected','label','value','class']});
  refresh(r);
 }
 function scan(){queued=false;all('select').forEach(build);}
 function schedule(){if(!queued){queued=true;setTimeout(scan,0);}}
 document.addEventListener('mousedown',function(e){if(opened&&popup&&!popup.contains(e.target)&&!opened.button.contains(e.target))close(false);});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&opened){e.preventDefault();close(true);}},true);
 document.addEventListener('click',function(e){if(opened&&e.target.closest&&e.target.closest('.backButton,.studioHomeBack,.studioSegment'))close(false);});
 document.addEventListener('scroll',function(e){if(opened&&popup&&!popup.contains(e.target))close(false);},true);window.addEventListener('resize',function(){close(false);});window.addEventListener('blur',function(){close(false);});
 if(typeof MutationObserver==='function')new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
 scan();return {close:close,refresh:function(){records.forEach(refresh);scan();}};
})();

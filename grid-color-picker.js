// In-panel palette: no native dialog, external service or Photoshop color changes.
var QayemGridColorPicker=(function(){
 'use strict';
 function hex(value){var s=String(value).replace(/^\s+|\s+$/g,'');if(/^#?[a-f0-9]{3}$/i.test(s)){s=s.replace('#','');s=s[0]+s[0]+s[1]+s[1]+s[2]+s[2];}return /^#?[a-f0-9]{6}$/i.test(s)?'#'+s.replace('#','').toUpperCase():null;}
 function hsv(color,oldHue){var s=color.slice(1),r=parseInt(s.slice(0,2),16)/255,g=parseInt(s.slice(2,4),16)/255,b=parseInt(s.slice(4,6),16)/255,max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,h=oldHue||0;if(d){h=max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4;h*=60;}return {h:h,s:max?d/max:0,v:max};}
 function rgb(value){var h=(value.h%360)/60,s=value.s,v=value.v,c=v*s,x=c*(1-Math.abs(h%2-1)),m=v-c,a=h<1?[c,x,0]:h<2?[x,c,0]:h<3?[0,c,x]:h<4?[0,x,c]:h<5?[x,0,c]:[c,0,x];return '#'+a.map(function(n){var b=Math.round((n+m)*255).toString(16);return b.length===1?'0'+b:b;}).join('').toUpperCase();}
 function bind(onChange){
  function $(id){return document.getElementById(id);}
  var input=$('qGridColor'),button=$('qGridColorPick'),palette=$('qGridColorPalette'),map=$('qGridColorMap'),mark=$('qGridColorMarker'),hue=$('qGridColorHue'),sat=$('qGridColorSaturation'),val=$('qGridColorValue'),swatch=$('qGridColorSwatch'),sample=$('qGridColorSample'),label=$('qGridColorValueLabel');
  var current=hsv(hex(input.value)||'#FF2940',0),before=input.value,dragging=false;
  function visible(show){palette.hidden=!show;palette.style.display=show?'':'none';button.setAttribute('aria-expanded',show?'true':'false');if(!show)dragging=false;}
  function paint(){var color=hex(input.value);if(color){swatch.style.backgroundColor=color;sample.style.backgroundColor=color;label.textContent=color;}map.style.backgroundColor='hsl('+current.h+',100%,50%)';mark.style.left=(current.s*100)+'%';mark.style.top=((1-current.v)*100)+'%';hue.value=Math.round(current.h);sat.value=Math.round(current.s*100);val.value=Math.round(current.v*100);$('qGridColorSaturationValue').textContent=sat.value+'%';$('qGridColorBrightnessValue').textContent=val.value+'%';}
  function notify(){input.dispatchEvent(new Event('change',{bubbles:true}));}
  function choose(){input.value=rgb(current);paint();notify();}
  function sync(){var color=hex(input.value);if(color){current=hsv(color,current.h);paint();}if(onChange)onChange();}
  input.addEventListener('input',sync);input.addEventListener('change',function(){var color=hex(input.value);if(color)input.value=color;sync();});
  button.onclick=function(){if(button.disabled)return;if(button.getAttribute('aria-expanded')==='true'){visible(false);return;}before=input.value;sync();visible(true);map.focus();};
  hue.addEventListener('input',function(){current.h=Number(this.value);choose();});hue.addEventListener('change',function(){current.h=Number(this.value);choose();});
  sat.addEventListener('input',function(){current.s=Number(this.value)/100;choose();});sat.addEventListener('change',function(){current.s=Number(this.value)/100;choose();});
  val.addEventListener('input',function(){current.v=Number(this.value)/100;choose();});val.addEventListener('change',function(){current.v=Number(this.value)/100;choose();});
  function pick(e){var box=map.getBoundingClientRect();if(!box.width||!box.height)return;var p=e.touches&&e.touches.length?e.touches[0]:e;current.s=Math.max(0,Math.min(1,(p.clientX-box.left)/box.width));current.v=1-Math.max(0,Math.min(1,(p.clientY-box.top)/box.height));choose();if(e.cancelable)e.preventDefault();}
  map.addEventListener('mousedown',function(e){if(e.button!==0)return;dragging=true;map.focus();pick(e);});
  document.addEventListener('mousemove',function(e){if(dragging)pick(e);});document.addEventListener('mouseup',function(){dragging=false;});window.addEventListener('blur',function(){dragging=false;});
  map.addEventListener('touchstart',function(e){dragging=true;pick(e);});map.addEventListener('touchmove',function(e){if(dragging)pick(e);});map.addEventListener('touchend',function(){dragging=false;});map.addEventListener('touchcancel',function(){dragging=false;});
  map.addEventListener('keydown',function(e){var step=e.shiftKey?0.1:0.01;if(e.key==='ArrowLeft')current.s-=step;else if(e.key==='ArrowRight')current.s+=step;else if(e.key==='ArrowUp')current.v+=step;else if(e.key==='ArrowDown')current.v-=step;else return;current.s=Math.max(0,Math.min(1,current.s));current.v=Math.max(0,Math.min(1,current.v));choose();e.preventDefault();});
  function cancel(){input.value=before;sync();notify();visible(false);button.focus();}
  $('qGridColorDone').onclick=function(){visible(false);button.focus();};$('qGridColorCancel').onclick=cancel;
  palette.addEventListener('keydown',function(e){if(e.key==='Escape'){cancel();e.stopPropagation();}});
  document.addEventListener('click',function(e){if(!palette.hidden&&!palette.contains(e.target)&&!button.contains(e.target)&&e.target!==input)visible(false);});
  var presets=palette.querySelectorAll('[data-grid-color]');for(var i=0;i<presets.length;i++)presets[i].onclick=function(){input.value=this.getAttribute('data-grid-color');sync();notify();};
  // Saved UI state restores text inputs programmatically; reconcile on page entry.
  visible(false);sync();return {sync:sync,close:function(){visible(false);}};
 }
 return {bind:bind};
})();

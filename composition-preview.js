// A schematic SVG preview; no photographs, Photoshop edits or generated-image claim.
var QayemCompositionPreview={render:function(aspect,view,crop,position,count,scope){
 var w=300,h=w/aspect,x=position==='right'?w*.72:position==='left'?w*.28:w*.5;
 var hh=h*({veryClose:.70,close:.39,normal:.29,farther:.25}[crop]||.29),hw=Math.min(hh*.72,w/((crop==='veryClose'&&!count?1.08:1.4)+count*.82));hh=hw/.72;
 x=Math.max(hw/2+7,Math.min(w-hw/2-7,x));var top=h*.035,horizon=h*(view==='low'?.78:view==='high'?.22:.48),fishBg=scope==='all'||scope==='background',fishPerson=scope==='all'||scope==='person';
 var s='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'"><defs><clipPath id="frame"><rect width="'+w+'" height="'+h+'"/></clipPath></defs><g clip-path="url(#frame)"><rect width="'+w+'" height="'+h+'" fill="#171c24"/>';
 for(var k=0;k<7;k++){var a=k*w/6;s+='<path d="M '+a+' 0 '+(fishBg?'Q '+(w/2)+' '+h/2+' '+a+' '+h:'L '+(w/2+(a-w/2)*.58)+' '+horizon+' L '+a+' '+h)+'" fill="none" stroke="#3a404c" stroke-width="1"/>';}
 for(k=0;k<8;k++){var y=k*h/7;s+='<path d="M 0 '+y+(fishBg?' Q '+w/2+' '+(y+(y<h/2?-h*.12:h*.12))+' '+w+' '+y:' L '+w+' '+y)+'" fill="none" stroke="#333943" stroke-width="1"/>';}
 function person(cx,t,headH,headW,main){
  var shoulder=headW*(main&&fishPerson?2.75:2.18),neck=t+headH*.94,sy=t+headH*1.19,base=Math.max(h+15,sy+headH),fill=main?'#b8c5cc':'#647780',light=main?'#e6eef0':'#91a3aa';
  var p='<path d="M '+(cx-headW*.23)+' '+neck+' L '+(cx-headW*.23)+' '+sy+' L '+(cx-shoulder/2)+' '+(sy+headH*.13)+' Q '+(cx-shoulder*.61)+' '+(sy+headH*.36)+' '+(cx-shoulder*.54)+' '+base+' L '+(cx+shoulder*.54)+' '+base+' Q '+(cx+shoulder*.61)+' '+(sy+headH*.36)+' '+(cx+shoulder/2)+' '+(sy+headH*.13)+' L '+(cx+headW*.23)+' '+sy+' L '+(cx+headW*.23)+' '+neck+' Z" fill="'+fill+'"/>';
  p+='<ellipse cx="'+cx+'" cy="'+(t+headH/2)+'" rx="'+headW/2+'" ry="'+headH/2+'" fill="'+light+'"/>';
  if(view==='high')p+='<ellipse cx="'+cx+'" cy="'+(t+headH*.19)+'" rx="'+headW*.39+'" ry="'+headH*.15+'" fill="#7f919b"/>';
  if(view==='low')p+='<path d="M '+(cx-headW*.4)+' '+(t+headH*.78)+' Q '+cx+' '+(t+headH*1.04)+' '+(cx+headW*.4)+' '+(t+headH*.78)+' Q '+cx+' '+(t+headH*.94)+' '+(cx-headW*.4)+' '+(t+headH*.78)+'" fill="#758a93"/>';
  var ey=t+headH*(view==='low'?.53:view==='high'?.65:.55);p+='<path d="M '+(cx-headW*.2)+' '+ey+' h 2 M '+(cx+headW*.2)+' '+ey+' h 2" stroke="#526572" stroke-width="3"/>';
  return p;
 }
 for(k=0;k<count;k++){var n=document.getElementById('teacherCharacterLocation'+k),input=n?n.value:k%2?'behindRight':'behindLeft',side=/Right/.test(input)?1:-1,spread=hw*(.88+k*.11),cx=Math.max(hw*.4+4,Math.min(w-hw*.4-4,x+side*spread));s+=person(cx,top+hh*.1,hh*.8,hw*.8,false);}
 s+=person(x,top,hh,hw,true);
 s+='<path d="M 6 20 V 6 H 20 M '+(w-20)+' 6 H '+(w-6)+' V 20 M 6 '+(h-20)+' V '+(h-6)+' H 20 M '+(w-20)+' '+(h-6)+' H '+(w-6)+' V '+(h-20)+'" fill="none" stroke="#ff3a62" stroke-width="2"/></g></svg>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}};

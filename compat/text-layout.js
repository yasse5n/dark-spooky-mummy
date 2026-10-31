// ES3-compatible geometry shared by UXP, CEP and its ExtendScript backend.
 var QayemTextLayout=(function(){
  function num(v,label,min,max){v=Number(v);if(!isFinite(v)||v<min||v>max)throw new Error(label);return v;}
  function orientation(w,h){return w/h>1.05?'landscape':h/w>1.05?'portrait':'square';}
  function positions(w,h){return ['top','center','bottom','left','right'];}
  function template(list,id){
   for(var i=0;i<list.length;i++)if(list[i].id===String(id))return list[i];
   throw new Error('اختار قالب كتابة من القائمة.');
  }
  function validate(request,list){
   var t;
   if(request.customTemplate&&request.customTemplate.id===request.templateId)t=request.customTemplate;
   else t=template(list,request.templateId);
   var texts=request.texts;
   if(!texts||texts.length!==t.fields.length)throw new Error('يرجى ملء جميع حقول الكتابة ('+t.fields.length+').');
   var result=[];for(var i=0;i<texts.length;i++){
    var s=String(texts[i]).replace(/^\s+|\s+$/g,'');
    if(!s||s.length>120||/[\r\n]/.test(s))throw new Error('كل سطر مطلوب، وبحد أقصى ١٢٠ حرفًا بدون سطر جديد.');result.push(s);
   }
   if(!/^(auto|dinMedium|dinBold)$/.test(request.fontMode))throw new Error('اختار خط الكتابة.');
   return {template:t,texts:result};
  }
  function plan(w,h,bounds,settings){
   w=num(w,'مقاس المشروع غير صالح.',1,300000);h=num(h,'مقاس المشروع غير صالح.',1,300000);
   settings=settings||{};
   var wp=orientation(w,h)==='portrait'?85:65;
   if(settings.socialRatio==='1:1')wp=78;
   else if(settings.socialRatio==='4:5')wp=84;
   else if(settings.socialRatio==='9:16')wp=90;
   else if(settings.socialRatio==='16:9')wp=65;
   if(settings.widthPercent===undefined)settings.widthPercent=wp;
   if(settings.marginPercent===undefined)settings.marginPercent=4;
   if(settings.offsetX===undefined)settings.offsetX=0;
   if(settings.offsetY===undefined)settings.offsetY=0;
   if(settings.position===undefined)settings.position='center';
   var pct=num(settings.widthPercent,'عرض القالب يكون بين ٢٠ و٩٠ بالمئة.',20,90)/100;
   var margin=num(settings.marginPercent,'الهامش يكون بين ٢ و١٥ بالمئة.',2,15)/100;
   var ox=num(settings.offsetX,'الإزاحة الأفقية تكون بين -٢٠ و٢٠ بالمئة.',-20,20)*w/100;
   var oy=num(settings.offsetY,'الإزاحة الرأسية تكون بين -٢٠ و٢٠ بالمئة.',-20,20)*h/100;
   var pos=settings.position||'center';
   var mw=w*margin,mh=h*margin,bw=bounds[2]-bounds[0],bh=bounds[3]-bounds[1];
   if(bw<=0||bh<=0)throw new Error('حدود القالب غير صالحة.');
   var scale=Math.min(w*pct/bw,(w-2*mw)/bw,(h-2*mh)/bh),width=bw*scale,height=bh*scale;
   var x=pos==='left'?mw:pos==='right'?w-mw-width:(w-width)/2;
   var y=pos==='top'?mh:pos==='bottom'?h-mh-height:(h-height)/2;
   x=Math.max(mw,Math.min(w-mw-width,x+ox));y=Math.max(mh,Math.min(h-mh-height,y+oy));
   return {x:x,y:y,width:width,height:height,scale:scale,marginX:mw,marginY:mh,orientation:orientation(w,h)};
  }
 function fonts(t,mode,available){
  if(!available||!available.length)throw new Error('تعذّر قراءة الخطوط المثبتة في Photoshop. اضغط تحديث المشروع وحاول تاني.');
  function has(name){for(var i=0;i<available.length;i++)if(available[i]===name)return true;return false;}
  var preferred=mode==='dinMedium'?'DINNextLTW23-Medium':'DINNextLTW23-Bold',fallback=has(preferred)?preferred:has('DINNextLTW23-Medium')?'DINNextLTW23-Medium':has('DINNextLTW23-Bold')?'DINNextLTW23-Bold':null;
  // Use a face already available to Photoshop; never install fonts or change their registration.
  var alternatives=mode==='dinMedium'?['Tahoma','ArialMT','AdobeArabic-Regular','SegoeUI']:['Tahoma-Bold','Arial-BoldMT','AdobeArabic-Bold','SegoeUI-Bold','Tahoma','ArialMT','AdobeArabic-Regular','SegoeUI'];
  for(var a=0;!fallback&&a<alternatives.length;a++)if(has(alternatives[a]))fallback=alternatives[a];
  var selected=[],missing=[];
  for(var j=0;j<t.fields.length;j++){
   var original=t.fields[j].font;
   if(mode==='auto'&&has(original))selected.push(original);
   else {if(!fallback)throw new Error('خط القالب والبدائل غير متاحة داخل Photoshop. البلاجن لا يثبّت خطوطًا ولا يغيّر خطوط الجهاز.');selected.push(fallback);if(mode==='auto')missing.push(original);}
  }
  return {selected:selected,missing:missing};
 }
 // Native text bounds are measured again after editing; keep its slot center.
 function fit(bounds,slot){
  var w=bounds[2]-bounds[0],h=bounds[3]-bounds[1];if(w<=0||h<=0)throw new Error('تعذّر قياس النص الجديد.');
  var s=Math.min(1,(slot[2]-slot[0])/w,(slot[3]-slot[1])/h);
  return {scale:s,centerX:(slot[0]+slot[2])/2,centerY:(slot[1]+slot[3])/2};
 }
 function stringify(v){
  if(v===null)return 'null';var type=typeof v;
  if(type==='string')return '"'+v.replace(/["\\\u0000-\u001f\u2028\u2029]/g,function(c){var n=c.charCodeAt(0).toString(16);return '\\u'+('0000'+n).slice(-4);})+'"';
  if(type==='number')return isFinite(v)?String(v):'null';if(type==='boolean')return String(v);
  var list=[],i;if(v instanceof Array){for(i=0;i<v.length;i++)list.push(stringify(v[i]));return '['+list.join(',')+']';}
  for(var k in v)if(Object.prototype.hasOwnProperty.call(v,k))list.push(stringify(k)+':'+stringify(v[k]));return '{'+list.join(',')+'}';
 }
 function parse(source){
  var s=String(source),p=0;
  function ws(){while(/\s/.test(s.charAt(p))&&p<s.length)p++;}
  function value(){ws();var c=s.charAt(p),v;
   if(c==='"'){p++;v='';while(p<s.length){c=s.charAt(p++);if(c==='"')return v;if(c==='\\'){c=s.charAt(p++);if(c==='u'){var hex=s.substr(p,4);if(!/^[0-9a-f]{4}$/i.test(hex))throw new Error('Invalid JSON');v+=String.fromCharCode(parseInt(hex,16));p+=4;}else{var map={'"':'"','\\':'\\','/':'/','b':'\b','f':'\f','n':'\n','r':'\r','t':'\t'};if(!Object.prototype.hasOwnProperty.call(map,c))throw new Error('Invalid JSON');v+=map[c];}}else{if(c.charCodeAt(0)<32)throw new Error('Invalid JSON');v+=c;}}throw new Error('Invalid JSON');}
   if(c==='['||c==='{'){var arr=c==='[',out=arr?[]:{},end=arr?']':'}';p++;ws();if(s.charAt(p)===end){p++;return out;}while(true){ws();if(arr)out.push(value());else{if(s.charAt(p)!=='"')throw new Error('Invalid JSON');var key=value();ws();if(s.charAt(p++)!==':')throw new Error('Invalid JSON');if(key==='__proto__'||key==='constructor'||key==='prototype')throw new Error('Invalid JSON key');out[key]=value();}ws();c=s.charAt(p++);if(c===end)return out;if(c!==',')throw new Error('Invalid JSON');}}
   for(var i=0;i<3;i++){var words=['true','false','null'];if(s.substr(p,words[i].length)===words[i]){p+=words[i].length;return i===0?true:i===1?false:null;}}
   var match=/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(s.slice(p));if(match){p+=match[0].length;return Number(match[0]);}throw new Error('Invalid JSON');
  }
  var result=value();ws();if(p!==s.length)throw new Error('Invalid JSON');return result;
 }
 return {orientation:orientation,positions:positions,template:template,validate:validate,plan:plan,fonts:fonts,fit:fit,parse:parse,stringify:stringify};
})();
if(typeof module!=='undefined')module.exports=QayemTextLayout;

// Explicit evaluation result: ExtendScript loads this module into a caller-local scope.
QayemTextLayout;

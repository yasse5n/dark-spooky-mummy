// ES3 geometry shared by the preview and the Photoshop host. Pixel coordinates.
var QayemGridLayout=(function(){
 function n(v,min,max,label){v=Number(v);if(!isFinite(v)||v<min||v>max)throw new Error(label||'قيمة الشبكة غير صالحة');return v;}
 function plan(width,height,options,area){
  var w=n(width,1,300000),h=n(height,1,300000),o=options||{};
  var b=area||[0,0,w,h],margin=n(o.margin,0,100000,'الهامش غير صالح');
  var x=n(b[0],0,w)+margin,y=n(b[1],0,h)+margin,r=n(b[2],0,w)-margin,d=n(b[3],0,h)-margin;
  var bw=r-x,bh=d-y;if(bw<2||bh<2)throw new Error('الهامش أكبر من مساحة التصميم. قلّل الهامش.');
  var lines=[],type=o.type;
  function line(a,b,c,e){lines.push([a,b,c,e]);}
  function vertical(v){line(v,y,v,d);}function horizontal(v){line(x,v,r,v);}
  if(o.border!==false){vertical(x);vertical(r);horizontal(y);horizontal(d);}
  if(type==='thirds'||type==='golden'){
   var a=type==='thirds'?1/3:1/(1+(1+Math.sqrt(5))/2);
   vertical(x+bw*a);vertical(x+bw*(1-a));horizontal(y+bh*a);horizontal(y+bh*(1-a));
  }else if(type==='columns'||type==='modular'){
   var columns=n(o.columns,1,24,'عدد الأعمدة من 1 إلى 24'),rows=type==='modular'?n(o.rows,1,24,'عدد الصفوف من 1 إلى 24'):1,g=n(o.gutter,0,100000,'المسافة بين الخانات غير صالحة');
   if(columns%1||rows%1)throw new Error('الأعمدة والصفوف أعداد صحيحة.');
   var cw=(bw-(columns-1)*g)/columns,rh=(bh-(rows-1)*g)/rows;
   if(cw<=0||rh<=0)throw new Error('المسافات أكبر من المساحة المتاحة.');
   for(var i=1;i<columns;i++){var v=x+i*cw+(i-1)*g;vertical(v);if(g>0)vertical(v+g);}
   for(var j=1;j<rows;j++){var v2=y+j*rh+(j-1)*g;horizontal(v2);if(g>0)horizontal(v2+g);}
  }else if(type==='hierarchy'){
   var raw=String(o.ratios||'1:2:1').split(':'),ratios=[],sum=0;
   if(raw.length<2||raw.length>24)throw new Error('اكتب نسب الأعمدة مثل 1:2:1، من عمودين إلى 24.');
   for(var k=0;k<raw.length;k++){var q=n(raw[k],0.01,1000,'نسب الأعمدة لازم تكون أرقامًا موجبة.');ratios.push(q);sum+=q;}
   var gap=n(o.gutter,0,100000),space=bw-gap*(ratios.length-1),at=x;
   if(space<=0)throw new Error('المسافات أكبر من المساحة المتاحة.');
   for(var z=0;z<ratios.length-1;z++){at+=space*ratios[z]/sum;vertical(at);if(gap>0){at+=gap;vertical(at);}}
  }else if(type==='diagonal'){
   line(x,y,r,d);line(r,y,x,d);vertical(x+bw/2);horizontal(y+bh/2);
  }else throw new Error('اختار نوع الشبكة.');
  var color=String(o.color||'');if(!/^#[0-9a-f]{6}$/i.test(color))throw new Error('لون الخط غير صالح');
  var opacity=n(o.opacity,1,100,'الشفافية من 1 إلى 100'),thickness=n(o.thickness,0.5,20,'سمك الخط من 0.5 إلى 20 بكسل');
  var output=o.output;if(output!=='layer'&&output!=='guides')throw new Error('اختار طريقة إضافة الشبكة.');
  if(type==='diagonal'&&output==='guides')throw new Error('الخطوط القطرية تحتاج لاير مستقل؛ أدلة Photoshop أفقية ورأسية فقط.');
  return {width:w,height:h,lines:lines,color:color,opacity:opacity,thickness:thickness,output:output,type:type,bounds:[x,y,r,d]};
 }
 return {plan:plan};
})();
if(typeof module!=='undefined')module.exports=QayemGridLayout;
QayemGridLayout;

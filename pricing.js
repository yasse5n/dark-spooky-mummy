(function(root,factory){
  var api=factory(root);
  if(typeof window==='undefined'&&typeof module==='object'&&module.exports)module.exports=api;
  else {root.QayemPricing=api;api.mount(root.document);}
})(this,function(root){
  'use strict';
  function calculate(v){
    var limits={rate:[0.01,1000000],hours:[0.05,1000],quantity:[1,10000],revisions:[0,100],rush:[0,300]};
    Object.keys(limits).forEach(function(k){var n=v[k];if(typeof n!=='number'||!isFinite(n)||n<limits[k][0]||n>limits[k][1])throw Error('راجع الأرقام المطلوبة وحدود كل خانة.');});
    if(Math.floor(v.quantity)!==v.quantity||Math.floor(v.revisions)!==v.revisions)throw Error('عدد التصميمات وجولات التعديل لازم يكون رقمًا صحيحًا.');
    function round(n){return Math.round(n*100+1e-8)/100;}
    var hours=v.hours*v.quantity,labor=round(hours*v.rate),rush=round(labor*v.rush/100),total=round(labor+rush);
    return {hours:hours,labor:labor,cost:labor,rush:rush,total:total,perDesign:round(total/v.quantity),revisions:v.revisions};
  }
  function mount(doc){
    function $(id){return doc.getElementById(id);}
    if(!$('qPriceForm'))return;
    var current=null;
    var names={rate:'Rate',hours:'Hours',quantity:'Quantity',revisions:'Revisions',rush:'Rush'};
    var symbols={EGP:'ج.م',USD:'دولار',SAR:'ر.س',AED:'د.إ'};
    function money(n){return n.toLocaleString('ar-EG',{minimumFractionDigits:0,maximumFractionDigits:2})+' '+symbols[$('qPriceCurrency').value];}
    function paint(){
      var values={};Object.keys(names).forEach(function(k){var raw=$('qPrice'+names[k]).value;values[k]=raw.trim()===''?NaN:Number(raw);});
      try{
        current=calculate(values);$('qPriceResult').hidden=false;$('qPriceResult').style.display='';$('qPriceError').textContent='';$('qPriceCopy').disabled=false;
        $('qPriceTotal').textContent=money(current.total);
        $('qPriceLabor').textContent=money(current.labor);$('qPriceRushTotal').textContent=money(current.rush);
        $('qPriceUnit').textContent=money(current.perDesign)+' للتصميم · '+current.hours.toLocaleString('ar-EG',{maximumFractionDigits:2})+' ساعة للمشروع شامل التعديلات';
      }catch(e){current=null;$('qPriceResult').hidden=true;$('qPriceResult').style.display='none';$('qPriceCopy').disabled=true;$('qPriceError').textContent=$('qPriceRate').value?e.message:'ابدأ بكتابة سعر ساعة شغلك بالعملة اللي اخترتها.';}
    }
    $('qPriceForm').addEventListener('submit',function(e){e.preventDefault();paint();});
    $('qPriceForm').addEventListener('input',paint);$('qPriceForm').addEventListener('change',paint);
    $('qPriceCopy').onclick=function(){
      paint();if(!current)return;
      var type=$('qPriceType').options[$('qPriceType').selectedIndex].textContent;
      var text='عرض سعر — '+type+'\nعدد التصميمات: '+$('qPriceQuantity').value+'\nجولات التعديل المشمولة لكل تصميم: '+$('qPriceRevisions').value+'\nإجمالي المشروع: '+money(current.total)+'\nسعر التصميم: '+money(current.perDesign)+'\nساعات التنفيذ تشمل جولات التعديل المذكورة.\nالسعر مبني على نطاق الشغل الموضح؛ أي إضافات تُتفق بشكل منفصل.';
      $('qPriceQuote').value=text;$('qPriceQuote').hidden=false;
      if(typeof root.writeQayemClipboard==='function')root.writeQayemClipboard(text).then(function(ok){$('qPriceStatus').textContent=ok?'تم نسخ عرض السعر.':'عرض السعر ظاهر تحت؛ حدده وانسخه.';});
      else $('qPriceStatus').textContent='عرض السعر جاهز للنسخ.';
    };
    paint();
  }
  return {calculate:calculate,mount:mount};
});

function createCepTextTemplateEngine(){
 if(!window.__adobe_cep__||typeof window.__adobe_cep__.evalScript!=='function')throw new Error('إضافة الكتابة متاحة من داخل Photoshop.');
 let busy=false;
 const literal=value=>JSON.stringify(value).replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 function call(method,payload){return new Promise((resolve,reject)=>{
  let root;try{root=decodeURI(window.__adobe_cep__.getSystemPath('extension')).replace(/^file:\/\//,'').replace(/^\/([A-Za-z]:\/)/,'$1').replace(/\\/g,'/').replace(/\/$/,'');}catch(e){reject(e);return;}
  const argument=(method==='run'||method==='runActive'||method==='inspectPSD')?literal(encodeURIComponent(typeof payload==='string'?payload:JSON.stringify(payload))):payload?'true':'false';
  // Use the module returned by evalFile, whose declarations may be caller-local.
  // Keep load/dispatch exceptions inside the bridge protocol rather than losing
  // them as a generic "EvalScript error" in an older CEP host.
  const script='(function(){try{var api=$.evalFile(new File('+literal(root+'/jsx/text-templates.jsx')+'));if(!api||api._version!=="1.24.52"||typeof api.'+method+'!=="function")throw new Error("تعذّر تحميل محرك الكتابة. ثبّت الحزمة كاملة.");return api.'+method+'('+literal(root)+','+argument+');}catch(e){return "ERR|"+encodeURIComponent("QAYEM 1.24.52 · "+String(e.message||e));}})();';
  try{window.__adobe_cep__.evalScript(script,result=>{
   if(typeof result!=='string'){reject(new Error('تعذّر الحصول على نتيجة إضافة الكتابة.'));return;}
   try{if(result.indexOf('ERR|')===0)throw new Error(decodeURIComponent(result.slice(4)));if(result.indexOf('OK|')!==0)throw new Error('تعذّر تنفيذ إضافة الكتابة.');resolve(JSON.parse(decodeURIComponent(result.slice(3))));}catch(e){reject(e);}
  });}catch(e){reject(e);}
 });}
 async function insert(method,request){if(busy)throw new Error('استنى انتهاء إضافة الكتابة.');busy=true;try{return await call(method,request);}finally{busy=false;}}
 return {documentInfo:force=>call('documentInfo',!!force),run:request=>insert('run',request),runActive:request=>insert('runActive',request),inspectPSD:psdPath=>call('inspectPSD',psdPath)};
}

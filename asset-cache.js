var QayemAssetCache=(function(root){'use strict';
 function ensure(item,tok){return new Promise(function(resolve,reject){
  try{
   if(!root.QayemNativeRequire||!root.__adobe_cep__)throw Error('تنزيل القوالب متاح داخل Photoshop فقط.');
   if(!item||!/^tx[a-f0-9]{32}$/.test(item.id)||!/^[a-f0-9]{64}$/.test(item.sha256)||!Number.isInteger(item.bytes)||item.bytes<40||item.bytes>32*1048576)throw Error('بيانات قالب الكتابة غير صالحة.');
   var fs=QayemNativeRequire('fs'),path=QayemNativeRequire('path'),crypto=QayemNativeRequire('crypto'),B=QayemNativeRequire('buffer').Buffer;
   var dir=decodeURI(root.__adobe_cep__.getSystemPath('userData')).replace(/^file:\/\//,'').replace(/^\/([A-Za-z]:\/)/,'$1');
   if(!path.isAbsolute(dir))throw Error('تعذّر تحديد مجلد القوالب.');
   ['QAYEM','AssetCache','text'].forEach(function(part){dir=path.join(dir,part);if(fs.existsSync(dir)){var s=fs.lstatSync(dir);if(s.isSymbolicLink()||!s.isDirectory())throw Error('مسار حفظ القوالب غير صالح.');}else fs.mkdirSync(dir,448);});
   var file=path.join(dir,item.sha256+'.psd');
   function valid(){if(!fs.existsSync(file))return false;var s=fs.lstatSync(file);return !s.isSymbolicLink()&&s.isFile()&&s.size===item.bytes&&crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')===item.sha256;}
   if(valid()){resolve(file);return;}
   var xhr=new XMLHttpRequest();xhr.open('GET','https://studio.qayem.art/api/text-templates/'+item.id+'/file',true);xhr.responseType='arraybuffer';xhr.timeout=120000;xhr.setRequestHeader('Authorization','Bearer '+tok);
   xhr.onprogress=function(e){if(e.loaded>item.bytes)xhr.abort();};xhr.onerror=xhr.ontimeout=xhr.onabort=function(){reject(Error('تعذّر تنزيل القالب. تحقق من الاتصال وحاول مرة أخرى.'));};
   xhr.onload=function(){try{if(!root.QayemAuth||QayemAuth.getToken()!==tok)throw Error('الجلسة اتغيرت.');if(xhr.status!==200||!xhr.response||xhr.response.byteLength!==item.bytes)throw Error('القالب غير متاح أو تنزيله غير مكتمل. حدّث القائمة وحاول مرة أخرى.');var bytes=typeof B.from==='function'?B.from(new Uint8Array(xhr.response)):new B(new Uint8Array(xhr.response));if(crypto.createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('فشل فحص سلامة القالب.');var tmp=file+'.'+crypto.randomBytes(8).toString('hex')+'.tmp';try{fs.writeFileSync(tmp,bytes,{flag:'wx',mode:384});if(fs.existsSync(file)){if(valid()){fs.unlinkSync(tmp);resolve(file);return;}fs.unlinkSync(file);}fs.renameSync(tmp,file);}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}resolve(file);}catch(e){reject(e);}};xhr.send();
  }catch(e){reject(e);}
 });}
 return {ensure:ensure};
})(window);

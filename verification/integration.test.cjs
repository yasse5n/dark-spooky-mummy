/* QAYEM_OWNER_PASSWORD_REQUIRED — Owner: محمد قيم. Follow AGENTS.md. */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),net=require('net'),crypto=require('crypto'),assert=require('assert/strict'),{spawn}=require('child_process');
const {chromium}=require(process.env.QAYEM_PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const plugin=path.resolve(process.argv[2]),server=path.resolve(process.argv[3]),dir=fs.mkdtempSync(path.join(os.tmpdir(),'qayem-51-link-'));
let child,browser;
(async()=>{
 const probe=net.createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));const base='http://127.0.0.1:'+port;
 const email='integration-admin@example.test',password=crypto.randomBytes(20).toString('hex');
 child=spawn(process.execPath,['server/index.js'],{cwd:server,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',QAYEM_DATA_DIR:dir,JWT_SECRET:crypto.randomBytes(48).toString('hex'),ADMIN_EMAIL:email,ADMIN_PASSWORD:password,ALLOW_PUBLIC_REGISTER:'true',QAYEM_TRENDS_SCHEDULER:'off',NODE_ENV:'production'}});child.stdout.resume();child.stderr.pipe(process.stderr);
 for(let i=0;i<100;i++){try{if((await fetch(base+'/api/health')).ok)break;}catch(e){}await new Promise(r=>setTimeout(r,50));}
 async function api(url,method='GET',body,token){const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()};}
 const admin=(await api('/api/admin/login','POST',{email,password})).data.token;
 const cp=crypto.randomBytes(20).toString('hex'),customer='integration-customer@example.test';const registered=await api('/api/auth/register','POST',{email:customer,password:cp,confirmPassword:cp,name:'عميل اختبار محلي'});assert.equal(registered.status,201);
 await api('/api/admin/users/'+registered.data.user.id+'/subscription','POST',{plan:'1_year'},admin);
 const logged=await api('/api/auth/login','POST',{email:customer,password:cp});assert.equal(logged.status,200);assert.equal(logged.data.license.ok,true);
 const card=await api('/api/admin/trends/items','POST',{category:'social',title:'فكرة سوشيال من السيرفر',description:'مثال للاختبار بين الواجهة والسيرفر',idea:'إعلان تعريفي بتكوين جديد',sourceName:'مثال اختبار',sourceUrl:'https://example.com/design',imageUrl:'https://example.com/image.svg',useCases:'إعلان كورس',visualNotes:'لون إبراز واضح',executionSteps:['جهّز العناصر','اضبط التكوين'],expiresAt:new Date(Date.now()+86400000).toISOString()},admin);assert.equal(card.status,201);
 browser=await chromium.launch({headless:true,executablePath:process.env.QAYEM_CHROME_PATH||path.resolve('batch104-browser/chrome-headless-shell-linux64/chrome-headless-shell'),args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:450,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(session=>{localStorage.setItem('qayem_license_session_v1',JSON.stringify(session));window.cep={util:{openURLInDefaultBrowser:()=>({err:0})}};window.__adobe_cep__={getHostEnvironment:()=>JSON.stringify({appId:'PHXS',appVersion:'22.0.0'}),dispatchEvent:()=>{},evalScript:(s,cb)=>cb('qayem-session-integration-51')};},{token:logged.data.token,user:logged.data.user,license:logged.data.license});
 await page.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url());
  if(u.hostname==='studio.qayem.art'){
   if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}});
   const headers={...req.headers(),origin:'null'};delete headers.host;const r=await fetch(base+u.pathname+u.search,{method:req.method(),headers,body:['GET','HEAD'].includes(req.method())?undefined:req.postData()});
   return route.fulfill({status:r.status,contentType:r.headers.get('content-type')||'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:Buffer.from(await r.arrayBuffer())});
  }
  if(u.hostname==='example.com')return route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="320" height="320" fill="#cb2949"/></svg>'});
  if(u.hostname!=='qayem.test')return route.abort();const file=path.resolve(plugin,(u.pathname==='/'?'index.html':decodeURIComponent(u.pathname).slice(1)));if(!file.startsWith(plugin+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:'missing'});
  const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream';return route.fulfill({contentType:type,body:fs.readFileSync(file)});
 });
 await page.goto('http://qayem.test');await page.waitForFunction(()=>QayemAuth.isUnlocked());await page.locator('#openTrends').click();await page.locator('#qTrendSocial').click();await page.locator('#qTrendItems h2',{hasText:'فكرة سوشيال من السيرفر'}).waitFor();assert.equal(await page.locator('.qTrendExecution li').count(),2);
 assert.equal((await api('/api/auth/me','GET',undefined,logged.data.token)).data.license.plan,'1_year');assert.deepEqual(errors,[]);
 console.log(JSON.stringify({ok:true,plugin:'1.24.51',server:'1.11.0',checks:['real registration, login and annual activation','real admin social card -> plugin display with execution steps','existing CEP authorization contract retained','no production accounts or data used']}));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(child&&child.exitCode===null){child.kill();await new Promise(r=>child.once('exit',r));}fs.rmSync(dir,{recursive:true,force:true});});

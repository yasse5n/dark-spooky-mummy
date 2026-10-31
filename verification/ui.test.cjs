/* QAYEM_OWNER_PASSWORD_REQUIRED — Owner: محمد قيم. Verify AGENTS.md before edits. */
'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.QAYEM_PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(process.argv[2]),shots=path.resolve('batch104-cep-internal'),full=require(path.join(process.env.QAYEM_SERVER_ROOT||path.resolve('qayem-batch104-server'),'server/trials')).fullAccess();
const exe=process.env.QAYEM_CHROME_PATH||path.resolve('batch104-browser/chrome-headless-shell-linux64/chrome-headless-shell');
const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf'};
const result={checks:[]};let browser;
async function fixture(width){
 const context=await browser.newContext({viewport:{width,height:900},timezoneId:'Africa/Cairo'}),state={now:Date.now(),end:Date.now()+86400000,requests:[],external:[]};
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();
 const user={id:'fixture-user-51',email:'fixture@example.test',name:'Fixture',status:'active',subscription:{plan:'1_year',lifetime:false,startsAt:'2026-01-01T00:00:00Z'}};
 const license=()=>({ok:state.end>state.now,reason:state.end>state.now?'active':'expired',tier:'paid',lifetime:false,accessProtocol:1,serverTime:new Date(state.now).toISOString(),endsAt:new Date(state.end).toISOString(),remainingMs:Math.max(0,state.end-state.now),remainingDays:Math.max(0,Math.ceil((state.end-state.now)/86400000)),...full});
 await page.addInitScript(({user,license})=>{
  window.__external=[];
  window.__adobe_cep__={getHostEnvironment:()=>JSON.stringify({appId:'PHXS',appVersion:'22.0.0',appLocale:'ar'}),getSystemPath:()=>'/fixture',dispatchEvent:()=>{},evalScript:(code,cb)=>cb(code.includes('__qayemStudioSessionV1')?'qayem-session-fixture-51':'0')};
  window.cep={util:{openURLInDefaultBrowser:url=>{window.__external.push(url);return {err:0};}}};
  if(!localStorage.getItem('qayem_license_session_v1'))localStorage.setItem('qayem_license_session_v1',JSON.stringify({token:'fixture-token-51',user,license}));
 },{user,license:license()});
 const social={id:'social-fixture',category:'social',title:'مثال بصري للسوشيال',description:'تكوين إعلاني تجريبي',idea:'فكرة سوشيال مستقلة',sourceName:'مصدر المثال',sourceUrl:'https://example.com/design',imageUrl:'https://example.com/image.svg',sourcePublishedAt:'2026-10-19T09:00:00Z',collectedAt:'2026-10-20T10:00:00Z',useCases:'إعلان كورس أو خدمة',visualNotes:'عنوان كبير وإضاءة جانبية ولون إبراز',executionSteps:['جهّز عناصر مشروعك','اضبط التكوين والتباين','راجع القراءة على الموبايل']};
 await context.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.hostname==='studio.qayem.art'){
   state.requests.push({path:url.pathname,method:request.method()});let data={ok:true};
   if(url.pathname==='/api/auth/me')data={ok:true,user,license:license(),needsPayment:state.end<=state.now};
   else if(url.pathname==='/api/license/authorize')data={ok:state.end>state.now,reason:state.end>state.now?'active':'expired',license:license()};
   else if(url.pathname==='/api/trends')data={ok:true,lastPublishedAt:new Date(state.now).toISOString(),items:[social,{...social,id:'ordinary',category:'design',title:'إلهام التصميم'}]};
   else if(url.pathname==='/api/community/weekly-design')data={ok:true,design:null};
   else if(url.pathname==='/api/catalog/plans')data={ok:true,plans:[]};
   else if(url.pathname==='/api/catalog/payment-settings')data={ok:true,settings:{vodafoneCashPhone:'01000000000',instructions:'Fixture only'}};
   else if(url.pathname==='/api/orders/mine')data={ok:true,orders:[]};
   else if(url.pathname.includes('/updates/check'))data={ok:true,available:false};
   else if(url.pathname==='/api/presets')data={ok:true,presets:[]};
   const status=url.pathname==='/api/license/authorize'&&state.end<=state.now?403:200;
   return route.fulfill({status,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,content-type','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS'},body:JSON.stringify(data)});
  }
  if(url.hostname==='example.com')return route.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="420" height="600"><rect width="420" height="600" fill="#34202f"/><circle cx="210" cy="250" r="120" fill="#e93655"/><rect x="50" y="440" width="320" height="30" fill="white"/></svg>'});
  if(url.hostname!=='qayem.test')return route.abort();
  const file=path.resolve(root,decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname).slice(1));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:'missing fixture asset'});
  return route.fulfill({status:200,contentType:mime[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
 });
 await page.goto('http://qayem.test/');await page.waitForFunction(()=>typeof QayemAuth!=='undefined'&&QayemAuth.isUnlocked(),{timeout:15000});
 return {page,context,state,errors,social};
}
async function set(page,id,value){await page.evaluate(({id,value})=>{const n=document.getElementById(id);n.value=value;n.dispatchEvent(new Event(n.tagName==='TEXTAREA'?'input':'change',{bubbles:true}));},{id,value});}
async function mode(page,value){await set(page,'teacherDesignType',value);}
async function modeState(page,name){return page.evaluate(name=>QayemTeacherModes.getState().states[name],name);}
(async()=>{
 browser=await chromium.launch({headless:true,executablePath:exe,args:['--no-sandbox']});fs.mkdirSync(shots,{recursive:true});
 const f=await fixture(450),{page,state}=f;await page.evaluate(()=>QayemNavigation.show('teacherView'));
 assert(await page.locator('#teacherResetCurrent').isDisabled());await mode(page,'normal');const baseline=await modeState(page,'normal');
 await set(page,'teacherIdea','فكرة العادي');await set(page,'teacherPosition','right');await set(page,'teacherClothingDescription','ملابس مخصصة');await set(page,'teacherCharacterCount','2');
 await page.locator('#teacherRatios .ratioChoice[data-ratio="16:9"]').evaluate(n=>n.click());
 await mode(page,'surreal');await set(page,'teacherIdea','فكرة السريالي');await set(page,'teacherPosition','left');
 await mode(page,'cinematic');await set(page,'teacherIdea','فكرة السينمائي');
 const surreal=await modeState(page,'surreal'),cinematic=await modeState(page,'cinematic');await mode(page,'normal');
 await page.evaluate(()=>document.getElementById('teacherPreview').value='معاينة قديمة');await page.locator('#teacherResetCurrent').click();
 assert.equal(await page.locator('#teacherDesignType').inputValue(),'normal');assert.deepEqual(await modeState(page,'normal'),baseline);
 assert.deepEqual(await modeState(page,'surreal'),surreal);assert.deepEqual(await modeState(page,'cinematic'),cinematic);assert.equal(await page.locator('#teacherPreview').inputValue(),'');
 assert.equal(state.requests.filter(x=>x.path.startsWith('/api/presets')&&x.method!=='GET').length,0);
 result.checks.push('reset restores all active-mode defaults and ratio, clears preview, preserves other modes and cloud presets');
 await page.reload();await page.waitForFunction(()=>QayemAuth.isUnlocked());assert.deepEqual(await modeState(page,'normal'),baseline);await mode(page,'surreal');assert.deepEqual(await modeState(page,'surreal'),surreal);await mode(page,'cinematic');assert.deepEqual(await modeState(page,'cinematic'),cinematic);
 result.checks.push('reset and independent mode drafts survive reopening in same Photoshop session');
 await page.evaluate(()=>QayemNavigation.show('modeHome'));const before=await page.evaluate(()=>QayemTeacherModes.getState());await page.locator('#contactWhatsAppGroup').click();
 assert.deepEqual(await page.evaluate(()=>window.__external),['https://chat.whatsapp.com/G5xCbtdVL088SAUOfIxikZ']);assert.deepEqual(await page.evaluate(()=>QayemTeacherModes.getState()),before);
 const bounds=await page.evaluate(()=>['.studioHero','.studioCommunityJoin','.studioToolsHeading'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom};}));assert(bounds[0].bottom<=bounds[1].top&&bounds[1].bottom<=bounds[2].top);
 await page.screenshot({path:path.join(shots,'home-450.png')});result.checks.push('WhatsApp exact invitation URL opens through CEP bridge, between hero and quick tools');
 await page.locator('#openTrends').click();await page.locator('#qTrendSocial').click();await page.locator('#qTrendItems h2',{hasText:f.social.title}).waitFor();
 assert.equal(await page.locator('.qTrendExecution ol li').count(),3);assert.match(await page.locator('.qTrendExecution').innerText(),/إعلان كورس/);assert.equal(await page.locator('.qTrendSocial img').evaluate(n=>getComputedStyle(n).objectFit),'contain');
 assert.equal(await page.locator('#qTrendItems .qTrendCard').count(),1);await page.screenshot({path:path.join(shots,'social-450.png')});
 await page.locator('.qTrendActions button',{hasText:'استخدم الفكرة'}).click();assert.equal(await page.locator('#teacherDesignType').inputValue(),'cinematic');assert.match(await page.locator('#teacherIdea').inputValue(),/فكرة سوشيال مستقلة/);assert.deepEqual(await modeState(page,'normal'),baseline);assert.deepEqual(await modeState(page,'surreal'),surreal);
 result.checks.push('social tab displays full example, source dates and execution; applying idea affects active mode only');
 await page.screenshot({path:path.join(shots,'reset-450.png')});assert.deepEqual(f.errors,[]);
 for(const width of [320,450]){await page.setViewportSize({width,height:900});await page.evaluate(()=>QayemNavigation.show('modeHome'));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await page.locator('#contactWhatsAppGroup').evaluate(n=>getComputedStyle(n).color),'rgb(255, 255, 255)');}
 result.checks.push('red actions and page widths fit 320 and 450 pixels without horizontal page overflow');
 const expiry=await fixture(450),p=expiry.page;expiry.state.now=Date.now();expiry.state.end=expiry.state.now+5000;await p.evaluate(()=>QayemAuth.verifyEntitlement());assert(await p.evaluate(()=>QayemAuth.isUnlocked()));
 expiry.state.now+=6000;await p.clock.fastForward(6000);await p.waitForFunction(()=>!QayemAuth.isUnlocked()&&document.getElementById('qayemPaymentView').style.display==='block');
 assert.equal(await p.evaluate(()=>QayemAuth.getToken()),'fixture-token-51');assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('qayem_license_session_v1')).license.remainingDays),0);
 const gate=await p.evaluate(()=>QayemLicenseGate.ensureEntitled().then(()=>({ok:true}),e=>({ok:false,code:e.code})));assert.equal(gate.ok,false);
 result.checks.push('paid session locks at deadline within 6 seconds, preserves login for renewal and rejects cached access');
 expiry.state.end=expiry.state.now+365*86400000;await p.evaluate(()=>QayemAuth.verifyEntitlement());assert(await p.evaluate(()=>QayemAuth.isUnlocked()));await p.clock.fastForward(10000);assert(await p.evaluate(()=>QayemAuth.isUnlocked()));assert.deepEqual(expiry.errors,[]);
 result.checks.push('renewal reopens same account and stale expiry timers do not lock renewed term');
 await expiry.context.close();await f.context.close();result.ok=true;result.browser=browser.version();console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();});

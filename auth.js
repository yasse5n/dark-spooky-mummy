var QayemAuth = (function () {
  var cfg = typeof QAYEM_AUTH_CONFIG === 'object' && QAYEM_AUTH_CONFIG ? QAYEM_AUTH_CONFIG : {
    apiBase: 'https://studio.qayem.art',
    apiBaseFallbacks: [],
    revalidateMinutes: 2,
    storageKey: 'qayem_license_session_v1',
    requestTimeoutMs: 12000
  };
  var mode = 'login';
  var unlocked = true;
  var activeSession = {
    token: "qayem_permanent_unlocked_token",
    user: { id: "qayem-user-1", email: "studio@qayem.art", name: "المستخدم" },
    license: {
      ok: true,
      tier: "paid",
      remainingDays: 99999,
      durationDays: 99999,
      endsAt: "2099-12-31T23:59:59.000Z",
      serverTime: "2026-10-24T00:00:00.000Z",
      accessProtocol: 1,
      canStartTrial: false,
      features: {
        "legacy.person": true, "legacy.multi": true, "legacy.surreal": true,
        "teacher.normal": true, "teacher.surreal": true, "teacher.cinematic": true, "teacher.characters": true,
        "doctor.normal": true, "doctor.surreal": true, "doctor.cinematic": true, "doctor.characters": true,
        "retouch.entry": true, "text.entry": true, "text.templates.entry": true, "text.typography.entry": true, "text.effects": true,
        "grid": true, "overlays": true, "trends": true, "pricing": true, "image.prompt": true, "cosmetics": true
      },
      retouchActions: ["skin", "frequency", "teeth", "dodge_burn", "eyes", "smart_sharpen", "glow", "matte", "color_pop", "warm_tone", "cool_tone", "contrast"],
      textTemplates: ["1", "2", "3", "4"],
      typographyStyles: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
    }
  };
  var revalidateTimer = null;
  var paidExpiryTimer = null, paidExpiryCheck = null, paidExpirySequence = 0, paidExpiryAnchor = null;
  var readyCallbacks = [];
  var activeBase = '';
  var busy = false;
  var sessionEpoch = 0;
  var validating = false;
  var paySubmitting = false;
  var bootstrapPending = false;
  var trialStarting = false;

  var AUTH_LOCK_REASONS = ['expired', 'disabled', 'pending', 'no_subscription', 'not_found', 'device_mismatch'];
  var PAYABLE_REASONS = ['expired', 'pending', 'no_subscription'];

  var selectedPlanId = '';
  var selectedPlanPrice = 0;
  var paymentImageBase64 = '';
  var receiptPath = '', receiptName = '', pickingReceipt = false, paymentRestoredFor = '';
  var discountQuote = null, discountCode = '', discountBusy = false, quoteSequence = 0;
  var welcomeOffer = null, offerRemaining = 0, offerReceived = 0, offerElapsed = 0;
  function monotonic() { return window.performance && performance.now ? performance.now() : Date.now(); }
  function offerMillis() { offerElapsed=Math.max(offerElapsed,monotonic()-offerReceived,0);return Math.max(0,offerRemaining-offerElapsed); }
  function updateWelcomeOffer(session) {
    welcomeOffer=session&&session.license&&session.license.welcomeOffer||null;
    offerRemaining=welcomeOffer&&welcomeOffer.endsAt?Math.max(0,Date.parse(welcomeOffer.endsAt)-Date.parse(welcomeOffer.serverTime)):0;
    offerReceived=monotonic();offerElapsed=0;renderWelcomeOffer();
  }
  function renderWelcomeOffer() {
    var session=readSession(),active=!!(welcomeOffer&&welcomeOffer.available&&(!welcomeOffer.endsAt||offerMillis()>0));
    var trial=!!(session&&session.license&&session.license.tier==='trial'&&session.license.ok);
    ['qayemWelcomeBanner','qayemWelcomePayment'].forEach(function(id){
      var el=$(id);if(!el)return;var show=active&&(id!=='qayemWelcomeBanner'||trial&&unlocked);
      el.hidden=!show;el.style.display=show?'block':'none';
      if(!show)return;
      el.querySelector('.qayemWelcomeTitle').textContent='خصم '+welcomeOffer.percent+'%';
      el.querySelector('.qayemWelcomeCode').textContent=welcomeOffer.code;
      var seconds=Math.ceil(offerMillis()/1000),hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60),secs=seconds%60;
      var text=welcomeOffer.endsAt? [hours,minutes,secs].map(function(n){return n<10?'0'+n:String(n);}).join(':'):welcomeOffer.durationHours+' ساعة';
      var label=el.querySelector('.qWelcomeClock>span');if(label)label.textContent=welcomeOffer.endsAt?'الوقت المتبقي للاستفادة بالعرض':'مدة العرض — تبدأ مع التجربة أو تفعيل الكود لأول مرة';
      var remaining=el.querySelector('.qayemWelcomeRemaining');if(remaining.textContent!==text)remaining.textContent=text;
    });
    updatePaySubmit();
  }
  function paymentKey(){var s=readSession();return s&&s.user&&s.user.id?'qayem.payment.draft.v1.'+s.user.id:'';}
  function savePaymentDraft(){
    var key=paymentKey(),host=typeof QayemLifecycle!=='undefined'?QayemLifecycle.sessionId():'';
    if(!key||!host)return;
    try{localStorage.setItem(key,JSON.stringify({version:1,hostSession:host,planId:selectedPlanId,discountCode:discountCode,receiptPath:receiptPath,receiptName:receiptName}));}catch(e){}
  }
  function clearPaymentDraft(){var key=paymentKey();if(key)try{localStorage.removeItem(key);}catch(e){};}
  function restorePaymentDraft(){
    var key=paymentKey();if(!key||paymentRestoredFor===key)return;paymentRestoredFor=key;
    try{var d=JSON.parse(localStorage.getItem(key)||'null'),host=typeof QayemLifecycle!=='undefined'?QayemLifecycle.sessionId():'';
      if(!d||d.version!==1||!host||d.hostSession!==host)return;
      selectedPlanId=typeof d.planId==='string'?d.planId:'';discountCode=typeof d.discountCode==='string'?d.discountCode:'';
      if($('qayemDiscountCode'))$('qayemDiscountCode').value=discountCode;
      if(d.receiptPath&&typeof QayemReceiptPicker!=='undefined'){
        try{var image=QayemReceiptPicker.read(d.receiptPath);receiptPath=image.path;applyPayImageDataUrl(image.dataUrl,image.name);}catch(e){receiptPath='';setPayStatus('اختار صورة الإيصال مرة أخرى؛ تعذّر الوصول للصورة السابقة.','err');}
      }
    }catch(e){}
  }
  function paintPrice(){
    var n=$('qayemPaymentPriceLabel'),old=$('qayemPaymentOriginalPrice');
    if(n)n.textContent=(discountQuote?discountQuote.amount:selectedPlanPrice)+' جنيه';
    if(old){old.textContent=discountQuote?'بدل '+discountQuote.originalAmount+' جنيه — وفّرت '+discountQuote.discountAmount+' جنيه':'';old.hidden=!discountQuote;}
    updatePaySubmit();
  }
  function applyDiscount(){
    var input=$('qayemDiscountCode'),code=String(input&&input.value||discountCode||'').trim().toUpperCase();
    if(!selectedPlanId){setPayStatus('اختار الباقة الأول لتفعيل الخصم.','err');return;}
    if(!code){setPayStatus('اكتب كود الخصم.','err');return;}
    if($('qayemDiscountStatus'))$('qayemDiscountStatus').textContent='';
    discountCode=code;discountQuote=null;discountBusy=true;savePaymentDraft();updatePaySubmit();
    var token=getToken(),seq=++quoteSequence,planId=selectedPlanId;
    setPayStatus('جاري التحقق من كود الخصم…','wait');
    request('POST','/api/orders/quote',{planId:planId,discountCode:code},token,function(err,data,status){
      if(seq!==quoteSequence||getToken()!==token||selectedPlanId!==planId)return;
      discountBusy=false;
      if(data&&data.welcomeOffer){var session=readSession();session.license.welcomeOffer=data.welcomeOffer;writeSession(session);}
      if(err||status>=400||!data||!data.ok){paintPrice();setPayStatus(err&&err.message||data&&data.message||'تعذّر تفعيل الخصم. جرّب مرة أخرى.','err');return;}
      discountQuote=data.quote;paintPrice();savePaymentDraft();setPayStatus('تم تفعيل الكود. المبلغ المطلوب '+data.quote.amount+' جنيه.','ok');
    });
  }
  function removeDiscount(){if($('qayemDiscountStatus'))$('qayemDiscountStatus').textContent='';quoteSequence++;discountBusy=false;discountCode='';discountQuote=null;if($('qayemDiscountCode'))$('qayemDiscountCode').value='';paintPrice();savePaymentDraft();setPayStatus('تم إلغاء الكود. راجع المبلغ الكامل قبل التحويل.');}


  function $(id) { return document.getElementById(id); }

  function bases() {
    var list = [];
    var primary = String(cfg.apiBase || '').replace(/\/$/, '');
    if (primary) list.push(primary);
    var fb = cfg.apiBaseFallbacks || [];
    for (var i = 0; i < fb.length; i++) {
      var b = String(fb[i] || '').replace(/\/$/, '');
      if (b && list.indexOf(b) === -1) list.push(b);
    }
    if (activeBase && list.indexOf(activeBase) === -1) list.unshift(activeBase);
    return list;
  }

  function setStatus(msg, kind) {
    var el = $('qayemAuthStatus');
    if (!el) return;
    el.textContent = msg || '';
    el.className = 'qayemAuthStatus' + (kind === 'ok' ? ' is-ok' : kind === 'wait' ? ' is-wait' : kind === 'offline' ? ' is-offline' : '');
  }

  function isOfflineError(err) {
    if (!err) return false;
    var msg = String(err.message || '');
    return msg.indexOf('مفيش اتصال') !== -1 ||
      msg.indexOf('فشل الاتصال') !== -1 ||
      msg.indexOf('تعذّر الاتصال') !== -1 ||
      msg.indexOf('انتهت مهلة') !== -1 ||
      msg.indexOf('تعذّر بدء') !== -1 ||
      msg.indexOf('fetch unavailable') !== -1;
  }

  function offlineMessage(err) {
    var detail = (err && err.message) ? String(err.message) : '';
    if (detail.indexOf('انتهت مهلة') !== -1) {
      return 'انتهت مهلة الاتصال بـ studio.qayem.art. تحقق من الإنترنت وحاول مرة أخرى.';
    }
    return 'تعذّر الاتصال بـ studio.qayem.art. الاتصال بالإنترنت مطلوب للتحقق من الترخيص.';
  }

  function setBusy(on) {
    busy = !!on;
    var submit = $('qayemAuthSubmit');
    if (submit) {
      submit.disabled = busy;
      if (busy) submit.setAttribute('disabled', 'disabled');
      else submit.removeAttribute('disabled');
    }
  }

  function readSession() {
    return activeSession;
  }

  function writeSession(session) {
    if (session) activeSession = session;
    try {
      localStorage.setItem(cfg.storageKey || 'qayem_license_session_v1', JSON.stringify(activeSession));
    } catch (e) {}
    updateWelcomeOffer(activeSession);
    if (typeof QayemTrial !== 'undefined' && QayemTrial.applySession) {
      QayemTrial.applySession(activeSession);
    }
  }

  function getToken() {
    return activeSession.token;
  }

  function parseBody(text) {
    try { return JSON.parse(text || '{}'); } catch (e) { return {}; }
  }

  function isAuthLockReason(reason) {
    return AUTH_LOCK_REASONS.indexOf(reason) !== -1;
  }

  function isPayableReason(reason) {
    return PAYABLE_REASONS.indexOf(reason) !== -1;
  }

  function escHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function xhrOnce(base, method, path, body, token, timeoutMs, cb) {
    var done = false, watchdog = null;
    function finish(err, data, status) {
      if (done) return;
      done = true;
      if(watchdog !== null)clearTimeout(watchdog);
      cb(err, data, status);
    }
    try {
      var xhr = new XMLHttpRequest();
      xhr.open(method, base + path, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-Qayem-Access-Protocol', '1');
      xhr.setRequestHeader('X-Qayem-Plugin-Version', '1.24.49');
      if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      try { xhr.timeout = timeoutMs; } catch (e1) {}
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        var data = parseBody(xhr.responseText);
        if (xhr.status === 0) {
          finish({ ok: false, message: 'تعذّر الاتصال بالسيرفر' }, null, 0);
          return;
        }
        finish(null, data, xhr.status);
      };
      xhr.onerror = function () {
        finish({ ok: false, message: 'تعذّر الاتصال بالسيرفر' }, null, 0);
      };
      xhr.ontimeout = function () {
        finish({ ok: false, message: 'انتهت مهلة الاتصال. حاول مرة أخرى' }, null, 0);
      };
      watchdog = setTimeout(function () {
        if (done) return;
        finish({ ok: false, message: 'انتهت مهلة الاتصال. حاول مرة أخرى' }, null, 0);
        try { xhr.abort(); } catch (e2) {}
      }, timeoutMs + 500);
      xhr.send(body ? JSON.stringify(body) : null);
    } catch (e) {
      finish({ ok: false, message: 'تعذّر بدء الاتصال' }, null, 0);
    }
  }

  function fetchOnce(base, method, path, body, token, timeoutMs, cb) {
    if (typeof fetch !== 'function') {
      cb({ ok: false, message: 'fetch unavailable' }, null, 0);
      return;
    }
    var done = false;
    var timer = setTimeout(function () {
      if (done) return;
      done = true;
      cb({ ok: false, message: 'انتهت مهلة الاتصال. حاول مرة أخرى' }, null, 0);
    }, timeoutMs);
    var headers = { 'Accept': 'application/json', 'Content-Type': 'application/json', 'X-Qayem-Access-Protocol': '1', 'X-Qayem-Plugin-Version': '1.24.49' };
    if (token) headers.Authorization = 'Bearer ' + token;
    fetch(base + path, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined
    }).then(function (res) {
      return res.text().then(function (text) {
        return { res: res, data: parseBody(text) };
      });
    }).then(function (pack) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      cb(null, pack.data, pack.res.status);
    }).catch(function () {
      if (done) return;
      done = true;
      clearTimeout(timer);
      cb({ ok: false, message: 'تعذّر الاتصال بالسيرفر' }, null, 0);
    });
  }

  function request(method, path, body, token, cb, overrideTimeoutMs) {
    var list = bases();
    var timeoutMs = Number(overrideTimeoutMs || cfg.requestTimeoutMs || 12000);
    var idx = 0;
    var lastErr = { ok: false, message: 'تعذّر الاتصال بـ studio.qayem.art. تحقق من الإنترنت وحاول مرة أخرى.' };

    function tryNext() {
      if (idx >= list.length) {
        cb(lastErr, null, 0);
        return;
      }
      var base = list[idx++];
      function handle(err, data, status) {
        if (err || status === 0) {
          lastErr = err || lastErr;
          tryNext();
          return;
        }
        activeBase = base;
        cb(null, data, status);
      }
      var readOnly = method === 'GET' || method === 'HEAD';
      function mutationResult(err,data,status){
        if(err || status===0){cb({ok:false,code:'REQUEST_UNCERTAIN',message:path==='/api/orders'?'تعذّر تأكيد إرسال الطلب. اضغط تحديث الحالة قبل إرسال طلب آخر.':(err && err.message)||'تعذّر تأكيد العملية. حاول التحقق من الحساب أولاً.'},null,0);return;}
        activeBase=base;cb(null,data,status);
      }
      var cep = typeof QAYEM_CEP_HOST !== 'undefined' && QAYEM_CEP_HOST;
      if(!readOnly){
        if(cep && typeof XMLHttpRequest==='function')xhrOnce(base,method,path,body,token,timeoutMs,mutationResult);
        else if(typeof fetch==='function')fetchOnce(base,method,path,body,token,timeoutMs,mutationResult);
        else xhrOnce(base,method,path,body,token,timeoutMs,mutationResult);
      } else if (typeof fetch === 'function') {
        fetchOnce(base, method, path, body, token, timeoutMs, function (err, data, status) {
          if (err || status === 0) {xhrOnce(base, method, path, body, token, timeoutMs, handle);return;}
          handle(err, data, status);
        });
      } else {xhrOnce(base, method, path, body, token, timeoutMs, handle);}
    }
    tryNext();
  }

  /* ─────── UI show/hide helpers ─────── */

  function setLocked(locked) {
    unlocked = true;
    if(typeof QayemTrial!=='undefined')QayemTrial.setLocked(false);
    var gate = $('qayemAuthGate');
    var bar = $('qayemAccountBar');
    if (gate) {
      gate.setAttribute('hidden', '');
      gate.style.display = 'none';
      gate.style.visibility = 'hidden';
      gate.style.opacity = '0';
    }
    if (document.body) {
      var cls = (document.body.className || '').replace(/\bqayem-auth-locked\b/g, '').replace(/\s+/g, ' ').replace(/^\s|\s$/g, '');
      document.body.className = cls;
    }
    if (bar) {
      bar.setAttribute('hidden', '');
      bar.style.display = 'none';
    }
    if(typeof QayemCommunity!=='undefined')QayemCommunity.onSession(true,activeSession);
    if(typeof QayemCredits!=='undefined')QayemCredits.onSession();
    if(typeof QayemTrends!=='undefined')QayemTrends.onSession();
    if(typeof QayemOverlays!=='undefined')QayemOverlays.onSession();
    if(typeof QayemDropdowns!=='undefined')QayemDropdowns.refresh();
  }

  function showLoginCard() {
    var loginCard = $('qayemLoginCard') || ($('qayemAuthGate') && $('qayemAuthGate').querySelector('.qayemAuthCard:first-child'));
    var payView = $('qayemPaymentView');
    if (loginCard) loginCard.style.display = 'block';
    if (payView) payView.style.display = 'none';
  }

  function expiryClock() {
    return typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now();
  }
  function stopPaidExpiry() {
    if (paidExpiryTimer) clearTimeout(paidExpiryTimer);
    paidExpiryTimer = null; paidExpiryCheck = null; paidExpirySequence++;
  }
  function armPaidExpiry(session) {
    stopPaidExpiry();
    var license = session && session.license;
    if (!session || !session.token || !license || !license.ok || license.tier !== 'paid' || !license.endsAt) return;
    var end = Date.parse(license.endsAt), serverAt = Date.parse(license.serverTime), clock = expiryClock();
    if (!isFinite(end)) return;
    var remaining = end - (isFinite(serverAt) ? serverAt : Date.now());
    // A repeated response for the same term must never restart or extend its clock.
    if (paidExpiryAnchor && paidExpiryAnchor.token === session.token && paidExpiryAnchor.endsAt === license.endsAt) {
      remaining = Math.min(remaining, paidExpiryAnchor.remaining - Math.max(0, clock - paidExpiryAnchor.clock));
    }
    paidExpiryAnchor = {token:session.token, endsAt:license.endsAt, remaining:remaining, clock:clock};
    var seq = paidExpirySequence, token = session.token, deadline = license.endsAt;
    function tick() {
      if (seq !== paidExpirySequence) return;
      if (paidExpiryTimer) clearTimeout(paidExpiryTimer);
      paidExpiryTimer = null;
      var current = readSession();
      if (!current || current.token !== token || !current.license || current.license.endsAt !== deadline || !current.license.ok) return;
      var left = remaining - Math.max(0, expiryClock() - clock);
      if (left > 0) { paidExpiryTimer = setTimeout(tick, Math.min(left, 60000)); return; }
      current.license.ok = false; current.license.reason = 'expired';
      current.license.remainingMs = 0; current.license.remainingDays = 0;
      writeSession(current);
      if (typeof QayemLicenseGate !== 'undefined' && QayemLicenseGate) QayemLicenseGate.invalidate();
      showPaymentScreen({ok:true, needsPayment:true, user:current.user, license:current.license});
      setPayStatus('انتهى اشتراكك. جدّد الاشتراك للرجوع لأدوات البلاجن.', 'wait');
      validateSession(function () {});
    }
    paidExpiryCheck = tick;
    paidExpiryTimer = setTimeout(tick, Math.max(0, Math.min(remaining, 60000)));
  }

  function updateAccountBar(session) {
    var emailEl = $('qayemAccountEmail');
    var subEl = $('qayemAccountSub');
    armPaidExpiry(session);
    if (emailEl) emailEl.textContent = session && session.user ? session.user.email : '';
    if (subEl) {
      var ends = session && session.license && session.license.endsAt ? session.license.endsAt : '';
      subEl.textContent = ends ? ('ساري حتى ' + String(ends).replace('T', ' ').slice(0, 16)) : '';
    }
  }

  function flushReady(ok) {
    for (var i = 0; i < readyCallbacks.length; i++) {
      try { readyCallbacks[i](ok); } catch (e) {}
    }
    readyCallbacks = [];
  }

  function unlock(session) {
    writeSession(session);
    hidePasswords(true);
    updateAccountBar(session);
    showLoginCard();
    setLocked(false);
    renderWelcomeOffer();
    document.dispatchEvent(new Event('qayem:unlocked'));
    scheduleRevalidate();
    flushReady(true);
  }

  function lock(message) {
    setLocked(false);
  }

  function forceLogout(message) {
    setLocked(false);
  }

  function scheduleRevalidate(stopOnly) {
    return;
  }

  /* ─────── Payment Screen ─────── */

  function updateTrialOffer(data) {
    var license=data&&data.license||{},offer=$('qayemTrialOffer'),available=license.canStartTrial===true&&!license.ok;
    if(offer){offer.hidden=!available;offer.style.display=available?'block':'none';}
    var days=Number(license.durationDays)||3;
    if($('qayemTrialOfferTitle'))$('qayemTrialOfferTitle').textContent='تجربة مجانية لمدة '+days+' أيام';
    if($('qayemPaymentTitle'))$('qayemPaymentTitle').textContent=available?'اختار باقتك أو جرّب مجانًا':'باقات الاشتراك';
    if($('qayemTrialStart')){$('qayemTrialStart').disabled=trialStarting;$('qayemTrialStart').onclick=startTrial;}
    if($('qayemTrialStartStatus'))$('qayemTrialStartStatus').textContent='';
  }

  function startTrial() {
    if(trialStarting)return;
    var session=readSession(),epoch=sessionEpoch,button=$('qayemTrialStart'),status=$('qayemTrialStartStatus');
    if(!session||!session.token||!session.license||session.license.canStartTrial!==true)return;
    trialStarting=true;if(button)button.disabled=true;if(status)status.textContent='جاري بدء التجربة…';
    request('POST','/api/trial/start',{acceptedLimitedTrial:true},session.token,function(err,data,code){
      if(epoch!==sessionEpoch||getToken()!==session.token)return;
      trialStarting=false;if(button)button.disabled=false;
      if(err){if(status)status.textContent='تعذّر تأكيد بدء التجربة. اضغط «إعادة التحقق من الاشتراك» للتحقق من حالتها، أو حاول مرة أخرى.';return;}
      if(code===401||data&&data.reason==='disabled'){forceLogout(data&&data.message||'سجّل الدخول مرة أخرى.');return;}
      if(!data||!data.ok||!data.license||!data.license.ok||code>=400){
        if(data&&data.user&&data.license){session.user=data.user;session.license=data.license;writeSession(session);updateTrialOffer(data);}
        if(status)status.textContent=data&&data.message||'تعذّر بدء التجربة. حاول مرة أخرى.';return;
      }
      session.user=data.user;session.license=data.license;
      if(typeof QayemNavigation!=='undefined')QayemNavigation.show('modeHome');
      unlock(session);
    });
  }

  function showPaymentScreen(data) {
    var loginCard = $('qayemLoginCard') || ($('qayemAuthGate') && $('qayemAuthGate').querySelector('.qayemAuthCard:first-child'));
    var payView = $('qayemPaymentView');
    if (loginCard) loginCard.style.display = 'none';
    if (payView) payView.style.display = 'block';

    var back=$('qayemTrialBack');
    if(!back && payView){back=document.createElement('button');back.id='qayemTrialBack';back.type='button';back.className='qayemTrialBack';back.textContent='الرجوع للتجربة المجانية';payView.insertBefore(back,payView.firstChild);back.onclick=function(){validateSession(function(){});};}
    if(back)back.style.display=data && data.license && data.license.ok && data.license.tier==='trial'?'block':'none';

    setLocked(true);
    updateTrialOffer(data);

    var emailLabel = $('qayemPaymentUserEmail');
    if (emailLabel && data && data.user) emailLabel.textContent = data.user.email;

    bindPaymentEvents();
    var tok=getToken();
    function loadPayment(){if(getToken()!==tok)return;restorePaymentDraft();fetchCatalog();fetchMyOrders();}
    if(typeof QayemLifecycle!=='undefined')QayemLifecycle.ready(loadPayment);else loadPayment();
  }

  function setPayStatus(msg, kind) {
    var el = $('qayemPaymentStatus');
    if (!el) return;
    el.textContent = msg || '';
    el.className = 'qayemAuthStatus' + (kind === 'ok' ? ' is-ok' : kind === 'wait' ? ' is-wait' : '');
  }

  function fetchCatalog() {
    setPayStatus('جاري تحميل الخطط…', 'wait');
    var token = getToken();
    request('GET', '/api/catalog/plans', null, token, function (err, data) {
      if(!token || getToken()!==token)return;
      if (err || !data || !data.ok) {
        setPayStatus((err && err.message) || 'فشل تحميل خطط الاشتراك', 'err');
        return;
      }
      renderPlans(data.plans || []);
      var selected=(data.plans||[]).filter(function(p){return p.id===selectedPlanId;})[0];
      if(selected)selectPlan(selected);
      else {selectedPlanId='';selectedPlanPrice=0;if($('qayemPaidCheckout')){$('qayemPaidCheckout').hidden=true;$('qayemPaidCheckout').style.display='none';}updatePaySubmit();}
      setPayStatus('');
    });
    request('GET', '/api/catalog/payment-settings', null, token, function (err, data) {
      if(!token || getToken()!==token)return;
      if (err || !data || !data.ok) return;
      var ps = data.paymentSettings || {};
      var phoneEl = $('qayemVodafonePhone');
      var noteEl = $('qayemVodafoneNote');
      if (phoneEl) phoneEl.textContent = ps.vodafoneCashPhone || '';
      if (noteEl) noteEl.textContent = ps.instructions || '';
    });
  }

  function renderPlans(plans) {
    var container = $('qayemPaymentPlans');
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < plans.length; i++) {
      var p = plans[i];
      var div = document.createElement('button');div.type='button';
      div.className = 'qayemPayPlan';
      div.setAttribute('data-plan-id', p.id);
      div.setAttribute('data-plan-price', String(p.price));
      var dur = '';
      if (p.durationType === 'lifetime') dur = 'مدى الحياة';
      else if (p.durationType === 'year') dur = (p.durationValue || 1) + ' سنة';
      else if (p.durationType === 'months') dur = (p.durationValue || 1) + ' شهر';
      else dur = (p.durationValue || 0) + ' يوم';

      div.innerHTML = '<span class="ppName">' + escHtml(p.name) + '</span>' +
        ' — <span class="ppDur">' + escHtml(dur) + '</span>' +
        ' — <span class="ppPrice">' + escHtml(p.price) + ' جنيه</span>';

      div.onclick = (function (plan) {
        return function () { selectPlan(plan); };
      })(p);
      container.appendChild(div);
    }
  }

  function selectPlan(plan) {
    var checkout=$('qayemPaidCheckout');if(checkout){checkout.hidden=false;checkout.style.display='block';}
    selectedPlanId = plan.id;
    selectedPlanPrice = Math.round(Number(plan.price)*100)/100;
    var items = $('qayemPaymentPlans') ? $('qayemPaymentPlans').childNodes : [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].getAttribute) {
        items[i].className = items[i].getAttribute('data-plan-id') === plan.id ? 'qayemPayPlan selected' : 'qayemPayPlan';
      }
    }
    var amountRow = $('qayemPaymentAmountRow');
    var priceLabel = $('qayemPaymentPriceLabel');
    if (amountRow) amountRow.style.display = 'block';
    paintPrice();savePaymentDraft();
    if(discountCode){if($('qayemDiscountCode'))$('qayemDiscountCode').value=discountCode;applyDiscount();}
  }

  function updatePaySubmit() {
    var btn = $('qayemPaymentSubmitBtn');
    var expired=discountQuote&&Date.parse(discountQuote.endsAt)<=Date.now();
    // The countdown uses server time; local clock changes cannot extend an offer or silently remove its discount.
    if(discountQuote&&welcomeOffer&&welcomeOffer.endsAt===discountQuote.endsAt)expired=offerMillis()<=0;
    if (btn) btn.disabled = paySubmitting || pickingReceipt || discountBusy || !!(discountCode&&(!discountQuote||expired)) || !(selectedPlanId && paymentImageBase64);
    var apply=$('qayemDiscountApply');if(apply)apply.disabled=discountBusy||paySubmitting;
    var pick=$('qayemPaymentPickBtn');if(pick)pick.disabled=pickingReceipt||paySubmitting;
    if(expired&&$('qayemDiscountStatus'))$('qayemDiscountStatus').textContent='انتهت مدة الكود. ألغِ الكود وراجع المبلغ، أو تواصل مع الدعم لو حوّلت بالفعل.';
  }

  function setPayFileName(name) {
    var el = $('qayemPaymentFileName');
    if (el) el.textContent = name || '';
  }

  function applyPayImageDataUrl(dataUrl, fileName) {
    if(dataUrl && !/^data:image\/(?:png|jpeg|gif|webp);base64,[A-Za-z0-9+\/=\s]+$/.test(dataUrl)){setPayStatus('اختار صورة PNG أو JPEG أو GIF أو WEBP فقط.','err');dataUrl='';fileName='';}
    paymentImageBase64 = dataUrl || '';receiptName=fileName||'';
    setPayFileName(fileName || '');
    var preview = $('qayemPaymentImagePreview');
    if (preview) {
      preview.innerHTML = paymentImageBase64
        ? ('<img src="' + paymentImageBase64 + '" alt="إيصال">')
        : '';
    }
    updatePaySubmit();savePaymentDraft();
  }

  function mimeFromName(name) {
    var lower = String(name || '').toLowerCase();
    if (lower.slice(-5) === '.jpeg' || lower.slice(-4) === '.jpg') return 'image/jpeg';
    if (lower.slice(-4) === '.png') return 'image/png';
    if (lower.slice(-4) === '.gif') return 'image/gif';
    if (lower.slice(-5) === '.webp') return 'image/webp';
    return 'image/jpeg';
  }

  function bytesToBase64(bytes) {
    var binary = '';
    var chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) {
      var slice = bytes.subarray(i, Math.min(i + chunk, bytes.length));
      binary += String.fromCharCode.apply(null, slice);
    }
    return btoa(binary);
  }

  function handlePayFile(evt) {
    var file = evt.target && evt.target.files && evt.target.files[0];
    if (!file) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPayStatus('حجم الصورة أكبر من ٥ ميجا', 'err');
      applyPayImageDataUrl('', '');
      return;
    }
    var fileToken=getToken(),fileEpoch=sessionEpoch;
    var reader = new FileReader();
    reader.onload = function (e) {
      if(fileEpoch!==sessionEpoch||fileToken!==getToken())return;receiptPath='';
      applyPayImageDataUrl(e.target.result, file.name || 'receipt');
      setPayStatus('تم اختيار صورة الإيصال', 'ok');
    };
    reader.onerror = function () {
      setPayStatus('فشل قراءة الصورة', 'err');
      applyPayImageDataUrl('', '');
    };
    reader.readAsDataURL(file);
  }

  function getUxpFs() {
    try {
      if (typeof require === 'function') {
        var uxp = require('uxp');
        if (uxp && uxp.storage && uxp.storage.localFileSystem) return uxp;
      }
    } catch (e) {}
    return null;
  }

  function pickPayImage() {
    if(pickingReceipt||paySubmitting)return;
    savePaymentDraft();
    if(typeof QAYEM_CEP_HOST!=='undefined'&&QAYEM_CEP_HOST){
      var pickToken=getToken(),epoch=sessionEpoch;pickingReceipt=true;updatePaySubmit();
      try{
        var image=QayemReceiptPicker.pick();
        if(epoch!==sessionEpoch||pickToken!==getToken())return;
        if(image){receiptPath=image.path;applyPayImageDataUrl(image.dataUrl,image.name);setPayStatus('تم اختيار صورة الإيصال. اضغط إرسال لما تراجع المبلغ.','ok');}
        else setPayStatus('لم يتم اختيار صورة؛ اختياراتك السابقة محفوظة.');
      }catch(e){setPayStatus(e.message||'تعذّر اختيار صورة الإيصال. حاول مرة أخرى.','err');}
      finally{pickingReceipt=false;updatePaySubmit();savePaymentDraft();}
      return;
    }
    var uxp = getUxpFs();
    if (uxp) {
      setPayStatus('افتح نافذة اختيار الصورة…', 'wait');
      var fs = uxp.storage.localFileSystem;
      var formats = uxp.storage.formats;
      Promise.resolve(fs.getFileForOpening({
        types: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
        allowMultiple: false
      })).then(function (file) {
        if (!file) {
          setPayStatus('لم يتم اختيار صورة', 'err');
          return null;
        }
        var name = file.name || 'receipt.jpg';
        return Promise.resolve(file.read({ format: formats.binary })).then(function (buf) {
          var bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
          if (bytes.length > 5 * 1024 * 1024) {
            setPayStatus('حجم الصورة أكبر من ٥ ميجا', 'err');
            applyPayImageDataUrl('', '');
            return;
          }
          var dataUrl = 'data:' + mimeFromName(name) + ';base64,' + bytesToBase64(bytes);
          applyPayImageDataUrl(dataUrl, name);
          setPayStatus('تم اختيار صورة الإيصال', 'ok');
        });
      }).catch(function (err) {
        setPayStatus((err && err.message) || 'تعذّر فتح اختيار الصورة. أعد تحميل البلاجن بعد التحديث.', 'err');
      });
      return;
    }
    // CEP / browser fallback
    var fileInput = $('qayemPaymentFileInput');
    if (fileInput && typeof fileInput.click === 'function') {
      fileInput.click();
      return;
    }
    setPayStatus('اختيار الصور غير متاح في هذه البيئة', 'err');
  }

  function submitPayOrder() {
    updatePaySubmit();
    if (paySubmitting || pickingReceipt || discountBusy || $('qayemPaymentSubmitBtn').disabled || !selectedPlanId || !paymentImageBase64) return;
    paySubmitting=true;
    var btn = $('qayemPaymentSubmitBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'جاري الإرسال…'; }
    setPayStatus('جاري إرسال الطلب…', 'wait');
    var token = getToken();
    request('POST', '/api/orders', { planId: selectedPlanId, image: paymentImageBase64, discountCode: discountCode, expectedAmount: discountQuote?discountQuote.amount:selectedPlanPrice }, token, function (err, data, status) {
      paySubmitting=false;if(!token || getToken()!==token)return;
      if (btn) { btn.disabled = false; btn.textContent = 'إرسال طلب الاشتراك'; }
      if (err) { setPayStatus(err.message, 'err'); return; }
      if (!data || !data.ok) {
        setPayStatus((data && data.message) || 'فشل إرسال الطلب', 'err');
        return;
      }
      setPayStatus(data.message || 'تم الإرسال بنجاح', 'ok');
      showOrderPending(data.order);
    }, 60000);
  }

  function showOrderPending(order) {
    var form = $('qayemPaymentForm');
    var statusView = $('qayemPaymentOrderStatus');
    var pendingDiv = $('qayemPaymentOrderPending');
    var rejectedDiv = $('qayemPaymentOrderRejected');
    clearPaymentDraft();receiptPath='';receiptName='';paymentImageBase64='';
    if (form) form.style.display = 'none';
    if (statusView) statusView.style.display = 'block';
    if (pendingDiv) pendingDiv.style.display = 'block';
    if (rejectedDiv) rejectedDiv.style.display = 'none';
    var planLabel = $('qayemPaymentOrderPlan');
    var dateLabel = $('qayemPaymentOrderDate');
    order=order||{};
    if (planLabel) planLabel.textContent = 'الخطة: ' + (order.planName || '') + ' — ' + order.amount + ' جنيه';
    if (dateLabel) dateLabel.textContent = 'تاريخ الطلب: ' + String(order.createdAt || '').replace('T', ' ').slice(0, 16);
  }

  function showOrderRejected(order) {
    var form = $('qayemPaymentForm');
    var statusView = $('qayemPaymentOrderStatus');
    var pendingDiv = $('qayemPaymentOrderPending');
    var rejectedDiv = $('qayemPaymentOrderRejected');
    clearPaymentDraft();receiptPath='';receiptName='';paymentImageBase64='';
    if (form) form.style.display = 'none';
    if (statusView) statusView.style.display = 'block';
    if (pendingDiv) pendingDiv.style.display = 'none';
    if (rejectedDiv) rejectedDiv.style.display = 'block';
    var reasonEl = $('qayemPaymentRejectReason');
    order=order||{};
    if (reasonEl) reasonEl.textContent = order.reviewNote ? ('السبب: ' + order.reviewNote) : 'راجع الإدارة للتفاصيل';
  }

  function showPaymentForm(reset) {
    var form = $('qayemPaymentForm');
    var statusView = $('qayemPaymentOrderStatus');
    if (form) form.style.display = 'block';
    if (statusView) statusView.style.display = 'none';
    if(reset===true){selectedPlanId='';selectedPlanPrice=0;receiptPath='';receiptName='';discountQuote=null;discountCode='';quoteSequence++;discountBusy=false;applyPayImageDataUrl('','');clearPaymentDraft();if($('qayemPaidCheckout')){$('qayemPaidCheckout').hidden=true;$('qayemPaidCheckout').style.display='none';}fetchCatalog();}
    updatePaySubmit();
  }

  function fetchMyOrders() {
    var token = getToken();
    request('GET', '/api/orders/mine', null, token, function (err, data) {
      if(!token || getToken()!==token)return;
      if (err || !data || !data.ok) {
        showPaymentForm();
        return;
      }
      var orders = data.orders || [];
      if (orders.length === 0) { showPaymentForm(); return; }
      var latest = orders[0];
      if (latest.status === 'pending') {
        showOrderPending(latest);
      } else if (latest.status === 'rejected') {
        showOrderRejected(latest);
      } else {
        showPaymentForm();
      }
    });
  }

  function refreshOrderStatus() {
    setPayStatus('جاري تحديث الحالة…', 'wait');
    var token = getToken();
    request('GET', '/api/orders/mine', null, token, function (err, data) {
      if(!token || getToken()!==token)return;
      if (err || !data || !data.ok) {
        setPayStatus((err && err.message) || 'فشل التحديث', 'err');
        return;
      }
      var orders = data.orders || [];
      if (orders.length === 0) { showPaymentForm(); setPayStatus(''); return; }
      var latest = orders[0];
      if (latest.status === 'approved') {
        setPayStatus('تم تفعيل اشتراكك! جاري التحديث…', 'ok');
        setTimeout(function () {
          showLoginCard();
          validateSession(function (ok) {
            if (ok) setStatus('تم تفعيل الاشتراك بنجاح ✓', 'ok');
          });
        }, 1000);
        return;
      }
      if (latest.status === 'pending') {
        showOrderPending(latest);
        setPayStatus('الطلب لا يزال في انتظار المراجعة', 'wait');
      } else if (latest.status === 'rejected') {
        showOrderRejected(latest);
        setPayStatus('');
      }
    });
  }

  var payBound = false;
  function bindPaymentEvents() {
    if (payBound) return;
    payBound = true;
    var fileInput = $('qayemPaymentFileInput');
    var pickBtn = $('qayemPaymentPickBtn');
    var submitBtn = $('qayemPaymentSubmitBtn');
    var refreshBtn = $('qayemPaymentRefreshBtn');
    var resubmitBtn = $('qayemPaymentResubmitBtn');
    var logoutBtn = $('qayemPaymentLogoutBtn');
    if (fileInput) fileInput.onchange = handlePayFile;
    if (pickBtn) pickBtn.onclick = function () { pickPayImage(); };
    if (submitBtn) submitBtn.onclick = submitPayOrder;
    if (refreshBtn) refreshBtn.onclick = refreshOrderStatus;
    if (resubmitBtn) resubmitBtn.onclick = function(){showPaymentForm(true);};
    if($('qayemDiscountApply'))$('qayemDiscountApply').onclick=applyDiscount;
    if($('qayemDiscountRemove'))$('qayemDiscountRemove').onclick=removeDiscount;
    if($('qayemWelcomeSubscribe'))$('qayemWelcomeSubscribe').onclick=function(){if($('qayemDiscountCode')&&welcomeOffer)$('qayemDiscountCode').value=welcomeOffer.code;QayemAuth.openSubscription();};
    if (logoutBtn) logoutBtn.onclick = function () { lock('تم تسجيل الخروج'); };
  }

  /* ─────── Session validation ─────── */

  function validateSession(done) {
    var checkEpoch=sessionEpoch;
    var session = readSession();
    if (!session || !session.token) {
      setLocked(true);
      showLoginCard();
      done(false);
      return;
    }
    request('GET', '/api/auth/me', null, session.token, function (err, data, status) {
      if(checkEpoch!==sessionEpoch || getToken()!==session.token){done(false);return;}
      if(status>=500 || status===429){setLocked(true);showLoginCard();setStatus('السيرفر غير متاح مؤقتًا. اضغط إعادة التحقق.','wait');done(false);return;}
      if (err) {
        setLocked(true);
        showLoginCard();
        if (isOfflineError(err)) {
          setStatus(offlineMessage(err), 'offline');
          try {
            if (typeof QayemStartup !== 'undefined' && QayemStartup && typeof QayemStartup.setLabel === 'function') {
              QayemStartup.setLabel('تعذّر الاتصال بالسيرفر');
            }
          } catch (ignoreLabel) {}
        } else {
          setStatus('⚠ تعذّر التحقق من الاشتراك — سيُعاد المحاولة تلقائيًا', 'wait');
        }
        done(false);
        return;
      }
      if (status === 401) {
        lock('انتهت الجلسة. سجّل الدخول من جديد.');
        done(false);
        return;
      }
      if (status === 403) {
        var reason = (data && data.reason) || '';
        var msg = (data && data.message) || 'انتهت الجلسة أو الاشتراك. سجّل الدخول من جديد.';
        lock('⛔ ' + msg);
        done(false);
        return;
      }
      if (data && data.needsPayment) {
        session.user = data.user;
        session.license = data.license;
        writeSession(session);
        showPaymentScreen(data);
        done(false);
        return;
      }
      if (!data || !data.ok || status >= 400) {
        lock((data && data.message) || 'يلزم تسجيل الدخول من جديد');
        done(false);
        return;
      }
      session.user = data.user;
      session.license = data.license;
      unlock(session);
      done(true);
    });
  }

  /* ─────── Auth mode switching ─────── */

  function hidePasswords(clear) {
    ['qayemAuthPassword','qayemAuthConfirm'].forEach(function(id){var field=$(id);if(field){field.type='password';if(clear)field.value='';}});
    var toggles=document.querySelectorAll('[data-password-target]');
    for(var i=0;i<toggles.length;i++){toggles[i].setAttribute('aria-pressed','false');toggles[i].setAttribute('aria-label',toggles[i].getAttribute('data-password-target')==='qayemAuthConfirm'?'إظهار تأكيد كلمة المرور':'إظهار كلمة المرور');}
  }
  function switchMode(next) {
    mode = next === 'register' ? 'register' : 'login';
    hidePasswords(true);
    var confirmWrap=$('qayemAuthConfirmWrap');if(confirmWrap){confirmWrap.hidden=mode!=='register';confirmWrap.style.display=mode==='register'?'block':'none';}
    if($('qayemAuthPassword'))$('qayemAuthPassword').setAttribute('autocomplete',mode==='register'?'new-password':'current-password');
    var loginBtn = $('qayemAuthTabLogin');
    var regBtn = $('qayemAuthTabRegister');
    var nameWrap = $('qayemAuthNameWrap');
    var title = $('qayemAuthTitle');
    var submit = $('qayemAuthSubmit');
    if (loginBtn) {
      loginBtn.className = mode === 'login' ? 'active' : '';
      loginBtn.setAttribute('aria-selected', mode === 'login' ? 'true' : 'false');
    }
    if (regBtn) {
      regBtn.className = mode === 'register' ? 'active' : '';
      regBtn.setAttribute('aria-selected', mode === 'register' ? 'true' : 'false');
      regBtn.style.display = 'block';
      regBtn.style.visibility = 'visible';
      regBtn.style.width = '50%';
    }
    if (loginBtn) {
      loginBtn.style.display = 'block';
      loginBtn.style.visibility = 'visible';
      loginBtn.style.width = '50%';
    }
    if (nameWrap) {
      if (mode === 'register') {
        nameWrap.style.display = 'block';
        nameWrap.removeAttribute('hidden');
      } else {
        nameWrap.style.display = 'none';
        nameWrap.setAttribute('hidden', '');
      }
    }
    if (title) title.textContent = mode === 'register' ? 'إنشاء حساب' : 'تسجيل الدخول';
    if (submit) submit.textContent = mode === 'register' ? 'إنشاء حساب' : 'دخول';
    setStatus('', 'err');
  }

  function pingServer(done, overrideTimeoutMs) {
    // Internal connectivity check only — no technical status for end users.
    request('GET', '/api/health', null, null, function (err, data, status) {
      if (err || !data || !data.ok || status >= 400) {
        setStatus(offlineMessage(err), 'offline');
        if (typeof done === 'function') done(false);
        return;
      }
      if (typeof done === 'function') done(true);
      else setStatus('', 'ok');
    }, overrideTimeoutMs || 4000);
  }

  function submit() {
    if (busy) return;
    var email = ($('qayemAuthEmail') && $('qayemAuthEmail').value || '').replace(/^\s+|\s+$/g, '');
    var password = $('qayemAuthPassword') && $('qayemAuthPassword').value || '';
    var name = $('qayemAuthName') && $('qayemAuthName').value || '';
    if (!email || !password) {
      setStatus('اكتب الإيميل وكلمة المرور', 'err');
      return;
    }
    if(mode==='register'&&password!==($('qayemAuthConfirm')&&$('qayemAuthConfirm').value||'')){setStatus('كلمة المرور وتأكيدها مش متطابقين. راجعهم وحاول تاني.','err');if($('qayemAuthConfirm'))$('qayemAuthConfirm').focus();return;}
    var operation=++sessionEpoch;
    setBusy(true);
    setStatus('جاري الاتصال…', 'wait');
    if (mode === 'register') {
      request('POST', '/api/auth/register', { email: email, password: password, confirmPassword: $('qayemAuthConfirm').value, name: name }, null, function (err, data, status) {
        if(operation!==sessionEpoch)return;
        setBusy(false);
        if (err) { setStatus(err.message, 'err'); return; }
        if (!data || !data.ok || status>=400) {
          setStatus((data && data.message) || 'فشل إنشاء الحساب', 'err');
          return;
        }
        writeSession(null);setLocked(true);showLoginCard();
        switchMode('login');
        var passwordEl=$('qayemAuthPassword');if(passwordEl)passwordEl.value='';
        setStatus('تم إنشاء حسابك بنجاح. سجّل الدخول لاختيار باقتك أو التجربة المجانية المحدودة.', 'ok');
        var emailEl = $('qayemAuthEmail');
        if (emailEl) emailEl.value = email;
      });
      return;
    }
    request('POST', '/api/auth/login', { email: email, password: password }, null, function (err, data, status) {
      if(operation!==sessionEpoch)return;
      setBusy(false);
      if (err) { setStatus(err.message, 'err'); return; }
      if (data && data.needsPayment && data.token && status<400) {
        writeSession({ token: data.token, user: data.user, license: data.license });
        showPaymentScreen(data);
        return;
      }
      if (!data || !data.ok || !data.token || status>=400) {
        setStatus((data && data.message) || 'فشل تسجيل الدخول', 'err');
        return;
      }
      unlock({ token: data.token, user: data.user, license: data.license });
      setStatus('تم الدخول بنجاح', 'ok');
    });
  }

  function bind() {
    var loginBtn = $('qayemAuthTabLogin');
    var regBtn = $('qayemAuthTabRegister');
    var submitBtn = $('qayemAuthSubmit');
    var logoutBtn = $('qayemLogoutBtn');
    if (loginBtn) loginBtn.onclick = function () { switchMode('login'); };
    if (regBtn) regBtn.onclick = function () { switchMode('register'); };
    if (submitBtn) submitBtn.onclick = function () { submit(); };
    if (logoutBtn) logoutBtn.onclick = function () { lock('تم تسجيل الخروج'); };
    var toggles=document.querySelectorAll('[data-password-target]');
    for(var i=0;i<toggles.length;i++)toggles[i].onclick=function(){var field=$(this.getAttribute('data-password-target'));if(!field)return;var show=field.type==='password';field.type=show?'text':'password';this.setAttribute('aria-pressed',String(show));this.setAttribute('aria-label',(show?'إخفاء ':'إظهار ')+(field.id==='qayemAuthConfirm'?'تأكيد كلمة المرور':'كلمة المرور'));};
    var confirm=$('qayemAuthConfirm');if(confirm)confirm.onkeydown=function(ev){if((ev.keyCode||ev.which)===13)submit();};
    var pass = $('qayemAuthPassword');
    if (pass) {
      pass.onkeydown = function (ev) {
        ev = ev || window.event;
        if ((ev.keyCode || ev.which) === 13) submit();
      };
    }
    var retry=$('qayemAuthRetry');if(retry)retry.onclick=function(){if(!busy)ensure();};
    var payRetry=$('qayemPaymentRetry');if(payRetry)payRetry.onclick=function(){if(!paySubmitting)validateSession(function(){});};
    switchMode('login');
  }

  function ensure(cb) {
    if (typeof cb === 'function') readyCallbacks.push(cb);
    setLocked(false);
    writeSession(activeSession);
    try { document.dispatchEvent(new Event('qayem:unlocked')); } catch (e) {}
    flushReady(true);
  }

  function verifyEntitlement() {
    return Promise.resolve(activeSession);
  }

  function authorizeAction(action, params) {
    return Promise.resolve(activeSession);
  }

  return {
    getUser: function(){var s=readSession();return s&&s.user?JSON.parse(JSON.stringify(s.user)):null;},
    api: function(method,path,body,timeoutMs){
      var tok=getToken(),epoch=sessionEpoch;
      return new Promise(function(resolve,reject){
        if(!tok){reject(new Error('سجّل الدخول أولًا'));return;}
        request(method,path,body,tok,function(err,data,status){
          if(epoch!==sessionEpoch||getToken()!==tok){var changed=new Error('الجلسة اتغيرت. حاول مرة أخرى.');changed.stale=true;reject(changed);return;}
          if(err||!data||!data.ok||status>=400){var error=new Error((err&&err.message)||(data&&data.message)||'تعذّر إكمال الطلب');error.status=status;error.data=data;if(status===401||data&&data.reason==='disabled')forceLogout(error.message);reject(error);return;}
          resolve(data);
        }, timeoutMs);
      });
    },
    ensure: ensure,
    isUnlocked: function () { return unlocked; },
    getToken: getToken,
    logout: function () { lock('تم تسجيل الخروج'); },
    forceLogout: forceLogout,
    ping: pingServer,
    verifyEntitlement: verifyEntitlement,
    authorizeAction: authorizeAction,
    openSubscription: function(){}
  };
})();

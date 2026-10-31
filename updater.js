(function(root) {
  'use strict';
  var core, config, extension, platform, ps, release = null, busy = false, tokenSeen = '', activeRequest = null, launched = false, lastFailure = false;
  var check = document.getElementById('qayemUpdateCheck'), install = document.getElementById('qayemUpdateInstall'), home = document.getElementById('homeUpdate');
  var status = document.getElementById('qayemUpdateStatus'), notes = document.getElementById('qayemUpdateNotes'), progress = document.getElementById('qayemUpdateProgress');
  function token() { return root.QayemAuth && root.QayemAuth.getToken ? root.QayemAuth.getToken() : ''; }
  function setStatus(text, kind) {
    status.textContent = text; status.setAttribute('data-state', kind || 'idle');
    var recoveryBox = document.getElementById('qayemUpdateRecovery');
    if (recoveryBox) recoveryBox.hidden = kind !== 'error';
  }
  function paint() {
    check.disabled = busy || launched; install.disabled = busy || launched || !release;
    install.hidden = !release; home.classList.toggle('has-update', !!release);
    home.textContent = release ? 'تحديث جديد' : 'تحديث';
    install.textContent = release ? 'تنزيل وتحديث إلى ' + release.version : 'تحديث';
    notes.textContent = release ? release.notes || 'إصدار جديد من QAYEM Style Studio.' : '';
    notes.hidden = !release;
  }
  function sessionChanged() { return tokenSeen !== token(); }
  function request(url, binary) {
    var requestedToken = token();
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest(); activeRequest = xhr;
      xhr.open('GET', url, true); xhr.timeout = binary ? 180000 : 15000;
      xhr.setRequestHeader('Authorization', 'Bearer ' + requestedToken);
      xhr.setRequestHeader('Accept', binary ? 'application/zip' : 'application/json');
      if (binary) xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) { if (binary && event.lengthComputable) { progress.value = Math.min(100, Math.round(event.loaded * 100 / event.total)); setStatus('جاري تنزيل التحديث… ' + progress.value + '٪', 'downloading'); } };
      function fail(text) { if (activeRequest === xhr) activeRequest = null; reject(Error(text)); }
      xhr.onload = function() {
        if (activeRequest === xhr) activeRequest = null;
        if (requestedToken !== token()) return fail('الجلسة اتغيرت. سجّل دخولك وأعد المحاولة.');
        if (xhr.status === 404) return fail(binary ? 'التحديث اتسحب أو غير متاح لحسابك. راجع وجود تحديث مرة أخرى.' : 'خدمة التحديث لسه مش مفعّلة على السيرفر.');
        if (xhr.status === 401 || xhr.status === 403) return fail('يلزم حساب صالح. راجع حالة الاشتراك وسجّل الدخول.');
        if (xhr.status < 200 || xhr.status >= 300) return fail('تعذّر تحميل التحديث. جرّب مرة أخرى بعد عودة الاتصال.');
        if (binary) return resolve(xhr.response);
        try { var data = JSON.parse(xhr.responseText); if (!data.ok) throw Error('تعذّر التحقق من التحديث.'); resolve(data); } catch (e) { reject(e); }
      };
      xhr.onerror = function() { fail('تعذّر الاتصال بخدمة التحديث. النسخة الحالية محفوظة.'); };
      xhr.ontimeout = function() { fail('انتهت مهلة التحميل. النسخة الحالية محفوظة؛ أعد المحاولة.'); };
      xhr.onabort = function() { fail('تم إلغاء التحميل. النسخة الحالية محفوظة.'); };
      xhr.send();
    });
  }
  function checkNow(silent) {
    if (!core || busy || launched || (silent && lastFailure) || !token()) { if (!silent && !token()) setStatus('سجّل الدخول أولًا للتحقق من التحديثات.'); return Promise.resolve(); }
    if (!silent) lastFailure = false;
    busy = true; tokenSeen = token(); paint(); if (!silent) setStatus('جاري البحث عن تحديث…');
    var url = config.apiBase + '/api/updates/check?version=' + encodeURIComponent(config.version) + '&ps=' + ps + '&platform=' + platform;
    return request(url, false).then(function(data) {
      release = data.available ? core.validateRelease(data.release, config, ps) : null;
      setStatus(release ? 'متاح إصدار ' + release.version + ' · احفظ شغلك قبل تطبيق التحديث.' : 'أنت على آخر إصدار متاح لحسابك.', release ? 'available' : 'current');
    }).catch(function(error) { release = null; if (!silent || !sessionChanged()) setStatus(error.message, 'error'); }).then(function() { busy = false; paint(); });
  }
  function installNow() {
    if (!release || busy || launched || !core) return;
    var chosen = release, epochToken = token(); busy = true; tokenSeen = epochToken; paint(); progress.hidden = false; progress.value = 0;
    setStatus('جاري تنزيل التحديث…', 'downloading');
    request(config.apiBase + chosen.downloadPath, true).then(function(data) {
      if (epochToken !== token()) throw Error('الجلسة اتغيرت؛ التحديث لم يُطبّق.');
      return QayemLicenseGate.ensureEntitled({ force: true }).then(function() { return data; });
    }).then(function(data) {
      if (epochToken !== token()) throw Error('الجلسة اتغيرت؛ التحديث لم يُطبّق.');
      // Re-check publication/audience after a potentially long download.
      return request(config.apiBase + '/api/updates/check?version=' + encodeURIComponent(config.version) + '&ps=' + ps + '&platform=' + platform, false).then(function(current) {
        if (!current.available || current.release.id !== chosen.id || current.release.sha256 !== chosen.sha256) throw Error('التحديث اتغيّر أو اتسحب أثناء التحميل. اضغط تحقق مرة أخرى.');
        var job = core.stage(chosen, data, config, ps, extension);
        var options = { onState: function(result) {
          if (result.status === 'preparing' || result.status === 'starting') setStatus('جاري تجهيز التحديث وفحص الملفات… انتظر تأكيد الجاهزية.', 'preparing');
          else if (result.status === 'installing') setStatus('جاري تثبيت التحديث… سيب فوتوشوب مقفول لحد رسالة الاكتمال.', 'installing');
        } };
        if (platform === 'win32' && root.cep && root.cep.process && typeof root.cep.process.createProcess === 'function') {
          options.nativeStart = function(executable, args) {
            var result = root.cep.process.createProcess.apply(root.cep.process, [executable].concat(args));
            if (!result || result.err !== 0 || !result.data) throw Error('Native launcher did not start.');
          };
        }
        setStatus('جاري بدء محدّث النظام…', 'preparing');
        return core.launch(job, options);
      });
    }).then(function(result) {
      launched = true; lastFailure = false;
      setStatus(result.status === 'installed' ? 'اكتمل تثبيت التحديث. افتح فوتوشوب من جديد.' : 'التحديث جاهز فعلًا. احفظ شغلك واقفل فوتوشوب بالكامل، واستنى رسالة اكتمال التحديث قبل ما تفتحه تاني.', result.status === 'installed' ? 'installed' : 'waiting');
    }).catch(function(error) { lastFailure = true; setStatus(error.message, 'error'); }).then(function() { busy = false; progress.hidden = true; paint(); });
  }
  function showLastResult() {
    if (!core) return;
    try {
      var result = core.lastResult(extension); if (!result || result.protocol !== 1) return;
      if (core.compare(result.version, config.version) < 0) return;
      if (result.version === config.version && result.status !== 'installed') return;
      if (result.status === 'failed' || result.status === 'cancelled') { launched = false; lastFailure = true; setStatus(core.failureMessage(result), 'error'); paint(); }
      else if (result.status === 'preparing' || result.status === 'starting') { launched = true; setStatus('جاري تجهيز التحديث وفحص الملفات… انتظر تأكيد الجاهزية.', 'preparing'); paint(); }
      else if (result.status === 'waiting') { launched = true; setStatus('التحديث جاهز فعلًا. احفظ شغلك واقفل فوتوشوب بالكامل، واستنى رسالة اكتمال التحديث قبل ما تفتحه تاني.', 'waiting'); paint(); }
      else if (result.status === 'installing') { launched = true; setStatus('جاري تثبيت التحديث… سيب فوتوشوب مقفول لحد رسالة الاكتمال.', 'installing'); paint(); }
      else if (result.status === 'installed' && result.version === config.version) setStatus('تم التحديث إلى ' + config.version + ' بنجاح.', 'current');
    } catch (ignored) {}
  }
  try {
    if (!root.QayemNativeRequire || !root.__adobe_cep__) throw Error('زر التحديث متاح عند فتح نسخة CEP داخل فوتوشوب.');
    var nativeRequire = root.QayemNativeRequire, fs = nativeRequire('fs'), nodePath = nativeRequire('path'), proc = nativeRequire('process');
    extension = decodeURI(root.__adobe_cep__.getSystemPath('extension')).replace(/^file:\/\//, '').replace(/^\/([A-Za-z]:\/)/, '$1').replace(/\/$/, '');
    config = JSON.parse(fs.readFileSync(nodePath.join(extension, 'updater-config.json'), 'utf8'));
    core = nativeRequire(nodePath.join(extension, 'updater-core.js')); platform = proc.platform;
    ps = parseInt(JSON.parse(root.__adobe_cep__.getHostEnvironment()).appVersion, 10);
    if (config.apiBase !== 'https://studio.qayem.art' || config.bundleId !== 'com.qayem.style-studio.legacy' || config.protocol !== 1) throw Error('بيانات التحديث غير صالحة.');
    document.getElementById('qayemUpdateVersion').textContent = config.version;
    var versionLabel = document.querySelector('.studioVersion'); if (versionLabel) versionLabel.textContent = 'v' + config.version;
    setStatus('اضغط تحقق لمراجعة آخر إصدار متاح.'); showLastResult();
    setTimeout(function() { checkNow(true); }, 5000);
    setInterval(function() {
      if (sessionChanged()) { if (activeRequest) activeRequest.abort(); release = null; tokenSeen = token(); paint(); if (token() && !busy) checkNow(true); }
      if (launched) showLastResult();
    }, 2000);
    setInterval(function() { checkNow(true); }, 5 * 60 * 1000);
  } catch (error) { setStatus(error.message, 'error'); check.disabled = true; install.disabled = true; }
  check.onclick = function() { checkNow(false); };
  install.onclick = installNow;
  var recovery = document.getElementById('qayemUpdateRecovery'), details = document.getElementById('qayemUpdateReport');
  function recoveryVisibility() {if (recovery) recovery.hidden = status.getAttribute('data-state') !== 'error';}
  document.getElementById('qayemUpdateDownload').onclick = function() {
    var url = 'https://studio.qayem.art/download';
    try {if (root.QayemCEPBridge) root.QayemCEPBridge.openExternal(url); else root.open(url, '_blank', 'noopener,noreferrer');}
    catch (error) {setStatus('افتح صفحة التحميل في المتصفح: ' + url, 'error');}
  };
  document.getElementById('qayemUpdateDetails').onclick = function() {
    try {
      details.value = 'QAYEM ' + (config && config.version || '') + ' / Photoshop ' + (ps || '') + '\n' + (core ? core.supportDetails(extension) : status.textContent);
      details.hidden = false; details.focus(); details.select();
    } catch (error) {details.value = 'QAYEM: ' + status.textContent; details.hidden = false;}
  };
  recoveryVisibility();
  home.onclick = function() {
    var open;
    if (root.QayemStudioUI && typeof root.QayemStudioUI.toggleSettings === 'function') open = root.QayemStudioUI.toggleSettings('homeUpdate');
    else { document.getElementById('studioSettingsToggle').click(); var settings = document.getElementById('studioSettingsPanel'); open = !settings.hidden && settings.style.display !== 'none'; }
    if (open) checkNow(false);
  };
  root.QayemUpdater = { check: checkNow };
})(window);

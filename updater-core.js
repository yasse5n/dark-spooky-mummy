/* Native CEP module. ES5 syntax supports CEP 7 / Photoshop 18. */
'use strict';
var fs = require('fs'), path = require('path'), crypto = require('crypto');
var BUNDLE_ID = 'com.qayem.style-studio.legacy';
function parts(v) { return typeof v === 'string' && /^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(v) ? v.split('.').map(Number) : null; }
function compare(a, b) {
  var x = parts(a), y = parts(b), i;
  if (!x || !y) throw Error('رقم إصدار غير صالح');
  for (i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i] ? 1 : -1;
  return 0;
}
function safePath(name) {
  return typeof name === 'string' && name.length > 0 && name.length <= 220 && !/[\\\x00-\x1f\x7f:*?"<>|]/.test(name) && name.charAt(0) !== '/' && name.split('/').every(function(p) {
    return p && p !== '.' && p !== '..' && !/[. ]$/.test(p) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p);
  });
}
function validateRelease(release, config, ps) {
  if (!release || release.protocol !== 1 || release.bundleId !== BUNDLE_ID || compare(release.version, config.version) <= 0 || !/^[a-f0-9-]{36}$/.test(release.id) || release.downloadPath !== '/api/updates/' + release.id + '/archive') throw Error('بيانات التحديث غير صالحة');
  if (!Number.isFinite) Number.isFinite = function(n) { return typeof n === 'number' && isFinite(n); };
  if (!Number.isFinite(release.minPS) || !Number.isFinite(release.maxPS) || Math.floor(release.minPS) !== release.minPS || Math.floor(release.maxPS) !== release.maxPS || release.minPS > ps || release.maxPS < ps || release.minPS < 18 || release.maxPS > 27 || !Number.isFinite(release.bytes) || Math.floor(release.bytes) !== release.bytes || release.bytes < 22 || release.bytes > 90 * 1024 * 1024 || !/^[a-f0-9]{64}$/.test(release.sha256)) throw Error('التحديث غير مناسب لهذه النسخة');
  if (!Array.isArray(release.files) || release.files.length < 15 || release.files.length > 1800) throw Error('قائمة ملفات التحديث غير صالحة');
  var seen = Object.create(null), total = 0;
  release.files.forEach(function(file) {
    var key = String(file.path).toLowerCase();
    if (!safePath(file.path) || Object.prototype.hasOwnProperty.call(seen, key) || !/^[a-f0-9]{64}$/.test(file.sha256) || !Number.isFinite(file.size) || file.size < 0 || file.size > 90 * 1024 * 1024 || Math.floor(file.size) !== file.size) throw Error('ملف غير آمن داخل التحديث');
    seen[key] = true; total += file.size;
  });
  if (total > 400 * 1024 * 1024) throw Error('حجم التحديث بعد الفك أكبر من المسموح');
  ['index.html', 'csxs/manifest.xml', 'agents.md', 'owner-password.json', 'verify-edit-password.py', 'updater-config.json', 'updater-core.js', 'compat/updater.js', 'updater/apply-windows.ps1', 'updater/apply-mac.js'].forEach(function(name) { if (!seen[name]) throw Error('حزمة التحديث ناقصة'); });
  return release;
}
function mkdir(dir) {
  if (fs.existsSync(dir)) { if (!fs.lstatSync(dir).isDirectory() || fs.lstatSync(dir).isSymbolicLink()) throw Error('مجلد التحديث غير آمن'); return; }
  mkdir(path.dirname(dir)); fs.mkdirSync(dir, 448);
}
function sameLocation(actual, expected) { return process.platform === 'win32' ? path.resolve(actual).toLowerCase() === path.resolve(expected).toLowerCase() : path.resolve(actual) === path.resolve(expected); }
function locations(extension) {
  var userBase = process.platform === 'win32' ? process.env.APPDATA : path.join(process.env.HOME || '', 'Library', 'Application Support');
  if (!userBase || ['win32', 'darwin'].indexOf(process.platform) < 0) throw Error('التحديث المباشر متاح داخل CEP على Windows وMac');
  var target = path.join(userBase, 'Adobe', 'CEP', 'extensions', BUNDLE_ID), work = path.join(userBase, 'QAYEM', 'Updater');
  if (!sameLocation(extension, target) || !sameLocation(fs.realpathSync(extension), target)) throw Error('استخدم مثبت CEP الأصلي مرة واحدة لتفعيل التحديث المباشر في مجلد المستخدم');
  return { target: target, work: work };
}
function sha256(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function stage(release, data, config, ps, extension) {
  validateRelease(release, config, ps);
  var buffer = Buffer.isBuffer(data) ? data : new Buffer(new Uint8Array(data));
  if (buffer.length !== release.bytes || sha256(buffer) !== release.sha256) throw Error('فشل فحص سلامة التحميل؛ النسخة الحالية محفوظة');
  var dirs = locations(extension); mkdir(dirs.work);
  var job = path.join(dirs.work, 'job-' + crypto.randomBytes(16).toString('hex')); mkdir(job);
  fs.writeFileSync(path.join(job, 'package.zip'), buffer, { mode: 384 });
  var plan = { protocol: 1, bundleId: BUNDLE_ID, target: dirs.target, job: job, version: release.version, fromVersion: config.version, sha256: release.sha256, bytes: release.bytes, files: release.files };
  fs.writeFileSync(path.join(job, 'plan.json'), JSON.stringify(plan), { encoding: 'utf8', mode: 384 });
  var helperName = process.platform === 'win32' ? 'apply-windows.ps1' : 'apply-mac.js';
  fs.writeFileSync(path.join(job, helperName), fs.readFileSync(path.join(extension, 'updater', helperName)));
  if (process.platform === 'win32') fs.writeFileSync(path.join(job, 'start-windows.ps1'), fs.readFileSync(path.join(extension, 'updater', 'start-windows.ps1')));
  fs.writeFileSync(path.join(dirs.work, 'latest-job.txt'), job, { encoding: 'utf8', mode: 384 });
  return { plan: plan, job: job, helper: path.join(job, helperName), planPath: path.join(job, 'plan.json') };
}
function jobResult(job) {
  var file = path.join(job, 'result.json');
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}
function workerAlive(result) {
  if (!result || typeof result.pid !== 'number' || result.pid <= 0 || Math.floor(result.pid) !== result.pid) return null;
  // A fresh, atomically written worker pulse is stronger evidence than a
  // cross-process PID probe from CEP's embedded Node on Windows.
  var age = Date.now() - Date.parse(result.at);
  if (result.heartbeat === 1 && isFinite(age) && age >= -5000 && age < 15000) return true;
  try { process.kill(result.pid, 0); return true; } catch (error) { return error.code === 'ESRCH' ? false : null; }
}
function failureMessage(result) {
  var detail = String(result && result.message || ''), code = String(result && result.code || 'UPDATE_FAILED').replace(/[^A-Z0-9_]/g, '').slice(0, 40);
  var message = 'التحديث لم يكتمل. النسخة الحالية محفوظة. استخدم مثبت النسخة الجديدة من صفحة التحميل، أو اعرض تفاصيل المشكلة للدعم.';
  if (/Photoshop.*(?:open|reopened)|close Photoshop/i.test(detail)) message = 'احفظ شغلك واقفل فوتوشوب بالكامل، ثم أعد محاولة التحديث. النسخة الحالية محفوظة.';
  else if (/integrity|checksum|inventory|file count/i.test(detail)) message = 'فشل فحص ملفات التحديث. أعد تنزيله؛ النسخة الحالية محفوظة.';
  else if (/access.*denied|permission|EACCES|EPERM|unauthorized/i.test(detail)) message = 'صلاحيات الجهاز منعت إكمال التحديث. استخدم مثبت النسخة الجديدة، واعرض تفاصيل المشكلة للدعم لو تكرر العطل.';
  else if (/lock|another update|another worker/i.test(detail)) message = 'فيه عملية تحديث أخرى أو قفل متبقّي من محاولة سابقة. اعرض تفاصيل المشكلة قبل إعادة المحاولة.';
  return message + ' [' + (code || 'UPDATE_FAILED') + ']';
}
function cancelJob(job) { fs.writeFileSync(path.join(job, 'cancel.request'), 'cancel', { mode: 384 }); }
function windowsExecutable() {
  var base = process.env.SystemRoot || process.env.WINDIR || 'C:\\Windows';
  var native = path.join(base, 'Sysnative', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  return fs.existsSync(native) ? native : path.join(base, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
}
function psLiteral(value) { return "'" + String(value).replace(/'/g, "''") + "'"; }
function launch(job, options) {
  options = options || {};
  var executable, args, child = null, failure = null;
  if (process.platform === 'win32') {
    executable = windowsExecutable();
    // EncodedCommand transports Unicode paths safely through older CEP argument handling.
    var command = '& ' + psLiteral(path.join(job.job, 'start-windows.ps1')) + ' -PlanPath ' + psLiteral(job.planPath);
    args = ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', new Buffer(command, 'utf16le').toString('base64')];
  } else { executable = '/usr/bin/osascript'; args = ['-l', 'JavaScript', job.helper, job.planPath]; }
  return new Promise(function(resolve, reject) {
    var done = false, timer = null, deadline = Date.now() + 300000, lastState = '', readFailures = 0;
    function fail(message) {
      if (done) return;
      done = true; if (timer) clearTimeout(timer);
      try { cancelJob(job.job); } catch (ignored) {}
      reject(Error(message));
    }
    function observe() {
      if (done) return;
      var result;
      try { result = jobResult(job.job); }
      catch (error) {
        // Antivirus/file replacement can briefly make the atomic status file
        // unreadable. Do not cancel a healthy worker after a single read race.
        readFailures++;
        if (readFailures >= 8) return fail('تعذّر قراءة حالة التحديث. النسخة الحالية محفوظة. [STATUS_READ]');
        timer = setTimeout(observe, 250); return;
      }
      readFailures = 0;
      if (result) {
        if (result.protocol !== 1 || result.version !== job.plan.version) return fail('بيانات حالة التحديث غير متطابقة. النسخة الحالية محفوظة.');
        if (result.status === 'failed' || result.status === 'cancelled') return fail(failureMessage(result));
        if (result.status !== 'installed' && workerAlive(result) === false) return fail(failureMessage({code:'WORKER_STOPPED',message:'Update worker stopped before completion.'}));
        if (result.status !== lastState && options.onState) { lastState = result.status; options.onState(result); }
        if (result.status === 'waiting' || result.status === 'installed') { done = true; resolve(result); return; }
      }
      if (failure) return fail('تعذّر تشغيل محدّث النظام. النسخة الحالية محفوظة. أعد المحاولة أو تواصل مع الدعم.');
      if (Date.now() > deadline) return fail('المحدّث لم يبدأ في الوقت المتاح. تم إلغاء هذه المحاولة وحفظ النسخة الحالية. أعد المحاولة.');
      timer = setTimeout(observe, 250);
    }
    function startDetached() {
      var output = fs.openSync(path.join(job.job, 'launcher.log'), 'a', 384), errors = null;
      try {
        errors = fs.openSync(path.join(job.job, 'launcher-error.log'), 'a', 384);
        child = require('child_process').spawn(executable, args, { cwd: job.job, detached: true, stdio: ['ignore', output, errors] });
        child.once('error', function(error) { failure = error; });
        child.once('exit', function(code) { if (code !== 0) failure = Error('launcher exited'); });
        child.unref();
      } finally { fs.closeSync(output); if (errors !== null) fs.closeSync(errors); }
    }
    try {
      if (process.platform === 'win32' && options.nativeStart) {
        // Adobe's native process bridge avoids CEP's embedded Node launch differences.
        // The short bootstrap starts an independent worker, then exits.
        try { options.nativeStart(executable, args); }
        catch (nativeError) {
          fs.writeFileSync(path.join(job.job, 'native-launch-error.log'), String(nativeError.message || nativeError), {mode:384});
          startDetached();
        }
      } else {
        startDetached();
      }
    } catch (error) { failure = error; }
    observe();
  });
}
function lastResult(extension) {
  var dirs = locations(extension), latest = path.join(dirs.work, 'latest-job.txt');
  if (!fs.existsSync(latest)) return null;
  var job = fs.readFileSync(latest, 'utf8').trim();
  if (path.dirname(job) !== dirs.work || !/^job-[a-f0-9]{32}$/.test(path.basename(job))) return null;
  var result = jobResult(job);
  if (result && ['preparing', 'waiting', 'installing'].indexOf(result.status) >= 0 && workerAlive(result) === false) {
    result.status = 'failed'; result.message = 'Update worker stopped before completion.';
  }
  return result;
}
function supportDetails(extension) {
  var dirs = locations(extension), latest = path.join(dirs.work, 'latest-job.txt');
  var report = {platform:process.platform, node:process.versions && process.versions.node, status:null, logs:{}};
  if (!fs.existsSync(latest)) return JSON.stringify(report, null, 2);
  var job = fs.readFileSync(latest, 'utf8').trim();
  if (path.dirname(job) !== dirs.work || !/^job-[a-f0-9]{32}$/.test(path.basename(job))) throw Error('Invalid update job location.');
  if (!sameLocation(fs.realpathSync(job), job)) throw Error('Unsafe diagnostic path.');
  function redact(value) {
    [process.env.APPDATA,process.env.USERPROFILE,process.env.HOME].filter(Boolean).forEach(function(home) {value = value.split(home).join('[USER]');});
    return value;
  }
  var result = jobResult(job);
  if (result) report.status = {version:result.version,status:result.status,code:result.code || '',message:redact(String(result.message || '')),at:result.at};
  ['launcher-error.log','worker-error.log','native-launch-error.log'].forEach(function(name) {
    var file = path.join(job,name);
    if (fs.existsSync(file) && !fs.lstatSync(file).isSymbolicLink()) report.logs[name] = redact(fs.readFileSync(file,'utf8').slice(-3000));
  });
  return JSON.stringify(report, null, 2);
}
module.exports = { compare: compare, safePath: safePath, validateRelease: validateRelease, sha256: sha256, stage: stage, launch: launch, locations: locations, lastResult: lastResult, failureMessage:failureMessage, supportDetails:supportDetails };

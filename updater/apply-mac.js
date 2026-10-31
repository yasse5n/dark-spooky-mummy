/* Execute with /usr/bin/osascript -l JavaScript. No Python/Node installation needed. */
ObjC.import('Foundation');
function run(argv) {
  var fm = $.NSFileManager.defaultManager, home = ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey($('HOME')));
  var work = home + '/Library/Application Support/QAYEM/Updater';
  var target = home + '/Library/Application Support/Adobe/CEP/extensions/com.qayem.style-studio.legacy';
  var job = '', stage = '', backup = '', moved = false, locked = false, validatedJob = false, version = '';
  var lock = work + '/apply.lock', currentState = '', currentMessage = '', lastPulse = 0;
  function normalized(p) { return ObjC.unwrap($(p).stringByStandardizingPath); }
  function exists(p) { return !!fm.fileExistsAtPath($(p)); }
  function plain(p) {
    if (normalized(p) !== ObjC.unwrap($(p).stringByResolvingSymlinksInPath)) throw Error('Symbolic links are not allowed in update paths.');
  }
  function read(p) { var data = $.NSData.dataWithContentsOfFile($(p)); if (!data) throw Error('Required file missing.'); return ObjC.unwrap($.NSString.alloc.initWithDataEncoding(data, $.NSUTF8StringEncoding)); }
  function write(p, value) { if (!$(value).writeToFileAtomicallyEncodingError($(p), true, $.NSUTF8StringEncoding, null)) throw Error('Unable to write update status.'); }
  function execute(binary, args) {
    var task = $.NSTask.alloc.init, pipe = $.NSPipe.pipe;
    task.launchPath = $(binary); task.arguments = $(args); task.standardOutput = pipe; task.standardError = pipe;
    task.launch(); var bytes = pipe.fileHandleForReading.readDataToEndOfFile; task.waitUntilExit();
    var output = ObjC.unwrap($.NSString.alloc.initWithDataEncoding(bytes, $.NSUTF8StringEncoding)) || '';
    if (task.terminationStatus !== 0) throw Error('Update helper ' + binary.split('/').pop() + ' failed (' + task.terminationStatus + '): ' + output.slice(-1200));
    return output;
  }
  function status(state, message) {
    write(job + '/result.json', JSON.stringify({ protocol: 1, status: state, version: version, message: message, code:state === 'failed' ? 'MAC_WORKER' : '', pid: Number($.NSProcessInfo.processInfo.processIdentifier), heartbeat:1, at: new Date().toISOString() }));
    currentState = state; currentMessage = message; lastPulse = Date.now();
  }
  function pulse() {if (currentState && Date.now() - lastPulse >= 2000) status(currentState,currentMessage);}
  function notCancelled() { if (exists(job + '/cancel.request')) throw Error('Update cancelled before installation; current version retained.'); }
  function safe(name) {
    return typeof name === 'string' && name && name.length <= 220 && !/[\\\x00-\x1f\x7f:*?"<>|]/.test(name) && name.charAt(0) !== '/' && name.split('/').every(function(p) { return p && p !== '.' && p !== '..' && !/[. ]$/.test(p) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p); });
  }
  function compare(a, b) {
    if (!/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(a) || !/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(b)) throw Error('Invalid version.');
    var x = a.split('.').map(Number), y = b.split('.').map(Number);
    for (var i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i] ? 1 : -1;
    return 0;
  }
  function photoshopOpen() { return execute('/bin/ps', ['-ax', '-o', 'comm=']).split('\n').some(function(line) { return /Adobe Photoshop[^\n]*\.app\/Contents\/MacOS\//.test(line); }); }
  function verifyTree(dir, files) {
    plain(dir);
    var names = execute('/usr/bin/find', [dir, '-type', 'f']).trim().split('\n');
    if (names.length !== files.length || execute('/usr/bin/find', [dir, '-type', 'l']).trim()) throw Error('Unexpected extracted files or symbolic links.');
    for (var i = 0; i < files.length; i += 100) {
      pulse();
      var chunk = files.slice(i, i + 100), paths = chunk.map(function(f) { var p = dir + '/' + f.path; plain(p); return p; });
      var hashes = execute('/usr/bin/shasum', ['-a', '256'].concat(paths)).trim().split('\n');
      if (hashes.length !== chunk.length) throw Error('File integrity check failed.');
      chunk.forEach(function(f, n) {
        if (hashes[n].slice(0, 64) !== f.sha256 || Number(ObjC.unwrap(fm.attributesOfItemAtPathError($(paths[n]), null).objectForKey($.NSFileSize))) !== f.size) throw Error('File integrity check failed.');
      });
    }
  }
  try {
    if (!home || argv.length !== 1) throw Error('Invalid update invocation.');
    var planPath = normalized(argv[0]); job = normalized(ObjC.unwrap($(planPath).stringByDeletingLastPathComponent));
    if (ObjC.unwrap($(job).stringByDeletingLastPathComponent) !== work || !/^job-[a-f0-9]{32}$/.test(ObjC.unwrap($(job).lastPathComponent)) || ObjC.unwrap($(planPath).lastPathComponent) !== 'plan.json') throw Error('Invalid update job location.');
    plain(job); plain(target);
    validatedJob = true;
    notCancelled();
    var plan = JSON.parse(read(planPath)); version = plan.version;
    if (plan.protocol !== 1 || plan.bundleId !== 'com.qayem.style-studio.legacy' || normalized(plan.target) !== target || normalized(plan.job) !== job || compare(version, plan.fromVersion) <= 0 || !/^[a-f0-9]{64}$/.test(plan.sha256) || plan.bytes < 22 || plan.bytes > 94371840 || !Array.isArray(plan.files) || plan.files.length < 15 || plan.files.length > 1800) throw Error('Invalid update plan.');
    var seen = Object.create(null), total = 0;
    plan.files.forEach(function(f) { var key = String(f.path).toLowerCase(); if (!safe(f.path) || Object.prototype.hasOwnProperty.call(seen, key) || !/^[a-f0-9]{64}$/.test(f.sha256) || f.size < 0 || f.size > 94371840) throw Error('Unsafe update inventory.'); seen[key] = true; total += f.size; });
    if (total > 419430400) throw Error('Expanded update is too large.');
    var oldConfig = JSON.parse(read(target + '/updater-config.json'));
    if (oldConfig.bundleId !== plan.bundleId || oldConfig.version !== plan.fromVersion) throw Error('Installed version changed.');
    if (exists(lock)) throw Error('Another update lock exists. Use the installer or contact support with update details.');
    execute('/bin/mkdir', [lock]); locked = true;
    status('preparing', 'Checking update files.');
    var archive = job + '/package.zip'; plain(archive);
    if (execute('/usr/bin/shasum', ['-a', '256', archive]).slice(0, 64) !== plan.sha256 || Number(ObjC.unwrap(fm.attributesOfItemAtPathError($(archive), null).objectForKey($.NSFileSize))) !== plan.bytes) throw Error('Downloaded update failed its integrity check.');
    var zipNames = execute('/usr/bin/unzip', ['-Z1', archive]).trim().split('\n'), zipSeen = Object.create(null);
    if (zipNames.length !== plan.files.length || /^l[rwx-]{9}\s/m.test(execute('/usr/bin/unzip', ['-Z', '-l', archive]))) throw Error('Unsafe ZIP inventory.');
    zipNames.forEach(function(n) { var rel = n.slice(7), key = rel.toLowerCase(); if (n.slice(0, 7) !== 'plugin/' || !safe(rel) || !seen[key] || zipSeen[key]) throw Error('Unexpected ZIP path.'); zipSeen[key] = true; });
    var extracted = job + '/unpacked'; execute('/bin/mkdir', [extracted]);
    execute('/usr/bin/unzip', ['-q', archive, '-d', extracted]); stage = extracted + '/plugin';
    verifyTree(stage, plan.files);
    var newConfig = JSON.parse(read(stage + '/updater-config.json'));
    if (newConfig.version !== version || newConfig.bundleId !== plan.bundleId) throw Error('Release identity mismatch.');
    notCancelled();
    status('waiting', 'Save your work and close Photoshop. Wait for the completion message before reopening it.');
    var deadline = Date.now() + 20 * 60 * 1000;
    var quietSince = 0;
    while (true) {
      pulse();
      notCancelled(); if (Date.now() > deadline) throw Error('Photoshop is still open. Update cancelled; current version retained.');
      if (photoshopOpen()) quietSince = 0;
      else if (!quietSince) quietSince = Date.now();
      else if (Date.now() - quietSince >= 3000) break;
      $.NSThread.sleepForTimeInterval(0.5);
    }
    status('installing', 'Installing and verifying update. Keep Photoshop closed until completion.');
    verifyTree(stage, plan.files); plain(target);
    if (JSON.parse(read(target + '/updater-config.json')).version !== plan.fromVersion || photoshopOpen()) throw Error('Installed version or Photoshop state changed.');
    notCancelled();
    var backups = home + '/Library/Application Support/QAYEM/Backups'; plain(backups); execute('/bin/mkdir', ['-p', backups]);
    backup = backups + '/auto-' + plan.fromVersion + '-' + ObjC.unwrap($(job).lastPathComponent);
    execute('/bin/mv', [target, backup]); execute('/bin/mv', [stage, target]); moved = true;
    verifyTree(target, plan.files); status('installed', 'Update installed and verified. Open Photoshop to continue.');
    try { var app = Application.currentApplication(); app.includeStandardAdditions = true; app.displayNotification('تم تحديث البلاجن. تقدر تفتح Photoshop دلوقتي.', { withTitle: 'QAYEM Style Studio' }); } catch (notificationError) {}
    return 'UPDATE_INSTALLED';
  } catch (error) {
    var message = String(error.message || error);
    try { if (moved && exists(target)) execute('/bin/rm', ['-rf', target]); if (backup && exists(backup) && !exists(target)) execute('/bin/mv', [backup, target]); } catch (restore) { message += ' Backup restoration needs attention.'; }
    if (validatedJob && job && exists(job)) status('failed', message);
    throw error;
  } finally { if (locked) { try { execute('/bin/rmdir', [lock]); } catch (ignored) {} } }
}

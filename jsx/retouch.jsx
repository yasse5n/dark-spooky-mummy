// ES3 ExtendScript, loaded only when the user requests a retouch action.
var QayemCEPRetouch = (function () {
  var setName = 'QAYEM Retouch 1.24.6';
  var skinNames = ["frequency separation ME", "تنعيم ME", "تنعيم2 ME", "تنعيم3 ME", "skin tone ME", "مسام البشره ME", "تبييض وجه ME", "Skin Brouwn Pro ME", "Skin Orange & Yellow", "Skin Orange & Yellow 1", "Skin: Brouwn *", "Skin: Tone brouwn *", "Skin: coler *", "Skin Pro", "Skin Tone", "Skin tone 2", "Skin: Tone RA *", "skin retouch auto ", "skin retouch auto 1", "Frquensaprtion", "تنعيم", "2تنعبم"];
  function preflight(name) {
    var isSkin = false, i;
    for (i = 0; i < skinNames.length; i++) if (skinNames[i] === name) isSkin = true;
    if (isSkin) {
      var doc = app.activeDocument;
      if (doc.mode !== DocumentMode.RGB || doc.bitsPerChannel !== BitsPerChannelType.EIGHT) throw new Error('اختيارات البشرة الحالية تحتاج RGB و8 Bits/Channel. جهّز نسخة بهذه الإعدادات من Image > Mode ثم حاول مجددًا؛ لم يبدأ الأكشن.');
      if (!doc.activeLayer || doc.activeLayer.typename !== 'ArtLayer' || doc.activeLayer.kind !== LayerKind.NORMAL) throw new Error('اختار لاير الصورة العادي قبل ريتتش البشرة، بدل النص أو الجروب أو Smart Object؛ لم يبدأ الأكشن.');
    }
    if (name === 'Skin Pro') {
      var found = false, index = 1;
      while (true) {
        var ref = new ActionReference(), desc; ref.putIndex(charIDToTypeID('ASet'), index);
        try { desc = executeActionGet(ref); } catch (error) { break; }
        if (desc.getString(charIDToTypeID('Nm  ')) === 'action_retouchskin') {
          var required = ['Skin: EraserSkin','Skin: Foundation'], count = desc.getInteger(charIDToTypeID('NmbC')), matches = 0;
          for (i = 1; i <= count; i++) { var actionRef = new ActionReference(); actionRef.putIndex(charIDToTypeID('Actn'), i); actionRef.putIndex(charIDToTypeID('ASet'), index); var actual = executeActionGet(actionRef).getString(charIDToTypeID('Nm  ')); if (actual === required[0] || actual === required[1]) matches++; }
          found = matches === 2; break;
        }
        index++;
      }
      if (!found) throw new Error('Skin Pro يحتاج أكشنَي Skin: EraserSkin وSkin: Foundation من مجموعة action_retouchskin؛ المجموعة الإضافية غير مرفقة. لم يبدأ الأكشن.');
    }
  }
  function trim(text) { return String(text).replace(/^\s+|\s+$/g, ''); }
  function sets() {
    var matches = [], index = 1;
    while (true) {
      var ref = new ActionReference(), desc;
      ref.putIndex(charIDToTypeID('ASet'), index);
      try { desc = executeActionGet(ref); } catch (error) { break; }
      if (desc.getString(charIDToTypeID('Nm  ')) === setName) matches.push({index:index, count:desc.getInteger(charIDToTypeID('NmbC'))});
      index++;
    }
    if (matches.length > 1) throw new Error('فيه أكثر من نسخة من مجموعة الأكشنات. اترك نسخة واحدة في Actions ثم حاول مرة ثانية.');
    return matches.length ? matches[0] : null;
  }
  function actionName(set, requested) {
    var matches = [], i;
    for (i = 1; i <= set.count; i++) {
      var ref = new ActionReference();
      ref.putIndex(charIDToTypeID('Actn'), i); ref.putIndex(charIDToTypeID('ASet'), set.index);
      var actual = executeActionGet(ref).getString(charIDToTypeID('Nm  '));
      if (trim(actual) === trim(requested)) matches.push(actual);
    }
    if (matches.length !== 1) throw new Error('الأكشن غير موجود أو اسمه مكرر في المجموعة المحمّلة. راجع لوحة Actions.');
    return matches[0];
  }
  function run(root, name, duplicate) {
    var original = null, copied = false, started = false;
    try {
      if (!app.documents.length) throw new Error('افتح صورة في Photoshop الأول.');
      preflight(name);
      original = app.activeDocument;
      var set = sets();
      if (!set) {
        var file = new File(root + '/actions/me-retouch.atn');
        if (!file.exists) throw new Error('ملف الأكشن المرفق غير موجود. أعد تثبيت مجلد البلاجين كاملًا.');
        app.load(file); set = sets();
      }
      if (!set) throw new Error('تعذّر تحميل الأكشنات. حمّل ملف الأكشن من Window > Actions > Load Actions.');
      var actual = actionName(set, name);
      // Loading actions must not send retouch to a different active project.
      app.activeDocument = original;
      if (duplicate) {
        app.activeDocument = original.duplicate(original.name + ' - QAYEM Retouch', false);
        copied = true;
      }
      started = true; app.doAction(actual, setName);
      return 'OK|' + (copied ? '1' : '0') + '|' + encodeURIComponent(name);
    } catch (error) {
      var message = String(error.message || error);
      if (started) message = 'الأكشن توقف أو اتلغى؛ راجع اللايرات، ممكن يكون نفّذ بعض الخطوات. ' + message;
      return 'ERR|' + encodeURIComponent(message);
    }
  }
  return {run:run};
})();

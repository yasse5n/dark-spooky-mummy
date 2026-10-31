var QayemReceiptPicker = (function (root) {
  'use strict';
  var limit = 5 * 1024 * 1024;
  function nativeFs() { try { return root.QayemNativeRequire && root.QayemNativeRequire('fs'); } catch (e) { return null; } }
  function read(filePath) {
    if (typeof filePath !== 'string' || !filePath || filePath.length > 32768) throw new Error('مسار الصورة غير صالح');
    var ext = /\.(png|jpe?g|gif|webp)$/i.exec(filePath);
    if (!ext) throw new Error('اختار صورة PNG أو JPEG أو GIF أو WEBP فقط');
    var fs = nativeFs(), base64;
    if (fs) {
      var stat = fs.statSync(filePath);
      if (!stat.isFile() || stat.size <= 0 || stat.size > limit) throw new Error('اختار صورة بحجم لا يزيد عن ٥ ميجا');
      var bytes = fs.readFileSync(filePath);
      if (bytes.length > limit) throw new Error('حجم الصورة أكبر من ٥ ميجا');
      base64 = bytes.toString('base64');
    } else {
      var cep = root.cep;
      if (!cep || !cep.fs || !cep.encoding) throw new Error('تعذّر قراءة الصورة. أعد فتح البلاجن وحاول مرة أخرى');
      var info = typeof cep.fs.stat === 'function' ? cep.fs.stat(filePath) : null;
      if (info && info.err) throw new Error('تعذّر الوصول للصورة');
      if (info && info.data && Number(info.data.size) > limit) throw new Error('حجم الصورة أكبر من ٥ ميجا');
      var result = cep.fs.readFile(filePath, cep.encoding.Base64);
      if (!result || result.err || typeof result.data !== 'string') throw new Error('تعذّر قراءة الصورة');
      base64 = result.data.replace(/\s/g, '');
    }
    if (!base64 || base64.length > Math.ceil(limit / 3) * 4) throw new Error('اختار صورة بحجم لا يزيد عن ٥ ميجا');
    var header = atob(base64.slice(0, 48)), mime = '';
    if (header.slice(0, 8) === '\x89PNG\r\n\x1a\n') mime = 'image/png';
    else if (header.charCodeAt(0) === 255 && header.charCodeAt(1) === 216 && header.charCodeAt(2) === 255) mime = 'image/jpeg';
    else if (/^GIF8[79]a/.test(header)) mime = 'image/gif';
    else if (header.slice(0, 4) === 'RIFF' && header.slice(8, 12) === 'WEBP') mime = 'image/webp';
    if (!mime) throw new Error('الملف مش صورة صالحة');
    return { path: filePath, name: filePath.replace(/\\/g, '/').split('/').pop(), dataUrl: 'data:' + mime + ';base64,' + base64 };
  }
  function pick() {
    if (root.QayemLifecycle) root.QayemLifecycle.persist();
    var fs = root.cep && root.cep.fs;
    if (!fs || (typeof fs.showOpenDialogEx !== 'function' && typeof fs.showOpenDialog !== 'function')) throw new Error('نافذة اختيار الصورة غير متاحة. أعد فتح البلاجن بعد التحديث');
    var choose = fs.showOpenDialogEx || fs.showOpenDialog;
    var result = choose.call(fs, false, false, 'اختيار صورة إيصال التحويل', '', ['png','jpg','jpeg','gif','webp']);
    if (!result || result.err) throw new Error('تعذّر فتح الصورة. حاول مرة أخرى');
    if (!result.data || !result.data.length) return null;
    return read(result.data[0]);
  }
  return { pick: pick, read: read };
})(window);

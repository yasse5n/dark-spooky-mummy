// Native Photoshop action playback; never runs an entire ActionSet.
function createRetouchEngine(ps, fs, catalog) {
  if (!ps || !ps.app || !ps.core || typeof ps.core.executeAsModal !== "function" || !ps.app.actionTree) {
    throw new Error("إصدار Photoshop ده لا يوفر واجهة تشغيل الريتتش المطلوبة. حمّل ملف الأكشن المرفق يدويًا من Window > Actions > Load Actions وشغّله من لوحة Actions.");
  }
  let busy = false;
  let boundSetId = null;
  function findSet() {
    const matches = Array.from(ps.app.actionTree || []).filter(set => set.name === catalog.setName);
    const bound = matches.find(set => set.id === boundSetId);
    if (bound) return bound;
    if (matches.length > 1) throw new Error("فيه أكثر من نسخة من مجموعة الأكشنات في Actions. اترك نسخة واحدة ثم حاول التشغيل مرة ثانية.");
    return matches[0] || null;
  }
  function findAction(set, name) {
    const actions = Array.from(set.actions || []);
    const exact = actions.filter(action => action.name === name);
    if (exact.length === 1) return exact[0];
    if (exact.length > 1) throw new Error("اسم الأكشن مكرر داخل المجموعة. اترك نسخة واحدة من الاختيار.");
    // Photoshop can trim trailing whitespace from recorded names.
    const normalized = actions.filter(action => action.name.trim() === name.trim());
    if (normalized.length === 1) return normalized[0];
    throw new Error("الأكشن المختار غير موجود في مجموعة الأكشنات المحمّلة. حمّل ملف الأكشن المرفق أو راجع اختيارات Actions.");
  }
  function state() {
    const set = findSet();
    return {installed: !!set, count: set ? Array.from(set.actions || []).length : 0};
  }
  async function loadInModal() {
    const current = findSet();
    if (current) return current;
    const folder = await fs.getPluginFolder();
    const entry = await folder.getEntry(catalog.file);
    let loadError;
    try { await ps.app.open(entry); } catch (error) { loadError = error; }
    // Some hosts return no Document for ATN imports; the action tree is authoritative.
    const loaded = findSet();
    if (!loaded) throw new Error("تعذّر تحميل ملف الأكشن. من Window > Actions اختار Load Actions وحمّل ملف الأكشن المرفق من مجلد البلاجين، ثم حاول التشغيل مرة ثانية." + (loadError ? "\n" + String(loadError.message || loadError) : ""));
    boundSetId = loaded.id;
    return loaded;
  }
  async function exclusive(task) {
    if (busy) throw new Error("فيه عملية ريتتش شغالة؛ استنى نهايتها.");
    busy = true;
    try { return await task(); } finally { busy = false; }
  }
  async function install() {
    return exclusive(() => ps.core.executeAsModal(async () => {
      const set = await loadInModal();
      return {installed:true, count:Array.from(set.actions || []).length};
    }, {commandName:"QAYEM — Load Retouch Actions", interactive:true}));
  }
  function preflight(option, doc) {
    if (option.category === "skin") {
      const constants = ps.constants || {};
      if (!constants.DocumentMode || !constants.BitsPerChannelType || doc.mode !== constants.DocumentMode.RGB || doc.bitsPerChannel !== constants.BitsPerChannelType.EIGHT) {
        throw new Error("اختيارات البشرة الحالية تحتاج RGB و8 Bits/Channel. جهّز نسخة بهذه الإعدادات من Image > Mode ثم حاول مجددًا؛ لم يبدأ الأكشن.");
      }
      const layers = Array.from(doc.activeLayers || []);
      if (!constants.LayerKind || layers.length !== 1 || layers[0].kind !== constants.LayerKind.NORMAL) {
        throw new Error("اختار لاير الصورة العادي قبل ريتتش البشرة، بدل النص أو الجروب أو Smart Object؛ لم يبدأ الأكشن.");
      }
    }
    for (const required of option.requiresActions || []) {
      const sets = Array.from(ps.app.actionTree || []).filter(set => set.name === required.set);
      if (sets.length !== 1 || !Array.from(sets[0].actions || []).some(action => action.name === required.name)) {
        throw new Error("Skin Pro يحتاج أكشنَي Skin: EraserSkin وSkin: Foundation من مجموعة action_retouchskin؛ المجموعة الإضافية غير مرفقة. لم يبدأ الأكشن.");
      }
    }
  }
  async function run(name, {duplicate = false} = {}) {
    const option = catalog.actions.find(action => action.name === name);
    if (!option) throw new Error("اختار أكشن ريتتش من القائمة.");
    if (!ps.app.documents.length || !ps.app.activeDocument) throw new Error("افتح صورة في Photoshop الأول.");
    return exclusive(() => ps.core.executeAsModal(async context => {
      const original = ps.app.activeDocument;
      if (!original) throw new Error("افتح صورة في Photoshop الأول.");
      preflight(option, original);
      const set = await loadInModal();
      const selected = findAction(set, option.name);
      if (context.isCancelled) throw new Error("تم إلغاء التشغيل.");
      if (!Array.from(ps.app.documents).some(doc => doc.id === original.id)) throw new Error("الملف الأصلي اتقفل قبل التشغيل؛ لم يبدأ الأكشن.");
      ps.app.activeDocument = original;
      let copied = false;
      if (duplicate) {
        const copy = await original.duplicate(original.name + " — QAYEM Retouch", false);
        if (!copy) throw new Error("تعذّر إنشاء نسخة من الصورة؛ لم يبدأ الأكشن.");
        ps.app.activeDocument = copy;
        copied = true;
      }
      if (context.isCancelled) throw new Error("تم إلغاء التشغيل قبل بدء الأكشن.");
      try {
        await selected.play();
      } catch (error) {
        throw new Error("الأكشن توقف أو اتلغى. " + (copied ? "راجع النسخة الجديدة؛ ممكن يكون أضاف لايرات قبل التوقف." : "راجع اللايرات؛ ممكن يكون نفّذ بعض الخطوات قبل التوقف.") + "\nتفاصيل Photoshop: " + String(error.message || error));
      }
      return {name:option.name, copied};
    }, {commandName:"QAYEM — " + option.name, interactive:true}));
  }
  return {state, install, run};
}
if (typeof module !== "undefined") module.exports = {createRetouchEngine};

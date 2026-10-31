/* global RETOUCH_CATALOG, createRetouchEngine */
runUiInitializer("retouchView", function () {
  const node = id => document.getElementById(id);
  let engine = null;
  let hostError = "";
  let busy = false;
  try {
    if (typeof QAYEM_CEP_HOST !== "undefined" && QAYEM_CEP_HOST) {
      engine = createCepRetouchEngine(RETOUCH_CATALOG);
    } else if (typeof require === "function") {
      if (QAYEM_LEGACY_HOST) throw new Error("نسخة التوافق تستخدم واجهة Photoshop القديمة لتجهيز البرومبتات. لتشغيل الريتتش حمّل ملف الأكشن المرفق يدويًا من Window > Actions > Load Actions وشغّله من لوحة Actions. للتشغيل من البلاجين استخدم النسخة الحديثة على Photoshop 23.3 فأحدث.");
      engine = createRetouchEngine(require("photoshop"), require("uxp").storage.localFileSystem, RETOUCH_CATALOG);
    }
  } catch (error) { hostError = error.message || String(error); }
  RETOUCH_CATALOG.categories.forEach(([value, label]) => {
    const option = document.createElement("option"); option.value = value; option.textContent = label;
    node("retouchCategory").appendChild(option);
  });
  function selected() { return RETOUCH_CATALOG.actions.find(action => action.name === node("retouchAction").value); }
  function status(text, error) {
    node("retouchStatus").textContent = String(text).split(RETOUCH_CATALOG.setName).join("أكشنات الريتتش").replace(/ME\s+Retouch/gi, "أكشنات الريتتش").replace(/(?:actions\/)?me-retouch\.atn/gi, "ملف الأكشن");
    node("retouchStatus").style.color = error ? "#ff9a9d" : "#dde8ee";
  }
  function controls() {
    ["retouchCategory", "retouchSearch", "retouchAction", "retouchDuplicate", "backRetouch"].forEach(id => { node(id).disabled = busy; });
    node("retouchRun").disabled = busy || !engine || !selected();
    node("retouchRun").textContent = busy ? "جاري التشغيل…" : "تشغيل الأكشن المختار";
  }
  function describe() {
    const option = selected();
    node("retouchActionName").textContent = option ? option.name : "لا توجد نتائج";
    node("retouchActionDescription").textContent = option ? option.label + " · " + option.steps + " خطوة مسجّلة." : "غيّر البحث أو التصنيف لعرض الخيارات.";
    node("retouchActionNotes").textContent = option ? option.notes.concat(option.category === "skin" ? ["قبل التشغيل: اختار لاير الصورة العادي في ملف RGB و8 Bits/Channel. التحقق يمنع التشغيل على إعدادات غير مناسبة."] : []).join("\n") : "";
    status(engine ? "" : hostError || "التشغيل متاح من داخل Photoshop.", !engine); controls();
  }
  function filter() {
    const old = node("retouchAction").value;
    const category = node("retouchCategory").value;
    const query = node("retouchSearch").value.trim().toLowerCase();
    const actions = RETOUCH_CATALOG.actions.filter(action => (category === "all" || action.category === category) && (action.name + " " + action.label + " " + (typeof qayemUiText === "function" ? qayemUiText(action.label) : "")).toLowerCase().includes(query));
    while (node("retouchAction").firstChild) node("retouchAction").removeChild(node("retouchAction").firstChild);
    actions.forEach(action => {
      const option = document.createElement("option"); option.value = action.name; option.textContent = action.label;
      node("retouchAction").appendChild(option);
    });
    if (actions.some(action => action.name === old)) node("retouchAction").value = old;
    node("retouchResultCount").textContent = actions.length + " من " + RETOUCH_CATALOG.actions.length + " أكشن ريتتش";
    describe();
  }
  async function perform(task) {
    if (!engine || busy) return;
    busy = true; controls(); status("جاري تنفيذ الاختيار…");
    try {
      if (typeof QayemLicenseGate === "undefined") throw new Error("نظام التفعيل غير جاهز. أعد فتح البلاجن.");
      await QayemLicenseGate.ensureEntitled({force:true,action:'retouch',params:{id:node('retouchAction').value}});
      await task();
    } catch (error) { status(error.message || String(error), true); }
    finally { busy = false; controls(); }
  }
  node("retouchRun").addEventListener("click", () => {
    const option = selected();
    if (!option) return;
    const duplicate = node("retouchDuplicate").checked;
    perform(async () => {
      const result = await engine.run(option.name, {duplicate});
      status("انتهى تشغيل «" + result.name + "»" + (result.copied ? " على نسخة جديدة." : " على نفس الملف المفتوح.") + " راجع اللايرات وتعليمات الأكشن؛ بعض الخيارات بتجهّز ماسك تكمله بالفرشاة.");
    });
  });
  node("retouchCategory").addEventListener("change", filter);
  node("retouchSearch").addEventListener("input", filter);
  node("retouchAction").addEventListener("change", describe);
  filter();
});

// Manifest v4 hosts cannot use UXP's system clipboard API. Do not fake success.
async function writeQayemClipboard(text) {
  if (typeof QAYEM_CEP_HOST !== "undefined" && QAYEM_CEP_HOST) return QayemCEPBridge.copy(text);
  const inHost = typeof require === "function";
  if (inHost && QAYEM_LEGACY_HOST) return false;
  let clipboard;
  try { clipboard = typeof navigator !== "undefined" ? navigator.clipboard : null; } catch (error) { return false; }
  if (!clipboard) return false;
  const data = {"text/plain": text};
  const attempts = [];
  if (typeof clipboard.setContent === "function") attempts.push(() => clipboard.setContent(data));
  if (inHost && typeof clipboard.write === "function") attempts.push(() => clipboard.write(data));
  if (typeof clipboard.writeText === "function") attempts.push(() => clipboard.writeText(inHost ? data : text));
  for (let i = 0; i < attempts.length; i++) {
    try { await attempts[i](); return true; } catch (error) { /* Try another supported API, then offer native selection. */ }
  }
  return false;
}

function createPromptCopyController(options) {
  const button = document.getElementById(options.button);
  const preview = document.getElementById(options.preview);
  const status = document.getElementById(options.status);
  const originalLabel = button.textContent;
  let revision = 0, busy = false, manualText = null;
  function message(text, error) {
    status.textContent = text;
    status.style.color = error ? "#ff9a9d" : "#dde8ee";
  }
  function state(name, label) {
    button.setAttribute("data-copy-state", name);
    button.textContent = label;
  }
  function invalidate() {
    revision++;
    manualText = null;
    preview.value = "";
    state("ready", originalLabel);
    message("", false);
  }
  function copied() {
    manualText = null;
    state("copied", "تم النسخ");
    message(options.successText, false);
  }
  function selectForNativeCopy(text) {
    manualText = text;
    let selected = false;
    try {
      preview.focus();
      if (typeof preview.select === "function") preview.select();
      preview.selectionStart = 0;
      preview.selectionEnd = text.length;
      selected = preview.selectionStart === 0 && preview.selectionEnd === text.length;
    } catch (error) { /* Preserve the generated text even if an older host cannot select it. */ }
    try { if (typeof preview.scrollIntoView === "function") preview.scrollIntoView(false); } catch (ignored) {}
    state("manual", "اضغط Ctrl+C / ⌘C");
    const reason = QAYEM_LEGACY_HOST && typeof require === "function"
      ? getQayemCopySupport().manualReason
      : " تعذّر الوصول للحافظة تلقائيًا؛ تقدر تنسخه بالاختصار.";
    const instruction = selected
      ? "البرومبت جاهز ومتحدد بالكامل. اضغط Ctrl+C على Windows أو ⌘C على Mac لنسخه."
      : "البرومبت جاهز. اضغط داخل المعاينة، ثم Ctrl+A لتحديد الكل وCtrl+C للنسخ، أو ⌘A ثم ⌘C على Mac.";
    message(instruction + reason, false);
  }
  button.addEventListener("click", async () => {
    if (busy) return;
    const currentRevision = ++revision;
    manualText = null;
    busy = true;
    button.disabled = true;
    state("busy", QAYEM_LEGACY_HOST ? "جاري تجهيز البروبت…" : "جاري التجهيز والنسخ…");
    try {
      if (typeof QayemLicenseGate === "undefined") throw new Error("نظام التفعيل غير جاهز. أعد فتح البلاجن.");
      const access = typeof QayemTrial !== 'undefined' ? QayemTrial.forButton(options.button) : null;
      await QayemLicenseGate.ensureEntitled(Object.assign({force:true}, access || {}));
      if (currentRevision !== revision) return;
      const text = options.build();
      preview.value = text;
      const success = await writeQayemClipboard(text);
      if (currentRevision !== revision) return;
      if (success) copied(); else selectForNativeCopy(text);
    } catch (error) {
      if (currentRevision === revision) {
        preview.value = "";
        state("ready", originalLabel);
        message(error.message || String(error), true);
      }
    } finally {
      busy = false;
      button.disabled = false;
    }
  });
  // When a host emits the native copy event, acknowledge a full-preview copy.
  // A keyboard press alone is never treated as proof that copying succeeded.
  preview.addEventListener("copy", event => {
    if (event.isTrusted === false) return;
    if (manualText === null || preview.value !== manualText || preview.selectionStart !== 0 || preview.selectionEnd !== manualText.length) return;
    const currentRevision = revision;
    setTimeout(() => {
      if (!event.defaultPrevented && currentRevision === revision && manualText !== null) copied();
    }, 0);
  });
  return {invalidate};
}

// Explain the selected compatibility build before the user opens a design mode.
const qayemCopyNotice = document.getElementById("clipboardCompatibilityNotice");
if (qayemCopyNotice) {
  qayemCopyNotice.textContent = getQayemCopySupport().notice;
  setUiHidden(qayemCopyNotice, !QAYEM_LEGACY_HOST);
}

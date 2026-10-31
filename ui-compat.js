// Loaded before navigation and mode controllers. No Photoshop API is needed here.
const QAYEM_LEGACY_HOST = false;

function setUiHidden(element, hidden) {
  if (!element) return;
  // Do not rely on HTMLElement.hidden reflecting the HTML attribute in older UXP.
  if (hidden) {
    if (element.style.display !== "none") element.setAttribute("data-qayem-display", element.style.display || "");
    element.setAttribute("hidden", "");
    element.style.display = "none";
  } else {
    element.removeAttribute("hidden");
    element.style.display = element.getAttribute("data-qayem-display") || "";
  }
}

function runUiInitializer(screenId, initialize) {
  try { initialize(); }
  catch (error) {
    // A failed mode must not prevent the home buttons or other modes from working.
    const screen = document.getElementById(screenId);
    if (!screen) return;
    const message = document.createElement("p");
    message.className = "startupError";
    message.setAttribute("role", "alert");
    let host = "";
    try { if (typeof require === "function") host = " · Photoshop " + require("photoshop").app.version; } catch (ignored) {}
    message.textContent = "تعذّر تجهيز بعض خيارات هذا القسم. ابعت تفاصيل الرسالة للدعم: QAYEM 1.24.31" + host + " · " + String(error.message || error);
    screen.insertBefore(message, screen.firstChild);
  }
}

// Manifest v4 cannot acquire clipboard permission, even on a newer Photoshop.
function getQayemCopySupport() {
  let version = "";
  try { if (typeof require === "function") version = String(require("photoshop").app.version || ""); } catch (ignored) {}
  const parts = /^(\d+)\.(\d+)/.exec(version);
  const modernHost = !!parts && (Number(parts[1]) > 23 || (Number(parts[1]) === 23 && Number(parts[2]) >= 3));
  if (!QAYEM_LEGACY_HOST) return {notice: "", manualReason: ""};
  if (modernHost) return {
    notice: "Photoshop " + version + " يدعم النسخة الحديثة، لكنك حمّلت نسخة التوافق. للنسخ التلقائي: احذف النسخة المحمّلة من UXP Developer Tool ثم أضف مجلد qayem_style_studio. النسخة الحالية تجهّز النص للنسخ اليدوي بـ Ctrl+C / ⌘C.",
    manualReason: " للنسخ التلقائي على Photoshop " + version + "، حمّل مجلد qayem_style_studio بدل نسخة التوافق."
  };
  return {
    notice: (version ? "Photoshop " + version + ": " : "نسخة التوافق لـ Photoshop 22 حتى 23.2: ") + "النسخ هنا يدوي. اضغط تجهيز البروبت ثم Ctrl+C على Windows أو ⌘C على Mac. النسخ التلقائي يحتاج Photoshop 23.3 فأحدث ومجلد qayem_style_studio.",
    manualReason: " نسخة التوافق لا تدعم النسخ التلقائي؛ يتاح من Photoshop 23.3 فأحدث باستخدام مجلد qayem_style_studio."
  };
}

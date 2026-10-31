(function () {
  const phone = "01200107845";
  const links = {
    contactFacebook: {url: "https://www.facebook.com/M.ryoutuber2002", label: "حساب فيسبوك محمد قيم"},
    contactYouTube: {url: "https://www.youtube.com/@MohamedQayem-Gr", label: "قناة يوتيوب محمد قيم"},
    contactWhatsAppGroup: {url: "https://chat.whatsapp.com/G5xCbtdVL088SAUOfIxikZ", label: "جروب واتساب بلاجن قيم", status: "studioWhatsAppStatus"},
    contactWhatsApp: {url: "https://wa.me/201200107845", label: "التواصل مع محمد قيم على واتساب"}
  };
  const status = document.getElementById("contactStatus");
  function activate(id, action) {
    const node = document.getElementById(id);
    node.addEventListener("click", action);
    if (node.getAttribute("role") === "button") node.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        action();
      }
    });
  }
  Object.keys(links).forEach(id => activate(id, async () => {
    const link = links[id];
    const feedback = link.status ? document.getElementById(link.status) : status;
    feedback.textContent = "";
    try {
      if (typeof QAYEM_CEP_HOST !== "undefined" && QAYEM_CEP_HOST) {
        QayemCEPBridge.openExternal(link.url);
      } else if (typeof require === "function") {
        const result = await require("uxp").shell.openExternal(link.url, "فتح " + link.label + " في المتصفح للتواصل.");
        if (result) throw new Error("External link was not opened");
      } else {
        window.open(link.url, "_blank", "noopener,noreferrer");
        // Browser preview only; Photoshop uses the UXP shell above.
      }
    } catch (error) {
      feedback.textContent = "لم يتم فتح الرابط. يمكنك فتحه يدويًا: " + link.url;
    }
  }));
  activate("copyContactPhone", async () => {
    const copied = await writeQayemClipboard(phone);
    status.textContent = copied ? "رقم التواصل اتنسخ." : "انسخ الرقم الظاهر يدويًا: " + phone;
  });
})();

(function (root) {
  "use strict";

  // Online licensing only — plugin talks to studio.qayem.art (no localhost).
  root.QAYEM_AUTH_CONFIG = {
    apiBase: "https://studio.qayem.art",
    apiBaseFallbacks: [],
    appName: "QAYEM Style Studio",
    supportEmail: "support@qayem.art",
    revalidateMinutes: 2,
    storageKey: "qayem_license_session_v1",
    requestTimeoutMs: 12000
  };
})(typeof window !== "undefined" ? window : this);

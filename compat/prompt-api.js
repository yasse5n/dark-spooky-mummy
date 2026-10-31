var QayemLicenseGate, QayemPromptAPI, QayemPromptApi;
(function (root) {
  "use strict";

  function invalidate() {}

  function ensureEntitled() {
    return Promise.resolve({ ok: true, token: 'local-token', license: { ok: true, tier: 'paid' } });
  }

  root.QayemLicenseGate = {
    ensureEntitled: ensureEntitled,
    invalidate: invalidate
  };

  root.QayemPromptAPI = {
    ensureEntitled: ensureEntitled,
    invalidate: invalidate
  };
  root.QayemPromptApi = root.QayemPromptAPI;
  QayemLicenseGate = root.QayemLicenseGate;
  QayemPromptAPI = root.QayemPromptAPI;
  QayemPromptApi = root.QayemPromptAPI;
})(typeof window !== "undefined" ? window : this);

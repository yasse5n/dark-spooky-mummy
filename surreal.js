/* global SURREAL_PALETTES, SURREAL_REACTIONS, SURREAL_HANDS, buildSurrealThumbnailPrompt */
runUiInitializer("surrealView", function () {
  const node = id => document.getElementById(id);
  const promptCopy = createPromptCopyController({"button": "copySurrealPrompt", "preview": "surrealPreview", "status": "surrealStatus", "successText": "البرومبت اتنسخ. أرفق صورة الشخص أولًا، ثم صورة الملابس في أداة الصور.", build: makeSurrealPrompt});
  function populate(id, choices) {
    choices.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      node(id).appendChild(option);
    });
  }
  populate("surrealPalette", SURREAL_PALETTES.map(item => [item.key, item.label]).concat([["auto", "اقترح لي ألوان تلقائيًا"]]));
  populate("surrealReaction", SURREAL_REACTIONS);
  populate("surrealHand", SURREAL_HANDS);
  node("surrealHand").value = "relaxed";
  function invalidate() {
    promptCopy.invalidate();
  }
  function sync() {
    setUiHidden(node("surrealReactionFields"), node("surrealReaction").value !== "custom");
    setUiHidden(node("surrealHeldFields"), node("surrealHand").value !== "holding");
    setUiHidden(node("surrealHandFields"), node("surrealHand").value !== "custom");
    setUiHidden(node("surrealSceneFields"), node("surrealSceneMode").value !== "yes");
    setUiHidden(node("surrealForegroundFields"), node("surrealForegroundMode").value === "none");
    const swatches = node("surrealSwatches");
    while (swatches.firstChild) swatches.removeChild(swatches.firstChild);
    const palette = SURREAL_PALETTES.find(item => item.key === node("surrealPalette").value);
    setUiHidden(swatches, !palette);
    if (palette) palette.colors.forEach(color => {
      const swatch = document.createElement("span");
      swatch.style.backgroundColor = color;
      swatches.appendChild(swatch);
    });
    invalidate();
  }
  ["surrealPosition", "surrealPalette", "surrealReaction", "surrealHand", "surrealSceneMode", "surrealForegroundMode", "surrealRecolor"].forEach(id => node(id).addEventListener("change", sync));
  ["surrealReactionCustom", "surrealHeldObject", "surrealHandCustom", "surrealHandNote", "surrealSceneDescription", "surrealForegroundDescription"].forEach(id => node(id).addEventListener("input", invalidate));
  function makeSurrealPrompt() {
    return buildSurrealThumbnailPrompt({
        position: node("surrealPosition").value,
        palette: node("surrealPalette").value,
        reaction: node("surrealReaction").value,
        reactionCustom: node("surrealReactionCustom").value,
        hand: node("surrealHand").value,
        heldObject: node("surrealHeldObject").value,
        handCustom: node("surrealHandCustom").value,
        handNote: node("surrealHandNote").value,
        sceneMode: node("surrealSceneMode").value,
        sceneDescription: node("surrealSceneDescription").value,
        foregroundMode: node("surrealForegroundMode").value,
        foregroundDescription: node("surrealForegroundDescription").value,
        recolor: node("surrealRecolor").value
      });
  }
  sync();
});

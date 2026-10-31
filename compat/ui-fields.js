// Run after the mode controllers have created their dynamic fields.
// A block title avoids native UXP label baseline/padding differences.
(function () {
  var labels = Array.from(document.querySelectorAll("main label"));
  labels.forEach(function (label) {
    if (label.querySelector("input, select, textarea")) return; // Keep inline checkbox labels.
    var id = label.getAttribute("for") || label.htmlFor;
    var control = id ? document.getElementById(id) : label.nextElementSibling;
    if (!control || control.parentNode !== label.parentNode || control !== label.nextElementSibling) return;
    var tag = String(control.tagName).toLowerCase();
    var ratio = control.classList.contains("ratioPicker");
    if (!ratio && !["input", "select", "textarea"].includes(tag)) return;
    if (tag === "input" && ["checkbox", "radio", "hidden"].includes(control.type)) return;
    var field = document.createElement("div");
    field.className = "qayemField";
    var title = document.createElement("div");
    title.className = "qayemFieldLabel" + (label.className ? " " + label.className : "");
    title.id = label.id || control.id + "FieldLabel";
    title.textContent = label.textContent;
    var direction = label.getAttribute("dir");
    if (direction) title.setAttribute("dir", direction);
    var labelledBy = control.getAttribute("aria-labelledby") || "";
    if (!labelledBy.split(/\s+/).includes(title.id)) {
      control.setAttribute("aria-labelledby", (labelledBy + " " + title.id).trim());
    }
    if (!ratio) title.addEventListener("click", function () {
      return control.focus();
    });
    var parent = label.parentNode;
    parent.insertBefore(field, label);
    parent.removeChild(label);
    field.appendChild(title);
    // A preset and its adjacent manual text entry belong to the same field.
    var current = control;
    while (current) {
      var next = current.nextElementSibling;
      current.classList.add("qayemFieldControl");
      field.appendChild(current);
      if (!next || !["input", "select", "textarea"].includes(String(next.tagName).toLowerCase()) || ["checkbox", "radio", "hidden"].includes(next.type)) break;
      current = next;
    }
  });
})();

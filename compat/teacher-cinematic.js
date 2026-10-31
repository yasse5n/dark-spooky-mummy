function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* global TEACHER_CINEMATIC_FIELDS */
function createTeacherCinematicControls(onChange) {
  var controls = {},
    extras = {},
    conditional = [];
  function add(tag, parent, text) {
    var e = document.createElement(tag);
    if (text) e.textContent = text;
    parent.appendChild(e);
    return e;
  }
  function input(parent, key, label, type, value, placeholder) {
    var id = "teacherCinematic_" + key;
    var l = add("label", parent, label);
    l.setAttribute("for", id);
    var e = add(type === "textarea" ? "textarea" : "input", parent);
    e.id = id;
    if (type !== "textarea") e.type = type || "text";
    e.value = value || "";
    e.setAttribute("dir", "auto");
    if (placeholder) e.placeholder = placeholder;
    if (type === "textarea") e.className = "roomIdea";
    if (type === "number") {
      e.min = "1";
      e.step = "1";
    }
    return e;
  }
  TEACHER_CINEMATIC_FIELDS.forEach(function (field) {
    var group = document.getElementById("teacherCinematicGroup_" + field.group);
    if (field.key === "ratio") return;
    if (field.showWhen) {
      group = add("div", group);
      group.id = "teacherCinematic_" + field.key + "Fields";
      conditional.push({
        node: group,
        rule: field.showWhen
      });
      setUiHidden(group, true);
    }
    if (field.options) {
      var l = add("label", group, field.label);
      l.setAttribute("for", "teacherCinematic_" + field.key);
      var e = add("select", group);
      e.id = "teacherCinematic_" + field.key;
      field.options.forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          value = _ref2[0],
          label = _ref2[1];
        var option = add("option", e, label);
        option.value = value;
      });
      e.value = field.value;
      controls[field.key] = e;
      if (field.options.some(function (x) {
        return x[0] === "custom";
      })) {
        var extra = add("div", group);
        setUiHidden(extra, true);
        extras[field.key] = extra;
        controls[field.key + "Custom"] = input(extra, field.key + "Custom", "الوصف المخصص", "textarea", "");
        controls[field.key + "Custom"].addEventListener("input", onChange);
      }
      e.addEventListener("change", function () {
        if (extras[field.key]) setUiHidden(extras[field.key], e.value !== "custom");
        syncConditional();
        onChange();
      });
    } else {
      controls[field.key] = input(group, field.key, field.label, field.type, field.value, field.placeholder);
      controls[field.key].addEventListener("input", onChange);
    }
  });
  function syncConditional() {
    conditional.forEach(function (_ref3) {
      var node = _ref3.node,
        rule = _ref3.rule;
      return setUiHidden(node, controls[rule.key].value !== rule.value);
    });
  }
  syncConditional();
  return {
    values: function values() {
      var settings = {};
      Object.keys(controls).forEach(function (key) {
        return settings[key] = controls[key].value;
      });
      return settings;
    },
    sync: function sync(active, count, imageClothes) {
      setUiHidden(document.getElementById("teacherCinematicFields"), !active);
      syncConditional();
      document.getElementById("teacherCinematicWardrobeHint").textContent = imageClothes ? "صورة الملابس المحددة هي الأساس؛ الحقول هنا لتفاصيل غير موجودة فيها فقط." : "الملابس من الاختيارات دي والفكرة؛ سيب الوصف فاضي لو عاوز استنتاجه من الفكرة.";
    }
  };
}

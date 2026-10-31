function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* global CAMERA_PERSPECTIVES, BODY_ANGLES, FACE_GAZES, EXPRESSIONS, HAND_POSES, BACKGROUNDS */
function createTeacherNormalControls(onChange) {
  var root = document.getElementById('teacherNormalFields'),
    controls = {};
  function add(tag, parent, text) {
    var e = document.createElement(tag);
    if (text) e.textContent = text;
    parent.appendChild(e);
    return e;
  }
  function select(parent, key, title, choices, placeholder, defaultFirst) {
    var id = 'teacherNormal_' + key,
      l = add('label', parent, title);
    l.setAttribute('for', id);
    var e = add('select', parent);
    e.id = id;
    controls[key] = e;
    if (placeholder) {
      var o = add('option', e, placeholder);
      o.value = '';
    }
    choices.forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        label = _ref2[0],
        value = _ref2[1];
      var o = add('option', e, label);
      o.value = value;
    });
    if (defaultFirst) {
      e.value = choices[0][1];
      e.options[placeholder ? 1 : 0].selected = true;
    }
    e.addEventListener('change', onChange);
    return e;
  }
  function text(parent, key, title, placeholder, multiline) {
    var id = 'teacherNormal_' + key;
    if (title) {
      var l = add('label', parent, title);
      l.setAttribute('for', id);
    }
    var e = add(multiline ? 'textarea' : 'input', parent);
    e.id = id;
    controls[key] = e;
    e.setAttribute('dir', 'auto');
    if (!multiline) e.type = 'text';else e.className = 'roomIdea';
    e.placeholder = placeholder;
    e.setAttribute('aria-label', title || placeholder);
    e.addEventListener('input', onChange);
    return e;
  }
  function section(step) {
    var s = add('section', root);
    s.setAttribute('data-teacher-step', String(step));
    if (step % 2 === 0) s.classList.add('teacherNormalEven');
    return s;
  }
  function preset(step, key, title, choices, placeholder, defaultFirst) {
    var s = section(step);
    select(s, key + 'Preset', title, choices, placeholder, defaultFirst);
    text(s, key, '', 'اكتب وصفك هنا — اختياري', false);
    return s;
  }
  preset(4, 'perspective', '٤ · منظور التصميم (الكاميرا)', QAYEM_TEACHER_CAMERA_PRESETS, null, true);
  var s = section(5);
  select(s, 'cameraDistance', '٥ · بُعد المدرّس عن الكاميرا', [['البعد الطبيعي — الافتراضي', 'normal'], ['قريب', 'close'], ['قريب جدًا', 'veryClose'], ['أبعد قليلًا', 'farther']], null, true);
  add('p', s, 'الطبيعي حتى الخصر؛ قريب للوجه والصدر؛ قريب جدًا: العدسة تقترب من الوجه والكتفان قد يُقصّان؛ أبعد قليلًا لمساحة خلفية أكبر. بدون ظهور البنطلون.').className = 'hint';
  preset(7, 'angle', '٧ · زاوية الجسم', BODY_ANGLES, 'اختار زاوية الجسم أو اكتبها تحت', false);
  s = preset(8, 'gaze', '٨ · اتجاه الوجه والنظرة', FACE_GAZES, 'اختار اتجاه الوجه والنظرة أو اكتبه تحت', false);
  add('p', s, 'يمين وشمال في النظرة يقصد بيهم يمين الشخص وشماله، مش الكادر.').className = 'hint';
  preset(9, 'expression', '٩ · تعبير الوجه', EXPRESSIONS, 'اختار تعبير الوجه', true);
  preset(10, 'hand', '١٠ · حركة اليد', HAND_POSES, 'اختار حركة اليد أو اكتبها تحت', false);
  s = section(11);
  var background = select(s, 'backgroundType', '١١ · نوع الخلفية', [['لون سادة / جردينت', 'studio'], ['غرفة بديكور حديث', 'room'], ['سماء سينمائية · مبانٍ وغروب', 'sky'], ['اكتب فكرتك للخلفية', 'custom']], null, true);
  var studio = add('div', s);
  studio.id = 'teacherNormalStudioFields';
  select(studio, 'backgroundPreset', 'الخلفية وألوانها', BACKGROUNDS, 'اختار الخلفية وألوانها', true);
  text(studio, 'background', '', 'اكتب لون أو وصف الجردينت — اختياري', false);
  var room = add('div', s);
  room.id = 'teacherNormalRoomFields';
  text(room, 'roomColor', 'لون الغرفة', 'مثال: كحلي، بيج دافئ، أخضر زيتوني', false);
  text(room, 'roomIdea', 'فكرة الغرفة / مجال الشخص — اختياري', 'مثال: كيمياء — براويز جزيئات ورف عليه أدوات معمل', true);
  var sky = add('div', s);
  sky.id = 'teacherNormalSkyFields';
  select(sky, 'skyTone', 'لون السماء', [['تلقائي · متباين مع الملابس', 'auto'], ['كحلي راقٍ', 'navy'], ['أزرق فاتح', 'lightBlue']], null, true);
  add('p', sky, 'السماء ثلثين والأرض ثلث؛ مبانٍ على الجانبين وضوء الشمس خلف الرقبة. تلاشي أسفل الملابس للخلفية دي فقط، والوجه واليدين واضحين.').className = 'hint';
  var custom = add('div', s);
  custom.id = 'teacherNormalCustomFields';
  text(custom, 'backgroundIdea', 'وصف فكرة الخلفية', 'اوصف المكان والألوان والعناصر والإضاءة اللي عاوزها في الخلفية', true);
  add('p', custom, 'الوصف يخص الخلفية؛ زاوية الشخص ونظرته وتعبيره وحركة يده من الاختيارات فوق.').className = 'hint';
  function syncBackground() {
    setUiHidden(studio, background.value !== 'studio');
    setUiHidden(room, background.value !== 'room');
    setUiHidden(sky, background.value !== 'sky');
    setUiHidden(custom, background.value !== 'custom');
  }
  background.addEventListener('change', syncBackground);
  syncBackground();
  var position = document.getElementById('teacherLegacyPositionSection');
  var positionAnchor = document.createElement('div');
  positionAnchor.id = 'teacherPositionHome';
  position.parentNode.insertBefore(positionAnchor, position);
  var angleSection = root.querySelector('[data-teacher-step="7"]');
  var subjectSection = document.getElementById('teacherSubjectSection');
  function syncLayout(active) {
    subjectSection.classList.toggle('teacherNormalEven', active);
    position.classList.toggle('teacherNormalEven', active);
    if (active) {
      if (position.parentNode !== root) root.insertBefore(position, angleSection);
      position.setAttribute('data-teacher-step', '6');
    } else {
      if (position.parentNode === root) positionAnchor.parentNode.insertBefore(position, positionAnchor);
      position.removeAttribute('data-teacher-step');
    }
    document.getElementById('teacherPositionLabel').textContent = active ? '٦ · مكان المدرّس في الصورة' : '٤ · مكان الشخص في الصورة';
    document.getElementById('teacherCastLabel').textContent = active ? 'شخصيات خلف المدرّس أو بجانبه — اختياري' : '٧ · شخصيات خلف المدرّس أو بجانبه';
    document.getElementById('teacherReferenceLabel').textContent = active ? 'مصادر الصور المرجعية' : '٨ · مصادر الصور المرجعية';
    document.getElementById('teacherClothingLabel').textContent = active ? 'مصدر ملابس المدرّس' : '٩ · مصدر ملابس المدرّس';
  }
  return {
    values: function values() {
      var values = {
        enabled: true
      };
      Object.keys(controls).forEach(function (key) {
        return values[key] = controls[key].value;
      });
      return values;
    },
    sync: function sync(active) {
      syncLayout(active);
      setUiHidden(root, !active);
    }
  };
}

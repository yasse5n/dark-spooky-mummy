function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
// Load after controllers, before decorative UI wrappers. This module never runs native Photoshop commands.
var QayemUiState = function () {
  var key = 'qayem.ui.draft.v1';
  var ready = false,
    last = '',
    draft = null,
    hostSession = '',
    resumeTop = null;
  var own = function own(o, k) {
    return o && Object.prototype.hasOwnProperty.call(o, k);
  };
  function notice(message) {
    var n = document.getElementById('uiDraftNotice');
    if (n) {
      n.textContent = message;
      setUiHidden(n, !message);
    }
  }
  try {
    var raw = window.localStorage.getItem(key);
    if (raw) {
      var data = JSON.parse(raw);
      if (data && data.version === 1 && _typeof(data.fields) === 'object') {
        draft = data;
        last = raw;
      }
    }
  } catch (e) {
    notice('تعذّر استرجاع الخانات المحفوظة على الجهاز.');
  }
  function controls() {
    return Array.from(document.querySelectorAll('input')).concat(Array.from(document.querySelectorAll('select')), Array.from(document.querySelectorAll('textarea')));
  }
  function eligible(e) {
    return e.id && e.getAttribute('data-ui-transient') !== 'true' && !/^q(Image|Credit|Overlay)/.test(e.id) && e.id.indexOf('qayem') !== 0 && e.id.indexOf('qCommunity') !== 0 && e.id !== 'uiLanguage' && !/^textTemplate/.test(e.id) && !['password', 'file', 'hidden', 'button', 'submit'].includes(e.type || e.getAttribute('type'));
  }
  function inOrder() {
    // Dependency controls must restore before the controls they rebuild (subject, count, category, search).
    var ordered = [];
    function walk(e) {
      if (!e) return;
      Array.from(e.children || []).forEach(function (child) {
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(String(child.tagName).toUpperCase())) ordered.push(child);
        walk(child);
      });
    }
    walk(document.querySelector('main'));
    return ordered.filter(eligible);
  }
  function readField(e) {
    var type = e.type || e.getAttribute('type');
    return {
      value: String(e.value || ''),
      checked: type === 'checkbox' || type === 'radio' ? !!e.checked : undefined
    };
  }
  function emit(e, type) {
    e.dispatchEvent(new Event(type, {
      bubbles: true
    }));
  }
  function restore(e, saved) {
    if (!saved || typeof saved.value !== 'string' || saved.value.length > 100000) return;
    if (e.tagName === 'SELECT') {
      if (e.id === 'teacherNormal_perspectivePreset' && saved.value.indexOf('FISHEYE SHOT:') === 0) {
        var enabled = document.getElementById('teacherFisheyeEnabled'),
          scope = document.getElementById('teacherFisheyeScope');
        if (enabled) {
          enabled.checked = true;
          emit(enabled, 'change');
        }
        if (scope) {
          scope.value = 'background';
          emit(scope, 'change');
        }
        var eye = Array.from(e.options || []).find(function (o) {
          return o.value.indexOf('EYE-LEVEL') === 0;
        });
        if (eye) saved = {
          value: eye.value
        };
      }
      if (!Array.from(e.options || []).some(function (o) {
        return o.value === saved.value;
      })) return;
      Array.from(e.options).forEach(function (o) {
        var match = o.value === saved.value;
        o.selected = match;
        match ? o.setAttribute('selected', '') : o.removeAttribute('selected');
      });
      e.value = saved.value;
      e.setAttribute('value', saved.value);
      emit(e, 'change');
    } else {
      e.value = saved.value;
      if (typeof saved.checked === 'boolean') e.checked = saved.checked;
      emit(e, 'input');
      emit(e, 'change');
    }
  }
  var ratios = Array.from(document.querySelectorAll('.ratioPicker')).filter(function (e) {
    return e.id;
  });
  if (draft) {
    inOrder().forEach(function (e) {
      if (own(draft.fields, e.id)) restore(e, draft.fields[e.id]);
    });
    if (draft.ratios) ratios.forEach(function (group) {
      var value = draft.ratios[group.id],
        choice = Array.from(group.querySelectorAll('.ratioChoice')).find(function (c) {
          return c.getAttribute('data-ratio') === value;
        });
      if (choice) emit(choice, 'click');
    });
    // Replaying a dependency or ratio invalidates generated previews. Restore them last without triggering generation/copy.
    inOrder().filter(function (e) {
      return /preview$/i.test(e.id);
    }).forEach(function (e) {
      var s = own(draft.fields, e.id) && draft.fields[e.id];
      if (s && typeof s.value === 'string' && s.value.length <= 100000) e.value = s.value;
    });
    if (typeof QayemTextTemplates !== 'undefined' && QayemTextTemplates) QayemTextTemplates.restoreState(draft.textTemplates);
    if (typeof QayemTeacherModes !== 'undefined' && QayemTeacherModes) QayemTeacherModes.adoptRestored(draft.teacherModes);
    // Navigation is restored only after confirming the current Photoshop session below.
  }
  function capture() {
    if (!ready) return;
    if (typeof QayemTeacherModes !== 'undefined' && QayemTeacherModes && QayemTeacherModes.isSwitching()) return;
    try {
      var fields = {},
        values = {};
      controls().filter(eligible).forEach(function (e) {
        return fields[e.id] = readField(e);
      });
      ratios.forEach(function (group) {
        var selected = Array.from(group.querySelectorAll('.ratioChoice')).find(function (c) {
          return c.getAttribute('aria-checked') === 'true';
        });
        if (selected) values[group.id] = selected.getAttribute('data-ratio');
      });
      var main = document.querySelector('main');
      var _data = {
        version: 1,
        hostSession: hostSession,
        scrollTop: resumeTop !== null ? resumeTop : main ? main.scrollTop : 0,
        fields: fields,
        ratios: values,
        screen: typeof QayemNavigation !== 'undefined' && QayemNavigation ? QayemNavigation.current() : 'modeHome',
        textTemplates: typeof QayemTextTemplates !== 'undefined' && QayemTextTemplates ? QayemTextTemplates.getState() : null
      };
      if (typeof QayemTeacherModes !== 'undefined' && QayemTeacherModes) _data.teacherModes = QayemTeacherModes.getState();
      var _raw = JSON.stringify(_data);
      if (_raw === last) return;
      window.localStorage.setItem(key, _raw);
      last = _raw;
      notice('');
    } catch (e) {
      notice('تعذّر حفظ الخانات على الجهاز؛ البيانات الحالية موجودة لحد قفل اللوحة.');
    }
  }
  // Direct handlers cover older UXP controls whose events do not bubble.
  controls().filter(function (e) {
    return eligible(e) || /^textTemplate/.test(e.id);
  }).forEach(function (e) {
    return ['input', 'change'].forEach(function (type) {
      return e.addEventListener(type, capture);
    });
  });
  Array.from(document.querySelectorAll('.ratioChoice')).concat(Array.from(document.querySelectorAll('.textTemplateCard'))).forEach(function (e) {
    return ['click', 'keydown'].forEach(function (type) {
      return e.addEventListener(type, capture);
    });
  });
  ['input', 'change', 'click', 'keyup'].forEach(function (type) {
    return document.addEventListener(type, capture);
  });
  if (window.addEventListener) ['pagehide', 'beforeunload', 'blur'].forEach(function (type) {
    return window.addEventListener(type, capture);
  });
  document.addEventListener('visibilitychange', capture);
  var mainScroll = document.querySelector('main');
  if (mainScroll) mainScroll.addEventListener('scroll', capture);
  function restoreScroll() {
    var m = document.querySelector('main');
    if (resumeTop !== null && m && m.clientHeight > 0) {
      m.scrollTop = resumeTop;
      resumeTop = null;
      capture();
    }
  }
  document.addEventListener('qayem:unlocked', function () {
    setTimeout(restoreScroll, 50);
    setTimeout(restoreScroll, 300);
  });
  // Also preserve text populated asynchronously by a copy controller.
  if (typeof setInterval === 'function') setInterval(capture, 1200);
  function finishSession(id) {
    hostSession = id || '';
    var same = !!(draft && hostSession && draft.hostSession === hostSession);
    if (typeof QayemNavigation !== 'undefined' && QayemNavigation) QayemNavigation.show(same ? draft.screen : 'modeHome');
    if (same && Number.isFinite(draft.scrollTop)) resumeTop = Math.max(0, draft.scrollTop);
    ready = true;
    capture();
    setTimeout(restoreScroll, 50);
    setTimeout(restoreScroll, 350);
  }
  if (typeof QayemLifecycle !== 'undefined') QayemLifecycle.ready(finishSession);else finishSession('');
  if (typeof QayemNavigation !== 'undefined' && QayemNavigation && QayemNavigation.current() === 'textTemplatesView' && typeof QayemTextTemplates !== 'undefined' && QayemTextTemplates) QayemTextTemplates.refresh(true);
  function snapshot(screen) {
    var scope = document.getElementById(screen),
      prefix = {
        teacherView: 'teacher',
        doctorView: 'doctor',
        cosmeticsView: 'cosmetics'
      }[screen];
    if (!scope || !prefix) throw new Error('افتح تصميم مدرس أو طبيب أو كوزماتيكس لحفظ إعداداته.');
    var fields = {},
      values = {};
    Array.from(scope.querySelectorAll('input,select,textarea')).filter(function (e) {
      return eligible(e) && e.id.indexOf(prefix) === 0 && !/preview$/i.test(e.id) && !e.readOnly && !/_camera(?:Height|Tilt)$/.test(e.id);
    }).forEach(function (e) {
      return fields[e.id] = readField(e);
    });
    Array.from(scope.querySelectorAll('.ratioPicker')).forEach(function (group) {
      var selected = group.querySelector('.ratioChoice[aria-checked="true"]');
      if (group.id && selected) values[group.id] = selected.getAttribute('data-ratio');
    });
    return {
      version: 1,
      screen: screen,
      fields: fields,
      ratios: values
    };
  }
  function apply(saved) {
    if (!saved || saved.version !== 1 || !['teacherView', 'doctorView', 'cosmeticsView'].includes(saved.screen) || !saved.fields) throw new Error('الإعداد المحفوظ غير صالح');
    var scope = document.getElementById(saved.screen),
      prefix = {
        teacherView: 'teacher',
        doctorView: 'doctor',
        cosmeticsView: 'cosmetics'
      }[saved.screen];

    var ordered = Array.from(scope.querySelectorAll('input,select,textarea')).filter(function (e) {
      return eligible(e) && e.id.indexOf(prefix) === 0 && !/preview$/i.test(e.id) && !e.readOnly;
    });
    // Subject and design mode rebuild dependent controls; restore those first.
    var priority = [prefix + 'DesignType', prefix + 'Subject', prefix + 'CharacterCount'];
    priority.forEach(function (id) {
      var e = document.getElementById(id);
      if (e && own(saved.fields, id)) restore(e, saved.fields[id]);
    });
    ordered.forEach(function (e) {
      if (!priority.includes(e.id) && own(saved.fields, e.id)) restore(e, saved.fields[e.id]);
    });
    Object.keys(saved.ratios || {}).forEach(function (id) {
      var group = document.getElementById(id);
      if (!group || !scope.contains(group)) return;
      var choice = Array.from(group.querySelectorAll('.ratioChoice')).find(function (c) {
        return c.getAttribute('data-ratio') === saved.ratios[id];
      });
      if (choice) emit(choice, 'click');
    });
    Array.from(scope.querySelectorAll('textarea')).filter(function (e) {
      return /preview$/i.test(e.id);
    }).forEach(function (e) {
      e.value = '';
    });
    if (typeof QayemNavigation !== 'undefined') QayemNavigation.show(saved.screen);
    if (typeof QayemStudioUI !== 'undefined') QayemStudioUI.refresh();
    capture();
  }
  return {
    capture: capture,
    snapshot: snapshot,
    apply: apply
  };
}();

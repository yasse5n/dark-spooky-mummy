runUiInitializer('cosmeticsView', function () {
  var node = function node(id) {
      return document.getElementById(id);
    },
    girlTypes = ['girl', 'both'],
    productTypes = ['product', 'both'];
  var schema = [{
    key: 'identity',
    label: 'مصدر ملامح الفتاة',
    group: 'girl',
    value: 'reference',
    hint: 'أرفق صورة الفتاة مع البروبت في أداة الصور، أو اختار موديل افتراضية بدون مرجع هوية.'
  }, {
    key: 'framing',
    label: 'الكادر وبعد الفتاة عن الكاميرا',
    group: 'girl',
    value: 'close',
    hint: 'اختيار الكادر يتقدم على أي وصف مخالف في الفكرة. اليدان والمنتج يتكيفان مع حد القص.'
  }, {
    key: 'position',
    label: 'مكان الفتاة في الصورة',
    group: 'girl',
    value: 'center'
  }, {
    key: 'perspective',
    label: 'منظور الكاميرا',
    group: 'girl',
    value: 'eye'
  }, {
    key: 'body',
    label: 'زاوية الجسم ووضعيتها',
    group: 'girl',
    value: 'front'
  }, {
    key: 'gaze',
    label: 'اتجاه الوجه والنظرة',
    group: 'girl',
    value: 'camera'
  }, {
    key: 'expression',
    label: 'تعبير الوجه',
    group: 'girl',
    value: 'original'
  }, {
    key: 'hand',
    label: 'وضعية الفتاة وحركة اليد — ٣٠ اختيار',
    group: 'girl',
    value: 'cheekTips',
    options: COSMETICS_HAND_POSES
  }, {
    key: 'handCustom',
    label: 'وصف حركة مخصص — اختياري',
    group: 'girl',
    type: 'textarea',
    value: '',
    placeholder: 'لو كتبت هنا، الوصف يتقدم على حركة اليد الجاهزة.'
  }, {
    key: 'wardrobe',
    label: 'وصف الملابس والحجاب — اختياري',
    group: 'girl',
    type: 'textarea',
    value: '',
    placeholder: 'مثال: حجاب كحلي وملابس تركواز. لو فاضية، الملابس من الفكرة أو المرجع.'
  }, {
    key: 'productSource',
    label: 'مصدر المنتج',
    group: 'product',
    value: 'reference'
  }, {
    key: 'productDescription',
    label: 'وصف المنتج أو ملاحظاته',
    group: 'product',
    type: 'textarea',
    value: '',
    placeholder: 'مطلوب لو المنتج بدون صورة. مع مرجع، الملاحظات لا تغيّر شكل العبوة أو ألوانها.'
  }, {
    key: 'productPosition',
    label: 'مكان المنتج في الصورة',
    group: 'product',
    value: 'idea'
  }, {
    key: 'productScale',
    label: 'حجم المنتج وطريقة عرضه',
    group: 'product',
    value: 'normal'
  }, {
    key: 'palette',
    label: 'ألوان التصميم',
    value: 'auto'
  }, {
    key: 'paletteCustom',
    label: 'الألوان المخصصة أو أكوادها',
    type: 'text',
    value: '',
    placeholder: 'مثال: كحلي #102A43 وتركواز #2BBBAD',
    showWhen: {
      key: 'palette',
      value: 'custom'
    }
  }, {
    key: 'contrast',
    label: 'تباين الألوان',
    value: 'balanced',
    hint: 'التباين يخص فصل ألوان العناصر والخلفية؛ البشرة الطبيعية وألوان العبوة المرجعية تظل محفوظة.'
  }, {
    key: 'idea',
    label: 'اكتب فكرة التصميم',
    type: 'textarea',
    value: '',
    placeholder: 'اوصف الخلفية والأجواء والعناصر والتفاعل، وحدد لو عاوز مساحة للكتابة. مثال: فتاة وسط أقمشة كحلي وتركواز بإضاءة ناعمة وعمق سينمائي.'
  }];
  var root = node('cosmeticsFields');
  schema.forEach(function (field) {
    var section = document.createElement('section');
    section.id = 'cos_' + field.key + 'Section';
    section.className = 'cosmeticsSection';
    var label = document.createElement('label');
    label.id = 'cos_' + field.key + 'Label';
    label.setAttribute('for', 'cos_' + field.key);
    label.textContent = field.label;
    var control = document.createElement(field.type === 'textarea' ? 'textarea' : field.type === 'text' ? 'input' : 'select');
    control.id = 'cos_' + field.key;
    if (field.type) {
      if (field.type === 'text') control.type = 'text';else {
        control.rows = field.key === 'idea' ? 7 : 3;
        control.className = field.key === 'idea' ? 'teacherIdea' : 'roomIdea';
      }
      control.setAttribute('dir', 'auto');
      control.placeholder = field.placeholder || '';
    } else (field.options || COSMETICS_CHOICES[field.key]).forEach(function (option) {
      var o = document.createElement('option');
      o.value = option[0];
      o.textContent = option[1];
      control.appendChild(o);
    });
    control.value = field.value;
    section.appendChild(label);
    section.appendChild(control);
    if (field.hint) {
      var hint = document.createElement('p');
      hint.className = 'hint';
      hint.textContent = field.hint;
      section.appendChild(hint);
    }
    root.appendChild(section);
  });
  var ratio = '3:4';
  var tiles = Array.from(node('cosmeticsRatios').querySelectorAll('.ratioChoice'));
  function selectRatio(value) {
    ratio = value;
    tiles.forEach(function (tile) {
      var active = tile.getAttribute('data-ratio') === ratio;
      tile.classList.toggle('selected', active);
      tile.setAttribute('aria-checked', active ? 'true' : 'false');
      tile.setAttribute('tabindex', active ? '0' : '-1');
    });
    copy.invalidate();
  }
  tiles.forEach(function (tile, i) {
    tile.addEventListener('click', function () {
      return selectRatio(tile.getAttribute('data-ratio'));
    });
    tile.addEventListener('keydown', function (event) {
      var index = i;
      if (['ArrowRight', 'ArrowDown'].includes(event.key)) index = (i + 1) % tiles.length;else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) index = (i + tiles.length - 1) % tiles.length;else if (event.key === 'Home') index = 0;else if (event.key === 'End') index = tiles.length - 1;else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        selectRatio(tile.getAttribute('data-ratio'));
        return;
      } else return;
      event.preventDefault();
      selectRatio(tiles[index].getAttribute('data-ratio'));
      tiles[index].focus();
    });
  });
  function values() {
    var c = {
      type: node('cosmeticsType').value,
      ratio: ratio
    };
    schema.forEach(function (f) {
      return c[f.key] = node('cos_' + f.key).value;
    });
    return c;
  }
  var copy = createPromptCopyController({
    button: 'copyCosmeticsPrompt',
    preview: 'cosmeticsPreview',
    status: 'cosmeticsStatus',
    successText: 'تم نسخ بروبت الكوزماتيكس. أرفق الصور بالترتيب الموضح في خانة المراجع.',
    build: function build() {
      return buildCosmeticsPrompt(values());
    }
  });
  function sync() {
    var c = values(),
      valid = ['girl', 'product', 'both'].includes(c.type);
    setUiHidden(node('cosmeticsOptions'), !valid);
    schema.forEach(function (field) {
      var visible = (!field.group || (field.group === 'girl' ? girlTypes.includes(c.type) : productTypes.includes(c.type))) && (!field.showWhen || c[field.showWhen.key] === field.showWhen.value);
      setUiHidden(node('cos_' + field.key + 'Section'), !visible);
    });
    var step = 3;
    schema.forEach(function (field) {
      var section = node('cos_' + field.key + 'Section');
      if (section.style.display === 'none') return;
      node('cos_' + field.key + 'Label').textContent = step + ' · ' + field.label;
      section.classList.toggle('cosmeticsEven', step % 2 === 0);
      step++;
    });
    var refs = getCosmeticsReferences(c),
      list = node('cosmeticsReferenceOrder');
    while (list.firstChild) list.removeChild(list.firstChild);
    refs.forEach(function (ref, i) {
      var row = document.createElement('p');
      row.className = 'referenceRow';
      row.textContent = i + 1 + ' — ' + ref.label;
      list.appendChild(row);
    });
    node('cosmeticsReferenceHint').textContent = refs.length ? 'أرفق ' + refs.length + ' صورة مع البروبت في أداة التوليد، بنفس الترتيب. رفع الصور مش داخل البلاجين.' : 'الاختيارات الحالية لا تحتاج صور مرجعية؛ الموديل أو المنتج يُنشأ من الوصف.';
    node('cosmeticsTypeHint').textContent = c.type === 'product' ? 'إعدادات المنتج فقط؛ خيارات الفتاة لا تدخل في البروبت.' : c.type === 'both' ? 'حدد الفتاة والمنتج؛ المرجع الخاص بكل واحد مستقل عن الآخر.' : c.type === 'girl' ? 'حدد الكادر والوضعية والألوان، واكتب الفكرة.' : 'اختار النوع علشان تظهر إعداداته.';
    copy.invalidate();
  }
  schema.forEach(function (field) {
    return node('cos_' + field.key).addEventListener(field.type ? 'input' : 'change', sync);
  });
  node('cosmeticsType').addEventListener('change', sync);
  selectRatio(ratio);
  sync();
});

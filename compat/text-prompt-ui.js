runUiInitializer('typographyPromptsView', function () {
  var node = function node(id) {
      return document.getElementById(id);
    },
    list = QayemTextPromptCatalog;
  list.forEach(function (style) {
    var option = document.createElement('option');
    option.value = style.id;
    option.textContent = style.label;
    node('textPromptStyle').appendChild(option);
  });
  var copy = createPromptCopyController({
    button: 'textPromptCopy',
    preview: 'textPromptPreview',
    status: 'textPromptStatus',
    successText: 'تم نسخ البرومبت. الصقه في أداة الصور لتوليد الكتابة.',
    build: function build() {
      return QayemTextPromptBuilder.typography(list, node('textPromptStyle').value, node('textPromptText').value);
    }
  });
  function update() {
    var style = list.find(function (s) {
      return s.id === node('textPromptStyle').value;
    });
    node('textPromptStyleDescription').textContent = style ? style.description : '';
    node('textPromptText').placeholder = style && style.layout === 'tagline' ? 'اكتب الاسم هنا في السطر الأول\nواكتب الجملة التعريفية في السطر الثاني' : 'اكتب نصك هنا؛ استخدم سطرًا جديدًا لو عاوز توزيعًا محددًا';
    copy.invalidate();
  }
  node('textPromptStyle').addEventListener('change', update);
  node('textPromptText').addEventListener('input', function () {
    return copy.invalidate();
  });
  update();
});
runUiInitializer('textEffectsView', function () {
  var node = function node(id) {
    return document.getElementById(id);
  };
  QayemTextPromptBuilder.effects.forEach(function (effect) {
    var option = document.createElement('option');
    option.value = effect.id;
    option.textContent = effect.label;
    node('textEffectKind').appendChild(option);
  });
  node('textEffectKind').value = 'fire';
  var copy = createPromptCopyController({
    button: 'textEffectCopy',
    preview: 'textEffectPreview',
    status: 'textEffectStatus',
    successText: 'تم نسخ البرومبت. أرفقه مع صورة التصميم المصدّرة في أداة تعديل الصور.',
    build: function build() {
      return QayemTextPromptBuilder.edit({
        effect: node('textEffectKind').value,
        interaction: node('textEffectInteraction').value,
        scope: node('textEffectScope').value,
        intensity: node('textEffectIntensity').value,
        target: node('textEffectTarget').value
      });
    }
  });
  ['textEffectKind', 'textEffectInteraction', 'textEffectScope', 'textEffectIntensity', 'textEffectTarget'].forEach(function (id) {
    return node(id).addEventListener(id === 'textEffectTarget' ? 'input' : 'change', function () {
      return copy.invalidate();
    });
  });
});

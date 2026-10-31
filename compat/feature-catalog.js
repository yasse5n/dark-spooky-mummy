function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
(function (root, factory) {
  if (typeof window === 'undefined' && (typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module.exports) module.exports = factory();else root.QayemFeatureCatalog = factory();
})(this, function () {
  'use strict';

  return {
    version: 1,
    features: {
      'teacher.normal': 'المدرس — تصميم عادي',
      'teacher.surreal': 'المدرس — تصميم سريالي',
      'teacher.cinematic': 'المدرس — تصميم سينمائي',
      'teacher.characters': 'المدرس — شخصيات إضافية',
      'doctor.normal': 'الأطباء — تصميم عادي',
      'doctor.surreal': 'الأطباء — تصميم سريالي',
      'doctor.cinematic': 'الأطباء — تصميم سينمائي',
      'doctor.characters': 'الأطباء — شخصيات إضافية',
      cosmetics: 'تصاميم كوزماتيكس للفتيات والمنتجات',
      grid: 'شبكات وتكوين التصميم — Grid',
      overlays: 'مكتبة Overlays',
      trends: 'الترندات والإلهام — يشمل Pinterest',
      pricing: 'سعّر شغلك — حاسبة تكلفة التصميم',
      'image.prompt': 'أدوات بالكريدتس — صورة إلى برومبت (رصيد مستقل)',
      'text.effects': 'تأثيرات وتفاعل الكتابة',
      'legacy.person': 'تصميم شخص — القسم القديم',
      'legacy.multi': 'أشخاص متعددة — القسم القديم',
      'legacy.surreal': 'صور مصغرة — القسم القديم'
    },
    entries: {
      openTeacher: {
        screen: 'teacherMenuView',
        action: 'teacher.entry'
      },
      openTeacherSocial: {
        screen: 'teacherView',
        action: 'teacher.entry'
      },
      openDoctor: {
        screen: 'doctorView',
        action: 'doctor.entry'
      },
      openCosmetics: {
        screen: 'cosmeticsView',
        action: 'cosmetics'
      },
      openRetouch: {
        screen: 'retouchView',
        action: 'retouch.entry'
      },
      openTextTemplates: {
        screen: 'textMenuView',
        action: 'text.entry'
      },
      openTextShapes: {
        screen: 'textTemplatesView',
        action: 'text.templates.entry'
      },
      openTypographyPrompts: {
        screen: 'typographyPromptsView',
        action: 'text.typography.entry'
      },
      openTextEffects: {
        screen: 'textEffectsView',
        action: 'text.effects'
      },
      openTrends: {
        screen: 'trendsView',
        action: 'trends'
      },
      openGrid: {
        screen: 'gridView',
        action: 'grid'
      },
      openOverlays: {
        screen: 'overlaysView',
        action: 'overlays'
      },
      openPricing: {
        screen: 'pricingView',
        action: 'pricing'
      },
      openCredits: {
        screen: 'creditsView',
        action: 'image.prompt'
      },
      openImagePrompt: {
        screen: 'imagePromptView',
        action: 'image.prompt'
      }
    }
  };
});

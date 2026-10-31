// Reference instructions only: the plugin does not upload or analyze images.
const TEACHER_CHARACTERS = {
  "arabic": [
    [
      "taha",
      "طه حسين",
      "Taha Hussein"
    ],
    [
      "naguib",
      "نجيب محفوظ",
      "Naguib Mahfouz"
    ],
    [
      "shawqi",
      "أحمد شوقي",
      "Ahmed Shawqi"
    ],
    [
      "mutanabbi",
      "المتنبي",
      "Al-Mutanabbi"
    ]
  ],
  "english": [
    [
      "shakespeare",
      "شكسبير",
      "William Shakespeare"
    ],
    [
      "dickens",
      "تشارلز ديكنز",
      "Charles Dickens"
    ],
    [
      "austen",
      "جين أوستن",
      "Jane Austen"
    ],
    [
      "woolf",
      "فيرجينيا وولف",
      "Virginia Woolf"
    ]
  ],
  "math": [
    [
      "khwarizmi",
      "الخوارزمي",
      "Al-Khwarizmi"
    ],
    [
      "euclid",
      "إقليدس",
      "Euclid"
    ],
    [
      "pythagoras",
      "فيثاغورس",
      "Pythagoras"
    ],
    [
      "ramanujan",
      "رامانوجان",
      "Srinivasa Ramanujan"
    ]
  ],
  "physics": [
    [
      "newton",
      "نيوتن",
      "Isaac Newton"
    ],
    [
      "einstein",
      "أينشتاين",
      "Albert Einstein"
    ],
    [
      "tesla",
      "تسلا",
      "Nikola Tesla"
    ],
    [
      "faraday",
      "فاراداي",
      "Michael Faraday"
    ]
  ],
  "chemistry": [
    [
      "mendeleev",
      "مندليف",
      "Dmitri Mendeleev"
    ],
    [
      "lavoisier",
      "لافوازييه",
      "Antoine Lavoisier"
    ],
    [
      "curie",
      "ماري كوري",
      "Marie Curie"
    ],
    [
      "jabir",
      "جابر بن حيان",
      "Jabir ibn Hayyan"
    ]
  ],
  "biology": [
    [
      "darwin",
      "داروين",
      "Charles Darwin"
    ],
    [
      "mendel",
      "مندل",
      "Gregor Mendel"
    ],
    [
      "pasteur",
      "لويس باستور",
      "Louis Pasteur"
    ],
    [
      "fictional_biologist",
      "باحث أحياء افتراضي",
      "An original fictional biology researcher, with a distinct face"
    ]
  ],
  "geography": [
    [
      "idrisi",
      "الإدريسي",
      "Al-Idrisi"
    ],
    [
      "battuta",
      "ابن بطوطة",
      "Ibn Battuta"
    ],
    [
      "humboldt",
      "ألكسندر فون هومبولت",
      "Alexander von Humboldt"
    ],
    [
      "fictional_geographer",
      "جغرافي افتراضي",
      "An original fictional geographer, with a distinct face"
    ]
  ],
  "history": [
    [
      "muhammad_ali",
      "محمد علي باشا",
      "Muhammad Ali Pasha of Egypt"
    ],
    [
      "ismail",
      "الخديوي إسماعيل",
      "Khedive Ismail of Egypt"
    ],
    [
      "napoleon",
      "نابليون بونابرت",
      "Napoleon Bonaparte"
    ],
    [
      "saad",
      "سعد زغلول",
      "Saad Zaghloul"
    ],
    [
      "pharaoh",
      "شخصية فرعونية افتراضية",
      "An original fictional ancient Egyptian pharaonic character, not a specific historical likeness"
    ]
  ],
  "geology": [
    [
      "hutton",
      "جيمس هاتون",
      "James Hutton"
    ],
    [
      "lyell",
      "تشارلز لايل",
      "Charles Lyell"
    ],
    [
      "wegener",
      "ألفريد فيجنر",
      "Alfred Wegener"
    ],
    [
      "fictional_geologist",
      "جيولوجي افتراضي",
      "An original fictional geologist, with a distinct face"
    ]
  ],
  "programming": [
    [
      "turing",
      "آلان تورينج",
      "Alan Turing"
    ],
    [
      "ada",
      "آدا لوفلايس",
      "Ada Lovelace"
    ],
    [
      "hopper",
      "جريس هوبر",
      "Grace Hopper"
    ],
    [
      "fictional_programmer",
      "مبرمج افتراضي",
      "An original fictional programmer, with a distinct face"
    ]
  ],
  "social": [
    [
      "muhammad_ali",
      "محمد علي باشا",
      "Muhammad Ali Pasha of Egypt"
    ],
    [
      "ismail",
      "الخديوي إسماعيل",
      "Khedive Ismail of Egypt"
    ],
    [
      "napoleon",
      "نابليون بونابرت",
      "Napoleon Bonaparte"
    ],
    [
      "saad",
      "سعد زغلول",
      "Saad Zaghloul"
    ],
    [
      "pharaoh",
      "شخصية فرعونية افتراضية",
      "An original fictional ancient Egyptian pharaonic character, not a specific historical likeness"
    ],
    [
      "idrisi",
      "الإدريسي",
      "Al-Idrisi"
    ],
    [
      "battuta",
      "ابن بطوطة",
      "Ibn Battuta"
    ],
    [
      "humboldt",
      "ألكسندر فون هومبولت",
      "Alexander von Humboldt"
    ],
    [
      "fictional_geographer",
      "جغرافي افتراضي",
      "An original fictional geographer, with a distinct face"
    ]
  ],
  "science": [
    [
      "newton",
      "نيوتن",
      "Isaac Newton"
    ],
    [
      "einstein",
      "أينشتاين",
      "Albert Einstein"
    ],
    [
      "tesla",
      "تسلا",
      "Nikola Tesla"
    ],
    [
      "faraday",
      "فاراداي",
      "Michael Faraday"
    ],
    [
      "mendeleev",
      "مندليف",
      "Dmitri Mendeleev"
    ],
    [
      "lavoisier",
      "لافوازييه",
      "Antoine Lavoisier"
    ],
    [
      "curie",
      "ماري كوري",
      "Marie Curie"
    ],
    [
      "jabir",
      "جابر بن حيان",
      "Jabir ibn Hayyan"
    ],
    [
      "darwin",
      "داروين",
      "Charles Darwin"
    ],
    [
      "mendel",
      "مندل",
      "Gregor Mendel"
    ],
    [
      "pasteur",
      "لويس باستور",
      "Louis Pasteur"
    ],
    [
      "fictional_biologist",
      "باحث أحياء افتراضي",
      "An original fictional biology researcher, with a distinct face"
    ]
  ]
};
const TEACHER_CHARACTER_LOCATIONS = [
 ["behindLeft", "خلف كتفه مباشرةً — يسار الصورة", "Immediately behind the teacher's LEFT shoulder as seen by the VIEWER, within a close group with a small breathing gap between heads"],
 ["behindRight", "خلف كتفه مباشرةً — يمين الصورة", "Immediately behind the teacher's RIGHT shoulder as seen by the VIEWER, within a close group with a small breathing gap between heads"],
 ["besideLeft", "بجانبه قريب — يسار الصورة", "Closely beside the teacher on the VIEWER'S LEFT, at shoulder distance within a close group with a small breathing gap between heads"],
 ["besideRight", "بجانبه قريب — يمين الصورة", "Closely beside the teacher on the VIEWER'S RIGHT, at shoulder distance within a close group with a small breathing gap between heads"]
];
function resolveTeacherCharacters({subject, characterCount = 0, characters = []}) {
 const count = Number(characterCount);
 if (![0,1,2,3].includes(count)) throw new Error("اختار بدون شخصيات أو ١ أو ٢ أو ٣ شخصيات إضافية.");
 if (!count) return [];
 if (!Array.isArray(characters) || characters.length !== count) throw new Error("كمّل اختيار كل الشخصيات بالعدد المحدد.");
 const choices = TEACHER_CHARACTERS[subject] || [];
 const selected = characters.map((c, index) => {
  const known = choices.find(item => item[0] === c.id);
  const custom = String(c.custom || "").trim();
  if (!known && !(c.id === "custom" && custom)) throw new Error("اختار أو اوصف الشخصية رقم " + (index+1) + ".");
  const place = TEACHER_CHARACTER_LOCATIONS.find(item => item[0] === c.location);
  if (!place) throw new Error("اختار مكان الشخصية رقم " + (index+1) + ".");
  return {id:c.id, label:known ? known[1] : custom, name:known ? known[2] : custom, location:place[2], screenSide:c.location.endsWith("Right") ? "RIGHT" : "LEFT", note:String(c.note || "").trim(), outfitColor:String(c.outfitColor || "").trim()};
 });
 const keys = selected.map(c => c.id === "custom" ? c.name.toLowerCase() : c.id);
 if (new Set(keys).size !== keys.length) throw new Error("اختار شخصيات مختلفة؛ فيه شخصية مكررة.");
 return selected;
}
function teacherReferencePlan(config, selected) {
 if (!["personOnly", "withCharacters"].includes(config.referenceMode)) throw new Error("اختار مصادر الصور المرجعية.");
 if (!["description", "image"].includes(config.clothingMode)) throw new Error("اختار مصدر ملابس المدرّس.");
 const plan = [{kind:"teacher", label:"المدرّس — الهوية فقط"}];
 if (config.referenceMode === "withCharacters") selected.forEach(c => plan.push({kind:"character", label:c.label, character:c}));
 if (config.clothingMode === "image") plan.push({kind:"clothing", label:"ملابس المدرّس — آخر صورة، للملابس فقط"});
 return plan;
}
if (typeof module !== "undefined") module.exports = {TEACHER_CHARACTERS, TEACHER_CHARACTER_LOCATIONS, resolveTeacherCharacters, teacherReferencePlan};

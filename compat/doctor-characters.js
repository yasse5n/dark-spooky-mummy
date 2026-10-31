// Reference instructions only: the plugin does not upload or analyze images.
var DOCTOR_TEAM_ROLES = [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]];
var DOCTOR_CHARACTERS = {
  "none": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "general": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "dental": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "dermatology": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "pediatrics": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "cardiology": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "orthopedics": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "ophthalmology": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "ent": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "gynecology": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "internal": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "neurology": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "surgery": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "urology": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "physiotherapy": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "nutrition": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "psychiatry": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]],
  "radiology": [["doctor", "دكتور من الفريق", "An original fictional supporting doctor with a distinct face"], ["doctorWoman", "دكتورة من الفريق", "An original fictional supporting female doctor with a distinct face"], ["nurse", "ممرض", "An original fictional male nurse with a distinct face"], ["nurseWoman", "ممرضة", "An original fictional female nurse with a distinct face"], ["assistant", "مساعد طبي", "An original fictional medical assistant with a distinct face"], ["receptionist", "موظف استقبال", "An original fictional clinic receptionist with a distinct face"]]
};
var DOCTOR_CHARACTER_LOCATIONS = [["behindLeft", "خلف كتفه مباشرةً — يسار الصورة", "Immediately behind the doctor's LEFT shoulder as seen by the VIEWER, within a close group with a small breathing gap between heads"], ["behindRight", "خلف كتفه مباشرةً — يمين الصورة", "Immediately behind the doctor's RIGHT shoulder as seen by the VIEWER, within a close group with a small breathing gap between heads"], ["besideLeft", "بجانبه قريب — يسار الصورة", "Closely beside the doctor on the VIEWER'S LEFT, at shoulder distance within a close group with a small breathing gap between heads"], ["besideRight", "بجانبه قريب — يمين الصورة", "Closely beside the doctor on the VIEWER'S RIGHT, at shoulder distance within a close group with a small breathing gap between heads"]];
function resolveDoctorCharacters(_ref) {
  var subject = _ref.subject,
    _ref$characterCount = _ref.characterCount,
    characterCount = _ref$characterCount === void 0 ? 0 : _ref$characterCount,
    _ref$characters = _ref.characters,
    characters = _ref$characters === void 0 ? [] : _ref$characters;
  var count = Number(characterCount);
  if (![0, 2, 3, 4].includes(count)) throw new Error("اختار بدون شخصيات أو ٢ أو ٣ أو ٤ شخصيات.");
  if (!count) return [];
  if (!Array.isArray(characters) || characters.length !== count) throw new Error("كمّل اختيار كل الشخصيات بالعدد المحدد.");
  var choices = DOCTOR_CHARACTERS[subject] || [];
  var selected = characters.map(function (c, index) {
    var known = choices.find(function (item) {
      return item[0] === c.id;
    });
    var custom = String(c.custom || "").trim();
    if (!known && !(c.id === "custom" && custom)) throw new Error("اختار أو اوصف الشخصية رقم " + (index + 1) + ".");
    var place = DOCTOR_CHARACTER_LOCATIONS.find(function (item) {
      return item[0] === c.location;
    });
    if (!place) throw new Error("اختار مكان الشخصية رقم " + (index + 1) + ".");
    return {
      id: c.id,
      label: known ? known[1] : custom,
      name: known ? known[2] : custom,
      location: place[2],
      screenSide: c.location.endsWith("Right") ? "RIGHT" : "LEFT",
      note: String(c.note || "").trim(),
      outfitColor: String(c.outfitColor || "").trim()
    };
  });
  var keys = selected.map(function (c) {
    return c.id === "custom" ? c.name.toLowerCase() : c.id;
  });
  if (new Set(keys).size !== keys.length) throw new Error("اختار شخصيات مختلفة؛ فيه شخصية مكررة.");
  return selected;
}
function doctorReferencePlan(config, selected) {
  if (!["personOnly", "withCharacters"].includes(config.referenceMode)) throw new Error("اختار مصادر الصور المرجعية.");
  if (!["description", "image"].includes(config.clothingMode)) throw new Error("اختار مصدر ملابس الدكتور.");
  var plan = [{
    kind: "doctor",
    label: "الدكتور — الهوية فقط"
  }];
  if (config.referenceMode === "withCharacters") selected.forEach(function (c) {
    return plan.push({
      kind: "character",
      label: c.label,
      character: c
    });
  });
  if (config.clothingMode === "image") plan.push({
    kind: "clothing",
    label: "ملابس الدكتور — آخر صورة، للملابس فقط"
  });
  return plan;
}
if (typeof module !== "undefined") module.exports = {
  DOCTOR_CHARACTERS: DOCTOR_CHARACTERS,
  DOCTOR_CHARACTER_LOCATIONS: DOCTOR_CHARACTER_LOCATIONS,
  resolveDoctorCharacters: resolveDoctorCharacters,
  doctorReferencePlan: doctorReferencePlan
};

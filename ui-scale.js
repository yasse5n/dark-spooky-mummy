// Class-based pixel presets work without browser zoom or CSS transforms.
(function () {
  const levels=[80,90,100,110,120,130,140,150];
  const key="qayem.uiScalePercent";
  const smaller=document.getElementById("uiScaleSmaller");
  const larger=document.getElementById("uiScaleLarger");
  const reset=document.getElementById("uiScaleReset");
  const notice=document.getElementById("uiScaleNotice");
  let percent=100;
  try {
    const stored=Number(window.localStorage.getItem(key));
    if(levels.includes(stored))percent=stored;
  } catch (ignored) { /* Use the default if preferences are unavailable. */ }
  function apply(save) {
    levels.forEach(level=>document.body.classList.remove("uiScale"+level));
    if(percent!==100)document.body.classList.add("uiScale"+percent);
    reset.textContent=percent+"%";
    reset.setAttribute("aria-label","الحجم الحالي "+percent+" بالمئة. اضغط للرجوع إلى 100 بالمئة");
    smaller.disabled=percent===levels[0];
    larger.disabled=percent===levels[levels.length-1];
    if(save){
      try {
        window.localStorage.setItem(key,String(percent));
        setUiHidden(notice,true);
      } catch (ignored) {
        notice.textContent="الحجم الحالي متاح في هذه الجلسة؛ تعذّر حفظه للجلسة القادمة.";
        setUiHidden(notice,false);
      }
    }
  }
  smaller.addEventListener("click",()=>{const i=levels.indexOf(percent);if(i>0){percent=levels[i-1];apply(true);}});
  larger.addEventListener("click",()=>{const i=levels.indexOf(percent);if(i<levels.length-1){percent=levels[i+1];apply(true);}});
  reset.addEventListener("click",()=>{percent=100;apply(true);});
  apply(false);
})();

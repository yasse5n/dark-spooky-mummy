var QayemCommunity=(function(){
  'use strict';
  var account='',accessible=false,sequence=0,winnerSequence=0,dialog=null,focusBefore=null,saveState=null,filter='',editing=null,presets=[],saveRequest=null,sending=null,lastWinner='';
  var labels={teacherView:'تصميم مدرس',doctorView:'تصميم طبيب',cosmeticsView:'كوزماتيكس'};
  function $(id){return document.getElementById(id);}
  function show(n,on){if(!n)return;n.hidden=!on;n.style.display=on?'':'none';}
  function node(tag,parent,value,cls){var n=document.createElement(tag);if(value)n.textContent=value;if(cls)n.className=cls;if(parent)parent.appendChild(n);return n;}
  function button(parent,label,fn,cls){var b=node('button',parent,label,cls||'qCommunityQuiet');b.type='button';b.onclick=fn;return b;}
  function requestId(){return 'q'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+'_'+Math.random().toString(36).slice(2);}
  function message(id,value,ok){var n=$(id);n.textContent=value||'';n.className=ok?'qCommunityStatus is-ok':'qCommunityStatus';}
  function api(method,path,body){return QayemAuth.api(method,path,body).catch(function(e){if(e.status===404){e.message='الميزة تحتاج تحديث السيرفر إلى 1.4.0 أو أحدث.';}throw e;});}
  function external(url,status){
    if(!/^https:\/\/(?:[A-Za-z0-9-]+\.)*(?:facebook\.com|fb\.watch|fb\.com)\//i.test(url))return;
    try{if(typeof QAYEM_CEP_HOST!=='undefined'&&QAYEM_CEP_HOST)QayemCEPBridge.openExternal(url);else window.open(url,'_blank','noopener,noreferrer');}catch(e){if(status)status.textContent='افتح الرابط في المتصفح: '+url;}
  }
  function refreshWinner(){
    if(!accessible)return;
    var seq=++winnerSequence,who=account;message('qCommunityWinnerStatus','جاري تحميل تصميم الأسبوع…');
    api('GET','/api/community/weekly-design').then(function(data){
      if(seq!==winnerSequence||who!==account||!accessible)return;
      var box=$('qCommunityWinner');box.textContent='';lastWinner='';
      if(!data.winner){show(box,false);message('qCommunityWinnerStatus','قريبًا نعلن أول فائز. ممكن تصميمك يكون هنا!');return;}
      var w=data.winner;lastWinner=w.id;var img=node('img',box,'','qCommunityWinnerImage');img.alt=w.title;
      node('span',box,'الفائز بتصميم الأسبوع','qCommunityEyebrow');node('h3',box,w.title);node('p',box,w.designerName,'qCommunityDesigner');node('p',box,'أسبوع '+w.weekOf,'qCommunityWeek');
      button(box,'شوف التصميم على فيسبوك',function(){external(w.postUrl,$('qCommunityWinnerStatus'));});show(box,true);
      message('qCommunityWinnerStatus','جاري تحميل صورة التصميم…');
      return api('GET','/api/community/designs/'+encodeURIComponent(w.id)+'/image-data').then(function(image){
        if(seq!==winnerSequence||who!==account||lastWinner!==w.id||!accessible)return;
        if(!/^data:image\/(png|jpeg);base64,/.test(image.image||''))throw new Error('صيغة الصورة غير مدعومة');
        img.onload=function(){if(seq===winnerSequence)message('qCommunityWinnerStatus','');};img.onerror=function(){if(seq===winnerSequence)message('qCommunityWinnerStatus','تعذّر عرض الصورة. اضغط تحديث تصميم الأسبوع.');};img.src=image.image;
      });
    }).catch(function(e){if(seq!==winnerSequence||who!==account||e.stale)return;message('qCommunityWinnerStatus',e.message+' اضغط تحديث تصميم الأسبوع.');});
  }
  function closeDialog(){sequence++;if(dialog)show(dialog,false);if(focusBefore&&focusBefore.focus)try{focusBefore.focus();}catch(e){}saveState=null;editing=null;saveRequest=null;}
  function buildDialog(){
    if(dialog)return;
    dialog=node('div',document.body,'','qCommunityOverlay');dialog.id='qCommunityPresetModal';dialog.setAttribute('data-qayem-no-translate','');
    var card=node('div',dialog,'','qCommunityDialog');card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-labelledby','qCommunityPresetTitle');
    var header=node('div',card,'','qCommunityHeading');var title=node('h2',header,'إعداداتي المحفوظة');title.id='qCommunityPresetTitle';var close=button(header,'×',closeDialog);close.id='qCommunityPresetClose';close.setAttribute('aria-label','إغلاق الإعدادات المحفوظة');
    node('p',card,'احفظ إعدادات كل مدرس أو عميل باسم تختاره. محفوظاتك مرتبطة بحسابك.','qCommunityIntro');
    var form=node('form',card);form.id='qCommunityPresetForm';
    var label=node('label',form,'اسم الإعداد');label.setAttribute('for','qCommunityPresetName');var name=node('input',form);name.id='qCommunityPresetName';name.type='text';name.maxLength=100;name.required=true;name.setAttribute('dir','auto');name.placeholder='مستر أحمد — تصميم سينمائي';
    var actions=node('div',form,'','qCommunityActions');var submit=node('button',actions,'حفظ إعداد جديد');submit.type='submit';submit.id='qCommunityPresetSave';button(actions,'إلغاء',function(){editing=null;show(form,false);});
    form.onsubmit=function(e){e.preventDefault();savePreset();};
    var tools=node('div',card,'','qCommunityHeading');var count=node('span',tools);count.id='qCommunityPresetCount';button(tools,'تحديث القائمة',loadPresets);
    var status=node('p',card);status.id='qCommunityPresetStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    var confirm=node('div',card,'','qCommunityConfirm');confirm.id='qCommunityPresetConfirm';show(confirm,false);
    var list=node('div',card,'','qCommunityPresetList');list.id='qCommunityPresetList';
    dialog.addEventListener('click',function(e){if(e.target===dialog)closeDialog();});
    dialog.addEventListener('keydown',function(e){
      if(e.key==='Escape'||e.keyCode===27){e.preventDefault();closeDialog();return;}
      if(e.key==='Tab'||e.keyCode===9){var all=Array.prototype.slice.call(card.querySelectorAll('button,input')).filter(function(n){return !n.disabled&&n.getClientRects().length;}),first=all[0],last=all[all.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
    });
  }
  function ask(text,action){var box=$('qCommunityPresetConfirm');box.textContent='';node('p',box,text);button(box,'تأكيد',function(){show(box,false);action();},'qCommunityPrimary');button(box,'إلغاء',function(){show(box,false);});show(box,true);box.querySelector('button').focus();}
  function busy(b,on){b.disabled=on;b.setAttribute('aria-busy',String(on));}
  function fail(e){if(!e.stale&&dialog&&!dialog.hidden)message('qCommunityPresetStatus',e.message);}
  function renderPresets(){
    var box=$('qCommunityPresetList');box.textContent='';var shown=presets.filter(function(p){return !filter||p.snapshot.screen===filter;});$('qCommunityPresetCount').textContent=shown.length+' إعداد محفوظ';
    if(!shown.length)node('p',box,'لسه مفيش إعدادات محفوظة هنا. افتح التصميم واضغط «حفظ الإعدادات».','qCommunityEmpty');
    shown.forEach(function(p){
      var card=node('article',box,'','qCommunityPresetCard');card.setAttribute('data-preset-id',p.id);node('strong',card,p.name);node('p',card,(labels[p.snapshot.screen]||'تصميم')+' · '+String(p.updatedAt).slice(0,10),'qCommunityWeek');
      var actions=node('div',card,'','qCommunityActions');
      button(actions,'تحميل الإعدادات',function(){ask('تحميل «'+p.name+'» واستبدال خانات هذا القسم بالإعداد المحفوظ؟',function(){try{QayemUiState.apply(p.snapshot);closeDialog();}catch(e){fail(e);}});},'qCommunityPrimary');
      button(actions,'تغيير الاسم',function(){editing=p;saveRequest=null;$('qCommunityPresetName').value=p.name;$('qCommunityPresetSave').textContent='حفظ الاسم';show($('qCommunityPresetForm'),true);$('qCommunityPresetName').focus();});
      if(saveState&&saveState.screen===p.snapshot.screen)button(actions,'تحديث بالقيم الحالية',function(){ask('تحديث «'+p.name+'» بإعدادات التصميم الحالية؟',function(){mutate('PATCH','/api/presets/'+p.id,{name:p.name,revision:p.revision,snapshot:saveState});});});
      button(actions,'حذف',function(){ask('حذف الإعداد «'+p.name+'» من حسابك؟',function(){mutate('DELETE','/api/presets/'+p.id);});},'qCommunityDanger');
    });
  }
  function mutate(method,path,body){
    var seq=sequence;message('qCommunityPresetStatus','جاري الحفظ…');
    var controls=Array.prototype.slice.call(dialog.querySelectorAll('button,input'));controls.forEach(function(b){busy(b,true);});
    api(method,path,body).then(function(){if(seq!==sequence)return;message('qCommunityPresetStatus',method==='DELETE'?'تم حذف الإعداد.':'تم حفظ الإعداد على حسابك.',true);show($('qCommunityPresetForm'),false);editing=null;saveRequest=null;return loadPresets(true);}).catch(fail).then(function(){if(seq===sequence)controls.forEach(function(b){busy(b,false);});});
  }
  function savePreset(){
    var name=$('qCommunityPresetName').value.trim();if(!name){message('qCommunityPresetStatus','اكتب اسم الإعداد.');return;}
    if(editing){mutate('PATCH','/api/presets/'+editing.id,{name:name,revision:editing.revision});return;}
    if(!saveState){message('qCommunityPresetStatus','افتح التصميم أولًا واضغط حفظ الإعدادات.');return;}
    var sig=JSON.stringify({name:name,snapshot:saveState});if(!saveRequest||saveRequest.signature!==sig)saveRequest={signature:sig,id:requestId()};
    mutate('POST','/api/presets',{name:name,snapshot:saveState,requestId:saveRequest.id});
  }
  function loadPresets(keepMessage){
    var seq=sequence;if(keepMessage!==true)message('qCommunityPresetStatus','جاري تحميل إعداداتك…');
    return api('GET','/api/presets').then(function(data){if(seq!==sequence||dialog.hidden)return;presets=data.presets||[];renderPresets();if(keepMessage!==true)message('qCommunityPresetStatus','');}).catch(function(e){if(seq===sequence)fail(e);});
  }
  function openPresets(scope,save){
    if(!accessible)return;buildDialog();sequence++;focusBefore=document.activeElement;filter=scope||'';saveState=save?QayemUiState.snapshot(scope):null;editing=null;saveRequest=null;
    $('qCommunityPresetName').value='';$('qCommunityPresetSave').textContent='حفظ إعداد جديد';show($('qCommunityPresetForm'),!!saveState);show($('qCommunityPresetConfirm'),false);show(dialog,true);loadPresets();
    (saveState?$('qCommunityPresetName'):$('qCommunityPresetClose')).focus();
  }
  function onSession(on,session){
    var id=session&&session.user&&session.user.id||'',changed=id!==account,shouldRefresh=on&&(!accessible||changed);accessible=!!on;
    if(changed){account=id;winnerSequence++;lastWinner='';presets=[];sending=null;closeDialog();$('qCommunityWinner').textContent='';show($('qCommunityWinner'),false);$('qCommunitySuggestionText').value='';$('qCommunitySuggestionCount').textContent='0 / 3000';message('qCommunitySuggestionStatus','');}
    if(!on)closeDialog();if(shouldRefresh)refreshWinner();
  }
  $('qCommunitySuggestionToggle').onclick=function(){var open=this.getAttribute('aria-expanded')!=='true';this.setAttribute('aria-expanded',String(open));this.lastElementChild.textContent=open?'−':'+';show($('qCommunitySuggestionBody'),open);};
  $('qCommunitySuggestionText').oninput=function(){$('qCommunitySuggestionCount').textContent=this.value.length+' / 3000';};
  $('qCommunitySendSuggestion').onclick=function(){
    var b=this,text=$('qCommunitySuggestionText').value.trim(),who=account;if(!accessible)return;if(text.length<3){message('qCommunitySuggestionStatus','اكتب اقتراحك في 3 حروف على الأقل.');return;}
    if(!sending||sending.text!==text)sending={text:text,id:requestId()};busy(b,true);message('qCommunitySuggestionStatus','جاري إرسال اقتراحك…');
    api('POST','/api/suggestions',{message:text,requestId:sending.id}).then(function(){if(who!==account)return;if($('qCommunitySuggestionText').value.trim()===text){$('qCommunitySuggestionText').value='';$('qCommunitySuggestionCount').textContent='0 / 3000';}sending=null;message('qCommunitySuggestionStatus','اقتراحك وصل لمحمد قيم. شكرًا لمساعدتك في تطوير البلاجن!',true);}).catch(function(e){if(who===account&&!e.stale)message('qCommunitySuggestionStatus',e.message);}).then(function(){busy(b,false);});
  };
  $('qCommunityWeeklyRefresh').onclick=refreshWinner;$('qCommunityOpenPresets').onclick=function(){openPresets('',false);};
  Array.prototype.forEach.call(document.querySelectorAll('[data-qayem-save-scope]'),function(b){b.onclick=function(){openPresets(b.getAttribute('data-qayem-save-scope'),true);};});
  Array.prototype.forEach.call(document.querySelectorAll('[data-qayem-list-presets]'),function(b){b.onclick=function(){openPresets(b.getAttribute('data-qayem-list-presets'),false);};});
  if(typeof setInterval==='function')setInterval(function(){if(accessible&&QayemNavigation.current()==='modeHome')refreshWinner();},120000);
  onSession(QayemAuth.isUnlocked(),{user:QayemAuth.getUser()});
  return {onSession:onSession,refreshWinner:refreshWinner,openPresets:openPresets};
})();

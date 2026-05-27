// === TOAST ===
let _tt;
function showToast(msg) {
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(_tt);
  _tt=setTimeout(()=>t.classList.remove('show'),2500);
}

// === INIT ===
(function(){
  syncFromGist();
  updateNotifStatus();
  updateMailboxStatus();
  initRimaToggle();
  renderHome();
  switchTab('home', document.getElementById('nav-home'));
  document.getElementById('deadlineInput').value = todayStr();
  if(Notification.permission==='granted') triggerNotifications();
  startRimaRotation();
})();

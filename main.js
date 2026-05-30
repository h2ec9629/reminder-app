// === TOAST ===
let _tt;
function showToast(msg) {
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(_tt);
  _tt=setTimeout(()=>t.classList.remove('show'),2500);
}

// === FORCE UPDATE ===
async function forceUpdate() {
  showToast('更新中...');
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  } catch(e) {}
  setTimeout(() => location.reload(true), 800);
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

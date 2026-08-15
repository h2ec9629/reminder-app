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
  checkPatStatus();
  initRimaToggle();
  renderHome();

  // VDECK再生中断バグへの対策：iOSのメモリ解放等で同一セッション内にページが
  // 勝手に作り直された場合、起動のたびに出るリングメニューを出さず、直前に
  // 見ていたタブへ黙って復帰する。sessionStorageは「タブを完全に閉じて開き直す」
  // と空になる仕様なので、これで「本当の新規起動」と「途中でのリロード」を区別する。
  let _lastTab = null;
  try{ _lastTab = sessionStorage.getItem('ojisan_last_tab_v1'); }catch(e){}

  if (_lastTab && _lastTab !== 'home' && document.getElementById('nav-' + _lastTab)) {
    const ringScreen = document.getElementById('topRingScreen');
    if (ringScreen) ringScreen.classList.add('hide');
    switchTab(_lastTab, document.getElementById('nav-' + _lastTab));
  } else {
    switchTab('home', document.getElementById('nav-home'));
  }

  document.getElementById('deadlineInput').value = todayStr();
  if(Notification.permission==='granted') triggerNotifications();
  startRimaRotation();
  initRingWheel();
  initRingClock();
})();

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
  syncFromGist().then(renderLauncher); // 配送データが届いたらホームの「今日の配送」を更新
  updateNotifStatus();
  updateMailboxStatus();
  checkPatStatus();
  initRimaToggle();
  renderHome();

  // VDECK再生中断バグへの対策：iOSのメモリ解放等で同一セッション内にページが
  // 勝手に作り直された場合、起動のたびに出るリングメニューを出さず、直前に
  // 見ていたタブへ黙って復帰する。sessionStorageは「タブを完全に閉じて開き直す」
  // と空になる仕様なので、これで「本当の新規起動」と「途中でのリロード」を区別する。
  // 2026-08-16：旧ハンバーガーメニュー廃止で nav-<name> のidが無くなったため、
  // _lastTabの妥当性チェックは実在するtab-<name>ペインの有無で判定するよう変更。
  let _lastTab = null;
  try{ _lastTab = sessionStorage.getItem('ojisan_last_tab_v1'); }catch(e){}

  // 三本線タップでのリング再オープンにも対応するため、ポインタ操作の待受登録は
  // 起動パスに関わらず常に一度だけ行う（ループの開始/停止は下のif/elseで個別に制御）。
  initRingWheel();

  // 2026-10-29：リングメニューはホーム画面(#launcher)に置き換えたので、リングの回転/時計は起動しない
  _ringLoopStopped = true;
  if (_lastTab && _lastTab !== 'home' && document.getElementById('tab-' + _lastTab)) {
    // 同一セッション内でのリロード＝ホーム画面は出さず、直前のタブへ黙って復帰する
    switchTab(_lastTab, document.getElementById('nav-' + _lastTab) || document.createElement('button'));
  } else {
    switchTab('home', document.getElementById('nav-home') || document.createElement('button'));
    openLauncher();
  }

  document.getElementById('deadlineInput').value = todayStr();
  if(Notification.permission==='granted') triggerNotifications();
  startRimaRotation();
})();

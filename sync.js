function importBackup(input) {
  const file=input.files[0]; if(!file) return;
  const r=new FileReader();
  r.onload=e=>{ try{ const d=JSON.parse(e.target.result); const l=d.reminders||d; if(!Array.isArray(l)) throw 0; saveAll(l); renderHome(); showToast(`${l.length}件を復元しました`); }catch{ showToast('ファイルの形式が違います'); } };
  r.readAsText(file); input.value='';
}


// === NOTIFICATIONS ===
async function requestNotif() {
  if(!('Notification' in window)){ showToast('このブラウザは通知非対応です'); return; }
  const p=await Notification.requestPermission();
  updateNotifStatus();
  if(p==='granted'){ showToast('通知を許可しました'); document.getElementById('notifBanner').style.display='none'; triggerNotifications(); }
  else showToast('通知がブロックされています');
}
function updateNotifStatus() {
  const el=document.getElementById('notifStatus'); if(!el) return;
  el.textContent = !('Notification' in window) ? '通知非対応のブラウザです'
    : Notification.permission==='granted' ? '許可済み'
    : Notification.permission==='denied'  ? 'ブロック済み（ブラウザ設定から変更してください）'
    : '未設定';
}
function triggerNotifications() {
  if(Notification.permission!=='granted') return;
  getAll().filter(r=>!r.completed).forEach(r=>{
    const n=daysUntil(r.deadline),adv=r.advance_days||3;
    if(n<0) new Notification(r.title,{body:`${Math.abs(n)}日超過しています`,tag:'ov-'+r.id,icon:'icons/icon-192.png'});
    else if(n<=adv) new Notification(r.title,{body:n===0?'今日が期限です':`${n}日後が期限です`,tag:r.id,icon:'icons/icon-192.png'});
  });
}

// === MAILBOX GIST ===
const MAILBOX_CFG_KEY = 'ojisan_mailbox_cfg_v1';

function getMailboxCfg() {
  try { return JSON.parse(localStorage.getItem(MAILBOX_CFG_KEY)||'{}'); } catch { return {}; }
}

function saveMailboxSettings() {
  const gistId = document.getElementById('mailboxGistId').value.trim();
  const pat    = document.getElementById('mailboxPat').value.trim();
  if (!gistId || !pat) { showToast('GistIDとPATを両方入力してください'); return; }
  localStorage.setItem(MAILBOX_CFG_KEY, JSON.stringify({ gistId, pat }));
  showToast('投函箱設定を保存しました');
  updateMailboxStatus();
}

function updateMailboxStatus() {
  const el = document.getElementById('mailboxStatus');
  if (!el) return;
  const cfg = getMailboxCfg();
  if (cfg.gistId && cfg.pat) {
    el.textContent = '設定済み ✓  GistID: ' + cfg.gistId.slice(0,10) + '...';
    document.getElementById('mailboxGistId').value = cfg.gistId;
  } else {
    el.textContent = '未設定 — GistIDとPATを入力して保存してください';
  }
}

async function pushToMailbox(reminder) {
  const cfg = getMailboxCfg();
  if (!cfg.gistId || !cfg.pat) return;

  try {
    const getRes = await fetch('https://api.github.com/gists/' + cfg.gistId, {
      headers: {
        'Authorization': 'Bearer ' + cfg.pat,
        'Accept': 'application/vnd.github+json'
      }
    });
    if (!getRes.ok) throw new Error('get failed');
    const gistData = await getRes.json();

    let pending = [];
    try {
      const raw = gistData.files['pending_manual.json']?.content || '{"pending_manual":[]}';
      pending = JSON.parse(raw).pending_manual || [];
    } catch {}

    pending.push({
      title:        reminder.title,
      deadline:     reminder.deadline || null,
      notes:        reminder.notes || '',
      advance_days: reminder.advance_days || 3,
      pushed_at:    todayStr()
    });

    const patchRes = await fetch('https://api.github.com/gists/' + cfg.gistId, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + cfg.pat,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: { 'pending_manual.json': { content: JSON.stringify({ pending_manual: pending }, null, 2) } }
      })
    });
    if (!patchRes.ok) throw new Error('patch failed');
  } catch(e) {
    console.warn('投函箱送信失敗（ローカルには保存済み）:', e.message);
  }
}

// === GITHUB GIST SYNC ===
const GIST_RAW_URL = 'https://gist.githubusercontent.com/H2EC9629/34f07c829b92ea7141367874f8777512/raw/reminder_sync.json';
const MEAS_HIST_GIST_URL = 'https://gist.githubusercontent.com/H2EC9629/34f07c829b92ea7141367874f8777512/raw/meas_history.json';
const MEAS_GIST_ID       = '34f07c829b92ea7141367874f8777512';

async function syncFromGist(manual=false) {
  try {
    const res = await fetch(GIST_RAW_URL + '?t=' + Date.now());
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    if (data.excel_schedule) {
      _excelSchedule = data.excel_schedule;
      _schSyncedAt   = data.synced_at || null;
    }
    if (data.gantt_data) {
      _ganttData = data.gantt_data;
    }
    const list = data.reminders || [];
    const keys  = new Set(getAll().map(r=>r.title+'|'+r.deadline));
    const grave = getGrave();
    let added = 0;
    list.forEach(item => {
      if (!item.title) return;
      const k = item.title+'|'+(item.deadline||'null');
      if (keys.has(k))  return; // すでにある
      if (grave.has(k)) return; // 削除済み → 復活させない
      addReminder({ title:item.title, deadline:item.deadline||null,
                    category:'obsidian', advance_days:item.advance_days||3, notes:item.notes||'' });
      keys.add(k); added++;
    });
    if (added > 0) { renderHome(); showToast(`Obsidianから${added}件を取込みました`); }
    else if (manual) showToast('新しいリマインドはありませんでした');
  } catch(e) {
    if (manual) showToast('同期に失敗しました（しばらく後でお試しください）');
  }
}

// === SETTINGS ===
function exportData() {
  const blob=new Blob([JSON.stringify({reminders:getAll(),exported_at:new Date().toISOString()},null,2)],{type:'application/json'});
  const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(blob),download:`reminder-${todayStr()}.json`});
  a.click(); URL.revokeObjectURL(a.href); showToast('エクスポートしました');
}
function clearCompleted() {
  const b=getAll().length; saveAll(getAll().filter(r=>!r.completed));
  renderHome(); showToast(`${b-getAll().length}件削除しました`);
}
function clearAll() {
  if(!confirm('全てのリマインドを削除しますか？')) return;
  saveAll([]); renderHome(); showToast('全て削除しました');
}


'use strict';

// === DATA ===
const KEY = 'ojisan_reminders_v1';
const getAll  = () => { try { return JSON.parse(localStorage.getItem(KEY)||'[]'); } catch{return[];} };
const saveAll = a => localStorage.setItem(KEY, JSON.stringify(a));
const genId   = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const todayStr= () => new Date().toISOString().split('T')[0];

function addReminder(r) {
  const a = getAll();
  r.id = genId(); r.created_at = todayStr(); r.completed = false;
  a.push(r); saveAll(a); return r;
}
const markDone  = id => saveAll(getAll().map(r => r.id===id ? {...r, completed:true, completed_at:todayStr()} : r));

// === 削除済みグレーブヤード（同期で復活させない） ===
const GRAVE_KEY   = 'ojisan_deleted_v1';
const getGrave    = () => { try { return new Set(JSON.parse(localStorage.getItem(GRAVE_KEY)||'[]')); } catch{return new Set();} };
const addGrave    = key => { const g=getGrave(); g.add(key); localStorage.setItem(GRAVE_KEY, JSON.stringify([...g])); };
const deleteOne   = id => {
  const r = getAll().find(r => r.id===id);
  if (r) addGrave(r.title+'|'+(r.deadline||'null'));
  saveAll(getAll().filter(r => r.id!==id));
};

// === DATE ===
function daysUntil(s) {
  const t=new Date(); t.setHours(0,0,0,0);
  const d=new Date(s); d.setHours(0,0,0,0);
  return Math.round((d-t)/86400000);
}
function fmtDate(s) {
  const d=new Date(s);
  return `${d.getMonth()+1}/${d.getDate()}(${'日月火水木金土'[d.getDay()]})`;
}
function daysLabel(n) {
  if(n<0)   return `${Math.abs(n)}日超過`;
  if(n===0) return '今日が期限';
  if(n===1) return '明日が期限';
  return `${n}日後`;
}
function urgClass(n, adv) {
  if(n<0)  return 'overdue';
  if(n===0 || n<=Math.min(adv,2)) return 'urgent';
  if(n<=7) return 'soon';
  return '';
}
function chipCls(n) {
  if(n<0)  return 'dc-purple';
  if(n<=2) return 'dc-danger';
  if(n<=7) return 'dc-warning';
  return '';
}

// === MASCOT ===
function mascotSVG(w=120, h=132) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg"><use href="#rimachan"/></svg>`;
}

// === RIMA ROTATION ===
// === ステータスコメント（リマインド数別・複数バリエーション） ===
const VAPE_COMMENTS = [
  'ガンク落としは\n毎日やりなはれ',
  'あ"あぁ"竜巻ぃぃ！',
  '吸いすぎると\n喉カラッカラになりますよ',
  'いいかげん\nコイル交換したらどうですか',
  'Modの充電は\nこまめにしなはれ',
  '会社、家に\n忘れるべからず',
];

const STATUS_COMMENTS = {
  zero: [
    // やさしい系
    'うどんでも食べながら\nゆっくりしてください',
    'ええ調子ですわ〜\n今日はのんびりどうぞ',
    'リマインドゼロ！\n余裕あるうちに休んでください',
    'ぴかぴかですよ✨\nこの調子でいきましょ',
    // 毒づき系
    'ホンマに仕事してるんですか？\nリマインドゼロって逆にすごい',
    'こんなに暇でええんですか？\nわたしだけ忙しい気がします',
    'やることないんやったら\n在庫の整理でもしてはどうですか',
    'リマインドゼロって\nさぼってませんよね？一応確認です',
    'ゆとりありますねえ\nわたしにも少し分けてほしいですわ',
  ],
  low: [
    // やさしい系
    'ぼちぼちありますわ〜\n無理せず片付けてください',
    '少しだけありますね\nさらっと終わりますよ',
    'もう少しで全部片付きます\n頑張れおじさん！',
    '残り少ないです！\nもう少しやで〜',
    // 毒づき系
    'これだけでよく残業できますね\n不思議でしかないです',
    'たったこれだけですか\n業務量が心配になってきましたわ',
    'ゆったりしてますね\nうらやましい限りですわ',
    'ちょっとしかないですけど\nちゃんと終わらせてくださいよ',
    '少ないのはええことですが\nわたしに気を使ってるんですか？',
  ],
  mid: [
    // やさしい系
    'そこそこありますよ！\n優先順位つけていきましょ',
    'いくつかありますね\n焦らずこなしていきましょ',
    'まあまあありますわ\n一個一個片付けましょ',
    '順番通りやっていけば\n大丈夫ですよ！',
    // 毒づき系
    '忙しいですね\nわたしはお茶飲んでますよ',
    'なんでこんなに溜まったんですか\nわたしには全くわかりません',
    'そこそこ積んでますね\n計画性はどこへ行ったんですか',
    'まあまあ大変ですね\nわたしはぬくぬくしてます',
    '頑張ってください\nわたしは頑張らなくていいので',
  ],
  high: [
    // やさしい系
    'けっこう多いですね...\n一個ずつ着実にどうぞ',
    '積み上がってきましたね\n着実にいきましょ',
    '結構な量ですよ！\n今日から少しずつ片付けましょ',
    'おじさん、そこそこ忙しいですね\n一緒に頑張りましょ！',
    // 毒づき系
    '今まで何やってきたんですか？\nわたしが聞いてもわかりませんが',
    'おじさんは残業ですけど\nわたしは定時で帰りますね',
    'これ全部期限守れますか？\n他人事ですが少し心配です',
    'おじさんの予定表\n見てるだけで疲れますわ',
    'けっこうしんどそうですね\nわたしはコーヒーでも飲んどきます',
  ],
  overload: [
    // やさしい系
    'パンパンやないですか！\n気合い入れていきまひょ',
    'うわ〜これは多いですわ\nとにかく一個ずつです！',
    '満載ですね...\n優先順位が大事ですよ！',
    'フル回転ですね\nおじさん、体に気をつけて！',
    // 毒づき系
    '今まで何やってきたんですか？\n本気で聞いてます',
    'おじさんは残業確定ですね\nわたしは定時なのでお先に失礼します',
    'これ全部終わりますか？\nわたしには無理ですけど頑張って',
    'パンクしそうですね\nそんな中わたしはお茶タイムです',
    '見てるだけで胃が痛くなりますわ\nお大事に...',
  ],
};

let _statusVariantIdx = 0;

function rimaCommentText(count) {
  const tier = count===0 ? 'zero' : count<=2 ? 'low' : count<=5 ? 'mid' : count<=9 ? 'high' : 'overload';
  const pool = STATUS_COMMENTS[tier];
  return pool[_statusVariantIdx % pool.length];
}

// スライド状態管理
let _rimaCycleTimer = null;
let _rimaTypeTimer  = null;
const SLIDE_MS = 6000;

function getCurrentSlideText() {
  const calcActive = document.getElementById('tab-calc')?.classList.contains('active');
  if (calcActive && _calcPgIdx === 2) {
    return VAPE_COMMENTS[Math.floor(Math.random() * VAPE_COMMENTS.length)];
  }
  const n = getAll().filter(r=>!r.completed).length;
  return rimaCommentText(n);
}

function advanceSlide() {
  _statusVariantIdx++;  // rimaCommentText側でpool.lengthにmodする
}

function startRimaRotation() {
  clearTimeout(_rimaCycleTimer);
  clearTimeout(_rimaTypeTimer);
  _statusVariantIdx = 0;
  showNextRimaComment();
}

function showNextRimaComment() {
  const text = getCurrentSlideText();
  const el   = document.getElementById('rimaNavComment');
  if(!el) return;

  el.style.transition = 'none';
  el.style.opacity    = '0';
  el.style.transform  = 'translateX(14px)';
  el.innerHTML        = '';
  el.scrollTop        = 0;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.style.transition = 'opacity 0.35s, transform 0.35s';
    el.style.opacity    = '1';
    el.style.transform  = 'translateX(0)';
  }));

  const charDelay     = Math.min(100, Math.max(40, 2500 / text.length));
  const totalTypingMs = text.length * charDelay;
  const pauseMs       = Math.max(600, SLIDE_MS - totalTypingMs - 650);
  let i = 0;

  function typeNext() {
    if(i >= text.length) {
      _rimaCycleTimer = setTimeout(() => {
        const rima = document.getElementById('rimaWrap');
        if(rima) { rima.style.animation='none'; void rima.offsetWidth; rima.style.animation='rimaSpin 0.45s ease-in-out'; }
        el.style.transition = 'opacity 0.3s, transform 0.3s';
        el.style.opacity    = '0';
        el.style.transform  = 'translateX(-14px)';
        setTimeout(() => {
          if(rima) rima.style.animation = 'none';
          advanceSlide();
          showNextRimaComment();
        }, 450);
      }, pauseMs);
      return;
    }
    const ch = text[i++];
    if(ch === '\n') {
      el.innerHTML += '<br>';
    } else {
      el.innerHTML += ch==='&'?'&amp;':ch==='<'?'&lt;':ch==='>'?'&gt;':ch;
    }
    el.scrollTop = Math.max(0, el.scrollHeight - el.clientHeight * 0.6);
    const rima = document.getElementById('rimaWrap');
    if(rima) { rima.style.animation='none'; void rima.offsetWidth; rima.style.animation='rimaKatakata 0.12s ease-in-out'; }
    _rimaTypeTimer = setTimeout(typeNext, charDelay);
  }

  setTimeout(typeNext, 400);
}

function updateRimaNav() { /* ローテーションに統合済み */ }

// === RIMA COMMENT (後方互換) ===
function rimaComment(count) { return rimaCommentText(count); }

// === RENDER HOME ===
function renderHome() {
  const all  = getAll();
  const showDone = document.getElementById('showCompleted').checked;
  const act  = all.filter(r=>!r.completed);
  const done = all.filter(r=>r.completed);
  const sortBy = arr => [...arr].sort((a,b)=>daysUntil(a.deadline)-daysUntil(b.deadline));
  const overdue  = sortBy(act.filter(r=>daysUntil(r.deadline)<0));
  const today    = sortBy(act.filter(r=>daysUntil(r.deadline)===0));
  const in3      = sortBy(act.filter(r=>{ const d=daysUntil(r.deadline); return d>0&&d<=3; }));
  const thisWeek = sortBy(act.filter(r=>{ const d=daysUntil(r.deadline); return d>3&&d<=7; }));
  const later    = sortBy(act.filter(r=>daysUntil(r.deadline)>7));

  // urgent badge
  const uc=overdue.length+today.length+in3.length;
  const badge=document.getElementById('urgentBadge');
  if(uc>0){ badge.textContent=`${uc}件`; badge.classList.add('show'); document.getElementById('homeDot').classList.add('show'); }
  else    { badge.classList.remove('show'); document.getElementById('homeDot').classList.remove('show'); }

  // notif banner
  document.getElementById('notifBanner').style.display =
    ('Notification' in window && Notification.permission==='default') ? 'flex' : 'none';

  updateRimaNav();

  let html = '';
  if(overdue.length)  html+=sec('期限超過',overdue);
  if(today.length)    html+=sec('今日が期限',today);
  else if(!overdue.length) {
    html+=`<div class="section-hd">今日の期限</div>
           <div class="rcard" style="border-left-color:var(--success);text-align:center;color:var(--text-faint);font-size:13px;font-weight:600;padding:18px 14px;">今日の期限はありません ✓</div>`;
  }
  if(in3.length)      html+=sec('3日以内', in3);
  if(thisWeek.length) html+=sec('今週中', thisWeek);
  if(later.length)    html+=sec('それ以降', later);

  if(showDone&&done.length) html+=sec(`完了済み（${done.length}件）`,done);
  document.getElementById('homeContent').innerHTML=html;
}

function sec(label,items) {
  return `<div class="section-hd">${escH(label)}</div>`+items.map(cardHTML).join('');
}

function cardHTML(r) {
  const n=daysUntil(r.deadline);
  const uc=r.completed?'done':urgClass(n,r.advance_days||3);
  const catLabel={excel:'Excel',obsidian:'Obsidian',claude:'Claude',manual:'手動'}[r.category]||'手動';
  const notesHtml=r.notes?`<div class="rnotes">${escH(r.notes)}</div>`:'';
  const actions=r.completed
    ?`<div class="ractions"><button class="ract del-btn" onclick="doDelete('${r.id}')">削除</button></div>`
    :`<div class="ractions">
        <button class="ract done-btn" onclick="doDone('${r.id}')">完了</button>
        <button class="ract del-btn"  onclick="doDelete('${r.id}')">削除</button>
      </div>`;
  return `<div class="rcard ${uc}">
    <div class="rtitle">${escH(r.title)}</div>
    <div class="rmeta">
      <span class="badge badge-${r.category||'manual'}">${catLabel}</span>
      <span class="dchip ${chipCls(n)}">${fmtDate(r.deadline)} · ${daysLabel(n)}</span>
    </div>
    ${notesHtml}
    ${actions}
  </div>`;
}

const escH=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// === NAV ===
function switchTab(name,btn) {
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  btn.classList.add('active');
  if(name==='home')     renderHome();
  if(name==='settings') updateNotifStatus();
  if(name==='schedule') renderSchedule();
  if(name==='calendar') renderCalendar();
  if(name==='gantt')    renderGantt();
  if(name==='calc')     calcDisplay();

  updateRimaNav();
  window.scrollTo(0,0);
}

// === SCHEDULE ===
let _excelSchedule = null;
let _schSyncedAt   = null;

function renderSchedule() {
  const grid  = document.getElementById('scheduleGrid');
  const syncd = document.getElementById('schSynced');
  if (!_excelSchedule) {
    grid.innerHTML = '<div class="sch-empty-msg">同期中...</div>';
    return;
  }
  const ac = _excelSchedule.ac_side || [];
  const ad = _excelSchedule.ad_side || [];

  // 日付でグルーピング
  const dateMap = {};
  ac.forEach(item => {
    if (!dateMap[item.date]) dateMap[item.date] = { ac: [], ad: [] };
    dateMap[item.date].ac.push(item);
  });
  ad.forEach(item => {
    if (!dateMap[item.date]) dateMap[item.date] = { ac: [], ad: [] };
    dateMap[item.date].ad.push(item);
  });
  const dates = Object.keys(dateMap).sort();

  if (dates.length === 0) {
    grid.innerHTML = '<div class="sch-empty-msg">7日以内の日程はありません</div>';
  } else {
    let html = '';
    dates.forEach(date => {
      const { ac: acItems, ad: adItems } = dateMap[date];
      const hasAc = acItems.length > 0;
      const hasAd = adItems.length > 0;
      const dotColor = (hasAc && hasAd) ? 'var(--warning)'
                     : hasAc ? 'var(--warning)'
                     : 'var(--success)';
      html += `<div class="sch-day-card">
        <div class="sch-day-hd">
          <span class="sch-day-hd-dot" style="background:${dotColor}"></span>
          ${fmtDateStr(date)}
        </div>`;
      acItems.forEach(item => {
        html += `<div class="sch-row">
          <span class="sch-tag sch-tag-ac">引取</span>
          <div class="sch-row-body">
            <div class="sch-row-main">${escH(item.ag)}</div>
          </div>
        </div>`;
      });
      adItems.forEach(item => {
        const sub = [item.s, item.u].filter(Boolean).join(' · ');
        html += `<div class="sch-row">
          <span class="sch-tag sch-tag-ad">納品</span>
          <div class="sch-row-body">
            <div class="sch-row-main">${escH(item.d||'')}</div>
            ${sub ? `<div class="sch-row-sub">${escH(sub)}</div>` : ''}
          </div>
        </div>`;
      });
      html += '</div>';
    });
    grid.innerHTML = html;
  }

  if (_schSyncedAt) {
    const d = new Date(_schSyncedAt);
    syncd.textContent = `最終同期: ${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
}

function fmtDateStr(s) {
  if (!s) return '';
  const d = new Date(s + 'T00:00:00');
  return `${d.getMonth()+1}/${d.getDate()}(${'日月火水木金土'[d.getDay()]})`;
}

// === ACTIONS ===
const doDone  = id => { markDone(id);  renderHome(); showToast('完了しました'); };
function doDelete(id) {
  if(!confirm('このリマインドを削除しますか？')) return;
  deleteOne(id); renderHome(); showToast('削除しました');
}

// === ADD FORM ===
document.getElementById('addForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const reminder = addReminder({
    title:        document.getElementById('titleInput').value.trim(),
    deadline:     document.getElementById('deadlineInput').value,
    category:     document.getElementById('categoryInput').value,
    advance_days: parseInt(document.getElementById('advanceDaysInput').value,10),
    notes:        document.getElementById('notesInput').value.trim(),
  });
  e.target.reset();
  document.getElementById('deadlineInput').value=todayStr();
  showToast('追加しました');
  setTimeout(()=>document.getElementById('nav-home').click(),400);
  pushToMailbox(reminder); // 投函箱に非同期送信（失敗してもローカル保存は済み）
});

// === IMPORT ===
function importFromJSON() {
  const raw=document.getElementById('importJson').value.trim();
  if(!raw){ showToast('JSONを貼り付けてください'); return; }
  let data; try{ data=JSON.parse(raw); }catch{ showToast('JSONの形式が違います'); return; }
  const list=Array.isArray(data)?data:(data.reminders||[]);
  if(!list.length){ showToast('リマインドが見つかりませんでした'); return; }
  const keys=new Set(getAll().map(r=>r.title+'|'+r.deadline));
  let added=0;
  list.forEach(item=>{
    if(!item.title||!item.deadline) return;
    const k=item.title+'|'+item.deadline;
    if(keys.has(k)) return;
    addReminder({title:item.title,deadline:item.deadline,category:item.category||'claude',
                 advance_days:item.advance_days||3,notes:item.notes||''});
    keys.add(k); added++;
  });
  document.getElementById('importJson').value='';
  showToast(added>0?`${added}件取り込みました`:'新しいリマインドはありませんでした');
  if(added>0) setTimeout(()=>document.getElementById('nav-home').click(),600);
}

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

async function syncFromGist(manual=false) {
  try {
    const res = await fetch(GIST_RAW_URL + '?t=' + Date.now());
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    if (data.excel_schedule) {
      _excelSchedule = data.excel_schedule;
      _schSyncedAt   = data.synced_at || null;
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

// === CALENDAR ===
const JP_HOLIDAYS = {
  '2025-01-01':'元日','2025-01-13':'成人の日','2025-02-11':'建国記念日',
  '2025-02-23':'天皇誕生日','2025-02-24':'振替休日','2025-03-20':'春分の日',
  '2025-04-29':'昭和の日','2025-05-03':'憲法記念日','2025-05-04':'みどりの日',
  '2025-05-05':'こどもの日','2025-05-06':'振替休日','2025-07-21':'海の日',
  '2025-08-11':'山の日','2025-09-15':'敬老の日','2025-09-23':'秋分の日',
  '2025-10-13':'スポーツの日','2025-11-03':'文化の日','2025-11-23':'勤労感謝の日',
  '2025-11-24':'振替休日',
  '2026-01-01':'元日','2026-01-12':'成人の日','2026-02-11':'建国記念日',
  '2026-02-23':'天皇誕生日','2026-03-20':'春分の日','2026-04-29':'昭和の日',
  '2026-05-03':'憲法記念日','2026-05-04':'みどりの日','2026-05-05':'こどもの日',
  '2026-05-06':'振替休日','2026-07-20':'海の日','2026-08-11':'山の日',
  '2026-09-21':'敬老の日','2026-09-23':'秋分の日','2026-10-12':'スポーツの日',
  '2026-11-03':'文化の日','2026-11-23':'勤労感謝の日',
};

let _calYear  = new Date().getFullYear();
let _calMonth = new Date().getMonth();
let _calSelected = null;

function calPrev() { _calMonth--; if(_calMonth<0){_calMonth=11;_calYear--;} renderCalendar(); }
function calNext() { _calMonth++; if(_calMonth>11){_calMonth=0;_calYear++;} renderCalendar(); }

function renderCalendar() {
  const label = document.getElementById('calMonthLabel');
  label.textContent = `${_calYear}年${_calMonth+1}月`;

  const reminders   = getAll().filter(r => !r.completed && r.deadline);
  const acItems     = (_excelSchedule&&_excelSchedule.ac_side)||[];
  const adItems     = (_excelSchedule&&_excelSchedule.ad_side)||[];
  const todayISO    = todayStr();

  // 月の最初・最後
  const firstDay = new Date(_calYear, _calMonth, 1).getDay();
  const lastDate  = new Date(_calYear, _calMonth+1, 0).getDate();

  const DOW = ['日','月','火','水','木','金','土'];
  let html = DOW.map((d,i) => `<div class="cal-dow">${d}</div>`).join('');

  // 前月の空白
  for(let i=0;i<firstDay;i++) {
    const d = new Date(_calYear, _calMonth, -firstDay+i+1);
    html += calCell(d, true, todayISO, reminders, acItems, adItems);
  }
  // 当月
  for(let d=1;d<=lastDate;d++) {
    const dt = new Date(_calYear, _calMonth, d);
    html += calCell(dt, false, todayISO, reminders, acItems, adItems);
  }
  // 後月の空白（6行目を埋める）
  const total = firstDay + lastDate;
  const remainder = total % 7 === 0 ? 0 : 7 - (total % 7);
  for(let i=1;i<=remainder;i++) {
    const dt = new Date(_calYear, _calMonth+1, i);
    html += calCell(dt, true, todayISO, reminders, acItems, adItems);
  }

  document.getElementById('calGrid').innerHTML = html;
  if(_calSelected) renderCalDetail(_calSelected, reminders, acItems, adItems);
  else document.getElementById('calDetail').innerHTML = '';
}

function isoOf(dt) {
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}

function calCell(dt, otherMonth, todayISO, reminders, acItems, adItems) {
  const iso  = isoOf(dt);
  const dow  = dt.getDay();
  const isToday = iso === todayISO;
  const isSel   = iso === _calSelected;
  const hol     = JP_HOLIDAYS[iso];

  const hasRemUrgent = reminders.some(r => r.deadline===iso && daysUntil(r.deadline)<=2);
  const hasRemSoon   = reminders.some(r => r.deadline===iso && daysUntil(r.deadline)>2 && daysUntil(r.deadline)<=7);
  const hasRemLater  = reminders.some(r => r.deadline===iso && daysUntil(r.deadline)>7);
  const hasAc        = acItems.some(i => i.date===iso);
  const hasAd        = adItems.some(i => i.date===iso);

  let dots = '';
  if(hasRemUrgent) dots += '<span class="cal-dot cal-dot-r"></span>';
  if(hasRemSoon)   dots += '<span class="cal-dot cal-dot-s"></span>';
  if(hasRemLater)  dots += '<span class="cal-dot cal-dot-ok"></span>';
  if(hasAc)        dots += '<span class="cal-dot cal-dot-ac"></span>';
  if(hasAd)        dots += '<span class="cal-dot cal-dot-ad"></span>';
  if(hol)          dots += '<span class="cal-dot cal-dot-h"></span>';

  const numCls = hol||dow===0 ? 'cal-num hol' : dow===6 ? 'cal-num sat' : 'cal-num';
  const cellCls = ['cal-cell', otherMonth?'other-month':'', isToday?'today':'', isSel?'selected':''].filter(Boolean).join(' ');

  return `<div class="${cellCls}" onclick="calSelectDate('${iso}')">
    <span class="${numCls}">${dt.getDate()}</span>
    <div class="cal-dots">${dots}</div>
  </div>`;
}

function calSelectDate(iso) {
  _calSelected = _calSelected===iso ? null : iso;
  const reminders = getAll().filter(r => !r.completed && r.deadline);
  const acItems   = (_excelSchedule&&_excelSchedule.ac_side)||[];
  const adItems   = (_excelSchedule&&_excelSchedule.ad_side)||[];
  document.querySelectorAll('.cal-cell').forEach(el => el.classList.remove('selected'));
  if(_calSelected) {
    document.querySelectorAll('.cal-cell').forEach(el => {
      if(el.getAttribute('onclick')===`calSelectDate('${iso}')`) el.classList.add('selected');
    });
    renderCalDetail(iso, reminders, acItems, adItems);
  } else {
    document.getElementById('calDetail').innerHTML = '';
  }
}

function renderCalDetail(iso, reminders, acItems, adItems) {
  const dt  = new Date(iso+'T00:00:00');
  const hol = JP_HOLIDAYS[iso];
  const dayRems = reminders.filter(r => r.deadline===iso);
  const dayAc   = acItems.filter(i => i.date===iso);
  const dayAd   = adItems.filter(i => i.date===iso);
  const total   = dayRems.length + dayAc.length + dayAd.length + (hol?1:0);

  let html = `<div class="cal-detail">
    <div class="cal-detail-hd">${fmtDateStr(iso)}${hol ? `　<span style="font-size:11px;color:var(--purple);">🟣 ${hol}</span>` : ''}</div>`;

  if(total===0) {
    html += '<div class="cal-detail-empty">この日の予定はありません</div>';
  } else {
    if(hol) html += `<div class="cal-detail-row"><span class="cal-detail-tag" style="background:var(--purple-dim);color:#A78BFA;">祝日</span><span style="color:var(--text);">${hol}</span></div>`;
    dayAc.forEach(i => {
      html += `<div class="cal-detail-row"><span class="cal-detail-tag" style="background:var(--warning-dim);color:#FBB040;">引取</span><span style="color:var(--text);">${escH(i.ag||'')}</span></div>`;
    });
    dayAd.forEach(i => {
      html += `<div class="cal-detail-row"><span class="cal-detail-tag" style="background:var(--success-dim);color:#4ADE80;">納品</span><div><div style="color:var(--text);">${escH(i.d||'')}</div>${i.s||i.u?`<div style="font-size:11px;color:var(--text-sub);">${escH([i.s,i.u].filter(Boolean).join(' · '))}</div>`:''}  </div></div>`;
    });
    dayRems.forEach(r => {
      const n = daysUntil(r.deadline);
      const tagColor = n<0 ? 'background:var(--purple-dim);color:#A78BFA;'
                     : n<=2 ? 'background:var(--danger-dim);color:#F87171;'
                     : n<=7 ? 'background:var(--warning-dim);color:#FBB040;'
                     : 'background:var(--surface-2);color:var(--text-sub);';
      html += `<div class="cal-detail-row"><span class="cal-detail-tag" style="${tagColor}">期限</span><div><div style="color:var(--text);">${escH(r.title)}</div>${r.notes?`<div style="font-size:11px;color:var(--text-sub);">${escH(r.notes)}</div>`:''}</div></div>`;
    });
  }

  html += '</div>';
  document.getElementById('calDetail').innerHTML = html;
}

// === GANTT ===
function abbrevName(n) {
  if (/^採光ルーバー/.test(n)) return 'ルーバーB';
  if (/^灯具/.test(n)) { const m = n.match(/L=[\d.]+/); return '灯具' + (m ? ' ' + m[0] : ''); }
  if (/^8FL/.test(n))  { const m = n.match(/L=[\d.]+/); return '8FL' + (m ? ' ' + m[0] : ''); }
  return n;
}

function renderGantt() {
  const SC = 9;
  const LW = 94;

  const d2h = {
    '2026-05-11':-40,'2026-05-12':-32,'2026-05-13':-24,'2026-05-14':-16,
    '2026-05-16':0,  '2026-05-18':8,  '2026-05-19':16, '2026-05-20':24,
    '2026-05-21':32, '2026-05-22':40, '2026-05-25':48, '2026-05-26':56,
    '2026-05-27':64, '2026-05-28':72, '2026-05-29':80,
    '2026-06-01':88, '2026-06-02':96, '2026-06-03':104,'2026-06-04':112,
    '2026-06-05':120,'2026-06-08':128,'2026-06-09':136,'2026-06-10':144,
    '2026-06-11':152,'2026-06-12':160,'2026-06-15':168,'2026-06-16':176,
    '2026-06-17':184,'2026-06-18':192,'2026-06-19':200,
    '2026-06-22':208,'2026-06-23':216,'2026-07-02':272
  };

  const TODAY_ISO = new Date().toISOString().split('T')[0];
  const TODAY_H = (function() {
    if (d2h[TODAY_ISO] !== undefined) return d2h[TODAY_ISO];
    const keys = Object.keys(d2h).sort();
    let prev = null, next = null;
    for (const k of keys) { if (k <= TODAY_ISO) prev = k; else if (!next) next = k; }
    if (!prev) return d2h[keys[0]];
    if (!next)  return d2h[keys[keys.length-1]];
    const frac = (new Date(TODAY_ISO)-new Date(prev))/(new Date(next)-new Date(prev));
    return d2h[prev] + Math.round(frac*(d2h[next]-d2h[prev]));
  })();

  const D = [
    {n:"採光ルーバーパネルB　L=1996",b:"LED",s:"2026-05-13",e:"2026-05-19",k:"2026-05-19",aa:0,ab:4},
    {n:"8FL281304 6110　L=1478",b:"LED",s:"2026-05-11",e:"2026-05-19",k:"2026-05-21",aa:4,ab:4},
    {n:"採光ルーバーパネルB　L=1996",b:"LED",s:"2026-05-14",e:"2026-05-20",k:"2026-05-20",aa:4,ab:20},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-05-11",e:"2026-05-22",k:"2026-05-21",aa:20,ab:24},
    {n:"8FL281304 8310　L=748",b:"LED",s:"2026-05-11",e:"2026-05-22",k:"2026-05-21",aa:24,ab:28},
    {n:"灯具カバーPC IN 2130　L=908",b:"灯具",s:"2026-05-20",e:"2026-05-22",k:"2026-05-22",aa:28,ab:32},
    {n:"灯具カバーPC IN 2090　L=840",b:"灯具",s:"2026-05-20",e:"2026-05-22",k:"2026-06-15",aa:32,ab:36},
    {n:"灯具カバーPC IN 2090　L=840",b:"灯具",s:"2026-05-20",e:"2026-05-26",k:"2026-05-26",aa:36,ab:40},
    {n:"灯具カバーPC IN 2050　L=1183.5",b:"灯具",s:"2026-05-20",e:"2026-05-26",k:"2026-05-28",aa:40,ab:48},
    {n:"灯具カバーPC IN 2110　L=1815",b:"灯具",s:"2026-05-22",e:"2026-05-29",k:"2026-06-04",aa:48,ab:56},
    {n:"灯具カバーPC IN 2070　L=1966",b:"灯具",s:"2026-05-22",e:"2026-05-29",k:"2026-06-05",aa:56,ab:64},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-05-26",e:"2026-06-01",k:"2026-05-28",aa:64,ab:76},
    {n:"8FL281304 4910　L=592",b:"LED",s:"2026-05-26",e:"2026-06-01",k:"2026-05-29",aa:76,ab:76},
    {n:"8FL281304 4910　L=592",b:"LED",s:"2026-05-26",e:"2026-06-01",k:"2026-05-29",aa:76,ab:80},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-05-22",e:"2026-06-03",k:"2026-06-04",aa:80,ab:92},
    {n:"採光ルーバーパネルB　L=1996",b:"LED",s:"2026-05-27",e:"2026-06-04",k:"2026-06-08",aa:92,ab:96},
    {n:"8FL281304 6110　L=1478",b:"LED",s:"2026-05-22",e:"2026-06-05",k:"2026-06-08",aa:96,ab:100},
    {n:"8FL281304 6110　L=1478",b:"LED",s:"2026-05-22",e:"2026-06-05",k:"2026-06-08",aa:100,ab:100},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-05-26",e:"2026-06-05",k:"2026-06-08",aa:100,ab:100},
    {n:"8FL281304 8310　L=748",b:"LED",s:"2026-05-26",e:"2026-06-05",k:"2026-06-08",aa:100,ab:104},
    {n:"灯具カバーPC IN 2130　L=908",b:"灯具",s:"2026-06-01",e:"2026-06-08",k:"2026-06-12",aa:104,ab:108},
    {n:"灯具カバーPC IN 2050　L=1183.5",b:"灯具",s:"2026-06-01",e:"2026-06-08",k:"2026-06-12",aa:108,ab:116},
    {n:"灯具カバーPC IN 2080　L=1540",b:"灯具",s:"2026-06-03",e:"2026-06-08",k:"2026-06-15",aa:116,ab:120},
    {n:"灯具カバーPC IN 2100　L=1923",b:"灯具",s:"2026-06-03",e:"2026-06-09",k:"2026-06-15",aa:120,ab:124},
    {n:"灯具カバーPC IN 2110　L=1815",b:"灯具",s:"2026-06-03",e:"2026-06-09",k:"2026-06-17",aa:124,ab:132},
    {n:"8FL281304 6110　L=1478",b:"LED",s:"2026-06-05",e:"2026-06-12",k:"2026-06-11",aa:132,ab:136},
    {n:"8FL281304 6110　L=1478",b:"LED",s:"2026-06-05",e:"2026-06-12",k:"2026-06-11",aa:136,ab:136},
    {n:"8FL281304 6110　L=1478",b:"LED",s:"2026-06-05",e:"2026-06-12",k:"2026-06-11",aa:136,ab:136},
    {n:"8FL281304 4910　L=592",b:"LED",s:"2026-06-05",e:"2026-06-12",k:"2026-06-11",aa:136,ab:140},
    {n:"8FL281304 4910　L=592",b:"LED",s:"2026-06-05",e:"2026-06-12",k:"2026-06-11",aa:140,ab:140},
    {n:"8FL281304 4810　L=297",b:"LED",s:"2026-06-05",e:"2026-06-12",k:"2026-06-11",aa:140,ab:140},
    {n:"8FL281304 4810　L=297",b:"LED",s:"2026-06-05",e:"2026-06-12",k:"2026-06-11",aa:140,ab:140},
    {n:"8FL281304 4810　L=297",b:"LED",s:"2026-06-05",e:"2026-06-12",k:"2026-06-11",aa:140,ab:144},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-06-05",e:"2026-06-12",k:"2026-06-11",aa:144,ab:144},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-06-05",e:"2026-06-12",k:"2026-06-11",aa:144,ab:148},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-06-05",e:"2026-06-12",k:"2026-06-11",aa:148,ab:148},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-06-08",e:"2026-06-16",k:"2026-06-12",aa:148,ab:156},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-06-08",e:"2026-06-16",k:"2026-06-12",aa:156,ab:168},
    {n:"8FL281304 4810　L=297",b:"LED",s:"2026-06-08",e:"2026-06-17",k:"2026-06-17",aa:168,ab:168},
    {n:"8FL281304 6110　L=1478",b:"LED",s:"2026-06-08",e:"2026-06-17",k:"2026-06-23",aa:168,ab:172},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-06-10",e:"2026-06-17",k:"2026-06-23",aa:172,ab:176},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-06-10",e:"2026-06-19",k:"2026-06-23",aa:176,ab:188},
    {n:"8FL281304 8310　L=748",b:"LED",s:"2026-06-10",e:"2026-06-19",k:"2026-06-23",aa:188,ab:192},
    {n:"752GPSB　865",b:"樹脂",s:null,e:"2026-06-23",k:"2026-07-02",aa:192,ab:192},
    {n:"752GPSB　715",b:"樹脂",s:null,e:"2026-06-23",k:"2026-07-02",aa:192,ab:196},
    {n:"752GPSB　665",b:"樹脂",s:null,e:"2026-06-23",k:"2026-07-02",aa:196,ab:196},
    {n:"752GPSB　565",b:"樹脂",s:null,e:"2026-06-23",k:"2026-07-02",aa:196,ab:200},
    {n:"752GPSB　415",b:"樹脂",s:null,e:"2026-06-23",k:"2026-07-02",aa:200,ab:204},
    {n:"752GPSB　265",b:"樹脂",s:null,e:"2026-06-23",k:"2026-07-02",aa:204,ab:208},
  ];

  const h2px = h => Math.round(h * SC);
  const halfDayPx    = h2px(4); // 1日の前半・後半の境界（4h = 1マス分）

  function d2px(iso) {
    if (!iso) return null;
    if (d2h[iso] !== undefined) return h2px(d2h[iso]);
    const keys = Object.keys(d2h).sort();
    let prev = null, next = null;
    for (const k of keys) { if (k <= iso) prev = k; else if (!next) next = k; }
    if (!prev) return 0;
    if (!next)  return h2px(d2h[keys[keys.length-1]]);
    const frac = (new Date(iso)-new Date(prev))/(new Date(next)-new Date(prev));
    return Math.round((d2h[prev]+frac*(d2h[next]-d2h[prev]))*SC);
  }

  const maxH   = Math.max(...D.map(r=>r.ab), TODAY_H+24);
  const TL     = Math.max(maxH*SC+48, 620);
  const todayX = h2px(TODAY_H);
  const stickyLbl = `flex:0 0 ${LW}px;position:sticky;left:0;z-index:8;border-right:1px solid var(--border);`;

  const d2hSorted = Object.entries(d2h).filter(([,v])=>v>=0).sort((a,b)=>a[1]-b[1]);
  let dayGridLines = '', axTicks = '';
  d2hSorted.forEach(([iso, h]) => {
    const x  = h2px(h);
    const dt = new Date(iso+'T00:00:00');
    const isMon = dt.getDay()===1, isMth = dt.getDate()===1;
    // 日境界線：月初は青2px・月曜は白45%・通常は白22%・半日線は白7%
    const lineColor = isMth ? '#6B9FD4' : (isMon ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.22)');
    const lineW     = isMth ? '2' : '1';
    dayGridLines += `<div style="position:absolute;top:0;bottom:0;left:${x}px;width:${lineW}px;background:${lineColor};opacity:1;z-index:1;pointer-events:none;"></div>`;
    // 1日2マス：中間グリッド線（半日）
    dayGridLines += `<div style="position:absolute;top:0;bottom:0;left:${x + halfDayPx}px;width:1px;background:rgba(255,255,255,0.07);opacity:1;z-index:1;pointer-events:none;"></div>`;
    const lbl = isMth ? `${dt.getMonth()+1}/1` : String(dt.getDate());
    axTicks += `<span style="position:absolute;font-size:11px;color:#fff;top:3px;left:${x+2}px;white-space:nowrap;">${lbl}</span>`;
  });

  const todayLine = `<div style="position:absolute;top:0;bottom:0;left:${todayX}px;width:2px;background:#E24B4A;z-index:5;pointer-events:none;"></div>`;
  let html = `<div style="position:relative;display:inline-block;min-width:${LW+TL}px;width:100%;">`;

  html += `<div style="display:flex;height:22px;position:sticky;top:0;z-index:10;border-bottom:1px solid var(--border);">
    <div style="${stickyLbl}background:var(--surface-2);height:22px;z-index:11;"></div>
    <div style="position:relative;flex:1;height:22px;background:var(--surface-2);overflow:hidden;">${dayGridLines}${todayLine}${axTicks}</div>
  </div>`;

  html += `<div style="display:flex;height:22px;position:sticky;top:22px;z-index:9;border-bottom:1px solid var(--border);">
    <div style="${stickyLbl}background:var(--bg-2);height:22px;z-index:10;display:flex;align-items:center;font-size:10px;font-weight:700;color:var(--text-faint);padding:0 5px;">完了済 22件</div>
    <div style="position:relative;flex:1;height:22px;background:var(--bg-2);overflow:hidden;">${dayGridLines}${todayLine}</div>
  </div>`;

  D.forEach(row => {
    const barColor = row.b==='灯具' ? '#85B7EB' : '#C8C8C8';
    const barX = h2px(row.aa);
    const barW = row.ab>row.aa ? Math.max(h2px(row.ab-row.aa),2) : 0;
    const kX = d2px(row.k);
    const sX = row.s ? Math.max(0, d2px(row.s)) : null;
    const eX = d2px(row.e);

    let bar = dayGridLines + todayLine;
    if (barW>0) bar += `<div style="position:absolute;top:6px;height:15px;left:${barX}px;width:${barW}px;border-radius:3px;background:${barColor};z-index:2;"></div>`;
    else if (row.aa>0) bar += `<div style="position:absolute;top:9px;height:9px;left:${barX}px;width:3px;border-radius:2px;background:${barColor};opacity:0.6;z-index:2;"></div>`;
    // 期日と納品日の重複チェック
    const kOverlapsE = row.k && row.e && row.k === row.e;
    // 納品日（e）: 2マス目を緑ブロックで塗る
    if (eX !== null) {
      if (kOverlapsE) {
        // 期日と重複: 左半分=緑・右半分=赤、外枠付き
        bar += `<div style="position:absolute;top:0;bottom:0;left:${eX + halfDayPx}px;width:${halfDayPx}px;z-index:4;border:1.5px solid rgba(255,255,255,0.28);border-radius:2px;box-sizing:border-box;overflow:hidden;"><div style="position:absolute;top:0;bottom:0;left:0;width:50%;background:rgba(74,222,128,0.78);"></div><div style="position:absolute;top:0;bottom:0;right:0;width:50%;background:rgba(180,50,50,0.78);"></div></div>`;
      } else {
        bar += `<div style="position:absolute;top:0;bottom:0;left:${eX + halfDayPx}px;width:${halfDayPx}px;background:rgba(74,222,128,0.75);z-index:4;border-radius:2px;border:1px solid rgba(255,255,255,0.18);"></div>`;
      }
    }
    // 支給日（s）: 2マス目を黄ブロックで塗る
    if (sX !== null) {
      bar += `<div style="position:absolute;top:0;bottom:0;left:${sX + halfDayPx}px;width:${halfDayPx}px;background:rgba(244,196,48,0.75);z-index:4;border-radius:2px;border:1px solid rgba(255,255,255,0.18);"></div>`;
    }
    // 期日（k）: 2マス目を赤ブロックで塗る（納品日と重複の場合は上で処理済み）
    if (kX !== null && !kOverlapsE) {
      bar += `<div style="position:absolute;top:0;bottom:0;left:${kX + halfDayPx}px;width:${halfDayPx}px;background:rgba(180,50,50,0.75);z-index:4;border-radius:2px;border:1px solid rgba(255,255,255,0.18);"></div>`;
    }

    html += `<div style="display:flex;height:28px;border-bottom:1px solid var(--border);">
      <div style="${stickyLbl}background:var(--surface);height:28px;font-size:10px;color:var(--text-sub);padding:0 4px;display:flex;align-items:center;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;border-bottom:1px solid var(--border);">${escH(abbrevName(row.n))}</div>
      <div style="position:relative;flex:1;height:28px;overflow:hidden;">${bar}</div>
    </div>`;
  });

  html += '</div>';
  document.getElementById('ganttInner').innerHTML = html;
  const outer = document.getElementById('ganttOuter');
  outer.scrollLeft = Math.max(0, todayX - 60);
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

// === CALCULATOR ===
let _calcVal     = '0';
let _calcPrev    = null;
let _calcOp      = null;
let _calcNew     = false;
let _calcTouched = false;   // 数字キーを1回以上押したか
let _calcHistory = [];

function calcFmt(v) {
  const n = parseFloat(v);
  if (isNaN(n)) return '0';
  const neg = n < 0;
  const abs = Math.abs(n).toString();
  const parts = abs.split('.');
  parts[0] = parseInt(parts[0],10).toLocaleString('ja-JP');
  return (neg?'-':'') + parts.join('.');
}

function calcDisplay() {
  const main = document.getElementById('calcMain');
  const sub  = document.getElementById('calcSub');
  if (!main) return;
  main.textContent = calcFmt(_calcVal);
  sub.textContent  = (_calcPrev!==null && _calcOp)
    ? calcFmt(String(_calcPrev)) + ' ' + _calcOp : '';
  const v = parseFloat(_calcVal);
  const e1 = document.getElementById('convKgfNm');
  const e2 = document.getElementById('convNmKgf');
  if (e1 && e2) {
    const e3 = document.getElementById('convTg');
    const e4 = document.getElementById('convSrb');
    const e5 = document.getElementById('convSra');
    if (!isNaN(v) && _calcVal !== '0') {
      const kgfNm = Math.round(v * 9.80665 * 100) / 100;
      const nmKgf = Math.round(v / 9.80665 * 100) / 100;
      const tgPcs = v * 16;
      const tgBox = Math.round(v / 16 * 100) / 100;
      e1.innerHTML = `<div class="calc-conv-input">${calcFmt(_calcVal)}kgf</div><div class="calc-conv-result">┗${calcFmt(String(kgfNm))}N·m</div>`;
      e2.innerHTML = `<div class="calc-conv-input">${calcFmt(_calcVal)}N·m</div><div class="calc-conv-result">┗${calcFmt(String(nmKgf))}kgf</div>`;
      const srbPcs = v * 42;
      const srbBox = Math.round(v / 42 * 100) / 100;
      if(e3) e3.innerHTML = `<div class="calc-conv-tg">灯具\n${calcFmt(_calcVal)}箱（${calcFmt(String(tgPcs))}本）\n${calcFmt(_calcVal)}本（${tgBox}箱）</div>`;
      const sraPcs = v * 56;
      const sraBox = Math.round(v / 56 * 100) / 100;
      if(e4) e4.innerHTML = `<div class="calc-conv-tg">採光ルーバーB\n${calcFmt(_calcVal)}箱（${calcFmt(String(srbPcs))}本）\n${calcFmt(_calcVal)}本（${srbBox}箱）</div>`;
      if(e5) e5.innerHTML = `<div class="calc-conv-tg">採光ルーバーA\n${calcFmt(_calcVal)}箱（${calcFmt(String(sraPcs))}本）\n${calcFmt(_calcVal)}本（${sraBox}箱）</div>`;
    } else {
      e1.textContent = '—';
      e2.textContent = '—';
      if(e3) e3.textContent = '—';
      if(e4) e4.textContent = '—';
      if(e5) e5.textContent = '—';
    }
  }
}

function calcHistoryRender(scroll) {
  const el = document.getElementById('calcHistoryList');
  if (!el) return;
  if (_calcHistory.length === 0) {
    el.innerHTML = '<div class="calc-history-empty">まだ計算してへん</div>';
    return;
  }
  el.innerHTML = _calcHistory.map((h,i) =>
    `<div class="calc-history-item" onclick="calcHistoryTap(${i})">
      <div class="calc-history-expr">${h.expr}</div>
      <div class="calc-history-result">${calcFmt(h.result)}</div>
    </div>`
  ).join('');
  if (scroll) el.scrollTop = el.scrollHeight;
}

function calcHistoryTap(i) {
  _calcVal = String(_calcHistory[i].result);
  _calcNew = true;
  calcDisplay();
}

function calcNum(n) {
  if (_calcNew) { _calcVal = n==='.'?'0':''; _calcNew=false; }
  if (n==='.' && _calcVal.includes('.')) return;
  if (n==='.' && !_calcVal) _calcVal='0';
  if (_calcVal==='0' && n!=='.') _calcVal=n;
  else _calcVal+=n;
  _calcTouched = true;
  calcDisplay();
}

function calcFn(fn) {
  const cur = parseFloat(_calcVal)||0;
  if (fn==='C') { _calcVal='0';_calcPrev=null;_calcOp=null;_calcNew=false;_calcTouched=false; calcDisplay(); return; }
  if (fn==='+/-') { _calcVal=String(-cur); calcDisplay(); return; }
  if (fn==='⌫') {
    if (_calcVal.length > 1) { _calcVal = _calcVal.slice(0,-1); }
    else { _calcVal = '0'; _calcTouched = false; }
    calcDisplay(); return;
  }
  if (fn==='=') {
    if (_calcOp && _calcPrev!==null) {
      const r = calcApply(_calcPrev, cur, _calcOp);
      const rounded = Math.round(r*1e10)/1e10;
      _calcHistory.push({
        expr: calcFmt(String(_calcPrev)) + ' ' + _calcOp + ' ' + calcFmt(String(cur)) + ' =',
        result: rounded
      });
      if (_calcHistory.length > 30) _calcHistory.shift();
      calcHistoryRender(true);
      _calcVal  = String(rounded);
      _calcPrev = null; _calcOp = null; _calcNew = true; _calcTouched = false;
    } else if (_calcTouched) {
      _calcHistory.push({ expr: '', result: cur });
      if (_calcHistory.length > 30) _calcHistory.shift();
      calcHistoryRender(true);
      _calcNew = true; _calcTouched = false;
    }
    calcDisplay(); return;
  }
  if (_calcOp && !_calcNew) {
    const r = calcApply(_calcPrev, cur, _calcOp);
    _calcVal  = String(Math.round(r*1e10)/1e10);
    _calcPrev = parseFloat(_calcVal);
  } else { _calcPrev = cur; }
  _calcOp = fn; _calcNew = true; calcDisplay();
}

function calcApply(a, b, op) {
  if(op==='÷') return b===0?0:a/b;
  if(op==='×') return a*b;
  if(op==='−') return a-b;
  return a+b;
}

// === MEAS TABLE ===
function measCalc(ph) {
  ['r','a','b'].forEach(col => {
    const onV  = parseFloat(document.getElementById(`m${ph}_on_${col}`)?.value);
    const offV = parseFloat(document.getElementById(`m${ph}_off_${col}`)?.value);
    const d    = document.getElementById(`m${ph}_d_${col}`);
    if (!d) return;
    if (!isNaN(onV) && !isNaN(offV)) {
      const diff = Math.round((onV - offV) * 1000) / 1000;
      const diffStr = diff.toFixed(2);
      if (diff >= 1.83 && diff <= 1.97) {
        // 正常範囲
        d.innerHTML = diffStr + '<br>[正常]';
        d.style.color = 'var(--success, #4caf50)';
      } else {
        // 角数計算（目標1.90、1角=0.25、半角=0.125）
        const gap = Math.round((1.90 - diff) * 1000) / 1000;
        const dir = gap > 0 ? '緩め' : '締め';
        const absGap = Math.abs(gap);
        const full = Math.floor(Math.round(absGap / 0.125));
        const whole = Math.floor(full / 2);
        const half  = full % 2 === 1;
        let label = '';
        if (whole > 0 && half)       label = whole + '角半';
        else if (whole > 0 && !half) label = whole + '角';
        else if (half)               label = '半角';
        else                         label = '？';
        d.innerHTML = diffStr + '<br>[' + label + dir + ']';
        // 公差内（1.80~2.00）は白、公差外はオレンジ
        d.style.color = (diff >= 1.80 && diff <= 2.00) ? '#fff' : 'var(--warning, #ff9800)';
      }
    } else { d.textContent = '—'; d.style.color = ''; }
  });
}

// === CALC PAGE SWIPE ===
let _calcPgIdx = 0;
function calcPgGoto(idx) { calcPgSwitch(idx - _calcPgIdx); }
function calcPgSwitch(dir) {
  _calcPgIdx = (_calcPgIdx + dir + 3) % 3;
  ['calcPg0','calcPg1','calcPg2'].forEach((id,i) => {
    const el = document.getElementById(id);
    const dot = document.getElementById('cdot'+i);
    if (el) { el.classList.remove('pg-left','pg-right'); if(i!==_calcPgIdx) el.classList.add(i<_calcPgIdx?'pg-left':'pg-right'); }
    if (dot) dot.classList.toggle('on', i===_calcPgIdx);
  });
}
(function initSwipe(){
  let sx=0;
  const w=document.getElementById('calcPgWrap');
  if(!w) return;
  w.addEventListener('touchstart', e=>{ sx=e.touches[0].clientX; },{passive:true});
  w.addEventListener('touchend',   e=>{ const dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>40) calcPgSwitch(dx<0?1:-1); },{passive:true});
})();

// === VAPE CALC ===
let _vapeTarget = null;

function vapeSetVol(v, btn) {
  document.getElementById('vapeVol').value = v;
  document.querySelectorAll('#calcPg2 .vape-presets .vape-preset').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  vapeCalc();
}

function vapeSetTarget(v, btn) {
  _vapeTarget = v;
  document.querySelectorAll('.vape-target-grid .vape-preset').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  vapeCalc();
}

function vapeCalc() {
  const vol    = parseFloat(document.getElementById('vapeVol')?.value);
  const target = _vapeTarget;
  const base   = 200;
  const resNic = document.getElementById('vapeResNic');
  if (!resNic) return;

  if (isNaN(vol) || target === null || vol <= 0) {
    resNic.textContent = '—';
    resNic.className   = 'vape-result-val';
    return;
  }
  const nicAmt = (target * vol) / base;
  if (nicAmt > vol) {
    resNic.textContent = '濃度オーバー';
    resNic.className   = 'vape-result-val error';
    return;
  }
  resNic.textContent = (Math.round(nicAmt * 100) / 100) + ' ml';
  resNic.className   = 'vape-result-val';
}

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
  const today=new Date();
  document.getElementById('headerDate').textContent=
    `${today.getMonth()+1}/${today.getDate()}(${'日月火水木金土'[today.getDay()]})`;
  document.getElementById('deadlineInput').value=todayStr();
  updateNotifStatus();
  updateMailboxStatus();
  const gistEl=document.getElementById('gistUrlDisplay');
  if(gistEl) gistEl.textContent=GIST_RAW_URL;
  syncFromGist();
  startRimaRotation();
  renderHome();
  triggerNotifications();
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
  document.querySelectorAll('.meas-in').forEach(el=>el.addEventListener('focus',function(){
    const len=this.value.length; this.setSelectionRange(len,len);
  }));

})();

function autoDecimal(inp, ph) {
  var raw = inp.value;
  var neg = raw.charAt(0) === '-';
  // 数字だけ取り出して先頭ゼロ除去
  var digits = raw.replace(/[^0-9]/g, '').replace(/^0+/, '');

  var formatted;
  if (digits.length === 0) {
    formatted = neg ? '-' : '';
  } else if (digits.length === 1) {
    formatted = '0.0' + digits;
  } else if (digits.length === 2) {
    formatted = '0.' + digits;
  } else {
    formatted = digits.slice(0, -2) + '.' + digits.slice(-2);
  }
  if (neg && formatted !== '' && formatted !== '-') formatted = '-' + formatted;

  inp.value = formatted;
  var len = formatted.length;
  setTimeout(function() { inp.setSelectionRange(len, len); }, 0);
  measCalc(ph);
}
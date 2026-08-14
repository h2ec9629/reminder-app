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
  const catLabel={excel:'Excel',obsidian:'Obsidian',vfap:'VFAP',claude:'Claude',manual:'手動'}[r.category]||'手動';
  const notesHtml=r.notes?`<div class="rnotes">${escH(r.notes)}</div>`:'';
  const editBtn=!r.completed
    ?`<button class="rcard-edit-btn" onclick="openEdit('${r.id}')">✎</button>`
    :'';
  const actions=r.completed
    ?`<div class="ractions"><button class="ract del-btn" onclick="doDelete('${r.id}')">削除</button></div>`
    :`<div class="ractions">
        <button class="ract done-btn" onclick="doDone('${r.id}')">完了</button>
        <button class="ract del-btn"  onclick="doDelete('${r.id}')">削除</button>
      </div>`;
  return `<div class="rcard ${uc}">
    ${editBtn}
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
  document.querySelectorAll('.nav-btn, .nav-item').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  btn.classList.add('active');
  if(name==='home')     renderHome();
  if(name==='settings') updateNotifStatus();
  if(name==='schedule') renderSchedule();
  if(name==='calendar') renderCalendar();
  if(name==='gantt')    renderGantt();
  if(name==='calc')     calcDisplay();
  if(name==='vdeck')    loadVdeckFrame();


  window.scrollTo(0,0);
}

// === VDECK（動画プレイヤーをiframeで内蔵。初回タブオープン時のみ読み込む） ===
function loadVdeckFrame(){
  const f=document.getElementById('vdeckFrame');
  if(f && !f.src && f.dataset.src) f.src=f.dataset.src;
}

// === TOP RING SCREEN（起動時トップページ・回転リングメニュー） ===
// タップされた項目に応じてタブは即切り替え（オーバーレイの裏で待機）、
// 見た目は①項目が中心へ吸い込まれる→②中央円が縮小しながら下部オーバーレイボタンの位置へ移動→
// ③画面全体をフェードアウトして裏の本物の.menu-fabに切り替わる、の3段階で演出する。
let _ringClosing = false; // 演出中の連打防止フラグ
function ringGo(name) {
  if (_ringClosing) return;
  _ringClosing = true;

  const navBtn = document.getElementById('nav-' + name) || document.createElement('button');
  switchTab(name, navBtn);

  const screen = document.getElementById('topRingScreen');
  screen.classList.add('ring-closing'); // ①8個の項目を中心へ吸い込む

  setTimeout(() => {
    screen.classList.add('ring-collapse'); // ②中央円を縮小させつつ下部中央（menu-fab位置）へ移動
  }, 300);

  setTimeout(() => {
    screen.classList.add('hide'); // ③フェードアウトして裏の本物のmenu-fabへバトンタッチ
  }, 300 + 320);

  setTimeout(() => {
    // 次に開いた時のためにリセット（アプリ再読み込みで再表示される仕様だが念のため）
    screen.classList.remove('ring-closing', 'ring-collapse');
    _ringClosing = false;
  }, 300 + 320 + 240);
}

// --- リングの回転（常時ゆっくり反時計回り＋フリックで自由に回せる）---
let _ringAngle     = 0;   // 現在の回転角（deg）
let _ringVel       = 0;   // 角速度（deg/ms）※フリック直後の慣性用
let _ringDragging  = false;
let _ringLastAngle = 0;   // 直前フレームのポインタ角度
let _ringLastT     = 0;   // requestAnimationFrame用の前回時刻
let _ringPrevMoveT = 0;   // pointermove用の前回時刻（速度計算）
let _ringMoved     = 0;   // ドラッグ総移動量（タップ判定用）
let _ringDownT     = 0;

const RING_IDLE_SPEED = -0.003; // 待機中の自動回転速度（deg/ms）＝マイナスで反時計回り（左回転）
const RING_FRICTION   = 0.98;   // 慣性の減衰率（16ms相当あたり）。1に近いほど長く回り続ける

function _ringApply() {
  const wrap = document.getElementById('ringWrap');
  if (wrap) wrap.style.setProperty('--wheel-angle', _ringAngle + 'deg');
}

function _ringPointAngle(clientX, clientY) {
  const wrap = document.getElementById('ringWrap');
  const r = wrap.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  return Math.atan2(clientY - cy, clientX - cx) * 180 / Math.PI;
}

function _ringLoop(t) {
  if (!_ringLastT) _ringLastT = t;
  const dt = Math.min(t - _ringLastT, 48); // タブ切替復帰などの大ジャンプ対策
  _ringLastT = t;

  if (!_ringDragging && !_ringClosing) {
    // 吸い込み演出(ring-closing)が始まったら回転を止め、その場の角度で項目が中心へ収束するようにする
    if (Math.abs(_ringVel) > 0.002) {
      // フリック直後：慣性で回り続けながら減速
      _ringAngle += _ringVel * dt;
      _ringVel   *= Math.pow(RING_FRICTION, dt / 16);
    } else {
      // 通常時：ずっとゆっくり左回転
      _ringVel = 0;
      _ringAngle += RING_IDLE_SPEED * dt;
    }
    _ringApply();
  }
  requestAnimationFrame(_ringLoop);
}

function initRingWheel() {
  const wrap = document.getElementById('ringWrap');
  if (!wrap) return;

  wrap.addEventListener('pointerdown', e => {
    _ringDragging  = true;
    _ringVel       = 0;
    _ringMoved     = 0;
    _ringPrevMoveT = 0;
    _ringDownT     = performance.now();
    _ringLastAngle = _ringPointAngle(e.clientX, e.clientY);
    if (wrap.setPointerCapture) wrap.setPointerCapture(e.pointerId);
  });

  wrap.addEventListener('pointermove', e => {
    if (!_ringDragging) return;
    const now = performance.now();
    const ang = _ringPointAngle(e.clientX, e.clientY);
    let delta = ang - _ringLastAngle;
    if (delta > 180)  delta -= 360; // -180〜180度に正規化（0度またぎ対策）
    if (delta < -180) delta += 360;
    _ringAngle += delta;
    _ringMoved += Math.abs(delta);
    const dt = Math.max(now - (_ringPrevMoveT || now), 1);
    _ringVel = delta / dt; // deg/ms。指を離した瞬間の慣性に使う
    _ringPrevMoveT = now;
    _ringLastAngle = ang;
    _ringApply();
  });

  const endDrag = e => {
    if (!_ringDragging) return;
    _ringDragging = false;
    const heldMs = performance.now() - _ringDownT;
    // ほぼ動かさず短時間で離した＝タップ扱い。回転はドラッグ操作として吸収してタップ判定と分離する
    if (_ringMoved < 6 && heldMs < 350) {
      const el  = document.elementFromPoint(e.clientX, e.clientY);
      const btn = el && el.closest && el.closest('.ring-item');
      if (btn && btn.dataset.tab) ringGo(btn.dataset.tab);
    }
    // ドラッグだった場合は_ringVel（直前の指の速さ）を引き継いでそのまま慣性で回り続ける
  };
  wrap.addEventListener('pointerup', endDrag);
  wrap.addEventListener('pointercancel', endDrag);

  requestAnimationFrame(_ringLoop);
}

// --- リング上部の日付・時刻表示（1秒ごとに更新するリアルタイム時計） ---
function _ringClockTick() {
  const monthEl = document.getElementById('ringClockMonth');
  const timeEl  = document.getElementById('ringClockTime');
  const dateEl  = document.getElementById('ringClockDate');
  if (!monthEl || !timeEl || !dateEl) return;
  const d  = new Date();
  const pad = n => String(n).padStart(2, '0');
  monthEl.textContent = pad(d.getMonth()+1);
  dateEl.textContent  = `${pad(d.getDate())}(${['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()]})`;
  timeEl.textContent  = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function initRingClock() {
  _ringClockTick();
  setInterval(_ringClockTick, 1000);
}

// === 右下丸ボタン→オーバーレイメニュー（縦リスト） ===
function toggleNavMenu(){
  const open=document.getElementById('navMenu').classList.toggle('open');
  document.getElementById('navOverlay').classList.toggle('open',open);
  document.getElementById('menuFab').classList.toggle('open',open);
}
function closeNavMenu(){
  document.getElementById('navMenu').classList.remove('open');
  document.getElementById('navOverlay').classList.remove('open');
  document.getElementById('menuFab').classList.remove('open');
}

// === SCHEDULE ===
let _excelSchedule  = null;
let _schSyncedAt    = null;
let _ganttData      = null;
let _syncAttempted  = false;

// ▼日程タブ＝日付ごとのカードリスト（引取/納品）。データは excel_schedule.ac_side/ad_side（VBA:Module2が生成）。
//   完了フィルタは無し＝来た納品行は全部出す。完了で消す挙動はこの関数には無い。
//   ※横棒の「ガントタブ」は別ファイル calendar.js:renderGantt()。同じGistの別データを使う。混同注意。
function renderSchedule() {
  const grid  = document.getElementById('scheduleGrid');
  const syncd = document.getElementById('schSynced');
  if (!_excelSchedule) {
    grid.innerHTML = '<div class="sch-empty-msg">同期中...</div>';
    return;
  }
  const ac = _excelSchedule.ac_side || [];
  const ad = _excelSchedule.ad_side || [];

  // 起点（基準日）：エクセルのbase_date（デイライン）をミラーする。
  // PCの今日(new Date)には依存しない＝日を跨いでもエクセルがpushするまで窓は動かない。
  const anchorStr = (_ganttData && typeof _ganttData.base_date === 'string'
                     && /^\d{4}-\d{2}-\d{2}$/.test(_ganttData.base_date))
                    ? _ganttData.base_date
                    : todayStr();
  const limitDate  = new Date(anchorStr + 'T00:00:00'); limitDate.setDate(limitDate.getDate() + 14);
  const limitStr   = `${limitDate.getFullYear()}-${String(limitDate.getMonth()+1).padStart(2,'0')}-${String(limitDate.getDate()).padStart(2,'0')}`;

  // 日付でグルーピング
  const dateMap = {};
  ac.forEach(item => {
    if (item.date < anchorStr || item.date > limitStr) return;
    if (!dateMap[item.date]) dateMap[item.date] = { ac: [], ad: [] };
    dateMap[item.date].ac.push(item);
  });
  ad.forEach(item => {
    if (item.date < anchorStr || item.date > limitStr) return;
    if (!dateMap[item.date]) dateMap[item.date] = { ac: [], ad: [] };
    dateMap[item.date].ad.push(item);
  });
  const dates = Object.keys(dateMap).sort();

  if (dates.length === 0) {
    grid.innerHTML = '<div class="sch-empty-msg">14日以内の日程はありません</div>';
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

// === SNOOZE ===
function snooze(id, days) {
  const r = getAll().find(r => r.id===id);
  if (!r || !r.deadline) return;
  const d = new Date(r.deadline + 'T00:00:00');
  d.setDate(d.getDate() + days);
  updateReminder(id, { deadline: d.toISOString().split('T')[0] });
  renderHome();
  showToast(`${days}日延ばしました`);
}
function snoozeEdit(days) {
  const inp = document.getElementById('editDeadline');
  if (!inp.value) return;
  const d = new Date(inp.value + 'T00:00:00');
  d.setDate(d.getDate() + days);
  inp.value = d.toISOString().split('T')[0];
}

// === EDIT ===
let _editId = null;
function openEdit(id) {
  const r = getAll().find(r => r.id===id);
  if (!r) return;
  _editId = id;
  document.getElementById('editTitle').value    = r.title    || '';
  document.getElementById('editDeadline').value = r.deadline || '';
  document.getElementById('editNotes').value    = r.notes    || '';
  document.getElementById('editOverlay').classList.add('show');
  document.getElementById('editPanel').classList.add('show');
}
function closeEdit() {
  _editId = null;
  document.getElementById('editOverlay').classList.remove('show');
  document.getElementById('editPanel').classList.remove('show');
}

// === RIMA TOGGLE ===
function _applyRimaState(open) {
  const el = document.getElementById('rimaWrap');
  if (el) el.style.display = open ? '' : 'none';
}
function toggleRima() {
  const open = document.getElementById('showMascot').checked;
  _applyRimaState(open);
  localStorage.setItem('rimaOpen', open ? '1' : '0');
}
function initRimaToggle() {
  const open = localStorage.getItem('rimaOpen') === '1'; // デフォルト非表示
  const cb = document.getElementById('showMascot');
  if (cb) cb.checked = open;
  _applyRimaState(open);
}
// 追加ボタン連打の隠しコマンド: 5回でリマちゃん出現/非表示トグル（PCクリック/タップ両対応）
let _rimaTapCount = 0;
let _rimaTapTimer = null;
function rimaTapCount() {
  _rimaTapCount++;
  clearTimeout(_rimaTapTimer); // 連打が途切れたらリセット（2秒以内に次のタップが必要）
  _rimaTapTimer = setTimeout(() => { _rimaTapCount = 0; }, 2000);
  if (_rimaTapCount >= 5) {
    _rimaTapCount = 0;
    clearTimeout(_rimaTapTimer);
    const isOpen = localStorage.getItem('rimaOpen') === '1';
    const next = !isOpen;
    _applyRimaState(next);
    localStorage.setItem('rimaOpen', next ? '1' : '0');
    const cb = document.getElementById('showMascot');
    if (cb) cb.checked = next;
    if (next) {
      if (typeof startRimaRotation === 'function') startRimaRotation();
      if (typeof showToast === 'function') showToast('リマちゃん出現！🐉');
    } else {
      if (typeof stopRimaRotation === 'function') stopRimaRotation();
      if (typeof showToast === 'function') showToast('リマちゃんひっこみ！');
    }
  }
}
function saveEdit() {
  if (!_editId) return;
  const title    = document.getElementById('editTitle').value.trim();
  const deadline = document.getElementById('editDeadline').value;
  const notes    = document.getElementById('editNotes').value.trim();
  if (!title) { showToast('タイトルを入力してください'); return; }
  // 編集前のキーを墓場に入れてGistからの再インポートを防ぐ
  const old = getAll().find(r => r.id === _editId);
  if (old) addGrave(old.title + '|' + (old.deadline || 'null'));
  updateReminder(_editId, { title, deadline: deadline||null, notes: notes||null });
  closeEdit();
  renderHome();
  showToast('更新しました');
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
function clearFormInput(btn) {
  const inp = btn.previousElementSibling || btn.parentNode.querySelector('input,textarea');
  if(inp){ inp.value = ''; inp.focus(); }
}


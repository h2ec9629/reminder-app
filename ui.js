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
  const catLabel={excel:'Excel',obsidian:'Obsidian',claude:'Claude',manual:'手動'}[r.category]||'手動';
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
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  btn.classList.add('active');
  if(name==='home')     renderHome();
  if(name==='settings') updateNotifStatus();
  if(name==='schedule') renderSchedule();
  if(name==='calendar') renderCalendar();
  if(name==='gantt')    renderGantt();
  if(name==='calc')     calcDisplay();


  window.scrollTo(0,0);
}

// === SCHEDULE ===
let _excelSchedule = null;
let _schSyncedAt   = null;
let _ganttData     = null;

function renderSchedule() {
  const grid  = document.getElementById('scheduleGrid');
  const syncd = document.getElementById('schSynced');
  if (!_excelSchedule) {
    grid.innerHTML = '<div class="sch-empty-msg">同期中...</div>';
    return;
  }
  const ac = _excelSchedule.ac_side || [];
  const ad = _excelSchedule.ad_side || [];

  // 当日以降14日以内でフィルタ
  const todayStr14 = todayStr();
  const limitDate  = new Date(); limitDate.setDate(limitDate.getDate() + 14);
  const limitStr   = limitDate.toISOString().slice(0, 10);

  // 日付でグルーピング
  const dateMap = {};
  ac.forEach(item => {
    if (item.date < todayStr14 || item.date > limitStr) return;
    if (!dateMap[item.date]) dateMap[item.date] = { ac: [], ad: [] };
    dateMap[item.date].ac.push(item);
  });
  ad.forEach(item => {
    if (item.date < todayStr14 || item.date > limitStr) return;
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
  const area = document.getElementById('rimaNavArea');
  const grid = document.querySelector('.nav-grid');
  if (open) {
    area.classList.add('rima-open');
    grid.classList.remove('all-cols');
  } else {
    area.classList.remove('rima-open');
    grid.classList.add('all-cols');
  }
}
// 隠しコマンド：追加ボタン5連打でリマちゃん表示/非表示トグル
let _rimaTapCount = 0;
let _rimaTapTimer = null;
function rimaTapCount() {
  _rimaTapCount++;
  clearTimeout(_rimaTapTimer);
  if (_rimaTapCount >= 5) {
    _rimaTapCount = 0;
    const area = document.getElementById('rimaNavArea');
    const isOpen = area.classList.contains('rima-open');
    _applyRimaState(!isOpen);
  } else {
    _rimaTapTimer = setTimeout(() => { _rimaTapCount = 0; }, 1500);
  }
}
function initRimaToggle() {
  // 起動時は常に非表示
  _applyRimaState(false);
}
function saveEdit() {
  if (!_editId) return;
  const title    = document.getElementById('editTitle').value.trim();
  const deadline = document.getElementById('editDeadline').value;
  const notes    = document.getElementById('editNotes').value.trim();
  if (!title) { showToast('タイトルを入力してください'); return; }
  const old    = getAll().find(r => r.id === _editId);
  const oldKey = old ? (old.title + '|' + (old.deadline || 'null')) : null;
  const newKey = title + '|' + (deadline || 'null');
  if (oldKey && oldKey !== newKey) addGrave(oldKey); // 旧キーをgraveに登録してGist復活を防ぐ
  updateReminder(_editId, { title, deadline: deadline||null, notes: notes||null });
  closeEdit();
  renderHome();
  showToast('更新しました');
  if (old) pushEditToMailbox(old, { title, deadline: deadline||null, notes: notes||null }); // Obsidianにも反映
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
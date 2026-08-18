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
  const homeDot=document.getElementById('homeDot'); // 2026-08-16：リングの予定アイコンに移設。念のためnullガード
  if(uc>0){ badge.textContent=`${uc}件`; badge.classList.add('show'); if(homeDot) homeDot.classList.add('show'); }
  else    { badge.classList.remove('show'); if(homeDot) homeDot.classList.remove('show'); }

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

// ①②③…の丸数字ラベル（2026-08-18追加：配送タブで複数明細をまとめて表示する箇所に
// 「どれが何番目か」を分かりやすくするため付番する。①〜⑳(1-20)まではUnicode丸数字を使い、
// 21以降は稀なケース想定でフォールバック表記(21)にする。
const CIRCLED_NUMS = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮','⑯','⑰','⑱','⑲','⑳'];
const circledNum = n => CIRCLED_NUMS[n-1] || `(${n})`;

// === NAV ===
function switchTab(name,btn) {
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.nav-btn, .nav-item').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  btn.classList.add('active');
  try{ sessionStorage.setItem('ojisan_last_tab_v1', name); }catch(e){}
  if(name==='home')     renderHome();
  if(name==='settings') updateNotifStatus();
  if(name==='schedule') { _schWeekOffset = 0; renderSchedule(); }
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
// 2026-08-16：起動時だけでなく、どのタブからでも三本線ボタン(menuFab)をタップすると
// このリングをオーバーレイ表示できるようにした（旧・縦リストのハンバーガーメニューは廃止）。
// タップされた項目に応じてタブは即切り替え（オーバーレイの裏で待機）、
// 見た目は①項目が中心へ吸い込まれる→②中央円が縮小しながら下部オーバーレイボタンの位置へ移動→
// ③画面全体をフェードアウトして裏の本物の.menu-fabに切り替わる、の3段階で演出する。
let _ringClosing = false; // 演出中の連打防止フラグ
function ringGo(name) {
  if (_ringClosing) return;
  _ringClosing = true;

  if (name === 'game') {
    // GAMEはタブ切替ではなくオーバーレイ表示（switchTabにtab-gameは存在しないため専用分岐）
    openGameMode();
  } else {
    const navBtn = document.getElementById('nav-' + name) || document.createElement('button');
    switchTab(name, navBtn);
  }

  const screen = document.getElementById('topRingScreen');
  screen.classList.add('ring-closing'); // ①8個の項目が伸びて縮む弾性運動で中心へ吸い込まれる（.42s）

  setTimeout(() => {
    screen.classList.add('ring-collapse'); // ②中央円がバネのように行き過ぎてから下部中央（menu-fab位置）へ着地（.46s）
  }, 420);

  setTimeout(() => {
    screen.classList.add('hide'); // ③フェードアウトして裏の本物のmenu-fabへバトンタッチ
  }, 420 + 460);

  setTimeout(() => {
    // 次に開いた時のためにリセット
    screen.classList.remove('ring-closing', 'ring-collapse');
    _ringClosing = false;

    // リングを閉じたら回転アニメ(requestAnimationFrameループ)と時計更新(setInterval)を完全停止する。
    // 止めないとリングが見えない間もバックで永遠に回り続け、CPU/電池負荷が無駄にかかり続ける
    // （2026-08-15、VDECK再生中断バグの調査で発覚・対策。2026-08-16、三本線での再オープンに
    // 対応するため、停止だけでなくopenRingOverlay()側で再開する作りに拡張した）。
    _ringLoopStopped = true;
    if (_ringClockTimer) { clearInterval(_ringClockTimer); _ringClockTimer = null; }
  }, 420 + 460 + 240);
}

// --- 三本線ボタンでのリング開閉（2026-08-16追加） ---
// リング表示中は本物の.menu-fab(id=menuFab)がリング画面(z-index:500)の下に隠れて押せなくなるため、
// リング画面自身に重ねて置いた#ringCloseFab（見た目は同じボタン）から閉じる。
function toggleRingOverlay() {
  const screen = document.getElementById('topRingScreen');
  if (screen.classList.contains('hide')) {
    openRingOverlay();
  } else {
    closeRingOverlay();
  }
}
// 開く時は、閉じる時の演出（項目が中心へ吸い込まれる→中央円が下部ボタン化→フェードアウト）を
// そっくりそのまま逆再生する：①フェードイン→②中央円が広がる（.46s）→③項目が円周へ飛び出す（.42s）。
// 演出中はタップ・回転をブロックする（_ringClosingを流用。ringGo()の演出ガードと同じ仕組み）。
function openRingOverlay() {
  const screen = document.getElementById('topRingScreen');
  screen.classList.remove('hide', 'ring-closing', 'ring-collapse');
  screen.classList.add('ring-opening');
  _ringClosing = true;

  // 2026-08-17追記：VDECKタブの上にリングを重ねて開くと、VDECK自身のanalyzerLoop（RAF）が
  // 裏で動いたままなので、そこにリング自身の回転RAFまで足すと「VDECK再生中断バグ」と同じ
  // 二重負荷になり、リング展開中に再生を続けているとホワイトアウト/リロードが再発する
  // （2026-08-17おじさん報告で確認）。VDECKタブの上に開く時だけ、時計は出すが自動回転
  // ループは起動しない（角度はその場で静止表示）。
  const vdeckTab = document.getElementById('tab-vdeck');
  const onVdeck = !!(vdeckTab && vdeckTab.classList.contains('active'));

  if (_ringClockTimer) clearInterval(_ringClockTimer);
  initRingClock();

  setTimeout(() => {
    // 中央円(.46s)→項目(.42s、.46s遅延で開始)の合計で演出完了。回転は演出が終わってから再開する。
    screen.classList.remove('ring-opening');
    _ringClosing = false;
    if (!onVdeck) _ringStartLoop();
  }, 460 + 420);
}
function closeRingOverlay() {
  const screen = document.getElementById('topRingScreen');
  screen.classList.remove('ring-closing', 'ring-collapse', 'ring-opening');
  screen.classList.add('hide');
  _ringClosing = false;
  _ringLoopStopped = true;
  if (_ringClockTimer) { clearInterval(_ringClockTimer); _ringClockTimer = null; }
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
let _ringLoopStopped = false; // trueになったら_ringLoopのrequestAnimationFrame再スケジュールを止める
let _ringClockTimer  = null;  // 時計更新setIntervalのID（リング画面を離れたらclearInterval）

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
  // _ringLoopStoppedが立ったらここで再スケジュールを打ち切って完全停止する（VDECK等を
  // 見ている間もバックで回り続けてCPU/電池を無駄に食っていた問題への対策。2026-08-15）。
  // 再開は_ringStartLoop()側（openRingOverlay()・起動時の初回表示から呼ばれる）が担当する。
  if (!_ringLoopStopped) requestAnimationFrame(_ringLoop);
}

// リングの自動回転ループを（再）開始する。dtの大ジャンプを防ぐため_ringLastTもリセットする。
function _ringStartLoop() {
  _ringLoopStopped = false;
  _ringLastT = 0;
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

  // ループの開始/再開は_ringStartLoop()側（main.jsの起動処理・openRingOverlay()）が担当する。
  // ここではポインタ操作の待受登録のみ行う（三本線からの再オープンにも対応するため常に一度だけ呼ぶ）。
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
  _ringClockTimer = setInterval(_ringClockTick, 1000);
}

// 2026-08-16：旧・縦リストのハンバーガーメニュー(toggleNavMenu/closeNavMenu)は廃止。
// 三本線ボタンは上部の toggleRingOverlay()/openRingOverlay()/closeRingOverlay() に統一した。

// === SCHEDULE ===
let _excelSchedule  = null;
let _schSyncedAt    = null;
let _ganttData      = null;
let _syncAttempted  = false;
let _schWeekOffset  = 0; // 0=今週, 1=来週。配送ページ(VFAP haiso.html)の週切替を再現したもの。
                         // Gistにはnittei_to_gist.pyが今週・来週の2週分しか送ってこないので、
                         // 切替できる範囲もこの2つだけ（switchTabで毎回0にリセットされる）。

// ▼日程タブ＝日付ごとのカードリスト（引取/納品）。データは excel_schedule.weeks[週の月曜ISO日付]
//   .ac_side/ad_side（nittei_to_gist.pyが生成）。2026-08-15〜：配送ページ(VFAP haiso.html)の表示を
//   そのまま再現する方式に変更されたのに合わせ、表示窓も「週(月〜金)単位」に変更（以前は基準日から
//   14日分のローリング表示だった）。さらに同日、配送ページと同じ週切替（今週/来週の2週分）にも対応。
//   引取(ac)のitemには材料名(ag)に加えて梱包箱名(hako)・支給数(qty)が付くようになった
//   （付かない＝配送ページ側で今週まだその箱の初出扱いになっていない「隠れ」行）。
//   完了フィルタは無し＝来た納品行は全部出す。完了で消す挙動はこの関数には無い。
//   ※横棒の「ガントタブ」は別ファイル calendar.js:renderGantt()。同じGistの別データを使う。混同注意。
function renderSchedule() {
  const grid    = document.getElementById('scheduleGrid');
  const syncd   = document.getElementById('schSynced');
  const label   = document.getElementById('schWeekLabel');
  const prevBtn = document.getElementById('schPrevBtn');
  const nextBtn = document.getElementById('schNextBtn');
  if (!_excelSchedule) {
    grid.innerHTML = '<div class="sch-empty-msg">同期中...</div>';
    return;
  }

  // 起点（基準日）：エクセルのbase_date（デイライン）をミラーする。
  // PCの今日(new Date)には依存しない＝日を跨いでもエクセルがpushするまで窓は動かない。
  const anchorStr = (_ganttData && typeof _ganttData.base_date === 'string'
                     && /^\d{4}-\d{2}-\d{2}$/.test(_ganttData.base_date))
                    ? _ganttData.base_date
                    : todayStr();

  // 配送ページと同じ「週（月〜金）」窓。日曜だけ-6、それ以外は1-dayでその週の月曜へ。
  const toIso   = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const anchorD = new Date(anchorStr + 'T00:00:00');
  const wday    = anchorD.getDay();
  const thisMonD = new Date(anchorD);
  thisMonD.setDate(thisMonD.getDate() + (wday === 0 ? -6 : 1 - wday));

  const selMonD = new Date(thisMonD); selMonD.setDate(selMonD.getDate() + _schWeekOffset * 7);
  const selFriD = new Date(selMonD);  selFriD.setDate(selFriD.getDate() + 4);
  const mondayStr = toIso(selMonD);
  const fridayStr = toIso(selFriD);

  // Python側はexcel_schedule.weeks[週の月曜ISO日付]に週ごとのac_side/ad_sideを入れて送ってくる。
  // 万一古い形式（weeksが無くac_side/ad_sideが直下にある版）のGistが来ても今週分として拾えるよう
  // フォールバックしておく。
  const weeks = _excelSchedule.weeks;
  const weekData = weeks ? (weeks[mondayStr] || { ac_side: [], ad_side: [] })
                         : { ac_side: _excelSchedule.ac_side || [], ad_side: _excelSchedule.ad_side || [] };
  const ac = weekData.ac_side || [];
  const ad = weekData.ad_side || [];

  const weekLabelText = _schWeekOffset === 0 ? '今週' : '来週';
  if (label)   label.textContent = weekLabelText;
  if (prevBtn) prevBtn.disabled  = (_schWeekOffset <= 0);
  if (nextBtn) nextBtn.disabled  = (_schWeekOffset >= 1);

  // 日付でグルーピング（Python側で既に選択週ぶんに絞られているが、保険で範囲チェックもしておく）
  const dateMap = {};
  ac.forEach(item => {
    if (item.date < mondayStr || item.date > fridayStr) return;
    if (!dateMap[item.date]) dateMap[item.date] = { ac: [], ad: [] };
    dateMap[item.date].ac.push(item);
  });
  ad.forEach(item => {
    if (item.date < mondayStr || item.date > fridayStr) return;
    if (!dateMap[item.date]) dateMap[item.date] = { ac: [], ad: [] };
    dateMap[item.date].ad.push(item);
  });
  const dates = Object.keys(dateMap).sort();

  if (dates.length === 0) {
    grid.innerHTML = `<div class="sch-empty-msg">${weekLabelText}の日程はありません</div>`;
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
      // ag=材料名、hako=梱包箱名、qty=支給数（配送ページと同じ「箱は週内で初出日だけ表示」
      // 仕様のため、hakoが付かない行もある＝その材料の箱は別の日にまとめて表示済み）。
      // 1つのitemがag・hakoを両方持つケースもあるため、以前は1回のforEachでitem単位に
      // 引取→梱包の順に出力しており、item同士の並び次第で引取/梱包が交互に見えていた。
      // 2026-08-18〜：おじさんの要望により「引取→梱包→納品」で完全にまとめて表示するよう、
      // 2回に分けたforEachでまず全ての引取行、続けて全ての梱包行を出力する形に変更。
      acItems.forEach(item => {
        if (!item.ag) return;
        // mqty=材料自体の数量表示（配送ページの「品名（材料）」列の隣にある「数量」列の
        // 再現。梱包箱側のqty＝「支給数」とは別物。大半は固定文言「要数」、ショーケース系は
        // 急数の数字、灯具カバー系はその日の合算を100単位切り上げした数字。2026-08-16追加）
        const mqtySub = item.mqty ? `数量 ${item.mqty}` : '';
        html += `<div class="sch-row">
          <span class="sch-tag sch-tag-ac">引取</span>
          <div class="sch-row-body">
            <div class="sch-row-main">${escH(item.ag)}</div>
            ${mqtySub ? `<div class="sch-row-sub">${escH(mqtySub)}</div>` : ''}
          </div>
        </div>`;
      });
      acItems.forEach(item => {
        if (!item.hako) return;
        const hasQty = item.qty !== null && item.qty !== undefined && item.qty !== '';
        const sub = hasQty ? `支給数 × ${item.qty}` : '';
        html += `<div class="sch-row">
          <span class="sch-tag sch-tag-hako">梱包</span>
          <div class="sch-row-body">
            <div class="sch-row-main">${escH(item.hako)}</div>
            ${sub ? `<div class="sch-row-sub">${escH(sub)}</div>` : ''}
          </div>
        </div>`;
      });
      // 2026-08-18〜：同一品名(d)の納品行が複数ある場合（同じ材料で明細Noが複数）、
      // 品名を1行にまとめ、明細No・依頼数/進捗数(s/u)だけを2列グリッドでコンパクト表示する。
      // 1件しか無い品名は今まで通りの単純な1行表示のまま。
      const adGroups = [];
      const adGroupIndex = {};
      adItems.forEach(item => {
        const key = item.d || '';
        if (!(key in adGroupIndex)) {
          adGroupIndex[key] = adGroups.length;
          adGroups.push({ name: key, items: [] });
        }
        adGroups[adGroupIndex[key]].items.push(item);
      });
      adGroups.forEach(group => {
        if (group.items.length <= 1) {
          const item = group.items[0];
          const sub = [item.s, item.u].filter(Boolean).join(' · ');
          html += `<div class="sch-row">
            <span class="sch-tag sch-tag-ad">納品</span>
            <div class="sch-row-body">
              <div class="sch-row-main">${escH(group.name)}</div>
              ${sub ? `<div class="sch-row-sub">${escH(sub)}</div>` : ''}
            </div>
          </div>`;
        } else {
          // 2026-08-18〜：まとめ表示された各明細に①②③…と付番し、どれが何番目か分かりやすくする。
          const cells = group.items.map((item, idx) => {
            const num = circledNum(idx + 1);
            const parts = [item.s, item.u].filter(Boolean).join('　');
            return `<span class="sch-row-detail-item">${num} ${escH(parts)}</span>`;
          }).join('');
          html += `<div class="sch-row">
            <span class="sch-tag sch-tag-ad">納品</span>
            <div class="sch-row-body">
              <div class="sch-row-main">${escH(group.name)}</div>
              <div class="sch-row-detail-grid">${cells}</div>
            </div>
          </div>`;
        }
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

// 配送タブの週切替（今週/来週の2週のみ。Gist側もこの2週分しか持っていない）
function schPrevWeek() {
  if (_schWeekOffset <= 0) return;
  _schWeekOffset--;
  renderSchedule();
}
function schNextWeek() {
  if (_schWeekOffset >= 1) return;
  _schWeekOffset++;
  renderSchedule();
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
  setTimeout(()=>switchTab('home', document.getElementById('nav-home') || document.createElement('button')),400);
  pushToMailbox(reminder); // 投函箱に非同期送信（失敗してもローカル保存は済み）
});

// === IMPORT ===
function clearFormInput(btn) {
  const inp = btn.previousElementSibling || btn.parentNode.querySelector('input,textarea');
  if(inp){ inp.value = ''; inp.focus(); }
}


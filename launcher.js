'use strict';
// === LAUNCHER LAYOUT（ホーム画面の並べ替え・常駐ドック。2026-10-29追加） ===
// ホーム画面の2ページ(p1/p2)と下部ドック(dock)に並ぶウィジェット・キーの並び順をlocalStorageに保存し、
// ここで描画する。長押しで編集モードに入り、そのままドラッグで並べ替え（ページ間・ドックとの出し入れも可）。
// アプリ本体の定義(LN_APPS)・起動(launchApp)・中身の数字の更新(renderLauncher)はui.js側。
// ドック(#lnDockWrap)はホーム画面の外に置いてあり、どの画面を開いていても表示される。
const LN_LAYOUT_KEY = 'ojisan_launcher_layout_v1';
const LN_DOCK_MAX   = 5; // ドックに置けるキーの数（左端の固定ホームキーは別）

const LN_ICONS = {
  home:       '<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  add:        '<path d="M12 5v14M5 12h14"/>',
  schedule:   '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.5"/><circle cx="17" cy="17.5" r="1.5"/>',
  gantt:      '<path d="M4 4v16"/><path d="M7 7h8M10 12h10M7 17h6"/>',
  calendar:   '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  calc:       '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
  meas:       '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
  driver:     '<path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>',
  vdeck:      '<rect x="7" y="4" width="13" height="16" rx="2"/><path d="M4 7v11a2 2 0 0 0 2 2"/>',
  game:       '<rect x="2.5" y="7" width="19" height="11" rx="4"/><path d="M7 11v3M5.5 12.5h3M15.5 12h.01M18 14h.01"/>',
  settings:   '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  all:        '<circle cx="6" cy="6" r="1.2"/><circle cx="12" cy="6" r="1.2"/><circle cx="18" cy="6" r="1.2"/><circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/><circle cx="6" cy="18" r="1.2"/><circle cx="12" cy="18" r="1.2"/><circle cx="18" cy="18" r="1.2"/>',
  camera:     '<path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.5"/>',
  'x-line':   '<path d="M4 5h16v11H9l-5 4z"/>',
  'x-youtube':'<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M10.5 9.5v5l4-2.5z"/>',
  'x-gmail':  '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 6 9-6"/>',
  'x-x':      '<path d="M5 4l14 16M19 4L5 20"/>',
  'x-chrome': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  'x-safari': '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  'x-claude': '<path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3L6.3 17.7"/>',
  'x-chatgpt':'<circle cx="12" cy="12" r="9"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
  'x-note':   '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
  'x-yahoo':  '<rect x="3" y="5" width="15" height="14" rx="1"/><path d="M18 9h3v8a2 2 0 0 1-2 2M6 9h9M6 13h9M6 16h6"/>',
  'x-family': '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.2"/><path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5"/>',
};
const LN_LED   = { gantt:'#D9963F', meas:'#6FB3C9', schedule:'#4FB07A' }; // キー右上の色ランプ
const LN_LABEL = { 'x-family':'ファミリー' };                              // キーに収まらない名前の短縮

// ウィジェット（中の数字はui.jsのrenderLauncher()がidで埋める）。openはタップで開くアプリ
const LN_WIDGETS = {
  'w-clock': { html: `<div class="ln-widget ln-w4 ln-clock" data-lid="w-clock">
      <span class="ln-time" id="lnTime">--:--</span><span class="ln-date" id="lnDateLong"></span></div>` },
  'w-rem':   { open: 'home', html: `<button class="ln-widget ln-w4 ln-panel" data-lid="w-rem" aria-label="予定を開く">
      <span class="ln-panel-hd"><span>直近の予定</span><span class="ln-chip" id="lnOverdue"></span></span>
      <span id="lnRemList"></span></button>` },
  'w-del':   { open: 'schedule', html: `<button class="ln-widget ln-w4 ln-panel" data-lid="w-del" aria-label="配送を開く">
      <span class="ln-panel-hd"><span style="color:#4FB07A">今日の配送</span><span class="ln-w-sub" id="lnDelSub"></span></span>
      <span id="lnDelList"><span class="ln-empty">—</span></span></button>` },
  'w-meas':  { open: 'meas', html: `<button class="ln-widget ln-w2 ln-panel" data-lid="w-meas" aria-label="測定を開く">
      <span class="ln-w-label" style="color:#6FB3C9">最新の測定</span>
      <span class="ln-w-main sm" id="lnMeasMain">—</span><span class="ln-w-sub" id="lnMeasSub"></span></button>` },
};

const LN_DEFAULT = {
  p1:   ['w-clock','w-rem','w-del','w-meas','gantt','calc','meas','driver','vdeck','game','settings','all'],
  p2:   ['x-line','x-youtube','x-gmail','x-x','x-chrome','x-safari','x-claude','x-chatgpt','x-note','x-yahoo','camera','x-family'],
  dock: ['home','schedule','calendar','add'],
};
const LN_ZONES = { p1:'lnZoneP1', p2:'lnZoneP2', dock:'lnDock' };

let _lnLayout = loadLnLayout();
let _lnEditing = false;

// 保存済みの並びを読む。壊れた/知らない項目は捨て、後から増えた項目は既定の場所の末尾に足す
function loadLnLayout() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(LN_LAYOUT_KEY)); } catch(e) {}
  if (!saved) return JSON.parse(JSON.stringify(LN_DEFAULT));
  const known = id => !!LN_WIDGETS[id] || id === 'all' || LN_APPS.some(a => a.id === id);
  const out = { p1:[], p2:[], dock:[] }, seen = new Set();
  Object.keys(out).forEach(z => (saved[z] || []).forEach(id => {
    if (!known(id) || seen.has(id)) return;
    if (z === 'dock' && (LN_WIDGETS[id] || out.dock.length >= LN_DOCK_MAX)) return;
    out[z].push(id); seen.add(id);
  }));
  Object.keys(out).forEach(z => LN_DEFAULT[z].forEach(id => {
    if (seen.has(id)) return;
    out[z === 'dock' && out.dock.length >= LN_DOCK_MAX ? 'p2' : z].push(id); seen.add(id);
  }));
  return out;
}
function saveLnLayout() {
  try { localStorage.setItem(LN_LAYOUT_KEY, JSON.stringify(_lnLayout)); } catch(e) {}
}

function lnKeyHtml(id) {
  const a = id === 'all' ? { name:'すべて' } : LN_APPS.find(x => x.id === id);
  if (!a) return '';
  const cls   = id === 'add' ? ' accent' : id === 'all' ? ' dim' : '';
  const led   = LN_LED[id] ? `<span class="ln-led" style="background:${LN_LED[id]}"></span>` : '';
  const badge = id === 'home' ? '<span class="ln-badge" id="lnBadge"></span>' : '';
  return `<button class="ln-key${cls}" data-lid="${id}" aria-label="${a.name}">${led}`
       + `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${id === 'add' ? 2.2 : 1.7}" stroke-linecap="round" stroke-linejoin="round">${LN_ICONS[id] || ''}</svg>`
       + `<span class="ln-key-label">${LN_LABEL[id] || a.name}</span>${badge}</button>`;
}
function renderLnLayout() {
  Object.keys(LN_ZONES).forEach(z => {
    document.getElementById(LN_ZONES[z]).innerHTML =
      _lnLayout[z].map(id => LN_WIDGETS[id] ? LN_WIDGETS[id].html : lnKeyHtml(id)).join('');
  });
}
function lnResetLayout() {
  if (!confirm('ホーム画面とドックを初期配置に戻しますか？')) return;
  _lnLayout = JSON.parse(JSON.stringify(LN_DEFAULT));
  saveLnLayout();
  renderLnLayout();
  renderLauncher();
}
function lnSetBadge(n) {
  const b = document.getElementById('lnBadge');
  if (b) b.textContent = n || '';
}
function lnSetEditing(on) {
  _lnEditing = on;
  document.body.classList.toggle('ln-editing', on);
}
// ドック左端の固定ホームキー：ホーム以外ならホームへ、ホームなら1ページ目へ
function lnHomeKey() {
  if (document.getElementById('launcher').classList.contains('hide')) openLauncher();
  else lnGoPage(0);
}

// --- タップ：キー・ウィジェットはクリックを一括で拾う（並べ替え直後と編集中は起動しない） ---
let _lnSuppressClick = false;
document.addEventListener('click', e => {
  const el = e.target.closest('[data-lid]');
  if (_lnSuppressClick) {
    _lnSuppressClick = false;
    if (el) { e.preventDefault(); e.stopPropagation(); }
    return;
  }
  if (_lnEditing) {
    // 編集中にホーム画面の何もない所をタップしたら編集終了
    if (!el && e.target.closest('#launcher') && !e.target.closest('button')) lnSetEditing(false);
    if (el) { e.preventDefault(); e.stopPropagation(); }
    return;
  }
  if (!el || !el.closest('#launcher, #lnDockWrap')) return;
  const id = el.dataset.lid;
  if (LN_WIDGETS[id]) { if (LN_WIDGETS[id].open) launchApp(LN_WIDGETS[id].open); }
  else if (id === 'all') openLnDrawer();
  else launchApp(id);
}, true);

// --- 長押し→ドラッグで並べ替え ---
// 指を置いて動かさずに待つと掴む（編集中は短め）。待つ前に動かした時は普通のスクロール/スワイプ扱い。
// 掴んだ実物の要素を並びの中で動かし（=周りが詰め直される）、見た目は指に付いてくる複製(ghost)で出す。
const LN_HOLD_MS = 450, LN_HOLD_EDIT_MS = 150;
let _lnPress = null, _lnDrag = null, _lnEdgeTimer = null, _lnEdgeDir = 0;

document.addEventListener('pointerdown', e => {
  _lnSuppressClick = false;
  if (e.button) return;
  const el = e.target.closest('[data-lid]');
  if (!el || !el.closest('#launcher, #lnDockWrap')) return;
  const press = { el, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY };
  press.timer = setTimeout(() => { if (_lnPress === press) lnStartDrag(press); }, _lnEditing ? LN_HOLD_EDIT_MS : LN_HOLD_MS);
  _lnPress = press;
});
document.addEventListener('pointermove', e => {
  if (_lnDrag) { lnDragMove(e.clientX, e.clientY); return; }
  if (_lnPress) {
    _lnPress.x = e.clientX; _lnPress.y = e.clientY;
    if (Math.hypot(e.clientX - _lnPress.sx, e.clientY - _lnPress.sy) > 8) lnCancelPress();
  }
});
document.addEventListener('pointerup', lnPointerEnd);
document.addEventListener('pointercancel', lnPointerEnd);
// ドラッグ中だけ画面のスクロールを止める（iPhoneはtouchmoveを止めないとスクロールが始まってしまう）
document.addEventListener('touchmove', e => { if (_lnDrag) e.preventDefault(); }, { passive: false });
document.addEventListener('contextmenu', e => { if (e.target.closest('#launcher [data-lid], #lnDockWrap [data-lid]')) e.preventDefault(); });

function lnCancelPress() {
  if (_lnPress) clearTimeout(_lnPress.timer);
  _lnPress = null;
}
function lnPointerEnd() {
  if (_lnDrag) lnEndDrag();
  lnCancelPress();
}

function lnStartDrag(press) {
  _lnPress = null;
  const el = press.el;
  if (document.getElementById('launcher').classList.contains('hide')) openLauncher(); // ドックを他の画面で掴んだ時
  lnSetEditing(true);
  _lnSuppressClick = true;
  const r = el.getBoundingClientRect();
  const ghost = el.cloneNode(true);
  ghost.querySelectorAll('[id]').forEach(n => n.removeAttribute('id')); // 本物とidが重複しないように
  ghost.removeAttribute('data-lid');
  ghost.classList.add('ln-ghost');
  Object.assign(ghost.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  document.body.appendChild(ghost);
  el.classList.add('ln-placeholder');
  _lnDrag = { el, ghost, dx: press.x - r.left, dy: press.y - r.top, widget: !!LN_WIDGETS[el.dataset.lid] };
}

function lnDragMove(x, y) {
  const d = _lnDrag;
  d.ghost.style.left = (x - d.dx) + 'px';
  d.ghost.style.top  = (y - d.dy) + 'px';

  const under = document.elementFromPoint(x, y);
  const dock  = document.getElementById('lnDock');
  const page  = under && under.closest('.ln-page');
  const zone  = !under ? null
              : under.closest('[data-lzone]') || (under.closest('#lnDockWrap') ? dock : page && page.querySelector('[data-lzone]'));
  lnEdgeCheck(x, y, !!(under && under.closest('#lnDockWrap')));
  if (!zone) return;
  if (zone === dock) {
    if (d.widget) return; // ウィジェットはドックに置けない
    if (d.el.parentNode !== dock && dock.children.length >= LN_DOCK_MAX) return; // 満杯なら入れない
  }

  const target = under.closest('[data-lid]');
  if (target && target !== d.el && zone.contains(target)) {
    const r = target.getBoundingClientRect();
    const wide = r.width > zone.clientWidth * 0.6; // 横幅いっぱいのウィジェットは上下で前後を判定
    const before = wide ? y < r.top + r.height / 2 : x < r.left + r.width / 2;
    const ref = before ? target : target.nextSibling;
    if (ref !== d.el && d.el.nextSibling !== ref) zone.insertBefore(d.el, ref);
  } else if (!target) {
    // 並びの最後より後ろ（空きスペース）に来たら末尾へ
    const last = zone.lastElementChild;
    const lr = last && last.getBoundingClientRect();
    if (!last || y > lr.bottom || (y > lr.top && x > lr.right)) {
      if (last !== d.el) zone.appendChild(d.el);
    }
  }
}

// 画面の左右端で少し待つと隣のページへ
function lnEdgeCheck(x, y, overDock) {
  const pages = document.getElementById('lnPages');
  const pr = pages.getBoundingClientRect();
  const dir = (overDock || y < pr.top || y > pr.bottom) ? 0 : x < pr.left + 28 ? -1 : x > pr.right - 28 ? 1 : 0;
  if (dir === _lnEdgeDir) return;
  clearTimeout(_lnEdgeTimer);
  _lnEdgeDir = dir;
  if (dir) _lnEdgeTimer = setTimeout(() => {
    const cur = Math.round(pages.scrollLeft / pages.clientWidth);
    lnGoPage(Math.max(0, Math.min(1, cur + dir)));
    _lnEdgeDir = 0;
  }, 500);
}

function lnEndDrag() {
  const d = _lnDrag;
  _lnDrag = null;
  clearTimeout(_lnEdgeTimer); _lnEdgeDir = 0;
  d.ghost.remove();
  d.el.classList.remove('ln-placeholder');
  // 並べ替えは実物の要素を動かしているので、DOMの並びをそのまま保存すればよい
  Object.keys(LN_ZONES).forEach(z => {
    _lnLayout[z] = [...document.getElementById(LN_ZONES[z]).children].map(n => n.dataset.lid).filter(Boolean);
  });
  saveLnLayout();
}

renderLnLayout();

'use strict';
// おじさんリマインダー - 常駐ウィジェット（ファーストステップ）
// core.js のデータ層（getAll/addReminder/deleteOne/updateReminder/daysUntil等）をそのまま利用。
// ここでは「一覧表示 → 追加 → 削除 → クリックで詳細へ遷移 → 戻るボタンで一覧へ」だけを実装する。

let _wDetailId = null; // 現在詳細表示中のリマインダーID

// ui.js 側にしかない escH をこのウィジェットは読み込んでいないため、ここで自前定義する。
const escH = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// === VIEW切替 ===
function wShowView(name) {
  document.querySelectorAll('.w-view').forEach(v => v.classList.remove('active'));
  document.getElementById('w-' + name + '-view').classList.add('active');
}

// === 一覧描画 ===
function wRenderList() {
  const all = getAll().filter(r => !r.completed);
  const sorted = [...all].sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline));

  const countEl = document.getElementById('wCount');
  if (sorted.length > 0) { countEl.textContent = `${sorted.length}件`; countEl.classList.add('show'); }
  else { countEl.classList.remove('show'); }

  const listEl = document.getElementById('w-list');
  if (sorted.length === 0) {
    listEl.innerHTML = `<div class="w-empty">リマインダーはありません<br>右上の＋から追加できます</div>`;
    return;
  }

  listEl.innerHTML = sorted.map(wRowHTML).join('');
}

function wRowHTML(r) {
  const n = r.deadline ? daysUntil(r.deadline) : null;
  const uc = n === null ? '' : urgClass(n, r.advance_days || 3);
  const dateLabel = r.deadline ? `${fmtDate(r.deadline)} · ${daysLabel(n)}` : '期限なし';
  return `<div class="w-row ${uc}" onclick="wOpenDetail('${r.id}')">
    <div class="w-row-main">
      <div class="w-row-title">${escH(r.title)}</div>
      <div class="w-row-date">${escH(dateLabel)}</div>
    </div>
    <button class="w-row-del" aria-label="削除" onclick="wDeleteRow(event,'${r.id}')">✕</button>
  </div>`;
}

// === 追加 ===
function wOpenAdd() {
  document.getElementById('wTitle').value = '';
  document.getElementById('wDate').value = todayStr();
  document.getElementById('wNotes').value = '';
  document.getElementById('wErr').classList.remove('show');
  wShowView('add');
  document.getElementById('wTitle').focus();
}

function wCloseAdd() {
  wShowView('list');
}

function wSaveAdd() {
  const titleEl = document.getElementById('wTitle');
  const title = titleEl.value.trim();
  const errEl = document.getElementById('wErr');
  if (!title) {
    errEl.classList.add('show');
    titleEl.focus();
    return;
  }
  errEl.classList.remove('show');

  const deadline = document.getElementById('wDate').value || null;
  const notes = document.getElementById('wNotes').value.trim() || null;

  addReminder({ title, deadline, notes, category: 'manual', advance_days: 3 });

  wShowView('list');
  wRenderList();
}

// 入力中に一度でも直したらエラー表示を消す
document.addEventListener('DOMContentLoaded', () => {
  const titleEl = document.getElementById('wTitle');
  if (titleEl) titleEl.addEventListener('input', () => {
    document.getElementById('wErr').classList.remove('show');
  });
  document.getElementById('wDate').value = todayStr();
  wRenderList();
});

// === 削除（一覧から直接） ===
function wDeleteRow(ev, id) {
  ev.stopPropagation();
  const r = getAll().find(x => x.id === id);
  if (!r) return;
  if (!confirm(`「${r.title}」を削除しますか？`)) return;
  deleteOne(id);
  wRenderList();
}

// === 詳細 ===
function wOpenDetail(id) {
  const r = getAll().find(x => x.id === id);
  if (!r) return;
  _wDetailId = id;

  const n = r.deadline ? daysUntil(r.deadline) : null;
  const uc = n === null ? 'later' : (urgClass(n, r.advance_days || 3) || 'later');
  const dateLabel = r.deadline ? `${fmtDate(r.deadline)} · ${daysLabel(n)}` : '期限なし';

  document.getElementById('w-detail-body').innerHTML = `
    <div class="w-detail-title">${escH(r.title)}</div>
    <div class="w-detail-chip ${uc}">${escH(dateLabel)}</div>
    <div class="w-detail-notes">${escH(r.notes || '')}</div>
    <div class="w-btnrow">
      <button class="w-btn w-btn-ghost" onclick="wDeleteFromDetail('${r.id}')">削除する</button>
      <button class="w-btn w-btn-primary" onclick="wDoneFromDetail('${r.id}')">完了にする</button>
    </div>
  `;
  wShowView('detail');
}

function wCloseDetail() {
  _wDetailId = null;
  wShowView('list');
  wRenderList();
}

function wDeleteFromDetail(id) {
  const r = getAll().find(x => x.id === id);
  if (!r) return;
  if (!confirm(`「${r.title}」を削除しますか？`)) return;
  deleteOne(id);
  wCloseDetail();
}

function wDoneFromDetail(id) {
  markDone(id);
  wCloseDetail();
}

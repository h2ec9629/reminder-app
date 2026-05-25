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
function _setMeasDiff(d, numStr, lblStr, color) {
  var spans = d.getElementsByTagName('span');
  d.style.color = color;
  if (spans.length >= 2) {
    spans[0].textContent = numStr;
    spans[1].textContent = lblStr;
  } else {
    d.textContent = numStr + ' ' + lblStr;
  }
}

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
        _setMeasDiff(d, diffStr, '[正常]', '#4ADE80');
      } else {
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
        const color = (diff >= 1.80 && diff <= 2.00) ? '#fff' : '#ff9800';
        _setMeasDiff(d, diffStr, '[' + label + dir + ']', color);
      }
    } else { _setMeasDiff(d, '—', '', ''); }
  });
}

// === MEAS CLEAR / RESET ===
function clearMeasInput(btn, ph) {
  var inp = btn.parentNode.querySelector('.meas-in');
  if (inp) inp.value = '';
  measCalc(ph);
}

function clearMeasCol(ph, col) {
  ['on','off'].forEach(row => {
    var el = document.getElementById('m' + ph + '_' + row + '_' + col);
    if (el) el.value = '';
  });
  measCalc(ph);
}

function resetAllMeas() {
  if (!confirm('三相測定の全入力をリセットしますか？')) return;
  ['u','v','w'].forEach(ph => {
    ['r','a','b'].forEach(col => {
      ['on','off'].forEach(row => {
        var el = document.getElementById('m' + ph + '_' + row + '_' + col);
        if (el) el.value = '';
      });
      var d = document.getElementById('m' + ph + '_d_' + col);
      if (d) _setMeasDiff(d, '—', '', '');
    });
  });
  showToast('三相測定をリセットしました');
}
// === MEAS SAVE / LOG ===
var MEAS_STORE_KEY = 'meas_history';
var _measHistMode  = false;
var _measSelIdx    = -1;
var _measSaveStatus = '完成時';
var _measPendingData = null;

function _measLoadHistory() {
  try { var r = localStorage.getItem(MEAS_STORE_KEY); return r ? JSON.parse(r) : []; } catch(e) { return []; }
}
function _measSaveHistory(arr) {
  try { localStorage.setItem(MEAS_STORE_KEY, JSON.stringify(arr)); } catch(e) {}
}

// Gist から取得してローカルとマージ
async function _measFetchFromGist() {
  var pat = (getMailboxCfg && getMailboxCfg().pat) || '';
  if (!pat) return;  // PAT未設定はスキップ
  try {
    var res = await fetch(MEAS_HIST_GIST_URL + '?t=' + Date.now());
    if (!res.ok) return;
    var remote = await res.json();
    if (!Array.isArray(remote)) return;
    // ローカルとリモートをマージ（memo+dateをキーに重複除去、新しい順）
    var local = _measLoadHistory();
    var seen  = new Set();
    var merged = [];
    remote.concat(local).forEach(function(it) {
      var k = it.date + '|' + it.memo;
      if (!seen.has(k)) { seen.add(k); merged.push(it); }
    });
    merged.sort(function(a,b){ return b.date < a.date ? -1 : 1; });
    if (merged.length > 50) merged = merged.slice(0, 50);
    _measSaveHistory(merged);
  } catch(e) { console.warn('meas fetch failed:', e.message); }
}

// Gist に書き込む
async function _measSyncToGist(arr) {
  var pat = (getMailboxCfg && getMailboxCfg().pat) || '';
  if (!pat) return;
  try {
    var res = await fetch('https://api.github.com/gists/' + MEAS_GIST_ID, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + pat,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: { 'meas_history.json': { content: JSON.stringify(arr, null, 2) } }
      })
    });
    if (!res.ok) throw new Error('patch failed ' + res.status);
  } catch(e) { console.warn('meas sync failed:', e.message); }
}

function measSave() {
  var ph, col, onEl, offEl, onV, offV, diff, hasAny = false;
  var data = { date: '', memo: '', phases: {} };
  var now = new Date();
  data.date = now.getFullYear() + '/' +
    ('0'+(now.getMonth()+1)).slice(-2) + '/' +
    ('0'+now.getDate()).slice(-2) + ' ' +
    ('0'+now.getHours()).slice(-2) + ':' +
    ('0'+now.getMinutes()).slice(-2);

  ['u','v','w'].forEach(function(p) {
    data.phases[p] = {};
    ['r','a','b'].forEach(function(c) {
      onEl  = document.getElementById('m' + p + '_on_'  + c);
      offEl = document.getElementById('m' + p + '_off_' + c);
      onV   = onEl  ? onEl.value  : '';
      offV  = offEl ? offEl.value : '';
      diff  = '';
      if (onV !== '' && offV !== '') {
        diff = (Math.round((parseFloat(onV) - parseFloat(offV)) * 1000) / 1000).toFixed(2);
        hasAny = true;
      }
      data.phases[p][c] = { on: onV, off: offV, diff: diff };
    });
  });

  if (!hasAny) { showToast('入力がありません'); return; }
  _measPendingData = data;
  _measSaveStatus  = '完成時';

  var sp = document.getElementById('measSavePanel');
  if (sp) sp.classList.add('show');
  var ki = document.getElementById('measKibanIn');
  if (ki) { ki.value = ''; ki.focus(); }
  _measRefreshSaveStatus();
}

function _measRefreshSaveStatus() {
  var btns = document.getElementById('measSaveStatusRow');
  if (!btns) return;
  Array.prototype.forEach.call(btns.querySelectorAll('button'), function(b) {
    b.classList.toggle('sel', b.getAttribute('data-status') === _measSaveStatus);
  });
}

function measCloseSavePanel() {
  _measPendingData = null;
  var sp = document.getElementById('measSavePanel');
  if (sp) sp.classList.remove('show');
}

function measConfirmSave() {
  if (!_measPendingData) return;
  var ki = document.getElementById('measKibanIn');
  var kiban = ki ? ki.value.trim() : '';
  if (!kiban) { showToast('機番を入力してください'); if(ki) ki.focus(); return; }

  _measPendingData.memo   = '機番 ' + kiban + '　' + _measSaveStatus;
  _measPendingData.kiban  = kiban;
  _measPendingData.status = _measSaveStatus;

  var arr = _measLoadHistory();
  arr.unshift(_measPendingData);
  if (arr.length > 50) arr = arr.slice(0, 50);
  _measSaveHistory(arr);
  measCloseSavePanel();
  showToast('保存しました');
  _measSyncToGist(arr);  // Gistに非同期で書き込む
}

function measToggleHist() {
  _measHistMode = !_measHistMode;
  var hv  = document.getElementById('measHistView');
  var mc  = document.querySelector('#calcPg1 .meas-container');
  var btn = document.getElementById('measLogBtn');
  if (!hv) return;
  if (_measHistMode) {
    if (mc)  mc.style.visibility = 'hidden';
    hv.classList.remove('hidden');
    if (btn) btn.classList.add('active');
    _measSelIdx = -1;
    _measRenderSidebar();
    // Gistから最新を取得してサイドバーを更新
    _measFetchFromGist().then(function() { _measRenderSidebar(); });
  } else {
    hv.classList.add('hidden');
    if (mc)  mc.style.visibility = '';
    if (btn) btn.classList.remove('active');
  }
}

function _measEsc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _measRenderSidebar() {
  var arr  = _measLoadHistory();
  var list = document.getElementById('measHistList');
  if (!list) return;
  if (arr.length === 0) {
    list.innerHTML = '<div class="meas-hist-empty-msg">保存データなし</div>';
    return;
  }
  var html = '';
  arr.forEach(function(it, i) {
    html += '<div class="meas-hist-item' + (i === _measSelIdx ? ' selected' : '') + '" data-idx="' + i + '">'
          + '<button class="meas-hist-del" data-didx="' + i + '">×</button>'
          + '<div class="meas-hist-item-date">' + _measEsc(it.date) + '</div>'
          + '<div class="meas-hist-item-memo">' + _measEsc(it.memo) + '</div>'
          + '</div>';
  });
  list.innerHTML = html;

  list.onclick = function(e) {
    var del = e.target.getAttribute('data-didx');
    if (del !== null) { _measDeleteHist(parseInt(del)); return; }
    var item = e.target.closest('.meas-hist-item');
    if (item) {
      _measSelIdx = parseInt(item.getAttribute('data-idx'));
      _measRenderSidebar();
      _measRenderDetail(_measSelIdx);
    }
  };
  if (_measSelIdx >= 0 && _measSelIdx < arr.length) _measRenderDetail(_measSelIdx);
}

function _measDeleteHist(idx) {
  if (!confirm('この記録を削除しますか？')) return;
  var arr = _measLoadHistory();
  arr.splice(idx, 1);
  _measSaveHistory(arr);
  _measSyncToGist(arr);  // Gistも更新
  if (_measSelIdx >= arr.length) _measSelIdx = arr.length - 1;
  _measRenderSidebar();
  if (_measSelIdx < 0) document.getElementById('measHistDetail').innerHTML = '<div class="meas-hist-empty">← 履歴を選択</div>';
}

function _measRenderDetail(idx) {
  var arr = _measLoadHistory();
  if (idx < 0 || idx >= arr.length) return;
  var it = arr[idx];
  var PH = ['u','v','w'], phNames = {u:'U相',v:'V相',w:'W相'};
  var phColors = {u:'hr-ph-u',v:'hr-ph-v',w:'hr-ph-w'};
  var html = '<div class="meas-hist-det-date">' + _measEsc(it.date) + '</div>'
           + '<div class="meas-hist-det-memo">' + _measEsc(it.memo) + '</div>';
  PH.forEach(function(ph) {
    html += '<div class="hr-ph-hd ' + phColors[ph] + '">' + phNames[ph] + '</div>';
    html += '<table class="hr-tbl"><thead><tr><th style="width:20%"></th><th>R</th><th></th><th>A</th><th>B</th></tr></thead><tbody>';
    [['ON','on'],['OFF','off'],['差数','diff']].forEach(function(row) {
      html += '<tr><td class="lbl">' + row[0] + '</td>';
      ['r','a','b'].forEach(function(col, ci) {
        var dv = it.phases[ph] && it.phases[ph][col] ? it.phases[ph][col][row[1]] : '';
        if (row[1] === 'diff' && dv !== '') {
          var dn = parseFloat(dv);
          var cls = dn >= 1.83 && dn <= 1.97 ? 'diff-ok' : dn >= 1.80 && dn <= 2.00 ? 'diff-warn' : 'diff-ng';
          html += '<td class="' + cls + '">' + _measEsc(dv) + '</td>';
        } else {
          html += '<td>' + _measEsc(dv || '—') + '</td>';
        }
        if (ci === 0) {
          var sepLbl = row[1] === 'on' ? 'OFF' : row[1] === 'off' ? 'ON' : '';
          html += sepLbl ? '<td class="sep-lbl-log">' + sepLbl + '</td>' : '<td></td>';
        }
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
  });
  document.getElementById('measHistDetail').innerHTML = html;
}

// 状態ボタン委譲
(function() {
  document.addEventListener('click', function(e) {
    var srow = document.getElementById('measSaveStatusRow');
    if (srow && srow.contains(e.target) && e.target.tagName === 'BUTTON') {
      _measSaveStatus = e.target.getAttribute('data-status');
      _measRefreshSaveStatus();
    }
  });
})();

// === MEAS AUTO DECIMAL (meas.html方式: 2桁整数+小数) ===
function autoDecimalMeas(inp, ph) {
  var raw = inp.value;
  var neg = raw.charAt(0) === '-';
  var digits = raw.replace(/[^0-9]/g, '').replace(/^0+/, '') || '';
  var formatted;
  if (digits.length === 0) {
    formatted = neg ? '-' : '';
  } else if (digits.length <= 2) {
    formatted = digits;
  } else {
    formatted = digits.slice(0, 2) + '.' + digits.slice(2);
  }
  if (neg && formatted && formatted !== '-') formatted = '-' + formatted;
  inp.value = formatted;
  var len = formatted.length;
  setTimeout(function() {
    try { inp.setSelectionRange(len, len); } catch(e) {}
  }, 0);
  measCalc(ph);
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


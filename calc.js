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

// === CALC PAGE SWIPE ===
let _calcPgIdx = 0;
function calcPgGoto(idx) { calcPgSwitch(idx - _calcPgIdx); }
function calcPgSwitch(dir) {
  _calcPgIdx = (_calcPgIdx + dir + 3) % 3;
  // 測定ページ（埋め込みの meas.html）は初めて開いた時に読み込む
  const mf = document.getElementById('calcMeasFrame');
  if (_calcPgIdx === 1 && mf && !mf.src) mf.src = mf.dataset.src;
  ['calcPg0','calcPg1','calcPg2'].forEach((id,i) => {
    const el = document.getElementById(id);
    const dot = document.getElementById('cdot'+i);
    if (el) { el.classList.remove('pg-left','pg-right'); if(i!==_calcPgIdx) el.classList.add(i<_calcPgIdx?'pg-left':'pg-right'); }
    if (dot) dot.classList.toggle('on', i===_calcPgIdx);
  });
}
(function initSwipe(){
  let sx=0, sy=0, st=0;
  const w=document.getElementById('calcPgWrap');
  if(!w) return;
  w.addEventListener('touchstart', e=>{
    sx=e.touches[0].clientX; sy=e.touches[0].clientY; st=Date.now();
  },{passive:true});
  w.addEventListener('touchend', e=>{
    const dx=e.changedTouches[0].clientX-sx;
    const dy=e.changedTouches[0].clientY-sy;
    const dt=Date.now()-st;
    // 誤操作対策（厳しめ）：しっかりした距離＋横方向が縦の3倍以上＋0.4秒以内の
    // はっきり速いフリックだけ切替を発火させる（タップのズレや縦スクロールでは反応しない）
    if(Math.abs(dx)>96 && Math.abs(dx)>Math.abs(dy)*3 && dt<400){
      calcPgSwitch(dx<0?1:-1);
    }
  },{passive:true});
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

// ===== GAME MODE (オセロ) =====
const OTH_CORNERS = new Set([0,7,56,63]);
const OTH_DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const OTH_CMT = {
  start:        ['さあ始めますわよ。負けませんよ','あなたが相手なら本気出しますわ','オセロ、なかなか得意なんですよね実は'],
  corner_got:   ['フフ、角いただきましたわ〜。もう詰みでは？','角ゲット。手加減するか迷ってますわ','あーあ、角取られましたねえ。合掌🙏'],
  corner_lost:  ['あっ！角取るとかズルないですか！？（ズルくないけど）','そこ取りますか…なかなかやりますやんか','角とられた。信じられへんわ本当に'],
  ai_lead:      ['このままいったらわたしの勝ちですわ。諦めます？','形勢有利すぎてちょっと申し訳ないかも。ちょっとだけ','もう終わりが見えてきましたわ〜'],
  player_lead:  ['ぐぬぬ…なんで負けてるんですかわたし','これ本気出したら勝てますから！本気出してないだけですから！','運がよかっただけですわ。次は許しませんよ'],
  even:         ['いい勝負ですわね。でも最後は負けさせませんよ','接戦やけど油断してませんから','どっちに転ぶかわかりませんわ〜ドキドキしますわ'],
  pass_player:  ['打つとこないんですか。かわいそうに','パスですか。まあ仕方ないですわね','ないですよね〜打つとこ。フフ'],
  pass_ai:      ['あら、わたしがパスですか。負けてへんし！','パスしますけど負けませんよ。まだまだ','ちっ、打てないですわ…（小声）'],
  win:          ['わたしの勝ちですわ！気持ちよか〜！','勝ちましたー！やっぱりリマちゃん最強でしたわ','ふふ、お疲れ様でした。完敗ですわよ'],
  lose:         ['…負けた。信じられへんわ本当に','まぐれですよ！絶対まぐれですから！','くっ…次は絶対勝ちますから覚えといてください'],
  draw:         ['あら引き分けですか。まあ負けてないからええですわ','引き分けか〜。なんかスッキリしないですわね'],
};
function othCmt(key){ const p=OTH_CMT[key]; return p[Math.floor(Math.random()*p.length)]; }

let _oth = {};
function othIdx(r,c){ return r*8+c; }
function othFlips(board,r,c,col){
  const flips=[];
  for(const [dr,dc] of OTH_DIRS){
    const line=[]; let nr=r+dr,nc=c+dc;
    while(nr>=0&&nr<8&&nc>=0&&nc<8&&board[othIdx(nr,nc)]===-col){ line.push(othIdx(nr,nc)); nr+=dr; nc+=dc; }
    if(nr>=0&&nr<8&&nc>=0&&nc<8&&board[othIdx(nr,nc)]===col&&line.length) flips.push(...line);
  }
  return flips;
}
function othValidMoves(board,col){
  const moves=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++)
    if(!board[othIdx(r,c)]&&othFlips(board,r,c,col).length) moves.push([r,c]);
  return moves;
}
// 難易度: 'easy' / 'normal' / 'hard'
const OTH_WEIGHT = [
  120,-20, 20,  5,  5, 20,-20,120,
  -20,-40, -5, -5, -5, -5,-40,-20,
   20, -5, 15,  3,  3, 15, -5, 20,
    5, -5,  3,  3,  3,  3, -5,  5,
    5, -5,  3,  3,  3,  3, -5,  5,
   20, -5, 15,  3,  3, 15, -5, 20,
  -20,-40, -5, -5, -5, -5,-40,-20,
  120,-20, 20,  5,  5, 20,-20,120,
];

function othScore(board, col){
  let s=0;
  for(let i=0;i<64;i++) s+=board[i]*col*OTH_WEIGHT[i];
  return s;
}

function othMinimax(board, col, depth, alpha, beta){
  const moves=othValidMoves(board,col);
  if(depth===0||(!moves.length&&!othValidMoves(board,-col).length)){
    let s=0; for(let i=0;i<64;i++) s+=board[i]*-1*OTH_WEIGHT[i]; return s;
  }
  if(!moves.length) return othMinimax(board,-col,depth,alpha,beta);
  if(col===-1){
    let best=-Infinity;
    for(const [r,c] of moves){
      const nb=board.slice(); nb[othIdx(r,c)]=-1; othFlips(nb,r,c,-1).forEach(i=>nb[i]=-1);
      best=Math.max(best,othMinimax(nb,1,depth-1,alpha,beta));
      alpha=Math.max(alpha,best); if(beta<=alpha) break;
    }
    return best;
  } else {
    let best=Infinity;
    for(const [r,c] of moves){
      const nb=board.slice(); nb[othIdx(r,c)]=1; othFlips(nb,r,c,1).forEach(i=>nb[i]=1);
      best=Math.min(best,othMinimax(nb,-1,depth-1,alpha,beta));
      beta=Math.min(beta,best); if(beta<=alpha) break;
    }
    return best;
  }
}

function othAiMove(board){
  const moves=othValidMoves(board,-1);
  if(!moves.length) return null;
  const diff=_oth.difficulty||'normal';

  // EASY: 重みマップ使うが角だけ優先、たまにランダム
  if(diff==='easy'){
    for(const [r,c] of moves) if(OTH_CORNERS.has(othIdx(r,c))) return [r,c];
    if(Math.random()<0.4) return moves[Math.floor(Math.random()*moves.length)];
    let best=null,bestS=-Infinity;
    for(const [r,c] of moves){ const s=OTH_WEIGHT[othIdx(r,c)]; if(s>bestS){bestS=s;best=[r,c];} }
    return best||moves[0];
  }

  // NORMAL: 重みマップ＋2手先読み
  if(diff==='normal'){
    let best=null,bestS=-Infinity;
    for(const [r,c] of moves){
      const nb=board.slice(); nb[othIdx(r,c)]=-1; othFlips(nb,r,c,-1).forEach(i=>nb[i]=-1);
      const s=othMinimax(nb,1,2,-Infinity,Infinity);
      if(s>bestS){bestS=s;best=[r,c];}
    }
    return best||moves[0];
  }

  // HARD: アルファベータ枝刈り 5手先読み
  let best=null,bestS=-Infinity;
  for(const [r,c] of moves){
    const nb=board.slice(); nb[othIdx(r,c)]=-1; othFlips(nb,r,c,-1).forEach(i=>nb[i]=-1);
    const s=othMinimax(nb,1,5,-Infinity,Infinity);
    if(s>bestS){bestS=s;best=[r,c];}
  }
  return best||moves[0];
}


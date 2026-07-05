// ========== 麻雀 CPU対戦 ==========

// --- 牌定義 ---
const MJ_TYPES = [
  'm1','m2','m3','m4','m5','m6','m7','m8','m9',
  'p1','p2','p3','p4','p5','p6','p7','p8','p9',
  's1','s2','s3','s4','s5','s6','s7','s8','s9',
  'z1','z2','z3','z4','z5','z6','z7'
];
const MJ_KANJI = ['一','二','三','四','五','六','七','八','九'];
const MJ_HONOR = {z1:'東',z2:'南',z3:'西',z4:'北',z5:'白',z6:'発',z7:'中'};

// --- 牌デザイン: 筒子/索子のピップ配置 (0-100スケール、1は特殊絵柄なので対象外) ---
const MJ_PIP_LAYOUTS = {
  2: [[50,15],[50,85]],
  3: [[50,15],[50,50],[50,85]],
  4: [[25,15],[75,15],[25,85],[75,85]],
  5: [[25,15],[75,15],[50,50],[25,85],[75,85]],
  6: [[25,15],[25,50],[25,85],[75,15],[75,50],[75,85]],
  7: [[25,15],[25,50],[25,85],[75,15],[75,50],[75,85],[50,30]],
  8: [[25,12],[25,37],[25,63],[25,88],[75,12],[75,37],[75,63],[75,88]],
  9: [[25,15],[50,15],[75,15],[25,50],[50,50],[75,50],[25,85],[50,85],[75,85]],
};

// 筒子1: リマちゃん本人
const MJ_RIMA_SVG = `<svg viewBox="0 0 100 100"><circle cx="50" cy="56" r="44" fill="#F0EBE6"/><circle cx="33" cy="44" r="3.5" fill="#1A1614"/><circle cx="59" cy="44" r="3.5" fill="#1A1614"/><path d="M39 54 Q46 58 53 54" stroke="#1A1614" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;

// 索子1: リマちゃん風の鳥マーク
const MJ_BIRD_SVG = `<svg viewBox="0 0 100 100"><path d="M28 40 Q20 22 38 20 Q35 32 32 38 Z" fill="#F0EBE6" stroke="#1A1614" stroke-width="2.5"/><circle cx="50" cy="58" r="32" fill="#F0EBE6" stroke="#1A1614" stroke-width="1"/><path d="M76 52 L92 47 L76 62 Z" fill="#1A1614"/><circle cx="61" cy="47" r="3.5" fill="#1A1614"/><path d="M22 66 Q8 64 13 80" stroke="#1A1614" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;

function mjPinFace(num) {
  if (num === 1) return MJ_RIMA_SVG;
  const pts = MJ_PIP_LAYOUTS[num] || [];
  const dots = pts.map(([x,y]) =>
    `<circle cx="${x}" cy="${y}" r="9" fill="#186038"/><circle cx="${x-2.5}" cy="${y-2.5}" r="2.5" fill="#5FA377" opacity="0.6"/>`
  ).join('');
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${dots}</svg>`;
}

function mjSouFace(num) {
  if (num === 1) return MJ_BIRD_SVG;
  const pts = MJ_PIP_LAYOUTS[num] || [];
  const bars = pts.map(([x,y]) =>
    `<rect x="${x-6}" y="${y-13}" width="12" height="26" rx="4" fill="#183878"/><rect x="${x-2}" y="${y-9}" width="4" height="6" rx="1.5" fill="#5B79B8" opacity="0.7"/>`
  ).join('');
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${bars}</svg>`;
}

let _mj = null;

// --- セットアップ画面 ---
function initMahjong() {
  document.getElementById('gamePanel').innerHTML = `
    <div class="game-title">🀄 麻雀 CPU対戦</div>
    <div class="oth-comment" style="margin-bottom:14px;">リマちゃんと麻雀で対決！</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
      <span style="font-size:12px;color:var(--text-sub);flex-shrink:0;width:80px;">あなたの名前</span>
      <input class="form-input" id="mjPlayerName" value="おじさん" style="font-size:14px;padding:9px 12px;">
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:18px;">
      <span style="font-size:12px;color:var(--text-sub);flex-shrink:0;width:80px;">局数</span>
      <select class="form-input" id="mjRounds" style="font-size:14px;padding:9px 12px;">
        <option value="1">1局</option>
        <option value="4" selected>4局</option>
        <option value="8">8局</option>
      </select>
    </div>
    <button class="btn btn-accent" onclick="mjStartGame()">対局スタート！</button>
    <div style="margin-top:10px;">
      <button class="game-back-btn" style="width:100%;" onclick="openGameModeMenu()">戻る</button>
    </div>`;
}

function mjStartGame() {
  const name = (document.getElementById('mjPlayerName')?.value||'').trim()||'あなた';
  const rnd  = parseInt(document.getElementById('mjRounds')?.value||'4');
  mjNewRound({ playerName:name, scores:[0,0], round:1, totalRounds:rnd, firstPlayer:0 });
}

// --- 局の開始 ---
function mjNewRound(cfg) {
  const deck = [];
  for (const t of MJ_TYPES) for (let i=0;i<4;i++) deck.push(t);
  for (let i=deck.length-1;i>0;i--) {
    const j = Math.floor(Math.random()*(i+1));
    [deck[i],deck[j]] = [deck[j],deck[i]];
  }
  const ph  = deck.splice(0,13).sort(mjSort);
  const cpu = deck.splice(0,13).sort(mjSort);

  _mj = {
    wall:        deck,
    hands:       [ph, cpu],  // 0=プレイヤー, 1=CPU
    discards:    [[], []],
    drawn:       null,
    phase:       'init',
    selected:    -1,
    pendingDiscard: null,
    winner:      -1,
    winType:     '',
    scores:      cfg.scores,
    playerName:  cfg.playerName,
    round:       cfg.round,
    totalRounds: cfg.totalRounds,
    firstPlayer: cfg.firstPlayer,
    thinking:    false,
  };

  if (cfg.firstPlayer === 0) {
    mjPlayerDraw();
  } else {
    _mj.phase = 'cpu_thinking';
    renderMahjong();
    setTimeout(mjCpuAutoTurn, 1000);
  }
}

// --- ツモ処理 ---
function mjPlayerDraw() {
  if (!_mj || _mj.wall.length === 0) {
    _mj.phase = 'ryukyoku'; renderMahjong(); return;
  }
  _mj.drawn    = _mj.wall.splice(0,1)[0];
  _mj.selected = -1;
  const full   = [..._mj.hands[0], _mj.drawn];
  _mj.phase    = mjCheckWin(full) ? 'player_tsumo' : 'player_turn';
  renderMahjong();
}

// --- プレイヤーアクション ---
function mjSelectTile(idx) {
  if (_mj.phase !== 'player_turn') return;
  _mj.selected = (_mj.selected === idx) ? -2 : idx;
  renderMahjong();
}

function mjConfirmDiscard() {
  if (_mj.selected < -1) return;
  mjDoPlayerDiscard(_mj.selected);
}

function mjDoPlayerDiscard(idx) {
  let discarded;
  if (idx === -1) {
    discarded = _mj.drawn;
    _mj.drawn = null;
  } else {
    discarded = _mj.hands[0].splice(idx, 1)[0];
    _mj.hands[0].push(_mj.drawn);
    _mj.hands[0].sort(mjSort);
    _mj.drawn = null;
  }
  _mj.discards[0].push(discarded);
  _mj.selected = -2;

  // CPUのロンチェック
  if (mjCheckWin([..._mj.hands[1], discarded])) {
    _mj.phase   = 'cpu_ron';
    _mj.thinking = true;
    _mj.pendingDiscard = discarded;
    renderMahjong();
    setTimeout(() => {
      _mj.hands[1].push(discarded);
      _mj.hands[1].sort(mjSort);
      _mj.winner   = 1;
      _mj.winType  = 'ron';
      _mj.scores[1]++;
      _mj.phase    = 'end';
      _mj.thinking = false;
      renderMahjong();
    }, 1000);
    return;
  }

  _mj.phase = 'cpu_thinking';
  renderMahjong();
  setTimeout(mjCpuAutoTurn, 600 + Math.random()*600);
}

function mjDeclareTsumo() {
  const p = _mj.hands[0];
  p.push(_mj.drawn);
  p.sort(mjSort);
  _mj.drawn   = null;
  _mj.winner  = 0;
  _mj.winType = 'tsumo';
  _mj.scores[0]++;
  _mj.phase   = 'end';
  renderMahjong();
}

function mjSkipTsumo() {
  _mj.phase = 'player_turn';
  renderMahjong();
}

function mjDeclareRon() {
  const tile = _mj.pendingDiscard;
  if (!mjCheckWin([..._mj.hands[0], tile])) return;
  _mj.hands[0].push(tile);
  _mj.hands[0].sort(mjSort);
  _mj.winner   = 0;
  _mj.winType  = 'ron';
  _mj.scores[0]++;
  _mj.phase    = 'end';
  _mj.pendingDiscard = null;
  renderMahjong();
}

function mjSkipRon() {
  _mj.pendingDiscard = null;
  mjPlayerDraw();
}

// --- CPU自動ターン ---
function mjCpuAutoTurn() {
  if (!_mj || _mj.phase !== 'cpu_thinking') return;

  if (_mj.wall.length === 0) { _mj.phase='ryukyoku'; renderMahjong(); return; }

  const drawn    = _mj.wall.splice(0,1)[0];
  const fullHand = [..._mj.hands[1], drawn];

  // CPUツモ判定
  if (mjCheckWin(fullHand)) {
    _mj.hands[1] = fullHand.sort(mjSort);
    _mj.winner   = 1;
    _mj.winType  = 'tsumo';
    _mj.scores[1]++;
    _mj.phase    = 'end';
    renderMahjong();
    return;
  }

  // CPU最適切り
  const discard = mjCpuBestDiscard(fullHand);
  const di = fullHand.indexOf(discard);
  _mj.hands[1] = [...fullHand.slice(0,di), ...fullHand.slice(di+1)].sort(mjSort);
  _mj.discards[1].push(discard);

  // プレイヤーロン確認
  if (mjCheckWin([..._mj.hands[0], discard])) {
    _mj.pendingDiscard = discard;
    _mj.phase = 'ron_check';
    renderMahjong();
    return;
  }

  mjPlayerDraw();
}

// --- 次の局・終局 ---
function mjNextRound() {
  if (_mj.round >= _mj.totalRounds) { mjFinalResult(); return; }
  mjNewRound({
    playerName:  _mj.playerName,
    scores:      _mj.scores,
    round:       _mj.round + 1,
    totalRounds: _mj.totalRounds,
    firstPlayer: 1 - _mj.firstPlayer,
  });
}

function mjFinalResult() {
  const [sp, sc] = _mj.scores;
  const msg = sp > sc ? `🎉 ${_mj.playerName}の勝ち！` :
              sc > sp ? '😵 リマちゃんの勝ち...' : '引き分け！';
  document.getElementById('gamePanel').innerHTML = `
    <div class="game-title">🀄 麻雀 CPU対戦 — 終局</div>
    <div class="mj-final-box">
      <div class="mj-final-row">
        <div class="mj-final-player${sp>sc?' mj-final-winner':''}">
          <div class="mj-final-name">${_mj.playerName}</div>
          <div class="mj-final-score">${sp}<span>勝</span></div>
        </div>
        <div class="mj-final-vs">VS</div>
        <div class="mj-final-player${sc>sp?' mj-final-winner':''}">
          <div class="mj-final-name">リマちゃん</div>
          <div class="mj-final-score">${sc}<span>勝</span></div>
        </div>
      </div>
      <div class="mj-final-msg">${msg}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px;">
      <button class="btn btn-accent" onclick="initMahjong()">もう一度</button>
      <button class="btn btn-secondary" onclick="openGameModeMenu()">ゲーム選択へ</button>
      <button class="game-back-btn" style="width:100%;margin-top:2px;" onclick="closeGame()">とじる</button>
    </div>`;
}

// ============================================================
//  上がり判定 (ロジックは同じ)
// ============================================================
function mjSort(a, b) {
  const o = {m:0,p:1,s:2,z:3};
  const sa = o[a[0]], sb = o[b[0]];
  if (sa !== sb) return sa-sb;
  return parseInt(a.slice(1)) - parseInt(b.slice(1));
}

function mjRemN(arr, val, n) {
  let c = 0;
  return arr.filter(t => !(t === val && c++ < n));
}

function mjCheckWin(tiles14) {
  if (tiles14.length !== 14) return false;
  const s = [...tiles14].sort(mjSort);
  return mjChiitoi(s) || mjStandard(s);
}

function mjChiitoi(s) {
  const cnt = {};
  for (const t of s) cnt[t] = (cnt[t]||0)+1;
  const keys = Object.keys(cnt);
  return keys.length === 7 && keys.every(k => cnt[k] === 2);
}

function mjStandard(s) {
  const tried = new Set();
  for (const head of s) {
    if (tried.has(head)) continue;
    tried.add(head);
    if (s.filter(t=>t===head).length < 2) continue;
    if (mjSets(mjRemN(s, head, 2))) return true;
  }
  return false;
}

function mjSets(tiles) {
  if (tiles.length === 0) return true;
  if (tiles.length % 3 !== 0) return false;
  const s = [...tiles].sort(mjSort);
  const first = s[0];
  if (s.filter(t=>t===first).length >= 3) {
    if (mjSets(mjRemN(s, first, 3))) return true;
  }
  const suit = first[0], num = parseInt(first.slice(1));
  if ('mps'.includes(suit) && num <= 7) {
    const t2 = suit+(num+1), t3 = suit+(num+2);
    if (s.includes(t2) && s.includes(t3)) {
      let r = mjRemN(s, first, 1);
      r = mjRemN(r, t2, 1);
      r = mjRemN(r, t3, 1);
      if (mjSets(r)) return true;
    }
  }
  return false;
}

function mjWaiting(hand13) {
  return MJ_TYPES.filter(t => mjCheckWin([...hand13, t]));
}

// ============================================================
//  CPU AI
// ============================================================
function mjCpuScore(hand13) {
  // 聴牌ならば最高点
  const waits = mjWaiting(hand13);
  if (waits.length > 0) return 1000 + waits.length * 10;

  const s    = [...hand13].sort(mjSort);
  const used = new Array(13).fill(false);
  let score  = 0;

  // 刻子 +30
  for (let i=0; i<s.length-2; i++) {
    if (!used[i] && s[i]===s[i+1] && !used[i+1] && s[i]===s[i+2] && !used[i+2]) {
      score += 30; used[i]=used[i+1]=used[i+2]=true; i+=2;
    }
  }
  // 順子 +30
  for (let i=0; i<s.length; i++) {
    if (used[i]) continue;
    const suit=s[i][0]; if (!'mps'.includes(suit)) continue;
    const num=parseInt(s[i].slice(1));
    const t2=suit+(num+1), t3=suit+(num+2);
    const j=s.findIndex((t,k)=>k>i&&!used[k]&&t===t2);
    if (j<0) continue;
    const k=s.findIndex((t,l)=>l>j&&!used[l]&&t===t3);
    if (k<0) continue;
    score += 30; used[i]=used[j]=used[k]=true;
  }
  // 対子 +10
  for (let i=0; i<s.length-1; i++) {
    if (!used[i] && s[i]===s[i+1] && !used[i+1]) {
      score += 10; used[i]=used[i+1]=true; i++;
    }
  }
  // 両面/嵌張 +5
  for (let i=0; i<s.length-1; i++) {
    if (used[i]) continue;
    const suit=s[i][0]; if (!'mps'.includes(suit)) continue;
    const num=parseInt(s[i].slice(1));
    for (let j=i+1; j<s.length; j++) {
      if (used[j]) continue;
      if (s[j][0]!==suit) break;
      const n2=parseInt(s[j].slice(1));
      if (n2-num<=2) { score+=5; used[i]=used[j]=true; break; }
      if (n2-num>2)  break;
    }
  }
  return score;
}

function mjCpuBestDiscard(hand14) {
  const tried = new Set();
  let best = hand14[0], bestScore = -1;
  for (let i=0; i<hand14.length; i++) {
    if (tried.has(hand14[i])) continue;
    tried.add(hand14[i]);
    const rem = hand14.filter((_,j)=>j!==i);
    const sc  = mjCpuScore(rem);
    if (sc > bestScore) { bestScore=sc; best=hand14[i]; }
  }
  return best;
}

// ============================================================
//  レンダリング
// ============================================================
function renderMahjong() {
  if (!_mj) return;
  const ph = _mj.phase;
  if (ph==='end')       { _renderMjEnd();      mjFitHandRow(); return; }
  if (ph==='ryukyoku')  { _renderMjRyukyoku(); return; }
  if (ph==='ron_check') { _renderMjRonCheck(); mjFitHandRow(); return; }
  _renderMjMain(); mjFitHandRow();
}

// スマホ縦画面でも手牌が横スクロールなしで収まるよう、牌幅を実測して自動調整
function mjFitHandRow() {
  document.querySelectorAll('.mj-hand-row.mj-hand-scroll').forEach(row => {
    const avail = row.clientWidth;
    const n = row.children.length;
    if (!avail || !n) return;
    const hasSep   = !!row.querySelector('.mj-drawn-sep');
    const sepWidth = hasSep ? 8 : 0;
    const tileSlots = hasSep ? n - 1 : n;
    if (tileSlots <= 0) return;
    const gapTotal = 2 * (n - 1);
    let tw = Math.floor((avail - gapTotal - sepWidth) / tileSlots);
    tw = Math.max(15, Math.min(26, tw));
    const th = Math.round(tw * (36 / 26));
    row.style.setProperty('--mj-tw', tw + 'px');
    row.style.setProperty('--mj-th', th + 'px');
  });
}

function mjTileHTML(tile, opts) {
  opts = opts || {};
  const { sel, sm, back, onclick } = opts;
  const smCls = sm  ? ' mj-sm'  : '';
  if (back) return `<div class="mj-tile mj-back${smCls}"></div>`;
  const suit = tile[0], num = parseInt(tile.slice(1));
  const suitCls   = {m:'mj-m',p:'mj-p',s:'mj-s',z:'mj-z'}[suit];
  const dragonCls = (suit==='z'&&num>=5) ? ` mj-d${num}` : '';
  const selCls    = sel ? ' mj-sel' : '';
  const oc        = onclick ? ` onclick="${onclick}"` : '';
  const specialCls = ((suit==='p'||suit==='s') && num===1) ? ' mj-special' : '';

  let inner;
  if (suit==='z') {
    inner = `<span class="mj-t">${MJ_HONOR[tile]}</span>`;
  } else if (suit==='m') {
    inner = `<span class="mj-t">${MJ_KANJI[num-1]}</span><span class="mj-b">萬</span>`;
  } else if (suit==='p') {
    inner = `<span class="mj-face">${mjPinFace(num)}</span>`;
  } else {
    inner = `<span class="mj-face">${mjSouFace(num)}</span>`;
  }
  return `<div class="mj-tile ${suitCls}${dragonCls}${selCls}${smCls}${specialCls}"${oc}>${inner}</div>`;
}

function _mjScoreBar() {
  const [sp,sc] = _mj.scores;
  return `<div class="mj-score-bar">
    <span class="mj-sb-item">${_mj.playerName}&nbsp;<b>${sp}勝</b></span>
    <span class="mj-sb-sep">|</span>
    <span class="mj-sb-item mj-sb-right">リマちゃん&nbsp;<b>${sc}勝</b></span>
    <span class="mj-sb-round">${_mj.round}/${_mj.totalRounds}局</span>
  </div>`;
}

// メインゲーム画面 (player_turn / player_tsumo / cpu_thinking / cpu_ron)
function _renderMjMain() {
  const ph      = _mj.phase;
  const isCpuTurn   = ph==='cpu_thinking'||ph==='cpu_ron';
  const isTsumo     = ph==='player_tsumo';
  const hand        = _mj.hands[0];
  const drawn       = _mj.drawn;
  const cpuHandSize = _mj.hands[1].length + (_mj.drawn&&isCpuTurn?1:0);

  // CPUエリア
  const cpuBackTiles = Array(Math.min(cpuHandSize||13, 13)).fill(0)
    .map(()=>'<div class="mj-tile mj-back mj-sm"></div>').join('');
  const cpuDiscards  = _mj.discards[1].slice(-9).map(t=>mjTileHTML(t,{sm:true})).join('');
  const noDisc = '<span class="mj-empty-disc">まだなし</span>';

  // CPUステータス表示
  let cpuStatus = '';
  if (ph==='cpu_thinking') cpuStatus = `<div class="mj-thinking-badge">CPU考え中<span class="mj-dots">...</span></div>`;
  else if (ph==='cpu_ron') cpuStatus = `<div class="mj-thinking-badge mj-ron-alert">CPUがロン！</div>`;
  else cpuStatus = `<div class="mj-turn-badge">あなたのターン</div>`;

  // プレイヤー手牌
  const handHTML = hand.map((t,i)=>{
    const sel = !isTsumo && _mj.selected===i;
    const oc  = (isCpuTurn||isTsumo) ? '' : `mjSelectTile(${i})`;
    return mjTileHTML(t,{sel, onclick:oc});
  }).join('');

  // ツモ牌
  const drawnSel = !isTsumo && _mj.selected===-1;
  const drawnOC  = (isCpuTurn||isTsumo) ? '' : 'mjSelectTile(-1)';
  const drawnHTML = drawn
    ? `<div class="mj-drawn-sep"></div>${mjTileHTML(drawn,{sel:drawnSel,onclick:drawnOC})}`
    : '';

  // プレイヤー捨て牌
  const myDiscards = _mj.discards[0].slice(-9).map(t=>mjTileHTML(t,{sm:true})).join('');

  // アクションボタン
  let actionHTML = '';
  if (isTsumo) {
    actionHTML = `<div style="display:flex;gap:8px;margin-top:10px;">
      <button class="btn btn-accent" onclick="mjDeclareTsumo()">ツモ！</button>
      <button class="btn btn-secondary" onclick="mjSkipTsumo()">見逃す</button>
    </div>`;
  } else if (!isCpuTurn) {
    const hasSel = _mj.selected >= -1;
    const lbl    = _mj.selected===-1 ? 'ツモ切り' : _mj.selected>=0 ? '捨てる' : '牌を選んでください';
    actionHTML = `<button class="btn btn-accent" style="margin-top:10px;"
      ${hasSel?'':'disabled'} onclick="mjConfirmDiscard()">${lbl}</button>`;
  }

  // 聴牌ヒント
  let tenpaiHTML = '';
  if (!isCpuTurn && !isTsumo) {
    const waits = mjWaiting(hand);
    if (waits.length > 0) {
      const wt = waits.slice(0,6).map(t=>mjTileHTML(t,{sm:true})).join('');
      const more = waits.length>6 ? `<span style="color:var(--text-faint);font-size:11px;">他${waits.length-6}種</span>` : '';
      tenpaiHTML = `<div class="mj-tenpai-hint">聴牌！待ち: ${wt}${more}</div>`;
    }
  }
  if (isTsumo) {
    tenpaiHTML = '';
  }

  document.getElementById('gamePanel').innerHTML = `
    <div class="game-title">🀄 麻雀 CPU対戦 <span style="font-size:10px;color:var(--text-faint);">残${_mj.wall.length}枚</span></div>

    <!-- CPUエリア -->
    <div class="mj-cpu-area">
      <div class="mj-cpu-header">
        <span class="mj-cpu-name">リマちゃん (CPU)</span>
        ${cpuStatus}
      </div>
      <div class="mj-cpu-hand">${cpuBackTiles}</div>
      <div class="mj-discard-section" style="margin-top:6px;">
        <div class="mj-ds-label">CPUの捨て牌</div>
        <div class="mj-disc-row">${cpuDiscards||noDisc}</div>
      </div>
    </div>

    <!-- プレイヤーエリア -->
    <div class="mj-player-area">
      <div class="mj-discard-section">
        <div class="mj-ds-label">あなたの捨て牌</div>
        <div class="mj-disc-row">${myDiscards||noDisc}</div>
      </div>
      <div class="mj-hand-area">
        <div class="mj-hand-label">${isTsumo?'🎉 ツモ！上がれます！':isCpuTurn?'CPUのターン...':'タップで選択 → 捨てる'}</div>
        <div class="mj-hand-row mj-hand-scroll">${handHTML}${drawnHTML}</div>
      </div>
      ${tenpaiHTML}
      ${actionHTML}
    </div>

    ${_mjScoreBar()}`;
}

// ロン確認画面 (CPUが捨てた後)
function _renderMjRonCheck() {
  const tile  = _mj.pendingDiscard;
  const hHTML = _mj.hands[0].map(t=>mjTileHTML(t,{sm:true})).join('');
  document.getElementById('gamePanel').innerHTML = `
    <div class="game-title">🀄 麻雀 CPU対戦</div>
    <div class="mj-cpu-discard-notice">
      <div class="mj-cdn-label">CPUが捨てました</div>
      <div class="mj-cdn-tile">${mjTileHTML(tile)}</div>
      <div class="mj-cdn-ron">ロンできます！</div>
    </div>
    <div class="mj-hand-area" style="margin-top:8px;">
      <div class="mj-hand-label">あなたの手牌</div>
      <div class="mj-hand-row mj-hand-scroll">${hHTML}</div>
    </div>
    <div style="display:flex;gap:8px;margin-top:10px;">
      <button class="btn btn-accent" onclick="mjDeclareRon()">ロン！</button>
      <button class="btn btn-secondary" onclick="mjSkipRon()">スキップ</button>
    </div>
    ${_mjScoreBar()}`;
}

// 上がり画面
function _renderMjEnd() {
  const pWin = _mj.winner === 0;
  const wName  = pWin ? _mj.playerName : 'リマちゃん';
  const wType  = _mj.winType==='ron' ? 'ロン！' : 'ツモ！';
  const wHand  = _mj.hands[_mj.winner].map(t=>mjTileHTML(t)).join('');
  const isLast = _mj.round >= _mj.totalRounds;

  document.getElementById('gamePanel').innerHTML = `
    <div class="game-title">🀄 麻雀 CPU対戦</div>
    <div class="mj-win-box${pWin?'':' mj-cpu-win-box'}">
      <div class="mj-win-name">${wName}</div>
      <div class="mj-win-type">${wType}</div>
    </div>
    <div class="mj-hand-area" style="margin-top:10px;">
      <div class="mj-hand-label">上がり手牌</div>
      <div class="mj-hand-row mj-hand-scroll">${wHand}</div>
    </div>
    ${_mjScoreBar()}
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
      ${isLast
        ? `<button class="btn btn-accent" onclick="mjFinalResult()">最終結果へ</button>`
        : `<button class="btn btn-accent" onclick="mjNextRound()">次の局へ (${_mj.round+1}/${_mj.totalRounds}局)</button>`}
      <button class="game-back-btn" style="width:100%;margin-top:2px;" onclick="openGameModeMenu()">ゲーム選択へ</button>
    </div>`;
}

// 流局
function _renderMjRyukyoku() {
  const isLast = _mj.round >= _mj.totalRounds;
  document.getElementById('gamePanel').innerHTML = `
    <div class="game-title">🀄 麻雀 CPU対戦</div>
    <div class="mj-win-box mj-ryukyoku-box">
      <div class="mj-win-name">流局</div>
      <div class="mj-win-type">牌が尽きました</div>
    </div>
    ${_mjScoreBar()}
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
      ${isLast
        ? `<button class="btn btn-accent" onclick="mjFinalResult()">最終結果へ</button>`
        : `<button class="btn btn-accent" onclick="mjNextRound()">次の局へ</button>`}
      <button class="game-back-btn" style="width:100%;margin-top:2px;" onclick="openGameModeMenu()">ゲーム選択へ</button>
    </div>`;
}

// ========== 二人麻雀 ==========
// 2プレイヤー・同一端末ホットシート方式

// --- 牌定義 ---
const MJ_TYPES = [
  'm1','m2','m3','m4','m5','m6','m7','m8','m9',
  'p1','p2','p3','p4','p5','p6','p7','p8','p9',
  's1','s2','s3','s4','s5','s6','s7','s8','s9',
  'z1','z2','z3','z4','z5','z6','z7'
];

const MJ_KANJI  = ['一','二','三','四','五','六','七','八','九'];
const MJ_HONOR  = {z1:'東',z2:'南',z3:'西',z4:'北',z5:'白',z6:'発',z7:'中'};

let _mj = null;

// --- 初期化・セットアップ ---
function initMahjong() {
  document.getElementById('gamePanel').innerHTML = `
    <div class="game-title">🀄 二人麻雀</div>
    <div class="oth-comment" style="margin-bottom:14px;">プレイヤー名と局数を設定してください</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
      <span style="font-size:12px;color:var(--text-sub);flex-shrink:0;width:80px;">プレイヤー1</span>
      <input class="form-input" id="mjName0" value="プレイヤー1" style="font-size:14px;padding:9px 12px;">
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
      <span style="font-size:12px;color:var(--text-sub);flex-shrink:0;width:80px;">プレイヤー2</span>
      <input class="form-input" id="mjName1" value="プレイヤー2" style="font-size:14px;padding:9px 12px;">
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
  const n0   = (document.getElementById('mjName0')?.value || '').trim() || 'プレイヤー1';
  const n1   = (document.getElementById('mjName1')?.value || '').trim() || 'プレイヤー2';
  const rnd  = parseInt(document.getElementById('mjRounds')?.value || '4');
  mjNewRound({ names:[n0,n1], scores:[0,0], round:1, totalRounds:rnd, firstPlayer:0 });
}

// --- 局の開始 ---
function mjNewRound(cfg) {
  const deck = [];
  for (const t of MJ_TYPES) for (let i=0;i<4;i++) deck.push(t);
  // シャッフル
  for (let i=deck.length-1;i>0;i--) {
    const j = Math.floor(Math.random()*(i+1));
    [deck[i],deck[j]] = [deck[j],deck[i]];
  }
  const fp   = cfg.firstPlayer;
  const hand0 = deck.splice(0,13).sort(mjSort);
  const hand1 = deck.splice(0,13).sort(mjSort);
  const drawn  = deck.splice(0,1)[0]; // 先手の第一ツモ

  _mj = {
    wall:          deck,
    hands:         [hand0, hand1],
    discards:      [[], []],
    turn:          fp,
    drawn:         drawn,
    phase:         'pass2',   // 先手に端末を渡す
    selected:      -1,        // デフォルト: ツモ牌選択
    winner:        -1,
    winType:       '',
    scores:        cfg.scores,
    names:         cfg.names,
    round:         cfg.round,
    totalRounds:   cfg.totalRounds,
    firstPlayer:   fp,
    pendingDiscard: null,
    showHand:      false,
  };
  renderMahjong();
}

// --- 牌ソート ---
function mjSort(a, b) {
  const o = {m:0,p:1,s:2,z:3};
  const sa = o[a[0]], sb = o[b[0]];
  if (sa !== sb) return sa - sb;
  return parseInt(a.slice(1)) - parseInt(b.slice(1));
}

// --- 牌HTML生成 ---
function mjTileHTML(tile, opts) {
  opts = opts || {};
  const { sel, sm, back, onclick } = opts;
  const smCls  = sm   ? ' mj-sm'  : '';
  if (back) return `<div class="mj-tile mj-back${smCls}"></div>`;

  const suit = tile[0];
  const num  = parseInt(tile.slice(1));

  // スーツ別クラス
  const suitCls = {m:'mj-m',p:'mj-p',s:'mj-s',z:'mj-z'}[suit];
  // 三元牌は色が違うので追加クラス
  const dragonCls = (suit==='z' && num>=5) ? ` mj-d${num}` : '';
  const selCls   = sel ? ' mj-sel' : '';
  const oc       = onclick ? ` onclick="${onclick}"` : '';

  let top, bot;
  if (suit === 'z') {
    top = MJ_HONOR[tile]; bot = '';
  } else if (suit === 'm') {
    top = MJ_KANJI[num-1]; bot = '萬';
  } else if (suit === 'p') {
    top = String(num); bot = '筒';
  } else {
    top = String(num); bot = '索';
  }

  return `<div class="mj-tile ${suitCls}${dragonCls}${selCls}${smCls}"${oc}><span class="mj-t">${top}</span><span class="mj-b">${bot}</span></div>`;
}

// --- 上がり判定ユーティリティ ---

// arr から val を n個除去 (最初のn個)
function mjRemN(arr, val, n) {
  let c = 0;
  return arr.filter(t => !(t === val && c++ < n));
}

function mjCheckWin(tiles14) {
  if (tiles14.length !== 14) return false;
  const s = [...tiles14].sort(mjSort);
  return mjChiitoi(s) || mjStandard(s);
}

// 七対子
function mjChiitoi(s) {
  const cnt = {};
  for (const t of s) cnt[t] = (cnt[t]||0)+1;
  const keys = Object.keys(cnt);
  return keys.length === 7 && keys.every(k => cnt[k] === 2);
}

// 通常形(4面子1雀頭)
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

// 面子チェック(再帰)
function mjSets(tiles) {
  if (tiles.length === 0) return true;
  if (tiles.length % 3 !== 0) return false;
  const s = [...tiles].sort(mjSort);
  const first = s[0];

  // 刻子
  if (s.filter(t=>t===first).length >= 3) {
    if (mjSets(mjRemN(s, first, 3))) return true;
  }
  // 順子(m/p/sのみ)
  const suit = first[0];
  const num  = parseInt(first.slice(1));
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

// 聴牌チェック: 13枚の手牌に対して待ち牌リストを返す
function mjWaiting(hand13) {
  return MJ_TYPES.filter(t => mjCheckWin([...hand13, t]));
}

// --- ゲームアクション ---

function mjRevealForTurn() {
  const p = _mj.turn;
  _mj.showHand = true;
  const full = [..._mj.hands[p], _mj.drawn];
  _mj.phase = mjCheckWin(full) ? 'tsumo_check' : 'discard';
  renderMahjong();
}

function mjSelectTile(idx) {
  if (_mj.phase !== 'discard') return;
  _mj.selected = (_mj.selected === idx) ? -2 : idx;
  renderMahjong();
}

function mjConfirmDiscard() {
  if (_mj.selected < -1) return;
  mjDoDiscard(_mj.selected);
}

function mjDoDiscard(idx) {
  const p = _mj.turn;
  let discarded;
  if (idx === -1) {
    // ツモ切り
    discarded = _mj.drawn;
    _mj.drawn = null;
  } else {
    // 手牌から捨てる → ツモ牌を手牌に加える
    discarded = _mj.hands[p].splice(idx, 1)[0];
    _mj.hands[p].push(_mj.drawn);
    _mj.hands[p].sort(mjSort);
    _mj.drawn = null;
  }
  _mj.discards[p].push(discarded);
  _mj.pendingDiscard = discarded;
  _mj.selected = -2;
  _mj.phase = 'pass';    // 相手にロン確認を渡す
  _mj.showHand = false;
  renderMahjong();
}

function mjRevealForRon() {
  _mj.showHand = true;
  renderMahjong();
}

function mjDeclareRon() {
  const opp  = 1 - _mj.turn;
  const tile  = _mj.pendingDiscard;
  if (!mjCheckWin([..._mj.hands[opp], tile])) return;
  _mj.hands[opp].push(tile);
  _mj.hands[opp].sort(mjSort);
  _mj.winner  = opp;
  _mj.winType = 'ron';
  _mj.scores[opp]++;
  _mj.phase   = 'end';
  renderMahjong();
}

function mjSkipRon() {
  _mj.showHand = false;
  _mj.pendingDiscard = null;
  _mj.turn = 1 - _mj.turn;

  if (_mj.wall.length === 0) {
    _mj.phase = 'ryukyoku';
    renderMahjong();
    return;
  }
  _mj.drawn    = _mj.wall.splice(0, 1)[0];
  _mj.selected = -1;
  _mj.phase    = 'pass2';
  renderMahjong();
}

function mjDeclareTsumo() {
  const p = _mj.turn;
  _mj.hands[p].push(_mj.drawn);
  _mj.hands[p].sort(mjSort);
  _mj.drawn   = null;
  _mj.winner  = p;
  _mj.winType = 'tsumo';
  _mj.scores[p]++;
  _mj.phase   = 'end';
  renderMahjong();
}

function mjSkipTsumo() {
  _mj.phase = 'discard';
  renderMahjong();
}

function mjNextRound() {
  if (_mj.round >= _mj.totalRounds) { mjFinalResult(); return; }
  mjNewRound({
    names:       _mj.names,
    scores:      _mj.scores,
    round:       _mj.round + 1,
    totalRounds: _mj.totalRounds,
    firstPlayer: 1 - _mj.firstPlayer,
  });
}

function mjFinalResult() {
  const [s0,s1] = _mj.scores;
  const [n0,n1] = _mj.names;
  const winIdx  = s0>s1 ? 0 : s1>s0 ? 1 : -1;
  document.getElementById('gamePanel').innerHTML = `
    <div class="game-title">🀄 二人麻雀 — 終局</div>
    <div class="mj-final-box">
      <div class="mj-final-row">
        <div class="mj-final-player${winIdx===0?' mj-final-winner':''}">
          <div class="mj-final-name">${n0}</div>
          <div class="mj-final-score">${s0}<span>勝</span></div>
        </div>
        <div class="mj-final-vs">VS</div>
        <div class="mj-final-player${winIdx===1?' mj-final-winner':''}">
          <div class="mj-final-name">${n1}</div>
          <div class="mj-final-score">${s1}<span>勝</span></div>
        </div>
      </div>
      <div class="mj-final-msg">${winIdx>=0 ? `🎉 ${_mj.names[winIdx]}の勝ち！` : '引き分け！'}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px;">
      <button class="btn btn-accent" onclick="initMahjong()">もう一度</button>
      <button class="btn btn-secondary" onclick="openGameModeMenu()">ゲーム選択へ</button>
      <button class="game-back-btn" style="width:100%;margin-top:2px;" onclick="closeGame()">とじる</button>
    </div>`;
}

// --- レンダリング ---
function renderMahjong() {
  if (!_mj) return;
  const ph = _mj.phase;
  if (ph === 'pass')     { _renderMjPass();     return; }
  if (ph === 'pass2')    { _renderMjPass2();    return; }
  if (ph === 'end')      { _renderMjEnd();      return; }
  if (ph === 'ryukyoku') { _renderMjRyukyoku(); return; }
  _renderMjGame(); // discard / tsumo_check
}

function _mjScoreBar() {
  const [s0,s1] = _mj.scores;
  const [n0,n1] = _mj.names;
  return `<div class="mj-score-bar">
    <span class="mj-sb-item">${n0}&nbsp;<b>${s0}勝</b></span>
    <span class="mj-sb-sep">|</span>
    <span class="mj-sb-item mj-sb-right">${n1}&nbsp;<b>${s1}勝</b></span>
    <span class="mj-sb-round">${_mj.round}/${_mj.totalRounds}局</span>
  </div>`;
}

// フェーズ: pass (捨て後 → 相手のロン確認)
function _renderMjPass() {
  const opp     = 1 - _mj.turn;
  const oppName = _mj.names[opp];
  const disName = _mj.names[_mj.turn];
  const tile    = _mj.pendingDiscard;
  const canRon  = tile ? mjCheckWin([..._mj.hands[opp], tile]) : false;

  let handSection;
  if (_mj.showHand) {
    const hHTML = _mj.hands[opp].map(t => mjTileHTML(t,{sm:true})).join('');
    handSection = `
      <div class="mj-hand-area" style="margin-top:8px;">
        <div class="mj-hand-label">あなたの手牌</div>
        <div class="mj-hand-row mj-hand-scroll">${hHTML}</div>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="btn btn-accent" ${canRon?'':' disabled style="opacity:0.45"'} onclick="mjDeclareRon()">
          ロン！${canRon?'':'（不可）'}
        </button>
      </div>
      <button class="game-back-btn" style="width:100%;margin-top:8px;" onclick="mjSkipRon()">スキップ（ロンなし）</button>`;
  } else {
    handSection = `
      <div class="mj-hidden-msg">手牌はまだ見ないでください</div>
      <button class="btn btn-secondary" style="margin-top:10px;" onclick="mjRevealForRon()">手牌を確認する 🀫</button>
      <button class="game-back-btn" style="width:100%;margin-top:8px;" onclick="mjSkipRon()">確認せずスキップ</button>`;
  }

  document.getElementById('gamePanel').innerHTML = `
    <div class="game-title">🀄 二人麻雀</div>
    <div class="mj-pass-card">
      <div class="mj-pass-icon">👤</div>
      <div class="mj-pass-to">${oppName} さんへ</div>
      <div class="mj-pass-sub">${disName}が捨てました</div>
    </div>
    <div class="mj-discard-preview">
      <span class="mj-dp-label">捨て牌</span>
      ${tile ? mjTileHTML(tile) : ''}
      <span class="mj-dp-hint">ロンできますか？</span>
    </div>
    ${handSection}
    ${_mjScoreBar()}`;
}

// フェーズ: pass2 (ツモ前 → 本人に端末を渡す)
function _renderMjPass2() {
  const p     = _mj.turn;
  const pName = _mj.names[p];
  document.getElementById('gamePanel').innerHTML = `
    <div class="game-title">🀄 二人麻雀</div>
    <div class="mj-pass-card">
      <div class="mj-pass-icon">👤</div>
      <div class="mj-pass-to">${pName} さんへ</div>
      <div class="mj-pass-sub">あなたのターンです！端末を受け取ってください</div>
    </div>
    <div class="mj-wall-info">壁牌残り: <b>${_mj.wall.length}</b>枚</div>
    <button class="btn btn-accent" style="margin-top:16px;" onclick="mjRevealForTurn()">手牌を確認する 🀫</button>
    ${_mjScoreBar()}`;
}

// フェーズ: discard / tsumo_check (メインゲーム画面)
function _renderMjGame() {
  const p       = _mj.turn;
  const pName   = _mj.names[p];
  const oppName = _mj.names[1-p];
  const hand    = _mj.hands[p];
  const drawn   = _mj.drawn;
  const isTsumo = _mj.phase === 'tsumo_check';

  // 手牌HTML
  const handHTML = hand.map((t,i) => {
    const sel = !isTsumo && _mj.selected === i;
    const oc  = isTsumo ? '' : `mjSelectTile(${i})`;
    return mjTileHTML(t, {sel, onclick:oc});
  }).join('');

  // ツモ牌HTML
  const drawnSel = !isTsumo && _mj.selected === -1;
  const drawnOC  = isTsumo ? '' : 'mjSelectTile(-1)';
  const drawnHTML = drawn
    ? `<div class="mj-drawn-sep"></div>${mjTileHTML(drawn, {sel:drawnSel, onclick:drawnOC})}`
    : '';

  // 捨て牌 (最大9枚)
  const myDisc  = _mj.discards[p].slice(-9).map(t=>mjTileHTML(t,{sm:true})).join('');
  const oppDisc = _mj.discards[1-p].slice(-9).map(t=>mjTileHTML(t,{sm:true})).join('');
  const noDisc  = '<span class="mj-empty-disc">まだなし</span>';

  // アクションボタン
  let actionHTML;
  if (isTsumo) {
    actionHTML = `
      <div style="display:flex;gap:8px;margin-top:10px;">
        <button class="btn btn-accent" onclick="mjDeclareTsumo()">ツモ！</button>
        <button class="btn btn-secondary" onclick="mjSkipTsumo()">見逃す</button>
      </div>`;
  } else {
    const hasSel  = _mj.selected >= -1;
    const btnLbl  = _mj.selected === -1 ? 'ツモ切り' : _mj.selected >= 0 ? '捨てる' : '牌を選択してください';
    actionHTML = `
      <button class="btn btn-accent" style="margin-top:10px;"
        ${hasSel ? '' : 'disabled style="opacity:0.4"'} onclick="mjConfirmDiscard()">
        ${btnLbl}
      </button>`;
  }

  // 聴牌ヒント
  const waits = mjWaiting(hand); // 13枚手牌の聴牌チェック
  let tenpaiHTML = '';
  if (waits.length > 0 && !isTsumo) {
    const wTiles = waits.slice(0,6).map(t=>mjTileHTML(t,{sm:true})).join('');
    const more   = waits.length > 6 ? `<span style="color:var(--text-faint);font-size:11px;margin-left:2px;">他${waits.length-6}種</span>` : '';
    tenpaiHTML = `<div class="mj-tenpai-hint">聴牌！待ち: ${wTiles}${more}</div>`;
  }

  document.getElementById('gamePanel').innerHTML = `
    <div class="game-title">🀄 ${pName}のターン <span style="font-size:10px;color:var(--text-faint);">残${_mj.wall.length}枚</span></div>

    <div class="mj-discard-section">
      <div class="mj-ds-label">${oppName}の捨て牌</div>
      <div class="mj-disc-row">${oppDisc||noDisc}</div>
    </div>
    <div class="mj-discard-section">
      <div class="mj-ds-label">自分の捨て牌</div>
      <div class="mj-disc-row">${myDisc||noDisc}</div>
    </div>

    <div class="mj-hand-area">
      <div class="mj-hand-label">${isTsumo ? '🎉 ツモ上がり！' : 'タップで選択 → 捨てる'}</div>
      <div class="mj-hand-row mj-hand-scroll">${handHTML}${drawnHTML}</div>
    </div>

    ${tenpaiHTML}
    ${actionHTML}
    ${_mjScoreBar()}`;
}

// フェーズ: end (上がり)
function _renderMjEnd() {
  const w      = _mj.winner;
  const wName  = _mj.names[w];
  const wType  = _mj.winType === 'ron' ? 'ロン！' : 'ツモ！';
  const hHTML  = _mj.hands[w].map(t=>mjTileHTML(t)).join('');
  const isLast = _mj.round >= _mj.totalRounds;

  document.getElementById('gamePanel').innerHTML = `
    <div class="game-title">🀄 二人麻雀</div>
    <div class="mj-win-box">
      <div class="mj-win-name">${wName}</div>
      <div class="mj-win-type">${wType}</div>
    </div>
    <div class="mj-hand-area" style="margin-top:10px;">
      <div class="mj-hand-label">上がり手牌</div>
      <div class="mj-hand-row mj-hand-scroll">${hHTML}</div>
    </div>
    ${_mjScoreBar()}
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
      ${isLast
        ? `<button class="btn btn-accent" onclick="mjFinalResult()">最終結果へ</button>`
        : `<button class="btn btn-accent" onclick="mjNextRound()">次の局へ (${_mj.round+1}/${_mj.totalRounds}局)</button>`}
      <button class="game-back-btn" style="width:100%;margin-top:2px;" onclick="openGameModeMenu()">ゲーム選択へ</button>
    </div>`;
}

// フェーズ: ryukyoku (流局)
function _renderMjRyukyoku() {
  const isLast = _mj.round >= _mj.totalRounds;
  document.getElementById('gamePanel').innerHTML = `
    <div class="game-title">🀄 二人麻雀</div>
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

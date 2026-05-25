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

function openGameMode(){
  if(!document.getElementById('rimaNavArea').classList.contains('rima-open')) return;
  document.getElementById('gameOverlay').classList.add('show');
  document.getElementById('gamePanel').classList.add('show');
  openGameModeMenu();
}
function closeGame(){
  document.getElementById('gameOverlay').classList.remove('show');
  document.getElementById('gamePanel').classList.remove('show');
}

function initOthello(difficulty){
  if(!difficulty){
    renderOthelloDiffSelect();
    return;
  }
  const b=Array(64).fill(0);
  b[27]=b[36]=1; b[28]=b[35]=-1;
  _oth={board:b,over:false,comment:othCmt('start'),thinking:false,difficulty:difficulty};
  renderOthello();
}

function renderOthelloDiffSelect(){
  document.getElementById('gamePanel').innerHTML=`
    <div class="game-title">オセロ</div>
    <div class="oth-comment">難易度を選んでください</div>
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:18px;">
      <button class="game-back-btn" style="font-size:16px;padding:14px;color:var(--text);" onclick="initOthello('easy')">Easy</button>
      <button class="game-back-btn" style="font-size:16px;padding:14px;color:var(--accent);" onclick="initOthello('normal')">Normal</button>
      <button class="game-back-btn" style="font-size:16px;padding:14px;color:#e05555;" onclick="initOthello('hard')">Hard</button>
    </div>
    <div style="margin-top:16px;">
      <button class="game-back-btn" style="width:100%;margin-top:4px;" onclick="closeGame()">とじる</button>
    </div>`;
}

function othClick(r,c){
  if(_oth.over||_oth.thinking) return;
  const b=_oth.board;
  const flips=othFlips(b,r,c,1);
  if(!flips.length) return;
  const gotCorner=OTH_CORNERS.has(othIdx(r,c));
  b[othIdx(r,c)]=1; flips.forEach(i=>b[i]=1);
  let cmt=gotCorner?othCmt('corner_lost'):null;
  _oth.thinking=true;
  if(cmt) _oth.comment=cmt;
  renderOthello();
  setTimeout(()=>{
    const aiPos=othAiMove(b);
    if(aiPos){
      const aiCorner=OTH_CORNERS.has(othIdx(aiPos[0],aiPos[1]));
      const aiFlips=othFlips(b,aiPos[0],aiPos[1],-1);
      b[othIdx(aiPos[0],aiPos[1])]=-1; aiFlips.forEach(i=>b[i]=-1);
      if(aiCorner) cmt=othCmt('corner_got');
    } else { cmt=othCmt('pass_ai'); }
    const pMoves=othValidMoves(b,1), aMoves=othValidMoves(b,-1);
    if(!pMoves.length&&!aMoves.length){
      _oth.over=true;
      const p=b.filter(v=>v===1).length, a=b.filter(v=>v===-1).length;
      _oth.comment=a>p?othCmt('win'):p>a?othCmt('lose'):othCmt('draw');
    } else {
      if(!pMoves.length) cmt=cmt||othCmt('pass_player');
      if(!cmt){ const p=b.filter(v=>v===1).length,a=b.filter(v=>v===-1).length;
        cmt=a>p+4?othCmt('ai_lead'):p>a+4?othCmt('player_lead'):othCmt('even'); }
      _oth.comment=cmt;
    }
    _oth.thinking=false;
    renderOthello();
  },550);
}

function renderOthello(){
  const b=_oth.board;
  const valid=new Set((_oth.over?[]:othValidMoves(b,1)).map(([r,c])=>othIdx(r,c)));
  const p=b.filter(v=>v===1).length, a=b.filter(v=>v===-1).length;
  let rows='';
  for(let r=0;r<8;r++){
    rows+='<div class="oth-row">';
    for(let c=0;c<8;c++){
      const i=othIdx(r,c);
      const cls=b[i]===1?'oth-b':b[i]===-1?'oth-w':valid.has(i)?'oth-hint':'';
      rows+=`<button class="oth-cell ${cls}" onclick="othClick(${r},${c})"></button>`;
    }
    rows+='</div>';
  }
  const diffLabel={easy:'Easy',normal:'Normal',hard:'Hard'}[_oth.difficulty]||'';
  document.getElementById('gamePanel').innerHTML=`
    <div class="game-title">オセロ <span style="font-size:10px;color:var(--text-faint);">あなた<span style="color:var(--text);">●</span> vs リマちゃん<span style="color:var(--accent);">●</span> [${diffLabel}]</span></div>
    <div class="oth-comment">${_oth.comment}</div>
    <div class="oth-score">あなた <b>${p}</b>　リマちゃん <b>${a}</b></div>
    ${_oth.thinking?'<div class="oth-thinking">リマちゃん考え中…</div>':''}
    <div class="oth-board">${rows}</div>
    <div style="display:flex;gap:8px;margin-top:10px;">
      <button class="game-back-btn" style="flex:1" onclick="closeGame()">とじる</button>
      <button class="game-back-btn" style="flex:1;color:var(--accent);" onclick="initOthello(_oth.difficulty)">もう一度</button>
      <button class="game-back-btn" style="flex:1;color:#e05555;" onclick="renderOthelloDiffSelect()">難易度変更</button>
    </div>`;
}


function openGameMode(){
  openGameModeMenu();
  document.getElementById('gameOverlay').classList.add('show');
  document.getElementById('gamePanel').classList.add('show');
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


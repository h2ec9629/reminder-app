// ===== IT QUIZ =====

const QUIZ_CMT = {
  start:   ['10問、気合い入れてください！','全問正解したら褒めてあげますわ','わたしが作った問題ですから難しいですよ'],
  correct: ['正解！やりますやんか〜！','そうですそうです、合ってます！','おー！正解ですわ！'],
  wrong:   ['あー惜しい！これは覚えといてください','違いますわ〜。これ大事なやつですよ','ブー！でも覚えたら強くなれますわ'],
  perfect: ['満点！信じられへん…本当にすごいですわ！','全問正解！わたしより詳しいんちゃいますか','パーフェクト！すごすぎて言葉出てきませんわ'],
  great:   ['めっちゃ優秀やないですか！','すごいですわ〜！わたし負けそう','これだけ取れたら十分合格圏ですわ'],
  good:    ['まあまあですわ。もう少し頑張りましょ','7割超えてますし、悪くないですよ','もうちょっとで全問正解ですわね'],
  normal:  ['んー、もうちょい勉強しましょ','半分以上は取れましたね！次は改善できますよ','まだまだ伸びしろありますわ'],
  bad:     ['もしかして初めて聞く言葉多かったですか？','ドンマイです！次こそ頑張りましょ','これを機に覚えていきましょか！'],
};
function quizCmt(key){ const p=QUIZ_CMT[key]; return p[Math.floor(Math.random()*p.length)]; }

const QUIZ_QUESTIONS = [
  // ===== JS構文（Claudeが書いたコードに出てくるやつ）=====
  {q:'「テンプレートリテラル」とは何ですか？',choices:['バッククォート(`)で囲み ${ } で変数を埋め込める文字列の書き方','HTMLのテンプレート専用ファイル','文字列を暗号化する機能','定型文を保存しておく機能'],a:0,cat:'JS構文'},
  {q:'テンプレートリテラルで変数を埋め込む書き方はどれですか？',choices:['`こんにちは ${name} さん`','`こんにちは {name} さん`','`こんにちは %name% さん`','`こんにちは <name> さん`'],a:0,cat:'JS構文'},
  {q:'「オプショナルチェイン（?.）」の役割はどれですか？',choices:['途中の値がなくてもエラーにせず undefined を返す','必ず値があることを保証する','条件分岐を短く書く','非同期処理を待つ'],a:0,cat:'JS構文'},
  {q:'obj?.name の「?.」が無くて obj が空(null)だとどうなりますか？',choices:['エラーで処理が止まる','自動でundefinedになる','空文字が入る','0になる'],a:0,cat:'JS構文'},
  {q:'「アロー関数（=>）」とは何ですか？',choices:['function を短く書ける関数の記法','矢印を画面に描く命令','配列を並べ替える記号','比較演算子の一種'],a:0,cat:'JS構文'},
  {q:'「async / await」は何のための書き方ですか？',choices:['時間のかかる処理(非同期)を、順番に書ける形で待つため','処理を高速化するため','エラーを無視するため','複数CPUで並列実行するため'],a:0,cat:'JS構文'},
  {q:'「const」と「let」の違いはどれですか？',choices:['constは再代入できない、letは再代入できる','constは数値専用、letは文字専用','違いはなく好みで使う','constはグローバル、letはローカル'],a:0,cat:'JS構文'},
  {q:'「クラスフィールド」とは何ですか？',choices:['クラスの中に直接書いた変数（プロパティ）の定義','畑のように区切られた画面領域','クラスの継承関係','データベースの列'],a:0,cat:'JS構文'},
  {q:'「コールバック関数」とは何ですか？',choices:['他の処理に渡して、あとで呼んでもらう関数','電話を折り返す機能','エラー時だけ動く関数','必ず最初に動く関数'],a:0,cat:'JS構文'},
  {q:'コード中の「//」から行末までは何ですか？',choices:['コメント（実行されないメモ書き）','割り算の記号','URLの一部','エラー表示'],a:0,cat:'JS構文'},
  {q:'「setTimeout」の役割はどれですか？',choices:['指定した時間だけ待ってから処理を実行する','処理を即座に止める','時計を表示する','タイムアウトエラーを出す'],a:0,cat:'JS構文'},
  {q:'「localStorage」とは何ですか？',choices:['ブラウザにデータを保存しておく仕組み（閉じても残る）','パソコンのCドライブ','クラウド上の保管庫','一時的なメモリで閉じると消える'],a:0,cat:'JS構文'},

  // ===== エンコード・データ表現 =====
  {q:'「エンコード」とは何ですか？',choices:['データをある決まった形式に変換すること','データを削除すること','データを暗号化して隠すこと','データを圧縮すること'],a:0,cat:'データ表現'},
  {q:'「文字コード（文字エンコーディング）」とは何ですか？',choices:['文字をコンピュータが扱える数値に対応させる取り決め','パスワードの暗号','プログラムの命令','フォントのデザイン'],a:0,cat:'データ表現'},
  {q:'日本語の文字化けが起きる主な原因はどれですか？',choices:['保存時と表示時の文字コードが食い違っている','ファイルが大きすぎる','インターネットが遅い','フォントが古い'],a:0,cat:'データ表現'},
  {q:'世界中の文字を1つの体系で扱える文字コードはどれですか？',choices:['UTF-8（Unicode）','Shift_JIS','ASCII','EUC-JP'],a:0,cat:'データ表現'},
  {q:'「BOM」とは何ですか？',choices:['ファイル先頭に付く、文字コードを示す目印データ','爆発を表す効果音','通信エラーの一種','バックアップの略'],a:0,cat:'データ表現'},
  {q:'「改行コード」のCRLFとLFの違いに関係するのはどれですか？',choices:['WindowsとMac/Linuxで改行の表し方が違うこと','文字の大きさ','行間の広さ','段落の数'],a:0,cat:'データ表現'},
  {q:'「JSON」とは何ですか？',choices:['データを名前と値のセットで表す、軽量なデータ形式','画像ファイルの形式','プログラミング言語','データベースソフト'],a:0,cat:'データ表現'},
  {q:'「Base64」とは何ですか？',choices:['データを文字だけで表せる形に変換する方式','64ビットのパソコン','暗号化の最強方式','64色のカラーパレット'],a:0,cat:'データ表現'},

  // ===== Web/PWA（このアプリで出てきた言葉）=====
  {q:'「Service Worker」とは何ですか？',choices:['ブラウザの裏で動き、オフライン動作やキャッシュを担う仕組み','サーバーを管理する作業員','常駐するウイルス','画面を描画する機能'],a:0,cat:'Web/PWA'},
  {q:'「キャッシュ」とは何ですか？',choices:['よく使うデータを一時保存して次回を速くする仕組み','不要ファイルを消す機能','現金のこと','暗号化の一種'],a:0,cat:'Web/PWA'},
  {q:'アプリを直したのに古いままなのは、よく何のせいですか？',choices:['古いファイルがキャッシュに残って読み込まれている','インターネットが切れている','パソコンが壊れている','ファイルが消えた'],a:0,cat:'Web/PWA'},
  {q:'「ハードリロード（Ctrl+Shift+R）」とは何ですか？',choices:['キャッシュを無視してページを読み直すこと','パソコンを強制再起動すること','データを全削除すること','画面を明るくすること'],a:0,cat:'Web/PWA'},
  {q:'「PWA」とは何ですか？',choices:['Webサイトをアプリのように使える仕組み','プログラムの設計図','有料アプリの略','ウイルスの種類'],a:0,cat:'Web/PWA'},
  {q:'HTMLの onclick="..." は何を指定していますか？',choices:['クリックされた時に実行する処理','文字の色','リンク先のURL','ボタンのサイズ'],a:0,cat:'Web/PWA'},
  {q:'タッチイベントだけで作るとPCで動かないことがある理由はどれですか？',choices:['タップ(touch)とクリック(click)は別のイベントだから','PCにはタッチがないから壊れる','PCの方が処理が速いから','ブラウザが古いから'],a:0,cat:'Web/PWA'},

  // ===== AI・開発のやり取りで出る言葉 =====
  {q:'「デバッグ」とは何ですか？',choices:['プログラムの不具合を見つけて直すこと','プログラムを速くすること','プログラムを消すこと','プログラムを保存すること'],a:0,cat:'AI・開発'},
  {q:'コンソールの「is not defined」エラーは何を意味しますか？',choices:['呼び出した関数や変数が定義されていない','インターネットが切れている','ファイルが大きすぎる','権限が足りない'],a:0,cat:'AI・開発'},
  {q:'「構文（シンタックス）エラー」とは何ですか？',choices:['書き方のルール違反でプログラムが読めない状態','処理に時間がかかりすぎる状態','メモリが足りない状態','通信に失敗した状態'],a:0,cat:'AI・開発'},
  {q:'「差分（diff）」とは何ですか？',choices:['変更前と変更後の違いを表したもの','データの合計','ファイルの容量','エラーの数'],a:0,cat:'AI・開発'},
  {q:'「フルコード出力」とは何ですか？',choices:['一部だけでなくコード全体をまるごと出すこと','コードを暗号化して出すこと','コードを実行すること','コードを削除すること'],a:0,cat:'AI・開発'},
  {q:'「リファクタリング」とは何ですか？',choices:['動きを変えずにコードの中身を整理・改善すること','機能を新しく追加すること','コードを全部消すこと','バグをわざと作ること'],a:0,cat:'AI・開発'},
  {q:'「マウント」（フォルダの）とは何ですか？',choices:['別の場所のフォルダを、自分の環境から使えるように繋ぐこと','フォルダを山積みにすること','フォルダを暗号化すること','フォルダを印刷すること'],a:0,cat:'AI・開発'},
  {q:'「タイムスタンプ」とは何ですか？',choices:['ファイルの作成・更新日時の記録','処理にかかった時間','時計の画像','締め切りの通知'],a:0,cat:'AI・開発'},
  {q:'「フォールバック」とは何ですか？',choices:['本命がダメな時に使う予備の手段','処理が後戻りすること','エラーで落ちること','データの巻き戻し'],a:0,cat:'AI・開発'},
];

// ===== 成績ログ =====
const QUIZ_LOG_KEY = 'itquiz_log';

function quizLogLoad(){
  try { return JSON.parse(localStorage.getItem(QUIZ_LOG_KEY) || '[]'); } catch(e){ return []; }
}
function quizLogSave(logs){
  localStorage.setItem(QUIZ_LOG_KEY, JSON.stringify(logs));
}
function quizLogAdd(score){
  const logs = quizLogLoad();
  const now = new Date();
  const ts = now.getFullYear() + '/' +
    String(now.getMonth()+1).padStart(2,'0') + '/' +
    String(now.getDate()).padStart(2,'0') + ' ' +
    String(now.getHours()).padStart(2,'0') + ':' +
    String(now.getMinutes()).padStart(2,'0');
  logs.unshift({ ts, score, total:10 });
  if(logs.length > 50) logs.length = 50; // 最大50件
  quizLogSave(logs);
}
function quizLogDelete(idx){
  const logs = quizLogLoad();
  logs.splice(idx, 1);
  quizLogSave(logs);
  renderQuizLog();
}
function quizLogClear(){
  if(!confirm('成績ログを全件削除しますか？')) return;
  localStorage.removeItem(QUIZ_LOG_KEY);
  renderQuizLog();
}

function renderQuizLog(){
  const logs = quizLogLoad();
  const avg = logs.length ? (logs.reduce((s,l)=>s+l.score,0)/logs.length).toFixed(1) : '-';
  const best = logs.length ? Math.max(...logs.map(l=>l.score)) : '-';
  const rows = logs.length === 0
    ? '<div style="text-align:center;color:var(--text-muted);padding:16px;">まだ記録がありませんわ〜</div>'
    : logs.map((l,i)=>{
        const stars = l.score===10?'⭐':l.score>=8?'★★':l.score>=6?'★':'';
        return `<div class="quiz-log-row">
          <span style="color:var(--text-muted);font-size:11px;min-width:110px;">${l.ts}</span>
          <span style="font-weight:700;color:${l.score>=8?'var(--accent)':l.score>=6?'var(--text)':'var(--text-muted)'};">${l.score}/${l.total} ${stars}</span>
          <button class="quiz-log-del" onclick="quizLogDelete(${i})">✕</button>
        </div>`;
      }).join('');
  document.getElementById('gamePanel').innerHTML=`
    <div class="game-title">成績ログ</div>
    <div style="display:flex;gap:16px;margin:8px 0 12px;justify-content:center;">
      <div style="text-align:center;">
        <div style="font-size:11px;color:var(--text-muted);">平均</div>
        <div style="font-size:22px;font-weight:700;color:var(--accent);">${avg}</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:11px;color:var(--text-muted);">最高</div>
        <div style="font-size:22px;font-weight:700;color:var(--accent);">${best}</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:11px;color:var(--text-muted);">回数</div>
        <div style="font-size:22px;font-weight:700;color:var(--accent);">${logs.length}</div>
      </div>
    </div>
    <div class="quiz-log-list">${rows}</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">
      ${logs.length>0?`<button class="game-back-btn" style="width:100%;color:#e05555;" onclick="quizLogClear()">全件削除</button>`:''}
      <button class="game-back-btn" style="width:100%;" onclick="openGameModeMenu()">戻る</button>
    </div>`;
}

// ===== クイズ状態 =====
let _quiz = {};

function initQuiz(){
  const questions = [...QUIZ_QUESTIONS].sort(()=>Math.random()-0.5).slice(0,10);
  _quiz = { questions, idx:0, score:0, answered:false };
  renderQuizQuestion();
}

function renderQuizQuestion(){
  const q = _quiz.questions[_quiz.idx];
  const num = _quiz.idx + 1;
  const pct = Math.round((_quiz.idx/10)*100);
  const shuffled = q.choices.map((c,i)=>({text:c,correct:i===q.a})).sort(()=>Math.random()-0.5);
  const btns = shuffled.map((c,i)=>`
    <button class="quiz-choice-btn" onclick="answerQuiz(${i},this,${c.correct})">${c.text}</button>
  `).join('');
  document.getElementById('gamePanel').innerHTML=`
    <div class="game-title">ITクイズ <span style="font-size:13px;color:var(--text-muted);">${num}/10</span></div>
    <div class="quiz-progress"><div class="quiz-progress-bar" style="width:${pct}%"></div></div>
    <div class="quiz-cat-badge">${q.cat}</div>
    <div class="oth-comment" id="quizComment">${quizCmt('start')}</div>
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-choices">${btns}</div>
    <div style="margin-top:auto;">
      <button class="game-back-btn" style="width:100%;margin-top:8px;" onclick="openGameModeMenu()">やめる</button>
    </div>`;
}

function answerQuiz(idx, btn, isCorrect){
  if(_quiz.answered) return;
  _quiz.answered = true;
  const allBtns = document.querySelectorAll('.quiz-choice-btn');
  allBtns.forEach(b => b.disabled = true);
  if(isCorrect){
    btn.classList.add('quiz-correct');
    _quiz.score++;
    document.getElementById('quizComment').textContent = quizCmt('correct');
  } else {
    btn.classList.add('quiz-wrong');
    const correctText = _quiz.questions[_quiz.idx].choices[_quiz.questions[_quiz.idx].a];
    allBtns.forEach(b=>{ if(b !== btn && b.textContent.trim() === correctText) b.classList.add('quiz-correct'); });
    document.getElementById('quizComment').textContent = quizCmt('wrong');
  }
  const choices = document.querySelector('.quiz-choices');
  const nextBtn = document.createElement('button');
  nextBtn.className = 'game-back-btn';
  nextBtn.style.cssText = 'width:100%;margin-top:12px;background:var(--accent);color:#fff;';
  nextBtn.textContent = _quiz.idx < 9 ? '次の問題 →' : '結果を見る';
  nextBtn.onclick = () => {
    _quiz.idx++;
    _quiz.answered = false;
    if(_quiz.idx < 10) renderQuizQuestion();
    else renderQuizResult();
  };
  choices.appendChild(nextBtn);
}

function renderQuizResult(){
  const s = _quiz.score;
  quizLogAdd(s);
  let cmt, star;
  if(s===10){ cmt=quizCmt('perfect'); star='⭐⭐⭐'; }
  else if(s>=8){ cmt=quizCmt('great'); star='⭐⭐'; }
  else if(s>=6){ cmt=quizCmt('good'); star='⭐'; }
  else if(s>=4){ cmt=quizCmt('normal'); star=''; }
  else { cmt=quizCmt('bad'); star=''; }
  document.getElementById('gamePanel').innerHTML=`
    <div class="game-title">クイズ結果 ${star}</div>
    <div style="text-align:center;margin:18px 0;">
      <div style="font-size:52px;font-weight:700;color:var(--accent);">${s}<span style="font-size:22px;color:var(--text-muted)">/10</span></div>
    </div>
    <div class="oth-comment">${cmt}</div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:18px;">
      <button class="game-back-btn" style="font-size:15px;padding:12px;background:var(--accent);color:#fff;" onclick="initQuiz()">もう一回！</button>
      <button class="game-back-btn" style="font-size:15px;padding:12px;" onclick="renderQuizLog()">成績ログを見る</button>
      <button class="game-back-btn" style="font-size:15px;padding:12px;" onclick="openGameModeMenu()">ゲーム選択に戻る</button>
      <button class="game-back-btn" style="font-size:15px;padding:12px;" onclick="closeGame()">とじる</button>
    </div>`;
}

function openGameModeMenu(){
  document.getElementById('gamePanel').innerHTML=`
    <div class="game-title">ゲームモード</div>
    <div class="oth-comment">どっちで遊びますか？</div>
    <div style="display:flex;flex-direction:column;gap:14px;margin-top:18px;">
      <button class="game-back-btn" style="font-size:16px;padding:14px;" onclick="initOthello()">♟ オセロ</button>
      <button class="game-back-btn" style="font-size:16px;padding:14px;background:var(--accent);color:#fff;" onclick="initQuiz()">💡 ITクイズ</button>
    </div>
    <div style="margin-top:12px;">
      <button class="game-back-btn" style="width:100%;font-size:13px;color:var(--text-muted);" onclick="renderQuizLog()">📊 成績ログ</button>
    </div>
    <div style="margin-top:8px;">
      <button class="game-back-btn" style="width:100%;margin-top:4px;" onclick="closeGame()">とじる</button>
    </div>`;
}

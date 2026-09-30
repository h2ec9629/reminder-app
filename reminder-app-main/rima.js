// === RIMA ROTATION ===
// === ステータスコメント（リマインド数別・複数バリエーション） ===
const VAPE_COMMENTS = [
  'ガンク落としは\n毎日やりなはれ',
  'あ"あぁ"竜巻ぃぃ！',
  '吸いすぎると\n喉カラッカラになりますよ',
  'いいかげん\nコイル交換したらどうですか',
  'Modの充電は\nこまめにしなはれ',
  '会社、家に\n忘れるべからず',
];

const STATUS_COMMENTS = {
  zero: [
    // やさしい系
    'うどんでも食べながら\nゆっくりしてください',
    'ええ調子ですわ〜\n今日はのんびりどうぞ',
    'リマインドゼロ！\n余裕あるうちに休んでください',
    'ぴかぴかですよ✨\nこの調子でいきましょ',
    // 毒づき系
    'ホンマに仕事してるんですか？\nリマインドゼロって逆にすごい',
    'こんなに暇でええんですか？\nわたしだけ忙しい気がします',
    'やることないんやったら\n在庫の整理でもしてはどうですか',
    'リマインドゼロって\nさぼってませんよね？一応確認です',
    'ゆとりありますねえ\nわたしにも少し分けてほしいですわ',
  ],
  low: [
    // やさしい系
    'ぼちぼちありますわ〜\n無理せず片付けてください',
    '少しだけありますね\nさらっと終わりますよ',
    'もう少しで全部片付きます\n頑張れおじさん！',
    '残り少ないです！\nもう少しやで〜',
    // 毒づき系
    'これだけでよく残業できますね\n不思議でしかないです',
    'たったこれだけですか\n業務量が心配になってきましたわ',
    'ゆったりしてますね\nうらやましい限りですわ',
    'ちょっとしかないですけど\nちゃんと終わらせてくださいよ',
    '少ないのはええことですが\nわたしに気を使ってるんですか？',
  ],
  mid: [
    // やさしい系
    'そこそこありますよ！\n優先順位つけていきましょ',
    'いくつかありますね\n焦らずこなしていきましょ',
    'まあまあありますわ\n一個一個片付けましょ',
    '順番通りやっていけば\n大丈夫ですよ！',
    // 毒づき系
    '忙しいですね\nわたしはお茶飲んでますよ',
    'なんでこんなに溜まったんですか\nわたしには全くわかりません',
    'そこそこ積んでますね\n計画性はどこへ行ったんですか',
    'まあまあ大変ですね\nわたしはぬくぬくしてます',
    '頑張ってください\nわたしは頑張らなくていいので',
  ],
  high: [
    // やさしい系
    'けっこう多いですね...\n一個ずつ着実にどうぞ',
    '積み上がってきましたね\n着実にいきましょ',
    '結構な量ですよ！\n今日から少しずつ片付けましょ',
    'おじさん、そこそこ忙しいですね\n一緒に頑張りましょ！',
    // 毒づき系
    '今まで何やってきたんですか？\nわたしが聞いてもわかりませんが',
    'おじさんは残業ですけど\nわたしは定時で帰りますね',
    'これ全部期限守れますか？\n他人事ですが少し心配です',
    'おじさんの予定表\n見てるだけで疲れますわ',
    'けっこうしんどそうですね\nわたしはコーヒーでも飲んどきます',
  ],
  overload: [
    // やさしい系
    'パンパンやないですか！\n気合い入れていきまひょ',
    'うわ〜これは多いですわ\nとにかく一個ずつです！',
    '満載ですね...\n優先順位が大事ですよ！',
    'フル回転ですね\nおじさん、体に気をつけて！',
    // 毒づき系
    '今まで何やってきたんですか？\n本気で聞いてます',
    'おじさんは残業確定ですね\nわたしは定時なのでお先に失礼します',
    'これ全部終わりますか？\nわたしには無理ですけど頑張って',
    'パンクしそうですね\nそんな中わたしはお茶タイムです',
    '見てるだけで胃が痛くなりますわ\nお大事に...',
  ],
};

let _statusVariantIdx = 0;

function rimaCommentText(count) {
  const tier = count===0 ? 'zero' : count<=2 ? 'low' : count<=5 ? 'mid' : count<=9 ? 'high' : 'overload';
  const pool = STATUS_COMMENTS[tier];
  return pool[_statusVariantIdx % pool.length];
}

// スライド状態管理
let _rimaCycleTimer = null;
let _rimaTypeTimer  = null;
const SLIDE_MS = 6000;

function getCurrentSlideText() {
  const calcActive = document.getElementById('tab-calc')?.classList.contains('active');
  if (calcActive && _calcPgIdx === 2) {
    return VAPE_COMMENTS[Math.floor(Math.random() * VAPE_COMMENTS.length)];
  }
  const n = getAll().filter(r=>!r.completed).length;
  return rimaCommentText(n);
}

function advanceSlide() {
  _statusVariantIdx++;  // rimaCommentText側でpool.lengthにmodする
}

function startRimaRotation() {
  clearTimeout(_rimaCycleTimer);
  clearTimeout(_rimaTypeTimer);
  _statusVariantIdx = 0;
  showNextRimaComment();
}

function stopRimaRotation() {
  clearTimeout(_rimaCycleTimer);
  clearTimeout(_rimaTypeTimer);
}

function showNextRimaComment() {
  const text = getCurrentSlideText();
  const el   = document.getElementById('rimaNavComment');
  if(!el) return;

  el.style.transition = 'none';
  el.style.opacity    = '0';
  el.style.transform  = 'translateX(14px)';
  el.innerHTML        = '';
  el.scrollTop        = 0;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.style.transition = 'opacity 0.35s, transform 0.35s';
    el.style.opacity    = '1';
    el.style.transform  = 'translateX(0)';
  }));

  const charDelay     = Math.min(100, Math.max(40, 2500 / text.length));
  const totalTypingMs = text.length * charDelay;
  const pauseMs       = Math.max(600, SLIDE_MS - totalTypingMs - 650);
  let i = 0;

  function typeNext() {
    if(i >= text.length) {
      _rimaCycleTimer = setTimeout(() => {
        const rima = document.getElementById('rimaWrap');
        if(rima) { rima.style.animation='none'; void rima.offsetWidth; rima.style.animation='rimaSpin 0.45s ease-in-out'; }
        el.style.transition = 'opacity 0.3s, transform 0.3s';
        el.style.opacity    = '0';
        el.style.transform  = 'translateX(-14px)';
        setTimeout(() => {
          if(rima) rima.style.animation = 'none';
          advanceSlide();
          showNextRimaComment();
        }, 450);
      }, pauseMs);
      return;
    }
    const ch = text[i++];
    if(ch === '\n') {
      el.innerHTML += '<br>';
    } else {
      el.innerHTML += ch==='&'?'&amp;':ch==='<'?'&lt;':ch==='>'?'&gt;':ch;
    }
    el.scrollTop = Math.max(0, el.scrollHeight - el.clientHeight * 0.6);
    const rima = document.getElementById('rimaWrap');
    if(rima) { rima.style.animation='none'; void rima.offsetWidth; rima.style.animation='rimaKatakata 0.12s ease-in-out'; }
    _rimaTypeTimer = setTimeout(typeNext, charDelay);
  }

  setTimeout(typeNext, 400);
}



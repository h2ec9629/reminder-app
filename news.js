'use strict';
// === NEWS（ニュース。2026-10-30追加） ===
// Yahoo!ニュースの全ジャンル（主要・国内・国際…）とテーマ（キーワード検索）の見出し・記事本文を、Cloudflareの中継Worker（cloudflare_worker_relay.js の /news/）経由で取り、
// Wm2Bの画面の中で読む（本文は中継が記事ページから抜き出した文章。写真・動画・表は出ないことがある）。
// 見出し一覧は5分間この端末に覚えておき、開くたびには取りに行かない。本文は開いている間だけ覚える（保存しない）。
const NEWS_API       = 'https://morning-resonance-c98bh.h2ec9629.workers.dev/news';
const NEWS_CACHE_KEY = 'ojisan_news_cache_v1';
const NEWS_TTL       = 5 * 60 * 1000;
let _news = null;            // { at: 取得時刻, items: [{title, link, date, cat}] }
let _newsCat = 'all';        // 一覧の絞り込み（ジャンル）
const NEWS_CATS = { all:'すべて', top:'主要', domestic:'国内', world:'国際', business:'経済', entertainment:'エンタメ', sports:'スポーツ', it:'IT', science:'科学', local:'地域' };
let _newsLoading = null;
const _newsArticles = {};    // 記事URL → 本文（このページを開いている間だけ）

function newsCached() {
  if (!_news) { try { _news = JSON.parse(localStorage.getItem(NEWS_CACHE_KEY)); } catch(e) {} }
  return _news;
}
function newsLoad(force) {
  const c = newsCached();
  if (!force && c && Date.now() - c.at < NEWS_TTL) return Promise.resolve(c.items);
  if (_newsLoading) return _newsLoading;
  // 全ジャンルまとめて取る。中継が古くて all を知らない時(400)は主要だけ取る
  const get = feed => fetch(NEWS_API + '/list?feed=' + feed)
    .then(r => r.ok ? r.json() : Promise.reject(Object.assign(new Error('status ' + r.status), { status: r.status })));
  _newsLoading = get('all').catch(e => e.status === 400 ? get('top') : Promise.reject(e))
    .then(d => {
      _news = { at: Date.now(), items: d.items || [] };
      try { localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(_news)); } catch(e) {}
      return _news.items;
    })
    .finally(() => { _newsLoading = null; });
  return _newsLoading;
}

// 「3時間前」「10/30 12:10」形式
// 日時の文字列を時刻(ミリ秒)に。RSSの「Sat, 31 Oct 2026 01:10:17 GMT」と、検索結果の「10/31(土) 9:12」（年なし・日本時間）の両方を読む
function newsTime(s) {
  const m = String(s || '').match(/^(\d{1,2})\/(\d{1,2})(?:\([^)]*\))?\s+(\d{1,2}):(\d{2})/);
  if (m) {
    const now = new Date();
    const d = new Date(now.getFullYear(), m[1] - 1, +m[2], +m[3], +m[4]);
    if (d - now > 86400000) d.setFullYear(d.getFullYear() - 1);  // 年またぎ（1月に見る12月の記事）
    return d.getTime();
  }
  const t = Date.parse(s);
  return isNaN(t) ? NaN : t;
}
function newsAgo(s) {
  const t = newsTime(s);
  if (isNaN(t)) return s || '';
  const min = Math.floor((Date.now() - t) / 60000);
  if (min < 1)  return 'たった今';
  if (min < 60) return min + '分前';
  if (min < 24 * 60) return Math.floor(min / 60) + '時間前';
  const d = new Date(t);
  return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// --- ホームのウィジェット（主要の見出し4件。タップでその記事を開く＝launcher.js の w-news） ---
function newsWidget() {
  const c = newsCached();
  const all = (c && c.items) || [];
  const tops = all.map((n, i) => ({ n, i })).filter(x => !x.n.cat || x.n.cat === 'top');
  const items = (tops.length ? tops : all.map((n, i) => ({ n, i }))).slice(0, 4);
  lnPut('lnNewsList', 'innerHTML', items.length
    ? items.map(({ n, i }) => `<span class="ln-rem-row" data-news-i="${i}"><span class="ln-rem-bar ln-news-bar"></span><span class="ln-rem-title">${escH(n.title)}</span><span class="ln-rem-due">${newsAgo(n.date)}</span></span>`).join('')
    : `<span class="ln-empty">${_newsLoading || !c ? '読み込み中...' : 'ニュースを取得できませんでした'}</span>`);
  if (!c || Date.now() - c.at >= NEWS_TTL) newsLoad().then(newsWidget, () => lnPut('lnNewsList', 'innerHTML', '<span class="ln-empty">ニュースを取得できませんでした</span>'));
}

// --- テーマ（2026-10-31追加）：キーワードごとにYahoo!ニュースを検索した記事を出す（中継の /news/search） ---
// テーマはこの端末に保存。初期値はおじさんのYahoo!ニュースのフォローリスト（テーマ名＝検索キーワード）
const NEWS_THEME_KEY  = 'ojisan_news_themes_v1';
const NEWS_PREF_KEY   = 'ojisan_news_pref_v1';   // 最後に見ていたモード・テーマ（開き直した時に戻す）
const NEWS_THEME_TTL  = 10 * 60 * 1000;
const NEWS_THEMES_DEFAULT = ['エイリアン','Anthropic','ChatGPT','OpenAI','人工知能','衆議院 解散','政局','テレビゲーム','国民民主党',
  '富山県','コムドット','東京都知事選挙','安芸高田市','石丸伸二','麻雀','内部告発','Amazonプライム・ビデオ','ミニバン',
  '炎上','YouTuber','地球温暖化','Excel','電子たばこ','YouTube','Amazon','スター・ウォーズ','Steam','暗黒物質','Minecraft','ブラックホール'];
// テーマ → { at, items }。この端末に覚えておき、開き直した時もすぐ出す（古ければ裏で取り直す）
const NEWS_THEME_CACHE_KEY = 'ojisan_news_theme_cache_v1';
const _newsThemeCache = (() => { try { return JSON.parse(localStorage.getItem(NEWS_THEME_CACHE_KEY)) || {}; } catch(e) { return {}; } })();
const _newsThemeLoading = {};
let _newsAllN = 50;          // 「すべて」で出す件数（「もっと見る」で増やす）
const NEWS_ALL_PER_THEME = 5; // 「すべて」に混ぜるのは各テーマの新しい方から5件（全部混ぜると数百件になるため）
let _newsView = [];          // 今一覧に出している記事（タップで開く時に使う）
let _newsPref = (() => { try { return JSON.parse(localStorage.getItem(NEWS_PREF_KEY)) || {}; } catch(e) { return {}; } })();
const newsMode = () => (_newsPref.mode === 'theme' || _newsPref.mode === 'genre') ? _newsPref.mode : 'all';
function newsSavePref() { try { localStorage.setItem(NEWS_PREF_KEY, JSON.stringify(_newsPref)); } catch(e) {} }
function newsThemes() {
  try { const t = JSON.parse(localStorage.getItem(NEWS_THEME_KEY)); if (Array.isArray(t)) return t; } catch(e) {}
  return NEWS_THEMES_DEFAULT.slice();
}
function newsSaveThemes(t) { try { localStorage.setItem(NEWS_THEME_KEY, JSON.stringify(t)); } catch(e) {} }

// --- ニュースタブ（ジャンル／テーマの一覧 ⇔ 記事） ---
function newsShow() {
  newsBack();
  newsRender();
  newsEnsureFresh();
}
function newsSetMode(m) {
  _newsPref.mode = m; newsSavePref();
  _newsAllN = 50;
  newsRender();
  newsScrollTo(0);
  newsEnsureFresh();
}
// 今のモードで古くなっている物を取り直す（ジャンル＝5分、テーマ＝10分）
function newsEnsureFresh() {
  const m = newsMode();
  if (m !== 'theme' && (!newsCached() || Date.now() - newsCached().at >= NEWS_TTL)) newsRefreshGenre();
  if (m === 'all') newsLoadThemes();
}
function newsRender() {
  const m = newsMode();
  document.querySelectorAll('.news-mode').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
  if (m === 'theme') newsRenderTheme(); else if (m === 'genre') newsRenderList(); else newsRenderAll();
}
function newsRefresh() {
  const m = newsMode();
  if (m === 'theme') { const t = _newsPref.theme; if (t) delete _newsThemeCache[t]; newsRenderTheme(); return; }
  if (m === 'all') { newsThemes().forEach(t => delete _newsThemeCache[t]); newsLoadThemes(); }
  newsRefreshGenre();
}
function newsRefreshGenre() {
  document.getElementById('newsStatus').textContent = '更新中...';
  newsLoad(true).then(() => { newsRender(); newsWidget(); },
    e => { document.getElementById('newsStatus').textContent = '取得できませんでした（' + e.message + '）'; });
}
// 記事カードの一覧を描く（items は記事の配列。タップで _newsView[i] を開く）
function newsListHtml(items, showCat) {
  _newsView = items;
  return items.length
    ? items.map((n, i) => {
        // サムネ：検索結果に写真があればそれ、無ければ中継が記事ページの写真へ転送する（Yahoo!の記事だけ）。写真が無ければ枠ごと消す
        const img = n.image || (!n.ext ? `${NEWS_API}/thumb?url=${encodeURIComponent(n.link)}` : '');
        const tag = n.theme || (n.cat && NEWS_CATS[n.cat]) || '';
        const cat = showCat && tag ? `<span class="news-item-cat${n.theme ? ' theme' : ''}">${escH(tag)}</span>` : '';
        const ext = n.ext ? '<span class="news-item-cat">外部</span>' : '';
        return `<button type="button" class="news-item" onclick="newsOpenView(${i})">`
          + `<span class="news-item-body"><span class="news-item-title">${escH(n.title)}</span><span class="news-item-date">${cat}${ext}${escH(newsAgo(n.date))}</span></span>`
          + (img ? `<img class="news-thumb" src="${escH(img)}" alt="" loading="lazy" onerror="this.remove()">` : '') + '</button>';
      }).join('')
    : '<div class="news-empty">ニュースがありません</div>';
}
function newsRenderList() {
  const c = newsCached();
  const all = (c && c.items) || [];
  document.getElementById('newsStatus').textContent = c ? `${all.length}件 · 最終更新 ` + newsAgo(new Date(c.at).toUTCString()) : '';
  // ジャンルの絞り込みボタン（記事があるジャンルだけ出す）
  const cats = Object.keys(NEWS_CATS).filter(k => k === 'all' || all.some(n => n.cat === k));
  if (!cats.includes(_newsCat)) _newsCat = 'all';
  document.getElementById('newsCats').innerHTML = cats.length > 1
    ? cats.map(k => `<button type="button" class="news-cat${k === _newsCat ? ' on' : ''}" onclick="newsSetCat('${k}')">${NEWS_CATS[k]}</button>`).join('') : '';
  document.getElementById('newsList').innerHTML = newsListHtml(all.filter(n => _newsCat === 'all' || n.cat === _newsCat), _newsCat === 'all');
}
function newsSetCat(k) {
  _newsCat = k;
  newsRenderList();
  newsScrollTo(0);
}
// テーマ1つを検索して覚える（同じテーマを同時に2回取りに行かない）
function newsFetchTheme(t) {
  if (_newsThemeLoading[t]) return _newsThemeLoading[t];
  return _newsThemeLoading[t] = fetch(NEWS_API + '/search?q=' + encodeURIComponent(t))
    .then(r => r.ok ? r.json() : Promise.reject(new Error('status ' + r.status)))
    .then(d => {
      _newsThemeCache[t] = { at: Date.now(), items: d.items || [] };
      newsSaveThemeCache();
      return _newsThemeCache[t].items;
    })
    .finally(() => { delete _newsThemeLoading[t]; });
}
let _newsThemeSaveTimer = null;
function newsSaveThemeCache() {
  clearTimeout(_newsThemeSaveTimer);
  _newsThemeSaveTimer = setTimeout(() => {
    const keep = {};
    newsThemes().forEach(t => { if (_newsThemeCache[t]) keep[t] = _newsThemeCache[t]; });  // 消したテーマの分は捨てる
    try { localStorage.setItem(NEWS_THEME_CACHE_KEY, JSON.stringify(keep)); } catch(e) {}
  }, 500);
}
// 古くなった全テーマを4つずつ順番に取り直す（30個を一度に投げない）。届くたびに「すべて」を描き直す
let _newsThemeQueue = null;
function newsLoadThemes() {
  if (_newsThemeQueue) return;
  const todo = newsThemes().filter(t => !_newsThemeCache[t] || Date.now() - _newsThemeCache[t].at >= NEWS_THEME_TTL);
  if (!todo.length) return;
  _newsThemeQueue = todo;
  let redraw = null;
  const next = () => {
    const t = _newsThemeQueue && _newsThemeQueue.shift();
    if (!t) return Promise.resolve();
    return newsFetchTheme(t).catch(() => {}).then(() => {
      if (newsMode() === 'all' && !redraw) redraw = setTimeout(() => { redraw = null; if (newsMode() === 'all') newsRenderAll(); }, 400);
      return next();
    });
  };
  Promise.all([next(), next(), next(), next()]).then(() => {
    _newsThemeQueue = null;
    if (newsMode() === 'all') newsRenderAll();
  });
}
// 「すべて」：ジャンルの記事＋各テーマの新しい5件を、同じ記事は1件にして新しい順に並べる
function newsRenderAll() {
  const seen = new Set();
  const all = [];
  const add = n => { const id = n.link.replace(/\?.*$/, ''); if (!seen.has(id)) { seen.add(id); all.push(n); } };
  const c = newsCached();
  ((c && c.items) || []).forEach(add);
  newsThemes().forEach(t => {
    const tc = _newsThemeCache[t];
    if (tc) tc.items.slice().sort((a, b) => (newsTime(b.date) || 0) - (newsTime(a.date) || 0))
      .slice(0, NEWS_ALL_PER_THEME).forEach(n => add({ ...n, theme: t }));
  });
  all.sort((a, b) => (newsTime(b.date) || 0) - (newsTime(a.date) || 0));
  const pending = _newsThemeQueue ? _newsThemeQueue.length + Object.keys(_newsThemeLoading).length : 0;
  document.getElementById('newsStatus').textContent = `${all.length}件` + (pending ? ` · テーマを読み込み中（残り${pending}）` : '');
  document.getElementById('newsCats').innerHTML = '';
  const list = document.getElementById('newsList');
  list.innerHTML = newsListHtml(all.slice(0, _newsAllN), true)
    + (all.length > _newsAllN ? `<button type="button" class="news-more" onclick="_newsAllN+=50;newsRenderAll()">もっと見る（残り${all.length - _newsAllN}件）</button>` : '');
}

function newsRenderTheme() {
  const themes = newsThemes();
  if (!themes.includes(_newsPref.theme)) { _newsPref.theme = themes[0] || ''; newsSavePref(); }
  const t = _newsPref.theme;
  document.getElementById('newsCats').innerHTML =
    themes.map((k, i) => `<button type="button" class="news-cat${k === t ? ' on' : ''}" onclick="newsSetTheme(${i})">${escH(k)}</button>`).join('')
    + '<button type="button" class="news-cat news-cat-edit" onclick="newsEditThemes()">✎ 編集</button>';
  const list = document.getElementById('newsList');
  if (!t) { document.getElementById('newsStatus').textContent = ''; list.innerHTML = '<div class="news-empty">「✎ 編集」でテーマを追加してください</div>'; return; }
  const c = _newsThemeCache[t];
  if (c && Date.now() - c.at < NEWS_THEME_TTL) {
    document.getElementById('newsStatus').textContent = `「${t}」${c.items.length}件`;
    list.innerHTML = newsListHtml(c.items, false);
    return;
  }
  document.getElementById('newsStatus').textContent = `「${t}」を検索中...`;
  // 古い結果があれば先に出しておき、新しいのが届いたら差し替える
  list.innerHTML = c ? newsListHtml(c.items, false) : '<div class="news-empty">読み込み中...</div>';
  newsFetchTheme(t)
    .then(() => { if (newsMode() === 'theme' && _newsPref.theme === t) newsRenderTheme(); })
    .catch(e => {
      if (newsMode() !== 'theme' || _newsPref.theme !== t) return;
      document.getElementById('newsStatus').textContent = `「${t}」を取得できませんでした（${e.message}）`;
      list.innerHTML = '<div class="news-empty">取得できませんでした</div>';
    });
}
function newsSetTheme(i) {
  _newsPref.theme = newsThemes()[i]; newsSavePref();
  newsRenderTheme();
  newsScrollTo(0);
}
// テーマの編集：一覧の上に編集欄を出す（追加・削除・初期に戻す）
function newsEditThemes() {
  const themes = newsThemes();
  document.getElementById('newsList').innerHTML = `<div class="news-edit">
      <div class="news-edit-hd">テーマの編集<button type="button" class="news-edit-done" onclick="newsRenderTheme()">完了</button></div>
      <div class="news-edit-add"><input type="text" id="newsThemeIn" class="news-edit-in" placeholder="キーワード（例：LED照明）" enterkeyhint="done"
        onkeydown="if(event.key==='Enter'){event.preventDefault();newsAddTheme();}"><button type="button" class="news-edit-btn" onclick="newsAddTheme()">追加</button></div>
      ${themes.map((k, i) => `<div class="news-edit-row"><span>${escH(k)}</span><button type="button" class="news-edit-del" onclick="newsDelTheme(${i})" aria-label="削除">×</button></div>`).join('')}
      <button type="button" class="news-edit-reset" onclick="newsResetThemes()">初期のテーマに戻す</button>
      <div class="news-edit-note">キーワードでYahoo!ニュースを検索します。スペースで区切ると「両方を含む記事」になります。</div>
    </div>`;
}
function newsAddTheme() {
  const v = document.getElementById('newsThemeIn').value.trim().replace(/\s+/g, ' ').slice(0, 40);
  if (!v) return;
  const t = newsThemes();
  if (!t.includes(v)) { t.push(v); newsSaveThemes(t); }
  newsEditThemes();
}
function newsDelTheme(i) {
  const t = newsThemes();
  t.splice(i, 1);
  newsSaveThemes(t);
  newsEditThemes();
}
function newsResetThemes() {
  if (!confirm('テーマを初期の状態に戻しますか？')) return;
  try { localStorage.removeItem(NEWS_THEME_KEY); } catch(e) {}
  newsEditThemes();
}

// --- 記事を開く ---
function newsOpen(i) { const c = newsCached(); if (c && c.items[i]) newsOpenItem(c.items[i]); }  // ホームのウィジェット用（主要の記事）
function newsOpenView(i) { if (_newsView[i]) newsOpenItem(_newsView[i]); }
function newsOpenItem(n) {
  if (!document.getElementById('tab-news').classList.contains('active')) switchTab('news', document.createElement('button'));
  const reader = document.getElementById('newsReader');
  const listView = document.getElementById('newsListView');
  if (!listView.classList.contains('hide')) _newsListScroll = window.scrollY || document.body.scrollTop;  // 戻った時に同じ位置から見られるように
  listView.classList.add('hide');
  reader.classList.remove('hide');
  newsScrollTo(0);
  const head = `<button type="button" class="news-back" onclick="newsBack()">◀ 一覧へ</button><h2 class="news-title">${escH(n.title)}</h2>`;
  // Yahoo!以外のサイトの記事（テーマ検索の代わりに見つけた物）は本文を読み取れないので元のサイトで開く
  if (n.ext) {
    reader.innerHTML = head + `<div class="news-meta">${escH(newsAgo(n.date))}</div><div class="news-empty">この記事はYahoo!ニュース以外のサイトのため、Wm2Bの中では本文を読めません</div>`
      + `<a class="news-orig news-orig-big" href="${escH(n.link)}">元のサイトで読む</a>`;
    return;
  }
  if (_newsArticles[n.link]) { reader.innerHTML = head + newsArticleHtml(_newsArticles[n.link], n); return; }
  reader.innerHTML = head + '<div class="news-empty">本文を読み込み中...</div>';
  fetch(NEWS_API + '/article?url=' + encodeURIComponent(n.link))
    .then(r => r.ok ? r.json() : Promise.reject(new Error('status ' + r.status)))
    .then(a => {
      _newsArticles[n.link] = a;
      if (!reader.classList.contains('hide')) reader.innerHTML = head + newsArticleHtml(a, n);
    })
    .catch(e => {
      reader.innerHTML = head + `<div class="news-empty">本文を取得できませんでした（${escH(e.message)}）</div>`
        + `<a class="news-orig" href="${escH(n.link)}">元の記事を開く</a>`;
    });
}
// 写真1枚（タップで大きく表示）
function newsFigHtml(src, cap) {
  return `<figure class="news-fig"><img class="news-img" src="${escH(src)}" alt="" loading="lazy" onclick="newsZoom(this.src)" onerror="this.parentNode.remove()">`
    + (cap ? `<figcaption class="news-cap">${escH(cap)}</figcaption>` : '') + '</figure>';
}
function newsArticleHtml(a, n) {
  const paras  = a.paragraphs || [];
  const blocks = a.blocks || [];   // 中継が新しければ、段落と写真が本文の順番で入っている
  const meta   = [a.source, a.date || newsAgo(n.date)].filter(Boolean).join(' · ');
  const base   = s => String(s || '').replace(/\?.*$/, '');
  // 代表写真(og:image)は、本文の中に同じ写真が無い時だけ一番上に出す
  const topImg = a.image && !blocks.some(b => b.t === 'img' && base(b.src) === base(a.image));
  const body = blocks.some(b => b.t === 'p')
    ? blocks.map(b => b.t === 'p' ? `<p class="news-p">${escH(b.text)}</p>`
        : b.t === 'img' ? newsFigHtml(b.src, b.cap)
        // 写真ページへのリンク：中継がそのページの写真へ転送するので、そのまま写真として出す
        : newsFigHtml(`${NEWS_API}/thumb?url=${encodeURIComponent(b.url)}`, b.label)).join('')
    : paras.length ? paras.map(p => `<p class="news-p">${escH(p)}</p>`).join('')
    : '<div class="news-empty">本文を読み取れませんでした</div>';
  return `<div class="news-meta">${escH(meta)}</div>`
    + (topImg ? newsFigHtml(a.image, '') : '')
    + (a.lead && paras.length && paras[0] !== a.lead.split('\n')[0] ? `<p class="news-lead">${escH(a.lead)}</p>` : '')
    + body
    // 写真・動画・表など、ここで出せない物を見たい時の逃げ道
    + `<a class="news-orig" href="${escH(a.url || n.link)}">元の記事を開く</a>`;
}
// 写真を画面いっぱいに表示（タップで閉じる）
function newsZoom(src) {
  let z = document.getElementById('newsZoom');
  if (!z) {
    z = document.createElement('div');
    z.id = 'newsZoom';
    z.className = 'news-zoom';
    z.onclick = newsZoomClose;
    z.innerHTML = '<img alt=""><span class="news-zoom-x">✕</span>';
    document.body.appendChild(z);
  }
  z.querySelector('img').src = src;
  z.classList.add('show');
}
function newsZoomClose() { const z = document.getElementById('newsZoom'); if (z) z.classList.remove('show'); }
let _newsListScroll = 0;
// 本体は body がスクロール枠なので、window と body の両方に効かせる
function newsScrollTo(y) { window.scrollTo(0, y); document.body.scrollTop = y; }
function newsBack() {
  newsZoomClose();
  const reader = document.getElementById('newsReader');
  const wasOpen = !reader.classList.contains('hide');
  reader.classList.add('hide');
  document.getElementById('newsListView').classList.remove('hide');
  if (wasOpen) newsScrollTo(_newsListScroll);
}

// 記事を読んでいる時に右へフリックすると一覧へ戻る（iPhoneの「戻る」と同じ感覚）。
// 横に80px以上・縦の動きの2倍以上・0.5秒以内のはっきりしたフリックだけ（縦スクロールや写真の拡大では反応しない）
(function () {
  let sx = 0, sy = 0, st = 0, on = false;
  document.addEventListener('touchstart', e => {
    const r = document.getElementById('newsReader');
    on = !!r && !r.classList.contains('hide') && document.getElementById('tab-news').classList.contains('active') && e.touches.length === 1;
    if (on) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now(); }
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (!on) return;
    on = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (dx > 80 && dx > Math.abs(dy) * 2 && Date.now() - st < 500) newsBack();
  }, { passive: true });
})();

'use strict';
// === NEWS（ニュース。2026-10-30追加） ===
// Yahoo!ニュース「主要」の見出しと記事本文を、Cloudflareの中継Worker（cloudflare_worker_relay.js の /news/）経由で取り、
// Wm2Bの画面の中で読む（本文は中継が記事ページから抜き出した文章。写真・動画・表は出ないことがある）。
// 見出し一覧は5分間この端末に覚えておき、開くたびには取りに行かない。本文は開いている間だけ覚える（保存しない）。
const NEWS_API       = 'https://morning-resonance-c98bh.h2ec9629.workers.dev/news';
const NEWS_CACHE_KEY = 'ojisan_news_cache_v1';
const NEWS_TTL       = 5 * 60 * 1000;
let _news = null;            // { at: 取得時刻, items: [{title, link, date}] }
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
  _newsLoading = fetch(NEWS_API + '/list?feed=top')
    .then(r => r.ok ? r.json() : Promise.reject(new Error('status ' + r.status)))
    .then(d => {
      _news = { at: Date.now(), items: d.items || [] };
      try { localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(_news)); } catch(e) {}
      return _news.items;
    })
    .finally(() => { _newsLoading = null; });
  return _newsLoading;
}

// 「3時間前」「10/30 12:10」形式
function newsAgo(s) {
  const t = Date.parse(s);
  if (isNaN(t)) return '';
  const min = Math.floor((Date.now() - t) / 60000);
  if (min < 1)  return 'たった今';
  if (min < 60) return min + '分前';
  if (min < 24 * 60) return Math.floor(min / 60) + '時間前';
  const d = new Date(t);
  return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// --- ホームのウィジェット（見出し4件。タップでその記事を開く＝launcher.js の w-news） ---
function newsWidget() {
  const c = newsCached();
  const items = (c && c.items) || [];
  lnPut('lnNewsList', 'innerHTML', items.length
    ? items.slice(0, 4).map((n, i) => `<span class="ln-rem-row" data-news-i="${i}"><span class="ln-rem-bar ln-news-bar"></span><span class="ln-rem-title">${escH(n.title)}</span><span class="ln-rem-due">${newsAgo(n.date)}</span></span>`).join('')
    : `<span class="ln-empty">${_newsLoading || !c ? '読み込み中...' : 'ニュースを取得できませんでした'}</span>`);
  if (!c || Date.now() - c.at >= NEWS_TTL) newsLoad().then(newsWidget, () => lnPut('lnNewsList', 'innerHTML', '<span class="ln-empty">ニュースを取得できませんでした</span>'));
}

// --- ニュースタブ（一覧 ⇔ 記事） ---
function newsShow() {
  newsBack();
  newsRenderList();
  if (!newsCached() || Date.now() - newsCached().at >= NEWS_TTL) newsRefresh();
}
function newsRefresh() {
  document.getElementById('newsStatus').textContent = '更新中...';
  newsLoad(true).then(() => { newsRenderList(); newsWidget(); },
    e => { document.getElementById('newsStatus').textContent = '取得できませんでした（' + e.message + '）'; });
}
function newsRenderList() {
  const c = newsCached();
  const items = (c && c.items) || [];
  document.getElementById('newsStatus').textContent = c ? '最終更新 ' + newsAgo(new Date(c.at).toUTCString()) : '';
  document.getElementById('newsList').innerHTML = items.length
    ? items.map((n, i) => `<button type="button" class="news-item" onclick="newsOpen(${i})"><span class="news-item-title">${escH(n.title)}</span><span class="news-item-date">${newsAgo(n.date)}</span></button>`).join('')
    : '<div class="news-empty">ニュースがありません</div>';
}
function newsOpen(i) {
  const c = newsCached();
  const n = c && c.items[i];
  if (!n) return;
  if (!document.getElementById('tab-news').classList.contains('active')) switchTab('news', document.createElement('button'));
  const reader = document.getElementById('newsReader');
  document.getElementById('newsListView').classList.add('hide');
  reader.classList.remove('hide');
  window.scrollTo(0, 0);
  const head = `<button type="button" class="news-back" onclick="newsBack()">◀ 一覧へ</button><h2 class="news-title">${escH(n.title)}</h2>`;
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
function newsArticleHtml(a, n) {
  const paras = a.paragraphs || [];
  const meta  = [a.source, a.date || newsAgo(n.date)].filter(Boolean).join(' · ');
  return `<div class="news-meta">${escH(meta)}</div>`
    + (a.image ? `<img class="news-img" src="${escH(a.image)}" alt="" loading="lazy" onerror="this.remove()">` : '')
    + (a.lead && paras.length && paras[0] !== a.lead.split('\n')[0] ? `<p class="news-lead">${escH(a.lead)}</p>` : '')
    + (paras.length ? paras.map(p => `<p class="news-p">${escH(p)}</p>`).join('')
                    : '<div class="news-empty">本文を読み取れませんでした</div>')
    // 写真・動画・表など、ここで出せない物を見たい時の逃げ道
    + `<a class="news-orig" href="${escH(a.url || n.link)}">元の記事を開く</a>`;
}
function newsBack() {
  document.getElementById('newsReader').classList.add('hide');
  document.getElementById('newsListView').classList.remove('hide');
}

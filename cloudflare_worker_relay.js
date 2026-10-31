// ===== meas_dev.html 用 GitHub API 中継Worker =====
// iPad2からapi.github.comへの直接通信がTLS/ネットワークの都合で全滅するため、
// このWorkerを間に挟んで代わりにGitHubへリクエストを送ってもらう。
// iPad2からはこのWorkerのURL（workers.dev）宛てに今までと同じヘッダー・bodyで
// リクエストを送るだけでOK。PATもそのままAuthorizationヘッダーで転送する。
//
// 2026-10-30追加：/news/ 以下はWm2Bのニュース機能用（news.js）。
//   /news/list?feed=top          … Yahoo!ニュースのRSS（見出し一覧）をJSONにして返す
//   /news/list?feed=all          … 全ジャンルのRSSをまとめて新しい順に返す（同じ記事は1件に。各記事に cat=ジャンル）
//   /news/article?url=<記事URL>  … 記事ページを取ってきて本文だけ抜き出してJSONで返す（Wm2Bの画面で読むため）
//   /news/thumb?url=<記事URL>    … 記事の写真（og:image）へ転送する。一覧のサムネに <img src> でそのまま使う
//   /news/search?q=<キーワード>  … テーマ用。Yahoo!ニュースの記事検索の結果を返す。読み取れなかった時は
//                                 Googleニュースの検索で代わりに探す（その記事は ext=true＝Wm2B内で本文は読めない）
//   取りに行ける先は news.yahoo.co.jp だけに限定（何でも中継できる踏み台にしないため）。
//   本文は読む人の画面に出すだけで、どこにも保存しない。

const CORS = { 'Access-Control-Allow-Origin': '*' };

// 見出し一覧の取得元（feed= の値 → RSSのURL）。Yahoo!のRSSは1本8件前後なので、全ジャンルをまとめて件数を増やす
const NEWS_FEEDS = {
  top:           'https://news.yahoo.co.jp/rss/topics/top-picks.xml',
  domestic:      'https://news.yahoo.co.jp/rss/topics/domestic.xml',
  world:         'https://news.yahoo.co.jp/rss/topics/world.xml',
  business:      'https://news.yahoo.co.jp/rss/topics/business.xml',
  entertainment: 'https://news.yahoo.co.jp/rss/topics/entertainment.xml',
  sports:        'https://news.yahoo.co.jp/rss/topics/sports.xml',
  it:            'https://news.yahoo.co.jp/rss/topics/it.xml',
  science:       'https://news.yahoo.co.jp/rss/topics/science.xml',
  local:         'https://news.yahoo.co.jp/rss/topics/local.xml',
};
const NEWS_HOSTS = ['news.yahoo.co.jp'];
const BROWSER_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

export default {
  async fetch(request) {
    // ブラウザが先に送ってくるOPTIONS（プリフライト）には即OKを返す
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Accept, Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    if (url.pathname.startsWith('/news/')) return handleNews(url);

    // Worker URL の後ろにつけたパス・クエリをそのままapi.github.comへ転送する
    // 例: https://<worker>.workers.dev/repos/h2ec9629/reminder-app/contents/meas_history.json
    const githubUrl = 'https://api.github.com' + url.pathname + url.search;

    const headers = new Headers();
    const auth = request.headers.get('Authorization');
    if (auth) headers.set('Authorization', auth);
    headers.set('Accept', 'application/vnd.github+json');
    headers.set('User-Agent', 'meas-relay-worker');
    const ct = request.headers.get('Content-Type');
    if (ct) headers.set('Content-Type', ct);

    const init = { method: request.method, headers: headers };
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = await request.text();
    }

    let resp;
    try {
      resp = await fetch(githubUrl, init);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'relay fetch failed', detail: String(e) }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const body = await resp.text();
    return new Response(body, {
      status: resp.status,
      headers: {
        'Content-Type': resp.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};

// ===== ニュース =====
function json(obj, status = 200, maxAge = 0) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${maxAge}`, ...CORS },
  });
}

async function getText(target) {
  const res = await fetch(target, { headers: { 'User-Agent': BROWSER_UA, 'Accept-Language': 'ja' }, cf: { cacheTtl: 300 } });
  if (!res.ok) throw new Error('取得失敗 ' + res.status + ' ' + target);
  return res.text();
}

async function handleNews(url) {
  try {
    if (url.pathname === '/news/list') {
      const key = url.searchParams.get('feed') || 'top';
      if (key === 'all') return json({ items: await allFeeds() }, 200, 300);
      const feed = NEWS_FEEDS[key];
      if (!feed) return json({ error: 'unknown feed' }, 400);
      return json({ items: parseRss(await getText(feed)).map(i => ({ ...i, cat: key })) }, 200, 300);
    }
    if (url.pathname === '/news/search') {
      const q = (url.searchParams.get('q') || '').trim().slice(0, 60);
      if (!q) return json({ error: 'no query' }, 400);
      let items = [];
      try { items = parseYahooSearch(await getText('https://news.yahoo.co.jp/search?ei=utf-8&p=' + encodeURIComponent(q))); } catch (e) {}
      if (!items.length) {
        const g = await getText('https://news.google.com/rss/search?hl=ja&gl=JP&ceid=JP:ja&q=' + encodeURIComponent(q));
        items = parseRss(g).map(i => ({ ...i, title: i.title.replace(/\s+-\s+[^-]+$/, ''), ext: true }));
      }
      return json({ items }, 200, 600);
    }
    if (url.pathname === '/news/article' || url.pathname === '/news/thumb') {
      let target;
      try { target = new URL(url.searchParams.get('url') || ''); } catch (e) { return json({ error: 'bad url' }, 400); }
      if (target.protocol !== 'https:' || !NEWS_HOSTS.includes(target.hostname)) return json({ error: 'host not allowed' }, 400);
      if (url.pathname === '/news/thumb') {
        // 写真が無い記事は404（一覧側は画像の読み込み失敗として枠ごと消す）。写真のアドレスは1日覚えさせる
        const img = meta(await getText(target.href), 'og:image');
        if (!/^https:\/\//.test(img)) return json({ error: 'no image' }, 404, 3600);
        return new Response(null, { status: 302, headers: { Location: img, 'Cache-Control': 'public, max-age=86400', ...CORS } });
      }
      return json(await readArticle(target.href), 200, 600);
    }
    return json({ error: 'not found' }, 404);
  } catch (e) {
    return json({ error: String(e && e.message || e) }, 502);
  }
}

// 全ジャンルを同時に取ってまとめる。取れなかったジャンルは飛ばす。同じ記事が複数ジャンルにあれば先に出た方（主要が先頭）を残す
async function allFeeds() {
  const keys = Object.keys(NEWS_FEEDS);
  const lists = await Promise.all(keys.map(k => getText(NEWS_FEEDS[k]).then(parseRss, () => [])));
  const seen = new Set();
  const all = [];
  lists.forEach((items, i) => items.forEach(it => {
    const id = it.link.replace(/\?.*$/, '');
    if (seen.has(id)) return;
    seen.add(id);
    all.push({ ...it, cat: keys[i] });
  }));
  return all.sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
}

// Yahoo!の「トピックス」はまず要約ページ(/pickup/)で、そこから「記事全文を読む」で本文(/articles/)へ飛ぶ。
// 要約ページの要約文はリード（lead）として残し、本文ページが取れればその本文を、取れなければ要約だけを返す。
async function readArticle(href) {
  let html = await getText(href);
  let lead = '';
  let finalUrl = href;
  if (/\/pickup\//.test(href)) {
    lead = extractParagraphs(html).slice(0, 3).join('\n');
    const m = html.match(/https:\/\/news\.yahoo\.co\.jp\/articles\/[0-9a-zA-Z]+/);
    if (m) {
      finalUrl = m[0];
      try { html = await getText(finalUrl); } catch (e) { finalUrl = href; }
    }
  }
  const a = extractArticle(html);
  if (!a.paragraphs.length && lead) a.paragraphs = lead.split('\n');
  return { ...a, lead, url: finalUrl };
}

// --- ここから下は文字列処理だけ（Node でもそのままテストできるようにしてある） ---
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decode(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENT ? ENT[n.toLowerCase()] : m));
}
function tagText(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? decode(m[1]).trim() : '';
}
function meta(html, prop) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*>`, 'i');
  const tag = (html.match(re) || [''])[0];
  const c = tag.match(/content=["']([^"']*)["']/i);
  return c ? decode(c[1]).trim() : '';
}

function parseRss(xml) {
  const items = [];
  const re = /<item[\s>][\s\S]*?<\/item>/gi;
  let m;
  while ((m = re.exec(xml)) && items.length < 30) {
    const b = m[0];
    const title = tagText(b, 'title');
    const link = tagText(b, 'link');
    if (!title || !link) continue;
    items.push({ title, link, date: tagText(b, 'pubDate') });
  }
  return items;
}

// Yahoo!ニュース検索の結果ページから記事を拾う。記事本文(/articles/)へのリンク1つが1件。
// リンクの中の文字のうち一番長いものを見出し、<time> を日時、<img> をサムネとして使う（ページの作りが少し変わっても拾えるように）
function parseYahooSearch(html) {
  const items = [];
  const seen = new Set();
  const re = /<a\s[^>]*href="(https:\/\/news\.yahoo\.co\.jp\/articles\/[0-9a-zA-Z]+)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) && items.length < 30) {
    if (seen.has(m[1])) continue;
    const inner = m[2];
    const texts = inner.replace(/<time[\s\S]*?<\/time>/gi, '\n').split(/<[^>]+>/).map(t => decode(t).trim()).filter(Boolean);
    const title = texts.reduce((a, b) => (b.length > a.length ? b : a), '');
    if (title.length < 8) continue;
    seen.add(m[1]);
    const img = (inner.match(/<img[^>]+src="([^"]+)"/i) || [, ''])[1];
    items.push({ title, link: m[1], date: tagText(inner, 'time'), image: /^https:/.test(img) ? decode(img) : '' });
  }
  return items;
}

// 本文の抜き出し：記事本文の入れ物（article_body 等）があればその中だけを見て、<p> の文章を拾う。
// Yahoo!は本文1つの<p>の中を<br>で改行していることが多いので、空行で段落に分ける。
const BODY_MARKERS = ['article_body', 'articleBody', 'article-body'];
const END_MARKERS = ['</article>', 'article_footer', 'class="related', '関連記事', 'コメント'];
const JUNK = /記事全文を読む|無断転載|Copyright|All rights reserved|Yahoo!ニュース|この記事は|^\s*【関連記事】/;
function extractParagraphs(html) {
  let body = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const start = BODY_MARKERS.map(k => body.indexOf(k)).filter(i => i >= 0).sort((a, b) => a - b)[0];
  if (start !== undefined) {
    body = body.slice(start);
    const end = END_MARKERS.map(k => body.indexOf(k, 50)).filter(i => i > 0).sort((a, b) => a - b)[0];
    if (end !== undefined) body = body.slice(0, end);
  }
  const out = [];
  const re = /<p[\s>][\s\S]*?<\/p>/gi;
  let m;
  while ((m = re.exec(body))) {
    const text = decode(m[0].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''));
    text.split(/\n\s*\n/).forEach(t => {
      t = t.replace(/[ \t　]+\n/g, '\n').trim();
      if (t.length >= 10 && !JUNK.test(t)) out.push(t);
    });
  }
  return out;
}
function extractArticle(html) {
  return {
    title: meta(html, 'og:title') || tagText(html, 'title'),
    image: meta(html, 'og:image'),
    date: (html.match(/<time[^>]*>([^<]+)<\/time>/i) || [, ''])[1].trim(),
    source: meta(html, 'og:site_name') || 'Yahoo!ニュース',
    paragraphs: extractParagraphs(html),
  };
}

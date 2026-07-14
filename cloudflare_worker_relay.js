// ===== meas_dev.html 用 GitHub API 中継Worker =====
// iPad2からapi.github.comへの直接通信がTLS/ネットワークの都合で全滅するため、
// このWorkerを間に挟んで代わりにGitHubへリクエストを送ってもらう。
// iPad2からはこのWorkerのURL（workers.dev）宛てに今までと同じヘッダー・bodyで
// リクエストを送るだけでOK。PATもそのままAuthorizationヘッダーで転送する。

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

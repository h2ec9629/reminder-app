// 三相測定 Service Worker v2（オフライン起動対応）
var CACHE_NAME = 'meas-v2';
var ASSETS = [
  './meas.html',
  './meas_manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// インストール：資産を1件ずつキャッシュ（1つ失敗しても他は残す＝addAllの全滅を防ぐ）
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.all(ASSETS.map(function(u) {
        return cache.add(u).catch(function() {});
      }));
    })
  );
  self.skipWaiting();
});

// 有効化：古いキャッシュを削除
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var req = event.request;
  if (req.method !== 'GET') return;              // 保存等のPOST/PUTは素通し

  var url = new URL(req.url);
  var sameOrigin = (url.origin === self.location.origin);

  // アプリ起動（画面遷移）：まずネット→失敗したらキャッシュのmeas.htmlを返す
  // これでオンライン時は常に最新、オフライン時もキャッシュから起動できる
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(function() {
        return caches.match(req).then(function(c) {
          return c || caches.match('./meas.html');
        });
      })
    );
    return;
  }

  // 同一オリジンのアプリ資産：キャッシュ優先＋裏でネット更新（無ければネット）
  if (sameOrigin) {
    event.respondWith(
      caches.match(req).then(function(cached) {
        var net = fetch(req).then(function(res) {
          if (res && res.status === 200) {
            var clone = res.clone();
            caches.open(CACHE_NAME).then(function(c) { c.put(req, clone); });
          }
          return res;
        }).catch(function() { return cached; });
        return cached || net;
      })
    );
    return;
  }

  // 他ドメイン（GitHub API／リレー等）：キャッシュせず常にネット（古いデータを掴まないため）
  // ここでは respondWith しない＝ブラウザ既定のネット取得に任せる
});

// Service Worker for PWA/TWA
const CACHE_NAME = 'mainichi-ai-name-analysis-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline'
];

// インストール時: キャッシュを作成
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[SW] Cache failed:', error);
      })
  );
  // 新しいService Workerを即座に有効化
  self.skipWaiting();
});

// アクティベート時: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // すぐにコントロールを取得
  return self.clients.claim();
});

// フェッチ時: ネットワーク優先、フォールバックでキャッシュ
self.addEventListener('fetch', (event) => {
  // GETリクエストのみキャッシュ対象
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // レスポンスをクローン（一度しか読み取れないため）
        const responseToCache = response.clone();

        // 成功したレスポンスをキャッシュに保存
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // ネットワークエラー時、キャッシュから取得
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // キャッシュにもない場合、オフラインページを返す
          if (event.request.destination === 'document') {
            return caches.match('/offline');
          }
          return new Response('オフラインです', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

// プッシュ通知対応（将来の実装用）
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  // 将来の実装: 日次運勢通知など
});


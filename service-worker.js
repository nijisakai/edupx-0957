const CACHE_NAME = 'edupx-cache-v1';
// Define core assets for the app shell
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx',
  '/App.tsx',
  '/locales/en.json',
  '/locales/zh.json',
  '/assets/tailwind.css',
  // Other assets will be cached on first use via the fetch handler
];

// URLs for external dependencies that should be cached
const EXTERNAL_ASSETS = [
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/client'
];

const ASSETS_TO_CACHE = [...CORE_ASSETS, ...EXTERNAL_ASSETS];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
          console.error('Failed to cache all core assets:', err);
          // Try adding one by one if addAll fails
          return Promise.all(ASSETS_TO_CACHE.map(asset => {
            return cache.add(asset).catch(e => console.warn(`Failed to cache individual asset: ${asset}`, e));
          }));
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // We only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Try to get the response from the cache
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // If not in cache, fetch from the network
      try {
        const networkResponse = await fetch(event.request);
        // If the request is successful, clone it and store it in the cache.
        if (networkResponse && networkResponse.status === 200) {
            // We should only cache requests from our origin or known CDNs.
            const url = new URL(event.request.url);
            if (url.origin === self.location.origin || 
                url.hostname === 'esm.sh' || 
                url.hostname === 'avatar.vercel.sh') {
                await cache.put(event.request, networkResponse.clone());
            }
        }
        return networkResponse;
      } catch (error) {
        // The fetch failed, likely due to a network error.
        console.error('Fetch failed; returning offline fallback if available.', error);
        // You could return a generic offline fallback page here if you had one cached.
        // For example: return caches.match('/offline.html');
        // For now, we'll just let the error propagate, which will show a browser error.
        throw error;
      }
    })
  );
});
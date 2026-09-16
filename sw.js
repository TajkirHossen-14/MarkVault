// @ts-check
// Static shell only. Third-party requests and user downloads are never cached.
const VERSION = 'markvault-shell-v1.2.0';
const ROOT = new URL('./', self.location.href);
const essentials = ['index.html','manifest.webmanifest','assets/icons/logo.svg','assets/icons/maskable.svg','assets/fonts/geist-latin.woff2','assets/fonts/jetbrains-mono-latin.woff2','css/tokens.css','css/base.css','css/components.css','css/marketing.css','css/app.css','css/refinements.css','js/components/marketing-menu.js','assets/fonts/geist-latin-ext.woff2','assets/fonts/jetbrains-mono-latin-ext.woff2','js/theme.js','js/main.js','js/components/icon.js','js/components/primitives.js','js/components/dialogs.js','js/core/scheduler.js','js/core/store.js','js/core/signal.js','js/core/dom.js','js/core/events.js','js/core/component.js','js/core/url.js','js/core/hash.js','js/core/format.js','js/core/fuzzy.js','js/core/focus.js','js/core/router.js','js/core/idb.js','js/core/lzw.js','js/core/virtual-list.js','js/lib/constants.js','js/data/migrations.js','js/data/repository.js','js/data/bookmark-repo.js','js/data/folder-repo.js','js/data/tag-repo.js','js/data/meta-repo.js','js/data/schema.js','js/data/sync-tabs.js','js/services/vault.js','js/services/share.js','js/services/export.js','js/services/import.js','js/services/metadata.js','js/services/markdown.js','js/services/linkcheck.js','js/services/stats.js','js/workers/import-parser.worker.js','js/workers/stats.worker.js','js/pages/marketing.js','js/pages/app.js','js/pages/settings.js','js/pages/stats.js','js/pages/shared.js','js/pages/docs.js','js/pages/kitchen-sink.js'];
self.addEventListener('install', event => { event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(essentials.map(path => new URL(path, ROOT).href)))); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('markvault-shell-') && key !== VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('message', event => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname) || url.pathname.includes('/dev/') || url.searchParams.has('test')) return;
  const relative = url.pathname.slice(ROOT.pathname.length);
  if (!essentials.includes(relative) && relative !== '') return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => (await caches.open(VERSION)).match(new URL('index.html', ROOT).href)));
    return;
  }
  event.respondWith(caches.open(VERSION).then(async cache => {
    const cached = await cache.match(request);
    if (relative.startsWith('assets/')) {
      const fresh = fetch(request).then(response => { if (response.ok) cache.put(request, response.clone()); return response; }).catch(() => cached);
      event.waitUntil(fresh); return cached || fresh;
    }
    return cached || fetch(request);
  }));
});

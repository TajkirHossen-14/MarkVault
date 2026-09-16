// @ts-check
import './components/icon.js';
import './components/primitives.js';
import { startRouter } from './core/router.js';
import { prefs, applyTheme } from './core/store.js';
import { toast } from './components/primitives.js';
import { html } from './core/dom.js';
const lifecycle = new AbortController();
const root = document.getElementById('root');
if (new URLSearchParams(location.search).get('sidebar') === 'collapsed') prefs.state.sidebarCollapsed = true;
if (prefs.state.reducedMotion) document.documentElement.setAttribute('data-reduced-motion', '');
const media = matchMedia('(prefers-color-scheme: dark)');
media.addEventListener('change', () => { if (prefs.state.theme === 'system') applyTheme('system'); }, { signal: lifecycle.signal });
window.addEventListener('error', event => { if (event.message) toast('Something interrupted that action. Your saved bookmarks are safe.'); }, { signal: lifecycle.signal });
window.addEventListener('unhandledrejection', event => { if (event.reason?.name !== 'AbortError') toast(event.reason?.message || 'That action could not be completed. Please try again.'); }, { signal: lifecycle.signal });
const dispose = startRouter(root, async path => {
  if (path === '/') return (await import('./pages/marketing.js')).mount;
  if (path === '/app' || path.startsWith('/app/')) return (await import('./pages/app.js')).mount;
  if (path === '/shared') return (await import('./pages/shared.js')).mount;
  if (path === '/docs') return (await import('./pages/docs.js')).mount;
  if (path === '/dev/kitchen-sink') return (await import('./pages/kitchen-sink.js')).mount;
  return element => { element.append(html`<main class="fallback"><span class="eyebrow">A SMALL DETOUR</span><h2>This page isn’t in your vault.</h2><p>The address may have changed. Your bookmarks are right where you left them.</p><a class="btn btn-primary" href="#/app">Back to your vault</a></main>`); };
});
if ('serviceWorker' in navigator && !new URLSearchParams(location.search).has('test')) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(new URL('../sw.js', import.meta.url), { scope: new URL('../', import.meta.url).pathname });
      let updateRequested = false;
      const offerUpdate = () => { if (registration.waiting && navigator.serviceWorker.controller) toast('A fresh version of MarkVault is ready.', { label:'Update', run:() => { updateRequested = true; registration.waiting?.postMessage({ type:'SKIP_WAITING' }); } }); };
      offerUpdate();
      registration.addEventListener('updatefound', () => { registration.installing?.addEventListener('statechange', offerUpdate, { signal:lifecycle.signal }); }, { signal:lifecycle.signal });
      let reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (updateRequested && !reloading) { reloading = true; location.reload(); } }, { signal:lifecycle.signal });
    } catch { /* The vault remains fully usable if hosting disables service workers. */ }
  }, { once:true, signal:lifecycle.signal });
}
window.addEventListener('pagehide', event => { if (!event.persisted) { dispose(); lifecycle.abort(); } }, { once:true });

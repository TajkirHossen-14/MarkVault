// @ts-check
import { schedule, debounce } from './scheduler.js';
const equal = (a, b) => Object.is(a, b) || (a && b && typeof a === 'object' && typeof b === 'object' && Object.keys(a).length === Object.keys(b).length && Object.keys(a).every(k => Object.is(a[k], b[k])));
/** Lazy deep-proxy reactive state with selector-scoped, frame-batched notifications. @param {object} initialState */
export function createStore(initialState) {
  const raw = structuredClone(initialState), proxies = new WeakMap(), subscriptions = new Set();
  const flush = () => subscriptions.forEach(s => { const next = s.selector(state); if (!equal(next, s.value)) { const previous = s.value; s.value = next; s.callback(next, previous); } });
  const wrap = object => {
    if (!object || typeof object !== 'object') return object;
    if (proxies.has(object)) return proxies.get(object);
    const proxy = new Proxy(object, { get(target, key) { return wrap(Reflect.get(target, key)); }, set(target, key, value) { if (!Object.is(target[key], value)) { target[key] = value; schedule(flush); } return true; }, deleteProperty(target, key) { delete target[key]; schedule(flush); return true; } });
    proxies.set(object, proxy); return proxy;
  };
  const state = wrap(raw);
  return { state, subscribe(selector, callback, options = {}) { const subscription = { selector, callback, value: selector(state) }; subscriptions.add(subscription); if (options.immediate) callback(subscription.value); return () => subscriptions.delete(subscription); }, batch(fn) { fn(state); }, snapshot() { return structuredClone(raw); } };
}
const testId = new URLSearchParams(location.search).get('test');
const preferenceKey = testId && /^mvtest-[a-z0-9-]+$/.test(testId) ? `mv:prefs:v1:${testId}` : 'mv:prefs:v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(preferenceKey) || '{}'); } catch {}
export const prefs = createStore({ theme: 'dark', view: matchMedia('(max-width:767px)').matches ? 'compact' : 'grid', density: 'comfortable', sidebarCollapsed: false, sort: 'newest', backupDismissed: false, externalFavicons: false, previews: false, previewEndpoint: 'https://api.microlink.io/?url=', ...saved });
const persist = debounce(() => { try { localStorage.setItem(preferenceKey, JSON.stringify(prefs.snapshot())); } catch {} }, 200);
prefs.subscribe(s => ({ ...s }), persist);
/** Resolve and apply a persisted theme choice. @param {string} choice */
export function applyTheme(choice) {
  prefs.state.theme = choice;
  const resolved = choice === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : choice;
  document.documentElement.dataset.theme = resolved;
  document.querySelectorAll('[data-action="theme"]').forEach(button => { button.querySelector('mv-icon')?.setAttribute('name', resolved === 'light' ? 'sun' : 'moon'); button.setAttribute('aria-label', `${resolved === 'light' ? 'Light' : 'Dark'} theme. Switch to ${resolved === 'light' ? 'dark' : 'light'}.`); });
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#141722' : '#f5f6fa');
}

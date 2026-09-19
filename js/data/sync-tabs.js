// @ts-check
const test = new URLSearchParams(location.search).get('test');
const namespace = test && /^mvtest-[a-z0-9-]+$/.test(test) ? test : 'markvault';
const pingKey = `mv:sync:${namespace}`;
let channel;
/** Receive tab invalidations with an isolated test channel and storage-event fallback. @param {Function} onChange @param {AbortSignal} signal */
export function connectTabs(onChange, signal) {
  if ('BroadcastChannel' in window) {
    const current = new BroadcastChannel(namespace); channel = current;
    current.addEventListener('message', onChange, { signal });
    signal.addEventListener('abort', () => { current.close(); if (channel === current) channel = null; }, { once: true });
  } else window.addEventListener('storage', event => { if (event.key === pingKey) onChange(); }, { signal });
}
/** Notify after commit. One-shot channels also reach open app tabs from shared pages. @param {string} type @param {string[]} ids */
export function broadcast(type, ids = []) {
  if (channel) channel.postMessage({ type, ids });
  else if ('BroadcastChannel' in window) { const temporary = new BroadcastChannel(namespace); temporary.postMessage({ type, ids }); temporary.close(); }
  else try { localStorage.setItem(pingKey, JSON.stringify({ type, ids, time:Date.now(), nonce:Math.random() })); } catch {}
}

// @ts-check
const queue = new Set();
let frame = 0;
/** Batch work once per animation frame. @param {Function} task */
export function schedule(task) {
  queue.add(task);
  if (!frame) frame = requestAnimationFrame(() => { frame = 0; const tasks = [...queue]; queue.clear(); tasks.forEach(fn => fn()); });
}
/** Run noncritical work when idle. @param {Function} task @returns {Function} */
export function idle(task) {
  if ('requestIdleCallback' in window) { const id = requestIdleCallback(() => task()); return () => cancelIdleCallback(id); }
  const id = setTimeout(task, 32); return () => clearTimeout(id);
}
/** @param {Function} fn @param {number} delay */
export function debounce(fn, delay = 120) { let timer; const run = (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; run.cancel = () => clearTimeout(timer); return run; }

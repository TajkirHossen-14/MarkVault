// @ts-check
let observer = null;
/** Reactive value with dependency tracking. @template T @param {T} initial */
export function signal(initial) {
  let value = initial; const observers = new Set();
  return { get value() { if (observer) { observers.add(observer); observer.dependencies.add(observers); } return value; }, set value(next) { if (Object.is(next, value)) return; value = next; [...observers].forEach(fn => fn()); } };
}
/** Lazy cached derivation. @param {Function} derive */
export function computed(derive) {
  let dirty = true, cached; const result = signal(0);
  const invalidate = () => { if (!dirty) { dirty = true; result.value++; } }; invalidate.dependencies = new Set();
  return { get value() { result.value; if (dirty) { invalidate.dependencies.forEach(s => s.delete(invalidate)); invalidate.dependencies.clear(); const previous = observer; observer = invalidate; try { cached = derive(); dirty = false; } finally { observer = previous; } } return cached; } };
}
/** Track an effect and return its cleanup. @param {Function} fn */
export function effect(fn) { let cleanup; const run = () => { cleanup?.(); run.dependencies.forEach(s => s.delete(run)); run.dependencies.clear(); const previous = observer; observer = run; try { cleanup = fn(); } finally { observer = previous; } }; run.dependencies = new Set(); run(); return () => { cleanup?.(); run.dependencies.forEach(s => s.delete(run)); }; }

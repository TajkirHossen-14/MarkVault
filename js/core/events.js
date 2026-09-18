// @ts-check
/** Small lifecycle-aware event bus. */
export class EventBus {
  #events = new Map();
  on(type, callback, signal) { if (!this.#events.has(type)) this.#events.set(type, new Set()); this.#events.get(type).add(callback); const off = () => this.#events.get(type)?.delete(callback); signal?.addEventListener('abort', off, { once: true }); return off; }
  emit(type, data) { this.#events.get(type)?.forEach(fn => fn(data)); }
}
export const bus = new EventBus();

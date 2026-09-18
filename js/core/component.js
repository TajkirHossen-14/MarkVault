// @ts-check
import { schedule } from './scheduler.js';
import { prefs } from './store.js';
/** Light-DOM component with lifecycle-owned listeners and subscriptions. */
export class BaseComponent extends HTMLElement {
  static props = {};
  static get observedAttributes() { return Object.keys(this.props); }
  #controller; #cleanups = [];
  connectedCallback() { this.#controller = new AbortController(); this.update(); this.mounted?.(); }
  attributeChangedCallback() { if (this.isConnected) schedule(this.update); }
  disconnectedCallback() { this.#controller?.abort(); this.#cleanups.splice(0).forEach(fn => fn()); }
  update = () => { if (!this.isConnected) return; const output = this.render?.(); if (output) this.replaceChildren(output); };
  on(target, type, callback, options = {}) { target.addEventListener(type, callback, { ...options, signal: this.#controller.signal }); }
  sub(selector, callback) { this.#cleanups.push(prefs.subscribe(selector, callback)); }
  cleanup(fn) { this.#cleanups.push(fn); }
}

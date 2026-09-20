// @ts-check
import { BaseComponent } from '../core/component.js';
import { html } from '../core/dom.js';
import { colorOf } from '../core/hash.js';
import { prefs } from '../core/store.js';
class Section extends BaseComponent {}
class Kbd extends BaseComponent { render() { return html`<kbd>${this.getAttribute('keys')}</kbd>`; } }
class Tag extends BaseComponent { static props = { label: {} }; render() { return html`<span class="tag-pill tag-${colorOf(this.getAttribute('label') || '')}">${this.getAttribute('label')}</span>`; } }
class Empty extends BaseComponent { render() { return html`<div class="empty-symbol"><mv-icon name="${this.getAttribute('icon') || 'bookmark'}"></mv-icon></div><h3>${this.getAttribute('heading')}</h3><p>${this.getAttribute('description')}</p>`; } }
class Favicon extends BaseComponent { render() { const domain = this.getAttribute('domain') || ''; const fallback = html`<span class="favicon-monogram tag-${colorOf(domain)}">${domain[0]?.toUpperCase() || 'M'}</span>`; if (!prefs.state.externalFavicons) return fallback; const img = document.createElement('img'); Object.assign(img, { src: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`, width: 24, height: 24, alt: '', loading: 'lazy', decoding: 'async', referrerPolicy: 'no-referrer' }); img.addEventListener('error', () => img.replaceWith(fallback), { once: true }); return img; } }
class Toaster extends BaseComponent { #timers = new Set(); show(message, action) { const toast = document.createElement('div'); toast.className = 'toast'; toast.append(html`<mv-icon name="checkcircle"></mv-icon><span>${message}</span>`); if (action) { const button = document.createElement('button'); button.className = 'text-link'; button.textContent = action.label; this.on(button, 'click', () => { action.run(); toast.remove(); }); toast.append(button); } this.append(toast); const timer = setTimeout(() => { toast.remove(); this.#timers.delete(timer); }, 6000); this.#timers.add(timer); } disconnectedCallback() { super.disconnectedCallback(); this.#timers.forEach(clearTimeout); } }
for (const [name, type] of [['section', Section], ['kbd', Kbd], ['tag-pill', Tag], ['empty-state', Empty], ['favicon', Favicon], ['toaster', Toaster]]) customElements.define(`mv-${name}`, type);
/** Announce a transient notification. @param {string} message @param {{label:string,run:Function}} [action] */
export function toast(message, action) { document.querySelector('mv-toaster')?.show(message, action); }

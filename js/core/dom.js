// @ts-check
const templates = new WeakMap();
/** Safe template renderer: interpolation becomes DOM text, never HTML. @param {TemplateStringsArray} strings @param {...any} values @returns {DocumentFragment} */
export function html(strings, ...values) {
  let template = templates.get(strings);
  if (!template) { template = document.createElement('template'); template.innerHTML = strings.reduce((out, str, i) => out + str + (i < strings.length - 1 ? `__mv_${i}__` : ''), ''); templates.set(strings, template); }
  const fragment = template.content.cloneNode(true);
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT), nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const append = (parent, value) => { if (Array.isArray(value)) value.forEach(v => append(parent, v)); else if (value instanceof Node) parent.append(value); else if (value !== false && value !== null && value !== undefined) parent.append(document.createTextNode(String(value))); };
  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('__mv_')) {
      const replacement = document.createDocumentFragment();
      node.textContent.split(/(__mv_\d+__)/g).forEach(part => { const match = /^__mv_(\d+)__$/.exec(part); append(replacement, match ? values[Number(match[1])] : part); }); node.replaceWith(replacement);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      for (const attr of [...node.attributes]) {
        if (!attr.value.includes('__mv_')) continue;
        const exact = /^__mv_(\d+)__$/.exec(attr.value), value = exact ? values[Number(exact[1])] : null;
        if (attr.name === 'ref' && typeof value === 'function') { value(node); node.removeAttribute('ref'); }
        else if (attr.name.startsWith('@') && typeof value === 'function') { node.addEventListener(attr.name.slice(1), value); node.removeAttribute(attr.name); }
        else if (exact && (value === false || value === null || value === undefined)) node.removeAttribute(attr.name);
        else node.setAttribute(attr.name, attr.value.replace(/__mv_(\d+)__/g, (_, i) => String(values[Number(i)] ?? '')));
      }
    }
  }
  return fragment;
}
/** @param {string} tag @param {object} attrs @param {...any} children */
export function h(tag, attrs = {}, ...children) { const node = document.createElement(tag); for (const [key, value] of Object.entries(attrs)) if (value !== null && value !== false) node.setAttribute(key, String(value)); children.flat().forEach(c => node.append(c instanceof Node ? c : String(c ?? ''))); return node; }
/** @returns {{current: Element|null, bind: Function}} */
export function ref() { const value = { current: null, bind: node => { value.current = node; } }; return value; }
/** @param {...any} values */
export function classes(...values) { return values.flatMap(v => typeof v === 'object' ? Object.keys(v).filter(k => v[k]) : v).filter(Boolean).join(' '); }
/** Delegate actions using a single lifecycle-owned listener. @param {Element|Document} root @param {object} actions @param {AbortSignal} signal */
export function delegate(root, actions, signal) { root.addEventListener('click', event => { const target = event.target.closest('[data-action]'); if (target && root.contains(target)) actions[target.dataset.action]?.(event, target); }, { signal }); }
/** Keep keyed nodes and focus alive across reorders. @param {Element} root @param {Array} items @param {Function} render @param {Function} update */
export function reconcile(root, items, render, update = () => {}) { const old = new Map([...root.children].map(node => [node.dataset.key, node])); let anchor = root.firstChild; for (const item of items) { const key = String(item.id); let node = old.get(key); if (!node) { node = render(item); node.dataset.key = key; } else { update(node, item); old.delete(key); } if (node !== anchor) root.insertBefore(node, anchor); anchor = node.nextSibling; } old.forEach(node => node.remove()); }

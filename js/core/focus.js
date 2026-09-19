// @ts-check
/** Native focus trap with nested-safe inertness and return focus. @param {HTMLDialogElement} dialog */
export function openDialog(dialog) {
  const previous = document.activeElement, controller = new AbortController();
  document.body.append(dialog); const root = document.getElementById('root'); if (root) root.inert = true;
  dialog.showModal();
  const cleanup = () => { controller.abort(); dialog.remove(); if (root) root.inert = !!document.querySelector('dialog[open]'); if (previous?.isConnected && !document.querySelector('dialog[open]')) previous.focus({ preventScroll:true }); };
  dialog.addEventListener('close', cleanup, { once: true });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } }, { signal: controller.signal });
  window.addEventListener('hashchange', () => dialog.close(), { signal: controller.signal });
  return () => dialog.close();
}
/** Arrow-key roving focus for tabs. @param {HTMLElement} root @param {AbortSignal} signal */
export function roving(root, signal) {
  root.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
    const items = [...root.querySelectorAll('[role="tab"]')], current = items.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1) + items.length) % items.length;
    event.preventDefault(); items.forEach((item,i) => item.tabIndex = i === next ? 0 : -1); items[next]?.focus(); items[next]?.click();
  }, { signal });
}

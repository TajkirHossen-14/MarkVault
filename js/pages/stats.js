// @ts-check
import { html } from '../core/dom.js';
import { effect } from '../core/signal.js';
import { vault } from '../services/vault.js';
import { getStats } from '../services/stats.js';
/** Real, zero-seeded statistics. @param {HTMLElement} slot @param {AbortSignal} signal */
export async function mountStats(slot, signal) {
  slot.className = 'page-slot stats-content'; let controller;
  const cleanup = effect(() => {
    const records = vault.value.bookmarks; controller?.abort(); controller = new AbortController(); const local = controller;
    getStats(records, local.signal).then(stats => {
      if (signal.aborted || local.signal.aborted) return;
      const heatmap = html`<div class="heatmap" role="img" aria-label="Bookmark activity over the last 364 days"></div>`.firstElementChild;
      for (let i = 363; i >= 0; i--) { const date = new Date(); date.setDate(date.getDate() - i); const key = date.toISOString().slice(0, 10), count = stats.days[key] || 0, cell = document.createElement('span'); cell.className = 'heatmap-cell'; cell.dataset.level = String(Math.min(4, count)); cell.title = `${date.toLocaleDateString()}: ${count} bookmark${count === 1 ? '' : 's'}`; heatmap.append(cell); }
      slot.replaceChildren(html`<div class="stat-grid">${[['Your collection',stats.total,'bookmark','Links worth keeping'],['Unread',stats.unread,'inbox','Discoveries still waiting'],['Favorites',stats.favorites,'star','The ones you return to'],['Revisits',stats.visits,'external','Opened from your vault']].map(([label,count,icon,description]) => html`<article class="stat-card"><div class="spread"><span>${label}</span><mv-icon name="${icon}"></mv-icon></div><span class="stat-number">${count.toLocaleString()}</span><p>${description}</p></article>`)}</div><section class="stats-panel"><h2>A year of little discoveries.</h2><p>Every square is a day. Every saved link is a new possibility.</p><div class="heatmap-scroll">${heatmap}</div><div class="heatmap-footer"><span>Last 52 weeks</span><span>${stats.total ? 'Your collection grows at your own pace.' : 'Your first bookmark starts the story.'}</span></div></section><div class="stats-columns"><section class="stats-panel"><h2>Your corners of the internet.</h2><p>The websites you save most often.</p>${stats.domains.length ? stats.domains.map(([domain,count]) => { const row = html`<div class="domain-row"><span>${domain}</span><span class="domain-meter"><i></i></span><span class="mono">${count}</span></div>`; row.querySelector('i').style.setProperty('--bar-width', `${count / stats.domains[0][1] * 100}%`); return row; }) : html`<p class="stats-empty">No domains yet. Your saved websites will appear here.</p>`}</section><section class="stats-panel"><h2>The threads that connect.</h2><p>Your tags, by how often you use them.</p><div class="tag-cloud">${Object.keys(stats.tags).length ? vault.value.tags.filter(t => stats.tags[t.id]).sort((a,b) => stats.tags[b.id] - stats.tags[a.id]).map(t => html`<a href="#/app?tag=${encodeURIComponent(t.id)}"><mv-tag-pill label="${t.name}"></mv-tag-pill><span class="mono subtle"> ${stats.tags[t.id]}</span></a>`) : html`<p class="stats-empty">Add tags to find your common threads.</p>`}</div></section></div>`);
    }).catch(error => { if (error.name !== 'AbortError') slot.replaceChildren(html`<p class="notice">Couldn’t calculate insights. Your bookmarks are safe. Please try again.</p>`); });
  });
  return () => { cleanup(); controller?.abort(); };
}

// @ts-check
import { html } from '../core/dom.js';
import { decodeShare } from '../services/share.js';
import { bootVault, importVault } from '../services/vault.js';
import { toast } from '../components/primitives.js';
/** Validated, read-only URL-embedded collection. @param {HTMLElement} root @param {URLSearchParams} params @param {object} context */
export async function mount(root, params, { signal }) {
  let records;
  try { records = decodeShare(params.get('d') || ''); } catch (error) { root.append(html`<main class="fallback"><h2>This share link couldn’t be opened.</h2><p>${error.message} It may have been truncated. Ask the sender for a new copy.</p><a class="btn" href="#/app">Open your vault</a></main>`); return; }
  root.append(html`<main class="shared-page" id="main-content"><header class="standalone-header"><a class="brand" href="#/"><img src="assets/icons/logo.svg" alt="" width="30" height="30">MarkVault</a><a class="btn" href="#/app">Your vault <mv-icon name="arrow"></mv-icon></a></header><div class="standalone-heading"><span class="eyebrow">GOOD FINDS, PASSED ALONG</span><h1>A little collection.<br>Worth sharing.</h1><p>${records.length} bookmarks shared directly with you. Read-only, no server, no sign-in. Import a copy to make them your own.</p><button class="btn btn-primary shared-import">Import these ${records.length} bookmarks <mv-icon name="arrow"></mv-icon></button></div><div class="shared-grid">${records.map(b => html`<article class="shared-card"><span class="mono">${b.domain}</span><h2>${b.title}</h2><p>${b.description}</p><a class="text-link" href="${b.url}" target="_blank" rel="noopener noreferrer">Visit website <mv-icon name="external"></mv-icon></a></article>`)}</div></main>`);
  root.querySelector('.shared-import').addEventListener('click', async event => { const button = event.currentTarget; button.disabled = true; try { await bootVault(); const result = await importVault({ bookmarks: records, folders: [], tags: [] }); toast(`${result.imported} bookmarks added. ${result.skipped} duplicates skipped.`); location.hash = '/app'; } catch (error) { toast(error.message); button.disabled = false; } }, { signal });
}

// @ts-check
import { signal } from '../core/signal.js';
import { bookmarkRepo } from '../data/bookmark-repo.js';
import { folderRepo } from '../data/folder-repo.js';
import { tagRepo } from '../data/tag-repo.js';
import { metaRepo } from '../data/meta-repo.js';
import { atomic } from '../data/repository.js';
import { bookmark, folder, tag } from '../data/schema.js';
import { broadcast } from '../data/sync-tabs.js';
import { requestPromise } from '../core/idb.js';
export const vault = signal({ bookmarks: [], folders: [], tags: [], meta: [] });
/** Read an updated local snapshot. */
export async function refresh() { const [bookmarks, folders, tags, meta] = await Promise.all([bookmarkRepo.all(), folderRepo.all(), tagRepo.all(), metaRepo.all()]); vault.value = { bookmarks, folders: folders.sort((a,b) => a.order - b.order), tags, meta }; return vault.value; }
const changed = async (type, ids = []) => { await refresh(); broadcast(type, ids); };
/** Validate/dedupe and atomically save a bookmark with newly created tags. @param {object} input @param {string[]} names */
export async function saveBookmark(input, names = []) {
  const record = bookmark({ ...input, updatedAt: Date.now() });
  await atomic(async stores => { const duplicate = await requestPromise(stores.bookmarks.index('normalizedUrl').get(record.normalizedUrl)); if (duplicate && duplicate.id !== record.id) throw new Error(`This link is already in ${duplicate.deletedAt ? 'Trash' : 'your vault'}: “${duplicate.title}”.`); const tags = await requestPromise(stores.tags.getAll()); record.tagIds = []; for (const name of [...new Set(names.map(n => n.trim()).filter(Boolean))].slice(0, 30)) { const candidate = tag(name); const existing = tags.find(t => t.slug === candidate.slug); const next = existing || candidate; if (!existing) { stores.tags.put(next); tags.push(next); } if (!record.tagIds.includes(next.id)) record.tagIds.push(next.id); } stores.bookmarks.put(record); });
  navigator.storage?.persist?.().catch(() => {}); await changed('bookmark', [record.id]); return record;
}
/** Atomic partial updates supporting favorites, visits, trash and restore. @param {string[]} ids @param {object|Function} update */
export async function updateBookmarks(ids, update) { await atomic(async stores => { for (const id of ids) { const item = await requestPromise(stores.bookmarks.get(id)); if (item) stores.bookmarks.put({ ...item, ...(typeof update === 'function' ? update(item) : update), updatedAt: Date.now() }); } }); await changed('bookmark', ids); }
/** @param {string[]} ids */
export async function purgeBookmarks(ids) { await atomic(stores => ids.forEach(id => stores.bookmarks.delete(id))); await collectTags(); await changed('purge', ids); }
/** @param {string} name @param {string|null} parentId */
export async function createFolder(name, parentId = null) { let depth = 1, parent = parentId; const seen = new Set(); while (parent) { if (seen.has(parent)) throw new Error('Invalid folder hierarchy.'); seen.add(parent); depth++; const found = vault.value.folders.find(f => f.id === parent); if (!found) throw new Error('Parent folder not found.'); parent = found.parentId; } if (depth > 3) throw new Error('Folders can be nested up to three levels.'); const existing = vault.value.folders.find(f => f.name.toLowerCase() === name.trim().toLowerCase() && f.parentId === parentId); if (existing) return existing; const record = folder(name, parentId, vault.value.folders.length); await folderRepo.put(record); await changed('folder', [record.id]); return record; }
/** Delete a folder subtree, keeping its bookmarks in All. @param {string} id */
export async function deleteFolder(id) { const ids = new Set([id]); let size; do { size = ids.size; vault.value.folders.forEach(f => { if (ids.has(f.parentId)) ids.add(f.id); }); } while (size !== ids.size); await atomic(async stores => { const records = await requestPromise(stores.bookmarks.getAll()); records.filter(b => ids.has(b.folderId)).forEach(b => stores.bookmarks.put({ ...b, folderId: null })); ids.forEach(key => stores.folders.delete(key)); }); await changed('folder', [...ids]); }
/** @param {string} id @param {string} name */
export async function renameFolder(id, name) { if (!name.trim()) throw new Error('A folder needs a name.'); const record = await folderRepo.get(id); await folderRepo.put({ ...record, name: name.trim().slice(0,100) }); await changed('folder', [id]); }
/** @param {string[]} orderedIds */
export async function reorderFolders(orderedIds) { await atomic(stores => orderedIds.forEach((id, order) => { const f = vault.value.folders.find(f => f.id === id); if (f) stores.folders.put({ ...f, order }); })); await changed('folder', orderedIds); }
async function collectTags() { await atomic(async stores => { const bookmarks = await requestPromise(stores.bookmarks.getAll()); const tags = await requestPromise(stores.tags.getAll()); const used = new Set(bookmarks.flatMap(b => b.tagIds)); tags.filter(t => !used.has(t.id)).forEach(t => stores.tags.delete(t.id)); }); }
/** Save metadata owned by this browser. @param {string} key @param {any} value */
export async function setMeta(key, value) { await metaRepo.put({ key, value }); await changed('meta'); }
/** Purge expired trash only, never live bookmarks. */
export async function bootVault() { await refresh(); const expired = vault.value.bookmarks.filter(b => b.deletedAt && b.deletedAt < Date.now() - 30 * 86400000); if (expired.length) await purgeBookmarks(expired.map(b => b.id)); }
/** Destructive clear: caller must obtain explicit DELETE confirmation. */
export async function clearVault() { await atomic(stores => Object.values(stores).forEach(store => store.clear())); await changed('clear'); }
/** Chunked import; normalized URL uniqueness is checked within each transaction. @param {object} payload @param {Function} progress */
export async function importVault(payload, progress = () => {}) {
  const folders = new Map(), tags = new Map();
  // Validate and topologically order folder input before any write, including malicious cycles.
  const sources = new Map((payload.folders || []).filter(f => f && typeof f.id === 'string' && typeof f.name === 'string').map(f => [f.id, f]));
  const ordered = [], visited = new Set(), visiting = new Set();
  const visit = id => { if (visited.has(id)) return; if (visiting.has(id)) throw new Error('Import contains a cyclic folder hierarchy.'); const source = sources.get(id); if (!source) return; visiting.add(id); if (source.parentId) visit(source.parentId); visiting.delete(id); visited.add(id); ordered.push(source); };
  for (const id of sources.keys()) visit(id);
  for (const input of payload.bookmarks) bookmark(input);
  for (const source of ordered) { let parent = folders.get(source.parentId) || null, depth = 1, cursor = parent; while (cursor) { depth++; cursor = vault.value.folders.find(f => f.id === cursor)?.parentId; } if (depth > 3) parent = vault.value.folders.find(f => f.id === parent)?.parentId || null; const f = await createFolder(source.name || 'Imported', parent); folders.set(source.id, f.id); }
  const existingTags = [...vault.value.tags];
  for (const source of (payload.tags || [])) { if (!source || typeof source.name !== 'string' || !source.name.trim()) continue; const candidate = tag(source.name); const t = existingTags.find(t => t.slug === candidate.slug) || candidate; if (!existingTags.some(item => item.id === t.id)) existingTags.push(t); tags.set(source.id, t); }
  let imported = 0, skipped = 0;
  for (let offset = 0; offset < payload.bookmarks.length; offset += 500) {
    const chunk = payload.bookmarks.slice(offset, offset + 500).map(input => bookmark(input));
    await atomic(async stores => { for (const item of chunk) { const duplicate = await requestPromise(stores.bookmarks.index('normalizedUrl').get(item.normalizedUrl)); if (duplicate) { skipped++; continue; } item.id = crypto.randomUUID(); item.folderId = folders.get(item.folderId) || null; item.tagIds = item.tagIds.map(id => tags.get(id)).filter(Boolean).map(t => { stores.tags.put(t); return t.id; }); stores.bookmarks.put(item); imported++; } }); progress(Math.min(offset + 500, payload.bookmarks.length), payload.bookmarks.length); await new Promise(resolve => setTimeout(resolve, 0));
  }
  await changed('import'); return { imported, skipped };
}

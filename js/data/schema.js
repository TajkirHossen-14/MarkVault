// @ts-check
import { normalizeUrl, domainOf, prettifyTitle, isValidUrl } from '../core/url.js';
import { colorOf } from '../core/hash.js';
const text = (value, max = 10000) => typeof value === 'string' ? value.slice(0, max) : '';
const timestamp = (value, fallback) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
/** Validate and rebuild imported or manually entered bookmark data. @param {object} input */
export function bookmark(input) { if (!input || typeof input !== 'object') throw new Error('Invalid bookmark record.'); const normalizedUrl = normalizeUrl(text(input.url, 8192)); const url = isValidUrl(input.url) ? input.url : normalizedUrl; const now = Date.now(); return { id: text(input.id, 100) || crypto.randomUUID(), url, normalizedUrl, domain: domainOf(url), title: text(input.title, 500).trim() || prettifyTitle(url), description: text(input.description, 2000), note: text(input.note, 50000), faviconUrl: '', imageUrl: '', folderId: text(input.folderId, 100) || null, tagIds: Array.isArray(input.tagIds) ? input.tagIds.filter(t => typeof t === 'string').slice(0, 100) : [], isFavorite: input.isFavorite === true, isRead: input.isRead === true, visitCount: Math.max(0, Math.floor(Number(input.visitCount) || 0)), lastVisitedAt: timestamp(input.lastVisitedAt, null), status: ['ok', 'unreachable', 'unchecked'].includes(input.status) ? input.status : 'unchecked', lastCheckedAt: timestamp(input.lastCheckedAt, null), createdAt: timestamp(input.createdAt, now), updatedAt: timestamp(input.updatedAt, now), deletedAt: timestamp(input.deletedAt, null) }; }
/** @param {string} name @param {string|null} parentId @param {number} order */
export function folder(name, parentId = null, order = 0) { if (!name.trim()) throw new Error('A folder needs a name.'); return { id: crypto.randomUUID(), name: name.trim().slice(0, 100), parentId, order, color: colorOf(name), icon: 'folder' }; }
/** @param {string} name */
export function tag(name) { const cleaned = name.trim().slice(0, 50); const slug = cleaned.toLowerCase().replace(/\s+/g, '-'); return { id: crypto.randomUUID(), name: cleaned, slug, color: colorOf(slug) }; }

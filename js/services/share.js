// @ts-check
import { compress, decompress } from '../core/lzw.js';
import { bookmark } from '../data/schema.js';
/** Share excludes private notes, visit history and Trash. @param {Array} records */
export function createShare(records) { const d = compress(JSON.stringify(records.map(b => [b.url, b.title, b.description]))); return `${location.href.split('#')[0]}#/shared?d=${d}`; }
/** Validate each positional field before rebuilding a read-only bookmark. @param {string} data */
export function decodeShare(data) { const decoded = JSON.parse(decompress(data)); if (!Array.isArray(decoded) || decoded.length > 5000) throw new Error('Invalid share payload.'); return decoded.map(row => { if (!Array.isArray(row) || row.length !== 3 || row.some(value => typeof value !== 'string')) throw new Error('Malformed shared bookmark.'); return bookmark({ url: row[0], title: row[1], description: row[2] }); }); }

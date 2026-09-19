// @ts-check
import { openDB, tx, requestPromise } from '../core/idb.js';
import { upgrade } from './migrations.js';
let connection;
/** Lazy connection keeps the marketing page usable even with IDB disabled. */
export function database() { const test = new URLSearchParams(location.search).get('test'); const name = test && /^mvtest-[a-z0-9-]+$/.test(test) ? test : 'markvault'; return connection ||= openDB(name, 1, { upgrade }).catch(error => { connection = null; throw error; }); }
/** Reusable repository, owned by services. @param {string} name */
export function repository(name) { return { async all() { return tx(await database(), [name], 'readonly', stores => requestPromise(stores[name].getAll())); }, async get(id) { return tx(await database(), [name], 'readonly', stores => requestPromise(stores[name].get(id))); }, async put(value) { return tx(await database(), [name], 'readwrite', stores => requestPromise(stores[name].put(value))); }, async remove(id) { return tx(await database(), [name], 'readwrite', stores => requestPromise(stores[name].delete(id))); } }; }
/** @param {Function} fn */
export async function atomic(fn) { return tx(await database(), ['bookmarks', 'folders', 'tags', 'meta'], 'readwrite', fn); }

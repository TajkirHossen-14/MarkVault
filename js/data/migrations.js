// @ts-check
export const migrations = new Map([
  [1, db => { const bookmarks = db.createObjectStore('bookmarks', { keyPath: 'id' }); for (const name of ['normalizedUrl', 'domain', 'folderId', 'createdAt', 'updatedAt', 'isFavorite', 'deletedAt', 'tagIds']) bookmarks.createIndex(name, name, { unique: name === 'normalizedUrl', multiEntry: name === 'tagIds' }); const folders = db.createObjectStore('folders', { keyPath: 'id' }); folders.createIndex('parentId', 'parentId'); folders.createIndex('order', 'order'); const tags = db.createObjectStore('tags', { keyPath: 'id' }); tags.createIndex('slug', 'slug', { unique: true }); tags.createIndex('name', 'name'); db.createObjectStore('meta', { keyPath: 'key' }); }],
  // Reserved v2 hook: new migrations run in the upgrade transaction, never delete user data.
  [2, () => {}]
]);
/** @param {IDBDatabase} db @param {number} oldVersion */
export function upgrade(db, oldVersion) { for (const [version, migrate] of migrations) if (version > oldVersion && version <= db.version) migrate(db); }

// @ts-check
export const palette = ['rose', 'amber', 'emerald', 'cyan', 'blue', 'violet', 'fuchsia', 'slate'];
/** Deterministic djb2 hash. @param {string} text */
export function hash(text) { let n = 5381; for (const char of text) n = ((n << 5) + n) ^ char.charCodeAt(0); return n >>> 0; }
/** @param {string} text */
export function colorOf(text) { return palette[hash(text) % palette.length]; }

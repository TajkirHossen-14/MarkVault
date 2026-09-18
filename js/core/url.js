// @ts-check
/** Accept only navigable HTTP(S) URLs. @param {string} input */
export function isValidUrl(input) { try { const u = new URL(input); return ['https:', 'http:'].includes(u.protocol) && !!u.hostname && !u.username && !u.password; } catch { return false; } }
/** Canonical URL for duplicate detection. @param {string} input */
export function normalizeUrl(input) { const value = input.trim(); const url = new URL(/^[a-z][\w+.-]*:/i.test(value) ? value : `https://${value}`); if (!isValidUrl(url.href)) throw new Error('Please enter a valid http or https URL.'); url.hash = ''; for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$|ref$)/i.test(key)) url.searchParams.delete(key); url.searchParams.sort(); url.hostname = url.hostname.toLowerCase(); return url.href.replace(/\/(?=\?|$)/, ''); }
/** @param {string} url */
export function domainOf(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } }
/** Derive a readable local title without a network request. @param {string} input */
export function prettifyTitle(input) { try { const url = new URL(input); const part = decodeURIComponent(url.pathname.split('/').filter(Boolean).at(-1) || ''); return part ? part.replace(/\.[a-z]{2,5}$/i, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : domainOf(input); } catch { return ''; } }

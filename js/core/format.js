// @ts-check
const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
/** @param {number} timestamp */
export function relativeTime(timestamp) { const days = (timestamp - Date.now()) / 86400000; if (Math.abs(days) >= 1) return rtf.format(Math.round(days), 'day'); const hours = days * 24; if (Math.abs(hours) >= 1) return rtf.format(Math.round(hours), 'hour'); return rtf.format(Math.round(hours * 60), 'minute'); }
/** @param {number} value */
export function number(value) { return new Intl.NumberFormat().format(value); }
/** @param {number} value */
export function bytes(value) { return value < 1048576 ? `${(value / 1024).toFixed(1)} KB` : `${(value / 1048576).toFixed(1)} MB`; }

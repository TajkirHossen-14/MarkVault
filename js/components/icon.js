// @ts-check
import { BaseComponent } from '../core/component.js';
const paths = {
  arrow: 'M5 12h14m-6-6 6 6-6 6', chevron: 'm9 5 7 7-7 7', down: 'm6 9 6 6 6-6', plus: 'M12 5v14M5 12h14', close: 'm6 6 12 12M6 18 18 6', menu: 'M4 6h16M4 12h16M4 18h16',
  bookmark: 'M6 4h12v17l-6-4-6 4V4Z', vault: 'M5 3h14v18l-7-4-7 4V3Zm5 0v9l2-2 2 2V3', grid: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z', list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01', compact: 'M4 5h16M4 10h16M4 15h16M4 20h16',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0', star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z', clock: 'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0', folder: 'M3 7V4h7l2 3h9v13H3V7Z', tag: 'm3 3 9 0 9 9-9 9-9-9V3Zm4 4h.01',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7', settings: 'm9 3-.5 3-2 .9L4 6l-2 4 2 2v2l-2 2 2 4 2.5-.9 2 .9.5 3h6l.5-3 2-.9 2.5.9 2-4-2-2v-2l2-2-2-4-2.5.9-2-.9L15 3H9ZM15 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0', shield: 'm12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6', lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5V10Zm7 5v2',
  upload: 'M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5', download: 'M12 3v13m-5-5 5 5 5-5M4 16v5h16v-5', external: 'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7', check: 'm5 12 4 4L19 6', checkcircle: 'm7 12 3 3 7-7M22 12a10 10 0 1 1-5-8.7', keyboard: 'M2 5h20v14H2V5Zm4 4h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M10 13h.01M14 13h.01M18 13h.01M8 16h8',
  sun: 'M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0', moon: 'M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10Z', github: 'M9 19c-4 1-4-2-6-2m12 5v-4c0-1 .1-2-.5-2.5 4-.5 6-2 6-5.5 0-1.5-.5-2.5-1.5-3.5.3-1 .3-2-.2-3-2 0-3 1-4 1a15 15 0 0 0-5.6 0c-1 0-2-1-4-1-.5 1-.5 2-.2 3C4 7.5 3.5 8.5 3.5 10c0 3.5 2 5 6 5.5C9 16 9 17 9 18v4',
  spark: 'm12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z', globe: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M2 12h20M12 2c6 6 6 14 0 20-6-6-6-14 0-20', link: 'm10 13 4-4M8 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 1 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
  stats: 'M4 20V10h4v10H4Zm6 0V4h4v16h-4Zm6 0v-8h4v8h-4Z', inbox: 'M3 4h18v16H3V4Zm0 10h5l2 3h4l2-3h5', help: 'M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 3m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0', bolt: 'm13 2-9 12h7l-1 8 10-13h-8l1-7Z', cloudOff: 'M3 3l18 18M5 16a5 5 0 0 1-1-9m5-2a6 6 0 0 1 10 4 4 4 0 0 1 2 7M8 17h7',
  edit: 'm16 3 5 5-12 12H4v-5L16 3Zm-2 2 5 5', more: 'M5 12h.01M12 12h.01M19 12h.01', sort: 'M8 4v16m-4-4 4 4 4-4M16 20V4m-4 4 4-4 4 4', filter: 'M3 5h18M6 12h12M9 19h6M7 3v4M17 10v4M11 17v4', panel: 'M3 3h18v18H3V3Zm6 0v18', undo: 'M3 4v6h6M3 10c3-6 15-7 17 2 1 5-4 10-10 8', share: 'm8 10 8-5M8 14l8 5M9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0M21 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0M21 20a3 3 0 1 1-6 0 3 3 0 0 1 6 0', alert: 'm12 3 10 18H2L12 3Zm0 6v5m0 3h.01', grip: 'M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01'
};
/** Hand-built SVG icon, no network or icon library. */
class Icon extends BaseComponent {
  static props = { name: {} };
  render() { const ns = 'http://www.w3.org/2000/svg'; const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '1.6'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round'); svg.setAttribute('aria-hidden', 'true'); const path = document.createElementNS(ns, 'path'); path.setAttribute('d', paths[this.getAttribute('name')] || paths.bookmark); svg.append(path); return svg; }
}
customElements.define('mv-icon', Icon);

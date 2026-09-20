// @ts-check
import { html, delegate } from '../core/dom.js';
import { openDialog } from '../core/focus.js';
import { applyTheme } from '../core/store.js';
const repository = 'https://github.com/TajkirHossen-14/MarkVault';
/** Touch-first navigation sheet; icon-labelled links, theme control and persistent primary CTA. @param {Function} scrollTo */
export function showMarketingMenu(scrollTo) {
  const dialog=document.createElement('dialog'), controller=new AbortController();
  dialog.className='dialog mobile-sheet marketing-menu';dialog.setAttribute('aria-label','Main navigation');
  const theme=document.documentElement.dataset.theme;
  let requestedSection = null;
  dialog.append(html`<header class="mobile-menu-header"><a class="brand" href="#/" aria-label="MarkVault home"><img src="assets/icons/logo.svg" width="36" height="36" alt="">MarkVault</a><button class="icon-btn" data-action="close" aria-label="Close navigation"><mv-icon name="close"></mv-icon></button></header><p class="mobile-menu-intro">Your internet. A little more intentional.</p><nav class="mobile-menu-links" aria-label="Main navigation">${[['Features','grid'],['Shortcuts','keyboard'],['Privacy','shield'],['FAQ','help']].map(([label,name])=>html`<a href="#${label.toLowerCase()}" data-jump="${label.toLowerCase()}"><span class="menu-link-icon"><mv-icon name="${name}"></mv-icon></span><span>${label}</span><mv-icon name="chevron"></mv-icon></a>`)}<a href="${repository}" target="_blank" rel="noopener noreferrer"><span class="menu-link-icon"><mv-icon name="github"></mv-icon></span><span>GitHub</span><mv-icon name="external"></mv-icon></a></nav><div class="mobile-menu-bottom"><button class="mobile-theme-control" data-action="theme"><mv-icon name="${theme==='light'?'sun':'moon'}"></mv-icon><span>Appearance</span><span class="theme-label">${theme==='light'?'Light':'Dark'}</span></button><a class="btn btn-primary" href="#/app">Open MarkVault <mv-icon name="arrow"></mv-icon></a><span class="status-pill"><span class="status-dot"></span> Local-first. No account needed.</span></div>`);
  delegate(dialog,{close:()=>dialog.close(),theme:()=>{applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');dialog.querySelector('.theme-label').textContent=document.documentElement.dataset.theme==='light'?'Light':'Dark';}},controller.signal);
  dialog.addEventListener('click',event=>{const jump=event.target.closest('[data-jump]');if(jump){event.preventDefault();requestedSection=jump.dataset.jump;dialog.close();}else if(event.target.closest('a[href="#/app"],a[href="#/"]'))dialog.close();},{signal:controller.signal});
  dialog.addEventListener('close',()=>{controller.abort();if(requestedSection)requestAnimationFrame(()=>scrollTo(requestedSection));},{once:true});openDialog(dialog);
}

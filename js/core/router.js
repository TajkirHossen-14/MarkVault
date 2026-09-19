// @ts-check
import { html } from './dom.js';
/** Async route loading stays outside the synchronous View Transition snapshot callback. @param {HTMLElement} root @param {Function} resolve */
export function startRouter(root, resolve) {
  let cleanup, controller, revision=0;
  const navigate=async()=>{
    if(location.hash==='#main-content'){root.querySelector('main')?.focus({preventScroll:true});return;}
    const run=++revision,raw=location.hash.slice(1)||'/',split=raw.indexOf('?');
    const path=split<0?raw:raw.slice(0,split),query=split<0?'':raw.slice(split+1);
    cleanup?.();cleanup=undefined;controller?.abort();const current=controller=new AbortController();
    try{
      const page=await resolve(path);if(run!==revision||current.signal.aborted)return;
      let pending,started=false;
      const mountPage=()=>{
        if(started||run!==revision||current.signal.aborted)return;
        started=true;root.replaceChildren();window.scrollTo(0,0);
        // Do not return this promise to startViewTransition: storage/worker loading can exceed its deadline.
        try{pending=Promise.resolve(page(root,new URLSearchParams(query),{path,signal:current.signal})).then(unmount=>({unmount}),error=>({error}));}catch(error){pending=Promise.resolve({error});}
      };
      if(document.startViewTransition&&!document.documentElement.hasAttribute('data-reduced-motion')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
        const transition=document.startViewTransition(mountPage);
        transition.ready.catch(()=>{});transition.finished.catch(()=>{});
        await transition.updateCallbackDone.catch(()=>{});
        if(!started)mountPage();
      }else mountPage();
      const result=await pending;if(!result)return;if(result.error)throw result.error;
      if(run!==revision||current.signal.aborted)result.unmount?.();else cleanup=result.unmount;
    }catch(error){
      if(run!==revision||current.signal.aborted)return;
      root.replaceChildren(html`<main class="fallback"><mv-icon name="alert"></mv-icon><h2>Something interrupted your vault.</h2><p>${error.message||'Please reload and try again. Your stored data has not been cleared.'}</p><a class="btn btn-primary" href="#/">Back to home</a></main>`);
    }
  };
  const global=new AbortController();window.addEventListener('hashchange',navigate,{signal:global.signal});navigate();
  return()=>{revision++;global.abort();controller?.abort();cleanup?.();};
}

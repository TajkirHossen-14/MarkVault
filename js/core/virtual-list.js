// @ts-check
import { schedule } from './scheduler.js';
import { reconcile } from './dom.js';
function patch(target, source) {
  if (target.nodeType === Node.TEXT_NODE) { if (target.textContent !== source.textContent) target.textContent = source.textContent; return; }
  if (target.nodeType !== Node.ELEMENT_NODE) return;
  for (const attr of [...target.attributes]) if (!source.hasAttribute(attr.name) && !['data-key','role','aria-setsize','aria-posinset'].includes(attr.name)) target.removeAttribute(attr.name);
  for (const attr of [...source.attributes]) if (target.getAttribute(attr.name) !== attr.value) target.setAttribute(attr.name,attr.value);
  if (target instanceof HTMLInputElement && target.type === 'checkbox') target.checked = source.checked;
  if (target.tagName.startsWith('MV-')) return;
  const next=[...source.childNodes], old=[...target.childNodes];
  for(let i=0;i<Math.max(next.length,old.length);i++){if(!next[i])old[i]?.remove();else if(!old[i])target.append(next[i]);else if(old[i].nodeType!==next[i].nodeType||old[i].nodeName!==next[i].nodeName)old[i].replaceWith(next[i]);else patch(old[i],next[i]);}
}
/** Fixed-size windowed grid/rows with keyed recycling, focus retention and six-row overscan. */
export class VirtualList {
  #root; #renderItem; #items=[]; #mode='grid'; #observer; #controller=new AbortController(); #content; #top; #bottom; #height=292; #columns=1; #pool=new Map(); #dirty=false;
  constructor(root,renderItem){this.#root=root;this.#renderItem=renderItem;this.#top=document.createElement('div');this.#content=document.createElement('div');this.#bottom=document.createElement('div');this.#top.className='virtual-spacer';this.#bottom.className='virtual-spacer';this.#content.className='bookmark-grid';this.#content.setAttribute('role','list');root.append(this.#top,this.#content,this.#bottom);root.addEventListener('scroll',()=>schedule(this.#paint),{passive:true,signal:this.#controller.signal});this.#observer=new ResizeObserver(()=>schedule(this.#paint));this.#observer.observe(root);}
  setItems(items,mode='grid'){
    const anchor=this.#items[Math.floor(this.#root.scrollTop/this.#height)*this.#columns]?.id;
    if(mode!==this.#mode){this.#pool.clear();this.#content.replaceChildren();this.#root.scrollTop=0;}
    this.#items=items;this.#mode=mode;this.#dirty=true;this.#content.className=mode==='grid'?'bookmark-grid':`bookmark-rows ${mode==='compact'?'is-compact':''}`;
    const ids=new Set(items.map(item=>item.id));for(const key of this.#pool.keys())if(!ids.has(key))this.#pool.delete(key);
    if(anchor){const index=items.findIndex(item=>item.id===anchor);this.#root.scrollTop=index>=0?Math.floor(index/this.#columns)*this.#height:0;}
    this.#paint();
  }
  #paint=()=>{
    if(!this.#root.isConnected)return;
    this.#columns=this.#mode==='grid'?Math.max(1,getComputedStyle(this.#content).gridTemplateColumns.split(' ').length):1;this.#height=this.#mode==='grid'?292:this.#mode==='compact'?48:56;
    const total=this.#items.length,maxRow=Math.max(0,Math.ceil(total/this.#columns)-1),startRow=Math.min(maxRow,Math.max(0,Math.floor(this.#root.scrollTop/this.#height)-6));
    const visibleRows=Math.ceil(this.#root.clientHeight/this.#height)+12,start=startRow*this.#columns,end=Math.min(total,start+visibleRows*this.#columns);
    this.#top.style.setProperty('--spacer-height',`${startRow*this.#height}px`);this.#bottom.style.setProperty('--spacer-height',`${Math.max(0,Math.ceil(total/this.#columns)-Math.ceil(end/this.#columns))*this.#height}px`);
    const positions=new Map(this.#items.slice(start,end).map((item,i)=>[item.id,start+i+1]));
    const annotate=(node,item)=>{node.setAttribute('role','listitem');node.setAttribute('aria-setsize',String(total));node.setAttribute('aria-posinset',String(positions.get(item.id)));};
    const make=item=>{let node=this.#pool.get(item.id);if(!node){node=this.#renderItem(item,this.#mode);this.#pool.set(item.id,node);}else if(this.#dirty)patch(node,this.#renderItem(item,this.#mode));annotate(node,item);return node;};
    reconcile(this.#content,this.#items.slice(start,end),make,(node,item)=>{if(this.#dirty)patch(node,this.#renderItem(item,this.#mode));annotate(node,item);});this.#dirty=false;
    if(this.#pool.size>200)for(const[key,node]of this.#pool)if(!node.isConnected)this.#pool.delete(key);
  };
  scrollToIndex(index){this.#root.scrollTop=Math.floor(index/this.#columns)*this.#height;this.#paint();const item=this.#items[index];if(item)this.#content.querySelector(`[data-key="${CSS.escape(item.id)}"]`)?.focus();}
  destroy(){this.#controller.abort();this.#observer.disconnect();this.#pool.clear();this.#root.replaceChildren();}
}

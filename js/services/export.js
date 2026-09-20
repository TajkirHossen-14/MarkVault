// @ts-check
import { vault, setMeta } from './vault.js';
const escape=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const csv=value=>`"${String(value??'').replace(/"/g,'""')}"`;
/** Pure portable serialization. @param {object} data @param {string} format */
export function serializeVault(data,format='json'){
 const records=data.bookmarks.filter(b=>!b.deletedAt);
 if(format==='json')return{content:JSON.stringify({app:'MarkVault',version:1,exportedAt:Date.now(),...data},null,2),type:'application/json'};
 if(format==='csv')return{content:[['url','title','description','tags','created'].map(csv).join(','),...records.map(b=>[b.url,b.title,b.description,data.tags.filter(t=>b.tagIds.includes(t.id)).map(t=>t.name).join(';'),new Date(b.createdAt).toISOString()].map(csv).join(','))].join('\r\n'),type:'text/csv'};
 if(format!=='html')throw new Error('Unsupported export format.');
 const tree=(parent,visited=new Set())=>data.folders.filter(f=>f.parentId===parent&&!visited.has(f.id)).map(f=>{const next=new Set(visited);next.add(f.id);return `<DT><H3>${escape(f.name)}</H3><DL><p>${tree(f.id,next)}</DL><p>`;}).join('')+records.filter(b=>b.folderId===parent||(parent===null&&!data.folders.some(f=>f.id===b.folderId))).map(b=>`<DT><A HREF="${escape(b.url)}" ADD_DATE="${Math.floor(b.createdAt/1000)}">${escape(b.title)}</A>`).join('\n');
 return{content:'<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>MarkVault Bookmarks</TITLE><H1>Bookmarks</H1><DL><p>'+tree(null)+'</DL><p>',type:'text/html'};
}
/** File-picker enhancement with browser Blob fallback. @param {string} content @param {string} filename @param {string} type */
export async function download(content,filename,type){const blob=new Blob([content],{type});if('showSaveFilePicker'in window){try{const handle=await window.showSaveFilePicker({suggestedName:filename});const stream=await handle.createWritable();await stream.write(blob);await stream.close();return true;}catch(error){if(error.name==='AbortError')return false;}}const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=filename;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return true;}
/** Only a full JSON backup advances the full-backup reminder. @param {string} format */
export async function exportVault(format='json'){const{content,type}=serializeVault(vault.value,format);const saved=await download(content,`markvault-${new Date().toISOString().slice(0,10)}.${format}`,type);if(saved&&format==='json')await setMeta('lastBackupAt',Date.now());return saved;}

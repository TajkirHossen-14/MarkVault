// @ts-check
import { createZip } from './zip.js';
const button=document.getElementById('download-source'),status=document.getElementById('download-status'),progress=document.getElementById('download-progress'),log=document.getElementById('download-log');
let controller;
button.addEventListener('click',async()=>{
  button.disabled=true;controller=new AbortController();progress.hidden=false;progress.value=0;log.textContent='';
  try{
    const manifestResponse=await fetch('../source-manifest.json',{cache:'no-store',signal:controller.signal});if(!manifestResponse.ok)throw new Error('Source manifest could not be loaded.');const manifest=await manifestResponse.json();const files=[];let cursor=0,complete=0;
    status.textContent=`Collecting ${manifest.files.length} project files…`;
    await Promise.all(Array.from({length:4},async()=>{while(cursor<manifest.files.length){const relative=manifest.files[cursor++];if(relative.includes('..')||relative.startsWith('/'))throw new Error('Unsafe manifest path.');const response=await fetch(new URL('../'+relative,import.meta.url),{cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error(`${relative}: HTTP ${response.status}`);let data=new Uint8Array(await response.arrayBuffer());
      // Hosted preview may append its own analytics beacon. It is not part of MarkVault source.
      if(relative.endsWith('.html')){const text=new TextDecoder().decode(data);const doc=new DOMParser().parseFromString(text,'text/html');doc.querySelectorAll('script[src]').forEach(script=>{if(script.getAttribute('src').startsWith('https://static.cloudflareinsights.com/'))script.remove();});data=new TextEncoder().encode('<!doctype html>\n'+doc.documentElement.outerHTML+'\n');}
      files.push({name:'MarkVault/'+relative,data});complete++;progress.value=complete/manifest.files.length*100;log.textContent+=`Ready: ${relative}\n`;}}
    ));
    files.push({name:'MarkVault/.gitignore',data:new TextEncoder().encode('node_modules/\ndist/\n.DS_Store\n*.log\n')});
    files.sort((a,b)=>a.name.localeCompare(b.name));const zip=createZip(files),url=URL.createObjectURL(zip),anchor=document.createElement('a');anchor.href=url;anchor.download='MarkVault-source.zip';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),2000);status.textContent=`Ready: ${files.length} files, ${(zip.size/1024).toFixed(0)} KB. Extract the ZIP, then read USER-GUIDE-BN.md and IDE-AI-HANDOFF.md.`;
  }catch(error){controller.abort();status.textContent=`Download stopped: ${error.message}. No partial ZIP was created. Please retry.`;}finally{button.disabled=false;}
});
window.addEventListener('pagehide',()=>controller?.abort(),{once:true});

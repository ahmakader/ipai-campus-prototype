// Reuse the published model/texture bundle; verify and apply the new engine bytes.
(async()=>{const get=async path=>{const r=await fetch(path);if(!r.ok)throw Error('Download failed: '+path);return r};
const sha=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
try{
 const manifest=await (await get('runtime.json')).json();
 const parts=await Promise.all(manifest.parts.map(async p=>(await get(p)).arrayBuffer()));
 const original=new Uint8Array(await new Response(new Blob(parts).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
 const patch=await new Response((await get('runtime-v21.gz')).body.pipeThrough(new DecompressionStream('gzip'))).json();
 if(await sha(original)!==patch.baseSha256)throw Error('Runtime version mismatch. Please refresh');
 const bytes=new Uint8Array(patch.length);let at=0;
 for(const op of patch.ops){const segment=Array.isArray(op)?original.subarray(op[0],op[0]+op[1]):Uint8Array.from(atob(op),c=>c.charCodeAt(0));bytes.set(segment,at);at+=segment.length;}
 if(at!==patch.length||await sha(bytes)!==patch.sha256)throw Error('Runtime verification failed');
 const url=URL.createObjectURL(new Blob([bytes],{type:'text/javascript'})),script=document.createElement('script');script.src=url;script.onload=()=>URL.revokeObjectURL(url);script.onerror=()=>{document.getElementById('loading').textContent='Unable to start the 3D engine. Please reload.'};document.body.append(script);
}catch(e){document.getElementById('loading').textContent=e.message;console.error(e)}
})();
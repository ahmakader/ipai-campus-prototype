'use client';
import {useEffect,useRef} from 'react';
import {route,loopFor,parents} from './motion-graph';
export type PlaybackState={node:string;moving:boolean;loading:boolean;blocked:boolean;progress:number;error:boolean};
type Props={target:string;paused:boolean;travelRate?:number;onState:(s:PlaybackState)=>void};
export default function SequencePlayer({target,paused,travelRate=1,onState}:Props){
 const first=useRef<HTMLVideoElement>(null),second=useRef<HTMLVideoElement>(null),poster=useRef<HTMLImageElement>(null);
 const api=useRef<{request:(n:string)=>void;pause:(p:boolean)=>void}|null>(null);
 const callback=useRef(onState);callback.current=onState;const speed=useRef(travelRate);speed.current=travelRate;
 useEffect(()=>{
  const videos=[first.current!,second.current!];let front=0,node='luftbild',wanted='',disposed=false,isPaused=paused,job:AbortController|null=null;
  let status:PlaybackState={node,moving:false,loading:false,blocked:false,progress:0,error:false};
  const images=new Map<string,HTMLImageElement>();
  const warmImage=(name:string)=>{let im=images.get(name);if(!im){im=new Image();im.src=`./media/${name}.webp`;images.set(name,im)}return im};
  ['luftbild',...Object.keys(parents)].forEach(warmImage);
  const report=(patch:Partial<PlaybackState>)=>{status={...status,...patch};if(!disposed)callback.current(status)};
  const abortError=()=>new DOMException('Navigation replaced','AbortError');
  const check=(signal:AbortSignal)=>{if(signal.aborted||disposed)throw abortError()};
  function wait(v:HTMLVideoElement,event:string,signal:AbortSignal,ready:()=>boolean){
   return new Promise<void>((resolve,reject)=>{
    let timer:ReturnType<typeof setTimeout>;const finish=(error?:Error)=>{clearTimeout(timer);v.removeEventListener(event,ok);v.removeEventListener('error',bad);signal.removeEventListener('abort',abort);error?reject(error):resolve()};
    const ok=()=>finish(),bad=()=>finish(new Error('Video unavailable')),abort=()=>finish(abortError());
    v.addEventListener(event,ok);v.addEventListener('error',bad);signal.addEventListener('abort',abort,{once:true});if(event!=='ended')timer=setTimeout(()=>finish(new Error('Video timeout')),20000);
    if(signal.aborted)abort();else if(ready())ok();
   });
  }
  async function anchor(destination:string,signal:AbortSignal){
   const im=warmImage(destination);try{await im.decode()}catch{}check(signal);
   poster.current!.src=im.src;
   // A single opaque layer is displayed; never blend mismatched camera frames.
   videos.forEach(v=>{v.pause();v.style.opacity='0'});node=destination;
   report({node,moving:false,loading:false,progress:0,blocked:false});
  }
  async function swap(src:string,loop:boolean,signal:AbortSignal){
   const next=1-front,v=videos[next];check(signal);v.pause();v.loop=loop;
   if(v.getAttribute('src')!==src){v.src=src;v.load()}else v.currentTime=0;
   await wait(v,'loadeddata',signal,()=>v.readyState>=2);check(signal);
   v.playbackRate=loop?1:Math.min(8,Math.max(speed.current,(v.duration||4)/1.3));
   let blocked=false;if(!isPaused){try{await v.play()}catch{check(signal);blocked=true}}
   check(signal);videos[front].pause();videos[front].style.opacity='0';v.style.opacity='1';front=next;
   report({loading:false,blocked,error:false});return v;
  }
  async function navigate(destination:string,direct:boolean,signal:AbortSignal){
   try{
    if(direct||destination==='luftbild'){
     await anchor(destination,signal);
    }else{
     for(const leg of route(node,destination)){
      check(signal);report({moving:true,loading:false});const v=await swap(leg.src,false,signal);
      await wait(v,'ended',signal,()=>v.ended);check(signal);node=leg.to;report({node});
     }
    }
    check(signal);if(destination==='luftbild'){report({moving:false,loading:false,node});return}
    await swap(loopFor(destination),true,signal);check(signal);node=destination;report({node,moving:false,loading:false,progress:0});
   }catch(error){if(signal.aborted||disposed)return;report({loading:false,moving:false,error:!status.blocked})}
  }
  const prefetched=new Map<string,HTMLLinkElement>();
  const prefetch=(event:Event)=>{const destination=(event as CustomEvent<string>).detail;warmImage(destination);const src=loopFor(destination);if(destination==='luftbild'||prefetched.has(src))return;const link=document.createElement('link');link.rel='prefetch';link.as='fetch';link.href=src;document.head.appendChild(link);prefetched.set(src,link)};
  window.addEventListener('ipai:prepare-view',prefetch);
  api.current={request:destination=>{
   if(destination===wanted&&!status.error)return;
   const interrupted=status.moving||!!job&&!job.signal.aborted&&wanted!==node;
   job?.abort();videos.forEach(v=>v.pause());job=new AbortController();wanted=destination;
   const direct=interrupted||speed.current>1.8||route(node,destination).length>1;
   report({moving:destination!==node,loading:false,error:false,blocked:false,progress:0});
   void navigate(destination,direct,job.signal);
  },pause:value=>{isPaused=value;const v=videos[front];if(value)v.pause();else if(v.getAttribute('src')&&v.style.opacity==='1')v.play().then(()=>report({blocked:false})).catch(()=>report({blocked:true}));}};
  api.current.request(target);
  return()=>{disposed=true;job?.abort();api.current=null;window.removeEventListener('ipai:prepare-view',prefetch);prefetched.forEach(link=>link.remove());videos.forEach(v=>{v.pause();v.removeAttribute('src');v.load()})};
 },[]);
 useEffect(()=>{api.current?.request(target)},[target]);
 useEffect(()=>{api.current?.pause(paused)},[paused]);
 return <div className="sequence-player" aria-label="Animated campus navigation"><img ref={poster} className="sequence-poster" src="./media/luftbild.webp" alt="IPAI campus"/><video ref={first} className="sequence-video" muted playsInline preload="auto" disablePictureInPicture/><video ref={second} className="sequence-video" muted playsInline preload="auto" disablePictureInPicture/></div>;
}

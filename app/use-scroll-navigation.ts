'use client';
import {useEffect,useRef,type RefObject} from 'react';
export const scrollViews=['luftbild','kommunikationszentrum_tag_landscape','kommunikationszentrum_nacht_landscape','kommunikationszentrum_tag','kommunikationszentrum_nacht','piazza','aussenanlagen_promenade','aussenanlage','hochhaus','hochhaus_eingang','hochhaus_ost','hochhaus_sud','promenaden_1','promenaden_2','reallabor','reallabor_nord','restaurant_ost','restaurant_sud','start_up_center','mobility_hub','region','spaces-view'];
// Input is coalesced for one animation frame only. There is no playback queue.
export function useScrollNavigation(root:RefObject<HTMLElement|null>,_busy:boolean,disabled:boolean,onStep:(steps:number)=>boolean,onRate:(rate:number)=>void){
 const state=useRef({disabled,onStep,onRate});state.current={disabled,onStep,onRate};
 const cancel=useRef<()=>void>(()=>{});
 useEffect(()=>{
  const el=root.current;if(!el)return;let pixels=0,last=0,lastMove=-Infinity,direction=0,pending=0,frame=0,reset:ReturnType<typeof setTimeout>|undefined;
  const clear=()=>{pixels=0;pending=0;direction=0;last=0;lastMove=-Infinity;cancelAnimationFrame(frame);frame=0;clearTimeout(reset);state.current.onRate(1)};cancel.current=clear;
  const excluded=(target:Element)=>target.closest('aside,header,footer,.filmstrip-wrap,.camera-status,button,input,textarea,select,[role="dialog"],[role="listbox"]');
  const add=(delta:number)=>{
   if(!delta||state.current.disabled)return;
   const now=performance.now(),fresh=now-last>220||Math.sign(delta)!==direction,dt=fresh?100:Math.max(16,now-last);
   const reversed=direction!==0&&Math.sign(delta)!==direction;
   if(fresh){pixels=0;pending=0}direction=Math.sign(delta);last=now;
   if(!reversed&&now-lastMove<360){pixels=0;return}pixels+=delta;
   const velocity=Math.abs(delta)/dt,threshold=fresh?100:360;
   const steps=Math.abs(pixels)>=threshold?Math.sign(pixels)*(Math.abs(delta)>=900?2:1):0;if(steps){pending=steps;pixels=0;lastMove=now;}
   state.current.onRate(Math.min(2.2,1+velocity*.16));
   if(pending&&!frame)frame=requestAnimationFrame(()=>{frame=0;const step=Math.max(-2,Math.min(2,pending));pending=0;if(!state.current.disabled)state.current.onStep(step)});
   clearTimeout(reset);reset=setTimeout(()=>{pixels=0;state.current.onRate(1)},300);
  };
  const wheel=(e:WheelEvent)=>{if(state.current.disabled||e.ctrlKey||excluded(e.target as Element)||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;e.preventDefault();add(e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?window.innerHeight:1))};
  let touchY:number|null=null;
  const touchStart=(e:TouchEvent)=>{touchY=e.touches.length===1&&!excluded(e.target as Element)?e.touches[0].clientY:null};
  const touchMove=(e:TouchEvent)=>{if(touchY===null||state.current.disabled)return;const y=e.touches[0].clientY,delta=touchY-y;touchY=y;e.preventDefault();add(delta*1.2)};
  const touchEnd=()=>{touchY=null};
  el.addEventListener('wheel',wheel,{passive:false});el.addEventListener('touchstart',touchStart,{passive:true});el.addEventListener('touchmove',touchMove,{passive:false});el.addEventListener('touchend',touchEnd,{passive:true});
  return()=>{clear();el.removeEventListener('wheel',wheel);el.removeEventListener('touchstart',touchStart);el.removeEventListener('touchmove',touchMove);el.removeEventListener('touchend',touchEnd)};
 },[root]);
 return ()=>cancel.current();
}

"use client";
import {useEffect,useRef} from "react";
export function ChapterIndex(){
 const root=useRef<HTMLDetailsElement>(null);
 // The bookmark floats over the reading column, so it steps aside while the reader scrolls down.
 useEffect(()=>{
  const el=root.current;
  if(!el)return;
  let last=window.scrollY,timer=0,frame=0;
  const show=()=>el.removeAttribute("data-away");
  const onScroll=()=>{
   if(frame)return;
   frame=window.requestAnimationFrame(()=>{
    frame=0;
    const y=window.scrollY,delta=y-last;
    last=y;
    if(el.open||el.contains(document.activeElement)){show();return}
    if(delta>10&&y>240)el.setAttribute("data-away","");
    else if(delta<-6)show();
    window.clearTimeout(timer);
    timer=window.setTimeout(show,1100);
   });
  };
  window.addEventListener("scroll",onScroll,{passive:true});
  el.addEventListener("focusin",show);
  return()=>{
   window.removeEventListener("scroll",onScroll);
   el.removeEventListener("focusin",show);
   window.clearTimeout(timer);
   if(frame)window.cancelAnimationFrame(frame);
  };
 },[]);
 return <details ref={root} className="chapter-index">
  <summary>نشانک های دفتر</summary>
  <nav aria-label="بخش های دفتر">{[["birthday-greeting","آغاز نامه"],["memory-01","خاطره ها"],["original-letter","یادگاری دستساز"],["birthday-wishes","آرزوها"],["letter","نامه ام برای تو"],["closing","آلبوم کامل"]].map(([id,label])=><a key={id} href={`#${id}`} onClick={()=>{if(root.current)root.current.open=false}}>{label}</a>)}</nav>
 </details>
}

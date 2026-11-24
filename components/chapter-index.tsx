"use client";
import {useRef} from "react";
export function ChapterIndex(){
 const root=useRef<HTMLDetailsElement>(null);
 return <details ref={root} className="chapter-index">
  <summary>نشانک های دفتر</summary>
  <nav aria-label="بخش های دفتر">{[["birthday-greeting","آغاز نامه"],["memory-01","خاطره ها"],["original-letter","یادگاری دستساز"],["birthday-wishes","آرزوها"],["letter","نامه ام برای تو"],["closing","آلبوم کامل"]].map(([id,label])=><a key={id} href={`#${id}`} onClick={()=>{if(root.current)root.current.open=false}}>{label}</a>)}</nav>
 </details>
}

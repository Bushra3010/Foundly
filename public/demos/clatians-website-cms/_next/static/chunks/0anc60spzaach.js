(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,7887,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(97144);e.s(["default",0,function({content:e=s.defaultHomeContent.hero}){let i=e.slides?.length?e.slides:s.defaultHomeContent.hero.slides,n=e.examPills?.length?e.examPills:s.defaultHomeContent.hero.examPills,r=e.mobileExamPills?.length?e.mobileExamPills:s.defaultHomeContent.hero.mobileExamPills,o=e.stats?.length?e.stats:s.defaultHomeContent.hero.stats,l=e.toppers?.length?e.toppers:s.defaultHomeContent.hero.toppers,d=e.mobileToppers?.length?e.mobileToppers:s.defaultHomeContent.hero.mobileToppers,[c,p]=(0,a.useState)(0),[x,h]=(0,a.useState)(!1);(0,a.useEffect)(()=>{let e=setInterval(()=>{h(!0),setTimeout(()=>{p(e=>(e+1)%i.length),h(!1)},300)},5e3);return()=>clearInterval(e)},[]);let g=i[c],f=e=>{e!==c&&(h(!0),setTimeout(()=>{p(e),h(!1)},300))};return(0,t.jsxs)("section",{children:[(0,t.jsxs)("div",{className:"hidden md:block relative overflow-hidden",style:{background:"#0D1837",minHeight:"88vh"},children:[(0,t.jsxs)("div",{className:"absolute inset-0 overflow-hidden pointer-events-none",children:[(0,t.jsx)("div",{className:"absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10",style:{background:"#f77420"}}),(0,t.jsx)("div",{className:"absolute bottom-0 -left-20 w-72 h-72 rounded-full opacity-5",style:{background:"#f77420"}}),(0,t.jsx)("div",{className:"absolute top-1/2 right-1/4 w-32 h-32 rounded-full opacity-5",style:{background:"#ffffff"}}),(0,t.jsx)("div",{className:"absolute inset-0 opacity-[0.03]",style:{backgroundImage:"linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",backgroundSize:"60px 60px"}})]}),(0,t.jsxs)("div",{className:"w-full px-8 md:px-16 py-20 flex items-center gap-10 relative z-10",children:[(0,t.jsxs)("div",{className:"flex-1",children:[(0,t.jsxs)("div",{className:"inline-flex items-center gap-2 mb-6",children:[(0,t.jsx)("span",{className:"text-xs font-bold px-3 py-1.5 rounded-full text-white",style:{background:"rgba(247,116,32,0.2)",border:"1px solid rgba(247,116,32,0.4)"},children:g.pill}),(0,t.jsx)("span",{className:"text-white/60 text-sm",children:g.tag})]}),(0,t.jsxs)("h1",{className:`font-extrabold text-white leading-tight transition-all duration-300 ${x?"opacity-0 translate-x-4":"opacity-100 translate-x-0"}`,style:{fontSize:"2.75rem"},children:[g.heading,(0,t.jsx)("br",{}),(0,t.jsx)("span",{style:{color:"#f77420"},children:g.highlight})]}),(0,t.jsx)("p",{className:`mt-6 text-lg leading-relaxed max-w-md transition-all duration-300 ${x?"opacity-0":"opacity-100"}`,style:{color:"rgba(255,255,255,0.70)"},children:g.sub}),(0,t.jsxs)("div",{className:"mt-8 flex items-center gap-4 flex-wrap",children:[(0,t.jsxs)("a",{href:g.ctaLink,className:"px-7 py-3.5 rounded-xl font-bold text-white text-base shadow-lg hover:opacity-90 transition-all duration-200",style:{background:"#f77420"},children:[g.cta," →"]}),(0,t.jsx)("a",{href:g.secondaryCtaLink||"#demo",className:"px-6 py-3.5 rounded-xl font-semibold text-base hover:bg-white/10 transition-all",style:{color:"white",border:"1px solid rgba(255,255,255,0.35)"},children:g.secondaryCta})]}),(0,t.jsx)("div",{className:"mt-10 flex items-center gap-0 flex-wrap",children:o.map((e,a)=>(0,t.jsxs)("div",{className:"flex items-center",children:[(0,t.jsxs)("div",{className:"text-center px-5 first:pl-0",children:[(0,t.jsx)("div",{className:"text-2xl font-black text-white",children:e.val}),(0,t.jsx)("div",{className:"text-xs mt-0.5",style:{color:"rgba(255,255,255,0.5)"},children:e.label})]}),a<o.length-1&&(0,t.jsx)("div",{className:"w-px h-8 mx-1",style:{background:"rgba(255,255,255,0.2)"}})]},e.label))})]}),(0,t.jsxs)("div",{className:"w-[380px] flex-shrink-0 space-y-3",children:[(0,t.jsxs)("div",{className:"rounded-2xl p-5",style:{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.15)"},children:[(0,t.jsxs)("div",{className:"flex items-center justify-between mb-4",children:[(0,t.jsx)("h3",{className:"text-white font-bold text-sm",children:e.toppersTitle}),(0,t.jsx)("span",{className:"text-xs px-2 py-0.5 rounded-full font-semibold",style:{background:"rgba(247,116,32,0.2)",color:"#f77420",border:"1px solid rgba(247,116,32,0.3)"},children:e.toppersYear})]}),l.map(e=>(0,t.jsxs)("div",{className:"flex items-center gap-3 py-2.5 border-b last:border-0",style:{borderColor:"rgba(255,255,255,0.08)"},children:[(0,t.jsx)("div",{className:"w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0",style:{background:e.color},children:e.avatar}),(0,t.jsxs)("div",{className:"flex-1 min-w-0",children:[(0,t.jsx)("div",{className:"text-white text-xs font-bold truncate",children:e.name}),(0,t.jsx)("div",{className:"text-[10px]",style:{color:"rgba(255,255,255,0.5)"},children:e.college})]}),(0,t.jsx)("span",{className:"text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0",style:{background:"rgba(247,116,32,0.2)",color:"#f77420"},children:e.rank})]},e.name))]}),(0,t.jsxs)("div",{className:"rounded-2xl p-4",style:{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.15)"},children:[(0,t.jsx)("p",{className:"text-xs font-bold mb-3",style:{color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.08em"},children:e.prepareForLabel}),(0,t.jsx)("div",{className:"grid grid-cols-3 gap-1.5",children:n.map(e=>(0,t.jsx)("a",{href:`/exams/${e.toLowerCase().replace(" law","").replace("-law","")}`,className:"text-center py-2 rounded-lg text-[11px] font-bold transition-all",style:{background:e===i[c].pill?"#f77420":"rgba(255,255,255,0.08)",color:"white",border:`1px solid ${e===i[c].pill?"#f77420":"rgba(255,255,255,0.1)"}`},children:e},e))}),(0,t.jsxs)("a",{href:e.counsellingLink,className:"mt-3 block text-center py-2.5 rounded-xl font-bold text-white text-xs hover:opacity-90 transition-all",style:{background:"#f77420"},children:[e.counsellingLabel," →"]})]})]})]}),(0,t.jsx)("div",{className:"absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20",children:i.map((e,a)=>(0,t.jsx)("button",{onClick:()=>f(a),className:"rounded-full transition-all duration-300",style:{width:a===c?"28px":"8px",height:"8px",background:a===c?"#f77420":"rgba(255,255,255,0.3)"}},a))})]}),(0,t.jsxs)("div",{className:"md:hidden",style:{background:"#0D1837"},children:[(0,t.jsx)("div",{className:"absolute top-14 right-0 w-56 h-56 rounded-full pointer-events-none",style:{background:"radial-gradient(circle,rgba(247,116,32,0.18) 0%,transparent 70%)",transform:"translate(20%,-10%)"}}),(0,t.jsxs)("div",{className:"relative z-10 px-4 pt-5 pb-5",children:[(0,t.jsx)("div",{className:"grid grid-cols-6 gap-1 mb-5",children:r.map(e=>(0,t.jsx)("a",{href:`/exams/${e.toLowerCase().replace("-cet","-cet-law")}`,className:"text-center py-2 rounded-lg transition-all",style:{fontSize:"9px",fontWeight:700,background:e===g.pill||"MH-CET"===e&&"MH-CET"===g.pill?"#f77420":"rgba(255,255,255,0.1)",color:"white",border:`1.5px solid ${e===g.pill||"MH-CET"===e&&"MH-CET"===g.pill?"rgba(247,116,32,0.6)":"rgba(255,255,255,0.08)"}`},children:e},e))}),(0,t.jsxs)("div",{className:`rounded-3xl p-5 mb-4 transition-all duration-300 ${x?"opacity-0 translate-y-3":"opacity-100 translate-y-0"}`,style:{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",backdropFilter:"blur(10px)"},children:[(0,t.jsx)("div",{className:"flex items-center gap-2 mb-3",children:(0,t.jsx)("span",{className:"text-[10px] font-bold px-2.5 py-1 rounded-full",style:{background:"rgba(247,116,32,0.2)",color:"#f77420",border:"1px solid rgba(247,116,32,0.35)"},children:g.tag})}),(0,t.jsxs)("h1",{className:"font-black text-white leading-tight mb-2",style:{fontSize:"1.7rem",lineHeight:"1.2"},children:[g.heading,(0,t.jsx)("br",{}),(0,t.jsx)("span",{style:{color:"#f77420"},children:g.highlight})]}),(0,t.jsx)("p",{className:"text-sm leading-relaxed mb-4",style:{color:"rgba(255,255,255,0.55)"},children:g.sub}),(0,t.jsxs)("div",{className:"flex gap-2.5",children:[(0,t.jsxs)("a",{href:g.ctaLink,className:"flex-1 text-center py-3.5 rounded-2xl font-black text-white text-sm shadow-lg",style:{background:"linear-gradient(135deg,#f77420,#d95f18)",boxShadow:"0 8px 20px rgba(247,116,32,0.4)"},children:[g.cta," →"]}),(0,t.jsxs)("a",{href:e.counsellingLink,className:"px-4 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-1.5",style:{background:"rgba(249,115,22,0.15)",color:"#f97316",border:"1.5px solid rgba(249,115,22,0.3)"},children:[(0,t.jsx)("svg",{className:"w-3.5 h-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,t.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2.5,d:"M12 6v6m0 0v6m0-6h6m-6 0H6"})}),e.counsellingLabel.replace("Get Free ","").replace("Free ","")]})]})]}),(0,t.jsx)("div",{className:"grid grid-cols-4 rounded-2xl overflow-hidden mb-4",style:{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"},children:o.map((e,a)=>(0,t.jsxs)("div",{className:"flex items-stretch",children:[(0,t.jsxs)("div",{className:"flex-1 flex flex-col items-center justify-center py-3.5",children:[(0,t.jsx)("div",{className:"text-sm font-black text-white leading-tight",children:e.val}),(0,t.jsx)("div",{className:"text-[9px] mt-0.5 text-center leading-tight font-medium",style:{color:"rgba(255,255,255,0.4)"},children:e.label})]}),a<o.length-1&&(0,t.jsx)("div",{className:"w-px my-3",style:{background:"rgba(255,255,255,0.1)"}})]},e.label))}),(0,t.jsxs)("div",{className:"rounded-2xl overflow-hidden",style:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"},children:[(0,t.jsxs)("div",{className:"flex items-center justify-between px-4 py-3 border-b",style:{borderColor:"rgba(255,255,255,0.06)"},children:[(0,t.jsx)("span",{className:"text-xs font-bold text-white",children:e.toppersTitle}),(0,t.jsx)("span",{className:"text-[10px] font-bold px-2 py-0.5 rounded-full",style:{background:"rgba(247,116,32,0.15)",color:"#f77420"},children:e.toppersYear})]}),(0,t.jsx)("div",{className:"flex overflow-x-auto gap-3 px-4 py-3",style:{scrollbarWidth:"none"},children:d.map(e=>(0,t.jsxs)("div",{className:"flex-shrink-0 flex flex-col items-center gap-1.5",style:{width:"68px"},children:[(0,t.jsx)("div",{className:"w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black",style:{background:e.color},children:e.avatar}),(0,t.jsx)("div",{className:"text-[10px] font-bold text-white text-center leading-tight",children:e.name}),(0,t.jsx)("div",{className:"text-[9px] font-black px-2 py-0.5 rounded-full",style:{background:"rgba(247,116,32,0.2)",color:"#f77420"},children:e.rank})]},e.name))})]}),(0,t.jsx)("div",{className:"flex justify-center gap-1.5 mt-4",children:i.map((e,a)=>(0,t.jsx)("button",{onClick:()=>f(a),className:"rounded-full transition-all duration-300",style:{width:a===c?"20px":"6px",height:"6px",background:a===c?"#f77420":"rgba(255,255,255,0.2)",border:"none"}},a))})]})]})]})}])},67642,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(97144);function i({target:e,suffix:s,active:n,isDecimal:r}){let[o,l]=(0,a.useState)(0);return(0,a.useEffect)(()=>{if(!n)return;let t=performance.now(),a=s=>{let i=Math.min((s-t)/1600,1),n=(1-Math.pow(1-i,3))*e;l(r?parseFloat(n.toFixed(1)):Math.floor(n)),i<1?requestAnimationFrame(a):l(e)};requestAnimationFrame(a)},[n,e,r]),(0,t.jsxs)(t.Fragment,{children:[r?o.toFixed(1):o.toLocaleString(),s]})}e.s(["default",0,function({stats:e=s.defaultHomeContent.stats}){let n=e.length?e:s.defaultHomeContent.stats,{ref:r,visible:o}=function(e=.1){let t=(0,a.useRef)(null),[s,i]=(0,a.useState)(!1);return(0,a.useEffect)(()=>{let a=t.current;if(!a)return;let s=new IntersectionObserver(([e])=>{e.isIntersecting&&(i(!0),s.disconnect())},{threshold:e});return s.observe(a),()=>s.disconnect()},[e]),{ref:t,visible:s}}(.15);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("style",{children:`
        @keyframes popIn{0%{transform:scale(.85);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
        @keyframes countGlow{0%,100%{text-shadow:none}50%{text-shadow:0 0 20px currentColor}}
      `}),(0,t.jsx)("section",{style:{background:"#FCF8E7",padding:"28px 0 32px"},children:(0,t.jsxs)("div",{ref:r,className:"max-w-7xl mx-auto px-4 md:px-10",children:[(0,t.jsx)("div",{className:"hidden md:grid",style:{gridTemplateColumns:"repeat(4,1fr)",gap:"14px"},children:n.map((e,a)=>(0,t.jsxs)("div",{style:{background:e.bg,border:`1.5px solid ${e.border}`,borderRadius:"20px",padding:"24px 22px",opacity:+!!o,animation:o?`popIn .5s ease ${.1*a}s both`:"none",boxShadow:`0 4px 20px ${e.color}18`,position:"relative",overflow:"hidden"},children:[(0,t.jsx)("div",{style:{position:"absolute",right:"-8px",bottom:"-8px",fontSize:"64px",opacity:.12,lineHeight:1,userSelect:"none",pointerEvents:"none"},children:e.icon}),(0,t.jsx)("div",{style:{width:"40px",height:"40px",borderRadius:"12px",background:"rgba(255,255,255,0.7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",marginBottom:"14px",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"},children:e.icon}),(0,t.jsx)("div",{style:{fontSize:"38px",fontWeight:900,lineHeight:1,color:e.color,marginBottom:"6px",fontVariantNumeric:"tabular-nums"},children:(0,t.jsx)(i,{target:e.num,suffix:e.suffix,active:o,isDecimal:e.isDecimal})}),(0,t.jsx)("div",{style:{color:"#374151",fontWeight:700,fontSize:"13px",textTransform:"uppercase",letterSpacing:"0.05em"},children:e.label})]},e.label))}),(0,t.jsx)("div",{className:"md:hidden grid grid-cols-2 gap-3 px-1",children:n.map((e,a)=>(0,t.jsxs)("div",{style:{background:e.bg,border:`1.5px solid ${e.border}`,borderRadius:"20px",padding:"18px 16px",opacity:+!!o,animation:o?`popIn .45s ease ${.08*a}s both`:"none",position:"relative",overflow:"hidden",boxShadow:`0 4px 16px ${e.color}14`},children:[(0,t.jsx)("div",{style:{position:"absolute",right:"-6px",bottom:"-6px",fontSize:"52px",opacity:.1,lineHeight:1,pointerEvents:"none"},children:e.icon}),(0,t.jsx)("div",{style:{width:"36px",height:"36px",borderRadius:"10px",background:"rgba(255,255,255,0.8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",marginBottom:"12px",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"},children:e.icon}),(0,t.jsx)("div",{style:{fontSize:"26px",fontWeight:900,lineHeight:1,color:e.color,marginBottom:"5px",fontVariantNumeric:"tabular-nums"},children:(0,t.jsx)(i,{target:e.num,suffix:e.suffix,active:o,isDecimal:e.isDecimal})}),(0,t.jsx)("div",{style:{color:"#374151",fontWeight:700,fontSize:"11px",textTransform:"uppercase",letterSpacing:"0.04em"},children:e.label})]},e.label))})]})})]})}])},45382,e=>{"use strict";var t=e.i(43476),a=e.i(71645);function s({pct:e,color:i}){let[n,r]=(0,a.useState)(0),o=(0,a.useRef)(null);return(0,a.useEffect)(()=>{let t=o.current;if(!t)return;let a=new IntersectionObserver(([t])=>{t.isIntersecting&&(setTimeout(()=>r(e),200),a.disconnect())},{threshold:.5});return a.observe(t),()=>a.disconnect()},[e]),(0,t.jsx)("div",{ref:o,style:{background:"#F3F4F6",borderRadius:"99px",height:"5px",overflow:"hidden"},children:(0,t.jsx)("div",{style:{height:"100%",width:`${n}%`,background:i,borderRadius:"99px",transition:"width 1s ease"}})})}function i(e){let t=e.importantDates?.find(e=>/exam date|exam/i.test(e.event));return t?.date||e.importantDates?.[0]?.date||e.duration}function n(e){return e.questions>=150?85:e.questions>=120?78:e.questions>=100?72:65}e.s(["default",0,function({exams:e}){let[r,o]=(0,a.useState)(null),{ref:l,visible:d}=function(e=.1){let t=(0,a.useRef)(null),[s,i]=(0,a.useState)(!1);return(0,a.useEffect)(()=>{let a=t.current;if(!a)return;let s=new IntersectionObserver(([e])=>{e.isIntersecting&&(i(!0),s.disconnect())},{threshold:e});return s.observe(a),()=>s.disconnect()},[e]),{ref:t,visible:s}}(.1),c=e.slice(0,6);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("style",{children:`
        @keyframes floatIcon{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .exam-icon-float{animation:floatIcon 3s ease-in-out infinite}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `}),(0,t.jsxs)("section",{id:"exams",className:"hidden md:block",style:{background:"#0D1837",padding:"72px 0",position:"relative",overflow:"hidden"},children:[(0,t.jsx)("div",{style:{position:"absolute",top:"-60px",right:"-60px",width:"320px",height:"320px",borderRadius:"50%",background:"#f77420",opacity:.05,filter:"blur(60px)",pointerEvents:"none"}}),(0,t.jsx)("div",{style:{position:"absolute",bottom:"-40px",left:"-40px",width:"240px",height:"240px",borderRadius:"50%",background:"#3b82f6",opacity:.06,filter:"blur(50px)",pointerEvents:"none"}}),(0,t.jsx)("div",{style:{position:"absolute",inset:0,pointerEvents:"none",opacity:.04,backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",backgroundSize:"48px 48px"}}),(0,t.jsxs)("div",{className:"max-w-7xl mx-auto px-4 md:px-10 relative z-10",children:[(0,t.jsxs)("div",{ref:l,style:{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:"40px",opacity:+!!d,transform:d?"none":"translateY(20px)",transition:"opacity .6s ease, transform .6s ease"},children:[(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{style:{display:"inline-flex",alignItems:"center",gap:"8px",marginBottom:"10px",padding:"5px 14px",borderRadius:"99px",background:"rgba(247,116,32,0.12)",border:"1px solid rgba(247,116,32,0.25)"},children:[(0,t.jsx)("span",{style:{width:"7px",height:"7px",borderRadius:"50%",background:"#f77420"}}),(0,t.jsx)("span",{style:{color:"#f77420",fontSize:"11px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"},children:"Law Entrance Exams"})]}),(0,t.jsxs)("h2",{style:{color:"white",fontWeight:900,fontSize:"clamp(24px, 3vw, 38px)",lineHeight:1.2,marginBottom:"6px"},children:["Expert Coaching for",(0,t.jsx)("br",{}),(0,t.jsx)("span",{style:{background:"linear-gradient(90deg,#f77420,#ffad75)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},children:"Every Major Law Exam"})]}),(0,t.jsx)("p",{style:{color:"rgba(255,255,255,0.5)",fontSize:"14px"},children:"Pick your exam — we have a specialist batch ready for you."})]}),(0,t.jsx)("a",{href:"/exams/clat",style:{color:"#f77420",fontWeight:700,fontSize:"13px",textDecoration:"none",border:"1px solid rgba(247,116,32,0.3)",padding:"8px 18px",borderRadius:"10px",flexShrink:0,marginBottom:"4px",transition:"all .2s"},children:"See All Exams →"})]}),(0,t.jsx)("div",{style:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"16px"},children:c.map((e,a)=>{let l=r===e.code,c=e.color||"#f77420",p="#ffad75",x=i(e),h=n(e);return(0,t.jsxs)("a",{href:`/exams/${e.slug}`,onMouseEnter:()=>o(e.code),onMouseLeave:()=>o(null),style:{display:"block",textDecoration:"none",background:l?`linear-gradient(135deg, ${c}ee, ${c}aa)`:"rgba(255,255,255,0.05)",border:`1.5px solid ${l?p+"66":"rgba(255,255,255,0.08)"}`,borderRadius:"18px",padding:"20px",transition:"all .25s ease",boxShadow:l?`0 8px 32px ${c}55`:"none",transform:l?"translateY(-4px)":"none",opacity:+!!d,animationDelay:`${.08*a}s`,backdropFilter:"blur(8px)"},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"14px"},children:[(0,t.jsx)("div",{style:{width:"52px",height:"52px",borderRadius:"14px",background:l?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"26px",...l?{animation:"floatIcon 2s ease-in-out infinite"}:{}},children:e.icon}),(0,t.jsxs)("div",{style:{textAlign:"right"},children:[(0,t.jsx)("div",{style:{background:l?p:"rgba(255,255,255,0.1)",color:l?"white":"rgba(255,255,255,0.7)",fontSize:"11px",fontWeight:800,padding:"4px 10px",borderRadius:"99px",display:"inline-block",transition:"all .2s"},children:e.code}),(0,t.jsxs)("div",{style:{color:"rgba(255,255,255,0.4)",fontSize:"10px",marginTop:"4px"},children:["📅 ",x]})]})]}),(0,t.jsx)("div",{style:{color:"white",fontWeight:800,fontSize:"15px",lineHeight:1.3,marginBottom:"4px"},children:e.fullName||e.name}),(0,t.jsx)("div",{style:{color:p,fontWeight:600,fontSize:"12px",marginBottom:"14px"},children:e.tagline}),(0,t.jsx)("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"14px"},children:[{label:"Seats",val:e.seats,icon:"🪑"},{label:"Colleges",val:e.colleges,icon:"🏛️"},{label:"Questions",val:String(e.questions),icon:"❓"},{label:"Duration",val:e.duration,icon:"⏱️"}].map(e=>(0,t.jsxs)("div",{style:{background:"rgba(255,255,255,0.06)",borderRadius:"10px",padding:"8px 10px"},children:[(0,t.jsxs)("div",{style:{color:"rgba(255,255,255,0.4)",fontSize:"9px",fontWeight:600,textTransform:"uppercase",marginBottom:"2px"},children:[e.icon," ",e.label]}),(0,t.jsx)("div",{style:{color:"white",fontWeight:800,fontSize:"12px"},children:e.val})]},e.label))}),(0,t.jsxs)("div",{style:{marginBottom:"14px"},children:[(0,t.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"4px"},children:[(0,t.jsx)("span",{style:{color:"rgba(255,255,255,0.4)",fontSize:"10px",fontWeight:600},children:"Competition Level"}),(0,t.jsxs)("span",{style:{color:p,fontSize:"10px",fontWeight:700},children:[h,"%"]})]}),(0,t.jsx)(s,{pct:h,color:p})]}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[(0,t.jsx)("span",{style:{color:p,fontWeight:700,fontSize:"13px"},children:"Prepare Now"}),(0,t.jsx)("div",{style:{width:"28px",height:"28px",borderRadius:"50%",background:l?p:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:"13px",fontWeight:700,transition:"all .2s",transform:l?"translateX(3px)":"none"},children:"→"})]})]},e.code)})})]})]}),(0,t.jsxs)("section",{className:"md:hidden",style:{background:"#0D1837",padding:"24px 0 28px"},children:[(0,t.jsxs)("div",{style:{padding:"0 16px",marginBottom:"18px"},children:[(0,t.jsx)("span",{style:{background:"rgba(247,116,32,0.15)",color:"#f77420",fontSize:"10px",fontWeight:700,padding:"5px 12px",borderRadius:"99px",display:"inline-block",marginBottom:"10px",border:"1px solid rgba(247,116,32,0.25)"},children:"LAW ENTRANCE EXAMS"}),(0,t.jsx)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:(0,t.jsx)("h2",{style:{color:"white",fontWeight:900,fontSize:"20px",lineHeight:1.25,margin:0},children:"Choose Your Exam"})})]}),(0,t.jsx)("div",{style:{display:"flex",gap:"12px",overflowX:"auto",padding:"4px 16px 8px",scrollbarWidth:"none"},children:c.map(e=>{let a=e.color||"#f77420",s="#ffad75",r=n(e);return(0,t.jsxs)("a",{href:`/exams/${e.slug}`,style:{flexShrink:0,width:"160px",textDecoration:"none",background:`linear-gradient(160deg,${a}ee,${a}bb)`,borderRadius:"20px",padding:"16px 14px",border:`1.5px solid ${s}33`,boxShadow:`0 8px 24px ${a}55`,display:"flex",flexDirection:"column",gap:"10px"},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[(0,t.jsx)("div",{style:{width:"44px",height:"44px",borderRadius:"14px",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px"},children:e.icon}),(0,t.jsx)("span",{style:{fontSize:"11px",fontWeight:800,color:s,background:`${s}22`,padding:"3px 8px",borderRadius:"99px",border:`1px solid ${s}44`},children:e.code})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("div",{style:{color:"white",fontWeight:800,fontSize:"13px",lineHeight:1.25,marginBottom:"3px"},children:e.name}),(0,t.jsx)("div",{style:{color:s,fontWeight:600,fontSize:"11px"},children:e.tagline})]}),(0,t.jsxs)("div",{style:{display:"flex",gap:"6px"},children:[(0,t.jsxs)("div",{style:{flex:1,background:"rgba(255,255,255,0.1)",borderRadius:"10px",padding:"6px 8px",textAlign:"center"},children:[(0,t.jsx)("div",{style:{color:"white",fontWeight:800,fontSize:"12px"},children:e.seats}),(0,t.jsx)("div",{style:{color:"rgba(255,255,255,0.5)",fontSize:"9px",fontWeight:600},children:"SEATS"})]}),(0,t.jsxs)("div",{style:{flex:1,background:"rgba(255,255,255,0.1)",borderRadius:"10px",padding:"6px 8px",textAlign:"center"},children:[(0,t.jsx)("div",{style:{color:"white",fontWeight:800,fontSize:"12px"},children:e.questions}),(0,t.jsx)("div",{style:{color:"rgba(255,255,255,0.5)",fontSize:"9px",fontWeight:600},children:"QUESTIONS"})]})]}),(0,t.jsx)("div",{children:(0,t.jsx)("div",{style:{background:"rgba(255,255,255,0.15)",borderRadius:"99px",height:"4px",overflow:"hidden"},children:(0,t.jsx)("div",{style:{height:"100%",width:`${r}%`,background:s,borderRadius:"99px"}})})}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[(0,t.jsx)("span",{style:{color:s,fontWeight:700,fontSize:"12px"},children:"Prepare →"}),(0,t.jsxs)("span",{style:{color:"rgba(255,255,255,0.45)",fontSize:"10px"},children:["📅 ",i(e)]})]})]},e.code)})})]})]})}])},38089,e=>{"use strict";var t=e.i(43476),a=e.i(37902),s=e.i(71645);let i=[{slug:"clat-2026-complete-guide",title:"CLAT 2026: Complete Preparation Guide for Beginners",excerpt:"Everything you need to know to start your CLAT 2026 journey — from exam pattern to study schedule.",content:`CLAT 2026 is one of the most anticipated law entrance exams in India. Whether you are just starting your preparation or looking to fine-tune your strategy, this comprehensive guide will walk you through everything you need to know.

## Understanding the CLAT Exam Pattern

CLAT 2026 is a 2-hour Computer Based Test with 150 questions worth 150 marks. The five sections are:
- English Language (28 questions)
- Current Affairs & GK (35 questions)
- Legal Reasoning (35 questions)
- Logical Reasoning (28 questions)
- Quantitative Techniques (13 questions)

Each correct answer gives 1 mark. An incorrect answer results in a 0.25 mark deduction.

## Creating Your Study Plan

A well-structured study plan is the foundation of CLAT success. Here is a recommended 12-month plan:

**Months 1-3: Foundation Building**
Focus on understanding concepts in all five sections. Do not rush into mock tests. Build your reading habit and start daily newspaper reading.

**Months 4-6: Concept Mastery**
Deep dive into Legal Reasoning — understand legal principles, landmark cases, and their applications. Strengthen English comprehension speed.

**Months 7-9: Practice Intensive**
Start taking sectional tests. Analyze performance and identify weak areas. Begin full-length mock tests towards the end of this phase.

**Months 10-12: Test Series and Revision**
Take 2-3 full mock tests per week. Focus on revision rather than learning new topics. Work on time management and accuracy.

## Most Important Topics

### Legal Reasoning (Highest Priority)
Legal Reasoning is the most important section. Focus on:
- Principles of law and their applications
- Constitutional provisions and Fundamental Rights
- Law of Torts, Contracts, and Criminal Law
- Reading and applying legal passages

### Current Affairs & GK (Daily Practice)
Read The Hindu or Indian Express every day. Focus on:
- Legal news and Supreme Court judgements
- National and international affairs
- Historical events and their legal implications

### English Language (Speed + Accuracy)
Practice reading 500+ word passages quickly and accurately. Focus on:
- Inference-based questions
- Vocabulary in context
- Author's tone and purpose

## Top Tips from CLATians Toppers

1. **Start early**: Begin preparation at least 12 months before the exam
2. **Mock tests are non-negotiable**: Take at least 50 full-length mock tests
3. **Current affairs daily**: Never miss a day of newspaper reading
4. **Legal Reasoning focus**: Dedicate 40% of your time to Legal Reasoning
5. **Analyze every mock**: Spend as much time analyzing as taking the test

## Recommended Resources

- CLATians Study Material (all 5 sections)
- CLATians Mock Test Series (150+ tests)
- The Hindu / Indian Express (daily)
- CLATians Monthly GK Magazine
- Previous Year CLAT Papers (2010-2025)

Start your CLAT 2026 journey today with CLATians and join 5000+ successful students who have cracked their dream NLU.`,category:"Law Preparation",categoryColor:"#f77420",author:"Adv. Ravi Kumar",authorAvatar:"RK",date:"May 10, 2026",readTime:"8 min read",tags:["CLAT 2026","Preparation","Study Plan","Beginner Guide"]},{slug:"top-nlu-cutoffs-2025",title:"CLAT 2025 Cutoff Ranks for All 23 NLUs: Category-Wise Analysis",excerpt:"Complete analysis of CLAT 2025 closing ranks for all 23 NLUs — General, SC, ST, OBC, and PWD categories.",content:`The CLAT 2025 results have been declared and the cutoffs have been finalized. Here is a comprehensive analysis of the closing ranks for all 23 National Law Universities.

## Top 5 NLUs and Their CLAT 2025 Cutoffs

### 1. NLSIU Bangalore (Rank 1)
The top-ranked NLU in India had the most competitive cutoffs:
- General: ~50
- OBC: ~120
- SC: ~250
- ST: ~300

### 2. NLU Delhi (AILET)
NLU Delhi takes admissions through AILET, not CLAT. AILET cutoffs:
- General: ~45
- OBC: ~100

### 3. NALSAR Hyderabad (Rank 2)
- General: ~200
- OBC: ~400
- SC: ~800
- ST: ~600

### 4. WBNUJS Kolkata (Rank 3)
- General: ~350
- OBC: ~600
- SC: ~1000
- ST: ~800

### 5. NLU Jodhpur (Rank 4)
- General: ~500
- OBC: ~900
- SC: ~1500
- ST: ~1200

## How to Use This Data

These cutoffs are based on previous year data and should be used as a reference point. Your actual chance of admission depends on:
1. Your CLAT rank
2. Your category
3. Your state of domicile (for state NLUs)
4. Number of applicants that year

Use CLATians' AI College Predictor for a personalized prediction based on your expected rank.

## Preparation Strategy Based on Target NLU

If you are targeting **Top 5 NLUs**: Aim for rank under 500 (General)
If you are targeting **Tier 2 NLUs**: Aim for rank 500-1500 (General)
If you are targeting **All NLUs**: A rank under 5000 ensures some NLU admission

## Contact CLATians for Counselling

Our counselling team can help you:
- Select the right NLU based on your preferences
- Understand category-specific advantages
- Plan your preparation to hit target ranks

Call us at 8507700177 for free counselling.`,category:"Law Preparation",categoryColor:"#f77420",author:"CLATians Team",authorAvatar:"CT",date:"May 5, 2026",readTime:"6 min read",tags:["NLU Cutoffs","CLAT 2025","Admission","College Selection"]},{slug:"ailet-vs-clat-differences",title:"AILET vs CLAT: Key Differences Every Law Aspirant Must Know",excerpt:"Should you prepare separately for AILET or will CLAT preparation be enough? A complete comparison.",content:`AILET and CLAT are two of the most important law entrance exams in India. While they test similar subjects, there are crucial differences that every aspirant must understand.

## Overview Comparison

| Feature | CLAT | AILET |
|---------|------|-------|
| Conducting Body | Consortium of NLUs | NLU Delhi |
| Participating Institutions | 23 NLUs | NLU Delhi only |
| Seats | 2700+ | 110 |
| Duration | 2 hours | 90 minutes |
| Questions | 150 | 100 |
| Mode | Online (CBT) | Offline (Pen-Paper) |
| Negative Marking | 0.25 marks | 0.25 marks |

## Key Differences in Exam Pattern

### Section Weightage
CLAT gives more weight to Current Affairs (35 questions) while AILET has more Legal Aptitude questions.

AILET has a Mathematics section with 10 questions — CLAT has Quantitative Techniques with 13 questions.

### Difficulty Level
AILET is generally considered more difficult in terms of legal aptitude questions. The questions test deeper legal knowledge rather than just principle application.

### Time Pressure
AILET gives you 90 seconds per question on average (90 min / 100 questions), while CLAT gives 48 seconds per question (120 min / 150 questions). AILET allows more thinking time per question.

## Should You Prepare Separately for AILET?

**If you are targeting NLU Delhi specifically**: Yes, prepare separately. AILET demands deeper legal knowledge.

**If you are preparing for CLAT first**: Your CLAT preparation covers 70% of AILET syllabus. You need additional AILET-specific preparation.

**CLATians AILET Strategy**: Our AILET-specialized batch runs alongside the CLAT batch with additional sessions on AILET-specific legal aptitude topics.

## Preparation Tips for Both

1. **Common preparation (70%)**: English, GK, Logical Reasoning, basic Legal concepts
2. **CLAT-specific (15%)**: CLAT pattern practice, Computer-based test practice
3. **AILET-specific (15%)**: Deep legal aptitude, offline test-taking practice, NLU Delhi specific GK

Appear in both exams for maximum chances. Most serious law aspirants do!`,category:"Law Preparation",categoryColor:"#f77420",author:"Adv. Priya Singh",authorAvatar:"PS",date:"April 28, 2026",readTime:"7 min read",tags:["AILET","CLAT","Comparison","NLU Delhi","Exam Strategy"]},{slug:"current-affairs-strategy-clat",title:"Current Affairs Strategy for CLAT 2026: What to Read and What to Skip",excerpt:"Dr. Neha Verma shares the exact current affairs strategy that has helped 3000+ students ace this section.",content:`Current Affairs and GK is the section that separates top rankers from average performers in CLAT. With 35 questions carrying 35 marks, it is the single largest section in CLAT 2026. Here is the complete strategy from CLATians' GK specialist, Dr. Neha Verma.

## What CLAT Really Tests in Current Affairs

CLAT does NOT test rote memorization of facts. It tests your ability to:
- Read a passage about a recent event
- Answer questions based on that passage
- Apply your background knowledge to interpret correctly

This means: You need to know events well enough to understand questions about them, not memorize every detail.

## The 80/20 Rule for Current Affairs

Focus 80% of your time on these high-priority areas:
1. **Supreme Court judgements** — Most likely to appear
2. **Constitutional amendments** — Regular feature
3. **International legal developments** — 3-5 questions
4. **Major national policies** — Budget, schemes, laws passed
5. **Appointments** — Chief Justice, CEC, CAG, Governors

Spend only 20% of time on:
- Sports (only major championships)
- Entertainment (Oscar, Booker winners)
- Science discoveries (major ones only)

## Daily Reading Plan (30 Minutes)

**Morning (20 minutes)**:
- Read front page of The Hindu or Indian Express
- Focus on national and legal news
- Note 3-5 important facts per article

**Evening (10 minutes)**:
- Review CLATians Daily News Digest
- Revise notes from morning reading

## Weekly and Monthly Practice

- **Weekly**: Attempt CLATians Current Affairs Quiz (20 questions)
- **Monthly**: Read CLATians Monthly GK Magazine cover to cover
- **Every 3 months**: Full revision of all notes

## What to Skip (Important!)

Strictly avoid spending time on:
- Celebrity gossip
- Movie releases (unless major award-winning)
- Sports scores (unless major tournaments)
- Regional state news (unless it becomes national issue)
- Detailed state election results (just know winner)

## Resources

1. CLATians Daily News Digest (free on website)
2. CLATians Monthly GK Magazine
3. The Hindu epaper (recommended)
4. CLATians Current Affairs Tests on portal

Remember: 35 marks in current affairs can change your rank by hundreds. Never neglect this section!`,category:"Current Affairs",categoryColor:"#f97316",author:"Dr. Neha Verma",authorAvatar:"NV",date:"April 20, 2026",readTime:"9 min read",tags:["Current Affairs","CLAT Strategy","GK","Preparation Tips"]},{slug:"legal-reasoning-tips-clat",title:"How to Score 30+ in Legal Reasoning: The CLATians Method",excerpt:"Master the most important CLAT section with Adv. Ravi Kumar's proven methodology.",content:`Legal Reasoning is the heart of CLAT. With 35 questions and the highest weightage, your performance here largely determines your rank. Here is the CLATians Method that has helped thousands score 30+ in this section.

## Understanding CLAT Legal Reasoning

CLAT Legal Reasoning is NOT a test of law knowledge. It is a test of your ability to:
1. Read a legal principle stated in the question
2. Apply it to a given factual scenario
3. Arrive at the correct legal conclusion

You do NOT need to memorize Indian law to score in Legal Reasoning. The principle is always given to you.

## The 4-Step CLATians Method

### Step 1: Read the Principle Carefully
Read the legal principle stated in the question slowly and completely. Underline key conditions and exceptions.

### Step 2: Identify the Key Elements
What must be proven for the principle to apply? List the essential elements.

### Step 3: Apply to the Facts
Read the factual scenario and check: Do the facts satisfy all elements of the principle?

### Step 4: Eliminate Wrong Answers
Use the principle strictly as stated — do not bring in outside legal knowledge or personal opinions.

## Common Mistake: Importing Outside Knowledge

The biggest mistake students make is using their own legal knowledge instead of the stated principle.

**Example**: If the question says "Principle: X is true in all cases", and you know from real law that X has exceptions — ignore that! Apply the principle as stated.

## Practice Strategy

**Weeks 1-4**: Understand the method, practice 10 questions daily
**Weeks 5-8**: Increase to 20 questions daily, focus on accuracy
**Weeks 9-12**: Full section practice in 30 minutes, aim for 30+ correct

## Common Question Types

1. **Direct application**: Apply stated principle to given facts
2. **Exception-based**: Principle has exceptions, determine if exception applies
3. **Multiple principles**: Two principles given, determine which applies
4. **Policy-based**: What decision would a court likely make

Target: 30+ correct out of 35 in Legal Reasoning to secure a top rank.

Join CLATians Legal Reasoning sessions with Adv. Ravi Kumar for detailed practice and guidance.`,category:"Legal",categoryColor:"#6366f1",author:"Adv. Ravi Kumar",authorAvatar:"RK",date:"April 15, 2026",readTime:"10 min read",tags:["Legal Reasoning","CLAT Preparation","Scoring Tips","Study Strategy"]},{slug:"life-at-nlu-what-to-expect",title:"Life at an NLU: What to Expect After Cracking CLAT",excerpt:"A CLATians alumna shares what life at a National Law University really looks like.",content:`You have been preparing for months, taking mock tests, sacrificing weekends. But what actually happens after you crack CLAT and get into an NLU? Here is an honest look at life at a National Law University.

## The First Year: Adjustment Phase

The first year at an NLU is typically the most challenging. You transition from being a school topper to being surrounded by equally brilliant students from across India.

**Academic load**: NLUs are academically rigorous. Expect 6-7 subjects per semester with no passive learning — participation is mandatory.

**Moot Courts and Competitions**: These start in first year itself. Moot court competitions, client counseling, negotiation — all are integral to NLU life.

## Opportunities at NLUs

**Internships**: NLUs provide excellent internship opportunities. Students intern at top law firms, courts (Supreme Court, High Courts), and legal aid organizations.

**Placements**: Top NLUs have excellent placement records. NLU Delhi, NLSIU Bangalore, and NALSAR Hyderabad see placements at Magic Circle and Indian Tier-1 firms.

**Exchange Programs**: Many NLUs have exchange programs with international universities.

## Social Life

NLU life is vibrant with cultural festivals, sports events, and student-run organizations covering everything from legal aid to debate to music.

**Hostel life**: Most NLUs are residential. You live, eat, study, and grow alongside your batchmates.

## Career After NLU

An NLU degree opens multiple pathways:
1. **Law firms**: Top firms recruit heavily from top NLUs
2. **Litigation**: Junior Advocate → Independent Practice
3. **Judiciary**: Judicial Services and High Court/Supreme Court
4. **Corporate (In-house counsel)**: Working for companies
5. **Higher education**: LLM and academia

## Is It Worth the Preparation?

Absolutely. An NLU education is transformative — academically, professionally, and personally. The preparation may be intense, but the opportunity is life-changing.

Start your preparation with CLATians today. Your NLU journey begins here.`,category:"Law Preparation",categoryColor:"#f77420",author:"CLATians Team",authorAvatar:"CT",date:"April 8, 2026",readTime:"8 min read",tags:["NLU Life","After CLAT","Law School","Career"]},{slug:"top-nlu-colleges-india-ranking-2026",title:"Top 10 NLU Colleges in India: Complete Ranking & Cutoffs 2026",excerpt:"Complete guide to all 23 NLUs — rankings, cutoffs, placements, and which one is right for you.",content:`India has 23 National Law Universities (NLUs) that accept CLAT scores. Choosing the right NLU is just as important as cracking CLAT. Here is the definitive ranking guide for 2026.

## Tier 1 NLUs (AIR 1–200)

**1. NLSIU Bengaluru (National Law School of India University)**
Founded in 1987, NLSIU is the crown jewel of Indian legal education. Consistent #1 ranking for 35+ years. Expected CLAT cutoff: AIR 1–65. Average placement: ₹18–22 LPA.

**2. NALSAR Hyderabad (National Academy of Legal Studies and Research)**
NALSAR is famous for its student-led legal aid clinics and moot court culture. Expected cutoff: AIR 65–130. Average placement: ₹14–18 LPA.

**3. NLU Delhi (National Law University, Delhi)**
Conducts its own exam (AILET). Only 110 seats. Exceptional placement record — multiple students placed at Magic Circle law firms. AILET cutoff: AIR 1–110.

**4. WBNUJS Kolkata (West Bengal National University of Juridical Sciences)**
One of the oldest and most prestigious NLUs. Strong alumni network in corporate law. CLAT cutoff: AIR 130–250. Average placement: ₹12–16 LPA.

**5. NLUJ Jodhpur (National Law University, Jodhpur)**
Known for excellent infrastructure and strong placement record. CLAT cutoff: AIR 250–400. Average placement: ₹10–14 LPA.

## Tier 2 NLUs (AIR 200–600)

**6. GNLU Gandhinagar** — CLAT cutoff: AIR 400–650
**7. RMLNLU Lucknow** — CLAT cutoff: AIR 500–750
**8. HNLU Raipur** — CLAT cutoff: AIR 450–700
**9. RGNUL Patiala** — CLAT cutoff: AIR 600–850
**10. CNLU Patna** — CLAT cutoff: AIR 700–1000

## How to Choose Your NLU

When deciding which NLU to target, consider:
- Your expected CLAT rank range
- Location preference (city vs smaller town)
- Specialization interest (Corporate, Criminal, Constitutional)
- Placement record and alumni network
- Fee structure and scholarship availability

## CLATians Pro Tip

At CLATians, we run specialized College Predictor sessions where A.K. Sir personally helps students identify their target NLUs based on their mock test performance. Join us today!`,category:"Law Preparation",categoryColor:"#f77420",author:"A.K. Singh",authorAvatar:"AK",date:"15 May, 2026",readTime:"10 min read",tags:["NLU Rankings","CLAT Cutoffs","NLU Guide","Law College"]},{slug:"legal-reasoning-tips-clat-2026",title:"Legal Reasoning for CLAT 2026: 10 Proven Tips to Score 30+/37",excerpt:"Master legal reasoning with these expert strategies from A.K. Singh. Score full marks in the highest-weightage section.",content:`Legal Reasoning is the most important section of CLAT — carrying 37 marks and determining whether you crack a top NLU or not. Here are 10 proven strategies.

## Why Legal Reasoning Matters Most

Most students can improve their English and Logical Reasoning scores through practice. But Legal Reasoning requires a different kind of understanding — one that combines reading comprehension with legal thinking.

## Tip 1: Read the Principle First, Facts Second

Always read the legal principle stated in the passage BEFORE reading the facts. This primes your mind to apply the law correctly.

## Tip 2: Never Use Outside Knowledge

This is the biggest mistake. CLAT tests your ability to apply the GIVEN principle, not your pre-existing knowledge of law. Even if the principle stated in the passage is wrong in real law, apply it as given.

## Tip 3: Master "Principle-Fact Application"

The standard format is: Principle → Facts → Question asks you to apply principle to facts.
Step 1: Identify what the principle says.
Step 2: Check if the facts satisfy all conditions of the principle.
Step 3: Apply logically.

## Tip 4: Watch for Exception Clauses

Most legal principles have exceptions. "Unless," "except," "provided that," "notwithstanding" — these words signal exceptions. Identify them carefully.

## Tip 5: Understand Tortious Liability Basics

- Negligence: Duty + Breach + Causation + Damage
- Strict Liability: Dangerous activity + escape + damage
- Vicarious Liability: Employer liable for employee acts

## Tip 6: Contract Law Essentials

- Offer + Acceptance + Consideration + Capacity = Valid Contract
- Minor's agreement is void, not voidable
- Free consent — coercion, undue influence, fraud, misrepresentation

## Tip 7: Constitutional Law Patterns

Fundamental Rights, DPSPs, their interplay — frequently tested.
Know Article 14, 19, 21, 32, 226, 136 basics.

## Tip 8: Practice 20 Passages Per Day

From September onwards, attempt at least 20 legal reasoning passages daily from previous year CLATs and mock tests.

## Tip 9: Maintain an Error Log

Every wrong answer goes into an error log with: question, why you got it wrong, correct reasoning. Review weekly.

## Tip 10: Join CLATians Legal Reasoning Classes

A.K. Singh's specialized Legal Reasoning sessions at CLATians systematically cover all areas — Torts, Contracts, Constitutional Law, Criminal Law — with 500+ practice passages. Students consistently score 30+/37 after completing the course.`,category:"Legal",categoryColor:"#6366f1",author:"A.K. Singh",authorAvatar:"AK",date:"12 May, 2026",readTime:"7 min read",tags:["Legal Reasoning","CLAT Strategy","CLAT 2026","Study Tips"]},{slug:"clat-vs-ailet-which-is-harder",title:"CLAT vs AILET 2026: Which is Harder? Complete Comparison",excerpt:"Detailed comparison of CLAT and AILET — difficulty level, pattern, cutoffs, and which exam you should prioritize.",content:`Every law aspirant faces the CLAT vs AILET dilemma. Both lead to prestigious destinations — CLAT to 23 NLUs and AILET exclusively to NLU Delhi. Here is a complete comparison.

## Basic Differences at a Glance

**CLAT 2026:**
- Conducted by: Consortium of NLUs
- Duration: 2 Hours
- Questions: 120
- Marks: 120
- Colleges: 23 NLUs
- Negative marking: 0.25

**AILET 2026:**
- Conducted by: NLU Delhi
- Duration: 90 Minutes
- Questions: 100
- Marks: 100
- Colleges: Only NLU Delhi
- Negative marking: 0.25

## Which is Harder?

Honestly, AILET is significantly harder than CLAT for most students. Here is why:

### Competition Level
AILET has only 110 seats (General category: ~65 seats). CLAT has 2700+ seats. The competition ratio is almost 300:1 for AILET vs 150:1 for CLAT.

### Exam Pattern
AILET has a more diverse pattern including Elementary Mathematics (not in CLAT). The English and GK sections in AILET tend to be more factual and less passage-based than CLAT.

### Cutoffs
AILET cutoff: typically 65–70/100 for General category.
CLAT cutoff for NLSIU: typically 95–105/120.

## Should You Attempt Both?

Yes! Most CLATians coaching students prepare for both. The syllabi overlap significantly. Additional preparation needed for AILET:
- Elementary Mathematics (basic level — 10 questions)
- Slightly higher GK depth
- More rote-based GK vs passage-based GK

## CLATians Strategy for Both Exams

At CLATians, we have a combined preparation program covering both CLAT and AILET. Students who join our Offline Batch typically attempt both exams and secure admissions in either NLU Delhi or NALSAR/NLSIU. Call us at 8507700177 to know more.`,category:"Law Preparation",categoryColor:"#f77420",author:"A.K. Singh",authorAvatar:"AK",date:"8 May, 2026",readTime:"6 min read",tags:["CLAT vs AILET","AILET 2026","Exam Comparison","Strategy"]},{slug:"current-affairs-clat-may-2026",title:"Current Affairs for CLAT – May 2026 Complete Capsule",excerpt:"All important current affairs events of May 2026 relevant for CLAT, AILET, and other law entrance exams.",content:`Stay updated with the most important current affairs for CLAT 2026. This monthly capsule covers all key events relevant for law entrance exams.

## National Affairs

**Supreme Court Judgments:**
- Key judgments on Article 21 (Right to Life) and privacy law
- Important constitutional bench decisions

**Parliament & Legislature:**
- Bills passed in recent Parliament sessions
- Constitutional amendments and their implications

**Legal Developments:**
- New laws affecting criminal procedure
- Changes in contract and commercial law

## International Affairs

**India's Foreign Relations:**
- Bilateral agreements signed
- India's position in international organizations (UN, WTO, ICJ)
- Key diplomatic developments

**International Law Developments:**
- ICJ rulings relevant for Indian law students
- International treaties ratified by India

## Legal GK Focus Areas for CLAT 2026

**Important Supreme Court Judgments (Must Know):**
1. Kesavananda Bharati Case — Basic Structure Doctrine
2. Maneka Gandhi Case — Article 21 expanded
3. Vishaka Guidelines — Sexual harassment at workplace
4. Shreya Singhal Case — Section 66A struck down

**Important Legal Appointments:**
- Chief Justice of India appointments
- Law Commission of India reports
- NHRC, SEBI, and other regulatory body heads

## Science & Technology

- Space missions (ISRO updates)
- AI regulation developments in India
- Cybersecurity laws

## Sports GK

- Major sporting events and champions
- Indian sports awards

## CLATians Daily GK Programme

At CLATians, we provide daily GK capsules to all enrolled students. Our GK program covers:
- Daily newspaper analysis (The Hindu + Indian Express)
- Weekly legal news summary
- Monthly GK magazine
- Emergency updates on breaking legal news

Join CLATians today to never miss an important current affairs update for CLAT 2026!`,category:"Current Affairs",categoryColor:"#f97316",author:"CLATians Faculty",authorAvatar:"CF",date:"20 May, 2026",readTime:"8 min read",tags:["Current Affairs","CLAT 2026","GK","Legal GK","Monthly Capsule"]}];e.s(["default",0,function(){let[e,n]=(0,s.useState)(i);(0,s.useEffect)(()=>{fetch("/api/blogs").then(e=>e.json()).then(n).catch(()=>{})},[]);let r=[...e,...e];return(0,t.jsxs)("section",{style:{background:"#F8FAFC"},className:"jsx-6ac80f28d6fbf922 py-8 md:py-14 overflow-hidden",children:[(0,t.jsx)("div",{className:"jsx-6ac80f28d6fbf922 max-w-7xl mx-auto px-4 mb-6",children:(0,t.jsxs)("div",{className:"jsx-6ac80f28d6fbf922 flex items-center justify-between",children:[(0,t.jsxs)("div",{className:"jsx-6ac80f28d6fbf922",children:[(0,t.jsx)("span",{style:{background:"#fff1e8",color:"#f77420"},className:"jsx-6ac80f28d6fbf922 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full",children:"The CLATians Journal"}),(0,t.jsx)("h2",{style:{color:"#0D1837"},className:"jsx-6ac80f28d6fbf922 mt-2 font-black text-xl md:text-3xl",children:"Read & Learn"})]}),(0,t.jsx)("a",{href:"/blogs",style:{color:"#f77420"},className:"jsx-6ac80f28d6fbf922 text-sm font-bold",children:"See All →"})]})}),(0,t.jsxs)("div",{className:"jsx-6ac80f28d6fbf922 relative",children:[(0,t.jsx)("div",{style:{background:"linear-gradient(to right, #F8FAFC, transparent)"},className:"jsx-6ac80f28d6fbf922 absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"}),(0,t.jsx)("div",{style:{background:"linear-gradient(to left, #F8FAFC, transparent)"},className:"jsx-6ac80f28d6fbf922 absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"}),(0,t.jsx)("div",{style:{width:"max-content",paddingLeft:"16px",paddingRight:"16px"},className:"jsx-6ac80f28d6fbf922 flex gap-4 blogs-scroll-track",children:r.map((e,a)=>(0,t.jsxs)("a",{href:`/blogs/${e.slug}`,style:{width:"260px",background:"white",border:"1px solid #E9EEF2",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"},className:"jsx-6ac80f28d6fbf922 flex-shrink-0 rounded-2xl overflow-hidden flex flex-col",children:[(0,t.jsx)("div",{className:"jsx-6ac80f28d6fbf922 px-4 pt-4 pb-2",children:(0,t.jsx)("span",{style:{background:`${e.categoryColor}18`,color:e.categoryColor},className:"jsx-6ac80f28d6fbf922 text-[10px] font-black px-2.5 py-1 rounded-full",children:e.category})}),(0,t.jsxs)("div",{className:"jsx-6ac80f28d6fbf922 px-4 pb-3 flex-1",children:[(0,t.jsx)("h3",{style:{color:"#0D1837"},className:"jsx-6ac80f28d6fbf922 font-black text-sm leading-snug line-clamp-2",children:e.title}),(0,t.jsx)("p",{style:{color:"#6B7280"},className:"jsx-6ac80f28d6fbf922 text-xs mt-1.5 line-clamp-2",children:e.excerpt})]}),(0,t.jsxs)("div",{className:"jsx-6ac80f28d6fbf922 px-4 pb-4 flex items-center justify-between",children:[(0,t.jsxs)("div",{className:"jsx-6ac80f28d6fbf922 flex items-center gap-2",children:[(0,t.jsx)("div",{className:"jsx-6ac80f28d6fbf922 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0",children:(0,t.jsx)("img",{src:"/demos/clatians-website-cms/logo.png",alt:"CLATians",className:"jsx-6ac80f28d6fbf922 w-full h-full object-contain p-px"})}),(0,t.jsx)("span",{style:{color:"#374151"},className:"jsx-6ac80f28d6fbf922 text-[11px] font-semibold truncate",children:e.author})]}),(0,t.jsx)("span",{style:{color:"#9CA3AF"},className:"jsx-6ac80f28d6fbf922 text-[10px] font-medium",children:e.readTime})]})]},`${e.slug}-${a}`))})]}),(0,t.jsx)(a.default,{id:"6ac80f28d6fbf922",children:".blogs-scroll-track.jsx-6ac80f28d6fbf922{animation:30s linear infinite blogsScroll}.blogs-scroll-track.jsx-6ac80f28d6fbf922:hover{animation-play-state:paused}@keyframes blogsScroll{0%{transform:translate(0)}to{transform:translate(-50%)}}"})]})}],38089)},16774,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(97144);let i=[{name:"Aman Deep Singh",rank:"AIR 23",college:"NLU Delhi",year:"CLAT 2024",avatar:"AD",color:"#6366f1",quote:"CLATians gave me the structure, mentors, and mock tests I needed. A.K. Sir's teaching of legal reasoning is absolutely unmatched.",stars:5},{name:"Priya Sharma",rank:"AIR 47",college:"NALSAR Hyderabad",year:"CLAT 2024",avatar:"PS",color:"#ec4899",quote:"The online program was incredibly flexible. I could study from home while still getting personalized mentorship. Mock test analytics helped me improve 40 ranks.",stars:5},{name:"Rohan Gupta",rank:"AIR 12",college:"NLU Delhi",year:"AILET 2024",avatar:"RG",color:"#f59e0b",quote:"AILET preparation at CLATians is top-notch. The specialized legal reasoning classes and focused GK sessions made all the difference.",stars:5},{name:"Sneha Patel",rank:"AIR 89",college:"NLIU Bhopal",year:"CLAT 2024",avatar:"SP",color:"#14b8a6",quote:"From a small town in Bihar to NLIU Bhopal — CLATians made my dream possible. The faculty is truly dedicated to every student.",stars:5},{name:"Vikram Mishra",rank:"AIR 156",college:"GNLU Gandhinagar",year:"CLAT 2024",avatar:"VM",color:"#f77420",quote:"I was a dropper who had failed CLAT twice. CLATians' personalized approach completely changed my strategy. Third attempt — AIR 156.",stars:5},{name:"Kavya Reddy",rank:"AIR 34",college:"NALSAR Hyderabad",year:"CLAT 2025",avatar:"KR",color:"#f97316",quote:"The study material quality is exceptional. 8 volumes covering every topic in depth. Combined with daily GK sessions, I scored 98/120 in current affairs.",stars:5},{name:"Arjun Tiwari",rank:"AIR 67",college:"RMLNLU Lucknow",year:"CLAT 2024",avatar:"AT",color:"#8b5cf6",quote:"Joined CLATians in Class 11. Two years of consistent preparation with A.K. Sir's guidance. Best decision of my life.",stars:5},{name:"Riya Bose",rank:"AIR 203",college:"CNLU Patna",year:"CLAT 2024",avatar:"RB",color:"#ef4444",quote:"As a girl from a small family, fees were a concern. CLATians offered scholarship which made it possible. Extremely grateful for the support.",stars:5}];function n({t:e}){let[s,i]=(0,a.useState)(!1);return(0,t.jsxs)("div",{onMouseEnter:()=>i(!0),onMouseLeave:()=>i(!1),style:{background:"white",border:`1.5px solid ${s?e.color+"44":"#F0F0F0"}`,borderRadius:"18px",padding:"20px",width:"280px",flexShrink:0,boxShadow:s?`0 12px 32px ${e.color}22`:"0 2px 8px rgba(0,0,0,0.05)",transform:s?"translateY(-4px)":"none",transition:"all .25s ease",position:"relative",overflow:"hidden"},children:[(0,t.jsx)("div",{style:{position:"absolute",top:0,left:0,right:0,height:"3px",background:`linear-gradient(90deg,${e.color},${e.color}88)`,borderRadius:"18px 18px 0 0"}}),(0,t.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px",marginTop:"4px"},children:[(0,t.jsx)("div",{style:{color:e.color,fontSize:"36px",fontWeight:900,lineHeight:1,fontFamily:"Georgia, serif"},children:'"'}),(0,t.jsx)("span",{style:{fontSize:"10px",fontWeight:700,padding:"3px 10px",borderRadius:"99px",background:e.color+"18",color:e.color},children:e.college})]}),(0,t.jsx)("div",{style:{color:"#f59e0b",fontSize:"12px",marginBottom:"8px"},children:"★".repeat(e.stars)}),(0,t.jsx)("p",{style:{color:"#374151",fontSize:"12px",lineHeight:1.65,marginBottom:"14px",flex:1},children:e.quote}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"10px",borderTop:"1px solid #F3F4F6",paddingTop:"12px"},children:[(0,t.jsx)("div",{style:{width:"36px",height:"36px",borderRadius:"50%",background:e.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:"12px",flexShrink:0},children:e.avatar}),(0,t.jsxs)("div",{children:[(0,t.jsx)("div",{style:{color:"#0D1837",fontWeight:700,fontSize:"12px"},children:e.name}),(0,t.jsxs)("div",{style:{color:e.color,fontWeight:700,fontSize:"10px"},children:[e.rank," · ",e.year]})]})]})]})}function r({cards:e,reverse:a}){let s=[...e,...e];return(0,t.jsx)("div",{style:{overflow:"hidden",maskImage:"linear-gradient(90deg,transparent,black 80px,black calc(100% - 80px),transparent)",WebkitMaskImage:"linear-gradient(90deg,transparent,black 80px,black calc(100% - 80px),transparent)"},children:(0,t.jsx)("div",{style:{display:"flex",gap:"14px",animation:`marquee${a?"Rev":""} 30s linear infinite`,width:"max-content"},children:s.map((e,a)=>(0,t.jsx)(n,{t:e},`${e.name}-${a}`))})})}i.slice(0,4),i.slice(4,8),e.s(["default",0,function({content:e=s.defaultHomeContent.testimonials}){let i=e.testimonials?.length?e.testimonials:s.defaultHomeContent.testimonials.testimonials,n=i.slice(0,Math.ceil(i.length/2)),o=i.slice(Math.ceil(i.length/2)),l=e.badges?.length?e.badges:s.defaultHomeContent.testimonials.badges,d=e.statsBar?.length?e.statsBar:s.defaultHomeContent.testimonials.statsBar,{ref:c,visible:p}=function(e=.1){let t=(0,a.useRef)(null),[s,i]=(0,a.useState)(!1);return(0,a.useEffect)(()=>{let a=t.current;if(!a)return;let s=new IntersectionObserver(([e])=>{e.isIntersecting&&(i(!0),s.disconnect())},{threshold:e});return s.observe(a),()=>s.disconnect()},[e]),{ref:t,visible:s}}(.1);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("style",{children:`
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes marqueeRev{from{transform:translateX(-50%)}to{transform:translateX(0)}}
      `}),(0,t.jsxs)("section",{style:{background:"#0D1837",padding:"52px 0 48px",overflow:"hidden"},children:[(0,t.jsxs)("div",{ref:c,className:"max-w-7xl mx-auto px-4 md:px-10",style:{textAlign:"center",marginBottom:"36px",opacity:+!!p,transform:p?"none":"translateY(20px)",transition:"opacity .6s ease, transform .6s ease"},children:[(0,t.jsxs)("div",{style:{display:"inline-flex",alignItems:"center",gap:"8px",marginBottom:"12px",padding:"5px 14px",borderRadius:"99px",background:"rgba(247,116,32,0.1)",border:"1px solid rgba(247,116,32,0.25)"},children:[(0,t.jsx)("span",{style:{width:"7px",height:"7px",borderRadius:"50%",background:"#f77420",display:"inline-block"}}),(0,t.jsx)("span",{style:{color:"#f77420",fontSize:"11px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"},children:e.eyebrow})]}),(0,t.jsxs)("h2",{style:{color:"white",fontWeight:900,fontSize:"clamp(24px,3vw,40px)",lineHeight:1.15,marginBottom:"8px"},children:[e.titleLine1,(0,t.jsx)("br",{}),(0,t.jsx)("span",{style:{background:"linear-gradient(90deg,#f77420,#ffad75)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},children:e.titleLine2})]}),(0,t.jsx)("p",{style:{color:"rgba(255,255,255,0.5)",fontSize:"14px",marginBottom:"20px"},children:e.subtitle}),(0,t.jsx)("div",{style:{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"10px"},children:l.map((e,a)=>(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px",padding:"8px 16px",borderRadius:"99px",background:e.bg,color:e.color,fontSize:"12px",fontWeight:700,opacity:+!!p,transform:p?"none":"translateY(10px)",transition:`opacity .5s ease ${.2+.08*a}s, transform .5s ease ${.2+.08*a}s`,boxShadow:"0 2px 8px rgba(0,0,0,0.1)"},children:[(0,t.jsx)("span",{children:e.icon}),(0,t.jsx)("span",{children:e.label}),(0,t.jsx)("span",{style:{opacity:.5},children:"·"}),(0,t.jsx)("span",{children:e.count})]},e.label))})]}),(0,t.jsxs)("div",{className:"hidden md:flex flex-col gap-4",children:[(0,t.jsx)(r,{cards:n}),(0,t.jsx)(r,{cards:o.length?o:n,reverse:!0})]}),(0,t.jsx)("div",{className:"md:hidden flex flex-col gap-4",children:(0,t.jsx)(r,{cards:i})}),(0,t.jsx)("div",{className:"max-w-7xl mx-auto px-4 md:px-10 mt-10",children:(0,t.jsx)("div",{style:{background:"linear-gradient(90deg,#d95f18,#f77420)",borderRadius:"16px",padding:"16px 28px",display:"flex",flexWrap:"wrap",justifyContent:"center",alignItems:"center",gap:"8px"},children:d.map((e,a,s)=>(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"16px"},children:[(0,t.jsx)("span",{style:{color:"white",fontWeight:700,fontSize:"14px"},children:e}),a<s.length-1&&(0,t.jsx)("span",{style:{color:"rgba(255,255,255,0.35)",fontSize:"18px"},children:"|"})]},e))})})]})]})}])},57664,e=>{"use strict";var t=e.i(43476),a=e.i(37902),s=e.i(22016);let i=["#FFF0F0","#F0F8FF","#F0FFF4","#FFF8F0","#F5F0FF","#FFFFF0","#F0F0FF","#FFF4F4"];function n({rating:e}){let a=Number.isFinite(e)?Math.max(0,Math.min(5,e)):0,s=Math.floor(a),i=a%1!=0;return(0,t.jsxs)("div",{className:"flex items-center gap-1",children:[(0,t.jsxs)("span",{className:"text-sm",style:{color:"#FBBF24"},children:["★".repeat(s),i?"½":""]}),(0,t.jsx)("span",{className:"text-xs font-bold",style:{color:"#3C4852"},children:a.toFixed(1)})]})}function r({f:e,idx:a}){let o=e.bg||i[a%i.length],l=e.color||"#f77420",d=e.avatar||e.name.split(/\s+/).filter(Boolean).slice(0,2).map(e=>e[0]).join("").toUpperCase();return(0,t.jsx)(s.default,{href:`/faculty/${e.slug}`,className:"faculty-card-link",style:{flexShrink:0,textDecoration:"none",display:"block"},children:(0,t.jsxs)("div",{style:{background:"white",borderRadius:"20px",overflow:"hidden",border:"1.5px solid #F0F0F0",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"},children:[(0,t.jsxs)("div",{style:{background:o,padding:"18px 16px 14px",display:"flex",flexDirection:"column",alignItems:"center"},children:[e.photo?(0,t.jsx)("img",{src:e.photo,alt:e.name,style:{width:"64px",height:"64px",borderRadius:"50%",objectFit:"cover",border:"3px solid white",boxShadow:"0 4px 12px rgba(0,0,0,0.12)",marginBottom:"8px"}}):(0,t.jsx)("div",{"aria-label":e.name,style:{width:"64px",height:"64px",borderRadius:"50%",border:"3px solid white",boxShadow:"0 4px 12px rgba(0,0,0,0.12)",marginBottom:"8px",background:`linear-gradient(135deg, ${l}, ${l}bb)`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:900,fontSize:"22px"},children:d}),(0,t.jsx)(n,{rating:e.rating}),(0,t.jsxs)("div",{style:{color:"#7A8B94",fontSize:"10px",fontWeight:600,marginTop:"3px"},children:["👥 ",e.students]})]}),(0,t.jsxs)("div",{style:{padding:"12px 12px 14px"},children:[(0,t.jsx)("div",{style:{fontWeight:800,fontSize:"12px",color:"#0D1837",marginBottom:"3px",lineHeight:1.2},children:e.name}),(0,t.jsx)("div",{style:{fontSize:"10px",fontWeight:700,color:l,marginBottom:"5px"},children:e.designation}),(0,t.jsx)("div",{style:{display:"flex",flexWrap:"wrap",gap:"3px"},children:e.tags.slice(0,2).map(e=>(0,t.jsx)("span",{style:{fontSize:"9px",fontWeight:700,padding:"2px 6px",borderRadius:"6px",background:"#fff7ed",color:l,border:"1px solid #ffd4ba"},children:e},e))})]})]})})}e.s(["default",0,function({faculty:e}){if(0===e.length)return null;let i=e.length>4,n=i?[...e,...e]:e;return(0,t.jsxs)("section",{className:"jsx-7aa3c5409b1ba1c4 py-8 md:py-14 bg-white overflow-hidden",children:[(0,t.jsx)("div",{className:"jsx-7aa3c5409b1ba1c4 max-w-7xl mx-auto px-4 mb-6",children:(0,t.jsxs)("div",{className:"jsx-7aa3c5409b1ba1c4 flex items-center justify-between",children:[(0,t.jsxs)("div",{className:"jsx-7aa3c5409b1ba1c4",children:[(0,t.jsx)("span",{style:{background:"#fff7ed",color:"#f77420"},className:"jsx-7aa3c5409b1ba1c4 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full",children:"Our Faculty"}),(0,t.jsx)("h2",{style:{color:"#0D1837"},className:"jsx-7aa3c5409b1ba1c4 mt-2 font-black text-xl md:text-3xl",children:"Meet Our Expert Faculty"}),(0,t.jsx)("p",{style:{color:"#7A8B94"},className:"jsx-7aa3c5409b1ba1c4 text-sm mt-1",children:"Advocates, NLU alumni & toppers — handpicked for your selection."})]}),(0,t.jsx)(s.default,{href:"/faculty",className:"text-sm font-bold flex-shrink-0",style:{color:"#f77420"},children:"See All →"})]})}),(0,t.jsxs)("div",{className:"jsx-7aa3c5409b1ba1c4 relative max-w-7xl mx-auto overflow-hidden",children:[(0,t.jsx)("div",{style:{background:"linear-gradient(to right, white, transparent)"},className:"jsx-7aa3c5409b1ba1c4 absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"}),(0,t.jsx)("div",{style:{background:"linear-gradient(to left, white, transparent)"},className:"jsx-7aa3c5409b1ba1c4 absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"}),(0,t.jsx)("div",{style:{width:"max-content",paddingLeft:"16px",paddingRight:"16px"},className:`jsx-7aa3c5409b1ba1c4 flex gap-4 ${i?"faculty-scroll-track":"faculty-static-track"}`,children:n.map((a,s)=>(0,t.jsx)("div",{style:{flexShrink:0},className:"jsx-7aa3c5409b1ba1c4 faculty-card",children:(0,t.jsx)(r,{f:a,idx:s%e.length})},`${a.slug}-${s}`))})]}),(0,t.jsx)(a.default,{id:"7aa3c5409b1ba1c4",children:".faculty-scroll-track.jsx-7aa3c5409b1ba1c4{animation:28s linear infinite facultyScroll}.faculty-card-link{width:150px!important}@media (width>=768px){.faculty-card-link{width:calc(min(100vw,1280px)/4 - 20px)!important}}.faculty-scroll-track.jsx-7aa3c5409b1ba1c4:hover{animation-play-state:paused}@keyframes facultyScroll{0%{transform:translate(0)}to{transform:translate(-50%)}}"})]})}])},43944,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(97144);e.s(["default",0,function({content:e=s.defaultHomeContent.faq}){let i=e.items?.length?e.items:s.defaultHomeContent.faq.items,[n,r]=(0,a.useState)(0);return(0,t.jsx)("section",{className:"py-8 md:py-14",style:{background:"#F7F9FB"},children:(0,t.jsxs)("div",{className:"max-w-3xl mx-auto",children:[(0,t.jsxs)("div",{className:"text-center mb-8 px-4",children:[(0,t.jsxs)("div",{className:"inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full",style:{background:"rgba(247,116,32,0.1)",border:"1px solid rgba(247,116,32,0.2)"},children:[(0,t.jsx)("span",{className:"w-1.5 h-1.5 rounded-full inline-block",style:{background:"#f77420"}}),(0,t.jsx)("span",{className:"text-xs font-bold uppercase tracking-wider",style:{color:"#f77420"},children:e.eyebrow})]}),(0,t.jsx)("h2",{className:"text-2xl md:text-4xl font-extrabold mb-2",style:{color:"#0D1837"},children:e.title}),(0,t.jsx)("p",{className:"text-sm",style:{color:"#7A8B94"},children:e.subtitle})]}),(0,t.jsx)("div",{className:"px-4 space-y-2.5",children:i.map((e,a)=>(0,t.jsxs)("div",{style:{borderRadius:"16px",overflow:"hidden",border:`1.5px solid ${n===a?"#f77420":"#E9EEF2"}`,background:"white",boxShadow:n===a?"0 4px 16px rgba(247,116,32,0.1)":"0 1px 4px rgba(0,0,0,0.04)",transition:"all .2s ease"},children:[(0,t.jsxs)("button",{onClick:()=>r(n===a?null:a),className:"w-full flex items-center justify-between px-4 py-4 text-left",style:{background:n===a?"#fff7ed":"white",border:"none",cursor:"pointer"},children:[(0,t.jsx)("span",{className:"font-semibold text-sm pr-3 leading-snug",style:{color:"#0D1837"},children:e.q}),(0,t.jsx)("span",{className:"flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold transition-all",style:{background:n===a?"#f77420":"#F3F4F6",color:n===a?"white":"#9CA3AF",minWidth:"28px"},children:n===a?"−":"+"})]}),n===a&&(0,t.jsx)("div",{className:"px-4 pb-4 pt-1 text-sm leading-relaxed border-t animate-fade-in",style:{borderColor:"#fff1e8",color:"#5a6a75",background:"#fff7ed"},children:e.a})]},a))}),(0,t.jsxs)("div",{className:"mx-4 mt-8 rounded-2xl p-5 text-center",style:{background:"linear-gradient(135deg,#0D1837,#1a2744)"},children:[(0,t.jsx)("div",{className:"text-3xl mb-3",children:e.ctaIcon}),(0,t.jsx)("h3",{className:"font-black text-lg text-white mb-1",children:e.ctaTitle}),(0,t.jsx)("p",{className:"text-sm mb-4",style:{color:"rgba(255,255,255,0.5)"},children:e.ctaText}),(0,t.jsxs)("div",{className:"flex gap-3",children:[(0,t.jsx)("a",{href:e.primaryLink,className:"flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm",style:{background:"linear-gradient(135deg,#f77420,#d95f18)",boxShadow:"0 6px 16px rgba(247,116,32,0.35)"},children:e.primaryLabel}),(0,t.jsx)("a",{href:e.secondaryLink,className:"flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm",style:{background:"rgba(255,255,255,0.1)",color:"white",border:"1.5px solid rgba(255,255,255,0.15)"},children:e.secondaryLabel})]})]})]})})}])}]);
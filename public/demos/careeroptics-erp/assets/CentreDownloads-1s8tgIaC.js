import{r as e}from"./rolldown-runtime-hePW80VL.js";import{m as t,p as n}from"./chunk-62JRHF6Z-DNFPxerC.js";import{Lt as r,Yt as i,d as a,k as o,l as s,qa as c}from"./index-DbunPdHg.js";import{a as l,t as u,y as d}from"./brandDocuments-AptHob3t.js";import{t as f}from"./studentDocuments-BYxUPcZi.js";import{n as p}from"./branchTemplateDocument-DJN1SKm9.js";import{c as m,l as h,r as g,u as _}from"./Dce-28lwICU8.js";import{E as v,r as y,t as b}from"./centrePanel-BWe-Pej_.js";var x=e(t(),1),S=n(),C=e=>String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]),w=e=>{let t=e.address??{};return[t.streetAddress,t.city,t.district,t.state,t.pincode].filter(Boolean).join(`, `)};function T(e,t,n,r){return`<!doctype html><html><head><meta charset="utf-8"><title>${C(e)}</title><style>
    @page{${t}}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    html,body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#111}
    ${r}
  </style></head><body>${n}</body></html>`}function E(e){let t=window.open(``,`_blank`,`width=900,height=1000`);if(!t)return!1;t.document.open(),t.document.write(e),t.document.close();let n=()=>{t.focus(),t.print()};return t.document.readyState===`complete`?setTimeout(n,300):t.addEventListener(`load`,()=>setTimeout(n,300),{once:!0}),!0}function D(e,t){let n=URL.createObjectURL(new Blob([t],{type:`text/html;charset=utf-8`})),r=document.createElement(`a`);r.href=n,r.download=e,document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(n),1e3)}var O=(e,t)=>e?`<img src="${e}" alt="" style="width:${t}px;height:${t}px;object-fit:contain" />`:``;function k({branch:e,institute:t,logo:n}){let r=(e,t=!1)=>`<div class="f${t?` w`:``}"><span>${C(e)}</span><i></i></div>`,i=(e,t)=>`<h3>${C(e)}</h3><div class="g">${t}</div>`,a=`
  <div class="sheet">
    <header>
      ${O(n,78)}
      <div class="t">
        <h1>${C(t)}</h1>
        <p>${C(b)}</p>
        <p><b>${C(e.name)}</b>${e.code?` (Centre Code: ${C(e.code)})`:``}</p>
        <p>${C(w(e))}${e.phone?` · Ph: ${C(e.phone)}`:``}</p>
      </div>
      <div class="photo">Paste recent<br/>passport size<br/>photograph</div>
    </header>
    <h2>ADMISSION FORM</h2>
    <div class="g top">${r(`Form No.`)}${r(`Admission Date`)}${r(`Enrollment No.`)}${r(`Session`)}</div>
    ${i(`Course Details`,r(`Course Name`,!0)+r(`Batch / Timing`)+r(`Course Duration`))}
    ${i(`Student Details`,r(`Student's Full Name`,!0)+r(`Father's Name`,!0)+r(`Mother's Name`,!0)+r(`Date of Birth`)+r(`Gender`)+r(`Category`)+r(`Religion`)+r(`Blood Group`)+r(`Aadhar Number`)+r(`Mobile No.`)+r(`Alternate Mobile`)+r(`Email`,!0))}
    ${i(`Address`,r(`Address`,!0)+r(`City / Village`)+r(`District`)+r(`State`)+r(`PIN Code`))}
    ${i(`Education`,r(`Highest Qualification`)+r(`Board / University`)+r(`Passing Year`)+r(`Percentage`))}
    ${i(`Fees`,r(`Course Fee`)+r(`Registration Fee`)+r(`Amount Paid`)+r(`Receipt No.`))}
    <h3>Declaration</h3>
    <p class="d">I hereby declare that the information given above is true to the best of my knowledge. I will abide by the rules and regulations of the institute.</p>
    <div class="sig">
      <div><i></i>Signature of Student</div>
      <div><i></i>Signature of Parent / Guardian</div>
      <div><i></i>Centre Director (with seal)</div>
    </div>
    <footer>Helpline: ${y}</footer>
  </div>`;return T(`Admission Form — ${e.name??``}`,`size:A4 portrait;margin:10mm`,a,`.sheet{border:2px solid #173653;padding:14px 18px;min-height:275mm;position:relative}
     header{display:flex;align-items:center;gap:14px;border-bottom:2px solid #173653;padding-bottom:10px}
     header .t{flex:1;text-align:center}
     h1{margin:0;font-size:22px;color:#173653;text-transform:uppercase}
     header p{margin:2px 0;font-size:11.5px}
     .photo{width:100px;height:120px;border:1.5px dashed #555;display:flex;align-items:center;justify-content:center;text-align:center;font-size:10px;color:#666}
     h2{text-align:center;margin:10px 0 6px;font-size:16px;letter-spacing:.15em;background:#173653;color:#fff;padding:4px}
     h3{margin:12px 0 4px;font-size:12.5px;color:#173653;border-bottom:1px solid #cbd5e1;padding-bottom:2px}
     .g{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px}
     .g.top{grid-template-columns:repeat(4,1fr)}
     .f{display:flex;align-items:flex-end;gap:6px;font-size:11.5px;min-height:22px}
     .f.w{grid-column:1/-1}
     .f span{white-space:nowrap}
     .f i{flex:1;border-bottom:1px dotted #333;height:14px}
     .d{font-size:11px;margin:4px 0}
     .sig{display:flex;justify-content:space-between;gap:20px;margin-top:46px;font-size:11px;text-align:center}
     .sig div{flex:1}.sig i{display:block;border-top:1px solid #333;margin-bottom:4px}
     footer{position:absolute;bottom:8px;left:0;right:0;text-align:center;font-size:10px;color:#555}`)}function A({branch:e,institute:t,logo:n,courses:r}){let i=r.length?r:[`Basic Computer Course`,`Tally & Accounting`,`Programming`],a=`
  <div class="banner">
    <div class="head">${O(n,110)}<div><h1>${C(t)}</h1><p>${C(b)}</p></div></div>
    <div class="open">ADMISSION OPEN</div>
    <h2>${C(e.name)}</h2>
    ${e.code?`<p class="code">Authorised Centre Code: ${C(e.code)}</p>`:``}
    <h3>Our Courses</h3>
    <ul>${i.slice(0,16).map(e=>`<li>${C(e)}</li>`).join(``)}</ul>
    <div class="feat"><span>Govt. Recognised Certificate</span><span>Practical Lab</span><span>Expert Faculty</span></div>
    <div class="contact">
      <p class="ph">Call: ${C(e.phone||`8252532179`)}</p>
      <p>${C(w(e))}</p>
    </div>
  </div>`;return T(`Admission Banner — ${e.name??``}`,`size:A4 portrait;margin:0`,a,`.banner{width:210mm;height:297mm;padding:14mm;background:linear-gradient(160deg,#173653 0%,#1f4f7a 55%,#38c3be 100%);color:#fff;text-align:center;display:flex;flex-direction:column}
     .head{display:flex;align-items:center;justify-content:center;gap:16px}
     .head img{background:#fff;border-radius:16px;padding:6px}
     h1{margin:0;font-size:30pt;text-transform:uppercase;line-height:1.05;color:#c7ff2f}
     .head p{margin:4px 0 0;font-size:11pt;opacity:.9}
     .open{margin:12mm auto 6mm;background:#f26b6b;font-size:40pt;font-weight:900;padding:4mm 12mm;border-radius:6mm;transform:rotate(-2deg);box-shadow:0 4px 0 rgba(0,0,0,.25)}
     h2{margin:2mm 0;font-size:26pt}
     .code{margin:0;font-size:12pt;opacity:.9}
     h3{margin:9mm 0 3mm;font-size:18pt;color:#c7ff2f;text-transform:uppercase;letter-spacing:.1em}
     ul{list-style:none;margin:0 auto;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:3mm 8mm;width:85%;text-align:left;font-size:14pt}
     li::before{content:"✔ ";color:#c7ff2f}
     .feat{display:flex;justify-content:center;gap:5mm;margin-top:auto;font-size:11pt}
     .feat span{border:1.5px solid #fff;border-radius:20px;padding:2mm 4mm}
     .contact{margin-top:8mm;background:#fff;color:#173653;border-radius:5mm;padding:5mm}
     .contact p{margin:1mm 0;font-size:12pt}
     .contact .ph{font-size:24pt;font-weight:900;color:#b91c1c}`)}function j(){let{branchId:e,organizationId:t}=o(),{toast:n}=c(),y=!e,b=v(t,y),[C,T]=(0,x.useState)(``),O=e||C||null,[j,M]=(0,x.useState)(null),[N,P]=(0,x.useState)(!1);(0,x.useEffect)(()=>{if(!O||!t){M(null);return}let e=!0;return P(!0),Promise.all([r(t,O).then(e=>e.data),d(O),a(O),i(t,O).then(e=>(e.data||[]).map(e=>String(e.name||``)).filter(Boolean)).catch(()=>[])]).then(([t,n,r,i])=>e&&M({branch:t,institute:n,logo:r,courses:i})).catch(t=>{e&&(M(null),n({title:`Could not load the centre`,description:t.message,variant:`destructive`}))}).finally(()=>e&&P(!1)),()=>{e=!1}},[O,t,n]);let F=e=>{E(e)||n({title:`Allow pop-ups to print`,description:`The browser blocked the print window.`,variant:`destructive`})},I=async()=>{if(!(!j||!O))try{await p([j.branch])}catch(e){n({title:`Could not print the authorization letter`,description:e.message,variant:`destructive`})}},L=async()=>{if(!j)return;let e=j.branch.director??{};try{await l([{name:String(e.name||j.branch.contactPerson||j.branch.name||``),role:`Center Director`,idNo:String(j.branch.code||``),phone:String(j.branch.phone||``),centre:[j.branch.name,w(j.branch)].filter(Boolean).join(`, `),validTill:String(j.branch.license?.expiryDate??j.branch.license?.validDate??``),photo:f(`photo`,`Director Photo`,e.photo)?.url??null}],`director-id-card-${String(j.branch.code||`centre`)}.pdf`)}catch(e){n({title:`Could not make the card`,description:e.message,variant:`destructive`})}},R=String(j?.branch.code||j?.branch.name||`centre`).replace(/[^a-z0-9]+/gi,`-`),z=async()=>{if(j)try{await u({centreName:String(j.branch.name||``),centreCode:String(j.branch.code||``),address:w(j.branch),phone:String(j.branch.phone||``),logo:f(`logo`,`Centre Logo`,j.branch.branchLogo)?.url??null},`admission-form-${R}`)}catch(e){n({title:`Could not make the form`,description:e.message,variant:`destructive`})}},B=j?[{title:`Admission Form`,text:`A blank admission form on the academy's design, with the centre's details, photo box, acknowledgement slip and signature lines.`,actions:(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(g,{onClick:()=>void z(),children:`Download PDF`}),(0,S.jsx)(g,{tone:`light`,onClick:()=>F(k(j)),children:`Print (plain)`})]})},{title:`Authorization Letter`,text:`The centre's authorisation certificate from the head office.`,actions:(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(g,{onClick:()=>void I(),children:`Print`}),(0,S.jsx)(m,{to:`/certificate/centre`,tone:`light`,children:`Open`})]})},{title:`Franchise Director ID Card`,text:`The director's identity card on the academy's design, front and back, as a PDF.`,actions:(0,S.jsx)(g,{onClick:()=>void L(),children:`Download`})},{title:`Promotional Banner`,text:`An A4 "Admission Open" banner with the centre's courses and phone number.`,actions:(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(g,{onClick:()=>F(A(j)),children:`Print`}),(0,S.jsx)(g,{tone:`green`,onClick:()=>D(`admission-banner-${R}.html`,A(j)),children:`Download`})]})}]:[];return(0,S.jsx)(s,{children:(0,S.jsxs)(h,{title:`Downloads`,children:[y&&(0,S.jsx)(`div`,{className:`mb-4 max-w-xs`,children:(0,S.jsxs)(_,{value:C,onChange:e=>T(e.target.value),"aria-label":`Branch`,children:[(0,S.jsx)(`option`,{value:``,children:`Choose a branch`}),b.map(e=>(0,S.jsx)(`option`,{value:e.id,children:e.name},e.id))]})}),O?N||!j?(0,S.jsx)(`p`,{className:`text-[13px] text-slate-500`,children:N?`Loading…`:`Centre details are not available.`}):(0,S.jsx)(`div`,{className:`grid gap-4 sm:grid-cols-2 xl:grid-cols-4`,children:B.map(e=>(0,S.jsxs)(`div`,{className:`flex flex-col rounded border border-slate-200 bg-slate-50 p-4`,children:[(0,S.jsx)(`h3`,{className:`text-[14px] font-bold text-slate-800`,children:e.title}),(0,S.jsx)(`p`,{className:`mb-4 mt-1 flex-1 text-[12.5px] text-slate-600`,children:e.text}),(0,S.jsx)(`div`,{className:`flex flex-wrap gap-2`,children:e.actions})]},e.title))}):(0,S.jsx)(`p`,{className:`text-[13px] text-slate-500`,children:`Choose a branch to print its documents.`})]})})}export{j as default};
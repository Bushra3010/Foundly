var e=`erp-id-card-templates`,t=[`Student Name`,`Student ID`,`Class & Section`,`Roll Number`,`Date of Birth`,`Blood Group`,`Parent Contact`,`Address`,`Valid Until`],n=[`Student Name`,`Student ID`,`Class & Section`,`Roll Number`,`Blood Group`,`Valid Until`],r=[{label:`Blue`,value:`#1d4ed8`},{label:`Green`,value:`#15803d`},{label:`Red`,value:`#b91c1c`},{label:`Purple`,value:`#6d28d9`},{label:`Slate`,value:`#334155`}],i=()=>({name:``,orientation:`portrait`,accent:r[0].value,instituteName:``,instituteAddress:``,fields:[...n],showPhoto:!0,showQr:!0,showSignature:!0,validUntil:``,status:`draft`});function a(e,t,n){switch(e){case`Student Name`:return t.name;case`Student ID`:return t.id;case`Class & Section`:return`${t.class} - ${t.section}`;case`Roll Number`:return t.rollNo;case`Date of Birth`:return t.dob;case`Blood Group`:return t.bloodGroup;case`Parent Contact`:return t.parentContact;case`Address`:return t.address;case`Valid Until`:return n.validUntil;default:return`—`}}var o=e=>e.replace(/[&<>"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`})[e]??e);function s(e,t){let n=e.fields.filter(e=>e!==`Student Name`).map(n=>`<tr><td style="color:#6b7280;padding:1px 6px 1px 0;font-size:9px">${o(n)}</td><td style="font-weight:600;font-size:9px">${o(a(n,t,e))}</td></tr>`).join(``);return`
    <div style="width:${e.orientation===`portrait`?204:324}px;height:${e.orientation===`portrait`?324:204}px;border:1px solid #d4d4d8;border-radius:8px;overflow:hidden;font-family:system-ui,sans-serif;display:inline-block;vertical-align:top;margin:0 8px 8px 0">
      <div style="background:${e.accent};color:#fff;padding:8px 10px">
        <p style="margin:0;font-size:12px;font-weight:700">${o(e.instituteName)}</p>
        <p style="margin:0;font-size:8px;opacity:.85">${o(e.instituteAddress)}</p>
      </div>
      <div style="padding:8px 10px;display:flex;gap:8px">
        ${e.showPhoto?`<div style="width:52px;height:62px;border:1px solid #d4d4d8;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:8px;color:#9ca3af;flex:none">${t.photo?`PHOTO`:`NO PHOTO`}</div>`:``}
        <div style="flex:1;min-width:0">
          ${e.fields.includes(`Student Name`)?`<p style="margin:0 0 4px;font-size:12px;font-weight:700">${o(t.name)}</p>`:``}
          <table style="border-collapse:collapse;width:100%">${n}</table>
        </div>
      </div>
      <div style="padding:0 10px;display:flex;align-items:flex-end;justify-content:space-between">
        ${e.showQr?`<div style="width:40px;height:40px;border:1px solid #d4d4d8;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:7px;color:#9ca3af">QR</div>`:`<span></span>`}
        ${e.showSignature?`<div style="text-align:center"><div style="width:70px;border-top:1px solid #111"></div><span style="font-size:7px;color:#6b7280">Principal</span></div>`:``}
      </div>
    </div>`}var c=(e,t)=>`<div style="display:flex;flex-wrap:wrap">${t.map(t=>s(e,t)).join(``)}</div>`;export{a,i,t as n,s as o,e as r,c as s,r as t};
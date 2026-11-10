import{r as e}from"./rolldown-runtime-Dw2cE7zH.js";import{g as t}from"./chart-vendor-DkeEVZ4C.js";import{r as n,t as r}from"./react-vendor-BBiLddrr.js";import{c as i,f as a,i as o,r as s,t as c,u as l}from"./supabase-BnTWxs4A.js";import{t as u}from"./brand-D8FDglYg.js";import{i as d}from"./auth-yM2NWTL9.js";import{t as f}from"./createLucideIcon-C6SyZXww.js";import{t as p}from"./flask-conical-BwhaVd5n.js";import{t as m}from"./indian-rupee-D0XnOt0q.js";import{t as h}from"./shield-check-CS1dn7EK.js";import{t as g}from"./x-Dcrho5W6.js";var _={name:`building-complex`,size:24,node:[[`path`,{d:`M10 12h4`,key:`a56b0p`}],[`path`,{d:`M10 8h4`,key:`1sr2af`}],[`path`,{d:`M14 21v-3a2 2 0 0 0-4 0v3`,key:`1rgiei`}],[`path`,{d:`M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2`,key:`secmi2`}],[`path`,{d:`M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16`,key:`16ra0t`}]],aliases:[`building-2`]};_.node;var v=f(_),y={name:`database`,size:24,node:[[`ellipse`,{cx:`12`,cy:`5`,rx:`9`,ry:`3`,key:`msslwz`}],[`path`,{d:`M3 5V19A9 3 0 0 0 21 19V5`,key:`1wlel7`}],[`path`,{d:`M3 12A9 3 0 0 0 21 12`,key:`mv7ke4`}]]};y.node;var b=f(y),x=e(t(),1),S=r(),C={name:u.legalName,addr:u.address,email:u.email,phone:u.phone,gst:u.gst},w=[{pax_type:`Adult (Quad sharing)`,age_limit:`Above 12 years`,price:95e3},{pax_type:`Child (with bed)`,age_limit:`2–12 years`,price:75e3},{pax_type:`Infant`,age_limit:`Below 2 years`,price:25e3}];function T(){let[e,t]=(0,x.useState)(``),[r,u]=(0,x.useState)(``),[f,_]=(0,x.useState)(!1),[y,T]=(0,x.useState)(!1),[E,D]=(0,x.useState)(C),[O,k]=(0,x.useState)(w);return(0,x.useEffect)(()=>{let e=s();t(e.url),u(e.key);let n=localStorage.getItem(`company_defaults`);n&&D(JSON.parse(n));let r=localStorage.getItem(`price_templates`);r&&k(JSON.parse(r))},[]),(0,S.jsxs)(`div`,{className:`page-content`,children:[(0,S.jsx)(`div`,{className:`dashboard-header`,children:(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h1`,{className:`text-gradient`,children:`Settings & Admin`}),(0,S.jsx)(`p`,{className:`text-muted`,children:`Configure your workspace.`})]})}),(0,S.jsxs)(`div`,{className:`admin-sections-grid`,children:[d()&&(0,S.jsxs)(`section`,{className:`glass-card settings-card`,children:[(0,S.jsxs)(`div`,{className:`settings-head`,children:[(0,S.jsx)(`div`,{className:`settings-icon`,children:(0,S.jsx)(h,{size:20})}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h3`,{children:`Users & Roles`}),(0,S.jsx)(`p`,{className:`text-dim`,children:`Create accounts and control per-module access.`})]})]}),(0,S.jsxs)(`div`,{className:`settings-form`,children:[(0,S.jsx)(`p`,{className:`text-dim`,style:{fontSize:13},children:`Add team members, assign a role label, and give each one exactly the modules they need — or full admin access.`}),(0,S.jsx)(`div`,{className:`form-actions`,children:(0,S.jsx)(n,{to:`/users`,className:`btn btn-primary`,children:`Manage Users`})})]})]}),(0,S.jsxs)(`section`,{className:`glass-card settings-card`,children:[(0,S.jsxs)(`div`,{className:`settings-head`,children:[(0,S.jsx)(`div`,{className:`settings-icon`,children:(0,S.jsx)(p,{size:20})}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h3`,{children:`Demo Mode`}),(0,S.jsx)(`p`,{className:`text-dim`,children:`Running on sample data stored in this browser.`})]})]}),(0,S.jsxs)(`div`,{className:`settings-form`,children:[(0,S.jsx)(`p`,{className:`text-dim`,style:{fontSize:13},children:`All changes are saved only in this browser. Reset to restore the original sample leads, bookings, invoices and more.`}),(0,S.jsx)(`div`,{className:`form-actions`,children:(0,S.jsx)(`button`,{className:`btn btn-ghost`,onClick:()=>{window.confirm(`Reset all demo data? Your changes will be lost.`)&&(i(),window.location.reload())},children:`Reset Demo Data`})})]})]}),(0,S.jsxs)(`section`,{className:`glass-card settings-card`,children:[(0,S.jsxs)(`div`,{className:`settings-head`,children:[(0,S.jsx)(`div`,{className:`settings-icon`,children:(0,S.jsx)(b,{size:20})}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h3`,{children:`Supabase Database`}),(0,S.jsx)(`p`,{className:`text-dim`,children:`Connect your cloud database.`})]}),(0,S.jsx)(`div`,{className:`status-pill ${y?`saved`:`unsaved`}`,children:y?`Connected`:`Disconnected`})]}),(0,S.jsxs)(`div`,{className:`settings-form`,children:[(0,S.jsxs)(`div`,{className:`form-field`,children:[(0,S.jsx)(`label`,{children:`Project URL`}),(0,S.jsx)(`input`,{className:`glass-input`,placeholder:`https://xxx.supabase.co`,value:e,onChange:e=>t(e.target.value)})]}),(0,S.jsxs)(`div`,{className:`form-field`,children:[(0,S.jsx)(`label`,{children:`API Key (Anon)`}),(0,S.jsx)(`input`,{className:`glass-input`,type:`password`,placeholder:`eyJhbGciOiJIUzI1Ni...`,value:r,onChange:e=>u(e.target.value)})]}),(0,S.jsx)(`div`,{className:`form-actions`,children:y?(0,S.jsx)(`button`,{className:`btn btn-ghost`,onClick:()=>{window.confirm(`Disconnect from Supabase?`)&&(c(),T(!1),t(``),u(``),a.success(`Disconnected.`),setTimeout(()=>window.location.reload(),1e3))},children:`Disconnect`}):(0,S.jsx)(`button`,{className:`btn btn-primary`,onClick:async()=>{if(!e||!r){a.error(`URL aur API Key fill karo`);return}_(!0);try{let{error:t}=await l(e.trim(),r.trim()).from(`packages`).select(`id`).limit(1);if(t&&t.code!==`PGRST116`&&t.code!==`42P01`)throw t;o(e.trim(),r.trim()),T(!0),a.success(`Connected! Reloading app...`),setTimeout(()=>{window.location.href=`/demos/dayare-haram-tours-crm/`},1500)}catch(e){a.error(`Connection fail: `+(e.message||`Check credentials`)),T(!1)}_(!1)},disabled:f,children:f?`Testing...`:`Connect Cloud`})})]})]}),(0,S.jsxs)(`section`,{className:`glass-card settings-card`,children:[(0,S.jsxs)(`div`,{className:`settings-head`,children:[(0,S.jsx)(`div`,{className:`settings-icon`,children:(0,S.jsx)(v,{size:20})}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h3`,{children:`Company Profile`}),(0,S.jsx)(`p`,{className:`text-dim`,children:`Your brand details.`})]})]}),(0,S.jsxs)(`div`,{className:`settings-form split`,children:[(0,S.jsxs)(`div`,{className:`form-field`,children:[(0,S.jsx)(`label`,{children:`Name`}),(0,S.jsx)(`input`,{className:`glass-input`,value:E.name,onChange:e=>D({...E,name:e.target.value})})]}),(0,S.jsxs)(`div`,{className:`form-field`,children:[(0,S.jsx)(`label`,{children:`Email`}),(0,S.jsx)(`input`,{className:`glass-input`,value:E.email,onChange:e=>D({...E,email:e.target.value})})]}),(0,S.jsxs)(`div`,{className:`form-field full`,children:[(0,S.jsx)(`label`,{children:`Address`}),(0,S.jsx)(`input`,{className:`glass-input`,value:E.addr,onChange:e=>D({...E,addr:e.target.value})})]}),(0,S.jsxs)(`div`,{className:`form-field full`,children:[(0,S.jsx)(`label`,{children:`GST Number`}),(0,S.jsx)(`input`,{className:`glass-input`,value:E.gst||``,onChange:e=>D({...E,gst:e.target.value}),placeholder:`e.g. 27ABCDE1234F1Z5`})]}),(0,S.jsx)(`div`,{className:`form-actions full`,children:(0,S.jsx)(`button`,{className:`btn btn-primary`,onClick:()=>{localStorage.setItem(`company_defaults`,JSON.stringify(E)),a.success(`Company info saved!`)},children:`Save`})})]})]}),(0,S.jsxs)(`section`,{className:`glass-card settings-card full-width`,children:[(0,S.jsxs)(`div`,{className:`settings-head`,children:[(0,S.jsx)(`div`,{className:`settings-icon`,children:(0,S.jsx)(m,{size:20})}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h3`,{children:`Default Price Templates`}),(0,S.jsx)(`p`,{className:`text-dim`,children:`Pre-fill package pricing.`})]})]}),(0,S.jsxs)(`div`,{className:`settings-table-wrap`,children:[(0,S.jsxs)(`table`,{className:`modern-table`,children:[(0,S.jsx)(`thead`,{children:(0,S.jsxs)(`tr`,{children:[(0,S.jsx)(`th`,{children:`Passenger Type`}),(0,S.jsx)(`th`,{children:`Age Limit`}),(0,S.jsx)(`th`,{children:`Base Price (₹)`}),(0,S.jsx)(`th`,{})]})}),(0,S.jsx)(`tbody`,{children:O.map((e,t)=>(0,S.jsxs)(`tr`,{children:[(0,S.jsx)(`td`,{children:(0,S.jsx)(`input`,{className:`table-inline-input`,value:e.pax_type,onChange:e=>{let n=[...O];n[t].pax_type=e.target.value,k(n)}})}),(0,S.jsx)(`td`,{children:(0,S.jsx)(`input`,{className:`table-inline-input`,value:e.age_limit,onChange:e=>{let n=[...O];n[t].age_limit=e.target.value,k(n)}})}),(0,S.jsx)(`td`,{children:(0,S.jsx)(`input`,{className:`table-inline-input`,type:`number`,value:e.price,onChange:e=>{let n=[...O];n[t].price=Number(e.target.value),k(n)}})}),(0,S.jsx)(`td`,{children:(0,S.jsx)(`button`,{className:`icon-btn`,onClick:()=>k(O.filter((e,n)=>n!==t)),children:(0,S.jsx)(g,{size:14})})})]},t))})]}),(0,S.jsxs)(`div`,{className:`form-actions-row`,children:[(0,S.jsx)(`button`,{className:`btn btn-ghost`,onClick:()=>k([...O,{pax_type:``,age_limit:``,price:0}]),children:`+ Add`}),(0,S.jsx)(`button`,{className:`btn btn-primary`,onClick:()=>{localStorage.setItem(`price_templates`,JSON.stringify(O)),a.success(`Price templates saved!`)},children:`Save`})]})]})]})]}),(0,S.jsx)(`style`,{jsx:!0,children:`
        .admin-sections-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .full-width { grid-column: 1 / -1; }

        .settings-card { padding: 28px; }

        .settings-head {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .settings-icon {
          width: 44px;
          height: 44px;
          background: var(--primary-light); color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 22px;
          flex-shrink: 0;
        }

        .settings-head h3 { font-size: 16px; margin-bottom: 2px; }
        .settings-head .text-dim { font-size: 12px; }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .settings-form.split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-field { display: flex; flex-direction: column; gap: 8px; }
        .form-field label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .full { grid-column: 1 / -1; }

        .form-actions { margin-top: 8px; display: flex; gap: 12px; }
        .form-actions-row { 
          display: flex; 
          justify-content: space-between; 
          margin-top: 20px; 
          padding-top: 20px; 
          border-top: 1px solid var(--border-glass);
          gap: 12px;
        }

        .table-inline-input {
          background: none;
          border: none;
          color: var(--text-bright);
          font-family: inherit;
          font-size: 14px;
          width: 100%;
          outline: none;
          padding: 8px 0;
        }

        .status-pill {
          margin-left: auto;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.05);
        }
        .status-pill.saved { color: #10b981; }
        .status-pill.unsaved { color: #f59e0b; }

        @media (max-width: 1024px) {
          .admin-sections-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .dashboard-header h1 { font-size: 22px; }
          .settings-card { padding: 20px; }
          .settings-head { flex-wrap: wrap; }
          .settings-icon { width: 42px; height: 42px; font-size: 20px; }
          .settings-form.split { grid-template-columns: 1fr; }
          .status-pill { margin-left: 0; width: 100%; text-align: center; padding: 6px; }
          .form-actions { flex-direction: column; }
          .form-actions .btn { width: 100%; justify-content: center; }
          .form-actions-row { flex-direction: column; }
          .form-actions-row .btn { width: 100%; justify-content: center; }
        }

        @media (max-width: 480px) {
          .settings-card { padding: 16px; }
          .settings-icon { width: 38px; height: 38px; font-size: 18px; }
          .settings-head h3 { font-size: 14px; }
        }
      `})]})}export{T as default};
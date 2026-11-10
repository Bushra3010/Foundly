import{r as e}from"./rolldown-runtime-Dw2cE7zH.js";import{g as t,h as n}from"./chart-vendor-DkeEVZ4C.js";import{t as r}from"./react-vendor-BBiLddrr.js";import{a as i,f as a}from"./supabase-BnTWxs4A.js";import{n as o,t as s}from"./auth-yM2NWTL9.js";import{t as c}from"./createLucideIcon-C6SyZXww.js";import{t as l}from"./circle-check-xDTn2fhk.js";import{t as u}from"./pencil-DlIbyMrK.js";import{t as d}from"./trash-CkEz8EeR.js";import{t as f}from"./user-round-D6766Aq7.js";import{t as p}from"./x-Dcrho5W6.js";import{t as m}from"./bcryptjs-cdfepbF7.js";var h={name:`ban`,size:24,node:[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`M4.929 4.929 19.07 19.071`,key:`196cmz`}]]};h.node;var g=c(h),_=e(t(),1),v=e(n(),1),y=r();function b({user:e,onSave:t,onClose:n}){let[r,i]=(0,_.useState)(e?{...e,password:``,permissions:e.permissions||{}}:{username:``,full_name:``,role:`Staff`,is_admin:!1,password:``,active:!0,permissions:{}}),[o,c]=(0,_.useState)(!1),l=e=>{i(t=>({...t,permissions:{...t.permissions,[e]:!t.permissions[e]}}))},u=e=>{let t={};s.forEach(n=>{t[n.key]=e}),i(e=>({...e,permissions:t}))};return(0,v.createPortal)((0,y.jsx)(`div`,{className:`modal-overlay`,onClick:n,children:(0,y.jsxs)(`div`,{className:`modal-content glass-card animate-fade`,onClick:e=>e.stopPropagation(),children:[(0,y.jsxs)(`div`,{className:`modal-header`,children:[(0,y.jsx)(`h3`,{children:e?`Edit User`:`Add User`}),(0,y.jsx)(`button`,{className:`modal-close-btn`,onClick:n,children:(0,y.jsx)(p,{size:16})})]}),(0,y.jsxs)(`div`,{className:`modal-body-custom`,children:[(0,y.jsxs)(`div`,{className:`form-row`,children:[(0,y.jsxs)(`div`,{className:`form-field`,children:[(0,y.jsx)(`label`,{children:`Username`}),(0,y.jsx)(`input`,{className:`glass-input`,value:r.username,onChange:e=>i({...r,username:e.target.value}),placeholder:`e.g. priya`,disabled:!!e})]}),(0,y.jsxs)(`div`,{className:`form-field`,children:[(0,y.jsx)(`label`,{children:`Full Name`}),(0,y.jsx)(`input`,{className:`glass-input`,value:r.full_name,onChange:e=>i({...r,full_name:e.target.value}),placeholder:`e.g. Priya Sharma`})]})]}),(0,y.jsxs)(`div`,{className:`form-row`,children:[(0,y.jsxs)(`div`,{className:`form-field`,children:[(0,y.jsx)(`label`,{children:`Role Label`}),(0,y.jsx)(`input`,{className:`glass-input`,value:r.role,onChange:e=>i({...r,role:e.target.value}),placeholder:`e.g. Sales Executive`})]}),(0,y.jsxs)(`div`,{className:`form-field`,children:[(0,y.jsx)(`label`,{children:e?`New Password (optional)`:`Password`}),(0,y.jsx)(`input`,{className:`glass-input`,type:`password`,value:r.password,onChange:e=>i({...r,password:e.target.value}),placeholder:e?`Leave blank to keep current`:`••••••••`})]})]}),(0,y.jsxs)(`label`,{className:`admin-toggle-row`,children:[(0,y.jsx)(`input`,{type:`checkbox`,checked:r.is_admin,onChange:e=>i({...r,is_admin:e.target.checked})}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`strong`,{children:`Full Admin Access`}),(0,y.jsx)(`p`,{className:`text-dim`,children:`Admins can access every module and manage other users.`})]})]}),!r.is_admin&&(0,y.jsxs)(`div`,{className:`permissions-block`,children:[(0,y.jsxs)(`div`,{className:`permissions-head`,children:[(0,y.jsx)(`label`,{children:`Module Access`}),(0,y.jsxs)(`div`,{className:`permissions-actions`,children:[(0,y.jsx)(`button`,{type:`button`,className:`link-btn`,onClick:()=>u(!0),children:`Select all`}),(0,y.jsx)(`button`,{type:`button`,className:`link-btn`,onClick:()=>u(!1),children:`Clear all`})]})]}),(0,y.jsx)(`div`,{className:`permissions-grid`,children:s.map(e=>(0,y.jsxs)(`label`,{className:`permission-chip`,children:[(0,y.jsx)(`input`,{type:`checkbox`,checked:!!r.permissions[e.key],onChange:()=>l(e.key)}),(0,y.jsx)(`span`,{children:e.label})]},e.key))})]}),(0,y.jsxs)(`label`,{className:`admin-toggle-row`,children:[(0,y.jsx)(`input`,{type:`checkbox`,checked:r.active,onChange:e=>i({...r,active:e.target.checked})}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`strong`,{children:`Active`}),(0,y.jsx)(`p`,{className:`text-dim`,children:`Inactive users cannot log in.`})]})]})]}),(0,y.jsxs)(`div`,{className:`modal-footer-custom`,children:[(0,y.jsx)(`button`,{className:`btn btn-ghost`,onClick:n,children:`Cancel`}),(0,y.jsx)(`button`,{className:`btn btn-primary`,onClick:async()=>{if(!r.username.trim()||!r.full_name.trim()){a.error(`Username and Full Name are required`);return}if(!e&&!r.password){a.error(`Password is required for a new user`);return}c(!0),await t(r),c(!1)},disabled:o,children:o?`Saving...`:`Save User`})]})]})}),document.body)}function x(){let[e,t]=(0,_.useState)([]),[n,r]=(0,_.useState)(!0),[s,c]=(0,_.useState)(``),[p,h]=(0,_.useState)(!1),[v,x]=(0,_.useState)(null),S=o(),C=async()=>{r(!0);let{data:e,error:n}=await i.from(`app_users`).select(`*`).order(`created_at`,{ascending:!1});n?(a.error(`Failed to load users`),console.error(n)):t(e||[]),r(!1)};(0,_.useEffect)(()=>{C()},[]);let w=async e=>{let t={username:e.username.trim(),full_name:e.full_name.trim(),role:e.role?.trim()||`Staff`,is_admin:!!e.is_admin,permissions:e.is_admin?{}:e.permissions,active:!!e.active};if(e.password&&(t.password_hash=m.hashSync(e.password,10)),v){let{error:e}=await i.from(`app_users`).update(t).eq(`id`,v.id);if(e){a.error(`Failed to update user`),console.error(e);return}a.success(`User updated`)}else{let{error:e}=await i.from(`app_users`).insert([t]);if(e){a.error(e.message?.includes(`duplicate`)?`Username already exists`:`Failed to create user`),console.error(e);return}a.success(`User created`),i.from(`audit_logs`).insert([{actor:S?.full_name||`Administrator`,action:`Create User`,details:`Created user account "${t.username}"`}])}await C(),x(null),h(!1)},T=async e=>{if(e.id===S?.id){a.error(`You can't deactivate your own account`);return}let{error:t}=await i.from(`app_users`).update({active:!e.active}).eq(`id`,e.id);t?(a.error(`Failed to update user`),console.error(t)):(a.success(e.active?`User deactivated`:`User activated`),await C())},E=async e=>{if(e.id===S?.id){a.error(`You can't delete your own account`);return}if(!window.confirm(`Delete user "${e.username}"? This cannot be undone.`))return;let{error:t}=await i.from(`app_users`).delete().eq(`id`,e.id);t?(a.error(`Failed to delete user`),console.error(t)):(a.success(`User deleted`),await C())},D=e.filter(e=>{let t=s.toLowerCase();return e.username?.toLowerCase().includes(t)||e.full_name?.toLowerCase().includes(t)||e.role?.toLowerCase().includes(t)});return(0,y.jsxs)(`div`,{className:`users-page`,children:[(0,y.jsxs)(`div`,{className:`users-header`,children:[(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`h1`,{className:`text-gradient`,children:`Users & Roles`}),(0,y.jsxs)(`p`,{className:`text-muted`,children:[e.length,` accounts • control who can access what`]})]}),(0,y.jsx)(`button`,{className:`btn btn-primary`,onClick:()=>h(!0),children:`+ Add User`})]}),(0,y.jsx)(`div`,{className:`filter-row`,children:(0,y.jsx)(`input`,{className:`glass-input search-input`,placeholder:`Search by username, name or role...`,value:s,onChange:e=>c(e.target.value)})}),n?(0,y.jsx)(`div`,{className:`loading-state`,children:(0,y.jsx)(`div`,{className:`spinner`})}):(0,y.jsx)(`div`,{className:`glass-card users-table-card`,children:D.length===0?(0,y.jsxs)(`div`,{className:`empty-state`,children:[(0,y.jsx)(`div`,{className:`empty-state-icon`,children:(0,y.jsx)(f,{size:26,strokeWidth:1.6})}),(0,y.jsx)(`h3`,{children:`No users found`}),(0,y.jsx)(`p`,{children:`Add your first team member to get started`})]}):(0,y.jsx)(`div`,{className:`users-table-scroll`,children:(0,y.jsxs)(`table`,{className:`modern-table`,children:[(0,y.jsx)(`thead`,{children:(0,y.jsxs)(`tr`,{children:[(0,y.jsx)(`th`,{children:`User`}),(0,y.jsx)(`th`,{children:`Role`}),(0,y.jsx)(`th`,{children:`Access`}),(0,y.jsx)(`th`,{children:`Status`}),(0,y.jsx)(`th`,{style:{textAlign:`right`},children:`Actions`})]})}),(0,y.jsx)(`tbody`,{children:D.map(e=>{let t=Object.values(e.permissions||{}).filter(Boolean).length;return(0,y.jsxs)(`tr`,{children:[(0,y.jsx)(`td`,{children:(0,y.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:10},children:[(0,y.jsx)(`div`,{style:{width:32,height:32,borderRadius:`50%`,background:`var(--primary)`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:12,fontWeight:800,flexShrink:0,color:`#fff`},children:(e.full_name||e.username||`?`).slice(0,2).toUpperCase()}),(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`},children:[(0,y.jsx)(`span`,{style:{fontWeight:700,fontSize:13.5},children:e.full_name}),(0,y.jsxs)(`span`,{style:{fontSize:11.5,color:`var(--text-dim)`},children:[`@`,e.username]}),!1]})]})}),(0,y.jsx)(`td`,{children:e.role||`—`}),(0,y.jsx)(`td`,{children:e.is_admin?(0,y.jsx)(`span`,{className:`access-badge admin`,children:`Full Admin`}):(0,y.jsxs)(`span`,{className:`access-badge`,children:[t,` module`,t===1?``:`s`]})}),(0,y.jsx)(`td`,{children:(0,y.jsx)(`span`,{className:`status-dot-pill ${e.active?`active`:`inactive`}`,children:e.active?`Active`:`Inactive`})}),(0,y.jsx)(`td`,{children:(0,y.jsxs)(`div`,{style:{display:`flex`,gap:6,justifyContent:`flex-end`},children:[(0,y.jsx)(`button`,{className:`icon-action`,onClick:()=>x(e),title:`Edit`,children:(0,y.jsx)(u,{size:15})}),(0,y.jsx)(`button`,{className:`icon-action`,onClick:()=>T(e),title:e.active?`Deactivate`:`Activate`,children:e.active?(0,y.jsx)(g,{size:15}):(0,y.jsx)(l,{size:15})}),(0,y.jsx)(`button`,{className:`icon-action danger`,onClick:()=>E(e),title:`Delete`,children:(0,y.jsx)(d,{size:15})})]})})]},e.id)})})]})})}),(p||v)&&(0,y.jsx)(b,{user:v,onSave:w,onClose:()=>{h(!1),x(null)}}),(0,y.jsx)(`style`,{jsx:!0,children:`
        .users-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
          gap: 16px;
        }
        .users-header h1 { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
        .users-header .btn { white-space: nowrap; }

        .filter-row { margin-bottom: 20px; }
        .search-input { max-width: 300px; }

        .users-table-card { padding: 0; overflow: hidden; }
        .users-table-scroll { overflow-x: auto; }

        .access-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          background: #EFF6FF;
          color: #2563EB;
          white-space: nowrap;
        }
        .access-badge.admin { background: #FEF3C7; color: #92400E; }

        .status-dot-pill {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .status-dot-pill.active { background: #D1FAE5; color: #065F46; }
        .status-dot-pill.inactive { background: #FEE2E2; color: #991B1B; }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .modal-content {
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-glass);
        }
        .modal-header h3 { font-size: 18px; font-weight: 800; }
        .modal-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #F1F5F9;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          font-size: 14px;
        }
        .modal-close-btn:hover {
          background: rgba(239,68,68,0.2);
          color: #ef4444;
        }
        .modal-body-custom {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-field label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .modal-footer-custom {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid var(--border-glass);
          background: #F8FAFC;
        }

        .admin-toggle-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          border-radius: 12px;
          background: #F8FAFC;
          border: 1px solid var(--border-glass);
          cursor: pointer;
        }
        .admin-toggle-row input { margin-top: 3px; width: 16px; height: 16px; flex-shrink: 0; }
        .admin-toggle-row strong { font-size: 13px; }
        .admin-toggle-row .text-dim { font-size: 11.5px; margin-top: 2px; }

        .permissions-block {
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 14px;
        }
        .permissions-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .permissions-head label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .permissions-actions { display: flex; gap: 12px; }
        .link-btn {
          background: none;
          border: none;
          color: #2563EB;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }
        .permissions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .permission-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 8px;
          background: #F8FAFC;
          border: 1px solid var(--border-glass);
          font-size: 12.5px;
          cursor: pointer;
        }
        .permission-chip input { width: 14px; height: 14px; flex-shrink: 0; }

        @media (max-width: 768px) {
          .users-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .users-header h1 { font-size: 22px; }
          .users-header .btn { width: 100%; justify-content: center; }
          .search-input { max-width: 100%; }
          .form-row { grid-template-columns: 1fr; }
          .permissions-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `})]})}export{x as default};
import{r as e}from"./rolldown-runtime-Dw2cE7zH.js";import{g as t}from"./chart-vendor-DkeEVZ4C.js";import{t as n}from"./react-vendor-BBiLddrr.js";import{a as r,f as i}from"./supabase-BnTWxs4A.js";import{t as a}from"./scroll-text-oSmEPev-.js";import{t as o}from"./x-Dcrho5W6.js";var s=e(t(),1),c=n();function l({onSave:e,onClose:t}){let[n,r]=(0,s.useState)({action:``,details:``});return(0,c.jsx)(`div`,{className:`modal-overlay`,onClick:t,children:(0,c.jsxs)(`div`,{className:`modal-content glass-card animate-fade`,onClick:e=>e.stopPropagation(),children:[(0,c.jsxs)(`div`,{className:`modal-header`,children:[(0,c.jsx)(`h3`,{children:`Add Note`}),(0,c.jsx)(`button`,{className:`modal-close-btn`,onClick:t,children:(0,c.jsx)(o,{size:16})})]}),(0,c.jsxs)(`div`,{className:`modal-body-custom`,children:[(0,c.jsxs)(`div`,{className:`form-field`,children:[(0,c.jsx)(`label`,{children:`Action`}),(0,c.jsx)(`input`,{className:`glass-input`,value:n.action,onChange:e=>r({...n,action:e.target.value}),placeholder:`e.g. Manual check`})]}),(0,c.jsxs)(`div`,{className:`form-field`,children:[(0,c.jsx)(`label`,{children:`Details`}),(0,c.jsx)(`textarea`,{className:`glass-input`,rows:4,value:n.details,onChange:e=>r({...n,details:e.target.value}),placeholder:`Describe what happened...`})]})]}),(0,c.jsxs)(`div`,{className:`modal-footer-custom`,children:[(0,c.jsx)(`button`,{className:`btn btn-ghost`,onClick:t,children:`Cancel`}),(0,c.jsx)(`button`,{className:`btn btn-primary`,onClick:()=>{if(!n.action.trim()){i.error(`Action is required`);return}e(n)},children:`Save Note`})]})]})})}function u(){let[e,t]=(0,s.useState)([]),[n,o]=(0,s.useState)(!0),[u,d]=(0,s.useState)(``),[f,p]=(0,s.useState)(!1),m=async()=>{o(!0);let{data:e,error:n}=await r.from(`audit_logs`).select(`*`).order(`created_at`,{ascending:!1}).limit(200);n?i.error(`Failed to load audit logs`):t(e||[]),o(!1)};(0,s.useEffect)(()=>{m()},[]);let h=async e=>{let{error:t}=await r.from(`audit_logs`).insert([{actor:`Administrator`,action:e.action,details:e.details}]);if(t){i.error(`Failed to add note`);return}i.success(`Note added`),await m()},g=async e=>{await h(e),p(!1)},_=e.filter(e=>{let t=u.toLowerCase();return(e.action||``).toLowerCase().includes(t)||(e.details||``).toLowerCase().includes(t)});return(0,c.jsxs)(`div`,{className:`audit-dashboard`,children:[(0,c.jsxs)(`div`,{className:`audit-header`,children:[(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`h1`,{className:`text-gradient`,children:`Audit Logs`}),(0,c.jsxs)(`p`,{className:`text-muted`,children:[e.length,` events recorded`]})]}),(0,c.jsx)(`button`,{className:`btn btn-primary`,onClick:()=>p(!0),children:`+ Add Note`})]}),(0,c.jsx)(`div`,{className:`filter-row`,children:(0,c.jsx)(`input`,{className:`glass-input search-input`,placeholder:`Search by action or details...`,value:u,onChange:e=>d(e.target.value)})}),n?(0,c.jsx)(`div`,{className:`loading-state`,children:(0,c.jsx)(`div`,{className:`spinner`})}):(0,c.jsx)(`div`,{className:`glass-card audit-table-card`,children:_.length===0?(0,c.jsxs)(`div`,{className:`empty-state`,children:[(0,c.jsx)(`div`,{className:`empty-state-icon`,children:(0,c.jsx)(a,{size:26,strokeWidth:1.6})}),(0,c.jsx)(`h3`,{children:`No audit events found`}),(0,c.jsx)(`p`,{children:`Logins and system activity will appear here`})]}):(0,c.jsx)(`div`,{className:`audit-table-scroll`,children:(0,c.jsxs)(`table`,{className:`modern-table`,children:[(0,c.jsx)(`thead`,{children:(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`th`,{children:`Actor`}),(0,c.jsx)(`th`,{children:`Action`}),(0,c.jsx)(`th`,{children:`Details`}),(0,c.jsx)(`th`,{children:`Timestamp`})]})}),(0,c.jsx)(`tbody`,{children:_.map(e=>(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:e.actor||`—`}),(0,c.jsx)(`td`,{style:{fontWeight:700},children:e.action}),(0,c.jsx)(`td`,{className:`details-cell`,children:e.details||`—`}),(0,c.jsx)(`td`,{style:{whiteSpace:`nowrap`},children:e.created_at?new Date(e.created_at).toLocaleString(`en-IN`,{dateStyle:`medium`,timeStyle:`short`}):`—`})]},e.id))})]})})}),f&&(0,c.jsx)(l,{onSave:g,onClose:()=>p(!1)}),(0,c.jsx)(`style`,{jsx:!0,children:`
        .audit-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
          gap: 16px;
        }
        .audit-header h1 { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
        .audit-header .btn { white-space: nowrap; }

        .filter-row { margin-bottom: 20px; }
        .search-input { max-width: 320px; }

        .audit-table-card { padding: 0; overflow: hidden; }
        .audit-table-scroll { overflow-x: auto; }

        .details-cell {
          max-width: 320px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--text-dim);
        }

        .empty-state {
          padding: 48px 20px;
          text-align: center;
        }
        .empty-state-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state h3 { font-size: 18px; margin-bottom: 6px; }
        .empty-state p { color: var(--text-dim); }

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
          max-width: 500px;
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

        @media (max-width: 768px) {
          .audit-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .audit-header h1 { font-size: 22px; }
          .audit-header .btn { width: 100%; justify-content: center; }

          .modal-content { max-height: 95vh; }
          .modal-header { padding: 16px 20px; }
          .modal-header h3 { font-size: 16px; }
          .modal-body-custom { padding: 16px 20px; }
          .modal-footer-custom { padding: 12px 20px; }
        }
      `})]})}export{u as default};
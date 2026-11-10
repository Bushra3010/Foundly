import{r as e}from"./rolldown-runtime-Dw2cE7zH.js";import{g as t}from"./chart-vendor-DkeEVZ4C.js";import{t as n,u as r}from"./react-vendor-BBiLddrr.js";import{f as i}from"./supabase-BnTWxs4A.js";import{t as a}from"./brand-D8FDglYg.js";import{a as o,r as s}from"./BookingContext-BUOXFy00.js";var c=e(t(),1),l=n(),u=e=>`₹${Number(e||0).toLocaleString(`en-IN`)}`;function d(){let{token:e}=r(),{fetchBookingByToken:t,updateFromPublicForm:n,recordPayment:d}=s(),[f,p]=(0,c.useState)(null),[m,h]=(0,c.useState)(!0),[g,_]=(0,c.useState)(!1),[v,y]=(0,c.useState)(`form`),[b,x]=(0,c.useState)(!1),[S,C]=(0,c.useState)(null),[w,T]=(0,c.useState)({customer_name:``,customer_email:``,customer_phone:``,customer_whatsapp:``,adults:1,children:0,infants:0,travel_date:``,return_date:``}),E=(e,t)=>T(n=>({...n,[e]:t}));(0,c.useEffect)(()=>{t(e).then(e=>{if(!e){_(!0),h(!1);return}p(e),T({customer_name:e.customer_name||``,customer_email:e.customer_email||``,customer_phone:e.customer_phone||``,customer_whatsapp:e.customer_whatsapp||``,adults:e.adults||1,children:e.children||0,infants:e.infants||0,travel_date:e.travel_date||``,return_date:e.return_date||``}),h(!1)})},[e,t]);let D=f?Number(f.total_amount):0,O=f?Number(f.advance_percent||20):20,k=Math.round(D*O/100),A=D-k;return m?(0,l.jsx)(`div`,{className:`public-loading`,children:(0,l.jsx)(`div`,{className:`spinner`})}):g?(0,l.jsx)(`div`,{className:`public-canvas`,children:(0,l.jsxs)(`div`,{className:`glass-card error-box`,children:[(0,l.jsx)(`h2`,{children:`Link Expired`}),(0,l.jsxs)(`p`,{children:[`Please contact `,a.name,` for a new booking link.`]})]})}):(0,l.jsxs)(`div`,{className:`public-canvas`,children:[(0,l.jsxs)(`div`,{className:`branding-top`,children:[(0,l.jsx)(`img`,{src:a.logo,alt:a.legalName,style:{height:64,width:`auto`,margin:`0 auto 6px`,display:`block`}}),(0,l.jsx)(`p`,{children:`Personalized Booking Desk`})]}),(0,l.jsx)(({current:e})=>(0,l.jsxs)(`div`,{className:`step-bar`,children:[(0,l.jsx)(`div`,{className:`step-dot ${v===`form`?`active`:`done`}`,children:`1`}),(0,l.jsx)(`div`,{className:`step-line`}),(0,l.jsx)(`div`,{className:`step-dot ${v===`summary`?`active`:v===`paid`?`done`:``}`,children:`2`}),(0,l.jsx)(`div`,{className:`step-line`}),(0,l.jsx)(`div`,{className:`step-dot ${v===`paid`?`active`:``}`,children:`3`})]}),{}),(0,l.jsxs)(`div`,{className:`public-content-wrap`,children:[v===`form`&&(0,l.jsxs)(`div`,{className:`form-scene animate-in`,children:[(0,l.jsx)(`div`,{className:`glass-card pkg-summary-card`,children:(0,l.jsxs)(`div`,{className:`pkg-info`,children:[(0,l.jsx)(`span`,{className:`badge`,children:`Limited Offer`}),(0,l.jsx)(`h2`,{children:f.packages?.title||`Custom Tour`}),(0,l.jsx)(`div`,{className:`price-tag-big`,children:u(D)})]})}),(0,l.jsxs)(`form`,{className:`glass-card main-booking-form`,onSubmit:async t=>{t.preventDefault();let r=await n(e,{...w,adults:parseInt(w.adults),children:parseInt(w.children),infants:parseInt(w.infants)});r&&p(r),y(`summary`)},children:[(0,l.jsx)(`h3`,{children:`Passenger Information`}),(0,l.jsxs)(`div`,{className:`input-row`,children:[(0,l.jsxs)(`div`,{className:`field`,children:[(0,l.jsx)(`label`,{children:`Full Name`}),(0,l.jsx)(`input`,{required:!0,className:`glass-input`,value:w.customer_name,onChange:e=>E(`customer_name`,e.target.value)})]}),(0,l.jsxs)(`div`,{className:`field`,children:[(0,l.jsx)(`label`,{children:`Email`}),(0,l.jsx)(`input`,{required:!0,className:`glass-input`,type:`email`,value:w.customer_email,onChange:e=>E(`customer_email`,e.target.value)})]})]}),(0,l.jsxs)(`div`,{className:`input-row`,children:[(0,l.jsxs)(`div`,{className:`field`,children:[(0,l.jsx)(`label`,{children:`Phone`}),(0,l.jsx)(`input`,{required:!0,className:`glass-input`,value:w.customer_phone,onChange:e=>E(`customer_phone`,e.target.value)})]}),(0,l.jsxs)(`div`,{className:`field`,children:[(0,l.jsx)(`label`,{children:`WhatsApp`}),(0,l.jsx)(`input`,{className:`glass-input`,value:w.customer_whatsapp,onChange:e=>E(`customer_whatsapp`,e.target.value)})]})]}),(0,l.jsxs)(`div`,{className:`input-row split-3`,children:[(0,l.jsxs)(`div`,{className:`field`,children:[(0,l.jsx)(`label`,{children:`Adults`}),(0,l.jsx)(`input`,{className:`glass-input`,type:`number`,min:`1`,value:w.adults,onChange:e=>E(`adults`,e.target.value)})]}),(0,l.jsxs)(`div`,{className:`field`,children:[(0,l.jsx)(`label`,{children:`Children`}),(0,l.jsx)(`input`,{className:`glass-input`,type:`number`,min:`0`,value:w.children,onChange:e=>E(`children`,e.target.value)})]}),(0,l.jsxs)(`div`,{className:`field`,children:[(0,l.jsx)(`label`,{children:`Infants`}),(0,l.jsx)(`input`,{className:`glass-input`,type:`number`,min:`0`,value:w.infants,onChange:e=>E(`infants`,e.target.value)})]})]}),(0,l.jsx)(`button`,{type:`submit`,className:`btn btn-primary full-btn`,children:`Confirm Details →`})]})]}),v===`summary`&&(0,l.jsx)(`div`,{className:`summary-scene animate-in`,children:(0,l.jsxs)(`div`,{className:`glass-card summary-card`,children:[(0,l.jsx)(`h2`,{children:`Total Summary`}),(0,l.jsxs)(`div`,{className:`summary-list`,children:[(0,l.jsxs)(`div`,{className:`sum-row`,children:[(0,l.jsx)(`span`,{children:`Total Package Cost`}),(0,l.jsx)(`span`,{children:u(D)})]}),(0,l.jsxs)(`div`,{className:`sum-row highlight`,children:[(0,l.jsx)(`span`,{children:`Advance to Pay (Now)`}),(0,l.jsx)(`span`,{children:u(k)})]}),(0,l.jsxs)(`div`,{className:`sum-row`,children:[(0,l.jsx)(`span`,{children:`Remaining Balance`}),(0,l.jsx)(`span`,{children:u(A)})]})]}),(0,l.jsxs)(`div`,{className:`summary-actions`,children:[(0,l.jsx)(`button`,{className:`btn btn-primary full-btn`,onClick:async()=>{i.error(`Payment system offline. Please contact us.`)},disabled:b,children:b?`Processing...`:`Pay ${u(k)} Now`}),(0,l.jsx)(`button`,{className:`btn btn-ghost`,onClick:()=>y(`form`),children:`← Edit Details`})]})]})}),v===`paid`&&S&&(0,l.jsx)(`div`,{className:`success-scene animate-in`,children:(0,l.jsxs)(`div`,{className:`glass-card success-card`,children:[(0,l.jsx)(`div`,{className:`check-icon`,children:`✓`}),(0,l.jsx)(`h2`,{children:`Payment Received!`}),(0,l.jsx)(`div`,{className:`ref-number`,children:f.booking_ref}),(0,l.jsxs)(`div`,{className:`receipt-box`,children:[(0,l.jsxs)(`div`,{className:`receipt-row`,children:[(0,l.jsx)(`span`,{children:`Total Package`}),(0,l.jsx)(`span`,{children:u(D)})]}),(0,l.jsxs)(`div`,{className:`receipt-row receipt-paid-now`,children:[(0,l.jsx)(`span`,{children:`✅ Paid Now`}),(0,l.jsx)(`strong`,{children:u(S.justPaid)})]}),(0,l.jsxs)(`div`,{className:`receipt-row`,children:[(0,l.jsx)(`span`,{children:`Total Paid`}),(0,l.jsx)(`span`,{style:{color:`#10b981`,fontWeight:700},children:u(S.newPaidTotal)})]}),(0,l.jsxs)(`div`,{className:`receipt-row receipt-balance`,children:[(0,l.jsx)(`span`,{children:S.newBalance<=0?`🎉 Fully Paid`:`⏳ Balance Due`}),(0,l.jsx)(`strong`,{children:u(S.newBalance)})]})]}),w.customer_email&&(0,l.jsxs)(`p`,{style:{fontSize:13,opacity:.7,margin:`12px 0 0`},children:[`Receipt sent to `,w.customer_email]}),(0,l.jsx)(`button`,{className:`btn btn-primary full-btn`,style:{marginTop:20},onClick:()=>o(f,S.justPaid,S.newPaidTotal,S.newBalance),children:`🖨️ Print / Download Receipt`})]})})]}),(0,l.jsx)(`style`,{jsx:!0,children:`
        .public-canvas {
          min-height: 100vh;
          background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2000');
          background-size: cover;
          background-position: center;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
        }

        .branding-top { text-align: center; margin-bottom: 40px; }
        .branding-top h3 { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }

        .step-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 40px; }
        .step-dot { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: rgba(255,255,255,0.4); }
        .step-dot.active { border-color: var(--primary); color: var(--primary); background: rgba(99, 102, 241, 0.1); }
        .step-dot.done { border-color: #10b981; color: #10b981; background: rgba(16, 185, 129, 0.1); }
        .step-line { width: 40px; height: 2px; background: rgba(255,255,255,0.1); }

        .public-content-wrap { width: 100%; max-width: 600px; }
        .animate-in { animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1); }

        .pkg-summary-card { padding: 32px; margin-bottom: 24px; text-align: center; }
        .price-tag-big { font-size: 40px; font-weight: 900; color: var(--primary); margin-top: 12px; }

        .main-booking-form { padding: 40px; }
        .main-booking-form h3 { margin-bottom: 30px; font-size: 20px; font-weight: 800; border-bottom: 1px solid var(--border-glass); padding-bottom: 12px; }

        .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .input-row.split-3 { grid-template-columns: 1fr 1fr 1fr; }
        
        .field { display: flex; flex-direction: column; gap: 8px; }
        .field label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

        .full-btn { padding: 16px; font-size: 16px; margin-top: 20px; }

        .summary-card { padding: 40px; text-align: center; }
        .summary-list { margin: 32px 0; display: flex; flex-direction: column; gap: 16px; }
        .sum-row { display: flex; justify-content: space-between; font-size: 15px; }
        .sum-row.highlight { color: #10b981; font-weight: 800; font-size: 18px; padding: 12px 0; border-top: 1px solid var(--border-glass); border-bottom: 1px solid var(--border-glass); }

        .success-card { padding: 40px; text-align: center; }
        .check-icon { width: 80px; height: 80px; background: #10b981; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; margin: 0 auto 24px; animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .ref-number { background: rgba(255,255,255,0.05); padding: 10px 20px; border-radius: 12px; font-family: var(--mono); font-weight: 800; font-size: 18px; margin: 16px 0; color: var(--primary); }
        .receipt-box { background: rgba(255,255,255,0.05); border-radius: 14px; padding: 16px 20px; margin: 16px 0 0; text-align: left; display: flex; flex-direction: column; gap: 10px; }
        .receipt-row { display: flex; justify-content: space-between; font-size: 14px; color: rgba(255,255,255,0.75); }
        .receipt-paid-now { background: rgba(16,185,129,0.15); padding: 8px 12px; border-radius: 8px; font-size: 15px; color: #10b981; }
        .receipt-balance { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; font-size: 15px; color: #f59e0b; }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pop { from { scale: 0.5; opacity: 0; } to { scale: 1; opacity: 1; } }

        @media (max-width: 600px) {
          .input-row { grid-template-columns: 1fr; }
        }
      `})]})}export{d as default};
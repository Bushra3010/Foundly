import{r as e}from"./rolldown-runtime-Dw2cE7zH.js";import{g as t}from"./chart-vendor-DkeEVZ4C.js";import{t as n}from"./react-vendor-BBiLddrr.js";import{a as r,f as i}from"./supabase-BnTWxs4A.js";import{n as a,t as o}from"./brand-D8FDglYg.js";var s=e(t(),1);async function c(e){return{skipped:!0}}function l(e,t=[]){let n=e=>`₹${Number(e||0).toLocaleString(`en-IN`)}`,r=t.reduce((e,t)=>e+Number(t.amount||0),0),i=Math.max(0,Number(e.total_amount||0)-r);return`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Inter, Arial, sans-serif; background: #F1F5F9; margin: 0; padding: 20px; color: #0F172A; }
    .wrap { max-width: 620px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg,#0D2A7D,#061B5C); padding: 32px; color: #fff; }
    .header h1 { margin: 0 0 4px; font-size: 22px; font-weight: 900; }
    .header p  { margin: 0; opacity: 0.85; font-size: 14px; }
    .section   { padding: 24px 32px; border-bottom: 1px solid #E2E8F0; }
    .section:last-child { border-bottom: none; }
    .section-title { font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px; }
    .row  { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .row .label { color: #64748B; }
    .row .value { font-weight: 700; }
    .amount-box { background: #F8FAFC; border-radius: 12px; padding: 16px 20px; margin-top: 8px; }
    .amount-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #E2E8F0; font-size: 14px; }
    .amount-row:last-child { border-bottom: none; padding-top: 10px; }
    .total-row { font-size: 16px; font-weight: 900; color: #0D2A7D; }
    .balance { font-size: 15px; font-weight: 800; color: #F59E0B; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; }
    .paid  { background: #D1FAE5; color: #059669; }
    .due   { background: #FEF3C7; color: #D97706; }
    .footer { background: #F8FAFC; padding: 20px 32px; text-align: center; font-size: 12px; color: #94A3B8; }
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>✈️ Booking Confirmed!</h1>
    <p>Booking Ref: <strong>${e.booking_ref||`—`}</strong></p>
  </div>

  <div class="section">
    <div class="section-title">Dear ${e.customer_name||`Traveller`},</div>
    <p style="font-size:14px;color:#334155;line-height:1.7;margin:0">
      Your tour booking with <strong>${o.name}</strong> has been confirmed.
      We're excited to plan your perfect trip! Below are your booking details.
    </p>
  </div>

  <div class="section">
    <div class="section-title">Trip Details</div>
    <div class="row"><span class="label">Destination</span><span class="value">${e.destination||`—`}</span></div>
    <div class="row"><span class="label">Travel Date</span><span class="value">${e.travel_date?new Date(e.travel_date).toLocaleDateString(`en-IN`,{day:`numeric`,month:`long`,year:`numeric`}):`—`}</span></div>
    <div class="row"><span class="label">Return Date</span><span class="value">${e.return_date?new Date(e.return_date).toLocaleDateString(`en-IN`,{day:`numeric`,month:`long`,year:`numeric`}):`—`}</span></div>
    <div class="row"><span class="label">Pax</span><span class="value">${e.adults||0} Adults${e.children?`, ${e.children} Children`:``}${e.infants?`, ${e.infants} Infants`:``}</span></div>
  </div>

  <div class="section">
    <div class="section-title">Payment Summary</div>
    <div class="amount-box">
      <div class="amount-row"><span>Total Package Amount</span><span style="font-weight:700">${n(e.total_amount)}</span></div>
      <div class="amount-row"><span>Advance Paid (${e.advance_percent||20}%)</span><span style="font-weight:700;color:#10B981">${n(e.advance_amount)}</span></div>
      ${t.length>0?`<div class="amount-row"><span>Total Paid</span><span style="font-weight:700;color:#10B981">${n(r)}</span></div>`:``}
      <div class="amount-row total-row"><span>Balance Due</span><span class="balance">${n(i)}</span></div>
    </div>
    <div style="margin-top:12px;text-align:center">
      <span class="badge ${i>0?`due`:`paid`}">${i>0?`⏳ Balance Due: ${n(i)}`:`✅ Fully Paid`}</span>
    </div>
  </div>

  <div class="footer">
    <strong>${o.name}</strong><br/>
    ${e.company_addr||o.address}<br/>
    📞 ${e.company_phone||o.phone} &nbsp;|&nbsp; ✉ ${e.company_email||o.email}<br/><br/>
    <em>Thank you for choosing ${o.name}. We'll be in touch soon!</em>
  </div>
</div>
</body>
</html>`}function u(e,t,n,r){let i=e=>`₹${Number(e||0).toLocaleString(`en-IN`)}`,a=r<=0,s=new Date().toLocaleDateString(`en-IN`,{day:`numeric`,month:`long`,year:`numeric`,hour:`2-digit`,minute:`2-digit`});return`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Payment Receipt — ${e.booking_ref}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, Arial, sans-serif; background: #F1F5F9; color: #0F172A; padding: 20px; }
    .wrap { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg,#0D2A7D,#061B5C); padding: 32px; color: #fff; text-align: center; }
    .header h1 { font-size: 28px; font-weight: 900; margin-bottom: 4px; }
    .header p  { opacity: 0.85; font-size: 14px; }
    .check { width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto 16px; }
    .section { padding: 24px 32px; border-bottom: 1px solid #E2E8F0; }
    .section:last-of-type { border-bottom: none; }
    .sec-title { font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .row .label { color: #64748B; }
    .row .val { font-weight: 700; }
    .amount-box { background: #F8FAFC; border-radius: 12px; padding: 16px 20px; }
    .a-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0; font-size: 14px; }
    .a-row:last-child { border-bottom: none; padding-top: 12px; }
    .paid-now { color: #10B981; font-weight: 800; font-size: 20px; }
    .balance   { color: #F59E0B; font-weight: 800; font-size: 18px; }
    .fully-paid { color: #059669; font-weight: 800; font-size: 18px; }
    .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-top: 12px; }
    .badge-due  { background: #FEF3C7; color: #D97706; }
    .badge-paid { background: #D1FAE5; color: #059669; }
    .ref-box { background: #EEF2FF; border-radius: 10px; padding: 12px 20px; text-align: center; margin-top: 16px; }
    .ref-num { font-size: 18px; font-weight: 900; color: #0D2A7D; letter-spacing: 1px; }
    .footer { background: #F8FAFC; padding: 20px 32px; text-align: center; font-size: 12px; color: #94A3B8; }
    @media print {
      body { background: white; padding: 0; }
      .wrap { box-shadow: none; border-radius: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="check">✓</div>
    <h1>Payment Received!</h1>
    <p>${s}</p>
  </div>

  <div class="section">
    <div class="sec-title">Dear ${e.customer_name||`Traveller`},</div>
    <p style="font-size:14px;color:#334155;line-height:1.7">
      Thank you for your payment! Here is your receipt for the booking with <strong>${o.name}</strong>.
    </p>
    <div class="ref-box">
      <div style="font-size:11px;font-weight:700;color:#061B5C;margin-bottom:4px">BOOKING REFERENCE</div>
      <div class="ref-num">${e.booking_ref||`—`}</div>
    </div>
  </div>

  <div class="section">
    <div class="sec-title">Trip Details</div>
    <div class="row"><span class="label">Destination</span><span class="val">${e.destination||`—`}</span></div>
    <div class="row"><span class="label">Travel Date</span><span class="val">${e.travel_date?new Date(e.travel_date).toLocaleDateString(`en-IN`,{day:`numeric`,month:`long`,year:`numeric`}):`—`}</span></div>
    <div class="row"><span class="label">Passengers</span><span class="val">${e.adults||0} Adults${e.children?`, ${e.children} Children`:``}${e.infants?`, ${e.infants} Infants`:``}</span></div>
  </div>

  <div class="section">
    <div class="sec-title">Payment Summary</div>
    <div class="amount-box">
      <div class="a-row"><span>Total Package Amount</span><span style="font-weight:700">${i(e.total_amount)}</span></div>
      <div class="a-row" style="background:#F0FDF4;margin:0 -4px;padding:8px 4px;border-radius:6px">
        <span style="font-weight:700">✅ Amount Paid (This Payment)</span>
        <span class="paid-now">${i(t)}</span>
      </div>
      <div class="a-row"><span>Total Paid So Far</span><span style="font-weight:700;color:#10B981">${i(n)}</span></div>
      <div class="a-row">
        <span style="font-weight:800">${a?`🎉 Fully Paid`:`⏳ Balance Remaining`}</span>
        <span class="${a?`fully-paid`:`balance`}">${i(r)}</span>
      </div>
    </div>
    <div style="text-align:center">
      <span class="badge ${a?`badge-paid`:`badge-due`}">
        ${a?`✅ Trip Fully Confirmed!`:`⏳ Balance Due at Check-in: ${i(r)}`}
      </span>
    </div>
  </div>

  <div class="footer">
    <strong>${o.name}</strong><br/>
    ${e.company_addr||o.address}<br/>
    📞 ${e.company_phone||o.phone} &nbsp;|&nbsp; ✉ ${e.company_email||o.email}<br/><br/>
    <em>Please save this receipt for your records. Thank you for choosing ${o.name}! ✈️</em>
  </div>
</div>
</body>
</html>`}function d(e,t=[]){let n=l(e,t),r=window.open(``,`_blank`,`width=700,height=900`);r.document.write(n),r.document.close(),setTimeout(()=>{r.focus(),r.print()},500)}function f(e,t,n,r){let i=u(e,t,n,r),a=window.open(``,`_blank`,`width=700,height=900`);a.document.write(i),a.document.close(),setTimeout(()=>{a.focus(),a.print()},500)}async function p(e,t,n,r,i=null){return c({type:`payment`,booking:e,payment:i||{amount:t},justPaid:t,newPaidTotal:n,newBalance:r})}async function m(e,t=[]){let n=t.reduce((e,t)=>e+Number(t.amount||0),0);return c({type:`invoice`,booking:e,justPaid:n,newPaidTotal:n,newBalance:Math.max(0,Number(e.total_amount||0)-n)})}async function h(e){return c({type:`new_booking`,booking:e,justPaid:0,newPaidTotal:0,newBalance:Number(e.total_amount||0)})}var g=n(),_=(0,s.createContext)(null),v=[{id:`confirmed`,label:`Confirmed`,color:`#4F6EF7`,bg:`#EEF2FF`,emoji:`✅`},{id:`advance_paid`,label:`Advance Paid`,color:`#10B981`,bg:`#ECFDF5`,emoji:`💰`},{id:`balance_due`,label:`Balance Due`,color:`#F59E0B`,bg:`#FFFBEB`,emoji:`⏳`},{id:`fully_paid`,label:`Fully Paid`,color:`#059669`,bg:`#D1FAE5`,emoji:`🎉`},{id:`completed`,label:`Completed`,color:`#64748B`,bg:`#F1F5F9`,emoji:`🏁`},{id:`cancelled`,label:`Cancelled`,color:`#EF4444`,bg:`#FEE2E2`,emoji:`❌`}];async function y(e){let{data:t}=await r.from(`bookings`).select(`booking_ref`),n=(t||[]).reduce((e,t)=>{let n=Number((String(t.booking_ref||``).match(/(\d+)$/)||[])[1]);return n&&n<1e6?Math.max(e,n):e},0);return a({destination:e.destination,travelDate:e.travel_date,seq:n+1})}var b={bookings:[],currentBooking:null,payments:[],loading:!1,saving:!1};function x(e,t){switch(t.type){case`SET_BOOKINGS`:return{...e,bookings:t.payload};case`ADD_BOOKING`:return{...e,bookings:[t.payload,...e.bookings]};case`UPD_BOOKING`:return{...e,bookings:e.bookings.map(e=>e.id===t.payload.id?t.payload:e),currentBooking:e.currentBooking?.id===t.payload.id?t.payload:e.currentBooking};case`SET_CURRENT`:return{...e,currentBooking:t.payload};case`DEL_BOOKING`:return{...e,bookings:e.bookings.filter(e=>e.id!==t.payload)};case`SET_PAYMENTS`:return{...e,payments:t.payload};case`ADD_PAYMENT`:return{...e,payments:[t.payload,...e.payments]};case`SET_LOADING`:return{...e,loading:t.payload};case`SET_SAVING`:return{...e,saving:t.payload};default:return e}}function S({children:e}){let[t,n]=(0,s.useReducer)(x,b),a=(0,s.useRef)(!1),o=(0,s.useCallback)(async(e=!1)=>{if(!(a.current&&!e)){n({type:`SET_LOADING`,payload:!0});try{let{data:e,error:t}=await r.from(`bookings`).select(`*`).order(`created_at`,{ascending:!1});if(t)throw t;n({type:`SET_BOOKINGS`,payload:e||[]}),a.current=!0}catch(e){console.error(`fetchBookings error:`,e),i.error(`Load failed: ${e.message||`check RLS/schema`}`),n({type:`SET_BOOKINGS`,payload:[]})}n({type:`SET_LOADING`,payload:!1})}},[]),c=(0,s.useCallback)(async e=>{n({type:`SET_CURRENT`,payload:null}),n({type:`SET_LOADING`,payload:!0});try{let{data:t,error:i}=await r.from(`bookings`).select(`*`).eq(`id`,e).single();if(i)throw i;n({type:`SET_CURRENT`,payload:t})}catch(e){console.error(`fetchBooking error:`,e),i.error(`Booking load failed: ${e.message||`not found`}`),n({type:`SET_CURRENT`,payload:null})}n({type:`SET_LOADING`,payload:!1})},[]),l=(0,s.useCallback)(async e=>{try{let{data:t,error:n}=await r.from(`bookings`).select(`*, packages(title, nights, days, company_name, company_phone)`).eq(`booking_token`,e).single();if(n)throw n;return t}catch(e){return console.error(`fetchBookingByToken error:`,e),null}},[]),u=(0,s.useCallback)(async e=>{n({type:`SET_SAVING`,payload:!0});let t=Math.round(e.total_amount*(e.advance_percent||20)/100),a={...e,booking_ref:await y(e),advance_amount:t,balance_amount:e.total_amount-t,paid_amount:0,status:`confirmed`,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};try{let{data:t,error:o}=await r.from(`bookings`).insert([a]).select().single();if(o)throw o;if(n({type:`ADD_BOOKING`,payload:t}),e.lead_id)try{await r.from(`leads`).update({stage:`advance_paid`,updated_at:new Date().toISOString()}).eq(`id`,e.lead_id)}catch(e){console.warn(`Could not update lead stage:`,e)}return i.success(`Booking ${t.booking_ref} created!`),h(t).catch(e=>console.warn(`Booking email error:`,e)),t}catch(e){throw console.error(`createBooking error:`,e),i.error(`Save failed: ${e.message||`check RLS/schema`}`),e}finally{n({type:`SET_SAVING`,payload:!1})}},[]),d=(0,s.useCallback)(async(e,t)=>{let a={...t,updated_at:new Date().toISOString()};try{let{data:t,error:i}=await r.from(`bookings`).update(a).eq(`id`,e).select().single();if(i)throw i;return n({type:`UPD_BOOKING`,payload:t}),t}catch(e){throw console.error(`updateBooking error:`,e),i.error(`Update failed: ${e.message||`check RLS/schema`}`),e}},[]),f=(0,s.useCallback)(async e=>{try{let{error:t}=await r.from(`bookings`).delete().eq(`id`,e);if(t)throw t;n({type:`DEL_BOOKING`,payload:e}),i.success(`Booking deleted`)}catch(e){console.error(`deleteBooking error:`,e),i.error(`Delete failed: ${e.message||`check RLS/schema`}`)}},[]),m=(0,s.useCallback)(async e=>{try{let{data:t,error:i}=await r.from(`payments`).select(`*`).eq(`booking_id`,e).order(`created_at`,{ascending:!1});if(i)throw i;n({type:`SET_PAYMENTS`,payload:t||[]})}catch(e){console.error(`fetchPayments error:`,e),n({type:`SET_PAYMENTS`,payload:[]})}},[]),v=(0,s.useCallback)(async(e,a)=>{let o=t.bookings.find(t=>t.id===e);if(!o){i.error(`Booking not found`);return}let s=(Number(o.paid_amount)||0)+Number(a.amount),c=s>=o.total_amount?`fully_paid`:s>=o.advance_amount?`balance_due`:o.status,l={booking_id:e,amount:a.amount,type:a.type||`advance`,method:a.method||`razorpay`,razorpay_payment_id:a.razorpay_payment_id||null,razorpay_order_id:a.razorpay_order_id||null,status:`success`,notes:a.notes||``,paid_at:new Date().toISOString(),created_at:new Date().toISOString()};try{let{data:t,error:u}=await r.from(`payments`).insert([l]).select().single();if(u)throw u;n({type:`ADD_PAYMENT`,payload:t}),await d(e,{paid_amount:s,status:c}),i.success(`₹${Number(a.amount).toLocaleString(`en-IN`)} payment recorded!`);let f=Math.max(0,Number(o.total_amount||0)-s);p({...o,paid_amount:s},Number(a.amount),s,f,l).then(()=>i.success(o.customer_email?`Receipt sent to ${o.customer_email}`:`Receipt sent to admin`,{duration:3e3})).catch(e=>console.warn(`Receipt email error:`,e))}catch(e){console.error(`recordPayment error:`,e),i.error(`Payment failed: ${e.message||`check RLS/schema`}`)}},[t.bookings,d]),S=(0,s.useCallback)(async(e,t)=>{try{let{data:n,error:i}=await r.from(`bookings`).update({...t,updated_at:new Date().toISOString()}).eq(`booking_token`,e).select().single();if(i)throw i;return n}catch(e){return console.error(`updateFromPublicForm error:`,e),i.error(`Save failed: ${e.message||`check RLS/schema`}`),null}},[]),C=(0,s.useCallback)(()=>{let e=t.bookings,n=e.reduce((e,t)=>e+(Number(t.paid_amount)||0),0),r=e.reduce((e,t)=>e+Math.max(0,(Number(t.total_amount)||0)-(Number(t.paid_amount)||0)),0);return{total:e.length,confirmed:e.filter(e=>e.status===`confirmed`).length,advance_paid:e.filter(e=>e.status===`advance_paid`).length,balance_due:e.filter(e=>e.status===`balance_due`).length,fully_paid:e.filter(e=>e.status===`fully_paid`).length,completed:e.filter(e=>e.status===`completed`).length,totalRevenue:n,pendingBalance:r}},[t.bookings]);return(0,g.jsx)(_.Provider,{value:{...t,fetchBookings:o,fetchBooking:c,fetchBookingByToken:l,createBooking:u,updateBooking:d,deleteBooking:f,fetchPayments:m,recordPayment:v,updateFromPublicForm:S,getBookingStats:C},children:e})}var C=()=>(0,s.useContext)(_);export{f as a,d as i,S as n,m as o,C as r,p as s,v as t};
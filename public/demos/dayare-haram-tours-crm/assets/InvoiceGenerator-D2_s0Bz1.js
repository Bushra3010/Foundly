import{r as e}from"./rolldown-runtime-Dw2cE7zH.js";import{g as t}from"./chart-vendor-DkeEVZ4C.js";import{l as n,r,t as i,u as a}from"./react-vendor-BBiLddrr.js";import{i as o,t as s}from"./pdf-vendor-DjYswRN1.js";import{a as c,f as l}from"./supabase-BnTWxs4A.js";import{t as u}from"./brand-D8FDglYg.js";import{t as ee}from"./download-DsHGUdxk.js";import{t as te}from"./receipt-udAJaXwx.js";import{t as d}from"./x-Dcrho5W6.js";import{r as ne}from"./ui-ChNIUlw4.js";var f=e(t(),1),re=e(o(),1),p=i(),m=u.logo;function ie(){let e={};try{e=JSON.parse(localStorage.getItem(`company_defaults`)||`{}`)}catch{e={}}return{name:(e.name||u.legalName).toUpperCase(),phone:e.phone||u.phone,email:e.email||u.email,website:u.website.replace(/^https?:\/\//,``),address:e.addr||u.address,gst:e.gst||u.gst,state:u.state}}var h={"01":`Jammu and Kashmir`,"02":`Himachal Pradesh`,"03":`Punjab`,"04":`Chandigarh`,"05":`Uttarakhand`,"06":`Haryana`,"07":`Delhi`,"08":`Rajasthan`,"09":`Uttar Pradesh`,10:`Bihar`,11:`Sikkim`,12:`Arunachal Pradesh`,13:`Nagaland`,14:`Manipur`,15:`Mizoram`,16:`Tripura`,17:`Meghalaya`,18:`Assam`,19:`West Bengal`,20:`Jharkhand`,21:`Odisha`,22:`Chhattisgarh`,23:`Madhya Pradesh`,24:`Gujarat`,26:`Dadra and Nagar Haveli and Daman and Diu`,27:`Maharashtra`,28:`Andhra Pradesh`,29:`Karnataka`,30:`Goa`,31:`Lakshadweep`,32:`Kerala`,33:`Tamil Nadu`,34:`Puducherry`,35:`Andaman and Nicobar Islands`,36:`Telangana`,37:`Andhra Pradesh`,38:`Ladakh`},ae=[`Umrah Package`,`Hajj Package`,`Air Ticket`,`Umrah Visa`,`Hotel Accommodation`,`Ziyarat / Transport`],oe=[`UPI`,`Bank Transfer`,`Cash`,`Card`,`Cheque`];function g(e=``){return{id:crypto.randomUUID(),description:e,details:``,passport:``,hsn:``,qty:1,rate:``,discount:``,cgst:``,sgst:``,igst:``}}function _(){return{id:crypto.randomUUID(),date:new Date().toISOString().slice(0,10),amount:``,mode:`UPI`,reference:``}}function se(e){let t=Number(e.qty)||0,n=Number(e.rate)||0,r=Number(e.discount)||0,i=t*n,a=Math.max(0,i-r),o=a*(Number(e.cgst)||0)/100,s=a*(Number(e.sgst)||0)/100,c=a*(Number(e.igst)||0)/100;return{gross:i,taxable:a,cgstAmt:o,sgstAmt:s,igstAmt:c,total:a+o+s+c}}var v=e=>`₹${(Number(e)||0).toLocaleString(`en-IN`,{minimumFractionDigits:2,maximumFractionDigits:2})}`;function y(){let{id:e}=a(),t=n(),[i,o]=(0,f.useState)(!!e),[y,b]=(0,f.useState)(!1),[x,S]=(0,f.useState)(``),[C,w]=(0,f.useState)(new Date().toISOString().slice(0,10)),[T,E]=(0,f.useState)(``),[D,O]=(0,f.useState)(`unpaid`),[k,A]=(0,f.useState)(`Thanks for doing business with us`),[j,M]=(0,f.useState)(`Hajj Umrah Package Booking`),[N,P]=(0,f.useState)(``),F=ie(),[I,L]=(0,f.useState)({name:``,gstin:``,phone:``,address:``,stateCode:``}),[R,z]=(0,f.useState)([g(`Umrah Package`)]),[B,V]=(0,f.useState)([]),[H,U]=(0,f.useState)(_()),[W,ce]=(0,f.useState)(null);(0,f.useEffect)(()=>{if(!e){c.from(`invoices`).select(`invoice_number`).then(({data:e})=>{let t=(e||[]).reduce((e,t)=>Math.max(e,Number(String(t.invoice_number||``).replace(/\D/g,``).slice(-6))||0),0);S(String(t+1))});return}(async()=>{o(!0);let{data:n,error:r}=await c.from(`invoices`).select(`*`).eq(`id`,e).single();if(r||!n){l.error(`Invoice not found`),t(`/invoices`);return}S(n.invoice_number||``),w(n.issue_date||new Date().toISOString().slice(0,10)),E(n.due_date||``),O(n.status||`unpaid`),A(n.notes||``),M(n.invoice_title||`Hajj Umrah Package Booking`),P(n.booking_ref||``),L({name:n.client_name||``,gstin:n.client_gstin||``,phone:n.client_phone||``,address:n.client_address||``,stateCode:n.client_state_code||``}),z(Array.isArray(n.items)&&n.items.length?n.items:[g()]),V(Array.isArray(n.payments)?n.payments:[]),o(!1)})()},[e,t]);let le=e=>{let t=e.toUpperCase(),n=t.slice(0,2);L(e=>({...e,gstin:t,stateCode:h[n]?n:e.stateCode}))},G=(e,t)=>{z(n=>n.map(n=>n.id===e?{...n,...t}:n))},ue=e=>z(t=>t.filter(t=>t.id!==e)),de=(e=``)=>z(t=>[...t,g(e)]),K=R.map(e=>({...e,...se(e)})),fe=K.reduce((e,t)=>e+t.taxable,0),pe=K.reduce((e,t)=>e+t.gross,0),q=K.reduce((e,t)=>e+(Number(t.discount)||0),0),J=K.reduce((e,t)=>e+t.cgstAmt+t.sgstAmt+t.igstAmt,0),Y=fe+J,X=J>0,me=(e,t)=>`${t?+(Number(e)/t*100).toFixed(3):0}%`,Z=(e,t=`-`)=>{if(!e)return`—`;let n=new Date(e);return[String(n.getDate()).padStart(2,`0`),String(n.getMonth()+1).padStart(2,`0`),n.getFullYear()].join(t)},Q=B.reduce((e,t)=>e+(Number(t.amount)||0),0),$=Math.max(0,Y-Q),he=Q>0?$<=0?`paid`:`partial`:D,ge=()=>{let e=Number(H.amount)||0;if(e<=0){l.error(`Enter a payment amount`);return}V(t=>[...t,{...H,amount:e}]),U(_())},_e=e=>V(t=>t.filter(t=>t.id!==e)),ve=B.reduce((e,t)=>!e||t.date&&t.date>e?t.date:e,``),ye=async e=>{ce(e),await new Promise(e=>setTimeout(e,80));let t=l.loading(`Generating receipt...`);try{let e=await(0,re.default)(document.getElementById(`receipt-preview`),{useCORS:!0,scale:2,logging:!1,backgroundColor:`#ffffff`}),n=new s({orientation:`p`,unit:`mm`,format:`a4`}),r=n.internal.pageSize.getWidth(),i=e.height*r/e.width;n.addImage(e.toDataURL(`image/jpeg`,.92),`JPEG`,0,0,r,i),n.save(`Receipt - ${x||`INV`} - ${I.name}.pdf`),l.dismiss(t),l.success(`Receipt downloaded!`)}catch(e){l.dismiss(t),l.error(`Could not generate receipt. Try again.`),console.error(`Receipt generation error:`,e)}finally{ce(null)}};return i?(0,p.jsx)(`div`,{className:`loading-state`,children:(0,p.jsx)(`div`,{className:`spinner`})}):(0,p.jsxs)(`div`,{className:`invoice-gen`,children:[(0,p.jsxs)(`div`,{className:`ig-header`,children:[(0,p.jsxs)(`div`,{children:[(0,p.jsx)(r,{to:`/invoices`,className:`ig-back`,children:`← Back to Invoices`}),(0,p.jsx)(`h1`,{className:`text-gradient`,children:`Invoice Generator`})]}),(0,p.jsx)(`button`,{className:`btn btn-primary`,onClick:async()=>{if(!I.name.trim()){l.error(`Client / company name is required`);return}b(!0);let n=l.loading(`Saving invoice...`);try{let r={invoice_number:x,client_name:I.name.trim(),client_gstin:I.gstin||null,client_phone:I.phone||null,client_address:I.address||null,client_state_code:I.stateCode||null,issue_date:C||null,due_date:T||null,status:he,notes:k,invoice_title:j,booking_ref:N||null,items:R,payments:B,amount_paid:Q,subtotal:fe,tax_amount:J,amount:Y};if(e){let{error:t}=await c.from(`invoices`).update(r).eq(`id`,e);if(t)throw t}else{let{data:e,error:n}=await c.from(`invoices`).insert([r]).select().single();if(n)throw n;t(`/invoices/${e.id}/edit`,{replace:!0})}l.dismiss(n),l.success(`Invoice saved`)}catch(e){l.dismiss(n),l.error(`Save failed: ${e.message||`check RLS/schema`}`),console.error(`Save invoice error:`,e),b(!1);return}let r=l.loading(`Generating PDF...`);try{let e=await(0,re.default)(document.getElementById(`invoice-preview`),{useCORS:!0,scale:2,logging:!1,backgroundColor:`#ffffff`}),t=new s({orientation:`p`,unit:`mm`,format:`a4`}),n=t.internal.pageSize.getWidth(),i=n,a=e.height*n/e.width;t.addImage(e.toDataURL(`image/jpeg`,.92),`JPEG`,0,0,i,a),t.save(`${x||`Invoice`} - ${I.name}.pdf`),l.dismiss(r),l.success(`PDF downloaded!`)}catch(e){l.dismiss(r),l.error(`Could not generate PDF. Try Print → Save as PDF instead.`),console.error(`PDF generation error:`,e)}finally{b(!1)}},disabled:y,children:y?`Working...`:(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(ee,{size:16}),` Save & Download PDF`]})})]}),(0,p.jsxs)(`div`,{className:`ig-grid`,children:[(0,p.jsxs)(`div`,{className:`ig-edit`,children:[(0,p.jsxs)(`div`,{className:`glass-card ig-card`,children:[(0,p.jsx)(`h3`,{children:`Bill To`}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Client / Company Name`}),(0,p.jsx)(`input`,{className:`glass-input`,value:I.name,onChange:e=>L(t=>({...t,name:e.target.value})),placeholder:`Traveler / Company Name`})]}),(0,p.jsxs)(`div`,{className:`form-row`,children:[(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Client GSTIN`}),(0,p.jsx)(`input`,{className:`glass-input`,value:I.gstin,onChange:e=>le(e.target.value),placeholder:`Auto-fills state`})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`State`}),(0,p.jsx)(`input`,{className:`glass-input`,value:h[I.stateCode]||``,readOnly:!0,placeholder:`From GSTIN`})]})]}),(0,p.jsxs)(`div`,{className:`form-row`,children:[(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Phone`}),(0,p.jsx)(`input`,{className:`glass-input`,value:I.phone,onChange:e=>L(t=>({...t,phone:e.target.value})),placeholder:`+91 98765 43210`})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Address`}),(0,p.jsx)(`input`,{className:`glass-input`,value:I.address,onChange:e=>L(t=>({...t,address:e.target.value})),placeholder:`City, State`})]})]})]}),(0,p.jsxs)(`div`,{className:`glass-card ig-card`,children:[(0,p.jsx)(`h3`,{children:`Invoice Details`}),(0,p.jsxs)(`div`,{className:`form-row`,children:[(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Invoice No.`}),(0,p.jsx)(`input`,{className:`glass-input`,value:x,onChange:e=>S(e.target.value)})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Status`}),(0,p.jsxs)(`select`,{className:`glass-input`,value:D,onChange:e=>O(e.target.value),children:[(0,p.jsx)(`option`,{value:`unpaid`,children:`Unpaid`}),(0,p.jsx)(`option`,{value:`partial`,children:`Partial`}),(0,p.jsx)(`option`,{value:`paid`,children:`Paid`}),(0,p.jsx)(`option`,{value:`overdue`,children:`Overdue`})]})]})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Invoice title`}),(0,p.jsx)(`input`,{className:`glass-input`,value:j,onChange:e=>M(e.target.value)})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Booking Reference No.`}),(0,p.jsx)(`input`,{className:`glass-input`,value:N,onChange:e=>P(e.target.value.toUpperCase()),placeholder:`e.g. NP-EU-OCT2026-00163`})]}),(0,p.jsxs)(`div`,{className:`form-row`,children:[(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Issue Date`}),(0,p.jsx)(`input`,{className:`glass-input`,type:`date`,value:C,onChange:e=>w(e.target.value)})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Due Date`}),(0,p.jsx)(`input`,{className:`glass-input`,type:`date`,value:T,onChange:e=>E(e.target.value)})]})]})]}),(0,p.jsxs)(`div`,{className:`glass-card ig-card`,children:[(0,p.jsxs)(`div`,{className:`ig-items-head`,children:[(0,p.jsx)(`h3`,{children:`Line Items`}),(0,p.jsx)(`div`,{className:`ig-presets`,children:ae.map(e=>(0,p.jsxs)(`button`,{className:`btn btn-ghost ig-preset-btn`,onClick:()=>de(e),children:[`+ `,e]},e))})]}),R.map((e,t)=>(0,p.jsxs)(`div`,{className:`ig-item-row`,children:[(0,p.jsxs)(`div`,{className:`ig-item-row-head`,children:[(0,p.jsxs)(`span`,{className:`ig-item-num`,children:[`Item `,t+1]}),R.length>1&&(0,p.jsxs)(`button`,{className:`ig-item-remove`,onClick:()=>ue(e.id),children:[(0,p.jsx)(d,{size:13}),` Remove`]})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Service name`}),(0,p.jsx)(`input`,{className:`glass-input`,value:e.description,onChange:t=>G(e.id,{description:t.target.value}),placeholder:`e.g. 15 Days Economy Umrah Package OCT 2026`})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Package includes`}),(0,p.jsx)(`textarea`,{className:`glass-input`,rows:2,value:e.details||``,onChange:t=>G(e.id,{details:t.target.value}),placeholder:`Return Air Ticket | Umrah Visa with Insurance | Accommodation ...`})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Passport No.`}),(0,p.jsx)(`input`,{className:`glass-input`,value:e.passport||``,onChange:t=>G(e.id,{passport:t.target.value.toUpperCase()}),placeholder:`e.g. T2089132`})]}),(0,p.jsxs)(`div`,{className:`ig-item-grid`,children:[(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`HSN/SAC`}),(0,p.jsx)(`input`,{className:`glass-input`,value:e.hsn,onChange:t=>G(e.id,{hsn:t.target.value}),placeholder:`998552`})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Qty`}),(0,p.jsx)(`input`,{className:`glass-input`,type:`number`,value:e.qty,onChange:t=>G(e.id,{qty:t.target.value})})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Rate (₹)`}),(0,p.jsx)(`input`,{className:`glass-input`,type:`number`,value:e.rate,onChange:t=>G(e.id,{rate:t.target.value})})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Discount (₹)`}),(0,p.jsx)(`input`,{className:`glass-input`,type:`number`,value:e.discount,onChange:t=>G(e.id,{discount:t.target.value})})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`CGST %`}),(0,p.jsx)(`input`,{className:`glass-input`,type:`number`,value:e.cgst,onChange:t=>G(e.id,{cgst:t.target.value})})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`SGST %`}),(0,p.jsx)(`input`,{className:`glass-input`,type:`number`,value:e.sgst,onChange:t=>G(e.id,{sgst:t.target.value})})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`IGST %`}),(0,p.jsx)(`input`,{className:`glass-input`,type:`number`,value:e.igst,onChange:t=>G(e.id,{igst:t.target.value})})]})]})]},e.id)),(0,p.jsx)(`button`,{className:`btn btn-ghost`,style:{width:`100%`,marginTop:8},onClick:()=>de(),children:`+ Add Line Item`})]}),(0,p.jsxs)(`div`,{className:`glass-card ig-card`,children:[(0,p.jsx)(`h3`,{children:`Payments Received`}),(0,p.jsxs)(`div`,{className:`pay-summary`,children:[(0,p.jsxs)(`div`,{className:`pay-summary-cell`,children:[(0,p.jsx)(`span`,{children:`Grand Total`}),(0,p.jsx)(`strong`,{children:v(Y)})]}),(0,p.jsxs)(`div`,{className:`pay-summary-cell`,children:[(0,p.jsx)(`span`,{children:`Paid`}),(0,p.jsx)(`strong`,{style:{color:`#059669`},children:v(Q)})]}),(0,p.jsxs)(`div`,{className:`pay-summary-cell`,children:[(0,p.jsx)(`span`,{children:`Balance Due`}),(0,p.jsx)(`strong`,{style:{color:$>0?`#B45309`:`#059669`},children:v($)})]})]}),B.length>0&&(0,p.jsx)(`div`,{className:`pay-list`,children:B.map(e=>(0,p.jsxs)(`div`,{className:`pay-row`,children:[(0,p.jsxs)(`div`,{className:`pay-row-main`,children:[(0,p.jsx)(`span`,{className:`pay-amt`,children:v(e.amount)}),(0,p.jsxs)(`span`,{className:`pay-meta`,children:[e.date?new Date(e.date).toLocaleDateString(`en-IN`,{day:`numeric`,month:`short`,year:`2-digit`}):`—`,` · `,e.mode,e.reference?` · ${e.reference}`:``]})]}),(0,p.jsxs)(`div`,{className:`pay-row-actions`,children:[(0,p.jsxs)(`button`,{className:`btn btn-ghost`,style:{padding:`4px 8px`,fontSize:11},onClick:()=>ye(e),title:`Download receipt`,children:[(0,p.jsx)(te,{size:13}),` Receipt`]}),(0,p.jsx)(`button`,{className:`pay-remove`,onClick:()=>_e(e.id),title:`Remove`,children:(0,p.jsx)(d,{size:13})})]})]},e.id))}),(0,p.jsxs)(`div`,{className:`pay-add`,children:[(0,p.jsxs)(`div`,{className:`ig-item-grid`,style:{gridTemplateColumns:`1fr 1fr`,marginTop:0},children:[(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Amount (₹)`}),(0,p.jsx)(`input`,{className:`glass-input`,type:`number`,value:H.amount,onChange:e=>U(t=>({...t,amount:e.target.value})),placeholder:`e.g. 99900`})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Date`}),(0,p.jsx)(`input`,{className:`glass-input`,type:`date`,value:H.date,onChange:e=>U(t=>({...t,date:e.target.value}))})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Mode`}),(0,p.jsx)(`select`,{className:`glass-input`,value:H.mode,onChange:e=>U(t=>({...t,mode:e.target.value})),children:oe.map(e=>(0,p.jsx)(`option`,{value:e,children:e},e))})]}),(0,p.jsxs)(`div`,{className:`form-field`,children:[(0,p.jsx)(`label`,{children:`Reference / Note`}),(0,p.jsx)(`input`,{className:`glass-input`,value:H.reference,onChange:e=>U(t=>({...t,reference:e.target.value})),placeholder:`e.g. State Bank UPI T2609232259...`})]})]}),(0,p.jsx)(`button`,{className:`btn btn-ghost`,style:{width:`100%`,marginTop:10},onClick:ge,children:`+ Record Payment`})]})]}),(0,p.jsxs)(`div`,{className:`glass-card ig-card`,children:[(0,p.jsx)(`h3`,{children:`Notes`}),(0,p.jsx)(`p`,{className:`muted`,style:{fontSize:12,marginBottom:8},children:`Standard terms and bank details are printed automatically.`}),(0,p.jsx)(`textarea`,{className:`glass-input`,rows:3,value:k,onChange:e=>A(e.target.value),placeholder:`Extra note for this invoice`})]})]}),(0,p.jsx)(`div`,{className:`ig-preview-wrap`,children:(0,p.jsxs)(`div`,{id:`invoice-preview`,className:`ig-preview`,children:[(0,p.jsxs)(`div`,{className:`ig-pv-header`,children:[(0,p.jsxs)(`div`,{className:`ig-pv-company`,children:[(0,p.jsx)(`h1`,{children:F.name}),(0,p.jsx)(`p`,{children:F.address}),(0,p.jsxs)(`p`,{children:[`Phone no. : `,F.phone]}),(0,p.jsxs)(`p`,{children:[`Email : `,F.email,F.website?` · Web ${F.website}`:``]}),F.gst&&(0,p.jsxs)(`p`,{children:[`GSTIN : `,F.gst]}),(0,p.jsxs)(`p`,{children:[`State: `,F.state]})]}),(0,p.jsx)(`img`,{src:m,alt:u.legalName,className:`ig-pv-logo`})]}),(0,p.jsx)(`h2`,{className:`ig-pv-title`,children:j||`Tax Invoice`}),(0,p.jsxs)(`div`,{className:`ig-pv-parties`,children:[(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`div`,{className:`ig-pv-label`,children:`Bill To`}),(0,p.jsx)(`div`,{className:`ig-pv-bill-name`,children:I.name||`Client Name`}),I.address&&(0,p.jsx)(`div`,{children:I.address}),I.phone&&(0,p.jsxs)(`div`,{children:[`Ph: `,I.phone]}),I.gstin&&(0,p.jsxs)(`div`,{children:[`GSTIN: `,I.gstin,h[I.stateCode]?` (${h[I.stateCode]})`:``]})]}),(0,p.jsxs)(`div`,{className:`ig-pv-details`,children:[(0,p.jsx)(`div`,{className:`ig-pv-label`,children:`Invoice Details`}),(0,p.jsxs)(`div`,{children:[`Invoice No. : `,x||`—`]}),(0,p.jsxs)(`div`,{children:[`Date : `,Z(C)]}),N&&(0,p.jsxs)(`div`,{children:[`Booking Reference No.: `,N]}),ve&&(0,p.jsxs)(`div`,{children:[`Payment Date: `,Z(ve,`/`)]}),T&&(0,p.jsxs)(`div`,{children:[`Due Date : `,Z(T)]})]})]}),(0,p.jsxs)(`table`,{className:`ig-pv-table`,children:[(0,p.jsx)(`thead`,{children:(0,p.jsxs)(`tr`,{children:[(0,p.jsx)(`th`,{children:`#`}),(0,p.jsx)(`th`,{children:`Service Name & Description`}),(0,p.jsx)(`th`,{children:`Passport No`}),(0,p.jsx)(`th`,{className:`num`,children:`Quantity`}),(0,p.jsx)(`th`,{className:`num`,children:`Price/ Unit`}),(0,p.jsx)(`th`,{className:`num`,children:`Discount`}),X&&(0,p.jsx)(`th`,{className:`num`,children:`GST`}),(0,p.jsx)(`th`,{className:`num`,children:`Amount`})]})}),(0,p.jsx)(`tbody`,{children:K.map((e,t)=>(0,p.jsxs)(`tr`,{children:[(0,p.jsx)(`td`,{children:t+1}),(0,p.jsxs)(`td`,{className:`ig-pv-desc`,children:[(0,p.jsx)(`strong`,{children:e.description||`—`}),e.details&&(0,p.jsxs)(`span`,{children:[`(`,e.details,`)`]}),e.hsn&&(0,p.jsxs)(`span`,{children:[`HSN/SAC: `,e.hsn]})]}),(0,p.jsx)(`td`,{children:e.passport||`—`}),(0,p.jsx)(`td`,{className:`num`,children:e.qty||0}),(0,p.jsx)(`td`,{className:`num`,children:v(e.rate)}),(0,p.jsx)(`td`,{className:`num`,children:Number(e.discount)?(0,p.jsxs)(p.Fragment,{children:[v(e.discount),(0,p.jsx)(`br`,{}),(0,p.jsxs)(`small`,{children:[`(`,me(e.discount,e.gross),`)`]})]}):`—`}),X&&(0,p.jsx)(`td`,{className:`num`,children:v(e.cgstAmt+e.sgstAmt+e.igstAmt)}),(0,p.jsx)(`td`,{className:`num`,children:v(e.total)})]},e.id))}),(0,p.jsx)(`tfoot`,{children:(0,p.jsxs)(`tr`,{children:[(0,p.jsx)(`td`,{}),(0,p.jsx)(`td`,{children:`Total`}),(0,p.jsx)(`td`,{}),(0,p.jsx)(`td`,{}),(0,p.jsx)(`td`,{}),(0,p.jsx)(`td`,{className:`num`,children:v(q)}),X&&(0,p.jsx)(`td`,{className:`num`,children:v(J)}),(0,p.jsx)(`td`,{className:`num`,children:v(Y)})]})})]}),(0,p.jsxs)(`div`,{className:`ig-pv-bottom`,children:[(0,p.jsxs)(`div`,{className:`ig-pv-left`,children:[(0,p.jsx)(`div`,{className:`ig-pv-label`,children:`Invoice Amount In Words`}),(0,p.jsx)(`p`,{children:ne(Y)}),(0,p.jsx)(`div`,{className:`ig-pv-label`,style:{marginTop:14},children:`Terms and Conditions`}),(0,p.jsx)(`ol`,{children:u.invoiceTerms.map(e=>(0,p.jsx)(`li`,{children:e},e))}),k&&(0,p.jsx)(`p`,{className:`ig-pv-note`,children:k})]}),(0,p.jsxs)(`div`,{className:`ig-pv-summary`,children:[(0,p.jsxs)(`div`,{className:`row`,children:[(0,p.jsx)(`span`,{children:`Sub Total`}),(0,p.jsx)(`span`,{children:v(pe)})]}),q>0&&(0,p.jsxs)(`div`,{className:`row`,children:[(0,p.jsx)(`span`,{children:`Discount`}),(0,p.jsx)(`span`,{children:v(q)})]}),X&&(0,p.jsxs)(`div`,{className:`row`,children:[(0,p.jsx)(`span`,{children:`GST`}),(0,p.jsx)(`span`,{children:v(J)})]}),(0,p.jsxs)(`div`,{className:`row total`,children:[(0,p.jsx)(`span`,{children:`Total`}),(0,p.jsx)(`span`,{children:v(Y)})]}),(0,p.jsxs)(`div`,{className:`row`,children:[(0,p.jsx)(`span`,{children:`Received`}),(0,p.jsx)(`span`,{children:v(Q)})]}),(0,p.jsxs)(`div`,{className:`row`,children:[(0,p.jsx)(`span`,{children:`Balance`}),(0,p.jsx)(`span`,{children:v($)})]}),B.length>0&&(0,p.jsxs)(`div`,{className:`row mode`,children:[(0,p.jsx)(`span`,{children:`Payment mode`}),(0,p.jsx)(`span`,{children:B.map(e=>`${e.mode}${e.reference?` (${e.reference})`:``}`).join(`, `)})]}),q>0&&(0,p.jsxs)(`div`,{className:`row saved`,children:[(0,p.jsx)(`span`,{children:`You Saved`}),(0,p.jsx)(`span`,{children:v(q)})]})]})]}),(0,p.jsxs)(`div`,{className:`ig-pv-foot`,children:[(0,p.jsxs)(`div`,{className:`ig-pv-bank`,children:[(0,p.jsx)(`div`,{className:`ig-pv-label`,children:`Pay To:`}),(0,p.jsxs)(`div`,{children:[`Bank Name : `,u.bank.name]}),(0,p.jsxs)(`div`,{children:[`Bank Account No. : `,u.bank.account]}),(0,p.jsxs)(`div`,{children:[`Bank IFSC code : `,u.bank.ifsc]}),(0,p.jsxs)(`div`,{children:[`Account holder's name : `,u.bank.holder.toUpperCase()]})]}),(0,p.jsxs)(`div`,{className:`ig-pv-sign`,children:[(0,p.jsxs)(`div`,{children:[`For : `,F.name]}),(0,p.jsx)(`div`,{className:`ig-pv-sign-space`}),(0,p.jsx)(`strong`,{children:`Authorized Signatory`})]})]})]})})]}),W&&(0,p.jsx)(`div`,{style:{position:`fixed`,left:-99999,top:0,width:794},children:(0,p.jsxs)(`div`,{id:`receipt-preview`,className:`rc-preview`,children:[(0,p.jsxs)(`div`,{className:`rc-header`,children:[(0,p.jsxs)(`div`,{className:`ig-pv-company`,children:[(0,p.jsx)(`h1`,{children:F.name}),(0,p.jsx)(`p`,{children:F.address}),(0,p.jsxs)(`p`,{children:[`Phone no. : `,F.phone,` · Email : `,F.email]}),F.gst&&(0,p.jsxs)(`p`,{children:[`GSTIN : `,F.gst,` · State: `,F.state]})]}),(0,p.jsx)(`img`,{src:m,alt:u.legalName,className:`ig-pv-logo`})]}),(0,p.jsx)(`h2`,{className:`ig-pv-title`,children:`Payment Receipt`}),(0,p.jsxs)(`div`,{className:`rc-meta`,children:[(0,p.jsxs)(`div`,{children:[(0,p.jsxs)(`p`,{children:[(0,p.jsx)(`span`,{children:`Receipt No:`}),` `,(0,p.jsxs)(`strong`,{children:[`RCPT-`,x||`—`]})]}),N&&(0,p.jsxs)(`p`,{children:[(0,p.jsx)(`span`,{children:`Booking Ref:`}),` `,(0,p.jsx)(`strong`,{children:N})]}),(0,p.jsxs)(`p`,{children:[(0,p.jsx)(`span`,{children:`Against Invoice:`}),` `,(0,p.jsx)(`strong`,{children:x||`—`})]})]}),(0,p.jsxs)(`div`,{style:{textAlign:`right`},children:[(0,p.jsxs)(`p`,{children:[(0,p.jsx)(`span`,{children:`Date:`}),` `,(0,p.jsx)(`strong`,{children:W.date?new Date(W.date).toLocaleDateString(`en-IN`,{day:`numeric`,month:`short`,year:`numeric`}):`—`})]}),(0,p.jsxs)(`p`,{children:[(0,p.jsx)(`span`,{children:`Mode:`}),` `,(0,p.jsx)(`strong`,{children:W.mode})]})]})]}),(0,p.jsxs)(`div`,{className:`rc-body`,children:[(0,p.jsxs)(`p`,{children:[`Received with thanks from `,(0,p.jsx)(`strong`,{children:I.name||`Client`})]}),(0,p.jsxs)(`div`,{className:`rc-amount-box`,children:[(0,p.jsx)(`span`,{children:`Amount Received`}),(0,p.jsx)(`strong`,{children:v(W.amount)})]}),W.reference&&(0,p.jsxs)(`p`,{className:`rc-ref`,children:[`Reference: `,W.reference]})]}),(0,p.jsxs)(`div`,{className:`rc-summary`,children:[(0,p.jsxs)(`div`,{className:`rc-summary-row`,children:[(0,p.jsx)(`span`,{children:`Invoice Total`}),(0,p.jsx)(`span`,{children:v(Y)})]}),(0,p.jsxs)(`div`,{className:`rc-summary-row`,children:[(0,p.jsx)(`span`,{children:`Total Paid to Date`}),(0,p.jsx)(`span`,{children:v(Q)})]}),(0,p.jsxs)(`div`,{className:`rc-summary-row rc-summary-bal`,children:[(0,p.jsx)(`span`,{children:`Balance Due`}),(0,p.jsx)(`span`,{children:v($)})]})]}),(0,p.jsx)(`div`,{className:`rc-sign`,children:(0,p.jsxs)(`div`,{className:`rc-sign-line`,children:[(0,p.jsx)(`div`,{className:`rc-sign-rule`}),(0,p.jsxs)(`span`,{children:[`For `,F.name,(0,p.jsx)(`br`,{}),(0,p.jsx)(`strong`,{children:`Authorized Signatory`})]})]})}),(0,p.jsxs)(`div`,{className:`rc-footer`,children:[(0,p.jsx)(`p`,{className:`rc-footer-strong`,children:F.name}),(0,p.jsxs)(`p`,{children:[F.phone,` · `,F.email,F.website?` · ${F.website}`:``]}),(0,p.jsx)(`p`,{children:`This is a system-generated payment receipt.`})]})]})}),(0,p.jsx)(`style`,{jsx:!0,children:`
        .ig-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 20px;
          gap: 16px;
        }
        .ig-back { font-size: 12.5px; font-weight: 700; color: var(--text-muted); text-decoration: none; display: inline-block; margin-bottom: 6px; }
        .ig-back:hover { color: var(--primary); }
        .ig-header h1 { font-size: 26px; font-weight: 800; }

        .ig-grid {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 20px;
          align-items: start;
        }

        .ig-edit { display: flex; flex-direction: column; gap: 16px; }
        .ig-card { padding: 20px; }
        .ig-card h3 { font-size: 14px; font-weight: 800; margin-bottom: 14px; }
        .ig-card .form-field { margin-bottom: 12px; }
        .ig-card .form-field:last-child { margin-bottom: 0; }
        .ig-card .form-row { margin-bottom: 12px; }
        .ig-card textarea.glass-input { resize: vertical; }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-field label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

        .ig-items-head { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; }
        .ig-items-head h3 { margin-bottom: 0; }
        .ig-presets { display: flex; flex-wrap: wrap; gap: 6px; }
        .ig-preset-btn { font-size: 11px; padding: 5px 10px; }

        .ig-item-row {
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 12px;
          background: #F8FAFC;
        }
        .ig-item-row-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .ig-item-num { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
        .ig-item-remove { border: none; background: none; color: #ef4444; font-size: 11px; font-weight: 700; cursor: pointer; }
        .ig-item-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }

        /* ── Payments card ── */
        .pay-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 14px;
        }
        .pay-summary-cell {
          background: #F8FAFC;
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .pay-summary-cell span { font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); }
        .pay-summary-cell strong { font-size: 15px; font-weight: 800; }

        .pay-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
        .pay-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          padding: 8px 12px;
        }
        .pay-row-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .pay-amt { font-size: 14px; font-weight: 800; color: #059669; }
        .pay-meta { font-size: 11px; color: var(--text-muted); }
        .pay-row-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
        .pay-remove { border: none; background: none; color: #ef4444; font-size: 14px; font-weight: 700; cursor: pointer; padding: 4px 6px; }
        .pay-add { border-top: 1px dashed var(--border-glass); padding-top: 14px; }

        /* ── Receipt template (off-screen, captured to PDF) ── */
        .rc-preview {
          background: #fff;
          padding: 36px;
          color: #1a1a1a;
          font-family: inherit;
          width: 794px;
        }
        .rc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #E2E8F0;
          margin-bottom: 24px;
        }

        .rc-brand h1 { font-size: 24px; font-weight: 900; color: #0D2A7D; text-transform: uppercase; letter-spacing: 0.4px; }
        .rc-tagline { font-size: 12px; font-style: italic; color: #64748B; margin-top: 2px; }
        .rc-badge {
          background: #059669;
          color: #fff;
          font-weight: 800;
          font-size: 14px;
          padding: 12px 24px;
          border-radius: 8px;
          letter-spacing: 1.2px;
          white-space: nowrap;
        }
        .rc-meta { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 12.5px; color: #475569; line-height: 1.9; }
        .rc-meta p { margin: 0; }
        .rc-meta span { color: #94A3B8; margin-right: 6px; }
        .rc-meta strong { color: #1a1a1a; }
        .rc-body { margin-bottom: 24px; font-size: 14px; }
        .rc-amount-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #EEF2FB;
          border: 1px solid #C3CEEC;
          border-radius: 10px;
          padding: 16px 20px;
          margin: 12px 0;
        }
        .rc-amount-box span { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0D2A7D; }
        .rc-amount-box strong { font-size: 26px; font-weight: 800; color: #0D2A7D; }
        .rc-ref { font-size: 12.5px; color: #475569; }
        .rc-summary { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; margin-bottom: 40px; }
        .rc-summary-row { display: flex; justify-content: space-between; gap: 40px; width: 280px; font-size: 13px; }
        .rc-summary-bal { font-weight: 800; font-size: 15px; border-top: 2px solid #0F172A; padding-top: 8px; margin-top: 4px; color: #B45309; }
        .rc-sign { display: flex; justify-content: flex-end; margin-bottom: 32px; }
        .rc-sign-line { text-align: center; }
        .rc-sign-rule { width: 180px; border-top: 1px solid #94A3B8; margin-bottom: 6px; }
        .rc-sign-line span { font-size: 12px; color: #64748B; }
        .rc-footer { padding-top: 14px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 10.5px; color: #94A3B8; line-height: 1.8; }
        .rc-footer-strong { font-weight: 700; color: #1a1a1a; font-size: 11px; }

        .ig-preview-wrap { position: sticky; top: calc(var(--header-h) + 16px); }
        .ig-preview {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          padding: 34px 36px;
          color: #111;
          display: flex;
          flex-direction: column;
          min-height: 1050px;
          font-size: 12px;
          line-height: 1.5;
        }
        .ig-pv-header, .rc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          padding-bottom: 12px;
          border-bottom: 2px solid #0D2A7D;
          margin-bottom: 14px;
        }
        .ig-pv-company h1 { font-size: 17px; font-weight: 700; letter-spacing: 0.2px; color: #111; margin-bottom: 4px; max-width: 360px; line-height: 1.3; }
        .ig-pv-company p { margin: 0; font-size: 11.5px; color: #222; max-width: 380px; }
        .ig-pv-logo { width: 210px; height: auto; object-fit: contain; flex-shrink: 0; }
        .ig-pv-title { text-align: center; font-size: 20px; font-weight: 700; color: #0D2A7D; margin: 4px 0 16px; }
        .ig-pv-parties { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 12px; font-size: 12px; }
        .ig-pv-details { text-align: right; }
        .ig-pv-label { font-size: 12px; font-weight: 700; color: #111; margin-bottom: 4px; }
        .ig-pv-bill-name { font-size: 13px; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }

        .ig-pv-table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin-bottom: 18px; }
        .ig-pv-table th {
          background: #0D2A7D;
          color: #fff;
          text-align: left;
          padding: 8px 8px;
          font-weight: 600;
          vertical-align: middle;
        }
        .ig-pv-table td { padding: 10px 8px; border-bottom: 1px solid #CBD5E1; vertical-align: middle; }
        .ig-pv-table .num { text-align: right; white-space: nowrap; }
        .ig-pv-table small { font-size: 10.5px; color: #333; }
        .ig-pv-desc { min-width: 170px; max-width: 220px; }
        .ig-pv-desc strong { display: block; font-size: 12.5px; margin-bottom: 2px; }
        .ig-pv-desc span { display: block; font-size: 10.5px; color: #222; line-height: 1.35; }
        .ig-pv-table tfoot td { font-weight: 700; border-top: 1px solid #111; border-bottom: 1px solid #111; padding: 8px; }

        .ig-pv-bottom { display: grid; grid-template-columns: 1fr 300px; gap: 28px; margin-bottom: 22px; }
        .ig-pv-left p { margin: 0 0 4px; }
        .ig-pv-left ol { padding-left: 16px; margin: 0; }
        .ig-pv-left li { margin-bottom: 3px; }
        .ig-pv-note { margin-top: 8px !important; }
        .ig-pv-summary .row { display: flex; justify-content: space-between; gap: 16px; padding: 6px 8px; font-size: 12px; }
        .ig-pv-summary .row span:last-child { text-align: right; }
        .ig-pv-summary .row.total { background: #0D2A7D; color: #fff; font-weight: 700; }
        .ig-pv-summary .row.mode span:last-child { font-size: 11px; max-width: 190px; }
        .ig-pv-summary .row.saved { border-top: 1px solid #111; margin-top: 6px; padding-top: 10px; }

        .ig-pv-foot { display: flex; justify-content: space-between; gap: 24px; margin-top: auto; padding-top: 18px; font-size: 12px; }
        .ig-pv-bank div { margin-bottom: 3px; }
        .ig-pv-sign { text-align: center; min-width: 260px; display: flex; flex-direction: column; align-items: center; }
        .ig-pv-sign-space { height: 56px; width: 200px; border-bottom: 1px solid #94A3B8; margin: 8px 0 6px; }

        @media (max-width: 1100px) {
          .ig-grid { grid-template-columns: 1fr; }
          .ig-preview-wrap { position: static; }
        }
        @media (max-width: 768px) {
          .ig-header { flex-direction: column; align-items: flex-start; }
          .ig-header .btn { width: 100%; justify-content: center; }
          .ig-item-grid { grid-template-columns: 1fr 1fr; }
          .ig-preview { padding: 16px; min-height: 0; font-size: 10px; }
          .ig-pv-logo { width: 110px; }
          .ig-pv-company h1 { font-size: 12px; }
          .ig-pv-company p { font-size: 9px; }
          .ig-pv-bottom { grid-template-columns: 1fr; }
          .ig-pv-foot { flex-direction: column; }
          .ig-preview-wrap { overflow-x: auto; }
        }
      `})]})}export{y as default};
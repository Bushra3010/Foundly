(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,7471,98390,e=>{"use strict";var a=e.i(47167);let i="demo-supabase",t=()=>({}),s=null,n=0,r=new Set;function o(e){t=e}function l(){return n}function c(){n++;try{localStorage.setItem(i,JSON.stringify(s))}catch{}r.forEach(e=>e())}let d=()=>"u">typeof crypto&&"randomUUID"in crypto?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2),u=e=>RegExp("^"+String(e).replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/%/g,".*").replace(/_/g,".")+"$","i"),g=(e,a)=>a.split("->").reduce((e,a)=>null==e?e:e[a.replace(/>/g,"")],e);class h{table;op;filters;orders;from_;to_;lim;single_;maybe;count_;head;payload;conflict;ignoreDup;constructor(e){this.table=e,this.op="select",this.filters=[],this.orders=[],this.single_=!1,this.maybe=!1,this.count_=!1,this.head=!1,this.payload=[],this.conflict="id",this.ignoreDup=!1}select(e,a){return a?.count&&(this.count_=!0),a?.head&&(this.head=!0),this}insert(e){return this.op="insert",this.payload=Array.isArray(e)?e:[e],this}upsert(e,a){return this.op="upsert",this.payload=Array.isArray(e)?e:[e],this.conflict=a?.onConflict??"id",this.ignoreDup=!!a?.ignoreDuplicates,this}update(e){return this.op="update",this.payload=[e],this}delete(){return this.op="delete",this}eq(e,a){return this.filters.push(i=>String(g(i,e))===String(a)),this}neq(e,a){return this.filters.push(i=>String(g(i,e))!==String(a)),this}gt(e,a){return this.filters.push(i=>g(i,e)>a),this}gte(e,a){return this.filters.push(i=>g(i,e)>=a),this}lt(e,a){return this.filters.push(i=>g(i,e)<a),this}lte(e,a){return this.filters.push(i=>g(i,e)<=a),this}like(e,a){let i=u(a);return this.filters.push(a=>i.test(String(g(a,e)??""))),this}ilike(e,a){return this.like(e,a)}in(e,a){return this.filters.push(i=>a.map(String).includes(String(g(i,e)))),this}is(e,a){return this.filters.push(i=>null===a?null==g(i,e):g(i,e)===a),this}contains(e,a){return this.filters.push(i=>{let t=g(i,e);return!!Array.isArray(t)&&(Array.isArray(a)?a:[a]).every(e=>t.includes(e))}),this}match(e){return Object.entries(e).forEach(([e,a])=>this.eq(e,a)),this}or(e){let a=e.split(",").map(e=>{let[a,i,...t]=e.split(".");return{c:a,op:i,v:t.join(".")}});return this.filters.push(e=>a.some(({c:a,op:i,v:t})=>"eq"===i?String(g(e,a))===t:"ilike"!==i&&"like"!==i||u(t).test(String(g(e,a)??"")))),this}textSearch(e,a){return this.ilike(e,`%${a}%`)}order(e,a){return this.orders.push({col:e,asc:a?.ascending??!0,nullsFirst:a?.nullsFirst}),this}range(e,a){return this.from_=e,this.to_=a,this}limit(e){return this.lim=e,this}single(){return this.single_=!0,this}maybeSingle(){return this.single_=!0,this.maybe=!0,this}run(){let e=function(){if(s)return s;try{let e=localStorage.getItem(i);if(e)return s=JSON.parse(e)}catch{}return s=JSON.parse(JSON.stringify(t()))}(),a=e[this.table]??=[],n=e=>this.filters.every(a=>a(e)),r=new Date().toISOString(),o=[];if("select"===this.op){for(let e of(o=a.filter(n),[...this.orders].reverse()))o=[...o].sort((a,i)=>{let t=g(a,e.col),s=g(i,e.col);if(null==t&&null==s)return 0;if(null==t)return e.nullsFirst??!e.asc?-1:1;if(null==s)return e.nullsFirst??!e.asc?1:-1;let n=t<s?-1:+(t>s);return e.asc?n:-n});let e=o.length;return(void 0!==this.from_&&(o=o.slice(this.from_,(this.to_??o.length)+1)),void 0!==this.lim&&(o=o.slice(0,this.lim)),this.head)?{data:null,error:null,count:e}:this.finish(o,this.count_?e:null)}if("insert"===this.op)return o=this.payload.map(e=>({id:d(),created_at:r,updated_at:r,...e})),a.unshift(...o),c(),this.finish(o);if("upsert"===this.op){for(let e of this.payload){let i=a.findIndex(a=>String(a[this.conflict])===String(e[this.conflict]));if(i>=0)this.ignoreDup||(a[i]={...a[i],...e,updated_at:r},o.push(a[i]));else{let i={id:d(),created_at:r,updated_at:r,...e};a.unshift(i),o.push(i)}}return c(),this.finish(o)}return"update"===this.op?a.forEach((e,i)=>{n(e)&&(a[i]={...e,...this.payload[0],updated_at:r},o.push(a[i]))}):(o=a.filter(n),e[this.table]=a.filter(e=>!n(e))),c(),this.finish(o)}finish(e,a=null){let i=JSON.parse(JSON.stringify(e));return this.single_?0===i.length?this.maybe?{data:null,error:null,count:a}:{data:null,error:{code:"PGRST116",message:"No rows found"},count:a}:{data:i[0],error:null,count:a}:{data:i,error:null,count:a}}then(e,a){return new Promise(e=>setTimeout(()=>e(this.run()),60)).then(e,a)}}async function p(e){return e instanceof Blob?new Promise(a=>{let i=new FileReader;i.onload=()=>a(String(i.result)),i.readAsDataURL(e)}):""}function m(){let e={};return{from:e=>new h(e),rpc:async()=>({data:null,error:null}),auth:{getSession:async()=>({data:{session:null},error:null}),getUser:async()=>({data:{user:null},error:null}),signInWithPassword:async()=>({data:{session:{user:{id:"demo"}}},error:null}),signOut:async()=>({error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},storage:{from:a=>({upload:async(i,t)=>(e[`${a}/${i}`]=await p(t),{data:{path:i},error:null}),getPublicUrl:i=>({data:{publicUrl:e[`${a}/${i}`]||""}}),remove:async()=>({data:[],error:null}),list:async()=>({data:[],error:null})})}}}function f(e){return e.toLowerCase().replace(/ /g,"-").replace(/[^\w-]+/g,"")}e.s(["createDemoClient",()=>m,"demoVersion",()=>l,"setDemoSeed",()=>o],98390);let y=[{name:"IIT Delhi",slug:f("IIT Delhi"),state:"Delhi",city:"New Delhi",courses:["B.Tech","M.Tech","PhD"],fees:2e5,description:"Indian Institute of Technology Delhi is one of India's premier engineering institutions offering world-class education in technology, science, and management. Known for its rigorous curriculum and top-tier placements.",highestPackage:60,averagePackage:18},{name:"NIT Trichy",slug:f("NIT Trichy"),state:"Tamil Nadu",city:"Tiruchirappalli",courses:["B.Tech","M.Tech","MBA"],fees:15e4,description:"National Institute of Technology Tiruchirappalli is one of the top NITs in India, renowned for its academic excellence and strong alumni network across global tech companies.",highestPackage:45,averagePackage:14},{name:"VIT Vellore",slug:f("VIT Vellore"),state:"Tamil Nadu",city:"Vellore",courses:["B.Tech","M.Tech","MBA","MCA"],fees:175e3,description:"Vellore Institute of Technology is a deemed university offering top engineering programs with excellent industry connections and a vibrant campus life.",highestPackage:44,averagePackage:8},{name:"BITS Pilani",slug:f("BITS Pilani"),state:"Rajasthan",city:"Pilani",courses:["B.Tech","B.E.","M.Tech","MBA"],fees:25e4,description:"Birla Institute of Technology and Science, Pilani is a prestigious private engineering university famous for its Practice School program and strong industry-academia connect.",highestPackage:50,averagePackage:16},{name:"DTU Delhi",slug:f("DTU Delhi"),state:"Delhi",city:"New Delhi",courses:["B.Tech","M.Tech","MBA"],fees:85e3,description:"Delhi Technological University (formerly DCE) is one of Delhi's top engineering colleges offering affordable yet quality technical education with strong corporate placements.",highestPackage:40,averagePackage:12},{name:"SRM Institute of Science and Technology",slug:f("SRM Institute of Science and Technology"),state:"Tamil Nadu",city:"Chennai",courses:["B.Tech","M.Tech","MBA","BCA"],fees:2e5,description:"SRM Institute is a top-ranked private university offering diverse engineering programs with state-of-the-art facilities and strong global placement support.",highestPackage:35,averagePackage:7},{name:"AIIMS New Delhi",slug:f("AIIMS New Delhi"),state:"Delhi",city:"New Delhi",courses:["MBBS","MD","MS","PhD"],fees:5e3,description:"All India Institute of Medical Sciences, New Delhi is the most prestigious medical institution in India, offering world-class healthcare education and research opportunities.",highestPackage:25,averagePackage:15},{name:"JIPMER Puducherry",slug:f("JIPMER Puducherry"),state:"Puducherry",city:"Puducherry",courses:["MBBS","MD","MS"],fees:1e4,description:"Jawaharlal Institute of Postgraduate Medical Education and Research is a premier central government medical college offering top-quality medical education with low fees.",highestPackage:22,averagePackage:12},{name:"Maulana Azad Medical College",slug:f("Maulana Azad Medical College"),state:"Delhi",city:"New Delhi",courses:["MBBS","MD","MS"],fees:25e3,description:"Maulana Azad Medical College is one of India's oldest and most renowned government medical colleges, known for its clinical training and research infrastructure.",highestPackage:20,averagePackage:10},{name:"CMC Vellore",slug:f("CMC Vellore"),state:"Tamil Nadu",city:"Vellore",courses:["MBBS","MD","MS","Nursing"],fees:12e4,description:"Christian Medical College, Vellore is a globally recognized medical institution known for its commitment to service, excellence in medical education, and groundbreaking research.",highestPackage:28,averagePackage:14},{name:"Grant Medical College Mumbai",slug:f("Grant Medical College Mumbai"),state:"Maharashtra",city:"Mumbai",courses:["MBBS","MD","MS"],fees:4e4,description:"Grant Medical College is one of Mumbai's oldest government medical colleges, affiliated with JJ Hospital, providing excellent clinical training in a large hospital setting.",highestPackage:18,averagePackage:10},{name:"Kasturba Medical College Mangalore",slug:f("Kasturba Medical College Mangalore"),state:"Karnataka",city:"Mangalore",courses:["MBBS","MD","MS"],fees:7e5,description:"Kasturba Medical College is a premier private medical institution part of Manipal Academy, offering world-class MBBS education with strong clinical exposure.",highestPackage:20,averagePackage:12},{name:"IIM Ahmedabad",slug:f("IIM Ahmedabad"),state:"Gujarat",city:"Ahmedabad",courses:["MBA","PGPM","PhD"],fees:25e5,description:"Indian Institute of Management Ahmedabad is India's top business school, consistently ranked among the best globally. Known for its case-based learning and record-breaking placements.",highestPackage:120,averagePackage:35},{name:"IIM Bangalore",slug:f("IIM Bangalore"),state:"Karnataka",city:"Bangalore",courses:["MBA","PGPM","Executive MBA"],fees:24e5,description:"IIM Bangalore is one of India's top business schools, known for its entrepreneurship culture, strong faculty, and outstanding corporate placements.",highestPackage:110,averagePackage:32},{name:"ISB Hyderabad",slug:f("ISB Hyderabad"),state:"Telangana",city:"Hyderabad",courses:["MBA","PGP","Executive MBA"],fees:3e6,description:"Indian School of Business offers a globally acclaimed one-year MBA program with an international faculty and exceptional placement outcomes at top MNCs.",highestPackage:100,averagePackage:30},{name:"XLRI Jamshedpur",slug:f("XLRI Jamshedpur"),state:"Jharkhand",city:"Jamshedpur",courses:["MBA","BM","HRM"],fees:2e6,description:"XLRI Xavier School of Management is one of India's oldest and most respected business schools, known for its Human Resources and Business Management programs.",highestPackage:80,averagePackage:28},{name:"FMS Delhi University",slug:f("FMS Delhi University"),state:"Delhi",city:"New Delhi",courses:["MBA","Executive MBA"],fees:5e4,description:"Faculty of Management Studies, Delhi University offers one of India's best MBA programs at the most affordable fees, making it the best ROI business school in India.",highestPackage:75,averagePackage:25},{name:"MDI Gurgaon",slug:f("MDI Gurgaon"),state:"Haryana",city:"Gurugram",courses:["MBA","PGPM","Executive MBA"],fees:195e4,description:"Management Development Institute Gurgaon is a top-10 business school in India known for its strong industry connections and excellent national and international placements.",highestPackage:70,averagePackage:22},{name:"NID Ahmedabad",slug:f("NID Ahmedabad"),state:"Gujarat",city:"Ahmedabad",courses:["Design","B.Des","M.Des"],fees:25e4,description:"National Institute of Design, Ahmedabad is India's most prestigious design school, offering programs in industrial, communication, and textile design with a world-renowned faculty.",highestPackage:25,averagePackage:10},{name:"NIFT Delhi",slug:f("NIFT Delhi"),state:"Delhi",city:"New Delhi",courses:["Design","Fashion Design","B.Des","M.Des"],fees:18e4,description:"National Institute of Fashion Technology Delhi is India's leading fashion design institution, shaping careers in fashion, accessories, textile, and apparel design.",highestPackage:20,averagePackage:8},{name:"Symbiosis Institute of Design",slug:f("Symbiosis Institute of Design"),state:"Maharashtra",city:"Pune",courses:["Design","B.Des","Fashion Design"],fees:35e4,description:"SID Pune is one of the premier private design schools in India offering industry-aligned programs in communication design, fashion, and industrial design.",highestPackage:18,averagePackage:7},{name:"Pearl Academy Delhi",slug:f("Pearl Academy Delhi"),state:"Delhi",city:"New Delhi",courses:["Design","Fashion Design","Media","Business"],fees:4e5,description:"Pearl Academy is a creative institution focused on design, fashion, media and business, known for international collaborations and strong industry placements.",highestPackage:15,averagePackage:6},{name:"MIT Institute of Design Pune",slug:f("MIT Institute of Design Pune"),state:"Maharashtra",city:"Pune",courses:["Design","B.Des","M.Des"],fees:28e4,description:"MIT Institute of Design offers innovative design programs with a focus on sustainability, technology integration, and design thinking across multiple disciplines.",highestPackage:14,averagePackage:6},{name:"National Law School Bangalore",slug:f("National Law School Bangalore"),state:"Karnataka",city:"Bangalore",courses:["Law","BA LLB","LLM"],fees:25e4,description:"National Law School of India University is the top-ranked law school in India, consistently producing India's finest legal minds, judges, and corporate lawyers.",highestPackage:30,averagePackage:18},{name:"NALSAR University of Law",slug:f("NALSAR University of Law"),state:"Telangana",city:"Hyderabad",courses:["Law","BA LLB","LLM","MBA"],fees:2e5,description:"NALSAR University of Law Hyderabad is ranked among the top NLUs in India, known for its rigorous legal education and strong placements at top law firms.",highestPackage:25,averagePackage:14},{name:"NLU Delhi",slug:f("NLU Delhi"),state:"Delhi",city:"New Delhi",courses:["Law","BA LLB","LLM"],fees:22e4,description:"National Law University Delhi is a premier NLU known for its exceptional academic faculty, mooting culture, and top placements at leading law firms and corporations.",highestPackage:28,averagePackage:16},{name:"Symbiosis Law School Pune",slug:f("Symbiosis Law School Pune"),state:"Maharashtra",city:"Pune",courses:["Law","BA LLB","BBA LLB","LLM"],fees:3e5,description:"Symbiosis Law School is a top private law school in India offering diverse law programs with strong industry exposure and international exchange opportunities.",highestPackage:22,averagePackage:10},{name:"Christ University School of Law",slug:f("Christ University School of Law"),state:"Karnataka",city:"Bangalore",courses:["Law","BA LLB","BBA LLB","LLM"],fees:18e4,description:"Christ University School of Law offers a vibrant academic environment with strong moot court training, legal aid clinics, and excellent internship opportunities.",highestPackage:18,averagePackage:8},{name:"Tbilisi State Medical University",slug:f("Tbilisi State Medical University"),state:"Georgia",city:"Tbilisi",courses:["Abroad MBBS","MBBS","MD"],fees:5e5,description:"Tbilisi State Medical University is one of Georgia's oldest and most prestigious medical universities, recognized by NMC and WHO, offering English-medium MBBS at affordable costs.",highestPackage:15,averagePackage:8},{name:"Kazakh-Russian Medical University",slug:f("Kazakh-Russian Medical University"),state:"Kazakhstan",city:"Almaty",courses:["Abroad MBBS","MBBS","MD"],fees:4e5,description:"KRMU Almaty is a top-ranked medical university in Kazakhstan offering NMC-recognized MBBS programs in English with modern hospital infrastructure and affordable fees.",highestPackage:12,averagePackage:7},{name:"Vinnitsa National Medical University",slug:f("Vinnitsa National Medical University"),state:"Ukraine",city:"Vinnytsia",courses:["Abroad MBBS","MBBS","MD"],fees:35e4,description:"VNMU Ukraine is a renowned state medical university offering NMC-approved MBBS education with clinical training at large teaching hospitals at very affordable fees.",highestPackage:12,averagePackage:7},{name:"Belarusian State Medical University",slug:f("Belarusian State Medical University"),state:"Belarus",city:"Minsk",courses:["Abroad MBBS","MBBS","MD"],fees:38e4,description:"BSMU is one of Belarus's top medical institutions offering English-medium MBBS programs with state-of-the-art facilities and high-quality clinical training.",highestPackage:13,averagePackage:7},{name:"Ternopil National Medical University",slug:f("Ternopil National Medical University"),state:"Ukraine",city:"Ternopil",courses:["Abroad MBBS","MBBS"],fees:3e5,description:"TNMU is a well-known NMC-recognized medical university in Ukraine, popular among Indian students for its strong clinical training, English medium, and affordable fee structure.",highestPackage:11,averagePackage:6},{name:"Davao Medical School Foundation",slug:f("Davao Medical School Foundation"),state:"Philippines",city:"Davao",courses:["Abroad MBBS","MBBS","MD"],fees:6e5,description:"DMSF Philippines is a leading medical college offering WHO-recognized MD (equivalent to MBBS) programs in English with excellent clinical exposure.",highestPackage:14,averagePackage:8}],M=[{name:"JEE Main 2025",slug:"jee-main-2025",date:new Date("2025-04-15"),description:"Joint Entrance Examination (JEE) Main is the gateway to admission in NITs, IIITs, and other centrally funded technical institutions. It is also the qualifying exam for JEE Advanced (IITs). The exam is conducted in two sessions — January and April.",eligibility:"10+2 or equivalent with PCM. Minimum 75% marks (65% for SC/ST). Age limit: must have been born on or after October 1, 2000.",listing_mode:"Online"},{name:"NEET UG 2025",slug:"neet-ug-2025",date:new Date("2025-05-04"),description:"National Eligibility cum Entrance Test (NEET-UG) is the single entrance exam for admission to MBBS, BDS, BAMS, BSMS, BUMS, and BHMS courses in all medical colleges across India. Conducted by NTA, it is the most competitive medical entrance exam in India.",eligibility:"10+2 with PCB (Physics, Chemistry, Biology). Minimum 50% aggregate marks (40% for SC/ST/OBC). Age: 17-25 years (relaxation for reserved categories).",listing_mode:"Offline"},{name:"CAT 2025",slug:"cat-2025",date:new Date("2025-11-30"),description:"Common Admission Test (CAT) is India's premier MBA entrance examination, conducted by the IIMs on a rotational basis. CAT scores are accepted by all IIMs and over 1,200 B-schools across India. It tests Verbal Ability, Data Interpretation, Logical Reasoning, and Quantitative Aptitude.",eligibility:"Bachelor's degree in any discipline with minimum 50% marks (45% for SC/ST/PWD) from a recognized university. Final year students can also apply.",listing_mode:"Online"},{name:"CLAT 2025",slug:"clat-2025",date:new Date("2025-12-01"),description:"Common Law Admission Test (CLAT) is a centralized national entrance test for admission to undergraduate (BA LLB) and postgraduate (LLM) law programs offered by 23 National Law Universities across India. It tests English, GK, Legal Reasoning, Logical Reasoning, and Maths.",eligibility:"For UG: 10+2 with minimum 45% marks (40% for SC/ST). For PG: LLB with minimum 50% marks. Age: No upper limit for UG from 2023 onwards.",listing_mode:"Offline"},{name:"NIFT Entrance Test 2025",slug:"nift-entrance-test-2025",date:new Date("2026-01-25"),description:"NIFT Entrance Test is conducted by the National Institute of Fashion Technology for admission to its B.Des, M.Des, B.FTech, and MFM programs. The test includes a Creative Ability Test (CAT) and General Ability Test (GAT), along with a Situation Test for B.Des programs.",eligibility:"10+2 in any stream from a recognized board. For B.FTech: PCM background preferred. No specific percentage requirement.",listing_mode:"Online"},{name:"GATE 2026",slug:"gate-2026",date:new Date("2026-02-08"),description:"Graduate Aptitude Test in Engineering (GATE) is a national-level exam for admission to M.Tech/MS/PhD programs at IITs, NITs, and IIITs. GATE scores are also used by PSUs like BHEL, ONGC, NTPC, and IOCL for recruitment to engineering positions.",eligibility:"Bachelor's degree in Engineering/Technology/Architecture or Master's degree in Science/Mathematics/Statistics/Computer Applications. Final year students can apply.",listing_mode:"Online"}],v=[{title:"Top 10 Engineering Colleges in India 2025: Complete Rankings",slug:"top-10-engineering-colleges-india-2025",content:`Choosing the right engineering college is one of the most important decisions in a student's life. With hundreds of options available across India, it can be overwhelming to narrow down your choices. This comprehensive guide covers the top 10 engineering colleges in India for 2025 based on placement records, faculty quality, research output, and infrastructure.

## 1. IIT Bombay
Indian Institute of Technology Bombay consistently ranks as one of India's top engineering institutions. With an average placement package exceeding ₹20 LPA and the highest packages crossing ₹1 crore, IIT Bombay attracts the best engineering talent in the country.

## 2. IIT Delhi
Located in the capital, IIT Delhi is renowned for its cutting-edge research and excellent industry connections. The institution has strong ties with both Indian and international tech giants.

## 3. IIT Madras
Ranked #1 by NIRF for several years, IIT Madras stands out for its research ecosystem and entrepreneurship culture. The institution has a thriving startup incubator.

## 4. IIT Kharagpur
India's oldest IIT, IIT Kharagpur offers the widest range of engineering disciplines and is known for producing industry leaders and Nobel laureates.

## 5. BITS Pilani
The top private engineering college in India, BITS Pilani is known for its Practice School program, which gives students real industry experience at leading companies.

## 6. NIT Trichy
The top-ranked National Institute of Technology, NIT Trichy offers excellent engineering education with placement records rivaling several IITs.

## 7. VIT Vellore
One of India's most sought-after private engineering colleges, VIT is known for its international collaborations, diverse student community, and consistent placement record.

## 8. DTU Delhi
Delhi Technological University offers quality engineering education at an affordable cost, making it a top choice for Delhi students.

## 9. SRM Institute of Science and Technology
SRM is known for its industry-oriented curriculum and massive campus infrastructure. It attracts over 400 companies for campus placements.

## 10. Manipal Institute of Technology
MIT Manipal combines academic excellence with a vibrant campus culture. It consistently achieves 80%+ placement rates across all engineering disciplines.`,excerpt:"Discover India's top 10 engineering colleges for 2025 ranked by placements, faculty, and infrastructure. From IITs to top private colleges — find your perfect fit.",author:"Admission Expert",main_image:"https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80"},{title:"How to Crack JEE Main 2025 in First Attempt: Complete Strategy",slug:"how-to-crack-jee-main-2025-first-attempt",content:`JEE Main is one of the most competitive engineering entrance exams in India, with over 10 lakh students appearing each year for a limited number of seats. Cracking it in the first attempt requires smart planning, consistent effort, and the right strategy.

## Understanding the Exam Pattern

JEE Main consists of three subjects: Physics, Chemistry, and Mathematics. The paper has 90 questions (30 per subject) with both MCQ and numerical answer type questions. Total marks: 300.

## Subject-wise Strategy

### Physics
- Focus on Mechanics, Electrostatics, Optics, and Modern Physics — these form ~60% of questions
- Practice numerical problems daily
- Solve previous year papers topic-wise

### Chemistry
- Organic Chemistry reactions are the most important — memorize named reactions
- Physical Chemistry requires strong Mathematics fundamentals
- NCERT is gold for Inorganic Chemistry

### Mathematics
- Calculus, Coordinate Geometry, and Algebra are high-weightage topics
- Practice at least 50 problems daily
- Focus on accuracy over speed initially

## Preparation Timeline

**6 Months Before Exam:**
- Complete NCERT thoroughly
- Start solving JEE Main previous year papers

**3 Months Before:**
- Full mock tests every week
- Identify and strengthen weak areas

**1 Month Before:**
- Daily revision of formulas and reactions
- Maintain error log and review mistakes

## Important Tips
1. Solve at least 5 full mock tests before the exam
2. Manage time: aim for 50-55 minutes per subject
3. Attempt questions you are 100% sure about first
4. Leave questions where you might get negative marks`,excerpt:"Complete study strategy to crack JEE Main 2025 in your first attempt — subject-wise tips, time management, and mock test strategy from exam experts.",author:"JEE Expert",main_image:"https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80"},{title:"MBBS vs BDS: Which Medical Career is Right for You?",slug:"mbbs-vs-bds-which-is-better",content:`Both MBBS (Bachelor of Medicine and Bachelor of Surgery) and BDS (Bachelor of Dental Surgery) are prestigious medical degrees in India. If you've qualified NEET and are confused between the two, this detailed comparison will help you make an informed decision.

## MBBS at a Glance
- Duration: 5.5 years (including 1-year internship)
- Seats: ~1.02 lakh seats across government and private colleges
- Career: Physician, Surgeon, Specialist Doctor
- Average Salary: ₹8–25 LPA (government) to ₹50+ LPA (private specialists)

## BDS at a Glance
- Duration: 5 years (including 1-year internship)
- Seats: ~26,000 seats
- Career: Dentist, Orthodontist, Oral Surgeon
- Average Salary: ₹5–15 LPA, can go up to ₹50+ LPA for specialists

## Key Differences

| Factor | MBBS | BDS |
|--------|------|-----|
| Scope | Broader medical scope | Focused on oral health |
| Admission | Highly competitive | Comparatively easier |
| Fees | ₹5K–24L (Govt to Private) | ₹2L–20L |
| Specialization Options | 50+ MD/MS specialties | 9 MDS specialties |
| Govt Job Opportunities | More | Fewer |

## Which Should You Choose?

**Choose MBBS if:**
- You want a wide scope of practice
- You want more specialization options
- Your NEET rank allows for a good government college

**Choose BDS if:**
- Your NEET rank doesn't qualify for MBBS
- You are genuinely interested in dental sciences
- You want to set up your own practice relatively quickly`,excerpt:"MBBS vs BDS — a detailed comparison of fees, career scope, salary, and admission difficulty to help you make the right decision after NEET.",author:"Medical Counselor",main_image:"https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80"},{title:"MBA Scholarships in India 2025: Complete List and How to Apply",slug:"mba-scholarships-india-2025",content:`An MBA from a top business school is a significant investment, with fees ranging from ₹5 lakh to ₹25 lakh. However, numerous scholarships are available to ease the financial burden for deserving students. Here is a comprehensive list of MBA scholarships available in India for 2025.

## IIM Scholarships

**Merit-cum-Need Scholarship (IIMs)**
- Available at all IIMs
- Up to 100% tuition fee waiver
- Criteria: Annual family income below ₹3 lakh + academic merit

**NC-OBC Scholarships**
- For OBC candidates from non-creamy layer
- Monthly stipend of ₹4,500 to ₹8,000

## Private B-School Scholarships

**ISB Merit Scholarship**
- For exceptional GMAT/GRE scorers
- Up to ₹15 lakh scholarship

**XLRI Scholarship for Women in Management**
- Encourages women in business
- ₹1–3 lakh per year

## Government Scholarships

**Central Sector Scheme of Scholarships**
- For students from families with annual income below ₹8 lakh
- ₹12,000 per year

**Post-Matric Scholarships (SC/ST/OBC)**
- Full fee reimbursement + living allowance

## How to Apply for MBA Scholarships

1. **Research early**: Most scholarships have deadlines 3-6 months before admission
2. **Maintain academic record**: Most scholarships require 60%+ in graduation
3. **Prepare documents**: Income certificate, caste certificate, ID proof, academic transcripts
4. **Write a strong SOP**: Your Statement of Purpose can be the difference-maker
5. **Apply to multiple scholarships**: Don't put all eggs in one basket`,excerpt:"Complete guide to MBA scholarships in India 2025 — IIM scholarships, government schemes, and private B-school grants. Learn how to apply and maximize your chances.",author:"MBA Advisor",main_image:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"},{title:"How to Get an Education Loan in India: Step-by-Step Guide 2025",slug:"education-loan-guide-india-2025",content:`An education loan can be your ticket to a top college when funds are limited. With education costs rising every year, knowing how to navigate the loan process is crucial. Here is a complete guide to getting an education loan in India in 2025.

## Types of Education Loans

### Secured Loans (with collateral)
- Loan amount: ₹7.5 lakh and above
- Interest rate: 8.5%–11% per annum
- Requires property, FD, or insurance as collateral

### Unsecured Loans (without collateral)
- Loan amount: Up to ₹7.5 lakh
- Interest rate: 10%–15% per annum
- No collateral required

## Top Banks Offering Education Loans

1. **State Bank of India (SBI Scholar Loan)** — Best for IIT/NIT students
2. **Bank of Baroda (Baroda Vidya Loan)** — Best interest rates for government colleges
3. **HDFC Credila** — Best for private engineering and MBA colleges
4. **Avanse Financial Services** — Flexible repayment options
5. **Axis Bank Education Loan** — Quick processing

## Required Documents
- KYC documents (Aadhaar, PAN)
- Admission letter from the college
- Fee structure / fee receipt
- Academic records (10th, 12th, Graduation)
- Income proof of co-applicant (salary slips, ITR)
- Collateral documents (for secured loans)

## Step-by-Step Application Process

1. Compare loan offers from multiple banks
2. Check eligibility on bank website
3. Fill online application form
4. Submit documents to the nearest branch
5. Bank conducts verification (7-15 days)
6. Loan sanction and disbursement

## Tax Benefit
Under Section 80E of Income Tax Act, the entire interest paid on education loan is tax-deductible for up to 8 years.`,excerpt:"Step-by-step guide to getting an education loan in India in 2025 — best banks, interest rates, required documents, and tips to get quick approval.",author:"Finance Expert",main_image:"https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80"},{title:"Abroad MBBS 2025: Best Countries for Indian Students",slug:"abroad-mbbs-best-countries-2025",content:`With less than 1 lakh MBBS seats in India for over 20 lakh NEET aspirants, studying MBBS abroad has become a popular and legitimate option. Countries like Russia, Georgia, Kazakhstan, and the Philippines offer NMC-recognized MBBS programs at a fraction of the cost of private Indian colleges.

## Why Study MBBS Abroad?

- **Cost**: ₹25–60 lakh total (vs ₹70 lakh–1.5 crore in private Indian colleges)
- **No Donation**: Strictly merit-based admission, no capitation fees
- **English Medium**: Most universities teach in English
- **WHO & NMC Recognition**: Eligible to return and practice in India after passing FMGE

## Top Countries for MBBS Abroad

### 1. Russia
- Average Cost: ₹30–45 lakh
- Duration: 6 years
- Top Universities: Kazan Federal, Sechenov University, RUDN
- Pros: Strong medical education tradition, large Indian student community

### 2. Georgia
- Average Cost: ₹25–40 lakh
- Duration: 6 years
- Top Universities: Tbilisi State Medical, David Tvildiani Medical
- Pros: Affordable, safe, English-medium, European exposure

### 3. Kazakhstan
- Average Cost: ₹25–35 lakh
- Duration: 5 years
- Top Universities: KRMU, Astana Medical University
- Pros: Cheapest option, NMC recognized, good clinical exposure

### 4. Philippines
- Average Cost: ₹35–55 lakh
- Duration: 5.5 years (BS pre-med + MD)
- Top Universities: DMSF Davao, UV Gullas College
- Pros: English medium, similar culture, American medical education system

### 5. Ukraine (limited post-war situation)
- Check current safety status before applying
- Best universities: Kharkiv NMU, Vinnitsa NMU

## Important: FMGE / NExT Exam
To practice medicine in India after studying abroad, you must pass the Foreign Medical Graduate Examination (FMGE) or the upcoming National Exit Test (NExT). Pass rate is approximately 15-20% — prepare rigorously.`,excerpt:"Complete guide to studying MBBS abroad in 2025 — best countries, top universities, total costs, and what you need to know about returning to India.",author:"Study Abroad Counselor",main_image:"https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80"}],b=[{title:"College Finder",description:"Your smart guide to finding the best-fit college tailored to your needs.",icon:"Search",cta:"Discover Now",slug:"college-finder"},{title:"Scholarship Program",description:"Grab up to 100% scholarships to fund your dream education.",icon:"Banknote",cta:"Apply Now",slug:"scholarship-program"},{title:"Application Process",description:"Apply to multiple colleges through a single, streamlined admission process.",icon:"FileText",cta:"Join Now",slug:"application-process"},{title:"Campus Achiever",description:"Unlock exclusive campus opportunities and excel in your academic journey.",icon:"Building2",cta:"Get Started",slug:"campus-achiever"},{title:"Education Loan",description:"Turn dreams into reality with easy and accessible education loans.",icon:"BadgeIndianRupee",cta:"Apply Now",slug:"education-loan"},{title:"Re-admission",description:"Simplified re-admission services to get you back on track effortlessly.",icon:"GraduationCap",cta:"Register Now",slug:"re-admission"}],S=e=>new Date(Date.UTC(2026,10,10)-864e5*e).toISOString(),B=[["Aditya Raj","aditya.raj@example.com","9876012345","Bihar","B.Tech","Looking for NIT or good private B.Tech colleges under 2 lakh per year.","Homepage popup","new"],["Sana Parveen","sana.p@example.com","9934123456","Jharkhand","MBBS","Need guidance on NEET counselling and private medical colleges.","Contact Page","contacted"],["Rohit Kumar","rohit.kumar@example.com","9123409876","Uttar Pradesh","MBA","CAT 92 percentile, which B-schools should I target?","Course page","new"],["Kritika Singh","kritika.s@example.com","9801456789","Bihar","BBA","Scholarship options for BBA in Delhi NCR.","Services","converted"],["Mohit Jha","mohit.jha@example.com","9572098765","West Bengal","B.Tech","Lateral entry for diploma holders?","Contact Page","contacted"],["Ananya Gupta","ananya.g@example.com","9708765432","Delhi","Law","CLAT 2026 prep and NLU cutoffs.","Homepage popup","new"],["Farhan Ali","farhan.ali@example.com","9955012340","Bihar","Education Loan","Need an education loan for B.Tech in Bangalore.","Services","new"]];t=function(){let e=y.map((e,a)=>({id:`col-${a+1}`,name:e.name,slug:e.slug,state:e.state,city:e.city,courses:e.courses,fees:e.fees,description:e.description,images:[],highest_package:e.highestPackage??null,average_package:e.averagePackage??null,created_at:S(a),updated_at:S(a)})),a=M.map((e,a)=>({id:`exam-${a+1}`,name:e.name,slug:e.slug,date:new Date(e.date).toISOString(),description:e.description,eligibility:e.eligibility,listing_mode:e.listing_mode,created_at:S(a),updated_at:S(a)})),i=v.map((e,a)=>({id:`blog-${a+1}`,author:"CampusPath Admissions Team",excerpt:"",main_image:"",...e,created_at:S(3*a),updated_at:S(3*a)})),t=b.map((e,a)=>({id:`svc-${a+1}`,title:e.title,slug:e.slug,short_description:e.description,full_description:e.description,icon:e.icon,image:"",features:[],benefits:[],process_steps:[],faqs:[],cta_text:e.cta,is_active:!0,order:a+1,created_at:S(a),updated_at:S(a)}));return{colleges:e,exams:a,blogs:i,services:t,leads:B.map(([e,a,i,t,s,n,r,o],l)=>({id:`lead-${l+1}`,name:e,email:a,phone:i,state:t,interested_course:s,message:n,source:r,status:o,created_at:S(l),updated_at:S(l)})),site_settings:[{id:"settings-main",key:"main",about_mission:"To make college admission simple, transparent and affordable for every student in India.",about_vision:"A trusted admission partner in every district, guiding students from shortlisting to enrollment.",about_stats:[{label:"Students guided",value:"12,000+"},{label:"Partner colleges",value:"450+"},{label:"Scholarships secured",value:"₹3 Cr+"},{label:"States covered",value:"18"}],about_why_us:[{title:"Unbiased counselling",description:"We shortlist colleges on fit, fees and placements, not commissions."},{title:"End-to-end support",description:"Applications, documents, scholarships and loans handled in one place."}],hero_images:[],hero_title:"",hero_subtitle:"",updated_at:S(0)}]}},a.default.env.NEXT_PUBLIC_SUPABASE_URL,a.default.env.SUPABASE_SERVICE_ROLE_KEY;let I=m();function k(e){return e?{_id:e.id,id:e.id,name:e.name,slug:e.slug,state:e.state,city:e.city,courses:e.courses??[],fees:e.fees,description:e.description,images:e.images??[],highestPackage:e.highest_package,averagePackage:e.average_package,createdAt:e.created_at,updatedAt:e.updated_at}:null}function w(e){return e?{_id:e.id,id:e.id,name:e.name,slug:e.slug,date:e.date,description:e.description,eligibility:e.eligibility,listing_mode:e.listing_mode,createdAt:e.created_at,updatedAt:e.updated_at}:null}function T(e){return e?{_id:e.id,id:e.id,title:e.title,slug:e.slug,content:e.content,excerpt:e.excerpt,author:e.author,main_image:e.main_image,createdAt:e.created_at,updatedAt:e.updated_at}:null}function A(e){return e?{_id:e.id,id:e.id,name:e.name,email:e.email,phone:e.phone,state:e.state,interestedCourse:e.interested_course,message:e.message,source:e.source,status:e.status,createdAt:e.created_at,updatedAt:e.updated_at}:null}function P(e){return e?{_id:e.id,id:e.id,title:e.title,slug:e.slug,shortDescription:e.short_description,fullDescription:e.full_description,icon:e.icon,image:e.image,features:e.features??[],benefits:e.benefits??[],processSteps:e.process_steps??[],faqs:e.faqs??[],ctaText:e.cta_text,isActive:e.is_active,order:e.order,createdAt:e.created_at,updatedAt:e.updated_at}:null}function D(e){return e?{_id:e.id,key:e.key,aboutMission:e.about_mission,aboutVision:e.about_vision,aboutStats:e.about_stats??[],aboutWhyUs:e.about_why_us??[],heroImages:e.hero_images??[],heroTitle:e.hero_title??"",heroSubtitle:e.hero_subtitle??"",updatedAt:e.updated_at}:null}e.s(["supabase",0,I,"toBlog",()=>T,"toCollege",()=>k,"toExam",()=>w,"toLead",()=>A,"toService",()=>P,"toSettings",()=>D],7471)},3363,e=>{"use strict";var a=e.i(71645),i=e.i(98390);let t=new Map;function s(e,s){let n=e+"@"+(0,i.demoVersion)(),r=t.get(n);return r||(r=Promise.resolve().then(s),t.set(n,r)),(0,a.use)(r)}e.s(["demoUse",()=>s])},15288,e=>{"use strict";var a=e.i(43476),i=e.i(75157);function t({className:e,...t}){return(0,a.jsx)("div",{"data-slot":"card",className:(0,i.cn)("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",e),...t})}function s({className:e,...t}){return(0,a.jsx)("div",{"data-slot":"card-header",className:(0,i.cn)("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",e),...t})}function n({className:e,...t}){return(0,a.jsx)("div",{"data-slot":"card-title",className:(0,i.cn)("leading-none font-semibold",e),...t})}function r({className:e,...t}){return(0,a.jsx)("div",{"data-slot":"card-description",className:(0,i.cn)("text-muted-foreground text-sm",e),...t})}function o({className:e,...t}){return(0,a.jsx)("div",{"data-slot":"card-content",className:(0,i.cn)("px-6",e),...t})}function l({className:e,...t}){return(0,a.jsx)("div",{"data-slot":"card-footer",className:(0,i.cn)("flex items-center px-6 [.border-t]:pt-6",e),...t})}e.s(["Card",()=>t,"CardContent",()=>o,"CardDescription",()=>r,"CardFooter",()=>l,"CardHeader",()=>s,"CardTitle",()=>n])},65462,e=>{"use strict";var a=e.i(43476),i=e.i(15288),t=e.i(7471),s=e.i(63544),n=e.i(61911);let r=(0,e.i(75254).default)("user-plus",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]]);var o=e.i(18566),l=e.i(3363);async function c(){let[{count:e},{count:a},{count:i}]=await Promise.all([t.supabase.from("colleges").select("*",{count:"exact",head:!0}),t.supabase.from("leads").select("*",{count:"exact",head:!0}),t.supabase.from("leads").select("*",{count:"exact",head:!0}).eq("status","new")]);return{collegeCount:e??0,leadCount:a??0,newLeadsCount:i??0}}function d(){let e=(0,o.useSearchParams)(),t=window.location.pathname+"?"+e.toString(),{collegeCount:d,leadCount:u,newLeadsCount:g}=(0,l.demoUse)(t+"#0",()=>c());return(0,a.jsxs)("div",{className:"space-y-4",children:[(0,a.jsx)("h2",{className:"text-3xl font-bold tracking-tight",children:"Dashboard"}),(0,a.jsxs)("div",{className:"grid gap-4 md:grid-cols-3",children:[(0,a.jsxs)(i.Card,{children:[(0,a.jsxs)(i.CardHeader,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[(0,a.jsx)(i.CardTitle,{className:"text-sm font-medium",children:"Total Colleges"}),(0,a.jsx)(s.School,{className:"h-4 w-4 text-muted-foreground"})]}),(0,a.jsx)(i.CardContent,{children:(0,a.jsx)("div",{className:"text-2xl font-bold",children:d})})]}),(0,a.jsxs)(i.Card,{children:[(0,a.jsxs)(i.CardHeader,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[(0,a.jsx)(i.CardTitle,{className:"text-sm font-medium",children:"Total Leads"}),(0,a.jsx)(n.Users,{className:"h-4 w-4 text-muted-foreground"})]}),(0,a.jsx)(i.CardContent,{children:(0,a.jsx)("div",{className:"text-2xl font-bold",children:u})})]}),(0,a.jsxs)(i.Card,{children:[(0,a.jsxs)(i.CardHeader,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[(0,a.jsx)(i.CardTitle,{className:"text-sm font-medium",children:"New Leads"}),(0,a.jsx)(r,{className:"h-4 w-4 text-muted-foreground"})]}),(0,a.jsx)(i.CardContent,{children:(0,a.jsx)("div",{className:"text-2xl font-bold",children:g})})]})]})]})}e.s(["default",()=>d],65462)}]);
import type { SoftwareDemo } from "./software-demo";

// Content for /automation. Every company, person and figure in the examples is illustrative.

type Node = readonly [label: string, sample: string];

export type AutomationFlow = {
  trigger: Node;
  thinking: readonly [Node, Node];
  actions: readonly [Node, Node, Node];
  result: Node;
};

export type Department = {
  id: string;
  label: string;
  icon: string;
  title: string;
  outcome: string;
  automations: readonly (readonly [name: string, description: string])[];
  workflow: readonly [string, string, string];
  flow: AutomationFlow;
  demo: SoftwareDemo;
};

export const DEPARTMENTS = [
  {
    id: "marketing",
    label: "Marketing",
    icon: "visibility",
    title: "AI marketing automation",
    outcome: "Plan, publish and measure campaigns while AI handles the repetitive work: drafts, scheduling, lead scoring and weekly reports.",
    automations: [
      ["Content drafts from one brief", "Turn a product brief into captions, ad copy and an email draft in your brand voice, ready for a person to approve."],
      ["Social scheduling", "Queue approved posts on Instagram, Facebook and LinkedIn for the times your audience is most active."],
      ["Lead capture & scoring", "Pull leads from ads and forms into one list and score them by budget, location and intent."],
      ["Campaign reporting", "Collect spend, reach and leads every Monday and send the team a plain-language summary."],
      ["Review replies", "Draft polite replies to new Google reviews and flag negative ones for a manager."],
    ],
    workflow: ["A lead fills in an Instagram ad form.", "AI scores the lead and drafts a personal reply.", "The lead gets a WhatsApp reply and sales gets a hot-lead alert."],
    flow: {
      trigger: ["Instagram lead form", "Riya · 2BHK interiors · Pune"],
      thinking: [["AI reads the enquiry", "Budget ₹6–8 lakh · moving in March"], ["AI scores intent", "Score 86/100 · hot lead"]],
      actions: [["WhatsApp reply", "Personal message in 40 seconds"], ["CRM record", "Lead created and tagged"], ["Sales alert", "Assigned to Kavya"]],
      result: ["Hot lead followed up", "In under a minute, with no manual work"],
    },
    demo: {
      workspace: "Bloom Interiors · Marketing AI",
      kpis: [
        { label: "Leads this month", value: 342, unit: "num", delta: "+28% vs Oct" },
        { label: "Cost per lead", value: 184, unit: "inr", delta: "−22% vs Oct" },
        { label: "Replied within 1 min", value: 97, unit: "pct", delta: "All channels" },
        { label: "Hours saved", value: 46, unit: "num", delta: "This month" },
      ],
      chart: { title: "Leads captured", values: [180, 205, 232, 260, 298, 288], bump: 22 },
      stages: ["New lead", "Scored & replied", "With sales"],
      record: { title: "Riya Shah · 2BHK interiors", detail: "Instagram ad · Pune", tag: "Score 86" },
      backlog: [
        { title: "Arjun Rao · Modular kitchen", detail: "Website form", tag: "New", stage: 0 },
        { title: "Meera Iyer · Full home", detail: "Score 74 · replied", tag: "Warm", stage: 1 },
        { title: "Sameer Khan · Office fit-out", detail: "Call booked Fri", tag: "Hot", stage: 2 },
      ],
      events: [
        "New lead from Instagram ad · details captured",
        "AI scored the lead 86/100 and sent a personal WhatsApp reply",
        "Hot lead assigned to Kavya with the full conversation",
      ],
      effects: [{ 0: 1 }, {}, { 3: 1 }],
    },
  },
  {
    id: "sales",
    label: "Sales",
    icon: "leads",
    title: "AI sales automation",
    outcome: "Answer every enquiry fast, keep follow-ups on schedule and let reps spend their time on conversations instead of admin.",
    automations: [
      ["Instant enquiry replies", "Answer new enquiries on WhatsApp, email or web chat within a minute, using your price list and FAQs."],
      ["Meeting booking", "Offer open slots from a rep’s calendar and confirm the meeting automatically."],
      ["Follow-up sequences", "Send timed reminders and nudge reps when a deal goes quiet."],
      ["Quote drafting", "Draft a quotation from the conversation and your rate card for a rep to check and send."],
      ["Call notes to CRM", "Summarise calls into next steps and update the deal record."],
    ],
    workflow: ["An enquiry arrives on WhatsApp.", "AI answers questions and books a demo call.", "After the call, AI drafts the quote and schedules follow-ups."],
    flow: {
      trigger: ["WhatsApp enquiry", "“Price for 50 office chairs?”"],
      thinking: [["AI checks the price list", "Model OC-12 · bulk rate"], ["AI books a call", "Thu 4:00 PM with Arjun"]],
      actions: [["Quote draft", "₹2,85,000 · ready to review"], ["CRM deal", "Stage: demo booked"], ["Follow-up", "Reminder in 2 days"]],
      result: ["Deal moving forward", "The rep only joins the call"],
    },
    demo: {
      workspace: "Northline Furniture · Sales AI",
      kpis: [
        { label: "Enquiries answered", value: 512, unit: "num", delta: "+19% vs Oct" },
        { label: "First reply", value: 1, unit: "min", delta: "Average" },
        { label: "Demos booked", value: 64, unit: "num", delta: "This month" },
        { label: "Pipeline value", value: 4820000, unit: "inr", delta: "+12% vs Oct" },
      ],
      chart: { title: "Deals won", values: [12, 15, 14, 18, 21, 19], bump: 2 },
      stages: ["Enquiry", "Call booked", "Quote sent"],
      record: { title: "50 office chairs · bulk order", detail: "Mehra Consultants", tag: "₹2,85,000" },
      backlog: [
        { title: "Standing desks × 12", detail: "Website chat", tag: "New", stage: 0 },
        { title: "Conference table", detail: "Call Mon 11 AM", tag: "₹1,40,000", stage: 1 },
        { title: "Cafeteria seating", detail: "Follow-up sent", tag: "₹3,60,000", stage: 2 },
      ],
      events: [
        "WhatsApp enquiry answered in 40 seconds with bulk prices",
        "Demo call booked for Thursday 4 PM with Arjun",
        "Quote drafted, approved by Arjun and sent · follow-up in 2 days",
      ],
      effects: [{ 0: 1 }, { 2: 1 }, { 3: 285000 }],
    },
  },
  {
    id: "operations",
    label: "Operations",
    icon: "workspaces",
    title: "AI operations automation",
    outcome: "Connect the tools your team already uses so orders, tasks and approvals move on their own and nothing waits in an inbox.",
    automations: [
      ["Order processing", "Read orders from email, WhatsApp or your store and create them in your system without retyping."],
      ["Approval routing", "Send requests to the right approver with the details they need and follow up politely."],
      ["Task assignment", "Create and assign tasks when something happens, with due dates and checklists."],
      ["Inventory alerts", "Watch stock levels and raise a purchase request before an item runs out."],
      ["Daily operations brief", "Send a morning summary of pending orders, delays and exceptions."],
    ],
    workflow: ["A purchase order arrives by email.", "AI extracts the items and checks stock.", "The order is created, dispatch is assigned and the customer is updated."],
    flow: {
      trigger: ["PO email with PDF", "PO-7781 · 120 units"],
      thinking: [["AI extracts line items", "3 items · deliver by 12 Nov"], ["AI checks stock", "2 in stock · 1 running low"]],
      actions: [["Order created", "SO-5520 in your ERP"], ["Dispatch task", "Assigned to the warehouse"], ["Purchase request", "Restock 40 units"]],
      result: ["Order ready to ship", "No manual data entry"],
    },
    demo: {
      workspace: "Sterling Supplies · Operations AI",
      kpis: [
        { label: "Orders auto-processed", value: 1148, unit: "num", delta: "This month" },
        { label: "Manual entry avoided", value: 92, unit: "pct", delta: "Of all orders" },
        { label: "Approvals pending", value: 6, unit: "num", delta: "2 overdue" },
        { label: "Order handling time", value: 8, unit: "min", delta: "Was 45 min" },
      ],
      chart: { title: "Orders processed", values: [620, 700, 760, 820, 910, 880], bump: 40 },
      stages: ["Received", "Checked", "Created & assigned"],
      record: { title: "PO-7781 · 120 units", detail: "Apex Retail · email", tag: "3 items" },
      backlog: [
        { title: "PO-7779 · Cartons", detail: "WhatsApp photo", tag: "Reading", stage: 0 },
        { title: "PO-7774 · Labels", detail: "Waiting for approval", tag: "Approval", stage: 1 },
        { title: "PO-7770 · Tape rolls", detail: "Dispatched today", tag: "Done", stage: 2 },
      ],
      events: [
        "PO-7781 received by email from Apex Retail · PDF attached",
        "3 line items read · 1 item running low, purchase request drafted",
        "Order SO-5520 created · dispatch assigned · customer emailed",
      ],
      effects: [{ 2: 1 }, {}, { 0: 1, 2: -1 }],
    },
  },
  {
    id: "inspection",
    label: "Inspection",
    icon: "shield",
    title: "AI inspection & quality automation",
    outcome: "Capture inspections with photos, let AI flag possible defects and route issues to the right person with the evidence attached.",
    automations: [
      ["Photo defect detection", "Check inspection photos for scratches, dents or missing parts and highlight what needs a closer look."],
      ["Digital checklists", "Replace paper forms with mobile checklists that work offline and record time stamps."],
      ["Non-conformance routing", "Open an issue for a failed check, attach the photos and assign it to the responsible team."],
      ["Supplier quality scores", "Track defects by supplier and batch and flag trends early."],
      ["Audit-ready reports", "Generate inspection reports with photos and sign-offs for customers or auditors."],
    ],
    workflow: ["An inspector photographs a finished batch.", "AI checks the photos and flags a possible defect.", "A quality issue is opened and the batch is held for review."],
    flow: {
      trigger: ["Inspector uploads photos", "Batch B-224 · 24 photos"],
      thinking: [["AI checks each photo", "22 clear · 2 flagged"], ["AI describes the defect", "Surface scratch · about 3 mm"]],
      actions: [["Batch on hold", "B-224 held in the system"], ["Issue opened", "NC-118 assigned to QA"], ["Supplier noted", "Coating batch C-17"]],
      result: ["Defect caught before shipping", "Photos and history in one record"],
    },
    demo: {
      workspace: "Precision Castings · Quality AI",
      kpis: [
        { label: "Inspections this month", value: 2640, unit: "num", delta: "+9% vs Oct" },
        { label: "First-pass yield", value: 96, unit: "pct", delta: "+2 pts" },
        { label: "Open issues", value: 9, unit: "num", delta: "3 high priority" },
        { label: "Defects caught early", value: 41, unit: "num", delta: "This month" },
      ],
      chart: { title: "Inspections completed", values: [1900, 2100, 2240, 2380, 2510, 2460], bump: 180 },
      stages: ["Inspected", "Flagged", "Issue opened"],
      record: { title: "Batch B-224 · valve bodies", detail: "24 photos · Line 2", tag: "2 flagged" },
      backlog: [
        { title: "Batch B-223 · flanges", detail: "All 18 photos clear", tag: "Passed", stage: 0 },
        { title: "Batch B-219 · housings", detail: "Porosity suspected", tag: "Review", stage: 1 },
        { title: "NC-116 · B-212", detail: "Rework in progress", tag: "QA", stage: 2 },
      ],
      events: [
        "24 photos uploaded for batch B-224 from Line 2",
        "AI flagged 2 photos: possible 3 mm surface scratch",
        "Issue NC-118 opened · batch held for QA review",
      ],
      effects: [{ 0: 1 }, { 3: 1 }, { 2: 1 }],
    },
  },
  {
    id: "finance",
    label: "Finance",
    icon: "reports",
    title: "AI finance & accounts automation",
    outcome: "Read invoices, match payments and chase dues automatically so your books stay current and month-end takes days, not weeks.",
    automations: [
      ["Invoice reading", "Read supplier invoices from email or photos and fill in vendor, GST, amounts and due dates."],
      ["Three-way matching", "Match invoices against purchase orders and goods receipts and flag mismatches."],
      ["Payment reminders", "Send polite reminders before and after due dates with a payment link."],
      ["Bank reconciliation", "Match bank entries to invoices and highlight anything unexplained."],
      ["Cash-flow summary", "Send a weekly view of what is due in, due out and overdue."],
    ],
    workflow: ["A supplier invoice arrives by email.", "AI reads it and matches it to the PO and goods receipt.", "The invoice is booked and queued for payment approval."],
    flow: {
      trigger: ["Invoice email", "INV-4410 · Shree Packaging"],
      thinking: [["AI reads the invoice", "₹1,18,000 incl. GST · due 20 Nov"], ["AI matches PO + receipt", "PO-3321 ✓ · GRN-908 ✓"]],
      actions: [["Booked in accounts", "Expense · packaging"], ["Payment queue", "Approval by finance head"], ["Supplier updated", "Payment date shared"]],
      result: ["Invoice ready to pay", "Matched in seconds, not hours"],
    },
    demo: {
      workspace: "Kavya Foods · Finance AI",
      kpis: [
        { label: "Invoices processed", value: 864, unit: "num", delta: "This month" },
        { label: "Matched automatically", value: 89, unit: "pct", delta: "+6 pts" },
        { label: "Payables due this week", value: 740000, unit: "inr", delta: "14 invoices" },
        { label: "Days to close the month", value: 3, unit: "num", delta: "Was 11" },
      ],
      chart: { title: "Invoices processed", values: [520, 580, 610, 690, 760, 740], bump: 60 },
      stages: ["Received", "Matched", "Booked"],
      record: { title: "INV-4410 · Shree Packaging", detail: "₹1,18,000 · due 20 Nov", tag: "PO-3321" },
      backlog: [
        { title: "INV-4407 · Spice Traders", detail: "Photo from WhatsApp", tag: "Reading", stage: 0 },
        { title: "INV-4402 · Cold Chain Co", detail: "Qty mismatch: 2 cases", tag: "Check", stage: 1 },
        { title: "INV-4398 · Print Hub", detail: "Paid 3 Nov", tag: "Settled", stage: 2 },
      ],
      events: [
        "Invoice INV-4410 received from Shree Packaging",
        "Amounts and GST read · matched to PO-3321 and GRN-908",
        "Booked to packaging expenses · queued for payment on 18 Nov",
      ],
      effects: [{ 0: 1 }, {}, { 2: 118000 }],
    },
  },
  {
    id: "support",
    label: "Customer support",
    icon: "connections",
    title: "AI customer support automation",
    outcome: "Answer common questions instantly in your customers’ language, route the rest to the right person and keep every conversation in one place.",
    automations: [
      ["24/7 AI replies", "Answer questions about orders, timings and policies on WhatsApp, chat and email using your own help content."],
      ["Order status lookup", "Fetch live order or booking status and reply without waiting for an agent."],
      ["Smart routing", "Detect urgency, language and topic and send the conversation to the right team."],
      ["Reply suggestions", "Draft answers for agents to check, edit and send."],
      ["Satisfaction tracking", "Ask for a rating after each conversation and flag unhappy customers."],
    ],
    workflow: ["A customer asks “Where is my order?” on WhatsApp.", "AI finds the order and replies with live tracking.", "A refund request is routed to an agent with the full history."],
    flow: {
      trigger: ["WhatsApp message", "“Mera order #8841 kahan hai?”"],
      thinking: [["AI understands the question", "Topic: delivery · Hindi"], ["AI looks up the order", "Out for delivery · today"]],
      actions: [["Instant reply", "Tracking link sent in Hindi"], ["Conversation logged", "Resolved automatically"], ["Escalation rule", "Refunds go to an agent"]],
      result: ["Customer answered", "In 20 seconds, any time of day"],
    },
    demo: {
      workspace: "UrbanKart · Support AI",
      kpis: [
        { label: "Conversations today", value: 1920, unit: "num", delta: "6 languages" },
        { label: "Resolved by AI", value: 74, unit: "pct", delta: "+8 pts" },
        { label: "Waiting for an agent", value: 18, unit: "num", delta: "Avg wait 3 min" },
        { label: "Happy customers", value: 94, unit: "pct", delta: "After chat" },
      ],
      chart: { title: "Conversations resolved by AI", values: [8200, 9100, 9800, 10400, 11600, 11200], bump: 600 },
      stages: ["New", "AI answered", "With an agent"],
      record: { title: "Order #8841 · Neha G.", detail: "WhatsApp · Hindi", tag: "Delivery" },
      backlog: [
        { title: "Size exchange · #8830", detail: "Email · English", tag: "New", stage: 0 },
        { title: "COD question · #8838", detail: "Answered in 15 sec", tag: "Resolved", stage: 1 },
        { title: "Damaged item · #8812", detail: "Agent Imran", tag: "Refund", stage: 2 },
      ],
      events: [
        "WhatsApp message in Hindi: “Where is my order #8841?”",
        "AI replied with live tracking in Hindi in 20 seconds",
        "Refund question routed to agent Imran with the full chat",
      ],
      effects: [{ 0: 1 }, {}, { 2: 1 }],
    },
  },
  {
    id: "hr",
    label: "HR",
    icon: "profile",
    title: "AI HR automation",
    outcome: "Screen applicants, onboard new joiners and answer policy questions automatically so HR can focus on people.",
    automations: [
      ["CV screening", "Read applications, compare them with the job requirements and shortlist candidates with reasons."],
      ["Interview scheduling", "Offer slots, confirm interviews and send reminders to candidates and the panel."],
      ["Onboarding checklists", "Collect documents, create accounts and assign day-one tasks automatically."],
      ["Leave & policy answers", "Answer questions about leave balances and policies on chat, at any time."],
      ["Attendance & payroll prep", "Flag missing attendance and prepare inputs for payroll review."],
    ],
    workflow: ["A candidate applies for a role.", "AI screens the CV and books an interview.", "The selected candidate gets an offer and an onboarding checklist."],
    flow: {
      trigger: ["New application", "Sales Executive · 214 applicants"],
      thinking: [["AI reads the CV", "3 years B2B sales · Pune"], ["AI scores the fit", "88% match · shortlisted"]],
      actions: [["Interview booked", "Tue 11:00 AM with Priya"], ["Candidate updated", "Confirmation on WhatsApp"], ["Panel briefed", "CV summary shared"]],
      result: ["Shortlist in hours", "Instead of a week of reading CVs"],
    },
    demo: {
      workspace: "Nimbus Logistics · HR AI",
      kpis: [
        { label: "Applications screened", value: 1326, unit: "num", delta: "This month" },
        { label: "Hours to shortlist", value: 6, unit: "num", delta: "Was 5 days" },
        { label: "Interviews this week", value: 38, unit: "num", delta: "Across 4 roles" },
        { label: "Joiners onboarding", value: 12, unit: "num", delta: "Docs 90% done" },
      ],
      chart: { title: "Applications screened", values: [640, 720, 810, 900, 1040, 980], bump: 90 },
      stages: ["Applied", "Shortlisted", "Interview booked"],
      record: { title: "Aman Verma · Sales Executive", detail: "3 years B2B sales", tag: "88% match" },
      backlog: [
        { title: "Pooja N. · Accountant", detail: "Applied via LinkedIn", tag: "New", stage: 0 },
        { title: "Rahul D. · Fleet Supervisor", detail: "82% match", tag: "Shortlisted", stage: 1 },
        { title: "Sana M. · HR Executive", detail: "Wed 3:00 PM", tag: "Interview", stage: 2 },
      ],
      events: [
        "New application for Sales Executive from Aman Verma",
        "CV screened: 88% match on experience, location and skills",
        "Interview booked for Tuesday 11 AM · panel briefed",
      ],
      effects: [{ 0: 1 }, {}, { 2: 1 }],
    },
  },
  {
    id: "manufacturing",
    label: "Manufacturing",
    icon: "business",
    title: "AI manufacturing automation",
    outcome: "Predict breakdowns, plan production around real demand and get alerts before small problems stop a line.",
    automations: [
      ["Predictive maintenance", "Watch machine readings and schedule service before a likely breakdown."],
      ["Production planning", "Suggest a schedule from orders, machine capacity and material availability."],
      ["Downtime alerts", "Notify the right technician the moment a machine stops, with the likely cause."],
      ["Material reordering", "Raise purchase requests when raw material falls below what upcoming jobs need."],
      ["Shift reports", "Summarise output, scrap and downtime by line at the end of every shift."],
    ],
    workflow: ["A machine’s vibration starts rising.", "AI predicts a bearing failure within days.", "Maintenance is scheduled and production moves to another machine."],
    flow: {
      trigger: ["Sensor reading", "CNC-07 vibration +38%"],
      thinking: [["AI compares history", "Same pattern before 4 failures"], ["AI predicts a failure", "Bearing · likely in 3–5 days"]],
      actions: [["Work order", "Service Sat 7:00 AM"], ["Schedule adjusted", "Jobs moved to CNC-04"], ["Part reserved", "Bearing 6205 from store"]],
      result: ["Breakdown avoided", "A planned stop instead of lost shifts"],
    },
    demo: {
      workspace: "Shakti Components · Plant AI",
      kpis: [
        { label: "Machine uptime", value: 97, unit: "pct", delta: "+4 pts" },
        { label: "Breakdowns avoided", value: 14, unit: "num", delta: "This quarter" },
        { label: "Scrap rate", value: 2, unit: "pct", delta: "−1 pt" },
        { label: "Units today", value: 3480, unit: "num", delta: "Target 3,600" },
      ],
      chart: { title: "Units produced (hundreds)", values: [820, 910, 880, 1020, 1110, 1080], bump: 120 },
      stages: ["Alert", "Predicted", "Scheduled"],
      record: { title: "CNC-07 · vibration +38%", detail: "Line 2 · bay B", tag: "Bearing" },
      backlog: [
        { title: "Press-03 · temperature", detail: "Within limits", tag: "Watching", stage: 0 },
        { title: "Conveyor-2 · motor load", detail: "Belt wear likely", tag: "2 weeks", stage: 1 },
        { title: "Lathe-11 · coolant", detail: "Service done Mon", tag: "Done", stage: 2 },
      ],
      events: [
        "CNC-07 vibration up 38% over the last 6 hours",
        "AI predicts a bearing failure in 3–5 days, matching 4 past failures",
        "Service booked for Saturday 7 AM · jobs moved to CNC-04",
      ],
      effects: [{}, {}, { 1: 1 }],
    },
  },
] as const satisfies readonly Department[];

export type DepartmentId = (typeof DEPARTMENTS)[number]["id"];

export function getDepartment(id: string | undefined): Department {
  return DEPARTMENTS.find((d) => d.id === id) ?? DEPARTMENTS[0];
}

export const AUTOMATION_TOOLS = ["WhatsApp", "Gmail", "Google Sheets", "Instagram", "Tally", "Zoho", "Shopify", "Razorpay", "Slack", "Your ERP or CRM"] as const;

import type { Sector } from "./software-catalog";

// Sample data for the interactive demos on /software/[product]. Every name and figure is illustrative.

export type KpiUnit = "inr" | "num" | "pct" | "min";

export type DemoKpi = { label: string; value: number; unit: KpiUnit; delta: string };

export type DemoItem = { title: string; detail: string; tag: string };

export type SoftwareDemo = {
  workspace: string;
  kpis: readonly [DemoKpi, DemoKpi, DemoKpi, DemoKpi];
  chart: { title: string; values: readonly number[]; bump: number };
  // One short column label per workflow step.
  stages: readonly [string, string, string];
  // The item the walkthrough moves through the three stages.
  record: DemoItem;
  // Items already in each stage, so the board looks lived-in.
  backlog: readonly (DemoItem & { stage: 0 | 1 | 2 })[];
  // What the system reports as each step happens.
  events: readonly [string, string, string];
  // KPI changes when each step happens, keyed by KPI index.
  effects: readonly [Partial<Record<0 | 1 | 2 | 3, number>>, Partial<Record<0 | 1 | 2 | 3, number>>, Partial<Record<0 | 1 | 2 | 3, number>>];
};

export const CHART_MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"] as const;

const DEMOS: Record<string, Record<Sector, SoftwareDemo>> = {
  erp: {
    manufacturing: {
      workspace: "Shakti Components · ERP",
      kpis: [
        { label: "Revenue this month", value: 4860000, unit: "inr", delta: "+12% vs Oct" },
        { label: "Open work orders", value: 23, unit: "num", delta: "4 due today" },
        { label: "On-time delivery", value: 94, unit: "pct", delta: "+3 pts" },
        { label: "Stock value", value: 1840000, unit: "inr", delta: "3 warehouses" },
      ],
      chart: { title: "Units produced", values: [820, 910, 880, 1020, 1110, 1080], bump: 120 },
      stages: ["Sales order", "In production", "Shipped"],
      record: { title: "SO-2417 · 1,200 brackets", detail: "Mehta Auto Parts", tag: "₹3,84,000" },
      backlog: [
        { title: "SO-2409 · Pump housings", detail: "Kiran Hydraulics", tag: "₹2,10,000", stage: 0 },
        { title: "WO-876 · Flange plates", detail: "Line 1 · 60% done", tag: "Batch B-118", stage: 1 },
        { title: "WO-879 · Shaft sleeves", detail: "Line 3 · QC pending", tag: "Batch B-121", stage: 1 },
        { title: "SO-2398 · Gear blanks", detail: "Delivered 4 Nov", tag: "₹1,46,000", stage: 2 },
      ],
      events: [
        "Sales order SO-2417 confirmed for Mehta Auto Parts",
        "Steel reserved · work order WO-881 scheduled on Line 2",
        "Batch B-124 passed inspection · shipment recorded",
      ],
      effects: [{ 1: 1 }, { 3: -62000 }, { 0: 384000, 1: -1 }],
    },
    hospitals: {
      workspace: "Sahyadri Care Hospital · ERP",
      kpis: [
        { label: "Appointments today", value: 186, unit: "num", delta: "12 walk-ins" },
        { label: "Bed occupancy", value: 82, unit: "pct", delta: "34 beds free" },
        { label: "Billed today", value: 645000, unit: "inr", delta: "+8% vs avg" },
        { label: "Low-stock items", value: 7, unit: "num", delta: "2 in ICU" },
      ],
      chart: { title: "OPD visits", values: [3120, 3340, 3290, 3580, 3710, 3650], bump: 260 },
      stages: ["Registered", "In consultation", "Billed"],
      record: { title: "Ananya Kulkarni · Cardiology", detail: "Dr. Rao · 11:30 AM", tag: "OPD" },
      backlog: [
        { title: "Vikram Joshi · Orthopaedics", detail: "Token 14 · waiting", tag: "OPD", stage: 0 },
        { title: "Farah Sheikh · Paediatrics", detail: "Dr. Menon · room 4", tag: "OPD", stage: 1 },
        { title: "Ward 3 · Bed 12 discharge", detail: "Pharmacy cleared", tag: "IPD", stage: 2 },
        { title: "Suresh Patil · ENT", detail: "Paid · UPI", tag: "₹1,200", stage: 2 },
      ],
      events: [
        "Patient registered · appointment with Dr. Rao at 11:30",
        "ECG and two consumables recorded against the visit",
        "Charges combined · ₹2,400 paid and reconciled",
      ],
      effects: [{ 0: 1 }, { 3: 1 }, { 2: 2400 }],
    },
    universities: {
      workspace: "Westbridge University · ERP",
      kpis: [
        { label: "Applications", value: 1284, unit: "num", delta: "86 this week" },
        { label: "Students enrolled", value: 642, unit: "num", delta: "Fall intake" },
        { label: "Fees collected", value: 31200000, unit: "inr", delta: "78% of target" },
        { label: "Attendance", value: 91, unit: "pct", delta: "This week" },
      ],
      chart: { title: "Enrolments", values: [40, 95, 160, 120, 140, 87], bump: 18 },
      stages: ["Application", "Enrolled", "Active"],
      record: { title: "Rohan Desai · B.Tech CSE", detail: "Documents verified", tag: "Merit 92%" },
      backlog: [
        { title: "Isha Nair · B.Com", detail: "Marksheet pending", tag: "Review", stage: 0 },
        { title: "Kabir Shah · MBA", detail: "Courses assigned", tag: "Sem 1", stage: 1 },
        { title: "Diya Rao · B.Sc Physics", detail: "Attendance 96%", tag: "Fees paid", stage: 2 },
        { title: "Arjun Mehta · BBA", detail: "Attendance 88%", tag: "Scholarship", stage: 2 },
      ],
      events: [
        "Application reviewed · all four documents verified",
        "Rohan enrolled · six Semester 1 courses assigned",
        "₹1,45,000 fee receipt matched · first attendance recorded",
      ],
      effects: [{ 0: 1 }, { 1: 1 }, { 2: 145000 }],
    },
  },
  app: {
    manufacturing: {
      workspace: "FieldPro",
      kpis: [
        { label: "Jobs today", value: 8, unit: "num", delta: "2 urgent" },
        { label: "Completed", value: 5, unit: "num", delta: "On track" },
        { label: "Checks passed", value: 96, unit: "pct", delta: "This week" },
        { label: "Waiting to sync", value: 2, unit: "num", delta: "Offline" },
      ],
      chart: { title: "Jobs closed", values: [18, 22, 21, 26, 29, 24], bump: 1 },
      stages: ["Assigned", "Checklist", "Synced"],
      record: { title: "Job #4471 · CNC Mill 3", detail: "Bay B · due 2:00 PM", tag: "12 checks" },
      backlog: [
        { title: "Job #4468 · Conveyor 2", detail: "Bay A · due 4:00 PM", tag: "Routine", stage: 0 },
        { title: "Job #4465 · Compressor", detail: "Photo added", tag: "8 checks", stage: 1 },
        { title: "Job #4460 · Press 5", detail: "Supervisor notified", tag: "Done", stage: 2 },
      ],
      events: [
        "Job #4471 opened · instructions downloaded for offline use",
        "Machine label scanned · 12 of 12 checks recorded",
        "Results synced · supervisor Prakash notified",
      ],
      effects: [{}, { 2: 1 }, { 1: 1, 3: -1 }],
    },
    hospitals: {
      workspace: "CareConnect",
      kpis: [
        { label: "Upcoming visits", value: 1, unit: "num", delta: "Next: Thu" },
        { label: "Reminders", value: 3, unit: "num", delta: "Unread" },
        { label: "Documents", value: 5, unit: "num", delta: "Released" },
        { label: "Follow-ups", value: 2, unit: "num", delta: "Staff tasks" },
      ],
      chart: { title: "App bookings", values: [210, 260, 248, 300, 342, 318], bump: 24 },
      stages: ["Requested", "Confirmed", "Visit done"],
      record: { title: "Dermatology · Dr. Iyer", detail: "Thu 14 Nov · 10:15 AM", tag: "OPD" },
      backlog: [
        { title: "Physiotherapy · Session 3", detail: "Awaiting slot", tag: "Request", stage: 0 },
        { title: "Blood test · Fasting", detail: "Fri 15 Nov · 8:00 AM", tag: "Lab", stage: 1 },
        { title: "General check-up", detail: "Report released", tag: "PDF", stage: 2 },
      ],
      events: [
        "Slot requested · Dermatology, Thursday 10:15 AM",
        "Booking confirmed · fasting not needed, arrive 10 minutes early",
        "Visit summary released · now in Documents",
      ],
      effects: [{}, { 0: 1, 1: 1 }, { 0: -1, 2: 1 }],
    },
    universities: {
      workspace: "Westbridge Campus",
      kpis: [
        { label: "Classes today", value: 4, unit: "num", delta: "Next 11:00" },
        { label: "Attendance", value: 92, unit: "pct", delta: "This term" },
        { label: "Fees due", value: 18500, unit: "inr", delta: "Due 30 Nov" },
        { label: "Open requests", value: 0, unit: "num", delta: "Campus" },
      ],
      chart: { title: "Requests resolved", values: [64, 72, 80, 77, 91, 85], bump: 1 },
      stages: ["Timetable", "Room change", "Request"],
      record: { title: "Data Structures · 11:00", detail: "B.Tech CSE · Semester 3", tag: "Lecture" },
      backlog: [
        { title: "Maths III · 9:00", detail: "Room 204 · attended", tag: "Lecture", stage: 0 },
        { title: "Exam form deadline", detail: "Closes Friday", tag: "Reminder", stage: 1 },
        { title: "Wi-Fi · Block C", detail: "Fixed 4 Nov", tag: "Resolved", stage: 2 },
      ],
      events: [
        "Timetable opened · 4 classes today, next at 11:00",
        "Room change: Data Structures moves to Lab 2",
        "Hostel request for Room B-214 sent · technician due 4–5 PM",
      ],
      effects: [{}, {}, { 3: 1 }],
    },
  },
  crm: {
    manufacturing: {
      workspace: "Shakti Components · Sales",
      kpis: [
        { label: "Open RFQs", value: 37, unit: "num", delta: "9 this week" },
        { label: "Pipeline value", value: 12400000, unit: "inr", delta: "+18% vs Oct" },
        { label: "Quote-to-order", value: 28, unit: "pct", delta: "+4 pts" },
        { label: "Follow-ups due", value: 12, unit: "num", delta: "5 overdue" },
      ],
      chart: { title: "Orders won (₹ lakh)", values: [18, 22, 19, 27, 31, 29], bump: 7 },
      stages: ["RFQ", "Quote sent", "Won"],
      record: { title: "RFQ · 5,000 gaskets", detail: "Patil Engineering · Pune", tag: "₹6,75,000" },
      backlog: [
        { title: "RFQ · Bearing housings", detail: "Sagar Motors", tag: "₹4,20,000", stage: 0 },
        { title: "Quote v2 · Valve bodies", detail: "Awaiting approval", tag: "₹9,80,000", stage: 1 },
        { title: "Sample · Brake shims", detail: "Kolhapur dealer", tag: "₹2,35,000", stage: 1 },
        { title: "PO · Rubber seals", detail: "Repeat order", tag: "₹3,10,000", stage: 2 },
      ],
      events: [
        "RFQ captured from Patil Engineering · drawing attached",
        "Assigned to Neha (West) · quote v1 approved and sent",
        "PO received · deal won, follow-up set for 6 Dec",
      ],
      effects: [{ 0: 1, 1: 675000 }, { 3: 1 }, { 0: -1, 2: 1, 3: -1 }],
    },
    hospitals: {
      workspace: "Sahyadri Care · Enquiries",
      kpis: [
        { label: "New enquiries", value: 64, unit: "num", delta: "Today" },
        { label: "Open referrals", value: 18, unit: "num", delta: "6 need callback" },
        { label: "Booked rate", value: 71, unit: "pct", delta: "+5 pts" },
        { label: "First response", value: 14, unit: "min", delta: "Average" },
      ],
      chart: { title: "Booked appointments", values: [410, 452, 438, 496, 530, 512], bump: 31 },
      stages: ["Enquiry", "Assigned", "Booked"],
      record: { title: "Referral · Orthopaedics", detail: "From City Clinic, Kothrud", tag: "Callback" },
      backlog: [
        { title: "Callback · Maternity package", detail: "Web form · 9:40 AM", tag: "New", stage: 0 },
        { title: "Referral · Cardiology", detail: "Owner: Pooja", tag: "Due 3 PM", stage: 1 },
        { title: "Enquiry · Health check", detail: "Booked Sat 9 AM", tag: "Booked", stage: 2 },
      ],
      events: [
        "Referral logged from City Clinic · WhatsApp consent recorded",
        "Routed to Orthopaedics desk · owner Pooja, call in 15 min",
        "Appointment booked for Monday · referrer updated",
      ],
      effects: [{ 0: 1, 1: 1 }, { 3: -1 }, { 1: -1, 2: 1 }],
    },
    universities: {
      workspace: "Westbridge · Admissions",
      kpis: [
        { label: "Enquiries", value: 2410, unit: "num", delta: "This intake" },
        { label: "Applications", value: 1284, unit: "num", delta: "53% converted" },
        { label: "Offers made", value: 702, unit: "num", delta: "88 pending" },
        { label: "Places accepted", value: 418, unit: "num", delta: "Target 500" },
      ],
      chart: { title: "Applications", values: [96, 180, 260, 214, 238, 196], bump: 12 },
      stages: ["Enquiry", "Applied", "Enrolled"],
      record: { title: "Sneha Pillai · MBA", detail: "Source: education fair", tag: "Counsellor Meera" },
      backlog: [
        { title: "Aditya Kumar · B.Des", detail: "Instagram ad", tag: "Call today", stage: 0 },
        { title: "Zoya Khan · M.Sc Data", detail: "SOP missing", tag: "Reminder sent", stage: 1 },
        { title: "Nikhil Rao · BBA", detail: "Offer accepted", tag: "Enrolled", stage: 2 },
      ],
      events: [
        "Enquiry captured at the Pune education fair · MBA",
        "Counsellor Meera assigned · document reminder sent",
        "Offer accepted · Sneha enrolled in the January intake",
      ],
      effects: [{ 0: 1 }, { 1: 1 }, { 2: 1, 3: 1 }],
    },
  },
};

export function getDemo(product: string, sector: Sector): SoftwareDemo | undefined {
  return DEMOS[product]?.[sector];
}

export function formatKpi(value: number, unit: KpiUnit) {
  const n = Math.round(value).toLocaleString("en-IN");
  if (unit === "inr") return `₹${n}`;
  if (unit === "pct") return `${n}%`;
  if (unit === "min") return `${n} min`;
  return n;
}

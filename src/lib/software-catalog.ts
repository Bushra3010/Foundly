export const SECTORS = [
  { id: "manufacturing", label: "Manufacturing" },
  { id: "hospitals", label: "Hospitals" },
  { id: "universities", label: "Universities" },
] as const;

export type Sector = (typeof SECTORS)[number]["id"];

type SectorGuide = {
  title: string;
  outcome: string;
  features: readonly (readonly [name: string, description: string])[];
  workflow: readonly string[];
};

type ProductGuide = {
  id: string;
  title: string;
  icon: string;
  short: string;
  headline: string;
  summary: string;
  lede: string;
  price: string;
  sectors: Record<Sector, SectorGuide>;
};

export const PRODUCTS = [
  {
    id: "erp",
    title: "Custom ERP",
    icon: "business",
    short: "ERP",
    headline: "Run your whole operation from one system",
    summary: "Connect finance, inventory, people and daily operations in one system.",
    lede: "We build ERP around the way your team already works: orders, stock, production, people and accounts in one place, so everyone works from the same numbers.",
    price: "Starting at ₹3,00,000",
    sectors: {
      manufacturing: {
        title: "Manufacturing ERP",
        outcome: "Plan production against actual demand, trace materials and see what each batch costs.",
        features: [
          ["Production planning", "Turn confirmed orders into work orders. Use bills of materials to estimate required components and reserve machine capacity."],
          ["Purchasing & inventory", "Compare supplier quotes, approve purchase orders and track stock by warehouse, lot and location."],
          ["Quality & traceability", "Record inspections against a batch and hold failed stock. Trace the raw materials used in a finished item."],
          ["Costing & accounting", "Compare planned material and labour costs with actuals. Match supplier invoices to receipts before approving payment."],
          ["Staff & shift planning", "Assign operators to shifts, capture attendance and review overtime before payroll."],
        ],
        workflow: ["Confirm a sales order.", "Reserve materials and schedule a work order.", "Inspect the finished batch and record the shipment."],
      },
      hospitals: {
        title: "Hospital operations ERP",
        outcome: "Coordinate appointments, staffing, supplies and billing across departments.",
        features: [
          ["Registration & appointments", "Register patients, book appointments and view department schedules from the front desk."],
          ["Admissions & bed allocation", "Track admissions, transfers and discharges so staff can see which beds are available."],
          ["Pharmacy & supplies", "Track inventory by batch and expiry date. Flag low stock in a ward before supplies run out."],
          ["Billing & reconciliation", "Combine department charges, record payments and reconcile outstanding balances."],
          ["Staff access & audit history", "Define what each role can see or change and review access and changes when investigating an issue."],
        ],
        workflow: ["Register a patient and assign an appointment.", "Record services and supplies used.", "Review charges and reconcile the payment."],
      },
      universities: {
        title: "University management ERP",
        outcome: "Connect admissions, academics and campus administration from enrolment through graduation.",
        features: [
          ["Admissions & enrolment", "Track applications, verify documents and enrol accepted students in the right programme."],
          ["Academic scheduling", "Plan course sections, classrooms and faculty schedules. Record attendance by class."],
          ["Exams & results", "Schedule exams, collect marks and publish approved results and transcripts."],
          ["Fees & finance", "Set fee schedules, apply scholarships and reconcile receipts against each student’s balance."],
          ["Campus services", "Track hostel assignments, library circulation and requests from students and staff."],
        ],
        workflow: ["Review an application and verify documents.", "Enrol the student and assign courses.", "Record attendance, fees and approved results."],
      },
    },
  },
  {
    id: "app",
    title: "Custom Mobile Apps",
    icon: "website",
    short: "Apps",
    headline: "Put your business in your customers’ pocket",
    summary: "Give customers, staff or students a focused Android or iOS experience.",
    lede: "We design and build Android and iOS apps for the people who use your service every day: customers booking, staff on the move or students on campus.",
    price: "Android from ₹60,000 · iOS from ₹1,00,000",
    sectors: {
      manufacturing: {
        title: "Factory floor & field service app",
        outcome: "Help operators and technicians record work where it happens.",
        features: [
          ["Work orders", "Show assigned jobs, instructions and due dates on a device operators can carry."],
          ["Barcode scanning", "Scan material or equipment labels to confirm which item was picked, moved or serviced."],
          ["Quality checklists", "Record measurements, photos and failed checks at the production station."],
          ["Offline capture", "Save inspections or service notes without a signal and sync them when a connection returns."],
          ["Maintenance alerts", "Notify the assigned technician when equipment is reported down or a service is due."],
        ],
        workflow: ["Open an assigned job.", "Scan the machine and complete its checklist.", "Sync results and notify the supervisor."],
      },
      hospitals: {
        title: "Patient & hospital staff app",
        outcome: "Make it easier for patients to manage visits and for staff to coordinate follow-up.",
        features: [
          ["Appointment booking", "Let patients browse clinics, request a slot and check booking status."],
          ["Reminders & visit instructions", "Send appointment reminders and preparation instructions through the chosen notification channels."],
          ["Patient portal", "Let signed-in patients see the documents and visit information the hospital releases to them."],
          ["Staff task lists", "Give staff a role-specific list of assigned follow-ups and allow them to mark work complete."],
          ["Accessibility & languages", "Design for readable text, clear navigation and the languages your patients use."],
        ],
        workflow: ["Request a clinic appointment.", "Receive confirmation and visit instructions.", "Open the app to view released documents after the visit."],
      },
      universities: {
        title: "Campus & student app",
        outcome: "Give students a single place to check what is happening on campus and act on deadlines.",
        features: [
          ["Timetable & announcements", "Show each student their classes, room changes and campus updates."],
          ["Attendance & results", "Display attendance records and approved grades for the signed-in student."],
          ["Fees & receipts", "Show fees due, connect an approved payment provider and make receipts easy to find."],
          ["Campus requests", "Submit requests for services such as hostel maintenance and follow their progress."],
          ["Events & notifications", "Share events and send reminders for registration, exams or fee deadlines."],
        ],
        workflow: ["Check today’s timetable.", "Get notified about a room change.", "Submit a campus request and check its status."],
      },
    },
  },
  {
    id: "crm",
    title: "Custom CRM",
    icon: "leads",
    short: "CRM",
    headline: "Never lose a lead or a follow-up again",
    summary: "Capture enquiries, assign an owner and track every follow-up in one place.",
    lede: "We build a CRM around your sales process: every enquiry captured, every lead owned and every follow-up on time, from first contact to repeat order.",
    price: "Starting at ₹99,999",
    sectors: {
      manufacturing: {
        title: "B2B manufacturing CRM",
        outcome: "Keep long sales cycles and dealer relationships visible from first enquiry to repeat order.",
        features: [
          ["Enquiries & account records", "Capture enquiries and keep contacts, sites and buying history together for each company."],
          ["RFQs & quotations", "Track specifications, quantities, approvals and quote revisions before a quote goes out."],
          ["Deal stages", "See which opportunities are waiting for samples, pricing approval or a purchase order."],
          ["Dealer & territory ownership", "Assign accounts by territory and give reps a clear follow-up schedule."],
          ["Sales reporting", "Compare quote-to-order conversion and ageing deals by product line or region."],
        ],
        workflow: ["Capture a request for quotation.", "Assign a rep and track quote approval.", "Record the decision and schedule the next follow-up."],
      },
      hospitals: {
        title: "Hospital enquiries & referral CRM",
        outcome: "Help front-desk and outreach teams respond to enquiries and coordinate referrals.",
        features: [
          ["Enquiry capture", "Log callback requests and route each enquiry to the right department."],
          ["Referral tracking", "Record the referring organisation and track whether an appointment was arranged."],
          ["Follow-up tasks", "Assign callbacks and reminders so each enquiry has a clear owner and next action."],
          ["Communication preferences", "Record preferred channels and permissions before sending outreach or reminders."],
          ["Response reporting", "Track time to first response, booked appointments and unresolved referrals."],
        ],
        workflow: ["Log a referral or callback request.", "Assign it to the right department.", "Confirm the appointment or schedule another follow-up."],
      },
      universities: {
        title: "University admissions CRM",
        outcome: "Guide prospective students from first enquiry to enrolment and see where they need help.",
        features: [
          ["Programme enquiries", "Capture programme interests and enquiry sources from forms, events or calls."],
          ["Counsellor assignment", "Assign prospects by programme or campus and keep counselling notes in one record."],
          ["Admissions pipeline", "Track enquiries, applications, offers and accepted places with a clear owner for each step."],
          ["Deadline reminders", "Remind applicants about missing documents, interviews or approaching deadlines."],
          ["Intake reporting", "Compare conversion by programme and source to see where applicants drop off."],
        ],
        workflow: ["Capture a programme enquiry.", "Assign a counsellor and follow up on documents.", "Record the offer and confirm the enrolment outcome."],
      },
    },
  },
] as const satisfies readonly ProductGuide[];

export function getProduct(id: string) {
  return PRODUCTS.find((product) => product.id === id);
}

export function getSector(id: string | undefined) {
  return SECTORS.find((sector) => sector.id === id) ?? SECTORS[0];
}

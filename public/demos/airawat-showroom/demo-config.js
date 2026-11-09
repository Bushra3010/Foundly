// Foundly demo panel configuration (see demo-mode.js).
window.FDEMO = {
  slug: 'airawat-showroom',
  title: 'Airawat Showroom',
  blurb: 'Sample data stored only in this browser. Try finding a product, scanning a sample label, shortlisting, confirming a quotation as an order (reserves stock), receiving and transferring stock, and printing labels.',
  apps: [
    { href: './#/login?as=admin', name: 'Staff app · Admin', login: 'admin · showroom@demo' },
    { href: './#/login?as=manager', name: 'Staff app · Manager (sees cost & margin)', login: 'manager · showroom@demo' },
    { href: './#/login?as=sales', name: 'Staff app · Sales', login: 'sales · showroom@demo' },
    { href: './#/login?as=store', name: 'Staff app · Storekeeper', login: 'store · showroom@demo' },
    { href: 'p.html?code=AHU-000005', name: 'Customer QR page', login: 'Public page a customer opens by scanning a label' },
    { href: 'c.html?t=mehta-selection', name: 'Shared shortlist catalogue', login: 'Public link sent to a customer' },
  ],
};

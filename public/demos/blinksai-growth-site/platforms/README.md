# Platform screenshots — how to add them

This folder holds the product screenshots for the 8 platforms. Put a file in here with the
right name, add two lines to `web/lib/content.ts`, and the picture appears in three places
at once: the homepage rail, the `/platforms` grid, and that platform's own page.

Until a file is added, the site shows a labelled empty frame that says the screenshot is
not published yet. That is deliberate. **Never replace it with a mockup, a stock image, or
a screen from a different product.**

---

## 1. Name the file exactly

The filename comes from the platform's slug. Lowercase, hyphens, `.webp`, nothing else —
no spaces, no capitals, no `final-v2`.

| Platform | Built from | File to put in this folder |
|---|---|---|
| Blinks Nidhi | Nidhi NBFC Bank | `nidhi-nbfc-software.webp` |
| Blinks Workforce | Growus Auto | `hrms-field-inspection.webp` |
| Blinks Campus | Sengoleit | `institute-franchise-erp.webp` |
| Blinks Admissions | DCW CRM | `education-crm.webp` |
| Blinks Realty | Mahesewari Group | `real-estate-crm.webp` |
| Blinks Travel | Shera Travels | `travel-agency-crm.webp` |
| Blinks Workforce Lite | Falcon EMP | `employee-management.webp` |
| Blinks Agri | Soil | `agri-distribution.webp` |

Extra screens for the same platform get a number on the end:
`nidhi-nbfc-software-2.webp`, `nidhi-nbfc-software-3.webp`, and so on.

## 2. Get the size right

| | |
|---|---|
| Size | **1600 × 1000 px** (16:10) |
| Format | **WebP** — export at quality 80–85 |
| File size | Aim under 300 KB. Anything over 500 KB is too big |
| Framing | Capture the browser content only. No OS window chrome, no cursor, no browser tabs |
| Content | Show one screen doing one thing — a dashboard, a passbook, a plot map. Not a login page, not an empty state |

Every slot on the site is 16:10, so a picture at any other shape gets cropped. Export at
1600 × 1000 and it lands exactly as you framed it.

Not sure how to make a WebP? Take the screenshot as PNG, then convert it — most design
tools export WebP directly, and `cwebp -q 82 shot.png -o nidhi-nbfc-software.webp` does it
from the terminal.

## 3. Mask the client data first — this is not optional

PRD §16 says screenshots may be published **only with data masked**, and PRD §14 content
governance says nothing belonging to a client goes on this site without written consent on
file. Both apply to every image in this folder.

Before a file goes in, check the frame for:

- [ ] Real customer or member names → replace with sample names
- [ ] Phone numbers, email addresses, addresses, Aadhaar / PAN / KYC numbers
- [ ] Account numbers, loan numbers, transaction IDs
- [ ] Real money amounts and balances, if the client considers them sensitive
- [ ] Employee names and photos
- [ ] The client's own logo inside the app, if consent for the logo is not on file
- [ ] Anything in a browser tab title, breadcrumb, or notification toast

Mask by editing the data in a demo/staging account, not by blurring after the fact —
blurred rectangles look like something is being hidden. Blur is a last resort.

**Written sign-off from the client goes on file before the file goes in this folder.**

## 4. Switch the card on

Open `web/lib/content.ts`, find the platform in the `platforms` list, and add two lines
inside its `{ ... }` block:

```ts
{
  slug: "nidhi-nbfc-software",
  name: "Nidhi NBFC Bank",
  // ...existing lines, leave them alone...
  shot: "/platforms/nidhi-nbfc-software.webp",
  shotAlt: "Member passbook screen showing an auto-generated deposit entry",
},
```

- `shot` is the path. It always starts with `/platforms/` and matches the filename above.
- `shotAlt` describes **what is on the screen**, for people using a screen reader and for
  Google. Write what you can see — "Dealer order list with stock and credit columns" —
  not a slogan like "Powerful agri software".

For extra screens, add a `gallery` line too. They show up as a grid on the platform's own
page:

```ts
  shot: "/platforms/nidhi-nbfc-software.webp",
  shotAlt: "Member passbook screen showing an auto-generated deposit entry",
  gallery: [
    "/platforms/nidhi-nbfc-software-2.webp",
    "/platforms/nidhi-nbfc-software-3.webp",
  ],
```

Save, and the site picks it up. Nothing else needs changing.

## 5. Check it

- The picture shows up on `/platforms`, on `/platforms/{slug}`, and on the homepage rail.
- The picture is not stretched or cropped oddly → your export was not 16:10, redo it.
- Nothing on screen identifies a real customer → back to step 3.
- Delete a `shot` line and the honest placeholder comes back, same size, no page shift.

## Common mistakes

| Symptom | Cause |
|---|---|
| Empty frame still showing | The `shot:` line is missing, or the filename does not match exactly |
| Broken / grey image box | The file is not in this folder, or the extension is `.WEBP` / `.png` while the path says `.webp` |
| Picture looks squashed | The export was not 1600 × 1000 |
| Screenshot loads slowly on mobile | The file is far over 300 KB — re-export at quality 80 |

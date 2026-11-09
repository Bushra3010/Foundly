# Photography

The home page is built for real photography. Until a file exists, its slot renders
a labelled "Photo required" placeholder stating the ratio and subject — the layout
is already final, so **dropping a correctly named file here is the only step**. No
code change, no rebuild config; just add the file and redeploy.

Use `scripts/prepare-images.py` rather than copying files in by hand — it crops,
compresses and converts each one to what its slot needs:

```bash
python3 scripts/prepare-images.py --country croatia=~/Downloads/zagreb.jpg
```

Put files at exactly these paths:

| File | Ratio | Size | Subject |
| --- | --- | --- | --- |
| `hero-europe.jpg` | 21:9 | 2400×1030 | European city or industrial skyline, warm daylight. Right ~60% of the frame carries the image; the left fades to white behind the headline, so keep the focal point right of centre. |
| `workforce-pool.png` | any | 1800px wide | Group of workers in trade uniforms. A **transparent PNG** is ideal — it would then sit directly on the navy band as in the design reference. The supplied file has a white studio background that cannot be removed automatically (the chef's hat is the same white as the background and touches it), so it is currently framed on a light panel instead. |
| `countries/serbia.jpg` | 16:10 | 1200×750 | Belgrade or Novi Sad landmark / industrial view — **supplied** |
| `countries/croatia.jpg` | 16:10 | 1200×750 | Zagreb, Split or Rijeka |
| `countries/bulgaria.jpg` | 16:10 | 1200×750 | Sofia, Plovdiv or Varna |
| `countries/bosnia.jpg` | 16:10 | 1200×750 | Sarajevo, Mostar or Banja Luka |
| `countries/montenegro.jpg` | 16:10 | 1200×750 | Kotor, Budva or Podgorica |
| `countries/north-macedonia.jpg` | 16:10 | 1200×750 | Skopje, Bitola or Ohrid |
| `countries/albania.jpg` | 16:10 | 1200×750 | Tirana, Durrës or Vlorë |

The country filename is the country's `slug` in `src/lib/data.ts`, so adding a new
country automatically expects `countries/<slug>.jpg`.

## Sourcing rules

These are not optional — they were set in the brief and they protect the company:

- **Licensed stock or own photography only.** No image pulled from a search engine.
- **No identifiable worker without written consent.** The workforce-pool image shows
  faces; if it is stock, the licence must cover commercial use with model releases.
- **No image that implies a placement, employer or outcome that did not happen.**
  A photo must not be captioned or positioned to suggest a specific hire, employer
  relationship or visa result.
- Country images should show the place, not staged "happy worker" scenes.

## Compression

Aim for under 300 KB per JPEG at these dimensions (quality ~78, progressive) and
under 500 KB for the transparent PNG. Page speed is an SEO requirement in the brief,
and these are the largest assets on the site.

## Still needed

`hero-europe.jpg`, `countries/serbia.jpg` and `workforce-pool.png` are supplied.
Six country cards remain: **croatia, bulgaria, bosnia, montenegro,
north-macedonia, albania**. Each renders a labelled placeholder until its file
exists.

The two supplied photos are only 512px wide, so the hero is upscaled and looks
soft. Full-resolution originals would fix that with no code change — see
`assets-src/README.md`.

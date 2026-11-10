/* ==========================================================================
   Massing model — home page
   A procedural three.js study of our standard residential typology:
   podium, slab tower on a shear-wall core, corner balconies, services crown.
   It is a massing diagram, not a survey model: proportions are representative.

   Loads only when the section is on screen, degrades to a photograph if the
   module or WebGL is unavailable, and stops rendering when off screen.
   ========================================================================== */

const SRC = "https://unpkg.com/three@0.169.0/build/three.module.js";

const FLOORS   = 14;    // typical floors above podium
const FH       = 1;     // floor-to-floor, model units
const W        = 6;     // tower width
const D        = 4.1;   // tower depth
const PODIUM_H = 2.4;

const section  = document.getElementById("massing");
const canvas   = document.getElementById("massingCanvas");
const fallback = document.getElementById("massingFallback");
const legend   = document.getElementById("massingLegend");
const hud      = document.getElementById("massingFloors");

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- legend ---------- */
if (legend) {
  legend.innerHTML = [
    ["Podium", "2 levels, parking"],
    ["Typical floors", `${FLOORS} above podium`],
    ["Floor to floor", "3.0 m"],
    ["Balconies", "4 per floor, corners"],
    ["Structure", "RCC shear-wall core"]
  ].map(([k, v]) => `<li><span>${k}</span><em>${v}</em></li>`).join("");
}

function giveUp() {
  if (canvas) canvas.hidden = true;
  if (fallback) fallback.hidden = false;
  if (hud) hud.textContent = "Skyline Residency, Shela";
}

if (!section || !canvas) {
  /* nothing to do */
} else if (!("IntersectionObserver" in window)) {
  giveUp();
} else {
  const gate = new IntersectionObserver((es) => {
    if (!es.some(e => e.isIntersecting)) return;
    gate.disconnect();
    import(SRC).then(start).catch(giveUp);
  }, { rootMargin: "300px 0px" });
  gate.observe(section);
}

/* ========================================================================== */
function start(THREE) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) { giveUp(); return; }

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 400);

  /* ---------- materials ---------- */
  const M = {
    concrete: new THREE.MeshStandardMaterial({ color: 0xb4babb, roughness: .88, metalness: .02 }),
    slab:     new THREE.MeshStandardMaterial({ color: 0xd8dcdb, roughness: .8,  metalness: .02 }),
    core:     new THREE.MeshStandardMaterial({ color: 0x2b3134, roughness: .95, metalness: .02 }),
    glass:    new THREE.MeshStandardMaterial({ color: 0x11161a, roughness: .16, metalness: .62 }),
    rail:     new THREE.MeshStandardMaterial({ color: 0x1a2024, roughness: .1,  metalness: .5,
                                               transparent: true, opacity: .5 }),
    accent:   new THREE.MeshStandardMaterial({ color: 0xc25a3c, roughness: .55, metalness: .05 }),
    ground:   new THREE.MeshStandardMaterial({ color: 0x0f1113, roughness: 1 })
  };

  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  /* ---------- lights: one key, one cool fill, one warm rim ---------- */
  scene.add(new THREE.HemisphereLight(0xb6c4cb, 0x08090b, 1.5));

  const key = new THREE.DirectionalLight(0xfff4ea, 2.9);
  key.position.set(11, 20, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  const cam = key.shadow.camera;
  cam.left = -16; cam.right = 16; cam.top = 26; cam.bottom = -4; cam.far = 60;
  scene.add(key);

  /* the brick rim is a whisper: enough to separate the mass from the ground,
     never enough to tint the concrete */
  const rim = new THREE.DirectionalLight(0xc25a3c, 0.42);
  rim.position.set(-14, 8, -11);
  scene.add(rim);

  /* ---------- ground ---------- */
  const ground = new THREE.Mesh(new THREE.CircleGeometry(26, 64), M.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  /* ---------- the building ---------- */
  const building = new THREE.Group();
  scene.add(building);

  const put = (geo, mat, x, y, z, opts) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    if (opts && opts.parent) opts.parent.add(m); else building.add(m);
    return m;
  };

  /* podium: two levels, wider than the tower, with a recessed entrance band */
  const PW = W + 4.6, PD = D + 3.4;
  put(box(PW, PODIUM_H, PD), M.concrete, 0, PODIUM_H / 2, 0);
  put(box(PW + .5, .22, PD + .5), M.slab, 0, PODIUM_H, 0);
  put(box(PW - 1.2, .5, .16), M.glass, 0, PODIUM_H * .55, PD / 2 + .01);
  put(box(2.2, .1, .1), M.accent, -PW / 2 + 2.2, .28, PD / 2 + .06);

  /* shear-wall core, expressed as a solid band on the rear elevation */
  const core = new THREE.Group();
  core.position.y = PODIUM_H;
  building.add(core);
  put(box(2.3, FLOORS * FH + 1.4, .5), M.core, 0, (FLOORS * FH + 1.4) / 2, -D / 2 - .18, { parent: core });

  /* full-height piers on the long elevations: without them a stack of slabs
     reads as a layer cake rather than a tower */
  const TH = FLOORS * FH;
  const shaft = new THREE.Group();       /* grows with the floor count */
  shaft.position.y = PODIUM_H;
  building.add(shaft);
  for (const px of [-2.05, 0, 2.05]) for (const pz of [1, -1]) {
    put(box(.42, TH, .2), M.concrete, px, TH / 2, pz * (D / 2 + .08), { parent: shaft });
  }
  for (const sx of [-1, 1]) {
    put(box(.2, TH, D * .82), M.concrete, sx * (W / 2 + .1), TH / 2, 0, { parent: shaft });
  }

  /* typical floors — one group each so they can be revealed in sequence */
  const plates = [];
  for (let i = 0; i < FLOORS; i++) {
    const g = new THREE.Group();
    g.position.y = PODIUM_H + i * FH;
    building.add(g);

    /* structure + glazing */
    put(box(W, FH * .62, D), M.glass, 0, FH * .5, 0, { parent: g });
    put(box(W + .26, FH * .17, D + .26), M.slab, 0, FH * .1, 0, { parent: g });
    /* solid piers on the short elevations keep it reading as concrete, not curtain wall */
    put(box(.55, FH * .8, D * .5), M.concrete,  W / 2 - .1, FH * .55, 0, { parent: g });
    put(box(.55, FH * .8, D * .5), M.concrete, -W / 2 + .1, FH * .55, 0, { parent: g });

    /* corner balconies: cantilevered slab plus a glass balustrade */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const bx = sx * (W / 2 - .72), bz = sz * (D / 2 + .36);
      put(box(1.55, .1, .78), M.slab, bx, FH * .16, bz, { parent: g });
      put(box(1.55, .42, .04), M.rail, bx, FH * .38, bz + sz * .37, { parent: g });
      put(box(.04, .42, .78), M.rail, bx + sx * .76, FH * .38, bz, { parent: g });
    }

    /* every fourth floor gets an accent reveal in the slab edge */
    if (i % 4 === 3) put(box(W + .3, .05, .05), M.accent, 0, FH * .19, D / 2 + .14, { parent: g });

    plates.push(g);
  }

  /* crown: parapet, then the services box set back from the facade.
     Grouped so it only appears once the tower underneath it exists. */
  const topY = PODIUM_H + FLOORS * FH;
  const crown = new THREE.Group();
  building.add(crown);
  put(box(W + .4, .55, D + .4), M.slab, 0, topY + .27, 0, { parent: crown });
  put(box(W - 1.6, 1.1, D - 1.2), M.concrete, 0, topY + 1.1, 0, { parent: crown });
  put(box(W - 2.6, .09, .09), M.accent, 0, topY + 1.68, 0, { parent: crown });
  crown.visible = reduced;

  /* ---------- framing ---------- */
  const CENTER = new THREE.Vector3(0, (PODIUM_H + FLOORS * FH) * .48, 0);
  const RADIUS = 44;
  let az = -0.62, el = 0.2;          // current camera angles
  let azT = az, elT = el;             // targets (pointer + drag)
  let dragging = false, lastX = 0, lastY = 0, spin = reduced ? 0 : 0.0011;

  function place() {
    camera.position.set(
      CENTER.x + RADIUS * Math.cos(el) * Math.sin(az),
      CENTER.y + RADIUS * Math.sin(el),
      CENTER.z + RADIUS * Math.cos(el) * Math.cos(az)
    );
    camera.lookAt(CENTER);
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    /* keep the whole tower in frame on narrow, tall stages */
    camera.fov = w / h < 1 ? 29 : 27;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  /* ---------- pointer: drag to orbit ---------- */
  const stage = canvas.parentElement;
  stage.addEventListener("pointerdown", (e) => {
    dragging = true; spin = 0; lastX = e.clientX; lastY = e.clientY;
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    azT -= (e.clientX - lastX) * 0.008;
    elT = Math.max(-0.1, Math.min(0.62, elT + (e.clientY - lastY) * 0.005));
    lastX = e.clientX; lastY = e.clientY;
  });
  const release = () => {
    dragging = false;
    if (!reduced) spin = 0.0011;   /* idle rotation picks back up */
  };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);

  /* ---------- reveal + render loop, only while on screen ---------- */
  let visible = false, raf = 0, built = reduced ? 1 : 0;

  new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(tick);
  }, { threshold: 0.01 }).observe(section);

  function tick() {
    raf = visible ? requestAnimationFrame(tick) : 0;

    /* floors stack up as the section crosses the viewport (no scroll listener) */
    if (!reduced) {
      const r = section.getBoundingClientRect();
      const p = (innerHeight * .92 - r.top) / (r.height * .72);
      built += (Math.max(0, Math.min(1, p)) - built) * 0.08;
    }
    const shown = built * FLOORS;
    for (let i = 0; i < FLOORS; i++) {
      const t = Math.max(0, Math.min(1, shown - i));
      const g = plates[i];
      g.visible = t > 0.001;
      g.scale.set(1, 1, 1);
      g.position.y = PODIUM_H + i * FH + (1 - t) * 1.6;
    }
    const grow = Math.max(0.001, built);
    shaft.scale.y = grow;
    core.scale.y = grow;
    crown.visible = built > 0.985;
    if (hud) hud.textContent = `${Math.round(shown)} of ${FLOORS} floors`;

    if (!dragging) azT += spin;
    az += (azT - az) * 0.07;
    el += (elT - el) * 0.07;
    place();
    renderer.render(scene, camera);
  }

  place();
  renderer.render(scene, camera);
}

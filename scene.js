/* Scène 3D : des modules qui se réassemblent en une forme différente à chaque section. */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const canvas = document.getElementById("scene");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = () => innerWidth < 980;

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    canvas.remove();
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile() ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 13);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(5, 7, 6);
  scene.add(key);
  scene.fog = new THREE.Fog(0xffffff, 11, 26);

  const SIDE = isMobile() ? 7 : 8;
  const N = SIDE * SIDE * SIDE;
  const hudCount = document.getElementById("hudCount");
  if (hudCount) hudCount.textContent = N;

  const geo = new RoundedBoxGeometry(1, 1, 1, 3, 0.12);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.38, metalness: 0.06 });
  const mesh = new THREE.InstancedMesh(geo, mat, N);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const group = new THREE.Group();
  group.add(mesh);
  scene.add(group);

  /* ── Formes (x, y, z, taille) ─────────────────────────── */
  const R = rng(7);
  const make = (fn) => { const a = new Float32Array(N * 4); for (let k = 0; k < N; k++) fn(k, a, k * 4); return a; };
  const rotX = (a, o, ang) => { const y = a[o + 1], z = a[o + 2], c = Math.cos(ang), s = Math.sin(ang); a[o + 1] = y * c - z * s; a[o + 2] = y * s + z * c; };
  const rotZ = (a, o, ang) => { const x = a[o], y = a[o + 1], c = Math.cos(ang), s = Math.sin(ang); a[o] = x * c - y * s; a[o + 1] = x * s + y * c; };
  const GOLD = Math.PI * (3 - Math.sqrt(5));

  const sphere = make((k, a, o) => {
    const y = 1 - ((k + 0.5) / N) * 2, r = Math.sqrt(1 - y * y), th = k * GOLD, Rad = 2.35;
    a[o] = Math.cos(th) * r * Rad; a[o + 1] = y * Rad; a[o + 2] = Math.sin(th) * r * Rad; a[o + 3] = N > 400 ? 0.2 : 0.24;
  });
  const helix = make((k, a, o) => {
    const t = k / N, strand = k % 2, ang = t * Math.PI * 7 + strand * Math.PI, rad = 1.3 + (R() - 0.5) * 0.35;
    a[o] = Math.cos(ang) * rad; a[o + 1] = (0.5 - t) * 7.6; a[o + 2] = Math.sin(ang) * rad; a[o + 3] = 0.17;
    rotZ(a, o, -0.38);
  });
  const g = Math.ceil(Math.sqrt(N));
  const wave = make((k, a, o) => {
    const i = k % g, j = Math.floor(k / g);
    a[o] = (i - (g - 1) / 2) * 0.36; a[o + 1] = 0; a[o + 2] = (j - (g - 1) / 2) * 0.36; a[o + 3] = 0.15;
  });
  const torus = make((k, a, o) => {
    const u = k * GOLD, v = R() * Math.PI * 2, Rr = 2.3, r = 0.62;
    a[o] = Math.cos(u) * (Rr + r * Math.cos(v)); a[o + 1] = r * Math.sin(v); a[o + 2] = Math.sin(u) * (Rr + r * Math.cos(v)); a[o + 3] = 0.16;
    rotX(a, o, 1.12); rotZ(a, o, 0.3);
  });
  const scatter = make((k, a, o) => {
    a[o] = (R() - 0.5) * 24; a[o + 1] = (R() - 0.5) * 13; a[o + 2] = -3 - R() * 12; a[o + 3] = 0.06 + R() * 0.14;
  });
  const sp = 0.4;
  const lattice = make((k, a, o) => {
    const i = k % SIDE, l = Math.floor(k / SIDE) % SIDE, j = Math.floor(k / (SIDE * SIDE));
    a[o] = (i - (SIDE - 1) / 2) * sp; a[o + 1] = ((SIDE - 1) / 2 - j) * sp; a[o + 2] = (l - (SIDE - 1) / 2) * sp; a[o + 3] = 0.3;
  });
  /* Portrait : mosaïque de la photo, calée derrière le cadre de « À propos ».
     Remplie quand l'image est chargée ; en attendant, c'est une hélice. */
  const PORTRAIT = 6, PW = 3.2;              // largeur de la mosaïque (unités locales)
  const portrait = Float32Array.from(helix);
  const photoCol = new Float32Array(N);      // luminosité de la photo par module
  const SHAPES = [sphere, helix, wave, torus, scatter, lattice, portrait];
  const CHAOS = [1, 1, 0.15, 1, 1, 0, 0];    // désordre des rotations par forme
  const WAVE = [0, 0, 1, 0, 0, 0, 0];

  /* Attributs par module */
  const delay = new Float32Array(N), rot = new Float32Array(N * 3), spin = new Float32Array(N), role = new Uint8Array(N);
  for (let k = 0; k < N; k++) {
    delay[k] = clamp(k / N * 0.7 + R() * 0.3, 0, 1);
    rot[k * 3] = R() * Math.PI * 2; rot[k * 3 + 1] = R() * Math.PI * 2; rot[k * 3 + 2] = R() * Math.PI * 2;
    spin[k] = (R() - 0.5) * 0.8;
    const r = R();
    role[k] = r < 0.05 ? 2 : r < 0.15 ? 1 : 0;
  }
  const pos = new Float32Array(N * 4);
  pos.set(scatter);

  /* Couleurs issues du thème CSS, mélangées aux gris de la photo selon pMix */
  let palette = [], pMix = 0;
  const tmpCol = new THREE.Color(), grey = new THREE.Color();
  function applyColors() {
    for (let k = 0; k < N; k++) {
      tmpCol.copy(palette[role[k]]);
      if (pMix > 0) tmpCol.lerp(grey.setRGB(photoCol[k], photoCol[k], photoCol[k], THREE.SRGBColorSpace), pMix);
      mesh.setColorAt(k, tmpCol);
    }
    mesh.instanceColor.needsUpdate = true;
  }
  function applyTheme() {
    const cs = getComputedStyle(document.documentElement);
    const read = (n, f) => new THREE.Color((cs.getPropertyValue(n).trim() || f));
    palette = [read("--obj-base", "#f4f5f1"), read("--obj-dark", "#2b2f2d"), read("--obj-accent", "#2437c4")];
    applyColors();
    scene.fog.color.copy(read("--bg", "#e4e6e2"));
    mat.envMapIntensity = parseFloat(cs.getPropertyValue("--env")) || 0.9;
  }
  applyTheme();
  addEventListener("themechange", () => requestAnimationFrame(applyTheme));
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);

  /* Mosaïque à partir de la photo */
  const portraitEl = document.getElementById("portrait");
  let hasMosaic = false;
  const photoSrc = (window.PORTFOLIO || {}).photo;
  if (portraitEl && photoSrc) {
    const img = new Image();
    img.onload = () => {
      const cols = Math.floor(Math.sqrt(N * 4 / 5)), rows = Math.floor(cols * 5 / 4);
      const cv = document.createElement("canvas");
      cv.width = cols; cv.height = rows;
      const cx = cv.getContext("2d", { willReadFrequently: true });
      cx.imageSmoothingQuality = "high";
      // recadrage « cover » en 4:5, comme le cadre CSS
      const ratio = 4 / 5, iw = img.naturalWidth, ih = img.naturalHeight;
      let sw = iw, sh = ih;
      if (iw / ih > ratio) sw = ih * ratio; else sh = iw / ratio;
      cx.drawImage(img, (iw - sw) / 2, (ih - sh) * 0.3, sw, sh, 0, 0, cols, rows);
      const px = cx.getImageData(0, 0, cols, rows).data;
      const cell = PW / cols, H = cell * rows;
      for (let k = 0; k < N; k++) {
        const o = k * 4;
        if (k >= cols * rows) {                  // modules en trop : rangés, invisibles
          portrait[o] = 0; portrait[o + 1] = 0; portrait[o + 2] = -0.6; portrait[o + 3] = 0;
          continue;
        }
        const i = k % cols, j = Math.floor(k / cols), p = k * 4;
        let l = (0.2126 * px[p] + 0.7152 * px[p + 1] + 0.0722 * px[p + 2]) / 255;
        l = clamp((l - 0.5) * 1.25 + 0.52, 0, 1);  // même contraste que la photo affichée
        photoCol[k] = l;
        const z = (0.5 - l) * 0.4;                 // relief : les zones sombres avancent
        const persp = 0.97 * (1 - z * 1.2 / camera.position.z); // reste dans le cadre malgré la perspective
        portrait[o] = ((i + 0.5) * cell - PW / 2) * persp;
        portrait[o + 1] = (H / 2 - (j + 0.5) * cell) * persp;
        portrait[o + 2] = z;
        portrait[o + 3] = cell * (0.8 + (1 - l) * 0.12);
      }
      hasMosaic = !reduced;
      document.documentElement.classList.toggle("has-mosaic", hasMosaic);
    };
    img.src = photoSrc;
  }

  /* Sections */
  const sections = [...document.querySelectorAll("main > section[data-shape]")].map((el) => ({
    el, shape: +el.dataset.shape || 0, x: +el.dataset.x || 0, y: +el.dataset.y || 0, z: +el.dataset.z || 0,
  }));

  /* Souris */
  let mx = 0, my = 0, smx = 0, smy = 0;
  addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  });

  const dummy = new THREE.Object3D();
  const off = new THREE.Vector3(), tmpV = new THREE.Vector3();
  let settle = 0, resolved = false;
  let intro = reduced ? 1 : 0, started = reduced, last = performance.now(), time = 0;
  let lastY = scrollY, vel = 0, visible = true;
  addEventListener("portfolio:ready", () => { started = true; canvas.classList.add("is-on"); });
  setTimeout(() => { started = true; canvas.classList.add("is-on"); }, 4000);
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; if (visible) { last = performance.now(); loop(); } });

  function loop() {
    if (!visible) return;
    requestAnimationFrame(loop);
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!reduced) time += dt;
    if (started && intro < 1) intro = Math.min(1, intro + dt / 2.6);

    /* Où en est-on dans la page ? */
    const vh = innerHeight, sy = scrollY, mid = sy + vh * 0.5;
    let i = 0;
    const tops = sections.map((s) => s.el.getBoundingClientRect().top + sy);
    for (let n = 0; n < tops.length; n++) if (tops[n] <= mid) i = n;
    const nx = Math.min(i + 1, sections.length - 1);
    const span = vh * (sections[i].shape === PORTRAIT ? 0.35 : 0.9);
    const w = nx === i ? 0 : smooth(clamp((mid - (tops[nx] - span)) / span, 0, 1));
    const A = sections[i], B = sections[nx];
    const SA = SHAPES[A.shape], SB = SHAPES[B.shape];

    /* Vitesse de défilement : les modules s'écartent légèrement */
    const dy = sy - lastY; lastY = sy;
    vel += (clamp(Math.abs(dy) * 0.0025, 0, 0.22) - vel) * 0.08;
    const pw = (A.shape === PORTRAIT ? 1 - w : 0) + (B.shape === PORTRAIT && nx !== i ? w : 0);
    const spread = 1 + (reduced ? 0 : vel) * (1 - pw);

    /* Position du groupe : côté libre de l'écran */
    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const unit = isMobile() ? 0 : Math.min(3.6, visH * camera.aspect * 0.27);
    off.set(
      THREE.MathUtils.lerp(A.x, B.x, w) * unit,
      THREE.MathUtils.lerp(A.y, B.y, w) * (isMobile() ? 0.6 : 1.1) + (isMobile() ? 1.2 : 0),
      THREE.MathUtils.lerp(A.z, B.z, w)
    );
    let sc = isMobile() ? 0.78 : clamp(camera.aspect / 1.9, 0.66, 1);
    if (pw > 0 && portraitEl) {
      // centre et largeur du cadre photo, convertis en coordonnées 3D (plan z = 0)
      const r = portraitEl.getBoundingClientRect();
      const perPx = visH / vh;
      off.lerp(tmpV.set((r.left + r.width / 2 - innerWidth / 2) * perPx, (vh / 2 - (r.top + r.height / 2)) * perPx, 0), pw);
      sc += (r.width * perPx / PW - sc) * pw;
    }
    group.position.lerp(off, 1 - Math.exp(-dt * (3 + pw * 14)));
    group.scale.setScalar(sc);

    smx += (mx - smx) * 0.05; smy += (my - smy) * 0.05;
    const ry = time * 0.07 + sy * 0.0006 + smx * 0.45;
    const rx = 0.22 + smy * 0.25 + (WAVE[A.shape] * (1 - w) + WAVE[B.shape] * w) * 0.35;
    // face à la caméra pour le portrait, avec une légère inclinaison à la souris
    let dRy = (smx * 0.5 - ry) % (Math.PI * 2);
    if (dRy > Math.PI) dRy -= Math.PI * 2; else if (dRy < -Math.PI) dRy += Math.PI * 2;
    group.rotation.y = ry + dRy * pw;
    group.rotation.x = rx + (smy * 0.3 - rx) * pw;

    /* Couleurs de la photo + apparition de la vraie photo une fois la mosaïque formée */
    if (hasMosaic) {
      if (Math.abs(pw - pMix) > 0.01 || (pw === 0 && pMix !== 0) || (pw === 1 && pMix !== 1)) { pMix = pw; applyColors(); }
      settle = pw > 0.97 ? settle + dt : 0;
      const res = settle > 1.1;
      if (res !== resolved) { resolved = res; portraitEl.classList.toggle("is-resolved", res); }
      document.documentElement.classList.toggle("in-portrait", pw > 0.3);
    }

    const follow = 1 - Math.exp(-dt * 5.5);
    const introEase = intro >= 1;
    for (let k = 0; k < N; k++) {
      const o = k * 4;
      const wk = smooth(clamp((w - delay[k] * 0.45) / 0.55, 0, 1));
      let tx = SA[o] + (SB[o] - SA[o]) * wk;
      let ty = SA[o + 1] + (SB[o + 1] - SA[o + 1]) * wk;
      let tz = SA[o + 2] + (SB[o + 2] - SA[o + 2]) * wk;
      let ts = SA[o + 3] + (SB[o + 3] - SA[o + 3]) * wk;
      const wv = WAVE[A.shape] * (1 - wk) + WAVE[B.shape] * wk;
      if (wv > 0) ty += wv * Math.sin(tx * 0.9 + time * 1.3) * Math.cos(tz * 0.8 + time * 0.9) * 0.45;
      tx *= spread; ty *= spread; tz *= spread;
      if (!introEase) {
        const e = smooth(clamp(intro * 1.6 - delay[k] * 0.6, 0, 1));
        tx = scatter[o] + (tx - scatter[o]) * e; ty = scatter[o + 1] + (ty - scatter[o + 1]) * e;
        tz = scatter[o + 2] + (tz - scatter[o + 2]) * e; ts = scatter[o + 3] + (ts - scatter[o + 3]) * e;
      }
      pos[o] += (tx - pos[o]) * follow;
      pos[o + 1] += (ty - pos[o + 1]) * follow;
      pos[o + 2] += (tz - pos[o + 2]) * follow;
      pos[o + 3] += (ts - pos[o + 3]) * follow;

      const chaos = CHAOS[A.shape] * (1 - wk) + CHAOS[B.shape] * wk;
      const s3 = k * 3, t = time * spin[k];
      dummy.position.set(pos[o], pos[o + 1], pos[o + 2]);
      dummy.rotation.set((rot[s3] + t) * chaos, (rot[s3 + 1] + t * 0.7) * chaos, rot[s3 + 2] * chaos);
      dummy.scale.setScalar(pos[o + 3]);
      dummy.updateMatrix();
      mesh.setMatrixAt(k, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }
  loop();
}

init();

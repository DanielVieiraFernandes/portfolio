'use strict';

/* Desktop wallpaper, drawn as 90s pixel art: a dithered night sky over the
   edge of a planet, square stars that twinkle in steps and the occasional
   shooting star. Rendered at 1/3 resolution and scaled up with crisp pixels.
   Kept light: ~20 fps, paused when the tab is hidden, static with reduced motion. */
(() => {
  const canvas = document.getElementById('sky');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const PX = 3;                                   // screen pixels per art pixel
  const FPS = 20;
  const SKY = ['#07040d', '#0d0717', '#140b24', '#1d1033', '#291649', '#382063', '#4a2b80'];
  const GROUND = ['#0c0715', '#140b22', '#1d1131'];
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
  let cw = 0, ch = 0, bg = null, planet = null, stars = [], meteors = [];
  let last = 0, lastDraw = 0, nextMeteor = 0, frame = 0;

  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const SKY_RGB = SKY.map(rgb), GROUND_RGB = GROUND.map(rgb);

  // Rim light colour steps along the horizon: mint, violet, blue.
  function rimColor(x) {
    const u = x / cw;
    return u < .14 || u > .9 ? '#4a2b80' : u < .42 ? '#74f0c4' : u < .66 ? '#b18cff' : '#5aa2ff';
  }

  function horizonAt(x) {
    const dx = x - planet.x;
    return Math.abs(dx) >= planet.r ? Infinity : planet.y - Math.sqrt(planet.r * planet.r - dx * dx);
  }

  function paintBackground() {
    bg = document.createElement('canvas');
    bg.width = cw; bg.height = ch;
    const bctx = bg.getContext('2d');
    const img = bctx.createImageData(cw, ch);
    const d = img.data;
    const rims = [];
    for (let x = 0; x < cw; x++) {
      const hy = horizonAt(x);
      const rim = rgb(rimColor(x));
      rims.push(rim);
      for (let y = 0; y < ch; y++) {
        const th = BAYER[(y & 3) * 4 + (x & 3)];
        let c;
        if (y >= hy) {
          const depth = y - hy;
          if (depth < 1) c = rim;
          else {
            const v = Math.max(0, 1 - depth / 10) * (GROUND.length - 1);
            const base = Math.floor(v);
            c = GROUND_RGB[Math.min(GROUND.length - 1, base + (v - base > th ? 1 : 0))];
          }
        } else {
          const above = hy - y;
          if (above < 1.5 && (x + y) % 2 === 0) c = rim;                    // dithered glow on the rim
          else {
            const glow = Math.max(0, 1 - above / (ch * .38));
            const v = Math.min(1, .5 * (y / ch) + .62 * glow ** 1.6) * (SKY.length - 1);
            const base = Math.floor(v);
            c = SKY_RGB[Math.min(SKY.length - 1, base + (v - base > th ? 1 : 0))];
          }
        }
        const i = (y * cw + x) * 4;
        d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
      }
    }
    bctx.putImageData(img, 0, 0);
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    const w = box.width, h = box.height;
    cw = Math.max(1, Math.ceil(w / PX));
    ch = Math.max(1, Math.ceil(h / PX));
    canvas.width = cw; canvas.height = ch;
    // Same planet as the earlier wallpaper: 1920x1080 frame, anchored bottom centre.
    const s = Math.max(w / 1920, h / 1080) / PX;
    planet = { x: cw / 2, y: ch + 1980 * s, r: 2200 * s };
    paintBackground();
    const count = Math.round(Math.min(130, (w * h) / 9000));
    stars = [];
    while (stars.length < count) {
      const x = Math.random() * cw, y = Math.random() * ch;
      if (y > horizonAt(x) - 4) continue;
      stars.push({
        x, y,
        big: Math.random() < .12,
        tint: Math.random() < .2 ? (Math.random() < .5 ? '#d4bfff' : '#bff7e4') : '#f5f0ff',
        phase: Math.random() * 10,
        speed: .5 + Math.random() * 1.2,
        drift: .5 + Math.random() * 1.2           // art pixels per second, leftward
      });
    }
    draw(0);
  }

  function spawnMeteor() {
    const right = Math.random() < .5;
    const angle = .35 + Math.random() * .25;
    const speed = 180 + Math.random() * 60;
    meteors.push({
      x: right ? Math.random() * cw * .5 : cw * .5 + Math.random() * cw * .5,
      y: Math.random() * ch * .3,
      vx: Math.cos(angle) * speed * (right ? 1 : -1),
      vy: Math.sin(angle) * speed,
      life: 0, ttl: .8 + Math.random() * .4
    });
  }

  const TRAIL = ['#ffffff', '#efe6ff', '#d4bfff', '#b18cff', '#b18cff', '#8f6ae0', '#74f0c4', '#74f0c4', '#4fb89a', '#4fb89a', '#3a8a76', '#3a8a76'];

  function draw(t) {
    ctx.drawImage(bg, 0, 0);
    for (const s of stars) {
      const x = Math.round(s.x), y = Math.round(s.y);
      if (y > horizonAt(x) - 3) continue;
      // Twinkle in three hard steps, like a palette cycle.
      const step = still.matches ? 2 : Math.floor((Math.sin(t * s.speed + s.phase) + 1) * 1.5);
      ctx.globalAlpha = [.35, .65, 1][Math.min(2, step)];
      ctx.fillStyle = s.tint;
      if (s.big && step === 2) {
        ctx.fillRect(x - 1, y, 3, 1);
        ctx.fillRect(x, y - 1, 1, 3);
      } else ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;
    for (const m of meteors) {
      const p = m.life / m.ttl;
      const len = Math.round(TRAIL.length * (p < .25 ? p / .25 : 1 - (p - .25) / .75 * .6));
      const speed = Math.hypot(m.vx, m.vy);
      const ux = m.vx / speed, uy = m.vy / speed;
      for (let i = 0; i < len; i++) {
        if (i > 5 && i % 2) continue;                  // dithered tail
        const x = Math.round(m.x - ux * i), y = Math.round(m.y - uy * i);
        if (y > horizonAt(x) - 1) continue;
        ctx.fillStyle = TRAIL[i];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  function tick(now) {
    frame = requestAnimationFrame(tick);
    const t = now / 1000;
    const dt = Math.min(.1, last ? t - last : 0);
    last = t;
    for (const s of stars) {
      s.x -= s.drift * dt;
      if (s.x < -2) {
        s.x = cw + 2;
        do { s.y = Math.random() * ch; } while (s.y > horizonAt(s.x) - 4);
      }
    }
    if (!nextMeteor) nextMeteor = t + 3;               // first one soon after load
    else if (t > nextMeteor) {
      spawnMeteor();
      nextMeteor = t + 6 + Math.random() * 9;          // then one every 6 to 15 s
    }
    meteors = meteors.filter(m => {
      m.life += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      return m.life < m.ttl;
    });
    if (t - lastDraw >= 1 / FPS) { lastDraw = t; draw(t); }
  }

  function start() {
    cancelAnimationFrame(frame);
    if (still.matches || document.hidden) { draw(0); return; }
    last = 0;
    frame = requestAnimationFrame(tick);
  }

  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); });
  document.addEventListener('visibilitychange', start);
  still.addEventListener('change', start);
  resize();
  start();
})();

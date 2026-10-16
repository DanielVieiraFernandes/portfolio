'use strict';

/* Animated night sky behind the desktop: stars drift and twinkle, and now and
   then a shooting star crosses. Kept light: few stars, paused when the tab is
   hidden, and static when the visitor prefers reduced motion. */
(() => {
  const canvas = document.getElementById('sky');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  // Planet in wallpaper.svg coordinates (viewBox 1920x1080, cover, anchored bottom centre).
  const VB = { w: 1920, h: 1080, cx: 960, cy: 3060, r: 2200 };
  let w = 0, h = 0, dpr = 1, stars = [], meteors = [], planet = null;
  let last = 0, nextMeteor = 0, frame = 0;

  function resize() {
    const box = canvas.getBoundingClientRect();
    w = box.width; h = box.height;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const s = Math.max(w / VB.w, h / VB.h);
    planet = { x: w / 2 + (VB.cx - VB.w / 2) * s, y: h - (VB.h - VB.cy) * s, r: VB.r * s };
    const count = Math.round(Math.min(140, (w * h) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() < .85 ? .5 + Math.random() * .7 : 1.2 + Math.random() * .6,
      base: .25 + Math.random() * .5,
      phase: Math.random() * Math.PI * 2,
      speed: .4 + Math.random() * 1.2,          // twinkle speed
      drift: 2 + Math.random() * 4               // px per second, leftward
    }));
    if (still.matches) draw(0);
  }

  function spawnMeteor() {
    const fromLeft = Math.random() < .5;
    const angle = .35 + Math.random() * .25;     // radians below horizontal
    const speed = 560 + Math.random() * 160;
    meteors.push({
      x: fromLeft ? Math.random() * w * .5 : w * .5 + Math.random() * w * .5,
      y: Math.random() * h * .3,
      vx: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
      vy: Math.sin(angle) * speed,
      life: 0,
      ttl: .9 + Math.random() * .5
    });
  }

  function clipToSky() {
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.arc(planet.x, planet.y, planet.r, 0, Math.PI * 2, true);
    ctx.clip();
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    clipToSky();
    for (const s of stars) {
      const a = still.matches ? s.base : s.base * (.55 + .45 * Math.sin(t * s.speed + s.phase));
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = '#f5f0ff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const m of meteors) {
      const p = m.life / m.ttl;
      const fade = p < .2 ? p / .2 : 1 - (p - .2) / .8;
      const len = 110;
      const speed = Math.hypot(m.vx, m.vy);
      const tx = m.x - (m.vx / speed) * len, ty = m.y - (m.vy / speed) * len;
      const grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
      grad.addColorStop(0, `rgba(245, 240, 255, ${.9 * fade})`);
      grad.addColorStop(.3, `rgba(177, 140, 255, ${.45 * fade})`);
      grad.addColorStop(1, 'rgba(116, 240, 196, 0)');
      ctx.globalAlpha = 1;
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }
    ctx.restore();
  }

  function tick(now) {
    const t = now / 1000;
    const dt = Math.min(.05, last ? t - last : 0);
    last = t;
    for (const s of stars) {
      s.x -= s.drift * dt;
      if (s.x < -2) { s.x = w + 2; s.y = Math.random() * h; }
    }
    if (!nextMeteor) nextMeteor = t + 3;           // first one soon after load
    else if (t > nextMeteor) {
      spawnMeteor();
      nextMeteor = t + 6 + Math.random() * 9;      // then one every 6 to 15 s
    }
    meteors = meteors.filter(m => {
      m.life += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      return m.life < m.ttl;
    });
    draw(t);
    frame = requestAnimationFrame(tick);
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

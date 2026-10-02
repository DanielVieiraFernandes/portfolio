'use strict';

// Progressive enhancement: every link and piece of content works without JS.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

/* ------------------------------------------------ Header, menu, active nav */
(() => {
  document.getElementById('year').textContent = new Date().getFullYear();
  const header = document.querySelector('.site-header');
  const nav = document.getElementById('navigation');
  const menu = document.querySelector('.menu-toggle');

  function closeMenu() {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menu');
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  menu.hidden = false;
  header.classList.add('menu-ready');

  nav.addEventListener('click', event => {
    if (!event.target.closest('a')) return;
    const wasOpen = menu.getAttribute('aria-expanded') === 'true';
    closeMenu();
    if (wasOpen) menu.focus({ preventScroll: true });
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  document.addEventListener('focusin', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus({ preventScroll: true });
    }
  });
  matchMedia('(min-width: 861px)').addEventListener('change', closeMenu);

  const links = [...nav.querySelectorAll('a')];
  const sections = links.map(link => document.querySelector(link.hash));
  let pending = false;
  function update() {
    header.classList.toggle('is-scrolled', scrollY > 8);
    let active = -1;
    sections.forEach((section, index) => { if (section && section.getBoundingClientRect().top <= 160) active = index; });
    if (scrollY > 0 && scrollY + innerHeight >= document.documentElement.scrollHeight - 4) active = sections.length - 1;
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    pending = false;
  }
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(update); } };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  update();
})();

/* -------------------------------- Developer card: tilt and foil on pointer */
(() => {
  const card = document.getElementById('dev-card');
  const stage = card?.parentElement;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  if (!card || !stage) return;

  let frame = 0;
  function move(event) {
    if (reducedMotion.matches || !finePointer.matches) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;   // 0..1
    const y = (event.clientY - rect.top) / rect.height;   // 0..1
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      card.classList.add('is-tilting');
      card.style.setProperty('--ry', `${(x - .5) * 18}deg`);
      card.style.setProperty('--rx', `${(.5 - y) * 14}deg`);
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.setProperty('--foil', `${30 + (x + y) * 25}%`);
    });
  }
  function reset() {
    cancelAnimationFrame(frame);
    card.classList.remove('is-tilting');
    ['--rx', '--ry'].forEach(p => card.style.setProperty(p, '0deg'));
    card.style.setProperty('--mx', '50%');
    card.style.setProperty('--my', '30%');
    card.style.setProperty('--foil', '50%');
  }
  stage.addEventListener('pointermove', move);
  stage.addEventListener('pointerleave', reset);
  reducedMotion.addEventListener('change', reset);
})();

/* ------------------- Health Check preview: a small, illustrative live demo */
(() => {
  const monitor = document.getElementById('monitor');
  if (!monitor) return;
  const line = document.getElementById('latency-line');
  const area = document.getElementById('latency-area');
  const nowLabel = document.getElementById('latency-now');
  const agoLabel = document.getElementById('monitor-ago');
  const beatRows = [...monitor.querySelectorAll('[data-beats]')];
  const W = 320, H = 90, POINTS = 28, BEATS = 40;

  // Deterministic-looking noise so the first paint is stable.
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const latency = Array.from({ length: POINTS }, () => 70 + rand() * 30);

  function drawChart() {
    const min = 40, max = 140;
    const step = W / (POINTS - 1);
    const pts = latency.map((v, i) => [i * step, H - ((v - min) / (max - min)) * (H - 22) - 4]);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
    }
    line.setAttribute('d', d);
    area.setAttribute('d', `${d} L${W},${H} L0,${H} Z`);
    nowLabel.textContent = `${Math.round(latency[latency.length - 1])} ms`;
  }

  function beat(row, animate) {
    const slowEvery = Number(row.dataset.slow) || 0;
    const i = document.createElement('i');
    row.count = (row.count || 0) + 1;
    if (slowEvery && row.count % slowEvery === 0) i.className = 'slow';
    if (animate) i.classList.add('new');
    row.appendChild(i);
    while (row.children.length > BEATS) row.firstElementChild.remove();
  }

  beatRows.forEach(row => {
    row.classList.add('is-live');
    for (let n = 0; n < BEATS; n++) beat(row, false);
  });
  drawChart();

  let timer = 0, ago = 0, visible = false;
  function tick() {
    ago = (ago + 1) % 5;
    agoLabel.textContent = String(ago + 1);
    if (ago !== 0) return;
    latency.shift();
    const last = latency[latency.length - 1];
    latency.push(Math.max(55, Math.min(125, last + (rand() - .5) * 26)));
    drawChart();
    beatRows.forEach(row => beat(row, true));
  }
  function sync() {
    const run = visible && !document.hidden && !reducedMotion.matches;
    if (run && !timer) timer = setInterval(tick, 1000);
    if (!run && timer) { clearInterval(timer); timer = 0; }
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(monitor);
  } else { visible = true; sync(); }
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
})();

/* ------------------------------------------------------------- Copy e-mail */
(() => {
  const button = document.getElementById('copy-email');
  const toast = document.getElementById('toast');
  const label = button.querySelector('span');
  let timer;
  button.hidden = false;
  button.addEventListener('click', async () => {
    const email = document.querySelector('.mail-big').textContent.trim();
    let copied = false;
    try { await navigator.clipboard.writeText(email); copied = true; }
    catch {
      const field = document.createElement('textarea');
      field.value = email;
      field.setAttribute('aria-label', 'E-mail para copiar');
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(field);
      field.select();
      try { copied = document.execCommand('copy'); } catch { /* address stays selectable */ }
      field.remove();
      button.focus({ preventScroll: true });
    }
    clearTimeout(timer);
    toast.textContent = copied ? 'E-mail copiado' : 'Não foi possível copiar. Selecione o endereço acima.';
    label.textContent = copied ? 'Copiado' : 'Copiar e-mail';
    toast.classList.add('visible');
    timer = setTimeout(() => {
      toast.classList.remove('visible');
      label.textContent = 'Copiar e-mail';
    }, 3200);
  });
})();

'use strict';

// Navigation and contact work independently of the optional 3D illustration.
(() => {
  document.getElementById('year').textContent = new Date().getFullYear();
  const menu = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav-links');
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
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => { if (!event.target.closest('.nav')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
  });
  matchMedia('(min-width:761px)').addEventListener('change', closeMenu);
  const progress = document.getElementById('reading-progress');
  const links = [...document.querySelectorAll('.navigation a')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href')));
  let pending = false;
  function updateNavigation() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0) + ')';
    let active = -1;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= 150) active = index;
    });
    if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 3) {
      active = sections.length - 1;
    }
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    pending = false;
  }
  function queueNavigation() {
    if (!pending) { pending = true; requestAnimationFrame(updateNavigation); }
  }
  window.addEventListener('scroll', queueNavigation, { passive: true });
  window.addEventListener('resize', queueNavigation);
  window.addEventListener('load', queueNavigation);
  window.addEventListener('pageshow', queueNavigation);
  updateNavigation();

  let toastTimer;
  const toast = document.getElementById('toast');
  function notify(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 4500);
  }
  const copyButton = document.getElementById('copy-email');
  copyButton.addEventListener('click', async () => {
    const email = 'fernandesdanielvieira@gmail.com';
    let copied = false;
    try { await navigator.clipboard.writeText(email); copied = true; }
    catch {
      const field = document.createElement('textarea');
      field.value = email;
      field.setAttribute('aria-label', 'E-mail para copiar');
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(field);
      field.select();
      try { copied = document.execCommand('copy'); } catch { /* Keep the address available in the page. */ }
      field.remove();
      copyButton.focus({ preventScroll: true });
    }
    notify(copied ? 'E-mail copiado.' : 'Não foi possível copiar. Selecione o endereço de e-mail na página.');
  });
})();


// Layered geometric sculpture. Motion follows the visitor's system preference.
window.addEventListener('load', () => {
  if (!window.THREE) return;
  const shell = document.getElementById('network');
  const canvas = document.getElementById('network-canvas');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const resources = [];
  let renderer, resizeObserver, visibilityObserver;
  let disposed = false, contextLost = false, visible = false;
  let elapsed = 0, lastTime = null;
  const pointer = { x: 0, y: 0 };
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.outputEncoding = THREE.sRGBEncoding;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 40);
    scene.add(new THREE.HemisphereLight(0xdcd4ff, 0x181124, 1.6));
    const light = new THREE.DirectionalLight(0xffffff, 2.5);
    light.position.set(3, 5, 4); scene.add(light);
    const rim = new THREE.DirectionalLight(0x9980ff, 2);
    rim.position.set(-4, -1, 2); scene.add(rim);
    const sculpture = new THREE.Group();
    sculpture.rotation.set(.35, -.35, .15);
    scene.add(sculpture);
    const frames = [];
    [2.9, 2.35, 1.8].forEach((size, i) => {
      const box = new THREE.BoxGeometry(size, size, size);
      const edges = new THREE.EdgesGeometry(box);
      box.dispose();
      const material = new THREE.LineBasicMaterial({ color: [0x8170ba, 0xada0df, 0xd3c6ff][i], transparent: true, opacity: .38 + i * .15 });
      const frame = new THREE.LineSegments(edges, material);
      frame.rotation.set(i * .35, i * .5, i * .25);
      sculpture.add(frame); frames.push(frame); resources.push(edges, material);
    });
    const crystalGeometry = new THREE.IcosahedronGeometry(.75, 0);
    const crystalMaterial = new THREE.MeshStandardMaterial({ color: 0xa99bdd, roughness: .24, metalness: .65, flatShading: true });
    const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
    sculpture.add(crystal); resources.push(crystalGeometry, crystalMaterial);
    function render() { if (!disposed && !contextLost) renderer.render(scene, camera); }
    function resize() {
      if (disposed || !shell.clientWidth || !shell.clientHeight) return;
      renderer.setSize(shell.clientWidth, shell.clientHeight, false);
      camera.aspect = shell.clientWidth / shell.clientHeight;
      camera.position.z = camera.aspect < 1 ? 9.4 : 8;
      camera.updateProjectionMatrix(); render();
    }
    function animate(time) {
      if (lastTime !== null && time - lastTime < 1000 / 30) return;
      const dt = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, .06);
      lastTime = time; elapsed += dt;
      frames.forEach((frame, i) => {
        frame.rotation.y += dt * (.07 + i * .03) * (i % 2 ? -1 : 1);
        frame.rotation.z += dt * .025;
      });
      crystal.rotation.y -= dt * .16;
      sculpture.rotation.y += ((-.35 + pointer.x * .25) - sculpture.rotation.y) * Math.min(1, dt * 3);
      sculpture.rotation.x += ((.35 + pointer.y * .18) - sculpture.rotation.x) * Math.min(1, dt * 3);
      sculpture.position.y = Math.sin(elapsed * .5) * .07;
      render();
    }
    function sync() {
      if (disposed) return;
      lastTime = null;
      renderer.setAnimationLoop(!reducedMotion.matches && visible && !document.hidden && !contextLost ? animate : null);
      render();
    }
    resizeObserver = new ResizeObserver(resize); resizeObserver.observe(shell);
    visibilityObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
    visibilityObserver.observe(shell);
    shell.addEventListener('pointermove', event => {
      if (reducedMotion.matches || event.pointerType === 'touch') return;
      const rect = shell.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
      pointer.y = (event.clientY - rect.top) / rect.height * 2 - 1;
    });
    shell.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });
    reducedMotion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault(); contextLost = true; renderer.setAnimationLoop(null); shell.classList.remove('ready');
    });
    canvas.addEventListener('webglcontextrestored', () => { contextLost = false; resize(); shell.classList.add('ready'); sync(); });
    window.addEventListener('pagehide', event => {
      renderer.setAnimationLoop(null);
      if (!event.persisted) {
        disposed = true; resizeObserver.disconnect(); visibilityObserver.disconnect();
        resources.forEach(resource => resource.dispose()); renderer.dispose();
      }
    });
    window.addEventListener('pageshow', event => { if (event.persisted) sync(); });
    resize(); shell.classList.add('ready'); sync();
  } catch (error) {
    disposed = true;
    resizeObserver?.disconnect(); visibilityObserver?.disconnect();
    resources.forEach(resource => resource.dispose());
    if (renderer) { renderer.setAnimationLoop(null); renderer.dispose(); }
    shell.classList.remove('ready');
    console.warn('Ilustração 3D indisponível.', error);
  }
});

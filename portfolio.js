'use strict';

// Progressive enhancement: links, project details and all content work without JS.
(() => {
  document.getElementById('year').textContent = new Date().getFullYear();
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
  document.querySelector('.site-header').classList.add('menu-ready');
  nav.addEventListener('click', event => {
    if (!event.target.closest('a')) return;
    const wasOpen = menu.getAttribute('aria-expanded') === 'true';
    closeMenu();
    // Avoid leaving keyboard focus inside a now-hidden mobile menu.
    if (wasOpen) menu.focus({ preventScroll: true });
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus({ preventScroll: true });
    }
  });
  document.addEventListener('focusin', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

  const links = [...nav.querySelectorAll('a')];
  const sections = links.map(link => document.querySelector(link.hash));
  let pending = false;
  function updateSection() {
    let active = -1;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= 150) active = index;
    });
    if (window.scrollY > 0 && window.scrollY + innerHeight >= document.documentElement.scrollHeight - 4) active = sections.length - 1;
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    pending = false;
  }
  function scheduleUpdate() {
    if (!pending) { pending = true; requestAnimationFrame(updateSection); }
  }
  addEventListener('scroll', scheduleUpdate, { passive: true });
  addEventListener('resize', scheduleUpdate);
  addEventListener('load', scheduleUpdate);
  addEventListener('pageshow', scheduleUpdate);
  updateSection();
})();

// One short entrance per block. Nothing loops, follows the pointer or hijacks scrolling.
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const blocks = [...document.querySelectorAll('[data-reveal]')];
  let observer;
  const reveal = (block, animate = true) => {
    if (!block.classList.contains('reveal-pending')) return;
    block.classList.remove('reveal-pending');
    if (animate && !preference.matches) block.classList.add('reveal-in');
    observer?.unobserve(block);
  };
  function showAll() {
    observer?.disconnect();
    blocks.forEach(block => block.classList.remove('reveal-pending', 'reveal-in'));
  }
  if ('IntersectionObserver' in window && !preference.matches) {
    try {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
      }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
      blocks.forEach(block => {
        // Preserve initial anchors and content already on screen, including restored scroll.
        if (block.getBoundingClientRect().top > innerHeight) {
          observer.observe(block);
          block.classList.add('reveal-pending');
        }
      });
    } catch { showAll(); }
  }
  blocks.forEach(block => block.addEventListener('animationend', () => block.classList.remove('reveal-in')));
  document.addEventListener('focusin', event => {
    const block = event.target.closest('[data-reveal]');
    if (block) reveal(block, false);
  });
  function revealAnchor(hash) {
    if (!hash || hash === '#') return;
    let target;
    try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch { return; }
    if (!target) return;
    const parent = target.closest('[data-reveal]');
    if (parent) reveal(parent, false);
    target.querySelectorAll('[data-reveal]').forEach(block => reveal(block, false));
    if (hash === '#curriculo') document.querySelectorAll('#contato [data-reveal]').forEach(block => reveal(block, false));
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link) revealAnchor(link.hash);
  });
  addEventListener('hashchange', () => revealAnchor(location.hash));
  addEventListener('pageshow', () => {
    blocks.forEach(block => { if (block.getBoundingClientRect().top < innerHeight) reveal(block, false); });
  });
  addEventListener('beforeprint', showAll);
  preference.addEventListener('change', event => { if (event.matches) showAll(); });
  revealAnchor(location.hash);
})();

(() => {
  const button = document.getElementById('copy-email');
  const toast = document.getElementById('toast');
  let timer;
  button.hidden = false;
  button.addEventListener('click', async () => {
    const email = document.querySelector('.email-address').textContent.trim();
    let copied = false;
    try { await navigator.clipboard.writeText(email); copied = true; }
    catch {
      const field = document.createElement('textarea');
      field.value = email;
      field.setAttribute('aria-label', 'E-mail para copiar');
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(field);
      field.select();
      try { copied = document.execCommand('copy'); } catch { /* Address remains selectable. */ }
      field.remove();
      button.focus({ preventScroll: true });
    }
    clearTimeout(timer);
    toast.textContent = copied ? 'E-mail copiado.' : 'Não foi possível copiar. Selecione o endereço de e-mail acima.';
    toast.classList.add('visible');
    timer = setTimeout(() => toast.classList.remove('visible'), 4000);
  });
})();

'use strict';

/* DanielOS: a tiny desktop with draggable windows. Content comes from
   content.js; this file is the window manager and the apps. */

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width: 760px)');
const coarse = matchMedia('(pointer: coarse)');
const $ = (sel, root = document) => root.querySelector(sel);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const wait = ms => new Promise(r => setTimeout(r, reducedMotion.matches ? 0 : ms));

/* ------------------------------------------------------------------ Icons */
const ICONS = {
  code: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#3f6fe0"/><path d="M0 12A12 12 0 0 1 12 0h24a12 12 0 0 1 12 12v8H0z" fill="#5aa2ff" opacity=".55"/><path d="M19 16 11 24l8 8M29 16l8 8-8 8" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  folder: '<svg viewBox="0 0 48 48"><path d="M5 13a4 4 0 0 1 4-4h10l4 4h16a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" fill="#3fbf95"/><path d="M5 19a4 4 0 0 1 4-4h30a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" fill="#74f0c4"/><text x="24" y="34" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="11" fill="#140823">dv</text></svg>',
  files: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#2b1f44"/><path d="M10 16a3 3 0 0 1 3-3h7l3 3h12a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z" fill="#b18cff"/><path d="M10 20h28v13a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z" fill="#d4bfff"/></svg>',
  terminal: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#0d0716"/><rect x="1" y="1" width="46" height="46" rx="11" fill="none" stroke="#45345f" stroke-width="2"/><path d="m13 18 7 6-7 6" fill="none" stroke="#74f0c4" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 31h11" stroke="#f5f0ff" stroke-width="3.2" stroke-linecap="round"/></svg>',
  pdf: '<svg viewBox="0 0 48 48"><path d="M12 4h17l11 11v27a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#f5f0ff"/><path d="M29 4v9a2 2 0 0 0 2 2h9z" fill="#c9bde0"/><rect x="6" y="24" width="26" height="12" rx="3" fill="#ff6b8b"/><text x="19" y="33.5" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="8.5" fill="#fff">PDF</text></svg>',
  mail: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#ff9f6b"/><rect x="10" y="14" width="28" height="20" rx="4" fill="#fff"/><path d="m11 16 13 10 13-10" fill="none" stroke="#ff7a45" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  browser: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#1e3a5f"/><circle cx="24" cy="24" r="13" fill="none" stroke="#5aa2ff" stroke-width="2.6"/><path d="M11 24h26M24 11c-7 8-7 18 0 26M24 11c7 8 7 18 0 26" fill="none" stroke="#5aa2ff" stroke-width="2.2"/></svg>',
  trash: '<svg viewBox="0 0 48 48"><path d="M12 15h24l-2 26a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z" fill="#8679a2"/><rect x="9" y="10" width="30" height="5" rx="2" fill="#aea2c6"/><path d="M20 10V7h8v3" fill="none" stroke="#aea2c6" stroke-width="2.4"/><path d="M20 21v16M28 21v16" stroke="#5c4f78" stroke-width="2.4" stroke-linecap="round"/></svg>',
  doc: '<svg viewBox="0 0 16 16"><path d="M4 1.5h5l3 3v10H4z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>'
};

const FILE_BADGES = { md: ['M↓', '#5aa2ff'], json: ['{}', '#ffd166'], cs: ['C#', '#b18cff'], ts: ['TS', '#5aa2ff'], pdf: ['PDF', '#ff6b8b'] };
const extOf = name => name.split('.').pop();
const baseName = path => path.split('/').pop();

/* ------------------------------------------------------------ App registry */
const APPS = {
  code: { title: 'Visual Studio Code', short: 'Code', icon: 'code', w: 1040, h: 660, render: renderCode },
  portfolio: { title: 'portfolio', short: 'portfolio', icon: 'folder', alias: 'code', desktopOnly: true },
  files: { title: 'Projetos', short: 'Projetos', icon: 'files', w: 720, h: 460, render: renderFiles },
  terminal: { title: 'Terminal', short: 'Terminal', icon: 'terminal', w: 680, h: 430, render: renderTerminal },
  pdf: { title: 'Currículo.pdf', short: 'Currículo', icon: 'pdf', w: 760, h: 640, render: renderPdf },
  contact: { title: 'Contato', short: 'Contato', icon: 'mail', w: 440, h: 520, render: renderContact },
  browser: { title: 'Navegador', short: 'Site clássico', icon: 'browser', w: 1080, h: 680, render: renderBrowser },
  trash: { title: 'Lixeira', short: 'Lixeira', icon: 'trash', w: 460, h: 320, render: renderTrash, desktopOnly: true }
};
const DESKTOP_ORDER = ['portfolio', 'code', 'files', 'terminal', 'pdf', 'contact', 'browser', 'trash'];
const DOCK_ORDER = ['code', 'files', 'terminal', 'pdf', 'contact', 'browser'];

/* --------------------------------------------------------- Window manager */
const windowsEl = $('#windows');
const open = new Map();          // appId -> { el, app, state }
let zTop = 10;
let cascade = 0;

function launch(id, options = {}) {
  const app = APPS[id];
  if (!app) return;
  if (app.alias) return launch(app.alias, { ...options, project: true });
  closeStart();
  const existing = open.get(id);
  if (existing) {
    existing.el.hidden = false;
    focusWindow(id);
    existing.onReopen?.(options);
    return existing;
  }

  const el = document.createElement('section');
  el.className = 'window';
  el.dataset.app = id;
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', app.title);
  el.innerHTML = `
    <header class="win-bar">
      <div class="win-lights">
        <button type="button" class="light close" data-act="close" aria-label="Fechar ${esc(app.short)}"></button>
        <button type="button" class="light min" data-act="min" aria-label="Minimizar ${esc(app.short)}"></button>
        <button type="button" class="light max" data-act="max" aria-label="Maximizar ${esc(app.short)}"></button>
      </div>
      <span class="win-title">${esc(app.title)}</span>
      <span class="win-bar-end"></span>
    </header>
    <div class="win-body"></div>
    <span class="win-resize" aria-hidden="true"></span>`;

  placeWindow(el, app, (cascade++ % 6) * 28);

  windowsEl.append(el);
  const record = { el, app };
  open.set(id, record);
  app.render($('.win-body', el), record, options);
  wireWindow(id, record);
  focusWindow(id);
  if (!reducedMotion.matches) el.classList.add('is-opening');
  el.addEventListener('animationend', () => el.classList.remove('is-opening'), { once: true });
  syncDock();
  return record;
}

function placeWindow(el, app, offset = 0) {
  const area = windowsEl.getBoundingClientRect();
  const w = Math.min(app.w, area.width - 32);
  const h = Math.min(app.h, area.height - 24);
  el.style.width = w + 'px';
  el.style.height = h + 'px';
  el.style.left = Math.max(8, (area.width - w) / 2 - 60 + offset) + 'px';
  el.style.top = Math.max(8, (area.height - h) / 2 - 30 + offset * 0.6) + 'px';
}

// Leaving the phone layout: give windows a proper desktop size again.
compact.addEventListener('change', e => { if (!e.matches) open.forEach(r => placeWindow(r.el, r.app)); });
// Keep windows reachable when the browser shrinks.
addEventListener('resize', () => {
  if (compact.matches) return;
  const area = windowsEl.getBoundingClientRect();
  open.forEach(({ el }) => {
    if (el.offsetWidth > area.width - 16) el.style.width = Math.max(340, area.width - 16) + 'px';
    if (el.offsetHeight > area.height - 8) el.style.height = Math.max(220, area.height - 8) + 'px';
    el.style.left = Math.min(el.offsetLeft, Math.max(0, area.width - el.offsetWidth)) + 'px';
    el.style.top = Math.min(el.offsetTop, Math.max(0, area.height - el.offsetHeight)) + 'px';
  });
});

function wireWindow(id, record) {
  const { el } = record;
  const bar = $('.win-bar', el);
  el.addEventListener('pointerdown', () => focusWindow(id));
  bar.addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'close') closeWindow(id);
    if (act === 'min') minimizeWindow(id);
    if (act === 'max') el.classList.toggle('is-max');
  });
  bar.addEventListener('dblclick', e => { if (!e.target.closest('button')) el.classList.toggle('is-max'); });

  // Drag by the title bar (desktop only; compact screens are always full).
  bar.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('button') || compact.matches || el.classList.contains('is-max')) return;
    const startX = e.clientX, startY = e.clientY;
    const left = el.offsetLeft, top = el.offsetTop;
    const area = windowsEl.getBoundingClientRect();
    bar.setPointerCapture(e.pointerId);
    el.classList.add('is-dragging');
    const move = ev => {
      el.style.left = Math.min(area.width - 80, Math.max(-el.offsetWidth + 120, left + ev.clientX - startX)) + 'px';
      el.style.top = Math.min(area.height - 40, Math.max(0, top + ev.clientY - startY)) + 'px';
    };
    const up = () => { el.classList.remove('is-dragging'); bar.removeEventListener('pointermove', move); };
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up, { once: true });
    bar.addEventListener('pointercancel', up, { once: true });
  });

  const grip = $('.win-resize', el);
  grip.addEventListener('pointerdown', e => {
    if (compact.matches || el.classList.contains('is-max')) return;
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY, w = el.offsetWidth, h = el.offsetHeight;
    grip.setPointerCapture(e.pointerId);
    const move = ev => {
      el.style.width = Math.max(340, w + ev.clientX - startX) + 'px';
      el.style.height = Math.max(220, h + ev.clientY - startY) + 'px';
    };
    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', () => grip.removeEventListener('pointermove', move), { once: true });
  });
}

function focusWindow(id) {
  const record = open.get(id);
  if (!record) return;
  open.forEach(r => r.el.classList.toggle('is-focused', r === record));
  record.el.style.zIndex = ++zTop;
  $('#topbar-app').textContent = record.app.title;
  if (!record.el.contains(document.activeElement)) {
    const target = record.el.querySelector('[data-autofocus]') || $('.win-body', record.el);
    target.setAttribute('tabindex', target.getAttribute('tabindex') ?? '-1');
    target.focus({ preventScroll: true });
  }
  syncDock();
}

function topmostVisible() {
  let best = null;
  open.forEach((r, key) => { if (!r.el.hidden && (!best || +r.el.style.zIndex > +best[1].el.style.zIndex)) best = [key, r]; });
  return best;
}

function afterHide() {
  const next = topmostVisible();
  if (next) focusWindow(next[0]);
  else { $('#topbar-app').textContent = 'Área de trabalho'; syncDock(); }
}

function closeWindow(id) {
  const record = open.get(id);
  if (!record) return;
  record.onClose?.();
  open.delete(id);
  const finish = () => { record.el.remove(); afterHide(); };
  if (reducedMotion.matches) return finish();
  record.el.classList.add('is-closing');
  setTimeout(finish, 160);
}

function minimizeWindow(id) {
  const record = open.get(id);
  if (!record) return;
  record.el.hidden = true;
  record.el.classList.remove('is-focused');
  afterHide();
}

/* --------------------------------------------------------- Desktop + dock */
function iconMarkup(id) { return `<span class="app-icon" aria-hidden="true">${ICONS[APPS[id].icon]}</span>`; }

function buildDesktop() {
  const list = $('#desktop-icons');
  list.innerHTML = DESKTOP_ORDER.map(id => `
    <li><button type="button" class="desk-icon" data-app="${id}">${iconMarkup(id)}<span class="desk-label">${esc(APPS[id].short)}</span></button></li>`).join('');
  list.addEventListener('click', e => {
    const btn = e.target.closest('.desk-icon');
    if (!btn) return;
    // Keyboard (detail 0) and touch open on a single activation; mouse selects first.
    if (e.detail === 0 || coarse.matches) return launch(btn.dataset.app);
    list.querySelectorAll('.desk-icon').forEach(b => b.classList.toggle('is-selected', b === btn));
  });
  list.addEventListener('dblclick', e => {
    const btn = e.target.closest('.desk-icon');
    if (btn && !coarse.matches) launch(btn.dataset.app);
  });
  $('#desktop').addEventListener('pointerdown', e => {
    if (!e.target.closest('.desk-icon')) list.querySelectorAll('.is-selected').forEach(b => b.classList.remove('is-selected'));
  });

  const dock = $('#dock');
  dock.innerHTML = DOCK_ORDER.map(id => `
    <button type="button" class="dock-item" data-app="${id}" aria-label="${esc(APPS[id].short)}">${iconMarkup(id)}<span class="dock-tip" aria-hidden="true">${esc(APPS[id].short)}</span><span class="dock-dot" aria-hidden="true"></span></button>`).join('');
  dock.addEventListener('click', e => {
    const btn = e.target.closest('.dock-item');
    if (!btn) return;
    const id = btn.dataset.app;
    const record = open.get(id);
    if (record && !record.el.hidden && record.el.classList.contains('is-focused')) minimizeWindow(id);
    else launch(id);
  });

  $('#start-items').innerHTML = [...DOCK_ORDER.map(id => `<button type="button" role="menuitem" data-app="${id}">${iconMarkup(id)}<span>${esc(APPS[id].title)}</span></button>`),
    `<a role="menuitem" href="classic.html">${iconMarkup('browser')}<span>Abrir versão clássica</span></a>`,
    `<button type="button" role="menuitem" data-restart>${iconMarkup('terminal')}<span>Reiniciar</span></button>`].join('');
}

function syncDock() {
  document.querySelectorAll('.dock-item').forEach(btn => {
    const record = open.get(btn.dataset.app);
    btn.classList.toggle('is-running', !!record);
    btn.classList.toggle('is-active', !!record && !record.el.hidden && record.el.classList.contains('is-focused'));
  });
}

const startBtn = $('#start-btn');
const startMenu = $('#start-menu');
function closeStart() { startMenu.hidden = true; startBtn.setAttribute('aria-expanded', 'false'); }
startBtn.addEventListener('click', () => {
  const show = startMenu.hidden;
  startMenu.hidden = !show;
  startBtn.setAttribute('aria-expanded', String(show));
  if (show) startMenu.querySelector('[role="menuitem"]').focus();
});
startMenu.addEventListener('click', e => {
  const item = e.target.closest('[data-app]');
  if (item) launch(item.dataset.app);
  if (e.target.closest('[data-restart]')) { closeStart(); boot(true); }
});
document.addEventListener('pointerdown', e => { if (!e.target.closest('#start-menu, #start-btn')) closeStart(); });
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!startMenu.hidden) { closeStart(); startBtn.focus(); }
});

function tickClock() {
  const now = new Date();
  const clock = $('#clock');
  clock.dateTime = now.toISOString();
  clock.textContent = now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace(/\./g, '') + '  ' +
    now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/* -------------------------------------------------------------- Highlight */
function highlight(source, lang) {
  const span = (cls, text) => `<span class="tk-${cls}">${esc(text)}</span>`;
  const rules = {
    csharp: /(\/\/.*$)|("(?:[^"\\]|\\.)*")|\b(namespace|public|static|readonly|class|string|new|var|return|async|await|void)\b|\b([A-Z][A-Za-z0-9]*)\b|\b(\d+)\b/gm,
    typescript: /(\/\/.*$)|("(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(export|const|async|function|return|as|await|let|void|string)\b|\b([A-Z][A-Za-z0-9]*)\b|\b(\d+)\b/gm,
    json: /("(?:[^"\\]|\\.)*")(?=\s*:)|("(?:[^"\\]|\\.)*")|\b(true|false|null)\b|(-?\d+)/g
  };
  const lines = source.replace(/\n$/, '').split('\n');
  return lines.map(line => {
    if (lang === 'markdown') {
      if (/^#{1,6} /.test(line)) return span('head', line);
      if (/^> /.test(line)) return span('comment', line);
      let html = esc(line)
        .replace(/^(- )/, '<span class="tk-punct">$1</span>')
        .replace(/(!?\[[^\]]*\])(\([^)]*\))/g, '<span class="tk-string">$1</span><span class="tk-link">$2</span>')
        .replace(/(\*\*[^*]+\*\*)/g, '<span class="tk-bold">$1</span>')
        .replace(/(`[^`]+`)/g, '<span class="tk-type">$1</span>');
      return html;
    }
    const re = rules[lang];
    let out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      if (lang === 'json') out += m[1] ? span('key', m[1]) : m[2] ? span('string', m[2]) : m[3] ? span('keyword', m[3]) : span('number', m[4]);
      else out += m[1] ? span('comment', m[1]) : m[2] ? span('string', m[2]) : m[3] ? span('keyword', m[3]) : m[4] ? span('type', m[4]) : span('number', m[5]);
      last = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex++;
    }
    return out + esc(line.slice(last));
  });
}

/* ---------------------------------------------------------------- Previews */
const linkOut = (href, label, cls = 'pv-btn') => `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
const chips = items => `<ul class="pv-chips">${items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;

function previewHtml(kind) {
  if (kind === 'readme') {
    return `
      <div class="pv pv-readme">
        <div class="pv-hero">
          <div class="pv-photo"><img src="assets/daniel-avatar.webp" alt="Retrato ilustrado de Daniel Vieira, com headset no pescoço" width="900" height="900"></div>
          <div class="pv-intro">
            <p class="pv-hello"><span class="pulse" aria-hidden="true"></span>Olá, eu sou o Daniel.</p>
            <h1>Do backend<br>à experiência.</h1>
            <p class="pv-lede">Desenvolvedor full stack .NET em Hortolândia, SP. Construo aplicações com <strong>C#, ASP.NET Core e Blazor</strong>: APIs, telas que as pessoas usam todos os dias e as integrações que mantêm tudo conversando.</p>
            <div class="pv-actions">
              <button type="button" class="pv-btn solid" data-open="projetos/health-check-monitor.md">Ver projetos</button>
              <button type="button" class="pv-btn" data-launch="pdf">Abrir currículo</button>
              <button type="button" class="pv-btn" data-open="contato.ts">Contato</button>
            </div>
          </div>
        </div>
        <p class="pv-now"><span>Agora</span> Migrando um ERP legado em VB para ASP.NET Core e Blazor, com módulo fiscal de NF-e integrado à SEFAZ.</p>
        <h2>Projetos</h2>
        <div class="pv-cards">
          ${PROJECTS.map(p => `<button type="button" class="pv-card c-${p.color}" data-open="projetos/${p.id}.md"><span class="pv-kicker">${esc(p.kicker)}</span><strong>${esc(p.name)}</strong><span>${esc(p.lede)}</span></button>`).join('')}
        </div>
        <h2>Continue explorando</h2>
        <div class="pv-links">
          <button type="button" data-open="experiencia.json">experiencia.json <span>onde coloquei código em produção</span></button>
          <button type="button" data-open="Habilidades.cs">Habilidades.cs <span>as ferramentas do dia a dia</span></button>
          <button type="button" data-launch="terminal">Terminal <span>digite <code>ajuda</code> e explore por comandos</span></button>
        </div>
      </div>`;
  }
  if (kind.startsWith('project:')) {
    const p = PROJECTS.find(x => x.id === kind.slice(8));
    return `
      <div class="pv pv-project c-${p.color}">
        <p class="pv-kicker">${esc(p.kicker)}</p>
        <h1>${esc(p.name)}</h1>
        <p class="pv-lede">${esc(p.lede)}</p>
        <ul class="pv-points">${p.points.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        ${chips(p.tags)}
        <div class="pv-actions">${linkOut(p.url, 'Ver código no GitHub ↗', 'pv-btn solid')}<button type="button" class="pv-btn" data-open="README.md">Voltar ao README</button></div>
      </div>`;
  }
  if (kind === 'experience') {
    return `
      <div class="pv pv-exp">
        <h1>Experiência</h1>
        <p class="pv-lede">Onde coloquei código em produção.</p>
        <ol class="pv-timeline">
          ${JOBS.map(j => `<li class="${j.current ? 'is-current' : ''}"><p class="pv-when">${j.current ? '<span class="pulse" aria-hidden="true"></span>' : ''}${esc(j.period)}</p><h2>${esc(j.company)}</h2><p class="pv-role">${esc(j.role)}</p><ul>${j.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></li>`).join('')}
          <li class="is-edu"><p class="pv-when">Formação</p><p>${esc(EDUCATION)}</p></li>
        </ol>
      </div>`;
  }
  if (kind === 'skills') {
    return `
      <div class="pv pv-skills">
        <h1>Habilidades</h1>
        <p class="pv-lede">As ferramentas que uso no dia a dia, agrupadas pelo que resolvem.</p>
        <div class="pv-skill-grid">${SKILLS.map(s => `<div class="pv-skill"><h2>${esc(s.group)}</h2><p>${esc(s.note)}.</p>${chips(s.items)}</div>`).join('')}</div>
      </div>`;
  }
  if (kind === 'contact') return `<div class="pv pv-contact">${contactCard()}</div>`;
  return '';
}

function contactCard() {
  return `
    <h1>Tem uma vaga ou um projeto? Vamos conversar.</h1>
    <a class="pv-mail" href="mailto:${LINKS.email}">${esc(LINKS.email)}</a>
    <div class="pv-actions">
      <button type="button" class="pv-btn solid" data-copy-email>Copiar e-mail</button>
      ${linkOut(LINKS.linkedin, 'LinkedIn ↗')}
      ${linkOut(LINKS.github, 'GitHub ↗')}
      <a class="pv-btn" href="${LINKS.resume}" download>Baixar currículo</a>
    </div>`;
}

/* --------------------------------------------------------------- VS Code */
function renderCode(body, record, options) {
  body.classList.add('code');
  const state = { tabs: [], active: null, mode: {}, opened: false };
  body.innerHTML = `
    <div class="code-activity" aria-hidden="true">
      <span class="act is-on" title="Explorador"><svg viewBox="0 0 24 24"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z M14 3v5h5"/></svg></span>
      <span class="act" title="Pesquisar"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/></svg></span>
      <span class="act" title="Git"><svg viewBox="0 0 24 24"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11c0 4-6 3-11 6"/></svg></span>
      <span class="act" title="Extensões"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="14" y="3" width="7" height="7" transform="rotate(12 17 7)"/></svg></span>
    </div>
    <aside class="code-side" aria-label="Explorador de arquivos">
      <p class="side-title">Explorador</p>
      <div class="side-body"></div>
    </aside>
    <div class="code-main">
      <div class="code-tabs" role="tablist" aria-label="Arquivos abertos"></div>
      <div class="code-crumbs"></div>
      <div class="code-view"></div>
    </div>
    <footer class="code-status">
      <span class="st-branch"><svg viewBox="0 0 24 24"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11c0 4-6 3-11 6"/></svg>main</span>
      <span class="st-msg"></span>
      <span class="st-spacer"></span>
      <span class="st-lang"></span>
      <span>UTF-8</span>
    </footer>`;

  const side = $('.side-body', body);
  const tabsEl = $('.code-tabs', body);
  const crumbs = $('.code-crumbs', body);
  const view = $('.code-view', body);
  const statusMsg = $('.st-msg', body);
  const statusLang = $('.st-lang', body);
  const LANG_LABEL = { markdown: 'Markdown', json: 'JSON', csharp: 'C#', typescript: 'TypeScript' };

  function badge(path) {
    const [txt, color] = FILE_BADGES[extOf(path)] || ['·', '#aea2c6'];
    return `<span class="f-badge" style="color:${color}">${txt}</span>`;
  }

  function welcome() {
    side.innerHTML = `
      <div class="side-empty">
        <p>Nenhuma pasta aberta.</p>
        <button type="button" class="vs-btn" data-open-project data-autofocus>Abrir pasta</button>
      </div>`;
    tabsEl.innerHTML = '';
    crumbs.innerHTML = '';
    statusLang.textContent = '';
    view.innerHTML = `
      <div class="welcome">
        <div class="welcome-logo">${ICONS.code}</div>
        <h1>Visual Studio Code</h1>
        <p class="welcome-sub">Edição evoluída</p>
        <div class="welcome-cols">
          <div>
            <h2>Iniciar</h2>
            <button type="button" class="welcome-link" data-open-project>Abrir pasta…</button>
            <button type="button" class="welcome-link" data-launch="terminal">Novo terminal</button>
          </div>
          <div>
            <h2>Recentes</h2>
            <button type="button" class="welcome-recent" data-open-project><strong>portfolio</strong><span>~/projetos/daniel-vieira</span></button>
          </div>
        </div>
        <p class="welcome-tip">Dica: abra a pasta <strong>portfolio</strong> para conhecer o Daniel.</p>
      </div>`;
  }

  async function openProject() {
    if (state.opened) return;
    state.opened = true;
    statusMsg.textContent = 'Abrindo ~/projetos/daniel-vieira/portfolio…';
    view.innerHTML = '<div class="code-loading"><span></span></div>';
    await wait(650);
    record.el.querySelector('.win-title').textContent = 'portfolio · Visual Studio Code';
    renderTree();
    statusMsg.textContent = '';
    openFile('README.md');
  }

  function renderTree() {
    const fileRow = (path, depth) => `<button type="button" class="tree-row" style="--d:${depth}" data-file="${path}">${badge(path)}<span>${esc(baseName(path))}</span></button>`;
    side.innerHTML = `
      <details class="tree-root" open>
        <summary>PORTFOLIO</summary>
        ${TREE.map(node => typeof node === 'string' ? fileRow(node, 1)
          : `<details class="tree-folder" open style="--d:1"><summary><span class="chev" aria-hidden="true"></span>${esc(node.folder)}</summary>${node.children.map(c => fileRow(c, 2)).join('')}</details>`).join('')}
      </details>`;
    syncTree();
  }

  function syncTree() {
    side.querySelectorAll('.tree-row').forEach(r => r.classList.toggle('is-active', r.dataset.file === state.active));
  }

  function openFile(path) {
    if (path === 'curriculo.pdf' || path === LINKS.resume) return launch('pdf');
    if (!FILES[path]) return;
    if (!state.opened) { state.opened = true; renderTree(); }
    if (!state.tabs.includes(path)) state.tabs.push(path);
    state.active = path;
    if (!(path in state.mode)) state.mode[path] = 'preview';
    draw();
  }

  function closeTab(path) {
    const i = state.tabs.indexOf(path);
    if (i < 0) return;
    state.tabs.splice(i, 1);
    if (state.active === path) state.active = state.tabs[Math.max(0, i - 1)] || null;
    draw();
  }

  function draw() {
    syncTree();
    tabsEl.innerHTML = state.tabs.map(path => `
      <div class="code-tab ${path === state.active ? 'is-active' : ''}" role="presentation">
        <button type="button" role="tab" aria-selected="${path === state.active}" data-file="${path}">${badge(path)}${esc(baseName(path))}</button>
        <button type="button" class="tab-x" data-close="${path}" aria-label="Fechar ${esc(baseName(path))}">×</button>
      </div>`).join('');
    if (!state.active) {
      crumbs.innerHTML = '';
      statusLang.textContent = '';
      view.innerHTML = '<div class="code-empty"><p>Selecione um arquivo no explorador.</p></div>';
      return;
    }
    const file = FILES[state.active];
    const mode = state.mode[state.active];
    crumbs.innerHTML = `
      <span class="crumb-path">portfolio <i>›</i> ${state.active.split('/').map(esc).join(' <i>›</i> ')}</span>
      <span class="crumb-toggle" role="group" aria-label="Modo de exibição">
        <button type="button" data-mode="preview" aria-pressed="${mode === 'preview'}">Visualizar</button>
        <button type="button" data-mode="source" aria-pressed="${mode === 'source'}">Código</button>
      </span>`;
    statusLang.textContent = LANG_LABEL[file.lang];
    if (mode === 'source') {
      const lines = highlight(file.source, file.lang);
      view.innerHTML = `<pre class="source" tabindex="0" aria-label="Código de ${esc(baseName(state.active))}"><code>${lines.map((l, i) => `<span class="ln"><span class="ln-n" aria-hidden="true">${i + 1}</span><span class="ln-c">${l || ' '}</span></span>`).join('')}</code></pre>`;
    } else {
      view.innerHTML = previewHtml(file.preview);
    }
    view.scrollTop = 0;
  }

  body.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-open-project]')) return openProject();
    const close = t.closest('[data-close]');
    if (close) return closeTab(close.dataset.close);
    const modeBtn = t.closest('[data-mode]');
    if (modeBtn) { state.mode[state.active] = modeBtn.dataset.mode; return draw(); }
    const fileBtn = t.closest('[data-file], [data-open]');
    if (fileBtn) return openFile(fileBtn.dataset.file || fileBtn.dataset.open);
  });

  record.onReopen = opts => {
    if (opts.project) openProject();
    if (opts.file) openFile(opts.file);
  };

  welcome();
  if (options.project || options.file) {
    openProject().then(() => { if (options.file) openFile(options.file); });
  }
}

/* --------------------------------------------------------------- Projetos */
function renderFiles(body) {
  body.classList.add('files');
  body.innerHTML = `
    <aside class="files-side">
      <p>Favoritos</p>
      <button type="button" class="is-on">${ICONS.doc}Projetos</button>
      <button type="button" data-launch="code" data-project>${ICONS.doc}portfolio</button>
      <a href="${LINKS.github}" target="_blank" rel="noopener noreferrer">${ICONS.doc}GitHub ↗</a>
    </aside>
    <div class="files-main">
      <p class="files-path">~/projetos</p>
      <div class="files-grid">
        ${PROJECTS.map(p => `
          <button type="button" class="file-tile c-${p.color}" data-project-file="projetos/${p.id}.md" data-autofocus>
            <span class="app-icon" aria-hidden="true">${ICONS.folder}</span>
            <strong>${esc(p.name)}</strong>
            <span>${esc(p.tags.slice(0, 3).join(' · '))}</span>
          </button>`).join('')}
        <a class="file-tile" href="${LINKS.github}" target="_blank" rel="noopener noreferrer">
          <span class="app-icon" aria-hidden="true">${ICONS.browser}</span>
          <strong>Todos os repositórios</strong>
          <span>github.com ↗</span>
        </a>
      </div>
      <p class="files-hint">Abra uma pasta para ver o projeto no editor.</p>
    </div>`;
  body.addEventListener('click', e => {
    const tile = e.target.closest('[data-project-file]');
    if (tile) launch('code', { file: tile.dataset.projectFile });
  });
}

/* --------------------------------------------------------------- Terminal */
function renderTerminal(body, record) {
  body.classList.add('term');
  body.innerHTML = `<div class="term-out" aria-live="polite"></div>
    <form class="term-line"><label for="term-input"><span class="term-user">daniel@danielos</span>:<span class="term-dir">~</span>$</label>
    <input id="term-input" autocomplete="off" autocapitalize="off" spellcheck="false" data-autofocus aria-label="Comando do terminal"></form>`;
  const out = $('.term-out', body);
  const input = $('input', body);
  const history = [];
  let hIndex = 0;
  const print = (html, cls = '') => { out.insertAdjacentHTML('beforeend', `<div class="t-row ${cls}">${html}</div>`); body.scrollTop = body.scrollHeight; };
  const fileNames = [...Object.keys(FILES).map(baseName), 'curriculo.pdf'];
  const pathOf = name => Object.keys(FILES).find(p => baseName(p).toLowerCase() === name.toLowerCase());

  const COMMANDS = {
    ajuda: () => print(`Comandos disponíveis:
<span class="t-k">sobre</span>        quem é o Daniel
<span class="t-k">projetos</span>     o que ele construiu
<span class="t-k">experiencia</span>  onde trabalhou
<span class="t-k">habilidades</span>  stack do dia a dia
<span class="t-k">contato</span>      como falar com ele
<span class="t-k">curriculo</span>    abre o currículo em PDF
<span class="t-k">code</span>         abre o portfólio no editor
<span class="t-k">ls</span>, <span class="t-k">cat</span> &lt;arquivo&gt;, <span class="t-k">abrir</span> &lt;arquivo&gt;, <span class="t-k">neofetch</span>, <span class="t-k">limpar</span>, <span class="t-k">sair</span>`),
    sobre: () => print('Daniel Vieira, desenvolvedor full stack .NET em Hortolândia, SP.\nConstrói aplicações com C#, ASP.NET Core e Blazor: APIs, telas do dia a dia e integrações.\nAgora: migrando um ERP legado em VB para ASP.NET Core e Blazor, com NF-e integrada à SEFAZ.'),
    whoami: () => print('visitante (mas o dono da casa é o <span class="t-k">daniel</span>)'),
    projetos: () => print(PROJECTS.map(p => `<span class="t-k">${esc(p.name)}</span>  ${esc(p.lede)}\n  <a href="${p.url}" target="_blank" rel="noopener noreferrer">${esc(p.url)}</a>`).join('\n\n')),
    experiencia: () => print(JOBS.map(j => `<span class="t-k">${esc(j.company)}</span> · ${esc(j.role)} (${esc(j.period)})\n${j.items.map(i => '  • ' + esc(i)).join('\n')}`).join('\n\n') + '\n\n' + esc(EDUCATION)),
    habilidades: () => print(SKILLS.map(s => `<span class="t-k">${esc(s.group.padEnd(11))}</span>${esc(s.items.join(', '))}`).join('\n')),
    contato: () => print(`e-mail    <a href="mailto:${LINKS.email}">${LINKS.email}</a>\nlinkedin  <a href="${LINKS.linkedin}" target="_blank" rel="noopener noreferrer">${LINKS.linkedin}</a>\ngithub    <a href="${LINKS.github}" target="_blank" rel="noopener noreferrer">${LINKS.github}</a>`),
    curriculo: () => { print('Abrindo Currículo.pdf…'); launch('pdf'); },
    code: () => { print('Abrindo portfolio no Visual Studio Code…'); launch('code', { project: true }); },
    ls: () => print('<span class="t-dir">projetos/</span>  ' + fileNames.filter(n => !/^(health|cashflow|nest)/.test(n)).join('  ')),
    cat: arg => {
      if (!arg) return print('uso: cat &lt;arquivo&gt;', 't-err');
      if (/curriculo\.pdf/i.test(arg)) return print('Arquivo binário. Use <span class="t-k">curriculo</span> para abrir.');
      const path = pathOf(arg.replace(/^projetos\//, ''));
      if (!path) return print(`cat: ${esc(arg)}: arquivo não encontrado`, 't-err');
      print(esc(FILES[path].source));
    },
    abrir: arg => {
      if (/curriculo\.pdf/i.test(arg || '')) return COMMANDS.curriculo();
      const path = arg && pathOf(arg.replace(/^projetos\//, ''));
      if (!path) return print(`abrir: ${esc(arg || '')}: arquivo não encontrado`, 't-err');
      print(`Abrindo ${esc(path)} no editor…`);
      launch('code', { file: path });
    },
    neofetch: () => print(`<div class="t-fetch"><img src="assets/daniel-avatar.webp" alt="" width="96" height="96"><div><span class="t-k">daniel</span>@<span class="t-k">danielos</span>
-----------------
<b>SO</b>        DanielOS 1.0
<b>Cargo</b>     Full stack .NET
<b>Empresa</b>   Automahelp
<b>Stack</b>     C#, ASP.NET Core, Blazor
<b>Local</b>     Hortolândia, SP
<b>Status</b>    disponível para conversar</div></div>`),
    limpar: () => { out.innerHTML = ''; },
    data: () => print(new Date().toLocaleString('pt-BR')),
    sudo: () => print('Permissão negada. Mas uma entrevista talvez libere o acesso 😉', 't-err'),
    sair: () => closeWindow('terminal')
  };
  Object.assign(COMMANDS, { help: COMMANDS.ajuda, clear: COMMANDS.limpar, exit: COMMANDS.sair, open: COMMANDS.abrir, resume: COMMANDS.curriculo, about: COMMANDS.sobre, contact: COMMANDS.contato });

  print('DanielOS Terminal. Digite <span class="t-k">ajuda</span> para ver os comandos.', 't-dim');

  $('form', body).addEventListener('submit', e => {
    e.preventDefault();
    const raw = input.value.trim();
    input.value = '';
    print(`<span class="term-user">daniel@danielos</span>:<span class="term-dir">~</span>$ ${esc(raw)}`, 't-cmd');
    if (!raw) return;
    history.push(raw);
    hIndex = history.length;
    const [cmd, ...rest] = raw.split(/\s+/);
    const fn = COMMANDS[cmd.toLowerCase()];
    if (fn) fn(rest.join(' '));
    else print(`${esc(cmd)}: comando não encontrado. Tente <span class="t-k">ajuda</span>.`, 't-err');
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && hIndex > 0) { input.value = history[--hIndex]; e.preventDefault(); }
    if (e.key === 'ArrowDown') { hIndex = Math.min(history.length, hIndex + 1); input.value = history[hIndex] || ''; e.preventDefault(); }
    if (e.key === 'Tab') {
      e.preventDefault();
      const parts = input.value.split(' ');
      const last = parts.pop();
      const pool = parts.length ? fileNames : Object.keys(COMMANDS);
      const hit = pool.find(x => x.toLowerCase().startsWith(last.toLowerCase()));
      if (hit) input.value = [...parts, hit].join(' ');
    }
  });
  body.addEventListener('click', () => { if (!getSelection().toString()) input.focus(); });
}

/* -------------------------------------------------------- Small apps */
function renderPdf(body) {
  body.classList.add('pdf');
  body.innerHTML = `
    <div class="pdf-bar">
      <span>Daniel_Vieira_Desenvolvedor.pdf</span>
      <span class="st-spacer"></span>
      <a class="pv-btn" href="${LINKS.resume}" target="_blank" rel="noopener noreferrer" data-autofocus>Abrir em nova aba ↗</a>
      <a class="pv-btn solid" href="${LINKS.resume}" download>Baixar</a>
    </div>
    <object class="pdf-frame" data="${LINKS.resume}#view=FitH" type="application/pdf" aria-label="Currículo de Daniel Vieira">
      <div class="pdf-fallback"><p>Seu navegador não mostra PDFs aqui dentro.</p><a class="pv-btn solid" href="${LINKS.resume}" target="_blank" rel="noopener noreferrer">Abrir o currículo</a></div>
    </object>`;
}

function renderContact(body) {
  body.classList.add('contact-app');
  body.innerHTML = `
    <div class="contact-card">
      <img src="assets/daniel-avatar.webp" alt="Retrato ilustrado de Daniel Vieira" width="120" height="120">
      <p class="contact-name">Daniel Vieira</p>
      <p class="contact-role">Full stack .NET · Hortolândia, SP</p>
      <div class="pv pv-contact">${contactCard()}</div>
    </div>`;
}

function renderBrowser(body) {
  body.classList.add('browser');
  body.innerHTML = `
    <div class="browser-bar">
      <span class="browser-url"><span aria-hidden="true">🔒</span> danielvieirafernandes.github.io/portfolio/classic.html</span>
      <a class="pv-btn" href="classic.html" target="_blank" rel="noopener noreferrer" data-autofocus>Abrir em nova aba ↗</a>
    </div>
    <iframe class="browser-frame" src="classic.html" title="Versão clássica do portfólio" loading="lazy"></iframe>`;
}

function renderTrash(body) {
  body.classList.add('trash');
  body.innerHTML = `
    <div class="trash-item">
      <span class="app-icon" aria-hidden="true">${ICONS.doc}</span>
      <div><strong>ERP_Legado.vb</strong><span>Migrado para ASP.NET Core e Blazor. Pode esvaziar sem medo.</span></div>
    </div>
    <div class="trash-item">
      <span class="app-icon" aria-hidden="true">${ICONS.doc}</span>
      <div><strong>bug_em_producao_final_v3.cs</strong><span>Coberto por testes agora.</span></div>
    </div>`;
}

/* ----------------------------------------------------- Global delegation */
document.addEventListener('click', e => {
  const launcher = e.target.closest('[data-launch]');
  if (launcher) launch(launcher.dataset.launch, launcher.hasAttribute('data-project') ? { project: true } : {});
  if (e.target.closest('[data-copy-email]')) copyEmail();
});

let toastTimer = 0;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}
async function copyEmail() {
  try { await navigator.clipboard.writeText(LINKS.email); toast('E-mail copiado'); }
  catch { toast(LINKS.email); }
}

/* -------------------------------------------------------------------- Boot */
async function boot(force = false) {
  const screen = $('#boot');
  let seen = false;
  try { seen = sessionStorage.getItem('danielos-booted') === '1'; } catch {}
  if ((seen && !force) || reducedMotion.matches) { screen.hidden = true; return; }
  screen.classList.remove('is-done');
  screen.hidden = false;
  let skip;
  const skipped = new Promise(r => { skip = r; });
  addEventListener('keydown', skip, { once: true });
  screen.addEventListener('pointerdown', skip, { once: true });
  await Promise.race([wait(1600), skipped]);
  removeEventListener('keydown', skip);
  try { sessionStorage.setItem('danielos-booted', '1'); } catch {}
  screen.classList.add('is-done');
  await wait(400);
  screen.hidden = true;
}

(async () => {
  const verb = $('#hello-verb');
  if (verb && coarse.matches) verb.textContent = 'Toque em';
  buildDesktop();
  tickClock();
  setInterval(tickClock, 15000);
  await boot();
  const fromHash = location.hash.slice(1);
  if (APPS[fromHash]) launch(fromHash);
  else if (!compact.matches) launch('code');
})();

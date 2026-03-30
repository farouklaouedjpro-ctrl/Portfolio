// ═══════════════════════════════════════════════════════════
// SIMPLIFIED VERSION (~80 lines)
// ═══════════════════════════════════════════════════════════

// 1. UTILS
const $ = document.getElementById.bind(document);
const html = str => document.createRange().createContextualFragment(str);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// 2. RENDER (ONE FUNCTION - generates ALL HTML from data.json)
function render(data) {
  const { basics, skills, projects, certifications, about, social } = data;

  // Basics (logo, hero, meta, footer)
  const initials = basics.name.split(' ').map(n => n[0]).join('');
  $('brandName').textContent = initials;
  $('heroKicker').textContent = basics.kicker;
  $('heroRole').textContent = basics.role;
  $('heroLead').textContent = basics.lead;
  $('metaLocation').textContent = basics.location;
  $('metaSpecialty').textContent = basics.specialty;
  $('metaAvailability').textContent = basics.availability;
  $('footerName').textContent = basics.name;
  $('footerYear').textContent = new Date().getFullYear();
  document.title = `${basics.name} — Portfolio`;

  // Name animation
  const nameParts = basics.name.split(' ');
  $('heroNameContainer').innerHTML = nameParts
    .map((part, i) => {
      const isLast = i === nameParts.length - 1;
      const lineClass = isLast ? 'line line-stroke' : 'line';
      return `<span class="${lineClass}"><span class="line-inner" style="--delay:${1.5 + i * 0.15}s">${esc(part)}</span></span>`;
    }).join('');

  // Email links
  ['ctaEmail', 'heroContactBtn', 'contactEmailBtn'].forEach(id => {
    const el = $(id);
    if (el) el.href = `mailto:${basics.email}`;
  });
  $('contactEmailText').textContent = basics.email;

  // Skills (marquee)
  document.querySelector('.marquee').innerHTML = `
    <div class="marquee-wrapper">
      <div class="marquee-track">
        ${skills.map(s => `<span class="marquee-item">${esc(s)}</span>`).join('')}
        ${skills.map(s => `<span class="marquee-item">${esc(s)}</span>`).join('')}
      </div>
    </div>`;

  // About paragraphs
  $('aboutContent').innerHTML = about.paragraphs
    .map(p => `<p>${esc(p).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`).join('');

  // Social links
  $('socialLinks').innerHTML = social.map(s => `
    <a class="about-link" href="${esc(s.href)}" target="_blank" rel="noreferrer">
      <span>${esc(s.label)}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
    </a>`).join('');

  // Projects
  $('projectsList').innerHTML = projects.map((p, i) => `
    <article class="project-item reveal" style="transition-delay:${i * 0.08}s">
      <div class="project-top">
        <span class="project-index">${String(i + 1).padStart(2, '0')}</span>
        ${p.status ? `<span class="project-status">${esc(p.status)}</span>` : ''}
      </div>
      <h3 class="project-title">${esc(p.title)}</h3>
      <p class="project-desc">${esc(p.description)}</p>
      <div class="project-footer">
        <div class="project-tags">${p.stack.map(t => `<span class="project-tag">${esc(t)}</span>`).join('')}</div>
        <div class="project-links">
          ${p.links.map(l => `<a class="project-link" href="${esc(l.href)}" target="_blank" rel="noreferrer"><span>${esc(l.label)}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg></a>`).join('')}
        </div>
      </div>
    </article>`).join('');

  // Certifications
  $('certificationsList').innerHTML = certifications.map(c => `
    <article class="certification-item reveal">
      <img class="certification-image" src="${esc(c.image)}" alt="${esc(c.title)}" loading="lazy" />
      <div class="certification-header">
        <span class="certification-issuer">${esc(c.issuer)}</span>
        <span class="certification-date">${esc(c.date)}</span>
      </div>
      <h3 class="certification-title">${esc(c.title)}</h3>
      <p class="certification-desc">${esc(c.description)}</p>
    </article>`).join('');

  // Loader
  $('loaderName').textContent = initials;
}

// 3. ANIMATIONS (keep essential ones)
function initAnimations() {
  // Reveals
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8%', threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Cursor
  const cursor = document.querySelector('.cursor'), dot = document.querySelector('.cursor-dot');
  if (!cursor || !dot || window.matchMedia('(pointer: coarse)').matches) return;
  document.body.classList.add('cursor-ready');
  let mx = -100, my = -100, cx = -100, cy = -100, dx = -100, dy = -100;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function tick() {
    cx += (mx - cx) * 0.1; cy += (my - cy) * 0.1;
    dx += (mx - dx) * 0.22; dy += (my - dy) * 0.22;
    cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
    dot.style.left = dx + 'px'; dot.style.top = dy + 'px';
    requestAnimationFrame(tick);
  }
  tick();
  document.querySelectorAll('a, button, .project-item, .certification-item').forEach(el => {
    el.addEventListener('mouseenter', e => {
      cursor.classList.add('is-hover');
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });

  // Magnetic buttons
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.18}px)`;
    });
    el.addEventListener('mouseleave', () => el.style.transform = '');
  });

  // Mobile nav
  const toggle = $('navToggle'), menu = $('navMenu');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !open);
    menu.classList.toggle('is-open', !open);
  });

  // Header scroll
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    $('header').classList.toggle('is-hidden', y > 120 && y > lastY + 5);
    lastY = y;
  });
}

// 4. INIT
(async () => {
  const data = await fetch('/data.json').then(r => r.json());
  render(data);

  document.body.style.overflow = 'hidden';

  const dismissLoader = () => {
    setTimeout(() => $('loader').classList.add('is-done'), 1200);
    setTimeout(() => { $('loader').style.display = 'none'; document.body.style.overflow = ''; }, 2200);
    initAnimations();
  };

  if (document.readyState === 'complete') {
    dismissLoader();
  } else {
    window.addEventListener('load', dismissLoader);
  }
})();

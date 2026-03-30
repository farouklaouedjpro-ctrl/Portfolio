// ═══════════════════════════════════════════════════════════
// 1. DATA
// ═══════════════════════════════════════════════════════════
let DATA = null;

// ═══════════════════════════════════════════════════════════
// 2. UTILS
// ═══════════════════════════════════════════════════════════
const $ = id => document.getElementById(id);
const html = str => document.createRange().createContextualFragment(str);

const setText = (id, value) => {
  const el = $(id);
  if (el) el.textContent = value == null ? "" : String(value);
};

const setHref = (id, value) => {
  const el = $(id);
  if (el) el.setAttribute("href", value || "#");
};

const safeUrl = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url, window.location.href);
    const allowed = ["http:", "https:", "mailto:", "tel:", "file:"];
    if (allowed.includes(u.protocol)) return u.href;
    return null;
  } catch {
    return null;
  }
};

const escapeHtml = (str) => String(str)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

// ═══════════════════════════════════════════════════════════
// 3. RENDERERS
// ═══════════════════════════════════════════════════════════
function renderBasics() {
  const b = DATA.basics;
  if (!b) return;

  const nameParts = (b.name || "").split(" ");
  const initials = nameParts.map(n => n.charAt(0)).join("");
  
  setText("brandName", initials);
  setText("heroKicker", b.kicker || "");
  setText("heroRole", b.role || "");
  setText("heroLead", b.lead || "");
  setText("metaLocation", b.location || "");
  setText("metaSpecialty", b.specialty || "");
  setText("metaAvailability", b.availability || "");
  setText("footerName", b.name || "");
  setText("footerYear", new Date().getFullYear());

  const email = b.email || "";
  const mailto = email ? "mailto:" + email : "#";
  setHref("ctaEmail", mailto);
  setHref("heroContactBtn", mailto);
  setHref("contactEmailBtn", mailto);
  setText("contactEmailText", email);

  if (b.name) document.title = b.name + " — Portfolio";

  const nameContainer = $("heroNameContainer");
  if (nameContainer && b.name) {
    nameContainer.innerHTML = "";
    nameParts.forEach((part, i) => {
      const line = document.createElement("span");
      line.className = "line";
      if (i === nameParts.length - 1 && nameParts.length > 1) {
        line.classList.add("line-stroke");
      }
      const inner = document.createElement("span");
      inner.className = "line-inner";
      inner.textContent = part;
      inner.style.setProperty("--delay", 1.5 + i * 0.15 + "s");
      line.appendChild(inner);
      nameContainer.appendChild(line);
    });
  }
}

function renderSkills() {
  const marquee = document.querySelector(".marquee");
  if (!marquee) return;
  
  const skills = DATA.skills || [];
  if (!skills.length) return;

  marquee.innerHTML = `
    <div class="marquee-wrapper">
      <div class="marquee-track">
        ${skills.map(skill => `<span class="marquee-item">${escapeHtml(skill)}</span>`).join("")}
        ${skills.map(skill => `<span class="marquee-item">${escapeHtml(skill)}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderProjects() {
  const root = $("projectsList");
  if (!root || !DATA.projects) return;
  
  root.innerHTML = "";

  DATA.projects.forEach((p, i) => {
    const article = document.createElement("article");
    article.className = "project-item reveal";

    const top = document.createElement("div");
    top.className = "project-top";

    const index = document.createElement("span");
    index.className = "project-index";
    index.textContent = String(i + 1).padStart(2, "0");
    top.appendChild(index);

    if (p.status) {
      const status = document.createElement("span");
      status.className = "project-status";
      status.textContent = p.status;
      top.appendChild(status);
    }

    const title = document.createElement("h3");
    title.className = "project-title";
    title.textContent = p.title || "";

    const desc = document.createElement("p");
    desc.className = "project-desc";
    desc.textContent = p.description || "";

    const footer = document.createElement("div");
    footer.className = "project-footer";

    const tags = document.createElement("div");
    tags.className = "project-tags";
    (p.stack || []).forEach(t => {
      const tag = document.createElement("span");
      tag.className = "project-tag";
      tag.textContent = t;
      tags.appendChild(tag);
    });

    const links = document.createElement("div");
    links.className = "project-links";
    (p.links || []).forEach(l => {
      const href = safeUrl(l.href);
      if (!href) return;
      const a = document.createElement("a");
      a.className = "project-link";
      a.href = href;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.innerHTML = `
        <span>${l.label || "Lien"}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M7 17L17 7M17 7H7M17 7V17"></path>
        </svg>
      `;
      links.appendChild(a);
    });

    footer.appendChild(tags);
    footer.appendChild(links);
    article.appendChild(top);
    article.appendChild(title);
    article.appendChild(desc);
    article.appendChild(footer);
    root.appendChild(article);
  });
}

function renderCertifications() {
  const root = $("certificationsList");
  if (!root || !DATA.certifications) return;
  
  root.innerHTML = "";

  DATA.certifications.forEach(cert => {
    const article = document.createElement("article");
    article.className = "certification-item reveal";

    article.innerHTML = `
      <img class="certification-image" src="${cert.image || ""}" alt="Certification ${cert.title} - Farouk LAOUEDJ" loading="lazy" />
      <div class="certification-header">
        <span class="certification-issuer">${escapeHtml(cert.issuer || "")}</span>
        <span class="certification-date">${escapeHtml(cert.date || "")}</span>
      </div>
      <h3 class="certification-title">${escapeHtml(cert.title || "")}</h3>
      <p class="certification-desc">${escapeHtml(cert.description || "")}</p>
    `;
    root.appendChild(article);
  });
}

function renderAbout() {
  const root = $("aboutContent");
  if (!root || !DATA.about) return;
  
  root.innerHTML = "";
  const paras = DATA.about.paragraphs || [];
  paras.forEach(p => {
    const el = document.createElement("p");
    el.innerHTML = escapeHtml(p).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    root.appendChild(el);
  });
}

function renderSocial() {
  const root = $("socialLinks");
  if (!root || !DATA.social) return;
  
  root.innerHTML = "";

  DATA.social.forEach(item => {
    const href = safeUrl(item.href);
    if (!href) return;

    const a = document.createElement("a");
    a.className = "about-link";
    a.href = href;
    a.target = href.startsWith("mailto:") ? "_self" : "_blank";
    if (a.target === "_blank") a.rel = "noreferrer";
    a.innerHTML = `
      <span>${item.label || "Lien"}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M7 17L17 7M17 7H7M17 7V17"></path>
      </svg>
    `;
    root.appendChild(a);
  });
}

// ═══════════════════════════════════════════════════════════
// 4. ANIMATIONS (CSS-only for marquee - see styles.css)
// ═══════════════════════════════════════════════════════════

function setupLoader() {
  const loader = $("loader");
  if (!loader || !DATA.basics) return;

  const initials = DATA.basics.name.split(" ").map(n => n.charAt(0)).join("");
  setText("loaderName", initials || "FL");

  document.body.style.overflow = "hidden";

  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("is-done");
      document.body.style.overflow = "";
    }, 1500);
    setTimeout(() => {
      loader.style.display = "none";
    }, 2500);
  });
}

function setupReveals() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length || !"IntersectionObserver" in window) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });

  items.forEach((el, i) => {
    if (el.classList.contains("project-item")) {
      el.style.transitionDelay = i * 0.08 + "s";
    }
    observer.observe(el);
  });
}

function setupCursor() {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const cursor = document.querySelector(".cursor");
  const dot = document.querySelector(".cursor-dot");
  if (!cursor || !dot) return;

  let mx = -100, my = -100;
  let cx = -100, cy = -100;
  let dx = -100, dy = -100;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  function tick() {
    cx += (mx - cx) * 0.1;
    cy += (my - cy) * 0.1;
    cursor.style.left = cx + "px";
    cursor.style.top = cy + "px";

    dx += (mx - dx) * 0.22;
    dy += (my - dy) * 0.22;
    dot.style.left = dx + "px";
    dot.style.top = dy + "px";

    requestAnimationFrame(tick);
  }
  tick();
  document.body.classList.add("cursor-ready");

  const targets = document.querySelectorAll("a, button, [data-magnetic], .project-item");
  targets.forEach(el => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
  });
}

function setupMagnetic() {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const els = document.querySelectorAll("[data-magnetic]");
  els.forEach(el => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
}

function setupMobileNav() {
  const toggle = $("navToggle");
  const menu = $("navMenu");
  if (!toggle || !menu) return;

  const setOpen = (isOpen) => {
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menu.classList.toggle("is-open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  menu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => setOpen(false));
  });
}

function setupCopyEmail() {
  const btn = $("copyEmailBtn");
  const status = $("copyStatus");
  if (!btn || !status || !DATA.basics) return;

  const email = DATA.basics.email || "";

  btn.addEventListener("click", () => {
    status.textContent = "";
    if (!email) {
      status.textContent = "Aucun email configuré";
      return;
    }
    navigator.clipboard.writeText(email).then(() => {
      status.textContent = "✓ Email copié";
      setTimeout(() => status.textContent = "", 3000);
    }, () => {
      status.textContent = "Impossible de copier";
    });
  });
}

function setupHeaderScroll() {
  const header = $("header");
  if (!header) return;

  let lastY = 0;
  let ticking = false;

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y > 120 && y > lastY + 5) {
        header.classList.add("is-hidden");
      } else if (y < lastY - 5) {
        header.classList.remove("is-hidden");
      }
      lastY = y;
      ticking = false;
    });
  });
}

function setupSmoothScroll() {
  document.querySelectorAll("[data-nav]").forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href.charAt(0) !== "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// ═══════════════════════════════════════════════════════════
// 5. INIT
// ═══════════════════════════════════════════════════════════
async function init() {
  const response = await fetch("./data.json");
  if (!response.ok) {
    throw new Error("Failed to load data.json");
  }
  DATA = await response.json();

  setupLoader();
  renderBasics();
  renderSkills();
  renderProjects();
  renderCertifications();
  renderAbout();
  renderSocial();
  setupMobileNav();
  setupCopyEmail();

  requestAnimationFrame(() => {
    setupReveals();
    setupCursor();
    setupMagnetic();
    setupHeaderScroll();
    setupSmoothScroll();
  });
}

init();

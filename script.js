(function () {
  "use strict";

  if (window.portfolioInitialized) return;
  window.portfolioInitialized = true;

  var data = window.PORTFOLIO_DATA;
  if (!data || !data.basics) {
    console.warn("PORTFOLIO_DATA missing — check data.js");
    return;
  }

  // ── Helpers ──────────────────────────────────────────────────

  function $(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var el = $(id);
    if (el) el.textContent = value == null ? "" : String(value);
  }

  function setHref(id, value) {
    var el = $(id);
    if (el) el.setAttribute("href", value || "#");
  }

  function safeUrl(url) {
    if (!url) return null;
    try {
      var u = new URL(url, window.location.href);
      var allowed = ["http:", "https:", "mailto:", "tel:", "file:"];
      if (allowed.indexOf(u.protocol) !== -1) return u.href;
      return null;
    } catch (e) {
      return null;
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // ── Loader ──────────────────────────────────────────────────

  function setupLoader() {
    var loader = $("loader");
    if (!loader) return;

    var names = (data.basics.name || "").split(" ");
    var initials = names
      .map(function (n) {
        return n.charAt(0);
      })
      .join("");
    setText("loaderName", initials || "FL");

    document.body.style.overflow = "hidden";

    window.addEventListener("load", function () {
      setTimeout(function () {
        loader.classList.add("is-done");
        document.body.style.overflow = "";
      }, 1500);
      setTimeout(function () {
        loader.style.display = "none";
      }, 2500);
    });
  }

  // ── Hydrate Basics ──────────────────────────────────────────

  function hydrateBasics() {
    var b = data.basics;

    // Brand logo — initials
    var nameParts = (b.name || "").split(" ");
    var initials = nameParts
      .map(function (n) {
        return n.charAt(0);
      })
      .join("");
    setText("brandName", initials);

    // Hero kicker
    setText("heroKicker", b.kicker || "");

    // Hero name — split into lines with animation
    var nameContainer = $("heroNameContainer");
    if (nameContainer && b.name) {
      nameContainer.innerHTML = "";
      nameParts.forEach(function (part, i) {
        var line = document.createElement("span");
        line.className = "line";

        // Last word gets outline/stroke effect
        if (i === nameParts.length - 1 && nameParts.length > 1) {
          line.classList.add("line-stroke");
        }

        var inner = document.createElement("span");
        inner.className = "line-inner";
        inner.textContent = part;
        inner.style.setProperty("--delay", 1.5 + i * 0.15 + "s");

        line.appendChild(inner);
        nameContainer.appendChild(line);
      });
    }

    // Hero role & lead
    setText("heroRole", b.role || "");
    setText("heroLead", b.lead || "");

    // Email links
    var email = b.email || "";
    var mailto = email ? "mailto:" + email : "#";
    setHref("ctaEmail", mailto);
    setHref("heroContactBtn", mailto);
    setHref("contactEmailBtn", mailto);
    setText("contactEmailText", email);

    // Meta stats
    setText("metaLocation", b.location || "");
    setText("metaSpecialty", b.specialty || "");
    setText("metaAvailability", b.availability || "");

    // Footer
    setText("footerName", b.name || "");
    setText("footerYear", String(new Date().getFullYear()));

    // Page title
    if (b.name) document.title = b.name + " \u2014 Portfolio";
  }

  // ── Marquee ─────────────────────────────────────────────────

  function renderMarquee() {
    var marquee = document.querySelector('.marquee');
    if (!marquee) return;
    
    marquee.innerHTML = '';

    var wrapper = document.createElement('div');
    wrapper.className = 'marquee-wrapper';

    var track = document.createElement('div');
    track.className = 'marquee-track';

    var skills = data.skills || [];
    if (!skills.length) return;

    var content = '';
    for (var loop = 0; loop < 2; loop++) {
      skills.forEach(function (skill) {
        content += '<span class="marquee-item">' + escapeHtml(skill) + '</span>';
      });
    }
    track.innerHTML = content;

    wrapper.appendChild(track);
    marquee.appendChild(wrapper);

    // JS-driven marquee (more reliable than CSS)
    var pos = 0;
    var trackWidth = track.offsetWidth / 2;
    
    function animate() {
      pos -= 0.5;
      if (Math.abs(pos) >= trackWidth) {
        pos = 0;
      }
      track.style.transform = 'translateX(' + pos + 'px)';
      requestAnimationFrame(animate);
    }
    
    animate();
  }

  // ── Projects ────────────────────────────────────────────────

  function renderProjects() {
    var root = $("projectsList");
    if (!root) return;
    root.innerHTML = "";

    (data.projects || []).forEach(function (p, i) {
      var article = document.createElement("article");
      article.className = "project-item reveal";

      // Top row: index + status
      var top = document.createElement("div");
      top.className = "project-top";

      var index = document.createElement("span");
      index.className = "project-index";
      index.textContent = String(i + 1).padStart(2, "0");
      top.appendChild(index);

      if (p.status) {
        var status = document.createElement("span");
        status.className = "project-status";
        status.textContent = p.status;
        top.appendChild(status);
      }

      // Title
      var title = document.createElement("h3");
      title.className = "project-title";
      title.textContent = p.title || "";

      // Description
      var desc = document.createElement("p");
      desc.className = "project-desc";
      desc.textContent = p.description || "";

      // Footer: tags + links
      var footer = document.createElement("div");
      footer.className = "project-footer";

      var tags = document.createElement("div");
      tags.className = "project-tags";
      (p.stack || []).forEach(function (t) {
        var tag = document.createElement("span");
        tag.className = "project-tag";
        tag.textContent = t;
        tags.appendChild(tag);
      });

      var links = document.createElement("div");
      links.className = "project-links";
      (p.links || []).forEach(function (l) {
        var href = safeUrl(l.href);
        if (!href) return;
        var a = document.createElement("a");
        a.className = "project-link";
        a.href = href;
        a.target = "_blank";
        a.rel = "noreferrer";

        var span = document.createElement("span");
        span.textContent = l.label || "Lien";
        a.appendChild(span);

        // Arrow icon
        var svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        svg.setAttribute("width", "14");
        svg.setAttribute("height", "14");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("stroke-width", "2");
        svg.setAttribute("aria-hidden", "true");
        var path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        path.setAttribute("d", "M7 17L17 7M17 7H7M17 7V17");
        svg.appendChild(path);
        a.appendChild(svg);

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

  // ── Certifications ─────────────────────────────────────────────

  function renderCertifications() {
    var root = $("certificationsList");
    if (!root) return;
    root.innerHTML = "";

    (data.certifications || []).forEach(function (cert) {
      var article = document.createElement("article");
      article.className = "certification-item reveal";

      var img = document.createElement("img");
      img.className = "certification-image";
      img.src = cert.image || "";
      img.alt = "Certification " + cert.title + " - Farouk LAOUEDJ";
      img.loading = "lazy";

      var header = document.createElement("div");
      header.className = "certification-header";

      var issuer = document.createElement("span");
      issuer.className = "certification-issuer";
      issuer.textContent = cert.issuer || "";
      header.appendChild(issuer);

      var date = document.createElement("span");
      date.className = "certification-date";
      date.textContent = cert.date || "";
      header.appendChild(date);

      var title = document.createElement("h3");
      title.className = "certification-title";
      title.textContent = cert.title || "";

      var desc = document.createElement("p");
      desc.className = "certification-desc";
      desc.textContent = cert.description || "";

      article.appendChild(img);
      article.appendChild(header);
      article.appendChild(title);
      article.appendChild(desc);

      root.appendChild(article);
    });
  }

  // ── About ───────────────────────────────────────────────────

  function renderAbout() {
    var root = $("aboutContent");
    if (!root) return;
    root.innerHTML = "";

    var paras = (data.about && data.about.paragraphs) || [];
    paras.forEach(function (p) {
      var el = document.createElement("p");
      el.innerHTML = escapeHtml(p).replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
      );
      root.appendChild(el);
    });
  }

  // ── Social Links ────────────────────────────────────────────

  function renderSocial() {
    var root = $("socialLinks");
    if (!root) return;
    root.innerHTML = "";

    (data.social || []).forEach(function (item) {
      var href = safeUrl(item.href);
      if (!href) return;

      var a = document.createElement("a");
      a.className = "about-link";
      a.href = href;
      a.target = href.indexOf("mailto:") === 0 ? "_self" : "_blank";
      if (a.target === "_blank") a.rel = "noreferrer";

      var span = document.createElement("span");
      span.textContent = item.label || "Lien";
      a.appendChild(span);

      // Arrow
      var svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      svg.setAttribute("width", "16");
      svg.setAttribute("height", "16");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "2");
      svg.setAttribute("aria-hidden", "true");
      var path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("d", "M7 17L17 7M17 7H7M17 7V17");
      svg.appendChild(path);
      a.appendChild(svg);

      root.appendChild(a);
    });
  }

  // ── Custom Cursor ───────────────────────────────────────────

  function setupCursor() {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    var cursor = document.querySelector(".cursor");
    var dot = document.querySelector(".cursor-dot");
    if (!cursor || !dot) return;

    var cx = -100,
      cy = -100;
    var dx = -100,
      dy = -100;
    var mx = -100,
      my = -100;

    document.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
    });

    function tick() {
      // Lerp — cursor follows with delay
      cx += (mx - cx) * 0.1;
      cy += (my - cy) * 0.1;
      cursor.style.left = cx + "px";
      cursor.style.top = cy + "px";

      // Dot follows faster
      dx += (mx - dx) * 0.22;
      dy += (my - dy) * 0.22;
      dot.style.left = dx + "px";
      dot.style.top = dy + "px";

      requestAnimationFrame(tick);
    }
    tick();

    document.body.classList.add("cursor-ready");

    // Hover detection — re-bind after dynamic content
    bindCursorHovers();
  }

  function bindCursorHovers() {
    var cursor = document.querySelector(".cursor");
    if (!cursor) return;

    var targets = document.querySelectorAll(
      "a, button, [data-magnetic], .project-item"
    );
    targets.forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        cursor.classList.add("is-hover");
      });
      el.addEventListener("mouseleave", function () {
        cursor.classList.remove("is-hover");
      });
    });
  }

  // ── Magnetic Buttons ────────────────────────────────────────

  function setupMagnetic() {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    var els = document.querySelectorAll("[data-magnetic]");
    els.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        el.style.transform =
          "translate(" + x * 0.18 + "px, " + y * 0.18 + "px)";
      });

      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }

  // ── Mobile Nav ──────────────────────────────────────────────

  function setupMobileNav() {
    var toggle = $("navToggle");
    var menu = $("navMenu");
    if (!toggle || !menu) return;

    function setOpen(isOpen) {
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      menu.classList.toggle("is-open", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    }

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!open);
    });

    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        setOpen(false);
      });
    });
  }

  // ── Copy Email ──────────────────────────────────────────────

  function setupCopyEmail() {
    var btn = $("copyEmailBtn");
    var status = $("copyStatus");
    if (!btn || !status) return;

    var email = (data.basics && data.basics.email) || "";

    btn.addEventListener("click", function () {
      status.textContent = "";
      if (!email) {
        status.textContent = "Aucun email configuré";
        return;
      }
      navigator.clipboard.writeText(email).then(
        function () {
          status.textContent = "\u2713 Email copié";
          setTimeout(function () {
            status.textContent = "";
          }, 3000);
        },
        function () {
          status.textContent = "Impossible de copier";
        }
      );
    });
  }

  // ── Scroll Reveals ──────────────────────────────────────────

  function setupReveals() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
      );

      items.forEach(function (el, i) {
        // Stagger delay for project items
        if (el.classList.contains("project-item")) {
          el.style.transitionDelay = i * 0.08 + "s";
        }
        observer.observe(el);
      });
    } else {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  // ── Header Hide on Scroll ──────────────────────────────────

  function setupHeaderScroll() {
    var header = $("header");
    if (!header) return;

    var lastY = 0;
    var ticking = false;

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(function () {
        var y = window.scrollY;
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

  // ── Smooth Scroll ──────────────────────────────────────────

  function setupSmoothScroll() {
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href");
        if (!href || href.charAt(0) !== "#") return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  // ── Init ────────────────────────────────────────────────────

  setupLoader();
  hydrateBasics();
  renderMarquee();
  renderProjects();
  renderCertifications();
  renderAbout();
  renderSocial();
  setupMobileNav();
  setupCopyEmail();

  // Wait for DOM paint before setting up scroll-dependent features
  requestAnimationFrame(function () {
    setupReveals();
    setupCursor();
    setupMagnetic();
    setupHeaderScroll();
    setupSmoothScroll();
  });
})();

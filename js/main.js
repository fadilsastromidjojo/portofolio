// js/main.js
// ============================================================
// LOGIKA UTAMA
// ============================================================

(function () {
  "use strict";

  const config = window.PORTFOLIO_CONFIG;
  if (!config) {
    console.error("PORTFOLIO_CONFIG tidak ditemukan.");
    return;
  }

  /* ---------- HELPER ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const createEl = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };

  /* ---------- MODAL GLOBAL (CV, SERTIFIKAT, PROJECT, QA DOCS) ---------- */
  window.openModal = function(title, fileId) {
    const modal = $("#cv-modal");
    const modalTitle = $("#modal-title");
    const iframe = $("#cv-preview-iframe");

    if (!modal) return;

    if (!fileId || fileId.startsWith("GANTI")) {
      alert("File ID belum diatur dengan benar.");
      return;
    }

    if (modalTitle) modalTitle.textContent = title;
    if (iframe) iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
    
    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  window.closeModal = function() {
    const modal = $("#cv-modal");
    const iframe = $("#cv-preview-iframe");
    if (!modal) return;

    modal.classList.remove("is-active");
    modal.setAttribute("aria-hidden", "true");
    if (iframe) iframe.src = ""; 
    document.body.style.overflow = "";
  };

  function setupCvModal() {
    const btnPreview = $("#btn-preview-cv");
    const btnClose = $("#modal-close");
    const overlay = $("#modal-overlay");
    const modal = $("#cv-modal");

    if (btnPreview) {
      btnPreview.addEventListener("click", (e) => {
        e.preventDefault();
        window.openModal("Preview CV", config.cvFileId);
      });
    }

    if (btnClose) btnClose.addEventListener("click", window.closeModal);
    if (overlay) overlay.addEventListener("click", window.closeModal);
    
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && modal.classList.contains("is-active")) {
        window.closeModal();
      }
    });
  }

  /* ---------- HELPER TOMBOL/LINK ---------- */
  function createActionLink(item, defaultText) {
    // Cek jika menggunakan Google Drive (fileId)
    if (item.fileId && !item.fileId.startsWith("GANTI")) {
      const btn = createEl("button", "card__link", defaultText);
      btn.addEventListener("click", () => {
        window.openModal(item.title, item.fileId);
      });
      return btn;
    }
    // Cek jika menggunakan Link biasa (url)
    else if (item.url && item.url !== "#") {
      const link = createEl("a", "card__link", defaultText);
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener";
      return link;
    }
    return null;
  }

  /* ---------- RENDER NAVBAR & HERO ---------- */
  function renderNavbar() {
    const logoEl = $("#nav-logo");
    logoEl.innerHTML = ""; 

    if (config.logoImage) {
      const img = document.createElement("img");
      img.src = config.logoImage;
      img.alt = `${config.nickname} Logo`;
      img.className = "navbar__logo-img"; 
      logoEl.append(img); 
      logoEl.href = "#";
      logoEl.setAttribute("aria-label", config.nickname);
    } else {
      const logoText = config.nickname || config.name.split(" ")[0];
      logoEl.append(document.createTextNode(logoText));
      const accent = document.createElement("span");
      accent.textContent = ".";
      logoEl.append(accent);
    }

    const links = $("#nav-links");
    links.innerHTML = "";
    const navItems = [
      { href: "#about", label: "About" },
      { href: "#certificates", label: "Sertifikat" },
      { href: "#projects", label: "Project" },
      { href: "#artifacts", label: "QA Docs" },
    ];
    navItems.forEach((item) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      li.append(a);
      links.append(li);
    });
  }

  function renderHero() {
    $("#hero-badge").textContent = config.role;
    $("#hero-name").textContent = config.name;
    $("#hero-role").textContent = config.role;
    $("#hero-tagline").textContent = config.tagline;

    const socials = $("#hero-socials");
    socials.innerHTML = "";
    (config.socials || []).forEach((s) => {
      const a = createEl("a", null, s.label);
      a.href = s.url;
      a.target = s.url.startsWith("mailto:") ? "_self" : "_blank";
      a.rel = "noopener";
      socials.append(a);
    });

    const highlights = $("#hero-highlights");
    if(highlights) {
      highlights.innerHTML = "";
      (config.about?.highlights || []).forEach((h) => {
        const item = createEl("div", "highlight");
        item.append(createEl("div", "highlight__value", h.value));
        item.append(createEl("div", "highlight__label", h.label));
        highlights.append(item);
      });
    }
  }

  function renderAbout() {
    const paragraphs = $("#about-text");
    if (paragraphs) {
      paragraphs.innerHTML = "";
      (config.about?.paragraphs || []).forEach((p) => {
        paragraphs.append(createEl("p", null, p));
      });
    }

    const skillsWrap = $("#about-skills");
    if (skillsWrap) {
      skillsWrap.innerHTML = "";
      (config.about?.skills || []).forEach((group) => {
        const card = createEl("div", "skill-group");
        card.append(createEl("h3", "skill-group__title", group.group));
        const items = createEl("div", "skill-group__items");
        group.items.forEach((item) => items.append(createEl("span", "tag", item)));
        card.append(items);
        skillsWrap.append(card);
      });
    }
  }

  /* ---------- RENDER KARTU-KARTU ---------- */
  function renderCertificates() {
    const wrap = $("#certificates-grid");
    if (!wrap) return;
    wrap.innerHTML = "";
    
    (config.certificates || []).forEach((cert) => {
      const card = createEl("article", "card");
      card.append(createEl("h3", "card__title", cert.title));
      card.append(createEl("p", "card__meta", `${cert.issuer} · ${cert.year}`));
      
      const actionBtn = createActionLink(cert, "Lihat Sertifikat →");
      if (actionBtn) card.append(actionBtn);
      
      wrap.append(card);
    });
  }

  function renderProjects() {
    const wrap = $("#projects-grid");
    if (!wrap) return;
    wrap.innerHTML = "";
    
    (config.projects || []).forEach((proj) => {
      const card = createEl("article", "card");
      card.append(createEl("h3", "card__title", proj.title));
      card.append(createEl("p", "card__desc", proj.description));

      const tags = createEl("div", "card__tags");
      (proj.tags || []).forEach((t) => tags.append(createEl("span", "tag", t)));
      card.append(tags);

      const actionBtn = createActionLink(proj, "Lihat Project →");
      if (actionBtn) card.append(actionBtn);
      
      wrap.append(card);
    });
  }

  function renderArtifacts() {
    const wrap = $("#artifacts-grid");
    if (!wrap) return;
    wrap.innerHTML = "";
    
    (config.artifacts || []).forEach((item) => {
      const card = createEl("article", "card");
      
      if (item.type) {
        card.append(createEl("span", "badge-type", item.type));
      }

      card.append(createEl("h3", "card__title", item.title));
      card.append(createEl("p", "card__desc", item.description));

      const tags = createEl("div", "card__tags");
      (item.tools || []).forEach((t) => tags.append(createEl("span", "tag", t)));
      card.append(tags);

      const actionBtn = createActionLink(item, "Lihat Dokumen →");
      if (actionBtn) card.append(actionBtn);
      
      wrap.append(card);
    });
  }

  function renderFooter() {
    const soc = $("#footer-socials");
    if (soc) {
      soc.innerHTML = "";
      (config.socials || []).forEach((s) => {
        const a = createEl("a", null, s.label);
        a.href = s.url;
        a.target = s.url.startsWith("mailto:") ? "_self" : "_blank";
        a.rel = "noopener";
        soc.append(a);
      });
    }

    const copy = $("#footer-copy");
    if (copy) {
      copy.textContent = `© ${new Date().getFullYear()} ${config.name}. ${config.footerText || ""}`;
    }
  }

  /* ---------- SETUP LAINNYA ---------- */
  function setupCvButtons() {
    document.querySelectorAll("[data-cv]").forEach((btn) => {
      if (!config.cvFileId || config.cvFileId.startsWith("GANTI")) return;
      btn.href = `https://drive.google.com/uc?export=download&id=${config.cvFileId}`;
      btn.setAttribute("download", "");
      btn.setAttribute("rel", "noopener");
    });
  }

  function setupMobileNav() {
    const toggle = $("#nav-toggle");
    const links = $("#nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- INIT (JALANKAN SEMUA) ---------- */
  function init() {
    renderNavbar();
    renderHero();
    renderAbout();
    renderCertificates();
    renderProjects();
    renderArtifacts();
    renderFooter();
    setupCvButtons();
    setupMobileNav();
    setupCvModal();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
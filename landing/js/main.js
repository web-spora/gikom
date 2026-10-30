// main.js — navigation, progress bar, reveal on scroll, mobile menu
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".progress");
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav");

  // Progress bar + header state
  function onScroll() {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const total = h.scrollHeight - h.clientHeight;
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    if (progress) progress.style.width = pct + "%";
    if (header) header.classList.toggle("is-scrolled", scrolled > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  if (burger && nav) {
    const closeMenu = () => {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      burger.textContent = "☰";
    };
    const openMenu = () => {
      nav.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      burger.textContent = "✕";
    };
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      if (nav.classList.contains("is-open")) closeMenu(); else openMenu();
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("click", (e) => {
      if (!nav.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });
    window.addEventListener("resize", () => { if (window.innerWidth > 768) closeMenu(); });
  }

  // Reveal on scroll
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  // Smooth anchor scroll (offset for fixed header)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  // Track CTA clicks (analytics hook)
  document.querySelectorAll("[data-cta]").forEach((el) => {
    el.addEventListener("click", () => {
      if (window.GIKOM && window.GIKOM.track) window.GIKOM.track("cta_click", { id: el.dataset.cta });
    });
  });
})();

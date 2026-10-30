// faq.js — accordion
(function () {
  "use strict";
  document.querySelectorAll(".faq__q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq__item");
      if (!item) return;
      const isOpen = item.classList.contains("is-open");
      document.querySelectorAll(".faq__item.is-open").forEach((i) => i.classList.remove("is-open"));
      if (!isOpen) item.classList.add("is-open");
      if (window.GIKOM && window.GIKOM.track) window.GIKOM.track("faq_toggle", { q: btn.textContent.trim().slice(0, 40) });
    });
  });
})();

// analytics.js — minimal analytics facade
(function () {
  "use strict";
  window.GIKOM = window.GIKOM || {};
  window.GIKOM.track = function (event, props) {
    // Hook for a real analytics provider (GA4, Yandex.Metrica, etc.)
    // eslint-disable-next-line no-console
    if (window.console && window.console.debug) console.debug("[analytics]", event, props || {});
    // Example: window.dataLayer && window.dataLayer.push({ event, ...props });
  };
  // Scroll-depth milestones
  const milestones = [25, 50, 75, 100];
  const reached = new Set();
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const total = h.scrollHeight - h.clientHeight;
    const pct = total > 0 ? (h.scrollTop / total) * 100 : 0;
    milestones.forEach((m) => {
      if (pct >= m && !reached.has(m)) {
        reached.add(m);
        window.GIKOM.track("scroll_depth", { percent: m });
      }
    });
  }, { passive: true });
})();

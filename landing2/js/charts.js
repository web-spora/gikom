/* Анимация полос диаграммы скоростей. Ширина задаётся атрибутом data-w (в процентах). */
(function () {
  'use strict';

  var NS = (window.GIKOM = window.GIKOM || {});

  function animate(el) {
    el.style.width = el.getAttribute('data-w') + '%';
  }

  function initCharts() {
    var fills = document.querySelectorAll('.bar__fill[data-w]');
    if (!fills.length) return;

    if (!('IntersectionObserver' in window)) {
      fills.forEach(animate);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    fills.forEach(function (el) { observer.observe(el); });
  }

  NS.initCharts = initCharts;
})();

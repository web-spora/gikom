/* Появление блоков при прокрутке. Элементы с классом .reveal получают .is-visible. */
(function () {
  'use strict';

  var NS = (window.GIKOM = window.GIKOM || {});

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach(function (el) { observer.observe(el); });
  }

  NS.initReveal = initReveal;
})();

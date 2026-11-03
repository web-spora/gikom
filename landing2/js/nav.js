/* Шапка: тень при прокрутке, подсветка активного раздела, мобильное меню. */
(function () {
  'use strict';

  var NS = (window.GIKOM = window.GIKOM || {});

  function initNav() {
    var header = document.getElementById('header');
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('nav');
    if (!header || !nav) return;

    function onScroll() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    function setOpen(open) {
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        setOpen(!document.body.classList.contains('nav-open'));
      });
    }

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setOpen(false);
    });

    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    if (!('IntersectionObserver' in window) || !sections.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = '#' + entry.target.id;
          links.forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach(function (s) { observer.observe(s); });
  }

  NS.initNav = initNav;
})();

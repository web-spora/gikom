/* Просмотр фото галереи в полноэкранном режиме. Закрытие: кнопка, клик по фону, Esc. */
(function () {
  'use strict';

  var NS = (window.GIKOM = window.GIKOM || {});

  function initGallery() {
    var box = document.getElementById('lightbox');
    var img = document.getElementById('lightbox-img');
    var closeBtn = box ? box.querySelector('.lightbox__close') : null;
    var triggers = document.querySelectorAll('[data-lightbox]');
    if (!box || !img || !triggers.length) return;

    var lastFocus = null;

    function open(src, alt) {
      lastFocus = document.activeElement;
      img.src = src;
      img.alt = alt || '';
      box.hidden = false;
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      box.classList.remove('is-open');
      box.hidden = true;
      img.removeAttribute('src');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        open(btn.getAttribute('data-lightbox'), btn.getAttribute('data-alt'));
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', close);
    box.addEventListener('click', function (e) {
      if (e.target === box) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.classList.contains('is-open')) close();
    });
  }

  NS.initGallery = initGallery;
})();

/* Точка входа: сначала собирается содержимое, затем подключаются поведенческие модули. */
(function () {
  'use strict';

  var NS = window.GIKOM || {};

  if (!NS.ready) return;

  NS.ready
    .then(function () {
      NS.initNav();
      NS.initReveal();
      NS.initCharts();
      NS.initGallery();
    })
    .catch(function (err) {
      console.error(err);
    });
})();

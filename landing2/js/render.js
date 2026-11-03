/* Сборка страницы из window.GIKOM_DATA (файл data/data.js).
   Тексты не хранятся в HTML: правки делаются в data/data.js. */
(function () {
  'use strict';

  var NS = (window.GIKOM = window.GIKOM || {});

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function telHref(phone) {
    var digits = String(phone).replace(/\D/g, '');
    if (digits.charAt(0) === '8') digits = '7' + digits.slice(1);
    return 'tel:+' + digits;
  }

  var ARROW =
    '<svg class="btn__arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.4"/></svg>';

  function sectionHead(sec, centered) {
    return (
      '<div class="section__head' + (centered ? ' section__head--center' : '') + ' reveal">' +
      '<span class="eyebrow">' + esc(sec.num) + ' / ' + esc(sec.label) + '</span>' +
      '<h2>' + esc(sec.title) + '</h2>' +
      (sec.lead ? '<p class="lead">' + esc(sec.lead) + '</p>' : '') +
      '</div>'
    );
  }

  function bulletList(items) {
    return (
      '<ul class="bullets">' +
      items
        .map(function (item) {
          return '<li><span class="diamond" aria-hidden="true"></span><span>' + esc(item) + '</span></li>';
        })
        .join('') +
      '</ul>'
    );
  }

  function renderHero(c) {
    var stats = c.hero.stats
      .map(function (s) {
        return (
          '<div><div class="stat__value">' + esc(s.value) + '</div>' +
          '<div class="stat__label">' + esc(s.label) + '</div></div>'
        );
      })
      .join('');

    return (
      '<section class="hero section" id="top">' +
      '<div class="stripes stripes--corner" aria-hidden="true"></div>' +
      '<div class="container split">' +
      '<div class="hero__text reveal">' +
      '<span class="eyebrow">' + esc(c.hero.eyebrow) + '</span>' +
      '<h1>' + esc(c.hero.title) + '</h1>' +
      '<p class="hero__subtitle">' + esc(c.hero.subtitle) + '</p>' +
      '<span class="accent-bar" aria-hidden="true"></span>' +
      '<p class="lead">' + esc(c.hero.lead) + '</p>' +
      '<div style="display:flex;gap:16px;flex-wrap:wrap">' +
      '<a class="btn" href="' + esc(c.hero.cta.href) + '">' + esc(c.hero.cta.label) + ARROW + '</a>' +
      '<a class="btn btn--ghost" href="' + esc(c.hero.secondary.href) + '">' + esc(c.hero.secondary.label) + '</a>' +
      '</div>' +
      '<div class="hero__stats">' + stats + '</div>' +
      '</div>' +
      '<figure class="hero__media reveal">' +
      '<img class="hero-cut" src="' + esc(c.hero.image) + '" alt="' + esc(c.hero.imageAlt) + '" width="1280" height="1600">' +
      '<span class="hero__frame" aria-hidden="true"></span>' +
      '</figure>' +
      '</div>' +
      '</section>'
    );
  }

  function renderProblem(c) {
    var s = c.problem;
    return (
      '<section class="section" id="' + esc(s.id) + '">' +
      '<div class="container split">' +
      '<div>' + sectionHead(s) + bulletList(s.items) + '</div>' +
      '<div class="media media--tall clip-diag reveal"><img src="' + esc(s.image) + '" alt="' + esc(s.imageAlt) + '" loading="lazy"></div>' +
      '</div></section>'
    );
  }

  function renderPrinciple(c) {
    var s = c.principle;
    var cards = s.steps
      .map(function (step, i) {
        return (
          '<article class="card reveal">' +
          '<span class="num-badge">' + (i + 1) + '</span>' +
          '<h3 style="margin-top:20px">' + esc(step.title) + '</h3>' +
          '<p class="card__text">' + esc(step.text) + '</p>' +
          '</article>'
        );
      })
      .join('');
    return (
      '<section class="section section--grey" id="' + esc(s.id) + '">' +
      '<div class="container">' +
      sectionHead(s) +
      '<div class="grid grid--4">' + cards + '</div>' +
      '<div class="media media--wide reveal" style="margin-top:56px"><img src="' + esc(s.image) + '" alt="' + esc(s.imageAlt) + '" loading="lazy"></div>' +
      '</div></section>'
    );
  }

  function renderSolutions(c, specs) {
    var s = c.solutions;
    var cards = s.cards
      .map(function (card) {
        return (
          '<article class="card reveal' + (card.key === 'scas1200' ? ' card--grey' : '') + '">' +
          '<div class="media media--wide"><img src="' + esc(card.image) + '" alt="' + esc(card.imageAlt) + '" loading="lazy"></div>' +
          '<p class="eyebrow" style="margin-top:24px">' + esc(card.kind) + '</p>' +
          '<h3 style="font-size:1.9rem;color:var(--c-primary);margin-top:6px">' + esc(card.name) + '</h3>' +
          '<p style="font-weight:700;margin-top:6px">' + esc(card.title) + '</p>' +
          '<p class="card__text">' + esc(card.lead) + '</p>' +
          '<div style="margin-top:20px">' + bulletList(card.items) + '</div>' +
          '</article>'
        );
      })
      .join('');

    var cmp = specs.comparison;
    var head = cmp.columns.map(function (col) { return '<th scope="col">' + esc(col) + '</th>'; }).join('');
    var body = cmp.rows
      .map(function (row) {
        return '<tr><th scope="row">' + esc(row[0]) + '</th><td>' + esc(row[1]) + '</td><td>' + esc(row[2]) + '</td></tr>';
      })
      .join('');

    var bars = specs.speeds.items
      .map(function (item) {
        var a = (item.scas50 / specs.speeds.max) * 100;
        var b = (item.scas1200 / specs.speeds.max) * 100;
        return (
          '<div><div class="bar__head"><span>' + esc(item.label) + '</span></div>' +
          '<div class="bar__track">' +
          '<div class="bar__fill bar__fill--primary" data-w="' + a.toFixed(1) + '"></div>' +
          '<div class="bar__fill bar__fill--grey" data-w="' + b.toFixed(1) + '"></div>' +
          '</div>' +
          '<div class="bar__value" style="margin-top:6px">СКАС-50: ' + esc(item.scas50) + ' · СКАС-1200: ' + esc(item.scas1200) + ' ' + esc(specs.speeds.unit) + '</div></div>'
        );
      })
      .join('');

    var kpis = specs.kpis
      .map(function (k) {
        return (
          '<div class="kpi"><div class="kpi__label">' + esc(k.label) + '</div>' +
          '<div class="kpi__values">' + esc(k.scas50) + ' <em>/</em> ' + esc(k.scas1200) + '</div></div>'
        );
      })
      .join('');

    return (
      '<section class="section" id="' + esc(s.id) + '">' +
      '<div class="container">' +
      sectionHead(s) +
      '<div class="grid grid--2">' + cards + '</div>' +
      '<div class="table-wrap reveal" style="margin-top:72px"><table class="compare">' +
      '<caption class="sr-only">Сравнение СКАС-50 и СКАС-1200</caption>' +
      '<thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>' +
      '<div class="grid grid--2" style="margin-top:72px;align-items:start">' +
      '<div class="reveal"><h3 style="font-size:1.4rem;color:var(--c-primary);margin-bottom:24px">Характеристики штабелеров</h3>' +
      '<div class="legend" style="margin-bottom:24px"><span><i style="background:var(--c-primary)"></i>СКАС-50</span><span><i style="background:var(--c-grey)"></i>СКАС-1200</span></div>' +
      '<div class="bars">' + bars + '</div></div>' +
      '<div class="reveal"><div class="grid grid--2" style="gap:24px">' + kpis + '</div></div>' +
      '</div>' +
      '</div></section>'
    );
  }

  function renderControl(c) {
    var s = c.control;
    var levels = s.levels
      .map(function (level, i) {
        var cls = i === 0 || i === s.levels.length - 1 ? ' level--grey' : '';
        return (
          (i > 0 ? '<div class="level__connector" aria-hidden="true"></div>' : '') +
          '<div class="level' + cls + ' reveal"><div class="level__title">' + esc(level.title) + '</div>' +
          '<div class="level__text">' + esc(level.text) + '</div></div>'
        );
      })
      .join('');

    var op = s.operators;
    return (
      '<section class="section section--grey" id="' + esc(s.id) + '">' +
      '<div class="container">' +
      '<div class="split split--top">' +
      '<div>' + sectionHead(s) + '<p class="caption" style="font-size:0.98rem">' + esc(s.note) + '</p></div>' +
      '<div class="levels">' + levels + '</div>' +
      '</div>' +
      '<div class="split" style="margin-top:112px">' +
      '<div class="media media--wide clip-diag reveal"><img src="' + esc(op.image) + '" alt="' + esc(op.imageAlt) + '" loading="lazy"></div>' +
      '<div class="reveal"><span class="eyebrow">Рабочие места</span><h3 style="font-size:1.6rem;color:var(--c-primary);margin:12px 0 16px">' + esc(op.title) + '</h3>' +
      '<p class="lead" style="margin-bottom:24px">' + esc(op.lead) + '</p>' + bulletList(op.items) + '</div>' +
      '</div>' +
      '</div></section>'
    );
  }

  function renderLayout(c) {
    var s = c.layout;
    return (
      '<section class="section" id="' + esc(s.id) + '">' +
      '<div class="container split">' +
      '<div>' + sectionHead(s) + bulletList(s.items) + '</div>' +
      '<figure class="plan-figure reveal"><img src="' + esc(s.image) + '" alt="' + esc(s.imageAlt) + '" loading="lazy">' +
      '<figcaption class="caption">' + esc(s.caption) + '</figcaption></figure>' +
      '</div></section>'
    );
  }

  function renderSafety(c) {
    var s = c.safety;
    return (
      '<section class="section section--grey" id="' + esc(s.id) + '">' +
      '<div class="container split">' +
      '<div class="media media--tall clip-diag-left reveal"><img src="' + esc(s.image) + '" alt="' + esc(s.imageAlt) + '" loading="lazy"></div>' +
      '<div>' + sectionHead(s) + bulletList(s.items) + '</div>' +
      '</div></section>'
    );
  }

  function renderBenefits(c) {
    var s = c.benefits;
    var cards = s.items
      .map(function (item) {
        return (
          '<article class="card benefit reveal">' +
          '<span class="card__num">' + esc(item.num) + '</span>' +
          '<h3>' + esc(item.title) + '</h3>' +
          '<p class="card__text">' + esc(item.text) + '</p>' +
          '</article>'
        );
      })
      .join('');
    return (
      '<section class="section section--dark" id="' + esc(s.id) + '">' +
      '<div class="stripes stripes--corner" aria-hidden="true" style="opacity:0.12"></div>' +
      '<div class="container">' +
      sectionHead(s) +
      '<div class="grid grid--3">' + cards + '</div>' +
      '<p class="card__text" style="margin-top:40px;color:rgba(255,255,255,0.8)">Экономический эффект рассчитывается по данным конкретного склада и стоимости внедрения.</p>' +
      '</div></section>'
    );
  }

  function renderProcess(c) {
    var s = c.process;
    var steps = s.steps
      .map(function (step, i) {
        return (
          '<div class="process__step reveal"><span class="num-badge">' + (i + 1) + '</span>' +
          '<h3>' + esc(step.title) + '</h3><p class="card__text">' + esc(step.text) + '</p></div>'
        );
      })
      .join('');
    return (
      '<section class="section" id="' + esc(s.id) + '">' +
      '<div class="container">' +
      sectionHead(s) +
      '<div class="process">' + steps + '</div>' +
      '<div class="card card--grey reveal" style="margin-top:56px"><p>' + esc(s.requirements) + '</p></div>' +
      '</div></section>'
    );
  }

  function renderGallery(c) {
    var s = c.gallery;
    var items = s.items
      .map(function (item) {
        return (
          '<figure class="reveal"><button type="button" data-lightbox="' + esc(item.src) + '" data-alt="' + esc(item.alt) + '">' +
          '<div class="media"><img src="' + esc(item.src) + '" alt="' + esc(item.alt) + '" loading="lazy"></div></button>' +
          '<figcaption class="caption">' + esc(item.caption) + '</figcaption></figure>'
        );
      })
      .join('');
    return (
      '<section class="section section--grey" id="' + esc(s.id) + '">' +
      '<div class="container">' +
      '<div class="section__head reveal"><span class="eyebrow">' + esc(s.label) + '</span><h2>' + esc(s.title) + '</h2></div>' +
      '<div class="gallery">' + items + '</div>' +
      '</div></section>'
    );
  }

  function renderOffice(o) {
    return (
      '<article class="office reveal"><h3>' + esc(o.city) + '</h3>' +
      '<p>' + esc(o.address) + '</p>' +
      '<p>' +
      o.phones.map(function (p) { return '<a href="' + telHref(p) + '">' + esc(p) + '</a>'; }).join('<br>') +
      '</p>' +
      '<p>Эл. почта: <a href="mailto:' + esc(o.email) + '">' + esc(o.email) + '</a></p>' +
      '<p>' + esc(o.hours) + '</p></article>'
    );
  }

  function renderContacts(c) {
    var s = c.contacts;
    var m = s.main;
    var channels = s.channels
      .map(function (ch) {
        return '<a href="' + esc(ch.href) + '" target="_blank" rel="noopener">' + esc(ch.label) + '</a>';
      })
      .join('');
    var offices = s.branches.map(renderOffice).join('');
    return (
      '<section class="section section--grey" id="' + esc(s.id) + '">' +
      '<div class="container">' +
      sectionHead(s) +
      '<div class="contacts-grid">' +
      '<div class="stack">' +
      '<article class="office reveal"><h3>' + esc(m.title) + '</h3>' +
      '<p>' + esc(m.address) + '</p>' +
      '<p>' + m.phones.map(function (p) { return '<a href="' + telHref(p) + '">' + esc(p) + '</a>'; }).join('<br>') + '</p>' +
      '<p>Бесплатно по России: <a href="' + telHref(m.toll) + '">' + esc(m.toll) + '</a></p>' +
      '<p>Эл. почта: <a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a></p>' +
      '<p>' + esc(m.hours) + '</p></article>' +
      '<div class="reveal"><span class="eyebrow">Официальные каналы</span>' +
      '<div class="channels" style="margin-top:14px">' + channels + '</div></div>' +
      '<div class="reveal" style="display:flex;gap:20px;align-items:center">' +
      '<img class="qr" src="' + esc(s.qr) + '" alt="QR-код: сайт gikom.ru" loading="lazy">' +
      '<div><p style="font-weight:700">Сайт</p><a href="' + esc(c.brand.site) + '" style="color:var(--c-primary);font-weight:700">gikom.ru</a></div>' +
      '</div>' +
      '</div>' +
      '<div><h3 class="reveal" style="font-size:1.4rem;color:var(--c-primary);margin-bottom:24px">Филиалы в других городах</h3>' +
      '<div class="offices">' + offices + '</div></div>' +
      '</div>' +
      '</div></section>'
    );
  }

  function renderNav(c) {
    return c.nav
      .map(function (item) {
        return '<a href="#' + esc(item.id) + '">' + esc(item.label) + '</a>';
      })
      .join('');
  }

  function render() {
    return Promise.resolve().then(function () {
      if (!window.GIKOM_DATA) throw new Error('Не подключён файл data/data.js');
      var c = window.GIKOM_DATA.content;
      var specs = window.GIKOM_DATA.specs;

      document.title = c.meta.title;
      var meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', c.meta.description);

      var logo = document.getElementById('brand-logo');
      if (logo) logo.setAttribute('src', c.brand.logo);

      var nav = document.getElementById('nav');
      if (nav) nav.innerHTML = renderNav(c);

      var main = document.getElementById('main');
      var html = [
        renderHero(c),
        renderProblem(c),
        renderPrinciple(c),
        renderSolutions(c, specs),
        renderControl(c),
        renderLayout(c),
        renderSafety(c),
        renderBenefits(c),
        renderProcess(c),
        renderGallery(c),
        renderContacts(c)
      ].join('');
      main.innerHTML = html;
      return c;
    });
  }

  NS.ready = render().catch(function (err) {
    var main = document.getElementById('main');
    if (main) {
      main.innerHTML = '<div class="container section"><p class="lead">Не удалось загрузить содержимое страницы: ' + esc(err.message) +
        '. Откройте сайт через локальный сервер (см. README.md).</p></div>';
    }
    throw err;
  });
})();

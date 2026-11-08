/* ============================================================
   Логика дашборда: рендер данных, графики, навигация.
   ============================================================ */
(function () {
  "use strict";
  const D = window.AUDIT;
  if (!D) { console.error("AUDIT data not loaded"); return; }

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- helpers ---------- */
  const fmt = (v, unit) => {
    if (v === null || v === undefined) return "нет данных";
    if (unit === "₽") return Math.round(v).toLocaleString("ru-RU") + " ₽";
    if (unit === "%") return v.toLocaleString("ru-RU", { maximumFractionDigits: 1 }) + "%";
    return v.toLocaleString("ru-RU");
  };
  const sevClass = { critical: "critical", high: "high", medium: "medium", low: "low" };
  const sevLabel = { critical: "Критично", high: "Высокий", medium: "Средний", low: "Низкий" };
  const pct = (v) => v.toLocaleString("ru-RU", { maximumFractionDigits: 1 }) + "%";
  const niceMax = (v) => {
    if (!v || v <= 0) return 1;
    const mag = Math.pow(10, Math.floor(Math.log10(v)));
    const norm = v / mag;
    const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    const s = steps.find((x) => norm <= x + 1e-9) || 10;
    return s * mag;
  };

  /* ---------- KPI ---------- */
  function renderKpi() {
    const host = $("#kpi-grid");
    if (!host) return;
    host.innerHTML = D.kpi.map((k, i) => `
      <div class="kpi ${i === 2 ? "kpi--warn" : i === 3 ? "kpi--accent" : ""}">
        <div class="kpi__value">${fmt(k.value, k.unit)}</div>
        <div class="kpi__label">${k.label}</div>
        <div class="kpi__note">${k.note || ""}</div>
      </div>
    `).join("");
  }

  /* ---------- Funnel ---------- */
  function renderFunnel() {
    const host = $("#funnel");
    if (!host) return;
    const first = D.funnel[0].value;
    host.innerHTML = D.funnel.map((s, i) => {
      const empty = s.value === null;
      const width = empty ? 100 : Math.max(4, (s.value / first) * 100);
      const share = empty ? null : (s.value / first) * 100;
      const prev = i > 0 ? D.funnel[i - 1].value : null;
      const conv = !empty && prev ? (s.value / prev) * 100 : null;
      const notes = [];
      if (share !== null) notes.push(pct(share) + " от визитов");
      if (conv !== null && i > 0) notes.push(pct(conv) + " от предыдущего шага");
      if (empty) notes.push(s.note || "нет данных");
      return `
        <div class="funnel__step">
          <div class="funnel__top">
            <span class="funnel__label">${s.label}</span>
            <span class="${empty ? "funnel__value--empty" : "funnel__value"}">${empty ? "нет данных" : fmt(s.value)}</span>
          </div>
          <div class="funnel__bar-wrap">
            <div class="funnel__bar ${empty ? "funnel__bar--empty" : ""}" style="width:${width}%"></div>
          </div>
          <div class="funnel__note">${notes.join(" · ")}</div>
        </div>
      `;
    }).join("");
  }

  /* ---------- Channels ---------- */
  function renderChannels() {
    const host = $("#channels-grid");
    if (!host) return;
    host.innerHTML = D.channels.map((c) => `
      <article class="card channel-card">
        <div class="channel-card__head">
          <span class="channel-card__name">${c.name}</span>
          <span class="chip chip--${c.completeness === "Низкая" ? "low" : c.completeness === "Средняя" ? "medium" : "medium"}">${c.completeness}</span>
        </div>
        <div class="channel-card__period">${c.period}</div>
        <div class="channel-card__key">${c.key}</div>
        <div class="channel-card__row"><strong>Сильная сторона:</strong> ${c.strength}</div>
        <div class="channel-card__row"><strong>Риск:</strong> ${c.risk}</div>
        <a class="channel-card__link" href="${c.page}">Подробнее об аудите канала →</a>
      </article>
    `).join("");
  }

  /* ---------- Bottlenecks ---------- */
  function renderBottlenecks(filter) {
    const host = $("#bn-grid");
    if (!host) return;
    const list = filter && filter !== "all"
      ? D.bottlenecks.filter((b) => b.severity === filter)
      : D.bottlenecks;
    host.innerHTML = list.map((b) => `
      <article class="card bn-card bn-card--${b.severity}">
        <span class="chip chip--${b.severity === "critical" ? "critical" : b.severity === "high" ? "high" : "medium"}">${sevLabel[b.severity]}</span>
        <h3 class="card__title" style="margin-top:8px">${b.title}</h3>
        <div class="bn-card__metric">${b.metric}</div>
        <div class="bn-card__why">${b.why}</div>
        <div class="bn-card__action"><strong>Первое действие:</strong> ${b.action}</div>
        <div class="card__footer">Источник: ${b.source}</div>
      </article>
    `).join("");
  }

  /* ---------- Problems ---------- */
  function renderProblems() {
    const host = $("#problems-grid");
    if (!host) return;
    host.innerHTML = D.problems.map((p) => `
      <article class="card problem-card problem-card--${p.severity}">
        <div class="problem-card__top">
          <span class="chip chip--${p.severity === "critical" ? "critical" : p.severity === "high" ? "high" : "medium"}">${sevLabel[p.severity]}</span>
          <span class="problem-card__channel">${p.channel}</span>
        </div>
        <h3 class="card__title">${p.title}</h3>
        <div class="problem-card__metric">${p.metric}</div>
        <div class="problem-card__why">${p.why}</div>
        <div class="problem-card__action"><strong>Что делать:</strong> ${p.action}</div>
      </article>
    `).join("");
  }

  /* ---------- Growth ---------- */
  function renderGrowth() {
    const host = $("#growth-grid");
    if (!host) return;
    host.innerHTML = D.growth.map((g) => `
      <article class="card">
        <h3 class="card__title">${g.title}</h3>
        <div class="card__text">${g.action}</div>
        <div class="growth-card__effect">Эффект: ${g.effect}</div>
        <div class="growth-card__measure">Как измерить: ${g.measure}</div>
        <div class="card__footer">Источник: ${g.source}</div>
      </article>
    `).join("");
  }

  /* ---------- Roadmap ---------- */
  function renderRoadmap() {
    const host = $("#roadmap-grid");
    if (!host) return;
    host.innerHTML = D.roadmap.map((r, i) => `
      <div class="roadmap__phase">
        <div class="roadmap__head">
          <span class="roadmap__num">${String(i + 1).padStart(2, "0")}</span>
          <h4>${r.phase}</h4>
        </div>
        <span class="chip chip--${r.priority === "Критично" ? "critical" : "high"}">${r.priority}</span>
        <ul>${r.items.map((it) => `<li>${it}</li>`).join("")}</ul>
      </div>
    `).join("");
  }

  /* ---------- Gaps ---------- */
  function renderGaps() {
    const host = $("#gaps-grid");
    if (!host) return;
    host.innerHTML = D.gaps.map((g) => `
      <div class="gap">
        <div class="gap__title">${g.gap}</div>
        <div class="gap__row"><strong>Что известно:</strong> ${g.known}</div>
        <div class="gap__row"><strong>Что нельзя утверждать:</strong> ${g.cannot}</div>
        <div class="gap__row gap__row--request"><strong>Что запросить:</strong> ${g.request}</div>
      </div>
    `).join("");
  }

  /* ---------- Files ---------- */
  function renderFiles() {
    const host = $("#files-list");
    if (!host) return;
    host.innerHTML = D.files.map((f) => `
      <li><strong>${f.name}</strong> — ${f.note}</li>
    `).join("");
  }

  /* ---------- Charts ---------- */
  function monthlyChart() {
    const svg = $("#chart-monthly");
    if (!svg) return;
    const data = D.monthly;
    const W = 940, H = 360;
    const padL = 72, padR = 82, padT = 40, padB = 66;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const maxV = niceMax(Math.max(...data.map((d) => d.visits)));
    const spends = data.filter((d) => d.spend !== null).map((d) => d.spend);
    const maxS = niceMax(Math.max(...spends, 1));
    const n = data.length;
    const step = plotW / n;
    const barW = Math.min(52, step * 0.54);
    const MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
    const label = (m) => {
      const parts = m.split("-");
      return MONTHS[+parts[1] - 1] + " " + parts[0].slice(2);
    };

    let out = "";
    for (let i = 0; i <= 5; i++) {
      const y = padT + (plotH / 5) * i;
      out += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#ececec" stroke-width="1"/>`;
      out += `<text x="${padL - 10}" y="${y + 4}" text-anchor="end" font-size="10" fill="#707070">${Math.round(maxV - (maxV / 5) * i).toLocaleString("ru-RU")}</text>`;
      out += `<text x="${W - padR + 10}" y="${y + 4}" font-size="10" fill="#B26A00">${Math.round((maxS - (maxS / 5) * i) / 1000)}</text>`;
    }
    out += `<text x="${padL}" y="${padT - 18}" font-size="10" fill="#707070">визиты</text>`;
    out += `<text x="${W - padR}" y="${padT - 18}" text-anchor="end" font-size="10" fill="#B26A00">расход, тыс. ₽</text>`;

    const firstNull = data.findIndex((d) => d.spend === null);
    if (firstNull >= 0) {
      const bx = padL + step * firstNull;
      const bw = step * (n - firstNull);
      out += `<rect x="${bx}" y="${padT}" width="${bw}" height="${plotH}" fill="#707070" opacity="0.06"/>`;
      out += `<text x="${bx + bw / 2}" y="${padT + 16}" text-anchor="middle" font-size="10" fill="#707070">Директ: нет данных</text>`;
    }

    data.forEach((d, i) => {
      const cx = padL + step * i + step / 2;
      const x = cx - barW / 2;
      const h = Math.max((d.visits / maxV) * plotH, 3);
      const y = padT + plotH - h;
      const isCrash = d.m === "2026-03";
      out += `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="${isCrash ? "#B3261E" : "#97242B"}" opacity="${isCrash ? 1 : 0.78}"><title>${label(d.m)}: ${d.visits.toLocaleString("ru-RU")} визитов</title></rect>`;
      out += `<text x="${cx}" y="${y - 7}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${isCrash ? "#B3261E" : "#1F2328"}">${d.visits.toLocaleString("ru-RU")}</text>`;
      out += `<text x="${cx}" y="${H - padB + 22}" text-anchor="middle" font-size="10" fill="#707070">${label(d.m)}</text>`;
    });

    data.forEach((d, i) => {
      if (d.spend === null) return;
      const sx = padL + step * i + step / 2;
      const sy = padT + plotH - (d.spend / maxS) * plotH;
      const prev = i > 0 ? data[i - 1] : null;
      if (prev && prev.spend !== null) {
        const px = padL + step * (i - 1) + step / 2;
        const py = padT + plotH - (prev.spend / maxS) * plotH;
        out += `<line x1="${px}" y1="${py}" x2="${sx}" y2="${sy}" stroke="#B26A00" stroke-width="2.2"/>`;
      }
      out += `<circle cx="${sx}" cy="${sy}" r="3.5" fill="${d.spend === 0 ? "#fff" : "#B26A00"}" stroke="#B26A00" stroke-width="1.5"><title>${label(d.m)}: ${Math.round(d.spend).toLocaleString("ru-RU")} ₽</title></circle>`;
    });

    const crash = data.findIndex((d) => d.m === "2026-03");
    if (crash >= 0) {
      const cx = padL + step * crash + step / 2;
      const yTop = padT + plotH - Math.max((data[crash].visits / maxV) * plotH, 3);
      out += `<line x1="${cx}" y1="${yTop - 12}" x2="${cx}" y2="${yTop - 30}" stroke="#B3261E" stroke-width="1.2"/>`;
      out += `<text x="${cx}" y="${yTop - 36}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#B3261E">−67,8%</text>`;
    }

    svg.innerHTML = out;
  }

  function sourcesChart() {
    const svg = $("#chart-sources");
    if (!svg || !window.GIKOM) return;
    GIKOM.hbars(svg, {
      width: 620, rowH: 46, padL: 200, padR: 150, padT: 6, padB: 6,
      rows: D.sources.map((s) => ({
        label: s.name,
        sub: s.note || "",
        value: s.value,
        valueLabel: fmt(s.value) + " · " + s.share + "%",
        opacity: s.name === "Переходы по рекламе" ? 0.95 : 0.55
      }))
    });
  }

  function devicesChart() {
    const svg = $("#chart-devices");
    if (!svg || !window.GIKOM) return;
    GIKOM.donut(svg, {
      width: 620, height: 320, cx: 150, cy: 160, r: 100, inner: 62,
      centerValue: fmt(44221), centerLabel: "визитов",
      legendRow: 52,
      rows: D.devices.map((d, i) => ({
        label: d.name,
        value: d.value,
        note: "отказы " + (d.bounce * 100).toFixed(1) + "%",
        color: ["#97242B", "#1F5FBF", "#B26A00"][i]
      }))
    });
  }

  function campaignsChart() {
    const svg = $("#chart-campaigns");
    if (!svg || !window.GIKOM) return;
    GIKOM.hbars(svg, {
      width: 620, rowH: 50, padL: 250, padR: 150, padT: 6, padB: 6,
      rows: D.directCampaigns.map((c) => ({
        label: c.name,
        sub: c.sub,
        value: c.spend,
        valueLabel: fmt(c.spend) + " ₽ · " + c.share + "%",
        opacity: c.name === "Прочие кампании" ? 0.45 : 0.85
      }))
    });
  }

  /* ---------- Nav active ---------- */
  function initNav() {
    const links = $$(".nav a, .mobile-nav a");
    const sections = $$("section[id]");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.id;
          links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + id));
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach((s) => obs.observe(s));
  }

  /* ---------- Reveal ---------- */
  function initReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("is-visible")); return; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((e) => obs.observe(e));
  }

  /* ---------- Mobile menu ---------- */
  function initMobile() {
    const burger = $(".burger");
    const nav = $(".mobile-nav");
    if (!burger || !nav) return;
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$(".mobile-nav a").forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }));
  }

  /* ---------- Progress ---------- */
  function initProgress() {
    const bar = $(".progress");
    if (!bar) return;
    window.addEventListener("scroll", () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      bar.style.width = pct + "%";
    }, { passive: true });
  }

  /* ---------- Bottleneck filter ---------- */
  function initFilter() {
    const sel = $("#bn-filter");
    if (!sel) return;
    sel.addEventListener("change", (e) => renderBottlenecks(e.target.value));
  }

  /* ---------- Print ---------- */
  function initPrint() {
    const btn = $("#print-btn");
    if (btn) btn.addEventListener("click", () => window.print());
  }

  /* ---------- Boot ---------- */
  function boot() {
    renderKpi();
    renderFunnel();
    renderChannels();
    renderBottlenecks("all");
    renderProblems();
    renderGrowth();
    renderRoadmap();
    renderGaps();
    renderFiles();
    monthlyChart();
    sourcesChart();
    devicesChart();
    campaignsChart();
    initNav();
    initReveal();
    initMobile();
    initProgress();
    initFilter();
    initPrint();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

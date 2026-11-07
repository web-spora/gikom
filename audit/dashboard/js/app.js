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
    const max = D.funnel[0].value;
    host.innerHTML = D.funnel.map((s) => {
      const empty = s.value === null;
      const pct = empty ? 100 : Math.max(4, (s.value / max) * 100);
      return `
        <div class="funnel__step">
          <div class="funnel__label">${s.label}</div>
          <div>
            <div class="funnel__bar-wrap">
              <div class="funnel__bar ${empty ? "funnel__bar--empty" : ""}" style="width:${pct}%"></div>
            </div>
            ${s.note ? `<div class="funnel__note">${s.note}</div>` : ""}
          </div>
          <div class="${empty ? "funnel__value--empty" : "funnel__value"}">${empty ? "нет данных" : fmt(s.value)}</div>
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
    const W = 720, H = 260, padL = 48, padR = 16, padT = 16, padB = 36;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const maxV = Math.max(...data.map((d) => d.visits));
    const spends = data.map((d) => d.spend).filter((v) => v !== null);
    const maxS = Math.max(...spends);
    const n = data.length;
    const step = plotW / n;
    const barW = step * 0.55;

    let bars = "", line = "", dots = "", labels = "", grid = "";
    // grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padT + (plotH / 4) * i;
      grid += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#eee" stroke-width="1"/>`;
      const val = Math.round(maxV - (maxV / 4) * i);
      grid += `<text x="${padL - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#707070">${val.toLocaleString("ru-RU")}</text>`;
    }
    data.forEach((d, i) => {
      const x = padL + step * i + (step - barW) / 2;
      const h = (d.visits / maxV) * plotH;
      const y = padT + plotH - h;
      const isCrash = d.m === "2026-03";
      bars += `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="${isCrash ? "#B3261E" : "#97242B"}" opacity="${isCrash ? 1 : 0.75}"><title>${d.m}: ${d.visits.toLocaleString("ru-RU")} визитов</title></rect>`;
      if (d.spend !== null) {
        const sx = padL + step * i + step / 2;
        const sy = padT + plotH - (d.spend / maxS) * plotH;
        if (i > 0 && data[i - 1].spend !== null) {
          const px = padL + step * (i - 1) + step / 2;
          const py = padT + plotH - (data[i - 1].spend / maxS) * plotH;
          line += `<line x1="${px}" y1="${py}" x2="${sx}" y2="${sy}" stroke="#B26A00" stroke-width="2"/>`;
        }
        dots += `<circle cx="${sx}" cy="${sy}" r="3" fill="#B26A00"><title>${d.m}: ${Math.round(d.spend).toLocaleString("ru-RU")} ₽</title></circle>`;
      }
      const lbl = d.m.slice(5) + "." + d.m.slice(2, 4);
      labels += `<text x="${padL + step * i + step / 2}" y="${H - 12}" text-anchor="middle" font-size="10" fill="#707070">${lbl}</text>`;
    });
    // spend axis (right)
    let rightAxis = "";
    for (let i = 0; i <= 4; i++) {
      const y = padT + (plotH / 4) * i;
      const val = Math.round(maxS - (maxS / 4) * i);
      rightAxis += `<text x="${W - padR + 6}" y="${y + 4}" font-size="9" fill="#B26A00">${(val / 1000).toFixed(0)}k</text>`;
    }
    svg.innerHTML = `
      ${grid}${bars}${line}${dots}${labels}${rightAxis}
      <text x="${padL}" y="${padT - 4}" font-size="10" fill="#97242B">визиты</text>
      <text x="${W - padR}" y="${padT - 4}" text-anchor="end" font-size="10" fill="#B26A00">расход ₽</text>
    `;
    // crash annotation
    const crash = data.findIndex((d) => d.m === "2026-03");
    if (crash >= 0) {
      const cx = padL + step * crash + step / 2;
      svg.innerHTML += `<text x="${cx}" y="${padT + 14}" text-anchor="middle" font-size="10" fill="#B3261E" font-weight="700">−67,8%</text>`;
    }
  }

  function sourcesChart() {
    const svg = $("#chart-sources");
    if (!svg) return;
    const data = D.sources;
    const W = 720, rowH = 26, padL = 150, padR = 60, padT = 8;
    const max = Math.max(...data.map((d) => d.value));
    const H = data.length * rowH + padT + 8;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    let out = "";
    data.forEach((d, i) => {
      const y = padT + i * rowH;
      const w = (d.value / max) * (W - padL - padR);
      out += `<text x="${padL - 8}" y="${y + 14}" text-anchor="end" font-size="11" fill="#1F2328">${d.name}</text>`;
      out += `<rect x="${padL}" y="${y + 2}" width="${w}" height="16" rx="3" fill="#97242B" opacity="0.75"><title>${d.name}: ${d.value.toLocaleString("ru-RU")} (${d.share}%)</title></rect>`;
      out += `<text x="${padL + w + 6}" y="${y + 14}" font-size="11" fill="#707070">${d.value.toLocaleString("ru-RU")} · ${d.share}%</text>`;
    });
    svg.innerHTML = out;
  }

  function devicesChart() {
    const svg = $("#chart-devices");
    if (!svg) return;
    const data = D.devices;
    const cx = 110, cy = 110, r = 80, inner = 52;
    const total = data.reduce((a, b) => a + b.value, 0);
    let angle = -Math.PI / 2;
    const colors = ["#97242B", "#1F5FBF", "#B26A00"];
    let paths = "";
    data.forEach((d, i) => {
      const frac = d.value / total;
      const a2 = angle + frac * Math.PI * 2;
      const large = frac > 0.5 ? 1 : 0;
      const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
      const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      const xi1 = cx + inner * Math.cos(angle), yi1 = cy + inner * Math.sin(angle);
      const xi2 = cx + inner * Math.cos(a2), yi2 = cy + inner * Math.sin(a2);
      paths += `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1} Z" fill="${colors[i]}" opacity="0.85"><title>${d.name}: ${d.value.toLocaleString("ru-RU")} (${d.share}%)</title></path>`;
      angle = a2;
    });
    // legend
    let legend = "";
    data.forEach((d, i) => {
      const y = 20 + i * 26;
      legend += `<rect x="230" y="${y}" width="12" height="12" rx="3" fill="${colors[i]}" opacity="0.85"/>`;
      legend += `<text x="248" y="${y + 11}" font-size="12" fill="#1F2328">${d.name} — ${d.share}%</text>`;
      legend += `<text x="248" y="${y + 24}" font-size="10" fill="#707070">${d.value.toLocaleString("ru-RU")} визитов · отказы ${(d.bounce * 100).toFixed(1)}%</text>`;
    });
    // iphone callout
    legend += `<text x="230" y="${20 + data.length * 26 + 16}" font-size="12" fill="#B3261E" font-weight="700">iPhone: ${D.iphone.value.toLocaleString("ru-RU")} визитов</text>`;
    legend += `<text x="230" y="${20 + data.length * 26 + 32}" font-size="11" fill="#707070">отказы ${(D.iphone.bounce * 100).toFixed(1)}% · глубина ${D.iphone.depth} · ${D.iphone.time}</text>`;
    svg.innerHTML = paths + legend;
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
    burger.addEventListener("click", () => nav.classList.toggle("is-open"));
    $$(".mobile-nav a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("is-open")));
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

  /* ---------- Theme ---------- */
  function initTheme() {
    const btn = $("#theme-toggle");
    const apply = (t) => document.documentElement.setAttribute("data-theme", t);
    const saved = localStorage.getItem("gikom-theme");
    if (saved) apply(saved);
    if (btn) btn.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "light";
      const next = cur === "light" ? "dark" : "light";
      apply(next);
      localStorage.setItem("gikom-theme", next);
      btn.textContent = next === "light" ? "Тёмная" : "Светлая";
    });
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
    renderGrowth();
    renderRoadmap();
    renderGaps();
    renderFiles();
    monthlyChart();
    sourcesChart();
    devicesChart();
    initNav();
    initReveal();
    initMobile();
    initProgress();
    initTheme();
    initFilter();
    initPrint();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

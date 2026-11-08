/* ============================================================
   GIKOM charts — лёгкие SVG-графики без внешних зависимостей.
   Используются на главном дашборде и страницах каналов.
   ============================================================ */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  function fmt(n) {
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    return Number(n).toLocaleString("ru-RU", { maximumFractionDigits: 2 });
  }

  function niceMax(v) {
    if (!v || v <= 0) return 1;
    var mag = Math.pow(10, Math.floor(Math.log10(v)));
    var norm = v / mag;
    var steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    var s = steps.filter(function (x) { return norm <= x + 1e-9; })[0] || 10;
    return s * mag;
  }

  function make(name, attrs) {
    var el = document.createElementNS(NS, name);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (attrs[k] !== undefined && attrs[k] !== null) el.setAttribute(k, attrs[k]);
      });
    }
    return el;
  }

  function addText(parent, x, y, str, attrs) {
    var t = make("text", Object.assign({ x: x, y: y }, attrs || {}));
    t.textContent = str === null || str === undefined ? "" : String(str);
    parent.appendChild(t);
    return t;
  }

  function clear(svg) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
  }

  function base(svg, W, H) {
    clear(svg);
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  }

  function gridY(svg, o) {
    for (var i = 0; i <= o.ticks; i++) {
      var y = o.padT + (o.plotH / o.ticks) * i;
      svg.appendChild(make("line", {
        x1: o.padL, y1: y, x2: o.W - o.padR, y2: y,
        stroke: "#ececec", "stroke-width": 1
      }));
      var val = o.max - (o.max / o.ticks) * i;
      addText(svg, o.padL - 8, y + 4, fmt(Math.round(val)) + (o.unit || ""), {
        "text-anchor": "end", "font-size": 10, fill: "#707070"
      });
    }
  }

  /* ---------- vertical bars ---------- */
  function bars(svg, cfg) {
    var labels = cfg.labels || [];
    var values = cfg.values || [];
    var W = cfg.width || 900;
    var H = cfg.height || 320;
    var padL = cfg.padL || 58;
    var padR = cfg.padR || 24;
    var padT = cfg.padT || 34;
    var padB = cfg.padB || 56;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var max = cfg.max || niceMax(Math.max.apply(null, values.map(function (v) { return v || 0; })));
    var n = Math.max(values.length, 1);
    var step = plotW / n;
    var barW = Math.min(cfg.barMax || 46, step * 0.58);
    var color = cfg.color || "#97242B";
    var hi = cfg.highlight === null || cfg.highlight === undefined ? -1 : cfg.highlight;
    var hiColor = cfg.highlightColor || "#B3261E";

    base(svg, W, H);
    gridY(svg, { W: W, padL: padL, padR: padR, padT: padT, plotH: plotH, ticks: cfg.ticks || 5, max: max, unit: cfg.unit || "" });

    values.forEach(function (v, i) {
      var x = padL + step * i + (step - barW) / 2;
      var h = Math.max(((v || 0) / max) * plotH, v ? 2 : 0);
      var y = padT + plotH - h;
      var isHi = i === hi;
      var rect = make("rect", {
        x: x, y: y, width: barW, height: h, rx: 4,
        fill: isHi ? hiColor : color, opacity: isHi ? 1 : 0.82
      });
      var title = make("title");
      title.textContent = labels[i] + ": " + fmt(v) + (cfg.unit || "");
      rect.appendChild(title);
      svg.appendChild(rect);

      if (cfg.valueLabels !== false && v !== null && v !== undefined) {
        addText(svg, x + barW / 2, y - 7, fmt(v), {
          "text-anchor": "middle", "font-size": 10, "font-weight": 700,
          fill: isHi ? hiColor : "#1F2328"
        });
      }
      addText(svg, padL + step * i + step / 2, H - padB + 20, labels[i], {
        "text-anchor": "middle", "font-size": 10, fill: "#707070"
      });
    });

    if (cfg.yTitle) addText(svg, padL - 8, padT - 14, cfg.yTitle, { "text-anchor": "end", "font-size": 10, fill: "#707070" });
    if (cfg.xTitle) addText(svg, W - padR, H - 8, cfg.xTitle, { "text-anchor": "end", "font-size": 10, fill: "#707070" });
  }

  /* ---------- horizontal bars ---------- */
  function hbars(svg, cfg) {
    var rows = cfg.rows || [];
    var W = cfg.width || 900;
    var rowH = cfg.rowH || 44;
    var padL = cfg.padL || 230;
    var padR = cfg.padR || 170;
    var padT = cfg.padT || 10;
    var padB = cfg.padB || 10;
    var H = padT + rows.length * rowH + padB;
    var max = cfg.max || Math.max.apply(null, rows.map(function (r) { return r.value || 0; })) || 1;
    var plotW = W - padL - padR;
    var color = cfg.color || "#97242B";

    base(svg, W, H);

    rows.forEach(function (r, i) {
      var y = padT + i * rowH;
      addText(svg, padL - 12, y + rowH / 2 - (r.sub ? 2 : -4), r.label, {
        "text-anchor": "end", "font-size": 10.5, fill: "#1F2328"
      });
      if (r.sub) {
        addText(svg, padL - 12, y + rowH / 2 + 13, r.sub, {
          "text-anchor": "end", "font-size": 9.5, fill: "#707070"
        });
      }

      var w = Math.max(2, ((r.value || 0) / max) * plotW);
      var rect = make("rect", {
        x: padL, y: y + 8, width: w, height: rowH - 18, rx: 4,
        fill: r.color || color, opacity: r.opacity === undefined ? 0.82 : r.opacity
      });
      var title = make("title");
      title.textContent = r.label + ": " + fmt(r.value) + (cfg.unit || "");
      rect.appendChild(title);
      svg.appendChild(rect);

      addText(svg, padL + w + 10, y + rowH / 2 + 4, r.valueLabel || (fmt(r.value) + (cfg.unit || "")), {
        "font-size": 10.5, "font-weight": 600, fill: "#1F2328"
      });
    });
  }

  /* ---------- donut ---------- */
  function donut(svg, cfg) {
    var rows = cfg.rows || [];
    var W = cfg.width || 460;
    var H = cfg.height || 300;
    var cx = cfg.cx || 128;
    var cy = cfg.cy || Math.round(H / 2);
    var r = cfg.r || 86;
    var inner = cfg.inner || 54;
    var total = cfg.total || rows.reduce(function (a, b) { return a + (b.value || 0); }, 0);
    var palette = ["#97242B", "#1F5FBF", "#B26A00", "#2E7D4F", "#6B4FBB"];
    var angle = -Math.PI / 2;

    base(svg, W, H);

    rows.forEach(function (d, i) {
      var frac = total ? (d.value || 0) / total : 0;
      if (frac <= 0) return;
      var a2 = angle + frac * Math.PI * 2;
      var large = frac > 0.5 ? 1 : 0;
      var x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
      var x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      var xi1 = cx + inner * Math.cos(a2), yi1 = cy + inner * Math.sin(a2);
      var xi2 = cx + inner * Math.cos(angle), yi2 = cy + inner * Math.sin(angle);
      var path = make("path", {
        d: "M " + x1 + " " + y1 +
           " A " + r + " " + r + " 0 " + large + " 1 " + x2 + " " + y2 +
           " L " + xi1 + " " + yi1 +
           " A " + inner + " " + inner + " 0 " + large + " 0 " + xi2 + " " + yi2 + " Z",
        fill: d.color || palette[i % palette.length],
        opacity: 0.88
      });
      var title = make("title");
      title.textContent = d.label + ": " + fmt(d.value) + (cfg.unit || "");
      path.appendChild(title);
      svg.appendChild(path);
      angle = a2;
    });

    addText(svg, cx, cy - 2, cfg.centerValue || fmt(total), {
      "text-anchor": "middle", "font-size": 20, "font-weight": 800, fill: "#1F2328"
    });
    addText(svg, cx, cy + 16, cfg.centerLabel || "всего", {
      "text-anchor": "middle", "font-size": 10, fill: "#707070"
    });

    var lx = cx + r + 40;
    rows.forEach(function (d, i) {
      var ly = 34 + i * (cfg.legendRow || 46);
      svg.appendChild(make("rect", {
        x: lx, y: ly - 10, width: 12, height: 12, rx: 3,
        fill: d.color || palette[i % palette.length], opacity: 0.88
      }));
      addText(svg, lx + 20, ly, d.label, { "font-size": 12, fill: "#1F2328", "font-weight": 600 });
      var pct = total ? ((d.value || 0) / total) * 100 : 0;
      addText(svg, lx + 20, ly + 15,
        fmt(d.value) + " · " + pct.toLocaleString("ru-RU", { maximumFractionDigits: 1 }) + "%" + (d.note ? " · " + d.note : ""),
        { "font-size": 10, fill: "#707070" });
    });
  }

  /* ---------- grouped bars ---------- */
  function grouped(svg, cfg) {
    var labels = cfg.labels || [];
    var series = cfg.series || [];
    var W = cfg.width || 900;
    var H = cfg.height || 340;
    var padL = cfg.padL || 56;
    var padR = cfg.padR || 24;
    var padT = cfg.padT || 44;
    var padB = cfg.padB || 56;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var all = [];
    series.forEach(function (s) { (s.values || []).forEach(function (v) { all.push(v || 0); }); });
    var max = cfg.max || niceMax(Math.max.apply(null, all));
    var n = Math.max(labels.length, 1);
    var step = plotW / n;
    var groupW = step * 0.72;
    var barW = groupW / Math.max(series.length, 1);

    base(svg, W, H);
    gridY(svg, { W: W, padL: padL, padR: padR, padT: padT, plotH: plotH, ticks: cfg.ticks || 5, max: max, unit: cfg.unit || "" });

    labels.forEach(function (lab, i) {
      var gx = padL + step * i + (step - groupW) / 2;
      series.forEach(function (s, j) {
        var v = (s.values || [])[i] || 0;
        var h = (v / max) * plotH;
        var x = gx + j * barW;
        var y = padT + plotH - h;
        var rect = make("rect", {
          x: x + 1, y: y, width: Math.max(barW - 2, 2), height: Math.max(h, v ? 2 : 0),
          rx: 3, fill: s.color, opacity: 0.85
        });
        var title = make("title");
        title.textContent = lab + " · " + s.name + ": " + fmt(v);
        rect.appendChild(title);
        svg.appendChild(rect);
      });
      addText(svg, padL + step * i + step / 2, H - padB + 20, lab, {
        "text-anchor": "middle", "font-size": 10, fill: "#707070"
      });
    });

    var lx = padL;
    series.forEach(function (s) {
      svg.appendChild(make("rect", { x: lx, y: padT - 26, width: 10, height: 10, rx: 2, fill: s.color }));
      addText(svg, lx + 15, padT - 17, s.name, { "font-size": 10.5, fill: "#707070" });
      lx += 24 + s.name.length * 6.1;
    });
  }

  /* ---------- line ---------- */
  function line(svg, cfg) {
    var labels = cfg.labels || [];
    var values = cfg.values || [];
    var W = cfg.width || 900;
    var H = cfg.height || 320;
    var padL = cfg.padL || 56;
    var padR = cfg.padR || 28;
    var padT = cfg.padT || 30;
    var padB = cfg.padB || 56;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var vals = values.filter(function (v) { return v !== null && v !== undefined; });
    var min = cfg.min !== undefined ? cfg.min : Math.max(0, Math.min.apply(null, vals) - 2);
    var max = cfg.max !== undefined ? cfg.max : Math.max.apply(null, vals) + 2;
    var invert = !!cfg.invert;
    var ticks = cfg.ticks || 5;

    function yFor(v) {
      var t = (v - min) / (max - min || 1);
      return padT + (invert ? t : 1 - t) * plotH;
    }

    base(svg, W, H);

    for (var i = 0; i <= ticks; i++) {
      var y = padT + (plotH / ticks) * i;
      svg.appendChild(make("line", { x1: padL, y1: y, x2: W - padR, y2: y, stroke: "#ececec", "stroke-width": 1 }));
      var val = invert ? min + (max - min) * (i / ticks) : max - (max - min) * (i / ticks);
      addText(svg, padL - 8, y + 4, fmt(Math.round(val)), { "text-anchor": "end", "font-size": 10, fill: "#707070" });
    }

    var n = labels.length;
    var step = plotW / Math.max(n - 1, 1);
    var d = "";
    values.forEach(function (v, idx) {
      if (v === null || v === undefined) return;
      var x = padL + step * idx;
      var yy = yFor(v);
      d += (d ? " L " : "M ") + x + " " + yy;
    });
    svg.appendChild(make("path", {
      d: d, fill: "none", stroke: cfg.color || "#97242B",
      "stroke-width": 2.5, "stroke-linejoin": "round", "stroke-linecap": "round"
    }));

    values.forEach(function (v, idx) {
      if (v === null || v === undefined) return;
      var x = padL + step * idx;
      var yy = yFor(v);
      var c = make("circle", { cx: x, cy: yy, r: 4, fill: cfg.color || "#97242B" });
      var title = make("title");
      title.textContent = labels[idx] + ": " + fmt(v);
      c.appendChild(title);
      svg.appendChild(c);
      if (cfg.valueLabels) {
        addText(svg, x, yy - 10, fmt(v), { "text-anchor": "middle", "font-size": 10, "font-weight": 700, fill: "#1F2328" });
      }
    });

    labels.forEach(function (lab, idx) {
      addText(svg, padL + step * idx, H - padB + 20, lab, { "text-anchor": "middle", "font-size": 10, fill: "#707070" });
    });

    if (cfg.yTitle) addText(svg, padL - 8, padT - 14, cfg.yTitle, { "text-anchor": "end", "font-size": 10, fill: "#707070" });
  }

  window.GIKOM = {
    fmt: fmt,
    niceMax: niceMax,
    bars: bars,
    hbars: hbars,
    donut: donut,
    grouped: grouped,
    line: line
  };
})();

// calculator.js — economic effect calculator
(function () {
  "use strict";

  const form = document.getElementById("calc-form");
  if (!form) return;

  const fields = ["pickers", "hourly", "hours", "time", "orders", "errors", "gain"];
  const $ = (id) => document.getElementById(id);

  function num(id) { return parseFloat($(id).value) || 0; }

  function fmt(n) {
    if (!isFinite(n)) return "—";
    return Math.round(n).toLocaleString("ru-RU");
  }

  function calc() {
    const pickers = num("calc-pickers");
    const hourly = num("calc-hourly");
    const hours = num("calc-hours");
    const time = num("calc-time"); // minutes per order
    const orders = num("calc-orders");
    const errors = num("calc-errors");
    const gain = num("calc-gain"); // percent

    const totalMinutes = orders * time;
    const totalHours = totalMinutes / 60;
    const laborCost = totalHours * hourly;
    const currentPickersCost = pickers * hourly * hours;

    const savedHours = totalHours * (gain / 100);
    const savedLabor = savedHours * hourly;
    const potentialMonthly = savedLabor;

    const setText = (id, v) => { const e = $(id); if (e) e.textContent = v; };

    setText("res-current-labor", fmt(laborCost) + " ₽");
    setText("res-current-pickers", fmt(currentPickersCost) + " ₽");
    setText("res-saved-hours", fmt(savedHours) + " ч");
    setText("res-potential", fmt(potentialMonthly) + " ₽/мес");
    setText("res-errors", fmt(errors) + " ₽/мес");
  }

  fields.forEach((f) => {
    const el = $("calc-" + f);
    if (el) el.addEventListener("input", calc);
  });

  calc();

  const cta = document.getElementById("calc-cta");
  if (cta) cta.addEventListener("click", () => {
    if (window.GIKOM && window.GIKOM.track) window.GIKOM.track("calc_cta");
    const target = document.getElementById("contact");
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
})();

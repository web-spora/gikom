// picking-demo.js — interactive order picking demo
(function () {
  "use strict";

  const rack = document.getElementById("demo-rack");
  const status = document.getElementById("demo-status");
  const progress = document.getElementById("demo-progress");
  const stepBtn = document.getElementById("demo-next");
  const resetBtn = document.getElementById("demo-reset");

  if (!rack) return;

  // Demo data (explicitly marked as demonstration)
  const order = [
    { cell: "B-03", qty: 3, label: "A-104" },
    { cell: "D-05", qty: 2, label: "A-211" },
    { cell: "A-02", qty: 5, label: "B-055" },
    { cell: "C-05", qty: 1, label: "C-012" },
  ];

  const cells = Array.from(rack.querySelectorAll(".demo__cell"));
  const cellMap = {};
  cells.forEach((c) => { cellMap[c.dataset.cell] = c; });

  let idx = 0;
  let state = "idle"; // idle | active | done

  function setTask(item) {
    const el = (id) => document.getElementById(id);
    if (el("demo-order")) el("demo-order").textContent = "Заказ № 1048";
    if (el("demo-item")) el("demo-item").textContent = item.label;
    if (el("demo-cell")) el("demo-cell").textContent = item.cell;
    if (el("demo-qty")) el("demo-qty").textContent = item.qty + " шт.";
    if (el("demo-status-val")) el("demo-status-val").textContent = "Ожидает выполнения";
  }

  function clearActive() {
    cells.forEach((c) => c.classList.remove("is-active"));
  }

  function start() {
    idx = 0;
    cells.forEach((c) => c.classList.remove("is-active", "is-done"));
    if (progress) progress.style.width = "0%";
    if (status) status.textContent = "Получено задание. Нажмите «Следующий шаг».";
    setTask(order[0]);
    state = "active";
  }

  function next() {
    if (state !== "active") { start(); return; }
    const item = order[idx];
    const cell = cellMap[item.cell];
    if (cell) {
      cell.classList.remove("is-active");
      cell.classList.add("is-done");
    }
    idx++;
    if (idx >= order.length) {
      if (status) status.textContent = "Задание выполнено. Система готова направить сотрудника к следующей позиции.";
      if (progress) progress.style.width = "100%";
      const sv = document.getElementById("demo-status-val");
      if (sv) sv.textContent = "Выполнено";
      state = "done";
      return;
    }
    const nextItem = order[idx];
    const nextCell = cellMap[nextItem.cell];
    if (nextCell) nextCell.classList.add("is-active");
    setTask(nextItem);
    if (status) status.textContent = "Подсвечена ячейка " + nextItem.cell + ". Отберите товар и подтвердите.";
    if (progress) progress.style.width = (idx / order.length * 100) + "%";
  }

  if (stepBtn) stepBtn.addEventListener("click", next);
  if (resetBtn) resetBtn.addEventListener("click", start);

  // Auto-init
  start();
  const firstCell = cellMap[order[0].cell];
  if (firstCell) firstCell.classList.add("is-active");

  // Track
  if (stepBtn) stepBtn.addEventListener("click", () => {
    if (window.GIKOM && window.GIKOM.track) window.GIKOM.track("demo_step", { idx });
  });
})();

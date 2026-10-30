// scenarios.js — scenario switcher
(function () {
  "use strict";

  const tabs = document.querySelectorAll(".scenario-tab");
  const panel = document.getElementById("scenario-panel");
  if (!tabs.length || !panel) return;

  const data = {
    dist: {
      title: "Дистрибуция",
      text: "Большое количество товарных позиций, разнообразные заказы, необходимость быстро находить товары.",
      img: "assets/images/scenarios.png",
      effects: [
        "Сокращение времени поиска позиций при большом ассортименте",
        "Стандартизация комплектации при разнообразных заказах",
        "Потенциал снижения ошибок отбора",
      ],
    },
    prod: {
      title: "Производство",
      text: "Комплектация материалов и компонентов по заданным позициям и внутренние потребности участков.",
      img: "assets/images/Индустриальный склад с многоуровневыми стеллажами-2.png",
      effects: [
        "Точная комплектация по позициям для производственных участков",
        "Сокращение времени на поиск компонентов",
        "Потенциал снижения простоев из-за недокомплекта",
      ],
    },
    ecom: {
      title: "E-commerce",
      text: "Сборка большого количества заказов с разным составом в зоне комплектации.",
      img: "assets/images/Автоматизированный склад_ выбор заказа.png",
      effects: [
        "Последовательный отбор при большом числе заказов",
        "Сокращение лишних перемещений по зоне комплектации",
        "Потенциал роста числа строк заказа на сотрудника",
      ],
    },
    turnover: {
      title: "Склад с высокой текучестью",
      text: "Необходимость упростить обучение и стандартизировать выполнение операций.",
      img: "assets/images/Интуитивная сборка заказов на складе.png",
      effects: [
        "Более быстрый выход нового сотрудника на норматив",
        "Стандартизированный процесс вместо зависимости от опыта",
        "Потенциал снижения времени адаптации",
      ],
    },
  };

  function render(key) {
    const d = data[key];
    if (!d) return;
    panel.innerHTML = `
      <div>
        <h3 class="scenario-panel__title">${d.title}</h3>
        <p class="scenario-panel__text">${d.text}</p>
        <ul class="scenario-panel__effects">
          ${d.effects.map((e) => "<li>" + e + "</li>").join("")}
        </ul>
      </div>
      <div>
        <img src="${d.img}" alt="${d.title}" loading="lazy">
      </div>
    `;
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      render(tab.dataset.scenario);
      if (window.GIKOM && window.GIKOM.track) window.GIKOM.track("scenario_switch", { id: tab.dataset.scenario });
    });
  });

  // initial
  const first = document.querySelector(".scenario-tab.is-active") || tabs[0];
  if (first) { first.classList.add("is-active"); render(first.dataset.scenario); }
})();

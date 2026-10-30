// forms.js — lead form validation and submission
(function () {
  "use strict";
  const form = document.getElementById("lead-form");
  if (!form) return;
  const success = document.getElementById("form-success");

  function validate() {
    let ok = true;
    form.querySelectorAll("[required]").forEach((f) => {
      const wrap = f.closest(".form__field");
      if (!f.value.trim()) {
        ok = false;
        if (wrap) wrap.classList.add("is-error");
      } else {
        if (wrap) wrap.classList.remove("is-error");
      }
    });
    const contact = form.querySelector('input[name="contact"]');
    const email = contact && contact.value.includes("@") ? contact : null;
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      ok = false;
      const wrap = email.closest(".form__field");
      if (wrap) wrap.classList.add("is-error");
    }
    return ok;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Demo submission: in production, send to backend / CRM
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = "Отправка..."; }
    setTimeout(() => {
      if (success) success.classList.add("is-visible");
      form.reset();
      if (btn) { btn.disabled = false; btn.textContent = "Получить консультацию и расчёт"; }
      if (window.GIKOM && window.GIKOM.track) window.GIKOM.track("form_submit");
    }, 700);
  });

  form.querySelectorAll("input, textarea").forEach((f) => {
    f.addEventListener("input", () => {
      const wrap = f.closest(".form__field");
      if (wrap) wrap.classList.remove("is-error");
    });
  });
})();

/*
 * GAWDY95 behaviour (optional). No dependencies.
 *
 *   data-g95-drag                 on .g95-window: drag by titlebar
 *   data-g95-act="min|max|close"  on titlebar buttons
 *   data-g95-toggle="#id"         toggle [hidden] on target (start menu, modals)
 *   data-g95-open="#id"           show target
 *   data-g95-close="#id"          hide target (omit value to close nearest .g95-modal)
 *   .g95-tabs > [role=tab][aria-controls]   tab switching
 *   [data-g95-clock]              live HH:MM clock
 *   [data-g95-count]              counter digits, e.g. data-g95-count="001337"
 */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  let z = 100;

  const focusWindow = (win) => {
    $$(".g95-window").forEach((w) => w.classList.toggle("is-inactive", w !== win));
    win.style.zIndex = ++z;
  };

  document.addEventListener("pointerdown", (e) => {
    const win = e.target.closest(".g95-window");
    if (win) focusWindow(win);

    const menu = $(".g95-menu:not([hidden])");
    if (menu && !e.target.closest(".g95-start")) menu.hidden = true;

    const bar = e.target.closest(".g95-titlebar");
    if (!bar || e.target.closest("button") || !win || !win.hasAttribute("data-g95-drag") || win.classList.contains("is-max")) return;
    const parent = win.offsetParent || document.body;
    const pr = parent.getBoundingClientRect();
    const r = win.getBoundingClientRect();
    const dx = e.clientX - r.left, dy = e.clientY - r.top;
    const move = (ev) => {
      win.style.left = `${ev.clientX - dx - pr.left}px`;
      win.style.top = `${ev.clientY - dy - pr.top}px`;
    };
    const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); };
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    e.preventDefault();
  });

  document.addEventListener("click", (e) => {
    const act = e.target.closest("[data-g95-act]");
    if (act) {
      const win = act.closest(".g95-window");
      const kind = act.dataset.g95Act;
      if (kind === "close") win.classList.add("is-closed");
      if (kind === "min") win.classList.toggle("is-min");
      if (kind === "max") win.classList.toggle("is-max");
      return;
    }
    const toggle = e.target.closest("[data-g95-toggle]");
    if (toggle) { const t = $(toggle.dataset.g95Toggle); if (t) t.hidden = !t.hidden; return; }
    const open = e.target.closest("[data-g95-open]");
    if (open) { const t = $(open.dataset.g95Open); if (t) { t.hidden = false; t.classList.remove("is-closed"); } return; }
    const close = e.target.closest("[data-g95-close]");
    if (close) {
      const t = close.dataset.g95Close ? $(close.dataset.g95Close) : close.closest(".g95-modal");
      if (t) t.hidden = true;
      return;
    }
    const tab = e.target.closest('.g95-tabs [role="tab"]');
    if (tab) {
      $$('[role="tab"]', tab.parentElement).forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", on);
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      return;
    }
    const li = e.target.closest(".g95-list > li");
    if (li) $$(":scope > li", li.parentElement).forEach((x) => x.classList.toggle("is-selected", x === li));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") $$(".g95-modal:not([hidden])").forEach((m) => (m.hidden = true));
  });

  const tick = () => {
    const t = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    $$("[data-g95-clock]").forEach((el) => (el.textContent = t));
  };
  tick();
  setInterval(tick, 15000);

  $$("[data-g95-count]").forEach((el) => {
    el.classList.add("g95-counter");
    el.replaceChildren(...[...el.dataset.g95Count].map((d) => Object.assign(document.createElement("b"), { textContent: d })));
  });
})();

/* ============================================================
   STATO CONDIVISO + NAVIGAZIONE TRA LE SCHERMATE (hash routing)
   ============================================================ */
(function () {
  const W = (window.Wondy = window.Wondy || {});
  const KEY = "wondy-state-v1";
  const blank = { mode: "privato", selection: [], pacchetto: "", formati: [], option48h: false };
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) {}
  W.store = Object.assign({}, blank, saved || {});

  W.save = function () {
    try { sessionStorage.setItem(KEY, JSON.stringify(W.store)); } catch (e) {}
    document.dispatchEvent(new CustomEvent("wondy:change"));
  };
  W.reset = function () { W.store = Object.assign({}, blank, { mode: W.store.mode }); W.save(); };
  W.setMode = function (mode) {
    if (W.store.mode === mode) return;
    W.store.mode = mode;
    W.save();
  };
  W.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
})();

document.addEventListener("DOMContentLoaded", function () {
  const W = window.Wondy;
  const C = window.CONFIG;
  const views = [...document.querySelectorAll("[data-view]")];
  const baseTitle = "Wondy · Thomas Lucaccini";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- router ---------- */
  function parseHash() {
    const raw = location.hash.replace(/^#/, "");
    const [name, query] = raw.split("?");
    return { name: name || "home", params: new URLSearchParams(query || "") };
  }
  let current = null;
  function show() {
    const { name, params } = parseHash();
    const target = views.find((v) => v.dataset.view === name) || views.find((v) => v.dataset.view === "home");
    if (params.get("tipo") === "azienda" || params.get("tipo") === "privato") W.setMode(params.get("tipo"));
    const pac = ["Surprise", "Fantasy", "Wondy"].find((x) => x.toLowerCase() === (params.get("pacchetto") || "").toLowerCase());
    if (pac) { W.store.pacchetto = pac; W.setMode("privato"); W.save(); }
    /* i parametri si applicano una volta sola: tornando indietro non riscrivono le scelte */
    if ([...params.keys()].length) history.replaceState(history.state, "", "#" + target.dataset.view);
    views.forEach((v) => { v.hidden = v !== target; });
    document.body.dataset.current = target.dataset.view;
    document.title = target.dataset.title ? `${target.dataset.title} · ${baseTitle}` : baseTitle;
    document.querySelectorAll("[data-nav-link]").forEach((a) => { if (a.dataset.navLink === target.dataset.view) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    if (current !== null) {
      const back = document.documentElement.dataset.nav === "back";
      window.scrollTo(0, back && history.state && history.state.y ? history.state.y : 0);
      const h = target.querySelector("h1, h2");
      if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
      if (!reduce.matches && !document.startViewTransition) { target.classList.remove("is-entering"); void target.offsetWidth; target.classList.add("is-entering"); }
    }
    current = target.dataset.view;
    document.dispatchEvent(new CustomEvent("wondy:view", { detail: current }));
  }
  /* il link toccato "diventa" il titolo della schermata successiva (View Transitions) */
  let lastLink = null;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  /* prima di cambiare schermata ricorda dov'eri, per ritrovarlo con "Indietro" */
  document.addEventListener("click", (e) => {
    if (e.target.closest('a[href^="#"]:not([data-focus])')) history.replaceState(Object.assign({}, history.state, { y: scrollY }), "");
  }, true);
  const deskbar = document.querySelector(".deskbar");
  if (deskbar) addEventListener("scroll", () => deskbar.classList.toggle("is-scrolled", scrollY > 40), { passive: true });
  document.addEventListener("click", (e) => { lastLink = e.target.closest('a[href^="#"]:not([data-focus])'); }, true);
  window.addEventListener("hashchange", () => {
    const back = !lastLink || lastLink.matches("[data-back]");
    document.documentElement.dataset.nav = back ? "back" : "fwd";
    if (!document.startViewTransition || reduce.matches) { show(); lastLink = null; return; }
    const link = lastLink && !back && lastLink.closest(".ticket, .card-link") ? lastLink : null;
    if (link) link.style.viewTransitionName = "hero-link";
    const vt = document.startViewTransition(() => {
      if (link) link.style.viewTransitionName = "";
      show();
      if (link) { const h = document.querySelector("[data-view]:not([hidden]) .view__head h2"); if (h) h.style.viewTransitionName = "hero-link"; }
    });
    vt.finished.finally(() => { document.querySelectorAll(".view__head h2").forEach((h) => { h.style.viewTransitionName = ""; }); });
    lastLink = null;
  });

  /* "Indietro": conta quante schermate del sito ci sono nella cronologia.
     Se non ce ne sono (es. arrivo diretto da Instagram) va alla home invece di uscire dal sito. */
  let depth = 0;
  history.replaceState({ depth: 0 }, "");
  window.addEventListener("hashchange", () => {
    if (history.state && typeof history.state.depth === "number") depth = history.state.depth;
    else { depth += 1; history.replaceState(Object.assign({}, history.state, { depth }), ""); }
  });
  document.addEventListener("click", (e) => {
    const back = e.target.closest("[data-back]");
    if (!back) return;
    e.preventDefault();
    if (depth > 0) history.back(); else location.hash = "#home";
  });

  /* ---------- selettore Festa privata / Azienda (ce ne sono più di uno, restano sincronizzati) ---------- */
  function syncMode() {
    document.querySelectorAll("[data-mode-switch]").forEach((sw) => {
      sw.querySelectorAll("[data-mode]").forEach((b) => {
        const on = b.dataset.mode === W.store.mode;
        b.setAttribute("aria-pressed", on);
        b.classList.toggle("is-on", on);
      });
    });
    document.body.dataset.mode = W.store.mode;
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-mode-switch] [data-mode]");
    if (b) W.setMode(b.dataset.mode);
  });
  document.addEventListener("wondy:change", syncMode);

  /* ---------- pulsanti che portano dati con sé (pacchetti, formati aziendali) ---------- */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-pick-pacchetto]");
    if (a) { W.store.pacchetto = a.dataset.pickPacchetto; W.setMode("privato"); W.save(); }
    const f = e.target.closest("[data-pick-azienda]");
    if (f) { W.setMode("azienda"); }
  });

  /* ---------- contatti da CONFIG ---------- */
  const ig = C.contacts.instagram;
  document.querySelectorAll("[data-instagram]").forEach((a) => { a.href = "https://www.instagram.com/" + ig + "/"; });
  document.querySelectorAll("[data-instagram-handle]").forEach((s) => { s.textContent = "@" + ig; });
  const wa = (C.contacts.whatsapp || "").replace(/\D/g, "");
  document.querySelectorAll("[data-whatsapp]").forEach((a) => {
    if (wa) {
      a.href = "https://wa.me/" + wa + "?text=" + encodeURIComponent("Ciao Wondy! Vorrei informazioni per un evento.");
      a.removeAttribute("aria-disabled");
      a.querySelector("[data-soon]")?.remove();
    } else {
      a.removeAttribute("href");
      a.setAttribute("aria-disabled", "true");
    }
  });
  document.querySelectorAll("[data-email]").forEach((a) => {
    if (C.contacts.email) a.href = "mailto:" + C.contacts.email; else a.closest("[data-optional]")?.remove() || a.remove();
  });
  [["tiktok", (v) => "https://www.tiktok.com/@" + v], ["youtube", (v) => v], ["facebook", (v) => v]].forEach(([k, url]) => {
    document.querySelectorAll(`[data-${k}]`).forEach((a) => { if (C.contacts[k]) a.href = url(C.contacts[k]); else a.remove(); });
  });
  document.querySelectorAll("[data-techsheet]").forEach((a) => {
    if (C.techSheetUrl) { a.href = C.techSheetUrl; a.setAttribute("download", ""); }
    else { a.href = "#richiesta?tipo=azienda"; a.querySelector("small").textContent = "Inviata insieme al preventivo"; }
  });

  /* ---------- logo: se l'immagine manca, mostra la scritta ---------- */
  document.querySelectorAll("img[data-logo]").forEach((img) => {
    const fail = () => img.closest(".logo").classList.add("logo--text");
    if (img.complete && !img.naturalWidth) fail();
    img.addEventListener("error", fail);
  });

  document.getElementById("year").textContent = new Date().getFullYear();
  syncMode();
  show();
  requestAnimationFrame(() => document.body.classList.add("is-ready"));
});

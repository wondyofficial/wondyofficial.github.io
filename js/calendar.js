/* ============================================================
   CALENDARIO DISPONIBILITÀ — prenotazioni a GIORNATA INTERA
   - legge il "libero/occupato" da Google Calendar (API freeBusy)
   - un giorno con almeno un impegno è OCCUPATO
   - modalità DEMO se il calendario non è configurato
   ============================================================ */
(function () {
  const C = window.CONFIG;
  const W = window.Wondy;
  const TZ = C.timeZone;
  const pad = (n) => String(n).padStart(2, "0");
  const MESI = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
  const GIORNI = ["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"];
  const STATI = { libero: "libero", occupato: "occupato", chiuso: "non prenotabile", verifica: "da confermare" };
  const SELECTABLE = ["libero", "verifica"];

  /* ---------- date e fuso orario (Europe/Rome, ora legale inclusa) ---------- */
  /* "longOffset" non esiste su iOS < 15.4: in quel caso l'offset si ricava confrontando l'ora locale con UTC */
  let offFmt = null;
  try { offFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "longOffset" }); } catch (e) {}
  const partsFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" });
  function offsetMin(ms) {
    if (!offFmt) {
      const p = {};
      partsFmt.formatToParts(new Date(ms)).forEach((x) => { p[x.type] = x.value; });
      const local = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
      return Math.round((local - Math.floor(ms / 60000) * 60000) / 60000);
    }
    const v = offFmt.formatToParts(new Date(ms)).find((p) => p.type === "timeZoneName").value;
    const m = v.match(/([+-])(\d{2}):?(\d{2})?/);
    return m ? (m[1] === "-" ? -1 : 1) * (+m[2] * 60 + +(m[3] || 0)) : 0;
  }
  /* mezzanotte (ora di Roma) del giorno indicato, in millisecondi UTC */
  function midnightUtc(y, mo, d) {
    const guess = Date.UTC(y, mo - 1, d);
    const t = guess - offsetMin(guess) * 60000;
    return guess - offsetMin(t) * 60000;
  }
  function todayRome() {
    const p = {};
    partsFmt.formatToParts(new Date()).forEach((x) => { p[x.type] = x.value; });
    return { y: +p.year, m: +p.month, d: +p.day };
  }
  const keyOf = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
  function parseKey(k) { const [y, m, d] = k.split("-").map(Number); return { y, m, d }; }
  function addDays(p, n) {
    const t = new Date(Date.UTC(p.y, p.m - 1, p.d + n));
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
  }
  const weekday = (p) => new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay();
  const daysIn = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

  W.dateLabel = function (k, short) {
    const p = parseKey(k);
    const g = GIORNI[weekday(p)];
    return short ? `${g.slice(0, 3)} ${p.d} ${MESI[p.m - 1].slice(0, 3)}` : `${g} ${p.d} ${MESI[p.m - 1]}`;
  };

  /* ---------- intervallo consultabile ---------- */
  const today = todayRome();
  const months = [];
  for (let i = 0; i < C.monthsAhead; i++) {
    const t = new Date(Date.UTC(today.y, today.m - 1 + i, 1));
    months.push({ y: t.getUTCFullYear(), m: t.getUTCMonth() + 1 });
  }
  const fb = addDays(today, C.minLeadDays);
  const firstBookableKey = keyOf(fb.y, fb.m, fb.d);
  const lastMonth = months[months.length - 1];
  W.calendarInfo = { firstBookableKey, lastKey: keyOf(lastMonth.y, lastMonth.m, daysIn(lastMonth.y, lastMonth.m)) };

  /* ---------- sorgente dati ---------- */
  const notConfigured = !C.calendarId || !C.apiKey;

  async function fetchMonthBusy(mo, signal) {
    const nx = new Date(Date.UTC(mo.y, mo.m, 1));
    const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy?key=" + encodeURIComponent(C.apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timeMin: new Date(midnightUtc(mo.y, mo.m, 1)).toISOString(),
        timeMax: new Date(midnightUtc(nx.getUTCFullYear(), nx.getUTCMonth() + 1, 1)).toISOString(),
        timeZone: TZ,
        items: [{ id: C.calendarId }]
      }),
      signal
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const j = await res.json();
    const cal = j.calendars && j.calendars[C.calendarId];
    if (!cal || (cal.errors && cal.errors.length)) throw new Error("calendario non accessibile");
    return cal.busy.map((b) => [Date.parse(b.start), Date.parse(b.end)]);
  }

  /* Demo: giornate occupate plausibili, più frequenti nel weekend, sempre uguali per lo stesso giorno */
  function demoBusy() {
    const busy = [];
    months.forEach((mo) => {
      for (let d = 1; d <= daysIn(mo.y, mo.m); d++) {
        let seed = mo.y * 10000 + mo.m * 100 + d;
        const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
        rnd(); rnd();
        const wd = weekday({ y: mo.y, m: mo.m, d });
        if (rnd() < (wd === 6 ? 0.5 : wd === 0 ? 0.45 : 0.12)) {
          const s = midnightUtc(mo.y, mo.m, d) + 15 * 3600000;
          busy.push([s, s + 3 * 3600000]);
        }
      }
    });
    return busy;
  }

  async function loadBusy() {
    if (notConfigured) return C.demoMode === false ? { busy: [], source: "offline" } : { busy: demoBusy(), source: "demo" };
    const cacheKey = "wondy-busy-" + C.calendarId + "-" + keyOf(today.y, today.m, today.d);
    try {
      const c = JSON.parse(sessionStorage.getItem(cacheKey) || "null");
      if (c && Date.now() - c.t < 15 * 60000) return { busy: c.busy, source: "google" };
    } catch (e) { /* sessionStorage non disponibile */ }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const parts = await Promise.all(months.map((mo) => fetchMonthBusy(mo, ctrl.signal)));
      const busy = parts.flat();
      try { sessionStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), busy })); } catch (e) {}
      return { busy, source: "google" };
    } finally { clearTimeout(timer); }
  }

  /* ---------- impegni → stato del giorno ---------- */
  function buildDays(busy, unknown) {
    const days = new Map();
    months.forEach((mo) => {
      for (let d = 1; d <= daysIn(mo.y, mo.m); d++) {
        const k = keyOf(mo.y, mo.m, d);
        if (k < firstBookableKey) { days.set(k, "chiuso"); continue; }
        if (unknown) { days.set(k, "verifica"); continue; }
        const nx = addDays({ y: mo.y, m: mo.m, d }, 1);
        const s = midnightUtc(mo.y, mo.m, d);
        const e = midnightUtc(nx.y, nx.m, nx.d);
        days.set(k, busy.some(([a, b]) => a < e && b > s) ? "occupato" : "libero");
      }
    });
    return days;
  }

  /* ============================================================
     INTERFACCIA
     ============================================================ */
  const root = document.getElementById("cal");
  if (!root) return;
  const el = {
    status: root.querySelector("[data-cal-status]"),
    title: root.querySelector("[data-cal-title]"),
    prev: root.querySelector("[data-cal-prev]"),
    next: root.querySelector("[data-cal-next]"),
    grid: root.querySelector("[data-cal-grid]"),
    bar: document.querySelector("[data-cal-bar]")
  };
  let days = null;
  let monthIdx = 0;
  const isSelected = (k) => W.store.selection.some((x) => x.date === k);

  function renderGrid() {
    const mo = months[monthIdx];
    el.title.textContent = `${MESI[mo.m - 1]} ${mo.y}`;
    el.prev.disabled = monthIdx === 0;
    el.next.disabled = monthIdx === months.length - 1;
    const lead = (weekday({ y: mo.y, m: mo.m, d: 1 }) + 6) % 7; // lunedì = 0
    let html = "";
    for (let i = 0; i < lead; i++) html += `<span class="cal-day is-empty" aria-hidden="true"></span>`;
    for (let d = 1; d <= daysIn(mo.y, mo.m); d++) {
      const k = keyOf(mo.y, mo.m, d);
      const st = days ? days.get(k) : "loading";
      const wd = weekday({ y: mo.y, m: mo.m, d });
      const can = SELECTABLE.includes(st);
      const sel = isSelected(k);
      html += `<button type="button" class="cal-day cal-day--${st}${wd === 0 || wd === 6 ? " is-weekend" : ""}${sel ? " is-selected" : ""}"
        data-day="${k}" ${can ? "" : "disabled"} aria-pressed="${sel}"
        aria-label="${W.dateLabel(k)}: ${days ? STATI[st] : "caricamento"}${sel ? ", selezionato" : ""}">
        <span class="cal-num">${d}</span>${st === "occupato" ? '<span class="cal-mark" aria-hidden="true">occupato</span>' : ""}</button>`;
    }
    el.grid.innerHTML = html;
  }

  function renderBar() {
    if (!el.bar) return;
    const n = W.store.selection.length;
    const show = n > 0;
    el.bar.hidden = !show;
    if (show) {
      el.bar.querySelector("[data-bar-count]").textContent = `${n} ${n === 1 ? "giorno selezionato" : "giorni selezionati"}`;
    }
  }

  /* dopo ogni aggiornamento il focus torna sul giorno che si stava usando (tastiera, screen reader) */
  function render() {
    const a = document.activeElement;
    const keep = a && root.contains(a) && a.dataset.day ? a.dataset.day : null;
    renderGrid(); renderBar();
    if (keep) { const n = root.querySelector(`[data-day="${keep}"]`); if (n) n.focus({ preventScroll: true }); }
  }

  el.grid.addEventListener("click", (e) => {
    const b = e.target.closest("[data-day]");
    if (!b || b.disabled) return;
    const k = b.dataset.day;
    /* un solo percorso per tutti: si toccano uno o più giorni, poi "Continua" */
    const sel = W.store.selection;
    const i = sel.findIndex((x) => x.date === k);
    if (i >= 0) sel.splice(i, 1); else sel.push({ date: k });
    sel.sort((a, b2) => a.date.localeCompare(b2.date));
    W.save();
  });
  el.prev.addEventListener("click", () => { if (monthIdx > 0) { monthIdx--; renderGrid(); } });
  el.next.addEventListener("click", () => { if (monthIdx < months.length - 1) { monthIdx++; renderGrid(); } });
  if (el.bar) {
    el.bar.querySelector("[data-bar-clear]").addEventListener("click", () => { W.store.selection = []; W.save(); });
  }
  document.addEventListener("wondy:change", render);

  function setStatus(kind, html) {
    el.status.className = "cal-status cal-status--" + kind;
    el.status.innerHTML = html;
    el.status.hidden = !html;
  }

  render();
  setStatus("loading", `<span class="spinner" aria-hidden="true"></span> Controllo la disponibilità…`);
  loadBusy()
    .then(({ busy, source }) => {
      days = buildDays(busy, source === "offline");
      if (source === "offline") setStatus("demo", "<strong>Calendario in aggiornamento.</strong> Scegli il giorno che preferisci: ti confermo la disponibilità entro 24 ore.");
      else if (source === "demo") setStatus("demo", "<strong>Disponibilità dimostrativa.</strong> Il calendario reale si collega appena viene configurato.");
      else setStatus("ok", "Disponibilità aggiornata in tempo reale. La data si conferma solo dopo la risposta di Wondy.");
    })
    .catch(() => {
      days = buildDays([], true);
      setStatus("error", "Non riesco a leggere il calendario in questo momento. Scegli comunque il giorno: la disponibilità ti viene confermata nella risposta alla richiesta.");
    })
    .finally(() => {
      /* scarta i giorni salvati in precedenza che nel frattempo non sono più disponibili */
      const before = W.store.selection.length;
      W.store.selection = W.store.selection.filter((x) => x && x.date && SELECTABLE.includes(days.get(x.date)));
      if (W.store.selection.length !== before) {
        W.save();
        el.status.insertAdjacentHTML("beforeend", "<br><strong>Attenzione:</strong> un giorno che avevi scelto non è più disponibile ed è stato tolto.");
      }
      /* apre il mese del giorno scelto, oppure del primo giorno libero */
      const target = (W.store.selection[0] && W.store.selection[0].date) || [...days].find(([k, st]) => SELECTABLE.includes(st))?.[0];
      if (target) {
        const p = parseKey(target);
        const i = months.findIndex((mo) => mo.y === p.y && mo.m === p.m);
        if (i >= 0) monthIdx = i;
      }
      render();
      /* giorni liberi a disposizione degli altri script (striscia in home, Wondy digitale) */
      W.freeDays = [...days].filter(([, st]) => st === "libero").map(([k]) => k);
      document.dispatchEvent(new CustomEvent("wondy:days"));
    });
})();

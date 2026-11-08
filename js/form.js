/* ============================================================
   MODULO DI RICHIESTA (festa privata / azienda) → Formspree
   ============================================================ */
(function () {
  const W = window.Wondy;
  const C = window.CONFIG;
  const form = document.getElementById("richiesta-form");
  if (!form) return;
  const $ = (s, r = form) => r.querySelector(s);
  const $$ = (s, r = form) => [...r.querySelectorAll(s)];
  const done = document.getElementById("richiesta-done");
  const errBox = $("[data-errors]");
  const dateBox = $("[data-dates]");
  const manual = $("[data-manual-date]");

  /* ---------- modalità: il fieldset non attivo è disabilitato (non viene validato né inviato) ---------- */
  function applyMode() {
    renderDates();
    syncPicks();
  }

  /* ---------- date scelte dal calendario ---------- */
  function renderDates() {
    const sel = W.store.selection;
    if (sel.length) {
      dateBox.innerHTML = sel.map((x, i) =>
        `<span class="chip">${W.esc(W.dateLabel(x.date))}
          <button type="button" class="chip__x" data-remove="${i}" aria-label="Rimuovi ${W.esc(W.dateLabel(x.date))}">×</button></span>`
      ).join("") + `<a class="chip chip--link" href="#calendario">+ aggiungi o cambia</a>`;
      manual.hidden = true;
      $$("input, select", manual).forEach((i) => { i.disabled = true; });
    } else {
      dateBox.innerHTML = `<a class="btn btn--ghost btn--small" href="#calendario">Scegli dal calendario →</a>`;
      manual.hidden = false;
      $$("input, select", manual).forEach((i) => { i.disabled = false; });
    }
  }
  dateBox.addEventListener("click", (e) => {
    const b = e.target.closest("[data-remove]");
    if (!b) return;
    W.store.selection.splice(+b.dataset.remove, 1);
    W.save();
  });
  const dm = $("[name=data_manuale]");
  if (W.calendarInfo) { dm.min = W.calendarInfo.firstBookableKey; }

  /* pacchetto scelto da "Pacchetti feste" */
  function syncPicks() {
    if (W.store.pacchetto) {
      const r = $$("[name=pacchetto]").find((x) => x.value === W.store.pacchetto);
      if (r) r.checked = true;
    }
    spaceWarning();
  }
  form.addEventListener("change", (e) => {
    if (e.target.name === "pacchetto") { W.store.pacchetto = e.target.value; W.save(); }
    if (e.target.getAttribute("aria-invalid") === "true") validateField(e.target);
    spaceWarning();
  });

  function spaceWarning() {
    const p = ($("[name=pacchetto]:checked") || {}).value;
    const s = ($("[name=spazio_4x5]:checked") || {}).value;
    $("[data-space-warning]").hidden = !((p === "Fantasy" || p === "Wondy") && s === "No");
  }

  /* ---------- validazione con messaggi chiari ---------- */
  function errorFor(field) {
    if (field.validity.valueMissing) return field.dataset.required || "Questo campo serve per risponderti.";
    if (field.validity.typeMismatch && field.type === "email") return "Controlla l'email: sembra incompleta.";
    if (field.validity.patternMismatch) return field.dataset.pattern || "Il formato non sembra corretto.";
    if (field.validity.rangeUnderflow || field.validity.rangeOverflow) return field.dataset.range || "Valore fuori intervallo.";
    return field.validationMessage;
  }
  function slotOf(field) {
    return field.closest(".field") || field.closest("fieldset");
  }
  function validateField(field) {
    const group = field.type === "radio" ? $$(`[name="${field.name}"]`) : [field];
    const ok = group.every((f) => f.checkValidity());
    const box = slotOf(field);
    const msg = box && box.querySelector(".field__error");
    group.forEach((f) => f.setAttribute("aria-invalid", ok ? "false" : "true"));
    if (msg) msg.textContent = ok ? "" : errorFor(group[0]);
    return ok;
  }
  function validate() {
    const bad = [];
    const seen = new Set();
    $$("input, select, textarea").forEach((f) => {
      if (f.disabled || f.closest("fieldset:disabled") || f.type === "hidden" || seen.has(f.name)) return;
      if (f.type === "radio") seen.add(f.name);
      if (!validateField(f)) bad.push(f);
    });
    if (bad.length) {
      errBox.hidden = false;
      errBox.innerHTML = `<p><strong>Manca ancora qualcosa:</strong></p><ul>${bad.map((f) => {
        const label = (slotOf(f).querySelector("legend, label") || {}).textContent || f.name;
        return `<li><a href="#${f.id}" data-focus="${f.id}">${W.esc(label.replace(/\*/g, "").trim())}</a></li>`;
      }).join("")}</ul>`;
      errBox.focus();
    } else errBox.hidden = true;
    return !bad.length;
  }
  errBox.addEventListener("click", (e) => {
    const a = e.target.closest("[data-focus]");
    if (!a) return;
    e.preventDefault();
    const f = document.getElementById(a.dataset.focus);
    f.scrollIntoView({ block: "center" });
    f.focus();
  });

  /* ---------- riepilogo leggibile (per conferma, copia, WhatsApp) ---------- */
  function datesText() {
    /* la data in numeri arriva sempre chiara a Wondy, qualunque sia la lingua del visitatore */
    const num = (k) => k.split("-").reverse().join("/");
    if (W.store.selection.length) return W.store.selection.map((x) => `${W.dateLabel(x.date)} (${num(x.date)})`).join("; ");
    return dm.value ? `${W.dateLabel(dm.value)} (${num(dm.value)}, da verificare)` : "";
  }
  function collect() {
    const fd = new FormData(form);
    fd.set("date_richieste", datesText());
    const rows = [];
    for (const [k, v] of fd.entries()) {
      if (k.startsWith("_") || k === "privacy" || k === "date_richieste" || k === "data_manuale" || !String(v).trim()) continue;
      const lab = form.querySelector(`[name="${k}"]`)?.dataset.label || k.replace(/_/g, " ");
      const prev = rows.find((r) => r[0] === lab);
      if (prev) prev[1] += ", " + v; else rows.push([lab, String(v)]);
    }
    rows.unshift(["Date richieste", fd.get("date_richieste") || "da definire"]);
    const subj = `Richiesta – ${fd.get("tipo_evento") || ""} – ${fd.get("festeggiato") || fd.get("nome") || ""} – ${fd.get("date_richieste") || ""}`;
    fd.set("_subject", subj.slice(0, 180));
    return { fd, rows };
  }
  const rowsHtml = (rows) => `<dl class="summary">${rows.map(([k, v]) => `<div><dt>${W.esc(k)}</dt><dd>${W.esc(v)}</dd></div>`).join("")}</dl>`;
  const rowsText = (rows) => "Ciao Wondy! Ecco la mia richiesta:\n" + rows.map(([k, v]) => `• ${k}: ${v}`).join("\n");

  function showDone(kind, rows, subject) {
    const wa = (C.contacts.whatsapp || "").replace(/\D/g, "");
    const text = rowsText(rows);
    const okSent = kind === "sent";
    done.innerHTML = `
      <div class="done__seal" aria-hidden="true">${okSent ? "✦" : "✎"}</div>
      <h2 tabindex="-1">${okSent ? "Richiesta ricevuta!" : "La tua richiesta è pronta"}</h2>
      <p class="lead">${okSent
        ? "Grazie! Ti rispondo al più presto con disponibilità e preventivo."
        : "Ultimo passo: mandami il riepilogo con un tocco" + (wa ? " su WhatsApp" : "") + (C.contacts.email ? " o via email" : "") + "."}</p>
      ${okSent ? `<p class="note">La data non è ancora bloccata: lo diventa quando confermiamo insieme.</p>` : ""}
      ${rowsHtml(rows)}
      <div class="stack">
        ${wa ? `<a class="btn ${okSent ? "btn--ghost" : "btn--primary"}" href="https://wa.me/${wa}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">Invia su WhatsApp</a>` : ""}
        ${!okSent && C.contacts.email ? `<a class="btn btn--ghost" href="mailto:${encodeURIComponent(C.contacts.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}">Invia via email</a>` : ""}
        ${okSent ? "" : `<button type="button" class="btn btn--link" data-copy>Copia il riepilogo</button>`}
        <a class="btn btn--ghost" href="https://ig.me/m/${encodeURIComponent(C.contacts.instagram)}" target="_blank" rel="noopener">Scrivimi su Instagram</a>
        <a class="btn btn--link" href="#home" data-new>Torna alla home</a>
      </div>`;
    form.hidden = true;
    done.hidden = false;
    done.querySelector("h2").focus();
    const copy = done.querySelector("[data-copy]");
    if (copy) copy.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(text); copy.textContent = "Copiato ✓"; }
      catch (e) {
        /* es. browser interno di Instagram: mostro il testo già selezionato */
        const ta = document.createElement("textarea");
        ta.value = text; ta.rows = 8; ta.readOnly = true; ta.className = "copy-area";
        copy.replaceWith(ta); ta.focus(); ta.select();
      }
    });
    if (okSent) { form.reset(); W.reset(); }
  }
  done.addEventListener("click", (e) => {
    if (e.target.closest("[data-new]")) { done.hidden = true; form.hidden = false; }
  });

  /* ---------- invio ---------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if ($("[name=_gotcha]").value) return; // bot
    if (!validate()) return;
    const { fd, rows } = collect();
    if (!C.formspreeEndpoint) { showDone("draft", rows, fd.get("_subject")); return; }
    const btn = $("[type=submit]");
    btn.disabled = true;
    btn.classList.add("is-loading");
    const status = $("[data-send-status]");
    status.textContent = "Invio in corso…";
    try {
      const res = await fetch(C.formspreeEndpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j.errors || []).map((x) => x.message).join(" ") || res.status);
      }
      status.textContent = "";
      showDone("sent", rows, fd.get("_subject"));
    } catch (err) {
      status.textContent = "Invio non riuscito. Controlla la connessione e riprova, oppure scrivimi su Instagram.";
    } finally {
      btn.disabled = false;
      btn.classList.remove("is-loading");
    }
  });

  /* ricorda i campi già scritti durante la sessione (se il browser ricarica la pagina non si perde nulla) */
  const DRAFT = "wondy-form-draft";
  try {
    const d = JSON.parse(sessionStorage.getItem(DRAFT) || "{}");
    Object.entries(d).forEach(([k, v]) => {
      $$(`[name="${k}"]`).forEach((f) => {
        if (f.type === "radio" || f.type === "checkbox") f.checked = [].concat(v).includes(f.value);
        else if (f.type !== "hidden") f.value = v;
      });
    });
  } catch (e) {}
  form.addEventListener("input", () => {
    const d = {};
    for (const [k, v] of new FormData(form).entries()) { if (k.startsWith("_") || k === "privacy") continue; d[k] = d[k] ? [].concat(d[k], v) : v; }
    try { sessionStorage.setItem(DRAFT, JSON.stringify(d)); } catch (e) {}
  });
  form.addEventListener("reset", () => { try { sessionStorage.removeItem(DRAFT); } catch (e) {} });

  document.addEventListener("wondy:change", applyMode);
  document.addEventListener("wondy:view", (e) => {
    if (e.detail !== "richiesta") return;
    if (!done.hidden && W.store.selection.length) { done.hidden = true; form.hidden = false; }
    applyMode();
  });
  applyMode();
})();

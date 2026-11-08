/* ============================================================
   WONDY · I minigiochi del circo
   - "Acchiappa il naso", "Giocoleria", "Memory del circo"
   - JavaScript vanilla, nessuna libreria, nessuna risorsa esterna
   - I giochi si mettono in pausa quando la schermata non è "giochi"
     o la pagina non è visibile: nessun ciclo gira se non si gioca.
   - Record salvati solo sul telefono (localStorage, chiavi "wondy-game-…").
   ============================================================ */
(() => {
  "use strict";

  const root = document.querySelector('[data-view="giochi"]');
  const app = root && root.querySelector("[data-game-app]");
  if (!app) return;

  /* ---------- piccoli aiutanti ---------- */
  const $ = (sel, dentro = app) => dentro.querySelector(sel);
  const $$ = (sel, dentro = app) => [...dentro.querySelectorAll(sel)];
  const movimento = matchMedia("(prefers-reduced-motion: reduce)");
  const lento = () => movimento.matches; // true = meno animazioni, giochi più lenti
  const rnd = (a, b) => a + Math.random() * (b - a);

  function el(tag, classe, html) {
    const n = document.createElement(tag);
    if (classe) n.className = classe;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function icona(id) {
    return `<svg aria-hidden="true" focusable="false"><use href="#game-i-${id}"/></svg>`;
  }
  function mescola(lista) { // Fisher–Yates
    for (let i = lista.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
  }

  /* ---------- memoria sul telefono (solo record e preferenza audio) ---------- */
  const PREFISSO = "wondy-game-";
  const memoria = {
    get(k) { try { return localStorage.getItem(PREFISSO + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(PREFISSO + k, String(v)); } catch (e) { /* modalità privata: pazienza */ } }
  };

  /* ---------- suoni brevissimi con WebAudio ----------
     Il contesto audio nasce solo dentro un tocco dell'utente (sblocca). */
  const suono = {
    acceso: memoria.get("audio") !== "off",
    ctx: null,
    sblocca() {
      if (!this.acceso) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!this.ctx) { try { this.ctx = new AC(); } catch (e) { return; } }
      if (this.ctx.state === "suspended") this.ctx.resume();
    },
    sospendi() { if (this.ctx && this.ctx.state === "running") this.ctx.suspend(); },
    nota(freq, inizio, durata, tipo, volume, fine) {
      const c = this.ctx, t = c.currentTime + inizio;
      const o = c.createOscillator(), g = c.createGain();
      o.type = tipo || "sine";
      o.frequency.setValueAtTime(freq, t);
      if (fine) o.frequency.exponentialRampToValueAtTime(fine, t + durata);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(volume || 0.12, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + durata);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + durata + 0.03);
    },
    suona(nome, n = 0) {
      if (!this.acceso || !this.ctx || this.ctx.state !== "running") return;
      const k = Math.min(n, 30);
      switch (nome) {
        case "pop": this.nota(520 + k * 15, 0, 0.09, "sine", 0.16, 950 + k * 15); break;
        case "oro": [660, 880, 1320].forEach((f, i) => this.nota(f, i * 0.06, 0.13, "triangle", 0.11)); break;
        case "lancio": this.nota(320 + k * 12, 0, 0.13, "triangle", 0.14, 640 + k * 14); break;
        case "giro": this.nota(760, 0, 0.05, "sine", 0.06); break;
        case "coppia": [523, 784].forEach((f, i) => this.nota(f, i * 0.08, 0.16, "triangle", 0.12)); break;
        case "no": this.nota(330, 0, 0.16, "sine", 0.08, 250); break;
        case "caduta": this.nota(420, 0, 0.4, "sine", 0.14, 110); break;
        case "tromba": // la trombetta di Wondy: pè-pè!
          this.nota(240, 0, 0.14, "sawtooth", 0.05, 225);
          this.nota(240, 0.19, 0.24, "sawtooth", 0.05, 210); break;
        case "fine": [523, 659, 784, 1047].forEach((f, i) => this.nota(f, i * 0.1, 0.2, "triangle", 0.1)); break;
      }
    }
  };

  /* ---------- elementi della schermata ---------- */
  const menu = $("[data-game-menu]");
  const stage = $("[data-game-stage]");
  const board = $("[data-game-board]");
  const fx = $("[data-game-fx]");
  let area = $("[data-game-area]");
  const elPunti = $("[data-game-score]");
  const elPuntiNome = $("[data-game-score-label]");
  const elInfo = $("[data-game-info]");
  const pausa = $("[data-game-pause]");
  const fine = $("[data-game-end]");
  const live = $("[data-game-live]");
  const btnAudio = $("[data-game-audio]");

  /* ---------- effetti: stelline, cuori, "+1" ---------- */
  function festa(x, y, quanti = 6, simboli = ["✦", "♥", "★"]) {
    if (lento()) return; // con movimento ridotto niente effetti
    for (let i = 0; i < quanti; i++) {
      const s = el("span", "game-spark" + (i % 3 === 1 ? " game-spark--red" : ""), simboli[i % simboli.length]);
      const ang = (i / quanti) * Math.PI * 2 + rnd(-0.3, 0.3);
      const dist = rnd(36, 72);
      s.style.left = x + "px";
      s.style.top = y + "px";
      s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      s.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      s.style.setProperty("--rot", rnd(-120, 120) + "deg");
      fx.append(s);
      setTimeout(() => s.remove(), 800);
    }
  }
  function galleggia(x, y, testo) {
    if (lento()) return;
    const s = el("span", "game-float", testo);
    s.style.left = x + "px";
    s.style.top = y + "px";
    fx.append(s);
    setTimeout(() => s.remove(), 900);
  }
  /* centro di un elemento, in coordinate del tabellone */
  function centro(nodo) {
    const r = nodo.getBoundingClientRect(), b = board.getBoundingClientRect();
    return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
  }
  function annuncia(testo) {
    live.textContent = "";
    setTimeout(() => { live.textContent = testo; }, 40);
  }

  /* ---------- interfaccia comune passata a ogni gioco ---------- */
  const ctx = {
    suono, lento, festa, galleggia, centro, annuncia,
    punti(v) {
      elPunti.textContent = v;
      if (!lento()) { elPunti.classList.remove("is-bump"); void elPunti.offsetWidth; elPunti.classList.add("is-bump"); }
    },
    info(testo, urgente) {
      elInfo.textContent = testo;
      elInfo.classList.toggle("is-urgent", !!urgente);
    },
    finito(risultato) { mostraFine(risultato); }
  };

  /* ============================================================
     GIOCO 1 · ACCHIAPPA IL NASO
     Nasi rossi spuntano qua e là: toccali prima che spariscano.
     30 secondi. Il naso d'oro vale 3. Nessuna penalità se ne scappa uno.
     ============================================================ */
  function creaNaso(ctx, campo) {
    const DURATA = 30000;
    const COLONNE = 3, RIGHE = 4; // caselle in cui può spuntare un naso
    let tempo = 0, ultimo = 0, raf = 0, corre = false, chiuso = false;
    let punti = 0, prossimo = 900, nasi = [], secondi = -1;

    campo.setAttribute("aria-label", "Prato dei nasi: tocca i nasi");
    const via = el("p", "game-go", "Via!");
    campo.append(via);
    setTimeout(() => via.remove(), 900);

    function caselleLibere() {
      const prese = new Set(nasi.map((n) => n.casella));
      return [...Array(COLONNE * RIGHE).keys()].filter((i) => !prese.has(i));
    }

    function spunta() {
      const libere = caselleLibere();
      if (!libere.length) return;
      const casella = libere[Math.floor(Math.random() * libere.length)];
      const oro = tempo > 4000 && Math.random() < 0.12;
      const b = el("button", "game-nose" + (oro ? " game-nose--gold" : ""), icona(oro ? "naso-oro" : "naso"));
      b.type = "button";
      b.setAttribute("aria-label", oro ? "Naso d'oro, vale 3" : "Naso rosso");
      const col = casella % COLONNE, riga = Math.floor(casella / COLONNE);
      b.style.left = ((col + 0.5) / COLONNE) * 100 + rnd(-7, 7) + "%";
      b.style.top = ((riga + 0.5) / RIGHE) * 100 + rnd(-5, 5) + "%";
      // ogni naso resta un po' meno, man mano che passa il tempo
      const vita = (1800 - 750 * (tempo / DURATA)) * (ctx.lento() ? 1.5 : 1);
      const naso = { b, casella, oro, scade: tempo + vita, preso: false };
      b.addEventListener("pointerdown", (e) => { if (e.cancelable) e.preventDefault(); prendi(naso); });
      b.addEventListener("click", () => prendi(naso)); // tastiera
      campo.append(b);
      nasi.push(naso);
    }

    function togli(naso, classe) {
      nasi = nasi.filter((n) => n !== naso);
      naso.b.classList.add(classe);
      naso.b.disabled = true;
      setTimeout(() => naso.b.remove(), ctx.lento() ? 0 : 280);
    }

    function prendi(naso) {
      if (naso.preso || !corre) return;
      naso.preso = true;
      ctx.suono.sblocca();
      punti += naso.oro ? 3 : 1;
      ctx.punti(punti);
      const c = ctx.centro(naso.b);
      ctx.festa(c.x, c.y, naso.oro ? 10 : 6, naso.oro ? ["✦", "★"] : ["♥", "✦", "★"]);
      ctx.galleggia(c.x, c.y - 24, naso.oro ? "+3" : "+1");
      ctx.suono.suona(naso.oro ? "oro" : "pop", punti % 15);
      togli(naso, "is-hit");
      prossimo = Math.max(prossimo, tempo + 250); // un attimo di respiro prima del prossimo
    }

    function passo(t) {
      if (!corre) return;
      tempo += Math.min(60, Math.max(0, t - ultimo));
      ultimo = t;

      // quanti nasi insieme: 1 all'inizio, poi 2, poi 3
      const massimi = tempo < 8000 ? 1 : tempo < 18000 ? 2 : 3;
      if (tempo >= prossimo && nasi.length < massimi) {
        spunta();
        prossimo = tempo + (950 - 400 * (tempo / DURATA)) * (ctx.lento() ? 1.4 : 1) * rnd(0.8, 1.2);
      }
      nasi.filter((n) => tempo >= n.scade).forEach((n) => togli(n, "is-gone"));

      const resto = Math.max(0, Math.ceil((DURATA - tempo) / 1000));
      if (resto !== secondi) { secondi = resto; ctx.info("Tempo " + resto, resto <= 5); }

      if (tempo >= DURATA) { termina(); return; }
      raf = requestAnimationFrame(passo);
    }

    function termina() {
      corre = false; chiuso = true;
      nasi.slice().forEach((n) => togli(n, "is-gone"));
      ctx.finito({ punteggio: punti, chiave: "naso", migliore: "alto", unita: punti === 1 ? "naso preso" : "nasi presi" });
    }

    function parti() { corre = true; ultimo = performance.now(); raf = requestAnimationFrame(passo); }
    return {
      avvia() { ctx.punti(0); ctx.info("Tempo 30"); ctx.annuncia("Via! Tocca i nasi rossi."); parti(); },
      pausa() { corre = false; cancelAnimationFrame(raf); },
      riprendi() { if (!chiuso) parti(); },
      ferma() { corre = false; chiuso = true; cancelAnimationFrame(raf); },
      inCorso: () => corre
    };
  }

  /* ============================================================
     GIOCO 2 · GIOCOLERIA
     Tocca le palline per lanciarle in alto. Ogni lancio vale 1.
     Si finisce quando una pallina tocca terra.
     A 10 lanci arriva la seconda pallina, a 25 la terza;
     la gravità cresce piano piano.
     ============================================================ */
  function creaGiocoleria(ctx, campo) {
    const PAVIMENTO = 20; // altezza del palco in px (uguale al CSS)
    const COLORI = ["rossa", "oro", "bianca"];
    let L = 0, A = 0, R = 32; // larghezza, altezza del campo, raggio pallina
    let palline = [], lanci = 0, corre = false, chiuso = false, partito = false, raf = 0, ultimo = 0;

    campo.tabIndex = 0;
    campo.setAttribute("role", "button");
    campo.setAttribute("aria-label", "Palline: tocca una pallina, oppure premi spazio, per lanciarla");
    campo.append(el("div", "game-floor"));
    const aiuto = el("p", "game-hint", "Tocca la pallina!");
    campo.append(aiuto);

    function misura() {
      L = campo.clientWidth; A = campo.clientHeight;
      R = Math.max(28, Math.min(38, L * 0.085));
      palline.forEach((p) => {
        p.el.style.width = p.el.style.height = 2 * R + "px";
        p.x = Math.min(Math.max(p.x, R), L - R);
        disegna(p);
      });
    }
    function gravita() {
      const cresce = 1 + Math.min(0.6, lanci * 0.012); // fino a +60%
      return A * 1.0 * cresce * (ctx.lento() ? 0.6 : 1);
    }
    function disegna(p) {
      p.el.style.transform = `translate3d(${p.x - R}px, ${p.y - R}px, 0) rotate(${p.giro}deg)`;
    }
    function nuova(x, y, ferma) {
      const n = el("div", "game-ball game-ball--" + COLORI[palline.length % COLORI.length], icona("palla"));
      n.style.width = n.style.height = 2 * R + "px";
      campo.append(n);
      const p = { x, y, vx: 0, vy: 0, giro: 0, el: n, ferma, attesa: 0, dondolo: 0 };
      palline.push(p);
      disegna(p);
      return p;
    }
    function aggiungi() { // arriva una nuova pallina: resta ferma un attimo in alto e lampeggia
      const p = nuova(rnd(R * 2, L - R * 2), A * 0.16, false);
      p.attesa = ctx.lento() ? 1600 : 1100;
      p.el.classList.add("is-new");
      ctx.galleggia(p.x, p.y + R + 16, "!");
      ctx.suono.suona("tromba");
      ctx.annuncia("Attenzione, arriva un'altra pallina!");
    }
    const lanciabile = (p) => p.ferma || p.attesa > 0 || p.vy > -120; // non si "rilancia" una pallina che sta già salendo

    function lancia(p) {
      const g = gravita();
      p.vy = -Math.sqrt(2 * g * A * 0.66) * rnd(0.93, 1.04); // arriva vicino al soffitto
      p.vx = (L / 2 - p.x) * 0.5 + rnd(-70, 70);
      p.ferma = false; p.attesa = 0;
      p.el.classList.remove("is-new", "is-tap"); void p.el.offsetWidth; p.el.classList.add("is-tap");
      lanci++;
      ctx.punti(lanci);
      ctx.festa(p.x, p.y, 5);
      ctx.suono.suona("lancio", lanci);
      if (!partito) { partito = true; aiuto.remove(); }
      if (lanci % 10 === 0) ctx.galleggia(L / 2, A * 0.3, lanci + " ✦");
      if (lanci === 10 || lanci === 25) aggiungi();
    }

    function tocco(e) {
      if (!corre) return;
      if (e.cancelable) e.preventDefault();
      ctx.suono.sblocca();
      const a = campo.getBoundingClientRect();
      const x = e.clientX - a.left, y = e.clientY - a.top;
      const raggio = R + 26; // bersaglio generoso per le dita piccole
      let scelta = null, migliore = Infinity;
      palline.forEach((p) => {
        const d = (p.x - x) ** 2 + (p.y - y) ** 2;
        if (d < raggio * raggio && d < migliore && lanciabile(p)) { migliore = d; scelta = p; }
      });
      if (scelta) lancia(scelta);
    }
    function tasto(e) { // spazio o invio lanciano la pallina più bassa
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      if (!corre) return;
      const p = palline.filter(lanciabile).sort((a, b) => b.y - a.y)[0];
      if (p) lancia(p);
    }
    campo.addEventListener("pointerdown", tocco);
    campo.addEventListener("keydown", tasto);
    window.addEventListener("resize", misura);

    function passo(t) {
      if (!corre) return;
      const dt = Math.min(0.033, Math.max(0, (t - ultimo) / 1000));
      ultimo = t;
      const g = gravita(), fondo = A - PAVIMENTO;
      for (const p of palline) {
        if (p.ferma) { // la prima pallina dondola finché non la tocchi
          p.dondolo += dt;
          p.y = A * 0.4 + Math.sin(p.dondolo * 3) * (ctx.lento() ? 0 : 6);
          disegna(p);
          continue;
        }
        if (p.attesa > 0) { p.attesa -= dt * 1000; continue; }
        p.vy += g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.giro += p.vx * dt * 1.5;
        if (p.x < R) { p.x = R; p.vx = Math.abs(p.vx) * 0.8; }
        if (p.x > L - R) { p.x = L - R; p.vx = -Math.abs(p.vx) * 0.8; }
        if (p.y < R) { p.y = R; p.vy = Math.abs(p.vy) * 0.2; }
        if (p.y > fondo - R) { p.y = fondo - R; disegna(p); cade(p); return; }
        disegna(p);
      }
      raf = requestAnimationFrame(passo);
    }

    function cade(p) {
      corre = false; chiuso = true;
      p.el.classList.add("is-down");
      ctx.suono.suona("caduta");
      ctx.festa(p.x, p.y, 4, ["!", "?"]);
      setTimeout(() => {
        if (!fermato) ctx.finito({ punteggio: lanci, chiave: "giocoleria", migliore: "alto", unita: lanci === 1 ? "lancio" : "lanci" });
      }, ctx.lento() ? 300 : 850);
    }

    let fermato = false;
    function parti() { corre = true; ultimo = performance.now(); raf = requestAnimationFrame(passo); }
    return {
      avvia() {
        misura();
        nuova(L / 2, A * 0.4, true);
        ctx.punti(0); ctx.info("");
        ctx.annuncia("Tocca la pallina per lanciarla in alto.");
        parti();
      },
      pausa() { corre = false; cancelAnimationFrame(raf); },
      riprendi() { if (!chiuso) parti(); },
      ferma() {
        corre = false; chiuso = true; fermato = true;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", misura);
      },
      inCorso: () => corre
    };
  }

  /* ============================================================
     GIOCO 3 · MEMORY DEL CIRCO
     Gira due carte: se sono uguali restano scoperte.
     12 carte (6 coppie) o 16 carte (8 coppie). Si contano le mosse:
     meno mosse = più bravo.
     ============================================================ */
  const ICONE = ["naso", "girasole", "orso", "cestino", "palla", "papillon", "scarpa", "trombetta"];
  const NOMI = {
    naso: "naso rosso", girasole: "girasole", orso: "orsacchiotto", cestino: "cestino",
    palla: "pallina", papillon: "papillon", scarpa: "scarpa", trombetta: "trombetta"
  };

  function creaMemory(ctx, campo, opzioni) {
    const quante = opzioni.carte === 16 ? 16 : 12;
    const coppie = quante / 2;
    const scelte = mescola(ICONE.slice()).slice(0, coppie);
    const mazzo = mescola([...scelte, ...scelte]);
    let prima = null, blocco = false, mosse = 0, trovate = 0, timer = 0, chiuso = false;

    campo.classList.add("game-area--memory-" + quante);
    const griglia = el("div", "game-grid");
    griglia.setAttribute("role", "group");
    griglia.setAttribute("aria-label", `Memory: ${quante} carte`);

    const etichetta = (b, stato) => {
      const n = Number(b.dataset.n) + 1;
      if (stato === "coperta") b.setAttribute("aria-label", `Carta ${n}, coperta`);
      else b.setAttribute("aria-label", `Carta ${n}: ${NOMI[b.dataset.icona]}${stato === "trovata" ? ", coppia trovata" : ""}`);
    };

    mazzo.forEach((id, i) => {
      const b = el("button", "game-card",
        `<span class="game-card__inner"><span class="game-card__face game-card__back" aria-hidden="true">W</span>` +
        `<span class="game-card__face game-card__front">${icona(id)}</span></span>`);
      b.type = "button";
      b.dataset.icona = id;
      b.dataset.n = i;
      b.style.setProperty("--i", i); // ritardo dell'animazione di "distribuzione"
      etichetta(b, "coperta");
      b.addEventListener("click", () => gira(b));
      griglia.append(b);
    });
    campo.append(griglia);

    function gira(b) {
      if (blocco || chiuso || b.classList.contains("is-open")) return;
      ctx.suono.sblocca();
      ctx.suono.suona("giro");
      b.classList.add("is-open");
      etichetta(b, "aperta");
      if (!prima) { prima = b; return; }

      const a = prima;
      prima = null;
      mosse++;
      ctx.punti(mosse);

      if (a.dataset.icona === b.dataset.icona) { // coppia!
        [a, b].forEach((c) => { c.classList.add("is-match"); etichetta(c, "trovata"); });
        trovate++;
        ctx.info(`Coppie ${trovate}/${coppie}`);
        const c = ctx.centro(b);
        ctx.festa(c.x, c.y, 8);
        ctx.suono.suona("coppia");
        ctx.annuncia(`Coppia trovata: ${NOMI[b.dataset.icona]}!`);
        if (trovate === coppie) {
          chiuso = true;
          timer = setTimeout(() => ctx.finito({
            punteggio: mosse, chiave: "memory-" + quante, migliore: "basso", unita: mosse === 1 ? "mossa" : "mosse"
          }), ctx.lento() ? 400 : 800);
        }
      } else { // non sono uguali: si rigirano dopo un momento
        blocco = true;
        timer = setTimeout(() => {
          [a, b].forEach((c) => { c.classList.remove("is-open"); etichetta(c, "coperta"); });
          ctx.suono.suona("no");
          blocco = false;
        }, ctx.lento() ? 1300 : 950);
      }
    }

    return {
      avvia() {
        ctx.punti(0);
        ctx.info(`Coppie 0/${coppie}`);
        ctx.annuncia(`Memory con ${quante} carte. Trova le coppie.`);
      },
      pausa() {}, riprendi() {}, // gioco a turni: non c'è niente da fermare
      ferma() { chiuso = true; clearTimeout(timer); },
      inCorso: () => false,
      primo: () => griglia.firstElementChild
    };
  }

  /* ============================================================
     REGIA: menu, avvio, pausa, schermata finale, record
     ============================================================ */
  const GIOCHI = {
    naso: { etichetta: "Nasi", crea: creaNaso },
    palline: { etichetta: "Lanci", crea: creaGiocoleria },
    memory: { etichetta: "Mosse", crea: creaMemory }
  };
  let attivo = null; // { id, gioco, opzioni }

  const misuraMemory = () => {
    const r = $('input[name="game-memory-size"]:checked');
    return r && r.value === "16" ? 16 : 12;
  };

  function aggiornaRecord() {
    const scrivi = (dove, chiave, unita) => {
      const v = memoria.get(chiave);
      $(`[data-game-record="${dove}"]`).textContent = v === null ? "ancora nessuno" : `${v} ${unita}`;
    };
    scrivi("naso", "naso", "nasi");
    scrivi("palline", "giocoleria", "lanci");
    scrivi("memory", "memory-" + misuraMemory(), "mosse");
  }

  function avvia(id, opzioni) {
    ferma();
    suono.sblocca(); // siamo dentro un tocco: si può accendere l'audio
    const def = GIOCHI[id];
    // un'area di gioco nuova a ogni partita: niente ascoltatori rimasti appesi
    const nuova = el("div", "game-area game-area--" + id);
    nuova.setAttribute("data-game-area", "");
    area.replaceWith(nuova);
    area = nuova;
    fx.innerHTML = "";
    menu.hidden = true;
    stage.hidden = false;
    pausa.hidden = true;
    fine.hidden = true;
    board.classList.remove("is-over");
    stage.dataset.game = id;
    elPuntiNome.textContent = def.etichetta;
    attivo = { id, opzioni, gioco: def.crea(ctx, area, opzioni) };
    stage.scrollIntoView({ block: "start", behavior: lento() ? "auto" : "smooth" });
    attivo.gioco.avvia();
    const fuoco = attivo.gioco.primo ? attivo.gioco.primo() : area;
    if (!fuoco.hasAttribute("tabindex") && fuoco === area) area.tabIndex = -1;
    fuoco.focus({ preventScroll: true });
  }

  function ferma() {
    if (attivo) { attivo.gioco.ferma(); attivo = null; }
  }

  function tornaAlMenu() {
    const ultimo = attivo && attivo.id;
    ferma();
    stage.hidden = true;
    menu.hidden = false;
    aggiornaRecord();
    const b = ultimo && $(`[data-game-play="${ultimo}"]`);
    if (b) b.focus({ preventScroll: true });
  }

  function mettiInPausa() {
    if (attivo && attivo.gioco.inCorso()) {
      attivo.gioco.pausa();
      pausa.hidden = false;
      board.classList.add("is-over");
    }
    suono.sospendi();
  }

  const FRASI = {
    naso: (n) => (n >= 25 ? "Che riflessi!" : n >= 12 ? "Bravissimo!" : n > 0 ? "Bravo!" : "Riprova!"),
    palline: (n) => (n >= 30 ? "Sei un giocoliere!" : n >= 10 ? "Bravissimo!" : n > 0 ? "Bravo!" : "Ops, è caduta!"),
    memory: () => "Tutte le coppie!"
  };
  const MIMI = ["♥ ✦ !", "♪ ✿ ♥", "! ✦ ♪", "✿ ♥ ✦"];

  function mostraFine(r) {
    if (!attivo) return;
    const salvato = memoria.get(r.chiave);
    const prima = salvato === null ? null : Number(salvato);
    const nuovo = r.migliore === "basso"
      ? prima === null || r.punteggio < prima
      : r.punteggio > 0 && (prima === null || r.punteggio > prima);
    if (nuovo) memoria.set(r.chiave, r.punteggio);
    const record = nuovo ? r.punteggio : prima === null ? r.punteggio : prima;

    $("[data-game-end-title]").textContent = FRASI[attivo.id](r.punteggio);
    $("[data-game-end-score]").textContent = r.punteggio;
    $("[data-game-end-unit]").textContent = r.unita;
    $("[data-game-end-new]").hidden = !nuovo;
    $("[data-game-end-record]").textContent = nuovo ? "" : `Record: ${record}`;
    $("[data-game-end-mime]").textContent = nuovo ? "✦ ! ✦" : MIMI[Math.floor(Math.random() * MIMI.length)];

    fine.hidden = false;
    board.classList.add("is-over");
    suono.suona(nuovo ? "fine" : "tromba");
    if (nuovo) { const c = centro($("[data-game-end-score]")); festa(c.x, c.y, 12, ["✦", "♥", "★"]); }
    annuncia(`${FRASI[attivo.id](r.punteggio)} ${r.punteggio} ${r.unita}.${nuovo ? " Nuovo record!" : ""}`);
    $("[data-game-again]").focus({ preventScroll: true });
  }

  /* ---------- pulsanti ---------- */
  $$("[data-game-play]").forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.gamePlay;
    avvia(id, id === "memory" ? { carte: misuraMemory() } : {});
  }));
  $$("[data-game-exit]").forEach((b) => b.addEventListener("click", tornaAlMenu));
  $("[data-game-again]").addEventListener("click", () => { if (attivo) avvia(attivo.id, attivo.opzioni); });
  $("[data-game-resume]").addEventListener("click", () => {
    if (!attivo) return;
    suono.sblocca();
    pausa.hidden = true;
    board.classList.remove("is-over");
    attivo.gioco.riprendi();
    area.focus({ preventScroll: true });
  });
  $$('input[name="game-memory-size"]').forEach((r) => r.addEventListener("change", aggiornaRecord));

  function aggiornaAudio() {
    btnAudio.setAttribute("aria-pressed", String(suono.acceso));
    btnAudio.setAttribute("aria-label", suono.acceso ? "Suoni accesi: tocca per spegnerli" : "Suoni spenti: tocca per accenderli");
  }
  btnAudio.addEventListener("click", () => {
    suono.acceso = !suono.acceso;
    memoria.set("audio", suono.acceso ? "on" : "off");
    if (suono.acceso) { suono.sblocca(); suono.suona("pop"); } else suono.sospendi();
    aggiornaAudio();
  });

  /* ---------- pausa automatica ---------- */
  document.addEventListener("wondy:view", (e) => {
    if (e.detail === "giochi") aggiornaRecord();
    else mettiInPausa();
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) mettiInPausa(); });
  window.addEventListener("pagehide", mettiInPausa);

  aggiornaAudio();
  aggiornaRecord();
})();

/* ============================================================
   WONDY · I minigiochi del circo
   - "Acchiappa il naso", "Giocoleria", "Memory del circo", "Colora Wondy",
     "Respiro col palloncino", "Specchio mimo"
   - JavaScript vanilla, nessuna libreria, nessuna risorsa esterna
   - I giochi si mettono in pausa quando la schermata non è "giochi"
     o la pagina non è visibile: nessun ciclo gira se non si gioca.
   - Niente record da battere: solo "stelline raccolte" in tutti i giochi,
     salvate sul telefono (localStorage, chiavi "wondy-game-…"). Audio spento di predefinito.
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

  /* ---------- memoria sul telefono (stelline, disegno, preferenza audio) ---------- */
  const PREFISSO = "wondy-game-";
  const memoria = {
    get(k) { try { return localStorage.getItem(PREFISSO + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(PREFISSO + k, String(v)); } catch (e) { /* modalità privata: pazienza */ } }
  };

  /* ---------- suoni brevissimi con WebAudio ----------
     Il contesto audio nasce solo dentro un tocco dell'utente (sblocca). */
  const suono = {
    acceso: memoria.get("audio") === "on", // spento di predefinito
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
  /* Un solo effetto alla volta: ogni nuova festa toglie quella di prima. */
  function festa(x, y, quanti = 6, simboli = ["✦", "♥", "★"], raggio = 72) {
    if (lento()) return; // con movimento ridotto niente effetti
    fx.replaceChildren();
    for (let i = 0; i < quanti; i++) {
      const s = el("span", "game-spark" + (i % 3 === 1 ? " game-spark--red" : ""), simboli[i % simboli.length]);
      const ang = (i / quanti) * Math.PI * 2 + rnd(-0.3, 0.3);
      const dist = rnd(raggio * 0.5, raggio);
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
    fx.replaceChildren();
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
  /* punto dello schermo (clientX/Y) in coordinate del tabellone */
  function relativo(x, y) {
    const b = board.getBoundingClientRect();
    return { x: x - b.left, y: y - b.top };
  }
  function annuncia(testo) {
    live.textContent = "";
    setTimeout(() => { live.textContent = testo; }, 40);
  }

  /* ---------- interfaccia comune passata a ogni gioco ---------- */
  const ctx = {
    suono, lento, festa, galleggia, centro, relativo, annuncia,
    punti(v) {
      elPunti.textContent = v;
      if (!lento()) { elPunti.classList.remove("is-bump"); void elPunti.offsetWidth; elPunti.classList.add("is-bump"); }
    },
    info(testo) { elInfo.textContent = testo; }, // sempre neutro: niente conto alla rovescia rosso
    finito(risultato) { mostraFine(risultato); }
  };

  /* ============================================================
     GIOCO 1 · ACCHIAPPA IL NASO
     Nasi rossi spuntano qua e là: toccali prima che spariscano.
     Modalità "Piccoli" (predefinita): niente tempo, un naso alla volta,
     velocità fissa e lenta; si smette quando si vuole con "Ho finito".
     Modalità "Sfida": 30 secondi, nasi sempre più svelti, naso d'oro che vale 3.
     Nessuna penalità se un naso scappa.
     ============================================================ */
  function creaNaso(ctx, campo, opzioni) {
    const DURATA = 30000;
    const piccoli = opzioni.modo !== "sfida";
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
      const oro = !piccoli && tempo > 4000 && Math.random() < 0.12;
      const b = el("button", "game-nose" + (oro ? " game-nose--gold" : ""), icona(oro ? "naso-oro" : "naso"));
      b.type = "button";
      b.setAttribute("aria-label", oro ? "Naso d'oro, vale 3" : "Naso rosso");
      const col = casella % COLONNE, riga = Math.floor(casella / COLONNE);
      b.style.left = ((col + 0.5) / COLONNE) * 100 + rnd(-7, 7) + "%";
      b.style.top = ((riga + 0.5) / RIGHE) * 100 + rnd(-5, 5) + "%";
      // Piccoli: ogni naso resta a lungo, sempre uguale. Sfida: un po' meno man mano.
      const base = piccoli ? 3200 : 1800 - 750 * (tempo / DURATA);
      const vita = base * (ctx.lento() ? 1.5 : 1);
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
      ctx.festa(c.x, c.y, naso.oro ? 8 : 5, naso.oro ? ["✦", "★"] : ["♥", "✦", "★"]);
      ctx.suono.suona(naso.oro ? "oro" : "pop", punti % 15);
      togli(naso, "is-hit");
      prossimo = Math.max(prossimo, tempo + (piccoli ? 700 : 250)); // un attimo di respiro prima del prossimo
    }

    function passo(t) {
      if (!corre) return;
      tempo += Math.min(60, Math.max(0, t - ultimo));
      ultimo = t;

      // quanti nasi insieme: Piccoli sempre 1; Sfida 1, poi 2, poi 3
      const massimi = piccoli || tempo < 8000 ? 1 : tempo < 18000 ? 2 : 3;
      if (tempo >= prossimo && nasi.length < massimi) {
        spunta();
        const pausaTra = piccoli ? 1100 : 950 - 400 * (tempo / DURATA);
        prossimo = tempo + pausaTra * (ctx.lento() ? 1.4 : 1) * (piccoli ? 1 : rnd(0.8, 1.2));
      }
      nasi.filter((n) => tempo >= n.scade).forEach((n) => togli(n, "is-gone"));

      if (!piccoli) { // gli ultimi secondi restano neutri: niente rosso, niente fretta
        const resto = Math.max(0, Math.ceil((DURATA - tempo) / 1000));
        if (resto !== secondi) { secondi = resto; ctx.info("Tempo " + resto); }
        if (tempo >= DURATA) { termina(); return; }
      }
      raf = requestAnimationFrame(passo);
    }

    function termina() {
      corre = false; chiuso = true;
      nasi.slice().forEach((n) => togli(n, "is-gone"));
      ctx.finito({ punteggio: punti, unita: punti === 1 ? "naso preso" : "nasi presi" });
    }

    function parti() { corre = true; ultimo = performance.now(); raf = requestAnimationFrame(passo); }
    return {
      avvia() {
        ctx.punti(0);
        if (piccoli) ctx.finisci(termina); else ctx.info("Tempo 30");
        ctx.annuncia("Via! Tocca i nasi rossi.");
        parti();
      },
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
      setTimeout(() => {
        if (!fermato) ctx.finito({ punteggio: lanci, unita: lanci === 1 ? "lancio" : "lanci" });
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
     12 carte (6 coppie) o 16 carte (8 coppie).
     Le mosse non si contano: si vedono solo le coppie trovate.
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
    let prima = null, blocco = false, trovate = 0, timer = 0, chiuso = false;

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

      if (a.dataset.icona === b.dataset.icona) { // coppia!
        [a, b].forEach((c) => { c.classList.add("is-match"); etichetta(c, "trovata"); });
        trovate++;
        ctx.punti(trovate);
        ctx.info(`su ${coppie}`);
        const c = ctx.centro(b);
        ctx.festa(c.x, c.y, 8);
        ctx.suono.suona("coppia");
        ctx.annuncia(`Coppia trovata: ${NOMI[b.dataset.icona]}!`);
        if (trovate === coppie) {
          chiuso = true;
          timer = setTimeout(() => ctx.finito({
            punteggio: trovate, unita: "coppie trovate"
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
        ctx.info(`su ${coppie}`);
        ctx.annuncia(`Memory con ${quante} carte. Trova le coppie.`);
      },
      pausa() {}, riprendi() {}, // gioco a turni: non c'è niente da fermare
      ferma() { chiuso = true; clearTimeout(timer); },
      inCorso: () => false,
      primo: () => griglia.firstElementChild
    };
  }

  /* ============================================================
     GIOCO 4 · COLORA WONDY (dal libro "Wondy Paint")
     Si sceglie un colore dalla tavolozza e si tocca una zona del disegno.
     "Colori veri di Wondy" riempie tutto con i colori del costume.
     Il disegno resta salvato sul telefono; si può scaricare come PNG.
     ============================================================ */
  const TAVOLOZZA = [
    { nome: "Rosso", hex: "#D8352B" }, { nome: "Nero velluto", hex: "#1E1828" },
    { nome: "Bianco", hex: "#FFFFFF" }, { nome: "Oro", hex: "#E2B04A" },
    { nome: "Rosa pelle", hex: "#F6CDB4" }, { nome: "Azzurro", hex: "#4FA3E0" },
    { nome: "Verde", hex: "#5DBB63" }, { nome: "Viola", hex: "#9B6ADE" },
    { nome: "Rosa", hex: "#F08DB8" }, { nome: "Arancione", hex: "#F39A3B" }
  ];
  const ZONE = {
    sfondo: "lo sfondo", petali: "il girasole", capelli: "i capelli", viso: "il viso", naso: "il naso",
    papillon: "il papillon", gilet: "il gilet", camicia: "la camicia", pantaloni: "i pantaloni", scarpe: "le scarpe"
  };
  const COLORI_VERI = {
    sfondo: "#4FA3E0", petali: "#E2B04A", capelli: "#1E1828", viso: "#F6CDB4", naso: "#D8352B",
    papillon: "#D8352B", gilet: "#1E1828", camicia: "#FFFFFF", pantaloni: "#D8352B", scarpe: "#D8352B"
  };
  const FOGLIO = "#FFFFFF"; // colore del foglio bianco

  function creaColora(ctx, campo) {
    const nulla = { avvia() {}, pausa() {}, riprendi() {}, ferma() {}, inCorso: () => false };
    const modello = root.querySelector("template[data-game-colora]");
    if (!modello) return nulla;
    campo.append(modello.content.cloneNode(true));

    const svg = campo.querySelector(".game-colora__svg");
    const tavolozza = campo.querySelector("[data-colora-palette]");
    const nomiZone = Object.keys(ZONE);
    let scelto = TAVOLOZZA[0].hex, timer = [];

    // stato salvato: colori delle zone e zone già toccate
    let stato;
    try { stato = JSON.parse(memoria.get("colora")) || {}; } catch (e) { stato = {}; }
    stato = { colori: stato.colori || {}, toccate: Array.isArray(stato.toccate) ? stato.toccate : [], finito: !!stato.finito };
    const salva = () => memoria.set("colora", JSON.stringify(stato));

    // tavolozza a bollini
    TAVOLOZZA.forEach((c) => {
      const b = el("button", "game-dot");
      b.type = "button";
      b.style.setProperty("--c", c.hex);
      b.setAttribute("aria-label", c.nome);
      b.setAttribute("aria-pressed", String(c.hex === scelto));
      b.addEventListener("click", () => {
        scelto = c.hex;
        $$(".game-dot", tavolozza).forEach((d) => d.setAttribute("aria-pressed", String(d === b)));
        ctx.suono.sblocca();
        ctx.suono.suona("giro");
      });
      tavolozza.append(b);
    });

    // una parte per zona diventa raggiungibile anche con la tastiera
    nomiZone.forEach((z) => {
      const p = svg.querySelector(`[data-zona="${z}"]`);
      if (!p) return;
      p.setAttribute("tabindex", "0");
      p.setAttribute("role", "button");
      p.setAttribute("aria-label", "Colora " + ZONE[z]);
    });

    function riempi(z, hex, anima) {
      $$(`[data-zona="${z}"]`, svg).forEach((p) => {
        p.setAttribute("fill", hex);
        if (anima && !ctx.lento() && z !== "sfondo") {
          p.classList.remove("is-pop"); void p.getBoundingClientRect(); p.classList.add("is-pop");
        }
      });
      stato.colori[z] = hex;
    }
    function aggiorna() {
      ctx.punti(stato.toccate.length);
      ctx.info(`su ${nomiZone.length}`);
    }
    function festaGrande(quante) { // un'unica festa di stelline, larga quanto il disegno
      const c = ctx.centro(svg), r = svg.getBoundingClientRect();
      ctx.festa(c.x, c.y, quante, ["✦", "★", "♥"], r.width * 0.45);
    }

    function colora(z, pos) {
      ctx.suono.sblocca();
      riempi(z, scelto, true);
      if (!stato.toccate.includes(z)) { stato.toccate.push(z); ctx.stelline(1); } // una stellina per ogni parte nuova
      ctx.suono.suona("pop", stato.toccate.length);
      if (pos) ctx.festa(pos.x, pos.y, 5, ["✦", "✦", "♥"]);
      aggiorna();
      if (stato.toccate.length === nomiZone.length && !stato.finito) {
        stato.finito = true;
        festaGrande(12);
        ctx.suono.suona("fine");
        ctx.annuncia("Che capolavoro! Hai colorato tutto Wondy.");
      }
      salva();
    }

    svg.addEventListener("click", (e) => {
      const p = e.target.closest("[data-zona]");
      if (!p) return;
      const pos = e.detail > 0 ? ctx.relativo(e.clientX, e.clientY) : ctx.centro(p);
      colora(p.getAttribute("data-zona"), pos);
    });
    svg.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const z = e.target.getAttribute && e.target.getAttribute("data-zona");
      if (!z) return;
      e.preventDefault();
      colora(z, ctx.centro(e.target));
    });

    campo.querySelector("[data-colora-reset]").addEventListener("click", () => {
      timer.forEach(clearTimeout); timer = [];
      nomiZone.forEach((z) => riempi(z, FOGLIO, false));
      stato = { colori: {}, toccate: [], finito: false };
      salva(); aggiorna();
      ctx.suono.sblocca(); ctx.suono.suona("tromba");
      ctx.annuncia("Foglio bianco: si ricomincia!");
    });

    campo.querySelector("[data-colora-veri]").addEventListener("click", () => {
      ctx.suono.sblocca();
      timer.forEach(clearTimeout); timer = [];
      const passo = ctx.lento() ? 0 : 90; // le zone si colorano una dopo l'altra
      nomiZone.forEach((z, i) => {
        timer.push(setTimeout(() => { riempi(z, COLORI_VERI[z], true); ctx.suono.suona("pop", i); }, i * passo));
      });
      timer.push(setTimeout(() => {
        stato.toccate = nomiZone.slice();
        stato.finito = true;
        salva(); aggiorna();
        festaGrande(14);
        ctx.suono.suona("fine");
        ctx.annuncia("Ecco Wondy con i suoi colori veri!");
      }, nomiZone.length * passo));
    });

    campo.querySelector("[data-colora-salva]").addEventListener("click", esporta);

    /* PNG generato in locale: SVG → immagine → canvas → file. Nessun dato esce dal telefono. */
    function esporta() {
      const errore = () => ctx.annuncia("Su questo telefono non riesco a salvare il disegno.");
      try {
        const copia = svg.cloneNode(true);
        copia.querySelectorAll("[tabindex], .is-pop").forEach((n) => {
          n.removeAttribute("tabindex"); n.removeAttribute("role"); n.removeAttribute("aria-label"); n.classList.remove("is-pop");
        });
        copia.setAttribute("width", "750");
        copia.setAttribute("height", "1000");
        const testo = new XMLSerializer().serializeToString(copia);
        const img = new Image();
        img.onerror = errore;
        img.onload = () => {
          const tela = document.createElement("canvas");
          tela.width = 750; tela.height = 1000;
          const g = tela.getContext("2d");
          g.fillStyle = "#FFFFFF";
          g.fillRect(0, 0, tela.width, tela.height);
          g.drawImage(img, 0, 0, tela.width, tela.height);
          tela.toBlob((blob) => {
            if (!blob) { errore(); return; }
            const url = URL.createObjectURL(blob);
            const a = el("a");
            a.href = url;
            a.download = "wondy-colorato.png";
            document.body.append(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
            ctx.annuncia("Disegno salvato!");
          }, "image/png");
        };
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(testo);
      } catch (e) { errore(); }
    }

    return {
      avvia() {
        nomiZone.forEach((z) => riempi(z, stato.colori[z] || FOGLIO, false)); // riprende il disegno salvato
        aggiorna();
        ctx.annuncia("Scegli un colore, poi tocca una parte di Wondy.");
      },
      pausa() {}, riprendi() {}, // non c'è tempo che scorre
      ferma() { timer.forEach(clearTimeout); timer = []; },
      inCorso: () => false,
      primo: () => tavolozza.querySelector('[aria-pressed="true"]')
    };
  }

  /* ============================================================
     ATTIVITÀ 5 · RESPIRO COL PALLONCINO
     Il palloncino si gonfia in 4 secondi (inspira) e si sgonfia in 4 (espira).
     5 cicli, niente punteggio. Con il movimento ridotto la transizione resta,
     lenta e morbida: serve per seguire il respiro.
     ============================================================ */
  function creaRespiro(ctx, campo) {
    const CICLI = 5, FASE = 4000;
    let passo = -1, timer = [], corre = false, chiuso = false;

    campo.innerHTML =
      '<div class="game-breath">' +
        '<p class="game-breath__word" data-parola>Mettiti comodo</p>' +
        '<div class="game-balloon" data-palloncino>' +
          '<svg viewBox="0 0 100 150" aria-hidden="true" focusable="false">' +
            '<path class="game-balloon__string" d="M50 104 C44 116 56 126 48 138 C44 144 50 148 50 150" fill="none" stroke="#F4EEE4" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>' +
            '<g class="game-balloon__body">' +
              '<ellipse cx="50" cy="54" rx="38" ry="46" fill="#D8352B"/>' +
              '<path d="M18 66 C24 88 40 100 50 100 C34 96 22 84 18 66 Z" fill="#8E1C16" opacity=".45"/>' +
              '<ellipse cx="36" cy="34" rx="9" ry="14" fill="#fff" opacity=".4" transform="rotate(25 36 34)"/>' +
              '<path d="M45 99 L55 99 L52 104 L48 104 Z" fill="#B3261E"/>' +
            '</g>' +
          '</svg>' +
        '</div>' +
        '<p class="game-breath__count" data-conta aria-hidden="true"></p>' +
        '<p class="game-breath__hint" data-sotto>Guarda il palloncino</p>' +
      '</div>';
    const parola = campo.querySelector("[data-parola]");
    const sotto = campo.querySelector("[data-sotto]");
    const conta = campo.querySelector("[data-conta]");
    const palloncino = campo.querySelector("[data-palloncino]");

    const pulisci = () => { timer.forEach(clearTimeout); timer = []; };

    /* passo pari = inspira, passo dispari = espira; 10 passi = 5 cicli */
    function fase(n) {
      pulisci();
      passo = n;
      if (n >= CICLI * 2) { fine(); return; }
      const dentro = n % 2 === 0;
      const ciclo = Math.floor(n / 2) + 1;
      parola.textContent = dentro ? "Inspira…" : "Espira…";
      sotto.textContent = dentro ? "dal naso, piano piano" : "dalla bocca, come per soffiare";
      palloncino.classList.toggle("is-full", dentro);
      ctx.info(`${ciclo} di ${CICLI}`);
      if (dentro) ctx.annuncia(`Respiro ${ciclo} di ${CICLI}. Inspira.`); else ctx.annuncia("Espira.");
      ctx.suono.suona(dentro ? "giro" : "no");
      for (let s = 1; s <= 4; s++) { // si conta insieme: 1, 2, 3, 4
        timer.push(setTimeout(() => { conta.textContent = String(s); }, (s - 1) * 1000));
      }
      timer.push(setTimeout(() => fase(n + 1), FASE));
    }
    function fine() {
      corre = false; chiuso = true;
      palloncino.classList.remove("is-full");
      ctx.finito({ senzaPunti: true, titolo: "Bravo!", messaggio: "Ora sei calmo come Wondy" });
    }

    return {
      avvia() {
        corre = true;
        ctx.info(`1 di ${CICLI}`);
        ctx.annuncia("Mettiti comodo. Guarda il palloncino.");
        timer.push(setTimeout(() => fase(0), 1500));
      },
      pausa() { corre = false; pulisci(); },
      riprendi() { if (chiuso) return; corre = true; fase(Math.max(0, passo)); }, // si riparte dall'inizio del respiro
      ferma() { corre = false; chiuso = true; pulisci(); },
      inCorso: () => corre
    };
  }

  /* ============================================================
     ATTIVITÀ 6 · SPECCHIO MIMO (genitore e bambino)
     Una carta con un gesto da mimare: uno fa il gesto, l'altro indovina,
     poi ci si scambia. Niente punteggio.
     ============================================================ */
  const svgGesto = (dentro) => `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${dentro}</svg>`;
  const usa = (id) => svgGesto(`<use href="#game-i-${id}"/>`);
  const TRATTO = 'stroke="#1A1220" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';
  const GESTI = [
    { testo: "Tieni in equilibrio un fiore sul naso", icona: usa("girasole") },
    { testo: "Lancia tre palline invisibili", icona: usa("palla") },
    { testo: "Abbraccia l'orsetto", icona: usa("orso") },
    { testo: "Apri un sipario pesante", icona: svgGesto(
      `<path d="M4 8h56" ${TRATTO} stroke-width="4"/>` +
      `<path d="M8 10c0 18 3 34 12 46H8z" fill="#D8352B" ${TRATTO}/><path d="M56 10c0 18-3 34-12 46h12z" fill="#D8352B" ${TRATTO}/>` +
      `<path d="M14 14c0 14 1 28 4 38M50 14c0 14-1 28-4 38" fill="none" stroke="#8E1C16" stroke-width="1.6"/>` +
      `<path d="M32 22l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#E2B04A"/>`) },
    { testo: "Spingi un muro invisibile", icona: svgGesto(
      `<g fill="#C98A43" ${TRATTO}><rect x="40" y="6" width="20" height="13"/><rect x="40" y="19" width="20" height="13"/><rect x="40" y="32" width="20" height="13"/><rect x="40" y="45" width="20" height="13"/></g>` +
      `<g fill="#F6CDB4" ${TRATTO}><rect x="14" y="16" width="5" height="16" rx="2.5"/><rect x="19.5" y="12" width="5" height="18" rx="2.5"/>` +
      `<rect x="25" y="13" width="5" height="18" rx="2.5"/><rect x="30.5" y="17" width="5" height="15" rx="2.5"/>` +
      `<path d="M13 29h23v10c0 8-5 12-12 12s-11-5-11-12z"/></g>`) },
    { testo: "Sbadiglia come un leone", icona: svgGesto(
      `<circle cx="32" cy="32" r="27" fill="#F39A3B" ${TRATTO}/><circle cx="32" cy="34" r="18" fill="#F3C33B" ${TRATTO}/>` +
      `<path d="M23 29q3 2 6 0M35 29q3 2 6 0" fill="none" ${TRATTO}/>` +
      `<ellipse cx="32" cy="42" rx="6.5" ry="8" fill="#7A1F2B" ${TRATTO}/><path d="M29 36.5h6" stroke="#fff" stroke-width="1.6"/>`) },
    { testo: "Cammina in punta di piedi", icona: usa("scarpa") },
    { testo: "Ridi senza fare rumore", icona: svgGesto(
      `<circle cx="32" cy="32" r="24" fill="#F6CDB4" ${TRATTO}/>` +
      `<path d="M21 27q4-4 8 0M35 27q4-4 8 0" fill="none" ${TRATTO}/>` +
      `<path d="M20 38q12 14 24 0z" fill="#7A1F2B" ${TRATTO}/>` +
      `<rect x="29.5" y="30" width="5" height="20" rx="2.5" fill="#F6CDB4" ${TRATTO}/>`) },
    { testo: "Suona la trombetta, ma senza suono", icona: usa("trombetta") },
    { testo: "Porta un cestino pesantissimo", icona: usa("cestino") },
    { testo: "Sistemati il papillon allo specchio", icona: usa("papillon") },
    { testo: "Mettiti il naso rosso", icona: usa("naso") },
    { testo: "Tira una corda invisibile", icona: svgGesto(
      `<path d="M4 44C14 22 26 50 38 30S54 22 60 18" fill="none" stroke="#1A1220" stroke-width="7" stroke-linecap="round"/>` +
      `<path d="M4 44C14 22 26 50 38 30S54 22 60 18" fill="none" stroke="#C98A43" stroke-width="4.4" stroke-linecap="round"/>` +
      `<path d="M4 44l-2 12M4 44l2 12M4 44v13" stroke="#D8352B" stroke-width="2" stroke-linecap="round"/>`) },
    { testo: "Truccati prima dello spettacolo", icona: svgGesto(
      `<ellipse cx="32" cy="27" rx="16" ry="20" fill="#CFE6F5" stroke="#E2B04A" stroke-width="4"/>` +
      `<path d="M32 47v10M22 58h20" stroke="#E2B04A" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="M24 18l6-6M25 27l11-11" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`) },
    { testo: "Fai un inchino al pubblico", icona: usa("wondy") }
  ];

  function creaSpecchio(ctx, campo) {
    let mazzo = [], numero = 0;

    campo.innerHTML =
      '<div class="game-mirror">' +
        '<p class="game-mirror__how">Uno fa il gesto, l\'altro indovina. Poi scambiatevi!</p>' +
        '<button type="button" class="game-mirror__card" data-carta>' +
          '<span class="game-mirror__inner">' +
            '<span class="game-mirror__face game-mirror__back" aria-hidden="true"><b>W</b><small>Tocca per vedere il gesto</small></span>' +
            '<span class="game-mirror__face game-mirror__front"><span class="game-mirror__icon" data-icona></span><span class="game-mirror__text" data-testo></span></span>' +
          '</span>' +
        '</button>' +
        '<button class="btn btn--primary" type="button" data-prossima>Prossima carta</button>' +
      '</div>';
    const carta = campo.querySelector("[data-carta]");
    const iconaCarta = campo.querySelector("[data-icona]");
    const testo = campo.querySelector("[data-testo]");

    function prossima() {
      if (!mazzo.length) mazzo = mescola(GESTI.slice()); // finito il mazzo, si rimescola
      const g = mazzo.pop();
      numero++;
      carta.classList.remove("is-open");
      carta.setAttribute("aria-label", "Carta coperta: tocca per vedere il gesto");
      // il nuovo gesto si scrive a carta già girata, così non si intravede
      setTimeout(() => {
        iconaCarta.innerHTML = g.icona;
        testo.textContent = g.testo;
        carta.dataset.gesto = g.testo;
      }, ctx.lento() ? 0 : 220);
      ctx.info(`Carta ${numero}`);
    }
    carta.addEventListener("click", () => {
      if (carta.classList.contains("is-open")) return;
      ctx.suono.sblocca();
      ctx.suono.suona("giro");
      carta.classList.add("is-open");
      carta.setAttribute("aria-label", "Gesto: " + carta.dataset.gesto);
      ctx.annuncia(carta.dataset.gesto);
    });
    campo.querySelector("[data-prossima]").addEventListener("click", () => {
      ctx.suono.sblocca();
      prossima();
      carta.focus({ preventScroll: true });
    });

    return {
      avvia() { prossima(); ctx.annuncia("Specchio mimo. Uno fa il gesto, l'altro indovina. Poi scambiatevi!"); },
      pausa() {}, riprendi() {}, ferma() {},
      inCorso: () => false,
      primo: () => carta
    };
  }

  /* ============================================================
     REGIA: menu, avvio, pausa, schermata finale, stelline, pausa gentile
     ============================================================ */
  const GIOCHI = {
    naso: { etichetta: "Nasi", crea: creaNaso },
    palline: { etichetta: "Lanci", crea: creaGiocoleria },
    memory: { etichetta: "Coppie", crea: creaMemory },
    colora: { etichetta: "Colorati", crea: creaColora },
    respiro: { etichetta: "", crea: creaRespiro, senzaPunti: true, calmo: true },
    specchio: { etichetta: "", crea: creaSpecchio, senzaPunti: true, calmo: true }
  };
  let attivo = null; // { id, gioco, opzioni }

  const misuraMemory = () => {
    const r = $('input[name="game-memory-size"]:checked');
    return r && r.value === "16" ? 16 : 12;
  };
  const modoNaso = () => {
    const r = $('input[name="game-naso-mode"]:checked');
    return r && r.value === "sfida" ? "sfida" : "piccoli"; // "Piccoli" è la modalità predefinita
  };

  /* ---------- stelline raccolte: un tesoretto unico per tutti i giochi ---------- */
  const stelleTotali = () => Math.max(0, parseInt(memoria.get("stelline"), 10) || 0);
  function aggiungiStelline(n) {
    if (n > 0) memoria.set("stelline", stelleTotali() + n);
    mostraStelline();
  }
  function mostraStelline() {
    const t = stelleTotali();
    $$("[data-game-stars]").forEach((b) => { b.textContent = t; });
    // vecchie righe "Record:" eventualmente rimaste nella pagina: si nascondono
    $$("[data-game-record]").forEach((b) => { const riga = b.closest("p"); if (riga) riga.hidden = true; });
  }
  ctx.stelline = aggiungiStelline;

  /* ---------- "Ho finito" (modalità senza tempo) ---------- */
  const hud = $(".game-hud");
  const btnFinito = el("button", "game-done", "Ho finito");
  btnFinito.type = "button";
  btnFinito.hidden = true;
  btnFinito.setAttribute("aria-label", "Ho finito di giocare");
  if (hud) elInfo.after(btnFinito);
  let azioneFinito = null;
  btnFinito.addEventListener("click", () => { if (azioneFinito) azioneFinito(); });
  ctx.finisci = (fn) => {
    azioneFinito = fn;
    btnFinito.hidden = false;
    elInfo.hidden = true;
  };
  function nascondiFinito() {
    azioneFinito = null;
    btnFinito.hidden = true;
    elInfo.hidden = false;
  }

  /* ---------- pausa gentile: dopo 10 minuti di gioco nella sessione ----------
     Si conta solo il tempo passato davvero a giocare (non respiro e specchio).
     Un solo promemoria per sessione: si può sempre continuare. */
  const LIMITE = 10 * 60 * 1000;
  const sessione = {
    get(k) { try { return sessionStorage.getItem(PREFISSO + k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(PREFISSO + k, String(v)); } catch (e) { /* pazienza */ } }
  };
  const orologio = { tot: Number(sessione.get("tempo")) || 0, da: 0, timer: 0, mostrato: sessione.get("pausa-gentile") === "1" };
  function avviaOrologio() {
    if (orologio.da || orologio.mostrato || !attivo || GIOCHI[attivo.id].calmo) return;
    if (root.hidden || document.hidden || !pausa.hidden || !fine.hidden) return;
    orologio.da = Date.now();
    orologio.timer = setTimeout(sbadiglio, Math.max(0, LIMITE - orologio.tot));
  }
  function fermaOrologio() {
    if (!orologio.da) return;
    orologio.tot += Date.now() - orologio.da;
    orologio.da = 0;
    clearTimeout(orologio.timer);
    sessione.set("tempo", Math.round(orologio.tot));
  }

  const gentile = el("div", "game-overlay game-yawn");
  gentile.hidden = true;
  gentile.setAttribute("role", "group");
  gentile.setAttribute("aria-labelledby", "game-yawn-h");
  gentile.innerHTML =
    '<svg class="game-face game-face--yawn" aria-hidden="true"><use href="#game-i-wondy"/></svg>' +
    '<h3 class="game-overlay__title" id="game-yawn-h">Uaaah…</h3>' +
    '<p class="game-yawn__text">È ora di una pausa: andiamo a fare un bel respiro?</p>' +
    '<div class="game-overlay__actions">' +
      '<button class="btn btn--primary" type="button" data-yawn-respiro>Respiro col palloncino</button>' +
      '<button class="btn btn--ghost" type="button" data-yawn-continua>Continua a giocare</button>' +
    '</div>';
  board.append(gentile);
  let messoInPausaDaWondy = false;

  function sbadiglio() {
    fermaOrologio();
    orologio.mostrato = true;
    sessione.set("pausa-gentile", "1");
    if (!attivo) return;
    messoInPausaDaWondy = attivo.gioco.inCorso();
    if (messoInPausaDaWondy) attivo.gioco.pausa();
    gentile.hidden = false;
    board.classList.add("is-over");
    annuncia("Wondy sbadiglia. È ora di una pausa: andiamo a fare un bel respiro?");
    gentile.querySelector("[data-yawn-respiro]").focus({ preventScroll: true });
  }
  gentile.querySelector("[data-yawn-respiro]").addEventListener("click", () => avvia("respiro", {}));
  gentile.querySelector("[data-yawn-continua]").addEventListener("click", () => {
    gentile.hidden = true;
    board.classList.remove("is-over");
    if (attivo && messoInPausaDaWondy) attivo.gioco.riprendi();
    messoInPausaDaWondy = false;
    area.focus({ preventScroll: true });
  });

  function avvia(id, opzioni) {
    ferma();
    suono.sblocca(); // siamo dentro un tocco: si può accendere l'audio
    const def = GIOCHI[id];
    // un'area di gioco nuova a ogni partita: niente ascoltatori rimasti appesi
    const nuova = el("div", "game-area game-area--" + id);
    nuova.setAttribute("data-game-area", "");
    area.replaceWith(nuova);
    area = nuova;
    fx.replaceChildren();
    menu.hidden = true;
    stage.hidden = false;
    pausa.hidden = true;
    fine.hidden = true;
    gentile.hidden = true;
    board.classList.remove("is-over");
    stage.dataset.game = id;
    nascondiFinito();
    elInfo.textContent = "";
    elPuntiNome.textContent = def.etichetta;
    elPunti.textContent = "0";
    elPunti.parentElement.hidden = !!def.senzaPunti;
    attivo = { id, opzioni, gioco: def.crea(ctx, area, opzioni) };
    stage.scrollIntoView({ block: "start", behavior: lento() ? "auto" : "smooth" });
    attivo.gioco.avvia();
    const fuoco = attivo.gioco.primo ? attivo.gioco.primo() : area;
    if (!fuoco.hasAttribute("tabindex") && fuoco === area) area.tabIndex = -1;
    fuoco.focus({ preventScroll: true });
    avviaOrologio();
  }

  function ferma() {
    fermaOrologio();
    if (attivo) { attivo.gioco.ferma(); attivo = null; }
  }

  function tornaAlMenu() {
    const ultimo = attivo && attivo.id;
    ferma();
    nascondiFinito();
    stage.hidden = true;
    menu.hidden = false;
    mostraStelline();
    const b = ultimo && $(`[data-game-play="${ultimo}"]`);
    if (b) b.focus({ preventScroll: true });
  }

  function mettiInPausa() {
    fermaOrologio();
    if (attivo && attivo.gioco.inCorso()) {
      attivo.gioco.pausa();
      pausa.hidden = false;
      board.classList.add("is-over");
    }
    suono.sospendi();
  }

  /* messaggi finali: sempre positivi, anche con 0 */
  const RISO = "Wondy ha riso tanto!";
  const FRASI = {
    naso: (n) => (n >= 20 ? "Che riflessi!" : n >= 8 ? "Bravissimo!" : n > 0 ? "Bravo!" : RISO),
    palline: (n) => (n >= 25 ? "Sei un giocoliere!" : n >= 8 ? "Bravissimo!" : n > 0 ? "Bravo!" : RISO),
    memory: () => "Tutte le coppie!"
  };
  const MIMI = ["♥ ✦ !", "♪ ✿ ♥", "! ✦ ♪", "✿ ♥ ✦"];

  function mostraFine(r) {
    if (!attivo) return;
    fermaOrologio();
    nascondiFinito();
    const n = r.punteggio || 0;
    const frase = r.titolo || (FRASI[attivo.id] ? FRASI[attivo.id](n) : "Bravo!");
    const elScore = $("[data-game-end-score]");
    const elUnit = $("[data-game-end-unit]");
    const elStelle = $("[data-game-end-record]");
    const badge = $("[data-game-end-new]");
    if (badge) badge.hidden = true; // niente record da battere

    $("[data-game-end-title]").textContent = frase;
    if (r.senzaPunti) {
      elScore.hidden = true;
      elUnit.textContent = r.messaggio || "";
      elStelle.textContent = "";
    } else {
      aggiungiStelline(n); // ogni punto diventa una stellina del tesoretto
      elScore.hidden = n === 0;
      elScore.textContent = n;
      elUnit.textContent = n === 0 ? "" : r.unita;
      const tot = stelleTotali();
      elStelle.textContent = n > 0 ? `+${n} ✦ · stelline raccolte: ${tot}` : `Stelline raccolte: ${tot} ✦`;
    }
    $("[data-game-end-mime]").textContent = MIMI[Math.floor(Math.random() * MIMI.length)];

    fine.hidden = false;
    board.classList.add("is-over");
    suono.suona(r.senzaPunti ? "coppia" : "fine");
    annuncia(r.senzaPunti ? `${frase} ${r.messaggio || ""}` : n > 0 ? `${frase} ${n} ${r.unita}.` : frase);
    $("[data-game-again]").focus({ preventScroll: true });
  }

  /* ---------- pulsanti ---------- */
  $$("[data-game-play]").forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.gamePlay;
    const opzioni = id === "memory" ? { carte: misuraMemory() } : id === "naso" ? { modo: modoNaso() } : {};
    avvia(id, opzioni);
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
    avviaOrologio();
  });

  /* ---------- audio: spento finché un adulto non lo accende ----------
     "wondy-game-audio" vale "on" solo dopo un tocco sull'interruttore;
     la stessa chiave la legge anche l'avatar di Wondy per la trombetta. */
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
    if (e.detail === "giochi") {
      suono.acceso = memoria.get("audio") === "on"; // l'interruttore può essere cambiato altrove
      aggiornaAudio();
      mostraStelline();
      avviaOrologio();
    } else mettiInPausa();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) mettiInPausa(); else avviaOrologio();
  });
  window.addEventListener("pagehide", mettiInPausa);

  aggiornaAudio();
  mostraStelline();
})();

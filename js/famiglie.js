/* ============================================================
   FAMIGLIE · storia a tavole, insegna col nome, diploma,
   calendario dell'attesa e biglietto ricordo.
   Tutto avviene nel browser: nessun dato viene inviato.
   Il nome resta al massimo in sessionStorage (si cancella chiudendo la scheda).
   Espone window.Wondy.ticket(nome, dataISO).
   ============================================================ */
(function () {
  "use strict";
  const W = (window.Wondy = window.Wondy || {});
  const KEY = "wondy-fam-v1";
  const SVGNS = "http://www.w3.org/2000/svg";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- stato (solo sessione) ---------- */
  let state = { nome: "", festa: "" };
  try { state = Object.assign(state, JSON.parse(sessionStorage.getItem(KEY) || "{}")); } catch (e) {}
  function persist() { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  /* ---------- utilità ---------- */
  const cleanName = (s, max) => String(s || "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max || 24);
  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  function fromISO(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.getMonth() === +m[2] - 1 ? d : null;
  }
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const daysBetween = (a, b) => Math.round((b - a) / 86400000);
  const fmtLong = (d) => d.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const fmtShort = (d) => d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "");

  function el(name, attrs, parent, text) {
    const n = document.createElementNS(SVGNS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text; // textContent: il nome non viene mai interpretato come codice
    if (parent) parent.appendChild(n);
    return n;
  }
  function a4() {
    return el("svg", { xmlns: SVGNS, viewBox: "0 0 210 297", class: "fam-a4", "aria-hidden": "true", "font-family": "Cinzel, Georgia, serif" });
  }
  /* stella a quattro punte (come #i-star), solo contorno da colorare */
  function star(g, x, y, r) {
    const k = r * 0.2;
    el("path", { d: `M${x} ${y - r}L${x + k} ${y - k}L${x + r} ${y}L${x + k} ${y + k}L${x} ${y + r}L${x - k} ${y + k}L${x - r} ${y}L${x - k} ${y - k}Z`, fill: "#fff", stroke: "#000", "stroke-width": ".6", "stroke-linejoin": "round" }, g);
  }
  /* naso da colorare */
  function nose(g, cx, cy, r) {
    el("circle", { cx, cy, r, fill: "#fff", stroke: "#000", "stroke-width": Math.max(.6, r * .06) }, g);
    el("ellipse", { cx: cx - r * .35, cy: cy - r * .38, rx: r * .3, ry: r * .18, transform: `rotate(-35 ${cx - r * .35} ${cy - r * .38})`, fill: "#fff", stroke: "#000", "stroke-width": Math.max(.4, r * .035) }, g);
  }
  /* girasole da colorare */
  function sunflower(g, cx, cy, r, stem) {
    if (stem) {
      el("path", { d: `M${cx} ${cy + r * .5}V${cy + r * 2.4}`, stroke: "#000", "stroke-width": r * .14, "stroke-linecap": "round", fill: "none" }, g);
      el("path", { d: `M${cx} ${cy + r * 1.9}c${-r * .6} ${-r * .6} ${-r * 1.2} ${-r * .5} ${-r * 1.5} ${-r * .2} ${r * .4} ${r * .4} ${r} ${r * .5} ${r * 1.5} ${r * .2}z`, fill: "#fff", stroke: "#000", "stroke-width": ".6" }, g);
    }
    for (let i = 0; i < 10; i++) el("ellipse", { cx, cy: cy - r * .72, rx: r * .24, ry: r * .42, transform: `rotate(${i * 36} ${cx} ${cy})`, fill: "#fff", stroke: "#000", "stroke-width": ".6" }, g);
    el("circle", { cx, cy, r: r * .42, fill: "#fff", stroke: "#000", "stroke-width": ".7" }, g);
  }
  /* firma discreta di Wondy: indirizzo del sito e Instagram, incastonati nella cornice in basso */
  const SIGN = "wondyofficial.github.io  ·  @wondy_real";
  /* logo ufficiale (760 × 249). Sui fogli in bianco e nero diventa nero pieno, come i contorni */
  const LOGO = "assets/logo-wondy.png", LOGO_R = 760 / 249;
  let logoN = 0; // id del filtro diverso per ogni foglio: un filtro dentro un foglio nascosto non funziona
  function logo(g, cx, cy, h, black) {
    const w = h * LOGO_R, a = { href: LOGO, x: cx - w / 2, y: cy - h / 2, width: w, height: h, preserveAspectRatio: "xMidYMid meet" };
    if (black) {
      const svg = g.ownerSVGElement || g;
      let f = svg.querySelector("filter.fam-logo-nero");
      if (!f) {
        f = el("filter", { id: "fam-logo-nero-" + ++logoN, class: "fam-logo-nero", "color-interpolation-filters": "sRGB" }, el("defs", {}, svg));
        el("feColorMatrix", { type: "matrix", values: "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" }, f);
      }
      a.filter = `url(#${f.id})`;
    }
    return el("image", a, g);
  }
  /* attenzione: il rettangolo copre ciò che sta sotto (sull'invito, la riga dello spettacolo finisce poco sopra):
     se si ingrandisce la firma o si abbassa quella riga, ricontrollare che nulla venga tagliato */
  function hallmark(g, cx, y, size, color, bg) {
    const w = SIGN.length * size * 0.55 + size * 2;
    el("rect", { x: cx - w / 2, y: y - size * .6, width: w, height: size * 1.2, fill: bg }, g);
    el("text", { x: cx, y: y + size * .36, "font-size": size, "text-anchor": "middle", "letter-spacing": size * .04, "font-family": "'Instrument Sans', system-ui, sans-serif", fill: color }, g, SIGN);
  }
  /* testo che si restringe se il nome è lungo */
  function fitText(g, x, y, txt, max, maxW, attrs) {
    const size = Math.min(max, maxW / Math.max(1, txt.length * 0.72));
    return el("text", Object.assign({ x, y, "font-size": size.toFixed(2), "text-anchor": "middle" }, attrs || {}), g, txt);
  }

  /* ---------- DIPLOMA (A4, bianco e nero, da colorare) ---------- */
  function buildDiploma(nome, date) {
    const s = a4();
    el("rect", { x: 0, y: 0, width: 210, height: 297, fill: "#fff" }, s);
    el("rect", { x: 8, y: 8, width: 194, height: 281, rx: 4, fill: "none", stroke: "#000", "stroke-width": "1.4" }, s);
    el("rect", { x: 12, y: 12, width: 186, height: 273, rx: 2, fill: "none", stroke: "#000", "stroke-width": ".5", "stroke-dasharray": "2 1.6" }, s);
    // lampadine lungo la cornice
    for (let x = 20; x <= 190; x += 10) { el("circle", { cx: x, cy: 16.5, r: 1.6, fill: "#fff", stroke: "#000", "stroke-width": ".45" }, s); el("circle", { cx: x, cy: 280.5, r: 1.6, fill: "#fff", stroke: "#000", "stroke-width": ".45" }, s); }
    for (let y = 26; y <= 272; y += 10) { el("circle", { cx: 16.5, cy: y, r: 1.6, fill: "#fff", stroke: "#000", "stroke-width": ".45" }, s); el("circle", { cx: 193.5, cy: y, r: 1.6, fill: "#fff", stroke: "#000", "stroke-width": ".45" }, s); }
    // tendalino a strisce con smerlo
    const t = el("g", { stroke: "#000", "stroke-width": ".6", fill: "#fff" }, s);
    const L = 32, R = 178, top = 24, bot = 40, n = 10, w = (R - L) / n;
    let d = `M${L} ${top}H${R}V${bot}`;
    for (let i = n - 1; i >= 0; i--) d += `A${w / 2} ${w / 2.6} 0 0 1 ${L + i * w} ${bot}`;
    el("path", { d: d + "Z" }, t);
    for (let i = 1; i < n; i++) el("path", { d: `M${L + i * w} ${top}V${bot}` }, t);
    el("path", { d: `M${L - 3} ${top}H${R + 3}`, "stroke-width": "1.4", "stroke-linecap": "round" }, t);
    // stemma con la W
    el("circle", { cx: 105, cy: 44, r: 13, fill: "#fff", stroke: "#000", "stroke-width": "1" }, s);
    el("circle", { cx: 105, cy: 44, r: 10.6, fill: "none", stroke: "#000", "stroke-width": ".4" }, s);
    el("text", { x: 105, y: 51, "font-size": "19", "font-weight": "700", "text-anchor": "middle", fill: "#fff", stroke: "#000", "stroke-width": ".7" }, s, "W");
    // titolo con lettere vuote
    el("text", { x: 105, y: 82, "font-size": "21", "font-weight": "700", "text-anchor": "middle", "letter-spacing": "1.5", fill: "#fff", stroke: "#000", "stroke-width": ".6" }, s, "DIPLOMA");
    el("text", { x: 105, y: 94, "font-size": "8", "font-weight": "600", "text-anchor": "middle", "letter-spacing": ".6", fill: "#000" }, s, "di Aiutante del Mimo");
    star(s, 42, 86, 5); star(s, 168, 86, 5);
    el("text", { x: 105, y: 113, "font-size": "6.5", "text-anchor": "middle", "font-style": "italic", "font-family": "'Cormorant Garamond', Georgia, serif", fill: "#000" }, s, "Si certifica che");
    fitText(s, 105, 134, nome || " ", 17, 150, { "font-weight": "700", fill: "#fff", stroke: "#000", "stroke-width": ".55" });
    el("path", { d: "M35 140H175", stroke: "#000", "stroke-width": ".5" }, s);
    const lines = ["ha aiutato Wondy durante lo spettacolo:", "ha riso, applaudito e parlato con le mani,", "senza dire nemmeno una parola!"];
    lines.forEach((l, i) => el("text", { x: 105, y: 154 + i * 8, "font-size": "6.2", "text-anchor": "middle", "font-family": "'Cormorant Garamond', Georgia, serif", "font-weight": "600", fill: "#000" }, s, l));
    // Wondy stilizzato e il girasole
    const f = el("g", { stroke: "#000", "stroke-width": ".8", fill: "#fff", "stroke-linecap": "round" }, s);
    el("circle", { cx: 88, cy: 210, r: 22 }, f);
    el("path", { d: "M70 202c2-13 15-19 24-14 5-5 13-3 13 5-4-1-6 0-7 1 4 1 5 5 5 8-8-7-21-8-35 0z" }, f);
    el("path", { d: "M78 204q3-3 6 0M92 204q3-3 6 0", fill: "none" }, f);
    el("circle", { cx: 81, cy: 209, r: 1.5, fill: "#000" }, f); el("circle", { cx: 95, cy: 209, r: 1.5, fill: "#000" }, f);
    nose(f, 88, 215, 6);
    el("path", { d: "M79 222q9 7 18 0", fill: "none" }, f);
    el("path", { d: "M88 236l-11-6v12zM88 236l11-6v12z" }, f);
    el("circle", { cx: 88, cy: 236, r: 2.4 }, f);
    sunflower(s, 128, 200, 13, true);
    star(s, 60, 190, 4); star(s, 152, 236, 3.5); star(s, 112, 182, 3);
    // data e firma
    el("path", { d: "M30 262H90M120 262H180", stroke: "#000", "stroke-width": ".5" }, s);
    el("text", { x: 60, y: 258, "font-size": "6", "text-anchor": "middle", "font-family": "'Cormorant Garamond', Georgia, serif", "font-weight": "600", fill: "#000" }, s, date ? fmtLong(date) : "");
    logo(s, 150, 253.5, 12, true);
    el("text", { x: 60, y: 268, "font-size": "3.6", "text-anchor": "middle", "letter-spacing": ".4", fill: "#000" }, s, "DATA");
    el("text", { x: 150, y: 268, "font-size": "3.6", "text-anchor": "middle", "letter-spacing": ".4", fill: "#000" }, s, "IL MIMO");
    hallmark(s, 105, 289, 3, "#000", "#fff");
    return s;
  }

  /* ---------- CALENDARIO DELL'ATTESA (A4) ---------- */
  function buildCalendar(festa, start, count) {
    const s = a4();
    el("rect", { x: 0, y: 0, width: 210, height: 297, fill: "#fff" }, s);
    el("rect", { x: 8, y: 8, width: 194, height: 281, rx: 6, fill: "none", stroke: "#000", "stroke-width": "1.2" }, s);
    el("text", { x: 105, y: 30, "font-size": "10", "font-weight": "700", "text-anchor": "middle", fill: "#000" }, s, "Mancano");
    el("text", { x: 105, y: 56, "font-size": "28", "font-weight": "700", "text-anchor": "middle", fill: "#fff", stroke: "#000", "stroke-width": ".8" }, s, String(count) + (count === 1 ? " naso" : " nasi"));
    el("text", { x: 105, y: 68, "font-size": "10", "font-weight": "700", "text-anchor": "middle", fill: "#000" }, s, "alla festa!");
    el("text", { x: 105, y: 78, "font-size": "5.6", "text-anchor": "middle", "font-family": "'Cormorant Garamond', Georgia, serif", "font-style": "italic", "font-weight": "600", fill: "#000" }, s, "Ogni sera colora un naso. Quando li hai colorati tutti, è il giorno della festa!");
    const cols = count <= 2 ? count : count <= 6 ? 3 : 4;
    const rows = Math.ceil(count / cols);
    const gx = 20, gy = 86, gw = 170, gh = 152;
    const cell = Math.min(gw / cols, gh / rows, 56);
    const ox = gx + (gw - cell * cols) / 2, oy = gy + (gh - cell * rows) / 2;
    for (let i = 0; i < count; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      const cx = ox + cell * c + cell / 2, cy = oy + cell * r + cell * .42;
      const nr = cell * .3;
      nose(s, cx, cy, nr);
      el("text", { x: cx + nr * .12, y: cy + nr * .55, "font-size": (nr * .62).toFixed(2), "font-weight": "700", "text-anchor": "middle", fill: "none", stroke: "#000", "stroke-width": ".35" }, s, String(count - i));
      el("text", { x: cx, y: cy + nr + Math.min(6, cell * .14), "font-size": Math.min(4.6, cell * .1).toFixed(2), "text-anchor": "middle", "font-family": "'Instrument Sans', system-ui, sans-serif", fill: "#000" }, s, fmtShort(addDays(start, i)));
    }
    sunflower(s, 62, 258, 13, false);
    el("text", { x: 140, y: 256, "font-size": "14", "font-weight": "700", "text-anchor": "middle", fill: "#fff", stroke: "#000", "stroke-width": ".6" }, s, "FESTA!");
    el("text", { x: 140, y: 266, "font-size": "6", "text-anchor": "middle", "font-family": "'Cormorant Garamond', Georgia, serif", "font-weight": "600", fill: "#000" }, s, fmtLong(festa));
    star(s, 30, 30, 5); star(s, 180, 30, 5); star(s, 100, 276, 3);
    logo(s, 140, 276, 11, true);
    hallmark(s, 105, 289, 3, "#000", "#fff");
    return s;
  }


  /* ---------- INVITI ALLA FESTA (4 per foglio A4, da ritagliare) ---------- */
  const INV_T = {
    it: { title: "Ti invito alla mia festa!", per: "Per", age: (n) => `Compio ${n} ${n === 1 ? "anno" : "anni"}!`, day: "Giorno", time: "Ore", place: "Dove", rsvp: "Rispondi a", show: "Con lo spettacolo di Wondy!" },
    en: { title: "You're invited to my party!", per: "To", age: (n) => `I'm turning ${n}!`, day: "Date", time: "Time", place: "Where", rsvp: "RSVP", show: "With Wondy's show!" },
    fr: { title: "Je t'invite à ma fête !", per: "Pour", age: (n) => `J'aurai ${n} ${n === 1 ? "an" : "ans"} !`, day: "Date", time: "Heure", place: "Où", rsvp: "Réponds à", show: "Avec le spectacle de Wondy !" },
    de: { title: "Ich lade dich zu meiner Feier ein!", per: "Für", age: (n) => `Ich werde ${n}!`, day: "Datum", time: "Uhrzeit", place: "Wo", rsvp: "Antwort an", show: "Mit der Show von Wondy!" },
    es: { title: "¡Te invito a mi fiesta!", per: "Para", age: (n) => `¡Cumplo ${n} ${n === 1 ? "año" : "años"}!`, day: "Día", time: "Hora", place: "Dónde", rsvp: "Confirma a", show: "¡Con el espectáculo de Wondy!" },
    mk: { title: "Те канам на мојот роденден!", per: "За", age: (n) => `Полнам ${n} ${n === 1 ? "година" : "години"}!`, day: "Датум", time: "Час", place: "Каде", rsvp: "Јави се на", show: "Со претставата на Wondy!" },
  };
  const curLang = () => (INV_T[document.documentElement.lang] ? document.documentElement.lang : "it");
  const INV_H = 143.5;

  /* un invito (100 × 143,5 mm) disegnato nel gruppo g */
  function drawInvite(g, d) {
    const L = curLang(), t = INV_T[L], col = d.color;
    const INK = col ? "#1E1A3A" : "#000", RED = col ? "#D7322B" : "#fff", GOLD = col ? "#B8862A" : "#000", FILLG = col ? "#E9B84A" : "#fff";
    const TITLE_F = L === "mk" ? "Forum, 'Cormorant Garamond', Georgia, serif" : "Cinzel, Georgia, serif";
    const SERIF = "'Cormorant Garamond', Georgia, serif";
    el("rect", { x: 0, y: 0, width: 100, height: INV_H, fill: col ? "#FFF8EC" : "#fff" }, g);
    el("rect", { x: 3.2, y: 3.2, width: 93.6, height: INV_H - 6.4, rx: 2.5, fill: "none", stroke: GOLD, "stroke-width": col ? ".7" : ".45" }, g);
    // tendalino a strisce
    const aw = el("g", { stroke: INK, "stroke-width": ".45" }, g);
    const AL = 12, AR = 88, top = 8, bot = 18, n = 8, w = (AR - AL) / n;
    for (let i = 0; i < n; i++) {
      const x0 = AL + i * w, x1 = x0 + w;
      el("path", { d: `M${x0} ${top}H${x1}V${bot}A${w / 2} ${w / 2.4} 0 0 1 ${x0} ${bot}Z`, fill: i % 2 ? "#fff" : RED }, aw);
    }
    el("path", { d: `M${AL - 3} ${top}H${AR + 3}`, stroke: INK, "stroke-width": "1.2", "stroke-linecap": "round" }, g);
    el("rect", { x: 38.5, y: 1.6, width: 23, height: 3.4, fill: col ? "#FFF8EC" : "#fff" }, g);
    logo(g, 50, 4.2, 6.4, !col);
    // "Per ______" da scrivere a mano
    el("text", { x: 12, y: 31, "font-size": "4.4", "font-family": SERIF, "font-style": "italic", "font-weight": "600", fill: INK }, g, t.per);
    el("path", { d: `M${14 + t.per.length * 2.1} 31.6H88`, stroke: INK, "stroke-width": ".3" }, g);
    // titolo, nome, anni
    fitText(g, 50, 42, t.title, 5.6, 82, { "font-family": TITLE_F, "font-weight": "700", fill: INK });
    if (d.nome) fitText(g, 50, 56.5, d.nome, 13, 80, { "font-family": TITLE_F, "font-weight": "700", fill: RED, stroke: INK, "stroke-width": col ? ".25" : ".45" });
    else el("path", { d: "M20 56.5H80", stroke: INK, "stroke-width": ".35" }, g);
    if (d.anni) el("text", { x: 50, y: 63.5, "font-size": "5.4", "text-anchor": "middle", "font-family": SERIF, "font-style": "italic", "font-weight": "700", fill: GOLD }, g, t.age(d.anni));
    // Wondy che fa giocoleria, il girasole e le stelle
    const art = el("g", { transform: "translate(0 4.5)" }, g);
    const f = el("g", { transform: "translate(38 81) scale(.42) translate(-88 -215)", stroke: INK, "stroke-width": "1.2", fill: "#fff", "stroke-linecap": "round", "stroke-linejoin": "round" }, art);
    el("circle", { cx: 88, cy: 210, r: 22 }, f);
    el("path", { d: "M70 202c2-13 15-19 24-14 5-5 13-3 13 5-4-1-6 0-7 1 4 1 5 5 5 8-8-7-21-8-35 0z", fill: col ? "#2A2140" : "#fff" }, f);
    el("path", { d: "M78 204q3-3 6 0M92 204q3-3 6 0", fill: "none" }, f);
    el("circle", { cx: 81, cy: 209, r: 1.5, fill: INK }, f); el("circle", { cx: 95, cy: 209, r: 1.5, fill: INK }, f);
    el("circle", { cx: 88, cy: 215, r: 6, fill: RED }, f);
    el("ellipse", { cx: 86, cy: 213, rx: 1.8, ry: 1.1, transform: "rotate(-35 86 213)", fill: "#fff", stroke: col ? "none" : INK, "stroke-width": ".4" }, f);
    el("path", { d: "M79 222q9 7 18 0", fill: "none" }, f);
    el("path", { d: "M88 236l-11-6v12zM88 236l11-6v12z", fill: RED }, f);
    el("circle", { cx: 88, cy: 236, r: 2.4, fill: RED }, f);
    // palline in aria
    [[27, 70, RED], [38, 66, FILLG], [49, 70, col ? "#3E7BC4" : "#fff"]].forEach(([x, y, c]) => el("circle", { cx: x, cy: y, r: 2.3, fill: c, stroke: INK, "stroke-width": ".4" }, art));
    el("path", { d: "M27 73.5Q38 60 49 73.5", fill: "none", stroke: INK, "stroke-width": ".25", "stroke-dasharray": ".8 1" }, art);
    // girasole
    const sf = el("g", {}, art);
    sunflower(sf, 68, 77, 7.2, true);
    if (col) {
      sf.querySelectorAll("ellipse").forEach((e) => e.setAttribute("fill", FILLG));
      sf.querySelectorAll("circle").forEach((e) => e.setAttribute("fill", "#7A4A22"));
      sf.querySelectorAll("path").forEach((e, i) => { e.setAttribute("stroke", INK); if (i) e.setAttribute("fill", "#7DB35A"); });
    }
    star(art, 82, 70, 2.6); star(art, 18, 84, 2.2); star(art, 56, 90, 1.8);
    if (col) art.querySelectorAll("path[stroke-linejoin]").forEach((e) => e.setAttribute("fill", FILLG));
    // righe: giorno, ora, dove, rispondi a
    const rows = [[t.day, d.data ? (W.dateLabel ? W.dateLabel(toISO(d.data), false) : d.data.toLocaleDateString(L, { weekday: "long", day: "numeric", month: "long" })) : ""], [t.time, d.ora], [t.place, d.dove], [t.rsvp, d.rsvp]];
    /* solo l'indirizzo può andare su due righe: le altre restano su una, rimpicciolite */
    const twoL = (v, i) => i === 2 && v && v.length > 26 && v.includes(" ");
    let y = twoL(rows[2][1], 2) ? 103 : 105.5;
    rows.forEach(([lab, val], i) => {
      if (i) y += 8.4;
      if (twoL(val, i)) y += 3.8;
      el("text", { x: 10, y, "font-size": "3.1", "font-weight": "700", "letter-spacing": ".25", "font-family": TITLE_F, fill: GOLD }, g, lab.toUpperCase());
      const lx = 12 + Math.max(14, lab.length * 2.55);
      el("path", { d: `M${lx} ${y + 1.1}H90`, stroke: INK, "stroke-width": ".25" }, g);
      const vw = 90 - lx - 2, va = { "font-family": SERIF, "font-weight": "700", fill: INK };
      /* testo lungo (di solito l'indirizzo): va su due righe invece di diventare minuscolo */
      if (twoL(val, i)) {
        const mid = val.length / 2;
        let cut = -1;
        for (let k = 0; k < val.length; k++) if (val[k] === " " && (cut < 0 || Math.abs(k - mid) < Math.abs(cut - mid))) cut = k;
        const a = val.slice(0, cut).trim(), b = val.slice(cut + 1).trim();
        const size = Math.min(4.2, vw / (Math.max(a.length, b.length) * 0.5));
        el("text", Object.assign({ x: (lx + 90) / 2, y: y - size * 1.05, "font-size": size.toFixed(2), "text-anchor": "middle" }, va), g, a);
        el("text", Object.assign({ x: (lx + 90) / 2, y, "font-size": size.toFixed(2), "text-anchor": "middle" }, va), g, b);
      } else if (val) {
        el("text", Object.assign({ x: (lx + 90) / 2, y, "font-size": Math.min(5, vw / (val.length * 0.5)).toFixed(2), "text-anchor": "middle" }, va), g, val);
      }
    });
    // chiusura
    if (d.show) fitText(g, 50, 137.6, t.show, 3.9, 80, { "font-family": TITLE_F, "font-weight": "700", fill: col ? RED : INK });
    else { star(g, 42, 136.2, 1.6); star(g, 50, 135.8, 2.2); star(g, 58, 136.2, 1.6); }
    if (col) g.querySelectorAll(":scope > path[stroke-linejoin]").forEach((e) => e.setAttribute("fill", FILLG));
    hallmark(g, 50, INV_H - 3.2, 2.4, INK, col ? "#FFF8EC" : "#fff");
  }
  function buildInvitePreview(d) {
    const s = el("svg", { xmlns: SVGNS, viewBox: `0 0 100 ${INV_H}`, "aria-hidden": "true", "font-family": "Cinzel, Georgia, serif" });
    drawInvite(s, d);
    return s;
  }
  function buildInviteSheet(d) {
    const s = a4();
    el("rect", { x: 0, y: 0, width: 210, height: 297, fill: "#fff" }, s);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) drawInvite(el("g", { transform: `translate(${5 + c * 100} ${5 + r * INV_H})` }, s), d);
    // linee da ritagliare
    const cut = { stroke: "#777", "stroke-width": ".3", "stroke-dasharray": "2 1.4", fill: "none" };
    el("rect", Object.assign({ x: 5, y: 5, width: 200, height: 2 * INV_H }, cut), s);
    el("path", Object.assign({ d: `M105 5V${5 + 2 * INV_H}M5 ${5 + INV_H}H205` }, cut), s);
    el("text", { x: 1, y: 5 + INV_H + 1.6, "font-size": "4.6", fill: "#777", "font-family": "system-ui, sans-serif" }, s, "✂");
    return s;
  }

  /* il logo caricato una volta sola, per il biglietto e prima di stampare */
  let logoP = null;
  function logoImg() {
    if (!logoP) logoP = new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = LOGO; });
    return logoP;
  }

  /* ---------- stampa: solo il foglio scelto ---------- */
  function printSheet(svg) {
    document.getElementById("fam-print-root")?.remove();
    const root = document.createElement("div");
    root.id = "fam-print-root";
    const copia = svg.cloneNode(true);
    copia.querySelectorAll("filter.fam-logo-nero").forEach((f) => {
      const id = "fam-logo-nero-" + ++logoN, old = f.id;
      f.id = id;
      copia.querySelectorAll(`[filter="url(#${old})"]`).forEach((n) => n.setAttribute("filter", `url(#${id})`));
    });
    root.appendChild(copia);
    document.body.appendChild(root);
    document.documentElement.classList.add("fam-printing");
    const done = () => { root.remove(); document.documentElement.classList.remove("fam-printing"); };
    addEventListener("afterprint", done, { once: true });
    const go = () => window.print();
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.all([fonts, logoImg()]).then(go, go);
  }

  /* ---------- BIGLIETTO (canvas → PNG) ---------- */
  async function drawTicket(cv, nome, festa) {
    try { await Promise.all(["700 100px Cinzel", "600 40px Cinzel", "italic 600 40px 'Cormorant Garamond'", "500 30px 'Instrument Sans'"].map((f) => document.fonts.load(f))); } catch (e) {}
    const lg = await logoImg(); // prima di cancellare la tela: due disegni in parallelo non si sovrappongono
    const c = cv.getContext("2d");
    const Wd = cv.width, H = cv.height, SPLIT = 1030, R = 34;
    c.clearRect(0, 0, Wd, H);
    // sagoma con angoli tondi e tacche della perforazione
    c.save();
    c.beginPath();
    if (c.roundRect) c.roundRect(10, 10, Wd - 20, H - 20, 28); else c.rect(10, 10, Wd - 20, H - 20);
    c.fillStyle = "#1A1528"; c.fill();
    c.globalCompositeOperation = "destination-out";
    c.beginPath(); c.arc(SPLIT, 10, R, 0, Math.PI * 2); c.arc(SPLIT, H - 10, R, 0, Math.PI * 2); c.fill();
    c.restore();
    // velluto rosso sulla parte principale
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#2A1424"); g.addColorStop(1, "#14101C");
    c.fillStyle = g;
    c.beginPath(); if (c.roundRect) c.roundRect(34, 34, SPLIT - 80, H - 68, 18); else c.rect(34, 34, SPLIT - 80, H - 68); c.fill();
    c.strokeStyle = "#E2B04A"; c.lineWidth = 3; c.stroke();
    // lampadine
    c.fillStyle = "#FBE7A1";
    for (let x = 60; x < SPLIT - 50; x += 40) { dot(c, x, 34, 6); dot(c, x, H - 34, 6); }
    for (let y = 74; y < H - 50; y += 40) { dot(c, 34, y, 6); dot(c, SPLIT - 46, y, 6); }
    // testi
    const gold = c.createLinearGradient(0, 120, 0, 420);
    gold.addColorStop(0, "#FBE7A1"); gold.addColorStop(.45, "#E2B04A"); gold.addColorStop(.7, "#A8741F"); gold.addColorStop(1, "#F0CF77");
    const mid = (SPLIT - 12) / 2 + 6;
    c.textAlign = "center"; c.textBaseline = "alphabetic";
    if (lg) c.drawImage(lg, mid - 110, 52, 220, 220 / LOGO_R);
    else { c.fillStyle = "#E2B04A"; c.font = "600 34px Cinzel, Georgia, serif"; spaced(c, "IL CIRCO DI WONDY", mid, 118, 6); }
    c.fillStyle = "#BDB3CC"; c.font = "italic 600 40px 'Cormorant Garamond', Georgia, serif";
    c.fillText("Biglietto ricordo · ingresso d'onore per", mid, 178);
    const txt = (nome || "il festeggiato").toUpperCase();
    let size = 120;
    c.font = `700 ${size}px Cinzel, Georgia, serif`;
    while (c.measureText(txt).width > SPLIT - 200 && size > 40) { size -= 4; c.font = `700 ${size}px Cinzel, Georgia, serif`; }
    c.fillStyle = gold; c.shadowColor = "rgba(226,176,74,.45)"; c.shadowBlur = 24;
    c.fillText(txt, mid, 330);
    c.shadowBlur = 0;
    c.fillStyle = "#F4EEE4"; c.font = "italic 600 44px 'Cormorant Garamond', Georgia, serif";
    c.fillText(festa ? "Festa del " + fmtLong(festa) : "Festa di compleanno", mid, 410);
    c.fillStyle = "#BDB3CC"; c.font = "500 24px 'Instrument Sans', system-ui, sans-serif";
    spaced(c, "CLOWN  ✦  PHYSICAL ACTOR  ✦  FANTASISTA", mid, 520, 2);
    noseC(c, 150, 420, 38); flowerC(c, SPLIT - 150, 420, 40);
    // perforazione
    c.strokeStyle = "rgba(243,213,138,.6)"; c.lineWidth = 3; c.setLineDash([10, 12]);
    c.beginPath(); c.moveTo(SPLIT, 50); c.lineTo(SPLIT, H - 50); c.stroke(); c.setLineDash([]);
    // talloncino con la W del tendalino
    const sx = SPLIT + (Wd - 10 - SPLIT) / 2;
    c.fillStyle = "#1E2A5A"; c.beginPath(); c.arc(sx, 230, 98, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#E2B04A"; c.lineWidth = 6; c.stroke();
    c.strokeStyle = "rgba(226,176,74,.35)"; c.lineWidth = 2; c.beginPath(); c.arc(sx, 230, 84, 0, Math.PI * 2); c.stroke();
    c.fillStyle = "#E0303A"; c.font = "700 120px Cinzel, Georgia, serif"; c.fillText("W", sx, 272);
    c.fillStyle = "#E2B04A"; c.font = "600 30px Cinzel, Georgia, serif"; spaced(c, "AMMETTE 1", sx, 396, 3);
    c.fillStyle = "#BDB3CC"; c.font = "italic 600 34px 'Cormorant Garamond', Georgia, serif"; c.fillText("posto in prima fila", sx, 446);
    c.fillStyle = "#F3D58A"; c.font = "500 24px 'Instrument Sans', system-ui, sans-serif";
    c.fillText("N° " + (festa ? pad(festa.getDate()) + pad(festa.getMonth() + 1) : "0001"), sx, 520);
    c.fillStyle = "#8E84A3"; c.font = "500 19px 'Instrument Sans', system-ui, sans-serif";
    c.fillText("wondyofficial.github.io", sx, 556);
    cv.setAttribute("aria-label", `Biglietto ricordo del Circo di Wondy per ${nome || "il festeggiato"}${festa ? ", festa del " + fmtLong(festa) : ""}`);
  }
  function dot(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
  function spaced(c, s, x, y, sp) {
    if ("letterSpacing" in c) { c.letterSpacing = sp + "px"; c.fillText(s, x + sp / 2, y); c.letterSpacing = "0px"; } else c.fillText(s, x, y);
  }
  function noseC(c, x, y, r) {
    c.fillStyle = "#D8352B"; dot(c, x, y, r);
    c.fillStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.ellipse(x - r * .35, y - r * .35, r * .32, r * .2, -0.6, 0, Math.PI * 2); c.fill();
  }
  function flowerC(c, x, y, r) {
    c.fillStyle = "#F3C33B";
    for (let i = 0; i < 10; i++) { c.save(); c.translate(x, y); c.rotate(i * Math.PI / 5); c.beginPath(); c.ellipse(0, -r * .72, r * .24, r * .42, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
    c.fillStyle = "#6B3E1E"; dot(c, x, y, r * .42);
  }

  /* ============================================================ */
  function init() {
    const view = document.querySelector('[data-view="famiglie"]');
    if (!view) return;
    const $ = (s) => view.querySelector(s);
    const $$ = (s) => [...view.querySelectorAll(s)];

    /* indice interno: scorre senza cambiare l'hash (che è del router) */
    $$(".fam-index a").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      const t = document.getElementById(a.getAttribute("href").slice(1));
      if (!t) return;
      t.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" });
      const h = t.querySelector("h3"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    }));

    /* ---------- nome condiviso tra i campi ---------- */
    const nameInputs = $$("[data-fam-name]");
    const partyInputs = $$("[data-fam-party]");
    function setName(v, from) {
      state.nome = cleanName(v, 24); persist();
      nameInputs.forEach((i) => { if (i !== from) i.value = state.nome.slice(0, +i.maxLength || 24); });
      renderDiploma(); renderInvite(); scheduleTicket();
    }
    function setParty(v, from) {
      state.festa = fromISO(v) ? v : ""; persist();
      partyInputs.forEach((i) => { if (i !== from) i.value = state.festa; });
      renderCalendar(); renderInvite(); scheduleTicket();
    }
    nameInputs.forEach((i) => i.addEventListener("input", () => setName(i.value, i)));
    partyInputs.forEach((i) => {
      i.min = toISO(today());
      i.addEventListener("change", () => setParty(i.value, i));
      i.addEventListener("input", () => { if (fromISO(i.value)) setParty(i.value, i); });
    });

    /* ---------- 2 · storia a tavole ---------- */
    const track = $("[data-fam-track]");
    const slides = $$(".fam-slide");
    const dotsBox = $("[data-fam-dots]");
    const storyLive = $("[data-fam-story-live]");
    let cur = 0;
    const dots = slides.map((s, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "fam-dot";
      b.setAttribute("aria-label", "Tavola " + (i + 1));
      b.addEventListener("click", () => go(i));
      dotsBox.appendChild(b);
      return b;
    });
    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: reduce.matches ? "auto" : "smooth" });
      mark(i, true);
    }
    function mark(i, announce) {
      if (i === cur && !announce) return;
      cur = i;
      dots.forEach((d, k) => d.setAttribute("aria-current", k === i ? "true" : "false"));
      $("[data-fam-prev]").disabled = i === 0;
      $("[data-fam-next]").disabled = i === slides.length - 1;
      if (announce) storyLive.textContent = `Tavola ${i + 1} di ${slides.length}: ${slides[i].querySelector(".fam-slide__t").textContent} ${slides[i].querySelector(".fam-slide__s").textContent}`;
    }
    $("[data-fam-prev]").addEventListener("click", () => go(cur - 1));
    $("[data-fam-next]").addEventListener("click", () => go(cur + 1));
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); }
    });
    let st;
    track.addEventListener("scroll", () => {
      clearTimeout(st);
      st = setTimeout(() => {
        const x = track.scrollLeft, base = slides[0].offsetLeft;
        let i = 0, best = Infinity;
        slides.forEach((sl, k) => { const dd = Math.abs(sl.offsetLeft - base - x); if (dd < best) { best = dd; i = k; } });
        if (x + track.clientWidth >= track.scrollWidth - 4) i = slides.length - 1;
        mark(Math.max(0, Math.min(slides.length - 1, i)), false);
      }, 80);
    }, { passive: true });
    cur = -1; mark(0, false);

    /* ---------- 3 · insegna con il nome ---------- */
    const sign = $("[data-fam-sign]");
    const show = $("[data-fam-show]");
    const bulbs = $("[data-fam-bulbs]");
    const signName = $("[data-fam-sign-name]");
    const signLive = $("[data-fam-sign-live]");
    const NB = 22;
    for (let i = 0; i < NB; i++) { const b = document.createElement("i"); b.style.setProperty("--i", i); bulbs.appendChild(b); }
    let timers = [];
    function lightSign(nome) {
      timers.forEach(clearTimeout); timers = [];
      show.classList.remove("is-on", "is-bow");
      void show.offsetWidth;
      signName.textContent = "";
      [...nome].forEach((ch, i) => { const s = document.createElement("span"); s.textContent = ch; s.style.setProperty("--i", i); signName.appendChild(s); });
      signName.style.setProperty("--len", Math.max(4, nome.length));
      show.classList.add("is-on");
      const bowAt = reduce.matches ? 0 : NB * 70 + nome.length * 90 + 300;
      timers.push(setTimeout(() => {
        show.classList.add("is-bow");
        signLive.textContent = `Stasera in scena: ${nome}! Wondy si inchina e dedica il girasole a ${nome}.`;
      }, bowAt));
    }
    $("[data-fam-sign-form]").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#fam-nome-in");
      const nome = cleanName(input.value, 16);
      if (!nome) { signLive.textContent = "Scrivi prima il tuo nome, poi tocca Accendi."; input.focus(); return; }
      setName(nome, input);
      lightSign(nome);
      input.blur(); // chiude la tastiera sul telefono, così si vede l'insegna
      sign.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "center" });
    });

    /* ---------- 4·0 · inviti alla festa ---------- */
    const invPrev = $("[data-fam-inv-preview]");
    function inviteData() {
      const anni = parseInt($("#fam-inv-anni").value, 10);
      return {
        nome: cleanName($("#fam-inv-nome").value, 16),
        anni: anni >= 1 && anni <= 18 ? anni : 0,
        data: fromISO(state.festa),
        ora: cleanName($("#fam-inv-ora").value, 5),
        dove: cleanName($("#fam-inv-dove").value, 44),
        rsvp: cleanName($("#fam-inv-rsvp").value, 34),
        show: $("#fam-inv-show").checked,
        color: (view.querySelector('input[name="fam-inv-style"]:checked') || {}).value !== "bn",
      };
    }
    function renderInvite() { invPrev.replaceChildren(buildInvitePreview(inviteData())); }
    $$("[data-fam-inv]").forEach((i) => i.addEventListener(i.type === "text" || i.type === "number" ? "input" : "change", renderInvite));
    $("[data-fam-inv-print]").addEventListener("click", () => printSheet(buildInviteSheet(inviteData())));
    document.addEventListener("wondy:change", renderInvite);

    /* ---------- 4a · diploma ---------- */
    const dipDate = $("[data-fam-dip-date]");
    const dipPrev = $("[data-fam-dip-preview]");
    dipDate.value = toISO(today());
    let dipSvg = null;
    function renderDiploma() {
      dipSvg = buildDiploma(cleanName($("#fam-dip-nome").value, 24), fromISO(dipDate.value));
      dipPrev.replaceChildren(dipSvg);
    }
    dipDate.addEventListener("input", renderDiploma);
    $("[data-fam-dip-print]").addEventListener("click", () => { renderDiploma(); printSheet(dipSvg); });

    /* ---------- 4b · calendario ---------- */
    const calPrev = $("[data-fam-cal-preview]");
    const calStatus = $("[data-fam-cal-status]");
    const calPrint = $("[data-fam-cal-print]");
    let calSvg = null;
    function renderCalendar() {
      const festa = fromISO(state.festa);
      calSvg = null; calPrev.hidden = true; calPrint.hidden = true;
      if (!festa) { calStatus.textContent = "Scegli il giorno della festa: preparo i nasi da colorare."; return; }
      const left = daysBetween(today(), festa);
      if (left < 0) { calStatus.textContent = "Questa data è già passata: scegline una nei prossimi giorni."; return; }
      if (left === 0) { calStatus.textContent = "La festa è oggi! Niente nasi da aspettare: buon divertimento!"; return; }
      const count = Math.min(14, left);
      const start = addDays(festa, -count);
      calSvg = buildCalendar(festa, start, count);
      calPrev.replaceChildren(calSvg);
      calPrev.setAttribute("aria-label", `Anteprima: ${count} nasi da colorare, dal ${fmtLong(start)} alla festa del ${fmtLong(festa)}`);
      calPrev.hidden = false; calPrint.hidden = false;
      calStatus.textContent = left > 14
        ? `La festa è tra ${left} giorni. Il calendario conta gli ultimi 14: si comincia a colorare il ${fmtLong(start)}.`
        : `Mancano ${count} ${count === 1 ? "naso" : "nasi"} alla festa del ${fmtLong(festa)}. Il primo si colora stasera!`;
    }
    calPrint.addEventListener("click", () => { if (calSvg) printSheet(calSvg); });

    /* ---------- 4c · biglietto ---------- */
    const cv = $("[data-fam-ticket]");
    const tixStatus = $("[data-fam-tix-status]");
    let raf = 0;
    function scheduleTicket() { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => drawTicket(cv, cleanName($("#fam-tix-nome").value, 24), fromISO(state.festa))); }
    $("[data-fam-tix-dl]").addEventListener("click", async () => {
      const nome = cleanName($("#fam-tix-nome").value, 24);
      await drawTicket(cv, nome, fromISO(state.festa));
      const file = "biglietto-wondy" + (nome ? "-" + nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "") + ".png";
      const save = (url, revoke) => {
        const a = document.createElement("a");
        a.href = url; a.download = file; document.body.appendChild(a); a.click(); a.remove();
        if (revoke) setTimeout(() => URL.revokeObjectURL(url), 4000);
        tixStatus.textContent = "Biglietto pronto: lo trovi tra i download.";
      };
      if (cv.toBlob) cv.toBlob((b) => (b ? save(URL.createObjectURL(b), true) : save(cv.toDataURL("image/png"))), "image/png");
      else save(cv.toDataURL("image/png"));
    });

    /* valori iniziali dalla sessione */
    nameInputs.forEach((i) => { i.value = state.nome.slice(0, +i.maxLength || 24); });
    partyInputs.forEach((i) => { i.value = fromISO(state.festa) ? state.festa : ""; });
    renderDiploma(); renderCalendar(); renderInvite(); scheduleTicket();
    if (document.fonts) document.fonts.ready.then(() => { scheduleTicket(); renderInvite(); });

    /* ---------- API: apre il biglietto già compilato ---------- */
    let pendingTicket = false;
    function focusTicket() {
      const box = document.getElementById("fam-biglietto");
      box.scrollIntoView({ behavior: "auto", block: "start" });
      $("#fam-tix-h").focus({ preventScroll: true });
    }
    W.ticket = function (nome, dataISO) {
      state.nome = cleanName(nome, 24);
      if (fromISO(dataISO)) state.festa = String(dataISO);
      persist();
      nameInputs.forEach((i) => { i.value = state.nome.slice(0, +i.maxLength || 24); });
      partyInputs.forEach((i) => { i.value = state.festa; });
      renderDiploma(); renderCalendar(); scheduleTicket();
      if (document.body.dataset.current === "famiglie" && !view.hidden) { focusTicket(); return; }
      pendingTicket = true;
      location.hash = "#famiglie";
    };
    document.addEventListener("wondy:view", (e) => {
      if (e.detail !== "famiglie") return;
      scheduleTicket();
      if (pendingTicket) { pendingTicket = false; setTimeout(focusTicket, 30); }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

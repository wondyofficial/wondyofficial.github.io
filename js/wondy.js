/* ============================================================
   MOTION + WONDY DIGITALE
   - sipario d'apertura, comparse allo scroll, scintille nell'hero
   - striscia con i prossimi giorni liberi (dal calendario vero)
   - il clown digitale che fa i dispetti
   Tutto si spegne se il telefono chiede "riduci movimento".
   ============================================================ */
(function () {
  const W = window.Wondy;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const currentView = () => document.body.dataset.current || "home";

  /* ---------- 1. sipario d'apertura (la classe js-intro la mette lo script in <head>) ---------- */
  const root = document.documentElement;
  const introOn = root.classList.contains("js-intro");
  if (introOn) setTimeout(() => root.classList.remove("js-intro"), 1500);

  /* ---------- 2. comparse allo scroll ---------- */
  function setupReveal() {
    const groups = [".hero__content > *", ".hero__ctas > *", ".links > *", ".roles__list li", ".gallery figure"];
    groups.forEach((sel) => $$(sel).forEach((el, i) => el.style.setProperty("--d", (i * 0.08).toFixed(2) + "s")));
    const targets = $$(".reveal, .roles__list li, .gallery figure");
    if (reduce || !("IntersectionObserver" in window)) { targets.forEach((t) => t.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    /* durante il sipario aspetta, così la comparsa si vede */
    targets.forEach((t) => io.observe(t));
  }

  /* ---------- 3. scintille dorate nell'hero ---------- */
  function setupSparks() {
    const cv = $(".hero__sparks");
    if (!cv || reduce) return;
    const ctx = cv.getContext("2d");
    let w = 0, h = 0, dpr = 1, parts = [], running = false, visible = true;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (init) => ({ x: Math.random() * w, y: init ? Math.random() * h : h + 10, r: rand(0.6, 2.2), vy: rand(0.15, 0.6), vx: rand(-0.15, 0.15), t: Math.random() * 6.28, s: rand(0.02, 0.05) });
    /* la scintilla (con alone) si disegna una volta sola, poi si copia: molto più leggero */
    const sprite = document.createElement("canvas"); sprite.width = sprite.height = 24;
    const sctx = sprite.getContext("2d"), g = sctx.createRadialGradient(12, 12, 0, 12, 12, 12);
    g.addColorStop(0, "rgba(255,244,214,1)"); g.addColorStop(.25, "rgba(243,213,138,.9)"); g.addColorStop(1, "rgba(243,213,138,0)");
    sctx.fillStyle = g; sctx.fillRect(0, 0, 24, 24);
    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y -= p.vy; p.x += p.vx + Math.sin(p.t) * 0.15; p.t += p.s;
        if (p.y < -10) Object.assign(p, spawn(false));
        ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(p.t));
        const s = p.r * 6; ctx.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    };
    const update = () => {
      const should = visible && document.visibilityState === "visible" && currentView() === "home";
      if (should && !running) { running = true; requestAnimationFrame(frame); }
      if (!should) running = false;
    };
    resize(); parts = Array.from({ length: w < 500 ? 22 : 50 }, () => spawn(true));
    addEventListener("resize", () => { if (cv.clientWidth !== w) resize(); });
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; update(); }).observe(cv);
    document.addEventListener("visibilitychange", update);
    document.addEventListener("wondy:view", update);
    update();
  }

  /* ---------- 4. freccia "scopri" ---------- */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-scroll-to]");
    if (!b) return;
    document.getElementById(b.dataset.scrollTo)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });

  /* ---------- 5. striscia con i prossimi giorni liberi ---------- */
  function buildTicker() {
    const track = $("[data-ticker]");
    if (!track) return;
    const days = W.freeDays || [];
    if (!days.length) return;
    const isWeekend = (k) => { const d = new Date(k + "T12:00:00Z").getUTCDay(); return d === 0 || d === 6; };
    let list = days.filter(isWeekend).slice(0, 8);
    if (list.length < 6) list = list.concat(days.filter((k) => !isWeekend(k)).slice(0, 6 - list.length)).sort();
    const items = list.map((k) => `<b>${W.esc(W.dateLabel(k, true))}</b>`).join("<i>✦</i>") + "<i>✦</i>";
    track.innerHTML = `<span class="ticker__items">${items}</span><span class="ticker__items" aria-hidden="true">${items}</span>`;
    track.style.setProperty("--dur", Math.max(18, list.length * 4) + "s");
  }
  function initTicker() {
    const track = $("[data-ticker]");
    if (!track) return;
    const one = track.innerHTML;
    track.innerHTML = one + one.replace('class="ticker__items"', 'class="ticker__items" aria-hidden="true"');
    $(".ticker__label").textContent = "In scena";
  }
  initTicker();
  document.addEventListener("wondy:days", () => {
    buildTicker();
    if ((W.freeDays || []).length) $(".ticker__label").textContent = "Giorni liberi";
  });

  /* ---------- 6. coriandoli ---------- */
  const cf = $(".fx-confetti");
  const cctx = cf && cf.getContext("2d");
  let confetti = [], cfRunning = false;
  function confettiBurst(x, y, n = 90) {
    if (!cf || reduce) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cf.width = innerWidth * dpr; cf.height = innerHeight * dpr; cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ["#F3D58A", "#E2B04A", "#D8352B", "#FFF8EA", "#A6E9BA", "#7FB3FF"];
    for (let i = 0; i < n; i++) {
      const a = rand(-Math.PI * 0.95, -Math.PI * 0.05), sp = rand(5, 13);
      confetti.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: rand(0.18, 0.3), w: rand(5, 9), h: rand(8, 14), r: rand(0, 6.28), vr: rand(-0.3, 0.3), c: pick(colors), life: 0 });
    }
    if (!cfRunning) { cfRunning = true; requestAnimationFrame(cfFrame); }
  }
  function cfFrame() {
    cctx.clearRect(0, 0, innerWidth, innerHeight);
    confetti = confetti.filter((p) => p.y < innerHeight + 30 && p.life < 260);
    for (const p of confetti) {
      p.vy += p.g; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
      cctx.save(); cctx.translate(p.x, p.y); cctx.rotate(p.r); cctx.fillStyle = p.c;
      cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2))); cctx.restore();
    }
    if (confetti.length) requestAnimationFrame(cfFrame); else { cfRunning = false; cctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  W.confetti = confettiBurst;

  /* ============================================================
     7. WONDY DIGITALE — un mimo: non parla, si esprime con gesti e simboli
     ============================================================ */
  const wondy = $("[data-wondy]");
  if (!wondy) { setupReveal(); setupSparks(); return; }
  const signEl = $("[data-wondy-say]", wondy);
  const noseFx = $(".fx-nose");
  const lights = $(".fx-lights");
  const balls = $$(".w-balls circle", wondy);
  const armL = $(".w-arm--l", wondy), armR = $(".w-arm--r", wondy);
  let busy = false, lastUserAction = 0, signTimer = 0;
  try { if (sessionStorage.getItem("wondy-hidden")) wondy.classList.add("is-gone"); } catch (e) {}

  const POSES = ["is-waving", "is-reaching", "is-cheer", "is-giggle", "is-surprised", "is-noseless", "is-flower", "is-honk", "is-juggling", "is-balancing"];
  const pose = (...cls) => { wondy.classList.remove(...POSES); cls.forEach((c) => wondy.classList.add(c)); };
  const place = (lvl) => { wondy.classList.toggle("is-peek", lvl === "peek"); wondy.classList.toggle("is-out", lvl === "out"); };
  /* il fumetto mostra solo un simbolo: Wondy è muto */
  function sign(symbol, ms = 1800) {
    signEl.textContent = symbol;
    wondy.classList.add("is-talking");
    clearTimeout(signTimer);
    signTimer = setTimeout(() => wondy.classList.remove("is-talking"), ms);
  }
  const visibleIn = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.top > 70 && r.bottom < innerHeight - 60; };
  const wondyCenter = () => { const r = wondy.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.3 }; };

  /* dove può stare: nascosto mentre si compila il modulo o quando la barra aziende è aperta */
  function allowedHere() {
    if (wondy.classList.contains("is-gone")) return false;
    if (currentView() === "richiesta" || currentView() === "giochi") return false;
    if (innerWidth < 760 && Date.now() - lastUserAction < 1200 && scrollY > innerHeight * 0.5) return false;
    const bar = $("[data-cal-bar]");
    if (currentView() === "calendario" && bar && !bar.hidden) return false;
    return true;
  }
  function rest() { if (busy) return; pose(); place(allowedHere() ? "peek" : "none"); }

  /* ---------- i numeri e i dispetti ---------- */
  async function wave() {
    place("out"); pose("is-waving"); sign("♥", 2400);
    await sleep(2600);
  }
  async function juggle() {
    place("out"); pose("is-juggling"); sign("♪", 1400);
    const t0 = performance.now(), dur = 5200;
    await new Promise((res) => {
      const step = (t) => {
        const k = (t - t0) / 1000;
        balls.forEach((b, i) => {
          const p = (k * 0.9 + i / 3) % 1;                     // cascata a tre palline
          let x, y;
          if (p < 0.6) { const q = p / 0.6; x = 34 + 52 * q; y = 112 - 78 * Math.sin(Math.PI * q); }
          else { const q = (p - 0.6) / 0.4; x = 86 - 52 * q; y = 112 - 8 * Math.sin(Math.PI * q); }
          if (Math.floor(k * 0.9 + i / 3) % 2) x = 120 - x;    // alterna le mani
          b.setAttribute("cx", x.toFixed(1)); b.setAttribute("cy", y.toFixed(1));
        });
        const s = Math.sin(k * 11);
        armL.style.transform = `rotate(${8 + s * 10}deg)`; armR.style.transform = `rotate(${-8 + s * 10}deg)`;
        if (t - t0 < dur) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
    armL.style.transform = armR.style.transform = "";
    pose("is-cheer"); sign("✦", 1600);
    await sleep(1600);
  }
  /* equilibrismo: attraversa lo schermo con il fiore in equilibrio sul naso */
  async function balanceWalk() {
    const left = wondy.getBoundingClientRect().left;
    const dist = Math.max(0, left - 20);
    if (dist < 120) return flower();
    place("out"); pose("is-flower", "is-balancing"); sign("✿", 1400);
    await sleep(700);
    const walk = (from, to, ms) => wondy.animate([{ transform: `translate(${from}px, 6%)` }, { transform: `translate(${to}px, 6%)` }], { duration: ms, easing: "ease-in-out", fill: "forwards" }).finished.catch(() => {});
    await walk(0, -dist, Math.min(7000, dist * 18));
    pose("is-flower", "is-balancing", "is-surprised"); sign("!", 1100);
    await sleep(1100);
    pose("is-flower", "is-balancing");
    await walk(-dist, 0, Math.min(5000, dist * 13));
    wondy.getAnimations().forEach((a) => a.cancel());
    pose("is-cheer"); sign("✦", 1500);
    await sleep(1500);
  }
  async function steal() {
    const v = currentView();
    const target = $$(`[data-view="${v}"] .card-link, [data-view="${v}"] .book, [data-view="${v}"] .social, [data-view="${v}"] .ticket`).filter(visibleIn);
    if (!target.length) return juggle();
    const el = pick(target);
    const left = wondy.classList.contains("is-left");
    place("out"); pose("is-reaching"); sign("!", 1400);
    await sleep(350);
    el.style.setProperty("--tx", (left ? -1 : 1) * rand(36, 60) + "px");
    el.style.setProperty("--ty", rand(-10, 14) + "px");
    el.style.setProperty("--rot", (left ? -1 : 1) * rand(6, 14) + "deg");
    el.classList.add("is-stolen");
    await sleep(1900);
    el.classList.remove("is-stolen");
    pose("is-giggle"); sign("♥", 1600);
    await sleep(1800);
  }
  async function lightsOut() {
    place("out"); pose("is-surprised"); sign("?", 2600);
    lights.classList.add("is-on");
    const start = performance.now();
    await new Promise((res) => {
      const step = (t) => {
        const k = (t - start) / 1000;
        if (!lastPointer.fresh) { lights.style.setProperty("--lx", 50 + Math.sin(k * 1.7) * 32 + "%"); lights.style.setProperty("--ly", 45 + Math.cos(k * 1.3) * 22 + "%"); }
        if (t - start < 2800) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
    lights.classList.remove("is-on");
    pose("is-giggle"); sign("✦", 1500);
    await sleep(1600);
  }
  async function party() {
    place("out"); pose("is-cheer"); sign("✦", 1800);
    await sleep(250);
    const c = wondyCenter(); confettiBurst(c.x, c.y, 110);
    await sleep(2000);
  }
  async function loseNose() {
    place("out"); pose("is-noseless", "is-surprised"); sign("!!", 2400);
    const n = $(".w-nose", wondy).getBoundingClientRect();
    const x0 = n.left + n.width / 2 - 9, y0 = n.top + n.height / 2 - 9;
    const left = wondy.classList.contains("is-left");
    const x1 = left ? innerWidth - 60 : 30, yFloor = innerHeight - 40;
    noseFx.classList.add("is-flying");
    const anim = noseFx.animate([
      { transform: `translate(${x0}px, ${y0}px)` },
      { transform: `translate(${(x0 + x1) / 2}px, ${y0 - 160}px)`, offset: 0.3 },
      { transform: `translate(${x1}px, ${yFloor}px)`, offset: 0.55 },
      { transform: `translate(${(x0 + x1) / 2}px, ${yFloor - 90}px)`, offset: 0.75 },
      { transform: `translate(${x0}px, ${y0}px)` },
    ], { duration: 2400, easing: "ease-in-out" });
    await anim.finished.catch(() => {});
    noseFx.classList.remove("is-flying");
    pose("is-giggle"); sign("♥", 1400);
    await sleep(1500);
  }
  async function flower() {
    place("out"); pose("is-flower"); sign("✿", 2600);
    await sleep(3400);
  }
  async function peekaboo() {
    place("none"); await sleep(700);
    wondy.classList.add("is-left"); place("out"); pose("is-surprised"); sign("!", 1200);
    await sleep(1600);
    pose("is-giggle"); await sleep(900);
    place("none"); await sleep(700);
    wondy.classList.remove("is-left");
  }
  async function hintDay() {
    const free = $$(".cal-day--libero").filter(visibleIn);
    if (!free.length) return juggle();
    const day = free[0];
    place("out"); pose("is-reaching"); sign("★", 2800);
    day.classList.add("is-hinted");
    await sleep(3000);
    day.classList.remove("is-hinted");
  }
  const ALL = { wave, juggle, balanceWalk, steal, lightsOut, party, loseNose, flower, peekaboo, hintDay };
  const PRANKS = {
    home: [juggle, juggle, balanceWalk, balanceWalk, steal, lightsOut, party, loseNose, flower, peekaboo],
    calendario: [hintDay, hintDay, juggle, flower, loseNose],
    other: [juggle, balanceWalk, flower, loseNose, party, steal],
  };
  /* per provare un numero dalla console: Wondy.prank("juggle") */
  W.prank = (name) => run(ALL[name] || wave);
  async function run(fn) {
    if (busy || !allowedHere()) return;
    busy = true;
    try { await fn(); } finally { busy = false; rest(); }
  }

  /* ---------- tocco: trombetta (è un oggetto di scena, non una voce) + un numero ---------- */
  let actx = null;
  function honk() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.18].forEach((t0, i) => {
        const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + t0;
        o.type = "square"; o.frequency.setValueAtTime(i ? 300 : 360, t); o.frequency.exponentialRampToValueAtTime(i ? 230 : 280, t + 0.14);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.16);
      });
    } catch (e) {}
  }
  $("[data-wondy-tap]", wondy).addEventListener("click", () => {
    honk();
    if (reduce) { sign("♥", 1800); return; }
    if (busy) { pose("is-giggle"); return; }
    pose("is-honk");
    setTimeout(() => run(pick(PRANKS[currentView()] || PRANKS.other)), 220);
  });
  $("[data-wondy-close]", wondy).addEventListener("click", (e) => {
    e.stopPropagation();
    wondy.getAnimations().forEach((a) => a.cancel());
    lights.classList.remove("is-on");
    wondy.classList.add("is-gone");
    try { sessionStorage.setItem("wondy-hidden", "1"); } catch (err) {}
  });

  /* ---------- occhi che seguono il dito/puntatore ---------- */
  const pupils = $(".w-pupils", wondy);
  const lastPointer = { fresh: false, t: 0 };
  addEventListener("pointermove", (e) => {
    lastUserAction = Date.now();
    lastPointer.fresh = true; clearTimeout(lastPointer.t); lastPointer.t = setTimeout(() => { lastPointer.fresh = false; }, 1200);
    if (lights.classList.contains("is-on")) { lights.style.setProperty("--lx", e.clientX + "px"); lights.style.setProperty("--ly", e.clientY + "px"); }
    const c = wondyCenter();
    const dx = e.clientX - c.x, dy = e.clientY - c.y, d = Math.hypot(dx, dy) || 1;
    pupils.style.transform = `translate(${(dx / d) * 1.4}px, ${(dy / d) * 1.1}px)`;
  }, { passive: true });
  ["keydown", "scroll", "touchstart"].forEach((ev) => addEventListener(ev, () => { lastUserAction = Date.now(); }, { passive: true }));

  /* ---------- festa quando una richiesta è stata inviata ---------- */
  const done = document.getElementById("richiesta-done");
  if (done) new MutationObserver(() => {
    if (!done.hidden && done.querySelector(".done__seal")) {
      const r = done.querySelector(".done__seal").getBoundingClientRect();
      confettiBurst(r.left + r.width / 2, r.top + r.height / 2, 140);
    }
  }).observe(done, { attributes: true, attributeFilter: ["hidden"] });

  /* ---------- regia: entrata e numeri a intervalli ---------- */
  document.addEventListener("wondy:view", () => { if (!busy) rest(); });
  document.addEventListener("wondy:change", () => { if (!busy) rest(); });
  async function director() {
    await sleep(introOn ? 2600 : 1400);
    if (allowedHere()) await run(wave); else rest();
    if (reduce) return;
    for (;;) {
      await sleep(rand(14000, 22000));
      const idle = Date.now() - lastUserAction > 2500;
      if (document.visibilityState !== "visible" || !idle || !allowedHere()) continue;
      await run(pick(PRANKS[currentView()] || PRANKS.other));
    }
  }

  setupReveal();
  setupSparks();
  director();
})();

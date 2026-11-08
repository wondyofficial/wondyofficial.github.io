/* ============================================================
   MUSICHINA DI SCENA — un valzerino da organetto del circo
   Melodia originale, suonata dal browser (WebAudio): nessun file
   da scaricare e nessun diritto d'autore.
   È SPENTA di partenza: la accende un adulto con il pulsante "♪ Musica".
   Si ferma da sola se la pagina va in background o se si attiva la modalità calma.
   ============================================================ */
(function () {
  const BPM = 152;                    // valzer brillante, in 3/4
  const BEAT = 60 / BPM;
  const VOLUME = 0.055;               // sottofondo: discreto

  /* nota → frequenza */
  const SEMI = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  const freq = (n) => { const m = n.match(/^([A-G])(#?)(\d)$/); return 440 * Math.pow(2, (SEMI[m[1]] + (m[2] ? 1 : 0) + (+m[3] - 4) * 12) / 12); };

  /* melodia: [nota, durata in battiti]; 16 battute da 3 battiti */
  const MELODY = [
    ["E5", .5], ["G5", .5], ["C6", 1], ["B5", .5], ["A5", .5],
    ["G5", 1], ["E5", .5], ["F5", .5], ["G5", 1],
    ["A5", .5], ["G5", .5], ["F5", 1], ["E5", 1],
    ["D5", 3],
    ["F5", .5], ["A5", .5], ["D6", 1], ["C6", .5], ["B5", .5],
    ["A5", 1], ["F5", .5], ["G5", .5], ["A5", 1],
    ["G5", .5], ["F5", .5], ["E5", 1], ["D5", 1],
    ["C5", 3],
    ["G5", .5], ["G5", .5], ["G5", .5], ["A5", .5], ["G5", 1],
    ["E5", .5], ["E5", .5], ["E5", .5], ["F5", .5], ["E5", 1],
    ["D5", .5], ["E5", .5], ["F5", .5], ["G5", .5], ["A5", 1],
    ["G5", 3],
    ["G5", .5], ["G5", .5], ["G5", .5], ["A5", .5], ["B5", 1],
    ["C6", .5], ["B5", .5], ["A5", .5], ["G5", .5], ["F5", 1],
    ["E5", .5], ["G5", .5], ["D5", 1], ["B4", 1],
    ["C5", 3],
  ];
  /* accompagnamento "zum-pa-pa": basso sul primo battito, accordo sul secondo e sul terzo */
  const CHORDS = {
    C: ["C3", ["E4", "G4", "C5"]], F: ["F2", ["F4", "A4", "C5"]], G: ["G2", ["F4", "G4", "B4"]],
    Dm: ["D3", ["F4", "A4", "D5"]], Am: ["A2", ["E4", "A4", "C5"]],
  };
  const BARS = ["C", "C", "F", "G", "Dm", "F", "G", "C", "C", "Am", "Dm", "G", "C", "F", "G", "C"];
  const LOOP = BARS.length * 3 * BEAT;

  let ctx = null, master = null, playing = false, timer = 0, loopStart = 0, nextLoop = 0;

  function voice(f, t, dur, type, gain, dest) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
    g.gain.exponentialRampToValueAtTime(gain * 0.45, t + Math.min(0.18, dur * 0.6));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95);
    o.connect(g).connect(dest); o.start(t); o.stop(t + dur);
  }
  /* timbro da organetto: triangolo + un filo di onda quadra un'ottava sopra */
  function pipe(f, t, dur) { voice(f, t, dur, "triangle", 0.55, master); voice(f * 2, t, dur, "square", 0.05, master); }

  function scheduleLoop(t0) {
    let t = t0;
    MELODY.forEach(([n, d]) => { pipe(freq(n), t, d * BEAT); t += d * BEAT; });
    BARS.forEach((name, i) => {
      const [bass, chord] = CHORDS[name], bt = t0 + i * 3 * BEAT;
      voice(freq(bass), bt, BEAT * 0.9, "triangle", 0.5, master);
      [1, 2].forEach((k) => chord.forEach((n) => voice(freq(n), bt + k * BEAT, BEAT * 0.45, "triangle", 0.12, master)));
    });
  }
  function tick() {
    /* programma il giro successivo poco prima che finisca quello in corso */
    if (ctx.currentTime > nextLoop - 1.5) { scheduleLoop(nextLoop); nextLoop += LOOP; }
  }

  function start() {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(VOLUME, ctx.currentTime + 1.2);
      master.connect(ctx.destination);
      loopStart = ctx.currentTime + 0.15; nextLoop = loopStart;
      tick(); timer = setInterval(tick, 400);
      playing = true;
    } catch (e) { playing = false; }
    sync();
  }
  function stop() {
    clearInterval(timer);
    if (ctx && master) {
      const m = master;
      m.gain.cancelScheduledValues(ctx.currentTime);
      m.gain.setValueAtTime(m.gain.value, ctx.currentTime);
      m.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      setTimeout(() => m.disconnect(), 700);
    }
    playing = false;
    sync();
  }
  function sync() {
    document.querySelectorAll("[data-music-toggle]").forEach((b) => b.setAttribute("aria-pressed", String(playing)));
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-music-toggle]")) { playing ? stop() : start(); return; }
    /* la modalità calma spegne anche la musica */
    if (e.target.closest("[data-calm-toggle]") && playing) setTimeout(() => { if (document.documentElement.classList.contains("is-calm")) stop(); }, 0);
  });
  /* niente musica in sottofondo quando la pagina non si vede */
  document.addEventListener("visibilitychange", () => { if (document.hidden && playing) stop(); });
  sync();
})();

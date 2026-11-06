/*  ============================================================
    CONFIGURAZIONE DEL SITO DI WONDY
    È l'unico file da modificare. Le istruzioni passo passo
    sono nel file LEGGIMI.md.
    ============================================================ */
window.CONFIG = {
  /* --- Google Calendar (disponibilità) ---------------------
     calendarId: l'ID del calendario di lavoro di Thomas
                 (es. "abc123@group.calendar.google.com")
     apiKey:     chiave API di Google Cloud con la Calendar API
                 abilitata e limitata al dominio del sito.
     Se uno dei due manca, il calendario mostra date DIMOSTRATIVE. */
  calendarId: "5957a009ba3344646e0126cb1587b963f0e58311fd94f0b80a19ff6a00b99aec@group.calendar.google.com",
  apiKey: "AIzaSyDeAgygoZfIPCMBbJR_rjeHMXnQRHmgiFo",
  /* Finché il calendario non è collegato:
     true  = mostra date DIMOSTRATIVE (utile per provare il sito)
     false = al pubblico mostra "calendario in aggiornamento" e manda al modulo */
  demoMode: true,

  /* --- Formspree (dove arrivano le richieste) -----------------
     es. "https://formspree.io/f/abcdwxyz". Finché è vuoto, il
     modulo propone di copiare la richiesta e inviarla su Instagram. */
  formspreeEndpoint: "https://formspree.io/f/meaawoda",

  /* --- Calendario ------------------------------------------ */
  timeZone: "Europe/Rome",
  monthsAhead: 3,          // quanti mesi si possono consultare
  minLeadDays: 2,          // giorni minimi di preavviso
  /* Le prenotazioni sono a GIORNATA INTERA: un giorno con almeno
     un impegno nel calendario risulta occupato. */

  /* --- Contatti --------------------------------------------- */
  contacts: {
    instagram: "wondy_real",
    whatsapp: "393755718877",   // prefisso 39 senza +
    email: "wondymanagment@gmail.com",
    tiktok: "",            // username, facoltativo
    youtube: ""            // URL del canale, facoltativo
  },

  /* --- Materiali -------------------------------------------- */
  techSheetUrl: ""         // URL del PDF della scheda tecnica. Vuoto = "su richiesta"
};

# Sito di Wondy · guida

Sito statico (HTML, CSS, JavaScript), senza server: si pubblica gratis con **GitHub Pages**.
Tutte le impostazioni stanno in **`js/config.js`**: è l'unico file da modificare.

Ordine consigliato: **1 → 2 → 3 → 4**, perché per limitare la chiave Google e Formspree
serve già l'indirizzo del sito.

---

## 1. Pubblicare su GitHub Pages

1. Accedi a <https://github.com> con l'account di Thomas → in alto a destra **+** → **New repository**.
   - Nome: **`wondyofficial.github.io`** (esattamente così: è il nome che dà l'indirizzo più corto).
   - **Public** → **Create repository**.
2. Nella pagina del repository: **Add file → Upload files** e trascina **tutto il contenuto** della cartella
   (`index.html`, `privacy.html`, `LEGGIMI.md` e le cartelle `css`, `js`, `assets`).
   La cartella `.claude` non serve. → **Commit changes**.
3. **Settings → Pages** → *Source*: **Deploy from a branch** → Branch **main**, cartella **/ (root)** → **Save**.
4. Dopo 1–2 minuti il sito è online su **https://wondyofficial.github.io**.
   Da qui in poi, per modificare un file: aprilo su GitHub → icona matita → **Commit changes**.

> Dominio personalizzato (es. `wondy.it`): Settings → Pages → *Custom domain*.
> In quel caso, nei passi 2 e 3 usa il dominio al posto di `github.io`.

## 2. Logo
Carica il logo come `assets/logo-wondy.png` (PNG, fondo bianco o trasparente):
nella cartella `assets` del repository → **Add file → Upload files**.
Finché manca, il sito mostra la scritta "Wondy" dorata.

## 3. Formspree (dove arrivano le richieste)

1. Vai su <https://formspree.io> → **Get started** → registrati con `wondymanagement@gmail.com`
   e conferma l'email ricevuta.
2. **+ New Form** → nome "Richieste sito Wondy" → email di destinazione `wondymanagement@gmail.com` → **Create**.
3. Copia l'**endpoint** che compare, del tipo `https://formspree.io/f/abcdwxyz`.
4. In `js/config.js` incollalo in `formspreeEndpoint: "https://formspree.io/f/abcdwxyz",`.
5. Consigliato, nelle impostazioni del form su Formspree:
   - **Settings → Restrict to domain**: `wondyofficial.github.io` (blocca chi usa il modulo da altri siti).
   - lascia attivo il filtro antispam.
6. Prova: invia una richiesta dal sito e controlla la posta. **La prima richiesta va confermata**
   dall'email che Formspree manda a `wondymanagement@gmail.com`.

Il piano gratuito ha un limite di invii al mese (vedi formspree.io/plans).
Senza endpoint il sito non si blocca: propone di inviare il riepilogo via WhatsApp o email.

## 4. Google Calendar (disponibilità)

### 4a. Il calendario
1. Apri <https://calendar.google.com> con l'account di Thomas.
2. A sinistra, accanto ad *Altri calendari*: **+ → Crea nuovo calendario** → nome "Wondy – impegni" → **Crea**.
   Usa un calendario **dedicato al lavoro**: sarà visibile (solo libero/occupato) a chiunque.
3. Impostazioni di "Wondy – impegni" → **Autorizzazioni di accesso agli eventi** →
   spunta **Rendi disponibile pubblicamente** → scegli **Mostra solo libero/occupato (nascondi dettagli)**.
4. Più in basso, **Integra calendario** → copia l'**ID calendario** (finisce con `@group.calendar.google.com`).
5. Da ora segna lì ogni evento confermato (anche "giornata intera" per bloccare tutto il giorno).
   Gli eventi impostati come **"Disponibile"** non bloccano: lascia "Occupato".

### 4b. La chiave API (gratuita)
1. Vai su <https://console.cloud.google.com> con lo stesso account → accetta i termini se richiesto.
2. In alto **Seleziona progetto → Nuovo progetto** → nome "Sito Wondy" → **Crea** e selezionalo.
3. Menu ☰ → **API e servizi → Libreria** → cerca **Google Calendar API** → **Abilita**.
4. **API e servizi → Credenziali → + Crea credenziali → Chiave API**. Copia la chiave.
5. Clicca sulla chiave per **limitarla** (importante, perché resta visibile nel codice del sito):
   - *Restrizioni dell'applicazione*: **Siti web** → aggiungi `https://wondyofficial.github.io/*`
     (e `http://localhost:8000/*` se vuoi provare in locale).
   - *Restrizioni delle API*: **Limita chiave** → solo **Google Calendar API** → **Salva**.
6. Non serve carta di credito: l'uso del sito resta abbondantemente nei limiti gratuiti.

### 4c. Collegarlo al sito
In `js/config.js`:
```js
calendarId: "xxxxxxxx@group.calendar.google.com",
apiKey: "AIza...",
```
Ricarica il sito: l'avviso giallo "dimostrativa" sparisce e compare quello verde "aggiornata in tempo reale".
Le modifiche alla chiave Google possono impiegare qualche minuto ad attivarsi.

**Se non colleghi subito il calendario**, prima di far girare il link metti `demoMode: false`:
al posto delle date di esempio comparirà "Calendario in aggiornamento" e i clienti
potranno comunque scegliere la data.

Le prenotazioni sono a **giornata intera**: basta un qualsiasi impegno in un giorno
(anche di un'ora) perché quel giorno risulti occupato sul sito.
Altre impostazioni in `config.js`: preavviso minimo in giorni (`minLeadDays`), mesi visibili (`monthsAhead`).

## 5. Contatti e materiali
`contacts` in `config.js`: WhatsApp e email sono già inseriti. TikTok e YouTube si mostrano solo se compilati.
`techSheetUrl`: link al PDF della scheda tecnica per le aziende (anche caricato nella cartella `assets`).
Foto di Thomas: in `index.html`, sezione *Chi è Wondy*, sostituisci il segnaposto con
`<img src="assets/thomas.jpg" alt="Thomas Lucaccini nei panni di Wondy">`.

## 6. Prima di condividere il link
- `privacy.html`: se serve, aggiungere l'indirizzo del titolare.
- Rileggere i testi delle FAQ e dei pacchetti.
- Fare una richiesta di prova dal telefono.

## 7. Link diretti utili
- `…/#calendario` → apre subito il calendario (ottimo per la bio di Instagram)
- `…/#aziende` → pagina per le aziende
- `…/#richiesta?tipo=azienda` → modulo già in modalità azienda

## Prova in locale
Aprendo `index.html` con doppio clic il calendario Google non funziona: serve un piccolo server.
Nel Terminale, dentro la cartella: `python3 -m http.server 8000`, poi apri <http://localhost:8000>.

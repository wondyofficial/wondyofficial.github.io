/* ============================================================
   TRADUZIONI (i18n) — italiano (originale), inglese, francese, tedesco, spagnolo, macedone
   - nessun attributo nell'HTML: la chiave è il testo italiano normalizzato
   - i testi con tag inline (<em>, <small>…) si traducono come blocco HTML intero
   - un MutationObserver traduce anche ciò che i js inseriscono dopo
   - date e mesi con Intl.DateTimeFormat nella lingua attiva
   Da caricare DOPO calendar.js, form.js, wondy.js e giochi.js.
   ============================================================ */
(function () {
  "use strict";
  const LANGS = ["it", "en", "fr", "de", "es", "mk"];
  const NAMES = { it: "Italiano", en: "English", fr: "Français", de: "Deutsch", es: "Español", mk: "Македонски" };
  const LABEL = { it: "Lingua", en: "Language", fr: "Langue", de: "Sprache", es: "Idioma", mk: "Јазик" };
  const LOC = { it: "it-IT", en: "en-GB", fr: "fr-FR", de: "de-DE", es: "es-ES", mk: "mk-MK" };
  const BASE_TITLE = "Wondy · Thomas Lucaccini";
  const ATTRS = ["placeholder", "aria-label", "alt", "title", "data-title", "data-required", "data-pattern", "data-range", "data-label"];

  /* ---------- dizionario: "italiano | en | fr | de | es | mk" ("=" = uguale all'italiano) ---------- */
  const RAW = `
Compleanni, feste private ed <em>eventi aziendali</em>.<span>Entra in scena, e tutto il resto sparisce.</span> | Birthdays, private parties and <em>corporate events</em>.<span>He takes the stage, and everything else fades away.</span> | Anniversaires, fêtes privées et <em>événements d'entreprise</em>.<span>Il entre en scène, et tout le reste disparaît.</span> | Geburtstage, private Feiern und <em>Firmenevents</em>.<span>Er betritt die Bühne – und alles andere verschwindet.</span> | Cumpleaños, fiestas privadas y <em>eventos de empresa</em>.<span>Sale a escena, y todo lo demás desaparece.</span> | Родендени, приватни забави и <em>корпоративни настани</em>.<span>Излегува на сцена, и сè друго исчезнува.</span>
Clown <i>✦</i> Physical actor <i>✦</i> Fantasista <i>✦</i> Gardaland <i>✦</i> Tanka Village <i>✦</i> VOI Colonna <i>✦</i> | Clown <i>✦</i> Physical actor <i>✦</i> Entertainer <i>✦</i> Gardaland <i>✦</i> Tanka Village <i>✦</i> VOI Colonna <i>✦</i> | Clown <i>✦</i> Physical actor <i>✦</i> Fantaisiste <i>✦</i> Gardaland <i>✦</i> Tanka Village <i>✦</i> VOI Colonna <i>✦</i> | Clown <i>✦</i> Physical actor <i>✦</i> Varietékünstler <i>✦</i> Gardaland <i>✦</i> Tanka Village <i>✦</i> VOI Colonna <i>✦</i> | Clown <i>✦</i> Physical actor <i>✦</i> Artista de variedades <i>✦</i> Gardaland <i>✦</i> Tanka Village <i>✦</i> VOI Colonna <i>✦</i> | Кловн <i>✦</i> Physical actor <i>✦</i> Вариететски уметник <i>✦</i> Gardaland <i>✦</i> Tanka Village <i>✦</i> VOI Colonna <i>✦</i>
Pacchetti per feste<small>Surprise · Fantasy · Wondy</small> | Party packages<small>Surprise · Fantasy · Wondy</small> | Formules fêtes<small>Surprise · Fantasy · Wondy</small> | Party-Pakete<small>Surprise · Fantasy · Wondy</small> | Paquetes para fiestas<small>Surprise · Fantasy · Wondy</small> | Пакети за забави<small>Surprise · Fantasy · Wondy</small>
Spettacoli ed eventi<small>Formati per ogni occasione</small> | Shows and events<small>Formats for every occasion</small> | Spectacles et événements<small>Des formats pour chaque occasion</small> | Shows und Events<small>Formate für jeden Anlass</small> | Espectáculos y eventos<small>Formatos para cada ocasión</small> | Шоуа и настани<small>Формати за секоја прилика</small>
Chi è Wondy<small>Thomas Lucaccini, da Pisa</small> | Who is Wondy<small>Thomas Lucaccini, from Pisa</small> | Qui est Wondy<small>Thomas Lucaccini, de Pisa</small> | Wer ist Wondy<small>Thomas Lucaccini aus Pisa</small> | Quién es Wondy<small>Thomas Lucaccini, de Pisa</small> | Кој е Wondy<small>Thomas Lucaccini, од Пиза</small>
Domande frequenti<small>Spazio, pioggia, prenotazione</small> | Frequently asked questions<small>Space, rain, booking</small> | Questions fréquentes<small>Espace, pluie, réservation</small> | Häufige Fragen<small>Platz, Regen, Buchung</small> | Preguntas frecuentes<small>Espacio, lluvia, reserva</small> | Често поставувани прашања<small>Простор, дожд, резервација</small>
Giochi per bambini<small>Acchiappa il naso · Giocoleria · Memory</small> | Games for kids<small>Catch the Nose · Juggling · Memory</small> | Jeux pour enfants<small>Attrape le nez · Jonglage · Memory</small> | Spiele für Kinder<small>Schnapp die Nase · Jonglieren · Memory</small> | Juegos para niños<small>Atrapa la nariz · Malabares · Memory</small> | Игри за деца<small>Фати го носот · Жонглирање · Мемори</small>
I mille volti di <em>Wondy</em> | The many faces of <em>Wondy</em> | Les mille visages de <em>Wondy</em> | Die tausend Gesichter von <em>Wondy</em> | Las mil caras de <em>Wondy</em> | Илјадата лица на <em>Wondy</em>
<span class="roman">I</span> Il calendario | <span class="roman">I</span> The calendar | <span class="roman">I</span> Le calendrier | <span class="roman">I</span> Der Kalender | <span class="roman">I</span> El calendario | <span class="roman">I</span> Календарот
Quando vuoi <em>Wondy</em>? | When would you like <em>Wondy</em>? | Quand souhaitez-vous <em>Wondy</em> ? | Wann möchtest du <em>Wondy</em>? | ¿Cuándo quieres a <em>Wondy</em>? | Кога сакаш да дојде <em>Wondy</em>?
<i class="sw sw--libero"></i>Libero | <i class="sw sw--libero"></i>Free | <i class="sw sw--libero"></i>Libre | <i class="sw sw--libero"></i>Frei | <i class="sw sw--libero"></i>Libre | <i class="sw sw--libero"></i>Слободно
<i class="sw sw--occupato"></i>Occupato | <i class="sw sw--occupato"></i>Booked | <i class="sw sw--occupato"></i>Réservé | <i class="sw sw--occupato"></i>Belegt | <i class="sw sw--occupato"></i>Ocupado | <i class="sw sw--occupato"></i>Зафатено
<i class="sw sw--chiuso"></i>Non prenotabile | <i class="sw sw--chiuso"></i>Not bookable | <i class="sw sw--chiuso"></i>Non réservable | <i class="sw sw--chiuso"></i>Nicht buchbar | <i class="sw sw--chiuso"></i>No reservable | <i class="sw sw--chiuso"></i>Не може да се резервира
<span class="roman">II</span> Il preventivo | <span class="roman">II</span> The quote | <span class="roman">II</span> Le devis | <span class="roman">II</span> Das Angebot | <span class="roman">II</span> El presupuesto | <span class="roman">II</span> Понудата
Raccontami il tuo <em>evento</em> | Tell me about your <em>event</em> | Parlez-moi de votre <em>événement</em> | Erzähl mir von deinem <em>Event</em> | Cuéntame tu <em>evento</em> | Раскажи ми за твојот <em>настан</em>
<span class="roman">i</span> Quando | <span class="roman">i</span> When | <span class="roman">i</span> Quand | <span class="roman">i</span> Wann | <span class="roman">i</span> Cuándo | <span class="roman">i</span> Кога
<span class="roman">ii</span> L'evento | <span class="roman">ii</span> The event | <span class="roman">ii</span> L'événement | <span class="roman">ii</span> Das Event | <span class="roman">ii</span> El evento | <span class="roman">ii</span> Настанот
Azienda o ente <small>(facoltativo)</small> | Company or organisation <small>(optional)</small> | Entreprise ou organisme <small>(facultatif)</small> | Firma oder Organisation <small>(optional)</small> | Empresa o entidad <small>(opcional)</small> | Компанија или организација <small>(незадолжително)</small>
<span class="roman">iii</span> I tuoi contatti | <span class="roman">iii</span> Your contact details | <span class="roman">iii</span> Vos coordonnées | <span class="roman">iii</span> Deine Kontaktdaten | <span class="roman">iii</span> Tus datos de contacto | <span class="roman">iii</span> Твоите контакти
Tre modi per far <em>entrare la magia</em> | Three ways to <em>let the magic in</em> | Trois façons de <em>faire entrer la magie</em> | Drei Wege, <em>die Magie hereinzulassen</em> | Tres formas de <em>dejar entrar la magia</em> | Три начини <em>магијата да влезе</em>
<strong>Quanto è 4×5 metri?</strong> Più o meno un salotto grande sgombro, o un angolo di giardino. Se non sei sicuro, nel modulo puoi rispondere “non so”. | <strong>How big is 4×5 metres?</strong> Roughly a large living room cleared of furniture, or a corner of the garden. If you're not sure, just answer “not sure” in the form. | <strong>À quoi correspondent 4×5 mètres ?</strong> À peu près un grand salon dégagé, ou un coin de jardin. Si vous n'êtes pas sûr, vous pouvez répondre « je ne sais pas » dans le formulaire. | <strong>Wie groß sind 4×5 Meter?</strong> Ungefähr ein großes, freigeräumtes Wohnzimmer oder eine Ecke im Garten. Wenn du unsicher bist, kannst du im Formular „weiß nicht“ angeben. | <strong>¿Cuánto son 4×5 metros?</strong> Más o menos un salón grande despejado, o un rincón del jardín. Si no estás seguro, en el formulario puedes responder «no lo sé». | <strong>Колку е 4×5 метри?</strong> Приближно голема испразнета дневна соба или агол од градината. Ако не си сигурен, во формуларот можеш да одговориш „не знам“.
Meraviglia <em>su misura</em> per ogni occasione | Wonder <em>made to measure</em> for every occasion | De l'émerveillement <em>sur mesure</em> pour chaque occasion | Staunen <em>nach Maß</em> für jeden Anlass | Asombro <em>a medida</em> para cada ocasión | Восхит <em>по мерка</em> за секоја прилика
Scheda tecnica<small>Scarica il PDF</small> | Technical rider<small>Download the PDF</small> | Fiche technique<small>Télécharger le PDF</small> | Technisches Datenblatt<small>PDF herunterladen</small> | Ficha técnica<small>Descarga el PDF</small> | Технички лист<small>Преземи го PDF-от</small>
Scheda tecnica<small>Inviata insieme al preventivo</small> | Technical rider<small>Sent along with the quote</small> | Fiche technique<small>Envoyée avec le devis</small> | Technisches Datenblatt<small>Kommt zusammen mit dem Angebot</small> | Ficha técnica<small>Se envía junto con el presupuesto</small> | Технички лист<small>Се испраќа заедно со понудата</small>
Un clown, un fiore, <em>un pizzico di magia</em> | A clown, a flower, <em>a pinch of magic</em> | Un clown, une fleur, <em>une pincée de magie</em> | Ein Clown, eine Blume, <em>eine Prise Magie</em> | Un clown, una flor, <em>una pizca de magia</em> | Кловн, цвет, <em>малку магија</em>
Tutto quello che <em>vorresti sapere</em> | Everything you <em>might want to know</em> | Tout ce que <em>vous aimeriez savoir</em> | Alles, was du <em>wissen möchtest</em> | Todo lo que <em>te gustaría saber</em> | Сè што <em>би сакал да знаеш</em>
Il circo in tasca <span aria-hidden="true">✦</span> dai 4 ai 10 anni | The circus in your pocket <span aria-hidden="true">✦</span> ages 4 to 10 | Le cirque dans la poche <span aria-hidden="true">✦</span> de 4 à 10 ans | Zirkus für die Hosentasche <span aria-hidden="true">✦</span> von 4 bis 10 Jahren | El circo en el bolsillo <span aria-hidden="true">✦</span> de 4 a 10 años | Циркус во џеб <span aria-hidden="true">✦</span> од 4 до 10 години
Gioca con <em>Wondy</em> | Play with <em>Wondy</em> | Joue avec <em>Wondy</em> | Spiel mit <em>Wondy</em> | Juega con <em>Wondy</em> | Играј со <em>Wondy</em>
Wondy ti aspetta <span aria-hidden="true">♪</span> | Wondy is waiting for you <span aria-hidden="true">♪</span> | Wondy t'attend <span aria-hidden="true">♪</span> | Wondy wartet auf dich <span aria-hidden="true">♪</span> | Wondy te espera <span aria-hidden="true">♪</span> | Wondy те чека <span aria-hidden="true">♪</span>
Disponibilità | Availability | Disponibilités | Verfügbarkeit | Disponibilidad | Достапност
Feste | Parties | Fêtes | Feiern | Fiestas | Забави
Eventi | Events | Événements | Events | Eventos | Настани
Chi è Wondy | About Wondy | Qui est Wondy | Über Wondy | Quién es Wondy | За Wondy
Giochi | Games | Jeux | Spiele | Juegos | Игри
Prenota | Book | Réserver | Buchen | Reservar | Резервирај
✦ Clown · Physical actor · Fantasista ✦ | ✦ Clown · Physical actor · Entertainer ✦ | ✦ Clown · Physical actor · Fantaisiste ✦ | ✦ Clown · Physical actor · Varietékünstler ✦ | ✦ Clown · Physical actor · Artista de variedades ✦ | ✦ Кловн · Physical actor · Вариететски уметник ✦
Fantasista | Entertainer | Fantaisiste | Varietékünstler | Artista de variedades | Вариететски уметник
Verifica disponibilità | Check availability | Vérifier les disponibilités | Verfügbarkeit prüfen | Consultar disponibilidad | Провери достапност
Vedi subito i giorni liberi | See the free dates right away | Voir tout de suite les jours libres | Freie Tage sofort sehen | Mira al momento los días libres | Види ги веднаш слободните денови
Richiedi un preventivo | Request a quote | Demander un devis | Angebot anfragen | Pide un presupuesto | Побарај понуда
Feste, eventi, spettacoli | Parties, events, shows | Fêtes, événements, spectacles | Feiern, Events, Shows | Fiestas, eventos, espectáculos | Забави, настани, шоуа
Giorni liberi | Free dates | Jours libres | Freie Tage | Días libres | Слободни денови
In scena | On stage | En scène | Auf der Bühne | En escena | На сцена
Il libro di Wondy | Wondy's book | Le livre de Wondy | Wondys Buch | El libro de Wondy | Книгата на Wondy
Summer Coloring Book · su Amazon | Summer Coloring Book · on Amazon | Summer Coloring Book · sur Amazon | Summer Coloring Book · bei Amazon | Summer Coloring Book · en Amazon | Summer Coloring Book · на Amazon
presto | soon | bientôt | bald | pronto | наскоро
Email | = | E-mail | E-Mail | Correo | Е-пошта
Salva contatto | Save contact | Enregistrer le contact | Kontakt speichern | Guardar contacto | Зачувај контакт
✦ L'arte della meraviglia ✦ | ✦ The art of wonder ✦ | ✦ L'art de l'émerveillement ✦ | ✦ Die Kunst des Staunens ✦ | ✦ El arte del asombro ✦ | ✦ Уметноста на восхитот ✦
Il cestino ribelle | The rebellious basket | Le panier rebelle | Der widerspenstige Korb | La cesta rebelde | Бунтовната кошничка
L'orso e la luce | The bear and the light | L'ours et la lumière | Der Bär und das Licht | El oso y la luz | Мечето и светлината
La corda | The rope | La corde | Das Seil | La cuerda | Јажето
Stupore | Amazement | Étonnement | Staunen | Asombro | Чудење
Prima di entrare in scena | Before going on stage | Avant d'entrer en scène | Vor dem Auftritt | Antes de salir a escena | Пред излегување на сцена
Visto in scena a | Seen on stage at | Vu sur scène à | Auf der Bühne bei | Visto en escena en | Виден на сцена во
Prenota la tua data | Book your date | Réservez votre date | Buche deinen Termin | Reserva tu fecha | Резервирај го твојот датум
Privacy | = | Confidentialité | Datenschutz | Privacidad | Приватност
Indietro | Back | Retour | Zurück | Atrás | Назад
Tocca uno o più giorni liberi, poi continua con la richiesta. | Tap one or more free dates, then continue with your request. | Touchez un ou plusieurs jours libres, puis poursuivez votre demande. | Tippe auf einen oder mehrere freie Tage und mach dann mit der Anfrage weiter. | Toca uno o varios días libres y continúa con la solicitud. | Допри еден или повеќе слободни денови, па продолжи со барањето.
Non trovi il giorno che vuoi? | Can't find the day you want? | Vous ne trouvez pas le jour souhaité ? | Dein Wunschtag ist nicht dabei? | ¿No encuentras el día que quieres? | Не го наоѓаш денот што го сакаш?
Scrivimi su WhatsApp | Message me on WhatsApp | Écrivez-moi sur WhatsApp | Schreib mir auf WhatsApp | Escríbeme por WhatsApp | Пиши ми на WhatsApp
: a volte si libera un posto. | : sometimes a slot opens up. | : parfois une place se libère. | : Manchmal wird noch ein Termin frei. | : a veces se libera un hueco. | : понекогаш се ослободува термин.
Disponibilità aggiornata dal calendario di Wondy. La data si blocca solo alla conferma del preventivo. | Availability comes straight from Wondy's calendar. A date is only held once the quote is confirmed. | Disponibilités mises à jour depuis le calendrier de Wondy. La date n'est bloquée qu'à la confirmation du devis. | Die Verfügbarkeit kommt direkt aus Wondys Kalender. Fest ist ein Termin erst, wenn das Angebot bestätigt ist. | Disponibilidad actualizada desde el calendario de Wondy. La fecha solo se bloquea al confirmar el presupuesto. | Достапноста доаѓа директно од календарот на Wondy. Датумот се резервира дури кога ќе се потврди понудата.
Svuota | Clear | Effacer | Leeren | Vaciar | Избриши
Continua con la richiesta | Continue with your request | Continuer la demande | Weiter zur Anfrage | Continuar con la solicitud | Продолжи со барањето
Richiesta | Request | Demande | Anfrage | Solicitud | Барање
Non compilare | Do not fill in | Ne pas remplir | Nicht ausfüllen | No rellenar | Не пополнувај
Data dell'evento * | Event date * | Date de l'événement * | Datum des Events * | Fecha del evento * | Датум на настанот *
Che evento è? * | What kind of event is it? * | De quel événement s'agit-il ? * | Was für ein Event ist es? * | ¿Qué tipo de evento es? * | Каков настан е? *
Seleziona | Select | Choisir | Auswählen | Selecciona | Избери
Compleanno | Birthday | Anniversaire | Geburtstag | Cumpleaños | Роденден
Festa privata | Private party | Fête privée | Private Feier | Fiesta privada | Приватна забава
Battesimo / Comunione / Cresima | Christening / Communion / Confirmation | Baptême / Communion / Confirmation | Taufe / Kommunion / Firmung | Bautizo / Comunión / Confirmación | Крштевка / Причест / Миропомазание
Matrimonio | Wedding | Mariage | Hochzeit | Boda | Свадба
Evento aziendale / Family day | Corporate event / Family day | Événement d'entreprise / Family day | Firmenevent / Familientag | Evento de empresa / Family day | Корпоративен настан / Family day
Festa di Natale | Christmas party | Fête de Noël | Weihnachtsfeier | Fiesta de Navidad | Божиќна забава
Inaugurazione / negozio | Opening / shop | Inauguration / boutique | Eröffnung / Geschäft | Inauguración / tienda | Отворање / продавница
Centro commerciale / fiera | Shopping centre / trade fair | Centre commercial / salon | Einkaufszentrum / Messe | Centro comercial / feria | Трговски центар / саем
Hotel / villaggio turistico | Hotel / holiday resort | Hôtel / village de vacances | Hotel / Feriendorf | Hotel / complejo turístico | Хотел / туристичко село
Scuola / evento pubblico | School / public event | École / événement public | Schule / öffentliches Event | Escuela / evento público | Училиште / јавен настан
Altro | Other | Autre | Sonstiges | Otro | Друго
Cosa ti piacerebbe? * | What would you like? * | Que souhaitez-vous ? * | Was wünschst du dir? * | ¿Qué te gustaría? * | Што би сакал? *
Ingresso a sorpresa, giochi e un regalo per ogni bambino | Surprise entrance, games and a gift for every child | Entrée surprise, jeux et un cadeau pour chaque enfant | Überraschungsauftritt, Spiele und ein Geschenk für jedes Kind | Entrada sorpresa, juegos y un regalo para cada niño | Изненадувачки влез, игри и подарок за секое дете
Surprise + spettacolo di magia di circa 30 minuti | Surprise + a magic show of about 30 minutes | Surprise + spectacle de magie d'environ 30 minutes | Surprise + Zaubershow von etwa 30 Minuten | Surprise + espectáculo de magia de unos 30 minutos | Surprise + магично шоу од околу 30 минути
Ingresso a sorpresa + show di circa un'ora | Surprise entrance + a show of about an hour | Entrée surprise + spectacle d'environ une heure | Überraschungsauftritt + Show von etwa einer Stunde | Entrada sorpresa + espectáculo de aproximadamente una hora | Изненадувачки влез + шоу од околу еден час
Animazione itinerante | Walkabout entertainment | Animation déambulatoire | Walking Act | Animación itinerante | Анимација во движење
Wondy tra il pubblico, foto e sorprese | Wondy among the guests, photos and surprises | Wondy au milieu du public, photos et surprises | Wondy mitten im Publikum, Fotos und Überraschungen | Wondy entre el público, fotos y sorpresas | Wondy меѓу публиката, фотографии и изненадувања
Consigliami tu | Your call | Conseillez-moi | Empfiehl du mir etwas | Recomiéndame tú | Препорачај ми ти
Decidiamo insieme | Let's decide together | Décidons ensemble | Wir entscheiden gemeinsam | Lo decidimos juntos | Ќе одлучиме заедно
C'è un festeggiato? | Who's the guest of honour? | Qui fête-t-on ? | Wer wird gefeiert? | ¿Hay un homenajeado? | Кој слави?
Anni che compie | Age they're turning | Âge fêté | Wie alt wird er/sie? | Años que cumple | Колку години полнува
Quante persone, più o meno? | Roughly how many people? | Combien de personnes, à peu près ? | Wie viele Personen ungefähr? | ¿Cuántas personas, más o menos? | Колку луѓе, приближно?
Fino a 15 | Up to 15 | Jusqu'à 15 | Bis 15 | Hasta 15 | До 15
Più di 150 | More than 150 | Plus de 150 | Mehr als 150 | Más de 150 | Над 150
Dove si svolge? | Where will it be? | Où a-t-il lieu ? | Wo findet es statt? | ¿Dónde se celebra? | Каде се одржува?
Casa | Home | Domicile | Zu Hause | Casa | Дома
Giardino | Garden | Jardin | Garten | Jardín | Градина
Sala / locale | Hall / venue | Salle / établissement | Saal / Lokal | Salón / local | Сала / локал
Azienda / negozio | Company / shop | Entreprise / boutique | Firma / Geschäft | Empresa / tienda | Компанија / продавница
Piazza | Town square | Place publique | Marktplatz | Plaza | Плоштад
Hotel / villaggio | Hotel / resort | Hôtel / village vacances | Hotel / Feriendorf | Hotel / complejo | Хотел / туристичко село
Al chiuso o all'aperto? | Indoors or outdoors? | En intérieur ou en extérieur ? | Drinnen oder draußen? | ¿En interior o al aire libre? | Внатре или надвор?
Al chiuso | Indoors | En intérieur | Drinnen | En interior | Внатре
All'aperto | Outdoors | En extérieur | Draußen | Al aire libre | Надвор
Aperto + piano B | Outdoors + plan B | Extérieur + plan B | Draußen + Plan B | Al aire libre + plan B | Надвор + план Б
C'è uno spazio libero di circa 4×5 metri? | Is there a clear space of about 4×5 metres? | Y a-t-il un espace libre d'environ 4×5 mètres ? | Gibt es eine freie Fläche von etwa 4×5 Metern? | ¿Hay un espacio libre de unos 4×5 metros? | Има ли слободен простор од околу 4×5 метри?
Più o meno un salotto grande sgombro. Serve per Fantasy e Wondy. | Roughly a large living room cleared of furniture. Needed for Fantasy and Wondy. | À peu près un grand salon dégagé. Nécessaire pour Fantasy et Wondy. | Etwa ein großes, freigeräumtes Wohnzimmer. Nötig für Fantasy und Wondy. | Más o menos un salón grande despejado. Necesario para Fantasy y Wondy. | Приближно голема испразнета дневна соба. Потребно е за Fantasy и Wondy.
Sì | Yes | Oui | Ja | Sí | Да
No | = | Non | Nein | = | Не
Non so | Not sure | Je ne sais pas | Weiß nicht | No lo sé | Не знам
Senza spazio 4×5 lo show completo è difficile: nessun problema, nel preventivo ti propongo l'alternativa giusta. | Without a 4×5 space the full show is tricky: no problem, I'll suggest the right alternative in the quote. | Sans espace de 4×5, le spectacle complet est difficile : pas de souci, je vous propose la bonne alternative dans le devis. | Ohne 4×5-Fläche ist die komplette Show schwierig – kein Problem, im Angebot schlage ich dir die passende Alternative vor. | Sin un espacio de 4×5 el espectáculo completo es complicado: no pasa nada, en el presupuesto te propongo la alternativa adecuada. | Без простор од 4×5 целосното шоу е тешко изводливо: нема проблем, во понудата ќе ти предложам соодветна алтернатива.
Ora di inizio (se la sai) | Start time (if you know it) | Heure de début (si vous la connaissez) | Startzeit (falls du sie schon weißt) | Hora de inicio (si la sabes) | Време на почеток (ако го знаеш)
Nome e cognome * | Full name * | Prénom et nom * | Vor- und Nachname * | Nombre y apellidos * | Име и презиме *
Telefono / WhatsApp * | Phone / WhatsApp * | Téléphone / WhatsApp * | Telefon / WhatsApp * | Teléfono / WhatsApp * | Телефон / WhatsApp *
Email * | = | E-mail * | E-Mail * | Correo electrónico * | Е-пошта *
Come preferisci essere ricontattato? | How would you like me to get back to you? | Comment préférez-vous être recontacté ? | Wie soll ich dich am liebsten kontaktieren? | ¿Cómo prefieres que te contacte? | Како сакаш да те контактирам?
Telefonata | Phone call | Appel | Anruf | Llamada | Телефонски повик
Comune dell'evento * | Town of the event * | Commune de l'événement * | Ort des Events * | Municipio del evento * | Место на настанот *
Altro da raccontarmi? | Anything else to tell me? | Autre chose à me dire ? | Möchtest du mir noch etwas erzählen? | ¿Algo más que contarme? | Нешто друго да ми раскажеш?
Ho letto l' | I have read the | J'ai lu la | Ich habe die | He leído la | Ги прочитав
informativa privacy | privacy notice | politique de confidentialité | Datenschutzerklärung | política de privacidad | информациите за приватност
e acconsento al trattamento dei dati per gestire la richiesta. * | and consent to my data being processed to handle the request. * | et j'accepte le traitement de mes données pour la gestion de la demande. * | gelesen und bin mit der Verarbeitung meiner Daten zur Bearbeitung der Anfrage einverstanden. * | y acepto el tratamiento de mis datos para gestionar la solicitud. * | и се согласувам со обработката на податоците за барањето. *
Invia la richiesta | Send the request | Envoyer la demande | Anfrage senden | Enviar la solicitud | Испрати го барањето
È una richiesta, non una prenotazione: la data si conferma insieme. | This is a request, not a booking: we confirm the date together. | Ceci est une demande, pas une réservation : la date se confirme ensemble. | Das ist eine Anfrage, keine Buchung: Den Termin bestätigen wir gemeinsam. | Es una solicitud, no una reserva: la fecha la confirmamos juntos. | Ова е барање, не резервација: датумот го потврдуваме заедно.
Pacchetti | Packages | Formules | Pakete | Paquetes | Пакети
Feste private | Private parties | Fêtes privées | Private Feiern | Fiestas privadas | Приватни забави
Ogni festa inizia con un ingresso a sorpresa. Poi scegli quanto spettacolo vuoi. | Every party begins with a surprise entrance. Then you choose how much show you'd like. | Chaque fête commence par une entrée surprise. Ensuite, vous choisissez la part de spectacle. | Jede Feier beginnt mit einem Überraschungsauftritt. Dann wählst du, wie viel Show du möchtest. | Cada fiesta empieza con una entrada sorpresa. Luego eliges cuánto espectáculo quieres. | Секоја забава започнува со изненадувачки влез. Потоа избираш колку шоу сакаш.
La sorpresa | The surprise | La surprise | Die Überraschung | La sorpresa | Изненадувањето
Ingresso a sorpresa di Wondy | Wondy's surprise entrance | L'entrée surprise de Wondy | Wondys Überraschungsauftritt | Entrada sorpresa de Wondy | Изненадувачкиот влез на Wondy
Giochi con tutti i bambini | Games with all the children | Des jeux avec tous les enfants | Spiele mit allen Kindern | Juegos con todos los niños | Игри со сите деца
Un regalo per ogni bambino | A gift for every child | Un cadeau pour chaque enfant | Ein Geschenk für jedes Kind | Un regalo para cada niño | Подарок за секое дете
Spazio: nessuna esigenza particolare | Space: no special requirements | Espace : aucune contrainte particulière | Platz: keine besonderen Anforderungen | Espacio: sin requisitos especiales | Простор: без посебни барања
Scegli Surprise | Choose Surprise | Choisir Surprise | Surprise wählen | Elige Surprise | Избери Surprise
La magia | The magic | La magie | Die Magie | La magia | Магијата
Tutto il pacchetto Surprise | The whole Surprise package | Toute la formule Surprise | Das komplette Surprise-Paket | Todo el paquete Surprise | Целиот пакет Surprise
Spettacolo di magia di circa 30 minuti | A magic show of about 30 minutes | Spectacle de magie d'environ 30 minutes | Zaubershow von etwa 30 Minuten | Espectáculo de magia de unos 30 minutos | Магично шоу од околу 30 минути
Spazio libero: almeno 4×5 m | Clear space: at least 4×5 m | Espace libre : au moins 4×5 m | Freie Fläche: mindestens 4×5 m | Espacio libre: al menos 4×5 m | Слободен простор: најмалку 4×5 m
Scegli Fantasy | Choose Fantasy | Choisir Fantasy | Fantasy wählen | Elige Fantasy | Избери Fantasy
Lo spettacolo completo | The full show | Le spectacle complet | Die komplette Show | El espectáculo completo | Целосното шоу
Lo show | The show | Le show | Die Show | El show | Шоуто
Ingresso a sorpresa | Surprise entrance | Entrée surprise | Überraschungsauftritt | Entrada sorpresa | Изненадувачки влез
Show di circa un'ora: clownerie, giocoleria, equilibrio e magia | A show of about an hour: clowning, juggling, balancing and magic | Un show d'environ une heure : clownerie, jonglage, équilibre et magie | Eine Show von etwa einer Stunde: Clownerie, Jonglage, Balance und Zauberei | Un espectáculo de aproximadamente una hora: clown, malabares, equilibrio y magia | Шоу од околу еден час: кловнада, жонглирање, рамнотежа и магија
Area scenica completa | Full stage area | Espace scénique complet | Komplette Bühnenfläche | Área escénica completa | Целосен сценски простор
Scegli Wondy | Choose Wondy | Choisir Wondy | Wondy wählen | Elige Wondy | Избери Wondy
Verifica la tua data | Check your date | Vérifiez votre date | Prüfe deinen Termin | Comprueba tu fecha | Провери го твојот датум
Feste · Eventi · Spettacoli | Parties · Events · Shows | Fêtes · Événements · Spectacles | Feiern · Events · Shows | Fiestas · Eventos · Espectáculos | Забави · Настани · Шоуа
Un artista di circo e teatro, abituato ai palchi dei parchi e dei villaggi turistici: dal compleanno in giardino al grande evento in piazza. | A circus and theatre artist, at home on the stages of theme parks and holiday resorts: from a birthday in the garden to a big event in the town square. | Un artiste de cirque et de théâtre, habitué aux scènes des parcs d'attractions et des villages de vacances : de l'anniversaire au jardin au grand événement sur la place. | Ein Zirkus- und Theaterkünstler, zu Hause auf den Bühnen von Freizeitparks und Feriendörfern: vom Geburtstag im Garten bis zum großen Event auf dem Marktplatz. | Un artista de circo y teatro, acostumbrado a los escenarios de parques y complejos turísticos: del cumpleaños en el jardín al gran evento en la plaza. | Уметник од циркусот и театарот, навикнат на сцените во забавните паркови и туристичките села: од роденден во градина до голем настан на плоштад.
I formati | The formats | Les formats | Die Formate | Los formatos | Форматите
Walking act | = | = | Walking Act | = | =
Animazione itinerante tra il pubblico, ideale per inaugurazioni e centri commerciali. | Roaming entertainment among the crowd, ideal for openings and shopping centres. | Animation déambulatoire au milieu du public, idéale pour les inaugurations et les centres commerciaux. | Mobiles Entertainment mitten im Publikum, ideal für Eröffnungen und Einkaufszentren. | Animación itinerante entre el público, ideal para inauguraciones y centros comerciales. | Анимација во движење меѓу публиката, идеална за отворања и трговски центри.
Show su palco | Stage show | Spectacle sur scène | Bühnenshow | Espectáculo en escenario | Шоу на сцена
30, 45 o 60 minuti di clownerie, giocoleria, equilibrio e magia. | 30, 45 or 60 minutes of clowning, juggling, balancing and magic. | 30, 45 ou 60 minutes de clownerie, jonglage, équilibre et magie. | 30, 45 oder 60 Minuten Clownerie, Jonglage, Balance und Zauberei. | 30, 45 o 60 minutos de clown, malabares, equilibrio y magia. | 30, 45 или 60 минути кловнада, жонглирање, рамнотежа и магија.
Foto e incontro con Wondy, perfetto per family day e feste di Natale. | Photos and a meet-up with Wondy, perfect for family days and Christmas parties. | Photos et rencontre avec Wondy, parfait pour les family days et les fêtes de Noël. | Fotos und Treffen mit Wondy – perfekt für Familientage und Weihnachtsfeiern. | Fotos y encuentro con Wondy, perfecto para family days y fiestas de Navidad. | Фотографии и средба со Wondy, совршено за family day и божиќни забави.
Più repliche e più giorni | Multiple shows, multiple days | Plusieurs représentations et plusieurs jours | Mehrere Vorstellungen, mehrere Tage | Varias funciones y varios días | Повеќе изведби и повеќе денови
Programmi per fiere, weekend promozionali e stagioni nei villaggi. | Programmes for trade fairs, promotional weekends and resort seasons. | Programmes pour salons, week-ends promotionnels et saisons en village de vacances. | Programme für Messen, Aktionswochenenden und ganze Saisons in Feriendörfern. | Programas para ferias, fines de semana promocionales y temporadas en complejos turísticos. | Програми за саеми, промотивни викенди и сезони во туристички села.
Ideale per | Ideal for | Idéal pour | Ideal für | Ideal para | Идеално за
Family day | = | = | Familientag | = | =
Natale aziendale | Company Christmas party | Noël d'entreprise | Betriebsweihnachtsfeier | Navidad de empresa | Корпоративна божиќна забава
Inaugurazioni | Openings | Inaugurations | Eröffnungen | Inauguraciones | Отворања
Centri commerciali | Shopping centres | Centres commerciaux | Einkaufszentren | Centros comerciales | Трговски центри
Fiere | Trade fairs | Salons | Messen | Ferias | Саеми
Hotel e villaggi | Hotels and resorts | Hôtels et villages de vacances | Hotels und Feriendörfer | Hoteles y complejos turísticos | Хотели и туристички села
Eventi comunali | Municipal events | Événements municipaux | Städtische Veranstaltungen | Eventos municipales | Општински настани
Visto in scena | Seen on stage | Vu sur scène | Auf der Bühne | Visto en escena | Виден на сцена
“Qui per magia”, scritto e interpretato da Thomas | “Qui per magia”, written and performed by Thomas | « Qui per magia », écrit et interprété par Thomas | „Qui per magia“, geschrieben und gespielt von Thomas | «Qui per magia», escrito e interpretado por Thomas | „Qui per magia“, напишано и изведено од Thomas
Come lavoriamo | How we work | Notre façon de travailler | So arbeiten wir | Cómo trabajamos | Како работиме
Scheda tecnica con spazi, tempi di montaggio ed esigenze | Technical rider with space, set-up times and requirements | Fiche technique avec espaces, temps de montage et besoins | Technisches Datenblatt mit Platzbedarf, Aufbauzeiten und Anforderungen | Ficha técnica con espacios, tiempos de montaje y necesidades | Технички лист со простор, време за поставување и потреби
Area scenica minima 4×5 m · show da 30 a 60 minuti | Minimum stage area 4×5 m · shows from 30 to 60 minutes | Espace scénique minimum 4×5 m · spectacles de 30 à 60 minutes | Bühnenfläche mindestens 4×5 m · Shows von 30 bis 60 Minuten | Área escénica mínima 4×5 m · espectáculos de 30 a 60 minutos | Минимален сценски простор 4×5 m · шоуа од 30 до 60 минути
Verifica le date | Check dates | Vérifier les dates | Termine prüfen | Consulta las fechas | Провери ги датумите
Guarda Wondy in azione su Instagram ↓ | Watch Wondy in action on Instagram ↓ | Voir Wondy en action sur Instagram ↓ | Sieh Wondy in Aktion auf Instagram ↓ | Mira a Wondy en acción en Instagram ↓ | Погледни го Wondy во акција на Instagram ↓
Ha portato Wondy sui palchi di Gardaland con “Il Circo di Wondy”, nei villaggi turistici con “Il magico mondo di Wondy” e con “Qui per magia”, uno spettacolo che ha scritto e interpretato. | He has taken Wondy to the stages of Gardaland with “Il Circo di Wondy”, and to holiday resorts with “Il magico mondo di Wondy” and “Qui per magia”, a show he wrote and performed himself. | Il a emmené Wondy sur les scènes de Gardaland avec « Il Circo di Wondy », dans les villages de vacances avec « Il magico mondo di Wondy » et avec « Qui per magia », un spectacle qu'il a écrit et interprété. | Er brachte Wondy auf die Bühnen von Gardaland mit „Il Circo di Wondy“, in Feriendörfer mit „Il magico mondo di Wondy“ und mit „Qui per magia“, einer Show, die er selbst geschrieben hat und spielt. | Ha llevado a Wondy a los escenarios de Gardaland con «Il Circo di Wondy», a los complejos turísticos con «Il magico mondo di Wondy» y con «Qui per magia», un espectáculo que escribió e interpretó. | Го однел Wondy на сцените на Gardaland со „Il Circo di Wondy“, во туристичките села со „Il magico mondo di Wondy“ и со „Qui per magia“, шоу што самиот го напишал и го изведува.
Oggi Wondy entra anche nelle feste di compleanno e negli eventi aziendali, con la stessa cura di un vero palcoscenico. | Today Wondy also comes to birthday parties and corporate events, with the same care as on a real stage. | Aujourd'hui, Wondy s'invite aussi aux fêtes d'anniversaire et aux événements d'entreprise, avec le même soin que sur une vraie scène. | Heute kommt Wondy auch zu Geburtstagsfeiern und Firmenevents – mit derselben Sorgfalt wie auf einer echten Bühne. | Hoy Wondy también llega a fiestas de cumpleaños y eventos de empresa, con el mismo cuidado que en un escenario de verdad. | Денес Wondy доаѓа и на родендени и на корпоративни настани, со истата грижа како на вистинска сцена.
Il trucco, prima di entrare in scena | Make-up, before going on stage | Le maquillage, avant d'entrer en scène | Das Schminken, kurz vor dem Auftritt | El maquillaje, antes de salir a escena | Шминкањето, пред излегување на сцена
Guarda i video su Instagram | Watch the videos on Instagram | Voir les vidéos sur Instagram | Sieh dir die Videos auf Instagram an | Mira los vídeos en Instagram | Погледни ги видеата на Instagram
Domande frequenti | Frequently asked questions | Questions fréquentes | Häufige Fragen | Preguntas frecuentes | Често поставувани прашања
Quanto costa? | How much does it cost? | Combien ça coûte ? | Was kostet es? | ¿Cuánto cuesta? | Колку чини?
Quanto spazio serve? | How much space is needed? | De combien d'espace faut-il disposer ? | Wie viel Platz wird gebraucht? | ¿Cuánto espacio hace falta? | Колку простор е потребен?
Per il pacchetto Surprise basta lo spazio della festa. Per Fantasy e Wondy serve un'area libera di circa 4×5 metri, più o meno un salotto grande sgombro. | For the Surprise package, the party space is enough. Fantasy and Wondy need a clear area of about 4×5 metres, roughly a large living room cleared of furniture. | Pour la formule Surprise, l'espace de la fête suffit. Pour Fantasy et Wondy, il faut une zone libre d'environ 4×5 mètres, à peu près un grand salon dégagé. | Für das Surprise-Paket reicht der Platz der Feier. Für Fantasy und Wondy braucht es eine freie Fläche von etwa 4×5 Metern, ungefähr ein großes, freigeräumtes Wohnzimmer. | Para el paquete Surprise basta con el espacio de la fiesta. Para Fantasy y Wondy hace falta un área libre de unos 4×5 metros, más o menos un salón grande despejado. | За пакетот Surprise доволен е просторот на забавата. За Fantasy и Wondy потребен е слободен простор од околу 4×5 метри, приближно голема испразнета дневна соба.
E se piove? | What if it rains? | Et s'il pleut ? | Und wenn es regnet? | ¿Y si llueve? | А ако врне?
Se c'è uno spazio al chiuso, lo spettacolo si sposta lì. Se non c'è, ne parliamo prima dell'evento per trovare insieme la soluzione migliore. Nel modulo puoi indicare “all'aperto + piano B”. | If there's an indoor space, the show moves there. If not, we'll talk it through before the event and find the best solution together. In the form you can choose “outdoors + plan B”. | S'il y a un espace couvert, le spectacle s'y installe. Sinon, nous en parlons avant l'événement pour trouver ensemble la meilleure solution. Dans le formulaire, vous pouvez indiquer « extérieur + plan B ». | Gibt es einen Raum drinnen, zieht die Show dorthin um. Wenn nicht, sprechen wir vor dem Event darüber und finden gemeinsam die beste Lösung. Im Formular kannst du „draußen + Plan B“ angeben. | Si hay un espacio cubierto, el espectáculo se traslada allí. Si no, lo hablamos antes del evento para encontrar juntos la mejor solución. En el formulario puedes indicar «al aire libre + plan B». | Ако има затворен простор, шоуто се преместува таму. Ако нема, разговараме пред настанот и заедно го наоѓаме најдоброто решение. Во формуларот можеш да означиш „надвор + план Б“.
Per che età è adatto? | What age is it for? | Pour quel âge ? | Für welches Alter ist es geeignet? | ¿Para qué edad es? | За која возраст е?
Lo spettacolo è pensato per i bambini, ma fa ridere anche i grandi. Indica l'età del festeggiato e dei bambini: Wondy adatta giochi e numeri al pubblico. | The show is designed for children, but grown-ups laugh too. Tell me the age of the guest of honour and of the children: Wondy adapts games and acts to the audience. | Le spectacle est pensé pour les enfants, mais il fait rire aussi les grands. Indiquez l'âge de la personne fêtée et des enfants : Wondy adapte jeux et numéros au public. | Die Show ist für Kinder gedacht, bringt aber auch die Großen zum Lachen. Gib das Alter des Geburtstagskinds und der Kinder an: Wondy passt Spiele und Nummern an das Publikum an. | El espectáculo está pensado para niños, pero también hace reír a los mayores. Indica la edad del homenajeado y de los niños: Wondy adapta juegos y números al público. | Шоуто е наменето за деца, но ги насмејува и возрасните. Наведи ја возраста на славеникот и на децата: Wondy ги прилагодува игрите и точките на публиката.
In quali zone lavori? | Which areas do you cover? | Dans quelles régions intervenez-vous ? | In welchen Gegenden trittst du auf? | ¿En qué zonas trabajas? | Во кои области работиш?
Wondy parte da Pisa. Indica il comune dell'evento: nel preventivo trovi anche l'eventuale trasferta. | Wondy is based in Pisa. Tell me the town of the event: any travel costs will be included in the quote. | Wondy part de Pisa. Indiquez la commune de l'événement : le devis inclut aussi les éventuels frais de déplacement. | Wondy startet in Pisa. Gib den Ort des Events an: Eventuelle Anfahrtskosten findest du im Angebot. | Wondy sale desde Pisa. Indica el municipio del evento: en el presupuesto verás también el posible desplazamiento. | Wondy тргнува од Пиза. Наведи го местото на настанот: во понудата ќе ги најдеш и евентуалните патни трошоци.
Come si conferma la data? | How is the date confirmed? | Comment la date est-elle confirmée ? | Wie wird der Termin bestätigt? | ¿Cómo se confirma la fecha? | Како се потврдува датумот?
Il calendario mostra le date libere, ma la data si blocca solo quando confermiamo insieme il preventivo. | The calendar shows the free dates, but a date is only held once we confirm the quote together. | Le calendrier montre les dates libres, mais la date n'est bloquée que lorsque nous confirmons ensemble le devis. | Der Kalender zeigt die freien Termine – fest ist ein Termin aber erst, wenn wir das Angebot gemeinsam bestätigen. | El calendario muestra las fechas libres, pero la fecha solo se bloquea cuando confirmamos juntos el presupuesto. | Календарот ги покажува слободните датуми, но датумот се резервира дури кога заедно ќе ја потврдиме понудата.
Cosa devo preparare io? | What do I need to prepare? | Que dois-je préparer ? | Was muss ich vorbereiten? | ¿Qué tengo que preparar yo? | Што треба да подготвам јас?
Lo spazio libero e i bambini pronti alla sorpresa. Tutti i dettagli pratici te li scrivo insieme al preventivo. | A clear space and children ready for the surprise. I'll send you all the practical details along with the quote. | L'espace libre et les enfants prêts pour la surprise. Je vous envoie tous les détails pratiques avec le devis. | Eine freie Fläche und Kinder, die bereit für die Überraschung sind. Alle praktischen Details schicke ich dir zusammen mit dem Angebot. | El espacio libre y los niños listos para la sorpresa. Todos los detalles prácticos te los envío junto con el presupuesto. | Слободен простор и деца подготвени за изненадувањето. Сите практични детали ќе ти ги напишам заедно со понудата.
Fai una domanda o richiedi una data | Ask a question or request a date | Posez une question ou demandez une date | Stell eine Frage oder frag einen Termin an | Haz una pregunta o pide una fecha | Постави прашање или побарај датум
Scrivimi su Instagram | Message me on Instagram | Écrivez-moi sur Instagram | Schreib mir auf Instagram | Escríbeme en Instagram | Пиши ми на Instagram
Tre giochi piccoli piccoli, da fare insieme a mamma e papà. | Three teeny-tiny games to play together with Mum and Dad. | Trois tout petits jeux, à faire avec papa et maman. | Drei klitzekleine Spiele für dich, Mama und Papa. | Tres juegos chiquititos para jugar con mamá y papá. | Три мали-мали игри за играње заедно со мама и тато.
Acchiappa il naso | Catch the Nose | Attrape le nez | Schnapp die Nase | Atrapa la nariz | Фати го носот
Tocca i nasi rossi prima che spariscano! | Tap the red noses before they vanish! | Touche les nez rouges avant qu'ils disparaissent ! | Tipp die roten Nasen an, bevor sie verschwinden! | ¡Toca las narices rojas antes de que desaparezcan! | Допри ги црвените носеви пред да исчезнат!
Record: | Best: | Record : | Rekord: | Récord: | Рекорд:
Gioca | Play | Jouer | Spielen | Jugar | Играј
Giocoleria | Juggling | Jonglage | Jonglieren | Malabares | Жонглирање
Tocca le palline e non farle cadere! | Tap the balls and don't let them drop! | Touche les balles et ne les laisse pas tomber ! | Tipp die Bälle an und lass sie nicht fallen! | ¡Toca las pelotas y no dejes que se caigan! | Допри ги топчињата и не дозволувај да паднат!
Memory del circo | Circus Memory | Memory du cirque | Zirkus-Memory | = | Циркуско мемори
Gira due carte e trova quelle uguali! | Turn over two cards and find the matching ones! | Retourne deux cartes et trouve les paires ! | Dreh zwei Karten um und finde die gleichen! | ¡Da la vuelta a dos cartas y encuentra las iguales! | Сврти две карти и најди ги истите!
Quante carte? | How many cards? | Combien de cartes ? | Wie viele Karten? | ¿Cuántas cartas? | Колку карти?
12 carte | 12 cards | 12 cartes | 12 Karten | 12 cartas | 12 карти
16 carte | 16 cards | 16 cartes | 16 Karten | 16 cartas | 16 карти
Punti | Points | Points | Punkte | Puntos | Поени
Pausa | Paused | Pause | Pause | = | Пауза
Continua | Continue | Continuer | Weiter | Continuar | Продолжи
Altri giochi | More games | Autres jeux | Andere Spiele | Otros juegos | Други игри
Bravo! | Well done! | Bravo ! | Super! | ¡Muy bien! | Браво!
Nuovo record! | New record! | Nouveau record ! | Neuer Rekord! | ¡Nuevo récord! | Нов рекорд!
Ancora! | Again! | Encore ! | Nochmal! | ¡Otra vez! | Уште еднаш!
Navigazione | Navigation | Navigation | Navigation | Navegación | Навигација
Wondy, torna all'inizio | Wondy, back to the top | Wondy, retour au début | Wondy, zurück zum Anfang | Wondy, volver al inicio | Wondy, назад на почетокот
Scopri di più | Find out more | En savoir plus | Mehr erfahren | Descubre más | Дознај повеќе
Vai al calendario dei giorni liberi | Go to the calendar of free dates | Aller au calendrier des jours libres | Zum Kalender mit den freien Tagen | Ir al calendario de días libres | Оди до календарот со слободни денови
Menu principale | Main menu | Menu principal | Hauptmenü | Menú principal | Главно мени
Le arti di Wondy | Wondy's arts | Les arts de Wondy | Wondys Künste | Las artes de Wondy | Уметностите на Wondy
Galleria fotografica, scorri di lato | Photo gallery, swipe sideways | Galerie photo, faites défiler sur le côté | Fotogalerie, seitlich wischen | Galería de fotos, desliza hacia el lado | Фотогалерија, лизгај настрана
Wondy tiene in equilibrio un girasole sul naso | Wondy balances a sunflower on his nose | Wondy tient un tournesol en équilibre sur son nez | Wondy balanciert eine Sonnenblume auf der Nase | Wondy mantiene en equilibrio un girasol sobre la nariz | Wondy држи сончоглед во рамнотежа на носот
Wondy sul palco lancia un cestino | Wondy throws a basket on stage | Wondy lance un panier sur scène | Wondy wirft auf der Bühne einen Korb | Wondy lanza una cesta en el escenario | Wondy фрла кошничка на сцената
Wondy con un orsacchiotto e una luce in mano | Wondy holding a teddy bear and a light | Wondy avec un ours en peluche et une lumière à la main | Wondy mit einem Teddybären und einem Licht in der Hand | Wondy con un osito de peluche y una luz en la mano | Wondy со мече и светилка во рака
Wondy ride tenendo una corda | Wondy laughing as he holds a rope | Wondy rit en tenant une corde | Wondy lacht und hält ein Seil | Wondy ríe sujetando una cuerda | Wondy се смее држејќи јаже
Primo piano di Wondy stupito | Close-up of an astonished Wondy | Gros plan de Wondy étonné | Nahaufnahme eines staunenden Wondy | Primer plano de Wondy asombrado | Крупен план на зачуден Wondy
Thomas si trucca prima di entrare in scena | Thomas puts on his make-up before going on stage | Thomas se maquille avant d'entrer en scène | Thomas schminkt sich vor dem Auftritt | Thomas se maquilla antes de salir a escena | Thomas се шминка пред да излезе на сцена
Thomas si trucca prima dello spettacolo | Thomas puts on his make-up before the show | Thomas se maquille avant le spectacle | Thomas schminkt sich vor der Show | Thomas se maquilla antes del espectáculo | Thomas се шминка пред шоуто
Thomas Lucaccini nei panni di Wondy | Thomas Lucaccini as Wondy | Thomas Lucaccini dans le rôle de Wondy | Thomas Lucaccini als Wondy | Thomas Lucaccini en el papel de Wondy | Thomas Lucaccini како Wondy
Home | = | Accueil | Startseite | Inicio | Почетна
Mese precedente | Previous month | Mois précédent | Vorheriger Monat | Mes anterior | Претходен месец
Mese successivo | Next month | Mois suivant | Nächster Monat | Mes siguiente | Следен месец
Legenda | Legend | Légende | Legende | Leyenda | Легенда
Scegli una data dal calendario o inseriscila qui. | Pick a date from the calendar or enter it here. | Choisissez une date dans le calendrier ou saisissez-la ici. | Wähle einen Termin im Kalender oder gib ihn hier ein. | Elige una fecha del calendario o escríbela aquí. | Избери датум од календарот или внеси го тука.
Dimmi che tipo di evento è. | Tell me what kind of event it is. | Dites-moi de quel type d'événement il s'agit. | Sag mir, was für ein Event es ist. | Dime qué tipo de evento es. | Кажи ми каков настан е.
Tipo di evento | Event type | Type d'événement | Art des Events | Tipo de evento | Вид на настан
Scegli una proposta (va bene anche “consigliami tu”). | Choose an option (“Your call” is fine too). | Choisissez une formule (« Conseillez-moi » convient aussi). | Wähle ein Angebot („Empfiehl du mir etwas“ geht auch). | Elige una propuesta (también vale «recomiéndame tú»). | Избери понуда (може и „препорачај ми ти“).
Spettacolo | Show | Spectacle | Show | Espectáculo | Шоу
Così Wondy lo saluta per nome | So Wondy can greet them by name | Pour que Wondy puisse l'appeler par son prénom | Damit Wondy es mit Namen begrüßen kann | Así Wondy lo saluda por su nombre | За Wondy да го поздрави по име
Festeggiato | Guest of honour | Personne fêtée | Gefeierte Person | Homenajeado | Славеник
Inserisci un'età valida. | Enter a valid age. | Indiquez un âge valide. | Gib ein gültiges Alter ein. | Introduce una edad válida. | Внеси валидна возраст.
Età | Age | Âge | Alter | Edad | Возраст
Partecipanti | Guests | Participants | Teilnehmende | Participantes | Учесници
Luogo | Venue | Lieu | Ort | Lugar | Место
Ambiente | Setting | Cadre | Umgebung | = | Амбиент
Spazio 4×5 m | 4×5 m space | Espace 4×5 m | Fläche 4×5 m | Espacio 4×5 m | Простор 4×5 m
Ora inizio | Start time | Heure de début | Startzeit | Hora de inicio | Време на почеток
Solo se serve la fattura | Only if you need an invoice | Seulement si une facture est nécessaire | Nur wenn du eine Rechnung brauchst | Solo si necesitas factura | Само ако ти треба фактура
Azienda / ente | Company / organisation | Entreprise / organisme | Firma / Organisation | Empresa / entidad | Компанија / организација
Come ti chiami? | What's your name? | Quel est votre nom ? | Wie heißt du? | ¿Cómo te llamas? | Како се викаш?
Nome | Name | Nom | Name | Nombre | Име
Lasciami un numero per risponderti. | Leave me a number so I can reply. | Laissez-moi un numéro pour que je puisse vous répondre. | Hinterlass mir eine Nummer, damit ich dir antworten kann. | Déjame un número para responderte. | Остави ми број за да ти одговорам.
Controlla il numero di telefono. | Please check the phone number. | Vérifiez le numéro de téléphone. | Prüf bitte die Telefonnummer. | Revisa el número de teléfono. | Провери го телефонскиот број.
Telefono | Phone | Téléphone | Telefon | Teléfono | Телефон
Serve per mandarti il riepilogo e il preventivo. | I need it to send you the summary and the quote. | Elle me sert à vous envoyer le récapitulatif et le devis. | Brauche ich, um dir die Zusammenfassung und das Angebot zu schicken. | La necesito para enviarte el resumen y el presupuesto. | Ми треба за да ти го испратам резимето и понудата.
Contatto preferito | Preferred contact | Contact préféré | Bevorzugter Kontakt | Contacto preferido | Претпочитан контакт
es. Pisa | e.g. Pisa | ex. Pisa | z. B. Pisa | p. ej., Pisa | на пр. Пиза
In che comune si svolge? | Which town is it in? | Dans quelle commune a-t-il lieu ? | In welchem Ort findet es statt? | ¿En qué municipio se celebra? | Во кое место се одржува?
Comune | Town | Commune | Ort | Municipio | Место
Serve il consenso per poterti rispondere. | I need your consent to be able to reply. | Votre consentement est nécessaire pour que je puisse vous répondre. | Ich brauche deine Zustimmung, um dir antworten zu können. | Necesito tu consentimiento para poder responderte. | Ми треба твоја согласност за да можам да ти одговорам.
Pacchetti feste | Party packages | Formules fêtes | Party-Pakete | Paquetes para fiestas | Пакети за забави
Spettacoli ed eventi | Shows and events | Spectacles et événements | Shows und Events | Espectáculos y eventos | Шоуа и настани
Suoni accesi: tocca per spegnerli | Sound on: tap to turn it off | Son activé : touche pour le couper | Ton an: tippen zum Ausschalten | Sonido activado: toca para apagarlo | Звукот е вклучен: допри за да го исклучиш
Suoni spenti: tocca per accenderli | Sound off: tap to turn it on | Son coupé : touche pour l'activer | Ton aus: tippen zum Einschalten | Sonido apagado: toca para encenderlo | Звукот е исклучен: допри за да го вклучиш
Gioca ad Acchiappa il naso | Play Catch the Nose | Jouer à Attrape le nez | Schnapp die Nase spielen | Jugar a Atrapa la nariz | Играј „Фати го носот“
Gioca a Giocoleria | Play Juggling | Jouer à Jonglage | Jonglieren spielen | Jugar a Malabares | Играј „Жонглирање“
Gioca a Memory del circo | Play Circus Memory | Jouer au Memory du cirque | Zirkus-Memory spielen | Jugar a Memory del circo | Играј „Циркуско мемори“
Torna alla scelta dei giochi | Back to the games | Retour au choix des jeux | Zurück zur Spielauswahl | Volver a la elección de juegos | Назад кон изборот на игри
Gioca ancora | Play again | Rejouer | Nochmal spielen | Jugar otra vez | Играј повторно
Nascondi Wondy | Hide Wondy | Cacher Wondy | Wondy ausblenden | Ocultar Wondy | Скриј го Wondy
Wondy: toccalo per un dispetto | Wondy: tap him for a prank | Wondy : touchez-le pour une farce | Wondy: Tipp ihn an für einen Streich | Wondy: tócalo para una travesura | Wondy: допри го за шега
Wondy · Thomas Lucaccini: clown, physical actor, fantasista. Verifica subito la disponibilità e richiedi un preventivo per feste private ed eventi aziendali. | Wondy · Thomas Lucaccini: clown, physical actor, entertainer. Check availability right away and request a quote for private parties and corporate events. | Wondy · Thomas Lucaccini : clown, physical actor, fantaisiste. Vérifiez tout de suite les disponibilités et demandez un devis pour vos fêtes privées et événements d'entreprise. | Wondy · Thomas Lucaccini: Clown, Physical actor, Varietékünstler. Prüfe sofort die Verfügbarkeit und frag ein Angebot für private Feiern und Firmenevents an. | Wondy · Thomas Lucaccini: clown, physical actor, artista de variedades. Consulta al momento la disponibilidad y pide un presupuesto para fiestas privadas y eventos de empresa. | Wondy · Thomas Lucaccini: кловн, physical actor, вариететски уметник. Провери ја достапноста веднаш и побарај понуда за приватни забави и корпоративни настани.
Clown · Physical actor · Fantasista. Verifica la disponibilità e richiedi una data. | Clown · Physical actor · Entertainer. Check availability and request a date. | Clown · Physical actor · Fantaisiste. Vérifiez les disponibilités et demandez une date. | Clown · Physical actor · Varietékünstler. Prüfe die Verfügbarkeit und frag einen Termin an. | Clown · Physical actor · Artista de variedades. Consulta la disponibilidad y pide una fecha. | Кловн · Physical actor · Вариететски уметник. Провери ја достапноста и побарај датум.
libero | free | libre | frei | libre | слободно
occupato | booked | réservé | belegt | ocupado | зафатено
non prenotabile | not bookable | non réservable | nicht buchbar | no reservable | не може да се резервира
da confermare | to be confirmed | à confirmer | noch zu bestätigen | por confirmar | чека потврда
caricamento | loading | chargement | wird geladen | cargando | се вчитува
Controllo la disponibilità… | Checking availability… | Je vérifie les disponibilités… | Ich prüfe die Verfügbarkeit… | Compruebo la disponibilidad… | Ја проверувам достапноста…
Calendario in aggiornamento. | Calendar being updated. | Calendrier en cours de mise à jour. | Der Kalender wird gerade aktualisiert. | Calendario en actualización. | Календарот се ажурира.
Disponibilità dimostrativa. | Demo availability. | Disponibilités de démonstration. | Beispiel-Verfügbarkeit. | Disponibilidad de demostración. | Демо-достапност.
Il calendario reale si collega appena viene configurato. | The real calendar will be connected as soon as it's set up. | Le vrai calendrier sera connecté dès qu'il sera configuré. | Der echte Kalender wird verbunden, sobald er eingerichtet ist. | El calendario real se conectará en cuanto se configure. | Вистинскиот календар ќе се поврзе штом ќе биде поставен.
Disponibilità aggiornata in tempo reale. La data si conferma solo dopo la risposta di Wondy. | Availability updated in real time. The date is only confirmed once Wondy replies. | Disponibilités mises à jour en temps réel. La date n'est confirmée qu'après la réponse de Wondy. | Verfügbarkeit in Echtzeit. Fest ist der Termin erst nach Wondys Antwort. | Disponibilidad actualizada en tiempo real. La fecha solo se confirma tras la respuesta de Wondy. | Достапноста е ажурирана во реално време. Датумот се потврдува дури по одговорот на Wondy.
Non riesco a leggere il calendario in questo momento. Scegli comunque il giorno: la disponibilità ti viene confermata nella risposta alla richiesta. | I can't read the calendar right now. Pick your day anyway: availability will be confirmed in my reply to your request. | Je n'arrive pas à lire le calendrier pour le moment. Choisissez quand même votre jour : la disponibilité vous sera confirmée dans la réponse à votre demande. | Ich kann den Kalender gerade nicht abrufen. Wähle trotzdem deinen Tag: Die Verfügbarkeit bestätige ich dir in der Antwort auf deine Anfrage. | Ahora mismo no puedo leer el calendario. Elige el día de todos modos: la disponibilidad te la confirmo en la respuesta a tu solicitud. | Во моментов не можам да го прочитам календарот. Сепак избери го денот: достапноста ќе ти ја потврдам во одговорот на барањето.
Attenzione: | Note: | Attention : | Achtung: | Atención: | Внимание:
un giorno che avevi scelto non è più disponibile ed è stato tolto. | a day you had chosen is no longer available and has been removed. | un jour que vous aviez choisi n'est plus disponible et a été retiré. | Ein Tag, den du gewählt hattest, ist nicht mehr frei und wurde entfernt. | un día que habías elegido ya no está disponible y se ha quitado. | еден ден што го беше избрал повеќе не е достапен и е отстранет.
Questo campo serve per risponderti. | I need this to get back to you. | Ce champ est nécessaire pour vous répondre. | Dieses Feld brauche ich, um dir zu antworten. | Este campo es necesario para responderte. | Ова поле ми треба за да ти одговорам.
Controlla l'email: sembra incompleta. | Check the email address: it looks incomplete. | Vérifiez l'e-mail : il semble incomplet. | Prüf die E-Mail-Adresse: Sie scheint unvollständig zu sein. | Revisa el correo: parece incompleto. | Провери ја е-поштата: изгледа нецелосна.
Il formato non sembra corretto. | The format doesn't look right. | Le format ne semble pas correct. | Das Format scheint nicht zu stimmen. | El formato no parece correcto. | Форматот не изгледа точно.
Valore fuori intervallo. | Value out of range. | Valeur hors limites. | Wert außerhalb des zulässigen Bereichs. | Valor fuera de rango. | Вредноста е надвор од дозволениот опсег.
Manca ancora qualcosa: | Something's still missing: | Il manque encore quelque chose : | Es fehlt noch etwas: | Todavía falta algo: | Уште нешто недостасува:
+ aggiungi o cambia | + add or change | + ajouter ou modifier | + hinzufügen oder ändern | + añadir o cambiar | + додај или промени
Scegli dal calendario → | Choose from the calendar → | Choisir dans le calendrier → | Im Kalender auswählen → | Elige en el calendario → | Избери од календарот →
Date richieste | Requested dates | Dates demandées | Gewünschte Termine | Fechas solicitadas | Барани датуми
da definire | to be decided | à définir | noch offen | por definir | да се договори
Richiesta ricevuta! | Request received! | Demande reçue ! | Anfrage erhalten! | ¡Solicitud recibida! | Барањето е примено!
La tua richiesta è pronta | Your request is ready | Votre demande est prête | Deine Anfrage ist fertig | Tu solicitud está lista | Твоето барање е подготвено
Ultimo passo: mandami il riepilogo con un tocco su WhatsApp o via email. | Last step: send me the summary with one tap on WhatsApp or by email. | Dernière étape : envoyez-moi le récapitulatif en un clic sur WhatsApp ou par e-mail. | Letzter Schritt: Schick mir die Zusammenfassung mit einem Tipp per WhatsApp oder E-Mail. | Último paso: envíame el resumen con un toque por WhatsApp o por correo. | Последен чекор: испрати ми го резимето со еден допир на WhatsApp или по е-пошта.
Ultimo passo: mandami il riepilogo con un tocco su WhatsApp. | Last step: send me the summary with one tap on WhatsApp. | Dernière étape : envoyez-moi le récapitulatif en un clic sur WhatsApp. | Letzter Schritt: Schick mir die Zusammenfassung mit einem Tipp per WhatsApp. | Último paso: envíame el resumen con un toque por WhatsApp. | Последен чекор: испрати ми го резимето со еден допир на WhatsApp.
La data non è ancora bloccata: lo diventa quando confermiamo insieme. | The date isn't held yet: it will be once we confirm together. | La date n'est pas encore bloquée : elle le sera quand nous la confirmerons ensemble. | Der Termin ist noch nicht fest: Das wird er, sobald wir ihn gemeinsam bestätigen. | La fecha aún no está bloqueada: lo estará cuando la confirmemos juntos. | Датумот сè уште не е резервиран: ќе биде кога заедно ќе го потврдиме.
Invia su WhatsApp | Send on WhatsApp | Envoyer sur WhatsApp | Per WhatsApp senden | Enviar por WhatsApp | Испрати на WhatsApp
Invia via email | Send by email | Envoyer par e-mail | Per E-Mail senden | Enviar por correo | Испрати по е-пошта
Copia il riepilogo | Copy the summary | Copier le récapitulatif | Zusammenfassung kopieren | Copiar el resumen | Копирај го резимето
Torna alla home | Back to home | Retour à l'accueil | Zurück zur Startseite | Volver al inicio | Назад на почетната
Copiato ✓ | Copied ✓ | Copié ✓ | Kopiert ✓ | Copiado ✓ | Копирано ✓
Invio in corso… | Sending… | Envoi en cours… | Wird gesendet… | Enviando… | Се испраќа…
Invio non riuscito. Controlla la connessione e riprova, oppure scrivimi su Instagram. | Sending failed. Check your connection and try again, or message me on Instagram. | L'envoi a échoué. Vérifiez votre connexion et réessayez, ou écrivez-moi sur Instagram. | Senden fehlgeschlagen. Prüf deine Verbindung und versuch es nochmal – oder schreib mir auf Instagram. | No se ha podido enviar. Revisa la conexión y vuelve a intentarlo, o escríbeme en Instagram. | Испраќањето не успеа. Провери ја врската и обиди се повторно, или пиши ми на Instagram.
Inviata insieme al preventivo | Sent along with the quote | Envoyée avec le devis | Kommt zusammen mit dem Angebot | Se envía junto con el presupuesto | Се испраќа заедно со понудата
Prato dei nasi: tocca i nasi | Nose meadow: tap the noses | Le pré aux nez : touche les nez | Nasenwiese: Tipp die Nasen an | Prado de narices: toca las narices | Ливада со носеви: допри ги носевите
Via! | Go! | C'est parti ! | Los! | ¡Ya! | Почни!
Via! Tocca i nasi rossi. | Go! Tap the red noses. | C'est parti ! Touche les nez rouges. | Los! Tipp die roten Nasen an. | ¡Ya! Toca las narices rojas. | Почни! Допри ги црвените носеви.
Naso d'oro, vale 3 | Golden nose, worth 3 | Nez doré, il vaut 3 | Goldene Nase, zählt 3 | Nariz de oro, vale 3 | Златен нос, вреди 3
Naso rosso | Red nose | Nez rouge | Rote Nase | Nariz roja | Црвен нос
Palline: tocca una pallina, oppure premi spazio, per lanciarla | Balls: tap a ball, or press space, to throw it | Balles : touche une balle, ou appuie sur espace, pour la lancer | Bälle: Tipp einen Ball an oder drück die Leertaste, um ihn zu werfen | Pelotas: toca una pelota, o pulsa espacio, para lanzarla | Топчиња: допри топче или притисни ја празнината за да го фрлиш
Tocca la pallina! | Tap the ball! | Touche la balle ! | Tipp den Ball an! | ¡Toca la pelota! | Допри го топчето!
Attenzione, arriva un'altra pallina! | Watch out, here comes another ball! | Attention, une autre balle arrive ! | Achtung, da kommt noch ein Ball! | ¡Atención, llega otra pelota! | Внимание, доаѓа уште едно топче!
Tocca la pallina per lanciarla in alto. | Tap the ball to throw it up high. | Touche la balle pour la lancer en l'air. | Tipp den Ball an, um ihn hochzuwerfen. | Toca la pelota para lanzarla hacia arriba. | Допри го топчето за да го фрлиш високо.
naso preso | nose caught | nez attrapé | Nase geschnappt | nariz atrapada | фатен нос
nasi presi | noses caught | nez attrapés | Nasen geschnappt | narices atrapadas | фатени носеви
nasi | noses | nez | Nasen | narices | носеви
lancio | throw | lancer | Wurf | lanzamiento | фрлање
lanci | throws | lancers | Würfe | lanzamientos | фрлања
mossa | move | coup | Zug | movimiento | потег
mosse | moves | coups | Züge | movimientos | потези
Nasi | Noses | Nez | Nasen | Narices | Носеви
Lanci | Throws | Lancers | Würfe | Lanzamientos | Фрлања
Mosse | Moves | Coups | Züge | Movimientos | Потези
ancora nessuno | none yet | pas encore | noch keiner | todavía ninguno | сè уште нема
Che riflessi! | What reflexes! | Quels réflexes ! | Was für Reflexe! | ¡Qué reflejos! | Какви рефлекси!
Bravissimo! | Fantastic! | Génial ! | Klasse! | ¡Genial! | Одлично!
Riprova! | Try again! | Réessaie ! | Versuch's nochmal! | ¡Inténtalo otra vez! | Обиди се пак!
Sei un giocoliere! | You're a real juggler! | Tu es un vrai jongleur ! | Du bist ein echter Jongleur! | ¡Eres todo un malabarista! | Ти си вистински жонглер!
Ops, è caduta! | Oops, it fell! | Oups, elle est tombée ! | Hoppla, runtergefallen! | ¡Uy, se ha caído! | Упс, падна!
Tutte le coppie! | All the pairs! | Toutes les paires ! | Alle Paare! | ¡Todas las parejas! | Сите парови!
naso rosso | red nose | nez rouge | rote Nase | nariz roja | црвен нос
girasole | sunflower | tournesol | Sonnenblume | girasol | сончоглед
orsacchiotto | teddy bear | ourson | Teddybär | osito | мече
cestino | basket | panier | Körbchen | cesta | кошничка
pallina | ball | balle | Ball | pelota | топче
papillon | bow tie | nœud papillon | Fliege | pajarita | папионка
scarpa | shoe | chaussure | Schuh | zapato | чевел
trombetta | horn | trompette | Hupe | bocina | труба
Clown | = | = | = | = | Кловн
Due minuti, e ti rispondo al più presto con disponibilità e preventivo. | Two minutes, and I'll get back to you as soon as possible with availability and a quote. | Deux minutes, et je vous réponds au plus vite avec disponibilités et devis. | Zwei Minuten – und ich antworte dir so schnell wie möglich mit Verfügbarkeit und Angebot. | Dos minutos, y te respondo lo antes posible con disponibilidad y presupuesto. | Две минути, и ќе ти одговорам што е можно побрзо со достапност и понуда.
Preventivo gratuito e senza impegno | Free, no-obligation quote | Devis gratuit et sans engagement | Kostenloses, unverbindliches Angebot | Presupuesto gratuito y sin compromiso | Бесплатна понуда без обврски
Un girasole in equilibrio sul naso | A sunflower balanced on his nose | Un tournesol en équilibre sur le nez | Eine Sonnenblume, balanciert auf der Nase | Un girasol en equilibrio sobre la nariz | Сончоглед во рамнотежа на носот
Clown <span>✦</span> Physical actor <span>✦</span> Fantasista <span>✦</span> Giocoleria <span>✦</span> Equilibri | Clown <span>✦</span> Physical actor <span>✦</span> Entertainer <span>✦</span> Juggling <span>✦</span> Balancing acts | Clown <span>✦</span> Physical actor <span>✦</span> Fantaisiste <span>✦</span> Jonglage <span>✦</span> Équilibres | Clown <span>✦</span> Physical actor <span>✦</span> Varietékünstler <span>✦</span> Jonglage <span>✦</span> Balance-Akte | Clown <span>✦</span> Physical actor <span>✦</span> Artista de variedades <span>✦</span> Malabares <span>✦</span> Equilibrios | Кловн <span>✦</span> Physical actor <span>✦</span> Вариететски уметник <span>✦</span> Жонглирање <span>✦</span> Балансирање
Equilibri | Balancing acts | Équilibres | Balance-Akte | Equilibrios | Балансирање
Wondy è il personaggio creato e interpretato da Thomas Lucaccini, artista pisano formato tra circo e teatro. Clown, mimo e giocoliere, maestro di equilibri con gli oggetti, porta in scena uno spettacolo in cui il silenzio di un equilibrio vale quanto la risata più forte. | Wondy is the character created and played by Thomas Lucaccini, an artist from Pisa trained in circus and theatre. Clown, mime and juggler, a master of balancing objects, he brings to the stage a show in which the silence of a perfect balance is worth as much as the loudest laugh. | Wondy est le personnage créé et interprété par Thomas Lucaccini, artiste de Pisa formé entre cirque et théâtre. Clown, mime et jongleur, maître de l'équilibre d'objets, il porte sur scène un spectacle où le silence d'un équilibre vaut autant que le plus grand éclat de rire. | Wondy ist die Figur, die Thomas Lucaccini erfunden hat und selbst spielt – ein Künstler aus Pisa, ausgebildet zwischen Zirkus und Theater. Als Clown, Pantomime und Jongleur, ein Meister im Balancieren von Gegenständen, bringt er eine Show auf die Bühne, in der die Stille eines Balanceakts so viel zählt wie das lauteste Lachen. | Wondy es el personaje creado e interpretado por Thomas Lucaccini, artista pisano formado entre el circo y el teatro. Clown, mimo y malabarista, maestro del equilibrio con objetos, lleva a escena un espectáculo en el que el silencio de un equilibrio vale tanto como la carcajada más fuerte. | Wondy е ликот што го создал и го толкува Thomas Lucaccini, уметник од Пиза, школуван меѓу циркусот и театарот. Кловн, мим и жонглер, мајстор на балансирање предмети, тој на сцена носи шоу во кое тишината на една рамнотежа вреди колку и најгласната смеа.
Ogni evento è diverso: il prezzo dipende dalla proposta scelta, dalla data e dalla distanza. Compila la richiesta (due minuti) e ricevi una risposta chiara al più presto, gratis e senza impegno. | Every event is different: the price depends on the option you choose, the date and the distance. Fill in the request (two minutes) and get a clear answer as soon as possible, free and with no obligation. | Chaque événement est différent : le prix dépend de la formule choisie, de la date et de la distance. Remplissez la demande (deux minutes) et recevez une réponse claire au plus vite, gratuitement et sans engagement. | Jedes Event ist anders: Der Preis hängt vom gewählten Angebot, vom Datum und von der Entfernung ab. Füll die Anfrage aus (zwei Minuten) und du bekommst so schnell wie möglich eine klare Antwort – kostenlos und unverbindlich. | Cada evento es distinto: el precio depende de la propuesta elegida, de la fecha y de la distancia. Rellena la solicitud (dos minutos) y recibe una respuesta clara lo antes posible, gratis y sin compromiso. | Секој настан е различен: цената зависи од избраната понуда, датумот и растојанието. Пополни го барањето (две минути) и добиј јасен одговор што е можно побрзо, бесплатно и без обврски.
Scegli il giorno che preferisci: ti confermo la disponibilità al più presto. | Pick the day you prefer: I'll confirm availability as soon as possible. | Choisissez le jour que vous préférez : je vous confirme la disponibilité au plus vite. | Wähle deinen Wunschtag: Ich bestätige dir die Verfügbarkeit so schnell wie möglich. | Elige el día que prefieras: te confirmo la disponibilidad lo antes posible. | Избери го денот што го сакаш: ќе ти ја потврдам достапноста што е можно побрзо.
Grazie! Ti rispondo al più presto con disponibilità e preventivo. | Thank you! I'll get back to you as soon as possible with availability and a quote. | Merci ! Je vous réponds au plus vite avec disponibilités et devis. | Danke! Ich antworte dir so schnell wie möglich mit Verfügbarkeit und Angebot. | ¡Gracias! Te respondo lo antes posible con disponibilidad y presupuesto. | Ти благодарам! Ќе ти одговорам што е можно побрзо со достапност и понуда.
Note | Notes | Remarques | Anmerkungen | Notas | Забелешки
Tema della festa, sorprese, orari di accesso… | Party theme, surprises, access times… | Thème de la fête, surprises, horaires d'accès… | Motto der Feier, Überraschungen, Zugangszeiten… | Temática de la fiesta, sorpresas, horarios de acceso… | Тема на забавата, изненадувања, време на пристап…
`;

  /* ---------- costruzione delle tabelle ---------- */
  const N = (s) => String(s).replace(/\s+/g, " ").trim();
  const D = Object.create(null);   // italiano → [en, fr, de, es, mk]
  const REV = Object.create(null); // traduzione → italiano (per testi scritti dai js con parti già tradotte)
  RAW.split("\n").forEach((line) => {
    if (!line.trim()) return;
    const f = line.split(" | ").map(N);
    if (f.length !== 6) return;
    const it = f[0];
    D[it] = f.slice(1).map((x) => (x === "=" ? it : x));
    D[it].forEach((x) => { if (x !== it && !(x in REV)) REV[x] = it; });
  });

  let L = "it";   // lingua attiva
  let Li = -1;    // indice nella riga del dizionario (en = 0)
  const dict = (s) => (L === "it" ? s : D[s] ? D[s][Li] : null);
  const T = (s) => {
    if (L === "it") return s;
    if (D[s]) return D[s][Li];
    if (D[s + " *"]) return D[s + " *"][Li].replace(/ \*$/, ""); // etichette senza asterisco (elenco errori del modulo)
    for (const [re, fn] of RULES) { const m = s.match(re); if (m) { const r = fn(m); if (r != null) return r; } }
    return s;
  };
  const pick = (o, vars) => o[L].replace(/\$(\d)/g, (_, i) => vars[i]);

  /* ---------- regole per i testi composti nei js (numeri, date, nomi) ---------- */
  /* macedone a mano: molti browser (es. WebView) non hanno i dati Intl per "mk" e ripiegherebbero sull'italiano */
  const MK = {
    mesi: ["јануари","февруари","март","април","мај","јуни","јули","август","септември","октомври","ноември","декември"],
    giorni: ["недела","понеделник","вторник","среда","четврток","петок","сабота"],
    g3: ["нед","пон","вто","сре","чет","пет","саб"],
    m3: ["јан","фев","мар","апр","мај","јун","јул","авг","сеп","окт","ное","дек"],
    iniziali: ["П","В","С","Ч","П","С","Н"] // da lunedì
  };
  const MESI = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
  const UNITA = ["nasi", "naso preso", "nasi presi", "lancio", "lanci", "mossa", "mosse"];
  const RULES = [
    [/^(\d+) (giorno selezionato|giorni selezionati)$/, (m) => {
      const one = +m[1] === 1;
      const o = { en: ["day selected", "days selected"], fr: ["jour sélectionné", "jours sélectionnés"], de: ["Tag ausgewählt", "Tage ausgewählt"], es: ["día seleccionado", "días seleccionados"], mk: ["избран ден", "избрани дена"] };
      return m[1] + " " + o[L][one ? 0 : 1];
    }],
    /* etichetta dei giorni del calendario: "sabato 14 novembre: libero, selezionato" */
    [/^(.+): (libero|occupato|non prenotabile|da confermare|caricamento)(, selezionato)?$/, (m) =>
      m[1] + (L === "fr" ? " : " : ": ") + dict(m[2]) + (m[3] ? { en: ", selected", fr: ", sélectionné", de: ", ausgewählt",  es: ", seleccionado", mk: ", избрано" }[L] : "")],
    /* titolo del mese nel calendario */
    [new RegExp("^(" + MESI.join("|") + ") (\\d{4})$"), (m) =>
      L === "mk" ? MK.mesi[MESI.indexOf(m[1])] + " " + m[2]
        : new Intl.DateTimeFormat(LOC[L], { month: "long", year: "numeric", timeZone: "UTC" }).format(Date.UTC(+m[2], MESI.indexOf(m[1]), 15))],
    [/^Rimuovi (.+)$/, (m) => pick({ en: "Remove $1", fr: "Retirer $1", de: "$1 entfernen", es: "Quitar $1", mk: "Отстрани $1" }, m)],
    [/^(.+) \(da verificare\)$/, (m) => pick({ en: "$1 (to be checked)", fr: "$1 (à vérifier)", de: "$1 (zu prüfen)", es: "$1 (por verificar)", mk: "$1 (да се провери)" }, m)],
    [/^Tempo (\d+)$/, (m) => pick({ en: "Time $1", fr: "Temps $1", de: "Zeit $1", es: "Tiempo $1", mk: "Време $1" }, m)],
    [/^Coppie (\d+)\/(\d+)$/, (m) => pick({ en: "Pairs $1/$2", fr: "Paires $1/$2", de: "Paare $1/$2", es: "Parejas $1/$2", mk: "Парови $1/$2" }, m)],
    [/^Record: (.+)$/, (m) => dict("Record:") + " " + T(m[1])],
    [new RegExp("^(\\d+) (" + UNITA.join("|") + ")$"), (m) => m[1] + " " + dict(m[2])],
    [/^Memory: (\d+) carte$/, (m) => pick({ en: "Memory: $1 cards", fr: "Memory : $1 cartes", de: "Memory: $1 Karten", es: "Memory: $1 cartas", mk: "Мемори: $1 карти" }, m)],
    [/^Carta (\d+), coperta$/, (m) => pick({ en: "Card $1, face down", fr: "Carte $1, face cachée", de: "Karte $1, verdeckt", es: "Carta $1, boca abajo", mk: "Карта $1, затворена" }, m)],
    [/^Carta (\d+): (.+?)(, coppia trovata)?$/, (m) => pick({ en: "Card $1: $2", fr: "Carte $1 : $2", de: "Karte $1: $2", es: "Carta $1: $2", mk: "Карта $1: $2" }, [0, m[1], T(m[2])]) +
      (m[3] ? { en: ", pair found", fr: ", paire trouvée", de: ", Paar gefunden", es: ", pareja encontrada", mk: ", пронајден пар" }[L] : "")],
    [/^Coppia trovata: (.+)!$/, (m) => pick({ en: "Pair found: $1!", fr: "Paire trouvée : $1 !", de: "Paar gefunden: $1!", es: "¡Pareja encontrada: $1!", mk: "Пронајден пар: $1!" }, [0, T(m[1])])],
    [/^Memory con (\d+) carte\. Trova le coppie\.$/, (m) => pick({ en: "Memory with $1 cards. Find the pairs.", fr: "Memory avec $1 cartes. Trouve les paires.", de: "Memory mit $1 Karten. Finde die Paare.", es: "Memory con $1 cartas. Encuentra las parejas.", mk: "Мемори со $1 карти. Најди ги паровите." }, m)],
    /* annuncio di fine partita: "Bravo! 12 nasi presi. Nuovo record!" */
    [/^(.+?!) (\d+) (.+?)\.( Nuovo record!)?$/, (m) => D[m[1]] && D[m[3]] ? dict(m[1]) + " " + m[2] + " " + dict(m[3]) + "." + (m[4] ? " " + dict("Nuovo record!") : "") : null]
  ];

  /* ---------- traduzione del DOM ---------- */
  const TXT = new WeakMap();  // nodo di testo → { o: originale italiano, t: testo scritto }
  const BLK = new WeakMap();  // elemento tradotto come blocco HTML → { o, t }
  const ATT = new WeakMap();  // elemento → { attributo: { o, t } }
  const INLINE = /^(EM|STRONG|B|I|BR|SMALL|SPAN)$/;
  const SKIP = "script,style,noscript,textarea,template,svg,.lang-switch,.cal-week,[data-i18n-skip]";
  const hasLetters = (s) => /\p{L}/u.test(s);
  const toIt = (s) => (D[s] ? s : REV[s] || (REV[s + " *"] ? REV[s + " *"].replace(/ \*$/, "") : s));

  function doText(n) {
    const raw = n.data;
    const core = N(raw);
    if (!core || !hasLetters(core)) return;
    const rec = TXT.get(n);
    const o = rec && raw === rec.t ? rec.o : toIt(core);
    const p = n.parentNode;
    /* le option senza value inviano il testo: lo fisso in italiano, così Wondy riceve sempre i valori originali */
    if (p && p.nodeName === "OPTION" && !p.hasAttribute("value")) p.setAttribute("value", o);
    const out = T(o);
    if (out !== core) {
      const lead = raw.match(/^\s*/)[0], trail = raw.slice(lead.length).match(/\s*$/)[0];
      n.data = lead + out + trail;
    }
    TXT.set(n, { o, t: n.data });
  }

  /* un elemento è un "blocco" se contiene solo tag inline semplici (senza id né data-*) */
  function inlineOnly(el) {
    if (!el.firstElementChild) return false;
    const all = el.getElementsByTagName("*");
    if (all.length > 14) return false;
    for (const d of all) {
      if (!INLINE.test(d.tagName)) return false;
      for (const a of d.attributes) if (a.name !== "class" && a.name !== "aria-hidden") return false;
    }
    return true;
  }
  function doBlock(el) {
    const rec = BLK.get(el);
    if (!rec && !inlineOnly(el)) return false;
    const cur = N(el.innerHTML);
    const o = rec && cur === rec.t ? rec.o : cur;
    if (!D[o]) { BLK.delete(el); return false; }
    const out = L === "it" ? o : D[o][Li];
    if (out !== cur) el.innerHTML = out;
    BLK.set(el, { o, t: N(el.innerHTML) });
    return true;
  }

  function doAttrs(el) {
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (v == null) continue;
      const core = N(v);
      if (!core || !hasLetters(core)) continue;
      let m = ATT.get(el);
      if (!m) ATT.set(el, (m = {}));
      const o = m[a] && v === m[a].t ? m[a].o : toIt(core);
      const out = T(o);
      if (out !== v) el.setAttribute(a, out);
      m[a] = { o, t: el.getAttribute(a) };
    }
  }
  const origAttr = (el, a) => { const m = ATT.get(el); const v = el.getAttribute(a); return m && m[a] && m[a].t === v ? m[a].o : v && toIt(N(v)); };

  function walk(node) {
    if (node.nodeType === 3) { doText(node); return; }
    if (node.nodeType !== 1) return;
    if (node.nodeName === "TEXTAREA") { doAttrs(node); return; } // solo placeholder e data-label
    if (node.matches(SKIP)) return;
    doAttrs(node);
    if (doBlock(node)) return;
    for (let c = node.firstChild; c; c = c.nextSibling) walk(c);
  }
  const skipped = (n) => { const el = n.nodeType === 1 ? n : n.parentElement; return !el || !!el.closest(SKIP); };

  /* intestazione dei giorni della settimana (L M M G V S D), a partire da lunedì */
  function doWeek() {
    const f = new Intl.DateTimeFormat(LOC[L], { weekday: "narrow", timeZone: "UTC" });
    document.querySelectorAll(".cal-week").forEach((w) => {
      [...w.children].forEach((s, i) => { const t = L === "mk" ? MK.iniziali[i] : f.format(Date.UTC(2024, 0, 1 + i)).toUpperCase(); if (s.textContent !== t) s.textContent = t; });
    });
  }
  function doHead() {
    document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[property="og:title"]').forEach((m) => {
      if (!m.dataset.i18nOrig) m.dataset.i18nOrig = N(m.content);
      m.content = T(m.dataset.i18nOrig);
    });
  }
  function updateTitle() {
    const v = document.querySelector("[data-view]:not([hidden])");
    const dt = v && v.hasAttribute("data-title") ? origAttr(v, "data-title") : "";
    document.title = dt ? T(dt) + " · " + BASE_TITLE : BASE_TITLE;
  }

  /* ---------- osservatore: traduce ciò che i js aggiungono o cambiano ---------- */
  const OPTS = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS };
  const mo = new MutationObserver((recs) => {
    mo.disconnect(); // le nostre modifiche non generano nuovi eventi: niente loop
    for (const r of recs) {
      if (r.type === "childList") r.addedNodes.forEach((n) => { if (n.isConnected && !skipped(n)) walk(n); });
      else if (r.type === "characterData") { if (r.target.isConnected && !skipped(r.target)) doText(r.target); }
      else if (r.target.isConnected && (r.target.nodeName === "TEXTAREA" || !skipped(r.target))) doAttrs(r.target);
    }
    mo.observe(document.body, OPTS);
  });

  /* ---------- date nella lingua attiva (stessa firma di calendar.js) ---------- */
  const W = (window.Wondy = window.Wondy || {});
  const itLabel = W.dateLabel;
  const fmtCache = {};
  const fmt = (k, o) => fmtCache[L + k] || (fmtCache[L + k] = new Intl.DateTimeFormat(LOC[L], Object.assign({ timeZone: "UTC" }, o)));
  function localLabel(k, short) {
    if (L === "it" && itLabel) return itLabel(k, short);
    const [y, m, d] = String(k).split("-").map(Number);
    const t = Date.UTC(y, m - 1, d);
    if (L === "mk") { const g = new Date(t).getUTCDay(); return short ? `${MK.g3[g]} ${d} ${MK.m3[m - 1]}` : `${MK.giorni[g]}, ${d} ${MK.mesi[m - 1]}`; }
    if (!short) return fmt("l", { weekday: "long", day: "numeric", month: "long" }).format(t);
    const p = {};
    fmt("s", { weekday: "short", day: "numeric", month: "short" }).formatToParts(t).forEach((x) => { p[x.type] = x.value; });
    const c = (s) => String(s || "").replace(/\.$/, "");
    return c(p.weekday) + " " + p.day + (L === "de" ? ". " : " ") + c(p.month); // es. "Sat 14 Nov"
  }
  W.dateLabel = localLabel;

  /* ---------- selettore di lingua ---------- */
  const GLOBE = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.8 3.8 5.8 3.8 9s-1.2 6.2-3.8 9c-2.6-2.8-3.8-5.8-3.8-9S9.4 5.8 12 3z"/></g></svg>';
  const switchers = [];
  let uid = 0;
  function build(variant) {
    const id = "lang-list-" + ++uid;
    const box = document.createElement("div");
    box.className = "lang-switch lang-switch--" + variant;
    box.innerHTML = `<button type="button" class="lang-switch__btn" aria-expanded="false" aria-controls="${id}">${GLOBE}<span class="lang-switch__code"></span></button>` +
      `<ul class="lang-switch__list" id="${id}" hidden>${LANGS.map((l) => `<li><button type="button" class="lang-switch__opt" lang="${l}" data-lang="${l}"><b>${l.toUpperCase()}</b><span>${NAMES[l]}</span></button></li>`).join("")}</ul>`;
    const btn = box.firstElementChild, list = box.lastElementChild;
    const opts = [...list.querySelectorAll("[data-lang]")];
    const open = (on) => { list.hidden = !on; btn.setAttribute("aria-expanded", String(on)); };
    btn.addEventListener("click", () => {
      const on = list.hidden; open(on);
      if (on) (opts.find((o) => o.dataset.lang === L) || opts[0]).focus();
    });
    list.addEventListener("click", (e) => {
      const o = e.target.closest("[data-lang]");
      if (!o) return;
      open(false); btn.focus();
      setLang(o.dataset.lang, true);
    });
    box.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !list.hidden) { open(false); btn.focus(); }
      if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !list.hidden) {
        e.preventDefault();
        const i = opts.indexOf(document.activeElement);
        opts[(i + (e.key === "ArrowDown" ? 1 : opts.length - 1)) % opts.length].focus();
      }
    });
    box.addEventListener("focusout", (e) => { if (!box.contains(e.relatedTarget) && e.relatedTarget) open(false); });
    switchers.push({ box, btn, opts, open });
    return box;
  }
  document.addEventListener("click", (e) => { switchers.forEach((s) => { if (!s.box.contains(e.target)) s.open(false); }); });
  function updateSwitchers() {
    switchers.forEach((s) => {
      s.btn.querySelector(".lang-switch__code").textContent = L.toUpperCase();
      s.btn.setAttribute("aria-label", LABEL[L] + ": " + NAMES[L]);
      s.opts.forEach((o) => { if (o.dataset.lang === L) o.setAttribute("aria-current", "true"); else o.removeAttribute("aria-current"); });
    });
  }
  function placeSwitchers() {
    const hero = document.querySelector(".hero");
    if (hero) hero.append(build("hero"));
    const cta = document.querySelector("nav.deskbar .deskbar__cta");
    if (cta) cta.before(build("desk"));
    document.querySelectorAll(".topbar").forEach((tb) => {
      const logo = tb.querySelector(".topbar__logo");
      if (logo) logo.before(build("topbar")); else tb.append(build("topbar"));
    });
  }

  /* ---------- cambio di lingua ---------- */
  function setLang(l, user) {
    if (!LANGS.includes(l)) l = "it";
    const changed = l !== L;
    L = l; Li = LANGS.indexOf(l) - 1;
    document.documentElement.lang = l;
    if (user) { try { localStorage.setItem("wondy-lang", l); } catch (e) {} }
    mo.disconnect();
    walk(document.body);
    doWeek(); doHead(); updateSwitchers();
    mo.observe(document.body, OPTS);
    updateTitle();
    if (changed) {
      /* calendario, modulo e striscia si ridisegnano con le nuove date */
      document.dispatchEvent(new CustomEvent("wondy:change"));
      if (W.freeDays && W.freeDays.length) document.dispatchEvent(new CustomEvent("wondy:days"));
    }
  }
  function initialLang() {
    const q = (new URLSearchParams(location.search).get("lang") || "").toLowerCase();
    if (LANGS.includes(q)) { try { localStorage.setItem("wondy-lang", q); } catch (e) {} return q; }
    try { const s = localStorage.getItem("wondy-lang"); if (LANGS.includes(s)) return s; } catch (e) {}
    const nav = [].concat(navigator.languages || [], navigator.language || []);
    for (const x of nav) { const c = String(x).slice(0, 2).toLowerCase(); if (LANGS.includes(c)) return c; }
    return "it";
  }

  /* il titolo della scheda: app.js lo imposta a ogni cambio di schermata, qui lo si traduce */
  document.addEventListener("wondy:view", updateTitle);

  W.setLang = (l) => setLang(l, true);
  W.lang = () => L;

  placeSwitchers();
  const first = initialLang();
  L = "it";
  if (first === "it") { updateSwitchers(); mo.observe(document.body, OPTS); }
  else setLang(first, false);
})();

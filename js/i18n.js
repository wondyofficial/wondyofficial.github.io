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
Quattro giochi piccoli piccoli, da fare insieme a mamma e papà. | Four teeny-tiny games to play together with Mum and Dad. | Quatre tout petits jeux, à faire avec papa et maman. | Vier klitzekleine Spiele für dich, Mama und Papa. | Cuatro juegos chiquititos para jugar con mamá y papá. | Четири мали-мали игри за играње заедно со мама и тато.
Giochi per bambini<small>Naso · Giocoleria · Memory · Colora</small> | Games for kids<small>Nose · Juggling · Memory · Colouring</small> | Jeux pour enfants<small>Nez · Jonglage · Memory · Coloriage</small> | Spiele für Kinder<small>Nase · Jonglieren · Memory · Ausmalen</small> | Juegos para niños<small>Nariz · Malabares · Memory · Colorear</small> | Игри за деца<small>Нос · Жонглирање · Мемори · Боење</small>
Naso · Giocoleria · Memory · Colora | Nose · Juggling · Memory · Colouring | Nez · Jonglage · Memory · Coloriage | Nase · Jonglieren · Memory · Ausmalen | Nariz · Malabares · Memory · Colorear | Нос · Жонглирање · Мемори · Боење
Tira la corda: si apre il sipario | Pull the rope: the curtain opens | Tire la corde : le rideau s'ouvre | Zieh am Seil: Der Vorhang geht auf | Tira de la cuerda: se abre el telón | Повлечи го јажето: завесата се отвора
Colora Wondy | Colour in Wondy | Colorie Wondy | Mal Wondy aus | Colorea a Wondy | Обој го Wondy
Scegli un colore e tocca Wondy! | Pick a colour and tap Wondy! | Choisis une couleur et touche Wondy ! | Such dir eine Farbe aus und tipp Wondy an! | ¡Elige un color y toca a Wondy! | Избери боја и допри го Wondy!
Dal libro <b>Wondy Paint</b> · il disegno resta salvato | From the book <b>Wondy Paint</b> · your drawing stays saved | Tiré du livre <b>Wondy Paint</b> · ton dessin reste enregistré | Aus dem Buch <b>Wondy Paint</b> · dein Bild bleibt gespeichert | Del libro <b>Wondy Paint</b> · tu dibujo se queda guardado | Од книгата <b>Wondy Paint</b> · цртежот останува зачуван
Dal libro | From the book | Tiré du livre | Aus dem Buch | Del libro | Од книгата
· il disegno resta salvato | · your drawing stays saved | · ton dessin reste enregistré | · dein Bild bleibt gespeichert | · tu dibujo se queda guardado | · цртежот останува зачуван
Gioca a Colora Wondy | Play Colour in Wondy | Jouer à Colorie Wondy | Mal Wondy aus spielen | Jugar a Colorea a Wondy | Играј „Обој го Wondy“
Scegli un colore, poi tocca Wondy! <span aria-hidden="true">✿</span> | Pick a colour, then tap Wondy! <span aria-hidden="true">✿</span> | Choisis une couleur, puis touche Wondy ! <span aria-hidden="true">✿</span> | Such dir eine Farbe aus, dann tipp Wondy an! <span aria-hidden="true">✿</span> | ¡Elige un color y luego toca a Wondy! <span aria-hidden="true">✿</span> | Избери боја, па допри го Wondy! <span aria-hidden="true">✿</span>
Scegli un colore, poi tocca Wondy! | Pick a colour, then tap Wondy! | Choisis une couleur, puis touche Wondy ! | Such dir eine Farbe aus, dann tipp Wondy an! | ¡Elige un color y luego toca a Wondy! | Избери боја, па допри го Wondy!
Wondy da colorare | Wondy to colour in | Wondy à colorier | Wondy zum Ausmalen | Wondy para colorear | Wondy за боење
Colori | Colours | Couleurs | Farben | Colores | Бои
Ricomincia: cancella i colori | Start over: clear the colours | Recommencer : effacer les couleurs | Neu anfangen: Farben löschen | Empezar de nuevo: borrar los colores | Почни одново: избриши ги боите
Ricomincia | Start over | Recommencer | Neu anfangen | Empezar de nuevo | Почни одново
Colora con i colori veri di Wondy | Colour with Wondy's real colours | Colorier avec les vraies couleurs de Wondy | Mit Wondys echten Farben ausmalen | Colorear con los colores de verdad de Wondy | Обој со вистинските бои на Wondy
Colori veri di Wondy | Wondy's real colours | Les vraies couleurs de Wondy | Wondys echte Farben | Los colores de verdad de Wondy | Вистинските бои на Wondy
Salva il disegno come immagine | Save the drawing as an image | Enregistrer le dessin en image | Bild als Datei speichern | Guardar el dibujo como imagen | Зачувај го цртежот како слика
Salva il disegno | Save the drawing | Enregistrer le dessin | Bild speichern | Guardar el dibujo | Зачувај го цртежот
Rosso | Red | Rouge | Rot | Rojo | Црвена
Nero velluto | Velvet black | Noir velours | Samtschwarz | Negro terciopelo | Кадифено црна
Bianco | White | Blanc | Weiß | Blanco | Бела
Oro | Gold | Or | Gold | = | Златна
Rosa pelle | Skin pink | Rose chair | Hautrosa | Rosa piel | Телесно розова
Azzurro | Sky blue | Bleu ciel | Himmelblau | Celeste | Небесно сина
Verde | Green | Vert | Grün | = | Зелена
Viola | Purple | Violet | Lila | Morado | Виолетова
Rosa | Pink | Rose | = | = | Розова
Arancione | Orange | Orange | Orange | Naranja | Портокалова
Colora lo sfondo | Colour the background | Colorie le fond | Mal den Hintergrund aus | Colorea el fondo | Обој ја позадината
Colora il girasole | Colour the sunflower | Colorie le tournesol | Mal die Sonnenblume aus | Colorea el girasol | Обој го сончогледот
Colora i capelli | Colour the hair | Colorie les cheveux | Mal die Haare aus | Colorea el pelo | Обој ја косата
Colora il viso | Colour the face | Colorie le visage | Mal das Gesicht aus | Colorea la cara | Обој го лицето
Colora il naso | Colour the nose | Colorie le nez | Mal die Nase aus | Colorea la nariz | Обој го носот
Colora il papillon | Colour the bow tie | Colorie le nœud papillon | Mal die Fliege aus | Colorea la pajarita | Обој ја папионката
Colora il gilet | Colour the waistcoat | Colorie le gilet | Mal die Weste aus | Colorea el chaleco | Обој го елекот
Colora la camicia | Colour the shirt | Colorie la chemise | Mal das Hemd aus | Colorea la camisa | Обој ја кошулата
Colora i pantaloni | Colour the trousers | Colorie le pantalon | Mal die Hose aus | Colorea los pantalones | Обој ги панталоните
Colora le scarpe | Colour the shoes | Colorie les chaussures | Mal die Schuhe aus | Colorea los zapatos | Обој ги чевлите
Che capolavoro! Hai colorato tutto Wondy. | What a masterpiece! You've coloured in all of Wondy. | Quel chef-d'œuvre ! Tu as colorié tout Wondy. | Was für ein Meisterwerk! Du hast Wondy ganz ausgemalt. | ¡Qué obra maestra! Has coloreado a Wondy entero. | Какво ремек-дело! Го обои целиот Wondy.
Foglio bianco: si ricomincia! | Blank page: let's start again! | Page blanche : on recommence ! | Leeres Blatt: Es geht von vorne los! | Hoja en blanco: ¡empezamos de nuevo! | Празен лист: почнуваме одново!
Ecco Wondy con i suoi colori veri! | Here's Wondy in his real colours! | Voici Wondy avec ses vraies couleurs ! | Hier ist Wondy in seinen echten Farben! | ¡Aquí está Wondy con sus colores de verdad! | Еве го Wondy со неговите вистински бои!
Su questo telefono non riesco a salvare il disegno. | I can't save the drawing on this phone. | Je n'arrive pas à enregistrer le dessin sur ce téléphone. | Auf diesem Handy kann ich das Bild nicht speichern. | En este teléfono no puedo guardar el dibujo. | На овој телефон не можам да го зачувам цртежот.
Disegno salvato! | Drawing saved! | Dessin enregistré ! | Bild gespeichert! | ¡Dibujo guardado! | Цртежот е зачуван!
Scegli un colore, poi tocca una parte di Wondy. | Pick a colour, then tap a part of Wondy. | Choisis une couleur, puis touche une partie de Wondy. | Such dir eine Farbe aus und tipp dann auf einen Teil von Wondy. | Elige un color y luego toca una parte de Wondy. | Избери боја, па допри дел од Wondy.
Colorati | Coloured | Coloriés | Ausgemalt | Coloreados | Обоени
Famiglie | Families | Familles | Familien | Familias | Семејства
Musica di sottofondo | Background music | Musique de fond | Hintergrundmusik | Música de fondo | Музика во позадина
Per le famiglie<small>Bimbi timidi · Diploma · Biglietto</small> | For families<small>Shy kids · Diploma · Ticket</small> | Pour les familles<small>Enfants timides · Diplôme · Billet</small> | Für Familien<small>Schüchterne Kinder · Diplom · Eintrittskarte</small> | Para las familias<small>Niños tímidos · Diploma · Entrada</small> | За семејствата<small>Срамежливи деца · Диплома · Билет</small>
Per le famiglie | For families | Pour les familles | Für Familien | Para las familias | За семејствата
Bimbi timidi · Diploma · Biglietto | Shy kids · Diploma · Ticket | Enfants timides · Diplôme · Billet | Schüchterne Kinder · Diplom · Eintrittskarte | Niños tímidos · Diploma · Entrada | Срамежливи деца · Диплома · Билет
Giochi per bambini<small>Giochi, respiro e mimo da fare insieme</small> | Games for kids<small>Games, breathing and mime to share</small> | Jeux pour enfants<small>Jeux, respiration et mime à faire ensemble</small> | Spiele für Kinder<small>Spiele, Atmen und Pantomime zum Mitmachen</small> | Juegos para niños<small>Juegos, respiración y mímica para hacer juntos</small> | Игри за деца<small>Игри, дишење и мимика за заедно</small>
Giochi, respiro e mimo da fare insieme | Games, breathing and mime to share | Jeux, respiration et mime à faire ensemble | Spiele, Atmen und Pantomime zum Mitmachen | Juegos, respiración y mímica para hacer juntos | Игри, дишење и мимика за заедно
<span aria-hidden="true">♪</span> Musica | <span aria-hidden="true">♪</span> Music | <span aria-hidden="true">♪</span> Musique | <span aria-hidden="true">♪</span> Musik | <span aria-hidden="true">♪</span> Música | <span aria-hidden="true">♪</span> Музика
Musica | Music | Musique | Musik | Música | Музика
<span class="dot" aria-hidden="true"></span> Modalità calma | <span class="dot" aria-hidden="true"></span> Calm mode | <span class="dot" aria-hidden="true"></span> Mode calme | <span class="dot" aria-hidden="true"></span> Ruhemodus | <span class="dot" aria-hidden="true"></span> Modo tranquilo | <span class="dot" aria-hidden="true"></span> Мирен режим
Modalità calma | Calm mode | Mode calme | Ruhemodus | Modo tranquilo | Мирен режим
Richiama Wondy | Call Wondy back | Rappeler Wondy | Wondy zurückholen | Llamar a Wondy | Повикај го Wondy
Wondy, riposa | Wondy, take a rest | Wondy, repose-toi | Wondy, ruh dich aus | Wondy, descansa | Wondy, одмори се
Per mamma, papà <span aria-hidden="true">✦</span> e bambini | For Mum, Dad <span aria-hidden="true">✦</span> and kids | Pour maman, papa <span aria-hidden="true">✦</span> et les enfants | Für Mama, Papa <span aria-hidden="true">✦</span> und Kinder | Para mamá, papá <span aria-hidden="true">✦</span> y niños | За мама, тато <span aria-hidden="true">✦</span> и децата
Per mamma, papà | For Mum, Dad | Pour maman, papa | Für Mama, Papa | Para mamá, papá | За мама, тато
e bambini | and kids | et les enfants | und Kinder | y niños | и децата
Prepararsi alla festa, <em>senza sorprese brutte</em> | Getting ready for the party, <em>with no nasty surprises</em> | Se préparer à la fête, <em>sans mauvaises surprises</em> | Gut vorbereitet zur Feier, <em>ohne böse Überraschungen</em> | Prepararse para la fiesta, <em>sin sustos</em> | Подготовка за забавата, <em>без непријатни изненадувања</em>
Prepararsi alla festa, | Getting ready for the party, | Se préparer à la fête, | Gut vorbereitet zur Feier, | Prepararse para la fiesta, | Подготовка за забавата,
senza sorprese brutte | with no nasty surprises | sans mauvaises surprises | ohne böse Überraschungen | sin sustos | без непријатни изненадувања
Qualche consiglio per i bambini più sensibili, una piccola storia da guardare insieme e tante cose da stampare e colorare. | A few tips for more sensitive children, a little story to look at together and lots of things to print and colour in. | Quelques conseils pour les enfants plus sensibles, une petite histoire à regarder ensemble et plein de choses à imprimer et à colorier. | Ein paar Tipps für sensible Kinder, eine kleine Geschichte zum gemeinsamen Anschauen und vieles zum Ausdrucken und Ausmalen. | Algunos consejos para los niños más sensibles, una pequeña historia para mirar juntos y muchas cosas para imprimir y colorear. | Неколку совети за почувствителните деца, мала приказна за гледање заедно и многу работи за печатење и боење.
In questa pagina | On this page | Sur cette page | Auf dieser Seite | En esta página | На оваа страница
Bambini timidi | Shy children | Enfants timides | Schüchterne Kinder | Niños tímidos | Срамежливи деца
Il tuo nome | Your name | Ton prénom | Dein Name | Tu nombre | Твоето име
Da stampare | To print | À imprimer | Zum Ausdrucken | Para imprimir | За печатење
Per bambini sensibili e timidi | For sensitive and shy children | Pour les enfants sensibles et timides | Für sensible und schüchterne Kinder | Para niños sensibles y tímidos | За чувствителни и срамежливи деца
Wondy non parla, non insegue e non obbliga nessuno: i bambini timidi o che hanno un po' paura dei clown possono guardare da lontano, in braccio a voi. Si avvicinano solo quando se la sentono, e spesso finiscono a ridere in prima fila. | Wondy doesn't talk, doesn't chase anyone and never makes anyone join in: shy children, or those a little scared of clowns, can watch from a distance, in your arms. They come closer only when they feel ready, and often end up laughing in the front row. | Wondy ne parle pas, ne poursuit personne et n'oblige personne : les enfants timides, ou qui ont un peu peur des clowns, peuvent regarder de loin, dans vos bras. Ils s'approchent seulement quand ils se sentent prêts, et finissent souvent par rire au premier rang. | Wondy spricht nicht, läuft niemandem hinterher und zwingt niemanden: Schüchterne Kinder oder Kinder, die ein bisschen Angst vor Clowns haben, können aus der Ferne zuschauen, auf eurem Arm. Sie kommen erst näher, wenn sie sich trauen – und lachen am Ende oft in der ersten Reihe. | Wondy no habla, no persigue ni obliga a nadie: los niños tímidos o que tienen un poco de miedo a los payasos pueden mirar de lejos, en vuestros brazos. Se acercan solo cuando se sienten preparados, y a menudo acaban riendo en primera fila. | Wondy не зборува, не брка никого и никого не присилува: срамежливите деца, или оние што малку се плашат од кловнови, можат да гледаат оддалеку, во вашите прегратки. Се приближуваат само кога ќе се почувствуваат подготвени, и често завршуваат смеејќи се во првиот ред.
Cosa succede alla festa | What happens at the party | Ce qui se passe à la fête | Was auf der Feier passiert | Qué pasa en la fiesta | Што се случува на забавата
Raccontatelo prima al bambino, con calma: sapere cosa succede aiuta a stare tranquilli. | Tell your child beforehand, calmly: knowing what will happen helps them feel at ease. | Racontez-le à l'enfant avant, calmement : savoir ce qui va se passer aide à rester serein. | Erzählt es eurem Kind vorher in Ruhe: Wer weiß, was passiert, bleibt entspannter. | Contádselo antes al niño, con calma: saber lo que va a pasar ayuda a estar tranquilo. | Раскажете му на детето однапред, смирено: кога знае што ќе се случи, полесно е мирно.
<strong>Wondy arriva a sorpresa</strong>Entra piano, con un grande sorriso e il naso rosso. Non dice una parola. | <strong>Wondy arrives as a surprise</strong>He comes in quietly, with a big smile and his red nose. He doesn't say a word. | <strong>Wondy arrive par surprise</strong>Il entre doucement, avec un grand sourire et son nez rouge. Il ne dit pas un mot. | <strong>Wondy kommt überraschend</strong>Er kommt leise herein, mit einem breiten Lächeln und roter Nase. Er sagt kein Wort. | <strong>Wondy llega por sorpresa</strong>Entra despacio, con una gran sonrisa y la nariz roja. No dice ni una palabra. | <strong>Wondy доаѓа изненадно</strong>Влегува тивко, со голема насмевка и црвен нос. Не кажува ниту збор.
Wondy arriva a sorpresa | Wondy arrives as a surprise | Wondy arrive par surprise | Wondy kommt überraschend | Wondy llega por sorpresa | Wondy доаѓа изненадно
Entra piano, con un grande sorriso e il naso rosso. Non dice una parola. | He comes in quietly, with a big smile and his red nose. He doesn't say a word. | Il entre doucement, avec un grand sourire et son nez rouge. Il ne dit pas un mot. | Er kommt leise herein, mit einem breiten Lächeln und roter Nase. Er sagt kein Wort. | Entra despacio, con una gran sonrisa y la nariz roja. No dice ni una palabra. | Влегува тивко, со голема насмевка и црвен нос. Не кажува ниту збор.
<strong>Gioca con i bambini</strong>Palline, bolle, piccoli scherzi. Chi vuole partecipa, chi no guarda. | <strong>He plays with the children</strong>Balls, bubbles, little jokes. Whoever wants to joins in; whoever doesn't, just watches. | <strong>Il joue avec les enfants</strong>Balles, bulles, petites blagues. Qui veut participe, les autres regardent. | <strong>Er spielt mit den Kindern</strong>Bälle, Seifenblasen, kleine Späße. Wer will, macht mit, wer nicht, schaut zu. | <strong>Juega con los niños</strong>Pelotas, burbujas, pequeñas bromas. Quien quiere participa, quien no, mira. | <strong>Си игра со децата</strong>Топчиња, меурчиња, мали шеги. Кој сака учествува, кој не – гледа.
Gioca con i bambini | He plays with the children | Il joue avec les enfants | Er spielt mit den Kindern | Juega con los niños | Си игра со децата
Palline, bolle, piccoli scherzi. Chi vuole partecipa, chi no guarda. | Balls, bubbles, little jokes. Whoever wants to joins in; whoever doesn't, just watches. | Balles, bulles, petites blagues. Qui veut participe, les autres regardent. | Bälle, Seifenblasen, kleine Späße. Wer will, macht mit, wer nicht, schaut zu. | Pelotas, burbujas, pequeñas bromas. Quien quiere participa, quien no, mira. | Топчиња, меурчиња, мали шеги. Кој сака учествува, кој не – гледа.
<strong>Fa lo spettacolo</strong>Equilibri, giocoleria e i suoi amici: l'orsetto, il cestino e il girasole. | <strong>He does the show</strong>Balancing acts, juggling and his friends: the teddy bear, the basket and the sunflower. | <strong>Il fait le spectacle</strong>Équilibres, jonglage et ses amis : l'ourson, le panier et le tournesol. | <strong>Er spielt die Show</strong>Balance-Akte, Jonglage und seine Freunde: der Teddy, der Korb und die Sonnenblume. | <strong>Hace el espectáculo</strong>Equilibrios, malabares y sus amigos: el osito, la cesta y el girasol. | <strong>Го изведува шоуто</strong>Балансирање, жонглирање и неговите пријатели: мечето, кошничката и сончогледот.
Fa lo spettacolo | He does the show | Il fait le spectacle | Er spielt die Show | Hace el espectáculo | Го изведува шоуто
Equilibri, giocoleria e i suoi amici: l'orsetto, il cestino e il girasole. | Balancing acts, juggling and his friends: the teddy bear, the basket and the sunflower. | Équilibres, jonglage et ses amis : l'ourson, le panier et le tournesol. | Balance-Akte, Jonglage und seine Freunde: der Teddy, der Korb und die Sonnenblume. | Equilibrios, malabares y sus amigos: el osito, la cesta y el girasol. | Балансирање, жонглирање и неговите пријатели: мечето, кошничката и сончогледот.
<strong>Saluta e va via</strong>Un inchino, un saluto con la mano. La festa continua con voi. | <strong>He says goodbye and leaves</strong>A bow, a wave of the hand. The party carries on with you. | <strong>Il salue et s'en va</strong>Une révérence, un signe de la main. La fête continue avec vous. | <strong>Er verabschiedet sich und geht</strong>Eine Verbeugung, ein Winken. Die Feier geht mit euch weiter. | <strong>Se despide y se va</strong>Una reverencia, un saludo con la mano. La fiesta sigue con vosotros. | <strong>Се поздравува и си заминува</strong>Поклон, мавтање со рака. Забавата продолжува со вас.
Saluta e va via | He says goodbye and leaves | Il salue et s'en va | Er verabschiedet sich und geht | Se despide y se va | Се поздравува и си заминува
Un inchino, un saluto con la mano. La festa continua con voi. | A bow, a wave of the hand. The party carries on with you. | Une révérence, un signe de la main. La fête continue avec vous. | Eine Verbeugung, ein Winken. Die Feier geht mit euch weiter. | Una reverencia, un saludo con la mano. La fiesta sigue con vosotros. | Поклон, мавтање со рака. Забавата продолжува со вас.
Quanto è forte il rumore | How loud does it get | Quel est le niveau de bruit | Wie laut wird es | Cuánto ruido hay | Колку е гласно
<strong>La trombetta</strong>Fa un “pe-pe” corto e squillante, ogni tanto, per far ridere. Non viene suonata vicino alle orecchie. | <strong>The horn</strong>Now and then it goes “parp-parp”, short and bright, to make everyone laugh. It's never played close to anyone's ears. | <strong>La trompette</strong>De temps en temps, elle fait un « pouet-pouet » court et aigu, pour faire rire. Elle n'est jamais jouée près des oreilles. | <strong>Die Hupe</strong>Ab und zu macht sie ein kurzes, helles „Tröt-tröt“, damit alle lachen. Sie wird nie nah an den Ohren gespielt. | <strong>La bocina</strong>De vez en cuando hace un «pe-pe» corto y agudo, para hacer reír. Nunca se toca cerca de las orejas. | <strong>Трубата</strong>Понекогаш прави кратко, звонко „пи-пи“, за смеа. Никогаш не се свири близу до ушите.
La trombetta | The horn | La trompette | Die Hupe | La bocina | Трубата
Fa un “pe-pe” corto e squillante, ogni tanto, per far ridere. Non viene suonata vicino alle orecchie. | Now and then it goes “parp-parp”, short and bright, to make everyone laugh. It's never played close to anyone's ears. | De temps en temps, elle fait un « pouet-pouet » court et aigu, pour faire rire. Elle n'est jamais jouée près des oreilles. | Ab und zu macht sie ein kurzes, helles „Tröt-tröt“, damit alle lachen. Sie wird nie nah an den Ohren gespielt. | De vez en cuando hace un «pe-pe» corto y agudo, para hacer reír. Nunca se toca cerca de las orejas. | Понекогаш прави кратко, звонко „пи-пи“, за смеа. Никогаш не се свири близу до ушите.
Rumore: medio | Noise: medium | Bruit : moyen | Lautstärke: mittel | Ruido: medio | Бучава: средна
<strong>Applausi e risate</strong>Sono la parte più rumorosa: tutti insieme possono essere forti, soprattutto al chiuso. | <strong>Applause and laughter</strong>They're the noisiest part: all together they can be loud, especially indoors. | <strong>Applaudissements et rires</strong>C'est la partie la plus bruyante : tous ensemble, ils peuvent être forts, surtout en intérieur. | <strong>Applaus und Lachen</strong>Das ist der lauteste Teil: Alle zusammen können ganz schön laut sein, vor allem drinnen. | <strong>Aplausos y risas</strong>Son la parte más ruidosa: todos juntos pueden sonar fuerte, sobre todo en interior. | <strong>Аплауз и смеа</strong>Тоа е најгласниот дел: сите заедно можат да бидат гласни, особено внатре.
Applausi e risate | Applause and laughter | Applaudissements et rires | Applaus und Lachen | Aplausos y risas | Аплауз и смеа
Sono la parte più rumorosa: tutti insieme possono essere forti, soprattutto al chiuso. | They're the noisiest part: all together they can be loud, especially indoors. | C'est la partie la plus bruyante : tous ensemble, ils peuvent être forts, surtout en intérieur. | Das ist der lauteste Teil: Alle zusammen können ganz schön laut sein, vor allem drinnen. | Son la parte más ruidosa: todos juntos pueden sonar fuerte, sobre todo en interior. | Тоа е најгласниот дел: сите заедно можат да бидат гласни, особено внатре.
Rumore: forte | Noise: loud | Bruit : fort | Lautstärke: laut | Ruido: fuerte | Бучава: силна
<strong>Musica</strong>Di sottofondo, a volume da festa in casa. | <strong>Music</strong>In the background, at home-party volume. | <strong>Musique</strong>En fond, au volume d'une fête à la maison. | <strong>Musik</strong>Im Hintergrund, so laut wie bei einer Feier zu Hause. | <strong>Música</strong>De fondo, a volumen de fiesta en casa. | <strong>Музика</strong>Во позадина, со јачина како за забава дома.
Di sottofondo, a volume da festa in casa. | In the background, at home-party volume. | En fond, au volume d'une fête à la maison. | Im Hintergrund, so laut wie bei einer Feier zu Hause. | De fondo, a volumen de fiesta en casa. | Во позадина, со јачина како за забава дома.
Rumore: basso | Noise: low | Bruit : faible | Lautstärke: leise | Ruido: bajo | Бучава: слаба
Se il bambino è sensibile ai suoni, le cuffie antirumore vanno benissimo: Wondy parla con le mani, quindi si capisce tutto lo stesso. | If your child is sensitive to sound, ear defenders are perfect: Wondy talks with his hands, so they'll understand everything anyway. | Si l'enfant est sensible aux bruits, un casque antibruit convient très bien : Wondy parle avec les mains, on comprend donc tout quand même. | Wenn euer Kind geräuschempfindlich ist, sind Kapselgehörschützer völlig in Ordnung: Wondy spricht mit den Händen, man versteht also trotzdem alles. | Si el niño es sensible a los ruidos, los cascos antirruido van genial: Wondy habla con las manos, así que se entiende todo igual. | Ако детето е чувствително на звуци, слушалките против бучава се одлични: Wondy зборува со рацете, па сè се разбира исто.
Si può guardare da lontano | It's fine to watch from afar | On peut regarder de loin | Zuschauen aus der Ferne ist völlig okay | Se puede mirar desde lejos | Може да се гледа оддалеку
In braccio, dietro il divano, dalla porta della cucina: ogni posto va bene. Non serve salutare, non serve avvicinarsi, non serve ridere. Guardare è già partecipare. | In someone's arms, behind the sofa, from the kitchen door: every spot is fine. No need to say hello, no need to come closer, no need to laugh. Watching is already taking part. | Dans les bras, derrière le canapé, depuis la porte de la cuisine : chaque place convient. Pas besoin de dire bonjour, pas besoin de s'approcher, pas besoin de rire. Regarder, c'est déjà participer. | Auf dem Arm, hinter dem Sofa, von der Küchentür aus: Jeder Platz ist gut. Man muss nicht Hallo sagen, nicht näherkommen, nicht lachen. Zuschauen ist schon Mitmachen. | En brazos, detrás del sofá, desde la puerta de la cocina: cualquier sitio vale. No hace falta saludar, ni acercarse, ni reír. Mirar ya es participar. | Во прегратка, зад каучот, од вратата на кујната: секое место е добро. Не мора да се поздрави, не мора да се приближи, не мора да се смее. Гледањето е веќе учество.
Il segnale “pausa”: le mani a T | The “pause” signal: hands in a T | Le signal « pause » : les mains en T | Das „Pause“-Zeichen: Hände als T | La señal de «pausa»: las manos en T | Знакот „пауза“: рацете во Т
Insegnatelo al bambino prima della festa: una mano piatta sopra, l'altra in piedi sotto, come una T. Quando la vede, <strong>Wondy si ferma</strong> e aspetta. Funziona sempre, per tutti. | Teach it to your child before the party: one hand flat on top, the other upright underneath, like a T. When he sees it, <strong>Wondy stops</strong> and waits. It always works, for everyone. | Apprenez-le à l'enfant avant la fête : une main à plat dessus, l'autre debout dessous, comme un T. Quand il le voit, <strong>Wondy s'arrête</strong> et attend. Ça marche toujours, pour tout le monde. | Bringt es eurem Kind vor der Feier bei: eine Hand flach oben, die andere senkrecht darunter, wie ein T. Sobald er es sieht, <strong>hält Wondy an</strong> und wartet. Das klappt immer, bei allen. | Enseñádselo al niño antes de la fiesta: una mano plana arriba y la otra de pie debajo, como una T. Cuando la ve, <strong>Wondy se para</strong> y espera. Funciona siempre, con todos. | Научете го детето пред забавата: едната рака рамно горе, другата исправена долу, како Т. Кога ќе го види, <strong>Wondy застанува</strong> и чека. Секогаш функционира, за сите.
Insegnatelo al bambino prima della festa: una mano piatta sopra, l'altra in piedi sotto, come una T. Quando la vede, | Teach it to your child before the party: one hand flat on top, the other upright underneath, like a T. When he sees it, | Apprenez-le à l'enfant avant la fête : une main à plat dessus, l'autre debout dessous, comme un T. Quand il le voit, | Bringt es eurem Kind vor der Feier bei: eine Hand flach oben, die andere senkrecht darunter, wie ein T. Sobald er es sieht, | Enseñádselo al niño antes de la fiesta: una mano plana arriba y la otra de pie debajo, como una T. Cuando la ve, | Научете го детето пред забавата: едната рака рамно горе, другата исправена долу, како Т. Кога ќе го види,
Wondy si ferma | Wondy stops | Wondy s'arrête | hält Wondy an | Wondy se para | Wondy застанува
e aspetta. Funziona sempre, per tutti. | and waits. It always works, for everyone. | et attend. Ça marche toujours, pour tout le monde. | und wartet. Das klappt immer, bei allen. | y espera. Funciona siempre, con todos. | и чека. Секогаш функционира, за сите.
<strong>Il vostro bambino ha esigenze particolari?</strong> Paura dei clown, suoni, spazi, autismo, disabilità, un momento delicato in famiglia: scrivetelo a Wondy prima della festa. Lo spettacolo si adatta, con discrezione. | <strong>Does your child have particular needs?</strong> Fear of clowns, sounds, spaces, autism, disability, a delicate time in the family: let Wondy know before the party. The show adapts, discreetly. | <strong>Votre enfant a des besoins particuliers ?</strong> Peur des clowns, bruits, espaces, autisme, handicap, un moment délicat en famille : écrivez-le à Wondy avant la fête. Le spectacle s'adapte, avec discrétion. | <strong>Hat euer Kind besondere Bedürfnisse?</strong> Angst vor Clowns, Geräusche, Räume, Autismus, Behinderung, eine schwierige Zeit in der Familie: Schreibt es Wondy vor der Feier. Die Show passt sich an, ganz diskret. | <strong>¿Vuestro hijo tiene necesidades especiales?</strong> Miedo a los payasos, ruidos, espacios, autismo, discapacidad, un momento delicado en la familia: escribídselo a Wondy antes de la fiesta. El espectáculo se adapta, con discreción. | <strong>Дали вашето дете има посебни потреби?</strong> Страв од кловнови, звуци, простори, аутизам, попреченост, деликатен момент во семејството: напишете му на Wondy пред забавата. Шоуто се прилагодува, дискретно.
Il vostro bambino ha esigenze particolari? | Does your child have particular needs? | Votre enfant a des besoins particuliers ? | Hat euer Kind besondere Bedürfnisse? | ¿Vuestro hijo tiene necesidades especiales? | Дали вашето дете има посебни потреби?
Paura dei clown, suoni, spazi, autismo, disabilità, un momento delicato in famiglia: scrivetelo a Wondy prima della festa. Lo spettacolo si adatta, con discrezione. | Fear of clowns, sounds, spaces, autism, disability, a delicate time in the family: let Wondy know before the party. The show adapts, discreetly. | Peur des clowns, bruits, espaces, autisme, handicap, un moment délicat en famille : écrivez-le à Wondy avant la fête. Le spectacle s'adapte, avec discrétion. | Angst vor Clowns, Geräusche, Räume, Autismus, Behinderung, eine schwierige Zeit in der Familie: Schreibt es Wondy vor der Feier. Die Show passt sich an, ganz diskret. | Miedo a los payasos, ruidos, espacios, autismo, discapacidad, un momento delicado en la familia: escribídselo a Wondy antes de la fiesta. El espectáculo se adapta, con discreción. | Страв од кловнови, звуци, простори, аутизам, попреченост, деликатен момент во семејството: напишете му на Wondy пред забавата. Шоуто се прилагодува, дискретно.
Scrivi su WhatsApp | Write on WhatsApp | Écrire sur WhatsApp | Auf WhatsApp schreiben | Escribir por WhatsApp | Пиши на WhatsApp
Scrivi un'email | Send an email | Envoyer un e-mail | E-Mail schreiben | Enviar un correo | Испрати е-пошта
Una piccola storia da sfogliare insieme prima della festa: dietro il clown c'è una persona vera. | A little story to leaf through together before the party: behind the clown there's a real person. | Une petite histoire à feuilleter ensemble avant la fête : derrière le clown, il y a une vraie personne. | Eine kleine Geschichte zum gemeinsamen Durchblättern vor der Feier: Hinter dem Clown steckt ein echter Mensch. | Una pequeña historia para hojear juntos antes de la fiesta: detrás del clown hay una persona de verdad. | Мала приказна за прелистување заедно пред забавата: зад кловнот има вистински човек.
Chi è Wondy, in 5 tavole | Who is Wondy, in 5 pictures | Qui est Wondy, en 5 images | Wer ist Wondy – in 5 Bildern | Quién es Wondy, en 5 láminas | Кој е Wondy, во 5 слики
Tavole: scorri o usa le frecce | Pictures: swipe or use the arrows | Images : faites défiler ou utilisez les flèches | Bilder: wischen oder die Pfeile benutzen | Láminas: desliza o usa las flechas | Слики: лизгај или користи ги стрелките
Thomas, ancora senza naso rosso, si trucca gli occhi con una matita | Thomas, still without his red nose, does his eye make-up with a pencil | Thomas, encore sans nez rouge, se maquille les yeux au crayon | Thomas, noch ohne rote Nase, schminkt sich mit einem Stift die Augen | Thomas, todavía sin nariz roja, se maquilla los ojos con un lápiz | Thomas, сè уште без црвен нос, си ги шминка очите со молив
Ciao, io sono <em>Thomas</em>. | Hello, I'm <em>Thomas</em>. | Bonjour, moi c'est <em>Thomas</em>. | Hallo, ich bin <em>Thomas</em>. | Hola, soy <em>Thomas</em>. | Здраво, јас сум <em>Thomas</em>.
Ciao, io sono | Hello, I'm | Bonjour, moi c'est | Hallo, ich bin | Hola, soy | Здраво, јас сум
Prima di diventare Wondy, mi trucco. | Before I become Wondy, I put on my make-up. | Avant de devenir Wondy, je me maquille. | Bevor ich zu Wondy werde, schminke ich mich. | Antes de convertirme en Wondy, me maquillo. | Пред да станам Wondy, се шминкам.
Primo piano di Thomas truccato, con il naso rosso e gli occhi spalancati | Close-up of Thomas in make-up, with his red nose and wide-open eyes | Gros plan de Thomas maquillé, avec le nez rouge et les yeux grands ouverts | Nahaufnahme von Thomas, geschminkt, mit roter Nase und weit aufgerissenen Augen | Primer plano de Thomas maquillado, con la nariz roja y los ojos muy abiertos | Крупен план на нашминканиот Thomas, со црвен нос и широко отворени очи
Metto il <em>naso rosso</em>. | I put on my <em>red nose</em>. | Je mets mon <em>nez rouge</em>. | Ich setze die <em>rote Nase</em> auf. | Me pongo la <em>nariz roja</em>. | Си го ставам <em>црвениот нос</em>.
Metto il | I put on my | Je mets mon | Ich setze die | Me pongo la | Си го ставам
È piccolo, morbido e fa ridere. | It's small, soft and funny. | Il est petit, tout doux et il fait rire. | Sie ist klein, weich und macht alle fröhlich. | Es pequeña, blandita y hace reír. | Мал е, мек и смешен.
Wondy ride con la bocca spalancata | Wondy laughing with his mouth wide open | Wondy rit, la bouche grande ouverte | Wondy lacht mit weit offenem Mund | Wondy ríe con la boca muy abierta | Wondy се смее со широко отворена уста
Divento <em>Wondy</em> e non parlo. | I become <em>Wondy</em> and I don't talk. | Je deviens <em>Wondy</em> et je ne parle pas. | Ich werde zu <em>Wondy</em> und spreche nicht. | Me convierto en <em>Wondy</em> y no hablo. | Станувам <em>Wondy</em> и не зборувам.
Divento | I become | Je deviens | Ich werde zu | Me convierto en | Станувам
e non parlo. | and I don't talk. | et je ne parle pas. | und spreche nicht. | y no hablo. | и не зборувам.
Parlo con le mani, con gli occhi e con il sorriso. | I talk with my hands, my eyes and my smile. | Je parle avec les mains, les yeux et le sourire. | Ich spreche mit den Händen, den Augen und meinem Lächeln. | Hablo con las manos, con los ojos y con la sonrisa. | Зборувам со рацете, со очите и со насмевката.
Gioco con i miei <em>amici</em>. | I play with my <em>friends</em>. | Je joue avec mes <em>amis</em>. | Ich spiele mit meinen <em>Freunden</em>. | Juego con mis <em>amigos</em>. | Си играм со моите <em>пријатели</em>.
Gioco con i miei | I play with my | Je joue avec mes | Ich spiele mit meinen | Juego con mis | Си играм со моите
amici | friends | amis | Freunden | amigos | пријатели
L'orsetto, il cestino e il girasole. | The teddy bear, the basket and the sunflower. | L'ourson, le panier et le tournesol. | Der Teddy, der Korb und die Sonnenblume. | El osito, la cesta y el girasol. | Мечето, кошничката и сончогледот.
Wondy sul palco saluta il pubblico con le braccia aperte | Wondy on stage greeting the audience with open arms | Wondy sur scène salue le public, les bras ouverts | Wondy auf der Bühne begrüßt das Publikum mit offenen Armen | Wondy en el escenario saluda al público con los brazos abiertos | Wondy на сцената ја поздравува публиката со раширени раце
E poi <em>saluto</em>… | And then I <em>wave goodbye</em>… | Et puis je <em>dis au revoir</em>… | Und dann <em>verabschiede</em> ich mich… | Y luego me <em>despido</em>… | А потоа <em>се поздравувам</em>…
E poi | And then I | Et puis je | Und dann | Y luego me | А потоа
saluto | wave goodbye | dis au revoir | verabschiede ich mich | despido | се поздравувам
…tolgo il naso e torno Thomas. Ciao! | …I take off my nose and I'm Thomas again. Bye! | …j'enlève mon nez et je redeviens Thomas. Salut ! | …ich nehme die Nase ab und bin wieder Thomas. Tschüss! | …me quito la nariz y vuelvo a ser Thomas. ¡Adiós! | …го вадам носот и пак сум Thomas. Чао!
Tavola precedente | Previous picture | Image précédente | Vorheriges Bild | Lámina anterior | Претходна слика
Tavola successiva | Next picture | Image suivante | Nächstes Bild | Lámina siguiente | Следна слика
Il tuo nome nello spettacolo | Your name in the show | Ton prénom dans le spectacle | Dein Name in der Show | Tu nombre en el espectáculo | Твоето име во шоуто
Accendi! | Light it up! | Allume ! | Einschalten! | ¡Enciéndelo! | Запали!
Il nome resta solo qui, sul tuo telefono: non viene inviato a nessuno e si cancella quando chiudi la pagina. | The name stays right here on your phone: it isn't sent to anyone and is deleted when you close the page. | Le prénom reste ici, sur ton téléphone : il n'est envoyé à personne et s'efface quand tu fermes la page. | Der Name bleibt nur hier auf deinem Handy: Er wird an niemanden geschickt und gelöscht, wenn du die Seite schließt. | El nombre se queda solo aquí, en tu teléfono: no se envía a nadie y se borra al cerrar la página. | Името останува само тука, на твојот телефон: не се испраќа никому и се брише кога ќе ја затвориш страницата.
Stasera in scena | Tonight on stage | Ce soir en scène | Heute Abend auf der Bühne | Esta noche en escena | Вечерва на сцена
Scrivi prima il tuo nome, poi tocca Accendi. | Write your name first, then tap Light it up. | Écris d'abord ton prénom, puis touche Allume. | Schreib zuerst deinen Namen und tipp dann auf Einschalten. | Escribe primero tu nombre y luego toca Enciéndelo. | Прво напиши го твоето име, па допри Запали.
Da stampare e colorare | To print and colour in | À imprimer et à colorier | Zum Ausdrucken und Ausmalen | Para imprimir y colorear | За печатење и боење
Tutto viene preparato qui sul telefono o sul computer: niente viene inviato. | Everything is prepared right here on your phone or computer: nothing is sent anywhere. | Tout est préparé ici, sur le téléphone ou l'ordinateur : rien n'est envoyé. | Alles wird hier auf dem Handy oder Computer erstellt: Nichts wird verschickt. | Todo se prepara aquí, en el teléfono o el ordenador: no se envía nada. | Сè се подготвува тука, на телефонот или компјутерот: ништо не се испраќа.
Diploma di Aiutante del mimo | Mime's Helper Diploma | Diplôme d'Assistant du mime | Diplom als Pantomimen-Helfer | Diploma de Ayudante del mimo | Диплома за помошник на мимот
Un foglio A4 in bianco e nero, tutto da colorare. | A black-and-white A4 sheet, ready to colour in. | Une feuille A4 en noir et blanc, à colorier. | Ein A4-Blatt in Schwarz-Weiß, zum Ausmalen. | Una hoja A4 en blanco y negro, para colorear. | Лист А4 црно-бело, цел за боење.
Nome del bambino | Child's name | Prénom de l'enfant | Name des Kindes | Nombre del niño | Име на детето
Data | Date | Date | Datum | Fecha | Датум
Anteprima del diploma | Diploma preview | Aperçu du diplôme | Vorschau des Diploms | Vista previa del diploma | Преглед на дипломата
Stampa il diploma | Print the diploma | Imprimer le diplôme | Diplom drucken | Imprimir el diploma | Испечати ја дипломата
Calendario dell'attesa | Countdown calendar | Calendrier de l'attente | Countdown-Kalender | Calendario de la espera | Календар на чекањето
“Mancano ___ nasi alla festa!”: ogni sera si colora un naso, fino al grande giorno. | “___ noses to go until the party!”: colour in one nose each evening, until the big day. | « Plus que ___ nez avant la fête ! » : chaque soir, on colorie un nez, jusqu'au grand jour. | „Noch ___ Nasen bis zur Feier!“: Jeden Abend wird eine Nase ausgemalt, bis zum großen Tag. | «¡Faltan ___ narices para la fiesta!»: cada noche se colorea una nariz, hasta el gran día. | „Уште ___ носеви до забавата!“: секоја вечер се бои по еден нос, до големиот ден.
Giorno della festa | Party day | Jour de la fête | Tag der Feier | Día de la fiesta | Ден на забавата
Anteprima del calendario | Calendar preview | Aperçu du calendrier | Vorschau des Kalenders | Vista previa del calendario | Преглед на календарот
Stampa il calendario | Print the calendar | Imprimer le calendrier | Kalender drucken | Imprimir el calendario | Испечати го календарот
Biglietto ricordo | Keepsake ticket | Billet souvenir | Erinnerungskarte | Entrada de recuerdo | Билет за спомен
Il biglietto del circo con il nome del festeggiato: da tenere, stampare o mandare ai nonni. | A circus ticket with the guest of honour's name: to keep, print or send to Grandma and Grandpa. | Le billet de cirque avec le prénom de l'enfant fêté : à garder, imprimer ou envoyer aux grands-parents. | Die Zirkuskarte mit dem Namen des Geburtstagskinds: zum Aufheben, Ausdrucken oder für Oma und Opa. | La entrada de circo con el nombre del homenajeado: para guardar, imprimir o enviar a los abuelos. | Циркуски билет со името на славеникот: за чување, печатење или за баба и дедо.
Nome del festeggiato | Name of the guest of honour | Prénom de l'enfant fêté | Name des Geburtstagskinds | Nombre del homenajeado | Име на славеникот
Scarica il biglietto | Download the ticket | Télécharger le billet | Karte herunterladen | Descargar la entrada | Преземи го билетот
Il libro da colorare “Wondy Paint”<small>Su Amazon · si apre in una nuova scheda</small> | The colouring book “Wondy Paint”<small>On Amazon · opens in a new tab</small> | Le livre de coloriage « Wondy Paint »<small>Sur Amazon · s'ouvre dans un nouvel onglet</small> | Das Malbuch „Wondy Paint“<small>Bei Amazon · öffnet sich in einem neuen Tab</small> | El libro para colorear «Wondy Paint»<small>En Amazon · se abre en una pestaña nueva</small> | Книгата за боење „Wondy Paint“<small>На Amazon · се отвора во нова картичка</small>
Il libro da colorare “Wondy Paint” | The colouring book “Wondy Paint” | Le livre de coloriage « Wondy Paint » | Das Malbuch „Wondy Paint“ | El libro para colorear «Wondy Paint» | Книгата за боење „Wondy Paint“
Su Amazon · si apre in una nuova scheda | On Amazon · opens in a new tab | Sur Amazon · s'ouvre dans un nouvel onglet | Bei Amazon · öffnet sich in einem neuen Tab | En Amazon · se abre en una pestaña nueva | На Amazon · се отвора во нова картичка
Scegli il giorno della festa: preparo i nasi da colorare. | Choose the party day: I'll get the noses ready to colour in. | Choisis le jour de la fête : je prépare les nez à colorier. | Wähl den Tag der Feier: Ich bereite die Nasen zum Ausmalen vor. | Elige el día de la fiesta: preparo las narices para colorear. | Избери го денот на забавата: ќе ги подготвам носевите за боење.
Questa data è già passata: scegline una nei prossimi giorni. | This date has already passed: pick one in the coming days. | Cette date est déjà passée : choisis-en une dans les prochains jours. | Dieses Datum ist schon vorbei: Wähl eins in den nächsten Tagen. | Esta fecha ya ha pasado: elige una de los próximos días. | Овој датум веќе помина: избери еден во следните денови.
La festa è oggi! Niente nasi da aspettare: buon divertimento! | The party's today! No noses to wait for: have fun! | La fête, c'est aujourd'hui ! Pas de nez à attendre : amuse-toi bien ! | Die Feier ist heute! Keine Nasen zum Warten: Viel Spaß! | ¡La fiesta es hoy! No hay narices que esperar: ¡a disfrutar! | Забавата е денес! Нема носеви за чекање: убаво забавувај се!
Biglietto pronto: lo trovi tra i download. Sul telefono puoi anche tenere premuta l'immagine per salvarla. | Ticket ready: you'll find it in your downloads. On a phone you can also press and hold the image to save it. | Billet prêt : tu le trouveras dans les téléchargements. Sur le téléphone, tu peux aussi appuyer longuement sur l'image pour l'enregistrer. | Karte fertig: Du findest sie bei den Downloads. Auf dem Handy kannst du das Bild auch lange gedrückt halten, um es zu speichern. | Entrada lista: la encontrarás en las descargas. En el teléfono también puedes mantener pulsada la imagen para guardarla. | Билетот е подготвен: ќе го најдеш во преземањата. На телефон можеш и да ја задржиш сликата притисната за да ја зачуваш.
il festeggiato | the guest of honour | l'enfant fêté | das Geburtstagskind | el homenajeado | славеникот
DIPLOMA | = | DIPLÔME | DIPLOM | = | ДИПЛОМА
di Aiutante del Mimo | for the Mime's Helper | d'Assistant du Mime | als Helfer des Pantomimen | de Ayudante del Mimo | за помошник на мимот
Si certifica che | This certifies that | Nous certifions que | Hiermit wird bestätigt, dass | Se certifica que | Се потврдува дека
ha aiutato Wondy durante lo spettacolo: | helped Wondy during the show: | a aidé Wondy pendant le spectacle : | Wondy bei der Show geholfen hat: | ha ayudado a Wondy durante el espectáculo: | му помогна на Wondy за време на шоуто:
ha riso, applaudito e parlato con le mani, | laughed, clapped and talked with their hands, | a ri, applaudi et parlé avec les mains, | gelacht, geklatscht und mit den Händen gesprochen hat, | ha reído, aplaudido y hablado con las manos, | се смееше, аплаудираше и зборуваше со рацете,
senza dire nemmeno una parola! | without saying a single word! | sans dire un seul mot ! | ohne ein einziges Wort zu sagen! | ¡sin decir ni una sola palabra! | без да каже ниту еден збор!
DATA | DATE | DATE | DATUM | FECHA | ДАТУМ
IL MIMO | THE MIME | LE MIME | DER PANTOMIME | EL MIMO | МИМОТ
Mancano | Only | Plus que | Noch | Faltan | Уште
naso | nose | nez | Nase | nariz | нос
alla festa! | to go until the party! | avant la fête ! | bis zur Feier! | para la fiesta! | до забавата!
Ogni sera colora un naso. Quando li hai colorati tutti, è il giorno della festa! | Colour in one nose every evening. When they're all coloured in, it's party day! | Chaque soir, colorie un nez. Quand ils sont tous coloriés, c'est le jour de la fête ! | Mal jeden Abend eine Nase aus. Wenn alle ausgemalt sind, ist der Tag der Feier da! | Cada noche colorea una nariz. Cuando las hayas coloreado todas, ¡es el día de la fiesta! | Секоја вечер обој по еден нос. Кога ќе ги обоиш сите, дојде денот на забавата!
IL CIRCO DI WONDY | WONDY'S CIRCUS | LE CIRQUE DE WONDY | WONDYS ZIRKUS | EL CIRCO DE WONDY | ЦИРКУСОТ НА WONDY
Biglietto ricordo · ingresso d'onore per | Keepsake ticket · guest of honour entry for | Billet souvenir · entrée d'honneur pour | Erinnerungskarte · Ehreneintritt für | Entrada de recuerdo · acceso de honor para | Билет за спомен · почесен влез за
IL FESTEGGIATO | THE GUEST OF HONOUR | L'ENFANT FÊTÉ | DAS GEBURTSTAGSKIND | EL HOMENAJEADO | СЛАВЕНИКОТ
Festa di compleanno | Birthday party | Fête d'anniversaire | Geburtstagsfeier | Fiesta de cumpleaños | Роденденска забава
CLOWN ✦ PHYSICAL ACTOR ✦ FANTASISTA | CLOWN ✦ PHYSICAL ACTOR ✦ ENTERTAINER | CLOWN ✦ PHYSICAL ACTOR ✦ FANTAISISTE | CLOWN ✦ PHYSICAL ACTOR ✦ VARIETÉKÜNSTLER | CLOWN ✦ PHYSICAL ACTOR ✦ ARTISTA DE VARIEDADES | КЛОВН ✦ PHYSICAL ACTOR ✦ ВАРИЕТЕТСКИ УМЕТНИК
AMMETTE 1 | ADMIT ONE | ENTRÉE : 1 | EINLASS: 1 | VÁLIDA PARA 1 | ВЛЕЗ ЗА 1
posto in prima fila | front-row seat | place au premier rang | Platz in der ersten Reihe | asiento en primera fila | место во првиот ред
Crea il biglietto ricordo ✦ | Create the keepsake ticket ✦ | Créer le billet souvenir ✦ | Erinnerungskarte erstellen ✦ | Crear la entrada de recuerdo ✦ | Направи билет за спомен ✦
Piccoli giochi, un respiro e un gioco di mimo, da fare insieme a mamma e papà. | Little games, a breathing exercise and a mime game, to play together with Mum and Dad. | Des petits jeux, une respiration et un jeu de mime, à faire avec papa et maman. | Kleine Spiele, eine Atemübung und ein Pantomimespiel – zum Mitmachen mit Mama und Papa. | Pequeños juegos, una respiración y un juego de mímica, para hacer con mamá y papá. | Мали игри, едно дишење и една игра со мимика, за заедно со мама и тато.
Stelline raccolte: | Stars collected: | Étoiles gagnées : | Gesammelte Sternchen: | Estrellitas conseguidas: | Собрани ѕвездички:
Tocca i nasi rossi! | Tap the red noses! | Touche les nez rouges ! | Tipp die roten Nasen an! | ¡Toca las narices rojas! | Допри ги црвените носеви!
Come vuoi giocare? | How do you want to play? | Comment veux-tu jouer ? | Wie willst du spielen? | ¿Cómo quieres jugar? | Како сакаш да играш?
Piccoli | Little ones | Petits | Für Kleine | Peques | За малите
Sfida 30 s | 30-second challenge | Défi 30 s | 30-Sekunden-Challenge | Reto 30 s | Предизвик 30 с
Tocca le palline e lanciale in alto! | Tap the balls and throw them up high! | Touche les balles et lance-les en l'air ! | Tipp die Bälle an und wirf sie hoch! | ¡Toca las pelotas y lánzalas hacia arriba! | Допри ги топчињата и фрли ги високо!
Respiro col palloncino | Balloon breathing | Respire avec le ballon | Atmen mit dem Luftballon | Respira con el globo | Дишење со балонот
Gonfia e sgonfia il palloncino con il respiro. | Blow the balloon up and let it go down, just by breathing. | Gonfle et dégonfle le ballon avec ta respiration. | Blas den Luftballon mit deinem Atem auf und lass ihn wieder klein werden. | Infla y desinfla el globo con tu respiración. | Надувај го и издувај го балонот со дишењето.
Inizia Respiro col palloncino | Start Balloon breathing | Commencer Respire avec le ballon | Atmen mit dem Luftballon starten | Empezar Respira con el globo | Почни „Дишење со балонот“
Specchio mimo | Mime mirror | Miroir mime | Pantomime-Spiegel | Espejo mímico | Мимичко огледало
Uno fa il gesto, l'altro indovina. Poi scambiatevi! | One does the gesture, the other guesses. Then swap! | L'un fait le geste, l'autre devine. Puis on échange ! | Einer macht die Geste, der andere rät. Dann tauscht ihr! | Uno hace el gesto, el otro adivina. ¡Luego os cambiáis! | Едниот прави гест, другиот погодува. Потоа заменете се!
Gioca a Specchio mimo, per grandi e piccoli | Play Mime mirror, for grown-ups and kids | Jouer à Miroir mime, pour petits et grands | Pantomime-Spiegel spielen, für Groß und Klein | Jugar a Espejo mímico, para mayores y peques | Играј „Мимичко огледало“, за големи и мали
Ho finito | I'm done | J'ai fini | Fertig! | ¡He terminado! | Готов сум
Ho finito di giocare | I've finished playing | J'ai fini de jouer | Ich bin fertig mit Spielen | He terminado de jugar | Завршив со играње
Uaaah… | Yaaawn… | Ouaaah… | Gäääähn… | Uaaah… | Уааа…
È ora di una pausa: andiamo a fare un bel respiro? | Time for a break: shall we take a nice deep breath? | C'est l'heure d'une pause : on va respirer un grand coup ? | Zeit für eine Pause: Wollen wir mal tief durchatmen? | Es hora de una pausa: ¿vamos a respirar hondo? | Време е за пауза: ќе вдишеме длабоко?
Continua a giocare | Keep playing | Continuer à jouer | Weiterspielen | Seguir jugando | Продолжи со играње
Wondy sbadiglia. È ora di una pausa: andiamo a fare un bel respiro? | Wondy yawns. Time for a break: shall we take a nice deep breath? | Wondy bâille. C'est l'heure d'une pause : on va respirer un grand coup ? | Wondy gähnt. Zeit für eine Pause: Wollen wir mal tief durchatmen? | Wondy bosteza. Es hora de una pausa: ¿vamos a respirar hondo? | Wondy се проѕева. Време е за пауза: ќе вдишеме длабоко?
Mettiti comodo | Get comfy | Installe-toi bien | Mach es dir bequem | Ponte cómodo | Намести се удобно
Guarda il palloncino | Watch the balloon | Regarde le ballon | Schau auf den Luftballon | Mira el globo | Гледај го балонот
Inspira… | Breathe in… | Inspire… | Einatmen… | Inspira… | Вдиши…
Espira… | Breathe out… | Expire… | Ausatmen… | Espira… | Издиши…
dal naso, piano piano | through your nose, nice and slow | par le nez, tout doucement | durch die Nase, ganz langsam | por la nariz, despacito | низ носот, полека-полека
dalla bocca, come per soffiare | through your mouth, as if you're blowing | par la bouche, comme pour souffler | durch den Mund, wie beim Pusten | por la boca, como si soplaras | низ устата, како да дуваш
Espira. | Breathe out. | Expire. | Ausatmen. | Espira. | Издиши.
Ora sei calmo come Wondy | Now you're as calm as Wondy | Maintenant tu es calme comme Wondy | Jetzt bist du so ruhig wie Wondy | Ahora estás tranquilo como Wondy | Сега си смирен како Wondy
Bravo! Ora sei calmo come Wondy | Well done! Now you're as calm as Wondy | Bravo ! Maintenant tu es calme comme Wondy | Super! Jetzt bist du so ruhig wie Wondy | ¡Muy bien! Ahora estás tranquilo como Wondy | Браво! Сега си смирен како Wondy
Mettiti comodo. Guarda il palloncino. | Get comfy. Watch the balloon. | Installe-toi bien. Regarde le ballon. | Mach es dir bequem. Schau auf den Luftballon. | Ponte cómodo. Mira el globo. | Намести се удобно. Гледај го балонот.
Tocca per vedere il gesto | Tap to see the gesture | Touche pour voir le geste | Tippen, um die Geste zu sehen | Toca para ver el gesto | Допри за да го видиш гестот
Prossima carta | Next card | Carte suivante | Nächste Karte | Siguiente carta | Следна карта
Carta coperta: tocca per vedere il gesto | Face-down card: tap to see the gesture | Carte cachée : touche pour voir le geste | Verdeckte Karte: Tippen, um die Geste zu sehen | Carta boca abajo: toca para ver el gesto | Затворена карта: допри за да го видиш гестот
Specchio mimo. Uno fa il gesto, l'altro indovina. Poi scambiatevi! | Mime mirror. One does the gesture, the other guesses. Then swap! | Miroir mime. L'un fait le geste, l'autre devine. Puis on échange ! | Pantomime-Spiegel. Einer macht die Geste, der andere rät. Dann tauscht ihr! | Espejo mímico. Uno hace el gesto, el otro adivina. ¡Luego os cambiáis! | Мимичко огледало. Едниот прави гест, другиот погодува. Потоа заменете се!
Tieni in equilibrio un fiore sul naso | Balance a flower on your nose | Tiens une fleur en équilibre sur ton nez | Balancier eine Blume auf der Nase | Mantén una flor en equilibrio sobre la nariz | Држи цвет во рамнотежа на носот
Lancia tre palline invisibili | Juggle three invisible balls | Lance trois balles invisibles | Wirf drei unsichtbare Bälle | Lanza tres pelotas invisibles | Фрли три невидливи топчиња
Abbraccia l'orsetto | Hug the teddy bear | Fais un câlin à l'ourson | Umarme den Teddy | Abraza al osito | Гушни го мечето
Apri un sipario pesante | Open a heavy curtain | Ouvre un rideau très lourd | Öffne einen schweren Vorhang | Abre un telón muy pesado | Отвори тешка завеса
Spingi un muro invisibile | Push an invisible wall | Pousse un mur invisible | Drück gegen eine unsichtbare Wand | Empuja una pared invisible | Турни невидлив ѕид
Sbadiglia come un leone | Yawn like a lion | Bâille comme un lion | Gähne wie ein Löwe | Bosteza como un león | Проѕевај се како лав
Cammina in punta di piedi | Walk on tiptoe | Marche sur la pointe des pieds | Geh auf Zehenspitzen | Camina de puntillas | Оди на прсти
Ridi senza fare rumore | Laugh without making a sound | Ris sans faire de bruit | Lach, ohne ein Geräusch zu machen | Ríete sin hacer ruido | Смеј се без звук
Suona la trombetta, ma senza suono | Play the horn, but without a sound | Joue de la trompette, mais sans bruit | Spiel die Hupe, aber ganz ohne Ton | Toca la bocina, pero sin sonido | Свири на трубата, но без звук
Porta un cestino pesantissimo | Carry a super-heavy basket | Porte un panier très très lourd | Trag einen superschweren Korb | Lleva una cesta pesadísima | Носи многу тешка кошничка
Sistemati il papillon allo specchio | Straighten your bow tie in the mirror | Ajuste ton nœud papillon devant le miroir | Rück deine Fliege vor dem Spiegel zurecht | Arréglate la pajarita en el espejo | Намести ја папионката пред огледалото
Mettiti il naso rosso | Put on your red nose | Mets ton nez rouge | Setz die rote Nase auf | Ponte la nariz roja | Стави си го црвениот нос
Tira una corda invisibile | Pull an invisible rope | Tire une corde invisible | Zieh an einem unsichtbaren Seil | Tira de una cuerda invisible | Повлечи невидливо јаже
Truccati prima dello spettacolo | Put on your make-up before the show | Maquille-toi avant le spectacle | Schmink dich vor der Show | Maquíllate antes del espectáculo | Нашминкај се пред шоуто
Fai un inchino al pubblico | Take a bow to the audience | Fais une révérence au public | Verbeug dich vor dem Publikum | Haz una reverencia al público | Поклони се пред публиката
Coppie | Pairs | Paires | Paare | Parejas | Парови
coppie trovate | pairs found | paires trouvées | Paare gefunden | parejas encontradas | пронајдени парови
Wondy ha riso tanto! | Wondy laughed so much! | Wondy a bien ri ! | Wondy hat ganz viel gelacht! | ¡Wondy se ha reído un montón! | Wondy многу се смееше!
FESTA! | PARTY! | FÊTE ! | FEIER! | ¡FIESTA! | ЗАБАВА!
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
  const UNITA = ["naso", "nasi", "naso preso", "nasi presi", "lancio", "lanci", "mossa", "mosse", "coppie trovate"];
  /* date lunghe italiane ("14 novembre 2026", da famiglie.js) e brevi ("sab 14 nov") nella lingua attiva */
  const ITD = new RegExp("^(\\d{1,2}) (" + MESI.join("|") + ") (\\d{4})$");
  const ITS = /^(dom|lun|mar|mer|gio|ven|sab) (\d{1,2}) (gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)$/;
  function dateL(s) {
    const m = String(s).match(ITD);
    if (!m || L === "it") return s;
    const d = +m[1], mi = MESI.indexOf(m[2]), y = +m[3];
    if (L === "mk") return d + " " + MK.mesi[mi] + " " + y;
    return new Intl.DateTimeFormat(LOC[L], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(Date.UTC(y, mi, d));
  }
  function dateS(m) {
    const g = ["dom","lun","mar","mer","gio","ven","sab"].indexOf(m[1]);
    const mi = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"].indexOf(m[3]);
    const c = (x) => String(x).replace(/\.$/, "");
    if (L === "mk") return MK.g3[g] + " " + m[2] + " " + MK.m3[mi];
    const wd = c(new Intl.DateTimeFormat(LOC[L], { weekday: "short", timeZone: "UTC" }).format(Date.UTC(2024, 0, 7 + g)));
    const mo = c(new Intl.DateTimeFormat(LOC[L], { month: "short", timeZone: "UTC" }).format(Date.UTC(2024, mi, 15)));
    return wd + " " + m[2] + (L === "de" ? ". " : " ") + mo;
  }
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
    [/^su (\d+)$/, (m) => pick({ en: "of $1", fr: "sur $1", de: "von $1", es: "de $1", mk: "од $1" }, m)],
    /* date e testi di famiglie.js (i nomi scritti dagli utenti restano come sono) */
    [ITD, (m) => dateL(m[0])],
    [ITS, (m) => dateS(m)],
    [/^(\d+) di (\d+)$/, (m) => pick({ en: "$1 of $2", fr: "$1 sur $2", de: "$1 von $2", es: "$1 de $2", mk: "$1 од $2" }, m)],
    [/^Tavola (\d+)$/, (m) => pick({ en: "Picture $1", fr: "Image $1", de: "Bild $1", es: "Lámina $1", mk: "Слика $1" }, m)],
    [/^Tavola (\d+) di (\d+): (.+)$/, (m) => pick({ en: "Picture $1 of $2: $3", fr: "Image $1 sur $2 : $3", de: "Bild $1 von $2: $3", es: "Lámina $1 de $2: $3", mk: "Слика $1 од $2: $3" }, m)],
    [/^Stasera in scena: (.+)! Wondy si inchina e dedica il girasole a (.+)\.$/, (m) => pick({ en: "Tonight on stage: $1! Wondy bows and dedicates the sunflower to $2.", fr: "Ce soir en scène : $1 ! Wondy s'incline et dédie le tournesol à $2.", de: "Heute Abend auf der Bühne: $1! Wondy verbeugt sich und widmet $2 die Sonnenblume.", es: "Esta noche en escena: ¡$1! Wondy hace una reverencia y le dedica el girasol a $2.", mk: "Вечерва на сцена: $1! Wondy се поклонува и му го посветува сончогледот на $2." }, m)],
    [/^La festa è tra (\d+) giorni\. Il calendario conta gli ultimi 14: si comincia a colorare il (.+)\.$/, (m) => pick({ en: "The party is in $1 days. The calendar counts the last 14: colouring starts on $2.", fr: "La fête est dans $1 jours. Le calendrier compte les 14 derniers : on commence à colorier le $2.", de: "Die Feier ist in $1 Tagen. Der Kalender zählt die letzten 14: Mit dem Ausmalen geht es am $2 los.", es: "La fiesta es dentro de $1 días. El calendario cuenta los últimos 14: se empieza a colorear el $2.", mk: "Забавата е за $1 дена. Календарот ги брои последните 14: боењето почнува на $2." }, [0, m[1], dateL(m[2])])],
    [/^Mancano (\d+) (naso|nasi) alla festa del (.+)\. Il primo si colora stasera!$/, (m) => {
      const one = m[2] === "naso";
      return pick({ en: one ? "$1 nose to go until the party on $2. Colour it in tonight!" : "$1 noses to go until the party on $2. Colour in the first one tonight!",
        fr: "Plus que $1 nez avant la fête du $2. " + (one ? "On le colorie ce soir !" : "Le premier se colorie ce soir !"),
        de: (one ? "Noch $1 Nase" : "Noch $1 Nasen") + " bis zur Feier am $2. " + (one ? "Sie wird heute Abend ausgemalt!" : "Die erste wird heute Abend ausgemalt!"),
        es: (one ? "Falta $1 nariz" : "Faltan $1 narices") + " para la fiesta del $2. " + (one ? "¡Se colorea esta noche!" : "¡La primera se colorea esta noche!"),
        mk: "Уште $1 " + (one ? "нос" : "носеви") + " до забавата на $2. " + (one ? "Се бои вечерва!" : "Првиот се бои вечерва!") }, [0, m[1], dateL(m[3])]);
    }],
    [/^Anteprima: (\d+) nasi da colorare, dal (.+) alla festa del (.+)$/, (m) => pick({ en: "Preview: $1 noses to colour in, from $2 to the party on $3", fr: "Aperçu : $1 nez à colorier, du $2 à la fête du $3", de: "Vorschau: $1 Nasen zum Ausmalen, vom $2 bis zur Feier am $3", es: "Vista previa: $1 narices para colorear, del $2 a la fiesta del $3", mk: "Преглед: $1 носеви за боење, од $2 до забавата на $3" }, [0, m[1], dateL(m[2]), dateL(m[3])])],
    [/^Biglietto ricordo del Circo di Wondy per (.+?)(, festa del (.+))?$/, (m) => pick({ en: "Keepsake ticket for Wondy's Circus for $1", fr: "Billet souvenir du Cirque de Wondy pour $1", de: "Erinnerungskarte für Wondys Zirkus für $1", es: "Entrada de recuerdo del Circo de Wondy para $1", mk: "Билет за спомен од Циркусот на Wondy за $1" }, [0, m[1] === "il festeggiato" ? dict(m[1]) : m[1]]) +
      (m[3] ? pick({ en: ", party on $1", fr: ", fête du $1", de: ", Feier am $1", es: ", fiesta del $1", mk: ", забава на $1" }, [0, dateL(m[3])]) : "")],
    [/^Festa del (.+)$/, (m) => ITD.test(m[1]) ? pick({ en: "Party on $1", fr: "Fête du $1", de: "Feier am $1", es: "Fiesta del $1", mk: "Забава на $1" }, [0, dateL(m[1])]) : null],
    /* giochi: specchio mimo, respiro, stelline */
    [/^Carta (\d+)$/, (m) => pick({ en: "Card $1", fr: "Carte $1", de: "Karte $1", es: "Carta $1", mk: "Карта $1" }, m)],
    [/^Gesto: (.+)$/, (m) => pick({ en: "Gesture: $1", fr: "Geste : $1", de: "Geste: $1", es: "Gesto: $1", mk: "Гест: $1" }, [0, T(m[1])])],
    [/^Respiro (\d+) di (\d+)\. Inspira\.$/, (m) => pick({ en: "Breath $1 of $2. Breathe in.", fr: "Respiration $1 sur $2. Inspire.", de: "Atemzug $1 von $2. Einatmen.", es: "Respiración $1 de $2. Inspira.", mk: "Вдиш $1 од $2. Вдиши." }, m)],
    [/^\+(\d+) ✦ · stelline raccolte: (\d+)$/, (m) => pick({ en: "+$1 ✦ · stars collected: $2", fr: "+$1 ✦ · étoiles gagnées : $2", de: "+$1 ✦ · gesammelte Sternchen: $2", es: "+$1 ✦ · estrellitas conseguidas: $2", mk: "+$1 ✦ · собрани ѕвездички: $2" }, m)],
    [/^Stelline raccolte: (\d+) ✦$/, (m) => pick({ en: "Stars collected: $1 ✦", fr: "Étoiles gagnées : $1 ✦", de: "Gesammelte Sternchen: $1 ✦", es: "Estrellitas conseguidas: $1 ✦", mk: "Собрани ѕвездички: $1 ✦" }, m)],
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
  const SKIP_ATTR = "script,style,noscript,template,.lang-switch,[data-i18n-skip]"; // negli svg si traducono solo gli attributi (aria-label)
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
    if (node instanceof SVGElement) { svgWalk(node); return; }
    /* data-i18n-skip (es. anteprime con i nomi dei bambini): si traducono solo l'etichetta e le scritte fisse degli svg */
    if (node.matches("[data-i18n-skip]")) { doAttrs(node); safeWalk(node); return; }
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
      if (r.type === "childList") r.addedNodes.forEach((n) => {
        if (!n.isConnected) return;
        const p = n.parentElement;
        if (!p || !p.closest(SKIP)) walk(n);
        else if (n instanceof SVGSVGElement && !p.closest("script,style,template,.lang-switch")) svgWalk(n); // fogli da stampare
      });
      else if (r.type === "characterData") { if (r.target.isConnected && !skipped(r.target)) doText(r.target); }
      else if (r.target.isConnected && !r.target.closest(SKIP_ATTR)) doAttrs(r.target);
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

  /* ---------- testi dentro gli svg e sul canvas (fogli da stampare, biglietto ricordo) ----------
     Solo frasi note o date: un nome scritto dall'utente (es. "Viola", "Rosa") non va mai tradotto. */
  const PRINT_OK = new Set(["DIPLOMA", "di Aiutante del Mimo", "Si certifica che", "ha aiutato Wondy durante lo spettacolo:", "ha riso, applaudito e parlato con le mani,",
    "senza dire nemmeno una parola!", "DATA", "IL MIMO", "Mancano", "FESTA!", "Stasera in scena", "alla festa!", "Ogni sera colora un naso. Quando li hai colorati tutti, è il giorno della festa!",
    "IL CIRCO DI WONDY", "Biglietto ricordo · ingresso d'onore per", "IL FESTEGGIATO", "Festa di compleanno", "CLOWN ✦ PHYSICAL ACTOR ✦ FANTASISTA", "AMMETTE 1", "posto in prima fila"]);
  const printOk = (o) => PRINT_OK.has(o) || ITD.test(o) || ITS.test(o) || /^\d+ nas[oi]$/.test(o) || (/^Festa del /.test(o) && ITD.test(o.slice(10)));
  /* zone con data-i18n-skip: solo le scritte fisse note, mai i nomi */
  function safeWalk(root) {
    root.querySelectorAll("svg").forEach(svgWalk);
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) {
      const c = tw.currentNode;
      if (c.parentElement.closest("svg")) continue;
      const rec = TXT.get(c), o = rec && c.data === rec.t ? rec.o : N(c.data);
      if (printOk(o)) doText(c);
    }
  }
  function svgWalk(svg) {
    doAttrs(svg);
    svg.querySelectorAll("[aria-label]").forEach(doAttrs);
    svg.querySelectorAll("text, tspan").forEach((t) => t.childNodes.forEach((c) => {
      if (c.nodeType !== 3) return;
      const rec = TXT.get(c), o = rec && c.data === rec.t ? rec.o : N(c.data);
      if (printOk(o)) doText(c);
    }));
  }
  /* il biglietto ricordo è disegnato su canvas: si traducono le scritte fisse al momento del disegno */
  if (window.CanvasRenderingContext2D) {
    const fill = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t, ...rest) {
      if (L !== "it" && typeof t === "string") {
        const o = N(t);
        if (printOk(o)) { let out = T(o); if (/ {2}✦ {2}/.test(t)) out = out.replace(/ ✦ /g, "  ✦  "); t = out; }
      }
      return fill.call(this, t, ...rest);
    };
  }

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

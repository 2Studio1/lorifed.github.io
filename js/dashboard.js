/* Home v4 · dashboard d'esempio a 8 schede.
   Pattern "tour dell'app" studiato dal vivo su orbitagents.com (31/10/2026), ricostruito da zero:
   niente asset né codice loro. Tutto il markup nasce qui dentro #dx; senza JS resta il testo della sezione.
   Migliorie rispetto al riferimento: testo a grandezza reale (non uno screenshot rimpicciolito),
   vista mobile semplificata e scorrevole, popup che restano dentro la finestra, hotspot da tastiera
   con "Next", prefers-reduced-motion (niente giro automatico né animazioni), grafo del Brain in
   canvas che gira solo quando è visibile. */
(function(){
  var root = document.getElementById('dx'); if (!root) return;
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOB = matchMedia('(max-width: 759px)');
  var IT = document.documentElement.lang === 'it';
  function L(en, it){ return IT ? it : en; }
  function $(s, r){ return (r || root).querySelector(s); }
  function $$(s, r){ return [].slice.call((r || root).querySelectorAll(s)); }
  function e(s){ return String(s).replace(/&(?![a-z#0-9]+;)/g, '&amp;'); }

  /* ---------- icone (tratto 1.8, disegnate per questa pagina) ---------- */
  var P = {
    chat:'<path d="M20 11.5a8 8 0 0 1-11.7 7.1L4 19.8l1.1-4A8 8 0 1 1 20 11.5z"/>',
    agents:'<circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9.5" r="2.4"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M14.5 18.5a4 4 0 0 1 6-3.4"/>',
    dash:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    inbox:'<path d="M3.5 13.5 6 5h12l2.5 8.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19z"/><path d="M3.5 13.5h5l1.5 2.5h4l1.5-2.5h5"/>',
    cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    flow:'<rect x="3" y="3.5" width="7" height="6" rx="1.5"/><rect x="14" y="14.5" width="7" height="6" rx="1.5"/><path d="M6.5 9.5v3a2 2 0 0 0 2 2H14"/>',
    org:'<rect x="9" y="3" width="6" height="5" rx="1.2"/><rect x="3" y="16" width="6" height="5" rx="1.2"/><rect x="15" y="16" width="6" height="5" rx="1.2"/><path d="M12 8v4M6 16v-2h12v2"/>',
    brain:'<path d="M9.5 4.5a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 5.5 1.5V6a2.5 2.5 0 0 0-2.5-1.5zM14.5 4.5a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-5.5 1.5"/>',
    crm:'<circle cx="9" cy="9" r="3.5"/><path d="M3 19.5a6 6 0 0 1 12 0M16 5.5a3.5 3.5 0 0 1 0 7M18 14.5a5.5 5.5 0 0 1 3 5"/>',
    market:'<path d="M5 4v16M9 4v16M13.5 4.5l5 15"/>',
    vault:'<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM13 4h5.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H13z"/>',
    shield:'<path d="M12 3.5 19 6v5.5c0 4.2-3 7.5-7 9-4-1.5-7-4.8-7-9V6z"/>',
    help:'<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 3.5v17"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M4.2 7.5l2.1 1.2M17.7 15.3l2.1 1.2M4.2 16.5l2.1-1.2M17.7 8.7l2.1-1.2"/>',
    updown:'<path d="m8 9.5 4-4 4 4M8 14.5l4 4 4-4"/>',
    panel:'<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M9.5 4.5v15"/>',
    down:'<path d="m6.5 9.5 5.5 5.5 5.5-5.5"/>',
    moon:'<path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z"/>',
    bell:'<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15zM10 20.5a2 2 0 0 0 4 0"/>',
    user:'<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    brief:'<rect x="3.5" y="7" width="17" height="12.5" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/>',
    search:'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    arrowdown:'<path d="M12 5v14M6.5 13.5 12 19l5.5-5.5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    history:'<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5M12 8v4l3 2"/>',
    mic:'<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5"/>',
    up:'<path d="M12 19V5M6.5 10.5 12 5l5.5 5.5"/>',
    pause:'<path d="M9 5v14M15 5v14"/>',
    list:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    reply:'<path d="M9.5 8 4.5 12.5l5 4.5"/><path d="M4.5 12.5H14a5.5 5.5 0 0 1 5.5 5.5v1"/>',
    check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    alert:'<path d="M12 4 21 19.5H3z"/><path d="M12 10v4M12 17h.01"/>',
    trend:'<path d="m4 16 5-5 4 4 7-7M15 8h5v5"/>',
    pulse:'<path d="M3 12h4l2.5-6 5 12 2.5-6h4"/>',
    x:'<path d="M6 6l12 12M18 6 6 18"/>',
    copy:'<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
    pin:'<path d="M9 4h6l-1 5 3 3H7l3-3zM12 12v8"/>',
    arrow:'<path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5"/>',
    left:'<path d="M14.5 6 8.5 12l6 6"/>',
    right:'<path d="m9.5 6 6 6-6 6"/>',
    meet:'<rect x="3" y="6.5" width="12.5" height="11" rx="2"/><path d="m15.5 10.5 5.5-3v9l-5.5-3z"/>',
    play:'<path d="M7 5v14l11-7z"/>',
    clip:'<path d="M20 11.5 12 19.5a5 5 0 0 1-7-7l8-8a3.3 3.3 0 0 1 4.7 4.7l-7.6 7.6a1.6 1.6 0 0 1-2.3-2.3l7-7"/>',
    spark:'<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
    sliders:'<path d="M6 4v16M12 4v16M18 4v16"/><circle cx="6" cy="9" r="1.8"/><circle cx="12" cy="15" r="1.8"/><circle cx="18" cy="8" r="1.8"/>',
    bolt:'<path d="M13 3 5 13.5h6l-1 7.5 8-10.5h-6z"/>',
    compass:'<circle cx="12" cy="12" r="8.6"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z"/>',
    bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    lines:'<path d="M5 6h14M5 10h14M5 14h9M5 18h6"/>',
    tag:'<path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9z"/><circle cx="8" cy="8" r="1.4"/>',
    link:'<circle cx="7.5" cy="7.5" r="3"/><circle cx="16.5" cy="16.5" r="3"/><path d="M10 10l4 4M14.5 5.5h4v4M9.5 18.5h-4v-4"/>',
    card:'<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M7.5 9h9M7.5 13h6M7.5 17h4"/>',
    headset:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
    insta:'<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.8"/><path d="M17 7h.01"/>',
    stories:'<path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5M20.5 12a8.5 8.5 0 0 1-8.5 8.5M12 20.5A8.5 8.5 0 0 1 3.5 12M3.5 12A8.5 8.5 0 0 1 12 3.5" stroke-dasharray="11 2.4"/><circle cx="12" cy="12" r="3.5"/>',
    bars:'<path d="M5 20V11M10 20V5M15 20v-7M20 20V9"/>',
    yt:'<rect x="3" y="5.5" width="18" height="13" rx="4"/><path d="m10.5 9.5 4 2.5-4 2.5z"/>',
    mega:'<path d="M3 10.5v3a1 1 0 0 0 1 1h2.5l5.5 4v-13l-5.5 4H4a1 1 0 0 0-1 1z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6"/><path d="M18.5 6a8.4 8.4 0 0 1 0 12"/>',
    target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>',
    image:'<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5.5-5 4 3.5 2.5-2 4 3.5"/>',
    browser:'<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M3 9h18M6.5 6.8h.01M9 6.8h.01"/>',
    funnel:'<path d="M3.5 5h17l-6.5 8v6l-4-2v-4z"/>',
    bag:'<path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
    phone:'<path d="M5 4h3.5l2 5-2.4 1.5a11 11 0 0 0 5.4 5.4l1.5-2.4 5 2V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    star:'<path d="m12 3.8 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5 2.7 1-5.6-4.1-3.9 5.6-.8z"/>',
    mail:'<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.6 6.5 12 13l8.4-6.5"/>',
    doc:'<path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z"/><path d="M14 3v4h4"/><path d="M9.5 12.5h5M9.5 16h3.5"/>'
  };
  function ic(k, c){ return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (c ? ' class="' + c + '"' : '') + '>' + P[k] + '</svg>'; }

  /* ---------- dati d'esempio: 26 agenti in 9 reparti ---------- */
  var DEP = IT ? [['Direzione','#7C5CFC'],['Vendite','#13A06B'],['Social','#E0457B'],['Pubblicità','#EF7A2B'],
    ['Siti & e-commerce','#2F7BF5'],['Clienti','#0EA5B7'],['Comunicazione','#D49B12'],['Amministrazione','#64748B'],['Operazioni','#7FA01C']]
    : [['Leadership','#7C5CFC'],['Sales','#13A06B'],['Social','#E0457B'],['Advertising','#EF7A2B'],
    ['Websites & e-commerce','#2F7BF5'],['Customers','#0EA5B7'],['Communication','#D49B12'],['Admin','#64748B'],['Operations','#7FA01C']];
  // [nome, reparto, icona, stato, cosa fa, quando, output 7 giorni, ultima attività]
  var AG = IT ? [
    ['Coordinatore',0,'compass','run','Smista il lavoro tra gli agenti e lo controlla.','Sempre attivo','212 passaggi','2 min fa'],
    ['Mentore',0,'bulb','sch','Risponde alle domande sull’attività con i tuoi numeri.','Su richiesta','9 risposte','1 h fa'],
    ['Riassunti',0,'lines','sch','Riassume call, email e la settimana.','Ogni giorno 18:00','7 riassunti','ieri'],
    ['Offerta & Prezzi',0,'tag','ready','Controlla prezzi e margini di ogni offerta.','Su richiesta','3 controlli prezzi','3 h fa'],
    ['Trova Clienti',1,'search','run','Trova aziende in target e scrive la prima email.','Feriali 08:00','96 contatti','4 min fa'],
    ['Trova Fornitori & Partner',1,'link','sch','Trova fornitori e partner, confronta le condizioni.','Il lunedì','14 fornitori','2 giorni fa'],
    ['Trattative & Preventivi',1,'card','run','Tiene aggiornate le trattative e fa i solleciti.','Ogni ora','31 solleciti','12 min fa'],
    ['Chiamate di Vendita',1,'headset','sch','Chiama i contatti caldi e fissa gli incontri.','Mar · Gio','4 incontri fissati','ieri'],
    ['Social',2,'insta','wait','Pianifica la settimana e scrive i post con il tuo stile.','Domenica 17:00','12 post','35 min fa'],
    ['Storie Instagram',2,'stories','sch','Trasforma novità e offerte in storie ogni giorno.','Ogni giorno 11:00','21 storie','2 h fa'],
    ['Video & Reel',2,'meet','run','Taglia reel e short dai tuoi video lunghi.','A ogni nuovo video','6 reel','20 min fa'],
    ['Messaggi Instagram',2,'chat','run','Risponde ai messaggi e manda il link che chiedono.','Sempre attivo','148 risposte','1 min fa'],
    ['Report Instagram',2,'bars','ready','Ti mostra cosa ha funzionato sul profilo.','Ogni mese','1 report','oggi 07:00'],
    ['YouTube',2,'yt','sch','Scrive titoli, capitoli e descrizioni.','A ogni nuovo video','2 caricamenti','3 giorni fa'],
    ['Annunci Concorrenti',3,'mega','sch','Segue ogni annuncio dei tuoi concorrenti.','Il giovedì','38 annunci letti','2 giorni fa'],
    ['Gestione Ads',3,'target','wait','Controlla la spesa e ti dice cosa fermare.','Ogni giorno 09:00','1.240 € gestiti','1 h fa'],
    ['Creatività Ads',3,'image','wait','Crea immagini e testi degli annunci da testare.','Su richiesta','9 varianti','50 min fa'],
    ['Siti & Landing Page',4,'browser','ready','Crea e aggiorna pagine che convertono.','Su richiesta','2 pagine','4 giorni fa'],
    ['Funnel & Conversioni',4,'funnel','sch','Trova dove i visitatori se ne vanno e lo sistema.','Ogni settimana','3 correzioni','ieri'],
    ['E-commerce',4,'bag','run','Tiene in ordine negozio, magazzino e prodotti.','Ogni ora','54 ordini allineati','8 min fa'],
    ['Assistenza Telefonica',5,'phone','run','Risponde alle chiamate e fissa gli appuntamenti.','Sempre attivo','63 chiamate','6 min fa'],
    ['Recensioni',5,'star','sch','Risponde alle recensioni, ne chiede una a ogni cliente.','Ogni giorno 10:00','11 risposte','3 h fa'],
    ['Email',6,'mail','run','Mette in ordine la posta e prepara le risposte.','Sempre attivo','58 bozze','3 min fa'],
    ['Documenti',7,'doc','wait','Prepara preventivi, fatture e contratti.','Su richiesta','26 documenti','09:03'],
    ['Solleciti Pagamento',7,'clock','sch','Sollecita le fatture non pagate, con garbo.','Ogni giorno 09:30','5 solleciti','09:30'],
    ['Automazioni',8,'bolt','run','Collega i tuoi strumenti così i dati si spostano da soli.','Sempre attivo','1.906 esecuzioni','adesso']
  ] : [
    ['Coordinator',0,'compass','run','Routes work between agents and checks it.','Always on','212 hand-offs','2 min ago'],
    ['Advisor',0,'bulb','sch','Answers business questions with your numbers.','On request','9 answers','1 h ago'],
    ['Summaries',0,'lines','sch','Sums up calls, emails and the week.','Daily 18:00','7 summaries','yesterday'],
    ['Offer & Pricing',0,'tag','ready','Checks prices and margins on every offer.','On request','3 price checks','3 h ago'],
    ['Lead Finder',1,'search','run','Finds companies that fit and writes the first email.','Weekdays 08:00','96 leads','4 min ago'],
    ['Supplier & Partner Finder',1,'link','sch','Finds suppliers and partners, compares terms.','Mondays','14 suppliers','2 days ago'],
    ['CRM & Quotes',1,'card','run','Keeps the pipeline current and follows up.','Hourly','31 follow-ups','12 min ago'],
    ['Sales Calls',1,'headset','sch','Calls warm contacts and books meetings.','Tue · Thu','4 calls booked','yesterday'],
    ['Social',2,'insta','wait','Plans the week and writes posts in your voice.','Sundays 17:00','12 posts','35 min ago'],
    ['Instagram Stories',2,'stories','sch','Turns news and offers into daily stories.','Daily 11:00','21 stories','2 h ago'],
    ['Video & Reels',2,'meet','run','Cuts reels and shorts from your long videos.','On new video','6 reels','20 min ago'],
    ['Instagram DM',2,'chat','run','Answers DMs and sends the link people ask for.','Always on','148 replies','1 min ago'],
    ['Instagram Report',2,'bars','ready','Shows what worked on your profile.','Monthly','1 report','today 07:00'],
    ['YouTube',2,'yt','sch','Writes titles, chapters and descriptions.','On new video','2 uploads','3 days ago'],
    ['Competitor Ads',3,'mega','sch','Tracks every ad your competitors run.','Thursdays','38 ads read','2 days ago'],
    ['Ads Manager',3,'target','wait','Watches spend, tells you what to pause.','Daily 09:00','€1,240 managed','1 h ago'],
    ['Ad Creatives',3,'image','wait','Makes ad images and copy to test.','On request','9 variants','50 min ago'],
    ['Websites & Landing Pages',4,'browser','ready','Builds and updates pages that convert.','On request','2 pages','4 days ago'],
    ['Funnels & Conversion',4,'funnel','sch','Finds where visitors drop off, fixes it.','Weekly','3 fixes','yesterday'],
    ['E-commerce',4,'bag','run','Keeps store, stock and products in order.','Hourly','54 orders synced','8 min ago'],
    ['Phone Support',5,'phone','run','Answers calls and books appointments.','Always on','63 calls','6 min ago'],
    ['Reviews',5,'star','sch','Replies to reviews, asks every customer for one.','Daily 10:00','11 replies','3 h ago'],
    ['Email',6,'mail','run','Sorts your inbox and drafts the replies.','Always on','58 drafts','3 min ago'],
    ['Documents',7,'doc','wait','Drafts quotes, invoices and contracts.','On request','26 documents','09:03'],
    ['Payment Reminders',7,'clock','sch','Chases unpaid invoices, politely.','Daily 09:30','5 reminders','09:30'],
    ['Automations',8,'bolt','run','Connects your tools so data moves on its own.','Always on','1,906 runs','just now']
  ];
  var ST = IT ? { run:'Al lavoro', sch:'Programmato', wait:'Serve te', ready:'Pronto', off:'In pausa' }
           : { run:'Working', sch:'Scheduled', wait:'Needs you', ready:'Ready', off:'Paused' };
  function av(i, c){ var a = AG[i]; return '<span class="dx-av' + (c ? ' ' + c : '') + '" style="--c:' + DEP[a[1]][1] + '">' + ic(a[2]) + '</span>'; }
  function cnt(d){ return AG.filter(function(a){ return a[1] === d; }).length; }

  /* ---------- schede: [etichetta, icona, didascalia, voci dei numeri] ---------- */
  var T = IT ? [
    ['Chat','chat','Affida un lavoro al Coordinatore, o crea con lui un nuovo agente.',[
      ['Due modi per iniziare','Chiedi un lavoro, o crea un nuovo agente insieme al Coordinatore.'],
      ['Scrivi come in un messaggio','Parole semplici, niente comandi. Il Coordinatore sceglie l’agente giusto.'],
      ['I lavori che chiedi più spesso','Partono con un clic, con le tue impostazioni di sempre.'],
      ['Agenti pronti a lavorare','Tutti i tuoi agenti, collegati ai tuoi strumenti.'],
      ['Lavori in corso','Cosa sta girando adesso, e a che punto è.']]],
    ['Agenti','agents','Tutti i tuoi agenti, per reparto, e cosa stanno facendo adesso.',[
      ['Aggiungi un agente','Sceglilo dal catalogo. Entra con la stessa memoria condivisa.'],
      ['Trova qualsiasi agente','Cerca, o filtra per stato: al lavoro, programmato, in pausa.'],
      ['Per reparto','Nove reparti, come in un’azienda vera. Toccane uno per filtrare.'],
      ['Acceso o spento, quando vuoi','Metti in pausa un agente con un interruttore. Da spento non fa niente.'],
      ['Stato in tempo reale','Al lavoro, programmato, o in attesa del tuo ok.']]],
    ['Dashboard','dash','Una pagina per cosa è stato fatto, cosa serve da te e chi ha risposto.',[
      ['La settimana in numeri','Ore lavorate, ore risparmiate, attività e consegne, rispetto alla settimana scorsa.'],
      ['Cosa serve da te','Risposte, bozze in attesa del tuo ok, agenti bloccati, call fissate.'],
      ['In due righe','Il Coordinatore riassume la settimana in due righe.'],
      ['Risposte da dare','Conversazioni che vogliono una persona, con la bozza già pronta.'],
      ['Le tue trattative','A che punto è ogni contatto, aggiornato dai tuoi agenti di vendita.']]],
    ['Da vedere','inbox','Tutto quello che i tuoi agenti hanno finito o ti chiedono, in un solo elenco.',[
      ['Cosa serve da te','Bozze e domande in attesa della tua risposta.'],
      ['Filtra l’elenco','Per agente, per reparto o per tipo di lavoro.'],
      ['Una scheda per lavoro','Cosa è stato fatto, quale agente l’ha fatto e quando.'],
      ['Approva, modifica o scarta','Non esce niente senza il tuo ok.'],
      ['Il risultato completo','Leggi tutta la bozza prima di decidere.'],
      ['Parla con l’agente','Rispondi a parole tue. Legge la tua nota al giro successivo.']]],
    ['Calendario','cal','Il tuo piano, i tuoi incontri e ogni giro degli agenti, in un solo calendario.',[
      ['Cambia vista','Settimana, mese, elenco attività o solo i giri degli agenti.'],
      ['Ogni incontro ha il suo brief','Prima di una call, un agente ti prepara chi incontri e cosa conta.'],
      ['Ogni giro degli agenti','Ogni giro appare come un appuntamento. Apri il gruppo per vedere chi ha lavorato.'],
      ['Mostra ciò che ti serve','Il tuo piano, i tuoi incontri, i giri degli agenti, o tutto insieme.'],
      ['Programma un lavoro','Fissa un lavoro per qualsiasi agente, una volta o ogni settimana.']]],
    ['Flussi','flow','Metti gli agenti in fila: uno passa il risultato al successivo, e tu controlli.',[
      ['Agenti in fila','Quando un agente finisce, il successivo parte dal suo risultato.'],
      ['Avvialo adesso','O lascia che parta da solo: una nuova email, un modulo, un orario.'],
      ['Ogni passo registrato','Ora, agente e risultato, riga per riga.'],
      ['Guarda il risultato','Apri qui quello che ha prodotto ogni passo.'],
      ['I tuoi flussi','Attivi, programmati o spenti. Si cambia con un clic.']]],
    ['Azienda','org','I tuoi agenti come un organigramma, per reparto.',[
      ['Tu in cima','Ogni reparto risponde a te. Niente salta la fila.'],
      ['Reparti','Agenti raggruppati come in un’azienda vera, ognuno col suo lavoro.'],
      ['Dagli il contesto','Allega un listino o una guida al tono. Quel reparto li legge per primi.'],
      ['Riorganizza quando vuoi','Sposta un agente in un altro reparto, o aggiungine uno nuovo.']]],
    ['Cervello','brain','Tutto quello che i tuoi agenti sanno e producono, in un’unica memoria.',[
      ['Tutto quello che sanno','Memoria, competenze, lezioni, file e regole, in un solo posto.'],
      ['La memoria della tua azienda','Ogni punto è una nota, un file o un risultato. I colori sono i reparti.'],
      ['Chiedi al Coordinatore','Le risposte vengono dalle tue note, non da internet.'],
      ['Cercaci dentro','Scrivi un reparto o un agente e si accende la sua memoria.'],
      ['Filtra per reparto','Mostra la memoria di un reparto, o di tutti.']]]
  ] : [
    ['Chat','chat','Hand your Coordinator a job, or build a new agent together.',[
      ['Two ways to start','Ask for a job, or build a new agent together with your Coordinator.'],
      ['Write it like a message','Plain words, no commands. The Coordinator picks the right agent.'],
      ['Jobs you ask for often','One click starts them, with your usual settings.'],
      ['Agents ready to work','Every agent you own, connected to your tools.'],
      ['Work in progress','What is running right now, and how far along it is.']]],
    ['Agents','agents','Every agent you own, by department, and what it&rsquo;s doing now.',[
      ['Add an agent','Pick one from the catalogue. It joins with the same shared memory.'],
      ['Find any agent','Search, or filter by status: working, scheduled, paused.'],
      ['By department','Nine departments, like a real company. Tap one to filter.'],
      ['On or off, any time','Pause an agent with one switch. Nothing runs while it&rsquo;s off.'],
      ['Live status','Working, scheduled, or waiting for your yes.']]],
    ['Dashboard','dash','One page for what got done, what needs you and who replied.',[
      ['The week in numbers','Hours worked, hours saved, tasks and deliverables, against last week.'],
      ['What needs you','Replies, drafts waiting for your yes, blocked agents, calls booked.'],
      ['A short read','Your Coordinator sums up the week in two lines.'],
      ['Replies to answer','Conversations that need a person, with a draft ready.'],
      ['Your pipeline','Where every lead stands, kept current by your sales agents.']]],
    ['Inbox','inbox','Everything your agents finished or need from you, in one feed.',[
      ['What needs you','Drafts and questions waiting for your answer.'],
      ['Filter the feed','By agent, by department, or by type of work.'],
      ['One card per job','What was done, which agent did it, and when.'],
      ['Approve, edit or drop','Nothing goes out without your yes.'],
      ['The full result','Read the whole draft before you decide.'],
      ['Talk to the agent','Reply in plain words. It reads your note on the next run.']]],
    ['Calendar','cal','Your plan, your meetings and every agent run, on one calendar.',[
      ['Switch the view','Week, month, a task list, or only agent runs.'],
      ['Meetings come with a brief','Before a call, an agent prepares who you&rsquo;re meeting and what matters.'],
      ['Every agent run','Each run shows up like an appointment. Open the group to see who ran.'],
      ['Show what you need','Your plan, your meetings, agent runs, or all of them.'],
      ['Plan a job','Schedule work for any agent, once or every week.']]],
    ['Workflows','flow','Chain agents so one hands its result to the next, with you as the checkpoint.',[
      ['Agents in a chain','When one agent finishes, the next starts with its result.'],
      ['Run it now','Or let it start on its own: a new email, a form, a time of day.'],
      ['Every step logged','Time, agent and result, line by line.'],
      ['See the result','Open what any step produced, right here.'],
      ['Your workflows','Live, scheduled or off. One click to switch.']]],
    ['Company','org','Your agents as an org chart, by department.',[
      ['You on top','Every department answers to you. Nothing skips the line.'],
      ['Departments','Agents grouped like a real company, each with its own job.'],
      ['Give them context','Attach a price list or a tone guide. That department reads it first.'],
      ['Rearrange any time','Move an agent to another department, or add a new one.']]],
    ['Brain','brain','Everything your agents know and produce, in one memory.',[
      ['Everything they know','Memory, skills, lessons, files and rules, in one place.'],
      ['Your company&rsquo;s memory','Every dot is a note, a file or a result. Colours are departments.'],
      ['Ask your Coordinator','Answers come from your own notes, not from the internet.'],
      ['Search it','Type a department or an agent to light up its memory.'],
      ['Filter by department','Show one department&rsquo;s memory, or all of them.']]]
  ];
  function H(t, n, pos){
    var no = T[t][3][n];
    return '<button type="button" class="dx-hs' + (pos ? ' dx-hs-' + pos : '') + '" data-t="' + t + '" data-n="' + n +
      '" aria-expanded="false" aria-label="' + (n + 1) + ': ' + no[0].replace(/&rsquo;/g, '’') + '">' + (n + 1) + '</button>';
  }
  function ph(k, eb, title, sub, right){
    return '<header class="dx-ph"><div>' + (eb ? '<p class="dx-eb">' + ic(k) + eb + '</p>' : '') + '<h3>' + title + '</h3>' +
      (sub ? '<p class="dx-sub">' + sub + '</p>' : '') + '</div>' + (right || '') + '</header>';
  }

  /* ---------- 0. Chat ---------- */
  function pChat(){
    return '<div class="dx-chat">' +
      '<div class="dx-chat-tb"><span class="dx-segs dx-t"><span>' + ic('user') + '' + L('Build an agent','Crea un agente') + '</span><span class="on">' + ic('brief') + L('Work','Lavoro') + '</span>' + H(0,0,'tr') + '</span>' +
        '<span class="dx-chat-r"><span class="dx-pill">' + ic('agents') + L('26 agents','26 agenti') + '</span><span class="dx-bell">' + ic('bell') + '<em>7</em></span></span></div>' +
      '<div class="dx-chat-c">' +
        '<span class="dx-orb">' + ic('compass') + '</span>' +
        '<h4>' + L('Hand me something off your list','Dammi qualcosa dalla tua lista') + '</h4>' +
        '<div class="dx-sugg dx-t">' + (IT ? ['Trova 20 nuovi contatti','Pianifica i post della prossima settimana','Sollecita le fatture non pagate','Report settimanale'] : ['Find 20 new leads','Plan next week&rsquo;s posts','Chase unpaid invoices','Weekly report']).map(function(s){
          return '<span>' + ic('search') + s + ic('arrowdown') + '</span>'; }).join('') + H(0,2,'l') + '</div>' +
        '<div class="dx-comp">' +
          '<div class="dx-comp-in dx-t">' + L('Ask your Coordinator. It hands the job to the right agent.','Chiedi al Coordinatore. Passa il lavoro all’agente giusto.') + '<i class="dx-caret"></i>' + H(0,1,'r') + '</div>' +
          '<div class="dx-comp-bar"><span class="dx-ib">' + ic('plus') + '</span><span class="dx-ib">' + ic('compass') + '</span><span class="dx-sp"></span><span class="dx-ib">' + ic('history') + '</span><span class="dx-ib">' + ic('mic') + '</span><span class="dx-send">' + ic('up') + '</span></div>' +
          '<div class="dx-comp-ft dx-t"><span>' + L('26 agents ready, <a>add more</a>','26 agenti pronti, <a>aggiungine altri</a>') + '</span><span class="dx-avs">' + [4,8,11,15,20,22,23].map(function(i){ return av(i,'xs dot'); }).join('') + '</span>' + H(0,3,'r') + '</div>' +
        '</div>' +
        '<div class="dx-run dx-t"><b>' + L('Running now','In corso') + '</b>' +
          '<span>' + av(4,'xs') + L('Lead Finder <i>12 of 20 leads</i>','Trova Clienti <i>12 contatti su 20</i>') + '<u style="--p:.6"></u></span>' +
          '<span>' + av(8,'xs') + L('Social <i>drafting 3 posts</i>','Social <i>scrive 3 post</i>') + '<u style="--p:.35"></u></span>' +
          '<span>' + av(22,'xs') + L('Email <i>replies sorted</i>','Email <i>risposte smistate</i>') + '<u style="--p:1"></u></span>' + H(0,4,'r') + '</div>' +
      '</div></div>';
  }

  /* ---------- 1. Agents ---------- */
  function pAgents(){
    function card(a, i){
      return '<article class="dx-card" data-d="' + a[1] + '">' +
        '<div class="dx-card-h">' + av(i) + '<div><b>' + e(a[0]) + '</b><span class="dx-st ' + a[3] + (i === 0 ? ' dx-t' : '') + '">' + ST[a[3]] + (i === 0 ? H(1,4,'r') : '') + '</span></div></div>' +
        '<p>' + a[4] + '</p>' +
        '<dl><div><dt>' + L('Schedule','Quando') + '</dt><dd>' + a[5] + '</dd></div><div><dt>' + L('7-day output','Ultimi 7 giorni') + '</dt><dd>' + a[6] + '</dd></div>' +
        '<div><dt>' + L('On','Attivo') + '</dt><dd' + (i === 0 ? ' class="dx-t dx-fit"' : '') + '><span class="dx-tg on"></span>' + (i === 0 ? H(1,3,'r') : '') + '</dd></div><div><dt>' + L('Last activity','Ultima attività') + '</dt><dd>' + a[7] + '</dd></div></dl>' +
      '</article>';
    }
    return ph('agents',L('Your workforce','La tua squadra'),L('Agents','Agenti'),L('Manage and monitor your AI workforce.','Gestisci e controlla la tua squadra di agenti.'),
        '<div class="dx-acts"><span class="dx-btn dx-hm">' + ic('pause') + '' + L('Pause all','Metti tutti in pausa') + '</span><span class="dx-btn pri dx-t">' + ic('plus') + '' + L('New agent','Nuovo agente') + '' + H(1,0,'l') + '</span></div>') +
      '<div class="dx-fil dx-t"><span class="dx-search">' + ic('search') + '' + L('Search agents&hellip;','Cerca agenti&hellip;') + '</span><span class="dx-segs dx-hm">' + L('<span class="on">All</span><span>Scheduled</span><span>Ready</span><span>Paused</span>','<span class="on">Tutti</span><span>Programmati</span><span>Pronti</span><span>In pausa</span>') + '</span>' +
        '<span class="dx-sel dx-hm">' + L('All departments','Tutti i reparti') + ic('down') + '</span><span class="dx-sp"></span><span class="dx-cnt">' + L('26 of 26','26 di 26') + '</span><span class="dx-view dx-hm"><span class="on">' + ic('dash') + '</span><span>' + ic('list') + '</span></span>' + H(1,1,'r') + '</div>' +
      '<div class="dx-chipw dx-t"><div class="dx-chips" role="group" aria-label="' + L('Filter agents by department','Filtra gli agenti per reparto') + '"><button type="button" aria-pressed="true" data-d="-1">' + L('All','Tutti') + ' <i>26</i></button>' +
        DEP.map(function(d, i){ return '<button type="button" aria-pressed="false" data-d="' + i + '"><s style="--c:' + d[1] + '"></s>' + e(i === 4 ? L('Websites','Siti') : d[0]) + ' <i>' + cnt(i) + '</i></button>'; }).join('') +
        '</div>' + H(1,2,'r') + '</div>' +
      '<div class="dx-cards">' + AG.map(card).join('') + '</div>';
  }

  /* ---------- 2. Dashboard ---------- */
  function pDash(){
    function stat(k, v, d, l, s){ return '<div class="dx-stat"><span class="dx-ci">' + ic(k) + '</span><div><b>' + v + '<em>' + d + '</em></b><span>' + l + '</span>' + (s ? '<small>' + s + '</small>' : '') + '</div></div>'; }
    function mini(k, v, l, d, c){ return '<div class="' + c + '">' + ic(k) + '<b>' + v + '</b>' + l + '<em>' + d + '</em></div>'; }
    var REP = [['MR','#6366F1','Marco R.',L('Can we move the delivery to Friday?','Possiamo spostare la consegna a venerdì?'),22,'12 min'],
      ['GP','#E0457B','Giulia P.',L('Do you ship to Milan? Price for two?','Spedite a Milano? Prezzo per due?'),11,'34 min'],
      ['SU','#64748B',L('Supplier','Fornitore'),L('New price list attached, valid from Monday.','Nuovo listino in allegato, valido da lunedì.'),22,'1 h'],
      ['LB','#0EA5B7','Luca B.',L('Called to move his appointment to Tuesday.','Ha chiamato per spostare l’appuntamento a martedì.'),20,'2 h'],
      ['AT','#D49B12','Anna T.',L('4 stars: &ldquo;Fast and kind, a bit pricey.&rdquo;','4 stelle: «Veloci e gentili, un po’ cari.»'),21,'3 h']];
    var PIPE = [[L('New','Nuovi'),148,'+22','#94A3B8'],[L('Qualified','In target'),62,'+9','#6366F1'],[L('Contacted','Contattati'),41,'+12','#2563EB'],[L('Replied','Hanno risposto'),23,'+7','#0EA5B7'],[L('Call booked','Call fissata'),9,'+3','#D49B12'],[L('Won','Chiusi'),4,'+1','#13A06B']];
    return ph('pulse',L('Business and agent operations','Attività e lavoro degli agenti'),'Dashboard',L('Your company, live.','La tua azienda, in tempo reale.'),'<span class="dx-range">' + ic('clock') + '<span class="on">' + L('7d','7 gg') + '</span><span>' + L('30d','30 gg') + '</span></span>') +
      '<section class="dx-box dx-t"><header class="dx-bh"><b>' + L('What your agents got done','Cosa hanno fatto i tuoi agenti') + '</b><span class="dx-mono r">' + L('Last 7 days','Ultimi 7 giorni') + '</span></header><div class="dx-stats">' +
        stat('clock','41 h','+6 h',L('Agents worked','Ore di lavoro degli agenti')) + stat('user','&asymp; 120 h','+18 h',L('Hours saved for you','Ore risparmiate per te')) +
        stat('check','312','+38',L('Tasks finished','Attività finite')) + stat('doc','96','+11',L('Deliverables','Consegne'),L('52 posts · 26 quotes · 18 reports','52 post · 26 preventivi · 18 report')) +
      '</div>' + H(2,0,'tc') + '</section>' +
      '<div class="dx-mini dx-t">' + mini('reply','23',L('People wrote back','Persone che hanno risposto'),'+7','pos') + mini('clock','7',L('Waiting for your yes','In attesa del tuo sì'),'&rarr;','wait') +
        mini('alert','1',L('Agent blocked','Agente bloccato'),'&rarr;','bad') + mini('cal','4',L('Calls booked','Call fissate'),'+2','pos') + H(2,1,'r') + '</div>' +
      '<div class="dx-ins dx-t">' + av(0,'sm') + '<div><span class="dx-mono">' + L('Coordinator · weekly read','Coordinatore · la settimana') + '</span><b>' + L('Quotes go out the same day. One block: the price list is out of date.','I preventivi partono in giornata. Un solo intoppo: il listino è vecchio.') + '</b></div>' +
        '<span class="dx-ins-c"><i>' + ic('trend') + '4</i><i class="w">' + ic('alert') + '1</i></span>' + H(2,2,'r') + '</div>' +
      '<div class="dx-cols">' +
        '<section class="dx-box dx-t"><header class="dx-bh">' + ic('inbox') + '<b>' + L('Replies to answer','Risposte da dare') + '</b><span class="dx-mono">' + L('5 new','5 nuove') + '</span><a class="r">' + L('Open people &rarr;','Apri contatti &rarr;') + '</a></header><ul class="dx-rep">' +
          REP.map(function(r){ return '<li><span class="dx-pp" style="--c:' + r[1] + '">' + r[0] + '</span><div><b>' + r[2] + '</b> ' + av(r[4],'xxs') + '<p>' + r[3] + '</p></div><time>' + r[5] + L(' ago<a>Draft ready</a>',' fa<a>Bozza pronta</a>') + '</time></li>'; }).join('') +
        '</ul>' + H(2,3,'tr') + '</section>' +
        '<section class="dx-box dx-t"><header class="dx-bh">' + ic('crm') + '<b>' + L('Pipeline','Trattative') + '</b><span class="dx-mono">' + L('Lead tracker','Contatti') + '</span><a class="r">' + L('Open CRM &rarr;','Apri CRM &rarr;') + '</a></header><ul class="dx-pipe">' +
          PIPE.map(function(p){ return '<li><span><s style="--c:' + p[3] + '"></s>' + p[0] + '</span><span class="dx-bar"><u style="--w:' + (p[1] / 148).toFixed(3) + ';--c:' + p[3] + '"></u></span><b>' + p[1] + '</b><em>' + p[2] + '</em></li>'; }).join('') +
        '</ul><p class="dx-moves">' + av(6,'xxs') + '' + L('<span><b>2 leads</b> moved to <i>Call booked</i></span><time>18 min ago</time>','<span><b>2 contatti</b> passati a <i>Call fissata</i></span><time>18 min fa</time>') + '</p>' + H(2,4,'tr') + '</section>' +
      '</div>';
  }

  /* ---------- 3. Inbox ---------- */
  function pInbox(){
    function it(x, k){
      var a = AG[x[0]];
      return '<div class="dx-it' + (x[4] ? ' ' + x[4] : '') + (k === 0 ? ' dx-t' : '') + '">' + av(x[0],'sm') + '<div><b>' + x[1] + '</b><span>' + x[2] + '</span><em>' + e(a[0]) + ' · ' + e(DEP[a[1]][0]) + '</em></div><time>' + x[3] + '</time>' + (k === 0 ? H(3,2,'r') : '') + '</div>';
    }
    var ATT = IT ? [[4,'4 email a freddo pronte','In attesa del tuo sì · 4 bozze','08:11','att sel'],[24,'Sollecito per la fattura n. 112','In attesa del tuo sì · 680 €, 15 giorni di ritardo','08:40','att'],[16,'3 varianti di annuncio per i saldi del weekend','In attesa del tuo sì · immagini e testi','09:05','att']]
      : [[4,'4 cold emails ready','Waiting for your yes · 4 drafts','08:11','att sel'],[24,'Reminder for invoice #112','Waiting for your yes · €680, 15 days late','08:40','att'],[16,'3 ad variants for the weekend sale','Waiting for your yes · images and copy','09:05','att']];
    var NEW = IT ? [[8,'Post della prossima settimana pianificati','5 post · 2 caroselli','09:20'],[21,'Risposto a 2 recensioni','Entrambe 5 stelle','09:12'],[22,'Riassunto del mattino','14 email · 2 urgenti','08:00'],
      [12,'Report di ottobre pronto','Copertura +18% · post migliore: il reel di martedì','07:00'],[23,'Preventivo n. 118 pronto','4.200 € + IVA','ven'],[10,'Reel tagliato dal video di martedì','0:34 · con sottotitoli','ven']]
      : [[8,'Next week&rsquo;s posts planned','5 posts · 2 carousels','09:20'],[21,'Replied to 2 reviews','Both 5 stars','09:12'],[22,'Morning summary','14 emails · 2 urgent','08:00'],
      [12,'October report ready','Reach +18% · best post: Tuesday reel','07:00'],[23,'Quote #118 drafted','€4,200 + VAT','Fri'],[10,'Reel cut from Tuesday&rsquo;s video','0:34 · with subtitles','Fri']];
    return '<div class="dx-col">' +
      '<header class="dx-ph"><div><p class="dx-eb">' + ic('inbox') + '' + L('Inbox · operations feed','Da vedere · elenco lavori') + '</p><h3 class="dx-t dx-fit">' + L('7 need you','7 aspettano te') + '' + H(3,0,'tr') + '</h3></div><span class="dx-mark">' + ic('check') + '' + L('Mark all seen','Segna tutto come visto') + '</span></header>' +
      '<div class="dx-fil dx-t"><span class="dx-segs mono">' + L('<span class="on">Recent</span><span>By agent</span><span class="dx-hm">By department</span>','<span class="on">Recenti</span><span>Per agente</span><span class="dx-hm">Per reparto</span>') + '</span><span class="dx-sel">' + L('All agents (26)','Tutti gli agenti (26)') + '' + ic('down') + '</span>' +
        '<span class="dx-sel dx-hm">' + L('All departments','Tutti i reparti') + ic('down') + '</span><span class="dx-sel dx-hm">' + L('All types','Tutti i tipi') + '' + ic('down') + '</span><span class="dx-sp"></span><span class="dx-notify dx-hm"><span class="dx-tg on"></span>' + L('Notify: all','Notifiche: tutte') + '</span>' + H(3,1,'r') + '</div>' +
      '<div class="dx-ibx">' +
        '<div class="dx-feed"><p class="dx-fh att">' + L('&rsaquo; Needs attention','&rsaquo; Da guardare') + ' <i>3</i></p>' + ATT.map(it).join('') + '<p class="dx-fh">' + L('New','Nuovi') + ' <i>24</i></p>' + NEW.map(function(x){ return it(x, 9); }).join('') + '</div>' +
        '<div class="dx-det">' +
          '<div class="dx-det-tb"><span class="dx-btn sm">' + ic('x') + L('Close','Chiudi') + '</span><span class="dx-sp"></span><span class="dx-btn sm dx-hm">' + ic('pause') + '' + L('Pause agent','Metti in pausa') + '</span><span class="dx-btn sm dx-hm">' + ic('copy') + L('Copy','Copia') + '</span><span class="dx-btn sm dx-hm">' + ic('pin') + L('Pin','Fissa') + '</span><span class="dx-btn sm pri">' + L('Next','Avanti') + ic('arrow') + '</span></div>' +
          '<div class="dx-det-c">' +
            '<div class="dx-det-ag">' + av(4) + '<div><b>' + L('Lead Finder','Trova Clienti') + '</b><span class="dx-mono">' + L('Sales','Vendite') + '</span></div></div>' +
            '<h4>' + L('4 cold emails ready','4 email a freddo pronte') + '</h4><p class="dx-mono dx-meta">' + ic('doc') + '' + L('Draft · Oct 31, 2026 · 08:11','Bozza · 31 ott 2026 · 08:11') + '</p>' +
            '<div class="dx-det-txt dx-t"><p>' + L('I found 20 kitchen studios that opened a second showroom this year. These 4 fit best: your usual client size, owner reachable by email.','Ho trovato 20 negozi di cucine che quest’anno hanno aperto un secondo showroom. Questi 4 sono i più adatti: della taglia dei tuoi clienti, con il titolare raggiungibile via email.') + '</p>' +
              '<blockquote>' + L('&ldquo;Hi Laura, congrats on the new showroom. We help kitchen studios answer every quote request the same day&hellip;&rdquo;','«Ciao Laura, complimenti per il nuovo showroom. Aiutiamo i negozi di cucine a rispondere a ogni richiesta di preventivo in giornata&hellip;»') + '</blockquote>' +
              '<p>' + L('3 more drafts below. Approve and I send them at 09:30, or tell me what to change.','Sotto trovi altre 3 bozze. Approva e le mando alle 09:30, o dimmi cosa cambiare.') + '</p>' + H(3,4,'r') + '</div>' +
            '<div class="dx-yes dx-t"><span class="dx-yes-l">' + ic('clock') + '<b>' + L('Waiting for your yes','In attesa del tuo sì') + '</b></span><span class="dx-btn sm">' + L('Drop','Scarta') + '</span><span class="dx-btn sm">' + L('Edit','Modifica') + '</span><span class="dx-btn sm ok">' + ic('check') + '' + L('Approve &amp; send','Approva e invia') + '</span>' + H(3,3,'tl') + '</div>' +
            '<p class="dx-more">' + L('Read the full run &rsaquo;','Leggi tutto il lavoro &rsaquo;') + '</p>' +
          '</div>' +
          '<div class="dx-rep-c dx-t"><div class="dx-rep-tabs"><span class="on">' + ic('chat') + L('Reply','Rispondi') + '</span><span>' + ic('pin') + L('Instruct','Istruzioni') + '</span><span>' + ic('list') + L('Task','Attività') + '</span></div>' +
            '<div class="dx-rep-in">' + L('Ask Lead Finder about this draft&hellip;','Chiedi a Trova Clienti su questa bozza&hellip;') + '<span class="dx-ib">' + ic('mic') + '</span><span class="dx-send">' + ic('up') + '</span></div>' + H(3,5,'r') + '</div>' +
        '</div>' +
      '</div></div>';
  }

  /* ---------- 4. Calendar ---------- */
  function pCal(){
    function m(t, s, brief, k){ return '<div class="dx-mt' + (k ? ' dx-t' : '') + '"><b>' + ic('meet') + t + '</b><span>' + s + (brief ? L(' · <i>brief ready</i>',' · <i>brief pronto</i>') : '') + '</span>' + (k ? H(4,1,'r') : '') + '</div>'; }
    function task(t, s){ return '<div class="dx-mt task"><b><s></s>' + t + '</b><span>' + s + '</span></div>'; }
    function runs(n, list, k, more){
      return '<div class="dx-runs' + (k ? ' dx-t' : '') + '"><p class="dx-runs-h"><span class="dx-stk">' + (list.length ? list : [0,4,22]).slice(0,3).map(function(x){ return av(x[0] === undefined ? x : x[0],'xxs'); }).join('') + '</span>' + n + '<span class="dx-chev">' + ic(list.length ? 'down' : 'right') + '</span></p>' +
        (list.length ? '<ul>' + list.map(function(x){ return '<li>' + av(x[0],'xxs') + '<span>' + e(AG[x[0]][0]) + '</span><em' + (x[1] && x[1].indexOf(':') > 0 ? ' class="nx"' : '') + '>' + (x[1] || L('ran','fatto')) + '</em></li>'; }).join('') + (more ? '<li class="more">' + more + '</li>' : '') + '</ul>' : '') +
        (k ? H(4,2,'r') : '') + '</div>';
    }
    var RAN = L(' ran',' giri');
    var L1 = [[4],[22],[11],[6,'3' + RAN],[19,'4' + RAN],[20],[10],[25,'9' + RAN],[21],[2]];
    var L2 = [[4],[22],[11],[6,'2' + RAN],[14],[15],[16],[19,'3' + RAN],[24],[2]];
    var L3 = [[22],[11],[6],[25,'5' + RAN],[9,'11:00'],[15,'12:00'],[2,'18:00']];
    var D = IT ? [
      ['Lun',26, m('Call con un nuovo cliente','10:00 · 30 min',1,1) + m('Incontro col fornitore','15:00 · 1 h · 3 persone') + runs('14 giri',[])],
      ['Mar',27, m('Visita in showroom','11:00 · 1 h',1) + task('Manda le fatture di ottobre','16:00') + runs('16 giri',[])],
      ['Mer',28, m('Punto col team','09:30 · 30 min') + m('Revisione preventivo','14:00 · 30 min',1) + runs('15 giri',[])],
      ['Gio',29, m('Call di vendita','16:00 · 30 min',1) + runs('17 giri',L1,1,'+7 altri')],
      ['Ven',30, task('Approva gli annunci del weekend','09:00') + m('Commercialista','11:00 · 45 min') + runs('18 giri',L2,0,'+8 altri')],
      ['Sab',31, task('Controlla 4 email a freddo','08:30') + runs('9 giri · 3 in arrivo',L3), 'today'],
      ['Dom',1, '<div class="dx-mt next"><b>' + ic('clock') + 'Social pianifica la prossima settimana</b><span>17:00 · programmato</span></div>' + runs('4 programmati',[])]
    ] : [
      ['Mon',26, m('Call with a new client','10:00 · 30 min',1,1) + m('Supplier meeting','15:00 · 1 h · 3 people') + runs('14 ran',[])],
      ['Tue',27, m('Showroom visit','11:00 · 1 h',1) + task('Send October invoices','16:00') + runs('16 ran',[])],
      ['Wed',28, m('Team check-in','09:30 · 30 min') + m('Quote review','14:00 · 30 min',1) + runs('15 ran',[])],
      ['Thu',29, m('Sales call','16:00 · 30 min',1) + runs('17 ran',L1,1,'+7 more')],
      ['Fri',30, task('Approve weekend ads','09:00') + m('Accountant','11:00 · 45 min') + runs('18 ran',L2,0,'+8 more')],
      ['Sat',31, task('Check 4 cold emails','08:30') + runs('9 ran · 3 next',L3), 'today'],
      ['Sun',1, '<div class="dx-mt next"><b>' + ic('clock') + 'Social plans next week</b><span>17:00 · scheduled</span></div>' + runs('4 scheduled',[])]
    ];
    return '<div class="dx-col">' +
      '<header class="dx-ph"><div><h3>' + L('Calendar','Calendario') + '</h3><p class="dx-sub">' + L('What is planned, your meetings, and when your agents work.','Cosa è in programma, i tuoi incontri e quando lavorano i tuoi agenti.') + '</p></div><span class="dx-btn pri dx-t">' + ic('plus') + L('Plan a job','Programma un lavoro') + H(4,4,'l') + '</span></header>' +
      '<div class="dx-cal-tb"><span class="dx-btn">' + L('Today','Oggi') + '</span><span class="dx-btn ico">' + ic('left') + '</span><span class="dx-btn ico">' + ic('right') + '</span><b>' + L('26 Oct &ndash; 1 Nov 2026','26 ott &ndash; 1 nov 2026') + '</b><span class="dx-sp"></span>' +
        '<span class="dx-segs dx-t">' + L('<span class="on">Week</span><span>Month</span><span>Tasks</span><span>Operations</span>','<span class="on">Settimana</span><span>Mese</span><span>Attività</span><span>Agenti</span>') + '' + H(4,0,'l') + '</span></div>' +
      '<div class="dx-show dx-t"><span class="dx-mono">' + L('Show','Mostra') + '</span><span class="dx-chip"><s style="--c:#2563EB"></s>' + L('Plan','Piano') + '</span><span class="dx-chip"><s style="--c:#64748B"></s>' + L('Meetings','Incontri') + '</span><span class="dx-chip"><s style="--c:#13A06B"></s>' + L('Agents','Agenti') + '</span>' +
        '<span class="dx-sel dx-hm">' + ic('user') + L('Every agent','Tutti gli agenti') + ic('down') + '</span><span class="dx-sp"></span><span class="dx-sel dx-hm">' + L('All departments','Tutti i reparti') + ic('down') + '</span>' + H(4,3,'r') + '</div>' +
      '<div class="dx-week">' + D.map(function(d){ return '<div class="dx-day' + (d[3] ? ' today' : '') + '"><h5>' + d[0] + ' <b>' + d[1] + '</b></h5>' + d[2] + '</div>'; }).join('') + '</div>' +
    '</div>';
  }

  /* ---------- 5. Workflows ---------- */
  function pFlow(){
    var WF = IT ? [['Richiesta di preventivo','5 passi · attivo','#13A06B',1],['Richiamo nuovi contatti','3 agenti · attivo','#13A06B'],['Piano contenuti settimanale','4 agenti · programmato','#2563EB'],
      ['Solleciti fatture non pagate','2 agenti · attivo','#13A06B'],['Risposte alle recensioni','2 agenti · spento',''],['Report del lunedì','3 agenti · programmato','#2563EB'],['Da nuovo ordine a fattura','2 agenti · attivo','#13A06B']]
      : [['Quote request','5 steps · live','#13A06B',1],['New lead follow-up','3 agents · live','#13A06B'],['Weekly content plan','4 agents · scheduled','#2563EB'],
      ['Unpaid invoice chase','2 agents · live','#13A06B'],['Review replies','2 agents · off',''],['Monday report','3 agents · scheduled','#2563EB'],['New order to invoice','2 agents · live','#13A06B']];
    // [icona|agente, titolo, cosa fa, stato, classe, left%, top%]
    var N = IT ? [
      ['bolt','Avvio','Nuova richiesta di preventivo','Partito alle 09:02','trig',1,38],
      [23,'Documenti','Prepara il preventivo','Fatto in 41 s','',21,6],
      ['user','Tu','Approva il preventivo','In attesa del tuo sì','gate',41,46],
      [22,'Email','Lo manda al cliente','Dopo','pend',60,8],
      [6,'Trattative & Preventivi','Sollecita tra 3 giorni','Dopo','pend',79,50]
    ] : [
      ['bolt','Trigger','New quote request','Fired 09:02','trig',1,38],
      [23,'Documents','Draft the quote','Done in 41 s','',21,6],
      ['user','You','Approve the quote','Waiting for your yes','gate',41,46],
      [22,'Email','Send it to the client','Next','pend',60,8],
      [6,'CRM & Quotes','Follow up in 3 days','Next','pend',79,50]
    ];
    function node(n, k){
      var head = typeof n[0] === 'number' ? av(n[0],'xs') : '<span class="dx-av xs" style="--c:' + (n[4] === 'gate' ? '#D97706' : '#64748B') + '">' + ic(n[0]) + '</span>';
      return '<div class="dx-node ' + n[4] + (k === 1 ? ' dx-t' : '') + '" style="left:' + n[5] + '%;top:' + n[6] + '%"><div class="dx-node-h">' + head + '<b>' + e(n[1]) + '</b></div><p>' + n[2] + '</p><em>' + n[3] + '</em>' + (k === 1 ? H(5,0,'tr') : '') + '</div>';
    }
    var LOG = IT ? [['09:02:11','&#9656;','Avvio','nuova richiesta dal modulo del sito',''],['09:02:12','&#9656;','Documenti','avviato da Avvio',''],
      ['09:02:53','&#10003;','Documenti','fatto in 41 s · <u>vedi risultato</u>','hl ok'],['09:02:53','&#8214;','Tu','in attesa del tuo ok','w'],
      ['&mdash;','&middot;','Email','parte dopo il tuo ok','t'],['&mdash;','&middot;','Trattative &amp; Preventivi','sollecito il 3 nov','t']]
      : [['09:02:11','&#9656;','Trigger','new request from website form',''],['09:02:12','&#9656;','Documents','started by Trigger',''],
      ['09:02:53','&#10003;','Documents','done in 41 s · <u>show result</u>','hl ok'],['09:02:53','&#8214;','You','waiting for your yes','w'],
      ['&mdash;','&middot;','Email','sends after your yes','t'],['&mdash;','&middot;','CRM &amp; Quotes','follow-up on Nov 3','t']];
    return '<div class="dx-col">' +
      ph('flow',L('Workflows','Flussi'),L('Workflows','Flussi'),L('Link your agents. When one finishes, the next starts with what it produced.','Collega i tuoi agenti. Quando uno finisce, il successivo parte da quello che ha prodotto.')) +
      '<div class="dx-wf">' +
        '<aside class="dx-wfl dx-t"><div class="dx-wfl-h"><span class="dx-mono">' + L('Your workflows','I tuoi flussi') + '</span><span class="dx-btn sm pri">' + ic('plus') + L('New','Nuovo') + '</span></div>' +
          '<span class="dx-segs sm">' + L('<span class="on">All</span><span>Live</span><span>Scheduled</span><span>Off</span>','<span class="on">Tutti</span><span>Attivi</span><span>Programmati</span><span>Spenti</span>') + '</span>' +
          WF.map(function(w){ return '<div class="dx-wi' + (w[3] ? ' sel' : '') + '" style="--s:' + (w[2] || '#C0C6D0') + '"><b>' + w[0] + '</b><span>' + w[1] + '</span></div>'; }).join('') + H(5,4,'in') + '</aside>' +
        '<div class="dx-wfc">' +
          '<div class="dx-wf-tb"><span class="dx-onoff"><span class="dx-tg on"></span>' + L('On','Attivo') + '</span><span class="dx-trig dx-hm">' + ic('mail') + '' + L('Starts on: new quote request','Parte con: nuova richiesta di preventivo') + '</span><span class="dx-sp"></span>' +
            '<span class="dx-btn sm dx-hm">' + ic('dash') + L('Tidy','Riordina') + '</span><span class="dx-btn sm pri dx-t">' + ic('play') + L('Run now','Avvia ora') + H(5,1,'l') + '</span></div>' +
          '<div class="dx-canvas"><svg class="dx-wires" aria-hidden="true"></svg>' + N.map(node).join('') + '<span class="dx-zoom"><i>+</i><i>&minus;</i><i>86%</i></span></div>' +
          '<div class="dx-log"><div class="dx-log-h"><span class="dx-mono">' + L('&rsaquo;_ Run log · <i class="dx-live"></i>waiting for you','&rsaquo;_ Registro · <i class="dx-live"></i>aspetta te') + '</span><span class="dx-sp"></span><span class="dx-btn sm">' + ic('history') + L('Latest run','Ultimo giro') + '</span></div>' +
            '<div class="dx-log-b"><ol class="dx-t">' + LOG.map(function(l){ return '<li class="' + l[4] + '"><span class="tm">' + l[0] + '</span><span>' + l[1] + '</span><span>' + l[2] + '</span><span>' + l[3] + '</span></li>'; }).join('') + H(5,2,'r') + '</ol>' +
            '<div class="dx-res dx-t"><p class="dx-mono">' + L('Result · Documents · 09:02:53','Risultato · Documenti · 09:02:53') + '</p><h5>' + L('Quote #118','Preventivo n. 118') + '</h5><p class="dx-res-s">' + L('Kitchen · oak · 4 m','Cucina · rovere · 4 m') + '</p>' +
              '' + L('<ul><li><span>Cabinets</span><b>€2,950</b></li><li><span>Worktop</span><b>€780</b></li><li><span>Installation</span><b>€470</b></li><li class="tot"><span>Total + VAT</span><b>€4,200</b></li></ul>','<ul><li><span>Mobili</span><b>2.950 €</b></li><li><span>Piano di lavoro</span><b>780 €</b></li><li><span>Montaggio</span><b>470 €</b></li><li class="tot"><span>Totale + IVA</span><b>4.200 €</b></li></ul>') + '' + H(5,3,'in') + '</div></div>' +
          '</div>' +
        '</div>' +
      '</div></div>';
  }

  /* ---------- 6. Company ---------- */
  function pOrg(){
    var CTX = IT ? ['Obiettivi della settimana','Listino.pdf','Tono di voce','Budget annunci','Kit del brand','Domande frequenti','Firme','Modelli','Accesso agli strumenti']
              : ['Weekly goals','Price list.pdf','Tone of voice','Ad budget','Brand kit','FAQ','Signatures','Templates','Tool access'];
    return '<div class="dx-col">' +
      ph('org',L('Your workforce · company','La tua squadra · azienda'),L('Company','Azienda')) +
      '<div class="dx-tip dx-t"><span class="dx-tip-i">' + ic('plus') + '</span><div>' + L('<b>Give a department its context.</b><span>Attach a price list, a tone guide or files. Every agent in it reads them first.</span>','<b>Dai a ogni reparto il suo contesto.</b><span>Allega un listino, una guida al tono o dei file. Ogni agente del reparto li legge per primi.</span>') + '</div>' + H(6,2,'r') + '</div>' +
      '<div class="dx-org-tb"><span class="dx-mono dx-hm">' + L('26 agents · 9 departments · drag an agent to move it','26 agenti · 9 reparti · trascina un agente per spostarlo') + '</span><span class="dx-sp"></span><span class="dx-btn sm">' + ic('pause') + L('0 paused','0 in pausa') + '</span><span class="dx-btn sm dx-t">' + ic('org') + L('Manage departments','Gestisci reparti') + H(6,3,'l') + '</span></div>' +
      '<div class="dx-org"><div class="dx-org-you dx-t"><span>' + ic('user') + '</span><b>' + L('You','Tu') + '</b><em>' + L('Owner','Titolare') + '</em>' + H(6,0,'r') + '</div><div class="dx-org-cols">' +
        DEP.map(function(d, i){
          return '<div class="dx-dep' + (i === 1 ? ' dx-t' : '') + '" style="--c:' + d[1] + '"><div class="dx-dep-h"><s></s><b>' + e(d[0]) + '</b><i>' + cnt(i) + '</i></div><ul>' +
            AG.map(function(a, j){ return a[1] === i ? '<li>' + av(j,'xxs') + '<span>' + e(a[0]) + '</span></li>' : ''; }).join('') +
            '</ul><span class="dx-ctx">' + ic('clip') + CTX[i] + '</span>' + (i === 1 ? H(6,1,'tr') : '') + '</div>';
        }).join('') +
      '</div><span class="dx-zoom"><i>+</i><i>&minus;</i><i>' + ic('arrow') + '</i></span></div>' +
    '</div>';
  }

  /* ---------- 7. Brain ---------- */
  function pBrain(){
    return '<div class="dx-col">' +
      ph('brain',L('Your brain','Il tuo cervello'),L('Brain','Cervello'),L('What your agents know and produce. They read it before every run.','Quello che i tuoi agenti sanno e producono. Lo leggono prima di ogni lavoro.')) +
      '<nav class="dx-btabs dx-t">' + (IT ? ['Personalizzazione','Contesto generale','Cervello','Competenze','Lezioni','Progetti','File'] : ['Personalization','Global context','Memory','Skills','Learnings','Projects','Files']).map(function(s, j){ return '<span' + (j === 2 ? ' class="on"' : '') + '>' + s + '</span>'; }).join('') + H(7,0,'r') + '</nav>' +
      '<div class="dx-mem">' +
        '<canvas class="dx-cv" role="img" aria-label="' + L('Memory map: thousands of notes and files, coloured by department','Mappa della memoria: migliaia di note e file, colorati per reparto') + '"></canvas>' +
        '<span class="dx-t dx-mspot">' + H(7,1) + '</span>' +
        '<div class="dx-mem-h"><p class="dx-mono"><b>' + ic('spark') + L('Memory','Cervello') + '</b></p><p class="dx-mono">' + L('26 agents · 9 departments · 4,812 notes · 312 files','26 agenti · 9 reparti · 4.812 note · 312 file') + '</p><p class="dx-mono dim">' + L('Point at a dot to see what it is.','Passa su un punto per vedere cos’è.') + '</p></div>' +
        '<div class="dx-msw dx-t"><label class="dx-msearch">' + ic('search') + '<input type="search" placeholder="' + L('Search memory','Cerca nella memoria') + '" aria-label="' + L('Search memory by department or agent','Cerca nella memoria per reparto o agente') + '" autocomplete="off"></label>' + H(7,3,'l') + '</div>' +
        '<div class="dx-mf"><div class="dx-mf-a">' + (IT ? ['Progetti','Sessioni','File','Elementi'] : ['Projects','Sessions','Files','Entities']).map(function(s){ return '<span>' + s + '</span>'; }).join('') + '</div>' +
          '<p class="dx-mono">' + L('Departments','Reparti') + '</p><div class="dx-t"><div class="dx-mf-d" role="group" aria-label="' + L('Show memory by department','Mostra la memoria per reparto') + '">' +
          DEP.map(function(d, i){ return '<button type="button" aria-pressed="false" data-d="' + i + '"><s style="--c:' + d[1] + '"></s>' + e(i === 4 ? L('Websites','Siti') : d[0]) + '</button>'; }).join('') + '</div>' + H(7,4,'r') + '</div></div>' +
        '<ul class="dx-leg"><li><s style="--c:#13A06B"></s>' + L('Entity: people, tools, topics','Elementi: persone, strumenti, argomenti') + '</li><li><s style="--c:#D49B12"></s>' + L('Canon: approved notes','Ufficiali: note approvate') + '</li><li><s style="--c:#5B5BD6"></s>' + L('Report: outputs and briefs','Report: risultati e brief') + '</li><li><s style="--c:#A3AAB6"></s>' + L('Raw: session notes','Grezze: note di lavoro') + '</li></ul>' +
        '<div class="dx-ans" hidden>' + L('<b>&ldquo;What&rsquo;s our refund policy?&rdquo;</b><p>Full refund within 14 days. From the Terms note, approved in March.</p><span class="dx-mono">3 sources · Admin · Customers</span>','<b>«Come funzionano i nostri rimborsi?»</b><p>Rimborso completo entro 14 giorni. Dalla nota Condizioni, approvata a marzo.</p><span class="dx-mono">3 fonti · Amministrazione · Clienti</span>') + '</div>' +
        '<div class="dx-askw dx-t"><button type="button" class="dx-ask" aria-expanded="false"><span class="dx-ask-o">' + ic('compass') + '</span><span class="dx-mono">' + L('Ask your Coordinator','Chiedi al Coordinatore') + '</span></button>' + H(7,2,'r') + '</div>' +
        '<span class="dx-segs sm dx-mode dx-hm"><span class="on">' + L('Classic','Classica') + '</span><span>' + L('Focus','Focus') + '</span></span>' +
        '<span class="dx-tipc" hidden></span>' +
      '</div></div>';
  }

  /* ---------- guscio: barra schede, finestra con sidebar, area centrale, barra agenti ---------- */
  var PANES = [pChat, pAgents, pDash, pInbox, pCal, pFlow, pOrg, pBrain];
  function si(k, label, go, extra){ return '<span class="dx-si"' + (go !== undefined ? ' data-go="' + go + '"' : '') + '>' + ic(k) + label + (extra || '') + '</span>'; }
  root.innerHTML =
    '<div class="dx-panel"><div class="dx-sky" aria-hidden="true"></div>' +
      '<div class="dx-tabsw"><div class="dx-tabs" role="tablist" aria-label="' + L('Parts of the dashboard','Parti della dashboard') + '">' +
        T.map(function(t, i){ return '<button type="button" class="dx-tab" role="tab" id="dxt' + i + '" aria-controls="dxp' + i + '" aria-selected="' + (i ? 'false' : 'true') + '" tabindex="' + (i ? -1 : 0) + '">' + ic(t[1]) + '<span>' + t[0] + '</span></button>'; }).join('') +
      '</div></div>' +
      '<p class="dx-cap" aria-live="polite"></p>' +
      '<div class="dx-frame"><div class="dx-app">' +
        '<aside class="dx-side" aria-hidden="true">' +
          '<div class="dx-ws"><span class="dx-logo">21</span><b>' + L('Your company','La tua azienda') + '</b>' + ic('updown') + ic('panel') + '</div>' +
          si('dash','Dashboard',2) + si('cal',L('Calendar','Calendario'),4) + si('chat','Chat',0) + si('crm','CRM') + si('inbox',L('Inbox','Da vedere'),3,'<em>7</em>') +
          '<small>' + L('Your workforce','La tua squadra') + ic('down') + '</small>' + si('agents',L('Agents','Agenti'),1) + si('flow',L('Workflows','Flussi'),5) + si('org',L('Company','Azienda'),6) + si('market',L('Marketplace','Catalogo')) +
          '<small>' + L('Your brain','Il tuo cervello') + '</small>' + si('brain',L('Brain','Cervello'),7,'<i class="dot"></i>') + si('vault',L('Vault','Archivio'),undefined,'<i class="dot"></i>') +
          '<div class="dx-side-b"><div class="dx-usage">' + ic('bolt') + '<span><i></i></span></div>' +
            si('shield',L('Admin','Amministrazione'),undefined,'<em class="op">' + L('Owner','Titolare') + '</em>') + si('help',L('Help','Aiuto')) + si('gear',L('Settings','Impostazioni')) +
            '<div class="dx-me"><span>' + L('Y','T') + '</span>' + L('You','Tu') + ic('moon') + '</div></div>' +
        '</aside>' +
        '<div class="dx-mbar" aria-hidden="true"><span class="dx-logo">21</span><b>' + L('Your company','La tua azienda') + '</b><span class="dx-mt-t"></span><span class="dx-bell">' + ic('bell') + '<em>7</em></span></div>' +
        '<div class="dx-main">' + PANES.map(function(fn, i){ return '<section class="dx-pane" id="dxp' + i + '" role="tabpanel" aria-labelledby="dxt' + i + '" tabindex="0"' + (i ? ' hidden' : '') + '>' + fn() + '</section>'; }).join('') + '</div>' +
        '<aside class="dx-rail" aria-hidden="true">' + ic('panel') + '<small>' + L('Ready','Pronti') + '</small>' + [0,4,6,8,10,11,15,16,19,20,22,23,24,25].map(function(i){ return av(i,'dot'); }).join('') + '<span class="dx-rail-b">' + ic('sliders') + '</span></aside>' +
        '<div class="dx-spot" hidden></div>' +
        '<div class="dx-pop" role="dialog" aria-labelledby="dxPopT" hidden><div class="dx-pop-h"><b id="dxPopT"></b><span class="dx-pop-n"></span></div><p></p>' +
          '<div class="dx-pop-f"><button type="button" class="dx-pop-x">' + L('Close','Chiudi') + '</button><button type="button" class="dx-pop-nx">' + L('Next','Avanti') + '</button></div></div>' +
      '</div></div>' +
      '<p class="dx-foot"><span class="dx-tag">' + L('Example · sample data','Esempio · dati di prova') + '</span><span>' + L('Every task, every approval, one place.','Ogni lavoro, ogni approvazione, in un solo posto.') + '</span></p>' +
    '</div>';

  var tabs = $$('.dx-tab'), panes = $$('.dx-pane'), cap = $('.dx-cap'), app = $('.dx-app'), main = $('.dx-main'),
      side = $$('.dx-si[data-go]'), mt = $('.dx-mt-t'), spot = $('.dx-spot'), pop = $('.dx-pop'), tabsc = $('.dx-tabs');
  var cur = 0, curHs = null, auto = !RM, timer = 0, vis = false;

  function setCap(i){
    cap.innerHTML = '<b>' + T[i][2] + '</b> <span>' + (IT ? (MOB.matches ? 'Tocca' : 'Clicca') + ' i numeri per vedere a cosa serve ogni parte.' : (MOB.matches ? 'Tap' : 'Click') + ' the numbers to see what each part does.') + '</span>';
    mt.textContent = T[i][0];
    side.forEach(function(s){ s.classList.toggle('on', +s.getAttribute('data-go') === i); });
  }
  function select(i, user){
    if (user) stopAuto();
    if (i === cur) return;
    closePop(true);
    panes[cur].hidden = true;
    tabs.forEach(function(t, n){ t.setAttribute('aria-selected', n === i ? 'true' : 'false'); t.tabIndex = n === i ? 0 : -1; });
    cur = i;
    var p = panes[i]; p.hidden = false;
    if (!RM) { p.classList.remove('in'); void p.offsetWidth; p.classList.add('in'); }
    main.scrollTop = 0;
    setCap(i);
    var t = tabs[i];
    tabsc.scrollTo({ left: t.offsetLeft - (tabsc.clientWidth - t.offsetWidth) / 2, behavior: RM ? 'auto' : 'smooth' });
    if (i === 5) wires();
    brainSync();
    plan();
  }
  tabs.forEach(function(t, i){
    t.addEventListener('click', function(){ select(i, true); });
    t.addEventListener('keydown', function(ev){
      var j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[ev.key];
      if (j === undefined) return;
      ev.preventDefault(); j = (j + tabs.length) % tabs.length; select(j, true); tabs[j].focus();
    });
  });

  /* giro automatico delle schede finché la dashboard è visibile e nessuno la tocca */
  function plan(){
    clearTimeout(timer);
    tabs.forEach(function(t){ t.classList.remove('dx-run'); });
    if (!auto || !vis || document.hidden) return;
    var t = tabs[cur]; void t.offsetWidth; t.classList.add('dx-run');
    timer = setTimeout(function(){ select((cur + 1) % tabs.length, false); }, 9000);
  }
  function stopAuto(){ if (!auto) return; auto = false; plan(); }
  ['pointerdown','keydown','wheel'].forEach(function(ev){ root.addEventListener(ev, stopAuto, { passive: true }); });
  document.addEventListener('visibilitychange', function(){ plan(); brainSync(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function(es){ vis = es[0].isIntersecting; plan(); brainSync(); }, { threshold: .3 }).observe(root);
  } else { vis = true; }

  /* ---------- numeri: riflettore + spiegazione, sempre dentro la finestra ---------- */
  function visibleHs(t, n){
    return $$('.dx-hs[data-t="' + t + '"]').filter(function(b){ return +b.getAttribute('data-n') > n && b.offsetParent; })[0];
  }
  function openPop(b){
    if (curHs) curHs.setAttribute('aria-expanded', 'false');
    curHs = b; b.setAttribute('aria-expanded', 'true');
    var t = +b.getAttribute('data-t'), n = +b.getAttribute('data-n'), notes = T[t][3];
    $('#dxPopT').innerHTML = notes[n][0];
    $('p', pop).innerHTML = notes[n][1];
    $('.dx-pop-n', pop).textContent = (n + 1) + ' / ' + notes.length;
    $('.dx-pop-nx', pop).textContent = visibleHs(t, n) ? L('Next','Avanti') : L('Done','Fatto');
    if (MOB.matches) { // porta il punto in vista nell'area scorrevole, sopra il foglio
      var tr = b.closest('.dx-t').getBoundingClientRect(), mr = main.getBoundingClientRect();
      if (tr.top < mr.top + 8 || tr.bottom > mr.top + mr.height * .55) main.scrollTop += tr.top - mr.top - 16;
    }
    spot.hidden = false; pop.hidden = false;
    place();
    $('.dx-pop-nx', pop).focus({ preventScroll: true });
  }
  function place(){
    if (!curHs) return;
    var a = app.getBoundingClientRect(), r = curHs.closest('.dx-t').getBoundingClientRect(), pad = 5;
    var L = Math.max(r.left - a.left - pad, 4), Tp = Math.max(r.top - a.top - pad, 4);
    var R = Math.min(r.right - a.left + pad, a.width - 4), B = Math.min(r.bottom - a.top + pad, a.height - 4);
    spot.style.cssText = 'left:' + L + 'px;top:' + Tp + 'px;width:' + Math.max(R - L, 20) + 'px;height:' + Math.max(B - Tp, 20) + 'px';
    if (MOB.matches) { pop.style.cssText = ''; return; }
    var pw = pop.offsetWidth, phh = pop.offsetHeight, g = 12;
    var x = Math.min(Math.max((L + R) / 2 - pw / 2, g), a.width - pw - g), y = B + g;
    if (y + phh > a.height - g) y = Tp - phh - g;
    if (y < g) { // bersaglio alto quanto la finestra: accanto, non sopra
      y = Math.min(Math.max((Tp + B) / 2 - phh / 2, g), a.height - phh - g);
      x = R + g + pw < a.width ? R + g : Math.max(L - pw - g, g);
    }
    pop.style.cssText = 'left:' + x + 'px;top:' + y + 'px';
  }
  function closePop(silent){
    if (!curHs) return;
    var b = curHs; curHs = null;
    b.setAttribute('aria-expanded', 'false');
    spot.hidden = true; pop.hidden = true;
    if (!silent) b.focus({ preventScroll: true });
  }
  root.addEventListener('click', function(ev){
    var b = ev.target.closest('.dx-hs');
    if (b) { ev.stopPropagation(); if (b === curHs) closePop(); else openPop(b); return; }
    if (ev.target.closest('.dx-pop-x')) { closePop(); return; }
    if (ev.target.closest('.dx-pop-nx')) {
      var nx = visibleHs(+curHs.getAttribute('data-t'), +curHs.getAttribute('data-n'));
      if (nx) openPop(nx); else closePop();
      return;
    }
    if (curHs && !ev.target.closest('.dx-pop')) closePop(true);
    var go = ev.target.closest('.dx-si[data-go]');
    if (go) select(+go.getAttribute('data-go'), true);
  });
  document.addEventListener('keydown', function(ev){ if (ev.key === 'Escape' && curHs) closePop(); });
  main.addEventListener('scroll', place, { passive: true });

  /* ---------- Agents: filtro per reparto ---------- */
  var chipBtns = $$('.dx-chips button');
  chipBtns.forEach(function(c){
    c.addEventListener('click', function(){
      var d = c.getAttribute('data-d');
      chipBtns.forEach(function(x){ x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
      $$('.dx-card').forEach(function(k){ k.hidden = d !== '-1' && k.getAttribute('data-d') !== d; });
      $('.dx-cnt').textContent = (d === '-1' ? 26 : cnt(+d)) + L(' of 26',' di 26');
    });
  });

  /* ---------- Workflows: fili tra i nodi, ricalcolati sulla misura reale ---------- */
  function wires(){
    var cv = $('.dx-canvas'), svg = $('.dx-wires');
    if (!cv.offsetParent || MOB.matches) { svg.innerHTML = ''; return; }
    var c = cv.getBoundingClientRect(), ns = $$('.dx-node', cv), out = '';
    svg.setAttribute('viewBox', '0 0 ' + c.width + ' ' + c.height);
    for (var i = 0; i < ns.length - 1; i++) {
      var a = ns[i].getBoundingClientRect(), b = ns[i + 1].getBoundingClientRect();
      var x1 = a.right - c.left, y1 = a.top + a.height / 2 - c.top, x2 = b.left - c.left, y2 = b.top + b.height / 2 - c.top, mx = (x1 + x2) / 2;
      out += '<path class="' + (i >= 2 ? 'pend' : '') + '" d="M' + x1 + ' ' + y1 + 'C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2 + '"/><circle cx="' + x2 + '" cy="' + y2 + '" r="2.5"/>';
    }
    svg.innerHTML = out;
  }

  /* ---------- Brain: grafo della memoria in canvas ---------- */
  var B = null;
  var NOTES = IT ? [['Obiettivi della settimana','Piano Q4','Registro decisioni','Report settimanale'],['Contatto: negozio di cucine','Obiezioni sul prezzo','Note della call','Preventivo n. 118'],
    ['Tono di voce','Post: reel di martedì','Set di hashtag','Idee per storie'],['Annuncio concorrente','Budget annunci','Gancio vincente','Test creatività'],
    ['Testi landing page','Scheda prodotto','Correzione checkout','Note SEO'],['Domande frequenti','Risposta a recensione','Riassunto call','Regole prenotazioni'],
    ['Modello email','Firma','Conversazione fornitore','Riassunto del mattino'],['Condizioni & rimborsi','Fattura n. 112','Modello di contratto','Termini di pagamento'],
    ['Allineamento nuovi ordini','Allineamento del foglio','Accesso agli strumenti','Registro giri']]
    : [['Weekly goals','Q4 plan','Decision log','Weekly report'],['Lead: kitchen studio','Price objections','Call notes','Quote #118'],
    ['Tone of voice','Post: Tuesday reel','Hashtag set','Story ideas'],['Competitor ad','Ad budget','Winning hook','Creative test'],
    ['Landing page copy','Product sheet','Checkout fix','SEO notes'],['FAQ','Review reply','Call summary','Booking rules'],
    ['Email template','Signature','Supplier thread','Morning summary'],['Terms & refunds','Invoice #112','Contract template','Payment terms'],
    ['New order sync','Sheet sync','Tool access','Run log']];
  function brainInit(){
    var mem = $('.dx-mem'), cv = $('.dx-cv'), ctx = cv.getContext('2d');
    var seed = 21; function rnd(){ seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    function gau(){ return (rnd() + rnd() + rnd() - 1.5) / 1.5; }
    var N = MOB.matches ? 1500 : 3200, pts = [], hubs = [];
    // ogni reparto: 3 nuclei sparsi su una sfera; i punti grigi sono note grezze sparse
    for (var d = 0; d < 9; d++) for (var k = 0; k < 3; k++) {
      var th = (d / 9) * Math.PI * 2 + k * .7 + rnd() * .4, ph = (rnd() - .5) * 1.6, r = .55 + rnd() * .35;
      hubs.push({ x: Math.cos(th) * Math.cos(ph) * r, y: Math.sin(ph) * r * .9, z: Math.sin(th) * Math.cos(ph) * r, d: d, s: .05 + rnd() * .11 });
    }
    for (var i = 0; i < N; i++) {
      var grey = rnd() < .2, h = hubs[(rnd() * hubs.length) | 0];
      if (grey) pts.push({ x: gau() * 1.1, y: gau() * .8, z: gau() * 1.1, d: -1, h: -1, n: L('Session note','Nota di lavoro') });
      else pts.push({ x: h.x + gau() * h.s, y: h.y + gau() * h.s, z: h.z + gau() * h.s, d: h.d, h: hubs.indexOf(h), n: NOTES[h.d][(rnd() * 4) | 0], l: rnd() < .22 });
    }
    var px = new Float32Array(N), py = new Float32Array(N), hx = new Float32Array(hubs.length), hy = new Float32Array(hubs.length);
    B = { mem: mem, cv: cv, ctx: ctx, pts: pts, hubs: hubs, px: px, py: py, hx: hx, hy: hy, ang: .4, raf: 0, w: 0, h: 0, dpr: 1, focus: -1, tip: $('.dx-tipc') };
    function size(){
      var r = mem.getBoundingClientRect(); if (!r.width) return;
      B.dpr = Math.min(devicePixelRatio || 1, 2); B.w = r.width; B.h = r.height;
      cv.width = Math.round(r.width * B.dpr); cv.height = Math.round(r.height * B.dpr);
      draw();
    }
    B.size = size;
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(mem); else addEventListener('resize', size);
    size();
    mem.addEventListener('pointermove', function(ev){
      if (ev.target.closest('button,input,.dx-hs')) { B.tip.hidden = true; return; }
      var r = mem.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, best = -1, bd = 81;
      for (var i = 0; i < N; i++) { var dx = px[i] - x, dy = py[i] - y, dd = dx * dx + dy * dy; if (dd < bd) { bd = dd; best = i; } }
      if (best < 0) { B.tip.hidden = true; return; }
      var p = pts[best];
      B.tip.textContent = (p.d < 0 ? L('Raw','Grezza') : DEP[p.d][0]) + ' · ' + p.n;
      B.tip.style.left = px[best] + 'px'; B.tip.style.top = py[best] + 'px'; B.tip.hidden = false;
    });
    mem.addEventListener('pointerleave', function(){ B.tip.hidden = true; });
    var dbtn = $$('.dx-mf-d button'), inp = $('.dx-msearch input');
    function setFocus(d){ B.focus = d; dbtn.forEach(function(b){ b.setAttribute('aria-pressed', +b.getAttribute('data-d') === d ? 'true' : 'false'); }); draw(); }
    dbtn.forEach(function(b){ b.addEventListener('click', function(){ var d = +b.getAttribute('data-d'); setFocus(B.focus === d ? -1 : d); }); });
    inp.addEventListener('input', function(){
      var q = inp.value.trim().toLowerCase(), d = -1;
      if (q) { DEP.forEach(function(x, i){ if (d < 0 && x[0].toLowerCase().indexOf(q) >= 0) d = i; });
        if (d < 0) AG.forEach(function(a){ if (d < 0 && a[0].toLowerCase().indexOf(q) >= 0) d = a[1]; }); }
      setFocus(d);
    });
    var ask = $('.dx-ask'), ans = $('.dx-ans');
    ask.addEventListener('click', function(){ ans.hidden = !ans.hidden; ask.setAttribute('aria-expanded', ans.hidden ? 'false' : 'true'); });
  }
  function draw(){
    var b = B, c = b.ctx, W = b.w, Hh = b.h; if (!W) return;
    c.setTransform(b.dpr, 0, 0, b.dpr, 0, 0);
    c.clearRect(0, 0, W, Hh);
    var ca = Math.cos(b.ang), sa = Math.sin(b.ang), cx = W * .54, cy = Hh * .52, R = Math.min(W * .42, Hh * .62), f = 2.6;
    function pr(p, i, ax, ay){ var X = p.x * ca - p.z * sa, Z = p.x * sa + p.z * ca, s = f / (f + Z); ax[i] = cx + X * R * s; ay[i] = cy + p.y * R * s; return s; }
    b.hubs.forEach(function(h, i){ pr(h, i, b.hx, b.hy); });
    var pts = b.pts, n = pts.length, px = b.px, py = b.py, sz = new Float32Array(n), i;
    for (i = 0; i < n; i++) sz[i] = pr(pts[i], i, px, py);
    // fili verso il nucleo, in un solo tratto
    c.beginPath();
    for (i = 0; i < n; i++) if (pts[i].l && (b.focus < 0 || pts[i].d === b.focus)) { c.moveTo(px[i], py[i]); c.lineTo(b.hx[pts[i].h], b.hy[pts[i].h]); }
    c.strokeStyle = 'rgba(100,112,135,.13)'; c.lineWidth = .6; c.stroke();
    // punti raggruppati per colore: un fill per reparto
    for (var g = -1; g < 9; g++) {
      var off = b.focus >= 0 && g !== b.focus;
      c.beginPath();
      for (i = 0; i < n; i++) if (pts[i].d === g) { var s = (g < 0 ? 1.5 : 2.1) * sz[i]; c.rect(px[i] - s / 2, py[i] - s / 2, s, s); }
      c.fillStyle = off ? 'rgba(203,210,220,.55)' : (g < 0 ? 'rgba(150,158,172,.75)' : DEP[g][1]);
      c.fill();
    }
    b.hubs.forEach(function(h, j){
      if (b.focus >= 0 && h.d !== b.focus) return;
      c.beginPath(); c.arc(b.hx[j], b.hy[j], 3.2, 0, 6.283); c.fillStyle = DEP[h.d][1]; c.fill();
    });
  }
  function loop(){ B.ang += .0016; draw(); B.raf = requestAnimationFrame(loop); }
  function brainSync(){
    var on = cur === 7 && vis && !document.hidden;
    if (on && !B) brainInit();
    if (!B) return;
    if (on && !RM && !B.raf) { B.size(); B.raf = requestAnimationFrame(loop); }
    if ((!on || RM) && B.raf) { cancelAnimationFrame(B.raf); B.raf = 0; }
    if (on && RM) B.size();
  }

  var rz = 0;
  addEventListener('resize', function(){ cancelAnimationFrame(rz); rz = requestAnimationFrame(function(){ place(); if (cur === 5) wires(); }); });
  MOB.addEventListener && MOB.addEventListener('change', function(){ closePop(true); setCap(cur); if (cur === 5) wires(); });
  setCap(0);
})();

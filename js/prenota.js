/* Prenotazione della call a passaggi (3 domande -> piano agenti calcolato dal catalogo -> calendario -> conferma).
   Home: modale aperta dai link "Book a call". contatti.html: in pagina, dentro #filtro; il calendario e' #prenota.
   Il catalogo (window.__CATALOGO) lo scrive _agenti/build.py in js/agenti-dati.js.
   Invio: lo stesso di contatti.html (js/calendario.js legge window.__candidatura al momento della conferma). */
(function(){
  var C=window.__CATALOGO;
  if(!C || window.__servizio) return;   /* ?servizio=siti|contenuti|agenti: form breve di contatti.html, come prima */

  var IT=document.documentElement.lang==='it';
  function L(en,it){ return IT?it:en }
  var low=function(t){ return IT?t.charAt(0).toLowerCase()+t.slice(1):t.toLowerCase() };
  var RID=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AG={}; C.agenti.forEach(function(a){ AG[a.slug]=a });
  var euro=function(n){ return IT ? n.toLocaleString('en-GB').replace(/,/g,'.')+'\u00a0€' : '€'+n.toLocaleString('en-GB') };   /* it: 1.490 € (it-IT non separa le migliaia sotto 10.000) */
  var $=function(s,r){ return (r||document).querySelector(s) };
  var $$=function(s,r){ return [].slice.call((r||document).querySelectorAll(s)) };

  /* --- le domande. ag = agenti in ordine di pertinenza (slug di agenti.json) --- */
  var BIZ=[
    {k:'ecommerce', t:'E-commerce', d:L('You sell online','Vendi online'), ag:['e-commerce','funnel-conversioni','ricerca-fornitori','social']},
    {k:'studio', t:L('Professional firm','Studio professionale'), d:L('Accountants, lawyers, consultants','Commercialisti, avvocati, consulenti'), ag:['documenti','riassunti','consigliere','trova-clienti']},
    {k:'locale', t:L('Local services','Servizi locali'), d:L('Clinics, salons, trades, restaurants','Studi medici, saloni, artigiani, ristoranti'), ag:['social','dm-instagram','recensioni','assistenza-telefono']},
    {k:'agenzia', t:L('Agency','Agenzia'), d:L('Marketing, web, creative','Marketing, web, creatività'), ag:['social','video-reel','annunci-concorrenti','siti-landing']},
    {k:'produzione', t:L('Manufacturer','Produzione'), d:L('You make and sell to other businesses','Produci e vendi ad altre aziende'), ag:['trova-clienti','ricerca-fornitori','documenti','offerta-prezzi']},
    {k:'altro', t:L('Other','Altro'), d:L('Something else','Qualcos’altro'), ag:['automazioni','documenti','consigliere']}
  ];
  var NEEDS=[
    {k:'clienti', t:L('Finding new clients','Trovare nuovi clienti'), d:L('Prospects, outreach, follow-ups','Contatti, primi messaggi, ricontatti'), ag:['trova-clienti','vendite-telefono','crm-preventivi']},
    {k:'social', t:L('Social content','Contenuti social'), d:L('Posts, carousels, reels','Post, caroselli, reel'), ag:['social','video-reel','storie-instagram','report-instagram','youtube']},
    {k:'dm', t:L('Instagram DMs','Messaggi Instagram'), d:L('Replies and leads from messages','Risposte e contatti dai messaggi'), ag:['dm-instagram']},
    {k:'ads', t:L('Ads','Pubblicità'), d:L('Meta ads, creatives, competitors','Annunci Meta, grafiche, concorrenti'), ag:['annunci-concorrenti','gestione-ads','creativita-ads']},
    {k:'doc', t:L('Quotes & documents','Preventivi e documenti'), d:L('Quotes, price lists, offers','Preventivi, listini, offerte'), ag:['documenti','crm-preventivi','offerta-prezzi']},
    {k:'support', t:L('Customer calls & support','Telefonate e assistenza clienti'), d:L('Phone, reviews, questions','Telefono, recensioni, domande'), ag:['assistenza-telefono','recensioni']},
    {k:'email', t:L('Email inbox','Email'), d:L('Sorting, drafts, summaries','Smistamento, bozze, riassunti'), ag:['email','riassunti']},
    {k:'pay', t:L('Payments','Pagamenti'), d:L('Invoices and reminders','Fatture e solleciti'), ag:['solleciti-pagamenti','documenti']},
    {k:'web', t:L('Website & e-commerce','Sito ed e-commerce'), d:L('Pages, funnels, online shop','Pagine, funnel, negozio online'), ag:['siti-landing','funnel-conversioni','e-commerce']},
    {k:'all', t:L('The whole company','Tutta l’azienda'), d:L('Every department, one coordinator','Tutti i reparti, un solo coordinatore'), ag:['coordinatore','automazioni','consigliere']}
  ];
  /* valori come nel vecchio questionario, cosi' il foglio delle richieste resta uguale */
  var TEAM=[{k:'Solo io',t:L('Just me','Solo io')},{k:'2-5',t:'2–5'},{k:'6-15',t:'6–15'},{k:'16-50',t:'16–50'},{k:'50+',t:'50+'}];
  var REV=[{k:'<10k',t:L('Under €10k','Meno di 10k €')},{k:'10-50k',t:L('€10k–50k','10–50k €')},{k:'50-200k',t:L('€50k–200k','50–200k €')},{k:'>200k',t:L('Over €200k','Oltre 200k €')},{k:'n.d.',t:L('Rather not say','Preferisco non dirlo')}];
  var PIANI=[{k:'starter',t:'Starter',p:79,n:2},{k:'growth',t:'Growth',p:149,n:5},{k:'scale',t:'Scale',p:299,n:10},{k:'company',t:'Company',p:499,n:C.azienda[0]}];
  var idx=function(list){ var o={}; list.forEach(function(x){ o[x.k]=x }); return o };
  var B=idx(BIZ), N=idx(NEEDS), T=idx(TEAM), V=idx(REV), P_=idx(PIANI);

  /* --- arrivo da una pagina agente o dai Plans (solo valori noti) --- */
  var qs=new URLSearchParams(location.search), PICK={};
  var sa=qs.get('agente'), sp=qs.get('piano');
  if(sa && Object.prototype.hasOwnProperty.call(AG,sa)) PICK.agente=AG[sa];
  else if(sp && Object.prototype.hasOwnProperty.call(P_,sp)) PICK.piano=P_[sp];

  /* --- markup --- */
  function opts(k,list,multi,cls,lab){
    return '<div class="pk-opts '+(cls||'')+'" role="'+(multi?'group':'radiogroup')+'" aria-labelledby="'+lab+'" data-k="'+k+'" data-multi="'+(multi?1:0)+'">'+
      list.map(function(o,i){
        return '<button type="button" class="pk-opt" role="'+(multi?'checkbox':'radio')+'" aria-checked="false" data-v="'+o.k+'"'+(!multi&&i?' tabindex="-1"':'')+'>'+
          '<span class="pk-tick" aria-hidden="true"></span><span><b>'+o.t+'</b>'+(o.d?'<small>'+o.d+'</small>':'')+'</span></button>';
      }).join('')+'</div>';
  }
  var RIGHE=IT?['Leggo le tue risposte…','Confronto il tuo collo di bottiglia con i nostri '+C.agenti.length+' agenti…','Vedo quali sono pronti oggi…','Scelgo il primo agente da cui partire…']
             :['Reading your answers…','Matching your bottleneck to our '+C.agenti.length+' agents…','Checking which ones are ready today…','Picking the first agent to start with…'];
  var MODALE=!document.getElementById('filtro');
  var html=
    '<div class="pk-top"><button type="button" class="pk-back" hidden>'+L('&larr; Back','&larr; Indietro')+'</button><span class="pk-n" aria-live="polite"></span>'+
      (MODALE?'<button type="button" class="pk-x" aria-label="'+L('Close','Chiudi')+'">&times;</button>':'')+'</div>'+
    '<div class="pk-bar" aria-hidden="true"><i></i><i></i><i></i></div>'+
    '<p class="pk-picked" hidden></p>'+
    '<section class="pk-step" data-s="0"><h2 id="pkT0" tabindex="-1">'+L('What best describes your business?','Che attività hai?')+'</h2>'+
      '<p class="pk-sub">'+L('So we know which agents to look at first.','Così sappiamo da quali agenti partire.')+'</p>'+opts('biz',BIZ,false,'','pkT0')+'</section>'+
    '<section class="pk-step" data-s="1"><h2 id="pkT1" tabindex="-1">'+L('What would you hand over to agents?','Cosa daresti in mano agli agenti?')+'</h2>'+
      '<p class="pk-sub">'+L('Pick everything that eats your time. We match it against our ','Scegli tutto ciò che ti ruba tempo. Lo confrontiamo con i nostri ')+''+C.agenti.length+L(' agents.',' agenti.')+'</p>'+opts('needs',NEEDS,true,'','pkT1')+'</section>'+
    '<section class="pk-step" data-s="2"><h2 id="pkT2" tabindex="-1">'+L('A bit about you.','Due parole su di te.')+'</h2>'+
      '<p class="pk-sub">'+L('So the plan fits your size, and we can confirm the call.','Così il piano è su misura e possiamo confermarti la call.')+'</p>'+
      '<div class="pk-grp"><h3 id="pkTeam">'+L('How many people are you?','In quanti siete?')+'</h3>'+opts('team',TEAM,false,'fila','pkTeam')+'</div>'+
      '<div class="pk-grp"><h3 id="pkRev">'+L('Monthly revenue','Fatturato mensile')+'</h3>'+opts('rev',REV,false,'fila','pkRev')+'</div>'+
      '<div class="pk-campi">'+
        '<div class="pk-campo"><label for="pkNome">'+L('Full name *','Nome e cognome *')+'</label><input id="pkNome" autocomplete="name" required></div>'+
        '<div class="pk-campo"><label for="pkEmail">Email *</label><input id="pkEmail" type="email" autocomplete="email" required></div>'+
        '<div class="pk-campo"><label for="pkAzienda">'+L('Company *','Azienda *')+'</label><input id="pkAzienda" autocomplete="organization" required></div>'+
        '<div class="pk-campo"><label for="pkSito">'+L('Website <span>(optional)</span>','Sito <span>(facoltativo)</span>')+'</label><input id="pkSito" autocomplete="url" placeholder="'+L('yoursite.com','tuosito.it')+'"></div>'+
        '<label class="pk-ok"><input type="checkbox" id="pkOk"> '+L('I agree to the processing of my data so you can get back to me. No newsletters, no lists.','Acconsento al trattamento dei dati per essere ricontattato. Niente newsletter, niente liste.')+'</label>'+
      '</div></section>'+
    '<section class="pk-step" data-s="3"><span class="pk-kick pk-bn"></span><h2 id="pkT3" tabindex="-1">'+L('Building your agent plan','Stiamo preparando il tuo piano di agenti')+'</h2>'+
      '<div class="pk-chips"></div><ol class="pk-rows">'+RIGHE.map(function(r){ return '<li><span class="pk-ic" aria-hidden="true"></span><b>'+r+'</b><small></small></li>' }).join('')+'</ol>'+
      '<p class="pk-sr" aria-live="polite" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"></p></section>'+
    '<section class="pk-step pk-res" data-s="4"><span class="pk-kick">'+L('Your agent plan','Il tuo piano di agenti')+'</span><h2 id="pkT4" tabindex="-1"></h2>'+
      '<p class="pk-sub pk-why"></p><ul class="pk-ags"></ul><div class="pk-tot"></div>'+
      '<p class="pk-nota">'+L('Prices from our catalogue, one-off + VAT. We check the plan with you on the call: nothing to pay now.','Prezzi dal nostro catalogo, una tantum + IVA. Rivediamo il piano insieme in call: ora non paghi niente.')+'</p></section>'+
    (MODALE?'<section class="pk-step" data-s="5"><h2 id="pkT5" tabindex="-1">'+L('Pick a time for the call.','Scegli quando fare la call.')+'</h2>'+
      '<p class="pk-sub">'+L('Thirty minutes on Google Meet. We go through your plan together.','Trenta minuti su Google Meet. Guardiamo insieme il tuo piano.')+'</p><div id="prenota">'+
      '<div class="scheda"><div class="passo"><b>01</b><span>'+L('Pick a time','Scegli quando')+'</span><i class="fuso" id="fuso"></i></div>'+
        '<div class="mesi"><button type="button" id="prev" aria-label="'+L('Previous month','Mese precedente')+'">&#8249;</button><b id="mese" aria-live="polite"></b><button type="button" id="next" aria-label="'+L('Next month','Mese successivo')+'">&#8250;</button></div>'+
        '<div class="gg" id="gg"></div><div class="ore" id="ore" hidden><div class="ore-t" id="oreT"></div><div class="slot" id="slot"></div></div>'+
        '<p class="scelto" id="scelto" aria-live="polite">'+L('Calls take <b>30 minutes</b>, on Google Meet.','Le call durano <b>30 minuti</b> e si fanno su Google Meet.')+'</p></div>'+
      '<div class="scheda fatto" id="fatto" hidden tabindex="-1"><span class="kicker">'+L('Call confirmed','Call confermata')+'</span><h2 class="fattoT" id="fattoT"></h2>'+
        '<p class="fattoP">'+L('We&#39;ve sent you a confirmation email with a calendar invite. Not there in a few minutes? Check your spam.','Ti abbiamo mandato la mail di conferma, con l’invito per il calendario. Se non la vedi entro qualche minuto, guarda nello spam.')+'</p>'+
        '<p class="fattoP">'+L('The email has your Google Meet link: just click it at the time. To move or cancel, reply to that email.','Nella mail trovi il link di Google Meet: basta cliccarlo all’ora giusta. Per spostare o disdire, rispondi a quella mail.')+'</p></div>'+
      '<div class="scheda"><div class="passo"><b>02</b><span>'+L('Confirm','Conferma')+'</span></div><form class="campi" id="modulo" novalidate>'+
        '<input type="hidden" id="nome"><input type="hidden" id="azienda"><input type="hidden" id="email"><input type="hidden" id="tel"><input type="hidden" id="sito">'+
        '<input type="hidden" id="persone"><input type="hidden" id="reparto"><input type="hidden" id="tool"><input type="hidden" id="pesa"><input type="checkbox" id="ok" hidden>'+
        '<div class="invia"><button type="submit" class="btn">'+L('Confirm the call &rarr;','Conferma la call &rarr;')+'</button></div><p class="avviso" id="avviso" role="alert"></p></form></div>'+
      '</div></section>':'')+
    '<div class="pk-nav"><p class="pk-err" role="alert"></p><button type="button" class="btn pk-next">'+L('Continue &rarr;','Continua &rarr;')+'</button></div>';

  var pk=document.createElement('div'); pk.className='pk'; pk.innerHTML=html;
  var dlg=null;
  if(MODALE){
    dlg=document.createElement('dialog'); dlg.className='pk-dlg'; dlg.setAttribute('aria-label',L('Book a call','Prenota una call'));
    dlg.appendChild(pk); document.body.appendChild(dlg);
  } else {
    $('#filtro .wrap').appendChild(pk);
  }

  var passi=$$('.pk-step',pk), segs=$$('.pk-bar i',pk), bBack=$('.pk-back',pk), bNext=$('.pk-next',pk),
      lab=$('.pk-n',pk), err=$('.pk-err',pk), cur=0, R={biz:'',needs:[],team:'',rev:''}, PLAN=null, giro=0;

  /* --- "You picked" --- */
  if(PICK.agente||PICK.piano){
    var box=$('.pk-picked',pk), b=document.createElement('b'), l=document.createElement('a');
    box.append(L('You picked: ','Hai scelto: '));
    if(PICK.agente){ b.textContent=PICK.agente.nome+L(' · from ',' · da ')+euro(PICK.agente.prezzo); box.append(b,L(' one-off + VAT',' una tantum + IVA')); l.href='servizi/agenti/'+PICK.agente.slug+'.html' }
    else { b.textContent=PICK.piano.t+' · '+euro(PICK.piano.p)+L('/month','/mese'); box.append(b,L(' + VAT',' + IVA')); l.href='abbonamento.html#plans' }
    l.textContent=L('change','cambia'); box.append(l); box.hidden=false;
  }

  /* --- card selezionabili: click, Spazio/Invio; frecce nei gruppi a scelta singola --- */
  function scegli(g,b){
    var k=g.dataset.k, bs=$$('.pk-opt',g);
    if(g.dataset.multi==='1'){
      b.setAttribute('aria-checked', b.getAttribute('aria-checked')==='true'?'false':'true');
      R[k]=bs.filter(function(x){ return x.getAttribute('aria-checked')==='true' }).map(function(x){ return x.dataset.v });
    } else {
      bs.forEach(function(x){ x.setAttribute('aria-checked',x===b?'true':'false'); x.tabIndex=x===b?0:-1 });
      R[k]=b.dataset.v;
    }
    err.textContent='';
  }
  $$('.pk-opts',pk).forEach(function(g){
    var bs=$$('.pk-opt',g), multi=g.dataset.multi==='1';
    bs.forEach(function(b){
      b.addEventListener('click',function(e){
        scegli(g,b);
        if(g.dataset.k==='biz' && e.detail>0) setTimeout(avanti, RID?0:280);   /* clic col mouse: passa da solo, come nel riferimento */
      });
    });
    if(!multi) g.addEventListener('keydown',function(e){
      var d={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[e.key]; if(!d) return;
      e.preventDefault();
      var n=bs[(bs.indexOf(document.activeElement)+d+bs.length)%bs.length]; scegli(g,n); n.focus();
    });
  });
  if(PICK.agente) NEEDS.forEach(function(n){
    if(n.ag.indexOf(PICK.agente.slug)>=0 && !R.needs.length) scegli($('[data-k="needs"]',pk),$('[data-k="needs"] [data-v="'+n.k+'"]',pk));
  });
  if(PICK.piano && PICK.piano.k==='company') scegli($('[data-k="needs"]',pk),$('[data-k="needs"] [data-v="all"]',pk));

  /* --- validazione --- */
  var val=function(id){ return ($('#'+id,pk).value||'').trim() };
  function manca(i){
    if(i===0 && !R.biz) return [L('Pick the option closest to your business.','Scegli l’opzione più vicina alla tua attività.'),$('[data-k="biz"] .pk-opt',pk)];
    if(i===1 && !R.needs.length) return [L('Pick at least one thing to hand over.','Scegli almeno una cosa da affidare agli agenti.'),$('[data-k="needs"] .pk-opt',pk)];
    if(i===2){
      $$('.pk-campo input',pk).forEach(function(x){ x.removeAttribute('aria-invalid') });
      if(!R.team) return [L('Tell us how many people you are.','Dicci in quanti siete.'),$('[data-k="team"] .pk-opt',pk)];
      if(!R.rev) return [L('Pick a revenue range, or "Rather not say".','Scegli una fascia di fatturato, o «Preferisco non dirlo».'),$('[data-k="rev"] .pk-opt',pk)];
      if(!val('pkNome')) return [L('Add your name.','Scrivi il tuo nome.'),$('#pkNome',pk),1];
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('pkEmail'))) return [L('Add a valid email.','Scrivi un’email valida.'),$('#pkEmail',pk),1];
      if(!val('pkAzienda')) return [L('Add your company name.','Scrivi il nome dell’azienda.'),$('#pkAzienda',pk),1];
      if(!$('#pkOk',pk).checked) return [L('Tick the consent to go on.','Spunta il consenso per andare avanti.'),$('#pkOk',pk)];
    }
    return null;
  }

  /* --- navigazione --- */
  function vai(i,fuoco){
    cur=i;
    passi.forEach(function(p){ p.classList.toggle('on',+p.dataset.s===i) });
    segs.forEach(function(s,n){ s.classList.toggle('on', i>2 || n<=i) });
    lab.textContent = i<3 ? L('Step ','Passo ')+(i+1)+L(' of 3',' di 3') : (i===5 ? L('Pick a time','Scegli quando') : (i===3 ? '' : L('Your plan','Il tuo piano')));
    bBack.hidden = i===0 || i===3;
    bNext.hidden = i===3 || i===5;
    bNext.innerHTML = i===2 ? L('Build my plan &rarr;','Crea il mio piano &rarr;') : (i===4 ? L('Pick a time &rarr;','Scegli quando &rarr;') : L('Continue &rarr;','Continua &rarr;'));
    err.textContent='';
    if(fuoco!==false){
      var h=$('.pk-step.on h2',pk); if(h) h.focus({preventScroll:true});
      if(MODALE) pk.scrollTop=0; else pk.scrollIntoView({behavior:RID?'auto':'smooth',block:'start'});
    }
  }
  function avanti(){
    if(cur<3){
      var m=manca(cur);
      if(m){ err.textContent=m[0]; if(m[2]) m[1].setAttribute('aria-invalid','true'); m[1].focus(); return }
      if(cur===2) return costruisci();
      return vai(cur+1);
    }
    if(cur===4) calendario();
  }
  bNext.addEventListener('click',avanti);
  bBack.addEventListener('click',function(){ vai(cur===4?2:cur-1) });

  /* --- il piano: calcolato davvero dal catalogo, un pezzo per riga dell'animazione --- */
  function punteggi(){
    var s={}, da={};
    R.needs.forEach(function(k,ni){
      N[k].ag.forEach(function(slug,i){ s[slug]=(s[slug]||0)+10-2*i-ni; if(!da[slug]) da[slug]=k });
    });
    B[R.biz].ag.forEach(function(slug,j){ s[slug]=(s[slug]||0)+(s[slug]?3:1)-j*.25 });   /* il tipo di attivita' pesa meno delle scelte */
    if(PICK.agente) s[PICK.agente.slug]=(s[PICK.agente.slug]||0)+100;
    var ord=Object.keys(s).sort(function(a,b){ return s[b]-s[a] || AG[a].prezzo-AG[b].prezzo });
    return {s:s,da:da,ord:ord};
  }
  function piano(M){
    var pronti=M.ord.filter(function(x){ return AG[x].stato==='disponibile' });
    var presto=M.ord.filter(function(x){ return AG[x].stato!=='disponibile' && M.da[x] });
    var tutto=R.needs.indexOf('all')>=0;
    var max=R.needs.length>=3 || tutto ? 4 : 3;
    if(R.team==='Solo io' || R.rev==='<10k') max=Math.max(2,max-1);   /* piccoli: si parte con meno */
    if(PICK.piano) max=Math.min(4,PICK.piano.n);
    var reco=pronti.slice(0,max).map(function(x){ return AG[x] });
    var tot=reco.reduce(function(t,a){ return t+a.prezzo },0);
    /* pack del reparto se costa al massimo il 25% in piu' degli agenti consigliati di quel reparto (e li comprende tutti) */
    var packs=[], visti={};
    reco.forEach(function(a){
      if(visti[a.reparto]) return; visti[a.reparto]=1;
      var qui=reco.filter(function(x){ return x.reparto===a.reparto }), p=C.pack[a.reparto];
      var somma=qui.reduce(function(t,x){ return t+x.prezzo },0);
      if(qui.length>=2 && p && p[2]<=somma*1.25) packs.push({rep:a.reparto_nome,n:p[0],somma:p[1],prezzo:p[2],qui:qui.length,sommaQui:somma});
    });
    var mese=PICK.piano || (tutto ? P_.company : PIANI.filter(function(p){ return p.n>=reco.length })[0]);
    return {reco:reco, pronti:pronti, presto:presto.map(function(x){ return AG[x] }), tot:tot, packs:packs, mese:mese,
            azienda:tutto || R.needs.length>=5, primo:reco[0], M:M};
  }
  function costruisci(){
    var mio=++giro, M=null;
    vai(3);
    var chips=$('.pk-chips',pk), rows=$$('.pk-rows li',pk), bn=$('.pk-bn',pk), sr=$('.pk-sr',pk);
    var voci=[B[R.biz].t].concat(R.needs.map(function(k){ return N[k].t }),[R.team==='Solo io'?T[R.team].t:T[R.team].t+L(' people',' persone'), V[R.rev].t]);
    chips.innerHTML='<span>'+L('Your answers','Le tue risposte')+'</span>';
    voci.forEach(function(t,i){ var c=document.createElement('span'); c.className='pk-chip'; c.style.setProperty('--i',i); c.textContent=t; chips.appendChild(c) });
    rows.forEach(function(li){ li.className=''; $('small',li).textContent='' });
    var lavoro=[
      function(){ return B[R.biz].t+' · '+R.needs.length+(IT?(R.needs.length>1?' aree':' area'):' area'+(R.needs.length>1?'s':''))+' · '+voci[voci.length-2] },
      function(){ M=punteggi(); return M.ord.length+L(' of ',' agenti su ')+C.agenti.length+L(' agents match',' fanno al caso tuo') },
      function(){ PLAN=piano(M); return PLAN.pronti.length+L(' available now',' disponibili subito')+(PLAN.presto.length?', '+PLAN.presto.length+L(' coming soon',' in arrivo'):'') },
      function(){ return L('Start with ','Parti con ')+PLAN.primo.nome }
    ];
    var durate=RID?[150,150,150,150]:[1100,1300,1200,1400];   /* 1,1-1,4 s a riga; con meno movimento quasi subito, stesso risultato */
    (function riga(k){
      if(mio!==giro) return;
      rows[k].className='run'; bn.textContent=L('Step ','Passo ')+(k+1)+L(' of 4 · takes a few seconds',' di 4 · ci vuole qualche secondo');
      setTimeout(function(){
        if(mio!==giro) return;
        var esito=lavoro[k]();
        rows[k].className='done'; $('small',rows[k]).textContent=esito; sr.textContent=RIGHE[k].replace('…','')+': '+esito;
        if(k<3) return riga(k+1);
        setTimeout(function(){ if(mio===giro){ risultato(); vai(4) } }, RID?100:650);
      }, durate[k]);
    })(0);
  }

  function orb(a){
    return '<span class="orb-w" aria-hidden="true"><span class="orb" data-o="'+a.o+'"><svg viewBox="0 0 24 24">'+C.icone[a.reparto]+'</svg></span><b>'+a.sigla+'</b></span>';
  }
  function perche(a){
    var k=PLAN.M.da[a.slug];
    if(PICK.agente && PICK.agente.slug===a.slug) return L('You picked it','L’hai scelto tu')+(k?L(', and it covers ',', e si occupa di ')+low(N[k].t):'')+L('. It’s available now.','. È disponibile subito.');
    if(k) return L('It covers ','Si occupa di ')+low(N[k].t)+(k===R.needs[0]?L(', the first thing on your list,',', la prima cosa della tua lista,'):'')+L(' and it’s available now.',' ed è disponibile subito.');
    return L('It’s the closest fit for ','È il più adatto a ')+(R.biz==='altro'?L('your business','la tua attività'):L('a business like yours (','un’attività come la tua (')+low(B[R.biz].t)+')')+L(' that’s available now.',' tra quelli disponibili subito.');
  }
  function risultato(){
    var p=PLAN;
    $('#pkT4',pk).textContent=L('Start with ','Parti con ')+p.primo.nome+'.';
    $('.pk-why',pk).textContent=perche(p.primo);
    /* niente link alle pagine agente: chi prenota non deve uscire dal flusso */
    $('.pk-ags',pk).innerHTML=p.reco.map(function(a,i){
      return '<li class="pk-ag'+(i?'':' primo')+'">'+orb(a)+'<span class="pk-ag-t"><b>'+a.nome+(i?'':'<span class="pk-badge">'+L('Start here','Parti da qui')+'</span>')+'</b>'+
        '<span>'+a.reparto_nome+(p.M.da[a.slug]?' · '+N[p.M.da[a.slug]].t:'')+'</span></span>'+
        '<span class="pk-ag-p"><small>'+L('from','da')+'</small>'+euro(a.prezzo)+'<small>'+L('one-off','una tantum')+'</small></span></li>';
    }).join('');
    var t=[IT?'<p><b>Questi '+p.reco.length+' agenti: da '+euro(p.tot)+' una tantum + IVA.</b> Installazione e 30 giorni di assistenza inclusi. Poi sono tuoi.</p>'
           :'<p><b>These '+p.reco.length+' agents: from '+euro(p.tot)+' one-off + VAT.</b> Installation and 30 days of support included. Then they’re yours.</p>'];
    p.packs.forEach(function(k){
      if(IT) return t.push('<p><b>Pack '+k.rep+'</b>: tutti gli agenti '+k.rep+' ('+k.n+') a '+euro(k.prezzo)+' invece di '+euro(k.somma)+(k.prezzo<=k.sommaQui?', meno dei '+k.qui+' agenti '+k.rep+' qui sopra presi uno per uno.':', solo '+euro(k.prezzo-k.sommaQui)+' in più dei '+k.qui+' agenti '+k.rep+' qui sopra.')+'</p>');
      t.push('<p><b>'+k.rep+' pack</b>: all '+k.n+' '+k.rep+' agents for '+euro(k.prezzo)+' instead of '+euro(k.somma)+(k.prezzo<=k.sommaQui?', less than the '+k.qui+' '+k.rep+' agents above bought one by one.':', only '+euro(k.prezzo-k.sommaQui)+' more than the '+k.qui+' '+k.rep+' agents above.')+'</p>');
    });
    if(p.azienda) t.push(IT?'<p><b>Azienda completa</b>: tutti i '+C.azienda[0]+' agenti disponibili a '+euro(C.azienda[2])+' invece di '+euro(C.azienda[1])+'.</p>'
                           :'<p><b>Full company</b>: all '+C.azienda[0]+' available agents for '+euro(C.azienda[2])+' instead of '+euro(C.azienda[1])+'.</p>');
    if(p.mese) t.push(IT?'<p>'+(PICK.piano?'Il piano che hai scelto:':'Preferisci pagare al mese?')+' <b>Piano '+p.mese.t+'</b>: '+(p.mese.k==='company'?'tutti i '+p.mese.n+' agenti disponibili':p.mese.n+' agenti a tua scelta')+', '+euro(p.mese.p)+'/mese + IVA, crediti AI inclusi.</p>'
                       :'<p>'+(PICK.piano?'The plan you picked:':'Prefer monthly?')+' <b>Plan '+p.mese.t+'</b>: '+(p.mese.k==='company'?'all '+p.mese.n+' available agents':p.mese.n+' agents of your choice')+', '+euro(p.mese.p)+'/month + VAT, AI credits included.</p>');
    if(p.presto.length) t.push('<p>'+L('Also on your list, coming soon: ','In arrivo, sempre dalla tua lista: ')+p.presto.slice(0,3).map(function(a){ return a.nome }).join(', ')+L('. We’ll tell you on the call when.','. In call ti diciamo quando.')+'</p>');
    $('.pk-tot',pk).innerHTML=t.join('');
    invia(raccogli('candidatura'));   /* come il vecchio questionario: la richiesta arriva anche se poi non si prenota */
  }

  /* --- riepilogo allegato alla richiesta (foglio interno, in italiano come prima) --- */
  function riepilogo(){
    var p=PLAN, r=['[Piano agenti dalla prenotazione a passaggi]',
      'Attività: '+B[R.biz].t,
      'Da affidare agli agenti: '+R.needs.map(function(k){ return N[k].t }).join(', '),
      'Persone: '+R.team+' · Fatturato mensile: '+R.rev];
    if(PICK.agente) r.push('Scelto prima: '+PICK.agente.nome+' · '+euro(PICK.agente.prezzo));
    if(PICK.piano) r.push('Scelto prima: Plan '+PICK.piano.t+' · '+euro(PICK.piano.p)+'/mese');
    if(p){
      r.push('Consigliati: '+p.reco.map(function(a){ return a.nome+' ('+euro(a.prezzo)+')' }).join(', ')+' = '+euro(p.tot));
      r.push('Partire da: '+p.primo.nome);
      p.packs.forEach(function(k){ r.push('Pack: '+k.rep+' '+euro(k.prezzo)+' invece di '+euro(k.somma)) });
      if(p.azienda) r.push('Full company: '+euro(C.azienda[2]));
      if(p.mese) r.push('Mensile: Plan '+p.mese.t+' '+euro(p.mese.p)+'/mese');
      if(p.presto.length) r.push('In arrivo richiesti: '+p.presto.map(function(a){ return a.nome }).join(', '));
    }
    return r.join('\n');
  }
  function raccogli(tipo){
    return {tipo:tipo, quando_inviato:new Date().toISOString(),
      nome:val('pkNome'), azienda:val('pkAzienda'), email:val('pkEmail'), telefono:'', sito:val('pkSito'),
      dimensione:R.team, fatturato:R.rev, fascia:'', aree:R.needs.map(function(k){ return N[k].t }).join(', '), dove:'', quando:'',
      agente:PICK.agente?PICK.agente.slug:(PICK.piano?'piano-'+PICK.piano.k:(PLAN?PLAN.primo.slug:'')),
      racconto:riepilogo(), pagina:location.href};
  }
  function invia(dati){
    if(!(window.CONFIG && CONFIG.ENDPOINT)) return;
    try{ fetch(CONFIG.ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(dati)}).catch(function(){}) }catch(_e){}
  }
  window.__candidatura=function(){ return raccogli('prenotazione') };   /* letto da js/calendario.js alla conferma */

  /* --- calendario: quello di contatti.html (js/calendario.js), col modulo gia' compilato --- */
  function calendario(){
    var set=function(id,v){ var e=document.getElementById(id); if(e) e.value=v };
    set('nome',val('pkNome')); set('azienda',val('pkAzienda')); set('email',val('pkEmail')); set('sito',val('pkSito'));
    set('pesa',riepilogo());
    var ok=document.getElementById('ok'); if(ok) ok.checked=true;
    var mod=document.getElementById('modulo'), come=$('.pk-come',mod);
    if(!come){
      come=document.createElement('p'); come.className='pk-come'; mod.prepend(come);
    }
    come.textContent=L('Booking as ','Prenoti come ');
    var b=document.createElement('b'); b.textContent=val('pkNome'); come.append(b,' · '+val('pkEmail'));
    var e=document.createElement('button'); e.type='button'; e.textContent=L('Edit','Modifica');
    e.addEventListener('click',function(){ indietro(); vai(2) }); come.append(e);
    if(MODALE) return vai(5);
    /* contatti.html: il calendario e' la sezione #prenota sotto, come prima */
    var pren=document.getElementById('prenota'), s=$('.pk-sintesi',pren);
    if(!s){ s=document.createElement('p'); s.className='qagente pk-sintesi'; $('.griglia > div',pren).prepend(s) }
    s.textContent=L('Your plan: ','Il tuo piano: ');
    var bb=document.createElement('b'); bb.textContent=PLAN.reco.map(function(a){ return a.nome }).join(', '); s.append(bb,L(' · start with ',' · parti con ')+PLAN.primo.nome+'.');
    var back=document.createElement('a'); back.href='#filtro'; back.textContent=L('back to your plan','torna al tuo piano');
    back.addEventListener('click',function(ev){ ev.preventDefault(); indietro(); vai(4) }); s.append(' ',back);
    pren.classList.add('da-flusso'); pren.hidden=false; document.getElementById('filtro').hidden=true;
    setTimeout(function(){ pren.scrollIntoView({behavior:RID?'auto':'smooth',block:'start'}); var h=$('.scheda .passo span',pren); if(h){ h.tabIndex=-1; h.focus({preventScroll:true}) } },60);
  }
  function indietro(){
    if(MODALE) return;
    document.getElementById('prenota').hidden=true; document.getElementById('filtro').hidden=false;
  }
  /* dopo la conferma: niente piu' "Back", focus sul messaggio */
  var mod0=document.getElementById('modulo');
  function dopoConferma(){
    setTimeout(function(){
      var f=document.getElementById('fatto'); if(!f || f.hidden) return;
      bBack.hidden=true; lab.textContent=L('Booked','Prenotata'); f.tabIndex=-1; f.focus({preventScroll:true});
      var h=$('#pkT5',pk); if(h){ h.textContent=L('You\u2019re booked.','Call prenotata.'); h.nextElementSibling.hidden=true }
    },0);
  }
  if(mod0) mod0.addEventListener('submit',dopoConferma);

  /* --- apertura --- */
  if(!MODALE){ vai(0,false); return }
  vai(0,false);
  var da=null;
  function apri(origine){
    da=origine; dlg.showModal();
    var h=$('.pk-step.on h2',pk); if(h) h.focus({preventScroll:true});
  }
  $('.pk-x',pk).addEventListener('click',function(){ dlg.close() });
  dlg.addEventListener('close',function(){ if(da) da.focus({preventScroll:true}) });
  dlg.addEventListener('click',function(e){ if(e.target===dlg) dlg.close() });   /* clic fuori dal pannello */
  document.addEventListener('click',function(e){
    var a=e.target.closest && e.target.closest('a[href="contatti.html"]');
    if(!a || !/book a call|prenota una call/i.test(a.textContent) || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    e.preventDefault(); apri(a);
  });
})();

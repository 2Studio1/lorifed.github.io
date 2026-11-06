/* Calendario e invio della prenotazione (spostato da contatti.html, invariato): usato da contatti.html e dalla modale della home.
   I dati del questionario li legge da window.__candidatura (js/prenota.js). */
var CONFIG = {
  /* Dove finiscono le risposte.
     Incolla qui l'indirizzo della tua Google Apps Script (vedi salva-candidature.gs).
     Finche' e' vuoto, il questionario funziona ma non salva niente. */
  ENDPOINT: 'https://script.google.com/macros/s/AKfycbwvZmN4pDdJT-BgURPGF16nSZQ00MFxsesp6frowS91j8dtU08DSyGzVIJJtRb3fXvbNQ/exec'
};
/* Italiano sulle pagine it/ (lang="it"). Le landing italiane (?servizio=siti|contenuti) restano in italiano: i testi fissi hanno data-it. */
window.__IT=document.documentElement.lang==='it' || (!/[?&]agente=/.test(location.search) && /[?&]servizio=(siti|contenuti)/.test(location.search));
(function(){
  var IT=window.__IT;
  var MESI=IT?['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre']
             :['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DOW=IT?['lun','mar','mer','gio','ven','sab','dom']:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var ORE=(function(){var a=[],m=14*60+30;for(;m<=19*60;m+=30){a.push(('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2))}return a})();
  var oggi=new Date(); oggi.setHours(0,0,0,0);
  var limite=new Date(oggi.getTime()+60*86400000);
  var vista=new Date(oggi.getFullYear(),oggi.getMonth(),1);
  var giorno=null, ora=null;
  var gg=document.getElementById('gg'), mese=document.getElementById('mese');
  var prev=document.getElementById('prev'), next=document.getElementById('next');
  var ore=document.getElementById('ore'), oreT=document.getElementById('oreT'), slot=document.getElementById('slot');
  var scelto=document.getElementById('scelto'), avviso=document.getElementById('avviso');
  try{ document.getElementById('fuso').textContent=Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_',' '); }catch(e){}

  function libero(d){ var w=d.getDay(); return w!==0 && w!==6 && d>oggi && d<limite }

  function disegna(){
    mese.textContent=MESI[vista.getMonth()]+' '+vista.getFullYear();
    prev.disabled = vista<=new Date(oggi.getFullYear(),oggi.getMonth(),1);
    next.disabled = vista>=new Date(limite.getFullYear(),limite.getMonth(),1);
    gg.innerHTML='';
    DOW.forEach(function(d){ var s=document.createElement('div'); s.className='dow'; s.textContent=d; gg.appendChild(s) });
    var primo=new Date(vista.getFullYear(),vista.getMonth(),1);
    var salta=(primo.getDay()+6)%7;
    for(var i=0;i<salta;i++){ var v=document.createElement('div'); v.className='vuoto'; gg.appendChild(v) }
    var ultimo=new Date(vista.getFullYear(),vista.getMonth()+1,0).getDate();
    for(var n=1;n<=ultimo;n++){
      var d=new Date(vista.getFullYear(),vista.getMonth(),n);
      var b=document.createElement('button'); b.type='button'; b.textContent=n;
      if(!libero(d)) b.disabled=true;
      if(giorno && d.getTime()===giorno.getTime()) b.className='on';
      b.addEventListener('click',(function(dd){return function(){ giorno=dd; ora=null; disegna(); mostraOre() }})(d));
      gg.appendChild(b);
    }
  }
  function mostraOre(){
    if(!giorno){ ore.hidden=true; return }
    ore.hidden=false;
    oreT.textContent=giorno.getDate()+' '+MESI[giorno.getMonth()]+(IT?' \u00b7 scegli un orario':' \u00b7 pick a time');
    slot.innerHTML='';
    ORE.forEach(function(h){
      var b=document.createElement('button'); b.type='button'; b.textContent=h;
      if(ora===h) b.className='on';
      b.addEventListener('click',function(){ ora=h; mostraOre() });
      slot.appendChild(b);
    });
    riepilogo();
  }
  function riepilogo(){
    if(IT) scelto.innerHTML = giorno&&ora ? 'Hai scelto <b>'+giorno.getDate()+' '+MESI[giorno.getMonth()]+', ore '+ora+'</b>. Trenta minuti, su Google Meet.' : 'Le call durano <b>30 minuti</b> e si fanno su Google Meet.';
    else scelto.innerHTML = giorno&&ora ? 'You picked <b>'+MESI[giorno.getMonth()]+' '+giorno.getDate()+', '+ora+'</b>. Thirty minutes, on Google Meet.' : 'Calls take <b>30 minutes</b>, on Google Meet.';
  }
  prev.addEventListener('click',function(){ vista=new Date(vista.getFullYear(),vista.getMonth()-1,1); disegna() });
  next.addEventListener('click',function(){ vista=new Date(vista.getFullYear(),vista.getMonth()+1,1); disegna() });
  disegna();

  document.getElementById('modulo').addEventListener('submit',function(e){
    e.preventDefault();
    var v=function(id){ return (document.getElementById(id).value||'').trim() };
    if(!giorno||!ora){ avviso.textContent=IT?'Scegli prima il giorno e l’orario qui sopra.':'Pick a day and a time above first.'; return }
    if(!v('nome')||!v('azienda')||!v('email')||!v('pesa')||!document.getElementById('ok').checked){
      avviso.textContent=IT?'Mancano i campi con l’asterisco, o il consenso.':'Fill in the fields marked * and tick the consent.'; return }

    var quando=giorno.getDate()+' '+MESI[giorno.getMonth()]+' '+giorno.getFullYear()+', ore '+ora;
    var due=function(n){ return (n<10?'0':'')+n };
    var iso=giorno.getFullYear()+'-'+due(giorno.getMonth()+1)+'-'+due(giorno.getDate())+'T'+ora+':00';

    var q=(window.__candidatura?window.__candidatura():{})||{};
    var sv=window.__servizio;
    if(sv){   /* form breve: solo i campi visibili, l'etichetta dice "Servizio" */
      var extra=[].slice.call(document.querySelectorAll('#modulo [data-sv]:not([hidden])')).map(function(c){
        var x=c.querySelector('input,select'), t=(x.value||'').trim();
        return t ? c.querySelector('label').textContent.replace(' *','')+': '+t : '';
      }).filter(Boolean).join('\n');
      q={aree:sv.nome, agente:sv.slug, dimensione:'',
         racconto:'[Servizio richiesto: '+sv.nome+']\n'+(extra?extra+'\n\n':'')+v('pesa')};
    }
    var dati={
      tipo:'prenotazione', slot:quando, slotISO:iso,
      quando_inviato:new Date().toISOString(),
      nome:v('nome'), azienda:v('azienda'), email:v('email'),
      telefono:v('tel'), sito:v('sito'),
      dimensione:sv?'':(q.dimensione||v('persone')), fatturato:q.fatturato||'',
      fascia:q.fascia||'',
      aree:q.aree||v('reparto'), dove:'', quando:q.quando||'',
      agente:q.agente||'',
      racconto:(q.racconto||v('pesa'))+(!sv&&v('tool')?('\n\nStrumenti in uso: '+v('tool')):''),
      pagina:location.href
    };

    var bottone=document.querySelector('#modulo .invia .btn');
    if(bottone){ bottone.disabled=true; bottone.textContent=IT?'Fatto':'Done'; }
    avviso.textContent='';

    /* parte in sottofondo: la conferma a schermo non aspetta il server */
    if(window.CONFIG && CONFIG.ENDPOINT){
      var corpo=JSON.stringify(dati), spedito=false;
      try{
        if(navigator.sendBeacon){
          spedito=navigator.sendBeacon(CONFIG.ENDPOINT,
            new Blob([corpo],{type:'text/plain;charset=utf-8'}));
        }
      }catch(_e){}
      if(!spedito){
        try{
          fetch(CONFIG.ENDPOINT,{method:'POST',mode:'no-cors',keepalive:true,
            headers:{'Content-Type':'text/plain;charset=utf-8'},
            body:corpo}).catch(function(){});
        }catch(_e2){}
      }
    }

    var f=document.getElementById('fatto');
    if(f){
      document.getElementById('fattoT').textContent=IT?'Ci vediamo il '+quando+'.':'See you on '+MESI[giorno.getMonth()]+' '+giorno.getDate()+', '+ora+'.';
      [].slice.call(document.querySelectorAll('#prenota .scheda')).forEach(function(x){
        if(x.id!=='fatto') x.hidden=true;
      });
      f.hidden=false;
      f.scrollIntoView({behavior:'smooth',block:'start'});
    }
  });
})();

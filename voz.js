'use strict';
/* Dictado de una sola consulta. No se inicia al cargar ni se envía el texto automáticamente. */
(()=>{
 const boton=document.querySelector('#dictar-consulta');
 const campo=document.querySelector('#chat-texto');
 const estado=document.querySelector('#voz-estado');
 const panel=document.querySelector('#chat-panel');
 const idioma=document.querySelector('#idioma-web');
 const API=window.SpeechRecognition||window.webkitSpeechRecognition;
 const textos={
  listo:['Pulsa Dictar para escribir con tu voz. Revisa el texto antes de enviarlo.','Press Dictate to write with your voice. Review the text before sending.'],
  dictar:['🎙 Dictar','🎙 Dictate'], detener:['■ Detener dictado','■ Stop dictation'],
  iniciando:['Preparando el micrófono… Si se solicita, permite su uso para dictar.','Preparing the microphone… If prompted, allow it to dictate.'],
  escuchando:['Escuchando… Habla ahora. Pulsa Detener dictado para terminar.','Listening… Speak now. Press Stop dictation to finish.'],
  terminando:['Terminando el dictado…','Finishing dictation…'],
  recibido:['Texto añadido. Revísalo y pulsa Enviar cuando quieras.','Text added. Review it and press Send when ready.'],
  limite:['Se ha alcanzado el límite de 220 caracteres. Revisa el texto antes de enviarlo.','The 220-character limit was reached. Review the text before sending.'],
  lleno:['El campo ya tiene 220 caracteres. Quita texto antes de dictar.','The field already has 220 characters. Remove some text before dictating.'],
  vacio:['No se ha reconocido ninguna palabra. Inténtalo de nuevo o escribe tu consulta.','No words were recognized. Try again or type your question.'],
  permiso:['No se ha permitido el micrófono o el servicio de voz. Puedes escribir tu consulta. Revisa los permisos del sitio si quieres reintentarlo.','The microphone or speech service was not allowed. You can type your question. Check site permissions if you want to try again.'],
  red:['No se pudo conectar con el servicio de voz. Comprueba tu conexión o escribe tu consulta.','The speech service could not connect. Check your connection or type your question.'],
  micro:['No se encuentra un micrófono disponible. Puedes escribir tu consulta.','No microphone is available. You can type your question.'],
  idioma:['El servicio no admite este idioma. Puedes escribir tu consulta.','The service does not support this language. You can type your question.'],
  error:['No se pudo iniciar o completar el dictado. Puedes reintentarlo o escribir tu consulta.','Dictation could not start or finish. You can try again or type your question.'],
  cancelado:['Dictado detenido. Puedes revisar el texto o seguir escribiendo.','Dictation stopped. You can review the text or keep typing.'],
  incompatible:['Este navegador no admite el dictado de la web. Puedes escribir o usar el micrófono del teclado del móvil.','This browser does not support web dictation. You can type or use your mobile keyboard microphone.'],
  seguro:['Para dictar, abre la web publicada con HTTPS. Mientras tanto puedes escribir tu consulta.','To dictate, open the published website using HTTPS. You can type your question meanwhile.']
 };
 const en=()=>document.documentElement.lang==='en';
 const texto=clave=>textos[clave][en()?1:0];
 // Añadimos el vocabulario al mismo traductor que ya utiliza la web.
 if(typeof traducciones!=='undefined'){
  Object.values(textos).forEach(([es,eng])=>traducciones.set(es,eng));
  traducciones.set('Solo se activa al pulsar Dictar y permitir el micrófono. El navegador puede enviar el audio a su servicio de reconocimiento. Esta web no guarda grabaciones.','Only activated when you press Dictate and allow the microphone. Your browser may send audio to its recognition service. This website does not store recordings.');
  traducciones.set('Chat simulado: no conecta con el hotel. Las respuestas se generan en esta página; el dictado puede usar un servicio externo.','Simulated chat: not connected to the hotel. Replies are generated on this page; dictation may use an external service.');
 }
 let actual=null,claveEstado='listo';
 const disponible=!!API&&window.isSecureContext;
 function pintar(){
  boton.disabled=!disponible;
  boton.textContent=texto(actual?'detener':'dictar');
  boton.setAttribute('aria-pressed',String(!!actual));
  estado.textContent=texto(claveEstado);
 }
 function avisar(clave){claveEstado=clave;pintar()}
 function cancelar(){
  if(!actual)return;
  const sesion=actual;actual=null;
  // Se ignoran resultados tardíos después de cerrar el chat o cancelar.
  try{sesion.rec.abort()}catch(e){}
  avisar('cancelado');
 }
 if(!API)claveEstado='incompatible';else if(!window.isSecureContext)claveEstado='seguro';
 boton.addEventListener('click',()=>{
  if(actual){
   if(actual.fase==='iniciando'){cancelar();return}
   actual.fase='terminando';avisar('terminando');
   try{actual.rec.stop()}catch(e){cancelar()}
   return;
  }
  if(!disponible)return;
  if(campo.value.length>=220){avisar('lleno');return}
  try{
   const rec=new API();
   const sesion={rec,base:campo.value,fase:'iniciando',resultado:false,fallo:false};
   rec.lang=en()?'en-GB':'es-ES';rec.continuous=false;rec.interimResults=false;rec.maxAlternatives=1;
   rec.onstart=()=>{if(actual!==sesion)return;sesion.fase='escuchando';avisar('escuchando')};
   rec.onresult=evento=>{
    if(actual!==sesion)return;
    let palabras='';
    for(let i=0;i<evento.results.length;i++)if(evento.results[i].isFinal)palabras+=evento.results[i][0].transcript+' ';
    palabras=palabras.trim();if(!palabras)return;
    const contenido=sesion.base+(sesion.base&&!/\s$/.test(sesion.base)?' ':'')+palabras;
    campo.value=contenido.slice(0,220);
    campo.dispatchEvent(new Event('input',{bubbles:true}));
    sesion.resultado=true;avisar(contenido.length>220?'limite':'recibido');
   };
   rec.onerror=evento=>{
    if(actual!==sesion)return;
    sesion.fallo=true;
    const errores={'not-allowed':'permiso','service-not-allowed':'permiso','network':'red','audio-capture':'micro','no-speech':'vacio','language-not-supported':'idioma','aborted':'cancelado'};
    avisar(errores[evento.error]||'error');
   };
   rec.onend=()=>{
    if(actual!==sesion)return;
    actual=null;
    if(!sesion.resultado&&!sesion.fallo)claveEstado='vacio';
    pintar();
   };
   actual=sesion;avisar('iniciando');rec.start();
  }catch(e){actual=null;avisar(e.name==='NotAllowedError'?'permiso':'error')}
 });
 // El envío por teclado o botón es siempre una acción separada del dictado.
 document.querySelector('#chat-form').addEventListener('submit',cancelar);
 campo.addEventListener('input',evento=>{if(evento.isTrusted)cancelar()});
 idioma.addEventListener('change',()=>{cancelar();pintar()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelar()});
 new MutationObserver(()=>{if(panel.hidden)cancelar()}).observe(panel,{attributes:true,attributeFilter:['hidden']});
 pintar();
 if(typeof traducirPagina==='function')traducirPagina();
})();

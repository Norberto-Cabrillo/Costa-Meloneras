
'use strict';
// Solo se guardan identificadores de experiencias. No se guardan datos de contacto.
(()=>{
const claveAgenda='costa-agenda-v1';
const experiencias=['Piscinas y jardines','Sabores para descubrir','Un momento en Om Spa'];
const english=['Pools and gardens','Flavours to discover','A moment at Om Spa'];
let agenda=[];
try{const data=JSON.parse(localStorage.getItem(claveAgenda)||'[]');if(Array.isArray(data))agenda=[...new Set(data.filter(n=>Number.isInteger(n)&&n>=0&&n<experiencias.length))];}catch(e){}
const lista=document.querySelector('#agenda-lista'),estado=document.querySelector('#agenda-estado');
const en=()=>document.documentElement.lang==='en';
function guardar(){try{localStorage.setItem(claveAgenda,JSON.stringify(agenda));return true}catch(e){estado.textContent=en()?'Storage unavailable: this list lasts until you close the page.':'Almacenamiento no disponible: la agenda dura solo mientras esté abierta esta página.';return false}}
function pintar(){lista.replaceChildren();document.querySelector('#agenda-vacia').hidden=agenda.length>0;
agenda.forEach(id=>{const li=document.createElement('li'),nombre=document.createElement('span'),boton=document.createElement('button');nombre.textContent=(en()?english:experiencias)[id];boton.type='button';boton.textContent=en()?'Remove':'Quitar';boton.setAttribute('aria-label',(en()?'Remove ':'Quitar ')+nombre.textContent);boton.addEventListener('click',()=>{agenda=agenda.filter(n=>n!==id);estado.textContent=en()?'Experience removed.':'Experiencia eliminada.';guardar();pintar();const siguiente=lista.querySelector('button');(siguiente||document.querySelector('#mi-agenda a')).focus()});li.append(nombre,boton);lista.append(li)});
document.querySelectorAll('.guardar-experiencia').forEach((b,id)=>{b.textContent=agenda.includes(id)?(en()?'Saved in my agenda':'Guardado en mi agenda'):(en()?'Save to my agenda':'Guardar en mi agenda');b.setAttribute('aria-pressed',String(agenda.includes(id)))});
}
document.querySelectorAll('#servicios .tarjeta').forEach((tarjeta,id)=>{const b=document.createElement('button');b.type='button';b.className='guardar-experiencia';b.addEventListener('click',()=>{if(!agenda.includes(id)){agenda.push(id);estado.textContent=en()?'Experience saved.':'Experiencia guardada.';guardar();pintar()}});tarjeta.append(b)});
document.querySelector('#idioma-web').addEventListener('change',pintar);
const traduccionesApp=[['Mi estancia','My stay'],['Tu agenda de experiencias.','Your experience agenda.'],['Guarda las ideas que te apetece disfrutar. Esta lista no realiza reservas ni confirma disponibilidad.','Save ideas for your stay. This list does not make bookings or confirm availability.'],['La agenda se guarda en este navegador. Puedes quitar cada experiencia cuando quieras.','Your agenda is stored in this browser. You can remove experiences at any time.'],['Todavía no has guardado experiencias. Explora las propuestas del hotel.','You have no saved experiences yet. Explore the hotel ideas.'],['Explorar experiencias','Explore experiences'],['Inicio','Home'],['Explorar','Explore'],['Planificar','Plan'],['Mi agenda','My agenda'],['Mapa','Map'],['Activar sonido','Enable sound'],['Pausar sonido','Pause sound'],['Música en pausa.','Music paused.'],['La música se activa solo con el botón Activar sonido.','Enable music using the Enable sound button.']];
traduccionesApp.forEach(([es,eng])=>traducciones.set(es,eng));
pintar();traducirPagina();
function marcar(){const hash=location.hash||'#inicio';document.querySelectorAll('.app-nav a').forEach(a=>{if(a.hash===hash)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
window.addEventListener('hashchange',marcar);marcar();
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&navegacion.classList.contains('abierto')){navegacion.classList.remove('abierto');menuBoton.setAttribute('aria-expanded','false');menuBoton.focus()}});
})();

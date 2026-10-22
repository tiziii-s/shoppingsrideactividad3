/* Shoppings Ride - JavaScript principal (sin frameworks) */
const SHOPS = [
  {n:1,id:"alto-avellaneda",file:"alto-avellaneda.html",name:"Alto Avellaneda",addr:"Av. General Güemes 897, Avellaneda",lat:-34.6717,lng:-58.3689,hours:"Locales de lunes a domingo de 10:00 a 22:00 hs. La gastronomía puede extender su horario."},
  {n:2,id:"boulevard-adrogue",file:"boulevard-adrogue.html",name:"Boulevard Adrogué",addr:"Brown 700, Adrogué",lat:-34.8003,lng:-58.3963,hours:"Lunes a sábado de 10:00 a 21:00 hs y domingos de 12:00 a 20:00 hs."},
  {n:3,id:"unicenter",file:"unicenter.html",name:"Unicenter",addr:"Paraná 3745, Martínez",lat:-34.5097,lng:-58.5254,hours:"Lunes a domingo de 10:00 a 22:00 hs."},
  {n:4,id:"shopping-caballito",file:"shopping-caballito.html",name:"Shopping Caballito",addr:"Av. Rivadavia 5108, Caballito, CABA",lat:-34.6177,lng:-58.4344,hours:"Lunes a domingo de 10:00 a 22:00 hs."}
];
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = t => String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- Menú móvil ---------- */
const mb = $('#menu-btn'), menu = $('#menu');
if (mb) mb.addEventListener('click', () => {
  const open = menu.classList.toggle('hidden') === false;
  mb.setAttribute('aria-expanded', open);
});

/* ---------- Mapa (Leaflet + OpenStreetMap) ---------- */
function initMapa() {
  const el = $('#mapa');
  if (!el) return;
  if (typeof L === 'undefined') { el.innerHTML = '<p class="p-4 text-sm">No se pudo cargar el mapa. Direcciones: ' + SHOPS.map(s => esc(s.name) + ' (' + esc(s.addr) + ')').join('; ') + '.</p>'; return; }
  const only = el.dataset.shop ? SHOPS.filter(s => s.id === el.dataset.shop) : SHOPS;
  const map = L.map(el, {scrollWheelZoom: false});
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: '&copy; OpenStreetMap'}).addTo(map);
  const pts = [];
  only.forEach(s => {
    const icon = L.divIcon({className: '', html: '<div class="pin">' + s.n + '</div>', iconSize: [30, 30], iconAnchor: [15, 15]});
    L.marker([s.lat, s.lng], {icon, title: s.name, alt: s.name}).addTo(map)
      .bindPopup('<strong>' + esc(s.name) + '</strong><br>' + esc(s.addr) + '<br><a href="' + s.file + '">Ver página</a>');
    pts.push([s.lat, s.lng]);
  });
  if (only.length > 1) {
    L.polyline(pts, {color: '#776005', weight: 3, dashArray: '6 6'}).addTo(map);
    map.fitBounds(pts, {padding: [30, 30]});
  } else map.setView(pts[0], 15);
}
window.addEventListener('load', initMapa);

/* ---------- Validación de formularios ---------- */
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
function setErr(input, msg) {
  const p = $('#e-' + input.id);
  if (p) p.textContent = msg || '';
  if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  return !msg;
}
function validar(form, reglas) {
  let primero = null, ok = true;
  Object.entries(reglas).forEach(([id, fn]) => {
    const inp = $('#' + id), msg = fn(inp.value.trim());
    if (!setErr(inp, msg)) { ok = false; primero = primero || inp; }
  });
  if (primero) primero.focus();
  return ok;
}
function mostrar(el, html) { el.innerHTML = html; el.classList.remove('hidden'); el.focus(); }

/* Contacto (simulado) */
const fc = $('#form-contacto');
if (fc) {
  const rc = {
    'c-nombre': v => v.length < 3 ? 'Ingresá tu nombre (mínimo 3 letras).' : '',
    'c-email': v => !v ? 'Ingresá tu correo electrónico.' : (!emailOk(v) ? 'El correo no es válido. Ejemplo: nombre@correo.com' : ''),
    'c-motivo': v => !v ? 'Elegí el motivo de tu consulta.' : '',
    'c-mensaje': v => v.length < 10 ? 'El mensaje debe tener al menos 10 caracteres.' : ''
  };
  Object.keys(rc).forEach(id => $('#' + id).addEventListener('blur', e => setErr(e.target, rc[id](e.target.value.trim()))));
  fc.addEventListener('submit', e => {
    e.preventDefault();
    if (!validar(fc, rc)) return;
    mostrar($('#c-ok'), '✔ <strong>Consulta enviada (simulación).</strong> Gracias, ' + esc($('#c-nombre').value.trim()) + ': registramos tu consulta sobre «' + esc($('#c-motivo').value) + '». No se envió ningún mensaje real.');
    fc.reset();
  });
}

/* ---------- Reserva / planificación con cálculo y conversión ---------- */
const PAQUETES = {
  'Tarde de compras': {usd: 15, desc: 'Recorrido por un shopping a elección con guía de ofertas y recomendaciones.'},
  'Cine y merienda': {usd: 22, desc: 'Entrada de cine y merienda en el patio de comidas.'},
  'Ruta completa (4 shoppings)': {usd: 45, desc: 'Plan de visita a las cuatro paradas con itinerario sugerido.'}
};
const EXTRAS = {
  estacionamiento: {t: 'Estacionamiento (por visita)', usd: 4, porPersona: false},
  merienda: {t: 'Merienda extra (por persona)', usd: 8, porPersona: true}
};
let TC = {valor: 1400, fuente: 'Valor de referencia estático (no se pudo consultar la API)', fecha: 'sin actualizar', real: false};
const fmtARS = n => n.toLocaleString('es-AR', {style: 'currency', currency: 'ARS'});
const fmtUSD = n => n.toLocaleString('es-AR', {style: 'currency', currency: 'USD'});

async function cargarCambio() {
  try {
    const r = await fetch('https://dolarapi.com/v1/dolares/oficial');
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    if (!d.venta) throw new Error('sin dato');
    TC = {valor: Number(d.venta), fuente: 'DolarAPI.com (dólar oficial, precio de venta)', fecha: new Date(d.fechaActualizacion).toLocaleString('es-AR'), real: true};
  } catch (err) { /* se mantiene el valor de referencia */ }
  calcular();
}

function calcular() {
  const sel = $('#r-paquete'); if (!sel) return null;
  const p = PAQUETES[sel.value], n = parseInt($('#r-personas').value, 10);
  $('#r-desc').textContent = p ? p.desc : '';
  const dl = $('#r-resumen'); dl.innerHTML = '';
  const fila = (a, b) => dl.insertAdjacentHTML('beforeend', '<dt>' + a + '</dt><dd class="text-right">' + b + '</dd>');
  $('#r-cambio').innerHTML = '<strong>Tipo de cambio:</strong> 1 USD = ' + fmtARS(TC.valor) + ' · Fuente: ' + esc(TC.fuente) + ' · Fecha de referencia: ' + esc(TC.fecha) + '.' + (TC.real ? '' : ' <em>Importe estimativo.</em>');
  if (!p || !(n >= 1 && n <= 10)) { fila('Completá el paquete y la cantidad de personas', ''); return null; }
  let total = p.usd * n;
  fila(sel.value + ' (' + fmtUSD(p.usd) + ' x ' + n + ')', fmtUSD(p.usd * n));
  $$('input[name="extra"]:checked').forEach(c => {
    const x = EXTRAS[c.value], sub = x.usd * (x.porPersona ? n : 1);
    total += sub; fila(x.t, fmtUSD(sub));
  });
  fila('<strong>Total en USD</strong>', '<strong>' + fmtUSD(total) + '</strong>');
  fila('<strong>Total en pesos argentinos (ARS)</strong>', '<strong>' + fmtARS(Math.round(total * TC.valor * 100) / 100) + '</strong>');
  return {total, ars: Math.round(total * TC.valor * 100) / 100};
}

const fr = $('#form-reserva');
if (fr) {
  $('#r-paquete').insertAdjacentHTML('beforeend', Object.keys(PAQUETES).map(k => '<option value="' + k + '">' + k + ' (' + fmtUSD(PAQUETES[k].usd) + ' por persona)</option>').join(''));
  $('#r-extras').innerHTML = Object.entries(EXTRAS).map(([k, x]) => '<label class="flex items-center gap-2 text-sm"><input type="checkbox" name="extra" value="' + k + '" class="h-4 w-4"> ' + x.t + ' · ' + fmtUSD(x.usd) + '</label>').join('');
  const hoy = new Date().toISOString().slice(0, 10); $('#r-fecha').min = hoy;
  fr.addEventListener('input', calcular); fr.addEventListener('change', calcular);
  fr.addEventListener('reset', () => setTimeout(() => { $$('.campo', fr).forEach(i => setErr(i, '')); $('#r-ok').classList.add('hidden'); calcular(); }));
  const rr = {
    'r-nombre': v => v.length < 3 ? 'Ingresá tu nombre y apellido.' : '',
    'r-email': v => !v ? 'Ingresá tu correo electrónico.' : (!emailOk(v) ? 'El correo no es válido. Ejemplo: nombre@correo.com' : ''),
    'r-fecha': v => !v ? 'Elegí una fecha.' : (v < hoy ? 'La fecha no puede ser anterior a hoy.' : ''),
    'r-paquete': v => !v ? 'Elegí un paquete.' : '',
    'r-personas': v => (!/^\d+$/.test(v) || +v < 1 || +v > 10) ? 'Ingresá un número entero entre 1 y 10.' : ''
  };
  Object.keys(rr).forEach(id => $('#' + id).addEventListener('blur', e => setErr(e.target, rr[id](e.target.value.trim()))));
  fr.addEventListener('submit', e => {
    e.preventDefault();
    if (!validar(fr, rr)) return;
    const t = calcular();
    const cod = 'SR-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    mostrar($('#r-ok'), '✔ <strong>Solicitud registrada (simulación).</strong> Código ' + cod + '. ' + esc($('#r-nombre').value.trim()) + ', tu visita «' + esc($('#r-paquete').value) + '» para ' + esc($('#r-personas').value) + ' persona(s) el ' + esc($('#r-fecha').value.split('-').reverse().join('/')) + ' suma ' + fmtUSD(t.total) + ' (' + fmtARS(t.ars) + '). No se realizó ningún cobro.');
  });
  calcular(); cargarCambio();
}

/* ---------- Preguntas frecuentes + asistente ---------- */
const FAQ = [
  {q: '¿Qué shoppings incluye el recorrido?', k: ['shopping', 'incluye', 'recorrido', 'paradas', 'cuales'], a: 'Cuatro paradas: Alto Avellaneda, Boulevard Adrogué, Unicenter y Shopping Caballito. Podés visitarlos en cualquier orden.'},
  {q: '¿Cuáles son los horarios?', k: ['horario', 'hora', 'abre', 'cierra', 'abierto', 'domingo'], a: SHOPS.map(s => s.name + ': ' + s.hours).join(' ')},
  {q: '¿Dónde queda cada shopping?', k: ['donde', 'dirección', 'direccion', 'ubicacion', 'ubicación', 'queda', 'calle'], a: SHOPS.map(s => s.name + ': ' + s.addr).join('. ') + '.'},
  {q: '¿Cuál es el más accesible en transporte público?', k: ['subte', 'colectivo', 'transporte', 'tren', 'publico', 'público', 'llegar'], a: 'Shopping Caballito: tiene la línea A de subte y varios colectivos. Los otros también cuentan con transporte público.'},
  {q: '¿Cómo llego en auto?', k: ['auto', 'estacionamiento', 'cochera', 'panamericana', 'estacionar'], a: 'Unicenter tiene acceso directo desde la Panamericana y estacionamiento con espacios para movilidad reducida. En Shopping Caballito el estacionamiento es limitado.'},
  {q: '¿Hay accesibilidad para personas con movilidad reducida?', k: ['accesib', 'movilidad', 'silla', 'rampa', 'ascensor', 'discapacidad'], a: 'Shopping Caballito tiene rampas, ascensores y baños adaptados. Unicenter ofrece estacionamiento para movilidad reducida y Alto Avellaneda cuenta con espacios adaptados.'},
  {q: '¿Hay cine?', k: ['cine', 'pelicula', 'película', 'cartelera', 'funcion', 'función'], a: 'Sí: Alto Avellaneda, Unicenter y Shopping Caballito tienen cine. Conviene consultar la cartelera antes, sobre todo los fines de semana.'},
  {q: '¿Hay descuentos?', k: ['descuento', 'jubilado', 'estudiante', 'promocion', 'promoción', 'oferta'], a: 'Shopping Caballito ofrece descuentos para jubilados y estudiantes durante determinados días de la semana. Consultá los días en el shopping.'},
  {q: '¿Cuál conviene para una tarde tranquila?', k: ['tranquil', 'cafe', 'café', 'arte', 'cultura', 'merienda'], a: 'Boulevard Adrogué: cafeterías, gastronomía artesanal y espacios de arte y cultura.'},
  {q: '¿Cómo se calculan los precios de la visita?', k: ['precio', 'costo', 'dolar', 'dólar', 'pesos', 'cambio', 'cuanto', 'cuánto', 'reserva', 'paquete'], a: 'Los paquetes están en USD y se convierten a pesos con el dólar oficial (DolarAPI.com). Es una simulación: no se cobra nada. Probala en la sección «Armá tu visita» del inicio.'}
];
const faq = $('#faq');
if (faq) faq.innerHTML = FAQ.map(f => '<details class="rounded-2xl bg-white border border-activo p-4"><summary class="cursor-pointer font-bold">' + f.q + '</summary><p class="mt-2 text-sm">' + esc(f.a) + '</p></details>').join('');

const norm = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function responder(txt) {
  const t = norm(txt);
  const shop = SHOPS.find(s => t.includes(norm(s.name).split(' ').pop()) || t.includes(norm(s.name)));
  let mejor = null, max = 0;
  FAQ.forEach(f => { const sc = f.k.filter(k => t.includes(norm(k))).length; if (sc > max) { max = sc; mejor = f; } });
  if (shop && max && /horario|hora|abre|cierra/.test(t)) return shop.name + ': ' + shop.hours;
  if (shop && max && /donde|direccion|queda|ubicacion/.test(t)) return shop.name + ': ' + shop.addr + '.';
  if (mejor) return mejor.a;
  if (shop) return shop.name + ' queda en ' + shop.addr + '. ' + shop.hours + ' Más detalles en su página.';
  return 'No tengo esa información todavía. Probá con horarios, ubicación, transporte, cine, descuentos o precios, o escribinos desde el formulario de contacto.';
}
const cb = $('#chat-btn');
if (cb) {
  const log = $('#chat-log'), inp = $('#chat-in'), box = $('#chat');
  const add = (t, me) => { log.insertAdjacentHTML('beforeend', '<p class="' + (me ? 'ml-8 bg-activo' : 'mr-8 bg-beige') + ' rounded-xl px-3 py-2">' + esc(t) + '</p>'); log.scrollTop = log.scrollHeight; };
  const enviar = t => { t = t.trim(); if (!t) return; add(t, true); setTimeout(() => add(responder(t), false), 250); inp.value = ''; };
  add('¡Hola! Soy el asistente de Shoppings Ride. Preguntame por horarios, ubicación, transporte, cine o descuentos.', false);
  $('#chat-sug').innerHTML = ['¿Horarios?', '¿Cómo llego en subte?', '¿Hay descuentos?'].map(s => '<button type="button" class="rounded-full border border-btn px-3 py-1 text-xs">' + s + '</button>').join('');
  $$('#chat-sug button').forEach(b => b.addEventListener('click', () => enviar(b.textContent)));
  cb.addEventListener('click', () => { const o = box.classList.toggle('hidden') === false; cb.setAttribute('aria-expanded', o); if (o) inp.focus(); });
  $('#chat-send').addEventListener('click', () => enviar(inp.value));
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') enviar(inp.value); if (e.key === 'Escape') { box.classList.add('hidden'); cb.setAttribute('aria-expanded', false); cb.focus(); } });
}

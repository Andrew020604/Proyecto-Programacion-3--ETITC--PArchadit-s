//Constructores
class Evento {
  constructor(Titulo, Categoria, Ubicacion, Descripcion, CuposTotales, CreadoPor) {
    this.Titulo = Titulo;
    this.Categoria = Categoria;
    this.Ubicacion = Ubicacion;
    this.Descripcion = Descripcion;
    this.CuposTotales = CuposTotales;
    this.CuposOcupados = 0;
    this.likes = 0;
    this.comentarios = [];
    this.likesUsuarios= [];
    this.asistentes = [];
    this.CreadoPor = CreadoPor;
  }

DarLike(correo) {
    if (this.likesUsuarios.includes(correo)) {
      return false;   
    }
    this.likes++;
    this.likesUsuarios.push(correo);
    return true;
  }

  unirse(correo) {
    if (this.asistentes.includes(correo)) {
      return 'ya_unido'; 
    }
    if (this.CuposOcupados < this.CuposTotales) {
      this.CuposOcupados++;
      this.asistentes.push(correo);
      return true;
    }
    return false;   
  }
}
class Usuario {
  constructor(nombre, correo, contrasena) {
    this.nombre = nombre;
    this.correo = correo;
    this.contrasena = contrasena;
    this.intereses = [];
  }
}

// Datos en memoria
const eventos = [];
let categoriaActiva = "todos";

const usuarios = [];
let usuarioActual = null;
let modoAuth = "login";

let modofeed="explorar";

const btnParaTi = document.getElementById('btnParaTi');
const btnExplorar = document.getElementById('btnExplorar');

btnParaTi.addEventListener('click',function(){
  if(!usuarioActual){
    mostrarToast('Inicia Sesión para continuar', 'error');
    return;
  }

  modofeed="para ti";
  btnParaTi.classList.add('activar-feed');
  btnExplorar.classList.remove('activar-feed');
  renderFeed();
});

  btnExplorar.addEventListener('click', function () {
    modofeed = "explorar";
    btnExplorar.classList.add('activar-feed');
    btnParaTi.classList.remove('activar-feed');
    renderFeed();
});


function cargarEventos() {
  const datosGuardados = localStorage.getItem('eventos');

  if (datosGuardados) {
    const eventosPlanos = JSON.parse(datosGuardados);

    eventosPlanos.forEach(function (eventoPlano) {
      const eventoReconstruido = new Evento(
        eventoPlano.Titulo,
        eventoPlano.Categoria,
        eventoPlano.Ubicacion,
        eventoPlano.Descripcion,
        eventoPlano.CuposTotales,
        eventoPlano.CreadoPor
      );

   
      eventoReconstruido.CuposOcupados = eventoPlano.CuposOcupados;
      eventoReconstruido.likes = eventoPlano.likes;
      eventoReconstruido.comentarios = eventoPlano.comentarios;
      eventoReconstruido.likesUsuarios = eventoPlano.likesUsuarios || [];
      eventoReconstruido.asistentes = eventoPlano.asistentes || [];
      eventoReconstruido.CreadoPor = eventoPlano.CreadoPor || null;

      eventos.push(eventoReconstruido);
    });
  }
}
function guardarEventos() {
  localStorage.setItem('eventos', JSON.stringify(eventos));
}
function mostrarToast(mensaje, tipo) {
  const toastContainer = document.getElementById('toastContainer');

  const toast = document.createElement('div');
  toast.className = 'toast' + (tipo === 'error' ? ' error' : '');
  toast.textContent = mensaje;

  toastContainer.appendChild(toast);

  
  setTimeout(function () {
    toast.classList.add('mostrar');
  }, 10);

  
  setTimeout(function () {
    toast.classList.remove('mostrar');
    setTimeout(function () {
      toast.remove();
    }, 300); 
  }, 3000);
}

// Formulario Crear Evento
const form = document.getElementById('formEvento');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const titulo = document.getElementById('fTitulo').value;
  const categoria = document.getElementById('fCategoria').value;
  const ubicacion = document.getElementById('fUbicacion').value;
  const descripcion = document.getElementById('fDescripcion').value;
  const cupos = document.getElementById('fCupos').value;

  if(Number(cupos)<=0){
    
    mostrarToast('El número de cupos debe ser mayor a 0', 'error');
    return;
  }

  const nuevoEvento = new Evento(titulo, categoria, ubicacion, descripcion, cupos,usuarioActual? usuarioActual.correo :null);
  eventos.push(nuevoEvento);

  renderFeed();

  guardarEventos();
  overlayCrear.style.display='none';
});

// Feed
const feedContainer = document.querySelector('.feed');

function renderFeed() {
  feedContainer.innerHTML = '';

  let eventosBase=eventos;

  if(modofeed==="para ti"&& usuarioActual){
    eventosBase=eventos.filter(function(evento){
      return usuarioActual.intereses.includes(evento.Categoria);
  });
}

  const eventosFiltrados = categoriaActiva === "todos"
    ? eventosBase
    : eventosBase.filter(function (evento) {
        return evento.Categoria === categoriaActiva;
      });

  eventosFiltrados.forEach(function (evento) {
    const indexReal = eventos.indexOf(evento);
    const cuposDisponibles= evento.CuposTotales - evento.CuposOcupados;
    const estaLleno= cuposDisponibles <=0;

    const cardHTML = `        
      <article class="card">
        <h2 class="card-title">${evento.Titulo}</h2>
        <p class="card-meta">📍 ${evento.Ubicacion} · ${evento.Categoria}</p>
        <p class="card-meta">${evento.Descripcion}</p>
        <p class="card-cupos">Total de cupos para completar el parche:${evento.CuposTotales}</p>
        <p class= "card-cupos">Cupos Disponibles: ${cuposDisponibles}</p>
        <button class="btn-unirse" data-index="${indexReal}" ${estaLleno ? 'disabled' :''}>
          ${estaLleno ? 'Cupo LLeno' : 'Unirse al evento🙋'}
        </button>
        <button class="btn-like" data-index="${indexReal}">❤️<span>${evento.likes}</span></button>
        <div class="comentarios">
          ${evento.comentarios.map(function (c) { return '<p class="comentario">💬 ' + c + '</p>'; }).join('')}
        </div>

        <div class="agregar-comentario">
          <input type="text" class="input-comentario" data-index="${indexReal}" placeholder="Escribe un comentario...">
          <button class="btn-comentar" data-index="${indexReal}">Comentar</button>
        </div>
      </article>
    `;
    feedContainer.innerHTML += cardHTML;
  });
}

feedContainer.addEventListener('click', function (e) {
  if (e.target.closest('.btn-like')) {
  if (!usuarioActual) {
    mostrarToast('Debes iniciar sesión para dar like.', 'error');
    return;
  }

  const boton = e.target.closest('.btn-like');
  const index = boton.dataset.index;
  const sePudo = eventos[index].DarLike(usuarioActual.correo);

  if (!sePudo) {
    mostrarToast('Ya le diste like a este evento.', 'error');
  }

  renderFeed();
  guardarEventos();
}

  if (e.target.closest('.btn-comentar')) {
    const boton = e.target.closest('.btn-comentar');
    const index = boton.dataset.index;
    const input = boton.previousElementSibling;
    const texto = input.value.trim();

    if (texto !== '') {
      eventos[index].comentarios.push(texto);
    }

  renderFeed(); 
  guardarEventos();

}

  if(e.target.closest('.btn-unirse')){
  if (!usuarioActual) {
    mostrarToast('Debes iniciar sesión para unirte.', 'error');
    return;
  }

  const boton = e.target.closest('.btn-unirse');
  const index = boton.dataset.index;
  const resultado = eventos[index].unirse(usuarioActual.correo);

  if (resultado === true) {
    mostrarToast('¡Quedaste en el parche! 🎉');
  } else if (resultado === 'ya_unido') {
    mostrarToast('Ya estás en este parche.', 'error');
  } else {
    mostrarToast('Ya no hay cupos disponibles.', 'error');
  }

  renderFeed();
  guardarEventos();
}});

// Filtra categorias
const categoriesNav = document.querySelector('.categories');

categoriesNav.addEventListener('click', function (e) {
  const boton = e.target.closest('.chip');
  if (!boton) return;

  categoriaActiva = boton.dataset.categoria;
  renderFeed();
});
//Autenticacion
const btnUsuario = document.getElementById('btnUsuario');
const authSection = document.querySelector('.auth');

authSection.style.display = 'none'; // arranca oculto

btnUsuario.addEventListener('click', function () {
  const estaVisible = authSection.style.display === 'block';
  authSection.style.display = estaVisible ? 'none' : 'block';

    if (!estaVisible) {
     authSection.scrollIntoView({behavior: 'smooth'});
  }
});
const authTabs = document.querySelector('.auth-tabs');
const campoNombre = document.getElementById('aNombre');
const btnAuthSubmit = document.getElementById('btnAuthSubmit');
const formAuth = document.getElementById('formAuth');
const camposIntereses = document.getElementById('camposIntereses');

authTabs.addEventListener('click', function (e) {
  const boton = e.target.closest('.auth-tab');
  if (!boton) return;

  modoAuth = boton.dataset.modo;

  document.querySelectorAll('.auth-tab').forEach(function (tab) {
    tab.classList.remove('active');
  });
  boton.classList.add('active');

  if (modoAuth === 'registro') {
    campoNombre.style.display = 'block';
    camposIntereses.style.display = 'block';
    btnAuthSubmit.textContent = 'Registrarme';
  } else {
    campoNombre.style.display = 'none';
    camposIntereses.style.display = 'none';
    btnAuthSubmit.textContent = 'Iniciar sesión';
  }
});

formAuth.addEventListener('submit', function (e) {
  e.preventDefault();

  const correo = document.getElementById('aCorreo').value;
  const contrasena = document.getElementById('aContrasena').value;

  if (modoAuth === 'registro') {
    const nombre = document.getElementById('aNombre').value;

    const nuevoUsuario = new Usuario(nombre, correo, contrasena);
    usuarios.push(nuevoUsuario);
    usuarioActual = nuevoUsuario;

    mostrarToast('¡Cuenta creada! Bienvenido, ' + nombre);

  } else {
    const encontrado = usuarios.find(function (u) {
      return u.correo === correo && u.contrasena === contrasena;
    });

    if (encontrado) {
      usuarioActual = encontrado;
      mostrarToast('¡Bienvenido de nuevo, ' + encontrado.nombre + '!');
    } else {
      mostrarToast('Correo o contraseña incorrectos.', 'error');
    }
  }

  console.log('Usuario actual:', usuarioActual);
   if (usuarioActual) {
    btnUsuario.textContent = '👤 ' + usuarioActual.nombre;
    authSection.style.display = 'none';
  }
  formAuth.reset();
});
const overlayCrear = document.getElementById('overlayCrear');
const btnCrearEvento = document.getElementById('btnCrearEvento');
const btnCerrarCrear = document.getElementById('btnCerrarCrear');

overlayCrear.style.display = 'none';

btnCrearEvento.addEventListener('click', function () {
  overlayCrear.style.display = 'flex';
});

btnCerrarCrear.addEventListener('click', function () {
  overlayCrear.style.display = 'none';
});
cargarEventos();
renderFeed();

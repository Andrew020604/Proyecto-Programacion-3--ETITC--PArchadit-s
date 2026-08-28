//Constructores
class Evento {
  constructor(Titulo, Categoria, Ubicacion, Descripcion, CuposTotales) {
    this.Titulo = Titulo;
    this.Categoria = Categoria;
    this.Ubicacion = Ubicacion;
    this.Descripcion = Descripcion;
    this.CuposTotales = CuposTotales;
    this.CuposOcupados = 0;
    this.likes = 0;
    this.comentarios = [];
  }

  DarLike() {
    this.likes++; //Aumenta los likes.
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

// Formulario Crear Evento
const form = document.getElementById('formEvento');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const titulo = document.getElementById('fTitulo').value;
  const categoria = document.getElementById('fCategoria').value;
  const ubicacion = document.getElementById('fUbicacion').value;
  const descripcion = document.getElementById('fDescripcion').value;
  const cupos = document.getElementById('fCupos').value;

  const nuevoEvento = new Evento(titulo, categoria, ubicacion, descripcion, cupos);
  eventos.push(nuevoEvento);

  renderFeed();
  form.reset();
});

// Feed
const feedContainer = document.querySelector('.feed');

function renderFeed() {
  feedContainer.innerHTML = '';

  const eventosFiltrados = categoriaActiva === "todos"
    ? eventos
    : eventos.filter(function (evento) {
        return evento.Categoria === categoriaActiva;
      });

  eventosFiltrados.forEach(function (evento) {
    const indexReal = eventos.indexOf(evento);

    const cardHTML = `
      <article class="card">
        <h2 class="card-title">${evento.Titulo}</h2>
        <p class="card-meta">📍 ${evento.Ubicacion} · ${evento.Categoria}</p>
        <p class="card-meta">${evento.Descripcion}</p>
        <p class="card-cupos">${evento.CuposTotales} cupos totales</p>
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
    const boton = e.target.closest('.btn-like');
    const index = boton.dataset.index;
    eventos[index].DarLike();
    renderFeed();
  }

  if (e.target.closest('.btn-comentar')) {
    const boton = e.target.closest('.btn-comentar');
    const index = boton.dataset.index;
    const input = boton.previousElementSibling;
    const texto = input.value.trim();

    if (texto !== '') {
      eventos[index].comentarios.push(texto);
      renderFeed();
    }
  }
});

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
});
const authTabs = document.querySelector('.auth-tabs');
const campoNombre = document.getElementById('aNombre');
const btnAuthSubmit = document.getElementById('btnAuthSubmit');
const formAuth = document.getElementById('formAuth');

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
    btnAuthSubmit.textContent = 'Registrarme';
  } else {
    campoNombre.style.display = 'none';
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

    alert('¡Cuenta creada! Bienvenido, ' + nombre);

  } else {
    const encontrado = usuarios.find(function (u) {
      return u.correo === correo && u.contrasena === contrasena;
    });

    if (encontrado) {
      usuarioActual = encontrado;
      alert('¡Bienvenido de nuevo, ' + encontrado.nombre + '!');
    } else {
      alert('Correo o contraseña incorrectos.');
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
renderFeed();

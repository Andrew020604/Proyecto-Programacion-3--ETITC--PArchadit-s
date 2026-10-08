// ======================================================
// PARCHADIT@S - colosal.js
// Un solo archivo para las dos páginas (login.jsp e index.jsp)
// ======================================================

// Dirección base de la aplicación (la imprime el JSP en el body)
const BASE = document.body.dataset.base;

let usuarioActual = null;

// ---------- TOAST ----------
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

// ---------- ENVIAR DATOS AL SERVLET ----------
function enviar(ruta, datos) {

    return fetch(BASE + ruta, {

        method: 'POST',

        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },

        body: datos

    }).then(function (response) {

        if (!response.ok) {
            throw new Error('Error HTTP: ' + response.status);
        }

        return response.json();
    });
}

// ---------- SESIÓN ----------
function comprobarSesion() {

    return fetch(BASE + '/sesion')

        .then(function (response) {
            return response.json();
        })

        .then(function (data) {

            if (data.sesion) {
                usuarioActual = {
                    nombre: data.nombre,
                    intereses: data.intereses
                };
            } else {
                usuarioActual = null;
            }
        });
}

// ---------- CERRAR SESIÓN (botón del menú) ----------
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

if (btnCerrarSesion) {

    btnCerrarSesion.addEventListener('click', function () {

        const datos = new URLSearchParams();
        datos.append('modo', 'logout');

        enviar('/auth', datos)

            .then(function () {
                window.location.href = BASE + '/login.jsp';
            })

            .catch(function () {
                mostrarToast('Error al conectar con el servidor.', 'error');
            });
    });
}

// ======================================================
// PÁGINA login.jsp: LOGIN Y REGISTRO
// ======================================================
function iniciarAuth() {

    const authTabs = document.querySelector('.auth-tabs');
    const campoNombre = document.getElementById('aNombre');
    const camposIntereses = document.getElementById('camposIntereses');
    const btnAuthSubmit = document.getElementById('btnAuthSubmit');
    const formAuth = document.getElementById('formAuth');

    let modoAuth = 'login';

    function aplicarModo(modo) {

        modoAuth = modo;

        const esRegistro = (modo === 'registro');

        campoNombre.classList.toggle('oculto', !esRegistro);
        camposIntereses.classList.toggle('oculto', !esRegistro);

        btnAuthSubmit.textContent = esRegistro ? 'Registrarme' : 'Iniciar sesión';

        document.querySelectorAll('.auth-tab').forEach(function (tab) {
            tab.classList.toggle('active', tab.dataset.modo === modo);
        });
    }

    authTabs.addEventListener('click', function (e) {

        const boton = e.target.closest('.auth-tab');

        if (!boton) {
            return;
        }

        aplicarModo(boton.dataset.modo);
    });

    formAuth.addEventListener('submit', function (e) {

        e.preventDefault();

        const datos = new URLSearchParams();

        datos.append('modo', modoAuth);
        datos.append('nombre', document.getElementById('aNombre').value);
        datos.append('correo', document.getElementById('aCorreo').value);
        datos.append('contrasena', document.getElementById('aContrasena').value);

        document.querySelectorAll('#camposIntereses input:checked').forEach(function (check) {
            datos.append('intereses', check.value);
        });

        enviar('/auth', datos)

            .then(function (data) {

                if (!data.ok) {
                    mostrarToast(data.mensaje, 'error');
                    return;
                }

                if (modoAuth === 'registro') {

                    mostrarToast('¡Registro exitoso! Ahora inicia sesión.');
                    formAuth.reset();
                    aplicarModo('login');

                } else {

                    window.location.href = BASE + '/index.jsp';
                }
            })

            .catch(function () {
                mostrarToast('Error al conectar con el servidor.', 'error');
            });
    });

    aplicarModo('login');
}

// ======================================================
// PÁGINA index.jsp: FEED, CREAR PARCHE, LIKES Y COMENTARIOS
// ======================================================
function iniciarFeed() {

    const feed = document.getElementById('feed');
    const formEvento = document.getElementById('formEvento');
    const btnCrear = document.getElementById('btnCrearEvento');
    const overlayCrear = document.getElementById('overlayCrear');
    const btnParaTi = document.getElementById('btnParaTi');
    const btnExplorar = document.getElementById('btnExplorar');
    const chips = document.querySelectorAll('.chip[data-categoria]');

    let categoriaActual = 'todos';
    let vistaActual = 'explorar';

    // clave interna -> texto bonito, tomado de los chips
    const nombresCategoria = {};
    chips.forEach(function (chip) {
        nombresCategoria[chip.dataset.categoria] = chip.textContent;
    });

    // ---------- AYUDAS PARA CREAR ELEMENTOS ----------
    // Se usa textContent (nunca innerHTML) para que lo que escriba la gente
    // no pueda inyectar HTML ni scripts en la página.
    function crearEl(etiqueta, clase, texto) {
        const el = document.createElement(etiqueta);
        if (clase) {
            el.className = clase;
        }
        if (texto !== undefined) {
            el.textContent = texto;
        }
        return el;
    }

    function textoLike(meGusta, likes) {
        return (meGusta ? '❤️ ' : '🤍 ') + likes;
    }

    function textoCupos(inscritos, cupos) {
        return '👥 ' + inscritos + '/' + cupos + ' inscritos';
    }

    function textoUnirse(unido, inscritos, cupos) {
        if (unido) {
            return '✅ Ya voy (salir)';
        }
        return inscritos >= cupos ? 'Sin cupos' : 'Unirme';
    }

    function crearComentarioEl(autor, texto) {
        const div = crearEl('div', 'comentario');
        div.appendChild(crearEl('strong', '', autor));
        div.appendChild(document.createTextNode(': ' + texto));
        return div;
    }

    // ---------- DIBUJAR UNA CARD ----------
    function crearCard(e) {

        const card = crearEl('article', 'card');
        card.dataset.id = e.id;

        // ⭐ si la categoría del parche está entre los intereses de la persona
        const titulo = crearEl('h3', 'card-title', e.titulo);
        if (vistaActual === 'explorar'
            usuarioActual && usuarioActual.intereses.includes(e.categoria)) {
            titulo.appendChild(crearEl('span', 'etiqueta-parati', '⭐ Para ti'));
        }
        card.appendChild(titulo);
        card.appendChild(crearEl('p', 'card-meta',
            (nombresCategoria[e.categoria] || e.categoria) + ' · 📍 ' + e.ubicacion));
        card.appendChild(crearEl('p', '', e.descripcion));
        card.appendChild(crearEl('p', 'card-meta', 'Publicado por ' + e.creador));
        card.appendChild(crearEl('p', 'card-cupos', textoCupos(e.inscritos, e.cupos)));

        // Botones de acción: like y unirse
        const acciones = crearEl('div', 'acciones');

        const btnLike = crearEl('button', 'btn-like' + (e.meGusta ? ' activo' : ''),
            textoLike(e.meGusta, e.likes));
        btnLike.type = 'button';
        acciones.appendChild(btnLike);

        const btnUnirse = crearEl('button', 'btn-unirse' + (e.unido ? ' activo' : ''),
            textoUnirse(e.unido, e.inscritos, e.cupos));
        btnUnirse.type = 'button';
        acciones.appendChild(btnUnirse);

        card.appendChild(acciones);

        // Comentarios existentes
        const cajaComentarios = crearEl('div', 'comentarios');
        e.comentarios.forEach(function (c) {
            cajaComentarios.appendChild(crearComentarioEl(c.autor, c.texto));
        });
        card.appendChild(cajaComentarios);

        // Formulario para comentar
        const form = crearEl('form', 'agregar-comentario');

        const input = crearEl('input', 'input-comentario');
        input.type = 'text';
        input.placeholder = 'Escribe un comentario...';
        input.maxLength = 200;
        input.required = true;

        const btnEnviar = crearEl('button', 'btn-comentar', 'Enviar');
        btnEnviar.type = 'submit';

        form.appendChild(input);
        form.appendChild(btnEnviar);
        card.appendChild(form);

        return card;
    }

    // ---------- CARGAR EL FEED DESDE EL SERVLET ----------
    function cargarEventos() {

        const params = new URLSearchParams();
        params.append('vista', vistaActual);
        params.append('categoria', categoriaActual);

        fetch(BASE + '/eventos?' + params.toString())

            .then(function (response) {
                return response.json();
            })

            .then(function (data) {

                feed.innerHTML = '';

                if (!data.eventos || data.eventos.length === 0) {
                    feed.appendChild(crearEl('p', 'feed-vacio',
                        'No hay parches en esta categoría todavía.'));
                    return;
                }

                data.eventos.forEach(function (e) {
                    feed.appendChild(crearCard(e));
                });
            })

            .catch(function () {
                mostrarToast('No se pudieron cargar los parches.', 'error');
            });
    }

    // ---------- CATEGORÍAS ----------
    document.querySelector('.categories').addEventListener('click', function (e) {

        const chip = e.target.closest('.chip');

        if (!chip) {
            return;
        }

        categoriaActual = chip.dataset.categoria;

        chips.forEach(function (c) {
            c.classList.toggle('active', c === chip);
        });

        cargarEventos();
    });

    // ---------- PARA TI / EXPLORAR ----------
    function cambiarVista(vista) {

        if (vista === 'parati' && !usuarioActual) {
            mostrarToast('Inicia sesión para ver tu feed Para Ti.', 'error');
            return;
        }

        vistaActual = vista;

        btnParaTi.classList.toggle('activar-feed', vista === 'parati');
        btnExplorar.classList.toggle('activar-feed', vista === 'explorar');

        cargarEventos();
    }

    btnParaTi.addEventListener('click', function () {
        cambiarVista('parati');
    });

    btnExplorar.addEventListener('click', function () {
        cambiarVista('explorar');
    });

    // ---------- LIKE ----------
    feed.addEventListener('click', function (e) {

        const btn = e.target.closest('.btn-like');

        if (!btn) {
            return;
        }

        if (!usuarioActual) {
            mostrarToast('Inicia sesión para dar like.', 'error');
            return;
        }

        const datos = new URLSearchParams();
        datos.append('modo', 'like');
        datos.append('id', btn.closest('.card').dataset.id);

        enviar('/eventos', datos)

            .then(function (data) {

                if (!data.ok) {
                    mostrarToast(data.mensaje, 'error');
                    return;
                }

                btn.textContent = textoLike(data.meGusta, data.likes);
                btn.classList.toggle('activo', data.meGusta);
            })

            .catch(function () {
                mostrarToast('Error al conectar con el servidor.', 'error');
            });
    });

    // ---------- UNIRSE ----------
    feed.addEventListener('click', function (e) {

        const btn = e.target.closest('.btn-unirse');

        if (!btn) {
            return;
        }

        if (!usuarioActual) {
            mostrarToast('Inicia sesión para unirte a un parche.', 'error');
            return;
        }

        const card = btn.closest('.card');

        const datos = new URLSearchParams();
        datos.append('modo', 'unirse');
        datos.append('id', card.dataset.id);

        enviar('/eventos', datos)

            .then(function (data) {

                if (!data.ok) {
                    mostrarToast(data.mensaje, 'error');
                    return;
                }

                btn.textContent = textoUnirse(data.unido, data.inscritos, data.cupos);
                btn.classList.toggle('activo', data.unido);
                card.querySelector('.card-cupos').textContent =
                    textoCupos(data.inscritos, data.cupos);

                mostrarToast(data.unido ? '¡Te uniste al parche!' : 'Saliste del parche.');
            })

            .catch(function () {
                mostrarToast('Error al conectar con el servidor.', 'error');
            });
    });

    // ---------- COMENTAR ----------
    feed.addEventListener('submit', function (e) {

        const form = e.target.closest('.agregar-comentario');

        if (!form) {
            return;
        }

        e.preventDefault();

        if (!usuarioActual) {
            mostrarToast('Inicia sesión para comentar.', 'error');
            return;
        }

        const input = form.querySelector('.input-comentario');
        const card = form.closest('.card');

        const datos = new URLSearchParams();
        datos.append('modo', 'comentar');
        datos.append('id', card.dataset.id);
        datos.append('texto', input.value);

        enviar('/eventos', datos)

            .then(function (data) {

                if (!data.ok) {
                    mostrarToast(data.mensaje, 'error');
                    return;
                }

                card.querySelector('.comentarios')
                    .appendChild(crearComentarioEl(data.autor, data.texto));

                input.value = '';
            })

            .catch(function () {
                mostrarToast('Error al conectar con el servidor.', 'error');
            });
    });

    // ---------- CREAR PARCHE ----------
    formEvento.addEventListener('submit', function (e) {

        e.preventDefault();

        const datos = new URLSearchParams();
        datos.append('modo', 'crear');
        datos.append('titulo', document.getElementById('fTitulo').value);
        datos.append('categoria', document.getElementById('fCategoria').value);
        datos.append('ubicacion', document.getElementById('fUbicacion').value);
        datos.append('descripcion', document.getElementById('fDescripcion').value);
        datos.append('cupos', document.getElementById('fCupos').value);

        enviar('/eventos', datos)

            .then(function (data) {

                if (!data.ok) {
                    mostrarToast(data.mensaje, 'error');
                    return;
                }

                mostrarToast(data.mensaje);
                formEvento.reset();
                overlayCrear.classList.add('oculto');
                cargarEventos();
            })

            .catch(function () {
                mostrarToast('Error al conectar con el servidor.', 'error');
            });
    });

    // ---------- ARRANQUE DE LA PÁGINA ----------
    // Primero sabemos si hay sesión (para el botón + y los likes), luego cargamos el feed
    comprobarSesion()

        .catch(function () {
            usuarioActual = null;
        })

        .then(function () {
            btnCrear.classList.toggle('oculto', !usuarioActual);
            cargarEventos();
        });
}

// ======================================================
// ARRANQUE: según la página en la que estemos
// ======================================================
if (document.getElementById('formAuth')) {
    iniciarAuth();
}

if (document.getElementById('feed')) {
    iniciarFeed();
}
package com.parchaditos.servlet;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class EventoServlet extends HttpServlet {

    // Debe coincidir con las claves de categorias.jspf
    private static final List<String> CATEGORIAS = List.of(
            "al aire libre", "conciertos", "deportes", "severa gurbia",
            "dominguero", "zonas sociales", "vamos pa la fiesta", "ja ja ja",
            "cine teatro", "eventos cercanos", "museos", "pa comer helado",
            "sal de esa rutina", "ferias/expocisiones");

    // Eventos temporales en memoria: se borran al reiniciar Tomcat
    private static final List<Evento> eventos = new ArrayList<>();
    private static int siguienteId = 1;

    private static class Evento {
        int id;
        String titulo;
        String categoria;
        String ubicacion;
        String descripcion;
        int cupos;
        String creador;
        Set<String> likes = new HashSet<>();// correos de quienes dieron like
        Set<String> inscritos = new HashSet<>();// correos de quienes se unieron
        List<String[]> comentarios = new ArrayList<>(); // {autor, texto}

        Evento(int id, String titulo, String categoria, String ubicacion,
               String descripcion, int cupos, String creador) {
            this.id = id;
            this.titulo = titulo;
            this.categoria = categoria;
            this.ubicacion = ubicacion;
            this.descripcion = descripcion;
            this.cupos = cupos;
            this.creador = creador;
        }
    }

    // ---------- LISTAR (GET) ----------
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Cache-Control", "no-store");
        PrintWriter out = response.getWriter();

        // La sesión es opcional: sin ella se puede explorar, pero no hay "meGusta"
        String correo = null;
        List<?> intereses = null;
        HttpSession sesion = request.getSession(false);
        if (sesion != null && sesion.getAttribute("correo") != null) {
            correo = (String) sesion.getAttribute("correo");
            Object guardados = sesion.getAttribute("intereses");
            if (guardados instanceof List<?> lista) {
                intereses = lista;
            }
        }

        String categoria = limpiar(request.getParameter("categoria"));
        if (!CATEGORIAS.contains(categoria)) {
            categoria = "todos";
        }

        // "Para ti" solo filtra si hay sesión y la persona eligió intereses
        boolean soloIntereses = "parati".equals(request.getParameter("vista"))
                && intereses != null && !intereses.isEmpty();

        StringBuilder json = new StringBuilder("{\"ok\": true, \"eventos\": [");
        boolean primero = true;

        synchronized (eventos) {
            for (int i = eventos.size() - 1; i >= 0; i--) { // más nuevos primero
                Evento e = eventos.get(i);

                if (!categoria.equals("todos") && !categoria.equals(e.categoria)) {
                    continue;
                }
                if (soloIntereses && !intereses.contains(e.categoria)) {
                    continue;
                }

                if (!primero) {
                    json.append(", ");
                }
                primero = false;
                json.append(eventoAJson(e, correo));
            }
        }

        json.append("]}");
        out.print(json);
    }

    // ---------- ACCIONES (POST) ----------
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        HttpSession sesion = request.getSession(false);
        if (sesion == null || sesion.getAttribute("correo") == null) {
            out.print("{\"ok\": false, \"sesion\": false, "
                    + "\"mensaje\": \"Inicia sesión para continuar.\"}");
            return;
        }

        String modo = request.getParameter("modo");

        if ("crear".equals(modo)) {
            crear(request, sesion, out);
        } else if ("like".equals(modo)) {
            alternarLike(request, sesion, out);
        } else if ("comentar".equals(modo)) {
            comentar(request, sesion, out);
        }  else if ("unirse".equals(modo)) {
            unirse(request, sesion, out);
        }else {
            responder(out, false, "Acción no válida.");
        }
    }

    // ---------- CREAR ----------
    private void crear(HttpServletRequest request, HttpSession sesion, PrintWriter out) {

        String titulo = limpiar(request.getParameter("titulo"));
        String categoria = limpiar(request.getParameter("categoria"));
        String ubicacion = limpiar(request.getParameter("ubicacion"));
        String descripcion = limpiar(request.getParameter("descripcion"));
        int cupos = leerEntero(request.getParameter("cupos"));

        if (titulo.isEmpty() || titulo.length() > 80) {
            responder(out, false, "El título debe tener entre 1 y 80 caracteres.");
            return;
        }
        if (!CATEGORIAS.contains(categoria)) {
            responder(out, false, "La categoría no es válida.");
            return;
        }
        if (ubicacion.isEmpty() || ubicacion.length() > 100) {
            responder(out, false, "La ubicación debe tener entre 1 y 100 caracteres.");
            return;
        }
        if (descripcion.isEmpty() || descripcion.length() > 300) {
            responder(out, false, "La descripción debe tener entre 1 y 300 caracteres.");
            return;
        }
        if (cupos < 1 || cupos > 500) {
            responder(out, false, "Los cupos deben estar entre 1 y 500.");
            return;
        }

        String creador = (String) sesion.getAttribute("nombre");

        synchronized (eventos) {
            eventos.add(new Evento(siguienteId++, titulo, categoria, ubicacion,
                    descripcion, cupos, creador));
        }

        responder(out, true, "¡Tu parche fue publicado!");
    }

    // ---------- LIKE (si ya tenía like lo quita) ----------
    private void alternarLike(HttpServletRequest request, HttpSession sesion, PrintWriter out) {

        String correo = (String) sesion.getAttribute("correo");
        int id = leerEntero(request.getParameter("id"));

        synchronized (eventos) {
            Evento e = buscar(id);
            if (e == null) {
                responder(out, false, "Ese parche ya no existe.");
                return;
            }

            boolean meGusta;
            if (e.likes.remove(correo)) {
                meGusta = false;
            } else {
                e.likes.add(correo);
                meGusta = true;
            }

            out.print("{\"ok\": true, \"meGusta\": " + meGusta
                    + ", \"likes\": " + e.likes.size() + "}");
        }
    }

    // ---------- COMENTAR ----------
    private void comentar(HttpServletRequest request, HttpSession sesion, PrintWriter out) {

        int id = leerEntero(request.getParameter("id"));
        String texto = limpiar(request.getParameter("texto"));
        String autor = (String) sesion.getAttribute("nombre");

        if (texto.isEmpty() || texto.length() > 200) {
            responder(out, false, "El comentario debe tener entre 1 y 200 caracteres.");
            return;
        }

        synchronized (eventos) {
            Evento e = buscar(id);
            if (e == null) {
                responder(out, false, "Ese parche ya no existe.");
                return;
            }

            e.comentarios.add(new String[]{autor, texto});

            out.print("{\"ok\": true, \"autor\": \"" + escaparJson(autor)
                    + "\", \"texto\": \"" + escaparJson(texto) + "\"}");
        }
    }

    // ---------- AUXILIARES ----------
    // Siempre se llama dentro de synchronized (eventos)
    private Evento buscar(int id) {
        for (Evento e : eventos) {
            if (e.id == id) {
                return e;
            }
        }
        return null;
    }

    // ---------- UNIRSE (si ya estaba unido, sale del parche) ----------
    private void unirse(HttpServletRequest request, HttpSession sesion, PrintWriter out) {

        String correo = (String) sesion.getAttribute("correo");
        int id = leerEntero(request.getParameter("id"));

        synchronized (eventos) {
            Evento e = buscar(id);
            if (e == null) {
                responder(out, false, "Ese parche ya no existe.");
                return;
            }

            boolean unido;
            if (e.inscritos.remove(correo)) {
                unido = false;
            } else {
                if (e.inscritos.size() >= e.cupos) {
                    responder(out, false, "Este parche ya no tiene cupos.");
                    return;
                }
                e.inscritos.add(correo);
                unido = true;
            }

            out.print("{\"ok\": true, \"unido\": " + unido
                    + ", \"inscritos\": " + e.inscritos.size()
                    + ", \"cupos\": " + e.cupos + "}");
        }
    }

    // Siempre se llama dentro de synchronized (eventos)
    private String eventoAJson(Evento e, String correo) {
        StringBuilder sb = new StringBuilder();

        sb.append("{\"id\": ").append(e.id)
                .append(", \"titulo\": \"").append(escaparJson(e.titulo)).append("\"")
                .append(", \"categoria\": \"").append(escaparJson(e.categoria)).append("\"")
                .append(", \"ubicacion\": \"").append(escaparJson(e.ubicacion)).append("\"")
                .append(", \"descripcion\": \"").append(escaparJson(e.descripcion)).append("\"")
                .append(", \"cupos\": ").append(e.cupos)
                .append(", \"inscritos\": ").append(e.inscritos.size())
                .append(", \"unido\": ").append(correo != null && e.inscritos.contains(correo))
                .append(", \"creador\": \"").append(escaparJson(e.creador)).append("\"")
                .append(", \"likes\": ").append(e.likes.size())
                .append(", \"meGusta\": ").append(correo != null && e.likes.contains(correo))
                .append(", \"comentarios\": [");

        for (int i = 0; i < e.comentarios.size(); i++) {
            String[] c = e.comentarios.get(i);
            if (i > 0) {
                sb.append(", ");
            }
            sb.append("{\"autor\": \"").append(escaparJson(c[0]))
                    .append("\", \"texto\": \"").append(escaparJson(c[1])).append("\"}");
        }

        sb.append("]}");
        return sb.toString();
    }

    private int leerEntero(String texto) {
        try {
            return Integer.parseInt(limpiar(texto));
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    private String limpiar(String texto) {
        return texto == null ? "" : texto.strip();
    }

    private void responder(PrintWriter out, boolean ok, String mensaje) {
        out.print("{\"ok\": " + ok + ", \"mensaje\": \"" + escaparJson(mensaje) + "\"}");
    }

    private String escaparJson(String texto) {
        return texto.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t");
    }
}
package com.parchaditos.servlet;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class AuthServlet extends HttpServlet {

    // Usuarios temporales en memoria: se borran al reiniciar Tomcat
    private static final Map<String, UsuarioTemporal> usuarios = new HashMap<>();

    private static class UsuarioTemporal {
        String nombre;
        String contrasenaHash;
        ArrayList<String> intereses;

        UsuarioTemporal(String nombre, String contrasenaHash, ArrayList<String> intereses) {
            this.nombre = nombre;
            this.contrasenaHash = contrasenaHash;
            this.intereses = intereses;
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        String modo = request.getParameter("modo");

        if ("registro".equals(modo)) {
            registrar(request, out);
        } else if ("login".equals(modo)) {
            iniciarSesion(request, out);
        } else if ("logout".equals(modo)) {
            cerrarSesion(request, out);
        } else {
            responder(out, false, "Modo de autenticación no válido");
        }
    }

    // ---------- REGISTRO ----------
    private void registrar(HttpServletRequest request, PrintWriter out) {

        String nombre = limpiar(request.getParameter("nombre"));
        String correo = limpiar(request.getParameter("correo")).toLowerCase(Locale.ROOT);
        String contrasena = request.getParameter("contrasena");
        String[] intereses = request.getParameterValues("intereses");

        if (!nombre.matches("[\\p{L}][\\p{L} '.-]{1,49}")) {
            responder(out, false, "El nombre debe tener entre 2 y 50 letras.");
            return;
        }
        if (correo.length() > 100
                || !correo.matches("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}")) {
            responder(out, false, "El correo no es válido.");
            return;
        }
        if (contrasena == null || contrasena.length() < 8 || contrasena.length() > 100) {
            responder(out, false, "La contraseña debe tener entre 8 y 100 caracteres.");
            return;
        }

        ArrayList<String> listaIntereses = new ArrayList<>();
        if (intereses != null) {
            if (intereses.length > 14) {
                responder(out, false, "Demasiados intereses.");
                return;
            }
            for (String interes : intereses) {
                if (!interes.matches("[a-z /]{1,30}")) {
                    responder(out, false, "Alguno de los intereses no es válido.");
                    return;
                }
                listaIntereses.add(interes);
            }
        }

        synchronized (usuarios) {
            if (usuarios.containsKey(correo)) {
                responder(out, false, "Ese correo ya está registrado.");
                return;
            }
            usuarios.put(correo, new UsuarioTemporal(nombre, hash(contrasena), listaIntereses));
        }

        responder(out, true, "Registro exitoso");
    }

    // ---------- LOGIN ----------
    private void iniciarSesion(HttpServletRequest request, PrintWriter out) {

        String correo = limpiar(request.getParameter("correo")).toLowerCase(Locale.ROOT);
        String contrasena = request.getParameter("contrasena");

        UsuarioTemporal usuario;
        synchronized (usuarios) {
            usuario = usuarios.get(correo);
        }

        if (usuario == null || contrasena == null
                || !usuario.contrasenaHash.equals(hash(contrasena))) {
            responder(out, false, "Correo o contraseña incorrectos");
            return;
        }

        HttpSession vieja = request.getSession(false);
        if (vieja != null) {
            vieja.invalidate();
        }

        HttpSession sesion = request.getSession(true);
        sesion.setAttribute("nombre", usuario.nombre);
        sesion.setAttribute("correo", correo);
        sesion.setAttribute("intereses", usuario.intereses);
        sesion.setMaxInactiveInterval(30 * 60);

        responder(out, true, "Inicio de sesión exitoso");
    }

    // ---------- LOGOUT ----------
    private void cerrarSesion(HttpServletRequest request, PrintWriter out) {
        HttpSession sesion = request.getSession(false);
        if (sesion != null) {
            sesion.invalidate();
        }
        responder(out, true, "Sesión cerrada");
    }

    // ---------- AUXILIARES ----------
    private String limpiar(String texto) {
        return texto == null ? "" : texto.strip();
    }

    private String hash(String contrasena) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(contrasena.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private void responder(PrintWriter out, boolean ok, String mensaje) {
        out.print("{\"ok\": " + ok + ", \"mensaje\": \"" + escaparJson(mensaje) + "\"}");
    }

    private String escaparJson(String texto) {
        return texto.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t");
    }
}

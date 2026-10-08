package com.parchaditos.servlet;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

public class SesionServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Cache-Control", "no-store");
        PrintWriter out = response.getWriter();

        HttpSession sesion = request.getSession(false);

        if (sesion == null || sesion.getAttribute("correo") == null) {
            out.print("{\"sesion\": false}");
            return;
        }

        String nombre = (String) sesion.getAttribute("nombre");

        StringBuilder intereses = new StringBuilder();
        Object guardados = sesion.getAttribute("intereses");
        if (guardados instanceof List<?> lista) {
            for (Object interes : lista) {
                if (intereses.length() > 0) {
                    intereses.append(", ");
                }
                intereses.append("\"").append(escaparJson(String.valueOf(interes))).append("\"");
            }
        }

        out.print("{\"sesion\": true, \"nombre\": \"" + escaparJson(nombre)
                + "\", \"intereses\": [" + intereses + "]}");
    }

    private String escaparJson(String texto) {
        return texto.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t");
    }
}
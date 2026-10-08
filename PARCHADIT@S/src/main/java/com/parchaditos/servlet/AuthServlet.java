package com.parchaditos.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;


public class AuthServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response)
        throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("text/html;charset=UTF-8");

        String modo = request.getParameter("modo");
        String nombre = request.getParameter("nombre");
        String correo = request.getParameter("correo");
        String contrasena = request.getParameter("contrasena");

        PrintWriter out = response.getWriter();

        out.println("<!DOCTYPE html>");
        out.println("<html lang='es'>");
        out.println("<head>");
        out.println("<meta charset='UTF-8'>");
        out.println("<title>Parchadit@s</title>");
        out.println("</head>");
        out.println("<body>");

        if("registro".equals(modo)) {
            out.println("<h1>Registro exitoso</h1>");
            out.println("<p>Bienvenido a Parchadit@s, " + nombre + "</p>");
            out.println("<p>Correo registrado: " + correo + "</p>");
        }
        else{
            out.println("<h1>ERROR</h1>");
        }
        out.println("<br>");
        out.println("<a href='index.html'>Volver a Parchadit@s</a>");

        out.println("</body>");
        out.println("</html>");
    }
}


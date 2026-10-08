<%-- menu.jsp: encabezado y navegación reutilizables --%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%!
    // DECLARACIÓN: convierte el texto en algo seguro para mostrar en HTML
    private String esc(String texto) {
        if (texto == null) {
            return "";
        }
        return texto.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#39;");
    }
%>
<%
    String ctx = request.getContextPath();
    String nombre = (String) session.getAttribute("nombre");
%>
<header>
  <div class="logo">
    <h1 class="Princi">PARCHADIT@S</h1>
  </div>
  <nav>
    <a class="btn-usuario" href="<%= ctx %>/index.jsp">Inicio</a>
    <% if (nombre != null) { %>
      <span>Hola, <%= esc(nombre) %></span>
      <button id="btnCerrarSesion" class="btn-usuario" type="button">Salir</button>
    <% } else { %>
      <a class="btn-usuario" href="<%= ctx %>/login.jsp">👤 Iniciar sesión</a>
    <% } %>
  </nav>
</header>
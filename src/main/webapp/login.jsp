<%-- login.jsp: inicio de sesión y registro; el formulario lo envía colosal.js al AuthServlet --%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ include file="/WEB-INF/componentes/categorias.jspf" %>
<% String ctx = request.getContextPath(); %>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parchadit@s - Acceder</title>
  <link rel="stylesheet" href="<%= ctx %>/css/algomelo.css">
</head>
<body data-base="<%= ctx %>">

  <jsp:include page="/WEB-INF/componentes/menu.jsp" />

  <section class="auth">
    <div class="auth-tabs">
      <button type="button" class="auth-tab active" data-modo="login">Iniciar sesión</button>
      <button type="button" class="auth-tab" data-modo="registro">Registrarme</button>
    </div>

    <form id="formAuth">
      <input type="text" id="aNombre" placeholder="Nombre" maxlength="50" class="oculto">
      <input type="email" id="aCorreo" placeholder="Correo" maxlength="100" required>
      <input type="password" id="aContrasena" placeholder="Contraseña" maxlength="100" required>

      <div id="camposIntereses" class="oculto">
        <p class="label-intereses">Elige tus planes favoritos:</p>
        <div class="chips-intereses">
          <% for (String[] cat : CATEGORIAS) { %>
            <label><input type="checkbox" value="<%= cat[0] %>"> <%= cat[1] %></label>
          <% } %>
        </div>
      </div>

      <button type="submit" id="btnAuthSubmit">Iniciar sesión</button>
    </form>
  </section>

  <div id="toastContainer" class="toast-container"></div>
  <jsp:include page="/WEB-INF/componentes/footer.jsp" />
  <script src="<%= ctx %>/js/colosal.js"></script>
</body>
</html>
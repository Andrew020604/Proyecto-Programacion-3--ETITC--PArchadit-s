<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ include file="/WEB-INF/componentes/categorias.jspf" %>
<% String ctx = request.getContextPath(); %>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parchadit@s</title>
  <link rel="stylesheet" href="<%= ctx %>/css/algomelo.css">
</head>
<body data-base="<%= ctx %>">

  <jsp:include page="/WEB-INF/componentes/menu.jsp" />

  <nav class="categories">
    <button type="button" class="chip active" data-categoria="todos">Todos</button>
    <% for (String[] cat : CATEGORIAS) { %>
      <button type="button" class="chip" data-categoria="<%= cat[0] %>"><%= cat[1] %></button>
    <% } %>
  </nav>

  <nav>
    <button type="button" id="btnParaTi">Para Ti</button>
    <button type="button" id="btnExplorar" class="activar-feed">Explorar</button>
  </nav>

  <main class="feed" id="feed"></main>

  <button type="button" id="btnCrearEvento" class="fab oculto">+</button>

  <div class="overlay-crear oculto" id="overlayCrear">
    <section class="crear-evento">
      <button type="button" id="btnCerrarCrear" class="btn-cerrar">X</button>
      <h2>Crea tu parche</h2>

      <form id="formEvento">
        <input type="text" id="fTitulo" placeholder="Título del evento" maxlength="80" required>

        <select id="fCategoria">
          <% for (String[] cat : CATEGORIAS) { %>
            <option value="<%= cat[0] %>"><%= cat[1] %></option>
          <% } %>
        </select>

        <input type="text" id="fUbicacion" placeholder="Ubicación" maxlength="100" required>
        <input type="text" id="fDescripcion" placeholder="Descripción" maxlength="300" required>
        <input type="number" id="fCupos" placeholder="Cupos totales" min="1" max="500" required>

        <button type="submit">Publicar</button>
      </form>
    </section>
  </div>

  <div id="toastContainer" class="toast-container"></div>
  <jsp:include page="/WEB-INF/componentes/footer.jsp" />

  <script src="<%= ctx %>/js/colosal.js"></script>
  <script src="<%= ctx %>/js/inicio.js"></script>
</body>
</html>
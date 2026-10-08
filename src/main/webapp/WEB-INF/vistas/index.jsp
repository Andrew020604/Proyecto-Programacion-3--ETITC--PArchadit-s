<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="ctx" value="${pageContext.request.contextPath}"/>
<c:set var="conSesion" value="${not empty sessionScope.correo}"/>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parchadit@s</title>
  <link rel="stylesheet" href="${ctx}/css/algomelo.css">
</head>
<body>
  <header>
    <div class="logo">
      <h1 class="Princi">PARCHADIT@S</h1>
    </div>
    <nav>
      <c:choose>
        <c:when test="${conSesion}">
          <span>Hola, <c:out value="${sessionScope.nombre}"/></span>
          <form action="${ctx}/logout" method="post" style="display:inline">
            <button type="submit" class="btn-usuario">Salir</button>
          </form>
        </c:when>
        <c:otherwise>
          <a class="btn-usuario" href="${ctx}/login.jsp">👤 Iniciar sesión</a>
        </c:otherwise>
      </c:choose>
    </nav>
  </header>

  <nav class="categories">
    <c:url var="urlTodos" value="/inicio">
      <c:param name="vista" value="${vista}"/>
    </c:url>
    <a class="chip ${categoria == 'todos' ? 'active' : ''}" href="<c:out value='${urlTodos}'/>">Todos</a>

    <c:forEach var="cat" items="${categorias}">
      <c:url var="urlCat" value="/inicio">
        <c:param name="vista" value="${vista}"/>
        <c:param name="categoria" value="${cat.key}"/>
      </c:url>
      <a class="chip ${categoria == cat.key ? 'active' : ''}" href="<c:out value='${urlCat}'/>">
        <c:out value="${cat.value}"/>
      </a>
    </c:forEach>
  </nav>

  <nav>
    <c:url var="urlParaTi" value="/inicio">
      <c:param name="vista" value="parati"/>
      <c:param name="categoria" value="${categoria}"/>
    </c:url>
    <c:url var="urlExplorar" value="/inicio">
      <c:param name="vista" value="explorar"/>
      <c:param name="categoria" value="${categoria}"/>
    </c:url>
    <a id="btnParaTi" class="${vista == 'parati' ? 'activar-feed' : ''}" href="<c:out value='${urlParaTi}'/>">Para Ti</a>
    <a id="btnExplorar" class="${vista == 'explorar' ? 'activar-feed' : ''}" href="<c:out value='${urlExplorar}'/>">Explorar</a>
  </nav>

  <div class="avisos">
    <c:if test="${not empty flashError}">
      <p class="mensaje-error"><c:out value="${flashError}"/></p>
    </c:if>
    <c:if test="${not empty flashOk}">
      <p class="mensaje-ok"><c:out value="${flashOk}"/></p>
    </c:if>
  </div>

  <main class="feed">
    <c:forEach var="e" items="${eventos}">
      <article class="card">
        <h3 class="card-title"><c:out value="${e.titulo}"/></h3>
        <p class="card-meta">
          <c:out value="${categorias[e.categoria]}"/> · 📍 <c:out value="${e.ubicacion}"/>
        </p>
        <p><c:out value="${e.descripcion}"/></p>
        <p class="card-cupos">👥 ${e.cuposOcupados}/${e.cuposTotales} · ❤️ ${e.likes}</p>
      </article>
    </c:forEach>

    <c:if test="${empty eventos}">
      <p class="feed-vacio">No hay parches en esta categoría todavía.</p>
    </c:if>
  </main>

  <c:if test="${conSesion}">
    <button type="button" id="btnCrearEvento" class="fab">+</button>

    <div class="overlay-crear oculto" id="overlayCrear">
      <section class="crear-evento">
        <button type="button" id="btnCerrarCrear" class="btn-cerrar">X</button>
        <h2>Crea tu parche</h2>

        <form action="${ctx}/evento" method="post">
          <input type="text" name="titulo" placeholder="Título del evento" maxlength="80" required>

          <select name="categoria">
            <c:forEach var="cat" items="${categorias}">
              <option value="${cat.key}"><c:out value="${cat.value}"/></option>
            </c:forEach>
          </select>

          <input type="text" name="ubicacion" placeholder="Ubicación" maxlength="100" required>
          <input type="text" name="descripcion" placeholder="Descripción" maxlength="300" required>
          <input type="number" name="cupos" placeholder="Cupos totales" min="1" max="500" required>

          <button type="submit">Publicar</button>
        </form>
      </section>
    </div>
  </c:if>

  <footer>PARCHADIT@S</footer>
  <script src="${ctx}/js/inicio.js"></script>
</body>
</html>
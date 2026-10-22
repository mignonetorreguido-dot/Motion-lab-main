/**
 * ========================================================================
 * BOTÓN DE CIERRE DE SESIÓN SIN JAVASCRIPT (components/LogoutButton.js)
 * ========================================================================
 * Envía un POST real a /salir. Al ser un formulario HTML, funciona incluso
 * si la página todavía no terminó de hidratarse o si un chunk de JS falló.
 */

export default function LogoutButton({
  children,
  className = '',
  title = 'Cerrar sesión',
}) {
  return (
    <form action="/salir" method="post" className="contents">
      <button type="submit" className={className} title={title}>
        {children}
      </button>
    </form>
  );
}

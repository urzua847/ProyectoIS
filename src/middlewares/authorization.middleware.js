/**
 * Autoriza el acceso basado en los roles del usuario.
 * @param {...string} allowedRoles - Roles permitidos para acceder al recurso.
 * @returns {function} Middleware de Express.
 */
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user || !req.user.roles) {
        return res.status(403).json({ message: "Acceso denegado. No se encontraron roles de usuario." });
      }
  
      const hasPermission = req.user.roles.some((role) =>
        allowedRoles.includes(role),
      );
  
      if (hasPermission) {
        next();
      } else {
        res.status(403).json({ message: "Acceso denegado. No tienes el rol requerido." });
      }
    };
  }
  
  module.exports = {
    authorizeRoles,
  };
  
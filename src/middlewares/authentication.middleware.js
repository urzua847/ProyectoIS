const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { ACCESS_JWT_SECRET } = require("../config/configEnv");

/**
 * Autentica un token del encabezado de la solicitud.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función del siguiente middleware de Express.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ message: "No se proporcionó token." });
  }

  jwt.verify(token, ACCESS_JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido o expirado." });
    }
    // Adjuntar el objeto de usuario (decodificado del token) a la solicitud
    // Es una buena práctica obtener el usuario completo de la base de datos para datos frescos,
    // especialmente para verificaciones de roles y estado.
    try {
      const foundUser = await User.findById(user.id); // Asumiendo que el token contiene user.id
      if (!foundUser) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }
      req.user = foundUser;
      next();
    } catch (dbError) {
      return res.status(500).json({ message: "Error al obtener los datos del usuario.", error: dbError.message });
    }
  });
}

module.exports = {
  authenticateToken,
};

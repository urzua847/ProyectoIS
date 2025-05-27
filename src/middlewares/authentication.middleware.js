// src/middlewares/authentication.middleware.js
// Adaptación de tu verifyJWT para que funcione con Sequelize y guarde el ID del usuario.
import jwt from 'jsonwebtoken';
import { ACCESS_JWT_SECRET } from '../config/configEnv.js';
import { respondError } from '../utils/resHandler.js';
import { handleError } from '../utils/errorHandler.js';
import { Usuario } from '../models/index.js'; // Para buscar el usuario por email si es necesario

/**
 * Verifica el token de acceso JWT.
 * Si es válido, añade el objeto del usuario (o al menos su ID y roles) a `req.user`.
 */
const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return respondError(req, res, 401, 'No autorizado. Formato de token inválido.');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, ACCESS_JWT_SECRET, async (err, decoded) => {
      if (err) {
        // Manejar errores específicos del token
        if (err.name === 'TokenExpiredError') {
          return respondError(req, res, 401, 'No autorizado. Token expirado.');
        }
        if (err.name === 'JsonWebTokenError') {
          return respondError(req, res, 401, 'No autorizado. Token inválido.');
        }
        return respondError(req, res, 403, 'No autorizado.', err.message);
      }

      // El token es válido, 'decoded' contiene el payload (ej. email, id, roles)
      // Buscamos al usuario en la BD para asegurarnos de que existe y obtener info actualizada.
      // Esto es opcional pero más seguro. Podrías confiar en el payload del token si prefieres.
      const usuario = await Usuario.findOne({
        where: { email: decoded.email }, // Asumiendo que el email está en el token
        // attributes: ['id', 'email', 'esDirectiva', 'directivaVigente', 'roleId'], // Selecciona los campos que necesitas
        // include: [{ model: Role, as: 'role', attributes: ['name'] }] // Incluye el rol
      });

      if (!usuario) {
        return respondError(req, res, 401, 'No autorizado. Usuario del token no encontrado.');
      }
      
      // Adjuntar información del usuario (o al menos el ID) al objeto request.
      // Esto permite que los siguientes middlewares y controladores accedan al usuario autenticado.
      req.user = {
        id: usuario.id,
        email: usuario.email,
        esDirectiva: usuario.esDirectiva,
        directivaVigente: usuario.directivaVigente,
        // role: usuario.role ? usuario.role.name : null, // Nombre del rol
        // Puedes añadir más campos si son necesarios para la autorización
      };
      // También podrías mantener la estructura original si es requerida por otros middlewares:
      // req.email = decoded.email;
      // req.roles = decoded.roles; // Si los roles están directamente en el token y no los buscas de la BD

      next();
    });
  } catch (error) {
    handleError(error, 'authentication.middleware -> verifyJWT');
    return respondError(req, res, 500, 'Error interno del servidor durante la autenticación.');
  }
};

export default verifyJWT;

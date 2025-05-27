// src/middlewares/authorization.middleware.js
// Adaptación y expansión de tu authorization.middleware.js
import { Usuario, Role } from '../models/index.js'; // Usando modelos Sequelize
import { respondError } from '../utils/resHandler.js';
import { handleError } from '../utils/errorHandler.js';

/**
 * Comprueba si el usuario tiene el rol de 'admin'.
 */
export async function isAdmin(req, res, next) {
  try {
    // req.user es establecido por el middleware de autenticación (verifyJWT)
    // y debería contener el ID del usuario o la información necesaria.
    if (!req.user || !req.user.id) {
      return respondError(req, res, 401, 'No autenticado.');
    }

    const usuario = await Usuario.findByPk(req.user.id, {
      include: [{ model: Role, as: 'role' }],
    });

    if (!usuario || !usuario.role) {
      return respondError(req, res, 403, 'Acceso denegado. Rol no encontrado.');
    }

    if (usuario.role.name === 'admin') {
      next();
    } else {
      return respondError(req, res, 403, 'Acceso denegado. Se requiere rol de administrador.');
    }
  } catch (error) {
    handleError(error, 'authorization.middleware -> isAdmin');
    return respondError(req, res, 500, 'Error interno del servidor al verificar autorización.');
  }
}

/**
 * Comprueba si el usuario es un miembro de la directiva vigente.
 * Esto es crucial para crear/modificar asambleas.
 */
export async function isDirectivaVigente(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return respondError(req, res, 401, 'No autenticado.');
    }

    const usuario = await Usuario.findByPk(req.user.id);

    if (!usuario) {
      return respondError(req, res, 403, 'Acceso denegado. Usuario no encontrado.');
    }

    // Verifica los campos 'esDirectiva' y 'directivaVigente' del modelo Usuario
    if (usuario.esDirectiva && usuario.directivaVigente) {
      next();
    } else {
      return respondError(req, res, 403, 'Acceso denegado. Se requiere ser miembro vigente de la directiva.');
    }
  } catch (error) {
    handleError(error, 'authorization.middleware -> isDirectivaVigente');
    return respondError(req, res, 500, 'Error interno del servidor al verificar autorización de directiva.');
  }
}

/**
 * Comprueba si el usuario es admin O un miembro de la directiva vigente.
 * Útil para acciones que ambos pueden realizar (ej. gestionar vecinos).
 */
export async function isAdminOrDirectiva(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return respondError(req, res, 401, 'No autenticado.');
    }

    const usuario = await Usuario.findByPk(req.user.id, {
      include: [{ model: Role, as: 'role' }],
    });

    if (!usuario) {
      return respondError(req, res, 403, 'Acceso denegado. Usuario no encontrado.');
    }

    // Comprueba si es admin
    if (usuario.role && usuario.role.name === 'admin') {
      return next();
    }

    // Comprueba si es directiva vigente
    if (usuario.esDirectiva && usuario.directivaVigente) {
      return next();
    }

    return respondError(req, res, 403, 'Acceso denegado. Se requiere rol de administrador o ser miembro vigente de la directiva.');
  } catch (error) {
    handleError(error, 'authorization.middleware -> isAdminOrDirectiva');
    return respondError(req, res, 500, 'Error interno del servidor al verificar autorización.');
  }
}

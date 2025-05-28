import { Usuario, Role } from '../models/index.js'; 
import { respondError } from '../utils/resHandler.js';
import { handleError } from '../utils/errorHandler.js';


export async function isAdmin(req, res, next) {
  try {
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

export async function isDirectivaVigente(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return respondError(req, res, 401, 'No autenticado.');
    }

    const usuario = await Usuario.findByPk(req.user.id);

    if (!usuario) {
      return respondError(req, res, 403, 'Acceso denegado. Usuario no encontrado.');
    }

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

    if (usuario.role && usuario.role.name === 'admin') {
      return next();
    }

    if (usuario.esDirectiva && usuario.directivaVigente) {
      return next();
    }

    return respondError(req, res, 403, 'Acceso denegado. Se requiere rol de administrador o ser miembro vigente de la directiva.');
  } catch (error) {
    handleError(error, 'authorization.middleware -> isAdminOrDirectiva');
    return respondError(req, res, 500, 'Error interno del servidor al verificar autorización.');
  }
}

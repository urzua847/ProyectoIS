import jwt from 'jsonwebtoken';
import { ACCESS_JWT_SECRET } from '../config/configEnv.js';
import { respondError } from '../utils/resHandler.js';
import { handleError } from '../utils/errorHandler.js';
import { Usuario } from '../models/index.js';

const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return respondError(req, res, 401, 'No autorizado. Formato de token inválido.');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, ACCESS_JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return respondError(req, res, 401, 'No autorizado. Token expirado.');
        }
        if (err.name === 'JsonWebTokenError') {
          return respondError(req, res, 401, 'No autorizado. Token inválido.');
        }
        return respondError(req, res, 403, 'No autorizado.', err.message);
      }

      const usuario = await Usuario.findOne({
        where: { email: decoded.email },
      });

      if (!usuario) {
        return respondError(req, res, 401, 'No autorizado. Usuario del token no encontrado.');
      }

      req.user = {
        id: usuario.id,
        email: usuario.email,
        esDirectiva: usuario.esDirectiva,
        directivaVigente: usuario.directivaVigente,

      };

      next();
    });
  } catch (error) {
    handleError(error, 'authentication.middleware -> verifyJWT');
    return respondError(req, res, 500, 'Error interno del servidor durante la autenticación.');
  }
};

export default verifyJWT;

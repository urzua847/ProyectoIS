import jwt from 'jsonwebtoken';
import { Usuario, Role } from '../models/index.js'; 
import {
  ACCESS_JWT_SECRET,
  REFRESH_JWT_SECRET,
  ACCESS_JWT_EXPIRES_IN,
  REFRESH_JWT_EXPIRES_IN,
} from '../config/configEnv.js';
import { handleError } from '../utils/errorHandler.js';

class AuthService {
  /**
   * @param {string} email 
   * @param {string} password
   * @returns {Promise<[string|null, string|null, string|null]>} - [accessToken, refreshToken, errorMensaje]
   */
  async login(email, password) {
    try {
      const userFound = await Usuario.findOne({
        where: { email },
        include: [{ model: Role, as: 'role', attributes: ['name'] }],
      });

      if (!userFound) {
        return [null, null, 'El correo electrónico o la contraseña son incorrectos.'];
      }

      const matchPassword = await userFound.comparePassword(password); 
      if (!matchPassword) {
        return [null, null, 'El correo electrónico o la contraseña son incorrectos.'];
      }

      const accessTokenPayload = {
        id: userFound.id,
        email: userFound.email,
        role: userFound.role ? userFound.role.name : null, 
        esDirectiva: userFound.esDirectiva,
        directivaVigente: userFound.directivaVigente,
      };

      const refreshTokenPayload = {
        id: userFound.id,
        email: userFound.email,
      };

      const accessToken = jwt.sign(accessTokenPayload, ACCESS_JWT_SECRET, {
        expiresIn: ACCESS_JWT_EXPIRES_IN,
      });

      const refreshToken = jwt.sign(refreshTokenPayload, REFRESH_JWT_SECRET, {
        expiresIn: REFRESH_JWT_EXPIRES_IN,
      });

      return [accessToken, refreshToken, null];
    } catch (error) {
      handleError(error, 'auth.service -> login');
      return [null, null, 'Error al intentar iniciar sesión.'];
    }
  }

  /**
   * @param {string} providedRefreshToken 
   * @returns {Promise<[string|null, string|null]>}
   */
  async refreshAccessToken(providedRefreshToken) {
    try {
      const decoded = jwt.verify(providedRefreshToken, REFRESH_JWT_SECRET);

      const userFound = await Usuario.findByPk(decoded.id, {
        include: [{ model: Role, as: 'role', attributes: ['name'] }],
      });

      if (!userFound) {
        return [null, 'Usuario no encontrado o token inválido.'];
      }

      const accessTokenPayload = {
        id: userFound.id,
        email: userFound.email,
        role: userFound.role ? userFound.role.name : null,
        esDirectiva: userFound.esDirectiva,
        directivaVigente: userFound.directivaVigente,
      };
      const newAccessToken = jwt.sign(accessTokenPayload, ACCESS_JWT_SECRET, {
        expiresIn: ACCESS_JWT_EXPIRES_IN,
      });

      return [newAccessToken, null];
    } catch (error) {
      handleError(error, 'auth.service -> refreshAccessToken');
      if (error.name === 'TokenExpiredError') {
        return [null, 'La sesión ha caducado, por favor inicie sesión de nuevo. (Refresh Token Expirado)'];
      }
      if (error.name === 'JsonWebTokenError') {
        return [null, 'Token de refresco inválido.'];
      }
      return [null, 'Error al refrescar el token.'];
    }
  }
}

export default new AuthService();

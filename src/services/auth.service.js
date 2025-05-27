// src/services/auth.service.js
import jwt from 'jsonwebtoken';
import { Usuario, Role } from '../models/index.js'; // Modelos Sequelize
import {
  ACCESS_JWT_SECRET,
  REFRESH_JWT_SECRET,
  ACCESS_JWT_EXPIRES_IN,
  REFRESH_JWT_EXPIRES_IN,
} from '../config/configEnv.js';
import { handleError } from '../utils/errorHandler.js';

class AuthService {
  /**
   * Inicia sesión con un usuario.
   * @param {string} email - Email del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<[string|null, string|null, string|null]>} - [accessToken, refreshToken, errorMensaje]
   */
  async login(email, password) {
    try {
      const userFound = await Usuario.findOne({
        where: { email },
        include: [{ model: Role, as: 'role', attributes: ['name'] }], // Incluir el nombre del rol
      });

      if (!userFound) {
        return [null, null, 'El correo electrónico o la contraseña son incorrectos.'];
      }

      const matchPassword = await userFound.comparePassword(password); // Usar el método del modelo
      if (!matchPassword) {
        return [null, null, 'El correo electrónico o la contraseña son incorrectos.'];
      }

      // Payload para el Access Token
      const accessTokenPayload = {
        id: userFound.id,
        email: userFound.email,
        role: userFound.role ? userFound.role.name : null, // Nombre del rol
        esDirectiva: userFound.esDirectiva,
        directivaVigente: userFound.directivaVigente,
      };

      // Payload para el Refresh Token (generalmente más simple)
      const refreshTokenPayload = {
        id: userFound.id,
        email: userFound.email, // Para poder buscar al usuario si es necesario
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
   * Refresca el token de acceso usando un refresh token.
   * @param {string} providedRefreshToken - El refresh token.
   * @returns {Promise<[string|null, string|null]>} - [newAccessToken, errorMensaje]
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

      // Generar un nuevo Access Token
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

// src/controllers/auth.controller.js
import AuthService from '../services/auth.service.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';
import { handleError } from '../utils/errorHandler.js';
import { loginSchema } //, refreshTokenSchema (si se usa en body)
  from '../schemas/auth.schema.js';
import { REFRESH_JWT_EXPIRES_IN } from '../config/configEnv.js'; // Para la cookie
import UserService from '../services/user.service.js';

class AuthController {
  async login(req, res) {
    try {
      const { error: bodyError } = loginSchema.validate(req.body);
      if (bodyError) {
        return respondError(req, res, 400, bodyError.details[0].message);
      }

      const { email, password } = req.body;
      const [accessToken, refreshToken, errorMsg] = await AuthService.login(email, password);

      if (errorMsg) {
        return respondError(req, res, 401, errorMsg); // 401 Unauthorized
      }

      // Configurar cookie para el refreshToken
      // El tiempo de expiración de la cookie debe coincidir con el del token de refresco.
      // Convertir expiresIn (ej: '7d') a milisegundos para maxAge
      let maxAgeMs;
      if (REFRESH_JWT_EXPIRES_IN.endsWith('d')) {
        maxAgeMs = parseInt(REFRESH_JWT_EXPIRES_IN, 10) * 24 * 60 * 60 * 1000;
      } else if (REFRESH_JWT_EXPIRES_IN.endsWith('h')) {
        maxAgeMs = parseInt(REFRESH_JWT_EXPIRES_IN, 10) * 60 * 60 * 1000;
      } else if (REFRESH_JWT_EXPIRES_IN.endsWith('m')) {
        maxAgeMs = parseInt(REFRESH_JWT_EXPIRES_IN, 10) * 60 * 1000;
      } else {
        maxAgeMs = 7 * 24 * 60 * 60 * 1000; // Default a 7 días si el formato no es reconocido
      }


      res.cookie('jwt_refresh', refreshToken, {
        httpOnly: true, // Previene acceso desde JavaScript del lado del cliente
        secure: process.env.NODE_ENV === 'production', // Usar true en producción (HTTPS)
        sameSite: 'Strict', // O 'Lax', ayuda a prevenir ataques CSRF
        maxAge: maxAgeMs,
      });

      respondSuccess(req, res, 200, { accessToken });
    } catch (error) {
      handleError(error, 'auth.controller -> login');
      respondError(req, res, 500, 'Error interno del servidor durante el inicio de sesión.');
    }
  }

  async refresh(req, res) {
    try {
      const refreshTokenFromCookie = req.cookies.jwt_refresh;
      if (!refreshTokenFromCookie) {
        return respondError(req, res, 401, 'No autorizado. No se encontró token de refresco.');
      }

      const [newAccessToken, errorMsg] = await AuthService.refreshAccessToken(refreshTokenFromCookie);

      if (errorMsg) {
        // Si el refresh token es inválido o expirado, limpiar la cookie
        res.clearCookie('jwt_refresh', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
        return respondError(req, res, 403, errorMsg); // 403 Forbidden
      }

      respondSuccess(req, res, 200, { accessToken: newAccessToken });
    } catch (error) {
      handleError(error, 'auth.controller -> refresh');
      respondError(req, res, 500, 'Error interno del servidor al refrescar el token.');
    }
  }

  async logout(req, res) {
    try {
      // Limpiar la cookie del refreshToken
      const refreshTokenFromCookie = req.cookies.jwt_refresh;
      if (!refreshTokenFromCookie) {
        // Incluso si no hay cookie, el logout puede considerarse exitoso del lado del cliente
        return respondSuccess(req, res, 200, { message: 'Cierre de sesión completado (sin cookie activa).' });
      }

      res.clearCookie('jwt_refresh', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });

      respondSuccess(req, res, 200, { message: 'Cierre de sesión exitoso.' });
    } catch (error) {
      handleError(error, 'auth.controller -> logout');
      respondError(req, res, 500, 'Error interno del servidor durante el cierre de sesión.');
    }
  }

  // Podrías añadir un endpoint para obtener el perfil del usuario actual (req.user)
  async getCurrentUser(req, res) {
    try {
      // req.user es establecido por el authenticationMiddleware
      if (!req.user || !req.user.id) {
        return respondError(req, res, 401, 'No autenticado o usuario no encontrado.');
      }
      // El servicio de usuario podría tener un método para buscar por ID y devolver datos limpios
      const [userProfile, errorMsg] = await UserService.getUserById(req.user.id);
      if (errorMsg) {
        return respondError(req, res, 404, errorMsg);
      }
      respondSuccess(req, res, 200, userProfile);
    } catch (error) {
      handleError(error, 'auth.controller -> getCurrentUser');
      respondError(req, res, 500, 'Error al obtener el perfil del usuario.');
    }
  }
}

export default new AuthController();
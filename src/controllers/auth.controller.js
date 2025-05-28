import AuthService from '../services/auth.service.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';
import { handleError } from '../utils/errorHandler.js';
import { loginSchema }
  from '../schemas/auth.schema.js';
import { REFRESH_JWT_EXPIRES_IN } from '../config/configEnv.js';
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
        return respondError(req, res, 401, errorMsg);
      }

      let maxAgeMs;
      if (REFRESH_JWT_EXPIRES_IN.endsWith('d')) {
        maxAgeMs = parseInt(REFRESH_JWT_EXPIRES_IN, 10) * 24 * 60 * 60 * 1000;
      } else if (REFRESH_JWT_EXPIRES_IN.endsWith('h')) {
        maxAgeMs = parseInt(REFRESH_JWT_EXPIRES_IN, 10) * 60 * 60 * 1000;
      } else if (REFRESH_JWT_EXPIRES_IN.endsWith('m')) {
        maxAgeMs = parseInt(REFRESH_JWT_EXPIRES_IN, 10) * 60 * 1000;
      } else {
        maxAgeMs = 7 * 24 * 60 * 60 * 1000; 
      }


      res.cookie('jwt_refresh', refreshToken, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'Strict', 
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
        res.clearCookie('jwt_refresh', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
        return respondError(req, res, 403, errorMsg); 
      }

      respondSuccess(req, res, 200, { accessToken: newAccessToken });
    } catch (error) {
      handleError(error, 'auth.controller -> refresh');
      respondError(req, res, 500, 'Error interno del servidor al refrescar el token.');
    }
  }

  async logout(req, res) {
    try {
      const refreshTokenFromCookie = req.cookies.jwt_refresh;
      if (!refreshTokenFromCookie) {
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

  async getCurrentUser(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return respondError(req, res, 401, 'No autenticado o usuario no encontrado.');
      }
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
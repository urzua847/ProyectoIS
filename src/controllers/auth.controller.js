    // src/controllers/auth.controller.js
    "use strict";
    // Servicios de autenticación y vecino (para registro)
    import { loginService, registerService as registerVecinoService, refreshTokenService } from "../services/auth.service.js"; 
    
    // Validaciones Joi para autenticación
    import {
      authLoginValidation,
      authRegisterValidation, 
      authRefreshTokenValidation,
    } from "../validations/auth.validation.js"; 

    // Manejadores de respuesta estándar
    import {
      handleErrorClient,
      handleErrorServer,
      handleSuccess,
    } from "../handlers/responseHandlers.js";

    const REFRESH_TOKEN_COOKIE_NAME = "jid_vecinos"; // Nombre específico para la cookie de refresh token

    /**
     * Controlador para el inicio de sesión de vecinos.
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    export async function loginController(req, res) {
      try {
        const { body } = req;

        const { error: validationError } = authLoginValidation.validate(body);
        if (validationError) {
          const errors = validationError.details.map(d => ({ field: d.path.join("."), message: d.message }));
          return handleErrorClient(res, 400, "Error de validación en los datos de inicio de sesión.", errors);
        }

        const [tokens, serviceError] = await loginService(body); 

        if (serviceError) {
          const statusCode = serviceError.field ? 400 : 401;
          return handleErrorClient(res, statusCode, serviceError.message, serviceError);
        }

        res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict", // O 'lax' si hay problemas con redirecciones entre sitios
          path: "/api/auth/refresh-token", // Ruta específica de la cookie
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        });

        return handleSuccess(res, 200, "Inicio de sesión exitoso.", {
          accessToken: tokens.accessToken,
        });

      } catch (error) {
        console.error("Error en loginController:", error);
        return handleErrorServer(res, 500, "Error interno del servidor durante el inicio de sesión.");
      }
    }

    /**
     * Controlador para el registro de nuevos vecinos.
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    export async function registerController(req, res) {
      try {
        const { body } = req;

        const { error: validationError } = authRegisterValidation.validate(body);
        if (validationError) {
          const errors = validationError.details.map(d => ({ field: d.path.join("."), message: d.message }));
          return handleErrorClient(res, 400, "Error de validación en los datos de registro.", errors);
        }

        const [nuevoVecino, serviceError] = await registerVecinoService(body);

        if (serviceError) {
          return handleErrorClient(res, 400, serviceError.message, serviceError);
        }

        return handleSuccess(res, 201, "Vecino registrado con éxito. Por favor, inicia sesión.", nuevoVecino);

      } catch (error) {
        console.error("Error en registerController:", error);
        return handleErrorServer(res, 500, "Error interno del servidor durante el registro.");
      }
    }

    /**
     * Controlador para cerrar sesión (logout).
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    export async function logoutController(req, res) {
      try {
        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/api/auth/refresh-token",
        });
        return handleSuccess(res, 200, "Sesión cerrada exitosamente.");
      } catch (error) {
        console.error("Error en logoutController:", error);
        return handleErrorServer(res, 500, "Error interno del servidor al cerrar sesión.");
      }
    }

    /**
     * Controlador para refrescar el Access Token.
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    export async function refreshTokenController(req, res) {
      try {
        const refreshTokenFromCookie = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

        const { error: validationError } = authRefreshTokenValidation.validate({ refreshToken: refreshTokenFromCookie });
        if (validationError) {
          return handleErrorClient(res, 401, "No se proporcionó un token de refresco válido.");
        }

        const [newTokens, serviceError] = await refreshTokenService(refreshTokenFromCookie);

        if (serviceError) {
          res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: "/api/auth/refresh-token" });
          return handleErrorClient(res, 401, serviceError.message, serviceError);
        }

        return handleSuccess(res, 200, "Token de acceso refrescado exitosamente.", {
          accessToken: newTokens.accessToken,
        });

      } catch (error) {
        console.error("Error en refreshTokenController:", error);
        return handleErrorServer(res, 500, "Error interno del servidor al refrescar el token.");
      }
    }

    /**
     * Controlador para obtener el perfil del vecino autenticado.
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    export async function getProfileController(req, res) {
      try {
        if (!req.user) { // req.user es poblado por authenticateJwt (que usa la entidad Vecino)
          return handleErrorClient(res, 401, "Vecino no autenticado.");
        }
        // La contraseña ya debería estar excluida por el servicio o la estrategia JWT
        return handleSuccess(res, 200, "Perfil del vecino obtenido exitosamente.", req.user);
      } catch (error) {
        console.error("Error en getProfileController:", error);
        return handleErrorServer(res, 500, "Error interno del servidor al obtener el perfil.");
      }
    }

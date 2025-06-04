// src/middlewares/authentication.middleware.js
"use strict";
import passport from "passport";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js"; // Asumiendo que tienes estos manejadores
/**
 * Middleware para autenticar solicitudes usando la estrategia JWT de Passport (nombrada 'jwt-vecino').
 * Si la autenticación es exitosa, añade el objeto `vecino` (del payload del token) a `req.user`.
 * Si falla, responde con un error 401 (No Autorizado) o 500 (Error del Servidor).
 *
 * @param {import("express").Request} req - Objeto de solicitud de Express.
 * @param {import("express").Response} res - Objeto de respuesta de Express.
 * @param {import("express").NextFunction} next - Función para pasar al siguiente middleware.
 */
export function authenticateJwt(req, res, next) {

  passport.authenticate(
    "jwt-vecino",
    { session: false },
    (error, vecino, info) => {
      if (error) {
        return handleErrorServer(
          res,
          500,
          "Error de autenticación en el servidor.",
          process.env.NODE_ENV === "development" ? error.message : undefined
        );
      }

      if (!vecino) {
        let mensajeCliente = "Acceso no autorizado. Se requiere token válido.";
        if (info instanceof Error) {
          // info puede ser un error como TokenExpiredError
          if (info.name === "TokenExpiredError") {
            mensajeCliente =
              "Token de acceso expirado. Por favor, inicia sesión de nuevo o refresca tu token.";
          } else if (info.name === "JsonWebTokenError") {
            mensajeCliente = "Token de acceso inválido o malformado.";
          } else if (info.message) {
            // Otros mensajes de la estrategia
            mensajeCliente = info.message;
          }
        } else if (typeof info === "object" && info && info.message) {
          mensajeCliente = info.message;
        }

        return handleErrorClient(
          res,
          401, // Unauthorized
          mensajeCliente
        );
      }

      // al objeto 'req' como 'req.user' para que esté disponible en los siguientes middlewares y controladores.
      req.user = vecino; // Ahora req.user contendrá la información del vecino autenticado
      next(); 
    }
  )(req, res, next);
}

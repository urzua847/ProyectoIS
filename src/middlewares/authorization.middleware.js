"use strict";

import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

/**
 * Middleware para verificar si el vecino autenticado es un miembro vigente de la directiva.
 * Debe usarse DESPUÉS del middleware `authenticateJwt`.
 *
 * @param {import("express").Request} req - Objeto de solicitud de Express (se espera req.user).
 * @param {import("express").Response} res - Objeto de respuesta de Express.
 * @param {import("express").NextFunction} next - Función para pasar al siguiente middleware.
 */
export async function esDirectivaVigente(req, res, next) {
  try {
    // Se asume que authenticateJwt ya pobló req.user con la información del Vecino
    if (!req.user) {
      return handleErrorClient(
        res,
        401, 
        "No autenticado.",
        "Se requiere autenticación para verificar el rol de directiva."
      );
    }

    // Verificar el campo 'esMiembroDirectivaVigente' del objeto Vecino en req.user
    if (req.user.esMiembroDirectivaVigente !== true) {
      return handleErrorClient(
        res,
        403, // Forbidden
        "Acceso denegado.",
        "Se requiere ser un miembro vigente de la directiva para realizar esta acción."
      );
    }

    // Si el vecino es miembro vigente de la directiva, continuar.
    next();
  } catch (error) {
    // Error inesperado al procesar la información del usuario (poco probable si req.user está bien formado)
    console.error("Error en middleware esDirectivaVigente:", error);
    handleErrorServer(
      res,
      500,
      "Error al verificar la autorización de directiva.",
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
}

/**
 * Middleware factory para verificar si el vecino autenticado tiene uno de los rolesJunta permitidos.
 * Debe usarse DESPUÉS del middleware `authenticateJwt`.
 *
 * @param {string[]} allowedRolesJunta - Array de strings con los roles de junta permitidos (ej. ["presidente_directiva", "secretario"]).
 * @returns {function(import("express").Request, import("express").Response, import("express").NextFunction): void} Middleware de autorización.
 */
export function tieneRolJunta(allowedRolesJunta) {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.rolJunta) {
        return handleErrorClient(
          res,
          401, // Unauthorized
          "No autenticado o rol no definido.",
          "Se requiere autenticación y un rol asignado para esta acción."
        );
      }

      const userRolJunta = req.user.rolJunta;

      if (!allowedRolesJunta.includes(userRolJunta)) {
        return handleErrorClient(
          res,
          403, // Forbidden
          "Acceso denegado.",
          `Se requiere uno de los siguientes roles de junta: ${allowedRolesJunta.join(", ")}.`
        );
      }

      // Si el vecino tiene uno de los roles permitidos, continuar.
      next();
    } catch (error) {
      console.error("Error en middleware tieneRolJunta:", error);
      handleErrorServer(
        res,
        500,
        "Error al verificar la autorización por rol de junta.",
        process.env.NODE_ENV === "development" ? error.message : undefined
      );
    }
  };
}

// Ejemplo de un middleware más específico, como "esPresidenteDeDirectiva"
export const esPresidenteDeDirectiva = tieneRolJunta(["presidente_directiva"]);

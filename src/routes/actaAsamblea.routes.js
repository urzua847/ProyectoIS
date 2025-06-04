"use strict";
import { Router } from "express";
import {
  createActaController,
  getActaForAsambleaController, 
  updateActaController,
} from "../controllers/actaAsamblea.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  esDirectivaVigente,
  tieneRolJunta,
} from "../middlewares/authorization.middleware.js";

// (ej. :asambleaId si se monta como /asambleas/:asambleaId/acta)
const router = Router({ mergeParams: true });

// Todas las rutas de actas requieren autenticación.
router.use(authenticateJwt);

// POST /api/asambleas/:asambleaId/acta -> Crear un acta para la asamblea especificada
router.post(
  "/", 
  tieneRolJunta(["secretario", "presidente_directiva"]), // Solo roles específicos pueden crear actas
  createActaController
);

// GET /api/asambleas/:asambleaId/acta -> Obtener el acta de la asamblea especificada
router.get("/", getActaForAsambleaController);

router.patch(
  "/", 
  tieneRolJunta(["secretario", "presidente_directiva"]),
  updateActaController // updateActaController necesitará obtener el idActa a través de la asambleaId
  // o modificarse para tomar el idActa de otra forma si la relación es 1 a 1.
  // Es más común tener una ruta PATCH /api/actas/:idActa
);

// --- Rutas independientes para actas (si se gestionan por su propio ID) ---
// Estas rutas serían montadas en index.routes.js bajo /api/actas

// GET /api/actas/:idActa -> Obtener un acta específica por su ID
// router.get(
//   "/:idActa",
//    getActaByIdController // Necesitarías este controlador y servicio
// );

// PATCH /api/actas/:idActa -> Actualizar un acta específica por su ID
// router.patch(
//   "/:idActa",
//   tieneRolJunta(["secretario", "presidente_directiva"]),
//   updateActaController
// );

// DELETE /api/actas/:idActa -> Eliminar un acta
// router.delete(
//   "/:idActa",
//   tieneRolJunta(["presidente_directiva"]),
//   deleteActaController
// );

export default router;

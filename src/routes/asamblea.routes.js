"use strict";
import { Router } from "express";
import {
  organizarAsambleaController,
  getAsambleasController,
  getAsambleaByIdController,
  updateAsambleaController,
  deleteAsambleaController, 
} from "../controllers/asamblea.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { esDirectivaVigente, tieneRolJunta } from "../middlewares/authorization.middleware.js";
import actaAsambleaRoutesForAsamblea from "./actaAsamblea.routes.js";

const router = Router();

// Todas las rutas de asambleas requieren autenticación.
router.use(authenticateJwt);

// POST /api/asambleas/ -> Organizar una nueva asamblea (solo directiva vigente)
router.post(
  "/",
  esDirectivaVigente,
  organizarAsambleaController
);

// GET /api/asambleas/ -> Obtener lista de todas las asambleas (vecinos registrados y directiva)
router.get("/", getAsambleasController);

// GET /api/asambleas/:id -> Obtener una asamblea específica por ID
router.get("/:id", getAsambleaByIdController);

// PATCH /api/asambleas/:id -> Actualizar una asamblea (ej. cambiar estado, posponer) (solo directiva)
router.patch(
  "/:id",
  esDirectivaVigente,
  updateAsambleaController
);

// DELETE /api/asambleas/:id -> Cancelar/Eliminar una asamblea (solo directiva o roles específicos)
router.delete(
  "/:id",
  tieneRolJunta(["presidente_directiva", "secretario"]), // Solo roles específicos pueden eliminar
  deleteAsambleaController
);

// Anidar rutas para el acta de una asamblea específica
router.use("/:asambleaId/acta", actaAsambleaRoutesForAsamblea);


export default router;
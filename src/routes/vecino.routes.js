"use strict";
import { Router } from "express";
import {
  createVecinoByAdminController, 
  getVecinoByIdController,
  getVecinosController,
  updateVecinoController,
  deleteVecinoController,
} from "../controllers/vecino.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  esDirectivaVigente,
  tieneRolJunta,
  esPresidenteDeDirectiva,
} from "../middlewares/authorization.middleware.js"; 

const router = Router();

// Todas las rutas de gestión de vecinos requieren autenticación.
router.use(authenticateJwt);

// POST /api/vecinos/ -> Crear un nuevo vecino (solo directiva o roles específicos)
router.post(
  "/",
  esDirectivaVigente,
  createVecinoByAdminController
);

// GET /api/vecinos/ -> Obtener lista de todos los vecinos (solo directiva)
router.get("/", esDirectivaVigente, getVecinosController);

// GET /api/vecinos/:id -> Obtener un vecino específico por ID (solo directiva)
router.get("/:id", esDirectivaVigente, getVecinoByIdController);

// PATCH /api/vecinos/:id -> Actualizar un vecino específico por ID (solo directiva)
router.patch("/:id", esDirectivaVigente, updateVecinoController);

// DELETE /api/vecinos/:id -> Eliminar un vecino específico por ID (solo presidente o roles muy específicos)
router.delete(
  "/:id",
  esPresidenteDeDirectiva, 
  deleteVecinoController
);

export default router;

// src/routes/vecino.routes.js
import { Router } from 'express';
import VecinoController from '../controllers/vecino.controller.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js'; // Tu middleware JWT
import { isAdminOrDirectiva } from '../middlewares/authorization.middleware.js'; // Un nuevo middleware de autorización

const router = Router();

// Todas las rutas de vecinos requieren autenticación
router.use(authenticationMiddleware);

// GET /api/vecinos - Obtener todos los vecinos (abierto a directiva/admin)
router.get('/', isAdminOrDirectiva, VecinoController.getAllVecinos);

// POST /api/vecinos - Crear un nuevo vecino (abierto a directiva/admin)
router.post('/', isAdminOrDirectiva, VecinoController.createVecino);

// GET /api/vecinos/:id - Obtener un vecino por ID (abierto a directiva/admin)
router.get('/:id', isAdminOrDirectiva, VecinoController.getVecinoById);

// PUT /api/vecinos/:id - Actualizar un vecino (abierto a directiva/admin)
router.put('/:id', isAdminOrDirectiva, VecinoController.updateVecino);

// DELETE /api/vecinos/:id - Eliminar un vecino (abierto a directiva/admin)
router.delete('/:id', isAdminOrDirectiva, VecinoController.deleteVecino);

export default router;

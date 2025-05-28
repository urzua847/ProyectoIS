import { Router } from 'express';
import AsambleaController from '../controllers/asamblea.controller.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';
import { isDirectivaVigente } from '../middlewares/authorization.middleware.js'; 

const router = Router();

router.use(authenticationMiddleware); 

// GET /api/asambleas - Obtener todas las asambleas (abierto a usuarios autenticados para ver)
router.get('/', AsambleaController.getAllAsambleas);

// POST /api/asambleas - Crear una nueva asamblea (solo directiva vigente)
router.post('/', isDirectivaVigente, AsambleaController.createAsamblea);

// GET /api/asambleas/:id - Obtener una asamblea por ID (abierto a usuarios autenticados)
router.get('/:id', AsambleaController.getAsambleaById);

// PUT /api/asambleas/:id - Actualizar una asamblea (solo directiva vigente)
router.put('/:id', isDirectivaVigente, AsambleaController.updateAsamblea);

// DELETE /api/asambleas/:id - Eliminar una asamblea (solo directiva vigente)
router.delete('/:id', isDirectivaVigente, AsambleaController.deleteAsamblea);

export default router;

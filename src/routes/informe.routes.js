import { Router } from 'express';
import InformeController from '../controllers/informe.controller.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';
import { isAdminOrDirectiva } from '../middlewares/authorization.middleware.js';

const router = Router();

//Autenticando las rutas
router.use(authenticationMiddleware);

//El CRUD de informes solo pueden ser manejados por la directiva/admin

//Obtener todos los informes
router.get('/', isAdminOrDirectiva, InformeController.getAllInformes);

//Crear un informe nuevo
router.post('/', isAdminOrDirectiva, InformeController.createInforme);

//Obtener un solo informe por su ID
router.get('/:id', isAdminOrDirectiva, InformeController.getInformeById);

//Actualizar un informe
router.put('/:id', isAdminOrDirectiva, InformeController.updateInforme);

//Eliminar un informe
router.delete('/id', isAdminOrDirectiva, InformeController.deleteInforme);

export default router;
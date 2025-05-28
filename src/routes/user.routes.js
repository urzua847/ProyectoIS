import { Router } from 'express';
import UserController from '../controllers/user.controller.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';
import { isAdmin, isAdminOrDirectiva } from '../middlewares/authorization.middleware.js';

const router = Router();

router.use(authenticationMiddleware);

// GET /api/users - Obtener todos los usuarios (solo admin)
router.get('/', isAdmin, UserController.getAllUsers);

// POST /api/users - Crear un nuevo usuario (solo admin)
router.post('/', isAdmin, UserController.createUser);

// GET /api/users/:id - Obtener un usuario por ID (admin o el propio usuario si es su perfil)
router.get('/:id', isAdminOrDirectiva, UserController.getUserById);

// PUT /api/users/:id - Actualizar un usuario (admin o el propio usuario)
router.put('/:id', isAdminOrDirectiva, UserController.updateUser);

// DELETE /api/users/:id - Eliminar un usuario (solo admin)
router.delete('/:id', isAdmin, UserController.deleteUser);

export default router;

// src/routes/user.routes.js
import { Router } from 'express';
import UserController from '../controllers/user.controller.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';
// Importa los middlewares de autorización específicos que necesites
import { isAdmin, isAdminOrDirectiva } from '../middlewares/authorization.middleware.js';

const router = Router();

// Todas las rutas de usuarios requieren autenticación básica
router.use(authenticationMiddleware);

// GET /api/users - Obtener todos los usuarios (solo admin)
router.get('/', isAdmin, UserController.getAllUsers);

// POST /api/users - Crear un nuevo usuario (solo admin)
// Considera si un admin puede crear otros admins o solo ciertos tipos de usuarios.
router.post('/', isAdmin, UserController.createUser);

// GET /api/users/:id - Obtener un usuario por ID (admin o el propio usuario si es su perfil)
// Para "el propio usuario", necesitarías una lógica más compleja en el middleware o controlador.
// Por simplicidad, lo dejamos para admin o directiva por ahora.
router.get('/:id', isAdminOrDirectiva, UserController.getUserById);

// PUT /api/users/:id - Actualizar un usuario (admin o el propio usuario)
// Similar al GET, la lógica de "propio usuario" puede añadirse.
router.put('/:id', isAdminOrDirectiva, UserController.updateUser);

// DELETE /api/users/:id - Eliminar un usuario (solo admin)
router.delete('/:id', isAdmin, UserController.deleteUser);

export default router;

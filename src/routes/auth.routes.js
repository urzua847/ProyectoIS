import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js'; 

const router = Router();

// POST /api/auth/login - Iniciar sesión
router.post('/login', AuthController.login);

// POST /api/auth/refresh - Refrescar token de acceso (usando cookie httpOnly)
router.post('/refresh', AuthController.refresh);

// POST /api/auth/logout - Cerrar sesión (limpia la cookie httpOnly)
router.post('/logout', AuthController.logout);

// GET /api/auth/me - Obtener perfil del usuario actual (protegido)
router.get('/me', authenticationMiddleware, AuthController.getCurrentUser);


export default router;

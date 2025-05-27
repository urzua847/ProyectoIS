// src/routes/index.routes.js
// Este archivo podría simplificarse o eliminarse si defines las rutas directamente en server.js
import { Router } from 'express';
import authRoutes from './auth.routes.js'; // Asegúrate de que esté adaptado a Sequelize
import userRoutes from './user.routes.js';   // Asegúrate de que esté adaptado a Sequelize
import vecinoRoutes from './vecino.routes.js';
import asambleaRoutes from './asamblea.routes.js';

// No necesitas el middleware de autenticación aquí si cada sub-ruta lo maneja
// import authenticationMiddleware from "../middlewares/authentication.middleware.js";

const router = Router();

// Define las rutas base para cada módulo
router.use('/auth', authRoutes);
router.use('/users', userRoutes); // Podrías aplicar authenticationMiddleware aquí si todas las de users lo requieren
router.use('/vecinos', vecinoRoutes); // vecino.routes.js ya aplica su propio auth middleware
router.use('/asambleas', asambleaRoutes); // asamblea.routes.js ya aplica su propio auth middleware

export default router;

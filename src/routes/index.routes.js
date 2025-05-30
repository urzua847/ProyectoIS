import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';  
import vecinoRoutes from './vecino.routes.js';
import asambleaRoutes from './asamblea.routes.js';
import informeRoutes from './informe.routes.js';


const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vecinos', vecinoRoutes); 
router.use('/asambleas', asambleaRoutes);
router.use('./informes', informeRoutes);

export default router;

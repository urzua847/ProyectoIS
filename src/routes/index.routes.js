"use strict";
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import vecinoRoutes from "./vecino.routes.js";
import asambleaRoutes from "./asamblea.routes.js";
import actaAsambleaRoutes from "./actaAsamblea.routes.js";

const router = Router();

// api/auth/login, /api/auth/register
router.use("/auth", authRoutes);


// /api/vecinos/, /api/vecinos/:id
router.use("/vecinos", vecinoRoutes);

// /api/asambleas/, /api/asambleas/:id
router.use("/asambleas", asambleaRoutes);

// /api/actas/, /api/actas/:id
router.use("/actas", actaAsambleaRoutes); // Rutas de actas a nivel raíz

export default router;

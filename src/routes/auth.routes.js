    "use strict";
    import { Router } from "express";
    import {
      loginController,
      registerController, 
      logoutController,
      refreshTokenController,
      getProfileController, 
    } from "../controllers/auth.controller.js";
    import { authenticateJwt } from "../middlewares/authentication.middleware.js"; 

    const router = Router();

    // Ruta para iniciar sesión de un vecino
    // POST /api/auth/login
    router.post("/login", loginController);

    // Ruta para registrar un nuevo vecino
    // POST /api/auth/register
    router.post("/register", registerController);

    // Ruta para cerrar sesión
    // POST /api/auth/logout
    router.post("/logout", logoutController);

    // Ruta para refrescar el Access Token usando el Refresh Token (que se espera en una cookie HttpOnly)
    // POST /api/auth/refresh-token
    router.post("/refresh-token", refreshTokenController);

    // Ruta para obtener el perfil del vecino actualmente autenticado
    // GET /api/auth/profile
    router.get("/profile", authenticateJwt, getProfileController);

    export default router;
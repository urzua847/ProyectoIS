"use strict";

// Importaciones de módulos de Node.js y de terceros
import express, { json, urlencoded } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

// Importaciones de módulos locales de la aplicación
import { COOKIE_KEY_SESSION, HOST, NODE_ENV, PORT } from "./config/configEnv.js";
import { connectDB } from "./config/configDb.js";
import { createInitialData } from "./config/initialSetup.js"; // Para crear datos iniciales (ej. admin)
import { passportJwtSetup } from "./auth/passport.auth.js";
import indexRoutes from "./routes/index.routes.js";
import { handleErrorServer } from "./handlers/responseHandlers.js";

/**
 * Configura y arranca el servidor Express.
 */
async function setupServer() {
  try {
    const app = express();

    app.disable("x-powered-by");

    app.use(
      cors({
        credentials: true,
        origin: NODE_ENV === "production" ? process.env.FRONTEND_URL || true : true,
      })
    );

    app.use(urlencoded({ extended: true, limit: "5mb" }));
    app.use(json({ limit: "5mb" }));
    app.use(cookieParser());
    app.use(morgan("dev"));

    app.use(
      session({
        secret: COOKIE_KEY_SESSION,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: NODE_ENV === "production",
          httpOnly: true,
          sameSite: "strict",
        },
      })
    );

    app.use(passport.initialize());
    passportJwtSetup();

    app.use("/api", indexRoutes);

    app.use((req, res, next) => {
      res.status(404).json({
        status: "Error",
        type: "NotFound",
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
      });
    });

    app.use((err, req, res, next) => {
      console.error("Error global capturado:", err.name, "-", err.message);
      if (NODE_ENV === "development") {
        console.error(err.stack);
      }
      const statusCode = typeof err.status === "number" && err.status >= 400 && err.status < 600
        ? err.status
        : 500;
      const clientMessage = (statusCode >= 500 && NODE_ENV === "production")
        ? "Ocurrió un error inesperado en el servidor."
        : err.message || "Error interno del servidor.";
      return handleErrorServer(res, statusCode, clientMessage, err);
    });

    app.listen(PORT, () => {
      console.log(`=> Servidor de Junta de Vecinos corriendo en ${HOST}:${PORT}`);
      console.log(`=> Entorno actual: ${NODE_ENV}`);
      console.log(`=> API disponible en ${HOST}:${PORT}/api`);
    });

  } catch (error) {
    console.error("Error fatal al configurar el servidor (setupServer):", error);
    process.exit(1);
  }
}

/**
 * Función principal para iniciar la API.
 */
async function main() {
  try {
    await connectDB();

    // Verificar si createInitialData es una función antes de llamarla
    if (typeof createInitialData === "function") {
      await createInitialData(); 
    } else {
      console.error("ERROR: createInitialData no es una función. Valor recibido:", createInitialData);
    }

    await setupServer();

  } catch (error) {
    console.error("Error fatal al iniciar la API (main):", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    })
  .catch((error) => {
    console.error("Error no manejado en el nivel más alto al iniciar la API:", error);
    process.exit(1);
  });
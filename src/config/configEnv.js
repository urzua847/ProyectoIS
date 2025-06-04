    "use strict";
    import { fileURLToPath } from "url";
    import path from "path";
    import dotenv from "dotenv";

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const envFilePath = path.resolve(__dirname, "../../.env");
    const dotenvResult = dotenv.config({ path: envFilePath });

    if (dotenvResult.error) {
      console.warn(
        `Advertencia: No se pudo cargar el archivo .env desde ${envFilePath}. ` 
        + "Asegúrate de que exista si no estás usando variables de entorno del sistema. Error: " 
        + dotenvResult.error.message
      );
    }

    export const NODE_ENV = process.env.NODE_ENV;
    export const PORT = process.env.PORT;
    export const HOST = process.env.HOST;

    export const DB_DIALECT = process.env.DB_DIALECT;
    export const DB_HOST = process.env.DB_HOST;
    export const DB_PORT = process.env.DB_PORT;
    export const DB_USERNAME = process.env.DB_USERNAME;
    export const DB_PASSWORD = process.env.DB_PASSWORD;
    export const DB_DATABASE = process.env.DB_DATABASE;

    export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
    export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
    export const COOKIE_KEY_SESSION = process.env.COOKIE_KEY_SESSION;

    export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    // Nuevas variables para configuración de correo
    export const MAIL_HOST = process.env.MAIL_HOST;
    export const MAIL_PORT = process.env.MAIL_PORT;
    // MAIL_SECURE se interpreta como booleano
    export const MAIL_SECURE = process.env.MAIL_SECURE; // Convertir string a boolean
    export const MAIL_USER = process.env.MAIL_USER;
    export const MAIL_PASS = process.env.MAIL_PASS;
    export const MAIL_FROM_ADDRESS = process.env.MAIL_FROM_ADDRESS;
    export const MAIL_REPLY_TO_ADDRESS = process.env.MAIL_REPLY_TO_ADDRESS;


    // --- Validaciones de Variables Críticas ---
    const criticalVariables = {
      DB_USERNAME, DB_PASSWORD, DB_DATABASE,
      ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, COOKIE_KEY_SESSION,
      // Añadir variables de correo si son críticas para el funcionamiento
      MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM_ADDRESS
    };

    for (const [key, value] of Object.entries(criticalVariables)) {
      if (!value && key !== "MAIL_REPLY_TO_ADDRESS") { // MAIL_REPLY_TO_ADDRESS puede ser opcional
        const message = `ERROR FATAL: La variable de entorno crítica '${key}' no está definida.`;
        if (NODE_ENV === "production") {
          console.error(message);
          process.exit(1);
        } else {
          console.warn(message + " La aplicación podría no funcionar como se espera.");
        }
      }
    }

    if (NODE_ENV === "production") {
      if (ACCESS_TOKEN_SECRET && ACCESS_TOKEN_SECRET.length < 32) {
        console.error("ERROR FATAL: ACCESS_TOKEN_SECRET es demasiado corto para producción.");
        process.exit(1);
      }

    }
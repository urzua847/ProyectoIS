/**
 * @file Configurar variables de entorno.
 * @description Carga las variables de entorno desde un archivo .env.
 */

require("dotenv").config({ path: "./src/config/.env" });

const config = {
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || "http://localhost",
  DB_URL: process.env.DB_URL,
  ACCESS_JWT_SECRET: process.env.ACCESS_JWT_SECRET,
  REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET,
  EMAIL_USER: process.env.EMAIL_USER, // Añadir esto
  EMAIL_PASS: process.env.EMAIL_PASS, // Añadir esto
};

module.exports = config;


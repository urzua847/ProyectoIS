// src/config/configEnv.js
import path from 'node:path';
import dotenv from 'dotenv';

const __dirname = import.meta.dirname;
const envFilePath = path.resolve(__dirname, '../../.env'); // Ajusta la ruta si .env está en la raíz del proyecto

dotenv.config({ path: envFilePath });

// Variables del Servidor
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 3000;
export const HOST = process.env.HOST || 'localhost';

// Variables de Base de Datos PostgreSQL
export const DB_USER = process.env.DB_USER || 'postgres';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_NAME = process.env.DB_NAME || 'junta_de_vecinos';
export const DB_PORT = process.env.DB_PORT || 5432;

// Variables de JWT
export const ACCESS_JWT_SECRET = process.env.ACCESS_JWT_SECRET || 'tu_super_secreto_de_acceso';
export const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET || 'tu_super_secreto_de_refresco';
export const ACCESS_JWT_EXPIRES_IN = process.env.ACCESS_JWT_EXPIRES_IN || '15m'; // 15 minutos
export const REFRESH_JWT_EXPIRES_IN = process.env.REFRESH_JWT_EXPIRES_IN || '7d'; // 7 días

// Variables para Email (Nodemailer)
export const EMAIL_HOST = process.env.EMAIL_HOST; // ej. 'smtp.example.com'
export const EMAIL_PORT = process.env.EMAIL_PORT; // ej. 587 o 465
export const EMAIL_USER = process.env.EMAIL_USER; // Tu dirección de correo
export const EMAIL_PASS = process.env.EMAIL_PASS; // Tu contraseña de correo
export const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER; // Email desde el que se envían los correos

// Otras configuraciones
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'; // Configura los orígenes permitidos para CORS

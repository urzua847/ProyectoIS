import path from 'node:path';
import dotenv from 'dotenv';

const __dirname = import.meta.dirname;

const envFilePath = path.resolve(__dirname, '../../.env');


const envConfigResult = dotenv.config({ path: envFilePath }); 

if (envConfigResult.error) {
  console.error('ERROR al cargar el archivo .env:', envConfigResult.error);
}

// Todas las exportaciones de variables de entorno se mantienen igual
export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT;
export const HOST = process.env.HOST;

export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_HOST = process.env.DB_HOST;
export const DB_NAME = process.env.DB_NAME;
export const DB_PORT = process.env.DB_PORT;

export const ACCESS_JWT_SECRET = process.env.ACCESS_JWT_SECRET;
export const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET;
export const ACCESS_JWT_EXPIRES_IN = process.env.ACCESS_JWT_EXPIRES_IN;
export const REFRESH_JWT_EXPIRES_IN = process.env.REFRESH_JWT_EXPIRES_IN;

export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;

export const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;


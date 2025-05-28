import path from 'node:path';
import dotenv from 'dotenv';

const __dirname = import.meta.dirname;

const envFilePath = path.resolve(__dirname, '../../.env');


console.log('--- [configEnv.js] Inicio de Depuración ---');
console.log('Directorio actual del módulo (__dirname):', __dirname);
console.log('Ruta absoluta calculada para .env (envFilePath):', envFilePath);

const envConfigResult = dotenv.config({ path: envFilePath });

if (envConfigResult.error) {
  console.error('ERROR al cargar el archivo .env:', envConfigResult.error);
} else {
   console.log('Resultado de dotenv.config().parsed:', envConfigResult.parsed || 'No se parsearon variables (¿Archivo .env vacío o ruta incorrecta?)');
}
console.log('--- [configEnv.js] Fin de Depuración ---');

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 3000;
export const HOST = process.env.HOST || 'localhost';

export const DB_USER = process.env.DB_USER || 'postgres';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_NAME = process.env.DB_NAME || 'junta_de_vecinos';
export const DB_PORT = process.env.DB_PORT || 5432;

export const ACCESS_JWT_SECRET = process.env.ACCESS_JWT_SECRET || 'tu_super_secreto_de_acceso';
export const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET || 'tu_super_secreto_de_refresco';
export const ACCESS_JWT_EXPIRES_IN = process.env.ACCESS_JWT_EXPIRES_IN || '1d';
export const REFRESH_JWT_EXPIRES_IN = process.env.REFRESH_JWT_EXPIRES_IN || '7d';

export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;

export const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;


console.log('--- [configEnv.js] Valores de Email Exportados ---');
console.log('EMAIL_HOST exportado:', EMAIL_HOST);
console.log('EMAIL_PORT exportado:', EMAIL_PORT);
console.log('EMAIL_USER exportado:', EMAIL_USER);
console.log('EMAIL_FROM exportado:', EMAIL_FROM);
console.log('-------------------------------------------------');

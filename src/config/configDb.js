"use strict";
import { DataSource } from "typeorm";
import {
  DB_DIALECT,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  NODE_ENV,
} from "./configEnv.js"; 
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const AppDataSource = new DataSource({
  type: DB_DIALECT,
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  entities: [path.join(__dirname, "..", "entity", "**", "*.entity.js")],
  synchronize: NODE_ENV === "development",
  logging: NODE_ENV === "production" ? ["error", "warn"] : false,
});

export async function connectDB() {
  try {
    if (AppDataSource.isInitialized) {
      return;
    }
    await AppDataSource.initialize();
  } catch (error) {
    console.error("Error crítico al conectar con la base de datos:", error);
    process.exit(1);
  }
}
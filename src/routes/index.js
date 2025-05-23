/**
 * @file Archivo principal de rutas.
 * @description Define las rutas principales de la API.
 */

const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const neighborRoutes = require("./neighbors.routes"); // Nuevo
const assemblyRoutes = require("./assemblies.routes"); // Nuevo

/**
 * @swagger
 * /api/auth:
 * get:
 * summary: Rutas de autenticación
 */
router.use("/auth", authRoutes);

/**
 * @swagger
 * /api/users:
 * get:
 * summary: Rutas de usuario
 */
router.use("/users", userRoutes);

/**
 * @swagger
 * /api/neighbors:
 * get:
 * summary: Rutas de gestión de vecinos
 */
router.use("/neighbors", neighborRoutes); // Nuevo

/**
 * @swagger
 * /api/assemblies:
 * get:
 * summary: Rutas de gestión de asambleas
 */
router.use("/assemblies", assemblyRoutes); // Nuevo

module.exports = router;
const express = require("express");
const router = express.Router();
const { addNeighbor, getNeighbors } = require("../controllers/neighbor.controller");
const { authenticateToken } = require("../middlewares/authentication.middleware"); // Asumiendo que tienes esto
const { authorizeRoles } = require("../middlewares/authorization.middleware"); // Asumiendo que tienes esto
const { ROLES } = require("../constants/roles.constants");

// Ruta para crear un nuevo vecino
// Solo los administradores o miembros de la directiva podrían añadir vecinos
router.post(
  "/",
  authenticateToken,
  authorizeRoles(ROLES.ADMIN, ROLES.DIRECTIVE), // Ejemplo: solo admin o directiva pueden añadir
  addNeighbor,
);

// Ruta para obtener todos los vecinos (podría estar restringida)
router.get(
  "/",
  authenticateToken,
  authorizeRoles(ROLES.ADMIN, ROLES.DIRECTIVE), // Ejemplo: solo admin o directiva pueden ver todos
  getNeighbors,
);

module.exports = router;

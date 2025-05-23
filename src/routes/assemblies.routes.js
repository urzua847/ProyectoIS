const express = require("express");
const router = express.Router();
const { organizeAssembly } = require("../controllers/assembly.controller");
const { authenticateToken } = require("../middlewares/authentication.middleware"); // Asumiendo que tienes esto
const { authorizeRoles } = require("../middlewares/authorization.middleware"); // Asumiendo que tienes esto
const { ROLES } = require("../constants/roles.constants");

// Ruta para organizar una nueva asamblea
// Solo los miembros de la directiva pueden organizar asambleas
router.post(
  "/",
  authenticateToken,
  authorizeRoles(ROLES.DIRECTIVE), // Solo los miembros de la directiva pueden organizar
  organizeAssembly,
);

module.exports = router;

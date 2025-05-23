const Assembly = require("../models/assembly.model");
const User = require("../models/user.model");
const Neighbor = require("../models/neighbor.model");
const { ROLES } = require("../constants/roles.constants");
const { sendAssemblyNotificationEmail } = require("../utils/email.util"); // Lo crearemos

/**
 * Organiza una nueva asamblea.
 * @param {object} assemblyData - Los datos de la asamblea (fecha, hora, descripcion).
 * @param {string} organizerId - El ID del usuario que organiza la asamblea.
 * @returns {Promise<object>} La asamblea creada.
 */
async function createAssembly(assemblyData, organizerId) {
  try {
    // 1. Verificar si el organizador es un miembro regular de la directiva (activo/vigente)
    const organizer = await User.findById(organizerId);

    if (!organizer) {
      throw new Error("El organizador no se encontró.");
    }

    // Comprobar si el usuario tiene el rol 'directive' y está activo
    const isDirectiveMember = organizer.roles.includes(ROLES.DIRECTIVE);
    const isActive = organizer.status === "active";

    if (!isDirectiveMember || !isActive) {
      throw new Error("Solo los miembros de la directiva activos pueden organizar asambleas.");
    }

    // 2. Guardar la asamblea con estado 'planificado'
    const assembly = new Assembly({
      ...assemblyData,
      organizador: organizerId,
      estado: "planificado",
    });

    const savedAssembly = await assembly.save();

    // 3. Emitir notificación a los vecinos por correo electrónico
    const neighbors = await Neighbor.find({});
    const neighborEmails = neighbors.map((n) => n.correoElectronico);

    if (neighborEmails.length > 0) {
      await sendAssemblyNotificationEmail(savedAssembly, neighborEmails);
    } else {
      console.warn("No hay vecinos registrados para enviar la notificación de asamblea.");
    }

    return savedAssembly;
  } catch (error) {
    throw new Error("Error al organizar la asamblea: " + error.message);
  }
}

module.exports = {
  createAssembly,
};
const Joi = require("joi");
const { createAssembly } = require("../services/assembly.service");
const { createAssemblyBodySchema } = require("../schemas/assembly.schema");

/**
 * Organiza una nueva asamblea.
 * Requiere rol de directiva y estado activo.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
async function organizeAssembly(req, res) {
  try {
    const { error, value } = createAssemblyBodySchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Asume que req.user es poblado por un middleware de autenticación
    const organizerId = req.user._id;

    const newAssembly = await createAssembly(value, organizerId);
    return res.status(201).json(newAssembly);
  } catch (error) {
    // Mensajes de error específicos para una mejor retroalimentación
    if (error.message.includes("Solo los miembros de la directiva activos")) {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  organizeAssembly,
};

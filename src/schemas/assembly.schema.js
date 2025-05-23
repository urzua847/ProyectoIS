const Joi = require("joi");

const createAssemblyBodySchema = Joi.object({
  fecha: Joi.date().iso().required().messages({
    "date.base": "La fecha de la asamblea debe ser una fecha válida.",
    "date.format": "La fecha de la asamblea debe estar en formato ISO (YYYY-MM-DD).",
    "any.required": "La fecha de la asamblea es obligatoria.",
  }),
  hora: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) // Formato HH:MM
    .required()
    .messages({
      "string.empty": "La hora de la asamblea no puede estar vacía.",
      "string.pattern.base": "La hora de la asamblea debe estar en formato HH:MM.",
      "any.required": "La hora de la asamblea es obligatoria.",
    }),
  descripcion: Joi.string().required().messages({
    "string.empty": "La descripción de la asamblea no puede estar vacía.",
    "any.required": "La descripción de la asamblea es obligatoria.",
  }),
});

module.exports = {
  createAssemblyBodySchema,
};


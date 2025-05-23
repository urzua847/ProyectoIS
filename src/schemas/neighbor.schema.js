const Joi = require("joi");

const createNeighborBodySchema = Joi.object({
  nombre: Joi.string().required().messages({
    "string.empty": "El nombre no puede estar vacío.",
    "any.required": "El nombre es obligatorio.",
  }),
  apellido: Joi.string().required().messages({
    "string.empty": "El apellido no puede estar vacío.",
    "any.required": "El apellido es obligatorio.",
  }),
  correoElectronico: Joi.string()
    .email()
    .required()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "string.email": "El correo electrónico debe ser válido.",
      "any.required": "El correo electrónico es obligatorio.",
    }),
  direccionContacto: Joi.string().required().messages({
    "string.empty": "La dirección o información de contacto no puede estar vacía.",
    "any.required": "La dirección o información de contacto es obligatoria.",
  }),
});

module.exports = {
  createNeighborBodySchema,
};

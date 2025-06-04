"use strict";
import Joi from "joi";

const estadosActaValidos = ["borrador", "aprobada", "en_revision", "rechazada"];

// --- Esquema para Crear o Actualizar un Acta (Cuerpo de la Solicitud) ---
export const actaAsambleaBodyValidation = Joi.object({
  contenido: Joi.string().min(10).required().messages({
    "string.empty": "El contenido del acta es obligatorio.",
    "any.required": "El contenido del acta es obligatorio.",
    "string.min":
      "El contenido del acta debe tener al menos {#limit} caracteres.",
  }),
  estadoActa: Joi.string()
    .valid(...estadosActaValidos)
    .default("borrador")
    .optional()
    .messages({
      "any.only": `El estado del acta debe ser uno de: ${estadosActaValidos.join(", ")}.`,
    }),
  fechaAprobacion: Joi.date().iso().allow(null).optional().messages({
    "date.format": "La fecha de aprobación debe estar en formato YYYY-MM-DD.",
  }),

})
  .unknown(false)
  .messages({ "object.unknown": "Campos no permitidos para el acta." });

// Esquema para actualizar un acta (campos opcionales)
export const actaAsambleaUpdateValidation = Joi.object({
  contenido: Joi.string().min(10).optional(),
  estadoActa: Joi.string()
    .valid(...estadosActaValidos)
    .optional(),
  fechaAprobacion: Joi.date().iso().allow(null).optional(),
  redactorId: Joi.number().integer().positive().allow(null).optional(), // Si se permite cambiar el redactor
})
  .min(1)
  .unknown(false)
  .messages({
    "object.min":
      "Debes proporcionar al menos un campo para actualizar el acta.",
    "object.unknown": "Campos no permitidos para la actualización del acta.",
  });

// --- Esquema para Validar ID de Acta en Parámetros de Ruta ---
export const actaIdParamValidation = Joi.object({
  idActa: Joi.number().integer().positive().required().messages({
    // Si el param es 'idActa'
    "any.required": "El ID del acta es obligatorio en la ruta.",
  }),

}).unknown(true);


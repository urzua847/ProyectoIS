"use strict";
import Joi from "joi";

const estadosAsambleaValidos = [
  "planificada",
  "realizada",
  "cancelada",
  "pospuesta",
];

// --- Esquema para Crear o Actualizar una Asamblea (Cuerpo de la Solicitud) ---
export const asambleaBodyValidation = Joi.object({
  titulo: Joi.string().min(5).max(255).required().messages({
    "string.empty": "El título de la asamblea es obligatorio.",
    "any.required": "El título de la asamblea es obligatorio.",
    "string.min": "El título debe tener al menos {#limit} caracteres.",
  }),
  descripcionOrdenDia: Joi.string().allow(null, "").max(5000).optional(),
  fechaHora: Joi.date().iso().required().greater("now").messages({
    // Fecha debe ser futura
    "date.format":
      "La fecha y hora deben estar en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ).",
    "date.greater": "La fecha y hora de la asamblea deben ser futuras.",
    "any.required": "La fecha y hora son obligatorias.",
  }),
  lugar: Joi.string().max(255).allow(null, "").optional(),
  estado: Joi.string()
    .valid(...estadosAsambleaValidos)
    .optional()
    .messages({
      // El servicio lo pondrá como 'planificada' al crear
      "any.only": `El estado debe ser uno de: ${estadosAsambleaValidos.join(", ")}.`,
    }),
  // organizadorId se tomará de req.user en el controlador, no del body.
})
  .unknown(false)
  .messages({ "object.unknown": "Campos no permitidos para la asamblea." });

// Esquema para actualizar una asamblea (campos opcionales)
export const asambleaUpdateValidation = Joi.object({
  titulo: Joi.string().min(5).max(255).optional(),
  descripcionOrdenDia: Joi.string().allow(null, "").max(5000).optional(),
  fechaHora: Joi.date().iso().greater("now").optional().messages({
    "date.format": "La fecha y hora deben estar en formato ISO.",
    "date.greater": "La nueva fecha y hora de la asamblea deben ser futuras.",
  }),
  lugar: Joi.string().max(255).allow(null, "").optional(),
  estado: Joi.string()
    .valid(...estadosAsambleaValidos)
    .optional(),
})
  .min(1) // Al menos un campo para actualizar
  .unknown(false)
  .messages({
    "object.min":
      "Debes proporcionar al menos un campo para actualizar la asamblea.",
    "object.unknown":
      "Campos no permitidos para la actualización de la asamblea.",
  });

// --- Esquema para Validar ID de Asamblea en Parámetros de Ruta ---
export const asambleaIdParamValidation = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    // Si el param se llama 'id'
    "any.required": "El ID de la asamblea es obligatorio en la ruta.",
  }),
}).unknown(true); 

// --- Esquema para Validar Parámetros de Consulta al Listar Asambleas ---
export const asambleasQueryValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  estado: Joi.string()
    .valid(...estadosAsambleaValidos)
    .optional(),
  fechaDesde: Joi.date().iso().optional(),
  fechaHasta: Joi.date().iso().optional().greater(Joi.ref("fechaDesde")),
  sortBy: Joi.string()
    .valid("fechaHora", "titulo", "estado")
    .default("fechaHora"),
  orderBy: Joi.string().valid("ASC", "DESC").default("DESC"),
  organizadorId: Joi.number().integer().positive().optional(),
}).unknown(false);

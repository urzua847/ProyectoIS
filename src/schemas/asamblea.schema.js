import Joi from 'joi';

const asambleaBaseSchema = {
  fecha: Joi.date().iso().required().messages({ 
    'date.base': 'La fecha debe ser una fecha válida.',
    'date.format': 'La fecha debe estar en formato ISO (YYYY-MM-DD).',
    'any.required': 'La fecha de la asamblea es obligatoria.',
  }),
  hora: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({ 
    'string.pattern.base': 'La hora debe estar en formato HH:MM (ej: 14:30).',
    'any.required': 'La hora de la asamblea es obligatoria.',
  }),
  descripcion: Joi.string().min(5).required().messages({
    'string.empty': 'La descripción no puede estar vacía.',
    'string.min': 'La descripción debe tener al menos 5 caracteres.',
    'any.required': 'La descripción de la asamblea es obligatoria.',
  }),
  estado: Joi.string().valid('planificada', 'realizada', 'cancelada').messages({
    'any.only': 'El estado de la asamblea debe ser uno de: planificada, realizada, cancelada.',
  }),
};

export const createAsambleaSchema = Joi.object({
  fecha: asambleaBaseSchema.fecha,
  hora: asambleaBaseSchema.hora,
  descripcion: asambleaBaseSchema.descripcion,
}).messages({
  'object.unknown': 'No se permiten propiedades adicionales en la creación de la asamblea.',
});

export const updateAsambleaSchema = Joi.object({
  fecha: Joi.date().iso().messages({
    'date.base': 'La fecha debe ser una fecha válida.',
    'date.format': 'La fecha debe estar en formato ISO (YYYY-MM-DD).',
  }),
  hora: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).messages({
     'string.pattern.base': 'La hora debe estar en formato HH:MM (ej: 14:30).',
  }),
  descripcion: Joi.string().min(5).messages({
    'string.min': 'La descripción debe tener al menos 5 caracteres.',
  }),
  estado: asambleaBaseSchema.estado,
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar la asamblea.',
  'object.unknown': 'No se permiten propiedades adicionales en la actualización de la asamblea.',
});

export const asambleaIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID de la asamblea debe ser un número.',
    'number.integer': 'El ID de la asamblea debe ser un entero.',
    'number.positive': 'El ID de la asamblea debe ser un número positivo.',
    'any.required': 'El ID de la asamblea es obligatorio.',
  }),
});

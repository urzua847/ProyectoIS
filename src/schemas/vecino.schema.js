import Joi from 'joi';

const vecinoBaseSchema = {
  nombre: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'El nombre del vecino no puede estar vacío.',
    'string.min': 'El nombre del vecino debe tener al menos 2 caracteres.',
    'string.max': 'El nombre del vecino no debe exceder los 100 caracteres.',
    'any.required': 'El nombre del vecino es obligatorio.',
  }),
  apellido: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'El apellido del vecino no puede estar vacío.',
    'string.min': 'El apellido del vecino debe tener al menos 2 caracteres.',
    'string.max': 'El apellido del vecino no debe exceder los 100 caracteres.',
    'any.required': 'El apellido del vecino es obligatorio.',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'El correo electrónico del vecino no puede estar vacío.',
    'string.email': 'El correo electrónico del vecino debe tener un formato válido.',
    'any.required': 'El correo electrónico del vecino es obligatorio.',
  }),
  direccion: Joi.string().max(255).allow(null, '').messages({
    'string.max': 'La dirección no debe exceder los 255 caracteres.',
  }),
  informacionContacto: Joi.string().allow(null, '').messages({
    'string.base': 'La información de contacto adicional debe ser de tipo texto.',
  }),
};

export const createVecinoSchema = Joi.object(vecinoBaseSchema).messages({
  'object.unknown': 'No se permiten propiedades adicionales en la creación del vecino.',
});

export const updateVecinoSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).messages({
    'string.min': 'El nombre del vecino debe tener al menos 2 caracteres.',
    'string.max': 'El nombre del vecino no debe exceder los 100 caracteres.',
  }),
  apellido: Joi.string().min(2).max(100).messages({
    'string.min': 'El apellido del vecino debe tener al menos 2 caracteres.',
    'string.max': 'El apellido del vecino no debe exceder los 100 caracteres.',
  }),
  email: Joi.string().email().messages({
    'string.email': 'El correo electrónico del vecino debe tener un formato válido.',
  }),
  direccion: Joi.string().max(255).allow(null, ''),
  informacionContacto: Joi.string().allow(null, ''),
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar el vecino.',
  'object.unknown': 'No se permiten propiedades adicionales en la actualización del vecino.',
});

export const vecinoIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID del vecino debe ser un número.',
    'number.integer': 'El ID del vecino debe ser un entero.',
    'number.positive': 'El ID del vecino debe ser un número positivo.',
    'any.required': 'El ID del vecino es obligatorio.',
  }),
});

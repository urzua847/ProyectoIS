import Joi from 'joi';
import ROLES from '../constants/roles.constants.js';

const userBaseSchema = {
  username: Joi.string().min(3).max(50).messages({
    'string.empty': 'El nombre de usuario no puede estar vacío.',
    'string.min': 'El nombre de usuario debe tener al menos 3 caracteres.',
    'string.max': 'El nombre de usuario no debe exceder los 50 caracteres.',
    'string.base': 'El nombre de usuario debe ser de tipo string.',
  }),
  email: Joi.string().email().messages({
    'string.empty': 'El correo electrónico no puede estar vacío.',
    'string.base': 'El correo electrónico debe ser de tipo string.',
    'string.email': 'El correo electrónico debe tener un formato válido.',
  }),
  password: Joi.string().min(6).messages({ 
    'string.empty': 'La contraseña no puede estar vacía.',
    'string.min': 'La contraseña debe tener al menos 6 caracteres.',
    'string.base': 'La contraseña debe ser de tipo string.',
  }),
  rut: Joi.string().pattern(/^[0-9]{7,8}-[0-9kK]$/).allow(null, '').messages({ 
    'string.pattern.base': 'El RUT debe tener un formato válido (ej: 12345678-K).',
    'string.base': 'El RUT debe ser de tipo string.',
  }),
  roleId: Joi.number().integer().positive().messages({ 
     'number.base': 'El ID del rol debe ser un número.',
     'number.integer': 'El ID del rol debe ser un entero.',
     'number.positive': 'El ID del rol debe ser un número positivo.',
  }),
  esDirectiva: Joi.boolean().messages({
    'boolean.base': 'El campo "esDirectiva" debe ser booleano.',
  }),
  directivaCargo: Joi.string().allow(null, '').max(100).messages({
    'string.max': 'El cargo de directiva no debe exceder los 100 caracteres.',
    'string.base': 'El cargo de directiva debe ser de tipo string.',
  }),
  directivaVigente: Joi.boolean().messages({
    'boolean.base': 'El campo "directivaVigente" debe ser booleano.',
  }),
};

export const createUserSchema = Joi.object({
  ...userBaseSchema,
  username: userBaseSchema.username.required(),
  email: userBaseSchema.email.required(),
  password: userBaseSchema.password.required(),
}).messages({
  'object.unknown': 'No se permiten propiedades adicionales.',
});

export const updateUserSchema = Joi.object({
  username: userBaseSchema.username,
  email: userBaseSchema.email,
  password: userBaseSchema.password.optional(),
  rut: userBaseSchema.rut,
  roleId: userBaseSchema.roleId,
  esDirectiva: userBaseSchema.esDirectiva,
  directivaCargo: userBaseSchema.directivaCargo,
  directivaVigente: userBaseSchema.directivaVigente,
}).min(1).messages({ 
  'object.min': 'Debe proporcionar al menos un campo para actualizar.',
  'object.unknown': 'No se permiten propiedades adicionales.',
});

export const userIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({ 
    'number.base': 'El ID debe ser un número.',
    'number.integer': 'El ID debe ser un entero.',
    'number.positive': 'El ID debe ser un número positivo.',
    'any.required': 'El ID es obligatorio.',
  }),
});

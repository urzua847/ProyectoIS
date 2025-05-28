import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'El correo electrónico no puede estar vacío.',
    'any.required': 'El correo electrónico es obligatorio.',
    'string.base': 'El correo electrónico debe ser de tipo string.',
    'string.email': 'El correo electrónico debe tener un formato válido.',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'La contraseña no puede estar vacía.',
    'any.required': 'La contraseña es obligatoria.',
    'string.base': 'La contraseña debe ser de tipo string.',
  }),
}).messages({
  'object.unknown': 'No se permiten propiedades adicionales.',
});


export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'string.empty': 'El token de refresco no puede estar vacío.',
    'any.required': 'El token de refresco es obligatorio.',
  }),
});

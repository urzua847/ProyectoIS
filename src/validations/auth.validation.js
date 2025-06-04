"use strict";
import Joi from "joi";

// --- Esquemas Comunes ---
const emailSchema = Joi.string()
  .email({ tlds: { allow: false } }) // tlds:false para no validar dominios de alto nivel específicos
  .min(5)
  .max(255)
  .lowercase() // Convertir email a minúsculas antes de validar/usar
  .required()
  .messages({
    "string.empty": "El correo electrónico no puede estar vacío.",
    "any.required": "El correo electrónico es obligatorio.",
    "string.base": "El correo electrónico debe ser de tipo texto.",
    "string.email": "El formato del correo electrónico no es válido.",
    "string.min":
      "El correo electrónico debe tener al menos {#limit} caracteres.",
    "string.max":
      "El correo electrónico no debe exceder los {#limit} caracteres.",
  });

const passwordSchema = Joi.string()
  .min(8) // Longitud mínima recomendada para contraseñas
  .max(128)
  .required()
  .messages({
    "string.empty": "La contraseña no puede estar vacía.",
    "any.required": "La contraseña es obligatoria.",
    "string.base": "La contraseña debe ser de tipo texto.",
    "string.min": "La contraseña debe tener al menos {#limit} caracteres.",
    "string.max": "La contraseña no debe exceder los {#limit} caracteres.",
    "string.pattern.base":
      "La contraseña no cumple con los requisitos de complejidad (ej. debe incluir mayúsculas, minúsculas, números y símbolos).",
  });

// --- Esquema de Validación para el Login ---
export const authLoginValidation = Joi.object({
  email: emailSchema,
  password: passwordSchema.messages({
    // Sobrescribir mensaje de patrón si es diferente para login
    "string.pattern.base": "La contraseña proporcionada no es válida.",
  }),
})
  .unknown(false) // No permitir propiedades adicionales no definidas
  .messages({
    "object.unknown":
      "No se permiten campos adicionales en la solicitud de inicio de sesión.",
  });

// --- Esquema de Validación para el Registro de Vecinos ---
export const authRegisterValidation = Joi.object({
  nombres: Joi.string().min(2).max(150).required().messages({
    "string.empty": "Los nombres son obligatorios.",
    "any.required": "Los nombres son obligatorios.",
    "string.min": "Los nombres deben tener al menos {#limit} caracteres.",
  }),
  apellidos: Joi.string().min(2).max(150).required().messages({
    "string.empty": "Los apellidos son obligatorios.",
    "any.required": "Los apellidos son obligatorios.",
    "string.min": "Los apellidos deben tener al menos {#limit} caracteres.",
  }),
  rut: Joi.string() // Validación de RUT chileno (simplificada, considera una librería específica para validación robusta)
    .pattern(/^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-?[0-9kK]$/)
    .allow(null, "") // Permitir nulo o vacío si el RUT es opcional en tu entidad Vecino
    .required() // Hacerlo opcional si en Vecino.entity.js 'rut' es nullable: true
    .messages({
      "string.pattern.base":
        "El formato del RUT no es válido (ej: 12.345.678-K o 12345678-K).",
    }),
  email: emailSchema,
  password: passwordSchema, // Usa el schema de contraseña definido arriba
  direccion: Joi.string().max(255).allow(null, "").optional(),
  numeroVivienda: Joi.string().max(50).allow(null, "").optional(),
  telefonoContacto: Joi.string().max(20).allow(null, "").optional(),
})
  .unknown(false)
  .messages({
    "object.unknown":
      "No se permiten campos adicionales en la solicitud de registro.",
  });

// --- Esquema de Validación para el Refresh Token ---
export const authRefreshTokenValidation = Joi.object({
  refreshToken: Joi.string().required().messages({
    "string.empty": "El token de refresco no puede estar vacío.",
    "any.required": "El token de refresco es obligatorio.",
  }),
}).unknown(true);

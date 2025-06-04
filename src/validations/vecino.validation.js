"use strict";
import Joi from "joi";

// --- Esquemas Base Reutilizables para Vecino ---
const nombresSchema = Joi.string().min(2).max(150).messages({
  "string.min": "Los nombres deben tener al menos {#limit} caracteres.",
  "string.max": "Los nombres no deben exceder los {#limit} caracteres.",
  "string.empty": "Los nombres no pueden estar vacíos.",
});
const apellidosSchema = Joi.string().min(2).max(150).messages({
  "string.min": "Los apellidos deben tener al menos {#limit} caracteres.",
  "string.max": "Los apellidos no deben exceder los {#limit} caracteres.",
  "string.empty": "Los apellidos no pueden estar vacíos.",
});
const rutSchema = Joi.string()
  .pattern(/^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-?[0-9kK]$/)
  .messages({ "string.pattern.base": "El formato del RUT no es válido." });
const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase()
  .messages({
    "string.email": "El formato del correo electrónico no es válido.",
  });
const passwordSchema = Joi.string().min(8).max(128); // Para creación por admin o cambio de contraseña

const telefonoSchema = Joi.string().max(20).allow(null, "");
const direccionSchema = Joi.string().max(255).allow(null, "");
const numeroViviendaSchema = Joi.string().max(50).allow(null, "");

const rolesJuntaValidos = [
  "vecino_registrado",
  "miembro_directiva",
  "presidente_directiva",
  "secretario",
  "tesorero"
];
const rolJuntaSchema = Joi.string()
  .valid(...rolesJuntaValidos)
  .messages({
    "any.only": `El rol de junta debe ser uno de: ${rolesJuntaValidos.join(", ")}.`,
  });
const cargosDirectivaValidos = [
  "Presidente/a",
  "Secretario/a",
  "Tesorero/a"
];
const cargoDirectivaSchema = Joi.string()
  .valid(...cargosDirectivaValidos)
  .allow(null, "");

const fechaSchema = Joi.date()
  .iso()
  .messages({ "date.format": "La fecha debe estar en formato YYYY-MM-DD." });

// --- Esquema para Crear un Vecino (ej. por un Administrador) ---
export const vecinoCreateValidation = Joi.object({
  nombres: nombresSchema.required(),
  apellidos: apellidosSchema.required(),
  rut: rutSchema.optional().allow(null, ""), // O .required() si es mandatorio
  email: emailSchema.required(),
  password: passwordSchema
    .required()
    .messages({
      "any.required": "La contraseña es obligatoria para crear un vecino.",
    }),
  direccion: direccionSchema,
  numeroVivienda: numeroViviendaSchema,
  telefonoContacto: telefonoSchema,
  rolJunta: rolJuntaSchema.default("vecino_registrado"),
  esMiembroDirectivaVigente: Joi.boolean().default(false),
  cargoDirectiva: cargoDirectivaSchema.when("esMiembroDirectivaVigente", {
    is: true,
    then: Joi.string()
      .valid(...cargosDirectivaValidos)
      .required()
      .messages({
        "any.required": "El cargo es requerido si es miembro de directiva.",
      }),
    otherwise: Joi.allow(null, ""),
  }),
  fechaInicioDirectiva: fechaSchema
    .allow(null)
    .when("esMiembroDirectivaVigente", {
      is: true,
      then: Joi.required().messages({
        "any.required":
          "La fecha de inicio es requerida si es miembro de directiva.",
      }),
    }),
  fechaFinDirectiva: fechaSchema.allow(null).when("fechaInicioDirectiva", {
    // Fin debe ser después de inicio
    is: Joi.exist(),
    then: Joi.date()
      .iso()
      .greater(Joi.ref("fechaInicioDirectiva"))
      .messages({
        "date.greater":
          "La fecha de fin debe ser posterior a la fecha de inicio.",
      }),
  }),
})
  .unknown(false)
  .messages({
    "object.unknown": "Campos no permitidos para la creación de vecino.",
  });

// --- Esquema para Actualizar un Vecino ---
// Todos los campos son opcionales en una actualización PATCH.
export const vecinoUpdateValidation = Joi.object({
  nombres: nombresSchema.optional(),
  apellidos: apellidosSchema.optional(),
  rut: rutSchema.optional().allow(null, ""),
  email: emailSchema.optional(),
  // Para cambiar contraseña, usualmente se usa un endpoint dedicado o se requiere contraseña actual.
  // Si un admin puede cambiarla directamente:
  // newPassword: passwordSchema.optional(),
  direccion: direccionSchema.optional(),
  numeroVivienda: numeroViviendaSchema.optional(),
  telefonoContacto: telefonoSchema.optional(),
  rolJunta: rolJuntaSchema.optional(),
  esMiembroDirectivaVigente: Joi.boolean().optional(),
  cargoDirectiva: cargoDirectivaSchema
    .optional()
    .when("esMiembroDirectivaVigente", {
      is: true,
      then: Joi.string()
        .valid(...cargosDirectivaValidos)
        .required(),
      otherwise: Joi.allow(null, ""),
    }),
  fechaInicioDirectiva: fechaSchema.allow(null).optional(),
  fechaFinDirectiva: fechaSchema
    .allow(null)
    .optional()
    .when("fechaInicioDirectiva", {
      is: Joi.exist(),
      then: Joi.date().iso().greater(Joi.ref("fechaInicioDirectiva")),
    }),
})
  .min(1) // Al menos un campo debe ser proporcionado para actualizar
  .unknown(false)
  .messages({
    "object.min": "Debes proporcionar al menos un campo para actualizar.",
    "object.unknown": "Campos no permitidos para la actualización de vecino.",
  });

// --- Esquema para Validar ID de Vecino en Parámetros de Ruta ---
export const vecinoIdParamValidation = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "El ID del vecino debe ser un número.",
    "number.positive": "El ID del vecino debe ser un número positivo.",
    "any.required": "El ID del vecino es obligatorio en la ruta.",
  }),
}).unknown(true);

// --- Esquema para Validar Parámetros de Consulta al Listar Vecinos ---
export const vecinosQueryValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  rolJunta: rolJuntaSchema.optional(),
  esDirectiva: Joi.boolean().optional(), // Para filtrar por esMiembroDirectivaVigente
  sortBy: Joi.string()
    .valid("nombres", "apellidos", "email", "fechaRegistro")
    .default("apellidos"),
  orderBy: Joi.string().valid("ASC", "DESC").default("ASC"),
  searchTerm: Joi.string().min(2).max(100).allow(null, "").optional(), // Para búsqueda general
}).unknown(false); // No permitir otros query params no definidos

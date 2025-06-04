"use strict";
import Vecino from "../entity/vecino.entity.js";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config/configEnv.js";

const ACCESS_TOKEN_EXPIRES_IN = "1h"; // Tiempo de expiración para el token de acceso
const REFRESH_TOKEN_EXPIRES_IN = "7d"; // Tiempo de expiración para el token de refresco

/**
 * Servicio para el login de vecinos.
 * @param {object} loginData - Datos del vecino para el login.
 * @param {string} loginData.email - Email del vecino.
 * @param {string} loginData.password - Contraseña del vecino.
 * @returns {Promise<[object|null, object|null]>} - Retorna [tokens, null] en éxito, o [null, errorInfo] en fallo.
 */
export async function loginService(loginData) {
  try {
    const vecinoRepository = AppDataSource.getRepository(Vecino); // Usar Vecino
    const { email, password } = loginData;

    const createError = (message, field = undefined) => ({ field, message });

    const vecinoFound = await vecinoRepository.findOne({
      where: { email },
      // Es importante seleccionar la contraseña aquí para poder compararla,
      select: ["id", "nombres", "apellidos", "email", "rut", "rolJunta", "password", "esMiembroDirectivaVigente"],
    });

    if (!vecinoFound) {
      return [null, createError("El correo electrónico o la contraseña son incorrectos.", "email")];
    }

    const isMatch = await comparePassword(password, vecinoFound.password);

    if (!isMatch) {
      return [null, createError("El correo electrónico o la contraseña son incorrectos.", "password")];
    }

    // Generar payload para el JWT
    const jwtPayload = {
      id: vecinoFound.id,
      email: vecinoFound.email,
      nombres: vecinoFound.nombres, 
      apellidos: vecinoFound.apellidos,
      rut: vecinoFound.rut,
      rolJunta: vecinoFound.rolJunta,
      esMiembroDirectivaVigente: vecinoFound.esMiembroDirectivaVigente,
    };

    const accessToken = jwt.sign(jwtPayload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    // El payload del refresh token suele ser mínimo, solo el id o algo para identificar la sesión/usuario.
    const refreshTokenPayload = { id: vecinoFound.id /* , version: vecinoFound.tokenVersion || 0 */ };
    const refreshToken = jwt.sign(refreshTokenPayload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    // Preparamos la información del vecino a retornar (sin la contraseña)
    const { password: _, ...vecinoInfo } = vecinoFound;


    return [{ accessToken, refreshToken, vecinoInfo }, null];

  } catch (error) {
    console.error("Error en loginService:", error);
    return [null, { message: "Error interno del servidor al intentar iniciar sesión." }];
  }
}

/**
 * Servicio para el registro de nuevos vecinos.
 * @param {object} vecinoData - Datos del nuevo vecino.
 * @param {string} vecinoData.nombres
 * @param {string} vecinoData.apellidos
 * @param {string} vecinoData.email
 * @param {string} vecinoData.password - Contraseña en texto plano.
 * @param {string} [vecinoData.rut]
 * @param {string} [vecinoData.rolJunta] - Opcional, por defecto "vecino_registrado".
 * @returns {Promise<[object|null, object|null]>} - Retorna [vecinoCreado, null] o [null, errorInfo].
 */
export async function registerService(vecinoData) {
  try {
    const vecinoRepository = AppDataSource.getRepository(Vecino); // Usar Vecino
    const { nombres, apellidos, email, password: plainPassword, rut, rolJunta, ...otrosDatos } = vecinoData;

    const createError = (message, field = undefined) => ({ field, message });

    const existingEmailUser = await vecinoRepository.findOne({ where: { email } });
    if (existingEmailUser) {
      return [null, createError("El correo electrónico ya está registrado.", "email")];
    }

    if (rut) { // Solo verificar RUT si se proporciona
        const existingRutUser = await vecinoRepository.findOne({ where: { rut } });
        if (existingRutUser) {
            return [null, createError("El RUT ya está asociado a una cuenta.", "rut")];
        }
    }

    const hashedPassword = await encryptPassword(plainPassword);

    const nuevoVecino = vecinoRepository.create({
      nombres,
      apellidos,
      email,
      rut: rut || null, // Guardar null si no se proporciona y la entidad lo permite
      password: hashedPassword,
      rolJunta: rolJunta || "vecino_registrado",
      ...otrosDatos // Incluir otros campos como direccion, telefono, etc. si vienen
    });

    await vecinoRepository.save(nuevoVecino);

    const { password, ...userToReturn } = nuevoVecino;
    return [userToReturn, null];

  } catch (error) {
    console.error("Error en registerService (auth.service):", error);
    return [null, { message: "Error interno del servidor al registrar el vecino." }];
  }
}

/**
 * Servicio para refrescar el Access Token usando un Refresh Token.
 * @param {string} tokenRefresco - El Refresh Token.
 * @returns {Promise<[object|null, object|null]>} - Retorna [{ accessToken }, null] o [null, errorInfo].
 */
export async function refreshTokenService(tokenRefresco) {
  try {
    const createError = (message) => ({ message });
    let decodedRefreshToken;
    try {
      decodedRefreshToken = jwt.verify(tokenRefresco, REFRESH_TOKEN_SECRET);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return [null, createError("El token de refresco ha expirado. Por favor, inicia sesión de nuevo.")];
      }
      if (err instanceof jwt.JsonWebTokenError) {
        return [null, createError("Token de refresco inválido.")];
      }
      throw err; // Otro tipo de error
    }

    const vecinoRepository = AppDataSource.getRepository(Vecino); // Usar Vecino
    const vecinoFound = await vecinoRepository.findOne({
      where: { id: decodedRefreshToken.id },
    });

    if (!vecinoFound) {
      return [null, createError("Vecino no encontrado o token de refresco revocado.")];
    }

    const jwtPayload = {
      id: vecinoFound.id,
      email: vecinoFound.email,
      nombres: vecinoFound.nombres,
      apellidos: vecinoFound.apellidos,
      rut: vecinoFound.rut,
      rolJunta: vecinoFound.rolJunta,
      esMiembroDirectivaVigente: vecinoFound.esMiembroDirectivaVigente,
    };
    const newAccessToken = jwt.sign(jwtPayload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    return [{ accessToken: newAccessToken }, null];

  } catch (error) {
    console.error("Error en refreshTokenService:", error);
    return [null, { message: "Error interno del servidor al refrescar el token." }];
  }
}

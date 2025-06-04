"use strict";
import bcrypt from "bcryptjs";

// Número de rondas de salting. Un valor más alto es más seguro pero más lento.
// 10-12 es un buen balance actualmente.
const SALT_ROUNDS = 10;

/**
 * Encripta una contraseña en texto plano usando bcrypt.
 * @param {string} password - La contraseña en texto plano a encriptar.
 * @returns {Promise<string>} El hash de la contraseña.
 * @throws {Error} Si ocurre un error durante el proceso de encriptación.
 */
export async function encryptPassword(password) {
  try {
    if (!password) {
      throw new Error("La contraseña no puede estar vacía para encriptar.");
    }
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error en el proceso de encriptación de contraseña.");
  }
}

/**
 * Compara una contraseña en texto plano con un hash de contraseña almacenado.
 * @param {string} password - La contraseña en texto plano ingresada por el usuario.
 * @param {string} storedPasswordHash - El hash de la contraseña almacenado (ej. en la base de datos).
 * @returns {Promise<boolean>} true si las contraseñas coinciden, false en caso contrario.
 * @throws {Error} Si ocurre un error durante el proceso de comparación (aunque bcrypt usualmente maneja esto internamente).
 */
export async function comparePassword(password, storedPasswordHash) {
  try {
    if (!password || !storedPasswordHash) {
      // Si falta alguna de las contraseñas, no pueden coincidir.
      return false;
    }
    const passwordsMatch = await bcrypt.compare(password, storedPasswordHash);
    return passwordsMatch;
  } catch (error) {
    return false;
  }
}

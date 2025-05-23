const Neighbor = require("../models/neighbor.model");

/**
 * Crea un nuevo vecino.
 * @param {object} neighborData - Los datos del vecino.
 * @returns {Promise<object>} El vecino creado.
 */
async function createNeighbor(neighborData) {
  try {
    const neighbor = new Neighbor(neighborData);
    return await neighbor.save();
  } catch (error) {
    if (error.code === 11000) { // Error de clave duplicada
      throw new Error("El correo electrónico ya está registrado.");
    }
    throw new Error("Error al crear el vecino: " + error.message);
  }
}

/**
 * Obtiene todos los vecinos.
 * @returns {Promise<Array<object>>} Un array de vecinos.
 */
async function getAllNeighbors() {
  return await Neighbor.find({});
}

module.exports = {
  createNeighbor,
  getAllNeighbors,
};

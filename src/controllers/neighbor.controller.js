const Joi = require("joi");
const { createNeighbor, getAllNeighbors } = require("../services/neighbor.service");
const { createNeighborBodySchema } = require("../schemas/neighbor.schema");

/**
 * Crea un nuevo vecino.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
async function addNeighbor(req, res) {
  try {
    const { error, value } = createNeighborBodySchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const newNeighbor = await createNeighbor(value);
    return res.status(201).json(newNeighbor);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

/**
 * Recupera todos los vecinos.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
async function getNeighbors(req, res) {
  try {
    const neighbors = await getAllNeighbors();
    return res.status(200).json(neighbors);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  addNeighbor,
  getNeighbors,
};
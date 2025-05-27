// src/controllers/vecino.controller.js
import VecinoService from '../services/vecino.service.js';
import { respondSuccess, respondError } from '../utils/resHandler.js'; // Asumo que tienes estos manejadores
import { handleError } from '../utils/errorHandler.js';
// Aquí podrías importar esquemas de validación Joi si los usas para el body
// import { createVecinoSchema, updateVecinoSchema } from '../schemas/vecino.schema.js';

class VecinoController {
  async getAllVecinos(req, res) {
    try {
      const [vecinos, error] = await VecinoService.getAllVecinos();
      if (error) return respondError(req, res, 404, error);
      if (vecinos.length === 0) return respondSuccess(req, res, 204); // No content
      respondSuccess(req, res, 200, vecinos);
    } catch (e) {
      handleError(e, 'vecino.controller -> getAllVecinos');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }

  async getVecinoById(req, res) {
    try {
      const { id } = req.params;
      // const { error: paramsError } = idSchema.validate({ id }); // Si usas Joi para params
      // if (paramsError) return respondError(req, res, 400, paramsError.details[0].message);

      const [vecino, error] = await VecinoService.getVecinoById(id);
      if (error) return respondError(req, res, 404, error);
      respondSuccess(req, res, 200, vecino);
    } catch (e) {
      handleError(e, 'vecino.controller -> getVecinoById');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }

  async createVecino(req, res) {
    try {
      const { body } = req;
      // const { error: bodyError } = createVecinoSchema.validate(body); // Si usas Joi
      // if (bodyError) return respondError(req, res, 400, bodyError.details[0].message);

      const [nuevoVecino, error] = await VecinoService.createVecino(body);
      if (error) return respondError(req, res, 400, error); // 400 por error de data o validación
      respondSuccess(req, res, 201, nuevoVecino);
    } catch (e) {
      handleError(e, 'vecino.controller -> createVecino');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }

  async updateVecino(req, res) {
    try {
      const { id } = req.params;
      const { body } = req;
      // Validar params y body con Joi si es necesario

      const [vecinoActualizado, error] = await VecinoService.updateVecino(id, body);
      if (error) return respondError(req, res, 400, error); // 404 si no encontrado, 400 si data error
      respondSuccess(req, res, 200, vecinoActualizado);
    } catch (e) {
      handleError(e, 'vecino.controller -> updateVecino');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }

  async deleteVecino(req, res) {
    try {
      const { id } = req.params;
      // Validar params con Joi si es necesario

      const [resultado, error] = await VecinoService.deleteVecino(id);
      if (error) return respondError(req, res, 404, error);
      respondSuccess(req, res, 200, resultado); // o 204 si no devuelves contenido
    } catch (e) {
      handleError(e, 'vecino.controller -> deleteVecino');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }
}

export default new VecinoController();

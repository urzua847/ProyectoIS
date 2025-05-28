import VecinoService from '../services/vecino.service.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';
import { handleError } from '../utils/errorHandler.js';

class VecinoController {
  async getAllVecinos(req, res) {
    try {
      const [vecinos, error] = await VecinoService.getAllVecinos();
      if (error) return respondError(req, res, 404, error);
      if (vecinos.length === 0) return respondSuccess(req, res, 204); 
      respondSuccess(req, res, 200, vecinos);
    } catch (e) {
      handleError(e, 'vecino.controller -> getAllVecinos');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }

  async getVecinoById(req, res) {
    try {
      const { id } = req.params;
    
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

      const [nuevoVecino, error] = await VecinoService.createVecino(body);
      if (error) return respondError(req, res, 400, error); 
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

      const [vecinoActualizado, error] = await VecinoService.updateVecino(id, body);
      if (error) return respondError(req, res, 400, error);
      respondSuccess(req, res, 200, vecinoActualizado);
    } catch (e) {
      handleError(e, 'vecino.controller -> updateVecino');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }

  async deleteVecino(req, res) {
    try {
      const { id } = req.params;

      const [resultado, error] = await VecinoService.deleteVecino(id);
      if (error) return respondError(req, res, 404, error);
      respondSuccess(req, res, 200, resultado);
    } catch (e) {
      handleError(e, 'vecino.controller -> deleteVecino');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }
}

export default new VecinoController();

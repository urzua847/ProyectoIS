import AsambleaService from '../services/asamblea.service.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';
import { handleError } from '../utils/errorHandler.js';

class AsambleaController {
  async getAllAsambleas(req, res) {
    try {
      const [asambleas, error] = await AsambleaService.getAllAsambleas();
      if (error) return respondError(req, res, 404, error);
      if (asambleas.length === 0) return respondSuccess(req, res, 204);
      respondSuccess(req, res, 200, asambleas);
    } catch (e) {
      handleError(e, 'asamblea.controller -> getAllAsambleas');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }

  async getAsambleaById(req, res) {
    try {
      const { id } = req.params;
      const [asamblea, error] = await AsambleaService.getAsambleaById(id);
      if (error) return respondError(req, res, 404, error);
      respondSuccess(req, res, 200, asamblea);
    } catch (e) {
      handleError(e, 'asamblea.controller -> getAsambleaById');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }

  async createAsamblea(req, res) {
    try {
      const { body } = req;
 
      const creadorId = req.user?.id;
      if (!creadorId) {
        return respondError(req, res, 401, 'No autorizado: Usuario no identificado.');
      }


      const [nuevaAsamblea, error] = await AsambleaService.createAsamblea(body, creadorId);
      if (error) return respondError(req, res, 400, error); 
      respondSuccess(req, res, 201, nuevaAsamblea);
    } catch (e) {
      handleError(e, 'asamblea.controller -> createAsamblea');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }

  async updateAsamblea(req, res) {
    try {
      const { id } = req.params;
      const { body } = req;
      const editorId = req.user?.id;
      if (!editorId) {
        return respondError(req, res, 401, 'No autorizado: Usuario no identificado.');
      }

      const [asambleaActualizada, error] = await AsambleaService.updateAsamblea(id, body, editorId);
      if (error) return respondError(req, res, 400, error);
      respondSuccess(req, res, 200, asambleaActualizada);
    } catch (e) {
      handleError(e, 'asamblea.controller -> updateAsamblea');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }

  async deleteAsamblea(req, res) {
    try {
      const { id } = req.params;
      const eliminadorId = req.user?.id;
      if (!eliminadorId) {
        return respondError(req, res, 401, 'No autorizado: Usuario no identificado.');
      }

      const [resultado, error] = await AsambleaService.deleteAsamblea(id, eliminadorId);
      if (error) return respondError(req, res, 404, error);
      respondSuccess(req, res, 200, resultado);
    } catch (e) {
      handleError(e, 'asamblea.controller -> deleteAsamblea');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }
}

export default new AsambleaController();
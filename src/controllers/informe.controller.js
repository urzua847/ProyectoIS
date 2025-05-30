import InformeService from '../services/informe.service.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';
import { handleError } from '../utils/errorHandler.js';

class InformeController {
    async getAllInformes(req, res){
        try {
            const [informes, error] = await InformeService.getAllInformes();
            if (error) return respondError(req, res, 404, error);
            if (informes.length ===0) return respondSuccess(req, res, 204);
            respondSuccess(req, res, 200, informes);
        } catch (e) {
            handleError(e, 'informe.controller -> getAllInformes');
            respondError(req,res,500, 'Error interno del servidor.');
        }
    }
    async getInformeById(req, res){
        try {
            const { id } = req.params;
            
            const [informe, error] = await InformeService.getInformeById(id);
            if (error) return respondError(req, res, 404, error);
            respondSuccess(req, res, 200, informe);
        } catch (e) {
            handleError(e, 'informe.controller -> getInformeById');
            respondError(req,res,500, 'Error interno del servidor.');
        }
    }

    async createInforme(req, res){
        try {
            
        } catch (e) {
            handleError(e,'informe.controller -> getControllerById');
            respondError(req,res,500, 'Error interno del servidor.');
        }
    }

    async updateInforme(req, res){
        try {
            const { id } = req.params;
            const { body } = req;
            const [informeActualizado, error] =await InformeService.updateInforme(id, body);
            if (error) return respondError(req, res, 400, error);
      respondSuccess(req, res, 200, result);
        } catch (e) {
            handleError(e, 'Informe.controller -> updateInforme');
            respondError(req, res, 500, 'Error interno del servidor.');
        }
    }
    async deleteInforme(req, res){
        try {
            const { id } = req.params;
            const [resultado, error] = await InformeService.deleteInforme(id);
            if (error) return respondError(req, res, 404, error);
      respondSuccess(req, res, 200, resultado);
        } catch (e) {
            handleError(e, 'informe.controller -> deleteInforme');
            respondError(req, res, 500, 'Error interno del servidor');
        }
    }
}

export default new InformeController();
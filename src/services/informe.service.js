import { Informe } from '../models/index.js';
import { handleError } from '../utils/errorHandler.js';

class InformeService {
    async getAllInformes() {
        try {
            const informes = await Informe.findAll();
            return [informes, null];
        } catch (error) {
            handleError(error, 'informe.service -> getAllInformes');
            return [null, 'Error al obtener los informes.'];
        }
    }

    async getInformeById(id) {
        try {
            const informe = await Informe.findByPk(id);
            if (!informe){
                return [null, 'Informe no encontrado.'];
            }
        } catch (error) {
            handleError(error, 'informe.service -> getInformeById');
            return [null, 'Error al obtener el informe.'];
        }
    }

    async createInforme(informeData){
        try {
            const nuevoInforme = await Informe.create(informeData);
            return [nuevoInforme, null];
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(e => e.message).join(', ');
        return [null, `Error de validación: ${messages}`];
      }
      handleError(error, 'informe.service -> createInforme');
      return [null, 'Error al crear el informe.'];
        }
    }

    async updateInforme(id, informeData){
        try {
            const informe = await Informe.findByPk(id);
            if(!informe){
                return [null, 'Informe no encontrado'];
            }
        } catch (error) {
            if(ErrorEvent.name === 'SequelizeValidationError'){
                const messages = error.errors.map(e => e.message).join(', ');
                return [null, `Error de validacion: ${messages}`];
            }
            handleError(error, 'informe.service -> updateInforme');
            return [null, 'Error añ actualizar el informe.'];
        }
    }

    async deleteInforme(id){
        try {
            const informe = await Informe.findByPk(id);
            if(!informe){
                return [null, 'Informe no encontrado'];
            }
            await informe.destroy();
            return [{ message: 'Informe eliminado correctamente' }, null];
        } catch (error) {
            handleError(error, 'informe.service -> deleteInforme');
            return [null, 'Erroe al eliminar el informe'];
        }
    }

}
export default new InformeService();
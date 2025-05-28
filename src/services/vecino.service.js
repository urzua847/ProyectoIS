import { Vecino } from '../models/index.js';
import { handleError } from '../utils/errorHandler.js';

class VecinoService {
  async getAllVecinos() {
    try {
      const vecinos = await Vecino.findAll();
      return [vecinos, null];
    } catch (error) {
      handleError(error, 'vecino.service -> getAllVecinos');
      return [null, 'Error al obtener los vecinos.'];
    }
  }

  async getVecinoById(id) {
    try {
      const vecino = await Vecino.findByPk(id);
      if (!vecino) {
        return [null, 'Vecino no encontrado.'];
      }
      return [vecino, null];
    } catch (error) {
      handleError(error, 'vecino.service -> getVecinoById');
      return [null, 'Error al obtener el vecino.'];
    }
  }

  async createVecino(vecinoData) {
    try {
      const existingVecino = await Vecino.findOne({ where: { email: vecinoData.email } });
      if (existingVecino) {
        return [null, 'El correo electrónico ya está registrado para otro vecino.'];
      }

      const nuevoVecino = await Vecino.create(vecinoData);
      return [nuevoVecino, null];
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(e => e.message).join(', ');
        return [null, `Error de validación: ${messages}`];
      }
      handleError(error, 'vecino.service -> createVecino');
      return [null, 'Error al crear el vecino.'];
    }
  }

  async updateVecino(id, vecinoData) {
    try {
      const vecino = await Vecino.findByPk(id);
      if (!vecino) {
        return [null, 'Vecino no encontrado.'];
      }

      if (vecinoData.email && vecinoData.email !== vecino.email) {
        const existingVecino = await Vecino.findOne({ where: { email: vecinoData.email } });
        if (existingVecino) {
          return [null, 'El correo electrónico ya está registrado para otro vecino.'];
        }
      }

      const updatedVecino = await vecino.update(vecinoData);
      return [updatedVecino, null];
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(e => e.message).join(', ');
        return [null, `Error de validación: ${messages}`];
      }
      handleError(error, 'vecino.service -> updateVecino');
      return [null, 'Error al actualizar el vecino.'];
    }
  }

  async deleteVecino(id) {
    try {
      const vecino = await Vecino.findByPk(id);
      if (!vecino) {
        return [null, 'Vecino no encontrado.'];
      }
      await vecino.destroy();
      return [{ message: 'Vecino eliminado correctamente.' }, null];
    } catch (error) {
      handleError(error, 'vecino.service -> deleteVecino');
      return [null, 'Error al eliminar el vecino.'];
    }
  }
}

export default new VecinoService();
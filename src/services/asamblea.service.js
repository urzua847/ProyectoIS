import { Asamblea, Usuario, Vecino, sequelize } from '../models/index.js';
import { sendEmail } from '../utils/mailer.js';
import { handleError } from '../utils/errorHandler.js';

class AsambleaService {
  async getAllAsambleas() {
    try {
      const asambleas = await Asamblea.findAll({
        include: [{ model: Usuario, as: 'creador', attributes: ['id', 'username', 'email'] }],
        order: [['fecha', 'DESC'], ['hora', 'DESC']],
      });
      return [asambleas, null];
    } catch (error) {
      handleError(error, 'asamblea.service -> getAllAsambleas');
      return [null, 'Error al obtener las asambleas.'];
    }
  }

  async getAsambleaById(id) {
    try {
      const asamblea = await Asamblea.findByPk(id, {
        include: [{ model: Usuario, as: 'creador', attributes: ['id', 'username', 'email'] }],
      });
      if (!asamblea) {
        return [null, 'Asamblea no encontrada.'];
      }
      return [asamblea, null];
    } catch (error) {
      handleError(error, 'asamblea.service -> getAsambleaById');
      return [null, 'Error al obtener la asamblea.'];
    }
  }

  async createAsamblea(asambleaData, creadorId) {
    const t = await sequelize.transaction();
    try {
      const creador = await Usuario.findByPk(creadorId, { transaction: t });

      if (!creador) {
        await t.rollback();
        return [null, 'Usuario creador no encontrado.'];
      }

      if (!creador.esDirectiva || !creador.directivaVigente) {
        await t.rollback();
        return [null, 'El usuario no es un miembro vigente de la directiva o no tiene permisos para crear asambleas.'];
      }

      const nuevaAsamblea = await Asamblea.create({
        ...asambleaData,
        creadorId: creador.id,
        estado: 'planificada', 
      }, { transaction: t });

      const vecinos = await Vecino.findAll({ attributes: ['email', 'nombre'], transaction: t });
      if (vecinos.length > 0) {
        const listaEmails = vecinos.map(v => v.email).join(',');
        const asunto = `Convocatoria a Asamblea: ${nuevaAsamblea.descripcion.substring(0, 50)}...`;
        const cuerpoTexto = `Estimados vecinos,\n\nSe les convoca a una asamblea el día ${nuevaAsamblea.fecha} a las ${nuevaAsamblea.hora}.\nDescripción: ${nuevaAsamblea.descripcion}\n\nAtentamente,\nLa Directiva.`;
        const cuerpoHtml = `
          <h1>Convocatoria a Asamblea</h1>
          <p>Estimados vecinos,</p>
          <p>Se les convoca a una asamblea con la siguiente información:</p>
          <ul>
            <li><strong>Fecha:</strong> ${nuevaAsamblea.fecha}</li>
            <li><strong>Hora:</strong> ${nuevaAsamblea.hora}</li>
            <li><strong>Descripción:</strong> ${nuevaAsamblea.descripcion}</li>
          </ul>
          <p>Su asistencia es importante.</p>
          <p>Atentamente,<br/>La Directiva.</p>
        `;

        try {

        } catch (emailError) {
          console.error(`Error al enviar correos para asamblea ${nuevaAsamblea.id}:`, emailError);
        }
      } else {
        console.log(`Asamblea ${nuevaAsamblea.id} creada, pero no hay vecinos registrados para notificar.`);
      }
      
      await t.commit(); 

    
       if (vecinos.length > 0) {
        const listaEmails = vecinos.map(v => v.email).join(',');
        const asunto = `Convocatoria a Asamblea: ${nuevaAsamblea.descripcion.substring(0, 50)}...`;
        const cuerpoTexto = `Estimados vecinos,\n\nSe les convoca a una asamblea el día ${nuevaAsamblea.fecha} a las ${nuevaAsamblea.hora}.\nDescripción: ${nuevaAsamblea.descripcion}\n\nAtentamente,\nLa Directiva.`;
        const cuerpoHtml = `
          <h1>Convocatoria a Asamblea</h1>
          <p>Estimados vecinos,</p>
          <p>Se les convoca a una asamblea con la siguiente información:</p>
          <ul>
            <li><strong>Fecha:</strong> ${nuevaAsamblea.fecha}</li>
            <li><strong>Hora:</strong> ${nuevaAsamblea.hora}</li>
            <li><strong>Descripción:</strong> ${nuevaAsamblea.descripcion}</li>
          </ul>
          <p>Su asistencia es importante.</p>
          <p>Atentamente,<br/>La Directiva.</p>
        `;
        await sendEmail(listaEmails, asunto, cuerpoTexto, cuerpoHtml);
      }


      return [nuevaAsamblea, null];
    } catch (error) {
      await t.rollback(); 
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(e => e.message).join(', ');
        return [null, `Error de validación: ${messages}`];
      }
      handleError(error, 'asamblea.service -> createAsamblea');
      return [null, 'Error al crear la asamblea.'];
    }
  }

  async updateAsamblea(id, asambleaData, editorId) {
    try {
      const asamblea = await Asamblea.findByPk(id);
      if (!asamblea) {
        return [null, 'Asamblea no encontrada.'];
      }

      const updatedAsamblea = await asamblea.update(asambleaData);
      return [updatedAsamblea, null];
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(e => e.message).join(', ');
        return [null, `Error de validación: ${messages}`];
      }
      handleError(error, 'asamblea.service -> updateAsamblea');
      return [null, 'Error al actualizar la asamblea.'];
    }
  }

  async deleteAsamblea(id, eliminadorId) {
    try {
      const asamblea = await Asamblea.findByPk(id);
      if (!asamblea) {
        return [null, 'Asamblea no encontrada.'];
      }
      await asamblea.destroy();
      return [{ message: 'Asamblea eliminada correctamente.' }, null];
    } catch (error) {
      handleError(error, 'asamblea.service -> deleteAsamblea');
      return [null, 'Error al eliminar la asamblea.'];
    }
  }
}

export default new AsambleaService();

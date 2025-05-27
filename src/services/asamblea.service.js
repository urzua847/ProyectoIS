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
    const t = await sequelize.transaction(); // Iniciar transacción
    try {
      // 1. Verificar si el miembro de la directiva que la creó está en estado regular (activo/vigente)
      const creador = await Usuario.findByPk(creadorId, { transaction: t });

      if (!creador) {
        await t.rollback();
        return [null, 'Usuario creador no encontrado.'];
      }

      // Asumimos que 'esDirectiva' y 'directivaVigente' son booleanos en el modelo Usuario
      // y 'directivaCargo' indica su rol.
      // También podrías verificar un rol específico si es necesario (ej. 'admin_directiva')
      if (!creador.esDirectiva || !creador.directivaVigente) {
        await t.rollback();
        return [null, 'El usuario no es un miembro vigente de la directiva o no tiene permisos para crear asambleas.'];
      }

      // 2. Crear la asamblea
      const nuevaAsamblea = await Asamblea.create({
        ...asambleaData,
        creadorId: creador.id, // Asegurar que el creadorId se guarda
        estado: 'planificada', // Estado inicial
      }, { transaction: t });

      // 3. Emitir notificación a los vecinos por correo electrónico
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
            // El envío de correo no debe estar dentro de la transacción de BD
            // ya que si falla el correo, no queremos revertir la creación de la asamblea.
            // Sin embargo, si el envío de correo es CRÍTICO, podrías reconsiderarlo
            // o usar un sistema de colas para reintentos.
            // Aquí lo hacemos después de confirmar la transacción.
        } catch (emailError) {
          // Si el envío de correo falla, la asamblea ya está creada.
          // Deberías loggear este error y quizás tener un mecanismo para reintentar o notificar al admin.
          console.error(`Error al enviar correos para asamblea ${nuevaAsamblea.id}:`, emailError);
          // No retornamos error aquí para que la creación de la asamblea sea exitosa.
          // El usuario podría ser notificado de que la asamblea se creó pero hubo problemas con las notificaciones.
        }
      } else {
        console.log(`Asamblea ${nuevaAsamblea.id} creada, pero no hay vecinos registrados para notificar.`);
      }
      
      await t.commit(); // Confirmar transacción si todo fue bien

      // Enviar correos después de confirmar la transacción
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
      await t.rollback(); // Revertir transacción en caso de error
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(e => e.message).join(', ');
        return [null, `Error de validación: ${messages}`];
      }
      handleError(error, 'asamblea.service -> createAsamblea');
      return [null, 'Error al crear la asamblea.'];
    }
  }

  async updateAsamblea(id, asambleaData, editorId) {
    // Similar a createAsamblea, verificar permisos del editorId si es necesario
    try {
      const asamblea = await Asamblea.findByPk(id);
      if (!asamblea) {
        return [null, 'Asamblea no encontrada.'];
      }

      // Verificar permisos del editor (si es diferente al creador o si hay reglas específicas)
      // const editor = await Usuario.findByPk(editorId);
      // if (!editor || !editor.esDirectiva || !editor.directivaVigente) {
      //   return [null, 'No tiene permisos para editar esta asamblea.'];
      // }

      const updatedAsamblea = await asamblea.update(asambleaData);
      // Podrías reenviar notificaciones si la fecha/hora/descripción cambian.
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
    // Similar, verificar permisos del eliminadorId
    try {
      const asamblea = await Asamblea.findByPk(id);
      if (!asamblea) {
        return [null, 'Asamblea no encontrada.'];
      }
      await asamblea.destroy();
      // Podrías enviar una notificación de cancelación.
      return [{ message: 'Asamblea eliminada correctamente.' }, null];
    } catch (error) {
      handleError(error, 'asamblea.service -> deleteAsamblea');
      return [null, 'Error al eliminar la asamblea.'];
    }
  }
}

export default new AsambleaService();

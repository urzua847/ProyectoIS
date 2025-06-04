"use strict";
import Vecino from "../entity/vecino.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { encryptPassword, comparePassword } from "../helpers/bcrypt.helper.js"; // Para manejar contraseñas

const vecinoRepository = AppDataSource.getRepository(Vecino);

/**
 * Crea un nuevo vecino en el sistema.
 * @param {object} vecinoData - Datos del vecino a crear.
 * @param {string} vecinoData.nombres
 * @param {string} vecinoData.apellidos
 * @param {string} vecinoData.email
 * @param {string} vecinoData.password - Contraseña en texto plano.
 * @param {string} [vecinoData.rut]
 * @param {string} [vecinoData.direccion]
 * @param {string} [vecinoData.numeroVivienda]
 * @param {string} [vecinoData.telefonoContacto]
 * @param {string} [vecinoData.rolJunta] - Por defecto "vecino_registrado".
 * @param {boolean} [vecinoData.esMiembroDirectivaVigente]
 * @param {string} [vecinoData.cargoDirectiva]
 * @param {Date} [vecinoData.fechaInicioDirectiva]
 * @param {Date} [vecinoData.fechaFinDirectiva]
 * @returns {Promise<[object|null, object|null]>} - Retorna [vecinoCreado, null] o [null, errorInfo].
 */
export async function createVecinoService(vecinoData) {
  try {
    const { email, rut, password: plainPassword, ...otrosDatos } = vecinoData;

    // Verificar si el email ya existe
    const existingEmail = await vecinoRepository.findOneBy({ email });
    if (existingEmail) {
      return [
        null,
        {
          field: "email",
          message: "El correo electrónico ya está registrado.",
        },
      ];
    }

    // Verificar si el RUT ya existe (si se proporciona y es único)
    if (rut) {
      const existingRut = await vecinoRepository.findOneBy({ rut });
      if (existingRut) {
        return [null, { field: "rut", message: "El RUT ya está registrado." }];
      }
    }

    // Encriptar contraseña
    const hashedPassword = await encryptPassword(plainPassword);

    const nuevoVecino = vecinoRepository.create({
      ...otrosDatos,
      email,
      rut,
      password: hashedPassword,
      rolJunta: otrosDatos.rolJunta || "vecino_registrado",
      esMiembroDirectivaVigente: otrosDatos.esMiembroDirectivaVigente || false,
    });

    const vecinoGuardado = await vecinoRepository.save(nuevoVecino);
    const { password, ...vecinoSinPassword } = vecinoGuardado; // No retornar la contraseña
    return [vecinoSinPassword, null];
  } catch (error) {
    console.error("Error en createVecinoService:", error);
    // Podrías verificar error.code para constraints de BD (ej. '23505' en PostgreSQL para unique violation)
    return [
      null,
      { message: "Error interno del servidor al registrar al vecino." },
    ];
  }
}

/**
 * Obtiene un vecino por su ID.
 * @param {number} idVecino - ID del vecino.
 * @returns {Promise<[object|null, object|null]>}
 */
export async function getVecinoByIdService(idVecino) {
  try {
    const vecino = await vecinoRepository.findOne({
      where: { id: idVecino },
      // relations: ["asambleasOrganizadas", "iniciativasPropuestas"] // Cargar relaciones si es necesario
    });

    if (!vecino) {
      return [null, { message: "Vecino no encontrado." }];
    }
    const { password, ...vecinoSinPassword } = vecino;
    return [vecinoSinPassword, null];
  } catch (error) {
    console.error("Error en getVecinoByIdService:", error);
    return [
      null,
      { message: "Error interno del servidor al obtener el vecino." },
    ];
  }
}

/**
 * Obtiene todos los vecinos (considerar paginación y filtros para producción).
 * @param {object} [options] - Opciones de filtrado y paginación.
 * @param {number} [options.page=1] - Página actual.
 * @param {number} [options.limit=10] - Resultados por página.
 * @param {string} [options.rolJunta] - Filtrar por rol.
 * @param {boolean} [options.esDirectiva] - Filtrar si es miembro de directiva.
 * @returns {Promise<[Array<object>|null, object|null]>}
 */
export async function getVecinosService(options = {}) {
  try {
    const { page = 1, limit = 10, rolJunta, esDirectiva } = options;
    const whereConditions = {};
    if (rolJunta) whereConditions.rolJunta = rolJunta;
    if (typeof esDirectiva === "boolean")
      whereConditions.esMiembroDirectivaVigente = esDirectiva;

    const [vecinos, total] = await vecinoRepository.findAndCount({
      where: whereConditions,
      skip: (page - 1) * limit,
      take: limit,
      order: { apellidos: "ASC", nombres: "ASC" },
      // select: ["id", "nombres", "apellidos", "email", "rolJunta", "esMiembroDirectivaVigente"] // No incluir password
    });

    const vecinosSinPassword = vecinos.map((v) => {
      const { password, ...resto } = v;
      return resto;
    });

    return [{ vecinos: vecinosSinPassword, total, page, limit }, null];
  } catch (error) {
    console.error("Error en getVecinosService:", error);
    return [
      null,
      { message: "Error interno del servidor al listar los vecinos." },
    ];
  }
}

/**
 * Actualiza la información de un vecino.
 * @param {number} idVecino - ID del vecino a actualizar.
 * @param {object} updateData - Datos a actualizar.
 * @returns {Promise<[object|null, object|null]>}
 */
export async function updateVecinoService(idVecino, updateData) {
  try {
    const vecino = await vecinoRepository.findOneBy({ id: idVecino });
    if (!vecino) {
      return [null, { message: "Vecino no encontrado para actualizar." }];
    }

    // Evitar que se actualice la contraseña directamente aquí, usar un servicio específico si es necesario.
    const { password, email, rut, ...dataToUpdate } = updateData;

    // Si se intenta cambiar email o RUT, verificar unicidad
    if (email && email !== vecino.email) {
      const existingEmail = await vecinoRepository.findOneBy({ email });
      if (existingEmail)
        return [
          null,
          {
            field: "email",
            message: "El nuevo correo electrónico ya está en uso.",
          },
        ];
      dataToUpdate.email = email;
    }
    if (rut && rut !== vecino.rut) {
      const existingRut = await vecinoRepository.findOneBy({ rut });
      if (existingRut)
        return [
          null,
          { field: "rut", message: "El nuevo RUT ya está en uso." },
        ];
      dataToUpdate.rut = rut;
    }

    // Lógica para actualizar esMiembroDirectivaVigente basado en fechas
    if (dataToUpdate.fechaFinDirectiva) {
      const hoy = new Date();
      const fechaFin = new Date(dataToUpdate.fechaFinDirectiva);
      dataToUpdate.esMiembroDirectivaVigente =
        fechaFin >= hoy 
        && (dataToUpdate.fechaInicioDirectiva
          ? new Date(dataToUpdate.fechaInicioDirectiva) <= hoy
          : true);
    } else if (
      typeof dataToUpdate.esMiembroDirectivaVigente === "boolean"
      && !dataToUpdate.esMiembroDirectivaVigente
    ) {
      // Si explícitamente se pone como no vigente, limpiar cargo y fechas
      dataToUpdate.cargoDirectiva = null;
      dataToUpdate.fechaInicioDirectiva = null;
      dataToUpdate.fechaFinDirectiva = null;
    }

    await vecinoRepository.update(idVecino, dataToUpdate);
    const vecinoActualizado = await vecinoRepository.findOneBy({
      id: idVecino,
    });
    const { password: _, ...vecinoSinPassword } = vecinoActualizado; 
    return [vecinoSinPassword, null];
  } catch (error) {
    console.error("Error en updateVecinoService:", error);
    return [
      null,
      { message: "Error interno del servidor al actualizar el vecino." },
    ];
  }
}

/**
 * Elimina un vecino (considerar borrado lógico).
 * @param {number} idVecino - ID del vecino.
 * @returns {Promise<[object|null, object|null]>}
 */
export async function deleteVecinoService(idVecino) {
  try {
    const result = await vecinoRepository.delete(idVecino);
    if (result.affected === 0) {
      return [null, { message: "Vecino no encontrado para eliminar." }];
    }
    return [{ message: "Vecino eliminado correctamente." }, null];
    // Para borrado lógico, se actualizaría un campo "activo" o "fechaEliminacion"
  } catch (error) {
    console.error("Error en deleteVecinoService:", error);
    // Manejar errores de FK si el vecino está referenciado y no se puede borrar (ej. organizador de asamblea con onDelete: "RESTRICT")
    return [
      null,
      { message: "Error interno del servidor al eliminar el vecino." },
    ];
  }
}

/**
 * Verifica si un vecino es miembro vigente de la directiva.
 * @param {number} idVecinoOrganizador - ID del vecino.
 * @returns {Promise<[boolean, string|null]>} - [esVigente, mensajeDeErrorSiFalla]
 */
export async function verificarDirectivaVigenteService(idVecinoOrganizador) {
  try {
    const vecino = await vecinoRepository.findOneBy({
      id: idVecinoOrganizador,
    });
    if (!vecino) {
      return [false, "Vecino organizador no encontrado."];
    }

    // Lógica de verificación de vigencia:
    // 1. Chequear el flag esMiembroDirectivaVigente
    // 2. Opcionalmente, re-validar con fechas si es necesario una lógica más estricta.
    const hoy = new Date();
    const esVigentePorFlag = vecino.esMiembroDirectivaVigente;
    const esVigentePorFechas =
      vecino.fechaInicioDirectiva
      && new Date(vecino.fechaInicioDirectiva) <= hoy
      && (!vecino.fechaFinDirectiva || new Date(vecino.fechaFinDirectiva) >= hoy);

    // Por ahora, usaremos el flag, asumiendo que se mantiene actualizado.
    if (esVigentePorFlag && esVigentePorFechas) {
      return [true, null];
    }
    // Si el flag es true pero las fechas no cuadran, podría ser un problema de datos.
    // Si las fechas cuadran pero el flag es false, también.

    if (vecino.esMiembroDirectivaVigente) {
      // Si el flag es true, pero queremos validar con fechas (más robusto)
      if (
        vecino.fechaFinDirectiva 
        && new Date(vecino.fechaFinDirectiva) < hoy
      ) {
        // El período ya terminó, el flag debería actualizarse
        console.warn(
          `Vecino ${idVecinoOrganizador} tiene esMiembroDirectivaVigente=true pero su período ya terminó.`
        );
        // Opcional: Actualizar el flag aquí
        // await vecinoRepository.update(idVecinoOrganizador, { esMiembroDirectivaVigente: false });
        return [false, "El período del miembro de la directiva ha finalizado."];
      }
      return [true, null]; // Es vigente según el flag y/o fechas
    }

    return [false, "El organizador no es un miembro vigente de la directiva."];
  } catch (error) {
    console.error("Error en verificarDirectivaVigenteService:", error);
    return [
      false,
      "Error interno al verificar el estado del miembro de la directiva.",
    ];
  }
}
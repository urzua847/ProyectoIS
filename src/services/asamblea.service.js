"use strict";
import Asamblea from "../entity/asamblea.entity.js";
import Vecino from "../entity/vecino.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { verificarDirectivaVigenteService } from "./vecino.service.js";

const asambleaRepository = AppDataSource.getRepository(Asamblea);
const vecinoRepository = AppDataSource.getRepository(Vecino);

/**
 * Organiza (crea) una nueva asamblea.
 * Verifica si el organizador es un miembro vigente de la directiva.
 * La notificación a vecinos se maneja externamente (ej. en el controlador).
 * @param {object} asambleaData - Datos de la asamblea.
 * @param {string} asambleaData.titulo
 * @param {string} [asambleaData.descripcionOrdenDia]
 * @param {Date | string} asambleaData.fechaHora
 * @param {string} [asambleaData.lugar]
 * @param {number} asambleaData.organizadorId - ID del Vecino (miembro directiva) que organiza.
 * @returns {Promise<[object|null, object|null]>} - [asambleaCreada, null] o [null, errorInfo].
 */
export async function organizarAsambleaService(asambleaData) {
  try {
    const { organizadorId, ...data } = asambleaData;

    const [esDirectivaVigente, errorVerificacion] = await verificarDirectivaVigenteService(organizadorId);
    if (errorVerificacion) {
      return [null, { message: errorVerificacion }];
    }
    if (!esDirectivaVigente) {
      return [null, { message: "El organizador no es un miembro vigente de la directiva o no tiene permisos para crear asambleas." }];
    }

    const organizador = await vecinoRepository.findOneBy({ id: organizadorId });
    if (!organizador) {
        return [null, { message: "Vecino organizador no encontrado." }];
    }

    const nuevaAsamblea = asambleaRepository.create({
      ...data,
      organizador: organizador,
      estado: "planificada",
    });

    const asambleaGuardada = await asambleaRepository.save(nuevaAsamblea);
    return [asambleaGuardada, null];

  } catch (error) {
    console.error("Error en organizarAsambleaService:", error);
    return [null, { message: "Error interno del servidor al organizar la asamblea." }];
  }
}

/**
 * Obtiene una asamblea por su ID.
 * @param {number} idAsamblea - ID de la asamblea.
 * @returns {Promise<[object|null, object|null]>}
 */
export async function getAsambleaByIdService(idAsamblea) {
  try {
    const asamblea = await asambleaRepository.findOne({
      where: { id: idAsamblea },
      relations: ["organizador", "acta"],
    });
    if (!asamblea) {
      return [null, { message: "Asamblea no encontrada." }];
    }
    if (asamblea.organizador) {
        const { password, ...organizadorInfo } = asamblea.organizador;
        asamblea.organizador = organizadorInfo;
    }
    return [asamblea, null];
  } catch (error) {
    console.error("Error en getAsambleaByIdService:", error);
    return [null, { message: "Error interno del servidor al obtener la asamblea." }];
  }
}

/**
 * Obtiene todas las asambleas (considerar paginación y filtros).
 * @param {object} [options] - Opciones de filtrado y paginación.
 * @returns {Promise<[Array<object>|null, object|null]>}
 */
export async function getAsambleasService(options = {}) {
  try {
    const { page = 1, limit = 10, estado, fechaDesde, fechaHasta } = options;
    const whereBuilder = asambleaRepository.createQueryBuilder("asamblea")
        .leftJoinAndSelect("asamblea.organizador", "organizador")
        .leftJoinAndSelect("asamblea.acta", "acta") // También cargar el acta si existe
        .select([
            "asamblea.id", "asamblea.titulo", "asamblea.descripcionOrdenDia", "asamblea.fechaHora",
            "asamblea.lugar", "asamblea.estado", "asamblea.fechaCreacion",
            "organizador.id", "organizador.nombres", "organizador.apellidos", "organizador.email",
            "acta.id", "acta.estadoActa" // Campos del acta que quieras mostrar en el listado
        ]);

    if (estado) whereBuilder.andWhere("asamblea.estado = :estado", { estado });
    if (fechaDesde) whereBuilder.andWhere("asamblea.fechaHora >= :fechaDesde", { fechaDesde });
    if (fechaHasta) whereBuilder.andWhere("asamblea.fechaHora <= :fechaHasta", { fechaHasta });

    const [asambleas, total] = await whereBuilder
        .orderBy("asamblea.fechaHora", "DESC")
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

    return [{ asambleas, total, page, limit }, null];
  } catch (error) {
    console.error("Error en getAsambleasService:", error);
    return [null, { message: "Error interno del servidor al listar las asambleas." }];
  }
}

/**
 * Actualiza una asamblea.
 * @param {number} idAsamblea - ID de la asamblea.
 * @param {object} updateData - Datos a actualizar.
 * @returns {Promise<[object|null, object|null]>}
 */
export async function updateAsambleaService(idAsamblea, updateData) {
  try {
    const asamblea = await asambleaRepository.findOneBy({ id: idAsamblea });
    if (!asamblea) {
      return [null, { message: "Asamblea no encontrada para actualizar." }];
    }
    // No permitir cambiar ciertos campos si la asamblea ya fue realizada, por ejemplo.
    if (asamblea.estado === "realizada" && (updateData.fechaHora || updateData.lugar || updateData.titulo || updateData.descripcionOrdenDia)) {
        return [null, { message: "No se pueden modificar los detalles principales de una asamblea ya realizada. Solo el estado o el acta." } ];
    }
    await asambleaRepository.update(idAsamblea, updateData);
    const asambleaActualizada = await getAsambleaByIdService(idAsamblea); // Re-obtener para retornar con relaciones
    return asambleaActualizada;
  } catch (error) {
    console.error("Error en updateAsambleaService:", error);
    return [null, { message: "Error interno del servidor al actualizar la asamblea." }];
  }
}

/**
 * Elimina una asamblea.
 * @param {number} idAsamblea - ID de la asamblea a eliminar.
 * @returns {Promise<[object|null, object|null]>} - [{ message: string }, null] o [null, errorInfo].
 */
export async function deleteAsambleaService(idAsamblea) {
    try {
        const asamblea = await asambleaRepository.findOneBy({ id: idAsamblea });
        if (!asamblea) {
            return [null, { message: "Asamblea no encontrada para eliminar." }];
        }

        if (asamblea.estado === "realizada") {        }

        const result = await asambleaRepository.delete(idAsamblea);

        if (result.affected === 0) {
            return [null, { message: "Asamblea no encontrada durante el proceso de eliminación." }];
        }

        return [{ message: "Asamblea eliminada correctamente." }, null];
    } catch (error) {
        console.error("Error en deleteAsambleaService:", error);
        return [null, { message: "Error interno del servidor al eliminar la asamblea." }];
    }
}

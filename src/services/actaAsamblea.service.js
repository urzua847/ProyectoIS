"use strict";
import ActaAsamblea from "../entity/actaAsamblea.entity.js";
import Asamblea from "../entity/asamblea.entity.js"; // Para verificar la asamblea
import Vecino from "../entity/vecino.entity.js"; // Para la relación con el redactor
import { AppDataSource } from "../config/configDb.js";

const actaRepository = AppDataSource.getRepository(ActaAsamblea);
const asambleaRepository = AppDataSource.getRepository(Asamblea);
const vecinoRepository = AppDataSource.getRepository(Vecino);

/**
 * Crea un acta para una asamblea.
 * @param {number} idAsamblea - ID de la asamblea a la que pertenece el acta.
 * @param {object} actaData - Datos del acta.
 * @param {string} actaData.contenido
 * @param {number} [actaData.redactorId] - ID del Vecino que redacta.
 * @param {string} [actaData.estadoActa] - Por defecto "borrador".
 * @returns {Promise<[object|null, object|null]>}
 */
export async function createActaAsambleaService(idAsamblea, actaData) {
  try {
    // 1. Verificar que la asamblea exista y esté en un estado que permita crear acta (ej. "realizada")
    const asamblea = await asambleaRepository.findOneBy({ id: idAsamblea });
    if (!asamblea) {
      return [
        null,
        { message: `Asamblea con ID ${idAsamblea} no encontrada.` },
      ];
    }
    if (asamblea.estado !== "realizada" && asamblea.estado !== "planificada") {

    }

    // 2. Verificar si ya existe un acta para esta asamblea (si la relación es 1 a 1 estricta)
    const existingActa = await actaRepository.findOneBy({
      asamblea: { id: idAsamblea },
    });
    if (existingActa) {
      return [
        null,
        {
          message: `Ya existe un acta para la asamblea con ID ${idAsamblea}. Puede editarla.`,
        },
      ];
    }

    // 3. Obtener instancia del redactor si se proporciona
    let redactor = null;
    if (actaData.redactorId) {
      redactor = await vecinoRepository.findOneBy({ id: actaData.redactorId });
      if (!redactor) {
        return [
          null,
          {
            message: `Vecino redactor con ID ${actaData.redactorId} no encontrado.`,
          },
        ];
      }
    }

    // 4. Crear el acta
    const nuevaActa = actaRepository.create({
      contenido: actaData.contenido,
      estadoActa: actaData.estadoActa || "borrador",
      asamblea: asamblea, // Asignar la instancia de la asamblea
      redactor: redactor, // Asignar la instancia del redactor
    });

    const actaGuardada = await actaRepository.save(nuevaActa);
    return [actaGuardada, null];
  } catch (error) {
    console.error("Error en createActaAsambleaService:", error);
    return [null, { message: "Error interno del servidor al crear el acta." }];
  }
}

/**
 * Obtiene el acta de una asamblea específica.
 * @param {number} idAsamblea - ID de la asamblea.
 * @returns {Promise<[object|null, object|null]>}
 */
export async function getActaByAsambleaIdService(idAsamblea) {
  try {
    const acta = await actaRepository.findOne({
      where: { asamblea: { id: idAsamblea } },
      relations: ["asamblea", "redactor"],
    });
    if (!acta) {
      return [
        null,
        { message: "No se encontró acta para la asamblea especificada." },
      ];
    }
    // Opcional: quitar datos sensibles del redactor
    if (acta.redactor) {
      const { password, ...redactorInfo } = acta.redactor;
      acta.redactor = redactorInfo;
    }
    return [acta, null];
  } catch (error) {
    console.error("Error en getActaByAsambleaIdService:", error);
    return [
      null,
      { message: "Error interno del servidor al obtener el acta." },
    ];
  }
}

/**
 * Actualiza un acta.
 * @param {number} idActa - ID del acta a actualizar.
 * @param {object} updateData - Datos a actualizar.
 * @returns {Promise<[object|null, object|null]>}
 */
export async function updateActaAsambleaService(idActa, updateData) {
  try {
    const acta = await actaRepository.findOneBy({ id: idActa });
    if (!acta) {
      return [null, { message: "Acta no encontrada para actualizar." }];
    }

    // Lógica de negocio: ej. no permitir modificar contenido si ya está "aprobada"
    if (acta.estadoActa === "aprobada" && updateData.contenido) {
      return [
        null,
        {
          message: "No se puede modificar el contenido de un acta ya aprobada.",
        },
      ];
    }

    // Si se actualiza el redactorId
    if (
      updateData.redactorId &&
      (!acta.redactor || updateData.redactorId !== acta.redactor.id)
    ) {
      const nuevoRedactor = await vecinoRepository.findOneBy({
        id: updateData.redactorId,
      });
      if (!nuevoRedactor)
        return [
          null,
          {
            message: `Nuevo vecino redactor con ID ${updateData.redactorId} no encontrado.`,
          },
        ];
      updateData.redactor = nuevoRedactor; // Asignar la instancia
    }
    delete updateData.redactorId; // Eliminar para que no intente guardarlo como columna

    await actaRepository.update(idActa, updateData);
    const actaActualizada = await actaRepository.findOne({
      where: { id: idActa },
      relations: ["asamblea", "redactor"],
    });
    return [actaActualizada, null];
  } catch (error) {
    console.error("Error en updateActaAsambleaService:", error);
    return [
      null,
      { message: "Error interno del servidor al actualizar el acta." },
    ];
  }
}

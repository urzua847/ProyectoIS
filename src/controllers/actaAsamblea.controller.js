"use strict";
import {
  createActaAsambleaService,
  getActaByAsambleaIdService, 
  updateActaAsambleaService,
} from "../services/actaAsamblea.service.js";
import {
  actaAsambleaBodyValidation,
  actaIdParamValidation,
} from "../validations/actaAsamblea.validation.js";
import { asambleaIdParamValidation } from "../validations/asamblea.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * Controlador para crear un acta para una asamblea.
 * POST /api/asambleas/:asambleaId/acta
 */
export async function createActaController(req, res) {
  try {
    const { asambleaId } = req.params; // ID de la asamblea a la que pertenece el acta
    const { body } = req;
    const redactorId = req.user ? req.user.id : null; // El usuario autenticado es el redactor

    // Validar asambleaId usando el esquema importado de asamblea.validation.js
    const { error: idAsambleaError } = asambleaIdParamValidation.validate({ id: asambleaId });
    if (idAsambleaError) {s
      // Usar 'id' como path ya que asambleaIdParamValidation valida un campo 'id'
      const errors = idAsambleaError.details.map(d => ({ field: d.path[0] === "id" ? "asambleaId" : d.path.join("."), message: d.message }));
      return handleErrorClient(res, 400, "ID de asamblea inválido en la ruta.", errors);
    }

    const { error: bodyError } = actaAsambleaBodyValidation.validate(body);
    if (bodyError) {
      const errors = bodyError.details.map(d => ({ field: d.path.join("."), message: d.message }));
      return handleErrorClient(res, 400, "Datos del acta inválidos.", errors);
    }

    const [nuevaActa, serviceError] = await createActaAsambleaService(Number(asambleaId), { ...body, redactorId });
    if (serviceError) {
      const statusCode = serviceError.message.includes("no encontrada") ? 404
                         : serviceError.message.includes("Ya existe un acta") ? 409 : 400; // 409 Conflict
      return handleErrorClient(res, statusCode, serviceError.message, serviceError);
    }
    return handleSuccess(res, 201, "Acta de asamblea creada exitosamente.", nuevaActa);
  } catch (error) {
    console.error("Error en createActaController:", error);
    return handleErrorServer(res, 500, "Error interno del servidor al crear el acta.");
  }
}

/**
 * Controlador para obtener el acta de una asamblea específica.
 * GET /api/asambleas/:asambleaId/acta
 */
export async function getActaForAsambleaController(req, res) {
  try {
    const { asambleaId } = req.params;
    // Validar asambleaId
    const { error: idAsambleaError } = asambleaIdParamValidation.validate({ id: asambleaId });
    if (idAsambleaError) {
      const errors = idAsambleaError.details.map(d => ({ field: d.path[0] === "id" ? "asambleaId" : d.path.join("."), message: d.message }));
      return handleErrorClient(res, 400, "ID de asamblea inválido en la ruta.", errors);
    }

    const [acta, serviceError] = await getActaByAsambleaIdService(Number(asambleaId));
    if (serviceError) {
      return handleErrorClient(res, 404, serviceError.message); // "No se encontró acta..."
    }
    return handleSuccess(res, 200, "Acta obtenida exitosamente.", acta);
  } catch (error) {
    console.error("Error en getActaForAsambleaController:", error);
    return handleErrorServer(res, 500, "Error interno del servidor al obtener el acta.");
  }
}

/**
 * Controlador para actualizar un acta.
 * PATCH /api/actas/:idActa  (o podría ser /api/asambleas/:asambleaId/acta)
 * Este ejemplo asume que la ruta es /api/actas/:idActa
 */
export async function updateActaController(req, res) {
  try {
    const { idActa } = req.params;
    const { body } = req;
    const redactorActualizadorId = req.user ? req.user.id : null;

    // Validar idActa usando el esquema importado de actaAsamblea.validation.js
    const { error: idActaError } = actaIdParamValidation.validate({ idActa: idActa }); // Asumiendo que el schema espera 'idActa'
    if (idActaError) {
      const errors = idActaError.details.map(d => ({ field: d.path.join("."), message: d.message }));
      return handleErrorClient(res, 400, "ID de acta inválido en la ruta.", errors);
    }

    // const { error: bodyError } = actaAsambleaUpdateValidation.validate(body); // Necesitarás un schema para update
    // if (bodyError) { ... }

    const [actaActualizada, serviceError] = await updateActaAsambleaService(Number(idActa), { ...body, redactorId: redactorActualizadorId });
    if (serviceError) {
      const statusCode = serviceError.message.includes("no encontrada") ? 404 : 400;
      return handleErrorClient(res, statusCode, serviceError.message, serviceError);
    }
    return handleSuccess(res, 200, "Acta actualizada exitosamente.", actaActualizada);
  } catch (error) {
    console.error("Error en updateActaController:", error);
    return handleErrorServer(res, 500, "Error interno del servidor al actualizar el acta.");
  }
}

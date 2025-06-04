"use strict";
import {
  organizarAsambleaService,
  getAsambleaByIdService,
  getAsambleasService,
  updateAsambleaService,
  deleteAsambleaService, 
} from "../services/asamblea.service.js";
import { getVecinosService } from "../services/vecino.service.js";
import { notificarNuevaAsambleaVecinoService } from "../services/notificacion.service.js";
import {
  asambleaBodyValidation,
  asambleaIdParamValidation,
  asambleasQueryValidation,
} from "../validations/asamblea.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function organizarAsambleaController(req, res) {
  try {
    const { body } = req;
    if (!req.user || !req.user.id) {
      return handleErrorClient(res, 401, "No autenticado o ID de usuario no encontrado en token.");
    }
    const organizadorId = req.user.id; // El ID del vecino que organiza la asamblea (debe ser directiva)

    const { error: validationError } = asambleaBodyValidation.validate(body);
    if (validationError) {
      const errors = validationError.details.map(d => ({ field: d.path.join("."), message: d.message }));
      return handleErrorClient(res, 400, "Datos de la asamblea inválidos.", errors);
    }

    const [nuevaAsamblea, serviceError] = await organizarAsambleaService({ ...body, organizadorId });

    if (serviceError) {
      const statusCode = serviceError.message.includes("no encontrado") ? 404 
                         : serviceError.message.includes("no es un miembro vigente") ? 403 : 400;
      return handleErrorClient(res, statusCode, serviceError.message, serviceError);
    }

    if (nuevaAsamblea) {
      const [vecinosData, errorVecinos] = await getVecinosService({ limit: 1000 }); // Obtener todos los vecinos
      if (errorVecinos) {
        console.error("Error al obtener lista de vecinos para notificación:", errorVecinos.message);
      } else if (vecinosData && vecinosData.vecinos.length > 0) {
        vecinosData.vecinos.forEach(vecino => {
          notificarNuevaAsambleaVecinoService(vecino, nuevaAsamblea)
            .catch(err => console.error(`Error al enviar notificación a ${vecino.email}:`, err.message || err));
        });
      }
    }
    return handleSuccess(res, 201, "Asamblea organizada y notificaciones en proceso.", nuevaAsamblea);
  } catch (error) {
    console.error("Error en organizarAsambleaController:", error);
    return handleErrorServer(res, 500, "Error interno del servidor al organizar la asamblea.");
  }
}

export async function getAsambleasController(req, res) {
    try {
        const { query } = req;
        const { error: queryError } = asambleasQueryValidation.validate(query);
        if (queryError) {
            const errors = queryError.details.map(d => ({ field: d.path.join('.'), message: d.message }));
            return handleErrorClient(res, 400, "Parámetros de consulta inválidos.", errors);
        }

        const [data, serviceError] = await getAsambleasService(query);
        if (serviceError) {
            return handleErrorClient(res, 500, serviceError.message);
        }
        if (data.asambleas.length === 0) {
            return handleSuccess(res, 200, "No hay asambleas que coincidan.", data);
        }
        return handleSuccess(res, 200, "Asambleas obtenidas.", data);
    } catch (error) {
        console.error("Error en getAsambleasController:", error);
        return handleErrorServer(res, 500, "Error interno al obtener asambleas.");
    }
}

export async function getAsambleaByIdController(req, res) {
    try {
        const { id } = req.params;
        const { error: idError } = asambleaIdParamValidation.validate({ id });
        if (idError) {
            const errors = idError.details.map(d => ({ field: d.path[0] === "id" ? "id" : d.path.join("."), message: d.message }));
            return handleErrorClient(res, 400, "ID de asamblea inválido.", errors);
        }
        const [asamblea, serviceError] = await getAsambleaByIdService(Number(id));
        if (serviceError) {
            return handleErrorClient(res, 404, serviceError.message);
        }
        return handleSuccess(res, 200, "Asamblea obtenida.", asamblea);
    } catch (error) {
        console.error("Error en getAsambleaByIdController:", error);
        return handleErrorServer(res, 500, "Error interno al obtener la asamblea.");
    }
}

export async function updateAsambleaController(req, res) {
    try {
        const { id } = req.params;
        const { body } = req;

        const { error: idError } = asambleaIdParamValidation.validate({ id });
        if (idError) {
            const errors = idError.details.map(d => ({ field: d.path[0] === "id" ? "id" : d.path.join("."), message: d.message }));
            return handleErrorClient(res, 400, "ID de asamblea inválido.", errors);
        }


        const [asambleaActualizada, serviceError] = await updateAsambleaService(Number(id), body);
        if (serviceError) {
            const statusCode = serviceError.message.includes("no encontrada") ? 404 : 400;
            return handleErrorClient(res, statusCode, serviceError.message, serviceError);
        }
        return handleSuccess(res, 200, "Asamblea actualizada.", asambleaActualizada);
    } catch (error) {
        console.error("Error en updateAsambleaController:", error);
        return handleErrorServer(res, 500, "Error interno al actualizar la asamblea.");
    }
}

/**
 * Controlador para eliminar una asamblea.
 * DELETE /api/asambleas/:id
 */
export async function deleteAsambleaController(req, res) {
    try {
        const { id } = req.params;

        const { error: idError } = asambleaIdParamValidation.validate({ id });
        if (idError) {
            // Corregir el mapeo del campo de error si asambleaIdParamValidation valida 'id'
            const errors = idError.details.map(d => ({ field: d.path[0] === "id" ? "id" : d.path.join("."), message: d.message }));
            return handleErrorClient(res, 400, "ID de asamblea inválido.", errors);
        }

        const [resultado, serviceError] = await deleteAsambleaService(Number(id));

        if (serviceError) {
            const statusCode = serviceError.message.includes("no encontrada") ? 404 : 400;
            return handleErrorClient(res, statusCode, serviceError.message, serviceError);
        }


        return handleSuccess(res, 200, resultado.message, resultado); 

    } catch (error) {
        console.error("Error en deleteAsambleaController:", error);
        return handleErrorServer(res, 500, "Error interno del servidor al eliminar la asamblea.");
    }
}
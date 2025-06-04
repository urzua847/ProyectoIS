    "use strict";
    import {
      createVecinoService, 
      getVecinoByIdService,
      getVecinosService,
      updateVecinoService,
      deleteVecinoService,
    } from "../services/vecino.service.js";
    import { 
      vecinoCreateValidation,
      vecinoUpdateValidation, 
      vecinoIdParamValidation, 
      vecinosQueryValidation, 
    } from "../validations/vecino.validation.js"; 
    import {
      handleErrorClient,
      handleErrorServer,
      handleSuccess,
    } from "../handlers/responseHandlers.js";

    /**
     * Controlador para crear un nuevo vecino (ej. por un administrador).
     * El registro público se maneja en auth.controller.js
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    export async function createVecinoByAdminController(req, res) {
        try {
            const { body } = req;
            const { error: validationError } = vecinoCreateValidation.validate(body);
            if (validationError) {
                const errors = validationError.details.map(d => ({ field: d.path.join("."), message: d.message }));
                return handleErrorClient(res, 400, "Datos para creación de vecino inválidos.", errors);
            }

            const [nuevoVecino, serviceError] = await createVecinoService(body);
            if (serviceError) {
                return handleErrorClient(res, 400, serviceError.message, serviceError);
            }
            return handleSuccess(res, 201, "Vecino creado exitosamente por administrador.", nuevoVecino);
        } catch (error) {
            console.error("Error en createVecinoByAdminController:", error);
            return handleErrorServer(res, 500, "Error interno al crear vecino.");
        }
    }


    /**
     * Controlador para obtener un vecino específico por ID.
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    export async function getVecinoByIdController(req, res) {
      try {
        const { id } = req.params;
        const { error: idError } = vecinoIdParamValidation.validate({ id });
        if (idError) {
          return handleErrorClient(res, 400, "ID de vecino inválido.", idError.details);
        }

        const [vecino, serviceError] = await getVecinoByIdService(Number(id));
        if (serviceError) {
          return handleErrorClient(res, 404, serviceError.message); // Asume que el servicio devuelve "Vecino no encontrado."
        }
        return handleSuccess(res, 200, "Vecino encontrado.", vecino);
      } catch (error) {
        console.error("Error en getVecinoByIdController:", error);
        return handleErrorServer(res, 500, "Error interno del servidor al obtener el vecino.");
      }
    }

    /**
     * Controlador para obtener la lista de todos los vecinos.
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    export async function getVecinosController(req, res) {
      try {
        const { query } = req;
        const { error: queryError } = vecinosQueryValidation.validate(query);
        if (queryError) {
            const errors = queryError.details.map(d => ({ field: d.path.join("."), message: d.message }));
            return handleErrorClient(res, 400, "Parámetros de consulta inválidos.", errors);
        }

        const [data, serviceError] = await getVecinosService(query); 
        if (serviceError) {
          return handleErrorClient(res, 500, serviceError.message); 
        }

        if (data.vecinos.length === 0) {
          return handleSuccess(res, 200, "No hay vecinos registrados que coincidan con la búsqueda.", data);
        }
        return handleSuccess(res, 200, "Vecinos obtenidos exitosamente.", data);
      } catch (error) {
        console.error("Error en getVecinosController:", error);
        return handleErrorServer(res, 500, "Error interno del servidor al listar los vecinos.");
      }
    }

    /**
     * Controlador para actualizar un vecino.
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    export async function updateVecinoController(req, res) {
      try {
        const { id } = req.params;
        const { body } = req;

        const { error: idError } = vecinoIdParamValidation.validate({ id });
        if (idError) {
          return handleErrorClient(res, 400, "ID de vecino inválido.", idError.details);
        }

        const { error: bodyError } = vecinoUpdateValidation.validate(body); // Esquema para actualización (campos opcionales)
        if (bodyError) {
          const errors = bodyError.details.map(d => ({ field: d.path.join("."), message: d.message }));
          return handleErrorClient(res, 400, "Datos de actualización inválidos.", errors);
        }

        const [vecinoActualizado, serviceError] = await updateVecinoService(Number(id), body);
        if (serviceError) {
          const statusCode = serviceError.message.includes("no encontrado") ? 404 : 400;
          return handleErrorClient(res, statusCode, serviceError.message, serviceError);
        }
        return handleSuccess(res, 200, "Vecino actualizado correctamente.", vecinoActualizado);
      } catch (error) {
        console.error("Error en updateVecinoController:", error);
        return handleErrorServer(res, 500, "Error interno del servidor al actualizar el vecino.");
      }
    }

    /**
     * Controlador para eliminar un vecino.
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    export async function deleteVecinoController(req, res) {
      try {
        const { id } = req.params;
        const { error: idError } = vecinoIdParamValidation.validate({ id });
        if (idError) {
          return handleErrorClient(res, 400, "ID de vecino inválido.", idError.details);
        }

        const [resultado, serviceError] = await deleteVecinoService(Number(id));
        if (serviceError) {
          const statusCode = serviceError.message.includes("no encontrado") ? 404 : 400;
          return handleErrorClient(res, statusCode, serviceError.message);
        }
        return handleSuccess(res, 200, resultado.message); // O 204 No Content
      } catch (error) {
        console.error("Error en deleteVecinoController:", error);
        return handleErrorServer(res, 500, "Error interno del servidor al eliminar el vecino.");
      }
    }
  
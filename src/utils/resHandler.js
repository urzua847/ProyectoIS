"use strict";
/**
 * Envía una respuesta exitosa estandarizada.
 * @function respondSuccess
 * @param {Object} req 
 * @param {Object} res 
 * @param {Number} statusCode
 * @param {Object} data
 * @returns {JSON} 
 */
function respondSuccess(req, res, statusCode = 200, data = {}) {
  return res.status(statusCode).json({
    state: "Success",
    data,
  });
}

/**
 * Envía una respuesta de error estandarizada.
 * @function respondError
 * @param {Object} req
 * @param {Object} res 
 * @param {Number} statusCode
 * @param {String} message 
 * @param {Object} details 
 * @returns {JSON} 
 */

function respondError(
  req,
  res,
  statusCode = 500,
  message = "Couldnt process the request",
  details = {},
) {
  return res.status(statusCode).json({
    state: "Error",
    message,
    details,
  });
}

/**
 * Envía una respuesta de error interno estandarizada.
 * @function respondInternalError
 * @param {Object} req 
 * @param {Object} res 
 * @param {Number} statusCode 
 * @param {String} message 
 * @returns {JSON}
 */
function respondInternalError(
  req,
  res,
  statusCode = 500,
  message = "Couldnt process the request",
) {
  return res.status(statusCode).json({
    state: "Error",
    message,
  });
}

export { respondSuccess, respondError, respondInternalError };

"use strict";

/**
 * Manejador de errores fatales
 * @param {Object} error
 * @param {String} msg 
 */
function handleFatalError(error, msg) {
  console.log("[FATAL ERROR] Apagando servidor \n", msg);
  console.error(error);
  process.exit(1);
}

/**
 * Manejador de errores
 * @param {Object} error 
 * @param {String} msg 
 */
function handleError(error, msg) {
  console.log("❌ [ERROR] A ocurrido un error en: \n📁", msg);
  console.error("🗯  " + error.message);
}

export { handleFatalError, handleError };

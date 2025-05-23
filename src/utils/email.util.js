const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("../config/configEnv"); // Necesitarás añadir esto a .env

// Crea un objeto transportador usando el transporte SMTP predeterminado
// Debes configurar esto con los detalles de tu proveedor de servicio de correo electrónico
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email", // Reemplazar con tu host SMTP (ej. smtp.gmail.com)
  port: 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: EMAIL_USER, // Tu dirección de correo electrónico
    pass: EMAIL_PASS, // Tu contraseña de correo electrónico o contraseña específica de la aplicación
  },
  // Es posible que desees añadir un objeto tls para algunos proveedores
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Envía una notificación por correo electrónico para una nueva asamblea.
 * @param {object} assembly - El objeto de la asamblea.
 * @param {Array<string>} recipientEmails - Un array de direcciones de correo electrónico a las que enviar.
 */
async function sendAssemblyNotificationEmail(assembly, recipientEmails) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error("Faltan las variables de entorno EMAIL_USER o EMAIL_PASS. Las notificaciones por correo electrónico no se enviarán.");
    return;
  }

  const mailOptions = {
    from: `"Junta de Vecinos" <${EMAIL_USER}>`, // Dirección del remitente
    to: recipientEmails.join(", "), // Lista de destinatarios
    subject: `Nueva Asamblea: ${assembly.descripcion}`, // Línea de asunto
    html: `
      <h1>¡Nueva Asamblea de la Junta de Vecinos!</h1>
      <p>Estimado(a) vecino(a),</p>
      <p>Le informamos que se ha organizado una nueva asamblea:</p>
      <ul>
        <li><strong>Fecha:</strong> ${new Date(assembly.fecha).toLocaleDateString("es-ES")}</li>
        <li><strong>Hora:</strong> ${assembly.hora}</li>
        <li><strong>Descripción:</strong> ${assembly.descripcion}</li>
      </ul>
      <p>Su presencia es importante. ¡Esperamos contar con usted!</p>
      <p>Saludos cordiales,</p>
      <p>La Directiva de la Junta de Vecinos</p>
    `, // Cuerpo HTML
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Notificación de asamblea enviada: %s", info.messageId);
    // La previsualización solo está disponible cuando se envía a través de una cuenta de Ethereal
    console.log("URL de previsualización: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error al enviar la notificación de asamblea:", error);
    throw new Error("Error al enviar la notificación de asamblea por correo electrónico.");
  }
}

module.exports = {
  sendAssemblyNotificationEmail,
};
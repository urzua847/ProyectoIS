// src/utils/mailer.js
import nodemailer from 'nodemailer';
// Deberás configurar estas variables de entorno
// EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } from '../config/configEnv.js';

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true para 465, false para otros puertos
  auth: {
    user: EMAIL_USER, // Tu usuario de email
    pass: EMAIL_PASS, // Tu contraseña de email
  },
  // Si usas Gmail, puede que necesites habilitar "Acceso de aplicaciones menos seguras"
  // o configurar una contraseña de aplicación.
  // Para producción, considera servicios como SendGrid, Mailgun, AWS SES.
});

/**
 * Envía un correo electrónico.
 * @param {string} to - Destinatario o destinatarios (separados por coma).
 * @param {string} subject - Asunto del correo.
 * @param {string} text - Cuerpo del correo en texto plano.
 * @param {string} html - Cuerpo del correo en HTML.
 * @returns {Promise<object>} - Información del envío.
 */
export const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: `"Junta de Vecinos" <${EMAIL_FROM || EMAIL_USER}>`, // Dirección del remitente
      to: to, // Lista de destinatarios
      subject: subject, // Asunto
      text: text, // Cuerpo en texto plano
      html: html, // Cuerpo en HTML
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw error; // Re-lanza el error para que el servicio lo maneje
  }
};

// Ejemplo de uso (esto no iría aquí, sino en el servicio de asambleas)
/*
sendEmail(
  'vecino1@example.com,vecino2@example.com',
  'Nueva Asamblea Programada',
  'Hola, se ha programado una nueva asamblea...',
  '<h1>Nueva Asamblea Programada</h1><p>Hola, se ha programado una nueva asamblea para el día X a la hora Y.</p>'
).catch(console.error);
*/
import nodemailer from 'nodemailer';
import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } from '../config/configEnv.js';

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS, 
  },

});

/**
 * Envía un correo electrónico.
 * @param {string} to
 * @param {string} subject 
 * @param {string} text 
 * @param {string} html 
 * @returns {Promise<object>} 
 */
export const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: `"Junta de Vecinos" <${EMAIL_FROM || EMAIL_USER}>`, 
      to: to, 
      subject: subject, 
      text: text,
      html: html, 
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw error; 
  }
};


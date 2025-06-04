"use strict";
import nodemailer from "nodemailer";
import {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_SECURE,
  MAIL_USER,
  MAIL_PASS,
  MAIL_FROM_ADDRESS,
  MAIL_REPLY_TO_ADDRESS,
  NODE_ENV,
} from "../config/configEnv.js";

let transporter;

const transporterOptions = {
  host: MAIL_HOST,
  port: Number(MAIL_PORT),
  secure: MAIL_SECURE,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
};

if (NODE_ENV === "test") {
  transporter = {
    sendMail: async (mailOptions) => {
      return { messageId: `test-${Date.now()}` };
    },
  };
} else if (MAIL_HOST && MAIL_PORT && MAIL_USER && MAIL_PASS) {
  transporter = nodemailer.createTransport(transporterOptions);
  // La verificación transporter.verify() sigue comentada para evitar bloqueos.
  // Los console.log sobre la configuración del transportador se han eliminado.
} else {
  transporter = {
    sendMail: async (mailOptions) => {
      // Silencio intencional si el correo no está configurado
      return { messageId: `disabled-${Date.now()}` };
    },
  };
}

async function enviarCorreoService(
  destinatario,
  asunto,
  cuerpoHtml,
  cuerpoTexto = ""
) {
  if (
    !transporter 
    || typeof transporter.sendMail !== "function" 
    ||!(MAIL_HOST && MAIL_PORT && MAIL_USER && MAIL_PASS)
  ) {
    return [
      null,
      { message: "Servicio de correo no configurado o deshabilitado." },
    ];
  }

  const mailOptions = {
    from: MAIL_FROM_ADDRESS,
    to: destinatario,
    subject: asunto,
    text: cuerpoTexto || cuerpoHtml.replace(/<[^>]*>?/gm, ""),
    html: cuerpoHtml,
    replyTo: MAIL_REPLY_TO_ADDRESS || MAIL_FROM_ADDRESS,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return [info, null];
  } catch (error) {
    console.error(`Error al enviar correo a ${destinatario}:`, error); 
    return [
      null,
      { message: "Error al enviar el correo.", details: error.message },
    ];
  }
}

export async function notificarNuevaAsambleaVecinoService(vecino, asamblea) {
  if (!vecino || !vecino.email) {
    return [
      null,
      { message: "Datos del vecino incompletos para notificación." },
    ];
  }
  if (!asamblea) {
    return [
      null,
      { message: "Datos de la asamblea incompletos para notificación." },
    ];
  }

  const asunto = `Convocatoria a Asamblea: ${asamblea.titulo}`;
  const fechaFormateada = new Date(asamblea.fechaHora).toLocaleString("es-CL", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Santiago",
  });

  const cuerpoHtml = `
        <h1>Convocatoria a Asamblea de Junta de Vecinos</h1>
        <p>Estimado/a vecino/a ${vecino.nombres || ""} ${vecino.apellidos || ""},</p>
        <p>Se le convoca cordialmente a la siguiente asamblea:</p>
        <ul>
          <li><strong>Título:</strong> ${asamblea.titulo}</li>
          <li><strong>Fecha y Hora:</strong> ${fechaFormateada}</li>
          <li><strong>Lugar:</strong> ${asamblea.lugar || "Por definir"}</li>
        </ul>
        <p><strong>Descripción / Orden del día:</strong></p>
        <pre>${asamblea.descripcionOrdenDia || "No especificada."}</pre>
        <p>Esperamos contar con su valiosa participación.</p>
        <p>Atentamente,<br>La Directiva</p>
      `;

  return enviarCorreoService(vecino.email, asunto, cuerpoHtml);
}

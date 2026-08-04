import nodemailer from 'nodemailer';
import { CONFIG } from './config.ts';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!transporter && CONFIG.smtp.host && CONFIG.smtp.user && CONFIG.smtp.pass) {
    try {
      transporter = nodemailer.createTransport({
        host: CONFIG.smtp.host,
        port: CONFIG.smtp.port,
        secure: CONFIG.smtp.port === 465,
        auth: {
          user: CONFIG.smtp.user,
          pass: CONFIG.smtp.pass,
        },
      });
    } catch (err) {
      console.warn('No se pudo inicializar SMTP transporter:', err);
      transporter = null;
    }
  }
  return transporter;
}

export interface SendResetEmailResult {
  sent: boolean;
  demoMode: boolean;
  resetUrl: string;
  message: string;
}

export async function sendPasswordResetEmail(
  toEmail: string,
  resetToken: string
): Promise<SendResetEmailResult> {
  const resetUrl = `${CONFIG.appUrl}?resetToken=${resetToken}&email=${encodeURIComponent(toEmail)}`;

  const mailTransporter = getTransporter();

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: CONFIG.smtp.from,
        to: toEmail,
        subject: 'TerritorioMix - Restablecer tu contraseña',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
            <div style="background-color: #0f172a; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
              <h2 style="color: #ffffff; margin: 0;">TerritorioMix</h2>
            </div>
            <h3 style="color: #1e293b;">Solicitud de Restablecimiento de Contraseña</h3>
            <p style="color: #475569; line-height: 1.6;">
              Hemos recibido una solicitud para cambiar tu contraseña en TerritorioMix. Si tú solicitaste este cambio, haz clic en el siguiente botón:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                Restablecer mi contraseña
              </a>
            </div>
            <p style="color: #64748b; font-size: 13px;">
              o copia y pega este enlace en tu navegador:<br />
              <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
              Este enlace es válido por 1 hora. Si no solicitaste este cambio, puedes ignorar este correo.
            </p>
          </div>
        `,
      });

      return {
        sent: true,
        demoMode: false,
        resetUrl,
        message: `Correo de restablecimiento enviado exitosamente a ${toEmail}.`,
      };
    } catch (err) {
      console.error('Error enviando email SMTP, usando modo demo como respaldo:', err);
    }
  }

  // Fallback demo mode for sandbox or before SMTP setup
  console.log('===========================================================');
  console.log(' [DEMO MODE / SIN CONFIG SMTP] CORREO DE RECUPERACIÓN');
  console.log(` Para: ${toEmail}`);
  console.log(` Enlace de reinicio: ${resetUrl}`);
  console.log('===========================================================');

  return {
    sent: true,
    demoMode: true,
    resetUrl,
    message: `[Modo Demostración] Hemos generado el enlace de restablecimiento para ${toEmail}.`,
  };
}

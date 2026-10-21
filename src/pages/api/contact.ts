import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

declare global {
  interface ImportMetaEnv {
    readonly SMTP_HOST?: string;
    readonly SMTP_PORT?: string;
    readonly SMTP_SECURE?: string;
    readonly SMTP_USER?: string;
    readonly SMTP_PASS?: string;
    readonly CONTACT_DESTINATION_EMAIL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Deshabilitar la prerenderización para que esta ruta sea un endpoint dinámico del servidor
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { full_name, company, email, interest_area, message } = data;

    // Validación básica de campos requeridos
    if (!full_name || !company || !email || !interest_area || !message) {
      return new Response(
        JSON.stringify({ message: 'Todos los campos requeridos deben estar completos.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Configuración del servidor de correo SMTP desde variables de entorno
    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST || 'smtp.gmail.com', // Ej: smtp.office365.com o tu servidor propio
      port: Number(import.meta.env.SMTP_PORT) || 587,
      secure: import.meta.env.SMTP_SECURE === 'true', // true para puerto 465, false para otros
      auth: {
        user: import.meta.env.SMTP_USER, // Tu correo emisor
        pass: import.meta.env.SMTP_PASS, // Tu contraseña o contraseña de aplicación
      },
    });

    const destinationEmail = import.meta.env.CONTACT_DESTINATION_EMAIL || 'isarabia@tecno-experts.com';

    // Plantilla HTML estructurada para el correo entrante
    const mailOptions = {
      from: `"Formulario Tecno Experts" <${import.meta.env.SMTP_USER}>`,
      to: destinationEmail,
      replyTo: email,
      subject: `Nuevo mensaje de contacto: ${full_name} (${company})`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">Nueva Solicitud de Contacto</h2>
          <p>Se ha recibido una nueva consulta desde el formulario web de <strong>Tecno Experts</strong>:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 140px;">Nombre:</td>
              <td style="padding: 8px 0;">${full_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Empresa:</td>
              <td style="padding: 8px 0;">${company}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Correo:</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Área de Interés:</td>
              <td style="padding: 8px 0;">${interest_area}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; padding: 16px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-weight: bold; color: #334155;">Mensaje:</p>
            <p style="margin-top: 8px; white-space: pre-wrap; color: #475569;">${message}</p>
          </div>

          <p style="margin-top: 24px; font-size: 0.8rem; color: #94a3b8; text-align: center;">
            Este mensaje fue enviado automáticamente desde el sitio web de Tecno Experts.
          </p>
        </div>
      `,
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ message: 'Correo enviado con éxito.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return new Response(
      JSON.stringify({ message: 'Error interno al procesar el envío de correo.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
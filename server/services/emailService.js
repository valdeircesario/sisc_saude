import nodemailer from "nodemailer";

const smtpConfigurado = () =>
  Boolean(process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_HOST);

const transporter = smtpConfigurado()
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : null;

export const enviarEmailResetSenha = async ({ destinatario, resetUrl }) => {
  if (!transporter) {
    throw new Error("SMTP não configurado. Defina SMTP_HOST, SMTP_USER e SMTP_PASSWORD no .env.");
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: destinatario,
    subject: "Redefinição de senha - SISC Saúde",
    text: `Recebemos uma solicitação para redefinir sua senha. Acesse o link: ${resetUrl}\n\nEste link expira em 1 hora e pode ser usado uma única vez.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#16302b"><h2>Redefinição de senha</h2><p>Recebemos uma solicitação para redefinir sua senha.</p><p><a href="${resetUrl}" style="background:#0f6e56;color:#fff;padding:12px 18px;text-decoration:none;border-radius:8px;display:inline-block">Redefinir minha senha</a></p><p>Este link expira em 1 hora e pode ser usado uma única vez.</p><p>Se você não fez esta solicitação, ignore este email.</p></div>`,
  });
};

export const verificarSmtp = async () => {
  if (!transporter) return false;
  await transporter.verify();
  return true;
};

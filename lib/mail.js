import nodemailer from "nodemailer";

// Works with any SMTP service. Default settings are for Gmail (use an App Password).
//   SMTP_HOST=smtp.gmail.com  SMTP_PORT=465  SMTP_USER=you@gmail.com  SMTP_PASS=<16-char app password>
// To switch provider later (e.g. Brevo) only these variables change.

export function isMailConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter;
function getTransport() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transporter;
}

export async function sendMail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || `InterviewIQ <${process.env.SMTP_USER}>`;
  return getTransport().sendMail({ from, to, subject, text, html });
}

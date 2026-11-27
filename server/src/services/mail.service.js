import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter;
const getTransporter = () =>
  (transporter ||= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  }));

export async function sendMail({ to, subject, text, html }) {
  // No SMTP credentials in .env -> print the mail in the console (handy in development).
  if (!env.smtp.user || !env.smtp.pass) {
    console.warn(`\n[mail] SMTP not configured. Mail to ${to}\n${subject}\n${text}\n`);
    return;
  }
  await getTransporter().sendMail({ from: env.smtp.from, to, subject, text, html });
}

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

export async function sendQueryResolvedEmail(query) {
  const siteUrl = env.clientUrl.replace(/\/+$/, "");
  const name = query.name || "there";
  const topic = query.topic || "Your query";
  const message = query.message || "";
  const subject = "Your Olive Wear query has been resolved";
  const text = [
    `Hi ${name},`,
    "",
    `Your query about "${topic}" has been marked as resolved by our customer care team.`,
    "",
    "Thank you for contacting Olive Wear. If you need further assistance, please contact our customer care team through our website.",
    "",
    "Warm regards,",
    "Olive Wear Customer Care",
  ].join("\n");
  const html = `
    <!doctype html>
    <html lang="en">
      <body style="margin:0;padding:0;background:#f2f3ed;font-family:Arial,Helvetica,sans-serif;color:#25291e;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f3ed;padding:28px 12px;">
          <tr><td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e1e4d7;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:22px 28px;background:#11150c;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align:middle;color:#e5edc7;font-size:23px;font-weight:bold;letter-spacing:-.4px;">
                        Olive Wear
                        <div style="margin-top:3px;color:#c3d08a;font-size:10px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;">Thoughtfully yours</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 28px 20px;">
                  <div style="margin-bottom:12px;color:#718244;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">Query update</div>
                  <h1 style="margin:0 0 16px;color:#20251a;font-size:25px;line-height:1.3;">Your query is resolved</h1>
                  <p style="margin:0 0 16px;color:#42483a;font-size:15px;line-height:1.7;">Hi ${escapeHtml(name)}, our customer care team has marked your query as resolved. Thank you for getting in touch with Olive Wear.</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#f7f8f3;border-left:3px solid #9cad62;">
                    <tr><td style="padding:14px 16px;">
                      <div style="margin-bottom:5px;color:#77805f;font-size:10px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Your query</div>
                      <div style="margin-bottom:10px;color:#25291e;font-size:14px;font-weight:bold;">${escapeHtml(topic)}</div>
                      <div style="color:#565b4f;font-size:13px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</div>
                    </td></tr>
                  </table>
                  <p style="margin:0 0 22px;color:#42483a;font-size:14px;line-height:1.7;">If you need further assistance, please contact our customer care team through our website. We will be happy to help.</p>
                  <a href="${escapeHtml(siteUrl)}" style="display:inline-block;padding:12px 20px;background:#687a3a;border-radius:6px;color:#ffffff;font-size:13px;font-weight:bold;text-decoration:none;">Visit Olive Wear</a>
                  <p style="margin:26px 0 0;color:#42483a;font-size:14px;line-height:1.6;">Warm regards,<br><strong style="color:#25291e;">Olive Wear Customer Care</strong></p>
                </td>
              </tr>
              <tr><td style="padding:16px 28px;background:#f7f8f3;border-top:1px solid #e7e9e1;color:#777d6b;font-size:11px;line-height:1.5;">Thank you for choosing Olive Wear.</td></tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>
  `;

  await sendMail({ to: query.email, subject, text, html });
}

const contactMailShell = (eyebrow, content) => `
  <!doctype html>
  <html lang="en">
    <body style="margin:0;padding:0;background:#f2f3ed;font-family:Arial,Helvetica,sans-serif;color:#25291e;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f3ed;padding:28px 12px;">
        <tr><td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e1e4d7;border-radius:12px;overflow:hidden;">
            <tr><td style="padding:22px 28px;background:#11150c;color:#e5edc7;font-size:23px;font-weight:bold;">Olive Wear<div style="margin-top:3px;color:#c3d08a;font-size:10px;letter-spacing:3px;text-transform:uppercase;">Thoughtfully yours</div></td></tr>
            <tr><td style="padding:30px 28px;">
              <div style="margin-bottom:12px;color:#718244;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">${eyebrow}</div>
              ${content}
            </td></tr>
            <tr><td style="padding:16px 28px;background:#f7f8f3;border-top:1px solid #e7e9e1;color:#777d6b;font-size:11px;">Olive Wear Customer Care</td></tr>
          </table>
        </td></tr>
      </table>
    </body>
  </html>
`;

const contactDetailRow = (label, value) => `
  <tr>
    <td style="width:125px;padding:10px 12px;border-bottom:1px solid #e7e9e1;color:#77805f;font-size:12px;font-weight:bold;vertical-align:top;">${label}</td>
    <td style="padding:10px 12px;border-bottom:1px solid #e7e9e1;color:#25291e;font-size:13px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere;">${value}</td>
  </tr>
`;

export async function sendContactQueryEmails(query) {
  if (!env.admin.email) {
    throw new Error("ADMIN_EMAIL is not configured; cannot notify the admin.");
  }

  const name = escapeHtml(query.name);
  const email = escapeHtml(query.email);
  const phone = escapeHtml(query.phone || "Not provided");
  const topic = escapeHtml(query.topic || "General");
  const message = escapeHtml(query.message);
  const userText = [
    `Hi ${query.name},`,
    "",
    "Thank you for contacting Olive Wear. We have received your message and our team will get back to you soon.",
    "",
    `Topic: ${query.topic || "General"}`,
    `Your message: ${query.message}`,
    "",
    "Warm regards,",
    "Olive Wear Customer Care",
  ].join("\n");
  const adminText = [
    "A new contact query has been submitted and its email address has been verified.",
    "",
    `Name: ${query.name}`,
    `Email: ${query.email}`,
    `Phone: ${query.phone || "Not provided"}`,
    `Topic: ${query.topic || "General"}`,
    `Message: ${query.message}`,
  ].join("\n");
  const userHtml = contactMailShell("Message received", `
    <h1 style="margin:0 0 16px;color:#20251a;font-size:25px;line-height:1.3;">Thank you for contacting us</h1>
    <p style="margin:0 0 20px;color:#42483a;font-size:15px;line-height:1.7;">Hi ${name}, we have received your message. Our customer care team will review it and get back to you soon.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8f3;border-left:3px solid #9cad62;">
      ${contactDetailRow("Topic", topic)}
      ${contactDetailRow("Your message", message)}
    </table>
    <p style="margin:22px 0 0;color:#42483a;font-size:14px;line-height:1.7;">We appreciate you reaching out to Olive Wear.</p>
  `);
  const adminHtml = contactMailShell("New verified contact query", `
    <h1 style="margin:0 0 8px;color:#20251a;font-size:24px;line-height:1.3;">Contact form submission</h1>
    <p style="margin:0 0 20px;color:#687a3a;font-size:13px;">The customer's email address has been verified by OTP.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8f3;border-left:3px solid #9cad62;">
      ${contactDetailRow("Name", name)}
      ${contactDetailRow("Email", `<a href="mailto:${email}" style="color:#53652e;">${email}</a>`)}
      ${contactDetailRow("Phone", phone)}
      ${contactDetailRow("Topic", topic)}
      ${contactDetailRow("Message", message)}
    </table>
  `);

  await Promise.all([
    sendMail({
      to: query.email,
      subject: "Thank you for contacting Olive Wear",
      text: userText,
      html: userHtml,
    }),
    sendMail({
      to: env.admin.email,
      subject: "New verified contact query - Olive Wear",
      text: adminText,
      html: adminHtml,
    }),
  ]);
}

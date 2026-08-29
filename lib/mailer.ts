import "server-only"

import nodemailer from "nodemailer"

/* ============================================================================
   MAILER

   Same convention as the other projects (cheers, polyedge): SMTP settings
   resolve from any of three naming schemes, so one .env works everywhere and
   this site's own pre-existing EMAIL / EMAIL_PASS pair keeps working too.

     host  EMAIL_SERVER_HOST      / SMTP_HOST              default smtp.gmail.com
     port  EMAIL_SERVER_PORT      / SMTP_PORT              default 587
     user  EMAIL_SERVER_USER      / SMTP_USER / EMAIL
     pass  EMAIL_SERVER_PASSWORD  / SMTP_PASS / EMAIL_PASS
     from  EMAIL_FROM             / SMTP_FROM              optional "Name <addr>"
     to    CONTACT_TO                                      optional, defaults to user

   Next.js loads .env itself, so there is no dotenv call here.
   ========================================================================= */

const port = Number(process.env.EMAIL_SERVER_PORT ?? process.env.SMTP_PORT ?? 587)

export const smtpConfig = {
  host: process.env.EMAIL_SERVER_HOST ?? process.env.SMTP_HOST ?? "smtp.gmail.com",
  port,
  secure: (process.env.SMTP_SECURE ?? "").toLowerCase() === "true" || port === 465,
  auth: {
    user: process.env.EMAIL_SERVER_USER ?? process.env.SMTP_USER ?? process.env.EMAIL,
    pass: process.env.EMAIL_SERVER_PASSWORD ?? process.env.SMTP_PASS ?? process.env.EMAIL_PASS,
  },
}

/** "Name <addr>" passes through; a bare address with stray brackets is cleaned. */
function cleanFrom(raw: string): string {
  return raw.includes("<") ? raw : raw.replace(/[<>]/g, "").trim()
}

export const mailFrom = cleanFrom(
  process.env.EMAIL_FROM ??
    process.env.SMTP_FROM ??
    `Portfolio <${smtpConfig.auth.user ?? ""}>`,
)

/** Where contact-form messages land. */
export const contactTo =
  process.env.CONTACT_TO ?? smtpConfig.auth.user ?? "maxwellwedderburn32@gmail.com"

export function isMailerConfigured() {
  return Boolean(smtpConfig.auth.user && smtpConfig.auth.pass)
}

const transporter = nodemailer.createTransport(smtpConfig)

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}): Promise<void> {
  if (!isMailerConfigured()) {
    // A missing credential is a deployment problem, and the caller needs to
    // know so it can tell the visitor rather than silently dropping the message.
    throw new Error("SMTP is not configured — set EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD")
  }

  await transporter.sendMail({
    from: mailFrom,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    replyTo: opts.replyTo,
  })
}

/**
 * Branded wrapper for outgoing mail. Table-free, inline styles only, no web
 * fonts and no rgba() — the safest subset across Gmail, Outlook and Apple Mail.
 * Colours are literal because an email cannot read globals.css; they track
 * --color-void / --color-canvas / --color-hairline / --color-signal /
 * --color-ink / --color-ink-dim / --color-ink-faint.
 */
export function emailLayout(title: string, bodyHtml: string): string {
  return `
  <div style="background:#0a0c0e;padding:32px 16px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#14181b;border:1px solid #33393f;border-radius:6px;overflow:hidden;">
      <div style="border-bottom:1px solid #33393f;padding:20px 28px;">
        <p style="color:#c9f74a;font-size:13px;letter-spacing:3px;margin:0;font-weight:600;">MAXWELL WEDDERBURN</p>
        <p style="color:#7d858c;font-size:12px;margin:6px 0 0;">Full-stack engineer</p>
      </div>
      <div style="padding:26px 28px;">
        <h1 style="color:#f2f0ec;font-size:19px;margin:0 0 16px;font-weight:600;">${title}</h1>
        <div style="color:#adb4ba;font-size:15px;line-height:1.65;">${bodyHtml}</div>
      </div>
      <div style="border-top:1px solid #33393f;padding:14px 28px;">
        <p style="color:#7d858c;font-size:12px;margin:0;">Sent from the portfolio contact form</p>
      </div>
    </div>
  </div>`
}

/** Minimal HTML escaping — visitor input must never reach the markup raw. */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

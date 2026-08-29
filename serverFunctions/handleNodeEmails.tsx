"use server"

import { z } from "zod"

import { contactTo, emailLayout, escapeHtml, sendEmail } from "@/lib/mailer"

/* ============================================================================
   The contact form's only server entry point.

   The schema is re-validated here rather than trusted from the client, because
   a server action is a public HTTP endpoint — the browser-side check is a
   convenience for the visitor, not a security boundary.
   ========================================================================= */

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional().default(""),
  subject: z.string().min(1).max(200),
  message: z.string().min(8).max(5000),
})

export type contactResult = { ok: true } | { ok: false; error: string }

export async function sendContactMessage(input: unknown): Promise<contactResult> {
  const parsed = contactSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, error: "Some of those details did not look right." }
  }

  const { name, email, phone, subject, message } = parsed.data

  const html = emailLayout(
    escapeHtml(subject),
    `
      <p style="margin:0 0 14px;"><strong style="color:#f2f0ec;">${escapeHtml(name)}</strong>
      &lt;${escapeHtml(email)}&gt;${phone ? ` &middot; ${escapeHtml(phone)}` : ""}</p>
      <p style="margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
    `,
  )

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "—"}`,
    `Subject: ${subject}`,
    "",
    message,
  ].join("\n")

  try {
    await sendEmail({
      to: contactTo,
      subject: `Portfolio — ${subject}`,
      html,
      text,
      // Replying to the notification replies to the visitor
      replyTo: email,
    })

    return { ok: true }
  } catch (error) {
    console.error("Contact form send failed:", error instanceof Error ? error.message : error)
    return { ok: false, error: "That did not send. Please email me directly." }
  }
}

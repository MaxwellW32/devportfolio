"use client"

import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { z } from "zod"

import { retreiveFromLocalStorage, saveToLocalStorage } from "@/utility/saveToStorage"
import { sendNodeEmail } from "@/serverFunctions/handleNodeEmails"
import styles from "./contactform.module.css"

const phoneRegex = /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/

const contactFormSchema = z.object({
  name: z.string().min(1, "Please add your name"),
  email: z.string().email("That email does not look right"),
  phone: z.string().regex(phoneRegex, "That phone number does not look right").or(z.literal("")),
  subject: z.string().min(1, "Please add a subject"),
  message: z.string().min(8, "A little more detail helps"),
})

type contactForm = z.infer<typeof contactFormSchema>
type contactFormKey = keyof contactForm

const emptyForm: contactForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
}

const fields: {
  key: contactFormKey
  label: string
  placeholder: string
  type?: string
  multiline?: boolean
  optional?: boolean
}[] = [
  { key: "name", label: "Name", placeholder: "Your name" },
  { key: "email", label: "Email", placeholder: "you@example.com", type: "email" },
  { key: "phone", label: "Phone", placeholder: "Optional", type: "tel", optional: true },
  { key: "subject", label: "Subject", placeholder: "What is this about?" },
  { key: "message", label: "Message", placeholder: "What are you building, and what do you need?", multiline: true },
]

export default function ContactForm() {
  const [formObj, formObjSet] = useState<contactForm>({ ...emptyForm })
  const [errors, errorsSet] = useState<Partial<Record<contactFormKey, string>>>({})
  const [sending, sendingSet] = useState(false)
  const [restored, restoredSet] = useState(false)

  /* ---- Restore an unsent draft ----------------------------------------- */
  useEffect(() => {
    const previous = retreiveFromLocalStorage("contactForm") as contactForm | null
    if (previous !== null) formObjSet({ ...emptyForm, ...previous })
    restoredSet(true)
  }, [])

  /* ---- Keep the draft, but only after the restore has happened ---------- */
  useEffect(() => {
    if (!restored) return
    saveToLocalStorage("contactForm", formObj)
  }, [formObj, restored])

  /**
   * Show an error for one field as you leave it. Zod's `.pick()` needs a
   * literal key mask, so instead parse the whole object and keep only the
   * issues belonging to this field — the other fields stay untouched.
   */
  function validateField(key: contactFormKey, value: contactForm) {
    const result = contactFormSchema.safeParse(value)

    const message = result.success
      ? undefined
      : result.error.issues
          .filter(eachIssue => eachIssue.path[0] === key)
          .map(eachIssue => eachIssue.message)
          .join(". ")

    errorsSet(previous => {
      const next = { ...previous }

      if (message === undefined || message === "") delete next[key]
      else next[key] = message

      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = contactFormSchema.safeParse(formObj)

    if (!result.success) {
      // Surface every problem at once rather than one at a time
      const next: Partial<Record<contactFormKey, string>> = {}
      for (const eachIssue of result.error.issues) {
        const key = eachIssue.path[0] as contactFormKey
        next[key] = eachIssue.message
      }
      errorsSet(next)
      toast.error("Please check the highlighted fields")
      return
    }

    sendingSet(true)

    try {
      // Build the body as real lines — the previous version interpolated an
      // array straight into a template literal, which comma-joined it.
      const body = [
        `Name: ${formObj.name}`,
        `Email: ${formObj.email}`,
        `Phone: ${formObj.phone || "—"}`,
        `Subject: ${formObj.subject}`,
        "",
        formObj.message,
      ].join("\n")

      await sendNodeEmail({
        sendTo: "maxwellwedderburn32@gmail.com",
        replyTo: formObj.email,
        subject: `Portfolio message from ${formObj.name}`,
        text: body,
      })

      toast.success("Sent — I will come back to you shortly.")
      formObjSet({ ...emptyForm })
      errorsSet({})
      saveToLocalStorage("contactForm", emptyForm)
    } catch (error) {
      toast.error("That did not send. Email me directly and I will pick it up.")
      console.error("Contact form send failed", error)
    } finally {
      sendingSet(false)
    }
  }

  const update = (key: contactFormKey, value: string) => {
    formObjSet(previous => ({ ...previous, [key]: value }))
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        {fields.slice(0, 2).map(eachField => (
          <Field
            key={eachField.key}
            field={eachField}
            value={formObj[eachField.key]}
            error={errors[eachField.key]}
            onChange={update}
            onBlur={key => validateField(key, formObj)}
          />
        ))}
      </div>

      <div className={styles.row}>
        {fields.slice(2, 4).map(eachField => (
          <Field
            key={eachField.key}
            field={eachField}
            value={formObj[eachField.key]}
            error={errors[eachField.key]}
            onChange={update}
            onBlur={key => validateField(key, formObj)}
          />
        ))}
      </div>

      <Field
        field={fields[4]}
        value={formObj.message}
        error={errors.message}
        onChange={update}
        onBlur={key => validateField(key, formObj)}
      />

      <button type="submit" className={`btn btnPrimary ${styles.submit}`} disabled={sending}>
        <span>{sending ? "Sending…" : "Send message"}</span>
      </button>
    </form>
  )
}

function Field({
  field,
  value,
  error,
  onChange,
  onBlur,
}: {
  field: (typeof fields)[number]
  value: string
  error?: string
  onChange: (key: contactFormKey, value: string) => void
  onBlur: (key: contactFormKey) => void
}) {
  const id = `contact-${field.key}`

  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {field.label}
        {field.optional && " (optional)"}
      </label>

      {field.multiline ? (
        <textarea
          id={id}
          name={field.key}
          value={value}
          placeholder={field.placeholder}
          data-invalid={error !== undefined}
          aria-invalid={error !== undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={e => onChange(field.key, e.target.value)}
          onBlur={() => onBlur(field.key)}
        />
      ) : (
        <input
          id={id}
          name={field.key}
          type={field.type ?? "text"}
          value={value}
          placeholder={field.placeholder}
          data-invalid={error !== undefined}
          aria-invalid={error !== undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={e => onChange(field.key, e.target.value)}
          onBlur={() => onBlur(field.key)}
        />
      )}

      {error && (
        <p id={`${id}-error`} className={styles.error}>{error}</p>
      )}
    </div>
  )
}

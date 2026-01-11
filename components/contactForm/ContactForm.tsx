"use client"
import React, { useEffect, useState } from 'react'
import z from "zod"
import styles from "./contactform.module.css"
import { toast } from 'react-hot-toast';
import { retreiveFromLocalStorage, saveToLocalStorage } from '@/utility/saveToStorage';
import { useSearchParams } from 'next/navigation'
import { sendNodeEmail } from '@/serverFunctions/handleNodeEmails';

const phoneRegex = new RegExp(
    /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

export default function ContactForm() {
    const paramsSearch = useSearchParams()
    const userInterestedText = paramsSearch.get("planType");

    const contactFormSchema = z.object({
        name: z.string().min(1, "Name needs to be at least 1 character"),
        email: z.string().email("Email needs to be valid"),
        phone: z.string().regex(phoneRegex, 'Invalid Number!'),
        subject: z.string().min(1, "Please provide a subject"),
        message: z.string().min(1, "Please provide a message"),
    })

    type contactForm = z.infer<typeof contactFormSchema>

    type contactFormKeys = keyof contactForm

    const initialFormObj: contactForm = {
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: userInterestedText ?
            userInterestedText === "basic" ? "I'd like to get started on the basic plan" : "I'd like to get started on the standard plan"
            : ""
    }

    const [formObj, formObjSet] = useState<contactForm>({ ...initialFormObj })

    const [checkedForSave, checkedForSaveSet] = useState(false)

    const [formErrors, formErrorsSet] = useState<Partial<{
        [key in contactFormKeys]: string
    }>>({})

    type moreFormInfoType = {
        [key in contactFormKeys]: {
            placeHolder?: string,
            type?: string,
            required?: boolean
            inputType?: "input" | "textarea"
        }
    }

    const [moreFormInfo,] = useState<moreFormInfoType>({
        "name": {
            placeHolder: "Name",
            required: true
        },
        "email": {
            placeHolder: "Email",
            required: true
        },
        "phone": {
            placeHolder: "Phone",
            required: true
        },
        "subject": {
            placeHolder: "Subject",
            required: true
        },
        "message": {
            placeHolder: "Message",
            required: true,
            inputType: "textarea"
        }
    });

    async function handleSubmit(readyToSubmit?: boolean) {
        if (readyToSubmit === undefined || readyToSubmit === false) return

        try {
            if (!contactFormSchema.safeParse(formObj).success) return toast.error("Form not valid")

            await sendNodeEmail({
                sendTo: "maxwellwedderburn32@gmail.com",
                replyTo: formObj.email,
                subject: `Portfolio message from ${formObj.name}`,
                text: (
                    `
                    ${Object.entries(formObj).map(([key, value]) => {
                        return `
                        ${key}:${value}\n
                        `
                    })}
                    `
                )
            })

            toast.success("Sent!")
            formObjSet({ ...initialFormObj })

        } catch (error) {
            toast.error("Couldn't send")
            console.log(`Couldn't send`, error);
        }
    }

    function checkIfValid(seenFormObj: contactForm, seenName: keyof contactForm, schema: any) {
        const testSchema = schema.pick({ [seenName]: true }).safeParse(seenFormObj);

        if (testSchema.success) {//worked
            formErrorsSet(prevObj => {
                const newObj = { ...prevObj }
                delete newObj[seenName]

                return newObj
            })

        } else {
            formErrorsSet(prevObj => {
                const newObj = { ...prevObj }

                let errorMessage = ""

                JSON.parse(testSchema.error.message).forEach((eachErrorObj: any) => {
                    errorMessage += ` ${eachErrorObj.message}`
                })

                newObj[seenName] = errorMessage

                return newObj
            })
        }
    }

    //read save from storage
    useEffect(() => {
        checkedForSaveSet(true)
        const prevForm: contactForm | null = retreiveFromLocalStorage("form")
        if (prevForm === null) return

        formObjSet({ ...prevForm })
    }, [])

    //save form to storage
    useEffect(() => {
        if (!checkedForSave) return

        saveToLocalStorage("form", formObj)

    }, [checkedForSave, formObj])

    return (
        <div>
            <div style={{ padding: "1rem", color: "pink", marginBottom: "1rem" }}>
                {Object.entries(formErrors).map(([key, value]) => {
                    return (
                        <p key={key}>{value}</p>
                    )
                })}
            </div>

            <form className={styles.form} action={(e) => { handleSubmit() }}>
                {Object.entries(moreFormInfo).map(([key, value]) => {
                    const seenKey = key as contactFormKeys

                    if (moreFormInfo[seenKey].inputType === undefined || moreFormInfo[seenKey].inputType === "input") {
                        return (
                            <input key={seenKey} style={{ borderLeft: formErrors[seenKey] !== undefined ? "1px solid green" : "" }} type={moreFormInfo[seenKey].type === undefined ? "text" : moreFormInfo[seenKey].type} name={seenKey} value={formObj[seenKey]} placeholder={moreFormInfo[seenKey].placeHolder} required={moreFormInfo[seenKey].required}
                                onChange={(e) => {
                                    formObjSet(prevObj => {
                                        prevObj[seenKey] = e.target.value

                                        return { ...prevObj }
                                    })
                                }}
                                onBlur={() => { checkIfValid(formObj, seenKey, contactFormSchema) }}
                            />
                        )
                    } else if (moreFormInfo[seenKey].inputType === "textarea") {
                        return (
                            <textarea key={seenKey} style={{ borderLeft: formErrors[seenKey] !== undefined ? "1px solid green" : "", gridColumn: "1/-1" }} rows={7} name={seenKey} value={formObj[seenKey]} placeholder={moreFormInfo[seenKey].placeHolder} required={moreFormInfo[seenKey].required}
                                onChange={(e) => {
                                    formObjSet(prevObj => {
                                        prevObj[seenKey] = e.target.value

                                        return { ...prevObj }
                                    })
                                }}
                                onBlur={() => { checkIfValid(formObj, seenKey, contactFormSchema) }}
                            />

                        )
                    }
                })}

                <button disabled={!contactFormSchema.safeParse(formObj).success} style={{ justifySelf: "flex-start", paddingInline: "5rem" }} role='submit'
                    onClick={() => {
                        handleSubmit(true)
                    }}
                >Submit</button>
            </form>
        </div>
    )
}
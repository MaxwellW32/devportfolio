"use server"
import nodemailer from "nodemailer"

require('dotenv').config()

const email = process.env.EMAIL
const pass = process.env.EMAIL_PASS

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: email,
        pass: pass,
    },
});

export async function sendNodeEmail(input: {
    sendTo: string,
    replyTo: string,
    subject: string,
    text: string,
}) {
    await transporter.sendMail({
        from: email,
        to: input.sendTo,
        subject: input.subject,
        text: input.text,
        replyTo: input.replyTo
    });

    // console.log("Message sent: %s", info.messageId);
}
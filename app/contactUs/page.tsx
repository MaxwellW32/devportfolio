import React from 'react'
import styles from "./page.module.css"
import ContactForm from '@/components/contactForm/ContactForm'
import Socials from '@/components/socials/Socials'
import Link from 'next/link'
import AddressMap from '@/components/addressMap/AddressMap'

export default function Page() {

    return (
        <main>
            <section>
                <div>
                    <p style={{ textAlign: "center" }} className='extraLargeText'>Contact Me</p>
                </div>
            </section>

            <section style={{ backgroundColor: "var(--backgroundColor)" }}>
                <div style={{ display: "flex", flexDirection: "row-reverse", flexWrap: "wrap", gap: "2rem", padding: "2rem 0" }}>
                    <div className={styles.mainTextArea} style={{ flex: "99999 1 400px" }}>
                        <h2>Get In Touch</h2>

                        <p className='extraLargeText'>If you have any project or need help. Contact me</p>

                        <p>I&apos;m always here to help and will respond as quickly as possible.</p>

                        <ContactForm />
                    </div>

                    <div style={{ flex: "1 0 300px" }}>
                        <div className={styles.leftCont}>
                            <ul>
                                <li>
                                    <p>Phone:</p>
                                    <p>0123456789</p>
                                </li>

                                <li>
                                    <p>Email:</p>
                                    <p>quantumbuilder32@gmail.com</p>
                                </li>

                                <li>
                                    <p>Website:</p>
                                    <p><Link href={`https://codemax.vercel.app/`}>codemax.vercel.app</Link></p>
                                </li>

                                <li>
                                    <p>Address:</p>
                                    <p>Kingston, Jamaica</p>
                                </li>
                            </ul>
                        </div>

                        <div style={{ marginTop: "3rem" }} className={styles.leftCont}>
                            <h1>Follow Me</h1>

                            <Socials />
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <AddressMap />
            </section>
        </main>
    )
}

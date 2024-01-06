"use client"

import React, { useState } from 'react'
import styles from "./page.module.css"
import MyMetrics from '@/components/myMetrics/MyMetrics'
import Testimonials from '@/components/testimonials/Testimonials'
import TrustedCompanies from '@/components/trustedCompanies/TrustedCompanies'
import TextChanger from '@/components/textChanger/TextChanger'

export default function Page() {

    const [selected, selectedSet] = useState<"education" | "experience">("education")

    return (
        <main>
            <section>
                <p className='extraLargeText' style={{ textAlign: "center" }}>About Me</p>
            </section>

            <section style={{ backgroundColor: "var(--backgroundColor)" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", flexDirection: "row-reverse" }}>
                    <div style={{ flex: "999 1 400px" }}>
                        <p className='extraLargeText'>I&apos;m Maxwell Wedderburn</p>

                        {/* <p style={{ color: "#aaa", fontSize: "var(--largeFontSize)" }}>Fullstack Developer specializing in React</p> */}
                        <TextChanger />


                        <p style={{ marginTop: "1rem" }}>I love learning, and I have many app ideas that I want to bring to life. So I am always learning the newest technology, the best industry practises so I can bring these ideas to life, and use them to enrich my clients websites.</p>
                    </div>

                    <div style={{ flex: "1 1 400px", padding: "2rem", backgroundColor: "var(--primaryColor)", display: "grid", alignItems: "center", justifyItems: "center" }}>
                        <a href="/resume.pdf" download="My Resume" style={{ marginBlock: "2rem", display: "inline-block" }}>
                            <button>
                                Get Resume

                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" /></svg>
                            </button>
                        </a>
                    </div>
                </div>
            </section>

            <section>
                <div className={styles.selectionCont} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", gap: "2rem", alignItems: "center", marginBlock: "3rem", justifyContent: "center" }}>
                    <p style={{ fontSize: "var(--largeFontSize)", cursor: "pointer", backgroundColor: selected === "education" ? "var(--backgroundColor)" : "" }} onClick={() => { selectedSet("education") }}>Education</p>
                    <p style={{ fontSize: "var(--largeFontSize)", cursor: "pointer", backgroundColor: selected === "experience" ? "var(--backgroundColor)" : "" }} onClick={() => { selectedSet("experience") }}>Experience</p>
                </div>

                <div style={{ display: selected === "education" ? "flex" : "none", flexDirection: "column", gap: "2rem" }}>
                    <div className={styles.achievementsCont}>
                        <div>
                            <p>2023 - 2024</p>
                        </div>

                        <div>
                            <h1>BSc. in Information and Communication Technology - Ongoing</h1>

                            <p>Vector Technology, Kingston</p>

                            <p>While this degree is in process, I am currently reinforcing my knowledge of the more advanced features in routing/networking that I covered as my time as a Systems Engineer.</p>
                        </div>
                    </div>

                    <div className={styles.achievementsCont}>
                        <div>
                            <p>2022 - 2023</p>
                        </div>

                        <div>
                            <h1>ASc. in Computer Systems Technology</h1>

                            <p>Vector Technology, Kingston</p>

                            <p>Obtaining this degree at Vector, I learned basic computer hardware and network management.</p>
                        </div>
                    </div>

                    <div className={styles.achievementsCont}>
                        <div>
                            <p>2022 - 2022</p>
                        </div>

                        <div>
                            <h1>Meta Front-End Developer Certification</h1>

                            <p>Coursera, Online</p>

                            <p>I was able to complete this full Coursera Certified Course, reinforcing my understanding of HTML, CSS, Javascript, UI/UX Design and React.</p>
                        </div>
                    </div>


                    <div className={styles.achievementsCont}>
                        <div>
                            <p>2018 - 2019</p>
                        </div>

                        <div>
                            <h1>CompTIA A+ Certification</h1>

                            <p>CompTIA, Online</p>

                            <p>I was able to complete the certification process for the CompTIA 220-901 and 220-902 exams. This certification has since expired, but I plan to renew it this upcoming year</p>
                        </div>
                    </div>

                    <div className={styles.achievementsCont}>
                        <div>
                            <p>2012 - 2017</p>
                        </div>

                        <div>
                            <h1>Diploma - 10 CXC Subjects</h1>

                            <p>Wolmers&apos; Boy&apos;s School</p>

                            <p>I was able to graduate wolmers obtaining: Information Technology, Physics, Chemistry, Biology, Engligh A, Engligh B, Mathematics, Additional Mathematics, Integrated Science and HSB</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: selected === "experience" ? "flex" : "none", flexDirection: "column", gap: "2rem" }}>
                    <div className={styles.achievementsCont}>
                        <div>
                            <p>2020 - Ongoing</p>
                        </div>

                        <div>
                            <h1>Full Stack Web Developer</h1>

                            <p>Freelance, Online</p>

                            <p>Completed Numerous projects to bring my clients website ideas to life. From Wireframe to Code, to Powerful Web Apps.</p>
                        </div>
                    </div>

                    <div className={styles.achievementsCont}>
                        <div>
                            <p>2022 - 2023</p>
                        </div>

                        <div>
                            <h1>Systems Engineer</h1>

                            <p>Vertis Technology</p>

                            <p>Provided end-user support and issue resolution through on-site visits, ensuring infrastructure updates and swift resolution of technical issues. </p>
                        </div>
                    </div>

                    <div className={styles.achievementsCont}>
                        <div>
                            <p>2021 - 2022</p>
                        </div>

                        <div>
                            <h1>GoDaddy - Consultative Sales Agent</h1>

                            <p>Ibex</p>

                            <p>Was able to assist customers with creating their websites, along with recommending them the best products to help with site growth.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ backgroundColor: "var(--backgroundColor)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", gap: "1rem", padding: "3rem 2rem" }}>
                    <MyMetrics amount={258} amountAdd="+" svg={
                        <svg style={{ width: "1.5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" /></svg>
                    } text="Happy Clients" />

                    <MyMetrics amount={30} amountAdd="K" svg={
                        <svg style={{ width: "1.5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" /></svg>
                    } text="Projects Complete" />

                    <MyMetrics amount={4} amountAdd="+" svg={
                        <svg style={{ width: "1.5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192h80v56H48V192zm0 104h80v64H48V296zm128 0h96v64H176V296zm144 0h80v64H320V296zm80-48H320V192h80v56zm0 160v40c0 8.8-7.2 16-16 16H320V408h80zm-128 0v56H176V408h96zm-144 0v56H64c-8.8 0-16-7.2-16-16V408h80zM272 248H176V192h96v56z" /></svg>
                    } text="Years of Experience" />
                </div>
            </section>

            {/* <section>
                <Testimonials />
            </section> */}

            <section style={{ backgroundColor: "var(--backgroundColor)" }}>
                <div style={{ display: "grid" }}>
                    <h2>Favourite Clients</h2>

                    <p style={{ marginBlock: "2rem" }} className="extraLargeText">Work With Trusted Companies.</p>

                    <TrustedCompanies />
                </div>
            </section>
        </main>
    )
}

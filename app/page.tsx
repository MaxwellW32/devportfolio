import BackToTopBttn from "@/components/backToTopButton/BackToTopBttn";
import BlogPosts from "@/components/blogPosts/BlogPosts";
import InfiniteScroll from "@/components/infiniteScroll/InfiniteScroll";
import MyMetrics from "@/components/myMetrics/MyMetrics";
import MyProjects from "@/components/myProjects/MyProjects";
import PlayMusic from "@/components/playMusic/PlayMusic";
import ServicesProvided from "@/components/servicesProvided/ServicesProvided";
import ShowHomePageExample from "@/components/showHomePageExample/ShowHomePageExample";
import ShowMadeWebsite from "@/components/showMadeWebsite/ShowMadeWebsite";
import Skill from "@/components/skills/Skill";
import Socials from "@/components/socials/Socials";
import Testimonials from "@/components/testimonials/Testimonials";
import TextChanger from "@/components/textChanger/TextChanger";
import TrustedCompanies from "@/components/trustedCompanies/TrustedCompanies";
import { homePageExamples } from "@/lib/HomePageData";
import { madeWebsites } from "@/lib/MadeWebsitesData";
import Image from "next/image";
import Link from "next/link";

export default function page() {


  return (
    <main>
      <section>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", flexDirection: "row-reverse" }}>
          <Image alt="profile" priority={true} width={400} height={400} src={require(`@/public/cat1.png`).default.src} style={{ flex: "1 1 400px", }} />

          <article style={{ flex: "1 1 500px" }}>
            <h1 style={{ display: "flex", gap: "1rem" }}>
              <div style={{ display: "flex", gap: ".1rem" }}>
                <h1 style={{ color: "rgb(var(--color1))" }}>H</h1>
                <h1 style={{ color: "rgb(var(--color2))" }}>e</h1>
                <h1 style={{ color: "rgb(var(--color3))" }}>l</h1>
                <h1 style={{ color: "rgb(var(--color4))" }}>l</h1>
                <h1 style={{ color: "rgb(var(--color5))" }}>o</h1>
              </div>

              I&apos;m</h1>

            <p className="extraLargeText">Maxwell Wedderburn</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "1rem" }}>
              <TextChanger />

              <a href="/resume.pdf" download="My Resume">
                <button>
                  Get Resume

                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" /></svg>
                </button>
              </a>

              <Socials />
            </div>

          </article>
        </div>
      </section>

      <section style={{ backgroundColor: "var(--backgroundColor)" }}>
        <h2 id="services">My Services</h2>

        <p style={{ marginBottom: "1rem" }} className="extraLargeText">Services I Provide For My Clients.</p>

        <ServicesProvided />
      </section>

      <section>
        <h2>Websites Built</h2>

        <p style={{ marginBottom: "1rem" }} className="extraLargeText">Websites Completed For My Clients.</p>

        <div style={{ display: "grid" }}>
          <div className="noScrollBar" style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "250px", overflowX: "auto", gap: "1rem" }}>
            {madeWebsites.map((eachWebsite, eachWebsiteIndex) => {
              return (
                <ShowMadeWebsite key={eachWebsiteIndex} {...eachWebsite} />
              )
            })}
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: "var(--backgroundColor)" }}>
        <h2>HomePage Examples</h2>

        <p style={{ marginBottom: "1rem" }} className="extraLargeText">Find a Homepage You&apos;ll Love.</p>

        <InfiniteScroll amountOfTrains={3} initialTimeToLoop={20}>
          <div className="noScrollBar" style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "250px", overflowX: "auto", gap: "1rem", marginRight: "1rem" }}>
            {homePageExamples.map((eachHomePageExample, eachHomePageExampleIndex) => {
              return (
                <ShowHomePageExample key={eachHomePageExampleIndex} {...eachHomePageExample} />
              )
            })}
          </div>
        </InfiniteScroll>
      </section>

      <section>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", gap: "1rem", alignItems: "center" }}>
          <article style={{}}>
            <h2>Special Skills</h2>

            <p className="extraLargeText">My Special Skill Field Here.</p>

            <a href="/resume.pdf" download="My Resume" >
              <button>
                Get Resume

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" /></svg>
              </button>
            </a>
          </article>

          <div style={{ display: "grid", gap: "1rem" }}>
            <Skill title={`communication`} amount={`95%`} />
            <Skill title={`Leadership`} amount={`80%`} />
            <Skill title={`Teamwork`} amount={`95%`} />
            <Skill title={`Flexibility`} amount={`90%`} />
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: "var(--backgroundColor)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", gap: "1rem" }}>
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

      <section style={{ backgroundColor: "var(--backgroundColor)" }} >
        <h2 id="projects">Awesome Portfolio</h2>

        <p className='extraLargeText'>My Complete Projects</p>

        <MyProjects />
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

      <section style={{ backgroundColor: "var(--backgroundColor)" }}>
        <div style={{ display: "grid", justifyItems: "center" }}>
          <h2>Blog Post</h2>

          <p style={{ marginBlock: "2rem" }} className="extraLargeText">Latest Tips & Tricks</p>

          <BlogPosts inPreviewMode={true} limit={3} />
        </div>
      </section>

      <BackToTopBttn />
    </main>
  )
}

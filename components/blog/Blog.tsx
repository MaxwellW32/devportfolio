import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Blog({
  image,
  category,
  datePosted,
  title,
  messages,
  slug,
  inPreview
}: {
  image: string,
  category: string,
  datePosted: Date,
  title: string,
  messages?: React.JSX.Element[],
  slug: string,
  inPreview?: boolean
}) {



  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", padding: "2rem", backgroundColor: "var(--primaryColor)", alignItems: "center", justifyContent: "center" }}>
      <Image alt={`${category}'s image`} width={200} height={200} src={image} style={{ flex: "0 0 auto", aspectRatio: "1/1", width: "200px", objectFit: "cover" }} />

      <div style={{ flex: 1 }}>
        <p style={{ textTransform: "capitalize" }}>{category}<span style={{ paddingInline: "1rem" }}>-</span><span>{datePosted.toDateString()}</span></p>

        <h1>{title}</h1>

        {!inPreview && messages !== undefined && (
          <div>
            {messages.map((eachMessage, eachMessageIndex) => eachMessage)}
          </div>
        )}
      </div>

      {inPreview && (
        <Link href={`/blog/${slug}`}>
          <button style={{ flex: "0 0 auto", whiteSpace: "nowrap", alignSelf: "center", paddingInline: "3rem" }}>
            Read More
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M470.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 256 265.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160zm-352 160l160-160c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L210.7 256 73.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0z" /></svg>
          </button>
        </Link>
      )}
    </div>
  )
}

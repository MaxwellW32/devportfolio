import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Logo() {
    return (
        <Link href={`/`}>
            <Image alt='logo' src={require(`@/public/new logo.svg`).default.src} height={98} width={171} />
        </Link>
    )
}

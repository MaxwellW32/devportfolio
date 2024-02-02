import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Logo() {
    return (
        <Link href={`/`}>
            <Image alt='logo' src={require(`@/public/quantumbuilderlogo.png`).default.src} height={75} width={75} />
        </Link>
    )
}

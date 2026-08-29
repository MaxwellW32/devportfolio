import AppleStore from '@/components/landingPages/appleStore/AppleStore'
import React from 'react'
import { Suspense } from 'react'

export default function Page() {
    return (
        <Suspense>
            <AppleStore />
        </Suspense>
    )
}
"use client"
import React, { useRef } from 'react'
import { projects } from '@/lib/ProjectsData'
import ShowApp from './ShowApp'
import { apps } from '@/lib/PlaystoreAppsData'

export default function MyApps() {

    const projectContRef = useRef<HTMLDivElement>(null!)

    return (
        <div style={{ position: "relative", display: "grid", }}>
            {apps.length > 0 && (
                <div ref={projectContRef} className={`noScrollBar`} style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", scrollBehavior: "smooth", gap: "1rem" }}>
                    {apps.map((eachProject, eachProjectIndex) => {
                        return (
                            <ShowApp key={eachProjectIndex} {...eachProject} />
                        )
                    })}
                </div>
            )}
        </div>
    )
}



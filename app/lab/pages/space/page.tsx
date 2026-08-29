"use client"

import { createRoot } from 'react-dom/client'
import React, { HTMLAttributes, useRef, useState } from 'react'
import { Canvas, useFrame, type ThreeElements } from '@react-three/fiber'
import type { Mesh } from 'three'

function Box(props: ThreeElements['mesh']) {
    // This reference will give us direct access to the mesh
    const meshRef = useRef<Mesh>(null!)

    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)

    // Subscribe this component to the render-loop, rotate the mesh every frame
    useFrame((state, delta) => (meshRef.current.rotation.x += delta))

    return (
        <mesh {...props} ref={meshRef} scale={active ? 1.5 : 1} onClick={() => setActive(!active)} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
        </mesh>
    )
}

export default function Page() {
    return (
        <Canvas>
            <ambientLight intensity={Math.PI / 2} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
            <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

            <Box position={[-2, 0, 0]} />

            <Box position={[2, 0, 0]} />
        </Canvas>
    )
}

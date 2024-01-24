"use client"
import HideNav from '@/components/hideNav/HideNav';
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three';

export default function Page() {
    const mainDiv = useRef<HTMLDivElement>(null!)

    //start function first time
    const mounted = useRef(false)
    useEffect(() => {
        if (mounted.current) return
        mounted.current = true
        main()

        return () => { }
    }, [])

    function main() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        mainDiv.current.appendChild(renderer.domElement);

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        camera.position.z = 5;
        let rotationXAmt = 0.01

        mainDiv.current.addEventListener("mousemove", changeRotation)


        function changeRotation(e: MouseEvent) {
            let percentageCovered = (100 / Math.floor((window.innerWidth / e.clientX))) / 100
            // if (percentageCovered > 300) percentageCovered = 300

            const maxValue = 0.1

            console.log(`$percentageCovered`, percentageCovered);
            console.log(`$e`, e);
            rotationXAmt = maxValue * percentageCovered
        }
        animate();













        function animate() {
            requestAnimationFrame(animate);

            cube.rotation.x += rotationXAmt;
            cube.rotation.y += rotationXAmt / 2;

            renderer.render(scene, camera);
        }
    }

    return (
        <HideNav>
            <div ref={mainDiv}></div>
        </HideNav>
    )
}

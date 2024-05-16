"use client"
import { useState, useEffect, useRef } from 'react';

export default function Page() {
    const [audioUrl, setAudioUrl] = useState("");
    const audioRef = useRef<HTMLAudioElement>(null!);
    const bassDivRef = useRef<HTMLDivElement>(null!);

    useEffect(() => {
        if (audioUrl) {
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256; // Adjust as needed
            const source = audioContext.createMediaElementSource(audioRef.current);
            source.connect(analyser);
            analyser.connect(audioContext.destination);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const renderFrame = () => {
                requestAnimationFrame(renderFrame);
                analyser.getByteFrequencyData(dataArray);

                // Calculate average of lower frequencies for bass
                let sum = 0;
                for (let i = 0; i < bufferLength / 2; i++) {
                    sum += dataArray[i];
                }
                const average = sum / (bufferLength / 2);

                // Update bassDivRef style based on bass
                bassDivRef.current.style.opacity = `${average / 256}`;
            };

            renderFrame();
        }
    }, [audioUrl]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files
        if (!fileList) return

        const File = fileList[0]
        const url = URL.createObjectURL(File);
        setAudioUrl(url);
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} accept="audio/*" />
            <audio ref={audioRef} controls src={audioUrl}></audio>
            <div ref={bassDivRef} style={{ width: '100px', height: '100px', backgroundColor: 'blue' }}>
                Bass React
            </div>
        </div>
    );
}

"use client"
import { HSLToRGB, colorOptionsType, getColors, hexToHSL } from '@/useful/functions'
import { themeGlobal } from '@/utility/globalState'
import { saveToLocalStorage } from '@/utility/saveToStorage'
import { useAtom } from 'jotai'
import React, { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function ThemeBar({ showingThemeNavSet }: { showingThemeNavSet: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [theme, themeSet] = useAtom(themeGlobal)
    const [choosingCustom, choosingCustomSet] = useState(false)

    const colorOptionsArr: colorOptionsType[] = ["complementary", "analogous", "triad"]
    const [colorModeSelection, colorModeSelectionSet] = useState<colorOptionsType>("complementary")
    const [baseColor, baseColorSet] = useState("#ff0000")

    const implementedColors = useMemo(() => {
        const seenHSL = hexToHSL(baseColor)
        const colors = getColors(seenHSL[0], seenHSL[1], seenHSL[2], colorModeSelection)

        let lowContrast = false
        let lowBrightness = false

        const rgbColors = colors.map(eachObj => {
            const seenRGB = HSLToRGB(eachObj["h"], eachObj["s"], eachObj["l"])

            if (eachObj["s"] < 30) {
                lowContrast = true
            }

            if (eachObj["l"] < 20) {
                lowBrightness = true
            }

            return `${seenRGB[0]}, ${seenRGB[1]}, ${seenRGB[2]}`
        })

        const firstColorHSL = hexToHSL(baseColor)
        const firstColorRGB = HSLToRGB(firstColorHSL[0], firstColorHSL[1], firstColorHSL[2])

        saveToLocalStorage("customTheme", { colors: [`${firstColorRGB[0]}, ${firstColorRGB[1]}, ${firstColorRGB[2]}`, ...rgbColors], options: { lowContrast: lowContrast, lowBrightness: lowBrightness } })

        return colors
    }, [baseColor, colorModeSelection])

    return (
        <div style={{ position: "absolute", top: 0, right: 0, width: "min(400px, 100%)", backgroundColor: "var(--primaryColor)", padding: "3rem 1rem", display: "flex", flexDirection: "column", gap: "1rem", color: "#fff", border: "1px solid #fff" }}>
            <svg style={{ marginLeft: "auto" }} onClick={() => {
                showingThemeNavSet && showingThemeNavSet(false)
            }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" /></svg>

            <p>Theme</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
                <button style={{ color: theme?.dark ? "gold" : "" }} onClick={(() => { themeSet({ light: false, dark: true, custom: false }); choosingCustomSet(false) })}>Dark</button>

                <button style={{ color: theme?.light ? "gold" : "" }} onClick={() => { themeSet({ light: true, dark: false, custom: false }) }}>Light</button>

                <button style={{ color: choosingCustom ? "gold" : "" }} onClick={(() => { choosingCustomSet(true) })}>Custom</button>
            </div>

            {/* custom */}
            <div style={{ display: !choosingCustom ? "none" : "grid", gap: "1rem" }}>
                <input type="color" style={{ width: "9rem", height: "4rem", }} value={baseColor} onChange={(e) => {
                    baseColorSet(e.target.value)
                }} />


                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                    {colorOptionsArr.map((eachColorOption, eachColorOptionIndex) => {

                        return (
                            <div key={eachColorOptionIndex} style={{ padding: "1rem", color: eachColorOption === colorModeSelection ? 'gold' : "", cursor: "pointer" }}
                                onClick={() => { colorModeSelectionSet(eachColorOption) }}>
                                {eachColorOption}
                            </div>
                        )
                    })}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", paddingLeft: "1rem" }}>
                    <ShowColor color={baseColor} normal={true} />
                    <ShowColor color={implementedColors[0]} />
                    <ShowColor color={implementedColors[1]} />
                    <ShowColor color={implementedColors[2]} />
                    <ShowColor color={implementedColors[3]} />
                </div>

                <button style={{ justifySelf: "center" }} onClick={() => { themeSet({ light: false, dark: false, custom: true }) }}>Apply</button>
            </div>
        </div>
    )
}


type coolObj = { [key: string]: number }
function ShowColor({ color, normal }: { color: coolObj | string, normal?: boolean }) {
    return (
        <div style={{ aspectRatio: "1/1", minWidth: "3rem", backgroundColor: normal ? color as string : `hsl(${(color as coolObj)["h"]}, ${(color as coolObj)["s"]}%, ${(color as coolObj)["l"]}%)` }}>
            {/* {JSON.stringify(color)} */}
        </div>
    )
}
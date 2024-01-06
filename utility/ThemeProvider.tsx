"use client"

import { useAtom } from 'jotai'
import { ReactNode, useEffect, useMemo } from 'react'
import { themeGlobal } from './globalState'
import { retreiveFromLocalStorage, saveToLocalStorage } from './saveToStorage'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, themeSet] = useAtom(themeGlobal)

    //retrieve from storage
    useEffect(() => {
        if (theme === undefined) {
            const seenTheme = retreiveFromLocalStorage("theme")

            if (seenTheme === null) {
                themeSet({ light: false, dark: true, custom: false })
                return
            }

            //set saved theme
            themeSet(seenTheme)
        }
    }, [theme])

    //write theme to storage
    useEffect(() => {
        if (theme !== undefined) {
            saveToLocalStorage("theme", theme)
        }
    }, [theme])


    const themeStyles = useMemo(() => {
        type themeObj = { [key: string]: string }

        if (theme === undefined) return {}

        //{colors: [red, blue, yellow], options: {lowContrast: false, lowBrightness: false}}
        //read array of colors from storage
        //read low contrast - outlines
        //read low brightness - choose light dark for text/background

        if (theme.light || theme.dark) {
            //light dark

            const newThemeObj: themeObj = {
                '--color1': theme.light ? "0, 255, 195" : "17, 8, 255",
                '--color2': theme.light ? "0, 255, 109" : "8, 78, 255",
                '--color3': theme.light ? "0, 230, 255" : "97, 8, 255",
                '--color4': theme.light ? "0, 255, 22" : "8, 156, 255",
                '--color5': theme.light ? "0, 149, 255" : "178, 8, 255",
                '--textColor': theme.light ? "30, 30, 30" : "255, 255, 255",
                '--backgroundColor': theme.light ? "50, 50, 50" : "30, 30, 30",
            }

            return newThemeObj
        }

        if (theme.custom) {
            const customSettings = retreiveFromLocalStorage("customTheme") ?? { colors: ["255,0,0", "255,0,0", "255,0,0", "255,0,0", "255,0,0"], options: { lowContrast: false, lowBrightness: false } }

            const newThemeObj: themeObj = {
                '--color1': customSettings.colors[0],
                '--color2': customSettings.colors[1],
                '--color3': customSettings.colors[2],
                '--color4': customSettings.colors[3],
                '--color5': customSettings.colors[4],
                '--textColor': customSettings.options.lowBrightness < 30 ? "30, 30, 30" : "255, 255, 255",
                '--backgroundColor': customSettings.options.lowBrightness < 30 ? "50, 50, 50" : "30, 30, 30",
                '--lowContrastBorder': customSettings.options.lowContrast < 20 ? `3px solid ${customSettings.options.lowBrightness ? "#fff" : "#000"}` : "none"
            }

            return newThemeObj
        }

    }, [theme])

    return (
        <body className={inter.className} style={{ opacity: theme === undefined ? "0" : "", transition: "opacity 1s", ...themeStyles }}>
            {children}
        </body>
    )
}

import { toast } from "react-hot-toast";

export function isInObj<T extends Record<string, any>>(obj: T, searchKey: string): keyof T | undefined {
    const foundKey = Object.keys(obj).find(eachKey => eachKey === searchKey) as keyof T | undefined;
    return foundKey
}






export type colorOptionsType = "complementary" | "analogous" | "triad"

export const getColors: (h: number, s: number, l: number, colorOptions: colorOptionsType) => { [key: string]: number }[] = (h, s, l, colorOptions) => {
    if (colorOptions === "complementary") {
        return [
            { h: (h + 180) % 360, s: s, l: l },
            { h: (h + 90) % 360, s: s, l: l },
            { h: (h - 90 < 0 ? 360 + h - 90 : h - 90), s: s, l: l },
            { h: (h + 45) % 360, s: s, l: l },
        ]

    } else if (colorOptions === "analogous") {
        const spread = 12
        const spread2 = 36

        if (s < 20) {
            toast.success("getting outline")
        }

        if (l < 30) {
            toast.success("getting darkMode")
        }



        return [
            { h: (h + spread) % 360, s: s, l: l },
            { h: (h + spread * 2) % 360, s: s, l: l },
            { h: ((h - spread2 * 2) < 0 ? 360 + (h - spread2 * 2) : h - spread2 * 2), s: s, l: l },
            { h: ((h - spread2) < 0 ? 360 + (h - spread2) : h - spread2), s: s, l: l },
        ]

    } else if (colorOptions === "triad") {
        return [
            { h: (h + 120) % 360, s: s, l: l },
            { h: (h + 240) % 360, s: s, l: l },
            { h: (h + 60) % 360, s: s, l: l },
            { h: (h + 300) % 360, s: s, l: l }
        ]

    } else if (colorOptions === "monochromatic") {
        return [
            { h: h, s: s - 20, l: l },
            { h: h, s: s + 20, l: l },
            { h: h, s: s, l: l - 20 },
            { h: h, s: s, l: l + 20 }
        ]

    } else {
        console.log(`$didn't get an input`);
        return [
            { h: 0, s: 0, l: 0 },
            { h: 0, s: 0, l: 0 },
            { h: 0, s: 0, l: 0 },
            { h: 0, s: 0, l: 0 },
        ]
    }
}

export function hexToHSL(H: string) {
    // Convert hex to RGB first
    let r: any = 0
    let g: any = 0
    let b: any = 0

    if (H.length == 4) {
        r = "0x" + H[1] + H[1];
        g = "0x" + H[2] + H[2];
        b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
        r = "0x" + H[1] + H[2];
        g = "0x" + H[3] + H[4];
        b = "0x" + H[5] + H[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return [h, s, l]
}

export function HSLToRGB(h: number, s: number, l: number) {
    // Must be fractions of 1
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;


    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b]
}



export function rgbToHex(r: number, g: number, b: number) {
    const componentToHex = (c: number) => {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
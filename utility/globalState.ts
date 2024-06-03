import { atom } from 'jotai'

export const screenSizeGlobal = atom<{
    desktop: boolean
    tablet: boolean,
    phone: boolean
}>({
    desktop: false,
    tablet: false,
    phone: false
});


export const themeGlobal = atom<{ light: boolean, dark: boolean, custom: boolean } | undefined>(undefined);

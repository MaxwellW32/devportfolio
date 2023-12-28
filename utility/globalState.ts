import { atom } from 'jotai'
import { useEffect } from 'react';

export const screenSizeGlobal = atom<{
    desktop: boolean
    tablet: boolean,
    phone: boolean
}>({
    desktop: false,
    tablet: false,
    phone: false
});

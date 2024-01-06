"use client"
import { useState, useEffect, CSSProperties } from 'react'
import styles from "./oreoMainnav1.module.css"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAtom } from 'jotai'
import { screenSizeGlobal } from '@/utility/globalState'

type menuItem = {
    title: string,
    link: string,
    subMenu?: subMenuItem[]
}

type subMenuItem = {
    title: string,
    link: string,
    subSubMenu?: subSubMenuItem[]
}

type subSubMenuItem = {
    title: string,
    link: string
}

export default function OreoMainNav1({
    menuInfoArr,
    themeSwitcherEl,
    mobileNavButtonEl,
    homeButtonEl,
    navColors,
    navProps,
    menuProps,
    menuItemProps,
    subMenuProps,
    subMenuItemProps,
    subSubMenuProps,
    subSubMenuItemProps,
}: {
    menuInfoArr: menuItem[], navHeight?: string,
    themeSwitcherEl?: JSX.Element,
    mobileNavButtonEl?: JSX.Element,
    homeButtonEl?: JSX.Element,
    navColors?: { primaryColor: string, secondaryColor: string, highlightColor?: string },

    navProps?: React.HTMLAttributes<HTMLElement>,

    menuProps?: React.HTMLAttributes<HTMLUListElement>,
    menuItemProps?: React.HTMLAttributes<HTMLLIElement>,

    subMenuProps?: React.HTMLAttributes<HTMLUListElement>,
    subMenuItemProps?: React.HTMLAttributes<HTMLLIElement>,

    subSubMenuProps?: React.HTMLAttributes<HTMLUListElement>,
    subSubMenuItemProps?: React.HTMLAttributes<HTMLLIElement>,
}) {
    const [showingMainMenu, showingMainMenuSet] = useState(false)
    const [navSize] = useAtom(screenSizeGlobal)


    return (
        <nav className={`${styles.mainNav} ${(navSize.desktop && styles.desktopMode) ?? ""}    ${(navSize.tablet && styles.tabletMode) ?? ""}  ${(navSize.phone && styles.phoneMode) ?? ""}`}
            style={{
                "--RU_secondaryColor": navColors?.secondaryColor ?? "#0c1522",
                "--RU_primaryColor": navColors?.primaryColor ?? "#1998d7",
                "--RU_highlightColor": navColors?.highlightColor ?? navColors?.primaryColor ?? "#1998d7",
                position: !navSize.desktop ? "relative" : "",
                translate: Object.values(navSize).find(eachVal => eachVal) ? "0 0" : ""
            } as CSSProperties}>
            {homeButtonEl}

            <div>
                {!navSize.desktop && mobileNavButtonEl && (
                    <div onClick={() => { showingMainMenuSet(prev => !prev) }} >
                        {mobileNavButtonEl}
                    </div>
                )}

                {(navSize.desktop ? true : showingMainMenu) && (
                    <ul className={`${styles.mainMenu} noScrollBar`}>
                        {menuInfoArr.map((eachMenuItem, eachMenuItemIndex) => <MenuItem key={eachMenuItemIndex} seenMenuItem={eachMenuItem} seenSubMenuArr={eachMenuItem.subMenu} navSize={navSize} />)}
                    </ul>
                )}
            </div>

            {themeSwitcherEl}
        </nav>
    )
}

function MenuItem({ seenMenuItem, seenSubMenuArr, navSize }: { seenMenuItem: menuItem, seenSubMenuArr: subMenuItem[] | undefined, navSize: { desktop: boolean, tablet: boolean, phone: boolean }, }) {
    const [showingSubMenu, showingSubMenuSet] = useState(false)
    const pathname = usePathname()


    return (
        <li className={styles.mainMenuItem} onClick={(e) => { e.stopPropagation(); showingSubMenuSet(prev => !prev) }} >
            <div style={{ display: "flex", alignItems: "center", gap: ".3rem", justifyContent: "space-between" }}>
                <Link style={{ color: pathname === seenMenuItem.link ? "var(--RU_primaryColor)" : "" }} href={seenMenuItem.link}>{seenMenuItem.title}</Link>

                {seenSubMenuArr !== undefined && (
                    <svg style={{ width: ".7rem", fill: pathname === seenMenuItem.link ? "var(--RU_primaryColor)" : "" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" /></svg>
                )}
            </div>

            {(!navSize.desktop ? showingSubMenu : true) && seenSubMenuArr !== undefined && (
                <ul className={styles.subMenu}>
                    {seenSubMenuArr.map((eachSubMenuItem, eachSubMenuItemIndex) => <SubMenuItem key={eachSubMenuItemIndex} seenSubMenuItem={eachSubMenuItem} seenSubSubMenuArr={eachSubMenuItem.subSubMenu} navSize={navSize} />)}
                </ul>
            )}
        </li>
    )
}

function SubMenuItem({ seenSubMenuItem, seenSubSubMenuArr, navSize }: { seenSubMenuItem: subMenuItem, seenSubSubMenuArr: subSubMenuItem[] | undefined, navSize: { desktop: boolean, tablet: boolean, phone: boolean } }) {
    const [showingSubSubMenu, showingSubSubMenuSet] = useState(false)
    const pathname = usePathname()

    return (
        <li className={styles.subMenuItem} onClick={(e) => { e.stopPropagation(); showingSubSubMenuSet(prev => !prev) }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".3rem", justifyContent: "space-between" }}>
                <Link style={{ color: pathname === seenSubMenuItem.link ? "var(--RU_primaryColor)" : "" }} href={seenSubMenuItem.link}>{seenSubMenuItem.title}</Link>

                {seenSubSubMenuArr !== undefined && (
                    <svg style={{ width: ".7rem", color: pathname === seenSubMenuItem.link ? "var(--RU_primaryColor)" : "" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" /></svg>
                )}
            </div>


            {(!navSize.desktop ? showingSubSubMenu : true) && seenSubSubMenuArr !== undefined && (
                <ul className={styles.subSubMenu}>
                    {seenSubSubMenuArr.map((seenSubSubMenuItem, seenSubSubMenuItemIndex) => <SubSubMenuItem key={seenSubSubMenuItemIndex} seenSubSubMenuItem={seenSubSubMenuItem} navSize={navSize} />)}
                </ul>
            )}
        </li>
    )
}

function SubSubMenuItem({ seenSubSubMenuItem, navSize }: { seenSubSubMenuItem: subSubMenuItem, navSize?: { desktop: boolean, tablet: boolean, phone: boolean }, }) {
    const pathname = usePathname()

    return (
        <li style={{ color: pathname === seenSubSubMenuItem.link ? "var(--RU_primaryColor)" : "" }} className={styles.subSubMenuItem}><Link href={seenSubSubMenuItem.link}>{seenSubSubMenuItem.title}</Link></li>
    )
}
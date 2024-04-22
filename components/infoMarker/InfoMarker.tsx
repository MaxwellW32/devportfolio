import React from 'react'
import styles from "./style.module.css"

export default function InfoMarker({ info }: {
    info: {
        name?: string,
        x: string,
        y: string,
        width?: string,
        color?: string,
    }
}) {
    return (
        <div className={styles.InfoMarkerDiv} style={{ top: info.y, left: info.x, width: info.width ?? "10px" }} data-info={`${JSON.stringify(info)}`}>
            <div style={{ backgroundColor: info.color ?? "green" }} className={styles.marker}></div>
        </div>
    )
}

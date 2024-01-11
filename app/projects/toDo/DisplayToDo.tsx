"use client"
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { globalToDos, greeting, toDo } from './globalToDos'
import { useAtom } from 'jotai'
import DisplayToDoVideo from './DisplayToDoVid'
import styles from "./page.module.css"
import wait from '@/useful/wait'

export default function DisplayToDo({ passedToDo, makingNewToDoSet, toDoToEditSet, options = "final", greetingsList }: { passedToDo?: toDo, makingNewToDoSet?: Dispatch<SetStateAction<boolean>>, toDoToEditSet?: Dispatch<SetStateAction<toDo | undefined>>, options?: "new" | "update" | "final", greetingsList: greeting[] }) {

    const initialToDo: toDo = {
        id: uuidv4(),
        title: "",
        messages: [],
        videos: [],
        dateCreated: new Date(),
    }
    const [toDo, toDoSet] = useState(options === "new" ? { ...initialToDo } : passedToDo!)//for editing/updating
    const [, toDosGlobalSet] = useAtom(globalToDos)
    const [fullScreen, fullScreenSet] = useState(false)
    const [viewCompleteToDos, viewCompleteToDosSet] = useState(false)
    const textAreaRefs = useRef<HTMLTextAreaElement[]>([])
    const [selectedMessagesToDelete, selectedMessagesToDeleteSet] = useState<{ [key: string]: boolean }>({})


    const fullScreenStyles = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100svh",
        zIndex: 1,
        backgroundColor: "rgb(var(--backgroundColor))",
        padding: "1rem",
        overflowY: "scroll"
    } as React.CSSProperties

    const handleSave = () => {
        if (options === "new") {
            toDosGlobalSet(prevToDos => {
                return prevToDos ? [...prevToDos, toDo] : [toDo]
            })
        }

        if (options === "update") {
            toDosGlobalSet(prevToDos => {
                if (prevToDos) {
                    console.log(`$running update`);
                    const newToDos = prevToDos.map(eachToDo => {
                        if (eachToDo.id === toDo.id) {
                            return toDo
                        } else {
                            return eachToDo
                        }
                    })

                    console.log(`$new`, newToDos);
                    return newToDos
                }


                return [toDo]
            })
        }

        makingNewToDoSet && makingNewToDoSet(false)
        toDoToEditSet && toDoToEditSet(undefined)
    }

    const addTextAreaRef = (ref: HTMLTextAreaElement) => {
        if (!textAreaRefs.current.includes(ref)) {
            textAreaRefs.current = [...textAreaRefs.current, ref];
        }
    }

    const toggleComplete = (messageId: string) => {
        toDosGlobalSet(prevToDos => {
            if (!prevToDos) return prevToDos

            return prevToDos.map(eachToDo => {
                if (eachToDo.id === passedToDo!.id) {
                    eachToDo.messages = eachToDo.messages.map(eachMessage => {
                        if (eachMessage.id === messageId) {
                            eachMessage.complete = !eachMessage.complete
                            return eachMessage
                        } else {
                            return eachMessage
                        }
                    })
                    return eachToDo
                } else {
                    return eachToDo
                }
            })
        })
    }

    //resize textareas on mount
    useEffect(() => {
        textAreaRefs.current.forEach((eachRef) => {
            eachRef.style.height = eachRef.scrollHeight + 'px';
        })
    }, [])

    return (
        <>
            {options === "final" ? (
                <div className={styles.mainCont} style={{ ...(fullScreen ? fullScreenStyles : {}) }}
                    onClick={() => {
                        fullScreenSet(true)
                    }}>
                    {fullScreen && <button className={styles.utilityButton} style={{ justifySelf: "flex-start" }} onClick={(e) => { e.stopPropagation(); fullScreenSet(false) }}>Close</button>}

                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", fontSize: "var(--smallFontSize)" }}>
                        <p>{new Date(passedToDo!.dateCreated).toLocaleDateString()}</p>
                        <p>{new Date(passedToDo!.dateCreated).toLocaleTimeString("en-us", {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</p>
                    </div>

                    <h1>{passedToDo!.title}</h1>

                    {passedToDo!.messages.filter(each => !each.complete).length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {passedToDo!.messages.filter(each => !each.complete).map((eachToDoMessageObj, eachToDoMessageObjIndex) => {
                                return (
                                    <div className={styles.scaleBounce} key={eachToDoMessageObj.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: ".5rem" }}>
                                        <div onClick={async (e) => {
                                            e.stopPropagation()

                                            const parentEl = (e.target as HTMLDivElement).parentElement!
                                            parentEl.style.animationPlayState = "running"

                                            await wait()
                                            toggleComplete(eachToDoMessageObj.id)
                                        }} style={{ aspectRatio: "1/1", width: "1rem", backgroundColor: eachToDoMessageObj.complete ? "green" : "yellowgreen" }}></div>

                                        <p style={{ opacity: !eachToDoMessageObj.text ? .5 : "" }}>{eachToDoMessageObj.text ? eachToDoMessageObj.text : `${greetingsList[eachToDoMessageObjIndex % greetingsList.length].text} ${greetingsList[eachToDoMessageObjIndex % greetingsList.length].author && `- ${greetingsList[eachToDoMessageObjIndex % greetingsList.length].author}`}`}</p>
                                    </div>
                                )
                            })}
                        </div>
                    )}


                    {passedToDo!.messages.filter(eachMessage => eachMessage.complete).length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", cursor: "pointer" }}
                            onClick={(e) => {
                                e.stopPropagation(); viewCompleteToDosSet(prev => !prev)
                            }}>
                            <svg style={{ rotate: !viewCompleteToDos ? "180deg" : "", transition: "rotate 600ms" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" /></svg>

                            <p>{viewCompleteToDos ? "hide" : "complete"}</p>
                        </div>
                    )}

                    {viewCompleteToDos && passedToDo!.messages.filter(eachMessage => eachMessage.complete).length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {passedToDo!.messages.filter(eachMessage => eachMessage.complete).map(eachToDoMessageObj => {
                                return (
                                    <div key={eachToDoMessageObj.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: ".5rem" }}>
                                        <div onClick={(e) => {
                                            e.stopPropagation()
                                            toggleComplete(eachToDoMessageObj.id)

                                        }} style={{ aspectRatio: "1/1", width: "1rem", backgroundColor: eachToDoMessageObj.complete ? "green" : "yellowgreen" }}></div>

                                        <p>{eachToDoMessageObj.text}</p>
                                    </div>
                                )
                            })}
                        </div>
                    )}


                    {passedToDo!.videos.length > 0 && (
                        <div style={{ display: "grid", gridAutoFlow: "column", height: "300px", gridAutoColumns: "min(300px, 100%)", overflowX: "auto", gap: "1rem", justifyItems: "center" }}>
                            {passedToDo!.videos.map(eachVideo => {
                                return (
                                    <DisplayToDoVideo key={eachVideo.id} id={eachVideo.url} />
                                )
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.mainCont} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100svh", zIndex: 1, backgroundColor: "rgb(var(--backgroundColor))", overflowY: "scroll" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button className={styles.utilityButton} style={{ justifySelf: "flex-start" }} onClick={handleSave}>Save</button>
                        <button className={styles.utilityButton} style={{ justifySelf: "flex-start" }} onClick={() => {

                            makingNewToDoSet && makingNewToDoSet(false)
                            toDoToEditSet && toDoToEditSet(undefined)
                        }}>Cancel</button>
                    </div>

                    <input type='text' value={toDo.title} placeholder='Title...'
                        onChange={(e) => {
                            toDoSet(prevObj => {
                                const newObj = { ...prevObj }
                                newObj.title = e.target.value

                                return newObj
                            })
                        }} />

                    <button className={styles.utilityButton} style={{ justifySelf: "flex-start" }}
                        onClick={() => {
                            toDoSet(prevObj => {
                                const newObj = { ...prevObj }
                                newObj.videos = [...newObj.videos, { id: uuidv4(), url: "" }]
                                return newObj
                            })
                        }}>Add video</button>

                    {toDo.videos.length > 0 && (
                        <div style={{ display: "grid", gridAutoFlow: "column", height: "300px", gridAutoColumns: "min(300px, 100%)", overflowX: "auto", gap: "1rem", justifyItems: "center" }}>
                            {toDo.videos.map((eachVideo, eachVideoIndex) => {
                                return (
                                    <div key={eachVideo.id} style={{ display: "grid", gridTemplateRows: "auto auto 1fr" }}>
                                        <button className={styles.utilityButton} style={{ justifySelf: "flex-start" }} onClick={() => {
                                            toDoSet(prevObj => {
                                                const newObj = { ...prevObj }
                                                newObj.videos = newObj.videos.filter(eachVideoObj => eachVideoObj.id !== eachVideo.id)
                                                return newObj
                                            })
                                        }}>close</button>
                                        <input style={{ width: "100%" }} type='text' value={eachVideo.url} placeholder='Url...'
                                            onChange={(e) => {
                                                toDoSet(prevObj => {
                                                    const newObj = { ...prevObj }
                                                    newObj.videos[eachVideoIndex].url = e.target.value
                                                    console.log(`$newObj`, newObj.videos);
                                                    return newObj
                                                })
                                            }} />

                                        <DisplayToDoVideo id={eachVideo.url} />
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", cursor: "pointer" }}
                            onClick={() => {
                                toDoSet(prevObj => {
                                    const newObj = { ...prevObj }
                                    newObj.messages = [...newObj.messages, { id: uuidv4(), text: "", complete: false }]
                                    return newObj
                                })
                            }}>
                            <svg style={{ width: "2.5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" /></svg>

                            <p>Add Message</p>
                        </div>

                        {Object.keys(selectedMessagesToDelete).length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", cursor: "pointer", gap: ".5rem" }}
                                onClick={() => {
                                    if (Object.keys(selectedMessagesToDelete).length === toDo.messages.length) {
                                        selectedMessagesToDeleteSet({})
                                    } else {
                                        selectedMessagesToDeleteSet(prevMessagesObj => {
                                            const newMessagesObj = { ...prevMessagesObj }

                                            toDo.messages.forEach(eachMessage => {
                                                newMessagesObj[eachMessage.id] = true
                                            })

                                            return newMessagesObj
                                        })
                                    }
                                }}>
                                {Object.keys(selectedMessagesToDelete).length === toDo.messages.length ? (
                                    <svg style={{ width: "2rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M32 119.4C12.9 108.4 0 87.7 0 64C0 28.7 28.7 0 64 0c23.7 0 44.4 12.9 55.4 32H328.6C339.6 12.9 360.3 0 384 0c35.3 0 64 28.7 64 64c0 23.7-12.9 44.4-32 55.4V232.6c19.1 11.1 32 31.7 32 55.4c0 35.3-28.7 64-64 64c-23.7 0-44.4-12.9-55.4-32H119.4c-11.1 19.1-31.7 32-55.4 32c-35.3 0-64-28.7-64-64c0-23.7 12.9-44.4 32-55.4V119.4zM119.4 96c-5.6 9.7-13.7 17.8-23.4 23.4V232.6c9.7 5.6 17.8 13.7 23.4 23.4H328.6c5.6-9.7 13.7-17.8 23.4-23.4V119.4c-9.7-5.6-17.8-13.7-23.4-23.4H119.4zm192 384c-11.1 19.1-31.7 32-55.4 32c-35.3 0-64-28.7-64-64c0-23.7 12.9-44.4 32-55.4V352h64v40.6c9.7 5.6 17.8 13.7 23.4 23.4H520.6c5.6-9.7 13.7-17.8 23.4-23.4V279.4c-9.7-5.6-17.8-13.7-23.4-23.4h-46c-5.4-15.4-14.6-28.9-26.5-39.6V192h72.6c11.1-19.1 31.7-32 55.4-32c35.3 0 64 28.7 64 64c0 23.7-12.9 44.4-32 55.4V392.6c19.1 11.1 32 31.7 32 55.4c0 35.3-28.7 64-64 64c-23.7 0-44.4-12.9-55.4-32H311.4z" /></svg>
                                ) : (
                                    <svg style={{ width: "2rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M32 119.4C12.9 108.4 0 87.7 0 64C0 28.7 28.7 0 64 0c23.7 0 44.4 12.9 55.4 32H456.6C467.6 12.9 488.3 0 512 0c35.3 0 64 28.7 64 64c0 23.7-12.9 44.4-32 55.4V392.6c19.1 11.1 32 31.7 32 55.4c0 35.3-28.7 64-64 64c-23.7 0-44.4-12.9-55.4-32H119.4c-11.1 19.1-31.7 32-55.4 32c-35.3 0-64-28.7-64-64c0-23.7 12.9-44.4 32-55.4V119.4zM456.6 96H119.4c-5.6 9.7-13.7 17.8-23.4 23.4V392.6c9.7 5.6 17.8 13.7 23.4 23.4H456.6c5.6-9.7 13.7-17.8 23.4-23.4V119.4c-9.7-5.6-17.8-13.7-23.4-23.4zM128 160c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v96c0 17.7-14.3 32-32 32H160c-17.7 0-32-14.3-32-32V160zM256 320h32c35.3 0 64-28.7 64-64V224h64c17.7 0 32 14.3 32 32v96c0 17.7-14.3 32-32 32H288c-17.7 0-32-14.3-32-32V320z" /></svg>
                                )}

                                <p>{Object.keys(selectedMessagesToDelete).length === toDo.messages.length ? "Deselect All" : "Select All"}</p>
                            </div>
                        )}

                        <div style={{ opacity: Object.keys(selectedMessagesToDelete).length > 0 ? 1 : 0, marginLeft: "auto" }}
                            onClick={(e) => {
                                toDoSet(prevToDo => {
                                    const idsToDelete = Object.keys(selectedMessagesToDelete)
                                    prevToDo.messages = prevToDo.messages.filter(eachMessage => !idsToDelete.includes(eachMessage.id))
                                    return { ...prevToDo }
                                })

                                selectedMessagesToDeleteSet({})
                            }}>
                            <svg style={{ width: "1.5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" /></svg>
                        </div>
                    </div>

                    {toDo.messages.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {toDo.messages.map((eachToDoMessageObj, eachToDoMessageObjIndex) => {
                                return (
                                    <div key={eachToDoMessageObj.id} style={{ display: "flex", gap: ".5rem", alignItems: "flex-start" }}>
                                        <div style={{ aspectRatio: "1/1", width: "1rem", backgroundColor: Object.keys(selectedMessagesToDelete).find(eachKey => eachToDoMessageObj.id === eachKey) ? "green" : "yellowgreen" }}
                                            onClick={() => {
                                                selectedMessagesToDeleteSet(prevMessagesObj => {
                                                    const newMessagesObj = { ...prevMessagesObj }
                                                    if (newMessagesObj[eachToDoMessageObj.id]) {
                                                        delete newMessagesObj[eachToDoMessageObj.id]
                                                    } else {
                                                        newMessagesObj[eachToDoMessageObj.id] = true
                                                    }

                                                    return newMessagesObj
                                                })
                                            }}
                                        ></div>

                                        <textarea ref={addTextAreaRef} style={{ flex: "1 1 auto", backgroundColor: "#fff", color: "#000", padding: "1rem", resize: "none", overflow: "hidden" }} value={eachToDoMessageObj.text}
                                            placeholder={`${greetingsList[eachToDoMessageObjIndex % greetingsList.length].text} ${greetingsList[eachToDoMessageObjIndex % greetingsList.length].author && `- ${greetingsList[eachToDoMessageObjIndex % greetingsList.length].author}`}`}
                                            onChange={(e) => {
                                                const textAreaEl = e.target
                                                textAreaEl.style.height = `${textAreaEl.scrollHeight}px`

                                                toDoSet(prevObj => {
                                                    const newObj = { ...prevObj }
                                                    newObj.messages[eachToDoMessageObjIndex].text = e.target.value
                                                    return newObj
                                                })
                                            }} />
                                    </div>

                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

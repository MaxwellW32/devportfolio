"use client"
import { useEffect, useState } from "react"
import DisplayToDo from "./DisplayToDo"
import { retreiveFromLocalStorage, saveToLocalStorage } from "@/utility/saveToStorage"
import { globalToDos, toDo } from './globalToDos'
import { useAtom } from "jotai"
import styles from "./page.module.css"
import greetings from "./greetings.json"

export default function Page() {
	const [toDos, toDosSet] = useAtom(globalToDos)
	const [makingNewToDo, makingNewToDoSet] = useState(false)
	const [toDoToEdit, toDoToEditSet] = useState<toDo>()
	const [selectedToDos, selectedToDosSet] = useState<{ [key: string]: boolean }>({})

	//get toDos from storage
	useEffect(() => {
		const seenToDos = retreiveFromLocalStorage("todos")
		if (seenToDos !== null) {
			toDosSet(seenToDos)
		}
	}, [])


	//save changes to local storage
	useEffect(() => {
		if (toDos !== undefined) {
			saveToLocalStorage("todos", toDos)
		}
	}, [toDos])

	return (
		<main style={{ display: "grid", padding: "1rem" }}>
			<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: "1rem", alignItems: "center" }}>
				{Object.keys(selectedToDos).length > 0 && (
					<div onClick={() => {
						toDosSet(prevTodos => {
							if (!prevTodos) return prevTodos

							const toDoIdArr = Object.keys(selectedToDos)

							const newToDos = prevTodos.filter(eachToDo => !toDoIdArr.includes(eachToDo.id))
							return newToDos
						})
					}}>
						<svg style={{ width: "2rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" /></svg>
					</div>
				)}

				<div style={{ justifySelf: "flex-end" }} onClick={() => { makingNewToDoSet(true) }}>
					<svg style={{ width: "2.5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" /></svg>
				</div>
			</div>

			{makingNewToDo && (
				<DisplayToDo makingNewToDoSet={makingNewToDoSet} options="new" greetingsList={greetings} />
			)}

			{toDoToEdit && (
				<DisplayToDo passedToDo={toDoToEdit} toDoToEditSet={toDoToEditSet} options="update" greetingsList={greetings} />
			)}

			<div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-start" }}>
				{toDos?.map((eachToDo, eachToDoIndex) => {
					return (
						<div key={eachToDo.id} style={{ flex: "0 0 300px", maxHeight: "80vh", display: "grid", gridTemplateRows: "3rem 1fr", border: "3px solid transparent", borderImage: "linear-gradient(to bottom right, #f06, #00f) 1", overflowX: "hidden" }}>
							<div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: ".5rem", backgroundColor: selectedToDos[eachToDo.id] ? "orange" : "rgba(0,0,0,20%)", cursor: "pointer" }}
								onClick={() => {
									selectedToDosSet(prevTodos => {
										const newToDos = { ...prevTodos }

										if (newToDos[eachToDo.id]) {
											delete newToDos[eachToDo.id]
										} else {
											newToDos[eachToDo.id] = true
										}
										return newToDos
									})
								}}>
								<div onClick={(e) => { e.stopPropagation(); toDoToEditSet(eachToDo) }}>
									<svg style={{ width: "1.5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z" /></svg>
								</div>
							</div>

							<DisplayToDo passedToDo={eachToDo} options="final" greetingsList={greetings.slice(eachToDoIndex, eachToDoIndex + 32)} />
						</div>
					)
				})}
			</div>
		</main>
	)
}

"use client"
import styles from "./page.module.css"

import React, { use, useCallback, useEffect, useRef } from "react";
import ToDoContext, { ToDoInfoContext, initialToDoState, todoInterface } from "./ToDoContext";
import { useContext, useMemo, useState } from "react";
import greetingsData from "./greetings.json";
import YoutubeUrlParse from "@/useful/YoutubeUrlParse";

function MyYoutubeCont(props: { videoId: string }) {
	const { videoId } = props

	return (
		<iframe
			className={styles.myVidIframe}
			style={{
				width: "100%",
				aspectRatio: "16/9",
			}}
			src={`https://www.youtube.com/embed/${videoId}`}
			title="YouTube video player"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowFullScreen></iframe>
	);
}

interface toDoSingleProps {
	eachToDoObj?: todoInterface,
	defaultFullScreen?: boolean,
	brandNew?: boolean,
	greetStarterVal: number
}

const ToDoSingleView: React.FC<toDoSingleProps> = ({ eachToDoObj = initialToDoState, defaultFullScreen = false, brandNew = false, greetStarterVal }) => {

	const [isBrandNewToDo, setIsBrandNewToDo] = useState(brandNew);
	const [showFullScreen, setShowFullScreen] = useState(defaultFullScreen);
	const [singleToDo, setSingleToDo] = useState(eachToDoObj);
	const { todos, manageTodos } = useContext(ToDoInfoContext);
	const [aMessageIsChecked, setAMessageIsChecked] = useState(false);
	const [allMsgsSelected, setAllMsgsSelected] = useState(false);

	function makeFullScreen() {
		setShowFullScreen(true);
	}

	function hideFullScreen() {
		2
		setShowFullScreen(false);
	}

	function makeDate() {
		let newDate = new Date()
		let dateStr = newDate.toLocaleDateString('en-GB')
		let timeStr = newDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

		return [dateStr, timeStr]
	}

	function saveToDo() {
		//save new
		manageTodos("add", { ...singleToDo, toDoId: generateRandomId(), toDoDateCreated: makeDate() });
	}

	function updateToDo() {
		//update
		manageTodos("update", { ...singleToDo });
	}

	const bigDisplay = {
		width: "100%",
		height: "100vh",
		zIndex: "10",
	};

	const smallDisplay = {
		position: "relative",
		maxHeight: "500px",
		borderRadius: "1rem",
	};

	const ytUrlRef = useRef<HTMLInputElement>(null!);

	function addNewVideo() {
		if (ytUrlRef.current.value !== "") {
			//make sure field not empty
			let videoId = YoutubeUrlParse(ytUrlRef.current.value);
			//append value

			if (videoId) {


				setSingleToDo(prevSingleToDoInfo => {
					return {
						...prevSingleToDoInfo,
						toDoVideos: [
							...prevSingleToDoInfo.toDoVideos,
							{
								uniqueId: generateRandomId(),
								vidUrl: videoId,
							},
						],
					};
				});

				ytUrlRef.current.value = ""
			}

		}
	}

	function generateRandomId() {
		let short = new Date();
		let rnd = Math.floor(Math.random() * 9999);
		let longId = short.toLocaleDateString() + short.toLocaleTimeString() + rnd;
		return longId;
	}

	function addMessageToArray() {
		setSingleToDo(prevSingleToDoInfo => {
			return {
				...prevSingleToDoInfo,
				toDoMessages: [
					...prevSingleToDoInfo.toDoMessages,
					{
						uniqueMsgId: generateRandomId(),
						msgText: "",
					},
				],
			};
		});
	}

	function deleteSelectedMessages() {
		//detele specific messages
		let msgIdsToDelete: string[] = [];

		singleToDo.toDoMessages.forEach(eachMsgObj => {
			let myMsg = document.getElementById(`cb${eachMsgObj.uniqueMsgId}`) as HTMLInputElement;
			if (myMsg.checked) {
				msgIdsToDelete.push(eachMsgObj.uniqueMsgId);
			}
		});

		setSingleToDo(prevSingleToDoInfo => {
			return {
				...prevSingleToDoInfo,
				toDoMessages: prevSingleToDoInfo.toDoMessages.filter(eachToDoObj => {
					let shouldDelete = false;

					msgIdsToDelete.forEach(eachIdToDelete => {
						if (eachToDoObj.uniqueMsgId === eachIdToDelete) {
							shouldDelete = true;
						}
					});

					return !shouldDelete;
				}),
			};
		});

		if (allMsgsSelected) {
			setAMessageIsChecked(false)
		}
	}

	function checkIfAnyClicked() {
		let aMsgIsChecked = false;

		singleToDo.toDoMessages.forEach(eachMsgObj => {
			let myMsg = document.getElementById(`cb${eachMsgObj.uniqueMsgId}`) as HTMLInputElement;
			if (myMsg.checked) {
				aMsgIsChecked = true;
			}
		});

		setAMessageIsChecked(aMsgIsChecked);
	}

	function removeVideo(id: string) {
		setSingleToDo(prevSingleToDoInfo => {
			return {
				...prevSingleToDoInfo,
				toDoVideos: prevSingleToDoInfo.toDoVideos.filter(eachVideoObj => {
					if (eachVideoObj.uniqueId === id) {
						return false;
					} else {
						return true;
					}
				}),
			};
		});
	}

	function selectAllMessages() {
		//cb${eachMessageObj.uniqueMsgId}
		singleToDo.toDoMessages.forEach(eachMsgObj => {
			const msg = document.getElementById(`cb${eachMsgObj.uniqueMsgId}`) as HTMLInputElement
			msg.checked = true;
		})
	}

	return (
		<div
			style={showFullScreen ? bigDisplay as React.CSSProperties : smallDisplay as React.CSSProperties}
			className={styles.singularToDo}
			onClick={makeFullScreen}>

			{singleToDo.toDoId !== "" && (
				<div className={styles.toDoDateTime}>
					<p>{singleToDo.toDoDateCreated[0] && singleToDo.toDoDateCreated[0]}</p>
					<p>{singleToDo.toDoDateCreated[1] && singleToDo.toDoDateCreated[1]}</p>
				</div>
			)}

			{showFullScreen && (
				<div className={styles.toDoSettingBar}>
					<svg
						className={styles.toDoSaveUpdateSvg}
						onClick={e => {
							if (isBrandNewToDo) {
								saveToDo();
								hideFullScreen();
								e.stopPropagation();
							} else {
								updateToDo();
								hideFullScreen();
								e.stopPropagation();
							}
						}}
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 448 512">
						<path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zM329 305c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-95 95-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L329 305z" />
					</svg>
				</div>
			)}

			<br />
			<div className={styles.toDoTitleInputCont}>
				<span></span>
				<input
					className={styles.toDoTitleInput}
					placeholder="Enter your Title: "
					type="text"
					value={singleToDo.toDoTitle}
					onChange={e => {
						setSingleToDo(prevSingleToDoInfo => {
							return {
								...prevSingleToDoInfo,
								toDoTitle: e.target.value,
							};
						});
					}}
				/>
			</div>
			<br />

			{showFullScreen && (
				<div className={styles.toDovideoPlace}>
					<div className={styles.toDoVidsCont}>

						{singleToDo.toDoVideos &&
							singleToDo.toDoVideos.map(eachVidObj => {
								return (
									<div key={eachVidObj.uniqueId} className={styles.toDoSvgYtCont}>
										<svg
											onClick={() => {
												removeVideo(eachVidObj.uniqueId);
											}}
											className={styles.vidsContClose}
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 512 512">
											<path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM184 232H328c13.3 0 24 10.7 24 24s-10.7 24-24 24H184c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
										</svg>
										<MyYoutubeCont
											videoId={eachVidObj.vidUrl}
											key={eachVidObj.uniqueId}
										/>
									</div>
								);
							})}
					</div>
					<div className={styles.todoVideoInputBttnCont}>
						<input
							className={styles.toDoYtUrlInput}
							placeholder="Enter a youtube Url"
							type="text"
							ref={ytUrlRef}
						/>
						<button className={styles.mainBttn} onClick={addNewVideo}>
							Add Videos
						</button>
					</div>
				</div>
			)}

			<div
				style={{ margin: showFullScreen ? "1rem" : "-2rem 0rem .5rem 0rem", opacity: aMessageIsChecked ? "1" : "0" }}
				className={styles.msgMiniSettingsCont}>
				<svg
					onClick={e => {
						deleteSelectedMessages();
						setAllMsgsSelected(false)

						e.stopPropagation();
					}}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 448 512">
					<path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
				</svg>
				<svg
					onClick={e => {
						setAllMsgsSelected(true)
						selectAllMessages();
						e.stopPropagation();
					}}
					xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M32 119.4C12.9 108.4 0 87.7 0 64C0 28.7 28.7 0 64 0c23.7 0 44.4 12.9 55.4 32H328.6C339.6 12.9 360.3 0 384 0c35.3 0 64 28.7 64 64c0 23.7-12.9 44.4-32 55.4V232.6c19.1 11.1 32 31.7 32 55.4c0 35.3-28.7 64-64 64c-23.7 0-44.4-12.9-55.4-32H119.4c-11.1 19.1-31.7 32-55.4 32c-35.3 0-64-28.7-64-64c0-23.7 12.9-44.4 32-55.4V119.4zM119.4 96c-5.6 9.7-13.7 17.8-23.4 23.4V232.6c9.7 5.6 17.8 13.7 23.4 23.4H328.6c5.6-9.7 13.7-17.8 23.4-23.4V119.4c-9.7-5.6-17.8-13.7-23.4-23.4H119.4zm192 384c-11.1 19.1-31.7 32-55.4 32c-35.3 0-64-28.7-64-64c0-23.7 12.9-44.4 32-55.4V352h64v40.6c9.7 5.6 17.8 13.7 23.4 23.4H520.6c5.6-9.7 13.7-17.8 23.4-23.4V279.4c-9.7-5.6-17.8-13.7-23.4-23.4h-46c-5.4-15.4-14.6-28.9-26.5-39.6V192h72.6c11.1-19.1 31.7-32 55.4-32c35.3 0 64 28.7 64 64c0 23.7-12.9 44.4-32 55.4V392.6c19.1 11.1 32 31.7 32 55.4c0 35.3-28.7 64-64 64c-23.7 0-44.4-12.9-55.4-32H311.4z" /></svg>
			</div>

			<div className={styles.toDoAllMessagesCont}>
				{/* <p>indiv seen as {JSON.stringify(singleToDo)}</p> */}
				{singleToDo.toDoMessages &&
					singleToDo.toDoMessages.map((eachMessageObj, index) => {
						return (
							<div
								key={eachMessageObj.uniqueMsgId}
								className={styles.toDoSingleMessStrip}>
								<input
									id={`cb${eachMessageObj.uniqueMsgId}`}
									className={styles.toDoMessageCheckbox}
									type="checkbox"
									onClick={e => {
										checkIfAnyClicked();
										e.stopPropagation();
									}}
								/>
								<textarea
									rows={1}
									wrap="soft"
									id={"myTA" + eachMessageObj.uniqueMsgId}
									className={styles.toDoMessageInput}
									value={eachMessageObj.msgText}
									onInput={e => {
										//grow text area
										const myTA = document.getElementById(
											`myTA${eachMessageObj.uniqueMsgId}`
										) as HTMLTextAreaElement;

										myTA.style.height = "auto";
										myTA.style.height = myTA.scrollHeight + "px";

										//find its unique message id from the array
										//only update that spot

										setSingleToDo(prevSingleToDoInfo => {
											return {
												...prevSingleToDoInfo,
												toDoMessages: prevSingleToDoInfo.toDoMessages.map(
													eachMObj => {
														//return eachMObj or return an updated version
														//whther or not the id matches whats in this array

														if (eachMObj.uniqueMsgId === eachMessageObj.uniqueMsgId) {
															return { ...eachMObj, msgText: myTA.value };
														}
														return eachMObj;
													}
												),
											};
										});
									}}
									placeholder={greetingsData[((greetStarterVal + index) - 1 + greetingsData.length) % greetingsData.length].text}
								/>
							</div>
						);
					})}
			</div>

			{showFullScreen && (
				<button
					onClick={addMessageToArray}
					className={styles.toDoAddMoreMessages}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" /></svg>
				</button>
			)}
		</div>
	);
}




let greetStarterVal = -20;


function ToDoList() {

	interface todoselstate {
		[key: string]: boolean
	}
	//see all todos
	const { todos, manageTodos } = useContext(ToDoInfoContext);
	const [addNewTodoShowing, setAddNewTodoShowing] = useState(false);
	const [lastToLength, setLastToLength] = useState(todos.length);
	const [todosSelectedState, setTodosSelectedState] = useState<todoselstate>()

	//keep selecObj same size as todos
	useEffect(() => {
		handleSelectedState("changeAmount")
	}, [todos.length])

	function handleSelectedState(option: string, id: undefined | string = undefined) {
		//and changeState
		if (option === "changeAmount") {
			setTodosSelectedState(() => {
				let newSelObj: todoselstate = {}

				todos.map((eachToDo) => {
					newSelObj[eachToDo.toDoId] = false
				})

				return newSelObj
			})
		} else if (option === "changeState") {
			//update state based on id
			setTodosSelectedState((prevSelectedState) => {

				return { ...prevSelectedState, [id as string]: !prevSelectedState![id as string] }
			})
		}
	}


	//maybe a variable that holds all the todoids, and whether they are selected - active

	//when you click it becomes selected
	//when you click again its no longer selected
	//delete button deletes all selected 
	//hi
	function handleNewToDoShowing() {
		setAddNewTodoShowing(true);
	}

	useEffect(() => {
		//handle new todosubmit, hide the form

		if (todos.length > lastToLength) {
			// if length has changed
			setAddNewTodoShowing(false);
			setLastToLength(todos.length);
		}

		if (todos.length === 0) {
			setLastToLength(0);
		}
	}, [todos]);


	function clearAllSelected() {
		//send array of selected objects to the managetodo
		let trueOnly = [];

		for (const key in todosSelectedState) {
			if (todosSelectedState[key]) {
				trueOnly.push(key);
			}
		}
		manageTodos("deleteSelectedToDo", trueOnly);
	}

	const isAnyOn = () => {
		let trueOnly = 0;

		for (const key in todosSelectedState) {
			if (todosSelectedState[key]) {
				trueOnly++
				break
			}
		}

		return trueOnly > 0
	}

	return (
		<div id="mainToDoDiv" className={styles.mainToDoDiv}>
			<div className={styles.toDoMainSettingCont}>
				<svg onClick={clearAllSelected} style={{ fill: isAnyOn() ? "rgb(var(--mainColor))" : "rgb(var(--blackSwitch))" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
					<path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
				</svg>
			</div>

			<div id="toDoListCont" className={styles.toDoListCont}>
				{todos.map((eachToDoObj) => {
					greetStarterVal += 20;
					return (
						<div key={eachToDoObj.toDoId}>
							<div className={styles.toDoTriangleSel}
								onClick={() => {
									handleSelectedState("changeState", eachToDoObj.toDoId)
								}}


								style={{
									borderBottom: todosSelectedState![eachToDoObj.toDoId]
										? "87px solid rgb(var(--mainColor))"
										: "87px solid rgb(var(--blackSwitch))"
								}}
							>
							</div>

							<ToDoSingleView
								greetStarterVal={greetStarterVal}
								eachToDoObj={eachToDoObj}
							/>
						</div>
					);
				})}
			</div>

			{addNewTodoShowing && (
				<ToDoSingleView defaultFullScreen={true} brandNew={true} greetStarterVal={Math.floor(Math.random() * greetingsData.length)} />
			)}
			<button className={styles.newToDoBttn} onClick={handleNewToDoShowing}>
				<svg className={styles.newToDoBttnSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
					<path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
				</svg>
			</button>
		</div>
	);
}

export default function Page() {
	//give the to do array context data to all children
	return (
		<ToDoContext>
			<ToDoList />
		</ToDoContext>
	);
}


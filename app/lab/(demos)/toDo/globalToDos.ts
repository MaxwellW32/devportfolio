import { atom } from 'jotai'

export type greeting = {
    text: string,
    author: string | null
}
export type toDo = {
    id: string,
    title: string,
    messages: { id: string, text: string, complete: boolean }[],
    videos: { id: string, url: string }[],
    dateCreated: Date,
}

export const globalToDos = atom<toDo[] | undefined>(undefined)
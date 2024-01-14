export function saveToLocalStorage<T>(keyName: string, item: T) {
    localStorage.setItem(keyName, JSON.stringify(item));
}

export function retreiveFromLocalStorage<T>(keyName: string): T | null {
    const initialkeyItem = localStorage.getItem(keyName);

    if (initialkeyItem === null) return null

    return JSON.parse(initialkeyItem);
}




export function removeFromLocalStorage(keyName: string) {
    localStorage.removeItem(keyName);
}


export function isInObj<T extends Record<string, any>>(obj: T, searchKey: string): keyof T | undefined {
    const foundKey = Object.keys(obj).find(eachKey => eachKey === searchKey) as keyof T | undefined;
    return foundKey
}
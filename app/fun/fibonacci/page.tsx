"use client"
import HideNav from '@/components/hideNav/HideNav'
import wait from '@/useful/wait'
import React, { useEffect, useState } from 'react'

export default function Page() {
    //0,1,1,2,3,5,8,13
    //you are given two numbers in an array
    //add them together to get the third number, add that to the array
    //return that awaay and add the two last items in that array repeat
    const [values, valuesSet] = useState<number[]>([])

    const fib = async (numArray: number[], accumulator = 1): Promise<number[]> => {
        let newTotal = numArray[numArray.length - 2] + numArray[numArray.length - 1];
        numArray.push(newTotal);

        await wait(1000);

        if (newTotal === Infinity) {
            return fib([accumulator - 1, accumulator], accumulator + 1);
        }

        if (numArray.length > 200) {
            numArray = [numArray[numArray.length - 2], numArray[numArray.length - 1]];
            await wait(1);
            return fib(numArray, accumulator);
        }

        console.log(`newTotal`, newTotal);
        return fib(numArray, accumulator);
    };

    useEffect(() => {
        const time = setTimeout(() => {
            fib([0, 1])
        }, 1000);

        return () => clearTimeout(time)
    }, [])


    //one shows how division looks
    //one shows how add looks
    //one shows how multi looks
    //one shows how sub looks

    return (
        <HideNav>
        </HideNav>
    )
}

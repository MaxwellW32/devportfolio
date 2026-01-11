"use client"
import styles from "./page.module.css"
import React, { useState, useEffect } from "react";
import parrot from "@/public/projects/dictionary/parrot.json";
import Lottie from "lottie-react";
import { toast } from "react-hot-toast";

export default function Page() {
    interface Word {
        word: string;
        meanings: {
            definitions: {
                definition: string;
            }[];
        }[];
    }

    const [word, setWord] = useState("");
    const [topValue, setTopValue] = useState(Math.floor(Math.random() * 100));
    const [foundWord, setFoundWord] = useState<Word[]>([]);

    //control parrots
    useEffect(() => {
        const interval = setInterval(() => {
            setTopValue(Math.floor(Math.random() * 100));
        }, 4000);

        return () => clearInterval(interval);
    }, []);


    const findNewWord = () => {
        if (word === "") return

        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
            .then((Response) => Response.json())
            .then((foundWord) => {
                setFoundWord(foundWord);
            }).catch(err => {
                toast.error("Error seen, please try again")
                console.log(`$err`, err);
            })
    }


    return (
        <main className={styles.dictionaryMain}>
            <section className={styles.topSection}>
                <h2 style={{ textDecoration: "line-through" }}>Oxford</h2>

                <h1>Maxwell&apos;s dictionary</h1>

                <div className={styles.dicInputCont}>
                    <input
                        value={word}
                        onChange={(e) => { setWord(e.target.value) }}
                        placeholder="Search..."
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                findNewWord()
                            }
                        }}
                    ></input>

                    <button onClick={findNewWord}>Search</button>
                </div>
            </section>

            {foundWord[0] && (
                <section>
                    <div className={styles.midContainer}>
                        <p className={styles.showSearch}>You searched for{" "}
                            <span className={styles.dictionaryFoundWord}>{foundWord[0].word}</span>
                        </p>

                        <div className={styles.meaningsCont}>
                            {foundWord[0].meanings.map((meaning, incr) => {
                                return <p key={incr}>{meaning.definitions[0].definition}</p>;
                            })}
                        </div>
                    </div>
                </section>
            )}

            <div style={{ top: `${topValue}%` }} className={styles.moveParrot}>
                <Lottie animationData={parrot} />
            </div>

            <div style={{ animationDelay: "12s", top: `${topValue + Math.floor(Math.random() * 100)}%`, }} className={`${styles.moveParrot} ${styles.blue}`}>
                <Lottie animationData={parrot} />
            </div>
        </main>
    );
}

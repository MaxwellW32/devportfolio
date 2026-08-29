"use client"
import styles from "./page.module.css"
import React, { useState, useEffect } from "react";
import parrot from "@/public/projects/dictionary/parrot.json";
import { Lottie } from "lottie-react";
import { toast } from "react-hot-toast";
import { getDefinition, type definitionEntry } from "./getDefinition";

export default function Page() {
    const [word, setWord] = useState("");
    const [foundWord, setFoundWord] = useState<definitionEntry[]>([]);
    const [searching, setSearching] = useState(false);

    // Both parrot heights start at a FIXED value and are only randomised after
    // mount. Seeding them with Math.random() made the server and client render
    // different markup, and the resulting hydration mismatch left the page's
    // event handlers unattached — which is why the search button did nothing.
    const [topValue, setTopValue] = useState(40);
    const [secondTop, setSecondTop] = useState(70);

    //control parrots
    useEffect(() => {
        const roll = () => {
            setTopValue(Math.floor(Math.random() * 100));
            setSecondTop(Math.floor(Math.random() * 100));
        };

        roll();
        const interval = setInterval(roll, 4000);

        return () => clearInterval(interval);
    }, []);


    const findNewWord = async () => {
        if (word.trim() === "" || searching) return

        setSearching(true)

        try {
            const result = await getDefinition(word)

            if (!result.ok) {
                setFoundWord([])
                toast.error(result.error)
                return
            }

            setFoundWord(result.entries)
        } finally {
            setSearching(false)
        }
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

                    <button onClick={findNewWord} disabled={searching}>{searching ? "…" : "Search"}</button>
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
                <Lottie src={parrot} loop autoplay />
            </div>

            <div style={{ animationDelay: "12s", top: `${secondTop}%` }} className={`${styles.moveParrot} ${styles.blue}`}>
                <Lottie src={parrot} loop autoplay />
            </div>
        </main>
    );
}

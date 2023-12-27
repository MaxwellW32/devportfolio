"use client"
import { toast } from "react-hot-toast";
import styles from "./page.module.css"
import CryptoJS from 'crypto-js';
import { useEffect, useRef, useState } from "react";
import { retreiveFromLocalStorage, saveToLocalStorage } from "@/utility/saveToStorage";

const generateRandomString = (length: number) => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }
    return randomString;
};

function Calcultor() {
    const [input, setInput] = useState("");
    const [result, setResult] = useState();
    const [pressedEnter, setPressedEnter] = useState(false);
    const isMathExpression = /^[\d()+\-*/%.]+$/.test(input);
    const endsWithOperator = /^[()+\-*/%.]+$/.test(input[input.length - 1])

    //chain on answer on enter press
    if (pressedEnter && endsWithOperator) {
        setInput(result + input[input.length - 1]);
        setPressedEnter(false)
    }

    const [showSecrets, showSecretsSet] = useState(false);
    const [secretKey, secretKeySet] = useState(generateRandomString(32));
    const [firstLogin, firstLoginSet] = useState(false)
    const [showValidationScreen, showValidationScreenSet] = useState(false)


    const passwordInput = useRef<HTMLInputElement>(null!)
    const secretKeyInput = useRef<HTMLInputElement>(null!)

    //map user input to actual values
    useEffect(() => {
        try {
            if (isMathExpression && !endsWithOperator) {
                setResult(eval(input))
            }
        } catch (error) {
        }
    }, [input])

    //check if first time using app
    useEffect(() => {
        const seenEncryptedPass = retreiveFromLocalStorage("pass")
        if (seenEncryptedPass === null) {
            firstLoginSet(true)
        }
    }, [])

    //check input for trigger  
    useEffect(() => {
        if (!input) return

        const trigger = "()()()*"

        if (input === trigger) {
            showValidationScreenSet(true)
        } else {
            showValidationScreenSet(false)
        }

    }, [input])

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        const target = e.target as HTMLButtonElement;

        //on equal pess
        if (target.value === "ignore") {
            clearAll()
        }

        //set new values of input
        if (target.value !== "ignore") {
            setInput((prevInput) => {

                if (target.value === ")" || target.value === "(") {
                    let bracketCount = 0;
                    for (let index = 0; index < prevInput.length; index++) {
                        if (prevInput[index] === "(" || prevInput[index] === ")") {
                            bracketCount++
                        }
                    }

                    if (bracketCount % 2 === 1) {
                        return prevInput + ")"
                    } else {
                        return prevInput + "("
                    }

                } else {
                    return prevInput + target.value
                }
            });
        }
    };

    const encryptPassword = (password: string) => {
        return CryptoJS.AES.encrypt(password, secretKey).toString();
    };

    const decryptPassword = (encryptedPassword: string, passedSecretKey: string) => {
        return CryptoJS.AES.decrypt(encryptedPassword, passedSecretKey).toString(CryptoJS.enc.Utf8);
    };

    function clearAll() {
        setInput("");
        setResult(undefined)
        setPressedEnter(false)
    }

    function subLast() {
        setInput((prevInput) => prevInput.slice(0, -1));
    }

    const secretImages = [
        {
            imgInfo: "",
            imgUrl:
                "https://images.pexels.com/photos/16053278/pexels-photo-16053278.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        },
        {
            imgInfo: "",
            imgUrl:
                "https://images.pexels.com/photos/13733057/pexels-photo-13733057.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        },
        {
            imgInfo: "",
            imgUrl:
                "https://images.pexels.com/photos/15851469/pexels-photo-15851469.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        },
        {
            imgInfo: "",
            imgUrl:
                "https://images.pexels.com/photos/7565418/pexels-photo-7565418.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        },
        {
            imgInfo: "",
            imgUrl:
                "https://images.pexels.com/photos/16110063/pexels-photo-16110063.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        },
        {
            imgInfo: "",
            imgUrl:
                "https://images.pexels.com/photos/16074035/pexels-photo-16074035.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        },
        {
            imgInfo: "",
            imgUrl:
                "https://images.pexels.com/photos/16157377/pexels-photo-16157377.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        },
    ];



    return (
        <div className={styles.calcMainDiv} style={{ display: "grid", height: "100svh" }}>

            {firstLogin && (
                <div style={{ position: "fixed", top: 0, left: 0, height: "100%", width: "100%", zIndex: 999, backgroundColor: "var(--backgroundColor)", padding: "1rem", display: "grid", alignContent: "flex-start", gap: "1rem", textAlign: "center" }}>
                    <p>This is a secret gallery, posing as a calculator</p>

                    <p>Set a pin to trigger the hidden gallery - E.g 1234</p>

                    <p>Password will be triggered by {"()()()*"}</p>

                    <input type="number" ref={passwordInput} placeholder="Set a pin..." />

                    <p>Note down your secret key - {secretKey}</p>

                    <button style={{ justifySelf: "center" }}
                        onClick={() => {
                            if (passwordInput.current.value.length > 0 && /^[0-9]*$/.test(passwordInput.current.value)) {
                                toast.success("set")
                                saveToLocalStorage("pass", encryptPassword(passwordInput.current.value))
                                firstLoginSet(false)
                            } else {
                                toast.error("Couldn't set pass")
                            }
                        }} >Submit</button>
                </div>
            )}

            {showValidationScreen && (
                <div style={{ position: "fixed", top: 0, left: 0, height: "100%", width: "100%", zIndex: 999, backgroundColor: "var(--backgroundColor)", padding: "1rem", display: "grid", alignContent: "flex-start", gap: "1rem", textAlign: "center" }}>

                    <input type="number" ref={passwordInput} placeholder="pin..." />
                    <input type="text" ref={secretKeyInput} placeholder="Secret Key..." />

                    <button style={{ justifySelf: "center" }}
                        onClick={() => {
                            //run checks
                            const retrievedEncryptedPassword = retreiveFromLocalStorage("pass")
                            if (!retrievedEncryptedPassword) {
                                toast.error("no password seen in storage")
                                return
                            }

                            const userEnteredPass = passwordInput.current.value
                            const decryptedPass = decryptPassword(retrievedEncryptedPassword, secretKeyInput.current.value)

                            if (userEnteredPass === decryptedPass) {
                                showSecretsSet(true)
                            } else {
                                toast.error("didn't match")
                            }
                        }} >Submit</button>
                </div>
            )}

            {showSecrets && (
                <div className={styles.calcGallery}>
                    <button style={{ borderRadius: 0, marginLeft: "auto" }} onClick={() => {
                        showSecretsSet(false)
                    }}>Close</button>

                    <h2>Gallery</h2>

                    <div className={styles.galleryImagesCont}>
                        {[...secretImages, ...secretImages, ...secretImages, ...secretImages, ...secretImages].map((eachImgObj, eachImgObjIndex) => {
                            return (
                                <img key={eachImgObjIndex} src={eachImgObj.imgUrl} />
                            );
                        })}

                        <iframe style={{ aspectRatio: "16/9", width: "100%", }}
                            src="https://www.youtube.com/embed/wutmQXwZlMA?autoplay=1"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

            <div className={styles.calcDisplay}>
                <input className={styles.calcInput} type="text" value={input}
                    onChange={(e) => {
                        setInput((prevInput) => {
                            const pattern = /^[0-9()+*%/-]*$/; // regex pattern to match input
                            const input = e.target.value;

                            if (pattern.test(input)) {
                                return input;
                            } else {
                                return prevInput;
                            }
                        });
                    }} />

                <p className={styles.calcResult}>{result ?? ""}</p>

                <div className={styles.calcBttmLine}></div>
            </div>

            <div className={styles.calcButtonsDisplay}>
                <button onClick={clearAll} className={styles.calcBttn}>
                    AC
                </button>

                <button onClick={subLast} className={styles.calcBttn} style={{ display: "grid", alignItems: "center", justifyItems: "center" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                        <path d="M576 128c0-35.3-28.7-64-64-64H205.3c-17 0-33.3 6.7-45.3 18.7L9.4 233.4c-6 6-9.4 14.1-9.4 22.6s3.4 16.6 9.4 22.6L160 429.3c12 12 28.3 18.7 45.3 18.7H512c35.3 0 64-28.7 64-64V128zM271 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" />
                    </svg>
                </button>

                <button value="%" onClick={handleClick} className={styles.calcBttn}>
                    %
                </button>

                <button
                    value="/"
                    onClick={handleClick}
                    className={`${styles.calcBttn} ${styles.calcBttnCirc}`}>
                    ÷
                </button>

                <button value="7" onClick={handleClick} className={styles.calcBttn}>
                    7
                </button>

                <button value="8" onClick={handleClick} className={styles.calcBttn}>
                    8
                </button>

                <button value="9" onClick={handleClick} className={styles.calcBttn}>
                    9
                </button>

                <button value="*" onClick={handleClick} className={`${styles.calcBttn} ${styles.calcBttnCirc}`}>
                    x
                </button>

                <button value="4" onClick={handleClick} className={styles.calcBttn}>
                    4
                </button>

                <button value="5" className={styles.calcBttn} onClick={handleClick}>
                    5
                </button>

                <button value="6" onClick={handleClick} className={styles.calcBttn}>
                    6
                </button>

                <button value="-" onClick={handleClick} className={`${styles.calcBttn} ${styles.calcBttnCirc}`}>
                    -
                </button>

                <button value="1" onClick={handleClick} className={styles.calcBttn}>
                    1
                </button>

                <button value="2" onClick={handleClick} className={styles.calcBttn}>
                    2
                </button>

                <button value="3" onClick={handleClick} className={styles.calcBttn}>
                    3
                </button>

                <button value="+" onClick={handleClick} className={`${styles.calcBttn} ${styles.calcBttnCirc}`}>
                    +
                </button>

                <button value="(" onClick={handleClick} className={styles.calcBttn}>
                    {"( )"}
                </button>

                <button value="0" onClick={handleClick} className={styles.calcBttn}>
                    0
                </button>

                <button value="." onClick={handleClick} className={styles.calcBttn}>
                    .
                </button>

                <button value="ignore" onClick={(e) => {
                    handleClick(e);
                    setPressedEnter(true);
                }} className={`${styles.calcBttn} ${styles.calcBttnCirc}`}>
                    =
                </button>
            </div>
        </div>
    );
}

export default Calcultor;

import React, {useEffect, useState, useRef} from 'react';
import text from "../text.json";

const defaultGame = {
    currentWord: 0,
    nextWord: 1,
    letterIndex: 0,
    score: 0,
}

export default function Game(props) {

    const [gameState, setGameState] = useState({...defaultGame, wordBank: props.wordBank})

    const [timer, setTimer] = useState(props.time)
    let timerInterval: any = useRef(null)

    let [erroredRecently, setErroredRecently] = useState(false)
    let errorTimeout: any = useRef(null)

    function onKeyDown(e: KeyboardEvent) {
        const letter = gameState.wordBank[gameState.currentWord][gameState.letterIndex]
        if (letter === e.key) {
            if (gameState.letterIndex === gameState.wordBank[gameState.currentWord].length - 1) {
                setGameState((_state: any) => {
                    return {
                        ..._state,
                        score: _state.score + 1,
                        currentWord: _state.nextWord,
                        nextWord: _state.wordBank.length === _state.nextWord + 1 ? 0 : _state.nextWord + 1,
                        letterIndex: 0,
                    }
                })
            } else {
                setGameState((_state: any) => ({
                    ..._state,
                    letterIndex: _state.letterIndex + 1,
                }))
            }
        } else {
            clearTimeout(errorTimeout.current)
            setErroredRecently(true)
            errorTimeout.current = setTimeout(() => {
                setErroredRecently(false)
            }, 250)
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", onKeyDown, false);
        return function cleanup() {
            document.removeEventListener("keydown", onKeyDown, false);
        };
    });

    function stopTimer() {
        props.afterGame(gameState)
    }

    useEffect(() => {

        clearInterval(timerInterval.current)
        timerInterval.current = setInterval(() => {
            setTimer(prev => {
                return prev - 100
            })
        }, 100)

        return function cleanup() {
            clearTimeout(timerInterval.current)
            clearTimeout(errorTimeout.current)
        };

    }, [props])

    if (timer <= 0) {
        stopTimer()
    }

    return (<div className="text-center">

        <h1 className="font-bold text-2xl mb-3"
            style={{color: erroredRecently ? 'red' : 'black'}}>{gameState.score}</h1>
        <h2 className="font-bold text-4xl">{gameState.wordBank[gameState.currentWord]
            .split('')
            .map((letter: string, key: number) =>
                <span key={key} style={{color: key === gameState.letterIndex ? 'red' : 'black'}}>
                        {letter}
                    </span>)}
        </h2>
        <h3 className="font-bold text-gray-600 text-xl mb-6">{gameState.wordBank[gameState.nextWord]}</h3>
        <div><strong>{text.time_left}</strong>: {timer}ms</div>
        <div className="mt-4">
            <button className="bg-gray-600 hover:bg-red-600 text-white font-bold py-2 px-4 rounded" onClick={() => {
                stopTimer()
            }}>{text.stop_game}</button>
        </div>
    </div>)
}
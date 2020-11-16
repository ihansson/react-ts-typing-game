import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'react-charts'

import text from './text.json'
import wordBankOptions from './wordBank.json'

const wordBank = wordBankOptions.default

const defaultState = {
    time: 20000,
    wordBank: wordBank,
    high_score: 0,
    scores: []
}

const defaultGame = {
    wordBank: wordBank,
    currentWord: 0,
    nextWord: 1,
    letterIndex: 0,
    score: 0,
}

function useLocalStorage<T>(key: string, initialValue: any) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // If error also return initialValue
            console.log(error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            // A more advanced implementation would handle the error case
            console.log(error);
        }
    };

    return [storedValue, setValue];
}

function App() {

    const [state, setState] = useLocalStorage('typingTesterState3', defaultState)
    const [gameState, setGameState] = useState(defaultGame)
    const [page, setPage] = useState('landing')

    const [countDown, setCountDown] = useState(0)
    let countDownInterval: any = useRef(null)

    const [timer, setTimer] = useState(0)
    let timerInterval: any = useRef(null)

    let [erroredRecently, setErroredRecently] = useState(false)
    let errorTimeout: any = useRef(null)

    function onKeyDown(e: KeyboardEvent){
        if(page === 'game'){
            const letter = gameState.wordBank[gameState.currentWord][gameState.letterIndex]
            if(letter === e.key){
                if(gameState.letterIndex === gameState.wordBank[gameState.currentWord].length - 1){
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
                    setGameState((_state: any) => ({..._state,
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
    }

    useEffect(() => {
        document.addEventListener("keydown", onKeyDown, false);
        return function cleanup() {
            document.removeEventListener("keydown", onKeyDown, false);
        };
    });

    function stopTimer(){
        clearInterval(timerInterval.current)
        setPage('landing')
        setTimer(0)
        setGameState((_gameState: any) => {
            setState((_state: any) => {
                let scores = _state.scores.slice()
                scores.push(_gameState.score)
                return {..._state,
                    scores: scores,
                    high_score: _gameState.score > _state.high_score ? _gameState.score : _state.high_score,
                }
            })
            return _gameState
        })
    }

    function resetGame(){
        setGameState((_state: any) => ({
            ..._state,
            wordBank: state.wordBank,
            currentWord: 0,
            nextWord: 1,
            letterIndex: 0,
            score: 0
        }))
    }

    function startGame(){
        setTimer(state.time)
        setPage('game')

        clearInterval(timerInterval.current)
        timerInterval.current = setInterval(() => {
            setTimer(prev => {
                return prev - 100
            })
        }, 100)
    }

    function startCountdown(){

        setCountDown(3)
        setPage('countdown')

        clearInterval(countDownInterval.current)
        countDownInterval.current = setInterval(() => {
            setCountDown(prev => {
                if(prev === 1){
                    startGame()
                }
                return prev - 1
            })
        },500)

    }

    if(page === 'game' && timer <= 0){
        stopTimer()
    }

    const axes = React.useMemo(
        () => [
            { primary: true, type: 'linear', position: 'bottom' },
            { type: 'linear', position: 'left' }
        ],
        []
    )

  return (
    <div className="container mx-auto mt-5 p-12 max-w-lg rounded overflow-hidden shadow-lg">
      <header className="App-header">
          {page === 'landing' &&
            <div>
                <h1 className="font-serif font-bold text-4xl mb-3">{text.title}</h1>
                <p className="text-lg mb-6">{text.description}</p>
                <div>
                    <h2 className="font-serif text-2xl">{text.scores_title}</h2>
                    <h3 className="mt-2"><strong>{text.high_scores_title}:</strong> {state.high_score}</h3>
                    <button className="btn btn-blue" onClick={()=> {
                        setState((_state: any) => ({
                            ..._state,
                            high_score: 0
                        }))
                    }}>{text.clear}</button>
                    <h3 className="mt-4"><strong>{text.scores_graph_title}:</strong></h3>

                    {state.scores.length === 0 &&
                        <h4>{text.scores_empty}</h4>
                    }
                    {state.scores.length > 0 &&
                        <div>
                            <div
                                style={{
                                    height: '175px'
                                }}
                            >
                                <Chart data={[{data: state.scores.map((score: number, key:number) => [key, score])}]} axes={axes} />
                            </div>
                            <button className="btn btn-blue" onClick={()=> {
                                setState((_state: any) => ({
                                    ..._state,
                                    scores: []
                                }))
                            }}>{text.clear}</button>
                        </div>
                    }
                </div>
               <div>
                   <h2 className="font-serif text-2xl mt-4">{text.settings_title}</h2>
                   <h3 className="mt-2"><strong>{text.word_bank}</strong></h3>
                   <p>{text.word_bank_description}</p>
                   <div>
                       <textarea className="shadow appearance-none border border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" onChange={e => {
                           setState((_state: any) => ({
                               ..._state,
                               wordBank: e.target.value.split(',')
                           }))
                        }} value={state.wordBank.join(',')}>
                       </textarea>
                   </div>
                   <button className="btn btn-blue" onClick={()=> {
                       setState((_state: any) => ({
                           ..._state,
                           wordBank: defaultState.wordBank
                       }))
                   }}>{text.reset}</button>
                   <h3 className="mt-4"><strong>{text.time_limit}</strong></h3>
                   <p>{text.time_limit_description}</p>
                   <input className="shadow appearance-none border border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" value={state.time} onChange={(e) => {
                        setState((_state: any) => ({
                            ..._state,
                            time: parseInt(e.target.value)
                        }))
                    }}/>
               </div>
                <div className="mt-4 text-right">
                  <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-8 rounded" onClick={() => {
                      resetGame()
                      startCountdown()
                  }}>{text.start_game}</button>
                </div>
            </div>
                }
          {page === 'countdown' &&
              <div className="text-center">
                  <h1 className="font-bold text-4xl">{countDown}</h1>
              </div>
          }
          {page === 'game' &&
            <div className="text-center">
                <h1 className="font-bold text-2xl mb-3" style={{color: erroredRecently ? 'red' : 'black'}}>{gameState.score}</h1>
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
            </div>
                }
      </header>
    </div>
  );
}

export default App;

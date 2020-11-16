import React, { useState, useEffect, useRef } from 'react';

const wordBank = [
    'banana', 'something', 'else'
]

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

    if(page === 'game' && timer <= 0){
        stopTimer()
    }

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg">
      <header className="App-header">
          {page === 'landing' &&
            <div><h2>Inactive</h2>
                <h3>High Score {state.high_score} <button onClick={()=> {
                    setState((_state: any) => ({
                        ..._state,
                        high_score: 0
                    }))
                }}>Clear</button></h3>
                <h3>Scores<button onClick={()=> {
                    setState((_state: any) => ({
                        ..._state,
                        scores: []
                    }))
                }}>Clear</button></h3>
                {state.scores.length === 0 &&
                    <h4>No Scores Yet</h4>
                }
                {state.scores.length > 0 &&
                    <ul>
                        {state.scores.map((score: number, key: number) => (
                            <li key={key}>{score}</li>
                        ))}
                    </ul>
                }
                <ul>

                </ul>
               <div>
                   <textarea onChange={e => {
                       setState((_state: any) => ({
                           ..._state,
                           wordBank: e.target.value.split(',')
                       }))
                    }} value={state.wordBank.join(',')}>
                   </textarea>
                   <button onClick={()=> {
                       setState((_state: any) => ({
                           ..._state,
                           wordBank: defaultState.wordBank
                       }))
                   }}>Reset</button>
               </div>
               <input type="text" value={state.time} onChange={(e) => {
                setState((_state: any) => ({
                    ..._state,
                    time: parseInt(e.target.value)
                }))
                }}/>
              <button onClick={() => {
                  resetGame()
                  setPage('game')
                  setTimer(state.time)
                  timerInterval.current = setInterval(() => {
                      setTimer(prev => {
                          return prev - 100
                      })
                  }, 100)
              }}>Start Game</button>
            </div>
                }
          {page === 'game' &&
            <div>
                <h2>Active</h2>
                <h2 style={{color: erroredRecently ? 'red' : 'white'}}>Score: {gameState.score}</h2>
                <h2>{gameState.wordBank[gameState.currentWord]
                    .split('')
                    .map((letter: string, key: number) =>
                        <span key={key} style={{color: key === gameState.letterIndex ? 'red' : 'white'}}>
                        {letter}
                    </span>)}
                </h2>
                <h3>{gameState.wordBank[gameState.nextWord]}</h3>
                <h4>Time left: {timer}</h4>
                <button onClick={() => {
                    stopTimer()
                }}>Stop Game</button>
            </div>
                }
      </header>
    </div>
  );
}

export default App;

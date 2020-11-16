import React, {useState} from 'react';
import Countdown from './Pages/Countdown'
import Game from './Pages/Game'
import Landing from './Pages/Landing'

import wordBankOptions from './wordBank.json'

const wordBank = wordBankOptions.default

const defaultState = {
    time: 20000,
    wordBank: wordBank,
    high_score: 0,
    scores: []
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
    const [page, setPage] = useState('Landing')

    return (
        <div className="container mx-auto mt-5 p-12 max-w-lg rounded overflow-hidden shadow-lg">
            {page === 'Landing' &&
            <Landing state={state} setState={setState} page={page} setPage={setPage} defaultState={defaultState}/>
            }
            {page === 'Countdown' &&
            <Countdown afterCountdown={() => {
                setTimeout(() => {
                    setPage('Game')
                }, 0)
            }}/>
            }
            {page === 'Game' &&
            <Game wordBank={state.wordBank} time={state.time} afterGame={(_gameState) => {
                setTimeout(() => {
                    setPage('Landing')
                    setState((_state: any) => {
                        let scores = _state.scores.slice()
                        scores.push(_gameState.score)
                        return {
                            ..._state,
                            scores: scores,
                            high_score: _gameState.score > _state.high_score ? _gameState.score : _state.high_score,
                        }
                    })
                }, 0)
            }}/>
            }
        </div>
    );
}

export default App;

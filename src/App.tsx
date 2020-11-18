import React, {useState} from 'react';

import Countdown from './Pages/Countdown'
import Game from './Pages/Game'
import Landing from './Pages/Landing'

function App() {

    const [page, setPage] = useState('Landing')
    const [pageOptions, setPageOptions] : [any, any] = useState({})

    return (
        <div className="container mx-auto mt-5 p-12 max-w-lg rounded overflow-hidden shadow-lg">
            {page === 'Landing' &&
            <Landing onStartGame={(_state) => {
                setPageOptions(_state)
                setPage('Countdown')
            }} gameState={pageOptions} />
            }
            {page === 'Countdown' &&
            <Countdown afterCountdown={() => {
                setTimeout(() => {
                    setPage('Game')
                })
            }}/>
            }
            {page === 'Game' &&
            <Game wordBank={pageOptions.wordBank} time={pageOptions.time} afterGame={(_gameState) => {
                setTimeout(() => {
                    setPageOptions(_gameState)
                    setPage('Landing')
                }, 0)
            }}/>
            }
        </div>
    );
}

export default App;

import React from 'react';
import text from "../text.json";
import {Chart} from 'react-charts'

export default function Landing(props) {

    const state = props.state
    const setState = props.setState
    const setPage = props.setPage
    const defaultState = props.defaultState

    const axes = React.useMemo(
        () => [
            {primary: true, type: 'linear', position: 'bottom'},
            {type: 'linear', position: 'left'}
        ],
        []
    )

    return (<div>
        <h1 className="font-serif font-bold text-4xl mb-3">{text.title}</h1>
        <p className="text-lg mb-6">{text.description}</p>
        <div>
            <h2 className="font-serif text-2xl">{text.scores_title}</h2>
            <h3 className="mt-2"><strong>{text.high_scores_title}:</strong> {state.high_score}</h3>
            <button className="btn btn-blue" onClick={() => {
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
                    <Chart data={[{data: state.scores.map((score: number, key: number) => [key, score])}]} axes={axes}/>
                </div>
                <button className="btn btn-blue" onClick={() => {
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
               <textarea
                   className="shadow appearance-none border border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                   onChange={e => {
                       setState((_state: any) => ({
                           ..._state,
                           wordBank: e.target.value.split(',')
                       }))
                   }} value={state.wordBank.join(',')}>
               </textarea>
            </div>
            <button className="btn btn-blue" onClick={() => {
                setState((_state: any) => ({
                    ..._state,
                    wordBank: defaultState.wordBank
                }))
            }}>{text.reset}</button>
            <h3 className="mt-4"><strong>{text.time_limit}</strong></h3>
            <p>{text.time_limit_description}</p>
            <input
                className="shadow appearance-none border border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text" value={state.time} onChange={(e) => {
                setState((_state: any) => ({
                    ..._state,
                    time: parseInt(e.target.value)
                }))
            }}/>
        </div>
        <div className="mt-4 text-right">
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-8 rounded" onClick={() => {
                setPage('Countdown')
            }}>{text.start_game}</button>
        </div>
    </div>)
}
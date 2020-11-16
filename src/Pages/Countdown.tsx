import React, {useEffect, useState, useRef} from 'react';

export default function Countdown(props) {
    const [countDown, setCountDown] = useState(0)
    let countDownInterval: any = useRef(null)

    useEffect(() => {
        setCountDown(3)
        clearInterval(countDownInterval.current)
        countDownInterval.current = setInterval(() => {
            setCountDown(prev => {
                if (prev === 1) {
                    props.afterCountdown()
                }
                return prev - 1
            })
        }, 500)
        return () => {
            clearInterval(countDownInterval.current)
        }
    }, [props]);

    return (<div className="text-center">
        <h1 className="font-bold text-4xl">{countDown}</h1>
    </div>)
}
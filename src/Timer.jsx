import {useEffect, useState} from 'react';
import axios from 'axios';
import { fetch } from '@tauri-apps/plugin-http';

const API = "http://127.0.0.1:8000"

function toreadableTime(seconds){
    return new Date(seconds * 1000).toISOString().substring(11, 19);
}


function Timer({id, currentText}){

    const [timer, setTimer] = useState(null);

    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch(API + `/projects/${id}/time`);
                const data = await res.json()
                setTimer(data);
            } catch (error) {
                console.error("Error fetching timer:", error);
            }
        };

        check();
        const interval = setInterval(check, 1000);
        return () => clearInterval(interval);
    }, [id]);

    return (
        <>
            {timer ?
                ((timer.currentTracker) ?
                    (<div className="flex grow">
                        <div className="pr-2">{toreadableTime(timer.currentTracker.tillNow)}</div>
                        <div className='grow border-b border-white'>{timer.currentTracker.desc}</div>
                    </div>) :
                    (<div className="flex grow">
                        <div className="pr-2">{toreadableTime(0)}</div>
                        <div className='grow border-b border-white'>{currentText}</div>
                    </div>)) :
                (<div className="flex grow">
                    <div className="pr-2">{toreadableTime(0)}</div>
                    <div className='grow border-b border-white'>{currentText}</div>
                </div>)
            }
        </>
    )

}

export default Timer;

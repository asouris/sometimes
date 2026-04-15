import {useEffect, useState} from 'react';
import axios from 'axios';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

const API = "http://127.0.0.1:6767"

function toreadableTime(seconds){
    return new Date(seconds * 1000).toISOString().substring(11, 19);
}

const mixedFetch = async (url) => {
  const isTauri = '__TAURI_INTERNALS__' in window;

  if (isTauri) {
    try {
      return await tauriFetch(url);
    } catch (error) {
      console.error("Tauri Fetch Error:", error);
      throw error;
    }
  } else {
    return await window.fetch(url);
  }
};

function Timer({id, currentText}){

    const [timer, setTimer] = useState(null);

    useEffect(() => {
        const check = async () => {
            try {
                const res = await mixedFetch(API + `/projects/${id}/time`);
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
                        <div className="pr-2 font-mono">{toreadableTime(timer.currentTracker.tillNow)}</div>
                        <div className='grow border-b border-white'>{timer.currentTracker.desc}</div>
                    </div>) :
                    (<div className="flex grow">
                        <div className="pr-2 font-mono">{toreadableTime(0)}</div>
                        <div className='grow border-b border-white'>{currentText}</div>
                    </div>)) :
                (<div className="flex grow">
                    <div className="pr-2 font-mono">{toreadableTime(0)}</div>
                    <div className='grow border-b border-white'>{currentText}</div>
                </div>)
            }
        </>
    )

}

export default Timer;

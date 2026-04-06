import {useEffect, useState} from 'react';
import axios from 'axios';

const API = "http://127.0.0.1:8000"

function toreadableTime(seconds){
    return new Date(seconds * 1000).toISOString().substring(11, 19);
}


function Timer({id}){

    const [timer, setTimer] = useState(null);

    useEffect(() => {
    const check = () => {
        axios.get(API + `/projects/${id}/time`)
        .then((res) => {
            setTimer(res.data);
        })
        .catch(function (error) {
            console.log(error);
        });
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
    }, [API]);

    return (
        <div className="flex border border-white">
            {timer ?
                ((timer.currentTracker) ?
                    (<div className="flex">
                        <div className="pr-2">{timer.currentTracker.desc}</div>
                        <div>{toreadableTime(timer.currentTracker.tillNow)}</div>
                    </div>) :
                    "loading current tracker") :
                ("loading timer...")
            }
        </div>

    )

}

export default Timer;

import { CiTimer } from "react-icons/ci";
import { IoTimeSharp } from "react-icons/io5";
import { IoTimeOutline } from "react-icons/io5";
import { IoPlayCircleOutline } from "react-icons/io5";
import { IoAddCircleOutline } from "react-icons/io5";
import { IoAdd } from "react-icons/io5";
import { IoStopCircleOutline } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoTrashOutline } from "react-icons/io5";


import { useState, useEffect, useRef } from 'react'
import axios from 'axios';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

import Timer from "./Timer.jsx";

const API = "http://127.0.0.1:6767"
const isTauri = '__TAURI_INTERNALS__' in window;

const mixedFetch = async (url, method = "GET", body = null) => {
  const isTauri = '__TAURI_INTERNALS__' in window;

  if (isTauri) {
    try {
      return await tauriFetch(url, {
        method,
        headers: {
            'content-type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });
    } catch (error) {
      console.error("Tauri Fetch Error:", error);
      throw error;
    }
  } else {
    return await window.fetch(url, {
        method,
        headers: {
            'content-type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined}
    );
  }
};

function twoDigitString(num) {
    return num.toString().padStart(2, '0');
}

console.log(isTauri);

function App() {
    const [count, setCount] = useState(0);
    const [projects, setProjects] = useState([]);

    const [showingIndex, setShowingIndex] = useState(null);
    const [msgVisible, setMsgVisible] = useState(false);

    const [manSeconds, setManSeconds] = useState(0);
    const [manMinutes, setManMinutes] = useState(0);
    const [manHours, setManHours] = useState(0);

    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const loadProjects = async () => {
            try {
                const response = await mixedFetch(API + "/projects");
                const data = await response.json();
                const arrayLike = Object.values(data);
                setProjects(arrayLike);
            } catch (error) {
                console.log(error);
            }
        };

        loadProjects();
    }, []);


    function showProject (index){
        console.log(index);
        setShowingIndex(index);
        console.log(showingIndex);
    }

    async function update() {
        try {
            const response = await mixedFetch(API + "/projects");
            const data = await response.json();
            const arrayLike = Object.values(data);
            setProjects(arrayLike);
        } catch (error) {
            console.log(error);
        }
    }

    async function addProject() {
        let name = document.getElementById('projectname').value;
        if (name === "") {
            name = "-";
        }

        try {
            await mixedFetch(API + `/new_project?name=${name}`);
            console.log("project created");
            await update();
        } catch (error) {
            console.log(error);
        }

        document.getElementById('projectname').value = "";
    }

    async function startTimer(index) {
        let desc = document.getElementById('timerdesc').value;
        if (desc === "") {
            desc = "...";
        }

        try {
            await mixedFetch(API + `/projects/${index}/track?q=${desc}`);
            console.log("timer started");
            await update();
        } catch (error) {
            console.log(error);
        }
    }

    async function stopTimer(index) {
        try {
            await mixedFetch(API + `/projects/${index}/stop`);
            console.log("timer stopped");
            await update();

        } catch (error) {
            console.log(error);
        }
    }

    async function save() {
        try {
            await mixedFetch(API + "/save");
            console.log("saved data");
            setMsgVisible(true);
            setTimeout(() => {
                setMsgVisible(false);
            }, 3000);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            save();
        }, 3 * 60 * 1000); // 3 minutes

        return () => clearInterval(interval);
    }, []);

    function toreadableTime(seconds){
        return new Date(seconds * 1000).toISOString().substring(11, 19);
    }


    useEffect(() => {
        const handleKeyUp = (event) => {
            if (event.key === 'Enter') {
                const projectField = document.getElementById('projectname');
                if(document.activeElement === projectField){
                    addProject();
                }
                else{
                    const descField = document.getElementById('timerdesc');
                    if(document.activeElement === descField){
                        const isManualTimeZero =
                            Math.floor(manHours) === 0 &&
                            Math.floor(manMinutes) === 0 &&
                            Math.floor(manSeconds) === 0;

                        if (isManualTimeZero) {
                            startTimer(showingIndex);
                        } else {
                            addHistory(showingIndex);
                        }
                    }
                    else{
                        stopTimer(showingIndex);
                    }
                }
                
            }
            if (event.ctrlKey && event.key === 'n') {
                const projectField = document.getElementById('projectname');
                projectField.focus();
            }
            if (event.ctrlKey && event.key === 'd') {
                if (showingIndex!=null){
                    const descField = document.getElementById('timerdesc');
                    descField.focus()
                }
            }
            if(event.ctrlKey && event.key === 't') {
                if (showingIndex!=null){
                    startTimer(showingIndex);
                }
            }
            if(event.key === 'j' && document.activeElement === document.body){
                if(showingIndex!=null){
                    const mod = (n, d) => ((n % d) + d) % d;
                    setShowingIndex(mod(showingIndex-1, projects.length));
                }
                else{
                    setShowingIndex(0);
                }
            }
            if(event.key === 'k' && document.activeElement === document.body){
                console.log("herreeeeee");
                if(showingIndex!=null){
                    const mod = (n, d) => ((n % d) + d) % d;
                    setShowingIndex(mod(showingIndex+1, projects.length))
                }
                else{
                    console.log("somehow an aerror");
                    setShowingIndex(projects.length - 1);
                }
            }
            if(event.key === 'Escape'){
                document.getElementById('projectname').blur();
                document.getElementById('timerdesc').blur();
            }
            if (event.ctrlKey && event.key === 's'){
                console.log("saving");
                save();
            }

        }

        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [showingIndex, projects, manHours, manMinutes, manSeconds]);

    function handleWheel (e, prev, func, min, max) {
        e.preventDefault();
        const step = e.deltaY < 0 ? -0.15 : 0.15; 
        let newValue = prev + step;
        if (newValue > max) newValue = min;
        if (newValue < min) newValue = max;
        func(newValue);
    }

    function clearManTimer() {
        setManHours(0);
        setManMinutes(0);
        setManSeconds(0);
        document.getElementById('timerdesc').value = "";
    }

    async function addHistory(pId) {
        const desc = document.getElementById("timerdesc").value;
        const payload = {
            desc: desc,
            total: Math.floor(manHours) * 3600 + Math.floor(manMinutes) * 60 + Math.floor(manSeconds),
        };
        try {
            const res = await mixedFetch(API + `/projects/${pId}/history`,
                "POST",
                payload
            );
            await update();

        } catch (error) {
            console.error(error);
    }
    }

    async function deleteHistory (p_id, h_id){
        try {
            await mixedFetch(API + `/projects/${p_id}/history/${h_id}`, "DELETE");
            console.log("deleted history");
            await update();

        } catch (error) {
            console.error(error);
        }

        setOpenMenuIndex(null);
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-1/2 border border-black rounded flex">
                <div className="h-80 w-1/3 bg-gray-100 border-r border-black rounded-l flex flex-col overflow-scroll">
                    <div className="border-b border-black p-3 hover:bg-gray-200 flex items-center justify-center">
                        <input id="projectname" className="font-sans focus:outline-none bg-transparent px-1 border-b border-black grow min-w-0" type="text" placeholder="name..."/> 
                        <button onClick={() => addProject()} className="pl-2" ><IoAdd size={20}/></button>
                    </div>
                    {projects.map((proj, index) => (
                        <button onClick={() => showProject(index)} className={`focus:outline-none text-wrap p-3 border-b border-black hover:bg-gray-200 ${index==showingIndex ? "bg-gray-200" : "bg-gray-100"}`}>
                            <div className="break-words text-wrap text-lg">{proj.name}</div>
                        </button>
                    ))

                    }

                </div>
                <div className="min-w-0 w-1/2 grow h-80 p-3 flex flex-col">
                    {showingIndex!=null ?
                        (<div className="flex flex-col h-full">
                            <div className="flex items-center justify-between px-3 pb-2">
                                <div className="flex items-center">
                                    <IoTimeOutline size={20}/>
                                    <div className="text-lg px-3 font-mono ">{toreadableTime(projects[showingIndex].total)}</div>
                                </div>
                            </div>
                            <div className="flex flex-col border rounded grow h-4/5">
                                {(projects[showingIndex].state==="Not tracking") ?
                                    (
                                        <div className="flex p-3">
                                            <div onClick={() => clearManTimer()} className="flex pr-2 font-mono">
                                                <div onWheel={(e) => handleWheel(e, manHours, setManHours, 0, 999)}>
                                                    {twoDigitString(Math.floor(manHours))}:
                                                </div>
                                                <div onWheel={(e) => handleWheel(e, manMinutes, setManMinutes, 0, 59)}>
                                                    {twoDigitString(Math.floor(manMinutes))}:
                                                </div>
                                                <div onWheel={(e) => handleWheel(e, manSeconds, setManSeconds, 0, 59)}>
                                                    {twoDigitString(Math.floor(manSeconds))}
                                                </div>
                                            </div>
                                            <input id="timerdesc" className="focus:outline-none border-b border-black grow min-w-0" type="text" /> 
                                            {Math.floor(manHours)===0&&Math.floor(manMinutes)===0&&Math.floor(manSeconds)===0 ? 
                                            (<button onClick={() => startTimer(showingIndex)} className="pl-2"><IoPlayCircleOutline size={25}/></button>):
                                            (<button onClick={() => addHistory(showingIndex)} className="pl-2"><IoAddCircleOutline size={25}/></button>)}
                                            
                                        </div>
                                    ) :
                                    (
                                        <div className="flex p-3 justify-end">
                                            <Timer id={showingIndex} currentText={"..."}/>
                                            <button onClick={() => stopTimer(showingIndex)} className="pl-2 animate-pulse"><IoStopCircleOutline size={25}/></button>
                                        </div>
                                    )
                                }
                                <div className="h-full flex flex-col overflow-y-scroll overflow-x-hidden">
                                    <div className="px-3">History</div>
                                    {projects[showingIndex].history.map((entry, i) => (
                                        <div
                                        key={i} 
                                        className="relative flex border-t px-3 hover:bg-gray-100"
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            setOpenMenuIndex(openMenuIndex===i ? null : i);
                                            setMenuPos({
                                                x: e.clientX,
                                                y: e.clientY,
                                            });
                                        }}
                                        >
                                            {openMenuIndex === i && (
                                            <button 
                                            className="fixed border rounded-full p-2 hover:bg-gray-100 z-10 bg-white"
                                            style={{
                                                top: menuPos.y,
                                                left: menuPos.x,
                                            }}
                                            onClick={() => deleteHistory(showingIndex, i)}  
                                            >
                                                <IoTrashOutline />
                                            </button>
                                            )}
                                            <div className="font-mono font-light">{toreadableTime(entry.total)}</div>
                                            <div className="break-words text-wrap pl-2 font-light">{entry.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>) :
                        (<div>
                            No current project...
                        </div>)}
                </div>
            </div>
            <div className={`${msgVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-700 ease-in-out m-6 py-3 px-2 text-gray-500 absolute bottom-0 right-20`}>
                Data saved!
            </div>
            <button onClick={() => save()} className="m-6 py-3 px-5 rounded rounded-lg bg-black text-white absolute bottom-0 right-0">
                Save
            </button>
            <div className="text-center text-sm font-mono m-6 py-3 absolute bottom-0">
                ctrl+n to name project, j and k to select project <br></br>ctrl+t to track, ctrl+d to add description
            </div>
        </div>
    )
}

export default App


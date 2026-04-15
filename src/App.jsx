import { CiTimer } from "react-icons/ci";
import { IoTimeSharp } from "react-icons/io5";
import { IoTimeOutline } from "react-icons/io5";
import { IoPlayCircleOutline } from "react-icons/io5";
import { IoAdd } from "react-icons/io5";
import { IoStopCircleOutline } from "react-icons/io5";

import { useState, useEffect } from 'react'
import axios from 'axios';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

import Timer from "./Timer.jsx";

const API = "http://127.0.0.1:6767"
const isTauri = '__TAURI_INTERNALS__' in window;

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
    return await window.fetch(url, {
        headers: {
            'content-type': 'application/json'
        }}
    );
  }
};

console.log(isTauri);

function App() {
    const [count, setCount] = useState(0);
    const [projects, setProjects] = useState([]);

    const [showingIndex, setShowingIndex] = useState(null);
    const [msgVisible, setMsgVisible] = useState(false);

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
                        startTimer(showingIndex);
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
    }, [showingIndex, projects]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-1/2 border border-black rounded flex">
                <div className="h-80 w-1/3 bg-gray-100 border-r border-black rounded-l flex flex-col">
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
                            <div className="flex items-center px-3 pb-2">
                                <IoTimeOutline size={20}/>
                                <div className="text-lg px-3 font-mono ">{toreadableTime(projects[showingIndex].total)}</div>
                            </div>
                            <div className="flex flex-col border rounded grow h-4/5">
                                {(projects[showingIndex].state==="Not tracking") ?
                                    (
                                        <div className="flex p-3">
                                            <div className="pr-2 font-mono">{toreadableTime(0)}</div>
                                            <input id="timerdesc" className="focus:outline-none border-b border-black grow min-w-0" type="text" /> 
                                            <button onClick={() => startTimer(showingIndex)} className="pl-2"><IoPlayCircleOutline size={25}/></button>
                                        </div>
                                    ) :
                                    (
                                        <div className="flex p-3 justify-end">
                                            <Timer id={showingIndex} currentText={document.getElementById('timerdesc').value}/>
                                            <button onClick={() => stopTimer(showingIndex)} className="pl-2 animate-pulse"><IoStopCircleOutline size={25}/></button>
                                        </div>
                                    )
                                }
                                <div className="h-full flex flex-col overflow-scroll">
                                    <div className="px-3">History</div>
                                    {projects[showingIndex].history.map((entry, i) => (
                                        <div className="flex border-t px-3 hover:bg-gray-100">
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


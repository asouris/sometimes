import { CiTimer } from "react-icons/ci";
import { IoTimeSharp } from "react-icons/io5";
import { IoTimeOutline } from "react-icons/io5";
import { IoPlayCircleOutline } from "react-icons/io5";
import { IoAdd } from "react-icons/io5";
import { IoStopCircleOutline } from "react-icons/io5";

import { useState, useEffect } from 'react'
import axios from 'axios';

import Timer from "./Timer.jsx";

const API = "http://127.0.0.1:8000"

function App() {
    const [count, setCount] = useState(0);
    const [projects, setProjects] = useState([]);

    const [showingProject, setShowingProject] = useState(null);

    useEffect(() => {
        axios.get(API + "/projects")
        .then(function (response) {
            const res = response.data;
            const arrayLike = Object.values(res);
            setProjects(arrayLike);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        });
    }, [showingProject]);

    function showProject (index){
        setShowingProject(projects[index]);
        console.log(showingProject);
        console.log(showingProject.state);
        console.log(showingProject.state==="Not tracking");
    }

    function update () {
        axios.get(API + "/projects")
        .then(function (response) {
            const res = response.data;
            const arrayLike = Object.values(res);
            setProjects(arrayLike);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        });
    }

    function addProject (){
        let name = document.getElementById('projectname').value;
        if( name === ""){
            name = "-";
        }
        axios.get(API + `/new_project?name=${name}`)
        .then(function (res) {
            console.log("project created");
            update();
        })
        .catch(function (error) {
            console.log(error);
        });

        document.getElementById('projectname').value = "";
    }

    function startTimer (index){
        let desc = document.getElementById('timerdesc').value;
        if (desc===""){
            desc = "-";
        }
        axios.get(API + `/projects/${index}/track?q=${desc}`)
        .then(function (res) {
            console.log("timer started");
            update(index);
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    function stopTimer (index){
        axios.get(API + `/projects/${index}/stop`)
        .then(function (res) {
            console.log("timer stopped");
            update();
        })
        .catch(function (error) {
            console.log(error);
        });

    }

    function toreadableTime(seconds){
        return new Date(seconds * 1000).toISOString().substring(11, 19);
    }

    const [msgVisible, setMsgVisible] = useState(false);

    function save(){
        axios.get(API + "/save")
        .then(function (res) {
            console.log("saved data");
            setMsgVisible(true);
            const timeoutID = setTimeout(() => {
                setMsgVisible(false);
            }, 3000);
        })
        .catch(function (error) {
            console.log(error);
        });
    }



    return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-1/2 border border-black rounded flex">
                <div className="h-80 overflow-scroll w-1/3 bg-gray-100 border-r border-black rounded-l flex flex-col">
                    {projects.map((proj, index) => (
                        <button onClick={() => showProject(index)} className="p-3 border-b border-black hover:bg-gray-200">
                            <div className="text-lg">{proj.name}</div>
                        </button>
                    ))

                    }
                    <div className="p-3 hover:bg-gray-200 flex items-center justify-center">
                        <input id="projectname" className="px-1 border rounded grow min-w-0" type="text" placeholder="name..."/> 
                        <button onClick={() => addProject()} className="pl-2" ><IoAdd size={20}/></button>
                    </div>

                </div>
                <div className="min-w-0 grow h-80 p-3 flex flex-col">
                    {showingProject ?
                        (<div className="flex flex-col h-full">
                            <div className="flex items-center px-3 pb-2">
                                <IoTimeOutline size={20}/>
                                <div className="text-lg px-3">{toreadableTime(showingProject.total)}</div>
                            </div>
                            <div className="flex flex-col border rounded grow h-4/5">
                                {(projects[showingProject.id].state==="Not tracking") ?
                                    (
                                        <div className="flex p-3">
                                            <button onClick={() => startTimer(showingProject.id)} className="pr-2"><IoPlayCircleOutline size={20}/></button>
                                            <input id="timerdesc" className="border rounded grow min-w-0" type="text" /> 
                                        </div>
                                    ) :
                                    (
                                        <div className="flex p-3">
                                            <button onClick={() => stopTimer(showingProject.id)} className="pr-2 animate-pulse"><IoStopCircleOutline size={20}/></button>
                                            <div className="pr-2 font-light">
                                                {showingProject.currentTracker && showingProject.currentTracker.desc}
                                            </div>
                                            <Timer id={showingProject.id}/>
                                        </div>
                                    )
                                }
                                <div className="h-full flex flex-col overflow-scroll">
                                    <div className="px-3">History</div>
                                    {projects[showingProject.id].history.map((entry, i) => (
                                        <div className="flex border-t px-3 hover:bg-gray-100">
                                            <div className="font-mono">{toreadableTime(entry.total)}</div>
                                            <div className="pl-2 font-light">{entry.desc}</div>
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
        </div>
    )
}

export default App


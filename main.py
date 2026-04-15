import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psutil
from pathlib import Path
from collections import deque

import time
import json
import threading
import time
import os
import sys

resource_dir = sys.argv[1] if len(sys.argv) > 1 else "backend/data.json"

def check_tauri():
    tauri = psutil.Process(os.getppid())
    while True:
        if not tauri.is_running():
            os._exit(0)
        time.sleep(2)

threading.Thread(target=check_tauri, daemon=True).start()


app = FastAPI()
origins = [
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost:5173",
    "tauri://localhost"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TimeTracker:
    def __init__(self, desc):
        # saves current time
        self.start_time = time.perf_counter()
        self.desc = desc
        self.tillNow = 0

    def getElapsed(self):
        # gets current time
        end_time = time.perf_counter()
        # gets difference with initial
        elapsed = end_time - self.start_time
        return elapsed

class Project:
    def __init__(self, name):
        self.name = name
        self.id = len(projects)
        
        self.total = 0
        self.history = deque()
        self.currentTracker = None
        self.state = "Not tracking"

    # tracks on project
    def track(self, desc):
        if self.currentTracker:
            return {"state" : "Already tracking this project"}

        newTracker = TimeTracker(desc)
        self.currentTracker = newTracker
        self.state = "Currently tracking"

        return self

    def stopTrack(self):
        if not self.currentTracker:
            return {"state":"Not currently tracking"}

        totalTime = self.currentTracker.getElapsed()

        self.history.appendleft({'desc': self.currentTracker.desc, 'total': totalTime})
        self.total += totalTime

        self.currentTracker=None
        self.state = "Not tracking"

        return self

    def update(self):
        if not self.currentTracker:
            return self

        self.currentTracker.tillNow = self.currentTracker.getElapsed()
        return self

    def getCurrentTimer(self):
        if not self.currentTracker:
            return {"state":"Not currently tracking"}

        update()
        return self.currentTracker



projects = deque()


path = Path(resource_dir)
if path.exists():
    with open(resource_dir, 'r') as file:
        data = json.load(file)

    for p in data.values():
        new_project = Project(p['name'])
        new_project.id = p['id']
        new_project.total = p['total']
        new_project.history = deque(p['history'])

        projects.append(new_project)

print("READY", flush=True)

@app.get("/")
def read_root():
    return {"Hello": "everynyan"}

@app.get("/projects")
def getProjects():
    res = {}
    i = 0
    for p in projects:
        res[i] = p
        i+=1
    return res

@app.get("/new_project")
def makeProject(name:str):
    newProject = Project(name)
    projects.appendleft(newProject)
    return projects[0]

@app.get("/projects/{p_id}/track")
def trackProject(p_id: int, q: str | None = "none"):
    return projects[p_id].track(q)

@app.get("/projects/{p_id}/stop")
def stopTrackProject(p_id: int):
    return projects[p_id].stopTrack()

@app.get("/projects/{p_id}/time")
def getProjectTime(p_id: int):
    return projects[p_id].update()

@app.get("/save")
def save():
    result = {}
    for p in projects:
        history = []
        for h in p.history:
            history.append({
                "desc" : h['desc'],
                "total" : h['total']
            })

        result[p.id] = {
            "name": p.name,
            "id": p.id,
            "total": p.total,
            "history": history,
        }


    with open(resource_dir, "w") as f:
        f.write(json.dumps(result, indent=4))

    return {"state" : "success"}


if __name__ == '__main__':
    uvicorn.run(app, host="127.0.0.1", port=6769, reload=False, workers=1)

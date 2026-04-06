from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import time
import json

with open('backend/data.json', 'r') as file:
    data = json.load(file)

print(data)


app = FastAPI()
origins = [
    "http://localhost:8080",
    "http://localhost:5173"
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
        self.history = []
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

        self.history.append({'desc': self.currentTracker.desc, 'total': totalTime})
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



projects = []
for p in data.values():
    new_project = Project(p['name'])
    new_project.id = p['id']
    new_project.total = p['total']
    new_project.history = p['history']

    projects.append(new_project)

print(projects)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/projects")
def getProjects():
    res = {}
    for p in projects:
        res[p.id] = p
    return res

@app.get("/projects/{p_id}")
def getProject(p_id: int):
    return projects[p_id]

@app.get("/new_project")
def makeProject(name:str):
    newProject = Project(name)
    new_id = newProject.id
    projects.append(newProject)
    return projects[new_id]

@app.get("/projects/{p_id}/track")
def trackProject(p_id: int, q: str | None = "none"):
    return projects[p_id].track(q)

@app.get("/projects/{p_id}/stop")
def stopTrackProject(p_id: int):
    return projects[p_id].stopTrack()

@app.get("/projects/{p_id}/time")
def getProjectTime(p_id: int):
    return projects[p_id].update()

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}


@app.get("/save")
def save():
    result = {}
    for p in projects:
        history = []
        for h in p.history:
            print(h)
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

    with open("backend/data.json", "w") as f:
        f.write(json.dumps(result, indent=4))

    return {"state" : "success"}

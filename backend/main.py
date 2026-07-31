import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base,engine
from app import models



# Import all routers
from app.routes import (
    users,
    projects,
    milestones,
    resources,
    inventory,
    workers,
    attendance,
    procurements,
    notifications,
    reports,
    documents,
     dashboard,
    
    
)


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BuildTrack API",
    version="1.0.0"
)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)








# Ensure static/reports directory exists and mount static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(os.path.join(static_dir, "reports"), exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")



@app.get("/")
def root():
    return {"message": "Welcome to BuildTrack Backend"}


app.include_router(users.router)
app.include_router(projects.router)
app.include_router(milestones.router)
app.include_router(resources.router)
app.include_router(inventory.router)
app.include_router(workers.router)
app.include_router(attendance.router)
app.include_router(procurements.router)
app.include_router(notifications.router)
app.include_router(reports.router)
app.include_router(documents.router)
app.include_router(dashboard.router)

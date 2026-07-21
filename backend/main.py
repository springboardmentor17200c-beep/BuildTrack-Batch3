from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app import models
from app.routes import users

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

app.include_router(users.router)


@app.get("/")
def home():
    return {"message": "BuildTrack Backend Running"}






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
    reports
)

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BuildTrack API",
    version="1.0.0"
)

# Root API
@app.get("/")
def root():
    return {"message": "Welcome to BuildTrack Backend"}

# Register Routers
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

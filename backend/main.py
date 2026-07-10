from fastapi import FastAPI

from app.database import Base, engine
from app import models
from app.routes import users

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BuildTrack API",
    version="1.0.0"
)

app.include_router(users.router)


@app.get("/")
def home():
    return {"message": "BuildTrack Backend Running"}
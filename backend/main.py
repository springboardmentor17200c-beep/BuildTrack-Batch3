from fastapi import FastAPI
from app.database import Base, engine
from app import models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BuildTrack API",
    version="1.0.0"
)

@app.get("/")
def home():
    return {"message": "BuildTrack Backend Running"}
from fastapi import FastAPI
from app.routes.users import router as users_router

app = FastAPI(
    title="BuildTrack API",
    version="1.0.0"
)

@app.get("/")
def home():
    return {"message": "Welcome to BuildTrack Backend"}

app.include_router(users_router)
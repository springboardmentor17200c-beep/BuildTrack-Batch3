from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)

@router.post("/")
def create_project(project: schemas.ProjectCreate,
                   db: Session = Depends(get_db)):
    return crud.create_project(db, project)

@router.get("/")
def get_projects(db: Session = Depends(get_db)):
    return crud.get_projects(db)
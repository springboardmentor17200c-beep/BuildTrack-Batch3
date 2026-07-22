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






from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import crud, schemas

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create Project
@router.post("/", response_model=schemas.ProjectOut)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db)
):
    return crud.create_project(db, project)


# Get All Projects
@router.get("/", response_model=list[schemas.ProjectOut])
def get_projects(db: Session = Depends(get_db)):
    return crud.get_projects(db)


# Get Project by ID
@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    project = crud.get_project(db, project_id)

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return project


# Update Project
@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: int,
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db)
):
    updated = crud.update_project(db, project_id, project)

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return updated


# Delete Project
@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    deleted = crud.delete_project(db, project_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return {"message": "Project deleted successfully"}
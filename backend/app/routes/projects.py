from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas
from app.dependencies import require_role
from app.auth import get_current_user

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)

# Create Project
@router.post("/")
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    return crud.create_project(db, project)


# Get All Projects (Pagination)
@router.get("/")
def get_projects(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_projects(db, skip, limit)


# Get Project by ID
@router.get("/{project_id}")
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    project = crud.get_project(db, project_id)

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return project


# Update Project
@router.put("/{project_id}")
def update_project(
    project_id: int,
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
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
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    deleted = crud.delete_project(db, project_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return {"message": "Project deleted successfully"}


# Search Projects
@router.get("/search")
def search_project(
    name: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.search_project(db, name)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.dependencies import require_role
from app.auth import get_current_user

router = APIRouter(
    prefix="/milestones",
    tags=["Milestones"]
)

# Create Milestone
@router.post("/")
def create_milestone(
    milestone: schemas.MilestoneCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    return crud.create_milestone(db, milestone)


# Get All Milestones (Pagination)
@router.get("/")
def get_milestones(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_milestones(db, skip, limit)


# Search Milestones (Must be above /{milestone_id})
@router.get("/search")
def search_milestones(
    name: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.search_milestones(db, name)


# Get Milestone by ID
@router.get("/{milestone_id}")
def get_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    milestone = crud.get_milestone(db, milestone_id)
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return milestone


# Update Milestone
@router.put("/{milestone_id}")
def update_milestone(
    milestone_id: int,
    milestone: schemas.MilestoneCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    updated = crud.update_milestone(db, milestone_id, milestone)
    if not updated:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return updated


# Delete Milestone
@router.delete("/{milestone_id}")
def delete_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    deleted = crud.delete_milestone(db, milestone_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return {"message": "Milestone deleted successfully"}
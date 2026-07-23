from fastapi import APIRouter, Depends
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
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_milestones(db, skip, limit)


# Search Milestones
@router.get("/search")
def search_milestones(
    name: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.search_milestones(db, name)


@router.get("/{milestone_id}")
def get_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_milestone(db, milestone_id)


@router.put("/{milestone_id}")
def update_milestone(
    milestone_id: int,
    milestone: schemas.MilestoneUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    return crud.update_milestone(
        db,
        milestone_id,
        milestone
    )

@router.delete("/{milestone_id}")
def delete_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return crud.delete_milestone(db, milestone_id)
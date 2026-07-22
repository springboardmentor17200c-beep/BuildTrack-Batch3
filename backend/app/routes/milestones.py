from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/milestones",
    tags=["Milestones"]
)

@router.post("/")
def create_milestone(milestone: schemas.MilestoneCreate,
                     db: Session = Depends(get_db)):
    return crud.create_milestone(db, milestone)

@router.get("/")
def get_milestones(db: Session = Depends(get_db)):
    return crud.get_milestones(db)











from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import crud, schemas

router = APIRouter(
    prefix="/milestones",
    tags=["Milestones"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create Milestone
@router.post("/", response_model=schemas.MilestoneOut)
def create_milestone(
    milestone: schemas.MilestoneCreate,
    db: Session = Depends(get_db)
):
    return crud.create_milestone(db, milestone)


# Get All Milestones
@router.get("/", response_model=list[schemas.MilestoneOut])
def get_milestones(db: Session = Depends(get_db)):
    return crud.get_milestones(db)


# Get Milestone by ID
@router.get("/{milestone_id}", response_model=schemas.MilestoneOut)
def get_milestone(
    milestone_id: int,
    db: Session = Depends(get_db)
):
    milestone = crud.get_milestone(db, milestone_id)

    if not milestone:
        raise HTTPException(
            status_code=404,
            detail="Milestone not found"
        )

    return milestone


# Update Milestone
@router.put("/{milestone_id}", response_model=schemas.MilestoneOut)
def update_milestone(
    milestone_id: int,
    milestone: schemas.MilestoneCreate,
    db: Session = Depends(get_db)
):
    updated = crud.update_milestone(db, milestone_id, milestone)

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Milestone not found"
        )

    return updated


# Delete Milestone
@router.delete("/{milestone_id}")
def delete_milestone(
    milestone_id: int,
    db: Session = Depends(get_db)
):
    deleted = crud.delete_milestone(db, milestone_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Milestone not found"
        )

    return {"message": "Milestone deleted successfully"}
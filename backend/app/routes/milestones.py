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
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

@router.post("/")
def create_notification(data: schemas.NotificationCreate,
                        db: Session = Depends(get_db)):
    return crud.create_notification(db, data)

@router.get("/")
def get_notifications(db: Session = Depends(get_db)):
    return crud.get_notifications(db)
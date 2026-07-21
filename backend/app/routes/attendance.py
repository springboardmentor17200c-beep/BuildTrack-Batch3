from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)

@router.post("/")
def create_attendance(data: schemas.AttendanceCreate,
                      db: Session = Depends(get_db)):
    return crud.create_attendance(db, data)

@router.get("/")
def get_attendance(db: Session = Depends(get_db)):
    return crud.get_attendance(db)
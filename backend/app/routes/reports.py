from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

@router.post("/")
def create_report(data: schemas.ReportCreate,
                  db: Session = Depends(get_db)):
    return crud.create_report(db, data)

@router.get("/")
def get_reports(db: Session = Depends(get_db)):
    return crud.get_reports(db)
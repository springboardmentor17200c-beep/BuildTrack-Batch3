from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/procurements",
    tags=["Procurements"]
)

@router.post("/")
def create_procurement(data: schemas.ProcurementCreate,
                       db: Session = Depends(get_db)):
    return crud.create_procurement(db, data)

@router.get("/")
def get_procurements(db: Session = Depends(get_db)):
    return crud.get_procurements(db)
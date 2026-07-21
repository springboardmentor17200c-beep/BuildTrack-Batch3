from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/resources",
    tags=["Resources"]
)

@router.post("/")
def create_resource(resource: schemas.ResourceCreate,
                    db: Session = Depends(get_db)):
    return crud.create_resource(db, resource)

@router.get("/")
def get_resources(db: Session = Depends(get_db)):
    return crud.get_resources(db)
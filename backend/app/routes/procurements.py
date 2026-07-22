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



from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas


router = APIRouter(
    prefix="/procurements",
    tags=["Procurements"]
)


@router.post("/")
def create_procurement(
    procurement: schemas.ProcurementCreate,
    db: Session = Depends(get_db)
):
    return crud.create_procurement(
        db,
        procurement
    )



@router.get("/")
def get_procurements(
    db: Session = Depends(get_db)
):
    return crud.get_procurements(db)



@router.get("/{procurement_id}")
def get_procurement(
    procurement_id: int,
    db: Session = Depends(get_db)
):
    return crud.get_procurement(
        db,
        procurement_id
    )



@router.put("/{procurement_id}")
def update_procurement(
    procurement_id: int,
    procurement: schemas.ProcurementUpdate,
    db: Session = Depends(get_db)
):
    return crud.update_procurement(
        db,
        procurement_id,
        procurement
    )



@router.delete("/{procurement_id}")
def delete_procurement(
    procurement_id: int,
    db: Session = Depends(get_db)
):
    return crud.delete_procurement(
        db,
        procurement_id
    )
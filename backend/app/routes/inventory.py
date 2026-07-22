from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)

@router.post("/")
def create_inventory(item: schemas.InventoryCreate,
                     db: Session = Depends(get_db)):
    return crud.create_inventory(db, item)

@router.get("/")
def get_inventory(db: Session = Depends(get_db)):
    return crud.get_inventory(db)









from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


@router.post("/")
def create_inventory(
    inventory: schemas.InventoryCreate,
    db: Session = Depends(get_db)
):
    return crud.create_inventory(
        db,
        inventory
    )



@router.get("/")
def get_inventory(
    db: Session = Depends(get_db)
):
    return crud.get_inventory(db)



@router.get("/{inventory_id}")
def get_inventory_item(
    inventory_id: int,
    db: Session = Depends(get_db)
):
    return crud.get_inventory_item(
        db,
        inventory_id
    )



@router.put("/{inventory_id}")
def update_inventory(
    inventory_id: int,
    inventory: schemas.InventoryUpdate,
    db: Session = Depends(get_db)
):
    return crud.update_inventory(
        db,
        inventory_id,
        inventory
    )



@router.delete("/{inventory_id}")
def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db)
):
    return crud.delete_inventory(
        db,
        inventory_id
    )
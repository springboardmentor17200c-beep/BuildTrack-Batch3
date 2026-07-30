from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.dependencies import require_role
from app.auth import get_current_user

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)

# Create Inventory
@router.post("/")
def create_inventory(
    inventory: schemas.InventoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    return crud.create_inventory(db, inventory)


# Get All Inventory
@router.get("/")
def get_inventory(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_inventory(db, skip, limit)


# Low Stock (Must be above /{inventory_id})
@router.get("/low-stock")
def low_stock(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.low_stock(db)


# Search Inventory (Must be above /{inventory_id})
@router.get("/search")
def search_inventory(
    material: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.search_inventory(db, material)


# Get Inventory by ID
@router.get("/{inventory_id}")
def get_inventory_item(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    item = crud.get_inventory_item(db, inventory_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item


# Update Inventory
@router.put("/{inventory_id}")
def update_inventory(
    inventory_id: int,
    inventory: schemas.InventoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    updated = crud.update_inventory(db, inventory_id, inventory)
    if not updated:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return updated


# Delete Inventory
@router.delete("/{inventory_id}")
def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    deleted = crud.delete_inventory(db, inventory_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return {"message": "Inventory item deleted successfully"}


# Update Stock
@router.put("/{inventory_id}/stock")
def update_stock(
    inventory_id: int,
    quantity: int,
    db: Session = Depends(get_db)
):
    updated = crud.update_stock(db, inventory_id, quantity)
    if not updated:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return updated
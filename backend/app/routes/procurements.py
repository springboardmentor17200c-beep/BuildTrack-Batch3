from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.dependencies import require_role
from app.auth import get_current_user

router = APIRouter(
    prefix="/procurements",
    tags=["Procurements"]
)

# Create Procurement
@router.post("/")
def create_procurement(
    procurement: schemas.ProcurementCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    return crud.create_procurement(db, procurement)


# Get All Procurements
@router.get("/")
def get_procurements(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_procurements(db)


# Pending Procurements (Must be above /{procurement_id})
@router.get("/pending")
def pending(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.pending_procurements(db)


# Get Procurement By ID
@router.get("/{procurement_id}")
def get_procurement(
    procurement_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    proc = crud.get_procurement(db, procurement_id)
    if not proc:
        raise HTTPException(status_code=404, detail="Procurement item not found")
    return proc


# Update Procurement
@router.put("/{procurement_id}")
def update_procurement(
    procurement_id: int,
    procurement: schemas.ProcurementUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    updated = crud.update_procurement(db, procurement_id, procurement)
    if not updated:
        raise HTTPException(status_code=404, detail="Procurement item not found")
    return updated


# Update Procurement Status
@router.patch("/{procurement_id}/status")
def update_status(
    procurement_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    updated = crud.update_procurement_status(db, procurement_id, status)
    if not updated:
        raise HTTPException(status_code=404, detail="Procurement item not found")
    return updated


# Delete Procurement
@router.delete("/{procurement_id}")
def delete_procurement(
    procurement_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    deleted = crud.delete_procurement(db, procurement_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Procurement item not found")
    return {"message": "Procurement item deleted successfully"}
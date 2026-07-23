from fastapi import APIRouter, Depends
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


# Get Procurement By ID
@router.get("/{procurement_id}")
def get_procurement(
    procurement_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_procurement(db, procurement_id)


# Update Procurement
@router.put("/{procurement_id}")
def update_procurement(
    procurement_id: int,
    procurement: schemas.ProcurementUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    return crud.update_procurement(
        db,
        procurement_id,
        procurement
    )


# Delete Procurement
@router.delete("/{procurement_id}")
def delete_procurement(
    procurement_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return crud.delete_procurement(db, procurement_id)


# Pending Procurements
@router.get("/pending")
def pending(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.pending_procurements(db)
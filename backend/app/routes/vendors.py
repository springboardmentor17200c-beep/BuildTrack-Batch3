from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.auth import get_current_user
from app.dependencies import require_role

router = APIRouter(
    prefix="/vendors",
    tags=["Vendors"]
)

@router.post("/")
def create_vendor(
    vendor: schemas.VendorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    return crud.create_vendor(db, vendor)

@router.get("/")
def get_vendors(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_vendors(db, skip, limit)

@router.get("/{vendor_id}")
def get_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    vendor = crud.get_vendor(db, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor

@router.put("/{vendor_id}")
def update_vendor(
    vendor_id: int,
    vendor: schemas.VendorUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    updated = crud.update_vendor(db, vendor_id, vendor)
    if not updated:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return updated

@router.delete("/{vendor_id}")
def delete_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    deleted = crud.delete_vendor(db, vendor_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {"message": "Vendor deleted successfully"}

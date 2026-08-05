from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/vendors",
    tags=["Vendors"]
)


@router.post("/")
def create_vendor(
    vendor: schemas.VendorCreate,
    db: Session = Depends(get_db)
):
    return crud.create_vendor(db, vendor)


@router.get("/")
def get_vendors(
    db: Session = Depends(get_db)
):
    return crud.get_vendors(db)


@router.get("/{vendor_id}")
def get_vendor(
    vendor_id: int,
    db: Session = Depends(get_db)
):
    vendor = crud.get_vendor(db, vendor_id)

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    return vendor


@router.put("/{vendor_id}")
def update_vendor(
    vendor_id: int,
    vendor: schemas.VendorUpdate,
    db: Session = Depends(get_db)
):
    updated = crud.update_vendor(
        db,
        vendor_id,
        vendor
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    return updated


@router.delete("/{vendor_id}")
def delete_vendor(
    vendor_id: int,
    db: Session = Depends(get_db)
):
    deleted = crud.delete_vendor(
        db,
        vendor_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    return deleted
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/purchase-orders",
    tags=["Purchase Orders"]
)


@router.post("/")
def create_purchase_order(
    purchase_order: schemas.PurchaseOrderCreate,
    db: Session = Depends(get_db)
):
    return crud.create_purchase_order(db, purchase_order)


@router.get("/")
def get_purchase_orders(
    db: Session = Depends(get_db)
):
    return crud.get_purchase_orders(db)


@router.get("/{po_id}")
def get_purchase_order(
    po_id: int,
    db: Session = Depends(get_db)
):
    purchase_order = crud.get_purchase_order(db, po_id)

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    return purchase_order


@router.put("/{po_id}")
def update_purchase_order(
    po_id: int,
    purchase_order: schemas.PurchaseOrderUpdate,
    db: Session = Depends(get_db)
):
    updated = crud.update_purchase_order(
        db,
        po_id,
        purchase_order
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    return updated


@router.delete("/{po_id}")
def delete_purchase_order(
    po_id: int,
    db: Session = Depends(get_db)
):
    deleted = crud.delete_purchase_order(db, po_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    return deleted
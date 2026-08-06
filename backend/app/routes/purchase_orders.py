from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.auth import get_current_user
from app.dependencies import require_role

router = APIRouter(
    prefix="/purchase-orders",
    tags=["Purchase Orders"]
)

@router.post("/")
def create_purchase_order(
    po: schemas.PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    vendor = crud.get_vendor(db, po.vendor_id)
    if not vendor:
        raise HTTPException(status_code=400, detail="Specified vendor does not exist")
    project = crud.get_project(db, po.project_id)
    if not project:
        raise HTTPException(status_code=400, detail="Specified project does not exist")
    return crud.create_purchase_order(db, po)

@router.get("/")
def get_purchase_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_purchase_orders(db, skip, limit)

@router.get("/{po_id}")
def get_purchase_order(
    po_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    po = crud.get_purchase_order(db, po_id)
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return po

@router.put("/{po_id}")
def update_purchase_order(
    po_id: int,
    po_update: schemas.PurchaseOrderUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    updated = crud.update_purchase_order(db, po_id, po_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return updated

@router.post("/{po_id}/receive")
def receive_material_delivery(
    po_id: int,
    received_quantity: int = Body(None, embed=True),
    status: str = Body("Received", embed=True),
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager", "Contractor", "Site Engineer"))
):
    received = crud.receive_material_delivery(db, po_id, received_quantity=received_quantity, status=status)
    if not received:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return {
        "message": "Material delivery received and inventory stock automatically updated!",
        "purchase_order": received
    }

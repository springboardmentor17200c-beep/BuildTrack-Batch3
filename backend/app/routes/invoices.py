from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.auth import get_current_user
from app.dependencies import require_role

router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"]
)

@router.post("/")
def create_invoice(
    invoice: schemas.InvoiceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager", "Contractor"))
):
    vendor = crud.get_vendor(db, invoice.vendor_id)
    if not vendor:
        raise HTTPException(status_code=400, detail="Specified vendor does not exist")
    po = crud.get_purchase_order(db, invoice.purchase_order_id)
    if not po:
        raise HTTPException(status_code=400, detail="Specified purchase order does not exist")
    return crud.create_invoice(db, invoice)

@router.get("/")
def get_invoices(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_invoices(db, skip, limit)

@router.get("/{invoice_id}")
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    inv = crud.get_invoice(db, invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return inv

@router.put("/{invoice_id}/payment")
def update_payment_status(
    invoice_id: int,
    payload: schemas.InvoicePaymentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    updated = crud.update_invoice_payment(db, invoice_id, payload.payment_status)
    if not updated:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return updated

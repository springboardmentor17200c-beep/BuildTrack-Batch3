from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"]
)


@router.post("/")
def create_invoice(
    invoice: schemas.InvoiceCreate,
    db: Session = Depends(get_db)
):
    return crud.create_invoice(db, invoice)


@router.get("/")
def get_invoices(
    db: Session = Depends(get_db)
):
    return crud.get_invoices(db)


@router.get("/{invoice_id}")
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    invoice = crud.get_invoice(db, invoice_id)

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    return invoice


@router.put("/{invoice_id}")
def update_invoice(
    invoice_id: int,
    invoice: schemas.InvoiceUpdate,
    db: Session = Depends(get_db)
):
    updated = crud.update_invoice(
        db,
        invoice_id,
        invoice
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    return updated


@router.delete("/{invoice_id}")
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    deleted = crud.delete_invoice(
        db,
        invoice_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    return deleted
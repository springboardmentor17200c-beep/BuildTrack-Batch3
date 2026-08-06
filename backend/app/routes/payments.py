from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.post("/")
def create_payment(
    payment: schemas.PaymentCreate,
    db: Session = Depends(get_db)
):
    return crud.create_payment(db, payment)


@router.get("/")
def get_payments(
    db: Session = Depends(get_db)
):
    return crud.get_payments(db)


@router.get("/{payment_id}")
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db)
):
    payment = crud.get_payment(db, payment_id)

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return payment


@router.put("/{payment_id}")
def update_payment(
    payment_id: int,
    payment: schemas.PaymentUpdate,
    db: Session = Depends(get_db)
):
    updated = crud.update_payment(
        db,
        payment_id,
        payment
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return updated


@router.put("/{payment_id}/paid")
def mark_payment_paid(
    payment_id: int,
    db: Session = Depends(get_db)
):
    payment = crud.mark_payment_paid(
        db,
        payment_id
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return payment


@router.delete("/{payment_id}")
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db)
):
    deleted = crud.delete_payment(
        db,
        payment_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return deleted
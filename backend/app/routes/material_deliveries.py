from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/material-deliveries",
    tags=["Material Deliveries"]
)


@router.post("/")
def create_material_delivery(
    delivery: schemas.MaterialDeliveryCreate,
    db: Session = Depends(get_db)
):
    return crud.create_material_delivery(db, delivery)


@router.get("/")
def get_material_deliveries(
    db: Session = Depends(get_db)
):
    return crud.get_material_deliveries(db)


@router.get("/{delivery_id}")
def get_material_delivery(
    delivery_id: int,
    db: Session = Depends(get_db)
):
    delivery = crud.get_material_delivery(
        db,
        delivery_id
    )

    if not delivery:
        raise HTTPException(
            status_code=404,
            detail="Material Delivery not found"
        )

    return delivery


@router.put("/{delivery_id}")
def update_material_delivery(
    delivery_id: int,
    delivery: schemas.MaterialDeliveryUpdate,
    db: Session = Depends(get_db)
):
    updated = crud.update_material_delivery(
        db,
        delivery_id,
        delivery
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Material Delivery not found"
        )

    return updated


@router.delete("/{delivery_id}")
def delete_material_delivery(
    delivery_id: int,
    db: Session = Depends(get_db)
):
    deleted = crud.delete_material_delivery(
        db,
        delivery_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Material Delivery not found"
        )

    return deleted
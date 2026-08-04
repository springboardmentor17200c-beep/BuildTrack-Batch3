from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/requests",
    tags=["Material Requests"]
)


@router.post("/")
def create_request(
    request: schemas.MaterialRequestCreate,
    db: Session = Depends(get_db)
):
    return crud.create_material_request(db, request)


@router.get("/")
def get_requests(
    db: Session = Depends(get_db)
):
    return crud.get_material_requests(db)


@router.get("/{request_id}")
def get_request(
    request_id: int,
    db: Session = Depends(get_db)
):
    request = crud.get_material_request(db, request_id)

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Material Request not found"
        )

    return request


@router.put("/{request_id}")
def update_request(
    request_id: int,
    request: schemas.MaterialRequestUpdate,
    db: Session = Depends(get_db)
):
    updated = crud.update_material_request(
        db,
        request_id,
        request
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Material Request not found"
        )

    return updated


@router.put("/{request_id}/approve")
def approve_request(
    request_id: int,
    db: Session = Depends(get_db)
):
    request = crud.approve_material_request(
        db,
        request_id
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Material Request not found"
        )

    return request


@router.put("/{request_id}/reject")
def reject_request(
    request_id: int,
    db: Session = Depends(get_db)
):
    request = crud.reject_material_request(
        db,
        request_id
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Material Request not found"
        )

    return request


@router.delete("/{request_id}")
def delete_request(
    request_id: int,
    db: Session = Depends(get_db)
):
    deleted = crud.delete_material_request(
        db,
        request_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Material Request not found"
        )

    return deleted
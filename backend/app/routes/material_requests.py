from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.auth import get_current_user
from app.dependencies import require_role

router = APIRouter(
    prefix="/requests",
    tags=["Material Requests"]
)

@router.post("/")
def create_request(
    request: schemas.MaterialRequestCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = current_user.id if hasattr(current_user, 'id') else None
    return crud.create_material_request(db, request, user_id=user_id)

@router.get("/")
def get_requests(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_material_requests(db, skip, limit)

@router.get("/{request_id}")
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    req = crud.get_material_request(db, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Material request not found")
    return req

@router.put("/{request_id}/approve")
def approve_request(
    request_id: int,
    payload: schemas.MaterialRequestApprove = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    comments = payload.comments if payload else None
    approved = crud.approve_material_request(db, request_id, comments=comments)
    if not approved:
        raise HTTPException(status_code=404, detail="Material request not found")
    return approved

@router.put("/{request_id}/reject")
def reject_request(
    request_id: int,
    payload: schemas.MaterialRequestReject = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    comments = payload.comments if payload else None
    rejected = crud.reject_material_request(db, request_id, comments=comments)
    if not rejected:
        raise HTTPException(status_code=404, detail="Material request not found")
    return rejected

@router.put("/{request_id}")
def update_request(
    request_id: int,
    request: schemas.MaterialRequestCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    updated = crud.update_material_request(db, request_id, request)
    if not updated:
        raise HTTPException(status_code=404, detail="Material request not found")
    return updated

@router.delete("/{request_id}")
def delete_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    deleted = crud.delete_material_request(db, request_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Material request not found")
    return {"message": "Material request deleted successfully"}



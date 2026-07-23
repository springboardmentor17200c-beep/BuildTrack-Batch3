from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.dependencies import require_role
from app.auth import get_current_user

router = APIRouter(
    prefix="/resources",
    tags=["Resources"]
)

# Create Resource
@router.post("/")
def create_resource(
    resource: schemas.ResourceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    return crud.create_resource(db, resource)



@router.get("/")
def get_resources(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_resources(db, skip, limit)


# Get Resource By ID
@router.get("/{resource_id}")
def get_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    resource = crud.get_resource(db, resource_id)

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    return resource


# Update Resource
@router.put("/{resource_id}")
def update_resource(
    resource_id: int,
    resource: schemas.ResourceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    updated = crud.update_resource(db, resource_id, resource)

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    return updated


# Delete Resource
@router.delete("/{resource_id}")
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    deleted = crud.delete_resource(db, resource_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    return {"message": "Resource deleted successfully"}


@router.get("/search")
def search_resources(
    name: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.search_resources(db, name)


@router.put("/{resource_id}/allocate")
def allocate(
    resource_id: int,
    db: Session = Depends(get_db)
):
    return crud.allocate_resource(db, resource_id)


@router.get("/available")
def available(
    db: Session = Depends(get_db)
):
    return crud.available_resources(db)
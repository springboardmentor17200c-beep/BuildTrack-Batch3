from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/resources",
    tags=["Resources"]
)

@router.post("/")
def create_resource(resource: schemas.ResourceCreate,
                    db: Session = Depends(get_db)):
    return crud.create_resource(db, resource)

@router.get("/")
def get_resources(db: Session = Depends(get_db)):
    return crud.get_resources(db)





from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import crud, schemas

router = APIRouter(
    prefix="/resources",
    tags=["Resources"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create Resource
@router.post("/", response_model=schemas.ResourceOut)
def create_resource(
    resource: schemas.ResourceCreate,
    db: Session = Depends(get_db)
):
    return crud.create_resource(db, resource)


# Get All Resources
@router.get("/", response_model=list[schemas.ResourceOut])
def get_resources(db: Session = Depends(get_db)):
    return crud.get_resources(db)


# Get Resource by ID
@router.get("/{resource_id}", response_model=schemas.ResourceOut)
def get_resource(
    resource_id: int,
    db: Session = Depends(get_db)
):
    resource = crud.get_resource(db, resource_id)

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    return resource


# Update Resource
@router.put("/{resource_id}", response_model=schemas.ResourceOut)
def update_resource(
    resource_id: int,
    resource: schemas.ResourceCreate,
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
):
    deleted = crud.delete_resource(db, resource_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    return {"message": "Resource deleted successfully"}



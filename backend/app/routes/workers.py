from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.dependencies import require_role
from app.auth import get_current_user

router = APIRouter(
    prefix="/workers",
    tags=["Workers"]
)

# Create Worker
@router.post("/")
def create_worker(
    worker: schemas.WorkerCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    return crud.create_worker(db, worker)


# Get All Workers
@router.get("/")
def get_workers(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_workers(db, skip, limit)


# Get Worker By ID
@router.get("/{worker_id}")
def get_worker(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_worker(db, worker_id)


# Update Worker
@router.put("/{worker_id}")
def update_worker(
    worker_id: int,
    worker: schemas.WorkerUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    return crud.update_worker(db, worker_id, worker)


# Delete Worker
@router.delete("/{worker_id}")
def delete_worker(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return crud.delete_worker(db, worker_id)



@router.get("/search")
def search_workers(
    name: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.search_workers(db, name)




@router.put("/{worker_id}/assign")
def assign(
    worker_id: int,
    project_id: int,
    db: Session = Depends(get_db)
):
    return crud.assign_worker(
        db,
        worker_id,
        project_id
    )


@router.get("/{worker_id}/history")
def history(
    worker_id: int,
    db: Session = Depends(get_db)
):
    return crud.worker_history(
        db,
        worker_id
    )
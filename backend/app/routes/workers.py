from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/workers",
    tags=["Workers"]
)

@router.post("/")
def create_worker(worker: schemas.WorkerCreate,
                  db: Session = Depends(get_db)):
    return crud.create_worker(db, worker)

@router.get("/")
def get_workers(db: Session = Depends(get_db)):
    return crud.get_workers(db)







from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas


router = APIRouter(
    prefix="/workers",
    tags=["Workers"]
)


@router.post("/")
def create_worker(
    worker: schemas.WorkerCreate,
    db: Session = Depends(get_db)
):
    return crud.create_worker(db, worker)



@router.get("/")
def get_workers(
    db: Session = Depends(get_db)
):
    return crud.get_workers(db)



@router.get("/{worker_id}")
def get_worker(
    worker_id: int,
    db: Session = Depends(get_db)
):
    return crud.get_worker(db, worker_id)



@router.put("/{worker_id}")
def update_worker(
    worker_id: int,
    worker: schemas.WorkerUpdate,
    db: Session = Depends(get_db)
):
    return crud.update_worker(
        db,
        worker_id,
        worker
    )



@router.delete("/{worker_id}")
def delete_worker(
    worker_id: int,
    db: Session = Depends(get_db)
):
    return crud.delete_worker(
        db,
        worker_id
    )
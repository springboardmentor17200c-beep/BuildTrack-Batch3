from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

@router.post("/")
def create_notification(data: schemas.NotificationCreate,
                        db: Session = Depends(get_db)):
    return crud.create_notification(db, data)

@router.get("/")
def get_notifications(db: Session = Depends(get_db)):
    return crud.get_notifications(db)











from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.post("/")
def create_notification(
    notification: schemas.NotificationCreate,
    db: Session = Depends(get_db)
):
    return crud.create_notification(
        db,
        notification
    )



@router.get("/")
def get_notifications(
    db: Session = Depends(get_db)
):
    return crud.get_notifications(db)



@router.get("/{notification_id}")
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):
    return crud.get_notification(
        db,
        notification_id
    )



@router.put("/{notification_id}")
def update_notification(
    notification_id: int,
    notification: schemas.NotificationUpdate,
    db: Session = Depends(get_db)
):
    return crud.update_notification(
        db,
        notification_id,
        notification
    )



@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):
    return crud.delete_notification(
        db,
        notification_id
    )
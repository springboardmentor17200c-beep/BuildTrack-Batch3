from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.dependencies import require_role
from app.auth import get_current_user

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

# Create Notification
@router.post("/")
def create_notification(
    notification: schemas.NotificationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    return crud.create_notification(db, notification)


# Get All Notifications
@router.get("/")
def get_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_notifications(db)


# Get Notification By ID
@router.get("/{notification_id}")
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_notification(db, notification_id)


# Update Notification
@router.put("/{notification_id}")
def update_notification(
    notification_id: int,
    notification: schemas.NotificationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    return crud.update_notification(db, notification_id, notification)


# Delete Notification
@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return crud.delete_notification(db, notification_id)
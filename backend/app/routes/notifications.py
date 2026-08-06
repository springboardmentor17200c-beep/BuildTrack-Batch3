from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.dependencies import require_role
from app.auth import get_current_user

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# Create Notification (Admin / Project Manager only)
@router.post("/", response_model=schemas.NotificationResponse)
def create_notification(
    notification: schemas.NotificationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    return crud.create_notification(db, notification)


# Get all notifications for the currently logged-in user only
@router.get("/", response_model=list[schemas.NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_notifications_by_user(db, user_id=current_user.id)


# Mark a single notification as read
@router.put("/{notification_id}/read", response_model=schemas.NotificationResponse)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    notification = crud.get_notification(db, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only mark your own notifications as read"
        )
    return crud.mark_notification_read(db, notification_id)


# Get a single notification by ID (owner only)
@router.get("/{notification_id}", response_model=schemas.NotificationResponse)
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    notification = crud.get_notification(db, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    return notification


# Delete Notification (Admin only)
@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    notification = crud.get_notification(db, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return crud.delete_notification(db, notification_id)

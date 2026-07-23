from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.dependencies import require_role
from app.auth import get_current_user

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)

@router.post("/")
def create_attendance(
    attendance: schemas.AttendanceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager", "Site Engineer"))
):
    return crud.create_attendance(db, attendance)


@router.get("/")
def get_attendance(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_attendance(db)


@router.get("/{attendance_id}")
def get_attendance_by_id(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_attendance_record(db, attendance_id)


@router.put("/{attendance_id}")
def update_attendance(
    attendance_id: int,
    attendance: schemas.AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager", "Site Engineer"))
):
    return crud.update_attendance(
        db,
        attendance_id,
        attendance
    )


@router.delete("/{attendance_id}")
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return crud.delete_attendance(db, attendance_id)


@router.get("/today")
def attendance_today(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.today_attendance(db)








@router.post("/")
def mark(
    attendance: schemas.AttendanceCreate,
    db: Session = Depends(get_db)
):
    return crud.mark_attendance(
        db,
        attendance
    )


@router.get("/monthly")
def monthly(
    month: int,
    year: int,
    db: Session = Depends(get_db)
):
    return crud.monthly_report(
        db,
        month,
        year
    )


@router.get("/present-count")
def present(
    db: Session = Depends(get_db)
):
    return crud.present_count(db)


@router.get("/absent-count")
def absent(
    db: Session = Depends(get_db)
):
    return crud.absent_count(db)
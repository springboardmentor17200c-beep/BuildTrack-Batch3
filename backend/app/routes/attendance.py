from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)

@router.post("/")
def create_attendance(data: schemas.AttendanceCreate,
                      db: Session = Depends(get_db)):
    return crud.create_attendance(db, data)

@router.get("/")
def get_attendance(db: Session = Depends(get_db)):
    return crud.get_attendance(db)




from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)


@router.post("/")
def create_attendance(
    attendance: schemas.AttendanceCreate,
    db: Session = Depends(get_db)
):
    return crud.create_attendance(
        db,
        attendance
    )


@router.get("/")
def get_attendance(
    db: Session = Depends(get_db)
):
    return crud.get_attendance(db)



@router.get("/{attendance_id}")
def get_attendance_by_id(
    attendance_id: int,
    db: Session = Depends(get_db)
):
    return crud.get_attendance_record(
        db,
        attendance_id
    )



@router.put("/{attendance_id}")
def update_attendance(
    attendance_id: int,
    attendance: schemas.AttendanceUpdate,
    db: Session = Depends(get_db)
):
    return crud.update_attendance(
        db,
        attendance_id,
        attendance
    )



@router.delete("/{attendance_id}")
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db)
):
    return crud.delete_attendance(
        db,
        attendance_id
    )
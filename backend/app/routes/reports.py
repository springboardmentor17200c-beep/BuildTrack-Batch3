from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

@router.post("/")
def create_report(data: schemas.ReportCreate,
                  db: Session = Depends(get_db)):
    return crud.create_report(db, data)

@router.get("/")
def get_reports(db: Session = Depends(get_db)):
    return crud.get_reports(db)










from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.post("/")
def create_report(
    report: schemas.ReportCreate,
    db: Session = Depends(get_db)
):
    return crud.create_report(
        db,
        report
    )



@router.get("/")
def get_reports(
    db: Session = Depends(get_db)
):
    return crud.get_reports(db)



@router.get("/{report_id}")
def get_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    return crud.get_report(
        db,
        report_id
    )



@router.put("/{report_id}")
def update_report(
    report_id: int,
    report: schemas.ReportUpdate,
    db: Session = Depends(get_db)
):
    return crud.update_report(
        db,
        report_id,
        report
    )



@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    return crud.delete_report(
        db,
        report_id
    )
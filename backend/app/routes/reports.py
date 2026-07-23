from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.dependencies import require_role
from app.auth import get_current_user

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

# Create Report
@router.post("/")
def create_report(
    report: schemas.ReportCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    return crud.create_report(db, report)


# Get All Reports
@router.get("/")
def get_reports(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_reports(db)


# Get Report By ID
@router.get("/{report_id}")
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_report(db, report_id)


# Update Report
@router.put("/{report_id}")
def update_report(
    report_id: int,
    report: schemas.ReportUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    return crud.update_report(db, report_id, report)


# Delete Report
@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return crud.delete_report(db, report_id)
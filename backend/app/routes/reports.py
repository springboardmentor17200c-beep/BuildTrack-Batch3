from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.dependencies import require_role
from app.auth import get_current_user
from app.pdf_generator import generate_pdf_report
from app.excel_generator import generate_excel_report

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

# Create Report (Generates PDF and Excel Documents)
@router.post("")
@router.post("/")
def create_report(
    report: schemas.ReportCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager", "Site Engineer", "Contractor", "Client", "Store Manager"))
):
    pdf_url = generate_pdf_report(
        db,
        report.project_id,
        report.report_type,
        current_user.id
    )
    generate_excel_report(
        db,
        report.project_id,
        report.report_type,
        current_user.id
    )
    report.report_url = pdf_url
    return crud.create_report(db, report)


# Get All Reports
@router.get("")
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
    rec = crud.get_report(db, report_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Report not found")
    return rec


# Update Report
@router.put("/{report_id}")
def update_report(
    report_id: int,
    report: schemas.ReportUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager"))
):
    updated = crud.update_report(db, report_id, report)
    if not updated:
        raise HTTPException(status_code=404, detail="Report not found")
    return updated


# Delete Report
@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    deleted = crud.delete_report(db, report_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Report deleted successfully"}
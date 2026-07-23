from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_role
from app import crud

router=APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/")
def dashboard(
    db:Session=Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return crud.admin_dashboard(db)
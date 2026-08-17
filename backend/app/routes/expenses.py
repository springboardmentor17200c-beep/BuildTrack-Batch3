from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.dependencies import require_role
from app.auth import get_current_user

router = APIRouter(
    prefix="/expenses",
    tags=["Expense Tracking"]
)

# 1. Log Site Expense
@router.post("/", response_model=schemas.ExpenseResponse)
@router.post("", response_model=schemas.ExpenseResponse)
def create_expense(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager", "Site Engineer", "Contractor", "Finance", "Store Manager"))
):
    return crud.create_expense(db, expense)

# 2. List Expenses (Filtered by project_id and/or category)
@router.get("/", response_model=List[schemas.ExpenseResponse])
@router.get("", response_model=List[schemas.ExpenseResponse])
def get_expenses(
    project_id: Optional[int] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_expenses(db, project_id=project_id, category=category)

# 3. Void/Delete Expense
@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager", "Finance"))
):
    deleted = crud.delete_expense(db, expense_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Expense record not found")
    return {"message": "Expense record deleted successfully"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.dependencies import require_role
from app.auth import get_current_user

router = APIRouter(
    prefix="/budget",
    tags=["Budget & Cost Management"]
)

# 1. Budget Planning - Set Target Limits
@router.post("/plan", response_model=schemas.BudgetPlanResponse)
def set_budget_plan(
    plan: schemas.BudgetPlanCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Project Manager", "Finance"))
):
    return crud.set_budget_plan(db, plan)

# 2. Retrieve Budget Plan
@router.get("/plan/{project_id}", response_model=schemas.BudgetPlanResponse)
def get_budget_plan(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    plan = crud.get_budget_plan(db, project_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Budget plan not found for project")
    return plan

# 3. Live Budget Monitoring API (Allocated, Spent, Remaining, Burn Rate %, Category Breakdown)
@router.get("/status/{project_id}", response_model=schemas.BudgetStatusResponse)
def get_budget_status(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_project_budget_status(db, project_id)

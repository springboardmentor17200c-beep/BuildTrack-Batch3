from pydantic import BaseModel, EmailStr, constr, Field
from datetime import date
from typing import Optional
from enum import Enum

class ProjectStatus(str, Enum):
    Pending = "Pending"
    Running = "Running"
    Completed = "Completed"

class AttendanceStatus(str, Enum):
    Present = "Present"
    Absent = "Absent"
    OnLeave = "On Leave"


# ---------------- USERS ----------------

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    phone: Optional[constr(pattern=r'^\d{10}$')] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ---------------- PROJECTS ----------------

class ProjectCreate(BaseModel):
    project_name: str
    description: Optional[str] = None
    location: str
    budget: float = Field(gt=0)
    start_date: date
    end_date: date
    status: ProjectStatus
    manager_id: int

class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    location: Optional[str] = None
    budget: Optional[float] = None
    status: Optional[str] = None


class ProjectResponse(ProjectCreate):
    id: int

    class Config:
        from_attributes = True


# ---------------- MILESTONES ----------------

class MilestoneCreate(BaseModel):
    project_id: int
    milestone_name: str
    due_date: date
    completed_date: Optional[date] = None
    status: str

class MilestoneUpdate(MilestoneCreate):
    pass


# ---------------- RESOURCES ----------------

class ResourceCreate(BaseModel):
    project_id: int
    resource_name: str
    category: str
    quantity: int = Field(gt=0)
    status: str


# ---------------- INVENTORY ----------------

class InventoryCreate(BaseModel):
    project_id: int
    material_name: str
    category: str = "Cement"
    unit: str
    supplier: str
    quantity: int = Field(gt=0)
    minimum_stock: int = Field(ge=0)

class InventoryUpdate(InventoryCreate):
    pass


# ---------------- WORKERS ----------------

class WorkerCreate(BaseModel):
    project_id: int
    name: str
    phone: Optional[constr(pattern=r'^\d{10}$')] = None
    designation: str
    salary: float = Field(gt=0)

class WorkerUpdate(WorkerCreate):
    pass


# ---------------- ATTENDANCE ----------------

class AttendanceCreate(BaseModel):
    worker_id: int
    project_id: int
    attendance_date: date
    status: AttendanceStatus
    check_in: str
    check_out: str = ""

class AttendanceUpdate(AttendanceCreate):
    pass


# ---------------- PROCUREMENT ----------------

class ProcurementCreate(BaseModel):
    project_id: int
    material_name: str
    supplier: str
    quantity: int = Field(gt=0)
    total_cost: float = Field(gt=0)
    status: str = "Pending"
    purchase_date: date

class ProcurementUpdate(ProcurementCreate):
    pass


# ---------------- NOTIFICATIONS ----------------

class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str

class NotificationUpdate(NotificationCreate):
    pass


# ---------------- REPORTS ----------------

class ReportCreate(BaseModel):
    project_id: int
    generated_by: int
    report_type: str
    report_url: str

class ReportUpdate(ReportCreate):
    pass

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

class ProjectBase(BaseModel):
    project_name: str
    description: Optional[str] = None
    location: str
    budget: float = Field(gt=0)
    start_date: date
    end_date: date
    status: ProjectStatus
    manager_id: int


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    location: Optional[str] = None
    budget: Optional[float] = None
    status: Optional[ProjectStatus] = None


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

<<<<<<< HEAD
class MilestoneUpdate(BaseModel):
    milestone_name: Optional[str] = None
    due_date: Optional[date] = None
    completed_date: Optional[date] = None
    status: Optional[str] = None
=======
class MilestoneUpdate(MilestoneCreate):
    pass

>>>>>>> 471161618f1fcc8c3ac2404a743d1fb7371ffff6

# ---------------- RESOURCES ----------------

class ResourceCreate(BaseModel):
    project_id: int
    resource_name: str
    category: str
    quantity: int = Field(gt=0)
    status: str

class ResourceUpdate(BaseModel):
    resource_name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    status: Optional[str] = None

# ---------------- INVENTORY ----------------

class InventoryCreate(BaseModel):
    project_id: int
    material_name: str
    category: str = "Cement"
    unit: str
    supplier: str
    quantity: int = Field(gt=0)
    minimum_stock: int = Field(ge=0)

<<<<<<< HEAD
class InventoryUpdate(BaseModel):
    material_name: Optional[str] = None
    unit: Optional[str] = None
    supplier: Optional[str] = None
    quantity: Optional[int] = None
    minimum_stock: Optional[int] = None
=======
class InventoryUpdate(InventoryCreate):
    pass
>>>>>>> 471161618f1fcc8c3ac2404a743d1fb7371ffff6


# ---------------- WORKERS ----------------

class WorkerCreate(BaseModel):
    project_id: int
    name: str
    phone: Optional[constr(pattern=r'^\d{10}$')] = None
    designation: str
    salary: float = Field(gt=0)

<<<<<<< HEAD
class WorkerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    salary: Optional[float] = None
=======
class WorkerUpdate(WorkerCreate):
    pass

>>>>>>> 471161618f1fcc8c3ac2404a743d1fb7371ffff6

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

class AttendanceUpdate(BaseModel):
    attendance_date: Optional[date] = None
    status: Optional[ProjectStatus] = None
    check_in: Optional[str] = None
    check_out: Optional[str] = None

# ---------------- PROCUREMENT ----------------

class ProcurementCreate(BaseModel):
    project_id: int
    material_name: str
    supplier: str
    quantity: int = Field(gt=0)
    total_cost: float = Field(gt=0)
    status: str = "Pending"
    purchase_date: date

<<<<<<< HEAD
class ProcurementUpdate(BaseModel):
    material_name: Optional[str] = None
    supplier: Optional[str] = None
    quantity: Optional[int] = None
    total_cost: Optional[float] = None
    status: Optional[str] = None
    purchase_date: Optional[date] = None
=======
class ProcurementUpdate(ProcurementCreate):
    pass
>>>>>>> 471161618f1fcc8c3ac2404a743d1fb7371ffff6


# ---------------- NOTIFICATIONS ----------------

class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str

<<<<<<< HEAD
class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
=======
class NotificationUpdate(NotificationCreate):
    pass

>>>>>>> 471161618f1fcc8c3ac2404a743d1fb7371ffff6

# ---------------- REPORTS ----------------

class ReportCreate(BaseModel):
    project_id: int
    generated_by: int
    report_type: str
    report_url: str

<<<<<<< HEAD
class ReportUpdate(BaseModel):
    report_type: Optional[str] = None
    report_url: Optional[str] = None    
=======
class ReportUpdate(ReportCreate):
    pass
>>>>>>> 471161618f1fcc8c3ac2404a743d1fb7371ffff6

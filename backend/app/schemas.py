from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional
from enum import Enum


# ---------------- USERS ----------------

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ---------------- PROJECTS ----------------

class ProjectCreate(BaseModel):
    project_name: str
    description: Optional[str] = None
    location: str
    budget: float
    start_date: date
    end_date: date
    status: str
    manager_id: int


# ---------------- MILESTONES ----------------

class MilestoneCreate(BaseModel):
    project_id: int
    milestone_name: str
    due_date: date
    completed_date: Optional[date] = None
    status: str


# ---------------- RESOURCES ----------------

class ResourceCreate(BaseModel):
    project_id: int
    resource_name: str
    category: str
    quantity: int
    status: str


# ---------------- INVENTORY ----------------

class InventoryCreate(BaseModel):
    project_id: int
    material_name: str
    quantity: int
    unit: str
    minimum_stock: int
    supplier: str


# ---------------- WORKERS ----------------

class WorkerCreate(BaseModel):
    project_id: int
    name: str
    phone: str
    designation: str
    salary: float


# ---------------- ATTENDANCE ----------------

class AttendanceCreate(BaseModel):
    worker_id: int
    project_id: int
    attendance_date: date
    status: str
    check_in: str
    check_out: str


# ---------------- PROCUREMENT ----------------

class ProcurementCreate(BaseModel):
    project_id: int
    material_name: str
    supplier: str
    quantity: int
    total_cost: float
    purchase_date: date
    status: str


# ---------------- NOTIFICATIONS ----------------

class NotificationType(str, Enum):
    PROJECT_UPDATE = "Project Update"
    TASK_ASSIGNMENT = "Task Assignment"
    PROCUREMENT_ALERT = "Procurement Alert"
    ATTENDANCE_ALERT = "Attendance Alert"
    DEADLINE_NOTIFICATION = "Deadline Notification"
    SYSTEM_NOTIFICATION = "System Notification"


class NotificationCreate(BaseModel):
    user_id: int
    notification_type: NotificationType = NotificationType.SYSTEM_NOTIFICATION
    title: str
    message: str


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    notification_type: NotificationType
    title: str
    message: str
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------- REPORTS ----------------

class ReportCreate(BaseModel):
    project_id: int
    generated_by: int
    report_type: str
    report_url: str
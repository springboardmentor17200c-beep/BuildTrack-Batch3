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

class InventoryUpdate(InventoryCreate):
    pass


# ---------------- WORKERS ----------------

class WorkerCreate(BaseModel):
    project_id: int
    name: str
    phone: str
    designation: str
    salary: float

class WorkerUpdate(WorkerCreate):
    pass


# ---------------- ATTENDANCE ----------------

class AttendanceCreate(BaseModel):
    worker_id: int
    project_id: int
    attendance_date: date
    status: str
    check_in: str
    check_out: str

class AttendanceUpdate(AttendanceCreate):
    pass


# ---------------- PROCUREMENT ----------------

class ProcurementCreate(BaseModel):
    project_id: int
    material_name: str
    supplier: str
    quantity: int
    total_cost: float
    purchase_date: date
    status: str

class ProcurementUpdate(ProcurementCreate):
    pass


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


class NotificationUpdate(BaseModel):
    notification_type: Optional[NotificationType] = None
    title: Optional[str] = None
    message: Optional[str] = None
    is_read: Optional[bool] = None


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

class ReportUpdate(ReportCreate):
    pass


# ---------------- DOCUMENTS ----------------

class DocumentCreate(BaseModel):
    project_id: int
    title: Optional[str] = None
    file_url: Optional[str] = None
    uploaded_by: Optional[int] = None


# ---------------- VENDOR / PROCUREMENT EXTRAS ----------------

class VendorCreate(BaseModel):
    name: str
    contact: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class VendorUpdate(VendorCreate):
    pass

class MaterialRequestCreate(BaseModel):
    project_id: int
    material_name: str
    quantity: int
    requested_by: Optional[int] = None
    status: Optional[str] = None

class MaterialRequestUpdate(MaterialRequestCreate):
    pass

class PurchaseOrderCreate(BaseModel):
    project_id: int
    vendor_id: Optional[int] = None
    material_name: str
    quantity: int
    total_cost: float
    status: Optional[str] = None

class PurchaseOrderUpdate(PurchaseOrderCreate):
    pass

class MaterialDeliveryCreate(BaseModel):
    project_id: int
    material_name: str
    quantity: int
    delivery_date: Optional[date] = None
    status: Optional[str] = None

class MaterialDeliveryUpdate(MaterialDeliveryCreate):
    pass

class InvoiceCreate(BaseModel):
    project_id: int
    vendor_id: Optional[int] = None
    amount: float
    status: Optional[str] = None
    invoice_date: Optional[date] = None

class InvoiceUpdate(InvoiceCreate):
    pass

class PaymentCreate(BaseModel):
    project_id: int
    amount: float
    payment_date: Optional[date] = None
    status: Optional[str] = None

class PaymentUpdate(PaymentCreate):
    pass
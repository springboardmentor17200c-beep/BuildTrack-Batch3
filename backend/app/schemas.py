
from pydantic import BaseModel, EmailStr, constr, Field
from datetime import date, datetime
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
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
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
    category: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    budget: Optional[float] = Field(default=None, gt=0)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[ProjectStatus] = None
    manager_id: Optional[int] = None


class ProjectResponse(ProjectCreate):
    id: int

    class Config:
        from_attributes = True


# ---------------- MILESTONES ----------------

class MilestoneCreate(BaseModel):
    project_id: int
    milestone_name: str
    description: Optional[str] = None
    due_date: date
    completed_date: Optional[date] = None
    status: str


class MilestoneUpdate(BaseModel):
    milestone_name: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    completed_date: Optional[date] = None
    status: Optional[str] = None



# ---------------- RESOURCES ----------------

class ResourceCreate(BaseModel):
    project_id: int
    resource_name: str
    category: str
    quantity: int = Field(gt=0)
    unit: str = "Units"
    status: str = "Available"


class ResourceUpdate(BaseModel):
    resource_name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = Field(default=None, ge=0)
    unit: Optional[str] = None
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


class InventoryUpdate(BaseModel):
    material_name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    supplier: Optional[str] = None
    quantity: Optional[int] = Field(default=None, ge=0)
    minimum_stock: Optional[int] = Field(default=None, ge=0)



# ---------------- WORKERS ----------------

class WorkerCreate(BaseModel):
    project_id: int
    name: str
    phone: Optional[constr(pattern=r'^\d{10}$')] = None
    designation: str
    salary: float = Field(gt=0)


class WorkerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    salary: Optional[float] = Field(default=None, gt=0)


# ---------------- ATTENDANCE ----------------

class AttendanceCreate(BaseModel):
    worker_id: int
    project_id: int
    attendance_date: date
    status: AttendanceStatus
    check_in: Optional[str] = None
    check_out: Optional[str] = None


class AttendanceUpdate(BaseModel):
    attendance_date: Optional[date] = None
    status: Optional[AttendanceStatus] = None
    check_in: Optional[str] = None
    check_out: Optional[str] = None

# ---------------- PROCUREMENT ----------------

class ProcurementCreate(BaseModel):
    project_id: int
    material_name: str
    category: Optional[str] = "Raw Materials"
    supplier: str
    vendor_contact: Optional[str] = None
    invoice_number: Optional[str] = None
    payment_status: Optional[str] = "Pending"
    quantity: int = Field(gt=0)
    total_cost: float = Field(gt=0)
    status: str = "Pending"
    purchase_date: date


class ProcurementUpdate(BaseModel):
    material_name: Optional[str] = None
    category: Optional[str] = None
    supplier: Optional[str] = None
    vendor_contact: Optional[str] = None
    invoice_number: Optional[str] = None
    payment_status: Optional[str] = None
    quantity: Optional[int] = Field(default=None, gt=0)
    total_cost: Optional[float] = Field(default=None, gt=0)
    status: Optional[str] = None
    purchase_date: Optional[date] = None


class ProcurementStatus(str, Enum):
    Pending = "Pending"
    Approved = "Approved"
    Ordered = "Ordered"
    Delivered = "Delivered"
    Cancelled = "Cancelled"
    Rejected = "Rejected"


# ---------------- NOTIFICATIONS ----------------

class NotificationCreate(BaseModel):
    user_id: int
    notification_type: Optional[str] = "System Notification"
    title: str
    message: str


class NotificationUpdate(BaseModel):
    notification_type: Optional[str] = None
    title: Optional[str] = None
    message: Optional[str] = None


# ---------------- ANALYTICS ----------------

class AnalyticsCreate(BaseModel):
    project_id: int
    total_budget: float = Field(ge=0)
    total_expense: float = Field(ge=0)
    completed_milestones: int = Field(ge=0)
    total_milestones: int = Field(ge=0)
    total_workers: int = Field(ge=0)
    total_inventory: int = Field(ge=0)
    pending_procurements: int = Field(ge=0)


class AnalyticsUpdate(BaseModel):
    total_budget: Optional[float] = Field(default=None, ge=0)
    total_expense: Optional[float] = Field(default=None, ge=0)
    completed_milestones: Optional[int] = Field(default=None, ge=0)
    total_milestones: Optional[int] = Field(default=None, ge=0)
    total_workers: Optional[int] = Field(default=None, ge=0)
    total_inventory: Optional[int] = Field(default=None, ge=0)
    pending_procurements: Optional[int] = Field(default=None, ge=0)


class AnalyticsResponse(BaseModel):
    id: int
    project_id: int
    total_budget: float
    total_expense: float
    completed_milestones: int
    total_milestones: int
    total_workers: int
    total_inventory: int
    pending_procurements: int
    generated_at: Optional[datetime] = None

    class Config:
        from_attributes = True



# ---------------- REPORTS ----------------


class ReportCreate(BaseModel):
    project_id: int
    generated_by: int
    report_type: str
    report_url: str


class ReportUpdate(BaseModel):
    report_type: Optional[str] = None
    report_url: Optional[str] = None    


class ReportType(str, Enum):
    Attendance = "Attendance"
    Inventory = "Inventory"
    Procurement = "Procurement"
    ProjectProgress = "ProjectProgress"
    BudgetCost = "BudgetCost"

# ---------------- DOCUMENTS ----------------

class DocumentCreate(BaseModel):
    project_id: int
    uploaded_by: int
    file_name: str
    file_type: str
    file_path: str
    description: str | None = None


class DocumentUpdate(BaseModel):
    file_name: str | None = None
    description: str | None = None


# ---------------- VENDORS ----------------

class VendorCreate(BaseModel):
    vendor_name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    materials: Optional[str] = None
    rating: Optional[float] = 5.0
    is_active: Optional[bool] = True

class VendorUpdate(BaseModel):
    vendor_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    materials: Optional[str] = None
    rating: Optional[float] = None
    is_active: Optional[bool] = None


# ---------------- MATERIAL REQUESTS ----------------

class MaterialRequestCreate(BaseModel):
    project_id: int
    material_name: str
    quantity: int = Field(gt=0)
    required_date: date
    priority: Optional[str] = "Medium"

class MaterialRequestApprove(BaseModel):
    comments: Optional[str] = None

class MaterialRequestReject(BaseModel):
    comments: Optional[str] = None


class MaterialRequestUpdate(BaseModel):
    material_name: Optional[str] = None
    quantity: Optional[int] = Field(default=None, gt=0)
    required_date: Optional[date] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    comments: Optional[str] = None

# ---------------- PURCHASE ORDERS ----------------

class PurchaseOrderCreate(BaseModel):
    vendor_id: int
    project_id: int
    material_name: str
    quantity: int = Field(gt=0)
    unit_price: float = Field(gt=0)
    expected_delivery_date: Optional[date] = None
    request_id: Optional[int] = None
    po_number: Optional[str] = None

class PurchaseOrderUpdate(BaseModel):
    status: Optional[str] = None
    quantity: Optional[int] = Field(default=None, gt=0)
    unit_price: Optional[float] = Field(default=None, gt=0)
    expected_delivery_date: Optional[date] = None


# ---------------- INVOICES ----------------

class InvoiceCreate(BaseModel):
    vendor_id: int
    purchase_order_id: int
    amount: float = Field(gt=0)
    gst: Optional[float] = 0.0
    invoice_date: date
    invoice_no: Optional[str] = None

class InvoicePaymentUpdate(BaseModel):
    payment_status: str

class InvoiceUpdate(BaseModel):
    invoice_no: Optional[str] = None
    vendor_id: Optional[int] = None
    purchase_order_id: Optional[int] = None
    amount: Optional[float] = Field(default=None, gt=0)
    gst: Optional[float] = Field(default=None, ge=0)
    invoice_date: Optional[date] = None
    payment_status: Optional[str] = None

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    notification_type: Optional[str] = "System Notification"
    title: str
    message: str
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------- BUDGET & EXPENSE SCHEMAS ----------------





class BudgetPlanCreate(BaseModel):
    project_id: int
    total_budget: float = Field(gt=0)
    labor_limit: Optional[float] = 0.0
    material_limit: Optional[float] = 0.0
    equipment_limit: Optional[float] = 0.0
    transport_limit: Optional[float] = 0.0
    maintenance_limit: Optional[float] = 0.0
    admin_limit: Optional[float] = 0.0

class BudgetPlanResponse(BaseModel):
    id: int
    project_id: int
    total_budget: float
    labor_limit: float
    material_limit: float
    equipment_limit: float
    transport_limit: float
    maintenance_limit: float
    admin_limit: float
    created_at: datetime

    class Config:
        from_attributes = True

class CategoryCostBreakdown(BaseModel):
    category: str
    allocated_limit: float
    actual_spent: float
    remaining_balance: float
    burn_rate_percentage: float

class BudgetStatusResponse(BaseModel):
    project_id: int
    project_name: str
    total_budget: float
    total_spent: float
    remaining_balance: float
    burn_rate_percentage: float
    categories: list[CategoryCostBreakdown]



# ============================================================
# RESPONSE SCHEMAS
# ============================================================

# ---------------- MILESTONE RESPONSE ----------------

class MilestoneResponse(BaseModel):
    id: int
    project_id: int
    milestone_name: str
    description: Optional[str] = None
    due_date: date
    completed_date: Optional[date] = None
    status: str

    class Config:
        from_attributes = True


# ---------------- RESOURCE RESPONSE ----------------

class ResourceResponse(BaseModel):
    id: int
    project_id: int
    resource_name: str
    category: str
    quantity: int
    unit: str
    status: str

    class Config:
        from_attributes = True


# ---------------- INVENTORY RESPONSE ----------------

class InventoryResponse(BaseModel):
    id: int
    project_id: int
    material_name: str
    category: str
    unit: str
    supplier: Optional[str] = None
    quantity: int
    minimum_stock: int

    class Config:
        from_attributes = True


# ---------------- WORKER RESPONSE ----------------

class WorkerResponse(BaseModel):
    id: int
    project_id: int
    name: str
    phone: Optional[str] = None
    designation: str
    salary: float

    class Config:
        from_attributes = True


# ---------------- ATTENDANCE RESPONSE ----------------

class AttendanceResponse(BaseModel):
    id: int
    worker_id: int
    project_id: int
    attendance_date: date
    status: AttendanceStatus
    check_in: Optional[str] = None
    check_out: Optional[str] = None

    class Config:
        from_attributes = True


# ---------------- PROCUREMENT RESPONSE ----------------

class ProcurementResponse(BaseModel):
    id: int
    project_id: int
    material_name: str
    category: Optional[str] = None
    supplier: str
    vendor_contact: Optional[str] = None
    invoice_number: Optional[str] = None
    payment_status: Optional[str] = None
    quantity: int
    total_cost: float
    status: ProcurementStatus
    purchase_date: date

    class Config:
        from_attributes = True


# ---------------- REPORT RESPONSE ----------------

class ReportResponse(BaseModel):
    id: int
    project_id: int
    generated_by: int
    report_type: ReportType
    report_url: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------- DOCUMENT RESPONSE ----------------

class DocumentResponse(BaseModel):
    id: int
    project_id: int
    uploaded_by: int
    file_name: str
    file_type: str
    file_path: str
    description: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------- VENDOR RESPONSE ----------------

class VendorResponse(BaseModel):
    id: int
    vendor_name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    materials: Optional[str] = None
    rating: Optional[float] = 5.0
    is_active: bool

    class Config:
        from_attributes = True


# ---------------- MATERIAL REQUEST RESPONSE ----------------

class MaterialRequestResponse(BaseModel):
    id: int
    project_id: int
    material_name: str
    quantity: int
    required_date: date
    priority: str
    status: str
    comments: Optional[str] = None
    requested_by: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------- PURCHASE ORDER RESPONSE ----------------

class PurchaseOrderResponse(BaseModel):
    id: int
    po_number: str
    vendor_id: int
    request_id: Optional[int] = None
    project_id: int
    material_name: str
    quantity: int
    unit_price: float
    total_amount: float
    expected_delivery_date: Optional[date] = None
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------- INVOICE RESPONSE ----------------

class InvoiceResponse(BaseModel):
    id: int
    invoice_no: str
    vendor_id: int
    purchase_order_id: int
    amount: float
    gst: float
    invoice_date: date
    payment_status: str

    class Config:
        from_attributes = True





# ============================================================
# EXPENSE
# ============================================================

class ExpenseCreate(BaseModel):
    project_id: int
    expense_date: date
    category: str
    description: Optional[str] = None
    amount: float = Field(gt=0)
    recorded_by: Optional[int] = None


class ExpenseUpdate(BaseModel):
    expense_date: Optional[date] = None
    category: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = Field(default=None, gt=0)
    recorded_by: Optional[int] = None


class ExpenseResponse(BaseModel):
    id: int
    project_id: int
    expense_date: date
    category: str
    description: Optional[str] = None
    amount: float
    recorded_by: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================
# RESOURCE ALLOCATION
# ============================================================

class ResourceAllocationCreate(BaseModel):
    resource_id: int
    project_id: int
    allocated_quantity: int = Field(gt=0)
    allocation_date: date
    returned_date: Optional[date] = None
    status: str = "Allocated"


class ResourceAllocationUpdate(BaseModel):
    allocated_quantity: Optional[int] = Field(default=None, gt=0)
    allocation_date: Optional[date] = None
    returned_date: Optional[date] = None
    status: Optional[str] = None


class ResourceAllocationResponse(BaseModel):
    id: int
    resource_id: int
    project_id: int
    allocated_quantity: int
    allocation_date: date
    returned_date: Optional[date] = None
    status: str

    class Config:
        from_attributes = True


# ============================================================
# RESOURCE MAINTENANCE
# ============================================================

class ResourceMaintenanceCreate(BaseModel):
    resource_id: int
    maintenance_date: date
    next_maintenance_date: Optional[date] = None
    maintenance_type: Optional[str] = None
    cost: float = Field(default=0, ge=0)
    description: Optional[str] = None
    status: str = "Scheduled"


class ResourceMaintenanceUpdate(BaseModel):
    maintenance_date: Optional[date] = None
    next_maintenance_date: Optional[date] = None
    maintenance_type: Optional[str] = None
    cost: Optional[float] = Field(default=None, ge=0)
    description: Optional[str] = None
    status: Optional[str] = None


class ResourceMaintenanceResponse(BaseModel):
    id: int
    resource_id: int
    maintenance_date: date
    next_maintenance_date: Optional[date] = None
    maintenance_type: Optional[str] = None
    cost: float
    description: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


# ============================================================
# SITE PROGRESS REPORT
# ============================================================

class SiteProgressReportCreate(BaseModel):
    project_id: int
    report_date: date
    report_type: str
    progress_category: str
    description: Optional[str] = None
    completion_percentage: float = Field(default=0, ge=0, le=100)
    delay_days: int = Field(default=0, ge=0)
    delay_reason: Optional[str] = None
    reported_by: Optional[int] = None


class SiteProgressReportUpdate(BaseModel):
    report_date: Optional[date] = None
    report_type: Optional[str] = None
    progress_category: Optional[str] = None
    description: Optional[str] = None
    completion_percentage: Optional[float] = Field(
        default=None,
        ge=0,
        le=100
    )
    delay_days: Optional[int] = Field(default=None, ge=0)
    delay_reason: Optional[str] = None
    reported_by: Optional[int] = None


class SiteProgressReportResponse(BaseModel):
    id: int
    project_id: int
    report_date: date
    report_type: str
    progress_category: str
    description: Optional[str] = None
    completion_percentage: float
    delay_days: int
    delay_reason: Optional[str] = None
    reported_by: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================
# SITE ACTIVITY LOG
# ============================================================

class SiteActivityLogCreate(BaseModel):
    project_id: int
    activity_date: date
    activity_type: str
    description: Optional[str] = None
    performed_by: Optional[int] = None


class SiteActivityLogUpdate(BaseModel):
    activity_date: Optional[date] = None
    activity_type: Optional[str] = None
    description: Optional[str] = None
    performed_by: Optional[int] = None


class SiteActivityLogResponse(BaseModel):
    id: int
    project_id: int
    activity_date: date
    activity_type: str
    description: Optional[str] = None
    performed_by: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================
# WORKER SHIFT
# ============================================================

class WorkerShiftCreate(BaseModel):
    worker_id: int
    project_id: int
    shift_date: date
    shift_name: str
    start_time: str
    end_time: str
    status: str = "Scheduled"


class WorkerShiftUpdate(BaseModel):
    shift_date: Optional[date] = None
    shift_name: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    status: Optional[str] = None


class WorkerShiftResponse(BaseModel):
    id: int
    worker_id: int
    project_id: int
    shift_date: date
    shift_name: str
    start_time: str
    end_time: str
    status: str

    class Config:
        from_attributes = True


# ============================================================
# PAYROLL RECORD
# ============================================================

class PayrollRecordCreate(BaseModel):
    worker_id: int
    project_id: Optional[int] = None
    pay_period_start: date
    pay_period_end: date
    basic_amount: float = Field(default=0, ge=0)
    overtime_amount: float = Field(default=0, ge=0)
    deduction_amount: float = Field(default=0, ge=0)
    net_amount: float = Field(default=0, ge=0)
    payment_status: str = "Pending"
    paid_date: Optional[date] = None


class PayrollRecordUpdate(BaseModel):
    project_id: Optional[int] = None
    pay_period_start: Optional[date] = None
    pay_period_end: Optional[date] = None
    basic_amount: Optional[float] = Field(default=None, ge=0)
    overtime_amount: Optional[float] = Field(default=None, ge=0)
    deduction_amount: Optional[float] = Field(default=None, ge=0)
    net_amount: Optional[float] = Field(default=None, ge=0)
    payment_status: Optional[str] = None
    paid_date: Optional[date] = None


class PayrollRecordResponse(BaseModel):
    id: int
    worker_id: int
    project_id: Optional[int] = None
    pay_period_start: date
    pay_period_end: date
    basic_amount: float
    overtime_amount: float
    deduction_amount: float
    net_amount: float
    payment_status: str
    paid_date: Optional[date] = None

    class Config:
        from_attributes = True


# ============================================================
# MATERIAL ALLOCATION
# ============================================================

class MaterialAllocationCreate(BaseModel):
    inventory_id: int
    project_id: int
    quantity: int = Field(gt=0)
    allocation_date: date
    allocated_to: Optional[int] = None
    status: str = "Allocated"


class MaterialAllocationUpdate(BaseModel):
    quantity: Optional[int] = Field(default=None, gt=0)
    allocation_date: Optional[date] = None
    allocated_to: Optional[int] = None
    status: Optional[str] = None


class MaterialAllocationResponse(BaseModel):
    id: int
    inventory_id: int
    project_id: int
    quantity: int
    allocation_date: date
    allocated_to: Optional[int] = None
    status: str

    class Config:
        from_attributes = True



class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=72)
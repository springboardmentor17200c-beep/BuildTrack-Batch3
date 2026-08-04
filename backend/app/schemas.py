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
from enum import Enum

# ---------------- PROCUREMENT ENUMS ----------------

class RequestStatus(str, Enum):
    Pending = "Pending"
    Approved = "Approved"
    Rejected = "Rejected"


class PriorityLevel(str, Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"


class VendorStatus(str, Enum):
    Active = "Active"
    Inactive = "Inactive"


class PurchaseOrderStatus(str, Enum):
    Created = "Created"
    Sent = "Sent"
    Accepted = "Accepted"
    Delivered = "Delivered"


class DeliveryStatus(str, Enum):
    Received = "Received"
    PartiallyReceived = "Partially Received"
    Rejected = "Rejected"


class PaymentStatus(str, Enum):
    Pending = "Pending"
    Approved = "Approved"
    Paid = "Paid"

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


class MilestoneUpdate(BaseModel):
    milestone_name: Optional[str] = None
    due_date: Optional[date] = None
    completed_date: Optional[date] = None
    status: Optional[str] = None



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


class InventoryUpdate(BaseModel):
    material_name: Optional[str] = None
    unit: Optional[str] = None
    supplier: Optional[str] = None
    quantity: Optional[int] = None
    minimum_stock: Optional[int] = None



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
    salary: Optional[float] = None


# ---------------- ATTENDANCE ----------------

class AttendanceCreate(BaseModel):
    worker_id: int
    project_id: int
    attendance_date: date
    status: AttendanceStatus
    check_in: str
    check_out: str = ""



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
    quantity: Optional[int] = None
    total_cost: Optional[float] = None
    status: Optional[str] = None
    purchase_date: Optional[date] = None




# ---------------- NOTIFICATIONS ----------------

class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str


class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None


# ---------------- REPORTS ----------------

class ReportCreate(BaseModel):
    project_id: int
    generated_by: int
    report_type: str
    report_url: str


class ReportUpdate(BaseModel):
    report_type: Optional[str] = None
    report_url: Optional[str] = None    

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
    project_id: int
    vendor_name: str
    contact_person: str
    phone: constr(pattern=r'^\d{10}$')
    email: EmailStr
    address: str
    materials_supplied: str
    rating: float = 0
    status: VendorStatus = VendorStatus.Active


class VendorUpdate(BaseModel):
    vendor_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    materials_supplied: Optional[str] = None
    rating: Optional[float] = None
    status: Optional[VendorStatus] = None


# ---------------- MATERIAL REQUESTS ----------------

class MaterialRequestCreate(BaseModel):
    project_id: int
    requested_by: int
    material_name: str
    quantity: int = Field(gt=0)
    required_date: date
    priority: PriorityLevel = PriorityLevel.Medium
    status: RequestStatus = RequestStatus.Pending
    comments: Optional[str] = None


class MaterialRequestUpdate(BaseModel):
    material_name: Optional[str] = None
    quantity: Optional[int] = None
    required_date: Optional[date] = None
    priority: Optional[PriorityLevel] = None
    status: Optional[RequestStatus] = None
    comments: Optional[str] = None


# ---------------- PURCHASE ORDERS ----------------

class PurchaseOrderCreate(BaseModel):
    po_number: str
    project_id: int
    vendor_id: int
    request_id: int
    material_name: str
    quantity: int = Field(gt=0)
    unit_price: float = Field(gt=0)
    total_cost: float = Field(gt=0)
    expected_delivery_date: date
    status: PurchaseOrderStatus = PurchaseOrderStatus.Created


class PurchaseOrderUpdate(BaseModel):
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    total_cost: Optional[float] = None
    expected_delivery_date: Optional[date] = None
    status: Optional[PurchaseOrderStatus] = None


# ---------------- MATERIAL DELIVERY ----------------

class MaterialDeliveryCreate(BaseModel):
    purchase_order_id: int
    received_quantity: int = Field(gt=0)
    quality: str
    delivery_date: date
    status: DeliveryStatus = DeliveryStatus.Received
    remarks: Optional[str] = None


class MaterialDeliveryUpdate(BaseModel):
    received_quantity: Optional[int] = None
    quality: Optional[str] = None
    delivery_date: Optional[date] = None
    status: Optional[DeliveryStatus] = None
    remarks: Optional[str] = None    

# ---------------- INVOICES ----------------

class InvoiceCreate(BaseModel):
    invoice_number: str
    vendor_id: int
    purchase_order_id: int
    amount: float = Field(gt=0)
    gst: float = 0
    invoice_date: date
    payment_status: PaymentStatus = PaymentStatus.Pending


class InvoiceUpdate(BaseModel):
    amount: Optional[float] = None
    gst: Optional[float] = None
    payment_status: Optional[PaymentStatus] = None    


# ---------------- PAYMENTS ----------------

class PaymentCreate(BaseModel):
    invoice_id: int
    payment_date: date
    amount: float = Field(gt=0)
    payment_method: str
    transaction_id: str
    status: PaymentStatus = PaymentStatus.Pending
    remarks: Optional[str] = None


class PaymentUpdate(BaseModel):
    payment_date: Optional[date] = None
    amount: Optional[float] = None
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    status: Optional[PaymentStatus] = None
    remarks: Optional[str] = None




from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Date,
    Text,
    Boolean,
    Enum
)
from sqlalchemy.orm import relationship
from app.database import Base
import datetime

from enum import Enum as PyEnum




class ProjectStatusEnum(PyEnum):
    Pending = "Pending"
    Running = "Running"
    Completed = "Completed"


class AttendanceStatusEnum(PyEnum):
    Present = "Present"
    Absent = "Absent"
    OnLeave = "On Leave"


class ProcurementStatusEnum(PyEnum):
    Pending = "Pending"
    Approved = "Approved"
    Ordered = "Ordered"
    Delivered = "Delivered"
    Cancelled = "Cancelled"


class NotificationTypeEnum(PyEnum):
    General = "General"
    Procurement = "Procurement"
    Inventory = "Inventory"
    Worker = "Worker"
    Project = "Project"


class ReportTypeEnum(PyEnum):
    Attendance = "Attendance"
    Inventory = "Inventory"
    Procurement = "Procurement"
    Worker = "Worker"
    Budget = "Budget"

class VendorStatus(PyEnum):
    Active = "Active"
    Inactive = "Inactive"


class RequestStatus(PyEnum):
    Pending = "Pending"
    Approved = "Approved"
    Rejected = "Rejected"


class PriorityLevel(PyEnum):
    Low = "Low"
    Medium = "Medium"
    High = "High"


class PurchaseOrderStatus(PyEnum):
    Created = "Created"
    Sent = "Sent"
    Accepted = "Accepted"
    Delivered = "Delivered"


class DeliveryStatus(PyEnum):
    Received = "Received"
    PartiallyReceived = "Partially Received"
    Rejected = "Rejected"


class PaymentStatus(PyEnum):
    Pending = "Pending"
    Approved = "Approved"
    Paid = "Paid"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    phone = Column(String(20))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    material_requests = relationship(
    "MaterialRequest",
    back_populates="requester",
    cascade="all, delete-orphan"
)
    
    projects = relationship("Project", back_populates="manager",cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user",cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="creator",cascade="all, delete-orphan")
    documents = relationship(
    "Document",
    back_populates="uploader",
    cascade="all, delete-orphan"
    )

   



class Project(Base):
    __tablename__ = "projects"
    __table_args__ = (
    CheckConstraint("budget >= 0", name="check_budget_positive"),

 
  
)
   

    vendors = relationship(
    "Vendor",
    back_populates="project",
    cascade="all, delete-orphan"
)   
    material_requests = relationship(
    "MaterialRequest",
    back_populates="project",
    cascade="all, delete-orphan"
)

    purchase_orders = relationship(
    "PurchaseOrder",
    back_populates="project",
    cascade="all, delete-orphan"
)

    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String(150), nullable=False)
    description = Column(Text)
    location = Column(String(200))
    budget = Column(Float,nullable=False)
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(
    Enum(ProjectStatusEnum),
    default=ProjectStatusEnum.Pending,
    nullable=False
     )
    manager_id = Column(
    Integer,
    ForeignKey("users.id"),
    index=True
    )

    # Relationships
    manager = relationship("User", back_populates="projects")
    milestones = relationship("ProjectMilestone", back_populates="project",cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="project",cascade="all, delete-orphan")
    inventory = relationship("Inventory", back_populates="project",cascade="all, delete-orphan")
    workers = relationship("Worker", back_populates="project",cascade="all, delete-orphan")
    attendance = relationship("Attendance", back_populates="project",cascade="all, delete-orphan")
    procurements = relationship("Procurement", back_populates="project",cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="project",cascade="all, delete-orphan")
    documents = relationship(
    "Document",
    back_populates="project",
    cascade="all, delete-orphan"
   )

    created_at = Column(
    DateTime,
    default=datetime.datetime.utcnow
)

updated_at = Column(
    DateTime,
    default=datetime.datetime.utcnow,
    onupdate=datetime.datetime.utcnow
)




class ProjectMilestone(Base):
    __tablename__ = "project_milestones"

    id = Column(Integer, primary_key=True)
    project_id = Column(
    Integer,
    ForeignKey("projects.id"),
    index=True
     )
    milestone_name = Column(String(100))
    due_date = Column(Date)
    completed_date = Column(Date)
    status = Column(String(30))

    project = relationship("Project", back_populates="milestones") 

class Resource(Base):
    __tablename__ = "resources"
    __table_args__ = (
    CheckConstraint("quantity >= 0", name="check_resource_quantity_positive"),
)

    id = Column(Integer, primary_key=True)
    project_id = Column(
    Integer,
    ForeignKey("projects.id"),
    index=True
      )
    resource_name = Column(String(100))
    category = Column(String(50))
    quantity = Column(Integer,nullable=False)
    status = Column(String(30))

    project = relationship("Project", back_populates="resources")   

class Inventory(Base):
    __tablename__ = "inventory"
    __table_args__ = (
    CheckConstraint("quantity >= 0",name="check_quantity_positive"),
)

   
    id = Column(Integer, primary_key=True,index=True)
    project_id = Column(
    Integer,
    ForeignKey("projects.id"),
    index=True
)
    material_name = Column(String(100))
    category = Column(String(50), default="Cement")
    quantity = Column(Integer, nullable=False)
    unit = Column(String(20))
    minimum_stock = Column(Integer)
    supplier = Column(String(100))


    project = relationship("Project", back_populates="inventory")    


    created_at = Column(
    DateTime,
    default=datetime.datetime.utcnow
)

updated_at = Column(
    DateTime,
    default=datetime.datetime.utcnow,
    onupdate=datetime.datetime.utcnow
)   
    


class Worker(Base):
    __tablename__ = "workers"
    __table_args__ = (
    CheckConstraint("salary >= 0", name="check_salary_positive"),
)

   
    id = Column(Integer, primary_key=True)
    project_id = Column(
    Integer,
    ForeignKey("projects.id"),
    index=True
)
    name = Column(String(100))
    phone = Column(String(20))
    designation = Column(String(100))
    salary = Column(Float,nullable=False)

    project = relationship("Project", back_populates="workers")
    attendance = relationship("Attendance", back_populates="worker")

    created_at = Column(
    DateTime,
    default=datetime.datetime.utcnow
)

updated_at = Column(
    DateTime,
    default=datetime.datetime.utcnow,
    onupdate=datetime.datetime.utcnow
)    


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True)
    worker_id = Column(
    Integer,
    ForeignKey("workers.id"),
    index=True
    )

    project_id = Column(
    Integer,
    ForeignKey("projects.id"),
    index=True
    )
    attendance_date = Column(Date)
    status = Column(
    Enum(AttendanceStatusEnum),
    nullable=False
    )
    check_in = Column(String(20))
    check_out = Column(String(20))

    worker = relationship("Worker", back_populates="attendance")
    project = relationship("Project", back_populates="attendance")

    created_at = Column(
    DateTime,
    default=datetime.datetime.utcnow
)

updated_at = Column(
    DateTime,
    default=datetime.datetime.utcnow,
    onupdate=datetime.datetime.utcnow
)

class Procurement(Base):
    __tablename__ = "procurements"
    __table_args__ = (
        CheckConstraint("total_cost >= 0", name="check_total_cost_positive"),
    )

    id = Column(Integer, primary_key=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        index=True
    )

    material_name = Column(String(100))
    category = Column(String(50), default="Raw Materials")
    supplier = Column(String(100))
    vendor_contact = Column(String(50), nullable=True)
    invoice_number = Column(String(50), nullable=True)
    payment_status = Column(String(30), default="Pending")
    quantity = Column(Integer)
    total_cost = Column(Float, nullable=False)
    purchase_date = Column(Date)

    status = Column(
        Enum(ProcurementStatusEnum),
        default=ProcurementStatusEnum.Pending,
        nullable=False
    )

    project = relationship(
        "Project",
        back_populates="procurements"
    )

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow
    )




class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(
    Integer,
    ForeignKey("users.id"),
    index=True
    )
    title = Column(String(150))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    type = Column(
    Enum(NotificationTypeEnum),
    default=NotificationTypeEnum.General
   )
    user = relationship("User", back_populates="notifications")    


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True)
    project_id = Column(
    Integer,
    ForeignKey("projects.id"),
    index=True
    )
    generated_by = Column(
    Integer,
    ForeignKey("users.id"),
    index=True
    )
    report_type = Column(
    Enum(ReportTypeEnum),
    nullable=False
    )
    report_url = Column(String(255))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="reports")
    creator = relationship("User", back_populates="reports")    




class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        index=True
    )

    uploaded_by = Column(
        Integer,
        ForeignKey("users.id"),
        index=True
    )

    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50))
    file_path = Column(String(255))
    description = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )

    project = relationship(
        "Project",
        back_populates="documents"
    )

    uploader = relationship(
        "User",
        back_populates="documents"
    )







class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        index=True
    )

    vendor_name = Column(String(150), nullable=False)
    contact_person = Column(String(100), nullable=False)

    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=False)

    address = Column(Text)

    materials_supplied = Column(Text)

    rating = Column(Float, default=0)

    status = Column(
    Enum(VendorStatus),
    default=VendorStatus.Active,
    nullable=False
)

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow
    )

    project = relationship(
        "Project",
        back_populates="vendors"
    )

    purchase_orders = relationship(
        "PurchaseOrder",
        back_populates="vendor",
        cascade="all, delete-orphan"
    )

    invoices = relationship(
        "Invoice",
        back_populates="vendor",
        cascade="all, delete-orphan"
    )    








class MaterialRequest(Base):
    __tablename__ = "material_requests"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        index=True
    )

    requested_by = Column(
        Integer,
        ForeignKey("users.id"),
        index=True
    )

    material_name = Column(String(100), nullable=False)

    quantity = Column(Integer, nullable=False)

    required_date = Column(Date)

    priority = Column(
    Enum(PriorityLevel),
    default=PriorityLevel.Medium,
    nullable=False
)

    status = Column(
    Enum(RequestStatus),
    default=RequestStatus.Pending,
    nullable=False
)

    comments = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow
    )

    project = relationship(
        "Project",
        back_populates="material_requests"
    )

    requester = relationship(
        "User",
        back_populates="material_requests"
    )

    purchase_orders = relationship(
        "PurchaseOrder",
        back_populates="request",
        cascade="all, delete-orphan"
    )    







class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)

    po_number = Column(String(50), unique=True, nullable=False)

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        index=True
    )

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id"),
        index=True
    )

    request_id = Column(
        Integer,
        ForeignKey("material_requests.id"),
        index=True
    )

    material_name = Column(String(100), nullable=False)

    quantity = Column(Integer, nullable=False)

    unit_price = Column(Float, nullable=False)

    total_cost = Column(Float, nullable=False)

    expected_delivery_date = Column(Date)

    status = Column(
    Enum(PurchaseOrderStatus),
    default=PurchaseOrderStatus.Created,
    nullable=False
)

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow
    )

    project = relationship(
        "Project",
        back_populates="purchase_orders"
    )

    vendor = relationship(
        "Vendor",
        back_populates="purchase_orders"
    )

    request = relationship(
        "MaterialRequest",
        back_populates="purchase_orders"
    )

    deliveries = relationship(
        "MaterialDelivery",
        back_populates="purchase_order",
        cascade="all, delete-orphan"
    )

    invoices = relationship(
        "Invoice",
        back_populates="purchase_order",
        cascade="all, delete-orphan"
    )    


class MaterialDelivery(Base):
    __tablename__ = "material_deliveries"

    id = Column(Integer, primary_key=True, index=True)

    purchase_order_id = Column(
        Integer,
        ForeignKey("purchase_orders.id"),
        index=True
    )

    received_quantity = Column(
        Integer,
        nullable=False
    )

    quality = Column(
        String(50),
        nullable=False
    )

    delivery_date = Column(Date)

    status = Column(
    Enum(DeliveryStatus),
    default=DeliveryStatus.Received,
    nullable=False
)

    remarks = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow
    )

    purchase_order = relationship(
        "PurchaseOrder",
        back_populates="deliveries"
    )    


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)

    invoice_number = Column(
        String(50),
        unique=True,
        nullable=False
    )

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id"),
        index=True
    )

    purchase_order_id = Column(
        Integer,
        ForeignKey("purchase_orders.id"),
        index=True
    )

    amount = Column(
        Float,
        nullable=False
    )

    gst = Column(
        Float,
        default=0
    )

    invoice_date = Column(Date)

    payment_status = Column(
    Enum(PaymentStatus),
    default=PaymentStatus.Pending,
    nullable=False
)

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow
    )

    vendor = relationship(
        "Vendor",
        back_populates="invoices"
    )

    purchase_order = relationship(
        "PurchaseOrder",
        back_populates="invoices"
    )

    payments = relationship(
        "Payment",
        back_populates="invoice",
        cascade="all, delete-orphan"
    )    


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

    invoice_id = Column(
        Integer,
        ForeignKey("invoices.id"),
        index=True,
        nullable=False
    )

    payment_date = Column(Date)

    amount = Column(
        Float,
        nullable=False
    )

    payment_method = Column(
        String(50),
        nullable=False
    )

    transaction_id = Column(
        String(100),
        unique=True
    )

    status = Column(
    Enum(PaymentStatus),
    default=PaymentStatus.Pending,
    nullable=False
)

    remarks = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow
    )

    invoice = relationship(
        "Invoice",
        back_populates="payments"
    )    
    
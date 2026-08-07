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
from datetime import datetime
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
    Rejected = "Rejected"

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
    ProjectProgress = "ProjectProgress"
    BudgetCost = "BudgetCost"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False, default="Viewer")
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="manager", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="creator", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="uploader")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(200), nullable=False)
    budget = Column(Float, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(Enum(ProjectStatusEnum), default=ProjectStatusEnum.Pending, nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"), index=True)

    manager = relationship("User", back_populates="projects")
    milestones = relationship("ProjectMilestone", back_populates="project", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="project", cascade="all, delete-orphan")
    inventory = relationship("Inventory", back_populates="project", cascade="all, delete-orphan")
    workers = relationship("Worker", back_populates="project", cascade="all, delete-orphan")
    attendance = relationship("Attendance", back_populates="project", cascade="all, delete-orphan")
    procurements = relationship("Procurement", back_populates="project", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="project", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="project")

class ProjectMilestone(Base):
    __tablename__ = "project_milestones"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=False)
    status = Column(String(50), default="Pending")

    project = relationship("Project", back_populates="milestones")

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit = Column(String(20), nullable=False, default="Units")
    status = Column(String(50), default="Available")

    project = relationship("Project", back_populates="resources")

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), index=True)
    material_name = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit = Column(String(20), nullable=False)
    minimum_stock = Column(Integer, default=10)
    supplier = Column(String(100), nullable=True)

    project = relationship("Project", back_populates="inventory")

class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    designation = Column(String(50), nullable=False)
    salary = Column(Float, nullable=False)

    project = relationship("Project", back_populates="workers")
    attendance = relationship("Attendance", back_populates="worker")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), index=True)
    attendance_date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatusEnum), nullable=False)
    check_in = Column(String(20), nullable=True)
    check_out = Column(String(20), nullable=True)

    worker = relationship("Worker", back_populates="attendance")
    project = relationship("Project", back_populates="attendance")

class Procurement(Base):
    __tablename__ = "procurements"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), index=True)
    material_name = Column(String(100))
    category = Column(String(50), default="Raw Materials")
    supplier = Column(String(100))
    vendor_contact = Column(String(50), nullable=True)
    invoice_number = Column(String(50), nullable=True)
    payment_status = Column(String(30), default="Pending")
    quantity = Column(Integer)
    total_cost = Column(Float, nullable=False)
    purchase_date = Column(Date)
    status = Column(Enum(ProcurementStatusEnum), default=ProcurementStatusEnum.Pending, nullable=False)

    project = relationship("Project", back_populates="procurements")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    notification_type = Column(String(50), default="System Notification")
    title = Column(String(150))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), index=True)
    generated_by = Column(Integer, ForeignKey("users.id"), index=True)
    report_type = Column(Enum(ReportTypeEnum), nullable=False)
    report_url = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="reports")
    creator = relationship("User", back_populates="reports")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), index=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), index=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50))
    file_path = Column(String(255))
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="documents")
    uploader = relationship("User", back_populates="documents")

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    vendor_name = Column(String(100), nullable=False)
    contact_person = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    materials = Column(String(255), nullable=True)
    rating = Column(Float, default=5.0)
    is_active = Column(Boolean, default=True)

class MaterialRequest(Base):
    __tablename__ = "material_requests"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), index=True)
    material_name = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    required_date = Column(Date, nullable=False)
    priority = Column(String(20), default="Medium")
    status = Column(String(20), default="Pending")
    comments = Column(Text, nullable=True)
    requested_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project")
    requester = relationship("User")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), unique=True, index=True, nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), index=True)
    request_id = Column(Integer, ForeignKey("material_requests.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), index=True)
    material_name = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False, default=0.0)
    expected_delivery_date = Column(Date, nullable=True)
    status = Column(String(30), default="Created")
    created_at = Column(DateTime, default=datetime.utcnow)

    vendor = relationship("Vendor")
    request = relationship("MaterialRequest")
    project = relationship("Project")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_no = Column(String(50), unique=True, index=True, nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), index=True)
    amount = Column(Float, nullable=False, default=0.0)
    gst = Column(Float, nullable=False, default=0.0)
    invoice_date = Column(Date, nullable=False)
    payment_status = Column(String(30), default="Pending")

    vendor = relationship("Vendor")
    purchase_order = relationship("PurchaseOrder")

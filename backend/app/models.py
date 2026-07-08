from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    phone = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String(150), nullable=False)
    description = Column(Text)
    location = Column(String(200))
    budget = Column(Float)
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(String(50))
    manager_id = Column(Integer, ForeignKey("users.id"))


class ProjectMilestone(Base):
    __tablename__ = "project_milestones"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    milestone_name = Column(String(100))
    due_date = Column(Date)
    completed_date = Column(Date)
    status = Column(String(30))


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    resource_name = Column(String(100))
    category = Column(String(50))
    quantity = Column(Integer)
    status = Column(String(30))


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    material_name = Column(String(100))
    quantity = Column(Integer)
    unit = Column(String(20))
    minimum_stock = Column(Integer)
    supplier = Column(String(100))


class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String(100))
    phone = Column(String(20))
    designation = Column(String(100))
    salary = Column(Float)


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True)
    worker_id = Column(Integer, ForeignKey("workers.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    attendance_date = Column(Date)
    status = Column(String(20))
    check_in = Column(String(20))
    check_out = Column(String(20))


class Procurement(Base):
    __tablename__ = "procurements"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    material_name = Column(String(100))
    supplier = Column(String(100))
    quantity = Column(Integer)
    total_cost = Column(Float)
    purchase_date = Column(Date)
    status = Column(String(30))


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(150))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    generated_by = Column(Integer, ForeignKey("users.id"))
    report_type = Column(String(50))
    report_url = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
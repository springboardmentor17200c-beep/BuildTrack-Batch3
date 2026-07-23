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
    Boolean
)
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

    # Relationships
    projects = relationship("Project", back_populates="manager",cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user",cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="creator",cascade="all, delete-orphan")

   



class Project(Base):
    __tablename__ = "projects"
    __table_args__ = (
    CheckConstraint("budget >= 0", name="check_budget_positive"),
)

    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String(150), nullable=False)
    description = Column(Text)
    location = Column(String(200))
    budget = Column(Float,nullable=False)
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(String(50))
    manager_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    manager = relationship("User", back_populates="projects")
    milestones = relationship("ProjectMilestone", back_populates="project",cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="project",cascade="all, delete-orphan")
    inventory = relationship("Inventory", back_populates="project",cascade="all, delete-orphan")
    workers = relationship("Worker", back_populates="project",cascade="all, delete-orphan")
    attendance = relationship("Attendance", back_populates="project",cascade="all, delete-orphan")
    procurements = relationship("Procurement", back_populates="project",cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="project",cascade="all, delete-orphan")

    created_at = Column(
    DateTime,
    default=datetime.utcnow
)

updated_at = Column(
    DateTime,
    default=datetime.utcnow,
    onupdate=datetime.utcnow
)




class ProjectMilestone(Base):
    __tablename__ = "project_milestones"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
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
    project_id = Column(Integer, ForeignKey("projects.id"))
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
    project_id = Column(Integer, ForeignKey("projects.id"))
    material_name = Column(String(100))
    quantity = Column(Integer, nullable=False)
    unit = Column(String(20))
    minimum_stock = Column(Integer)
    supplier = Column(String(100))

    project = relationship("Project", back_populates="inventory")    


    created_at = Column(
    DateTime,
    default=datetime.utcnow
)

updated_at = Column(
    DateTime,
    default=datetime.utcnow,
    onupdate=datetime.utcnow
)   
    


class Worker(Base):
    __tablename__ = "workers"
    __table_args__ = (
    CheckConstraint("salary >= 0", name="check_salary_positive"),
)

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String(100))
    phone = Column(String(20))
    designation = Column(String(100))
    salary = Column(Float,nullable=False)

    project = relationship("Project", back_populates="workers")
    attendance = relationship("Attendance", back_populates="worker")

    created_at = Column(
    DateTime,
    default=datetime.utcnow
)

updated_at = Column(
    DateTime,
    default=datetime.utcnow,
    onupdate=datetime.utcnow
)    


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True)
    worker_id = Column(Integer, ForeignKey("workers.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    attendance_date = Column(Date)
    status = Column(String(20))
    check_in = Column(String(20))
    check_out = Column(String(20))

    worker = relationship("Worker", back_populates="attendance")
    project = relationship("Project", back_populates="attendance")

    created_at = Column(
    DateTime,
    default=datetime.utcnow
)

updated_at = Column(
    DateTime,
    default=datetime.utcnow,
    onupdate=datetime.utcnow
)





class Procurement(Base):
    __tablename__ = "procurements"
    __table_args__ = (
    CheckConstraint("total_cost >= 0", name="check_total_cost_positive"),
    CheckConstraint("total_cost >= 0", name="check_total_cost_positive"),
)

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    material_name = Column(String(100))
    supplier = Column(String(100))
    quantity = Column(Integer)
    total_cost = Column(Float,nullable=False)
    purchase_date = Column(Date)
    status = Column(String(30))

    project = relationship("Project", back_populates="procurements")


    created_at = Column(
    DateTime,
    default=datetime.utcnow
)

updated_at = Column(
    DateTime,
    default=datetime.utcnow,
    onupdate=datetime.utcnow
)



class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(150))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")    


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    generated_by = Column(Integer, ForeignKey("users.id"))
    report_type = Column(String(50))
    report_url = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="reports")
    creator = relationship("User", back_populates="reports")    





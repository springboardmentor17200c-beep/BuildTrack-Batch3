from sqlalchemy.orm import Session
from app import models, schema


# =========================
# USERS
# =========================

def create_user(db: Session, user: schema.UserRegister):
    db_user = models.User(
        name=user.name,
        email=user.email,
        password=user.password,
        role=user.role,
        phone=user.phone
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_all_users(db: Session):
    return db.query(models.User).all()


# =========================
# PROJECTS
# =========================

def create_project(db: Session, project: schema.ProjectCreate):
    db_project = models.Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def get_all_projects(db: Session):
    return db.query(models.Project).all()


def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()


# =========================
# MILESTONES
# =========================

def create_milestone(db: Session, milestone: schema.MilestoneCreate):
    db_milestone = models.ProjectMilestone(**milestone.model_dump())
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone


# =========================
# RESOURCES
# =========================

def create_resource(db: Session, resource: schema.ResourceCreate):
    db_resource = models.Resource(**resource.model_dump())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource


def get_resources(db: Session):
    return db.query(models.Resource).all()


# =========================
# INVENTORY
# =========================

def create_inventory(db: Session, inventory: schema.InventoryCreate):
    db_inventory = models.Inventory(**inventory.model_dump())
    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)
    return db_inventory


def get_inventory(db: Session):
    return db.query(models.Inventory).all()


# =========================
# WORKERS
# =========================

def create_worker(db: Session, worker: schema.WorkerCreate):
    db_worker = models.Worker(**worker.model_dump())
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker


def get_workers(db: Session):
    return db.query(models.Worker).all()


# =========================
# ATTENDANCE
# =========================

def create_attendance(db: Session, attendance: schema.AttendanceCreate):
    db_attendance = models.Attendance(**attendance.model_dump())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance


def get_attendance(db: Session):
    return db.query(models.Attendance).all()


# =========================
# PROCUREMENT
# =========================

def create_procurement(db: Session, procurement: schema.ProcurementCreate):
    db_procurement = models.Procurement(**procurement.model_dump())
    db.add(db_procurement)
    db.commit()
    db.refresh(db_procurement)
    return db_procurement


def get_procurements(db: Session):
    return db.query(models.Procurement).all()


# =========================
# NOTIFICATIONS
# =========================

def create_notification(db: Session, notification: schema.NotificationCreate):
    db_notification = models.Notification(**notification.model_dump())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


def get_notifications(db: Session):
    return db.query(models.Notification).all()


# =========================
# REPORTS
# =========================

def create_report(db: Session, report: schema.ReportCreate):
    db_report = models.Report(**report.model_dump())
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


def get_reports(db: Session):
    return db.query(models.Report).all()
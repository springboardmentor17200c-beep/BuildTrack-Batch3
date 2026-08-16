from typing import Optional, List
from sqlalchemy.orm import Session
from app import models, schemas
from app.auth import hash_password
from sqlalchemy import func
from sqlalchemy import extract
from datetime import date
from datetime import datetime, timezone
import hashlib




# ======================================================
# USERS CRUD
# ======================================================

def create_user(db: Session, user: schemas.UserRegister):
    db_user = models.User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),   
        role=user.role,
        phone=user.phone
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def get_users(db: Session):
    return db.query(models.User).all()


def get_user(db: Session, user_id: int):
    return (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )


def get_user_by_email(db: Session, email: str):
    return (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )


def update_user(
    db: Session,
    user_id: int,
    user: schemas.UserUpdate
):
    db_user = get_user(db, user_id)

    if not db_user:
        return None

    update_data = user.model_dump(exclude_unset=True)

    if "password" in update_data:
        update_data["password"] = hash_password(
            update_data["password"]
        )

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)

    return db_user


def delete_user(db: Session, user_id: int):

    db_user = get_user(db, user_id)

    if not db_user:
        return None

    db.delete(db_user)
    db.commit()

    return db_user


def update_user_role(db: Session, user_id: int, role: str):
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    db_user.role = role
    db.commit()
    db.refresh(db_user)

    return db_user


# ======================================================
# PROJECT CRUD
# ======================================================


def create_project(db: Session, project: schemas.ProjectCreate):

    db_project = models.Project(
    project_name=project.project_name,
    description=project.description,
    location=project.location,
    category=project.category,
    budget=project.budget,
    start_date=project.start_date,
    end_date=project.end_date,
    status=project.status,
    manager_id=project.manager_id
)

    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    return db_project


def get_projects(db: Session, skip: int = 0, limit: int = 100):

   return db.query(models.Project).offset(skip).limit(limit).all()

def get_project(db: Session, project_id: int):

    return (
        db.query(models.Project)
        .filter(models.Project.id == project_id)
        .first()
    )





def delete_project(db: Session,
                   project_id: int):

    db_project = get_project(db, project_id)

    if not db_project:
        return None

    db.delete(db_project)
    db.commit()

    return db_project

def update_project(
    db: Session,
    project_id: int,
    project: schemas.ProjectUpdate
):
    db_project = get_project(db, project_id)

    if not db_project:
        return None
    for key, value in project.model_dump(exclude_unset=True).items():
        setattr(db_project, key, value)

    db.commit()
    db.refresh(db_project)

    return db_project


def search_project(db: Session, name: str):
    return (
        db.query(models.Project)
        .filter(models.Project.project_name.ilike(f"%{name}%"))
        .all()
    )

# ======================================================
# PROJECT MILESTONES CRUD
# ======================================================

def create_milestone(
    db: Session,
    milestone: schemas.MilestoneCreate
):

    db_milestone = models.ProjectMilestone(
        project_id=milestone.project_id,
        milestone_name=milestone.milestone_name,
        description=milestone.description,
        due_date=milestone.due_date,
        completed_date=milestone.completed_date,
        status=milestone.status
    )

    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)

    return db_milestone





def get_milestones(db: Session, skip: int = 0, limit: int = 20):
    return (
        db.query(models.ProjectMilestone)
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_milestone(db: Session, milestone_id: int):
    return (
        db.query(models.ProjectMilestone)
        .filter(models.ProjectMilestone.id == milestone_id)
        .first()
    )

def update_milestone(
    db: Session,
    milestone_id: int,
    milestone: schemas.MilestoneUpdate
):
    db_milestone = get_milestone(db, milestone_id)

    if not db_milestone:
        return None

    update_data = milestone.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_milestone, key, value)

    db.commit()
    db.refresh(db_milestone)

    return db_milestone



def delete_milestone(db: Session, milestone_id: int):

    db_milestone = get_milestone(db, milestone_id)

    if not db_milestone:
        return None

    db.delete(db_milestone)
    db.commit()

    return db_milestone


# ======================================================
# RESOURCE CRUD
# ======================================================

def create_resource(db: Session, resource: schemas.ResourceCreate):

    db_resource = models.Resource(
        project_id=resource.project_id,
        resource_name=resource.resource_name,
        category=resource.category,
        quantity=resource.quantity,
        unit=resource.unit,
        status=resource.status
    )

    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)

    return db_resource

def get_resources(
    db: Session,
    skip: int = 0,
    limit: int = 20
):
    return (
        db.query(models.Resource)
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_resource(db: Session, resource_id: int):

    return (
        db.query(models.Resource)
        .filter(models.Resource.id == resource_id)
        .first()
    )
def update_resource(
    db: Session,
    resource_id: int,
    resource: schemas.ResourceUpdate
):

    db_resource = get_resource(db, resource_id)

    if not db_resource:
        return None

    update_data = resource.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_resource, key, value)

    db.commit()
    db.refresh(db_resource)

    return db_resource


def delete_resource(db: Session, resource_id: int):

    db_resource = get_resource(db, resource_id)

    if not db_resource:
        return None

    db.delete(db_resource)
    db.commit()

    return db_resource


# ======================================================
# INVENTORY CRUD
# ======================================================

def create_inventory(db: Session, inventory: schemas.InventoryCreate):

    db_inventory = models.Inventory(
        project_id=inventory.project_id,
        material_name=inventory.material_name,
        category=getattr(inventory, 'category', 'Cement') or 'Cement',
        quantity=inventory.quantity,
        unit=inventory.unit,
        minimum_stock=inventory.minimum_stock,
        supplier=inventory.supplier
    )

    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)

    return db_inventory

def get_inventory(
    db: Session,
    skip: int = 0,
    limit: int = 20
):
    return (
        db.query(models.Inventory)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_inventory_item(db: Session, inventory_id: int):

    return (
        db.query(models.Inventory)
        .filter(models.Inventory.id == inventory_id)
        .first()
    )


def update_inventory(
    db: Session,
    inventory_id: int,
    inventory: schemas.InventoryUpdate
):

    db_inventory = get_inventory_item(db, inventory_id)

    if not db_inventory:
        return None

    update_data = inventory.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_inventory, key, value)

    db.commit()
    db.refresh(db_inventory)

    return db_inventory



def delete_inventory(db: Session, inventory_id: int):

    db_inventory = get_inventory_item(db, inventory_id)

    if not db_inventory:
        return None

    db.delete(db_inventory)
    db.commit()

    return db_inventory



# ======================================================
# WORKERS CRUD
# ======================================================

def create_worker(db: Session, worker: schemas.WorkerCreate):

    db_worker = models.Worker(
        project_id=worker.project_id,
        name=worker.name,
        phone=worker.phone,
        designation=worker.designation,
        salary=worker.salary
    )

    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)

    return db_worker


def get_workers(
    db: Session,
    skip: int = 0,
    limit: int = 20
):
    return (
        db.query(models.Worker)
        .offset(skip)
        .limit(limit)
        .all()
    )

def search_workers(db: Session, name: str):
    return (
        db.query(models.Worker)
        .filter(models.Worker.name.ilike(f"%{name}%"))
        .all()
    )  


def get_worker(db: Session, worker_id: int):

    return (
        db.query(models.Worker)
        .filter(models.Worker.id == worker_id)
        .first()
    )


def update_worker(
    db: Session,
    worker_id: int,
    worker: schemas.WorkerUpdate
):
    db_worker = get_worker(db, worker_id)

    if not db_worker:
        return None

    update_data = worker.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_worker, key, value)

    db.commit()
    db.refresh(db_worker)

    return db_worker


def delete_worker(db: Session, worker_id: int):

    db_worker = get_worker(db, worker_id)

    if not db_worker:
        return None

    db.delete(db_worker)
    db.commit()

    return db_worker


# ======================================================
# ATTENDANCE CRUD
# ======================================================

def create_attendance(db: Session, attendance: schemas.AttendanceCreate):

    db_attendance = models.Attendance(
        worker_id=attendance.worker_id,
        project_id=attendance.project_id,
        attendance_date=attendance.attendance_date,
        status=attendance.status,
        check_in=attendance.check_in,
        check_out=attendance.check_out
    )

    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)

    return db_attendance

def get_attendance(
    db: Session,
    skip: int = 0,
    limit: int = 20
):
    return (
        db.query(models.Attendance)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_attendance_record(db: Session, attendance_id: int):

    return (
        db.query(models.Attendance)
        .filter(models.Attendance.id == attendance_id)
        .first()
    )


def update_attendance(
    db: Session,
    attendance_id: int,
     attendance: schemas.AttendanceUpdate
):
    db_attendance = get_attendance_record(db, attendance_id)

    if not db_attendance:
        return None

    update_data = attendance.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_attendance, key, value)

    db.commit()
    db.refresh(db_attendance)

    return db_attendance


def delete_attendance(db: Session, attendance_id: int):

    db_attendance = get_attendance_record(db, attendance_id)

    if not db_attendance:
        return None

    db.delete(db_attendance)
    db.commit()

    return db_attendance


# ======================================================
# PROCUREMENT CRUD
# ======================================================

def create_procurement(db: Session, procurement: schemas.ProcurementCreate):

    db_procurement = models.Procurement(
        project_id=procurement.project_id,
        material_name=procurement.material_name,
        category=getattr(procurement, 'category', 'Raw Materials') or 'Raw Materials',
        supplier=procurement.supplier,
        vendor_contact=getattr(procurement, 'vendor_contact', None),
        invoice_number=getattr(procurement, 'invoice_number', None),
        payment_status=getattr(procurement, 'payment_status', 'Pending') or 'Pending',
        quantity=procurement.quantity,
        total_cost=procurement.total_cost,
        purchase_date=procurement.purchase_date,
        status=procurement.status
    )

    db.add(db_procurement)
    db.commit()
    db.refresh(db_procurement)

    return db_procurement


def get_procurements(
    db: Session,
    skip: int = 0,
    limit: int = 20
):
    return (
        db.query(models.Procurement)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_procurement(db: Session, procurement_id: int):

    return (
        db.query(models.Procurement)
        .filter(models.Procurement.id == procurement_id)
        .first()
    )
def update_procurement(
    db: Session,
    procurement_id: int,
    procurement: schemas.ProcurementUpdate
):
    db_procurement = get_procurement(db, procurement_id)

    if not db_procurement:
        return None

    for key, value in procurement.model_dump(exclude_unset=True).items():
        setattr(db_procurement, key, value)

    db.commit()
    db.refresh(db_procurement)

    return db_procurement


def delete_procurement(db: Session, procurement_id: int):

    db_procurement = get_procurement(db, procurement_id)

    if not db_procurement:
        return None

    db.delete(db_procurement)
    db.commit()

    return db_procurement


def update_procurement_status(db: Session, procurement_id: int, status: str):
    db_procurement = get_procurement(db, procurement_id)
    if not db_procurement:
        return None

    db_procurement.status = status
    db.commit()
    db.refresh(db_procurement)
    return db_procurement


# ======================================================
# NOTIFICATIONS CRUD
# ======================================================

def create_notification(db: Session, notification: schemas.NotificationCreate):

    db_notification = models.Notification(
        user_id=notification.user_id,
        notification_type=notification.notification_type or "System Notification",
        title=notification.title,
        message=notification.message
    )

    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)

    return db_notification


def get_notifications(
    db: Session,
    skip: int = 0,
    limit: int = 20
):
    return (
        db.query(models.Notification)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_notifications_by_user(db: Session, user_id: int):
    return (
        db.query(models.Notification)
        .filter(models.Notification.user_id == user_id)
        .order_by(models.Notification.id.desc())
        .all()
    )



def get_notification(db: Session, notification_id: int):

    return (
        db.query(models.Notification)
        .filter(models.Notification.id == notification_id)
        .first()
    )


def update_notification(
    db: Session,
    notification_id: int,
    notification: schemas.NotificationUpdate
):
    db_notification = get_notification(db, notification_id)

    if not db_notification:
        return None

    update_data = notification.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_notification, key, value)

    db.commit()
    db.refresh(db_notification)

    return db_notification


def mark_notification_read(
    db: Session,
    notification_id: int
):

    db_notification = get_notification(db, notification_id)

    if not db_notification:
        return None

    db_notification.is_read = True

    db.commit()
    db.refresh(db_notification)

    return db_notification


def delete_notification(db: Session, notification_id: int):

    db_notification = get_notification(db, notification_id)

    if not db_notification:
        return None

    db.delete(db_notification)
    db.commit()

    return db_notification


# ======================================================
# REPORT CRUD
# ======================================================

def create_report(db: Session, report: schemas.ReportCreate):

    db_report = models.Report(
        project_id=report.project_id,
        generated_by=report.generated_by,
        report_type=report.report_type,
        report_url=report.report_url
    )

    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    return db_report


def get_reports(
    db: Session,
    skip: int = 0,
    limit: int = 20
):
    return (
        db.query(models.Report)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_report(db: Session, report_id: int):

    return (
        db.query(models.Report)
        .filter(models.Report.id == report_id)
        .first()
    )

def update_report(
    db: Session,
    report_id: int,
    report: schemas.ReportUpdate
):
    db_report = get_report(db, report_id)

    if not db_report:
        return None

    update_data = report.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_report, key, value)

    db.commit()
    db.refresh(db_report)

    return db_report


def delete_report(db: Session, report_id: int):

    db_report = get_report(db, report_id)

    if not db_report:
        return None

    db.delete(db_report)
    db.commit()

    return db_report











def search_inventory(
    db: Session,
    material: str
):
    return (
        db.query(models.Inventory)
        .filter(
            models.Inventory.material_name.ilike(f"%{material}%")
        )
        .all()
    )


def pending_procurements(db):
    return db.query(models.Procurement).filter(
        models.Procurement.status == "Pending"
    ).all()


def allocate_resource(db: Session, resource_id: int):
    resource = db.query(models.Resource).filter(
        models.Resource.id == resource_id
    ).first()

    if not resource:
        return None

    resource.status = "Allocated"
    db.commit()
    db.refresh(resource)
    return resource


def update_resource_status(db: Session, resource_id: int, status: str):
    resource = db.query(models.Resource).filter(
        models.Resource.id == resource_id
    ).first()

    if not resource:
        return None

    resource.status = status
    db.commit()
    db.refresh(resource)
    return resource



def available_resources(db: Session):

    return db.query(models.Resource).filter(
        models.Resource.status == "Available"
    ).all()



def today_attendance(db: Session):
    return db.query(models.Attendance).filter(
    models.Attendance.attendance_date == date.today()
).all()


def admin_dashboard(db: Session):
    return {
        # Basic totals
        "users": db.query(models.User).count(),
        "projects": db.query(models.Project).count(),
        "workers": db.query(models.Worker).count(),
        "inventory": db.query(models.Inventory).count(),
        "notifications": db.query(models.Notification).count(),

        # Project analytics
        "running_projects": running_projects(db),
        "completed_projects": completed_projects(db),

        # Inventory analytics
        "low_stock": low_stock_count(db),

        # Attendance analytics
        "attendance_today": attendance_today_count(db),

        # Procurement analytics
        "pending_procurements": db.query(models.Procurement)
    .filter(
        models.Procurement.status == "Pending"
    )
    .count(),

        # Frontend-compatible names
        "total_projects": db.query(models.Project).count(),
        "total_workers": db.query(models.Worker).count(),
        "total_inventory": db.query(models.Inventory).count()
    }

def search_milestones(db: Session, name: str):
    return (
        db.query(models.ProjectMilestone)
        .filter(
            models.ProjectMilestone.milestone_name.ilike(f"%{name}%")
        )
        .all()
    )


def search_resources(
    db: Session,
    name: str
):
    return (
        db.query(models.Resource)
        .filter(
            models.Resource.resource_name.ilike(f"%{name}%")
        )
        .all()
    )


def search_procurements(
    db: Session,
    material: str
):
    return (
        db.query(models.Procurement)
        .filter(
            models.Procurement.material_name.ilike(f"%{material}%")
        )
        .all()
    )


def search_notifications(
    db: Session,
    title: str
):
    return (
        db.query(models.Notification)
        .filter(
            models.Notification.title.ilike(f"%{title}%")
        )
        .all()
    )

def search_reports(
    db: Session,
    report_type: str
):
    return (
        db.query(models.Report)
        .filter(
            models.Report.report_type.ilike(f"%{report_type}%")
        )
        .all()
    )

def running_projects(db):
    return db.query(models.Project).filter(
        models.Project.status=="Running"
    ).count()


def completed_projects(db):
    return db.query(models.Project).filter(
        models.Project.status=="Completed"
    ).count()


def low_stock(db: Session):
    return db.query(models.Inventory).filter(
        models.Inventory.quantity < models.Inventory.minimum_stock
    ).all()

def low_stock_count(db):
    return db.query(models.Inventory).filter(
        models.Inventory.quantity < models.Inventory.minimum_stock
    ).count()




def attendance_today_count(db):
    return db.query(models.Attendance).filter(
        models.Attendance.attendance_date==date.today()
    ).count()





def search_resource(db: Session, keyword: str):

    return db.query(models.Resource).filter(

        models.Resource.resource_name.ilike(f"%{keyword}%")

    ).all()



def update_stock(
    db: Session,
    inventory_id: int,
    quantity: int
):
    item = db.query(models.Inventory).filter(
        models.Inventory.id == inventory_id
    ).first()

    if not item:
        return None

    item.quantity += quantity

    db.commit()
    db.refresh(item)

    return item



def assign_worker(
    db: Session,
    worker_id: int,
    project_id: int
):
    worker = db.query(models.Worker).filter(
        models.Worker.id == worker_id
    ).first()

    if not worker:
        return None

    worker.project_id = project_id

    db.commit()
    db.refresh(worker)

    return worker




def worker_history(
    db: Session,
    worker_id: int
):

    return db.query(models.Attendance).filter(

        models.Attendance.worker_id == worker_id

    ).all()




def mark_attendance(
    db: Session,
    attendance
):

    db_att = models.Attendance(
    **attendance.model_dump()
)

    db.add(db_att)

    db.commit()

    db.refresh(db_att)

    return db_att








def monthly_report(
    db: Session,
    month: int,
    year: int
):

    return db.query(models.Attendance).filter(

      extract("month", models.Attendance.attendance_date) == month,
      extract("year", models.Attendance.attendance_date) == year
    ).all()




def present_count(db: Session):

    return db.query(func.count(models.Attendance.id)).filter(

        models.Attendance.status == "Present"

    ).scalar()








# ======================================================
# VENDOR CRUD
# ======================================================

def create_vendor(db: Session, vendor: schemas.VendorCreate):
    db_vendor = models.Vendor(
        vendor_name=vendor.vendor_name,
        contact_person=vendor.contact_person,
        phone=vendor.phone,
        email=vendor.email,
        address=vendor.address,
        materials=vendor.materials,
        rating=vendor.rating or 5.0,
        is_active=vendor.is_active if vendor.is_active is not None else True
    )
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor

def get_vendors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Vendor).offset(skip).limit(limit).all()

def get_vendor(db: Session, vendor_id: int):
    return db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()

def update_vendor(db: Session, vendor_id: int, vendor: schemas.VendorUpdate):
    db_vendor = get_vendor(db, vendor_id)
    if not db_vendor:
        return None
    for key, val in vendor.model_dump(exclude_unset=True).items():
        setattr(db_vendor, key, val)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor

def delete_vendor(db: Session, vendor_id: int):
    db_vendor = get_vendor(db, vendor_id)
    if not db_vendor:
        return None
    db.delete(db_vendor)
    db.commit()
    return db_vendor




# ======================================================
# MATERIAL REQUEST CRUD
# ======================================================

def create_material_request(
    db: Session,
    request: schemas.MaterialRequestCreate,
    user_id: Optional[int] = None
):
    db_request = models.MaterialRequest(
        project_id=request.project_id,
        material_name=request.material_name,
        quantity=request.quantity,
        required_date=request.required_date,
        priority=request.priority or "Medium",
        status="Pending",
        requested_by=user_id
    )

    db.add(db_request)
    db.commit()
    db.refresh(db_request)

    return db_request


def get_material_requests(
    db: Session,
    skip: int = 0,
    limit: int = 100
):
    return (
        db.query(models.MaterialRequest)
        .order_by(models.MaterialRequest.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_material_request(
    db: Session,
    request_id: int
):
    return (
        db.query(models.MaterialRequest)
        .filter(models.MaterialRequest.id == request_id)
        .first()
    )


def update_material_request(
    db: Session,
    request_id: int,
    request: schemas.MaterialRequestUpdate
):
    db_request = get_material_request(db, request_id)

    if not db_request:
        return None

    update_data = request.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_request, key, value)

    db.commit()
    db.refresh(db_request)

    return db_request


def delete_material_request(
    db: Session,
    request_id: int
):
    db_request = get_material_request(db, request_id)

    if not db_request:
        return None

    db.delete(db_request)
    db.commit()

    return db_request


def approve_material_request(
    db: Session,
    request_id: int,
    comments: Optional[str] = None
):
    db_request = get_material_request(db, request_id)

    if not db_request:
        return None

    db_request.status = "Approved"

    if comments:
        db_request.comments = comments

    db.commit()
    db.refresh(db_request)

    return db_request


def reject_material_request(
    db: Session,
    request_id: int,
    comments: Optional[str] = None
):
    db_request = get_material_request(db, request_id)

    if not db_request:
        return None

    db_request.status = "Rejected"

    if comments:
        db_request.comments = comments

    db.commit()
    db.refresh(db_request)

    return db_request





# ======================================================
# INVOICE CRUD
# ======================================================
def absent_count(db: Session):

    return db.query(func.count(models.Attendance.id)).filter(

        models.Attendance.status == "Absent"

    ).scalar()






# ======================================================
# ======================================================
# NOTIFICATION DISPATCHER HELPER
# ======================================================

def notify_all_accounts(
    db: Session,
    target_user_ids: List[int],
    title: str,
    message: str,
    notification_type: str = "Procurement Alert"
):
    try:
        all_users = db.query(models.User).all()

        user_ids = set(target_user_ids)

        for user in all_users:
            user_ids.add(user.id)

        for user_id in user_ids:
            if user_id:
                db.add(
                    models.Notification(
                        user_id=user_id,
                        notification_type=notification_type,
                        title=title,
                        message=message
                    )
                )

        db.commit()

    except Exception as e:
        db.rollback()
        print("Notification Dispatch Error:", e)


# ======================================================
# PURCHASE ORDER CRUD
# ======================================================

def create_purchase_order(
    db: Session,
    po: schemas.PurchaseOrderCreate
):
    import uuid

    po_no = (
        po.po_number
        or f"PO-{uuid.uuid4().hex[:8].upper()}"
    )

    total = po.quantity * po.unit_price

    db_po = models.PurchaseOrder(
        po_number=po_no,
        vendor_id=po.vendor_id,
        request_id=po.request_id,
        project_id=po.project_id,
        material_name=po.material_name,
        quantity=po.quantity,
        unit_price=po.unit_price,
        total_amount=total,
        expected_delivery_date=po.expected_delivery_date,
        status="Created"
    )

    db.add(db_po)
    db.commit()
    db.refresh(db_po)

    notify_all_accounts(
        db,
        [],
        title=f"New PO Issued: {po_no}",
        message=(
            f"Purchase Order {po_no} generated for "
            f"{po.quantity} units of {po.material_name} "
            f"(Total: ₹{total:,.2f})."
        )
    )

    return db_po


def get_purchase_orders(
    db: Session,
    skip: int = 0,
    limit: int = 100
):
    return (
        db.query(models.PurchaseOrder)
        .order_by(models.PurchaseOrder.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_purchase_order(
    db: Session,
    po_id: int
):
    return (
        db.query(models.PurchaseOrder)
        .filter(models.PurchaseOrder.id == po_id)
        .first()
    )


def update_purchase_order(
    db: Session,
    po_id: int,
    po_update: schemas.PurchaseOrderUpdate
):
    db_po = get_purchase_order(db, po_id)

    if not db_po:
        return None

    update_data = po_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_po, key, value)

    if "quantity" in update_data or "unit_price" in update_data:
        db_po.total_amount = (
            db_po.quantity * db_po.unit_price
        )

    db.commit()
    db.refresh(db_po)

    notify_all_accounts(
        db,
        [],
        title=f"PO Updated: {db_po.po_number}",
        message=(
            f"Purchase Order {db_po.po_number} for "
            f"{db_po.material_name} has been updated. "
            f"Status: {db_po.status}"
        )
    )

    return db_po


def delete_purchase_order(
    db: Session,
    po_id: int
):
    db_po = get_purchase_order(db, po_id)

    if not db_po:
        return None

    db.delete(db_po)
    db.commit()

    return db_po


def receive_material_delivery(
    db: Session,
    po_id: int,
    received_quantity: Optional[int] = None,
    status: str = "Received"
):
    db_po = get_purchase_order(db, po_id)

    if not db_po:
        return None

    if db_po.status == "Received":
        return None

    qty_received = (
        received_quantity
        if received_quantity is not None
        else db_po.quantity
    )

    if qty_received <= 0:
        return None

    db_po.status = status

    existing_inventory = (
        db.query(models.Inventory)
        .filter(
            models.Inventory.project_id == db_po.project_id,
            models.Inventory.material_name.ilike(
                db_po.material_name
            )
        )
        .first()
    )

    if existing_inventory:
        existing_inventory.quantity += qty_received

    else:
        new_inv = models.Inventory(
            project_id=db_po.project_id,
            material_name=db_po.material_name,
            category="Raw Materials",
            quantity=qty_received,
            unit="Bags",
            minimum_stock=10,
            supplier=(
                db_po.vendor.vendor_name
                if db_po.vendor
                else "Vendor"
            )
        )

        db.add(new_inv)

    db.commit()
    db.refresh(db_po)

    notify_all_accounts(
        db,
        [],
        title=f"Delivery Received: {db_po.material_name}",
        message=(
            f"{qty_received} units of "
            f"{db_po.material_name} received on site. "
            f"Inventory stock updated."
        )
    )

    return db_po

# ======================================================
# INVOICE CRUD
# ======================================================

def create_invoice(
    db: Session,
    invoice: schemas.InvoiceCreate
):
    import uuid

    inv_no = (
        invoice.invoice_no
        or f"INV-{uuid.uuid4().hex[:8].upper()}"
    )

    db_inv = models.Invoice(
        invoice_no=inv_no,
        vendor_id=invoice.vendor_id,
        purchase_order_id=invoice.purchase_order_id,
        amount=invoice.amount,
        gst=invoice.gst or 0.0,
        invoice_date=invoice.invoice_date,
        payment_status="Pending"
    )

    db.add(db_inv)
    db.commit()
    db.refresh(db_inv)

    notify_all_accounts(
        db,
        [],
        title=f"Invoice Uploaded: {inv_no}",
        message=(
            f"Vendor Invoice {inv_no} uploaded for "
            f"Purchase Order #{invoice.purchase_order_id} "
            f"(Amount: ₹{invoice.amount:,.2f})."
        )
    )

    return db_inv


def get_invoices(
    db: Session,
    skip: int = 0,
    limit: int = 100
):
    return (
        db.query(models.Invoice)
        .order_by(models.Invoice.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_invoice(
    db: Session,
    invoice_id: int
):
    return (
        db.query(models.Invoice)
        .filter(models.Invoice.id == invoice_id)
        .first()
    )


def update_invoice(
    db: Session,
    invoice_id: int,
    invoice: schemas.InvoiceUpdate
):
    db_inv = get_invoice(db, invoice_id)

    if not db_inv:
        return None

    update_data = invoice.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_inv, key, value)

    db.commit()
    db.refresh(db_inv)

    return db_inv


def delete_invoice(
    db: Session,
    invoice_id: int
):
    db_inv = get_invoice(db, invoice_id)

    if not db_inv:
        return None

    db.delete(db_inv)
    db.commit()

    return db_inv


def update_invoice_payment(
    db: Session,
    invoice_id: int,
    payment_status: str
):
    db_inv = get_invoice(db, invoice_id)

    if not db_inv:
        return None

    db_inv.payment_status = payment_status

    db.commit()
    db.refresh(db_inv)

    notify_all_accounts(
        db,
        [],
        title=f"Payment Status Updated: {db_inv.invoice_no}",
        message=(
            f"Invoice {db_inv.invoice_no} payment status "
            f"updated to '{payment_status}'."
        )
    )

    return db_inv





# ======================================================
# DOCUMENT CRUD
# ======================================================

def create_document(
    db: Session,
    document: schemas.DocumentCreate
):
    db_document = models.Document(
        project_id=document.project_id,
        uploaded_by=document.uploaded_by,
        file_name=document.file_name,
        file_type=document.file_type,
        file_path=document.file_path,
        description=document.description
    )

    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    return db_document


def get_documents(
    db: Session,
    skip: int = 0,
    limit: int = 100
):
    return (
        db.query(models.Document)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_document(
    db: Session,
    document_id: int
):
    return (
        db.query(models.Document)
        .filter(models.Document.id == document_id)
        .first()
    )


def update_document(
    db: Session,
    document_id: int,
    document: schemas.DocumentUpdate
):
    db_doc = get_document(db, document_id)

    if not db_doc:
        return None

    update_data = document.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_doc, key, value)

    db.commit()
    db.refresh(db_doc)

    return db_doc


def delete_document(db: Session, document_id: int):
    db_doc = get_document(db, document_id)

    if not db_doc:
        return None

    db.delete(db_doc)
    db.commit()

    return db_doc


# ======================================================
# ANALYTICS CRUD
# ======================================================

def create_analytics(
    db: Session,
    analytics: schemas.AnalyticsCreate
):
    db_analytics = models.Analytics(
        project_id=analytics.project_id,
        total_budget=analytics.total_budget,
        total_expense=analytics.total_expense,
        completed_milestones=analytics.completed_milestones,
        total_milestones=analytics.total_milestones,
        total_workers=analytics.total_workers,
        total_inventory=analytics.total_inventory,
        pending_procurements=analytics.pending_procurements
    )

    db.add(db_analytics)
    db.commit()
    db.refresh(db_analytics)

    return db_analytics


def get_analytics(
    db: Session,
    skip: int = 0,
    limit: int = 100
):
    return (
        db.query(models.Analytics)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_analytics_by_id(
    db: Session,
    analytics_id: int
):
    return (
        db.query(models.Analytics)
        .filter(models.Analytics.id == analytics_id)
        .first()
    )


def get_project_analytics(
    db: Session,
    project_id: int
):
    return (
        db.query(models.Analytics)
        .filter(models.Analytics.project_id == project_id)
        .all()
    )


def update_analytics(
    db: Session,
    analytics_id: int,
    analytics: schemas.AnalyticsUpdate
):
    db_analytics = get_analytics_by_id(db, analytics_id)

    if not db_analytics:
        return None

    update_data = analytics.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_analytics, key, value)

    db.commit()
    db.refresh(db_analytics)

    return db_analytics


def delete_analytics(
    db: Session,
    analytics_id: int
):
    db_analytics = get_analytics_by_id(db, analytics_id)

    if not db_analytics:
        return None

    db.delete(db_analytics)
    db.commit()

    return db_analytics


# ============================================================
# EXPENSE CRUD
# ============================================================

def create_expense(db: Session, expense: schemas.ExpenseCreate):
    db_expense = models.Expense(**expense.model_dump())

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)

    return db_expense


def get_expenses(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Expense)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_expense(db: Session, expense_id: int):
    return (
        db.query(models.Expense)
        .filter(models.Expense.id == expense_id)
        .first()
    )


def update_expense(
    db: Session,
    expense_id: int,
    expense: schemas.ExpenseUpdate
):
    db_expense = get_expense(db, expense_id)

    if not db_expense:
        return None

    for key, value in expense.model_dump(
        exclude_unset=True
    ).items():
        setattr(db_expense, key, value)

    db.commit()
    db.refresh(db_expense)

    return db_expense


def delete_expense(db: Session, expense_id: int):
    db_expense = get_expense(db, expense_id)

    if not db_expense:
        return None

    db.delete(db_expense)
    db.commit()

    return db_expense


# ============================================================
# RESOURCE ALLOCATION CRUD
# ============================================================

def create_resource_allocation(
    db: Session,
    allocation: schemas.ResourceAllocationCreate
):
    db_allocation = models.ResourceAllocation(
        **allocation.model_dump()
    )

    db.add(db_allocation)
    db.commit()
    db.refresh(db_allocation)

    return db_allocation


def get_resource_allocations(
    db: Session,
    skip: int = 0,
    limit: int = 100
):
    return (
        db.query(models.ResourceAllocation)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_resource_allocation(
    db: Session,
    allocation_id: int
):
    return (
        db.query(models.ResourceAllocation)
        .filter(
            models.ResourceAllocation.id == allocation_id
        )
        .first()
    )


def update_resource_allocation(
    db: Session,
    allocation_id: int,
    allocation: schemas.ResourceAllocationUpdate
):
    db_allocation = get_resource_allocation(
        db,
        allocation_id
    )

    if not db_allocation:
        return None

    for key, value in allocation.model_dump(
        exclude_unset=True
    ).items():
        setattr(db_allocation, key, value)

    db.commit()
    db.refresh(db_allocation)

    return db_allocation


def delete_resource_allocation(
    db: Session,
    allocation_id: int
):
    db_allocation = get_resource_allocation(
        db,
        allocation_id
    )

    if not db_allocation:
        return None

    db.delete(db_allocation)
    db.commit()

    return db_allocation


# ============================================================
# RESOURCE MAINTENANCE CRUD
# ============================================================

def create_resource_maintenance(
    db: Session,
    maintenance: schemas.ResourceMaintenanceCreate
):
    db_maintenance = models.ResourceMaintenance(
        **maintenance.model_dump()
    )

    db.add(db_maintenance)
    db.commit()
    db.refresh(db_maintenance)

    return db_maintenance


def get_resource_maintenances(
    db: Session,
    skip: int = 0,
    limit: int = 100
):
    return (
        db.query(models.ResourceMaintenance)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_resource_maintenance(
    db: Session,
    maintenance_id: int
):
    return (
        db.query(models.ResourceMaintenance)
        .filter(
            models.ResourceMaintenance.id == maintenance_id
        )
        .first()
    )


def update_resource_maintenance(
    db: Session,
    maintenance_id: int,
    maintenance: schemas.ResourceMaintenanceUpdate
):
    db_maintenance = get_resource_maintenance(
        db,
        maintenance_id
    )

    if not db_maintenance:
        return None

    for key, value in maintenance.model_dump(
        exclude_unset=True
    ).items():
        setattr(db_maintenance, key, value)

    db.commit()
    db.refresh(db_maintenance)

    return db_maintenance


def delete_resource_maintenance(
    db: Session,
    maintenance_id: int
):
    db_maintenance = get_resource_maintenance(
        db,
        maintenance_id
    )

    if not db_maintenance:
        return None

    db.delete(db_maintenance)
    db.commit()

    return db_maintenance


# ============================================================
# SITE PROGRESS REPORT CRUD
# ============================================================

def create_site_progress_report(
    db: Session,
    report: schemas.SiteProgressReportCreate
):
    db_report = models.SiteProgressReport(
        **report.model_dump()
    )

    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    return db_report


def get_site_progress_reports(
    db: Session,
    skip: int = 0,
    limit: int = 100
):
    return (
        db.query(models.SiteProgressReport)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_site_progress_report(
    db: Session,
    report_id: int
):
    return (
        db.query(models.SiteProgressReport)
        .filter(
            models.SiteProgressReport.id == report_id
        )
        .first()
    )


def update_site_progress_report(
    db: Session,
    report_id: int,
    report: schemas.SiteProgressReportUpdate
):
    db_report = get_site_progress_report(db, report_id)

    if not db_report:
        return None

    for key, value in report.model_dump(
        exclude_unset=True
    ).items():
        setattr(db_report, key, value)

    db.commit()
    db.refresh(db_report)

    return db_report


def delete_site_progress_report(
    db: Session,
    report_id: int
):
    db_report = get_site_progress_report(db, report_id)

    if not db_report:
        return None

    db.delete(db_report)
    db.commit()

    return db_report


# ============================================================
# SITE ACTIVITY LOG CRUD
# ============================================================

def create_site_activity_log(
    db: Session,
    activity: schemas.SiteActivityLogCreate
):
    db_activity = models.SiteActivityLog(
        **activity.model_dump()
    )

    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)

    return db_activity


def get_site_activity_logs(
    db: Session,
    skip: int = 0,
    limit: int = 100
):
    return (
        db.query(models.SiteActivityLog)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_site_activity_log(
    db: Session,
    activity_id: int
):
    return (
        db.query(models.SiteActivityLog)
        .filter(
            models.SiteActivityLog.id == activity_id
        )
        .first()
    )


def update_site_activity_log(
    db: Session,
    activity_id: int,
    activity: schemas.SiteActivityLogUpdate
):
    db_activity = get_site_activity_log(
        db,
        activity_id
    )

    if not db_activity:
        return None

    for key, value in activity.model_dump(
        exclude_unset=True
    ).items():
        setattr(db_activity, key, value)

    db.commit()
    db.refresh(db_activity)

    return db_activity


def delete_site_activity_log(
    db: Session,
    activity_id: int
):
    db_activity = get_site_activity_log(
        db,
        activity_id
    )

    if not db_activity:
        return None

    db.delete(db_activity)
    db.commit()

    return db_activity


# ============================================================
# WORKER SHIFT CRUD
# ============================================================

def create_worker_shift(
    db: Session,
    shift: schemas.WorkerShiftCreate
):
    db_shift = models.WorkerShift(
        **shift.model_dump()
    )

    db.add(db_shift)
    db.commit()
    db.refresh(db_shift)

    return db_shift


def get_worker_shifts(
    db: Session,
    skip: int = 0,
    limit: int = 100
):
    return (
        db.query(models.WorkerShift)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_worker_shift(
    db: Session,
    shift_id: int
):
    return (
        db.query(models.WorkerShift)
        .filter(models.WorkerShift.id == shift_id)
        .first()
    )


def update_worker_shift(
    db: Session,
    shift_id: int,
    shift: schemas.WorkerShiftUpdate
):
    db_shift = get_worker_shift(db, shift_id)

    if not db_shift:
        return None

    for key, value in shift.model_dump(
        exclude_unset=True
    ).items():
        setattr(db_shift, key, value)

    db.commit()
    db.refresh(db_shift)

    return db_shift


def delete_worker_shift(
    db: Session,
    shift_id: int
):
    db_shift = get_worker_shift(db, shift_id)

    if not db_shift:
        return None

    db.delete(db_shift)
    db.commit()

    return db_shift


# ============================================================
# PAYROLL CRUD
# ============================================================

def create_payroll_record(
    db: Session,
    payroll: schemas.PayrollRecordCreate
):
    db_payroll = models.PayrollRecord(
        **payroll.model_dump()
    )

    db.add(db_payroll)
    db.commit()
    db.refresh(db_payroll)

    return db_payroll


def get_payroll_records(
    db: Session,
    skip: int = 0,
    limit: int = 100
):
    return (
        db.query(models.PayrollRecord)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_payroll_record(
    db: Session,
    payroll_id: int
):
    return (
        db.query(models.PayrollRecord)
        .filter(models.PayrollRecord.id == payroll_id)
        .first()
    )


def update_payroll_record(
    db: Session,
    payroll_id: int,
    payroll: schemas.PayrollRecordUpdate
):
    db_payroll = get_payroll_record(db, payroll_id)

    if not db_payroll:
        return None

    for key, value in payroll.model_dump(
        exclude_unset=True
    ).items():
        setattr(db_payroll, key, value)

    db.commit()
    db.refresh(db_payroll)

    return db_payroll


def delete_payroll_record(
    db: Session,
    payroll_id: int
):
    db_payroll = get_payroll_record(db, payroll_id)

    if not db_payroll:
        return None

    db.delete(db_payroll)
    db.commit()

    return db_payroll


# ============================================================
# MATERIAL ALLOCATION CRUD
# ============================================================

def create_material_allocation(
    db: Session,
    allocation: schemas.MaterialAllocationCreate
):
    db_allocation = models.MaterialAllocation(
        **allocation.model_dump()
    )

    db.add(db_allocation)
    db.commit()
    db.refresh(db_allocation)

    return db_allocation


def get_material_allocations(
    db: Session,
    skip: int = 0,
    limit: int = 100
):
    return (
        db.query(models.MaterialAllocation)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_material_allocation(
    db: Session,
    allocation_id: int
):
    return (
        db.query(models.MaterialAllocation)
        .filter(
            models.MaterialAllocation.id == allocation_id
        )
        .first()
    )


def update_material_allocation(
    db: Session,
    allocation_id: int,
    allocation: schemas.MaterialAllocationUpdate
):
    db_allocation = get_material_allocation(
        db,
        allocation_id
    )

    if not db_allocation:
        return None

    for key, value in allocation.model_dump(
        exclude_unset=True
    ).items():
        setattr(db_allocation, key, value)

    db.commit()
    db.refresh(db_allocation)

    return db_allocation


def delete_material_allocation(
    db: Session,
    allocation_id: int
):
    db_allocation = get_material_allocation(
        db,
        allocation_id
    )

    if not db_allocation:
        return None

    db.delete(db_allocation)
    db.commit()

    return db_allocation





# ==========================================================
# PASSWORD RESET
# ==========================================================




def hash_reset_token(token: str) -> str:
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def create_password_reset_token(
    db: Session,
    user_id: int,
    token: str,
    expires_at: datetime
):
    token_hash = hash_reset_token(token)

    db_token = models.PasswordResetToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
        used=False
    )

    db.add(db_token)
    db.commit()
    db.refresh(db_token)

    return db_token


def get_password_reset_token(
    db: Session,
    token: str
):
    token_hash = hash_reset_token(token)

    return (
        db.query(models.PasswordResetToken)
        .filter(
            models.PasswordResetToken.token_hash == token_hash,
            models.PasswordResetToken.used == False
        )
        .first()
    )


def mark_password_reset_token_used(
    db: Session,
    reset_token: models.PasswordResetToken
):
    reset_token.used = True

    db.commit()
    db.refresh(reset_token)

    return reset_token
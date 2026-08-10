from typing import Optional, List
from sqlalchemy.orm import Session
from app import models, schemas
from app.auth import hash_password

# ======================================================
# USERS CRUD
# ======================================================

def create_user(db: Session, user: schemas.UserRegister):
    db_user = models.User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),   # Later replace with hashed password
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


def update_user(db: Session, user_id: int, user: schemas.UserRegister):

    db_user = get_user(db, user_id)

    if not db_user:
        return None

    db_user.name = user.name
    db_user.email = user.email
    db_user.password = hash_password(user.password)
    db_user.role = user.role
    db_user.phone = user.phone

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

def search_project(db: Session, name: str):
    return (
        db.query(models.Project)
        .filter(models.Project.project_name.ilike(f"%{name}%"))
        .all()
    )

def create_project(db: Session, project: schemas.ProjectCreate):

    db_project = models.Project(
        project_name=project.project_name,
        description=project.description,
        location=project.location,
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


def update_project(db: Session,
                   project_id: int,
                   project: schemas.ProjectCreate):

    db_project = get_project(db, project_id)

    if not db_project:
        return None

    db_project.project_name = project.project_name
    db_project.description = project.description
    db_project.location = project.location
    db_project.budget = project.budget
    db_project.start_date = project.start_date
    db_project.end_date = project.end_date
    db_project.status = project.status
    db_project.manager_id = project.manager_id

    db.commit()
    db.refresh(db_project)

    return db_project


def delete_project(db: Session,
                   project_id: int):

    db_project = get_project(db, project_id)

    if not db_project:
        return None

    db.delete(db_project)
    db.commit()

    return db_project



# ======================================================
# PROJECT MILESTONES CRUD
# ======================================================

def create_milestone(db: Session, milestone: schemas.MilestoneCreate):

    db_milestone = models.ProjectMilestone(
        project_id=milestone.project_id,
        milestone_name=milestone.milestone_name,
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
    milestone: schemas.MilestoneCreate
):

    db_milestone = get_milestone(db, milestone_id)

    if not db_milestone:
        return None

    db_milestone.project_id = milestone.project_id
    db_milestone.milestone_name = milestone.milestone_name
    db_milestone.due_date = milestone.due_date
    db_milestone.completed_date = milestone.completed_date
    db_milestone.status = milestone.status

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
    resource: schemas.ResourceCreate
):

    db_resource = get_resource(db, resource_id)

    if not db_resource:
        return None

    db_resource.project_id = resource.project_id
    db_resource.resource_name = resource.resource_name
    db_resource.category = resource.category
    db_resource.quantity = resource.quantity
    db_resource.status = resource.status

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
    inventory: schemas.InventoryCreate
):

    db_inventory = get_inventory_item(db, inventory_id)

    if not db_inventory:
        return None

    db_inventory.project_id = inventory.project_id
    db_inventory.material_name = inventory.material_name
    db_inventory.category = getattr(inventory, 'category', 'Cement') or 'Cement'
    db_inventory.quantity = inventory.quantity
    db_inventory.unit = inventory.unit
    db_inventory.minimum_stock = inventory.minimum_stock
    db_inventory.supplier = inventory.supplier

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
    worker: schemas.WorkerCreate
):

    db_worker = get_worker(db, worker_id)

    if not db_worker:
        return None

    db_worker.project_id = worker.project_id
    db_worker.name = worker.name
    db_worker.phone = worker.phone
    db_worker.designation = worker.designation
    db_worker.salary = worker.salary

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
    attendance: schemas.AttendanceCreate
):

    db_attendance = get_attendance_record(db, attendance_id)

    if not db_attendance:
        return None

    db_attendance.worker_id = attendance.worker_id
    db_attendance.project_id = attendance.project_id
    db_attendance.attendance_date = attendance.attendance_date
    db_attendance.status = attendance.status
    db_attendance.check_in = attendance.check_in
    db_attendance.check_out = attendance.check_out

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
    procurement: schemas.ProcurementCreate
):

    db_procurement = get_procurement(db, procurement_id)

    if not db_procurement:
        return None

    db_procurement.project_id = procurement.project_id
    db_procurement.material_name = procurement.material_name
    db_procurement.supplier = procurement.supplier
    db_procurement.quantity = procurement.quantity
    db_procurement.total_cost = procurement.total_cost
    db_procurement.purchase_date = procurement.purchase_date
    db_procurement.status = procurement.status

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
    notification: schemas.NotificationCreate
):

    db_notification = get_notification(db, notification_id)

    if not db_notification:
        return None

    db_notification.user_id = notification.user_id
    db_notification.title = notification.title
    db_notification.message = notification.message

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
    report: schemas.ReportCreate
):

    db_report = get_report(db, report_id)

    if not db_report:
        return None

    db_report.project_id = report.project_id
    db_report.generated_by = report.generated_by
    db_report.report_type = report.report_type
    db_report.report_url = report.report_url

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


def search_project(db, name):
    return db.query(models.Project).filter(
        models.Project.project_name.ilike(f"%{name}%")
    ).all()







def low_stock(db):
    return db.query(models.Inventory).filter(
        models.Inventory.quantity < 10
    ).all()





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


from datetime import date

def today_attendance(db):
    return db.query(models.Attendance).filter(
        models.Attendance.date == date.today()
    ).all()





def admin_dashboard(db):

    return {

        "users": db.query(models.User).count(),

        "projects": db.query(models.Project).count(),

        "running_projects": running_projects(db),

        "completed_projects": completed_projects(db),

        "workers": db.query(models.Worker).count(),

        "inventory": db.query(models.Inventory).count(),

        "low_stock": low_stock_count(db),

        "attendance_today": attendance_today_count(db),

        "pending_procurements": db.query(models.Procurement)
            .filter(models.Procurement.status=="Pending")
            .count()
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



def low_stock_count(db):
    return db.query(models.Inventory).filter(
        models.Inventory.quantity <
        models.Inventory.minimum_stock
    ).count()

from datetime import date

def attendance_today_count(db):
    return db.query(models.Attendance).filter(
        models.Attendance.attendance_date==date.today()
    ).count()


def low_stock(db: Session):

    return db.query(models.Inventory).filter(

        models.Inventory.quantity < 20

    ).all()


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

        **attendance.dict()

    )

    db.add(db_att)

    db.commit()

    db.refresh(db_att)

    return db_att






from sqlalchemy import extract

def monthly_report(
    db: Session,
    month: int,
    year: int
):

    return db.query(models.Attendance).filter(

        extract("month", models.Attendance.date) == month,

        extract("year", models.Attendance.date) == year

    ).all()


from sqlalchemy import func

def present_count(db: Session):

    return db.query(func.count(models.Attendance.id)).filter(

        models.Attendance.status == "Present"

    ).scalar()


def absent_count(db: Session):

    return db.query(func.count(models.Attendance.id)).filter(

        models.Attendance.status == "Absent"

    ).scalar()



def admin_dashboard(db):
    return {
        "total_projects": db.query(models.Project).count(),
        "total_workers": db.query(models.Worker).count(),
        "total_inventory": db.query(models.Inventory).count(),
        "completed_projects": db.query(models.Project)
            .filter(models.Project.status == "Completed")
            .count(),
        "notifications": db.query(models.Notification).count()
    }


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
    for key, val in vendor.dict(exclude_unset=True).items():
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

def create_material_request(db: Session, request: schemas.MaterialRequestCreate, user_id: Optional[int] = None):
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

def get_material_requests(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.MaterialRequest).order_by(models.MaterialRequest.id.desc()).offset(skip).limit(limit).all()

def get_material_request(db: Session, request_id: int):
    return db.query(models.MaterialRequest).filter(models.MaterialRequest.id == request_id).first()

def approve_material_request(db: Session, request_id: int, comments: Optional[str] = None):
    db_request = get_material_request(db, request_id)
    if not db_request:
        return None
    db_request.status = "Approved"
    if comments:
        db_request.comments = comments
    db.commit()
    db.refresh(db_request)
    return db_request

def reject_material_request(db: Session, request_id: int, comments: Optional[str] = None):
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
# PURCHASE ORDER CRUD
# ======================================================

def create_purchase_order(db: Session, po: schemas.PurchaseOrderCreate):
    import time
    po_no = po.po_number or f"PO-{int(time.time())}"
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
    return db_po

def get_purchase_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.PurchaseOrder).order_by(models.PurchaseOrder.id.desc()).offset(skip).limit(limit).all()

def get_purchase_order(db: Session, po_id: int):
    return db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()

def update_purchase_order(db: Session, po_id: int, po_update: schemas.PurchaseOrderUpdate):
    db_po = get_purchase_order(db, po_id)
    if not db_po:
        return None
    for key, val in po_update.dict(exclude_unset=True).items():
        setattr(db_po, key, val)
    if po_update.quantity is not None or po_update.unit_price is not None:
        db_po.total_amount = db_po.quantity * db_po.unit_price
    db.commit()
    db.refresh(db_po)
    return db_po

def receive_material_delivery(db: Session, po_id: int, received_quantity: Optional[int] = None, status: str = "Received"):
    db_po = get_purchase_order(db, po_id)
    if not db_po:
        return None

    qty_received = received_quantity if received_quantity is not None else db_po.quantity
    db_po.status = status

    # Automatically increase inventory stock for the project!
    existing_inventory = db.query(models.Inventory).filter(
        models.Inventory.project_id == db_po.project_id,
        models.Inventory.material_name.ilike(db_po.material_name)
    ).first()

    if existing_inventory:
        existing_inventory.quantity += qty_received
    else:
        new_inv = models.Inventory(
            project_id=db_po.project_id,
            material_name=db_po.material_name,
            quantity=qty_received,
            unit="Bags",
            minimum_stock=10,
            supplier=db_po.vendor.vendor_name if db_po.vendor else "Vendor"
        )
        db.add(new_inv)

    db.commit()
    db.refresh(db_po)
    return db_po


# ======================================================
# INVOICE CRUD
# ======================================================
def absent_count(db: Session):

    return db.query(func.count(models.Attendance.id)).filter(

        models.Attendance.status == "Absent"

    ).scalar()



def admin_dashboard(db):
    return {
        "total_projects": db.query(models.Project).count(),
        "total_workers": db.query(models.Worker).count(),
        "total_inventory": db.query(models.Inventory).count(),
        "completed_projects": db.query(models.Project)
            .filter(models.Project.status == "Completed")
            .count(),
        "notifications": db.query(models.Notification).count()
    }


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
    for key, val in vendor.dict(exclude_unset=True).items():
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

def create_material_request(db: Session, request: schemas.MaterialRequestCreate, user_id: Optional[int] = None):
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

def get_material_requests(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.MaterialRequest).order_by(models.MaterialRequest.id.desc()).offset(skip).limit(limit).all()

def get_material_request(db: Session, request_id: int):
    return db.query(models.MaterialRequest).filter(models.MaterialRequest.id == request_id).first()

def approve_material_request(db: Session, request_id: int, comments: Optional[str] = None):
    db_request = get_material_request(db, request_id)
    if not db_request:
        return None
    db_request.status = "Approved"
    if comments:
        db_request.comments = comments
    db.commit()
    db.refresh(db_request)
    return db_request

def reject_material_request(db: Session, request_id: int, comments: Optional[str] = None):
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
# PURCHASE ORDER CRUD
# ======================================================

def create_purchase_order(db: Session, po: schemas.PurchaseOrderCreate):
    import time
    po_no = po.po_number or f"PO-{int(time.time())}"
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
    return db_po

def get_purchase_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.PurchaseOrder).order_by(models.PurchaseOrder.id.desc()).offset(skip).limit(limit).all()

def get_purchase_order(db: Session, po_id: int):
    return db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()

def update_purchase_order(db: Session, po_id: int, po_update: schemas.PurchaseOrderUpdate):
    db_po = get_purchase_order(db, po_id)
    if not db_po:
        return None
    for key, val in po_update.dict(exclude_unset=True).items():
        setattr(db_po, key, val)
    if po_update.quantity is not None or po_update.unit_price is not None:
        db_po.total_amount = db_po.quantity * db_po.unit_price
    db.commit()
    db.refresh(db_po)
    return db_po

def receive_material_delivery(db: Session, po_id: int, received_quantity: Optional[int] = None, status: str = "Received"):
    db_po = get_purchase_order(db, po_id)
    if not db_po:
        return None

    qty_received = received_quantity if received_quantity is not None else db_po.quantity
    db_po.status = status

    # Automatically increase inventory stock for the project!
    existing_inventory = db.query(models.Inventory).filter(
        models.Inventory.project_id == db_po.project_id,
        models.Inventory.material_name.ilike(db_po.material_name)
    ).first()

    if existing_inventory:
        existing_inventory.quantity += qty_received
    else:
        new_inv = models.Inventory(
            project_id=db_po.project_id,
            material_name=db_po.material_name,
            quantity=qty_received,
            unit="Bags",
            minimum_stock=10,
            supplier=db_po.vendor.vendor_name if db_po.vendor else "Vendor"
        )
        db.add(new_inv)

    db.commit()
    db.refresh(db_po)
    return db_po


# ======================================================
# INVOICE CRUD
# ======================================================

def create_invoice(db: Session, invoice: schemas.InvoiceCreate):
    import time
    inv_no = invoice.invoice_no or f"INV-{int(time.time())}"

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
    return db_inv

def get_invoices(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Invoice).order_by(models.Invoice.id.desc()).offset(skip).limit(limit).all()

def get_invoice(db: Session, invoice_id: int):
    return db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()

def update_invoice_payment(db: Session, invoice_id: int, payment_status: str):
    db_inv = get_invoice(db, invoice_id)
    if not db_inv:
        return None
    db_inv.payment_status = payment_status
    db.commit()
    db.refresh(db_inv)
    return db_inv


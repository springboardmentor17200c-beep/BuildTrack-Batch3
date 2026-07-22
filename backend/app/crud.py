from sqlalchemy.orm import Session
from app import models, schemas
from app.auth import hash_password


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


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_all_users(db: Session):
    return db.query(models.User).all()


def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def get_all_projects(db: Session):
    return db.query(models.Project).all()


def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()


def create_milestone(db: Session, milestone: schemas.MilestoneCreate):
    db_milestone = models.ProjectMilestone(**milestone.model_dump())
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone


def create_resource(db: Session, resource: schemas.ResourceCreate):
    db_resource = models.Resource(**resource.model_dump())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource


def get_resources(db: Session):
    return db.query(models.Resource).all()


def create_inventory(db: Session, inventory: schemas.InventoryCreate):
    db_inventory = models.Inventory(**inventory.model_dump())
    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)
    return db_inventory


def get_inventory(db: Session):
    return db.query(models.Inventory).all()


def create_worker(db: Session, worker: schemas.WorkerCreate):
    db_worker = models.Worker(**worker.model_dump())
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker


def get_workers(db: Session):
    return db.query(models.Worker).all()


def create_attendance(db: Session, attendance: schemas.AttendanceCreate):
    db_attendance = models.Attendance(**attendance.model_dump())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance


def get_attendance(db: Session):
    return db.query(models.Attendance).all()


def create_procurement(db: Session, procurement: schemas.ProcurementCreate):
    db_procurement = models.Procurement(**procurement.model_dump())
    db.add(db_procurement)
    db.commit()
    db.refresh(db_procurement)
    return db_procurement


def get_procurements(db: Session):
    return db.query(models.Procurement).all()


def create_notification(db: Session, notification: schemas.NotificationCreate):
    db_notification = models.Notification(**notification.model_dump())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


def get_notifications(db: Session):
    return db.query(models.Notification).all()


def create_report(db: Session, report: schemas.ReportCreate):
    db_report = models.Report(**report.model_dump())
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


def get_reports(db: Session):
    return db.query(models.Report).all()



def get_project(db, project_id):
    return db.query(models.Project).filter(models.Project.id == project_id).first()


def update_project(db, project_id, project):
    db_project = get_project(db, project_id)

    if db_project:
        db_project.project_name = project.project_name
        db_project.description = project.description
        db_project.location = project.location
        db_project.budget = project.budget
        db_project.status = project.status

        db.commit()
        db.refresh(db_project)

    return db_project


def delete_project(db, project_id):
    project = get_project(db, project_id)

    if project:
        db.delete(project)
        db.commit()

    return project


#attendance --
def get_attendance(db, worker_id):

    return db.query(models.Attendance)\
             .filter(models.Attendance.worker_id == worker_id)\
             .all()


def mark_attendance(db, attendance):

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return attendance


#worker management
def get_workers(db):
    return db.query(models.Worker).all()


def update_worker(db, worker_id, salary):

    worker = db.query(models.Worker)\
               .filter(models.Worker.id == worker_id)\
               .first()

    if worker:
        worker.salary = salary
        db.commit()

    return worker


#inventory management

def get_inventory(db):
    return db.query(models.Inventory).all()


def update_inventory(db, inventory_id, quantity):

    item = db.query(models.Inventory)\
             .filter(models.Inventory.id == inventory_id)\
             .first()

    if item:
        item.quantity = quantity
        db.commit()

    return item


#resources management
def get_resources(db):
    return db.query(models.Resource).all()


def update_resource_status(db, resource_id, status):

    resource = db.query(models.Resource)\
                 .filter(models.Resource.id == resource_id)\
                 .first()

    if resource:
        resource.status = status
        db.commit()

    return resource


#milestone tracking
def get_project_milestones(db, project_id):
    return db.query(models.ProjectMilestone)\
             .filter(models.ProjectMilestone.project_id == project_id)\
             .all()


def update_milestone(db, milestone_id, status):

    milestone = db.query(models.ProjectMilestone)\
                  .filter(models.ProjectMilestone.id == milestone_id)\
                  .first()

    if milestone:
        milestone.status = status
        db.commit()
        db.refresh(milestone)

    return milestone



from sqlalchemy.orm import Session
from app import models, schemas

# ======================================================
# USERS CRUD
# ======================================================

def create_user(db: Session, user: schemas.UserRegister):
    db_user = models.User(
        name=user.name,
        email=user.email,
        password=user.password,   # Later replace with hashed password
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
    db_user.password = user.password
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


# ======================================================
# PROJECT CRUD
# ======================================================

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


def get_projects(db: Session):

    return db.query(models.Project).all()


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


def get_milestones(db: Session):

    return db.query(models.ProjectMilestone).all()


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


def get_resources(db: Session):

    return db.query(models.Resource).all()


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
        quantity=inventory.quantity,
        unit=inventory.unit,
        minimum_stock=inventory.minimum_stock,
        supplier=inventory.supplier
    )

    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)

    return db_inventory


def get_inventory(db: Session):

    return db.query(models.Inventory).all()


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


def get_workers(db: Session):

    return db.query(models.Worker).all()


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


def get_attendance(db: Session):

    return db.query(models.Attendance).all()


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
        supplier=procurement.supplier,
        quantity=procurement.quantity,
        total_cost=procurement.total_cost,
        purchase_date=procurement.purchase_date,
        status=procurement.status
    )

    db.add(db_procurement)
    db.commit()
    db.refresh(db_procurement)

    return db_procurement


def get_procurements(db: Session):

    return db.query(models.Procurement).all()


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

# ======================================================
# NOTIFICATIONS CRUD
# ======================================================

def create_notification(db: Session, notification: schemas.NotificationCreate):

    db_notification = models.Notification(
        user_id=notification.user_id,
        title=notification.title,
        message=notification.message
    )

    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)

    return db_notification


def get_notifications(db: Session):

    return db.query(models.Notification).all()


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


def get_reports(db: Session):

    return db.query(models.Report).all()


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



    from app import models

# ---------------- PROJECTS ----------------

def create_project(db, project):
    db_project = models.Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def get_projects(db):
    return db.query(models.Project).all()


def get_project(db, project_id: int):
    return db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()


def update_project(db, project_id: int, project):
    db_project = get_project(db, project_id)

    if db_project:
        for key, value in project.dict().items():
            setattr(db_project, key, value)

        db.commit()
        db.refresh(db_project)

    return db_project


def delete_project(db, project_id: int):
    db_project = get_project(db, project_id)

    if db_project:
        db.delete(db_project)
        db.commit()

    return db_project


# ---------------- MILESTONES ----------------

def create_milestone(db, milestone):
    obj = models.ProjectMilestone(**milestone.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_milestones(db):
    return db.query(models.ProjectMilestone).all()


# ---------------- RESOURCES ----------------

def create_resource(db, resource):
    obj = models.Resource(**resource.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_resources(db):
    return db.query(models.Resource).all()

# ---------------- INVENTORY ----------------

def create_inventory(db, item):
    obj = models.Inventory(**item.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_inventory(db):
    return db.query(models.Inventory).all()


# ---------------- WORKERS ----------------

def create_worker(db, worker):
    obj = models.Worker(**worker.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_workers(db):
    return db.query(models.Worker).all()


# ---------------- ATTENDANCE ----------------

def create_attendance(db, attendance):
    obj = models.Attendance(**attendance.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_attendance(db):
    return db.query(models.Attendance).all()


# ---------------- PROCUREMENT ----------------

def create_procurement(db, procurement):
    obj = models.Procurement(**procurement.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_procurements(db):
    return db.query(models.Procurement).all()


# ---------------- NOTIFICATIONS ----------------

def create_notification(db, notification):
    obj = models.Notification(**notification.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_notifications(db):
    return db.query(models.Notification).all()


# ---------------- REPORTS ----------------

def create_report(db, report):
    obj = models.Report(**report.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_reports(db):
    return db.query(models.Report).all()
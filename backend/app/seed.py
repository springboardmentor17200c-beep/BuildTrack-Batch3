from app.database import SessionLocal
from app.models import *

db = SessionLocal()

admin = User(
    name="Admin",
    email="admin@buildtrack.com",
    password="admin123",
    role="Admin"
)

manager = User(
    name="Manager",
    email="manager@buildtrack.com",
    password="manager123",
    role="Project Manager"
)

project = Project(
    project_name="Metro Construction",
    location="Bhubaneswar",
    budget=50000000,
    status="Running",
    manager_id=2
)

db.add(admin)
db.add(manager)
db.add(project)

db.commit()

print("Dummy Data Added")
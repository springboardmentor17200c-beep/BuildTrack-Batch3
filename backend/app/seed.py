from app.database import SessionLocal
from app.models import User, Project

db = SessionLocal()

try:
    # Create Admin
    admin = User(
        name="Admin",
        email="admin@buildtrack.com",
        password="admin123",
        role="Admin"
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    # Create Manager
    manager = User(
        name="Manager",
        email="manager@buildtrack.com",
        password="manager123",
        role="Project Manager"
    )

    db.add(manager)
    db.commit()
    db.refresh(manager)

    # Create Project
    project = Project(
        project_name="Metro Construction",
        description="Construction of Metro Rail",
        location="Bhubaneswar",
        budget=50000000,
        status="Running",
        manager_id=manager.id
    )

    db.add(project)
    db.commit()

    print("Dummy Data Added Successfully!")

except Exception as e:
    db.rollback()
    print("Error:", e)

finally:
    db.close()
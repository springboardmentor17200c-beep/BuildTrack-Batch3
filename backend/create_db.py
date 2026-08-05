from app.database import engine, Base
from app import models


print("Creating Database...")

Base.metadata.create_all(bind=engine)

print("Database Created Successfully.")





from fastapi import APIRouter
from app.schemas import UserRegister, UserLogin

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# Temporary in-memory storage
users = []

@router.post("/register")
def register(user: UserRegister):
    users.append(user)
    return {
        "message": "User registered successfully",
        "user": user
    }

@router.post("/login")
def login(user: UserLogin):

    for u in users:
        if u.email == user.email and u.password == user.password:
            return {"message": "Login Successful"}

    return {"message": "Invalid Email or Password"}

@router.get("/")
def get_users():
    return users
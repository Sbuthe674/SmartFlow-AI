from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import jwt

from database import get_db
from models import User, UserRegister, UserLogin, AdminRegister, UserResponse, AuthResponse
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])

# Password hashing with Argon2 (supports unlimited password length)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash password with Argon2"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password with Argon2"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/register", response_model=AuthResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user
    """
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        company_name=user_data.company_name,
        is_admin=False,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create token
    access_token = create_access_token(data={"sub": new_user.id})
    
    return AuthResponse(
        success=True,
        message="User registered successfully",
        data={
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(new_user)
        }
    )

@router.post("/login", response_model=AuthResponse)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login user and return JWT token
    """
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    
    return AuthResponse(
        success=True,
        message="Login successful",
        data={
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user)
        }
    )

@router.post("/admin/register", response_model=AuthResponse)
async def admin_register(admin_data: AdminRegister, db: Session = Depends(get_db)):
    """
    Register a new admin user
    """
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == admin_data.email) | (User.username == admin_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )
    
    # Create new admin user
    hashed_password = hash_password(admin_data.password)
    new_admin = User(
        username=admin_data.username,
        email=admin_data.email,
        hashed_password=hashed_password,
        company_name=admin_data.company_name,
        contact_person=admin_data.contact_person,
        phone=admin_data.phone,
        user_type=admin_data.user_type,
        is_admin=True,
        is_active=True
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    # Create token
    access_token = create_access_token(data={"sub": new_admin.id})
    
    return AuthResponse(
        success=True,
        message="Admin registered successfully",
        data={
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(new_admin)
        }
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
    db: Session = Depends(get_db)
):
    """
    Get current user profile (requires authentication)
    """
    user_id = verify_token(credentials.credentials)
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse.model_validate(user)

@router.post("/logout", response_model=AuthResponse)
async def logout():
    """
    Logout user (frontend should delete the token)
    """
    return AuthResponse(
        success=True,
        message="Logout successful"
    )

@router.get("/user/{user_id}/requests")
async def get_user_requests(
    user_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
    db: Session = Depends(get_db)
):
    """
    Get all requests for a client
    """
    verify_token(credentials.credentials)
    # TODO: Implement requests retrieval from database
    return []

@router.get("/company/{user_id}/stats")
async def get_company_stats(
    user_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
    db: Session = Depends(get_db)
):
    """
    Get company statistics (tickets, requests, etc)
    """
    verify_token(credentials.credentials)
    # TODO: Implement stats calculation from database
    return {
        "total_requests": 0,
        "active_tickets": 0,
        "closed_tickets": 0
    }

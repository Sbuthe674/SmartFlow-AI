from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    company_name = Column(String(255), nullable=True)
    contact_person = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    user_type = Column(String(20), default="client")  # 'client' или 'company'
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Ticket(Base):
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String(500))
    body = Column(Text)
    language = Column(String(10))
    category = Column(String(100))
    priority = Column(String(50))
    department = Column(String(100))
    status = Column(String(50), default="new")
    summary = Column(Text)
    suggested_reply = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic models for API
class IngestRequest(BaseModel):
    text: str
    subject: Optional[str] = None

class IngestResponse(BaseModel):
    status: str
    ticket_id: Optional[int] = None
    answer: Optional[str] = None
    category: str
    priority: str
    department: str
    summary: str
    suggested_reply: Optional[str] = None
    language: str

class TicketResponse(BaseModel):
    id: int
    subject: str
    body: str
    language: str
    category: str
    priority: str
    department: str
    status: str
    summary: str
    suggested_reply: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UpdateStatusRequest(BaseModel):
    status: str

# User Pydantic models
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserRegister(UserBase):
    password: str
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    user_type: str = "client"  # 'client' или 'company'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AdminRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    user_type: str = "company"

class UserResponse(UserBase):
    id: int
    company_name: Optional[str]
    contact_person: Optional[str]
    phone: Optional[str]
    user_type: str
    is_admin: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class AuthResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

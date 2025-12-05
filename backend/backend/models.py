from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

Base = declarative_base()

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
    subject: Optional[str] = "No Subject"

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

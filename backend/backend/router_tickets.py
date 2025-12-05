from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Ticket, TicketResponse, UpdateStatusRequest
from datetime import datetime

router = APIRouter()

@router.get("/tickets", response_model=List[TicketResponse])
async def get_tickets(
    status: str | None = None,
    db: Session = Depends(get_db)
):
    """Get all tickets, optionally filtered by status"""
    query = db.query(Ticket)
    
    if status:
        query = query.filter(Ticket.status == status)
    
    tickets = query.order_by(Ticket.created_at.desc()).all()
    return tickets

@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Get specific ticket by ID"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return ticket

@router.patch("/tickets/{ticket_id}/status")
async def update_ticket_status(
    ticket_id: int,
    request: UpdateStatusRequest,
    db: Session = Depends(get_db)
):
    """Update ticket status"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket.status = request.status  # type: ignore
    ticket.updated_at = datetime.utcnow()  # type: ignore
    
    db.commit()
    db.refresh(ticket)
    
    return {"message": "Status updated", "ticket_id": ticket_id, "status": request.status}

@router.delete("/tickets/{ticket_id}")
async def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Delete ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    db.delete(ticket)
    db.commit()
    
    return {"message": "Ticket deleted", "ticket_id": ticket_id}

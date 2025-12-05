from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict

from database import init_db, get_db
from models import IngestRequest, IngestResponse, Ticket
from router_tickets import router as tickets_router
import ai_core
from faq_store import semantic_search_faq

app = FastAPI(title="AI HelpDesk OneWindow", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Include tickets router
app.include_router(tickets_router, prefix="/api", tags=["tickets"])

@app.get("/")
async def root():
    return {"message": "AI HelpDesk OneWindow API", "version": "1.0.0"}

@app.post("/api/ingest", response_model=IngestResponse)
async def ingest_request(request: IngestRequest, db: Session = Depends(get_db)):
    """
    Main endpoint for processing user requests
    
    Flow:
    1. Detect language
    2. Classify category and priority
    3. Search FAQ
    4. Auto-resolve or create ticket
    """
    text = request.text
    subject = request.subject
    
    # Step 1: Detect language
    language = ai_core.detect_language(text)
    
    # Step 2: Translate to Russian if needed for processing
    text_ru = text
    if language == "kz":
        text_ru = ai_core.translate_to_ru(text)
    
    # Step 3: Classify
    category = ai_core.classify_category(text_ru)
    priority = ai_core.classify_priority(text_ru)
    department = ai_core.route_department(category)
    
    # Step 4: Search FAQ
    faq_result = semantic_search_faq(text_ru, language)
    similarity = faq_result["similarity"]
    best_answer = faq_result["best_answer"]
    
    # Step 5: Generate summary and suggested reply
    summary = await ai_core.generate_summary(text_ru)
    
    # Step 6: Decide auto-resolve or create ticket
    can_auto = ai_core.can_auto_resolve(similarity)
    
    if can_auto and best_answer:
        # Auto-resolve
        answer = best_answer
        
        # Translate answer back to user's language
        if language == "kz":
            answer = await ai_core.translate_answer(answer, "kz")
        
        # Create ticket with closed_auto status
        ticket = Ticket(
            subject=subject,
            body=text,
            language=language,
            category=category,
            priority=priority,
            department=department,
            status="closed_auto",
            summary=summary,
            suggested_reply=answer
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
        
        return IngestResponse(
            status="closed_auto",
            ticket_id=ticket.id,
            answer=answer,
            category=category,
            priority=priority,
            department=department,
            summary=summary,
            language=language
        )
    
    else:
        # Create ticket for manual processing
        suggested_reply = await ai_core.generate_suggested_reply(text_ru, category, best_answer)
        
        # Translate suggested reply to user's language
        if language == "kz":
            suggested_reply = await ai_core.translate_answer(suggested_reply, "kz")
        
        ticket = Ticket(
            subject=subject,
            body=text,
            language=language,
            category=category,
            priority=priority,
            department=department,
            status="new",
            summary=summary,
            suggested_reply=suggested_reply
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
        
        return IngestResponse(
            status="new",
            ticket_id=ticket.id,
            answer=None,
            category=category,
            priority=priority,
            department=department,
            summary=summary,
            suggested_reply=suggested_reply,
            language=language
        )

@app.get("/api/metrics")
async def get_metrics(db: Session = Depends(get_db)) -> Dict:
    """
    Get helpdesk metrics
    
    Returns:
    - Total tickets
    - Auto-resolved tickets
    - Manual tickets
    - Breakdown by category
    """
    total = db.query(func.count(Ticket.id)).scalar()
    auto_resolved = db.query(func.count(Ticket.id)).filter(Ticket.status == "closed_auto").scalar()
    manual = total - auto_resolved
    
    # Count by category
    categories = db.query(
        Ticket.category,
        func.count(Ticket.id)
    ).group_by(Ticket.category).all()
    
    by_category = {cat: count for cat, count in categories}
    
    # Count by status
    statuses = db.query(
        Ticket.status,
        func.count(Ticket.id)
    ).group_by(Ticket.status).all()
    
    by_status = {status: count for status, count in statuses}
    
    # Count by priority
    priorities = db.query(
        Ticket.priority,
        func.count(Ticket.id)
    ).group_by(Ticket.priority).all()
    
    by_priority = {priority: count for priority, count in priorities}
    
    return {
        "total": total,
        "auto_resolved": auto_resolved,
        "manual": manual,
        "by_category": by_category,
        "by_status": by_status,
        "by_priority": by_priority
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
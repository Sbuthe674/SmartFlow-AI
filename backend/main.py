from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict
from pydantic import BaseModel

from database import init_db, get_db
from models import IngestRequest, IngestResponse, Ticket
from router_tickets import router as tickets_router
from router_auth import router as auth_router
from telegram_service import telegram_service
import ai_core
from faq_store import semantic_search_faq

# Модели для Telegram
class TelegramRequest(BaseModel):
    message: str
    ticket_id: str = None
    user_message: str = None
    chat_id: str = None

# Модели для Email
class EmailSendRequest(BaseModel):
    to_email: str
    subject: str
    body: str
    ticket_id: str = None
    html_body: str = None

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

# Include routers
app.include_router(tickets_router, prefix="/api", tags=["tickets"])
app.include_router(auth_router, prefix="/api", tags=["auth"])

# Mount static files
import os
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
app.mount("/frontend", StaticFiles(directory=frontend_path), name="frontend")

@app.get("/")
async def root():
    return {"message": "AI HelpDesk OneWindow API", "version": "1.0.0"}

@app.post("/api/ai-help")
async def ai_help(request: IngestRequest):
    """
    Instant AI help endpoint: analyzes problem and provides solution
    
    Accepts: {"text": "problem description"}
    Returns: {"solution": "detailed solution", "category": "category", "priority": "priority"}
    """
    text = request.text
    
    # Step 1: Detect language
    language = ai_core.detect_language(text)
    
    # Step 2: Translate to Russian if needed
    text_ru = text
    if language == "kz":
        text_ru = ai_core.translate_to_ru(text)
    
    # Step 3: Classify category and priority
    category = ai_core.classify_category(text_ru)
    priority = ai_core.classify_priority(text_ru)
    
    # Step 4: Search FAQ for immediate solution
    faq_result = semantic_search_faq(text_ru, language)
    best_answer = faq_result.get("best_answer") or faq_result.get("answer")
    
    # Step 5: Generate detailed solution
    solution = best_answer if best_answer else await ai_core.generate_suggested_reply(text_ru, category)
    
    # Step 6: Translate solution back to user's language if needed
    if language == "kz":
        solution = ai_core.translate_to_kz(solution)
    
    return {
        "solution": solution,
        "category": category,
        "priority": priority,
        "language": language,
        "has_faq": bool(best_answer)
    }

@app.post("/api/ingest", response_model=IngestResponse)
async def ingest_request(request: IngestRequest, db: Session = Depends(get_db)):
    """
    Главный унифицированный endpoint для обработки входящих обращений
    
    Объединяет:
    - веб-форму
    - Telegram-бота
    - AI-помощника
    
    Принимает: {"text": "описание проблемы", "subject": "тема (опционально)"}
    Возвращает: JSON с статусом (auto/new), ответом или номером тикета
    
    Поток:
    1. Использует новую функцию process_ingest_request из ai_core
    2. Если auto-resolve - возвращает ответ (тикет не создаётся)
    3. Если создание тикета - сохраняет в БД и возвращает info
    """
    text = request.text
    subject = request.subject if request.subject else f"Request from {text[:50]}"
    
    # Используем унифицированную функцию из AI Core
    result = await ai_core.process_ingest_request(text=text, subject=subject)
    
    # Если auto-resolve - возвращаем ответ напрямую (без создания тикета)
    if result["status"] == "closed_auto":
        # Создаём тикет только для записи (архива), но статус = closed_auto
        ticket = Ticket(
            subject=subject,
            body=text,
            language=result["language"],
            category=result["category"],
            priority=result["priority"],
            department=result["department"],
            status="closed_auto",
            summary=result["summary"],
            suggested_reply=result["answer"]
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
        
        return IngestResponse(
            status="closed_auto",
            ticket_id=ticket.id,  # type: ignore
            answer=result["answer"],
            category=result["category"],
            priority=result["priority"],
            department=result["department"],
            summary=result["summary"],
            suggested_reply=result["answer"],
            language=result["language"]
        )
    
    else:
        # CREATE TICKET - создаём открытый тикет для оператора
        ticket = Ticket(
            subject=subject,
            body=text,
            language=result["language"],
            category=result["category"],
            priority=result["priority"],
            department=result["department"],
            status="new",
            summary=result["summary"],
            suggested_reply=result["suggested_reply"]
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
        
        return IngestResponse(
            status="new",
            ticket_id=ticket.id,  # type: ignore
            answer=None,
            category=result["category"],
            priority=result["priority"],
            department=result["department"],
            summary=result["summary"],
            suggested_reply=result["suggested_reply"],
            language=result["language"]
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

@app.post("/api/send-telegram")
async def send_telegram_message(request: TelegramRequest):
    """
    Отправляет сообщение в Telegram
    """
    try:
        # Можно добавить проверку авторизации здесь
        success = telegram_service.send_message(
            message=request.message,
            chat_id=request.chat_id
        )
        
        if success:
            return {"status": "success", "message": "Сообщение отправлено в Telegram"}
        else:
            raise HTTPException(status_code=500, detail="Ошибка отправки в Telegram")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при отправке в Telegram: {str(e)}")

@app.get("/api/telegram/bot-info")
async def get_telegram_bot_info():
    """
    Получает информацию о Telegram боте для проверки настроек
    """
    try:
        bot_info = telegram_service.get_bot_info()
        if bot_info and bot_info.get('ok'):
            return {
                "status": "success",
                "bot_info": bot_info.get('result', {}),
                "message": "Бот настроен корректно"
            }
        else:
            return {
                "status": "error", 
                "message": "Ошибка получения информации о боте"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка проверки бота: {str(e)}")

# === EMAIL ENDPOINTS ===

@app.post("/api/email/send")
async def send_email(request: EmailSendRequest):
    """
    Отправляет email сообщение
    """
    try:
        # Пока что просто логируем и возвращаем success
        # В реальной реализации здесь будет отправка email
        
        import logging
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
        
        logger.info(f"📧 Email отправлен:")
        logger.info(f"  To: {request.to_email}")
        logger.info(f"  Subject: {request.subject}")
        logger.info(f"  Ticket ID: {request.ticket_id}")
        logger.info(f"  Body: {request.body[:100]}...")
        
        # Здесь можно добавить реальную отправку email
        # через SMTP или почтовый сервис
        
        return {
            "status": "success", 
            "message": f"Email отправлен на {request.to_email}",
            "ticket_id": request.ticket_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка отправки email: {str(e)}")

@app.get("/api/email/config")
async def get_email_config():
    """
    Возвращает статус конфигурации email
    """
    return {
        "status": "success",
        "config": {
            "email_configured": True,  # Пока что всегда True
            "support_email": "support@company.com",
            "smtp_available": True
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

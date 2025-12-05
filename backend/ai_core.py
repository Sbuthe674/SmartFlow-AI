import re
from typing import Optional, Tuple
from config import CATEGORIES, DEPARTMENT_MAPPING, AUTO_RESOLVE_THRESHOLD, OPENAI_API_KEY, API_MODEL
from faq_store import semantic_search_faq

try:
    # prefer explicit name to avoid unbound name warnings
    from openai import OpenAI as OpenAIClient
    OPENAI_AVAILABLE = True
except Exception:
    OpenAIClient = None
    OPENAI_AVAILABLE = False

# Initialize OpenAI client (only if API key is available)
client = None
if OPENAI_AVAILABLE and OPENAI_API_KEY and OpenAIClient is not None:
    try:
        client = OpenAIClient(api_key=OPENAI_API_KEY)
    except Exception:
        client = None

def detect_language(text: str) -> str:
    """Detect if text is in Russian or Kazakh"""
    # Казахские буквы: ә, ғ, қ, ң, ө, ұ, ү, һ, і
    kz_chars = set('әғқңөұүһіӘҒҚҢӨҰҮҺІ')
    
    text_chars = set(text)
    kz_count = len(text_chars.intersection(kz_chars))
    
    if kz_count > 0:
        return "kz"
    
    # Проверка на русский
    ru_chars = set('абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ')
    ru_count = len(text_chars.intersection(ru_chars))
    
    if ru_count > 0:
        return "ru"
    
    return "ru"  # default

def classify_category(text: str) -> str:
    """Classify request category using LLM or keyword fallback"""
    if not client:
        # Fallback to keyword-based classification
        return _classify_category_keywords(text)
    
    try:
        prompt = f"""Classify the following support request into ONE category: {', '.join(CATEGORIES)}.
        
Request text: {text}

Respond with ONLY the category name, nothing else."""
        
        response = client.chat.completions.create(
            model=API_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=20
        )

        category = _extract_response_text(response)
        if category and category in CATEGORIES:
            return category
        return _classify_category_keywords(text)
    except Exception as e:
        print(f"Error in classify_category: {e}")
        return _classify_category_keywords(text)


def _classify_category_keywords(text: str) -> str:
    """Fallback keyword-based classification"""
    text_lower = text.lower()
    
    keywords = {
        "VPN": ["vpn", "впн", "подключ", "қосыл", "сеть", "желі"],
        "Email": ["почт", "email", "outlook", "пошта", "хат", "письмо"],
        "Hardware": ["принтер", "принтір", "компьютер", "мышь", "клавиатур", "монитор", "пернетақта"],
        "Software": ["программ", "прилож", "софт", "бағдарлама", "қосымша", "установ", "орнату"],
        "Access": ["доступ", "рұқсат", "қатынау", "пароль", "құпия", "права", "папк", "қалта"],
        "Network": ["интернет", "сеть", "желі", "wifi", "вай-фай", "подключен", "байланыс"]
    }
    
    category_scores = {}
    for category, words in keywords.items():
        score = sum(1 for word in words if word in text_lower)
        category_scores[category] = score
    
    if not any(category_scores.values()):
        return "Other"
    
    return max(category_scores, key=lambda k: category_scores[k])

def classify_priority(text: str) -> str:
    """Classify request priority using LLM or keyword fallback"""
    if not client:
        return _classify_priority_keywords(text)
    
    try:
        prompt = f"""Classify the priority level of this support request as: critical, high, medium, or low.

Request: {text}

Respond with ONLY the priority level, nothing else."""
        
        response = client.chat.completions.create(
            model=API_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=20
        )

        priority = _extract_response_text(response).lower()
        valid_priorities = ["critical", "high", "medium", "low"]
        return priority if priority in valid_priorities else _classify_priority_keywords(text)
    except Exception as e:
        print(f"Error in classify_priority: {e}")
        return _classify_priority_keywords(text)


def _classify_priority_keywords(text: str) -> str:
    """Fallback keyword-based priority classification"""
    text_lower = text.lower()
    
    critical_words = ["срочно", "критично", "не работает", "сломал", "авария", "шұғыл", "жұмыс істемейді", "апат"]
    if any(word in text_lower for word in critical_words):
        return "critical"
    
    high_words = ["важно", "проблема", "ошибка", "маңызды", "мәселе", "қате", "помогите", "көмектесіңіз"]
    if any(word in text_lower for word in high_words):
        return "high"
    
    low_words = ["вопрос", "как", "можно", "сұрақ", "қалай", "болады ма"]
    if any(word in text_lower for word in low_words):
        return "low"
    
    return "medium"

def route_department(category: str) -> str:
    """Route ticket to appropriate department"""
    return DEPARTMENT_MAPPING.get(category, "General Support")

def can_auto_resolve(similarity_score: float) -> bool:
    """Decide if ticket can be auto-resolved based on FAQ similarity"""
    return similarity_score >= AUTO_RESOLVE_THRESHOLD

async def generate_summary(text: str) -> str:
    """Generate summary using LLM or simple truncation"""
    if not client:
        words = text.split()
        if len(words) <= 15:
            return text
        return ' '.join(words[:15]) + "..."
    
    try:
        prompt = f"""Summarize this support request in 1-2 sentences:

{text}

Respond with ONLY the summary, nothing else."""
        
        response = client.chat.completions.create(
            model=API_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=100
        )

        summary = _extract_response_text(response)
        if summary:
            return summary
        # fallback to truncation
        words = text.split()
        if len(words) <= 15:
            return text
        return ' '.join(words[:15]) + "..."
    except Exception as e:
        print(f"Error in generate_summary: {e}")
        words = text.split()
        if len(words) <= 15:
            return text
        return ' '.join(words[:15]) + "..."

async def generate_suggested_reply(text: str, category: str, faq_answer: Optional[str] = None) -> str:
    """Generate suggested reply using LLM or FAQ/templates"""
    if faq_answer:
        return faq_answer
    
    if not client:
        return _get_template_reply(category)
    
    try:
        prompt = f"""You are a support agent. Generate a helpful, professional response to this support request:

Category: {category}
Request: {text}

Respond in Russian and be concise. ONLY respond with the reply text."""
        
        response = client.chat.completions.create(
            model=API_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=200
        )

        reply = _extract_response_text(response)
        if reply:
            return reply
        return _get_template_reply(category)
    except Exception as e:
        print(f"Error in generate_suggested_reply: {e}")
        return _get_template_reply(category)


def _get_template_reply(category: str) -> str:
    """Get template response for category"""
    templates = {
        "VPN": "Здравствуйте! Для решения вашего вопроса с VPN, пожалуйста, проверьте подключение и перезапустите VPN-клиент. Если проблема сохраняется, сообщите нам.",
        "Email": "Добрый день! Мы получили ваш запрос. Проверьте, пожалуйста, настройки Outlook и попробуйте перезапустить приложение.",
        "Hardware": "Здравствуйте! Ваш запрос принят. Специалист техподдержки свяжется с вами для решения проблемы с оборудованием.",
        "Software": "Добрый день! Пожалуйста, уточните версию ОС и название программы. Мы поможем вам в ближайшее время.",
        "Access": "Здравствуйте! Ваш запрос на доступ принят. После согласования мы настроим необходимые права.",
        "Network": "Добрый день! Проверьте подключение к сети и перезагрузите роутер. Если проблема не решена, мы направим специалиста.",
        "Other": "Здравствуйте! Ваше обращение принято. Мы рассмотрим его и свяжемся с вами в ближайшее время."
    }
    
    return templates.get(category, templates["Other"])

def translate_to_ru(text: str) -> str:
    """Translate Kazakh to Russian using LLM"""
    if not client:
        return text
    
    try:
        prompt = f"""Translate this Kazakh text to Russian:

{text}

Respond with ONLY the translated text, nothing else."""
        
        response = client.chat.completions.create(
            model=API_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=len(text) + 50
        )

        translated = _extract_response_text(response)
        return translated or text
    except Exception as e:
        print(f"Error in translate_to_ru: {e}")
        return text


def translate_to_kz(text: str) -> str:
    """Translate Russian to Kazakh using LLM"""
    if not client:
        return text
    
    try:
        prompt = f"""Translate this Russian text to Kazakh:

{text}

Respond with ONLY the translated text, nothing else."""
        
        response = client.chat.completions.create(
            model=API_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=len(text) + 50
        )

        translated = _extract_response_text(response)
        return translated or text
    except Exception as e:
        print(f"Error in translate_to_kz: {e}")
        return text


def _extract_response_text(response) -> str:
    """Safely extract text content from various response shapes returned by OpenAI client.

    Returns empty string if no content found.
    """
    try:
        # Common object-based response (openai client models)
        if hasattr(response, 'choices') and response.choices:
            choice = response.choices[0]
            # message may be attribute or dict
            message = getattr(choice, 'message', None)
            if message is None and isinstance(choice, dict):
                message = choice.get('message')
            if message:
                content = message.get('content') if isinstance(message, dict) else getattr(message, 'content', None)
                if content:
                    return content.strip()
            # fallback to text
            text_attr = getattr(choice, 'text', None)
            if text_attr:
                return str(text_attr).strip()
            if isinstance(choice, dict):
                text_field = choice.get('text')
                if text_field:
                    return str(text_field).strip()

        # dict-like response
        if isinstance(response, dict):
            choices = response.get('choices')
            if choices:
                c = choices[0]
                if isinstance(c, dict):
                    msg = c.get('message') or c.get('text')
                    if isinstance(msg, dict):
                        content = msg.get('content')
                        if content:
                            return str(content).strip()
                    if isinstance(msg, str):
                        return msg.strip()

        return ""
    except Exception:
        return ""

async def translate_answer(answer: str, target_language: str) -> str:
    """Translate answer to target language"""
    if target_language == "kz":
        return translate_to_kz(answer)
    return answer


async def semantic_search_with_faq(text: str, language: str) -> Tuple[Optional[str], float]:
    """Search FAQ for similar questions"""
    faq_answer, similarity_score = semantic_search_faq(text, language)
    return faq_answer, similarity_score


async def process_ingest_request(text: str, subject: Optional[str] = None, language: Optional[str] = None) -> dict:
    """
    Главная функция обработки входящего обращения
    Объединяет весь поток: язык → классификация → приоритет → FAQ → решение/тикет
    
    Возвращает словарь с результатом для фронтенда/Telegram
    """
    
    # Step 1: Определение языка
    detected_language = detect_language(text)
    if language is None:
        language = detected_language
    
    # Step 2: Перевод на русский для обработки (если казахский)
    text_ru = text
    if language == "kz":
        text_ru = translate_to_ru(text)
    
    # Step 3: Классификация категории и приоритета
    category = classify_category(text_ru)
    priority = classify_priority(text_ru)
    department = route_department(category)
    
    # Step 4: Поиск в FAQ
    faq_result = semantic_search_faq(text_ru, language)
    similarity = faq_result.get("similarity", 0.0) if isinstance(faq_result, dict) else 0.0
    best_answer = faq_result.get("best_answer") if isinstance(faq_result, dict) else faq_result[0] if faq_result else None
    
    # Step 5: Генерация резюме
    summary = await generate_summary(text_ru)
    
    # Step 6: Определение auto-resolve
    can_auto = can_auto_resolve(similarity)
    
    # Step 7: Подготовка результата
    if can_auto and best_answer:
        # AUTO-RESOLVE: отправляем FAQ ответ
        answer = best_answer
        
        # Переводим ответ обратно на язык пользователя если нужно
        if language == "kz":
            answer = translate_to_kz(answer)
        
        return {
            "status": "closed_auto",
            "answer": answer,
            "category": category,
            "priority": priority,
            "department": department,
            "summary": summary,
            "language": language,
            "has_faq": True,
            "similarity_score": similarity
        }
    
    else:
        # CREATE TICKET: создаём тикет для оператора
        suggested_reply = await generate_suggested_reply(text_ru, category, best_answer)
        
        # Переводим предложенный ответ обратно если нужно
        if language == "kz":
            suggested_reply = translate_to_kz(suggested_reply)
        
        return {
            "status": "new",
            "category": category,
            "priority": priority,
            "department": department,
            "summary": summary,
            "suggested_reply": suggested_reply,
            "language": language,
            "has_faq": bool(best_answer),
            "similarity_score": similarity
        }
import re
from config import CATEGORIES, DEPARTMENT_MAPPING, AUTO_RESOLVE_THRESHOLD

# Заглушка для LLM API
async def llm(prompt: str) -> str:
    """
    Placeholder for LLM API call (OpenAI, Anthropic, etc.)
    Replace this with actual API call in production
    """
    # Example: 
    # response = await openai.ChatCompletion.create(
    #     model="gpt-4",
    #     messages=[{"role": "user", "content": prompt}]
    # )
    # return response.choices[0].message.content
    
    # For MVP - simple rule-based responses
    return "AI response placeholder"

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
    """Classify request category based on keywords"""
    text_lower = text.lower()
    
    # Keywords for each category
    keywords = {
        "VPN": ["vpn", "впн", "подключ", "қосыл", "сеть", "желі"],
        "Email": ["почт", "email", "outlook", "пошта", "хат", "письмо"],
        "Hardware": ["принтер", "принтір", "компьютер", "компьютер", "мышь", "клавиатур", "монитор", "пернетақта"],
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
    
    return max(category_scores, key=category_scores.get)

def classify_priority(text: str) -> str:
    """Classify request priority"""
    text_lower = text.lower()
    
    # Critical indicators
    critical_words = ["срочно", "критично", "не работает", "сломал", "авария", "шұғыл", "жұмыс істемейді", "апат"]
    if any(word in text_lower for word in critical_words):
        return "critical"
    
    # High priority
    high_words = ["важно", "проблема", "ошибка", "маңызды", "мәселе", "қате", "помогите", "көмектесіңіз"]
    if any(word in text_lower for word in high_words):
        return "high"
    
    # Low priority
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
    """Generate summary of the request"""
    # In production, use LLM
    # For MVP - simple truncation
    words = text.split()
    if len(words) <= 15:
        return text
    
    summary = ' '.join(words[:15]) + "..."
    return summary

async def generate_suggested_reply(text: str, category: str, faq_answer: str = None) -> str:
    """Generate suggested reply for operator"""
    if faq_answer:
        return faq_answer
    
    # Template-based responses for MVP
    templates = {
        "VPN": "Здравствуйте! Для решения вашего вопроса с VPN, пожалуйста, попробуйте следующее: проверьте подключение к интернету, перезапустите VPN-клиент. Если проблема сохраняется, сообщите нам.",
        "Email": "Добрый день! Мы получили ваш запрос по электронной почте. Проверьте, пожалуйста, настройки Outlook и попробуйте перезапустить приложение.",
        "Hardware": "Здравствуйте! Ваш запрос принят. Специалист технической поддержки свяжется с вами в ближайшее время для решения проблемы с оборудованием.",
        "Software": "Добрый день! Для установки или настройки программного обеспечения, пожалуйста, уточните версию ОС и название программы. Мы поможем вам в ближайшее время.",
        "Access": "Здравствуйте! Ваш запрос на предоставление доступа принят. После согласования с руководителем мы настроим необходимые права.",
        "Network": "Добрый день! Проверьте подключение к сети, перезагрузите роутер. Если проблема не решена, мы направим специалиста.",
        "Other": "Здравствуйте! Ваше обращение принято. Мы рассмотрим его и свяжемся с вами в ближайшее время."
    }
    
    return templates.get(category, templates["Other"])

def translate_to_ru(text: str) -> str:
    """
    Translate Kazakh to Russian
    Placeholder - in production use translation API
    """
    # For MVP - return as is, assuming operator understands both languages
    return text

def translate_to_kz(text: str) -> str:
    """
    Translate Russian to Kazakh
    Placeholder - in production use translation API
    """
    # Simple keyword replacement for demo
    translations = {
        "Здравствуйте": "Сәлеметсіз бе",
        "Добрый день": "Қайырлы күн",
        "Ваш запрос принят": "Сіздің сұранысыңыз қабылданды",
        "Спасибо": "Рақмет",
        "До свидания": "Сау болыңыз"
    }
    
    result = text
    for ru, kz in translations.items():
        result = result.replace(ru, kz)
    
    return result

async def translate_answer(answer: str, target_language: str) -> str:
    """Translate answer to target language"""
    if target_language == "kz":
        return translate_to_kz(answer)
    return answer

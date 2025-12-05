import re
from typing import Dict, List
import math

FAQ = [
    {
        "q": "Как подключиться к VPN?",
        "a": "Чтобы подключиться к VPN, выполните следующие шаги:\n1. Откройте приложение VPN Client\n2. Введите ваши учетные данные\n3. Выберите сервер и нажмите 'Подключить'\n4. Дождитесь успешного подключения"
    },
    {
        "q": "Как сменить пароль?",
        "a": "Для смены пароля перейдите на портал самообслуживания:\n1. Зайдите на portal.company.com\n2. Войдите с текущим паролем\n3. Перейдите в раздел 'Безопасность'\n4. Нажмите 'Изменить пароль'\n5. Следуйте инструкциям на экране"
    },
    {
        "q": "Не работает почта Outlook",
        "a": "Попробуйте следующие решения:\n1. Перезапустите Outlook\n2. Проверьте интернет-соединение\n3. Убедитесь, что пароль не истек\n4. Проверьте настройки прокси-сервера\n5. Если проблема сохраняется - обратитесь в техподдержку"
    },
    {
        "q": "Забыл пароль от компьютера",
        "a": "Для сброса пароля:\n1. Обратитесь к администратору IT\n2. Подтвердите свою личность\n3. Администратор сбросит пароль\n4. Вы получите временный пароль по email или SMS"
    },
    {
        "q": "Проблемы с принтером",
        "a": "Проверьте следующее:\n1. Включен ли принтер\n2. Есть ли бумага и тонер/чернила\n3. Правильно ли подключен кабель\n4. Установлены ли драйверы\n5. Перезапустите очередь печати"
    },
    {
        "q": "Как получить доступ к общей папке?",
        "a": "Для получения доступа:\n1. Отправьте запрос руководителю отдела\n2. Укажите причину и срок доступа\n3. После одобрения IT-отдел настроит доступ\n4. Вы получите уведомление по email"
    }
]

# Казахские переводы FAQ
FAQ_KZ = [
    {
        "q": "VPN-ге қалай қосылуға болады?",
        "a": "VPN-ге қосылу үшін келесі қадамдарды орындаңыз:\n1. VPN Client қосымшасын ашыңыз\n2. Тіркелгі деректеріңізді енгізіңіз\n3. Серверді таңдап, 'Қосылу' түймесін басыңыз\n4. Сәтті қосылуды күтіңіз"
    },
    {
        "q": "Құпия сөзді қалай өзгертуге болады?",
        "a": "Құпия сөзді өзгерту үшін өзіндік қызмет порталына өтіңіз:\n1. portal.company.com сайтына кіріңіз\n2. Ағымдағы құпия сөзбен кіріңіз\n3. 'Қауіпсіздік' бөліміне өтіңіз\n4. 'Құпия сөзді өзгерту' түймесін басыңыз\n5. Экрандағы нұсқауларды орындаңыз"
    },
    {
        "q": "Outlook поштасы жұмыс істемейді",
        "a": "Келесі шешімдерді қолданып көріңіз:\n1. Outlook-ты қайта іске қосыңыз\n2. Интернет байланысын тексеріңіз\n3. Құпия сөз мерзімі өтпегеніне көз жеткізіңіз\n4. Прокси-сервер параметрлерін тексеріңіз\n5. Егер мәселе жалғасса - техникалық қолдау қызметіне хабарласыңыз"
    }
]

def tokenize(text: str) -> List[str]:
    """Simple tokenization"""
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    return text.split()

def cosine_similarity(text1: str, text2: str) -> float:
    """Calculate cosine similarity between two texts"""
    tokens1 = set(tokenize(text1))
    tokens2 = set(tokenize(text2))
    
    if not tokens1 or not tokens2:
        return 0.0
    
    intersection = tokens1.intersection(tokens2)
    
    if not intersection:
        return 0.0
    
    numerator = len(intersection)
    denominator = math.sqrt(len(tokens1)) * math.sqrt(len(tokens2))
    
    return numerator / denominator if denominator > 0 else 0.0

def semantic_search_faq(text: str, language: str = "ru") -> Dict:
    """Search FAQ for best matching answer"""
    faq_base = FAQ_KZ if language == "kz" else FAQ
    
    best_match = None
    best_score = 0.0
    
    for item in faq_base:
        # Compare with question
        score_q = cosine_similarity(text, item["q"])
        # Also compare with answer for better matching
        score_a = cosine_similarity(text, item["a"]) * 0.5
        
        score = max(score_q, score_a)
        
        if score > best_score:
            best_score = score
            best_match = item
    
    return {
        "best_answer": best_match["a"] if best_match else None,
        "best_question": best_match["q"] if best_match else None,
        "similarity": best_score
    }

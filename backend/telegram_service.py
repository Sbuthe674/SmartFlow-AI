import requests
import logging
from typing import Optional

# Настройка логирования
logger = logging.getLogger(__name__)

class TelegramService:
    """Простой сервис для Telegram (заглушка)"""
    
    def __init__(self):
        self.token = "8283540866:AAES_K_VXOOEWh7vOK6JpTD4adnbs6wyMVM"
        self.api_url = f"https://api.telegram.org/bot{self.token}"
    
    def send_message(self, message: str, chat_id: Optional[str] = None) -> bool:
        """Отправляет сообщение в Telegram (заглушка)"""
        try:
            logger.info(f"📱 Telegram сообщение: {message}")
            return True  # Всегда успешно для демо
        except Exception as e:
            logger.error(f"Ошибка Telegram: {e}")
            return False
    
    def get_bot_info(self):
        """Получает информацию о боте"""
        try:
            url = f"{self.api_url}/getMe"
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            logger.error(f"Ошибка получения info бота: {e}")
            return None

# Создаем экземпляр сервиса
telegram_service = TelegramService()
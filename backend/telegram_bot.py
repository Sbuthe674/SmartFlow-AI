"""
Telegram Bot для AI HelpDesk OneWindow
Использует Long Polling для получения обновлений (getUpdates)
Отправляет пользовательские обращения в backend API
"""

import os
import requests
import json
import time
import logging
from dotenv import load_dotenv
from typing import Dict, Optional

# Загружаем переменные окружения из .env файла
load_dotenv()

# Конфигурация
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}"

# Логирование
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Для отслеживания последнего обработанного обновления (Long Polling offset)
update_offset = 0


def validate_config() -> bool:
    """Проверяет, что все необходимые переменные окружения установлены"""
    if not TELEGRAM_TOKEN:
        logger.error("❌ TELEGRAM_TOKEN не установлен! Добавьте его в .env файл.")
        return False
    
    if TELEGRAM_TOKEN == "":
        logger.error("❌ TELEGRAM_TOKEN пустой!")
        return False
    
    logger.info(f"✅ Конфиг загружен. Backend: {BACKEND_URL}")
    return True


def send_message(chat_id: int, text: str) -> bool:
    """
    Отправляет сообщение пользователю через Telegram API
    
    Args:
        chat_id: ID чата (пользователя)
        text: Текст сообщения
    
    Returns:
        True если успешно, False если ошибка
    """
    try:
        url = f"{TELEGRAM_API_URL}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML"  # Позволяет использовать HTML теги для форматирования
        }
        
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            logger.info(f"✅ Сообщение отправлено пользователю {chat_id}")
            return True
        else:
            logger.error(f"❌ Ошибка отправки сообщения: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Ошибка при подключении к Telegram API: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Неожиданная ошибка в send_message: {e}")
        return False


def detect_language(text: str) -> str:
    """
    Простое определение языка текста
    
    Args:
        text: Текст для анализа
    
    Returns:
        "kz" для казахского, "ru" для русского
    """
    kz_chars = "әғқңөұүіһ"
    ru_chars = "ёъыэ"
    
    kz_count = sum(1 for char in text.lower() if char in kz_chars)
    ru_count = sum(1 for char in text.lower() if char in ru_chars)
    
    if kz_count > ru_count:
        return "kz"
    return "ru"


def process_user_message(text: str, chat_id: int) -> bool:
    """
    Отправляет сообщение пользователя в backend API
    Получает ответ и отправляет результат пользователю
    
    Args:
        text: Текст сообщения от пользователя
        chat_id: ID чата (пользователя) в Telegram
    
    Returns:
        True если успешно обработано, False если ошибка
    """
    try:
        # Определяем язык
        language = detect_language(text)
        logger.info(f"📝 Получено сообщение от {chat_id} на языке '{language}': {text[:50]}...")
        
        # Отправляем в backend API
        ingest_url = f"{BACKEND_URL}/api/ingest"
        payload = {
            "text": text
        }
        
        logger.info(f"📤 Отправляю запрос в backend: {ingest_url}")
        response = requests.post(ingest_url, json=payload, timeout=10)
        
        if response.status_code != 200:
            logger.error(f"❌ Backend вернул ошибку: {response.status_code} - {response.text}")
            error_msg = "❌ Ошибка обработки вашего обращения. Пожалуйста, попробуйте позже."
            send_message(chat_id, error_msg)
            return False
        
        # Парсим ответ backend
        data = response.json()
        status = data.get("status")
        
        logger.info(f"📥 Backend ответил со статусом: {status}")
        
        # ==================== ВАРИАНТ 1: AUTO-RESOLVE ====================
        if status == "closed_auto":
            answer = data.get("answer", "Ответ не найден")
            similarity = data.get("similarity_score", 0)
            
            # Форматируем ответ для пользователя
            reply_text = (
                f"🤖 <b>Автоматическое решение:</b>\n\n"
                f"{answer}\n\n"
                f"<i>(Уверенность: {similarity*100:.0f}%)</i>"
            )
            
            send_message(chat_id, reply_text)
            logger.info(f"✅ Auto-resolve отправлен пользователю {chat_id}")
            return True
        
        # ==================== ВАРИАНТ 2: CREATION TICKET ====================
        elif status == "new":
            ticket_id = data.get("ticket_id")
            category = data.get("category", "N/A")
            priority = data.get("priority", "N/A")
            department = data.get("department", "N/A")
            suggested_reply = data.get("suggested_reply", "Ваш запрос обрабатывается...")
            
            # Форматируем информацию о тикете
            reply_text = (
                f"📝 <b>Ваш запрос зарегистрирован!</b>\n\n"
                f"<b>ID тикета:</b> #{ticket_id}\n"
                f"<b>Категория:</b> {category}\n"
                f"<b>Приоритет:</b> {priority}\n"
                f"<b>Отдел:</b> {department}\n\n"
                f"<i>Наш специалист скоро ответит!</i>"
            )
            
            send_message(chat_id, reply_text)
            logger.info(f"✅ Тикет #{ticket_id} создан, пользователь {chat_id} уведомлен")
            return True
        
        else:
            logger.warning(f"⚠️ Неизвестный статус от backend: {status}")
            unknown_msg = "⚠️ Неизвестный статус ответа. Пожалуйста, обратитесь в поддержку."
            send_message(chat_id, unknown_msg)
            return False
        
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Ошибка подключения к backend: {e}")
        error_msg = "❌ Не удалось подключиться к серверу. Пожалуйста, попробуйте позже."
        send_message(chat_id, error_msg)
        return False
    
    except (json.JSONDecodeError, KeyError) as e:
        logger.error(f"❌ Ошибка парсинга ответа backend: {e}")
        error_msg = "❌ Ошибка обработки ответа сервера. Пожалуйста, попробуйте позже."
        send_message(chat_id, error_msg)
        return False
    
    except Exception as e:
        logger.error(f"❌ Неожиданная ошибка в process_user_message: {e}")
        error_msg = "❌ Произошла неожиданная ошибка. Пожалуйста, попробуйте позже."
        send_message(chat_id, error_msg)
        return False


def get_updates(offset: int = 0) -> Dict:
    """
    Получает обновления (сообщения) от пользователей через Long Polling
    
    Args:
        offset: Последний обработанный ID обновления (для Long Polling)
    
    Returns:
        Словарь с обновлениями от Telegram API
    """
    try:
        url = f"{TELEGRAM_API_URL}/getUpdates"
        params = {
            "offset": offset,
            "timeout": 100,  # Long Polling timeout в секундах
            "allowed_updates": ["message"]  # Получаем только message обновления
        }
        
        response = requests.get(url, params=params, timeout=110)  # timeout должен быть больше чем timeout на сервере
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"❌ Ошибка getUpdates: {response.status_code} - {response.text}")
            return {"ok": False, "result": []}
    
    except requests.exceptions.Timeout:
        logger.warning("⏱️ Timeout при Long Polling (ожидаемо)")
        return {"ok": False, "result": []}
    
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Ошибка подключения в getUpdates: {e}")
        return {"ok": False, "result": []}
    
    except Exception as e:
        logger.error(f"❌ Неожиданная ошибка в getUpdates: {e}")
        return {"ok": False, "result": []}


def main():
    """
    Основной цикл бота
    Использует Long Polling для получения обновлений
    """
    global update_offset
    
    if not validate_config():
        return
    
    logger.info("🤖 Telegram bot started...")
    logger.info(f"Backend URL: {BACKEND_URL}")
    logger.info("📡 Подключение к Telegram API через Long Polling...")
    
    # Основной цикл
    while True:
        try:
            # Получаем обновления (блокирующий вызов с timeout=100)
            updates_response = get_updates(offset=update_offset)
            
            if not updates_response.get("ok"):
                logger.warning("⚠️ Ошибка получения обновлений, переподключение...")
                time.sleep(5)
                continue
            
            updates = updates_response.get("result", [])
            
            if updates:
                logger.info(f"📬 Получено {len(updates)} обновлений")
            
            # Обрабатываем каждое обновление
            for update in updates:
                try:
                    update_id = update.get("update_id")
                    message = update.get("message")
                    
                    if not message:
                        continue
                    
                    chat_id = message.get("chat", {}).get("id")
                    text = message.get("text")
                    user_first_name = message.get("from", {}).get("first_name", "User")
                    
                    if not chat_id or not text:
                        logger.warning("⚠️ Пустое сообщение или ID чата")
                        continue
                    
                    logger.info(f"👤 Сообщение от {user_first_name} (ID: {chat_id}): {text[:30]}...")
                    
                    # Приветствие (опционально)
                    if text.lower() in ["/start", "привет", "привет!", "hello", "привет"]:
                        greeting = (
                            f"👋 Привет, <b>{user_first_name}</b>!\n\n"
                            f"Я помощник AI HelpDesk OneWindow.\n"
                            f"Просто напиши мне свою проблему, и я помогу её решить! 🚀"
                        )
                        send_message(chat_id, greeting)
                    else:
                        # Обрабатываем обычное сообщение
                        process_user_message(text, chat_id)
                    
                    # Обновляем offset для следующего запроса
                    try:
                        if update_id is not None:
                            update_offset = update_id + 1
                    except NameError:
                        # update_id не определен — безопасно пропускаем
                        pass

                except Exception as e:
                    logger.error(f"❌ Ошибка при обработке обновления: {e}")
                    # Безопасно обновляем offset, если update_id доступен
                    uid = locals().get('update_id')
                    if uid is not None:
                        try:
                            update_offset = uid + 1
                        except Exception:
                            pass
                    continue
        
        except KeyboardInterrupt:
            logger.info("⏹️ Бот остановлен пользователем (Ctrl+C)")
            break
        
        except Exception as e:
            logger.error(f"❌ Критическая ошибка в основном цикле: {e}")
            logger.info("🔄 Переподключение через 5 секунд...")
            time.sleep(5)
            continue


if __name__ == "__main__":
    main()

"""
Telegram Bot для AI HelpDesk OneWindow

Полностью интегрирован с backend:
- Отправляет обращения на /api/ingest
- Выводит авто-ответ или описание тикета
- Поддерживает RU/KZ
- Не содержит API-ключей (всё на бэкенде)
"""

import os
import asyncio
import aiohttp
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Конфигурация
TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8283540866:AAES_K_VXOOEWh7vOK6JpTD4adnbs6wyMVM")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# Логирование
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class HelpDeskBot:
    """Telegram бот для AI HelpDesk"""

    def __init__(self, token: str, backend_url: str):
        self.token = token
        self.backend_url = backend_url
        self.app = None

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /start"""
        if not update.message:
            return
        start_message = """
🤖 Добро пожаловать в AI HelpDesk OneWindow!

Я помогу вам с любыми вопросами и проблемами. Просто напишите ваш вопрос, и я:
1️⃣ Проанализирую вашу проблему
2️⃣ Определю категорию и приоритет
3️⃣ Предоставлю решение (если есть в базе) или создам тикет для оператора

Поддерживаемые языки: 🇷🇺 Русский и 🇰🇿 Казахский

Напишите ваш вопрос:
"""
        await update.message.reply_text(start_message)

    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /help"""
        if not update.message:
            return
        help_text = """
📖 Справка:

/start - начало работы
/help - эта справка
/status - проверить статус обращения

Просто отправьте текст вашей проблемы, и бот обработает её.
"""
        await update.message.reply_text(help_text)

    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Основной обработчик текстовых сообщений"""
        if not update.message or not update.message.text or not update.message.from_user:
            return
        
        user_text: str = update.message.text
        user_id: int = update.message.from_user.id

        # Показываем typing indicator (печатает...)
        await update.message.chat.send_action("typing")

        try:
            # Отправляем запрос в backend на /api/ingest
            result = await self._call_backend_ingest(user_text)

            if result is None:
                await update.message.reply_text(
                    "❌ Ошибка обработки запроса. Пожалуйста, попробуйте ещё раз."
                )
                return

            # Обработка результата
            status = result.get("status")

            if status == "closed_auto":
                # Автоматическое решение
                answer = result.get("answer", "")
                category = result.get("category", "")
                priority = result.get("priority", "")
                ticket_id = result.get("ticket_id", "")

                response_text = f"""
✅ Автоматическое решение найдено!

📂 Категория: {category}
⚡ Приоритет: {priority}
🆔 Тикет: #{ticket_id}

💡 Решение:
{answer}

Если этот ответ не решил вашу проблему, создам вам тикет для оператора.
"""
                await update.message.reply_text(response_text)

            elif status == "new":
                # Создан новый тикет
                ticket_id = result.get("ticket_id", "?")
                category = result.get("category", "")
                priority = result.get("priority", "")
                department = result.get("department", "")
                suggested_reply = result.get("suggested_reply", "")

                response_text = f"""
📝 Ваш запрос зарегистрирован!

🆔 Номер тикета: #{ticket_id}
📂 Категория: {category}
⚡ Приоритет: {priority}
🏢 Отдел: {department}

💬 Предложенный ответ:
{suggested_reply}

Оператор свяжется с вами в ближайшее время.
Номер вашего тикета: #{ticket_id}
"""
                await update.message.reply_text(response_text)

            else:
                await update.message.reply_text(
                    f"⚠️ Неизвестный статус ответа: {status}"
                )

        except Exception as e:
            logger.error(f"Error handling message from user {user_id}: {e}")
            await update.message.reply_text(
                f"❌ Произошла ошибка: {str(e)}\n\nПожалуйста, попробуйте ещё раз."
            )

    async def _call_backend_ingest(self, text: str) -> dict | None:
        """
        Вызывает backend endpoint /api/ingest
        Возвращает результат обработки (auto-resolve или new ticket)
        """
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.backend_url}/api/ingest"
                payload = {"text": text}

                async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.error(f"Backend error: {response.status}")
                        return None
        except asyncio.TimeoutError:
            logger.error("Backend timeout")
            return None
        except Exception as e:
            logger.error(f"Error calling backend: {e}")
            return None

    async def run(self):
        """Запуск бота"""
        # Проверка токена
        if not self.token or self.token == "YOUR_TELEGRAM_BOT_TOKEN_HERE":
            logger.error("❌ TELEGRAM_BOT_TOKEN не установлен!")
            logger.error("Установите переменную окружения: set TELEGRAM_BOT_TOKEN=your_token")
            return

        logger.info(f"🤖 Starting AI HelpDesk Telegram Bot")
        logger.info(f"Backend URL: {self.backend_url}")

        # Создание приложения
        self.app = Application.builder().token(self.token).build()

        # Добавление обработчиков
        self.app.add_handler(CommandHandler("start", self.start))
        self.app.add_handler(CommandHandler("help", self.help_command))
        self.app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_message))

        # Запуск бота
        if self.app:
            await self.app.initialize()
            await self.app.start()
            if self.app.updater:
                await self.app.updater.start_polling()

            logger.info("✅ Telegram Bot is running...")

            # Держим бота в работе
            await asyncio.Event().wait()


async def main():
    """Главная точка входа"""
    bot = HelpDeskBot(token=TELEGRAM_TOKEN, backend_url=BACKEND_URL)
    await bot.run()


if __name__ == "__main__":
    asyncio.run(main())

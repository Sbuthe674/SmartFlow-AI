# AI HelpDesk OneWindow (MVP)

Небольшое MVP для AI HelpDesk (FastAPI backend + простой frontend). Подходит для локальной разработки и размещения на GitHub; ключи и другие секреты должны храниться в `.env`.

## Что в репозитории

- `backend/` — FastAPI-приложение, обработка запросов, AI-core, Telegram бот.
- `frontend/` — простая HTML/JS панель оператора и виджет чата.

## Быстрый старт (Windows PowerShell)

1. Клонируйте репозиторий:

```powershell
git clone <URL>
cd <repo-folder>
```

2. Создайте виртуальное окружение и установите зависимости:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

3. Создайте `.env` из примера:

```powershell
Copy-Item .env.example .env
# затем откройте .env и заполните свои ключи
```

В `.env` нужно указать как минимум:
- `OPENAI_API_KEY` — ваш ключ OpenAI
- (опционально) `OPENAI_API_KEY2` — резервный ключ
- `TELEGRAM_TOKEN` — токен бота, если собираетесь запускать Telegram-бота
- `BACKEND_URL` — адрес backend (по умолчанию `http://localhost:8000`)

4. Запустите backend (из корня проекта или из `backend/`):

```powershell
cd backend
# если у вас активировано .venv, используйте его python
.\.\..\.venv\Scripts\python.exe -m uvicorn main:app --reload
# или
python -m uvicorn main:app --reload
```

5. Откройте `frontend/index.html` напрямую в браузере (для простоты) или настройте статическую раздачу через сервер.

## Запуск Telegram-бота (опционально)

1. Убедитесь, что backend запущен и доступен по `BACKEND_URL` из `.env`.
2. В `.env` установите `TELEGRAM_TOKEN`.
3. Запустите бот:

```powershell
cd backend
.\.\..\.venv\Scripts\python.exe telegram_bot.py
# или
python telegram_bot.py
```

Бот пересылает сообщения в `/api/ingest` и использует тот же механизм автопомощи / создания тикетов.

## Безопасность и GitHub

- Никогда не коммитьте реальные ключи в репозиторий.
- Используйте `.env` (в `.gitignore`) или GitHub Secrets для CI/CD.
- Перед тем как публиковать на GitHub — удалите ключи из любого кода и убедитесь, что `.env` не попадает в коммиты.

## Что ещё можно добавить

- Настроить Dockerfile / docker-compose для простого разворачивания.
- Добавить тесты и CI (GitHub Actions) с использованием секретов.
- Интерфейс для управления секретами на проде (Vault, Azure Key Vault и т.п.).

Если хотите — могу автоматически создать `LICENSE` (MIT) и пример GitHub Actions workflow для деплоя.

# 🎯 AI HelpDesk OneWindow - Полная интеграция ✅

**AI HelpDesk OneWindow** — единая система технической поддержки с ИИ-анализом обращений.

## 🚀 Быстрый старт (локально за 5 минут)

```bash
# Terminal 1 - Backend
cd backend && python -m uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend && python -m http.server 5500

# Откройте: http://localhost:5500
```

## 📋 Что реализовано

✅ Единая обработка обращений (веб + Telegram)
✅ ИИ-маршрутизация (язык, категория, приоритет, отдел)
✅ Автоматическое решение ~50% типовых кейсов
✅ Поддержка RU/KZ
✅ Безопасность (API-ключи только на backend'е)
✅ Панель мониторинга
✅ Три входа: Веб + Telegram + API

## 📋 Особенности

✅ **Frontend на GitHub Pages** — без API ключей, работает везде  
✅ **Backend на Render** — безопасное хранение ключей  
✅ **Telegram интеграция** — Long Polling бот  
✅ **OpenAI GPT-4** — классификация и генерация ответов  
✅ **FAQ + автоответ** — решение через базу при высокой уверенности  
✅ **Мультиязычность** — RU и KZ автоматическое определение  
✅ **SQLite БД** — тикеты и метрики  

## 🚀 Быстрый старт (локально)

### 1. Установка

```powershell
git clone <your-repo-url>
cd MVP

python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Настройка .env

Создайте `.env` в корне (добавьте в .gitignore):

```dotenv
OPENAI_API_KEY=sk-...
OPENAI_API_KEY2=
API_MODEL=gpt-4-turbo
TELEGRAM_TOKEN=123456:ABC...
BACKEND_URL=http://localhost:8000
```

### 3. Запуск backend

```powershell
cd backend
python -m uvicorn main:app --reload
```

Backend на `http://localhost:8000`

### 4. Тестирование

```bash
curl -X POST http://localhost:8000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"text": "Не могу подключиться к VPN"}'
```

### 5. Открываем frontend

Откройте `frontend/index.html` в браузере или используйте расширение Live Server.

## 🌐 Production: Render + GitHub Pages

### Backend на Render

1. Перейдите на [render.com](https://render.com)
2. **New → Web Service**
3. Выберите ваш GitHub repo
4. Настройки:
   - Build: `pip install -r requirements.txt`
   - Start: `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000`

5. **Environment Variables:**

```
OPENAI_API_KEY = sk-...
API_MODEL = gpt-4-turbo
TELEGRAM_TOKEN = 123456:ABC...
```

6. **Create** — готово! Получите URL вроде `https://ai-helpdesk-api.onrender.com`

### Frontend на GitHub Pages

1. В `frontend/app.js` обновите:

```javascript
const API_BASE = 'https://ai-helpdesk-api.onrender.com/api';
```

2. Перейдите в **Settings → Pages**
3. **Deploy from a branch** → **main** → **/frontend** → **Save**

Frontend готов на `https://username.github.io/repository`

### Telegram Bot (опционально)

1. На Render создайте **Background Worker**
2. Start command: `cd backend && python telegram_bot.py`
3. Добавьте TELEGRAM_TOKEN и BACKEND_URL в Environment Variables

## 🔐 Безопасность

✅ Frontend на GitHub Pages — нет секретов  
✅ Backend на Render — секреты в переменных окружения  
✅ `.env` в `.gitignore` — не попадает в репозиторий  
✅ CORS включен — frontend может запрашивать backend  

## 📊 API

### POST /api/ingest

```json
{"text": "Не могу подключиться к VPN"}
```

**Ответ (авто-решение):**
```json
{
  "status": "closed_auto",
  "ticket_id": 1,
  "answer": "Попробуйте перезапустить VPN...",
  "category": "VPN",
  "priority": "high",
  "department": "IT Security"
}
```

### GET /api/tickets

Список тикетов (опционально фильтр `?status=new`)

### GET /api/metrics

Статистика: всего, авто-решено, по категориям, статусам, приоритетам

## 🛠️ Структура проекта

```
MVP/
├── .gitignore
├── requirements.txt
├── README.md
├── backend/
│   ├── config.py              # Конфиг (ключи из окружения)
│   ├── models.py              # Модели SQLAlchemy + Pydantic
│   ├── database.py            # SQLite
│   ├── ai_core.py             # LLM (OpenAI)
│   ├── faq_store.py           # FAQ база
│   ├── router_tickets.py      # Endpoints
│   ├── main.py                # FastAPI app
│   └── telegram_bot.py        # Telegram бот
└── frontend/
    ├── index.html             # UI
    ├── app.js                 # Логика
    └── styles.css             # Стили
```

## 🐛 Troubleshooting

**CORS error:** Убедитесь, что backend имеет CORS middleware (уже добавлен в `main.py`)

**OpenAI ошибка:** Проверьте, что OPENAI_API_KEY установлена на Render (Settings → Environment Variables)

**Telegram не работает:** Убедитесь, что TELEGRAM_TOKEN действительный и BACKEND_URL доступен

**Frontend не подключается:** Проверьте `API_BASE` в `app.js` и убедитесь, что backend работает

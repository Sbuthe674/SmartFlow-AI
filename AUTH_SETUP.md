# 🔐 Система Логина и Регистрации

## Что было добавлено

### Frontend (HTML/CSS/JavaScript)
1. **Модальное окно логина** - для входа пользователей
2. **Модальное окно регистрации** - для создания новых аккаунтов
3. **Кнопка администратора** - для регистрации админов (в хедере справа)
4. **Сохранение сессии** - токен сохраняется в localStorage

### Backend (Python/FastAPI)
1. **Новая модель User** - в `models.py`
   - username, email, hashed_password, company_name
   - is_admin, is_active флаги

2. **Router аутентификации** - `router_auth.py`
   - `/api/auth/register` - регистрация пользователя
   - `/api/auth/login` - логин пользователя
   - `/api/auth/admin/register` - регистрация админа
   - `/api/auth/me` - получить текущего пользователя
   - `/api/auth/logout` - логаут

### Безопасность
- Пароли хешируются с помощью bcrypt
- JWT токены для аутентификации
- CORS настроена для фронтенда

## Установка

### 1. Установите зависимости
```bash
pip install -r requirements.txt
```

### 2. Создайте файл `.env`
```bash
cd env
cp .env.example .env
# Отредактируйте .env и добавьте необходимые ключи
```

### 3. Запустите backend
```bash
cd backend
python main.py
```

Backend будет доступен на: `http://localhost:8000`

### 4. Откройте фронтенд
Откройте `frontend/index.html` в браузере или используйте live server

## Использование

### Регистрация пользователя
1. Нажмите кнопку "Войти" в хедере
2. Перейдите по ссылке "Зарегистрироваться"
3. Заполните форму (имя компании, email, пароль)
4. Нажмите "Зарегистрироваться"

### Логин
1. Нажмите кнопку "Войти" в хедере
2. Введите email и пароль
3. Нажмите "Войти"

### Регистрация администратора
1. Нажмите кнопку "👤 Admin" в верхнем правом углу
2. Заполните форму (имя, email, пароль)
3. Нажмите "Зарегистрировать"

## API Endpoints

### Регистрация
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "company_name",
  "email": "user@example.com",
  "password": "secure_password",
  "company_name": "Company Name"
}
```

### Логин
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

### Регистрация Администратора
```
POST /api/auth/admin/register
Content-Type: application/json

{
  "username": "admin_name",
  "email": "admin@example.com",
  "password": "secure_password"
}
```

### Получить профиль
```
GET /api/auth/me
Authorization: Bearer {access_token}
```

## Ответы API

### Успешная регистрация/логин
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "username": "company",
      "email": "user@example.com",
      "company_name": "Company Name",
      "is_admin": false,
      "is_active": true,
      "created_at": "2025-12-06T10:00:00"
    }
  }
}
```

### Ошибка
```json
{
  "success": false,
  "message": "User with this email or username already exists",
  "data": null
}
```

## Структура БД

Новая таблица `users`:
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Следующие шаги

1. Добавьте ограничение доступа к админским эндпоинтам
2. Реализуйте refresh token для продления сессии
3. Добавьте 2FA (двухфакторную аутентификацию)
4. Создайте admin dashboard для управления пользователями
5. Добавьте email подтверждение при регистрации

## Файлы

- `frontend/index.html` - HTML с модалями
- `frontend/script.js` - JavaScript для управления форм
- `frontend/style.css` - CSS стили для модалей
- `backend/models.py` - Pydantic & SQLAlchemy модели
- `backend/router_auth.py` - API маршруты аутентификации
- `backend/main.py` - FastAPI приложение
- `env/.env.example` - Пример переменных окружения

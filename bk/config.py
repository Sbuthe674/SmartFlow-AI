import os
import warnings

# API Configuration
# Секреты не должны храниться в репозитории. Для локальной разработки создайте `.env`
# и установите переменные `OPENAI_API_KEY` (и опционально `OPENAI_API_KEY2`).
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_API_KEY2 = os.getenv("OPENAI_API_KEY2")
API_MODEL = os.getenv("API_MODEL", "gpt-4")

if not OPENAI_API_KEY:
    warnings.warn("OPENAI_API_KEY not set. Set it via environment variable or .env before running in production.")

# Database
DATABASE_URL = "sqlite:///./helpdesk.db"

# AI Settings
AUTO_RESOLVE_THRESHOLD = 0.85
SIMILARITY_THRESHOLD = 0.7

# Categories
CATEGORIES = [
    "VPN",
    "Email",
    "Hardware",
    "Software",
    "Access",
    "Network",
    "Other"
]

# Departments
DEPARTMENT_MAPPING = {
    "VPN": "IT Security",
    "Email": "IT Support",
    "Hardware": "IT Support",
    "Software": "IT Support",
    "Access": "IT Security",
    "Network": "IT Infrastructure",
    "Other": "General Support"
}

# Priority levels
PRIORITIES = ["low", "medium", "high", "critical"]
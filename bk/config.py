import os

# API Configuration
# ВНИМАНИЕ: Встраивание секретных ключей прямо в код НЕ рекомендуется.
# Рекомендуется устанавливать переменную окружения OPENAI_API_KEY на сервере/локальной машине.
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "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")
API_MODEL = "gpt-4"

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
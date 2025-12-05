import os
from dotenv import load_dotenv

# Load environment variables from .env (server-side only)
load_dotenv()

# API Configuration - READ FROM ENVIRONMENT ONLY
# Never embed keys in code! This file is for production server only.
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_API_KEY2 = os.getenv("OPENAI_API_KEY2", "")
API_MODEL = os.getenv("API_MODEL", "gpt-4-turbo")

if not OPENAI_API_KEY:
    import warnings
    warnings.warn(
        "⚠️ OPENAI_API_KEY not set! Set it in environment variables on production server."
    )

# Database
DATABASE_URL = "sqlite:///./helpdesk.db"

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-!@#$%^&*()")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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

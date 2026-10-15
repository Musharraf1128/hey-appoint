import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://clinic:clinic@postgres:5432/clinic",
)

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    secret_key: str = "your-super-secret-key-here"  # В продакшене использовать безопасный ключ
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    database_url: str = "sqlite:///./tasks.db"

settings = Settings()

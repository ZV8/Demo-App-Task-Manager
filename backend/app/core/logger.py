import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from typing import Any

# Создаем директорию для логов, если её нет
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Настраиваем форматирование логов
log_format = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    # Хендлер для файла
    file_handler = RotatingFileHandler(
        log_dir / f"{name}.log",
        maxBytes=10485760,  # 10MB
        backupCount=5,
        encoding="utf-8"
    )
    file_handler.setFormatter(log_format)
    logger.addHandler(file_handler)

    # Хендлер для консоли
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(log_format)
    logger.addHandler(console_handler)

    return logger

# Создаем логгеры для разных компонентов
api_logger = setup_logger("api")
auth_logger = setup_logger("auth")
task_logger = setup_logger("task")
db_logger = setup_logger("database")

class LoggerMixin:
    """Миксин для добавления логирования в классы"""
    
    def __init__(self) -> None:
        self.logger = setup_logger(self.__class__.__name__)

    def log_error(self, error: Exception, context: dict[str, Any] = None) -> None:
        """Логирование ошибок с контекстом"""
        error_details = {
            "error_type": type(error).__name__,
            "error_message": str(error),
            "context": context or {}
        }
        self.logger.error(f"Error occurred: {error_details}", exc_info=True)

    def log_info(self, message: str, context: dict[str, Any] = None) -> None:
        """Логирование информационных сообщений"""
        if context:
            self.logger.info(f"{message} - Context: {context}")
        else:
            self.logger.info(message)

    def log_warning(self, message: str, context: dict[str, Any] = None) -> None:
        """Логирование предупреждений"""
        if context:
            self.logger.warning(f"{message} - Context: {context}")
        else:
            self.logger.warning(message)

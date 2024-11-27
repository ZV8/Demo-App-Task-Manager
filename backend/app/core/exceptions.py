from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from typing import Any, Dict
from .logger import api_logger

class AppException(HTTPException):
    """Базовый класс для исключений приложения"""
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: str = None,
        context: Dict[str, Any] = None
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code
        self.context = context or {}

class DatabaseError(AppException):
    """Ошибки базы данных"""
    def __init__(self, detail: str, context: Dict[str, Any] = None):
        super().__init__(
            status_code=500,
            detail=detail,
            error_code="DATABASE_ERROR",
            context=context
        )

class ValidationError(AppException):
    """Ошибки валидации"""
    def __init__(self, detail: str, context: Dict[str, Any] = None):
        super().__init__(
            status_code=400,
            detail=detail,
            error_code="VALIDATION_ERROR",
            context=context
        )

class AuthenticationError(AppException):
    """Ошибки аутентификации"""
    def __init__(self, detail: str, context: Dict[str, Any] = None):
        super().__init__(
            status_code=401,
            detail=detail,
            error_code="AUTHENTICATION_ERROR",
            context=context
        )

async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Глобальный обработчик исключений"""
    
    # Контекст запроса для логирования
    request_context = {
        "method": request.method,
        "url": str(request.url),
        "client_host": request.client.host,
        "headers": dict(request.headers)
    }

    if isinstance(exc, AppException):
        api_logger.error(
            f"Application error: {exc.detail}",
            extra={
                "error_code": exc.error_code,
                "context": {**exc.context, **request_context}
            }
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "error_code": exc.error_code,
                "context": exc.context
            }
        )
    
    elif isinstance(exc, SQLAlchemyError):
        api_logger.error(
            "Database error occurred",
            extra={"context": request_context},
            exc_info=True
        )
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal database error",
                "error_code": "DATABASE_ERROR"
            }
        )
    
    # Обработка остальных исключений
    api_logger.error(
        f"Unhandled error: {str(exc)}",
        extra={"context": request_context},
        exc_info=True
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "error_code": "INTERNAL_ERROR"
        }
    )

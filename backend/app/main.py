from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, tasks
from .database import Base, engine
from .middleware.rate_limit import rate_limit_middleware
from .core.exceptions import global_exception_handler
from .core.logger import api_logger
import time

# Создаем таблицы в базе данных
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Manager API",
    description="API для управления задачами с аутентификацией пользователей",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Настройка CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:80",
    "http://localhost:8080",  # Добавляем порт, который использует frontend в Docker
    "http://127.0.0.1:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:80",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]  # Добавляем expose_headers для доступа к кастомным заголовкам
)

# Добавляем rate limit middleware
app.middleware("http")(rate_limit_middleware)

# Добавляем глобальный обработчик ошибок
app.exception_handler(Exception)(global_exception_handler)

# Middleware для логирования запросов
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Генерируем уникальный ID для запроса
    request_id = f"{time.time()}-{id(request)}"
    
    # Логируем начало запроса
    api_logger.info(
        f"Request started",
        extra={
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "client_host": request.client.host,
            "headers": dict(request.headers)
        }
    )
    
    # Замеряем время выполнения
    start_time = time.time()
    
    try:
        # Выполняем запрос
        response = await call_next(request)
        
        # Логируем успешное завершение
        process_time = time.time() - start_time
        api_logger.info(
            f"Request completed",
            extra={
                "request_id": request_id,
                "status_code": response.status_code,
                "process_time": f"{process_time:.3f}s"
            }
        )
        
        return response
        
    except Exception as exc:
        # Логируем ошибку
        process_time = time.time() - start_time
        api_logger.error(
            f"Request failed",
            extra={
                "request_id": request_id,
                "error": str(exc),
                "process_time": f"{process_time:.3f}s"
            },
            exc_info=True
        )
        raise

# Подключаем роутеры
app.include_router(auth.router, prefix="/api")
app.include_router(tasks.router, prefix="/api", tags=["tasks"])

@app.get("/api/health")
def health_check():
    """
    Проверка работоспособности API.
    """
    return {"status": "healthy"}

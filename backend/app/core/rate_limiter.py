from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.status import HTTP_429_TOO_MANY_REQUESTS
import time
from typing import Dict, Tuple
import asyncio
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self):
        self.requests: Dict[str, list] = {}  # IP -> list of timestamps
        self.locks: Dict[str, asyncio.Lock] = {}  # IP -> lock
        
        # Настройки лимитов для разных эндпоинтов
        self.limits = {
            "/api/auth/login": (5, 60),     # 5 попыток в минуту для логина
            "/api/auth/register": (3, 60),  # 3 попытки в минуту для регистрации
            "default": (30, 60),            # 30 запросов в минуту для остальных эндпоинтов
        }

    async def _clean_old_requests(self, ip: str, window: int):
        """Очищает устаревшие запросы"""
        current_time = time.time()
        self.requests[ip] = [ts for ts in self.requests[ip] if current_time - ts < window]

    def _get_limit_for_path(self, path: str) -> Tuple[int, int]:
        """Возвращает лимит и окно времени для данного пути"""
        for endpoint, limit in self.limits.items():
            if endpoint in path:
                return limit
        return self.limits["default"]

    async def check_rate_limit(self, request: Request) -> None:
        ip = request.client.host
        path = request.url.path

        # Создаем блокировку для IP, если её еще нет
        if ip not in self.locks:
            self.locks[ip] = asyncio.Lock()

        async with self.locks[ip]:
            # Инициализируем список временных меток для нового IP
            if ip not in self.requests:
                self.requests[ip] = []

            # Получаем лимиты для данного эндпоинта
            rate_limit, window = self._get_limit_for_path(path)

            # Очищаем старые запросы
            await self._clean_old_requests(ip, window)

            # Проверяем, не превышен ли лимит
            if len(self.requests[ip]) >= rate_limit:
                retry_after = window - (time.time() - self.requests[ip][0])
                raise HTTPException(
                    status_code=HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "message": "Too many requests",
                        "retry_after": int(retry_after),
                        "limit": rate_limit,
                        "window": window
                    }
                )

            # Добавляем текущий запрос
            self.requests[ip].append(time.time())

rate_limiter = RateLimiter()

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from ..core.rate_limiter import rate_limiter
from sqlalchemy.exc import IntegrityError

async def rate_limit_middleware(request: Request, call_next):
    try:
        await rate_limiter.check_rate_limit(request)
        response = await call_next(request)
        return response
    except HTTPException as exc:
        if exc.status_code == 429:
            return JSONResponse(
                status_code=429,
                content={"detail": exc.detail}
            )
        raise exc
    except IntegrityError:
        return JSONResponse(
            status_code=400,
            content={"detail": "Пользователь с таким email или именем уже существует"}
        )
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"detail": "Внутренняя ошибка сервера"}
        )

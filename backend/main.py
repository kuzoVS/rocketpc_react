# main.py - исправленная версия для работы с React

from fastapi import FastAPI, Request, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import os
from typing import Dict, Optional

# Импорты роутеров
from app.routers import clients
from app.routers import main, requests, auth, dashboard, users
from app.config import settings
from app.database_pg import db
from app.auth import verify_token_from_cookie, require_role_cookie, clear_auth_cookie
from app.middleware import AuthenticationMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Запуск приложения ROCKET PC...")

    # Создаем только необходимые папки (БЕЗ static для React)
    if not os.path.exists("uploads"):
        os.makedirs("uploads")

    try:
        await db.connect()
        print("✅ Успешно подключились к PostgreSQL")
    except Exception as e:
        print(f"❌ Ошибка подключения к БД: {e}")

    yield

    print("👋 Завершение работы приложения...")
    await db.disconnect()

app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# CORS для React (ОБЯЗАТЕЛЬНО для SPA)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",
        # Добавьте ваш продакшн домен
        # "https://yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# УБРАЛИ middleware для auth, так как в React это будет работать по-другому
# app.add_middleware(AuthenticationMiddleware)

# УБРАЛИ монтирование static файлов
# app.mount("/static", StaticFiles(directory="static"), name="static")

# Только API роуты
app.include_router(requests.router, prefix="/api")
app.include_router(clients.router, prefix="/api") 
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")

# API эндпоинты для dashboard (React будет их использовать)
@app.get("/api/dashboard/stats")
async def dashboard_api_stats():
    try:
        stats = await db.get_statistics()
        all_requests = await db.get_all_repair_requests()
        active_requests = len([r for r in all_requests if r['status'] != 'Выдана' and not r['is_archived']])
        completed_requests = len([r for r in all_requests if r['status'] == 'Выдана'])
        stats.update({
            'active_requests': active_requests,
            'completed_requests': completed_requests,
            'monthly_revenue': completed_requests * 5000,
            'avg_repair_time': 3
        })
        return stats
    except Exception as e:
        print(f"❌ Ошибка получения статистики: {e}")
        return {
            'active_requests': 0,
            'completed_requests': 0,
            'monthly_revenue': 0,
            'avg_repair_time': 0
        }

@app.get("/api/dashboard/requests")
async def get_dashboard_requests():
    try:
        all_requests = await db.get_all_repair_requests()
        recent_requests = sorted(all_requests, key=lambda r: r['created_at'], reverse=True)
        return recent_requests
    except Exception as e:
        print(f"❌ Ошибка получения заявок: {e}")
        return []

@app.get("/api/dashboard/recent-requests")
async def get_dashboard_recent_requests():
    try:
        all_requests = await db.get_all_repair_requests()
        recent_requests = sorted(all_requests, key=lambda r: r['created_at'], reverse=True)
        return recent_requests[:5]
    except Exception as e:
        print(f"❌ Ошибка получения последних заявок: {e}")
        return []

@app.get("/api/masters/available")
async def get_available_masters_api():
    try:
        masters = await db.get_available_masters()
        for master in masters:
            master["skills"] = await db.get_master_skills(master["id"])
        return masters
    except Exception as e:
        print(f"❌ Ошибка получения мастеров: {e}")
        return []

@app.post("/api/requests/{request_id}/assign-master")
async def assign_master_api(request_id: str, assignment_data: dict):
    try:
        success = await db.assign_master_to_request(
            request_id=request_id,
            master_id=assignment_data.get("master_id"),
            assigned_by_id=1  # TODO: получать из токена
        )
        if not success:
            raise HTTPException(status_code=404, detail="Заявка не найдена")
        return {"message": "Мастер назначен"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка назначения мастера: {e}")
        raise HTTPException(status_code=500, detail="Ошибка назначения мастера")

@app.delete("/api/requests/{request_id}/unassign-master")
async def unassign_master_api(request_id: str):
    try:
        success = await db.unassign_master_from_request(request_id)
        if not success:
            raise HTTPException(status_code=404, detail="Заявка не найдена или мастер не назначен")
        return {"message": "Мастер снят с заявки"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка снятия мастера: {e}")
        raise HTTPException(status_code=500, detail="Ошибка снятия мастера")

# Health check для проверки работы API
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected" if db.pool else "disconnected"
    }

# Базовый API endpoint
@app.get("/api")
async def api_root():
    return {
        "message": "ROCKET PC Service Center API",
        "version": settings.APP_VERSION,
        "status": "online"
    }

# Обработчики ошибок для API
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    if request.url.path.startswith("/api"):
        return JSONResponse(status_code=404, content={"detail": "Endpoint not found"})
    # Для неAPI запросов возвращаем 404
    return JSONResponse(status_code=404, content={"detail": "Not found"})

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    print(f"💥 Внутренняя ошибка сервера: {exc}")
    if request.url.path.startswith("/api"):
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
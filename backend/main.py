"""
InvestAI Backend API - Pure API service with no frontend dependencies.
Provides AI-powered startup analysis, investor matching, and document processing.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging
import time
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- Import from Project Structure ---
# NOTE: The implementation assumes the existence of backend/config.py and utils/exceptions.py
from config import get_settings, validate_api_keys
from api.routers import ai_interview_session, ai_voice_service, analysis, profiles, meetings, chatbot
from api.routers.simple_meetings import router as simple_meetings_router
from utils.exceptions import InvestAIException
from ping_service import start_ping_service, stop_ping_service
# ------------------------------------------------------


# ------------------------------------------------------
# LOGGING CONFIGURATION
# ------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("investai.log")
    ]
)
logger = logging.getLogger(__name__)

settings = get_settings()


# ------------------------------------------------------
# APP LIFECYCLE
# ------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown."""
    logger.info("🚀 Starting InvestAI backend service...")

    try:
        validate_api_keys()
    except ValueError as e:
        logger.error(f"❌ Invalid API key configuration: {e}")
        # Allow server to run but with a clear error message.
        # In a production environment, you might want to raise an exception here.

    backend_url = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
    if settings.environment != "development":
        await start_ping_service(backend_url)
    logger.info("✅ InvestAI backend started successfully")

    yield

    logger.info("🛑 Shutting down InvestAI backend...")
    stop_ping_service()
    logger.info("✅ InvestAI backend shutdown complete")


# ------------------------------------------------------
# FASTAPI APP INITIALIZATION
# ------------------------------------------------------
app = FastAPI(
    title="InvestAI Backend API",
    description="Pure API service for AI-powered startup analysis, investor matching, and document processing",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)


# ------------------------------------------------------
# MIDDLEWARE CONFIGURATION
# ------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Allow all hosts (can be restricted later)
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    response.headers["X-Process-Time"] = f"{duration:.3f}s"
    return response


# ------------------------------------------------------
# EXCEPTION HANDLERS
# ------------------------------------------------------
@app.exception_handler(InvestAIException)
async def investai_exception_handler(request: Request, exc: InvestAIException):
    """Handle custom InvestAI exceptions gracefully."""
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict()
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch all unexpected exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "type": type(exc).__name__,
            "message": str(exc),
            "request_path": request.url.path
        }
    )


# ------------------------------------------------------
# ROUTERS REGISTRATION
# ------------------------------------------------------

# Core Business Routers (with explicit prefixes)
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(profiles.router, prefix="/api/profiles", tags=["profiles"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["chatbot"])
app.include_router(meetings.router, prefix="/api/meetings", tags=["meetings"])
app.include_router(simple_meetings_router, prefix="/api/simple-meetings", tags=["simple-meetings"])


# ✅ AI Interviewer and Voice Services (no explicit prefix needed if defined internally or mounted at root)
# ai_interview_session router has prefix="/api/interviewer" defined internally.
app.include_router(ai_interview_session.router) 

# ai_voice_service router exposes /voice/generate and /speech/recognize at the root.
app.include_router(ai_voice_service.router)


# ------------------------------------------------------
# ROOT & SYSTEM ENDPOINTS
# ------------------------------------------------------
@app.get("/", tags=["root"])
async def root():
    """Root endpoint providing basic API information."""
    return {
        "service": "InvestAI Backend API",
        "version": "1.1.0",
        "status": "running",
        "description": "Pure backend API for AI-driven startup analysis",
        "docs": "/docs",
        "api_info": "/api",
        "chatbot_type": "Multimodal RAG (PDF + Text)",
        "note": "No frontend dependencies"
    }


@app.get("/api", tags=["api-info"])
async def api_info():
    """List available API endpoints."""
    return {
        "service": "InvestAI Backend API",
        "version": "1.1.0",
        "status": "running",
        "endpoints": {
            "analysis": "/api/analysis/*",
            "profiles": "/api/profiles/*",
            "chatbot": "/api/chatbot/*",
            "meetings": "/api/meetings/*",
            "interviewer_session": "/api/interviewer/*", # Included for clarity
            "voice_tts_stt": "/voice/generate | /speech/recognize", # Included for clarity
            "health": "/health",
            "status": "/api/status",
            "docs": "/docs"
        },
        "features": [
            "AI-powered startup analysis",
            "Investor and founder profiling",
            "Multimodal RAG chatbot (PDF + text)",
            "Meeting scheduling",
            "AI Interview Simulation (TTS/STT)",
            "Document processing and storage"
        ]
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "InvestAI Backend API",
        "version": "1.1.0",
        "environment": settings.environment,
        "uptime": "Available"
    }


@app.get("/api/status", tags=["api-info"])
async def api_status():
    """Show API operational status."""
    return {
        "status": "operational",
        "version": "1.1.0",
        "environment": settings.environment,
        "debug": settings.debug,
        "features": {
            "chatbot_multimodal_rag": True,
            "analysis": True,
            "profiles": True,
            "meetings": True,
            "caching": False,
            "background_tasks": False
        }
    }


# ------------------------------------------------------
# SERVER ENTRY POINT
# ------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    logger.info("Starting InvestAI Backend Server...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug: {settings.debug}")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
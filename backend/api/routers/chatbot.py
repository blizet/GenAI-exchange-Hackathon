from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging
from agents.simple_rag_chatbot import chatbot

logger = logging.getLogger(__name__)
router = APIRouter(tags=["chatbot"])

class ChatRequest(BaseModel):
    startup_id: str
    question: str
    startup_data: Optional[Dict[str, Any]] = None  # Contains analysis data from frontend

class ChatResponse(BaseModel):
    success: bool
    response: str
    context_used: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@router.post("/chat", response_model=ChatResponse)
async def chat_with_startup(request: ChatRequest):
    """Chat endpoint using analysis data RAG (no PDF documents)"""
    try:
        logger.info(f"📨 Chat request for startup: {request.startup_id}")
        
        # Extract analysis data from frontend
        analysis_data = None
        if request.startup_data:
            analysis_data = {
                'analysis': request.startup_data.get('analysis'),
                'analysisResults': request.startup_data.get('analysisResults'),
                'analyses': request.startup_data.get('analyses', [])
            }
            
            num_analyses = len(analysis_data.get('analyses', []))
            has_results = bool(analysis_data.get('analysisResults'))
            logger.info(f"📊 Received analysis data: {num_analyses} analyses, results: {has_results}")
        else:
            logger.warning("⚠️ No startup_data provided in request")
        
        # Call chatbot with analysis context
        result = await chatbot.chat(
            startup_id=request.startup_id,
            question=request.question,
            analysis_data=analysis_data
        )
        
        return ChatResponse(**result)
        
    except Exception as e:
        logger.error(f"❌ Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/suggested-questions/{startup_id}")
async def get_suggested_questions(startup_id: str):
    """Get suggested questions based on available analysis data"""
    try:
        # Note: Since we only have analysis data (no documents to fetch),
        # we return generic analysis-focused questions
        
        questions = [
            "What does the AI analysis reveal about this startup?",
            "What are the key strengths identified?",
            "What are the main risks or red flags?",
            "What is the overall credibility score?",
            "What claims were verified in the analysis?",
            "What areas need further verification?",
            "How confident is the analysis overall?",
            "What are the key recommendations?"
        ]
        
        return {
            "success": True,
            "questions": questions
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting suggested questions: {e}")
        return {
            "success": False,
            "questions": [
                "What does the analysis say about this startup?",
                "What are the key findings?",
                "What risks were identified?"
            ],
            "error": str(e)
        }
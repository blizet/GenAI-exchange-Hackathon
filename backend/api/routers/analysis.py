"""
Analysis API router for InvestAI platform.
Handles all analysis-related endpoints including text analysis, fact checking, and comprehensive analysis.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, UploadFile, File
from typing import Dict, Any, Optional
import logging
from pydantic import BaseModel
import asyncio
import time
# Using utils agent_runner instead of Google ADK

from agents.document_ingestor import startup_analyzer
from utils.agent_runner import run_agent, AgentError
from config import get_settings

# All analysis routes now use document_ingestor for consistency

logger = logging.getLogger(__name__)

router = APIRouter(tags=["analysis"])

# Helper function to run specialized agents
async def run_specialized_agent(agent, app_name: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Run a specialized agent using the utils agent_runner."""
    try:
        # Extract text from input_data
        text = input_data.get("text", "")
        
        # Use the utils agent_runner for simple text-based agents
        result = await run_agent(
            agent_name=app_name,
            prompt=f"Analyze the following startup information: {text}",
            input_data=text
        )
        
        return {
            "success": True,
            "response": result.get("response", "Analysis completed"),
            "agent_name": app_name,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error running specialized agent {app_name}: {e}")
        return {
            "success": False,
            "error": str(e),
            "agent_name": app_name
        }

# Pydantic models for request/response
class TextAnalysisRequest(BaseModel):
    text: str
    analysis_type: str = "comprehensive"

class FactCheckRequest(BaseModel):
    text: str
    context: Optional[str] = None

class AnalysisResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    analysis_type: str
    processing_time: Optional[float] = None

# Text Analysis Route - Uses document_ingestor for all analysis types
@router.post("/text", response_model=AnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):
    """
    Analyze text content using document_ingestor with specialized AI agents.
    
    Args:
        request: Text analysis request containing text and analysis type
        
    Returns:
        Analysis results with success status and data
    """
    try:
        print(f"\n🔍 [TEXT ANALYSIS] Starting text analysis for type: {request.analysis_type}")
        print(f"📝 [TEXT ANALYSIS] Text length: {len(request.text)} characters")
        logger.info(f"Starting text analysis for type: {request.analysis_type}")
        
        # Use document_ingestor to analyze text with the specified analysis type
        result = startup_analyzer.analyze_document(
            document_content=request.text,
            document_type="text_analysis",
            analysis_types=[request.analysis_type]
        )
        
        print(f"✅ [TEXT ANALYSIS] Text analysis completed successfully: {request.analysis_type}")
        logger.info(f"Text analysis completed for type: {request.analysis_type}")
        
        return AnalysisResponse(
            success=True,
            data=result,
            analysis_type=request.analysis_type,
            processing_time=result.get("processing_time")
        )
        
    except Exception as e:
        logger.error(f"Unexpected error in text analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Text analysis failed: {str(e)}"
        )

@router.post("/fact-check", response_model=AnalysisResponse)
async def fact_check(request: FactCheckRequest):
    """
    Perform fact-checking on provided text using document_ingestor.
    
    Args:
        request: Fact check request containing text and optional context
        
    Returns:
        Fact check results with verification status
    """
    try:
        print(f"\n🔍 [FACT CHECK] Starting fact check analysis")
        print(f"📝 [FACT CHECK] Text length: {len(request.text)} characters")
        logger.info("Starting fact check analysis")
        
        # Use document_ingestor for fact checking
        result = startup_analyzer.analyze_document(
            document_content=request.text,
            document_type="fact_check",
            analysis_types=["factcheck"]
        )
        
        print(f"✅ [FACT CHECK] Fact check analysis completed successfully")
        
        return AnalysisResponse(
            success=True,
            data=result,
            analysis_type="fact_check"
        )
        
    except Exception as e:
        logger.error(f"Unexpected error in fact check: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Fact check failed: {str(e)}"
        )

@router.post("/business-model", response_model=AnalysisResponse)
async def business_model_analysis(request: TextAnalysisRequest):
    """
    Perform business model analysis using document_ingestor.
    
    Args:
        request: Text analysis request containing startup data
        
    Returns:
        Business model analysis results
    """
    try:
        print(f"\n💼 [BUSINESS MODEL] Starting business model analysis")
        print(f"📝 [BUSINESS MODEL] Text length: {len(request.text)} characters")
        logger.info("Starting business model analysis")
        
        # Use document_ingestor for business model analysis
        result = startup_analyzer.analyze_document(
            document_content=request.text,
            document_type="business_model",
            analysis_types=["business_model"]
        )
        
        print(f"✅ [BUSINESS MODEL] Business model analysis completed successfully")
        
        return AnalysisResponse(
            success=True,
            data=result,
            analysis_type="business_model"
        )
        
    except Exception as e:
        logger.error(f"Error in business model analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Business model analysis error: {str(e)}"
        )

@router.post("/market-analysis", response_model=AnalysisResponse)
async def analyze_market_intelligence(request: TextAnalysisRequest):
    """
    Perform market intelligence analysis using document_ingestor.
    
    Args:
        request: Text analysis request containing market data
        
    Returns:
        Market intelligence analysis results
    """
    try:
        logger.info("Starting market intelligence analysis")
        
        result = startup_analyzer.analyze_document(
            document_content=request.text,
            document_type="market_analysis",
            analysis_types=["market_intelligence"]
        )
        
        return AnalysisResponse(
            success=True,
            data=result,
            analysis_type="market_intelligence"
        )
        
    except Exception as e:
        logger.error(f"Error in market analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Market analysis failed: {str(e)}"
        )

@router.post("/risk-assessment", response_model=AnalysisResponse)
async def analyze_risk_assessment(request: TextAnalysisRequest):
    """
    Perform risk assessment analysis using document_ingestor.
    
    Args:
        request: Text analysis request containing startup data
        
    Returns:
        Risk assessment analysis results
    """
    try:
        logger.info("Starting risk assessment analysis")
        
        result = startup_analyzer.analyze_document(
            document_content=request.text,
            document_type="risk_assessment",
            analysis_types=["risk_assessment"]
        )
        
        return AnalysisResponse(
            success=True,
            data=result,
            analysis_type="risk_assessment"
        )
        
    except Exception as e:
        logger.error(f"Error in risk assessment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Risk assessment failed: {str(e)}"
        )

@router.post("/competition-analysis", response_model=AnalysisResponse)
async def analyze_competition(request: TextAnalysisRequest):
    """
    Perform competition analysis using document_ingestor.
    
    Args:
        request: Text analysis request containing startup data
        
    Returns:
        Competition analysis results
    """
    try:
        logger.info("Starting competition analysis")
        
        result = startup_analyzer.analyze_document(
            document_content=request.text,
            document_type="competition_analysis",
            analysis_types=["competition"]
        )
        
        return AnalysisResponse(
            success=True,
            data=result,
            analysis_type="competition"
        )
        
    except Exception as e:
        logger.error(f"Error in competition analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Competition analysis failed: {str(e)}"
        )

@router.post("/founders-analysis", response_model=AnalysisResponse)
async def analyze_founders(request: TextAnalysisRequest):
    """
    Perform founders research analysis using document_ingestor.
    
    Args:
        request: Text analysis request containing founder data
        
    Returns:
        Founders analysis results
    """
    try:
        logger.info("Starting founders analysis")
        
        result = startup_analyzer.analyze_document(
            document_content=request.text,
            document_type="founders_analysis",
            analysis_types=["founders"]
        )
        
        return AnalysisResponse(
            success=True,
            data=result,
            analysis_type="founders"
        )
        
    except Exception as e:
        logger.error(f"Error in founders analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Founders analysis failed: {str(e)}"
        )

@router.post("/market-size-analysis", response_model=AnalysisResponse)
async def analyze_market_size(request: TextAnalysisRequest):
    """
    Perform market size analysis using document_ingestor.
    
    Args:
        request: Text analysis request containing market data
        
    Returns:
        Market size analysis results
    """
    try:
        logger.info("Starting market size analysis")
        
        result = startup_analyzer.analyze_document(
            document_content=request.text,
            document_type="market_size_analysis",
            analysis_types=["market_size"]
        )
        
        return AnalysisResponse(
            success=True,
            data=result,
            analysis_type="market_size"
        )
        
    except Exception as e:
        logger.error(f"Error in market size analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Market size analysis failed: {str(e)}"
        )

@router.post("/product-info-analysis", response_model=AnalysisResponse)
async def analyze_product_info(request: TextAnalysisRequest):
    """
    Perform product information analysis using document_ingestor.
    
    Args:
        request: Text analysis request containing product data
        
    Returns:
        Product information analysis results
    """
    try:
        logger.info("Starting product info analysis")
        
        result = startup_analyzer.analyze_document(
            document_content=request.text,
            document_type="product_info_analysis",
            analysis_types=["product_info"]
        )
        
        return AnalysisResponse(
            success=True,
            data=result,
            analysis_type="product_info"
        )
        
    except Exception as e:
        logger.error(f"Error in product info analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Product info analysis failed: {str(e)}"
        )

@router.post("/investment-recommendation", response_model=AnalysisResponse)
async def investment_recommendation_analysis(request: TextAnalysisRequest):
    """
    Perform investment recommendation analysis using the specialized investment_recommendation_analyzer.
    
    Args:
        request: Text analysis request containing startup data
        
    Returns:
        Investment recommendation analysis results
    """
    try:
        print(f"\n💰 [INVESTMENT] Starting investment recommendation analysis")
        print(f"📝 [INVESTMENT] Text length: {len(request.text)} characters")
        logger.info("Starting investment recommendation analysis")
        
        # Prepare input data for the specialized agent
        input_data = {
            "text": request.text,
            "analysis_type": request.analysis_type
        }
        
        print(f"🤖 [INVESTMENT] Running specialized investment_recommendation_analyzer")
        
        # Run the specialized investment recommendation agent
        result = await run_specialized_agent(
            agent=recommendation_agent,
            app_name="Investment-Studio",
            input_data=input_data
        )
        
        print(f"✅ [INVESTMENT] Investment recommendation analysis completed successfully")
        
        return AnalysisResponse(
            success=True,
            data=result,
            analysis_type="investment_recommendation"
        )
        
    except Exception as e:
        logger.error(f"Error in investment recommendation analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Investment recommendation analysis error: {str(e)}"
        )

# Document Analysis Route
@router.post("/document", response_model=AnalysisResponse)
async def analyze_document(file: UploadFile = File(...)):
    """
    Analyze uploaded document (PDF, PPTX, etc.).
    
    Args:
        file: Uploaded document file
        
    Returns:
        Analysis results from document content
    """
    try:
        logger.info(f"Starting document analysis for file: {file.filename}")
        
        # Read file content
        content = await file.read()
        
        if file.filename.lower().endswith('.pdf'):
            # For PDF files, use the PDF analyzer
            result = startup_analyzer.analyze_pdf(content)
        else:
            # For other files, treat as text
            text_content = content.decode('utf-8', errors='ignore')
            result = startup_analyzer.analyze_document(text_content, file.filename)
        
        # Add frontend compatibility fields
        result['ready_for_firebase'] = True
        result['filename'] = file.filename
        result['file_type'] = file.content_type
        
        return AnalysisResponse(
            success=True,
            data=result,
            analysis_type="document"
        )
        
    except Exception as e:
        logger.error(f"Error in document analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Document analysis failed: {str(e)}"
        )

# Email Analysis Route
@router.post("/email", response_model=AnalysisResponse)
async def analyze_email(request: dict):
    """
    Analyze email content.
    
    Args:
        request: Dictionary containing email_text
        
    Returns:
        Email analysis results
    """
    try:
        email_text = request.get('email_text', '')
        logger.info(f"Starting email analysis for text length: {len(email_text)}")
        
        result = startup_analyzer.analyze_email(email_text)
        
        # Add frontend compatibility fields
        result['ready_for_firebase'] = True
        result['analysis_type'] = 'email'
        
        return AnalysisResponse(
            success=True,
            data=result,
            analysis_type="email"
        )
        
    except Exception as e:
        logger.error(f"Error in email analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Email analysis failed: {str(e)}"
        )

# Call Transcript Analysis Route
@router.post("/call", response_model=AnalysisResponse)
async def analyze_call(request: dict):
    """
    Analyze call transcript content.
    
    Args:
        request: Dictionary containing call_text
        
    Returns:
        Call analysis results
    """
    try:
        call_text = request.get('call_text', '')
        logger.info(f"Starting call analysis for text length: {len(call_text)}")
        
        result = startup_analyzer.analyze_call_transcript(call_text)
        
        # Add frontend compatibility fields
        result['ready_for_firebase'] = True
        result['analysis_type'] = 'call'
        
        return AnalysisResponse(
            success=True,
            data=result,
            analysis_type="call"
        )
        
    except Exception as e:
        logger.error(f"Error in call analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Call analysis failed: {str(e)}"
        )

# Comprehensive Analysis Route
@router.post("/comprehensive", response_model=AnalysisResponse)
async def comprehensive_analysis(request: dict):
    """
    Perform comprehensive analysis with multiple analysis types.
    
    Args:
        request: Dictionary containing content, analysis_type, and include flags
        
    Returns:
        Comprehensive analysis results
    """
    try:
        content = request.get('content', '')
        analysis_type = request.get('analysis_type', 'document')
        include_business_model = request.get('include_business_model', True)
        include_market_intelligence = request.get('include_market_intelligence', True)
        include_risk_assessment = request.get('include_risk_assessment', True)
        include_fact_check = request.get('include_fact_check', True)
        
        logger.info(f"Starting comprehensive analysis for {analysis_type}")
        
        # Determine which analysis types to run
        analysis_types = []
        if include_fact_check:
            analysis_types.append('factcheck')
        if include_business_model:
            analysis_types.append('business_model')
        if include_market_intelligence:
            analysis_types.append('market_intelligence')
        if include_risk_assessment:
            analysis_types.append('risk_assessment')
        
        # Run comprehensive analysis
        result = startup_analyzer.analyze_document(
            document_content=content,
            document_type=analysis_type,
            analysis_types=analysis_types
        )
        
        # Add frontend compatibility fields
        result['ready_for_firebase'] = True
        result['comprehensive'] = True
        
        return AnalysisResponse(
            success=True,
            data=result,
            analysis_type="comprehensive"
        )
        
    except Exception as e:
        logger.error(f"Error in comprehensive analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Comprehensive analysis failed: {str(e)}"
        )

@router.get("/status/{task_id}")
async def get_analysis_status(task_id: str):
    """
    Get the status of a background analysis task.
    
    Args:
        task_id: Unique task identifier
        
    Returns:
        Task status and results if completed
    """
    # TODO: Implement task status tracking with Redis/Celery
    return {"status": "not_implemented", "message": "Task status tracking coming soon"}

# Health check for analysis services
@router.get("/health")
async def analysis_health():
    """Health check for analysis services"""
    services = {
        "factcheck": True,
        "business_model": True,
        "market_intelligence": True,
        "risk_assessment": True,
        "competition": True,
        "founders": True,
        "market_size": True,
        "product_info": True,
        "investment_recommendation": True
    }
    
    available_count = sum(services.values())
    total_count = len(services)
    
    return {
        "status": "healthy",
        "services": services,
        "availability": f"{available_count}/{total_count}",
        "core_services_available": True
    }
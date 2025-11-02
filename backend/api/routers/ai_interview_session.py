import json
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
import logging
from pydantic import BaseModel, Field
import uuid
from datetime import datetime

# ADK Imports
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService, Session
from google.adk.artifacts import InMemoryArtifactService
from google.genai.types import Content, Part

# Agent Imports
from agents.interview_agent import investor_interview_agent, InterviewState, InterviewerOutput
from agents.question_generation_agent import investor_questions_agent, InvestorQuestionsOutput

logger = logging.getLogger(__name__)
router = APIRouter(tags=["ai-interviewer-session"], prefix="/api/interviewer")

# --- Session and Artifact Services ---
# WARNING: Using in-memory services. Sessions and artifacts will be lost on restart.
# For production, replace with persistent services (e.g., FirestoreSessionService).
session_service = InMemorySessionService()
artifact_service = InMemoryArtifactService()

# --- Pydantic Models for API ---

class StartSessionRequest(BaseModel):
    startup_id: str
    startup_context: str = Field(description="Comprehensive text describing the startup, including pitch deck info, market analysis, etc.")
    investor_context: str = Field(description="Text describing the investor's profile and criteria.")

class InterviewResponseRequest(BaseModel):
    user_response: str

class InterviewStatusResponse(BaseModel):
    session_id: str
    status: str # e.g., 'generating_questions', 'in_progress', 'completed'
    response_text: str
    history: List[Dict[str, str]] = []
    questions_remaining: int
    current_question: str

# --- Helper Function to get ADK Runner ---

def get_runner(app_name: str, agent):
    return Runner(
        app_name=app_name,
        agent=agent,
        session_service=session_service,
        artifact_service=artifact_service,
    )

# --- API Endpoints ---

@router.post("/sessions/start", response_model=InterviewStatusResponse)
async def start_interview_session(request: StartSessionRequest):
    """
    Starts a new interview session.
    1. Generates investor questions based on startup and investor context.
    2. Initializes the interview agent with these questions.
    3. Returns the first question to the user.
    """
    user_id = f"user_{request.startup_id}" # Or some other user identifier
    app_name = "InvestorInterviewApp"
    
    try:
        # --- 1. Generate Questions ---
        question_runner = get_runner(app_name, investor_questions_agent)
        
        # Create a temporary session for question generation
        q_session = await session_service.create_session(app_name=app_name, user_id=user_id)
        
        prompt = f"Startup Context:\n{request.startup_context}\n\nInvestor Context:\n{request.investor_context}"
        
        # This is a simplified way to call the agent.
        # A more robust implementation would use the runner's async event stream.
        response: InvestorQuestionsOutput = await question_runner.run_sync(
            user_id=user_id,
            session_id=q_session.id,
            new_message=Content(parts=[Part(text=prompt)])
        )
        
        if not response or not response.questions:
            raise HTTPException(status_code=500, detail="Failed to generate interview questions.")
            
        generated_questions = [q.question for q in response.questions]

        # --- 2. Initialize Interview Agent Session ---
        interview_runner = get_runner(app_name, investor_interview_agent)
        
        initial_state = InterviewState(
            startup_context=request.startup_context,
            questions_list=generated_questions,
            total_questions=len(generated_questions)
        )
        
        interview_session = await session_service.create_session(
            app_name=app_name,
            user_id=user_id,
            state=initial_state.dict() # Pass state as a dictionary
        )
        session_id = interview_session.id

        # --- 3. Get the First Question ---
        # The interview_flow_logic in the agent will be triggered by the first message.
        # We send an empty message to kick it off.
        first_turn_event: Event = await interview_runner.run_sync(
            user_id=user_id,
            session_id=session_id,
            new_message=Content(parts=[Part(text="")]) # Empty message to start
        )

        # Re-fetch the session state to get the full history
        session_data = await session_service.get_session(session_id)
        state = InterviewState(**session_data.state)
        history = state.full_history
        questions_remaining = state.total_questions - state.current_question_index
        current_question = state.questions_list[state.current_question_index] if state.current_question_index < state.total_questions else ""

        return InterviewStatusResponse(
            session_id=session_id,
            status="in_progress",
            response_text=first_turn_event.content.parts[0].text,
            history=history,
            questions_remaining=questions_remaining,
            current_question=current_question
        )

    except Exception as e:
        logger.error(f"Error starting interview session: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error starting interview session: {str(e)}"
        )

@router.post("/sessions/{session_id}/respond", response_model=InterviewStatusResponse)
async def process_interview_response(session_id: str, request: InterviewResponseRequest):
    """
    Processes the user's response and gets the next question from the interview agent.
    """
    app_name = "InvestorInterviewApp"
    
    try:
        # Retrieve the session to get the user_id
        session_data = await session_service.get_session(session_id)
        if not session_data:
            raise HTTPException(status_code=404, detail="Interview session not found.")
        user_id = session_data.user_id

        interview_runner = get_runner(app_name, investor_interview_agent)

        # Send the user's response to the agent
        agent_response_event: Event = await interview_runner.run_sync(
            user_id=user_id,
            session_id=session_id,
            new_message=Content(parts=[Part(text=request.user_response)])
        )

        # Re-fetch the session state to get the full history
        session_data = await session_service.get_session(session_id)
        state = InterviewState(**session_data.state)
        
        # Get history from the state
        history = state.full_history

        status = "completed" if state.interview_complete else "in_progress"

        if status == "completed":
            questions_remaining = 0
            current_question = ""
        else:
            questions_remaining = state.total_questions - state.current_question_index
            current_question = state.questions_list[state.current_question_index] if state.current_question_index < state.total_questions else ""

        return InterviewStatusResponse(
            session_id=session_id,
            status=status,
            response_text=agent_response_event.content.parts[0].text,
            history=history,
            questions_remaining=questions_remaining,
            current_question=current_question
        )

    except Exception as e:
        logger.error(f"Error processing interview response: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing interview response: {str(e)}"
        )
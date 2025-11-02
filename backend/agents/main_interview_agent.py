"""
main.py — Fact-checking agent runner
• Sessions live only in RAM (InMemorySessionService)  
• Artifacts are persisted (in-memory)
"""
import sys
import os

# Suppress ResourceWarnings from aiohttp (must be FIRST)
if not sys.warnoptions:
    import warnings
    warnings.filterwarnings("ignore", category=ResourceWarning, message="unclosed.*<ssl.SSLSocket.*>")
    warnings.filterwarnings("ignore", category=ResourceWarning, message="unclosed.*<socket.socket.*>")
    warnings.filterwarnings("ignore", category=ResourceWarning)

# Set environment variable to suppress aiohttp warnings
os.environ['PYTHONWARNINGS'] = 'ignore::ResourceWarning'
import asyncio, os
from dotenv import load_dotenv
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.artifacts import InMemoryArtifactService
from factcheck_agent import factcheck_agent,factcheck_pipeline
from business_model_agent import startup_economics_analyzer
from market_intelligence import market_intelligence_analyzer
from risk_assesment import risk_assessment_analyzer
from google.genai import types
from investment_recommendation import recommendation_agent
from market_size_problem_size import market_opportunity_agent
from product_information import Product_intelligence_agent
#from competition_discovery import competitor_discovery_analyzer
from founders_research import founder_research_agent
from competition_discovery import competitor_discovery_analyzer
from question_generation_agent import investor_questions_agent
from interview_agent import investor_interview_agent
import warnings
warnings.filterwarnings('ignore', message="Unclosed client session")
warnings.filterwarnings('ignore', message='Unclosed client session')
warnings.filterwarnings('ignore', message='Unclosed connector')
load_dotenv()

# ────────────────────────────────────────────────────────────────
# 1. Session service - in-memory, wiped when the app exits
# ────────────────────────────────────────────────────────────────
session_service = InMemorySessionService() # sessions are *not* saved to disk

# ────────────────────────────────────────────────────────────────
# 2. Artifact service (in-memory)
# ────────────────────────────────────────────────────────────────
artifact_service = InMemoryArtifactService()
print("⚠️ Using in-memory artifacts")

# ────────────────────────────────────────────────────────────────
# 3. Helper function for async calls (EXACTLY like your utils.py)


async def call_agent_async(runner, user_id, session_id, query, final_agent_name):
    """Call the agent and only display output from the final agent"""
    content = types.Content(role="user", parts=[types.Part(text=query)])
    
    # print(f"\n--- Analyzing with Sequential Agent Pipeline ---")
    # print("🔄 Running parallel economics analysis...")
    # print("📊 Generating integrated report...")
    
    final_response = None
    
    try:
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=content,
        ):
            response = await _process_event_filtered(event, final_agent_name)
            if response:
                final_response = response
                
    except Exception as exc:
        error_msg = f"Error during agent call: {exc}"
        print(error_msg)
        return error_msg
    
    return final_response or "No response received from final report agent"


async def _process_event_filtered(event, final_agent_name):
    """Process events and only display output from the specified final agent"""
    
    event_author = getattr(event, 'author', None)
    final_response = None
    
    if event.content and event.content.parts:
        has_function_call = False
        
        # First check if this event contains a function call
        for part in event.content.parts:
            function_call = getattr(part, "function_call", None)
            if function_call:
                has_function_call = True
                func_name = getattr(function_call, "name", "unknown")
                print(f"   🔧 Function call: {func_name}")
        
        # Only print text if it's NOT immediately following a function call
        # (to avoid duplicate output)
        for part_idx, part in enumerate(event.content.parts):
            text = getattr(part, "text", None)
            
            if text is not None:
                text = text.strip()
                
                if text and event_author == final_agent_name:
                    # Only print if this isn't a function call echo
                    if not has_function_call:
                        print(f"   🎯 Final agent response from {event_author}:")
                        print(f"🤖 {text}")
                        final_response = text
    
    return final_response

   

# ────────────────────────────────────────────────────────────────
# 4. Main event loop (exactly following your pattern)
# ────────────────────────────────────────────────────────────────
async def main_async() -> None:
    APP_NAME = "InvestorInterviewApp"
    USER_ID = "user_123"
    initial_state = {
        "interview_started": False,
        "current_question_index": 0,
        "total_questions": 0,
        "questions_list": [],
        "answers_collected": [],
        "followup_count_for_current": 0,
        "max_followups_per_question": 3,
        "interview_complete": False,
        "followups_asked": [],
        "startup_context": ""
    }
    
    # Always start a fresh session — no DB lookup / resume
    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        state=initial_state
    )
    
    SESSION_ID = session.id
    print(f"🔄 New ephemeral session: {SESSION_ID}")
    
    runner = Runner(
        agent=investor_interview_agent,
        app_name=APP_NAME,
        session_service=session_service,
        artifact_service=artifact_service
    )
    
    # print("\nWelcome to FactCheck-Studio! (type 'exit' to quit)")
    # print("📋 You can:")
    # print("   • Paste startup data for fact-checking")
    # print("   • Ask to verify specific claims") 
    # print("   • Request market data validation")
    # print("   • Check team credentials\n")
    
    while True:
        user_input = input("You: ")
        if user_input.lower() in {"exit", "quit"}:
            
            break
        
        # Use the corrected call_agent_async function
        await call_agent_async(runner, USER_ID, SESSION_ID, user_input, final_agent_name="InvestorInterview_Agent")

if __name__ == "__main__":
    asyncio.run(main_async())

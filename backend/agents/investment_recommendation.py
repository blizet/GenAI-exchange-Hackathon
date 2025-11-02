from google.adk.agents import LlmAgent, SequentialAgent
from google.adk.tools import google_search          # “think” tool
from langchain_google_genai import ChatGoogleGenerativeAI
import os, datetime

from config import get_settings

settings = get_settings()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0.3,
    max_tokens=2048,
    google_api_key=settings.google_api_key
)

recommendation_instruction = f"""
You are an Investment Recommendation Agent.
Tools Provided :
Think Tool() : this tool will called once to think on the data that you have been provided and then make the recommendation.
INPUTS you will receive (as JSON blobs or text blocks):
1. Business Model Agent Report
2. Market Intelligence Agent Report
3. Factcheck Agent Report
4. Risk assessment Agent Report

GOAL: Produce a one-page TL;DR recommendation for investors whether or not to invest in the startup.

STRICT OUTPUT FORMAT:

**INVESTMENT RECOMMENDATION (Generated: {{today}})**

Overall Decision: A Short Summary of whether they should invest or not

Key Rationale:
- Market: [≤25 words]
- Team & Execution: [≤25 words]
- Product & Differentiation: [≤25 words]
- Traction & Economics: [≤25 words]
- Risks: [≤25 words]



Must-Close DD Items:
1. [bullet – ≤15 words]
2. …

Thought Process:
Log in your reasoning/thought process here.
STYLE RULES:
• Max 250 words total.
• Be decisive; no hedging language.
• Pull facts ONLY from the 4 input reports.  

"""



recommendation_instruction = recommendation_instruction.format(
    today=datetime.date.today().strftime("%B %d, %Y")
)
def think_tool(reflection: str) -> str:
    """Strategic synthesis and quality assurance tool for investor recommendation workflow.

    Purpose:
    - Performs a single, comprehensive reflection after all data from sub-agents (market, financial, regulatory, execution) is received
    - Enables critical synthesis of multi-domain intelligence before issuing final investment recommendations
    - Assesses data completeness, reliability, and identifies material gaps that could impact investment decisions
    - Ensures high-confidence, evidence-based investor advisory output

    When to Use:
    
    - Creates a deliberate quality checkpoint before final recommendation generation
    - NOT for iterative research planning - this is a thinking step before final execution.

    Strategic Reflection Framework:
    1. **Evidence Synthesis**: Consolidate key findings across market opportunity, competitive positioning, execution capability, and regulatory environment
    2. **Confidence Assessment**: Evaluate the strength and reliability of evidence supporting each major conclusion
    3. **Risk-Reward Clarity**: Assess whether sufficient information exists to quantify investment risks and return potential
    4. **Decision Readiness**: Determine if analysis is complete enough for definitive investment recommendation (INVEST/PASS/CONDITIONAL)

    Args:
        reflection (str): Comprehensive analysis of synthesized findings, evidence quality, critical gaps, and decision on recommendation readiness

    Returns:
        str: Confirmation that strategic reflection has been recorded and incorporated into final advisory process
    """
    return f"Investment Advisory Reflection Processed: {reflection}"

recommendation_agent = LlmAgent(
    name="InvestmentRecommendation_Agent",
    model="gemini-2.0-flash",
    instruction=recommendation_instruction,
    tools=[think_tool]   # exposes the mini think tool
)


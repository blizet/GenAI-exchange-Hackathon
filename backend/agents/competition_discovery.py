from google.adk.agents import LlmAgent, SequentialAgent, ParallelAgent, BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event
from langchain_google_genai import ChatGoogleGenerativeAI
from google.genai.types import Content, Part
import os
from pydantic import BaseModel, Field
from typing import List, Any, AsyncGenerator
import requests
import json
from google.adk.tools import google_search
from google.adk.tools import AgentTool

from tavily import TavilyClient



# Setup API keys
from config import get_settings

settings = get_settings()
os.environ["EXA_API_KEY"] = settings.exa_api_key
os.environ["TAVILY_API_KEY"] = settings.tavily_api_key

from exa_py import Exa

# LLM setup
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.3, google_api_key=settings.google_api_key)

# Initialize Exa client
client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])
exa = Exa(api_key=os.environ["EXA_API_KEY"])
def tavily_search(query: str) -> str:
    response = client.search(
    query=query,
    search_depth="advanced",
    max_results=3,
    )


    results = [] 
    for result in response["results"]:
        results.append({
            "title": result["title"],
            "url": result["url"],
            "content": result["content"] if result["content"] else "",
        })
    return str(results)


def exa_search(query: str) -> str:
    """
    Perform a search using the Exa API and return formatted results.
    """
    print(f"Exa_search_is_called with {query}")
    try:
        search_response = exa.search_and_contents(
            query=query,
            type="auto",
            num_results=3,
            text=True,
            highlights=True,
            summary=True,
        )
        
        results = []
        for result in search_response.results:
            if hasattr(result, 'summary'):
                results.append({
                    "title": result.title,
                    "url": result.url,
                    "summary": result.summary if hasattr(result, 'summary') else ""
                })
            else:
                results.append({
                    "title": result.title,
                    "url": result.url,
                    "content": result.text if result.text else "",
                })

        return str(results)
        
    except Exception as e:
        return f"Error searching articles: {str(e)}"


class CompetitorInfo(BaseModel):
    """Individual competitor information"""
    name: str = Field(description="The name of the competitor company")
    additional_info: str = Field(description="Any additional relevant information about the competitor")


class CompetitorIdentificationOutput(BaseModel):
    """Structured output for identified competitors"""
    competitors: List[CompetitorInfo] = Field(
        description="List of identified competitor companies",
    )


# Competitor identification instruction
competitor_identification_instruction = """
You are a Competitor Identification Agent. Your job is to identify competitors from the startup information provided.

TASKS:
1. Extract any competitors explicitly mentioned in the input, if not then use google_Search tool
2. Based on the startup's industry/product, identify top 3 potential competitors
3. Prioritize competitors that are explicitly mentioned in the input

OUTPUT FORMAT (must match the schema exactly):
{
  "competitors": [
    {"name": "Competitor Name 1", "additional_info": "Any additional relevant information about the competitor"},
    {"name": "Competitor Name 2", "additional_info": "Any additional relevant information about the competitor"},
    {"name": "Competitor Name 3", "additional_info": "Any additional relevant information about the competitor"}
  ],
...

Keep the competitors mentioned in the prompt at priority and then give the TOP 3 most relevant competitors for detailed research.
"""


# Modified deep research instruction for SINGLE competitor
deep_research_instruction = """
You are a Deep Company Research Agent with access to the exa_search and tavily_search_results tools. 

YOUR TASK: Research ONE specific competitor company provided to you.

RESEARCH METHODOLOGY:
For the given competitor, you must conduct research using these 5 query types:

1. FOUNDERS RESEARCH: "<company_name> founders linkedin CEO founder background"
2. COMPANY BASICS: "<company_name> founded when company size employees linkedin about"  
3. BUSINESS MODEL: "<company_name> business model revenue monetization pricing how they make money"
4. PRODUCT PERFORMANCE: "<company_name> product features customers reviews performance metrics"
5. FUNDING INFORMATION: "<company_name> funding series A B C investment crunchbase raised money"

CRITICAL INSTRUCTIONS:
- Conduct ALL research using both exa_search() and tavily_search_results() for each query type for the given competitor
- Use Tavily for real-time, comprehensive web search with context
- Use Exa for specialized article and content discovery
- DO NOT show intermediate search results or step-by-step outputs
- ONLY provide the final comprehensive report at the end
- Focus on researching ONLY the competitor name provided to you

FINAL OUTPUT FORMAT - SINGLE COMPETITOR ANALYSIS:

## 🏢 [COMPETITOR NAME]

**👥 Founders & Leadership**
[Founder names, backgrounds, previous experience, leadership team details]

**🏢 Company Basics**  
[Founding year, employee count, company size, headquarters location]

**💼 Business Model**
[Revenue generation, pricing strategy, target customers, monetization approach]

**🚀 Product & Performance**
[Main products, key features, customer feedback, market performance]

**💰 Funding Information**
[Total funding raised, recent rounds, key investors, valuation]

**📊 Competitive Assessment**
- **Threat Level:** [High/Medium/Low]
- **Key Strengths:** [List based on research]
- **Potential Weaknesses:** [List based on research]

---

REMEMBER: 
- Research ONLY the single competitor name you receive
- Conduct all searches using both exa_search() and tavily_search_results() silently first
- Only output the final comprehensive report for this one competitor
- No intermediate results or step-by-step outputs
- Base all analysis strictly on search findings
"""


# Create agents
competitor_identification_agent = LlmAgent(
    name="CompetitorIdentification",
    model="gemini-2.0-flash", 
    description="Identifies key competitors from startup information",
    instruction=competitor_identification_instruction,
    output_key="competitor_identification_output",
    output_schema=CompetitorIdentificationOutput,
)


# Custom Research Delegator using Dynamic Parallel Execution
class ResearchDelegatorAgent(BaseAgent):
    """
    Dynamically creates and runs parallel research agents for each competitor.
    """
    
    async def _run_async_impl(
        self, ctx: InvocationContext
    ) -> AsyncGenerator[Event, None]:
        
        # Extract competitors from the previous agent's output
        competitor_output = ctx.session.state.get("competitor_identification_output", "")
        
        # Simple parsing to extract competitor names
        competitors = []
        print("Competitor output:", competitor_output)
        if competitor_output and isinstance(competitor_output, dict):
            competitors_list = competitor_output.get("competitors", [])
            for comp in competitors_list:
                if isinstance(comp, dict) and "name" in comp:
                    temp = comp["name"] + " - " + comp.get("additional_info", "")
                    competitors.append(temp)

        # Limit to top 3 competitors
        competitors = competitors[:3]
        
        if not competitors:
            yield Event(
                author=self.name,
                content=Content(parts=[Part(text="No competitors found to research.")])
            )
            return
        
        yield Event(
            author=self.name,
            content=Content(parts=[Part(text=f"Starting parallel research for {len(competitors)} competitors: {', '.join(competitors)}")])
        )
        
        # Dynamically create research agents for each competitor
        research_agents = []
        for i, competitor_name in enumerate(competitors):
            research_agent = LlmAgent(
                name=f"DeepResearch_{i}",
                model="gemini-2.0-flash",
                instruction=f"""
{deep_research_instruction}

COMPETITOR TO RESEARCH AND ADDITIONAL INFO: {competitor_name}

                """,
                tools=[exa_search, tavily_search],  # Both Exa and Tavily tools
                output_key=f"research_result_{i}",
            )
            research_agents.append(research_agent)
        
        # Create a dynamic ParallelAgent to execute all research in parallel
        parallel_researcher = ParallelAgent(
            name="ParallelCompetitorResearcher",
            sub_agents=research_agents,
        )
        
        # Execute parallel research and yield events
        async for event in parallel_researcher.run_async(ctx):
            yield event
        
        # Compile results after parallel execution completes
        compiled_report = self._compile_results(ctx, competitors)
        
        # Save compiled report to session state
        ctx.session.state["final_competitive_analysis"] = compiled_report
        
        yield Event(
            author=self.name,
            content=Content(parts=[Part(text=compiled_report)])
        )
    
    def _compile_results(self, ctx: InvocationContext, competitors: list) -> str:
        """Compile all parallel research results into a comprehensive report."""
        
        report_parts = [
            "# 🔍 COMPREHENSIVE COMPETITOR ANALYSIS REPORT\n",
            "## 📋 EXECUTIVE SUMMARY\n",
            f"Analyzed {len(competitors)} key competitors in parallel.\n\n",
            "---\n\n"
        ]
        
        # Gather individual research results
        for i in range(len(competitors)):
            research_result = ctx.session.state.get(f"research_result_{i}", "")
            if research_result:
                report_parts.append(research_result)
                report_parts.append("\n---\n\n")
        
        return "".join(report_parts)


# Instantiate the custom research delegator
research_delegator = ResearchDelegatorAgent(name="ResearchDelegator")


# Sequential agent pipeline
competitor_discovery_analyzer = SequentialAgent(
    name="CompetitorDiscoveryAnalyzer",
    description="2-stage pipeline: Competitor Identification → Parallel Deep Research",
    sub_agents=[
        competitor_identification_agent,
        research_delegator
    ]
)


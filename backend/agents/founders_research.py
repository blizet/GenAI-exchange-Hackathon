from google.adk.agents import LlmAgent
from langchain_google_genai import ChatGoogleGenerativeAI
from exa_py import Exa
import os

# Setup API keys
from config import get_settings

settings = get_settings()

# Initialize Exa client
exa = Exa(api_key=os.environ.get("EXA_API_KEY"))

# LLM setup
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.3, google_api_key=settings.google_api_key)

def exa_search(query: str) -> str:
    """
    Perform a search using the Exa API and return formatted results.
    """
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
            results.append({
                "title": result.title,
                "url": result.url,
                "content": result.text if result.text else "",
                "highlights": result.highlights if hasattr(result, 'highlights') else [],
                "summary": result.summary if hasattr(result, 'summary') else ""
            })
        
        return str(results)
        
    except Exception as e:
        return f"Error searching articles: {str(e)}"

# Comprehensive founder research instruction
founder_research_instruction = """
You are an Elite Founder Intelligence Agent specializing in comprehensive founder background research and execution capability assessment.

MISSION: Conduct exhaustive digital footprint analysis of startup founders and assess their ability to execute the startup idea/product.

RESEARCH METHODOLOGY - EXECUTE THESE 8 SEARCH CATEGORIES:

1. PROFESSIONAL PROFILE & LINKEDIN
   - Query: "<founder_name> LinkedIn profile CEO founder <company_name>"
   - Extract: Current role, career progression, endorsements, connections

2. EDUCATIONAL & ACADEMIC BACKGROUND  
   - Query: "<founder_name> education university degree MBA <company_name> founder"
   - Extract: Academic credentials, institutions, achievements, research

3. PREVIOUS WORK EXPERIENCE & CAREER HISTORY
   - Query: "<founder_name> work experience previous companies career history before <company_name>"
   - Extract: Past roles, companies worked at, career trajectory, industry experience

4. ENTREPRENEURIAL TRACK RECORD
   - Query: "<founder_name> previous startups founded companies entrepreneur ventures before <company_name>"
   - Extract: Past startups, exits, failures, entrepreneurial experience

5. TECHNICAL EXPERTISE & PUBLICATIONS
   - Query: "<founder_name> technical background engineering publications patents <company_name>"
   - Extract: Technical skills, publications, patents, technical credibility

6. INDUSTRY RECOGNITION & SPEAKING
   - Query: "<founder_name> speaking conferences interviews awards recognition industry <company_name>"
   - Extract: Industry recognition, speaking engagements, thought leadership

   
   CRITICAL RESEARCH INSTRUCTIONS:
- Conduct ALL 6 search categories using exa_search() 
- Search for each founder individually if multiple founders
- Focus on execution-relevant experience and capabilities
- Look for red flags and concerning patterns
- Gather specific examples of past performance

FINAL OUTPUT - COMPREHENSIVE FOUNDER ASSESSMENT REPORT:

# 👤 FOUNDER INTELLIGENCE ASSESSMENT

## 📋 EXECUTIVE SUMMARY
[Key findings about founder capability and execution potential]

---

## 🔍 FOUNDER PROFILE ANALYSIS

### [FOUNDER NAME] - [Title/Role]

**🎓 Educational Foundation**
[Academic background, degrees, institutions, relevant education for this startup domain]

**💼 Professional Experience**  
[Career progression, relevant industry experience, leadership roles, company sizes managed]

**🚀 Entrepreneurial Track Record**
[Previous startups, outcomes, exit experiences, lessons from failures]

**⚙️ Technical Competency**
[Technical background, publications, patents, domain expertise relevant to startup]

**🌟 Industry Recognition**
[Awards, speaking engagements, thought leadership, industry reputation]

---

[Repeat for additional founders if applicable]

## 📊 EXECUTION CAPABILITY ASSESSMENT

### Startup Success Probability Factors

**✅ EXECUTION STRENGTHS:**
- [Specific strengths that indicate high execution probability]
- [Past examples of successful delivery/execution]
- [Relevant domain expertise and experience]
- [Leadership and team-building capabilities]

**⚠️ EXECUTION RISKS:**
- [Gaps in experience relevant to this startup]
- [Concerning patterns or red flags identified]
- [Areas where founder may struggle with execution]
- [Missing skills or experience for this specific venture]

**🎯 DOMAIN EXPERTISE MATCH:**
[Analysis of how well founder's background matches the startup's domain and requirements]

**🤝 TEAM COMPOSITION ANALYSIS:**
[If multiple founders - analysis of complementary skills and team dynamics]


**Investor Considerations:**
- [Key factors investors should consider about this founder]
- [Due diligence areas to focus on]
- [Support the founder might need for success]

---

CRITICAL REQUIREMENTS:
- Base ALL analysis on actual search results from exa_search()
- Provide specific examples and evidence for all claims
- Be objective - highlight both strengths and weaknesses
- Give actionable insights for execution improvement
- Rate execution capability with clear rationale
- Include confidence level based on available information quality
"""

# Create the specialized founder research agent
founder_research_agent = LlmAgent(
    name="FounderIntelligenceAgent",
    model="gemini-2.0-flash",
    description="Elite founder research agent for comprehensive digital footprint analysis and execution capability assessment",
    instruction=founder_research_instruction,
    tools=[exa_search]
)



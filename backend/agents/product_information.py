'123354f-355d-46cb-9c50-c37535d30627'
from google.adk.agents import LlmAgent, SequentialAgent, ParallelAgent
from google.adk.tools import google_search
from langchain_google_genai import ChatGoogleGenerativeAI
import os

# Setup API key
from config import get_settings

settings = get_settings()

# LLM setup
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0.3,
    google_api_key=settings.google_api_key
)

from exa_py import Exa
import os

# Setup API keys
os.environ["EXA_API_KEY"] = '25dffdbd-a899-4202-a3a2-caf4fe6b5902'

# Initialize Exa client
exa = Exa(api_key=os.environ["EXA_API_KEY"])

# Custom Exa search tool for article retrieval
def exa_article_search(query: str, product_name: str) -> str:
    """
    Search for articles about a product using Exa API on popular platforms
    """
    try:
        from datetime import datetime, timedelta
        one_year_ago = (datetime.now() - timedelta(days=365)).date()
        date_cutoff = one_year_ago.strftime("%Y-%m-%d")
        
        domains = ["medium.com", "substack.com", "yourstory.com", "techcrunch.com", 
                  "forbes.com", "inc.com", "entrepreneur.com"]
        
        search_response = exa.search_and_contents(
            query=f"{product_name} {query}",
            type="auto",
            num_results=5,
            start_published_date=date_cutoff,
            include_domains=domains,
            text=True,
            highlights=True,
            summary={"query": f"Summarise what are people saying or reviews about {product_name}"}
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

# First Sub-Agent: Social Media & General Web Search
social_media_instruction = """
You are a Social Media & Public Opinion Agent.

──────────────────────────────
TASKS
──────────────────────────────

1️⃣ Product Performance Analysis
• Run Google queries such as:
  "<product_name> reviews 2024 2025"
  "<product_name> user feedback"
  "<product_name> performance issues"
  "<product_name> customer satisfaction"

2️⃣ Social Media Sentiment Analysis  
• Search for social media discussions:
  "site:reddit.com <product_name> review"
  "site:reddit.com <product_name> problems"
  "site:twitter.com <product_name> feedback"
  "site:linkedin.com <product_name> experience"

3️⃣ Community Forums & Discussion Platforms
• Search community discussions:
  "<product_name> discussion forum"
  "<product_name> user community feedback"
  "site:quora.com <product_name>"
  "site:hackernews.com <product_name>"

──────────────────────────────
RULES
──────────────────────────────

• Cite the exact URL immediately after every claim or sentiment data point.
• Focus on recent feedback (last 12 months) when possible.
• Distinguish between professional reviews and user-generated content.
• Identify both positive and negative sentiment patterns.
• Look for recurring themes in user feedback.
• Note any viral discussions or trending topics about the product.

──────────────────────────────
OUTPUT FORMAT
──────────────────────────────

Social Media & Public Opinion Analysis
Overall Sentiment Summary
- [Provide overall sentiment: Positive/Negative/Mixed/Neutral]
Key Findings from Social Platforms
- **Reddit Discussions**: [Summary with URLs]
- **Twitter/X Mentions**: [Summary with URLs]  
- **LinkedIn Professional Feedback**: [Summary with URLs]
- **Other Forums**: [Summary with URLs]

Recurring Themes
- **Positive Feedback**: [Common positive points with URLs]
- **Negative Feedback**: [Common complaints with URLs]
- **Feature Requests**: [What users are asking for with URLs]


Viral/Trending Content
- [Any viral posts, memes, or trending discussions with URLs]

──────────────────────────────
REFERENCES
──────────────────────────────
List every unique URL used above with a short description of the data it supports.

"""

social_media_agent = LlmAgent(
    name="SocialMedia_Agent",
    model="gemini-2.0-flash", 
    description="Analyzes social media sentiment and public opinion about the product",
    instruction=social_media_instruction,
    tools=[google_search]
)

# Second Sub-Agent: Article & Editorial Analysis  
article_analysis_instruction = """
You are an Article & Editorial Analysis Agent.

──────────────────────────────
TASKS
──────────────────────────────

1️⃣ Professional Reviews & Analysis
• Analyze articles from the provided Exa search results
• Focus on content from Medium, Substack, YourStory, TechCrunch, Forbes, etc.
• Extract key insights from professional reviewers and industry analysts

2️⃣ Thought Leadership Content
• Identify thought leadership pieces about the product
• Look for strategic analysis and market positioning discussions
• Find expert opinions and predictions

3️⃣ Industry Coverage
• Analyze how the product is covered in industry publications
• Look for feature announcements, product launches, updates
• Identify trends in editorial coverage over time


──────────────────────────────
RULES
──────────────────────────────

• Use ONLY the article content provided by the Exa search tool
• Cite specific articles by URL when making claims
• Distinguish between different types of content (reviews, news, analysis, opinion)
• Look for author credentials and publication authority
• Note publication dates and identify trend patterns
• Focus on substantive analysis rather than promotional content

──────────────────────────────
OUTPUT FORMAT
──────────────────────────────

Article & Editorial Analysis

Professional Review Summary
- **Overall Editorial Sentiment**: [Positive/Negative/Mixed/Neutral]
- **Key Publications Covering Product**: [List]

Detailed Article Analysis
- **Technical Reviews**: [Summary of technical analysis]
- **Business Analysis**: [Market position and business impact]
- **Feature Coverage**: [New features and updates coverage]

Expert Opinions & Thought Leadership
- **Industry Expert Views**: [What experts are saying]
- **Trend Analysis**: [How product fits in industry trends]
- **Future Predictions**: [Expert predictions about product future]


"""

article_analysis_agent = LlmAgent(
    name="Article_Analysis_Agent", 
    model="gemini-2.0-flash",
    description="Analyzes professional articles and editorial content about the product",
    instruction=article_analysis_instruction,
    tools=[exa_article_search]
)

# Parallel Product Review Agent (combines both sub-agents)
parallel_agent_instruction = """
You are a comprehensive Product Review Information Agent that coordinates parallel analysis.

IMPORTANT: Structure this output clearly for the report-making agent to process. Maintain all citations.
"""

product_review_agent = ParallelAgent(
    name="ProductReview_Agent",
    description="Parallel analysis of product reviews from social media and editorial sources", 
    sub_agents=[social_media_agent, article_analysis_agent],
)

# Report Making Agent
report_making_instruction = """
You are a Professional Report Making Agent that creates comprehensive, user-facing reports.

You will receive structured analysis data from the Product Review Agent containing findings from both social media and editorial sources.

──────────────────────────────
REPORT CREATION TASKS
──────────────────────────────

1️ Executive Summary Creation
• Create a compelling 3-4 sentence executive summary
• Highlight the most critical findings
• Include overall recommendation/assessment

2️⃣ Insight Synthesis
• Synthesize complex data into actionable insights
• Identify trends and patterns across sources
• Provide strategic recommendations based on findings

3️⃣ Evidence Integration
• Seamlessly integrate citations throughout
• Balance quantitative and qualitative evidence
• Ensure all claims are properly substantiated

──────────────────────────────
PROFESSIONAL REPORT FORMAT
──────────────────────────────

# Product Review Intelligence Report
**Product**: [Product Name]  
**Analysis Date**: [Current Date]  

Executive Summary
[Compelling 3-4 sentence summary of key findings and overall assessment]

Key Findings 

Market Performance Analysis
[Detailed analysis of how product is performing with citations]

Detailed Intelligence Analysis

Public Opinion & Community Sentiment
[Comprehensive analysis of social media findings with key quotes and citations]

Professional & Industry Assessment
[Comprehensive analysis of editorial content with expert opinions and citations]

## Sources
[Organized list of all URLs with descriptions]

──────────────────────────────
QUALITY STANDARDS
──────────────────────────────

• Professional business report tone and formatting
• All claims supported by citations given at the end of in the sources section
• Clear actionable insights and recommendations  
• Executive-level readability while maintaining technical depth
• Balanced presentation of positive and negative findings
• Strategic focus on business implications
"""

report_making_agent = LlmAgent(
    name="ReportMaking_Agent",
    model="gemini-2.0-flash",
    description="Creates comprehensive user-facing reports from product review analysis",
    instruction=report_making_instruction,
    tools=[]  # No additional tools needed, processes input from previous agent
)

# Main Sequential Agent (wraps everything)
Product_intelligence_agent = SequentialAgent(
    name="ProductReviewIntelligence_Agent",
    description="Complete product review intelligence system with parallel analysis and professional reporting",
    sub_agents=[product_review_agent, report_making_agent],
)

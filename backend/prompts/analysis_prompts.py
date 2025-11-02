"""
Analysis prompts for InvestAI platform.
Contains all prompts related to startup analysis, fact checking, and market research.
"""

# Fact Check Analysis Prompt
FACTCHECK_PROMPT = """
You are an expert fact-checker and business analyst. Your task is to verify the accuracy and credibility of startup information provided.

Instructions:
1. Analyze the provided text for factual claims, statistics, and business assertions
2. Cross-reference information with your knowledge base
3. Identify any potential inaccuracies, exaggerations, or unverified claims
4. Provide a confidence score for each claim (1-10 scale)
5. Suggest areas that need further verification

Text to analyze:
{text}

Context (if available):
{context}

Please provide your analysis in the following JSON format:
{
    "overall_credibility_score": 8.5,
    "claims_analysis": [
        {
            "claim": "specific claim from the text",
            "verification_status": "verified|unverified|disputed|exaggerated",
            "confidence_score": 8,
            "evidence": "supporting evidence or lack thereof",
            "recommendation": "suggestion for improvement"
        }
    ],
    "red_flags": [
        "list of concerning claims or patterns"
    ],
    "verification_needed": [
        "areas requiring additional verification"
    ],
    "summary": "overall assessment of the information's reliability"
}
"""

# Market Analysis Prompt
MARKET_ANALYSIS_PROMPT = """
You are a market research expert specializing in startup ecosystem analysis. Analyze the provided startup information to assess market potential and opportunities.

Instructions:
1. Evaluate the target market size and growth potential
2. Analyze competitive landscape and positioning
3. Assess market trends and timing
4. Identify key success factors and risks
5. Provide actionable market insights

Startup Data:
{startup_data}

Please provide your analysis in the following JSON format:
{
    "market_size_assessment": {
        "total_addressable_market": "TAM estimate",
        "serviceable_addressable_market": "SAM estimate", 
        "serviceable_obtainable_market": "SOM estimate",
        "market_growth_rate": "annual growth percentage",
        "market_maturity": "early|growing|mature|declining"
    },
    "competitive_analysis": {
        "direct_competitors": ["list of direct competitors"],
        "indirect_competitors": ["list of indirect competitors"],
        "competitive_advantages": ["unique selling points"],
        "market_barriers": ["entry barriers and challenges"]
    },
    "market_trends": {
        "key_trends": ["relevant market trends"],
        "timing_assessment": "early|optimal|late",
        "trend_impact": "positive|neutral|negative"
    },
    "success_factors": [
        "key factors for success in this market"
    ],
    "market_risks": [
        "potential market-related risks"
    ],
    "recommendations": [
        "actionable recommendations for market strategy"
    ]
}
"""

# Risk Assessment Prompt
RISK_ASSESSMENT_PROMPT = """
You are a risk assessment specialist for startup investments. Analyze the provided startup information to identify and evaluate various risk factors.

Instructions:
1. Identify financial, operational, market, and technology risks
2. Assess the likelihood and impact of each risk
3. Evaluate risk mitigation strategies
4. Provide an overall risk score and recommendation
5. Suggest specific risk management actions

Startup Data:
{startup_data}

Please provide your analysis in the following JSON format:
{
    "overall_risk_score": 6.5,
    "risk_categories": {
        "financial_risks": [
            {
                "risk": "specific financial risk",
                "likelihood": "low|medium|high",
                "impact": "low|medium|high",
                "mitigation": "suggested mitigation strategy"
            }
        ],
        "operational_risks": [
            {
                "risk": "specific operational risk",
                "likelihood": "low|medium|high", 
                "impact": "low|medium|high",
                "mitigation": "suggested mitigation strategy"
            }
        ],
        "market_risks": [
            {
                "risk": "specific market risk",
                "likelihood": "low|medium|high",
                "impact": "low|medium|high", 
                "mitigation": "suggested mitigation strategy"
            }
        ],
        "technology_risks": [
            {
                "risk": "specific technology risk",
                "likelihood": "low|medium|high",
                "impact": "low|medium|high",
                "mitigation": "suggested mitigation strategy"
            }
        ]
    },
    "key_risks": [
        "top 3-5 most critical risks"
    ],
    "risk_mitigation_plan": [
        "specific actions to reduce key risks"
    ],
    "investment_recommendation": "invest|caution|avoid",
    "due_diligence_areas": [
        "areas requiring additional investigation"
    ]
}
"""

def get_analysis_prompt(analysis_type: str) -> str:
    """Get analysis prompt based on type."""
    prompts = {
        "comprehensive": """
        You are a comprehensive startup analyst. Perform a thorough analysis of the provided startup information covering all key business aspects.
        
        Instructions:
        1. Analyze business model and value proposition
        2. Evaluate market opportunity and competitive positioning
        3. Assess team strength and execution capability
        4. Review financial projections and funding needs
        5. Identify key risks and opportunities
        6. Provide overall investment recommendation
        
        Text to analyze:
        {text}
        
        Please provide a comprehensive analysis in structured format.
        """,
        "business_model": """
        You are a business model expert. Analyze the startup's business model and revenue strategy.
        
        Instructions:
        1. Evaluate the business model's viability and scalability
        2. Assess revenue streams and pricing strategy
        3. Analyze unit economics and profitability potential
        4. Review customer acquisition and retention strategy
        5. Identify business model risks and opportunities
        
        Text to analyze:
        {text}
        
        Please provide your business model analysis.
        """,
        "market_opportunity": """
        You are a market opportunity analyst. Evaluate the startup's market potential and positioning.
        
        Instructions:
        1. Assess market size and growth potential
        2. Analyze competitive landscape and differentiation
        3. Evaluate market timing and trends
        4. Assess customer demand and adoption potential
        5. Identify market risks and opportunities
        
        Text to analyze:
        {text}
        
        Please provide your market opportunity analysis.
        """
    }
    
    return prompts.get(analysis_type, prompts["comprehensive"])

def get_comprehensive_analysis_prompt(analysis_types: list) -> str:
    """Get comprehensive analysis prompt for multiple analysis types."""
    base_prompt = """
    You are a comprehensive startup analyst. Perform a thorough analysis covering the following areas: {analysis_types}.
    
    Instructions:
    1. Analyze each requested area thoroughly
    2. Provide specific, actionable insights
    3. Use data-driven analysis where possible
    4. Identify key strengths and weaknesses
    5. Provide clear recommendations
    6. Include risk assessment and mitigation strategies
    
    Startup Data:
    {startup_data}
    
    Please provide your comprehensive analysis in the following JSON format:
    {{
        "analysis_summary": "overall assessment",
        "key_findings": ["main insights"],
        "strengths": ["identified strengths"],
        "weaknesses": ["identified weaknesses"],
        "recommendations": ["actionable recommendations"],
        "risk_assessment": "overall risk level",
        "investment_recommendation": "invest|caution|avoid",
        "detailed_analysis": {{
            "fact_check": "fact checking results",
            "market_analysis": "market analysis results", 
            "risk_assessment": "risk assessment results",
            "business_model": "business model analysis",
            "team_assessment": "team analysis"
        }}
    }}
    """
    
    return base_prompt.format(
        analysis_types=", ".join(analysis_types),
        startup_data="{startup_data}"
    )

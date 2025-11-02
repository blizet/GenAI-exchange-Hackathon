"""
Centralized prompts module for InvestAI platform.
Provides organized access to all AI agent prompts.
"""

from .analysis_prompts import (
    get_analysis_prompt,
    get_comprehensive_analysis_prompt,
    FACTCHECK_PROMPT,
    MARKET_ANALYSIS_PROMPT,
    RISK_ASSESSMENT_PROMPT
)

from .agent_prompts import (
    STARTUP_ANALYZER_PROMPT,
    INVESTOR_MATCHING_PROMPT,
    DOCUMENT_ANALYZER_PROMPT
)

__all__ = [
    "get_analysis_prompt",
    "get_comprehensive_analysis_prompt", 
    "FACTCHECK_PROMPT",
    "MARKET_ANALYSIS_PROMPT",
    "RISK_ASSESSMENT_PROMPT",
    "STARTUP_ANALYZER_PROMPT",
    "INVESTOR_MATCHING_PROMPT",
    "DOCUMENT_ANALYZER_PROMPT"
]
